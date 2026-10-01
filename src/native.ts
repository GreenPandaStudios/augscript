import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import type { CheckedProject } from './checker.ts';
import type { Diagnostic } from './ast.ts';
import type {Config} from './config.ts';
import { loadConfig } from './config.ts';
import {generateOpenApi} from './openapi.ts';
import { nativeHome } from '../scripts/native-home.mjs';
import { nativeRequirements } from '../scripts/native-setup.mjs';
import { cCompiler, compilerHelp } from '../scripts/native-toolchain.mjs';

export function compileNative(root: string, generated: string, options: { output?: string; testIndex?: number; release?: boolean; checked?: CheckedProject;config?:Config;buildDirectory?:string } = {}) {
  const config = options.config ?? loadConfig(root).config;
  const buildDir = options.buildDirectory ?? join(root, '.aug-build', ...(options.testIndex === undefined ? [] : ['tests']));
  mkdirSync(buildDir, { recursive: true });
  if (config.openapi.enabled && options.checked && options.testIndex === undefined) {
    const target = resolve(root,config.openapi.output); mkdirSync(dirname(target),{recursive:true});
    writeFileSync(target,JSON.stringify(generateOpenApi(options.checked).document,null,2) + '\n');
  }
  const name = options.testIndex === undefined ? 'program' : `test-${options.testIndex}`;
  const cPath = join(buildDir, `${name}.c`);
  writeFileSync(cPath, generated);
  const runtimeDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'runtime');
  const nativeRoot = nativeHome(resolve(runtimeDir, '..'));
  const runtimePath = join(buildDir, 'aug_runtime.c');
  copyFileSync(join(runtimeDir, 'aug_runtime.c'), runtimePath);
  copyFileSync(join(runtimeDir, 'aug_runtime.h'), join(buildDir, 'aug_runtime.h'));
  const valuesPath = join(buildDir, 'aug_values.c');
  copyFileSync(join(runtimeDir, 'aug_values.c'), valuesPath);
  const outputName = options.testIndex === undefined ? options.output ?? config.output ?? basename(root) : name;
  const output = isAbsolute(outputName) ? outputName : join(buildDir, outputName);
  mkdirSync(dirname(output), { recursive: true });
  const cc = cCompiler();
  const release = options.release ?? config.optimization === 'release';
  const args = [release ? '-O2' : '-O0', '-g', '-std=c11', '-D_POSIX_C_SOURCE=200809L', '-Wall', '-Wextra',
    '-pthread',
    cPath, runtimePath, valuesPath, ...config.library_paths.map(path => `-L${resolve(root, path)}`), ...config.libraries.map(name => `-l${name}`), '-o', output];
  const needs = nativeRequirements(generated), web = needs.web;
  if (web) args.push('-DAUG_HTTP_RUNTIME');
  if (needs.html) {const htmlSource = join(buildDir, 'aug_html.c'); copyFileSync(join(runtimeDir, 'aug_html.c'), htmlSource); args.push(htmlSource);}
  if (needs.time) {const timeSource = join(buildDir, 'aug_time.c'); copyFileSync(join(runtimeDir, 'aug_time.c'), timeSource); args.push(timeSource);}
  if (needs.tasks) {
    const taskSource = join(buildDir, 'aug_tasks.c'); copyFileSync(join(runtimeDir, 'aug_tasks.c'), taskSource);
    const minicoro = join(nativeRoot, 'sources', 'minicoro');
    if (!existsSync(join(minicoro, 'minicoro.h'))) throw new Error('Task dependencies are missing. Run aug run to prepare them automatically, or use aug-native --extract-only --only minicoro to prewarm the cache.');
    args.push(taskSource, '-I' + minicoro,
      process.platform === 'darwin' ? '-D_DARWIN_C_SOURCE' : '-D_DEFAULT_SOURCE');
  }
  if (needs.crypto) {
    const prefix = join(nativeRoot, 'prefix');
    const manifestPath=join(prefix, 'aug-native-manifest.json');
    if (!existsSync(manifestPath)) throw new Error('Native libraries are not ready. Run aug run to prepare them automatically, or use aug-native to prewarm the cache.');
    const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
    if(manifest.platform!==process.platform||manifest.architecture!==process.arch)
      throw new Error(`Native dependencies target ${manifest.platform}/${manifest.architecture}; this compiler runs on ${process.platform}/${process.arch}. Build dependencies on this host.`);
    const cryptoPath = join(buildDir, 'aug_crypto.c');
    copyFileSync(join(runtimeDir, 'aug_crypto.c'), cryptoPath);
    args.push(cryptoPath, '-I' + join(prefix, 'include'), '-L' + join(prefix, 'lib'), '-Wl,-rpath,' + join(prefix, 'lib'), '-lgnutls', '-lnettle', '-lhogweed', '-lgmp', '-pthread');
    if (web) {
      args.push(process.platform === 'darwin' ? '-D_DARWIN_C_SOURCE' : '-D_DEFAULT_SOURCE');
      const webPath = join(buildDir, 'aug_http.c'); copyFileSync(join(runtimeDir, 'aug_http.c'), webPath);
      args.push(webPath, join(prefix, 'lib', 'libwebsockets.a'), '-lz');
      if (process.platform === 'darwin') args.push('-framework', 'CoreFoundation', '-framework', 'SystemConfiguration');
    }
  }
  if (needs.json) {
    const jsonSource = join(buildDir, 'aug_json.c'); copyFileSync(join(runtimeDir, 'aug_json.c'), jsonSource);
    const yyjson = join(nativeRoot, 'sources', 'yyjson', 'src');
    if (!existsSync(join(yyjson, 'yyjson.c'))) throw new Error('JSON dependencies are missing. Run aug run to prepare them automatically, or use aug-native --extract-only --only yyjson to prewarm the cache.');
    args.push(jsonSource, join(yyjson, 'yyjson.c'), '-I' + yyjson);
  }
  const sdk = '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk';
  if (process.platform === 'darwin' && existsSync(sdk) && !process.env.SDKROOT) args.unshift('-isysroot', sdk);
  const compile = spawnSync(cc, args, { encoding: 'utf8', cwd: root });
  if (compile.error) throw new Error(`Cannot compile the program with ${cc}: ${compile.error.message}.\n${compilerHelp()}`);
  const detail = (compile.stderr || compile.stdout || (compile.signal ? `Compiler stopped by ${compile.signal}` : 'C compiler failed')).trim();
  const error = compile.status === 0 ? '' : `Native compilation failed with ${cc}.\n${detail}\n` +
    (/cannot find -l|library not found|file not found|No such file/.test(detail) ?
      'Check main.yaml libraries/library_paths and the named header or library. On Linux, HTTP also needs zlib development headers.\n' : '') +
    `Generated C: ${cPath}\nIf this is valid August code without external C declarations, please report it with this compiler output.`;
  const diagnostics: Diagnostic[] = [];
  for (const match of error.matchAll(/^(.+\.aug):(\d+):(\d+):\s*(?:fatal )?error:\s*(.+)$/gm))
    diagnostics.push({ file: match[1], line: Number(match[2]), column: Number(match[3]), code: 'NATIVE', message: match[4] });
  if (compile.status === 0 && options.checked) {
    const version = JSON.parse(readFileSync(resolve(runtimeDir, '..', 'package.json'), 'utf8')).version;
    writeFileSync(output + '.augmap.json', JSON.stringify({ version, compiler: cc, arguments: args,
      generatedHash: createHash('sha256').update(generated).digest('hex'),
      sources: [...options.checked.project.files.values()].map(file => ({ path: file.path, hash: createHash('sha256').update(file.source).digest('hex') })),
      symbols: [...options.checked.project.definitions.values()].map((def, index) => ({ name: def.name, native: `aug_${index}_${def.name}`, location: def.node.span })) }, null, 2) + '\n');
  }
  return { output, status: compile.status ?? 1, error, diagnostics };
}

