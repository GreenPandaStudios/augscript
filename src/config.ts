import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Diagnostic } from './ast.ts';

export interface Config {
  backend?: 'c' | 'llvm';
  output?: string; optimization: 'debug' | 'release'; libraries: string[]; library_paths: string[];
  assignment: 'equals' | 'to'; block_style: 'braces' | 'indent'; indentation: 'spaces' | 'tabs';
  lint: string[]; strict_modules: boolean; max_public_symbols: number; max_dependencies: number;
  module_dependencies: string[];
  packages: Record<string, string>;
  spec: {require_comments: 'none' | 'public' | 'all'};
  web: {host: string; body_limit: number; response_limit: number; tls: {certificate: string; private_key: string; ca: string}; http3: boolean};
  openapi: {enabled: boolean; title: string; version: string; path: string; docs: string; output: string};
}
export const lintRules = ['wildcard_imports', 'public_helpers', 'public_docs', 'broad_errors', 'discarded_errors', 'architecture'];
export function loadConfig(root: string): { config: Config; diagnostics: Diagnostic[] } {
  const config: Config = { optimization: 'debug', libraries: [], library_paths: [], assignment: 'equals', block_style: 'braces',
    indentation: 'spaces', lint: [], strict_modules: false, max_public_symbols: 12, max_dependencies: 8, module_dependencies: [], packages: {}, spec: {require_comments:'none'},
    web:{host:'127.0.0.1', body_limit:1048576, response_limit:4194304, tls:{certificate:'', private_key:'', ca:''}, http3:false},
    openapi:{enabled:false, title:'August API', version:'0.1.0', path:'/openapi.json', docs:'/docs', output:'.aug-build/openapi.json'} };
  const file = join(root, 'main.yaml');
  const diagnostics: Diagnostic[] = [];
  if (!existsSync(file)) return { config, diagnostics };
  const report = (line: number, message: string) => diagnostics.push({ file, line, column: 1, code: 'CONFIG', message });
  const seen = new Set<string>();
  const sections: {name:string; indentation:number}[] = [];
  let list: 'libraries' | 'library_paths' | 'lint' | 'module_dependencies' | undefined;
  for (const [index, raw] of readFileSync(file, 'utf8').split(/\r?\n/).entries()) {
    const line = raw.replace(/\s+#.*$/, '').trim();
    if (!line || line.startsWith('#')) continue;
    const item = /^-\s+(.+)$/.exec(line);
    if (item && list) {
      const value = item[1].replace(/^(['"])(.*)\1$/, '$2');
      if (list === 'lint' && !lintRules.includes(value)) report(index + 1, `Unknown lint rule ${value}`);
      else if (list === 'module_dependencies' && !/^[\w./*-]+\s*:\s*[\w./*, -]*$/.test(value)) report(index + 1, 'Use module_dependencies entries such as "domain: shared, contracts"');
      else if (list === 'libraries' && !/^[A-Za-z0-9_.+-]+$/.test(value)) report(index + 1, 'Library names contain only letters, numbers, _, ., + and -');
      else config[list].push(value);
      continue;
    }
    list = undefined;
    const entry = /^([a-z_][a-z_0-9]*):(?:\s*(.*))?$/.exec(line);
    const indentation = raw.length - raw.trimStart().length;
    while (sections.length && sections.at(-1)!.indentation >= indentation) sections.pop();
    const path = [...sections.map(section => section.name), entry?.[1]].join('.');
    if (entry && (path === 'web' || path === 'openapi' || path === 'web.tls' || path === 'packages' || path === 'spec')) {
      if (entry[2]) report(index + 1, `${path} must be a configuration block`);
      if (seen.has(path)) report(index + 1, `Duplicate configuration key ${path}`);
      seen.add(path); sections.push({name:entry[1], indentation}); continue;
    }
    if (entry && sections.length) {
      const value = (entry[2] ?? '').replace(/^(['"])(.*)\1$/, '$2');
      if (seen.has(path)) {report(index + 1, `Duplicate configuration key ${path}`); continue;} seen.add(path);
      if (path.startsWith('packages.')) {
        if (!/^[a-z][a-z0-9_]*$/.test(entry[1]) || entry[1] === 'august' || !value)
          report(index + 1, 'Packages map lowercase public aliases to repository URLs, local paths, or npm:name@exact-version');
        else config.packages[entry[1]] = value;
        continue;
      }
      if (path === 'spec.require_comments') {
        if (!['none','public','all'].includes(value)) report(index + 1, 'spec.require_comments must be none, public, or all');
        else config.spec.require_comments = value as Config['spec']['require_comments'];
        continue;
      }
      const known = ['web.host', 'web.body_limit', 'web.response_limit', 'web.http3', 'web.tls.certificate', 'web.tls.private_key', 'web.tls.ca',
        'openapi.enabled', 'openapi.title', 'openapi.version', 'openapi.path', 'openapi.docs', 'openapi.output'];
      if (!known.includes(path)) {report(index + 1, `Unknown configuration key ${path}`); continue;}
      if (path === 'web.http3' || path === 'openapi.enabled') {
        if (!['true','false'].includes(value)) report(index + 1, `${path} must be true or false`);
        else if (path === 'web.http3') config.web.http3 = value === 'true'; else config.openapi.enabled = value === 'true';
      } else if (path === 'web.body_limit' || path === 'web.response_limit') {
        if (!/^[1-9]\d*$/.test(value) || Number(value) > 67108864) report(index + 1, `${path} must be from 1 to 67108864 bytes`);
        else config.web[path.endsWith('body_limit') ? 'body_limit' : 'response_limit'] = Number(value);
      } else {
        if (!value || /[\x00-\x1f]/.test(value) || ['openapi.path','openapi.docs'].includes(path) && (!value.startsWith('/') || /[?#]/.test(value))) {
          report(index + 1, `${path} needs a valid nonempty value`); continue;
        }
        if (path.startsWith('web.tls.')) Object.assign(config.web.tls, {[entry[1]]:value});
        else if (path === 'web.host') config.web.host = value;
        else Object.assign(config.openapi, {[entry[1]]:value});
      }
      continue;
    }
    if (!entry || !(entry[1] in config || ['output','backend'].includes(entry[1]))) { report(index + 1, `Unsupported configuration line ${JSON.stringify(raw)}`); continue; }
    const key = entry[1] as keyof Config;
    const value = (entry[2] ?? '').replace(/^(['"])(.*)\1$/, '$2');
    if (seen.has(key)) { report(index + 1, `Duplicate configuration key ${key}`); continue; }
    seen.add(key);
    if (['libraries', 'library_paths', 'lint', 'module_dependencies'].includes(key)) {
      if (value) report(index + 1, `${key} must be a YAML list`);
      else list = key as 'libraries' | 'library_paths' | 'lint' | 'module_dependencies';
    } else if (key === 'strict_modules') {
      if (!['true', 'false'].includes(value)) report(index + 1, 'strict_modules must be true or false');
      else config.strict_modules = value === 'true';
    } else if (key === 'max_dependencies' || key === 'max_public_symbols') {
      if (!/^[1-9]\d*$/.test(value)) report(index + 1, `${key} must be a positive integer`);
      else config[key] = Number(value);
    } else {
      const choices: Partial<Record<keyof Config, string[]>> = { backend: ['c','llvm'], optimization: ['debug', 'release'], assignment: ['equals', 'to'],
        block_style: ['braces', 'indent'], indentation: ['spaces', 'tabs'] };
      if (!value || choices[key] && !choices[key]!.includes(value)) report(index + 1, `${key} needs ${choices[key]?.join(' or ') ?? 'a value'}`);
      else Object.assign(config, { [key]: value });
    }
  }
  if (!!config.web.tls.certificate !== !!config.web.tls.private_key) report(1, 'TLS requires both certificate and private_key');
  if (config.web.http3 && !config.web.tls.certificate) report(1, 'HTTP/3 requires a TLS certificate and private_key');
  if (config.openapi.path === config.openapi.docs) report(1, 'OpenAPI path and docs must be distinct');
  return { config, diagnostics };
}