/** Merge per-process native statement counts, retaining unexecuted locations. */
export function writeCoverage(root: string, reports: string[]) {
  const files = new Map<string, Map<number, number>>();
  for (const path of reports) if (existsSync(path)) for (const row of readFileSync(path, 'utf8').trim().split('\n')) {
    const match = /^(.*)\t(\d+)\t(\d+)$/.exec(row); if (!match) continue;
    const lines = files.get(match[1]) ?? new Map<number, number>(); files.set(match[1], lines);
    const line = Number(match[2]); lines.set(line, (lines.get(line) ?? 0) + Number(match[3]));
  }
  const result = [...files].sort(([a], [b]) => a.localeCompare(b)).map(([file, counts]) => ({ file,
    lines: [...counts].sort(([a], [b]) => a - b).map(([line, count]) => ({ line, count })) }));
  const executable = result.reduce((sum, file) => sum + file.lines.length, 0);
  const covered = result.reduce((sum, file) => sum + file.lines.filter(line => line.count > 0).length, 0);
  const directory = join(root, '.aug-build', 'coverage'); mkdirSync(directory, { recursive: true });
  const report = { kind: 'statement-lines', covered, executable, percent: executable ? covered * 100 / executable : 0, files: result };
  const path = join(directory, 'coverage.json'); writeFileSync(path, JSON.stringify(report, null, 2) + '\n');
  writeFileSync(join(directory, 'lcov.info'), result.map(file => `TN:AugScript\nSF:${file.file}\n` +
    file.lines.map(line => `DA:${line.line},${line.count}\n`).join('') + `LF:${file.lines.length}\nLH:${file.lines.filter(line => line.count > 0).length}\nend_of_record\n`).join(''));
  return { ...report, path: relative(root, path) };
}

export function benchmark(output: string, root: string, iterations: number, warmup: number, args: string[], timeout: number) {
  const samples: number[] = [];
  for (let index = -warmup; index < iterations; index++) {
    const start = performance.now();
    const run = spawnSync(output, args, { encoding: 'utf8', cwd: root, timeout, killSignal: 'SIGKILL' });
    if (run.error || run.status !== 0) throw new Error(run.error?.message ?? run.stderr ?? `Benchmark exited ${run.status}`);
    if (index >= 0) samples.push(performance.now() - start);
  }
  const sorted = [...samples].sort((a, b) => a - b);
  return { iterations, warmup, includesProcessStartup: true, units: 'milliseconds', samples,
    median: sorted[Math.floor(sorted.length / 2)], p95: sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * .95) - 1)], minimum: sorted[0] };
}
