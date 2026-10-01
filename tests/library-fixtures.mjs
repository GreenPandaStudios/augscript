import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { sourcePaths, prepareRunPackages, compilerVersion } from '../src/package-manager.ts';
import { loadConfig } from '../src/config.ts';

const standard = resolve(import.meta.dirname, '../src/stdlib');
let crypto;
function localCrypto() {
  if (crypto) return crypto;
  crypto = mkdtempSync(join(tmpdir(), 'aug-crypto-fixture-'));
  cpSync(join(standard, 'crypto'), crypto, { recursive: true });
  const jose = join(crypto, 'jose.aug');
  writeFileSync(jose, readFileSync(jose, 'utf8').replace(/"https:\/\/github.com\/GreenPandaStudios\/augscript\/src\/stdlib\/json#[^"]+"/, 'json'));
  writeFileSync(join(crypto, 'aug-package.json'), JSON.stringify({ format: 1, name: '@test/crypto', version: '0.0.0', compiler: compilerVersion(), source: '.', dependencies: { json: join(standard, 'json') } }));
  process.once('exit', () => rmSync(crypto, { recursive: true, force: true }));
  return crypto;
}

// Fixtures explicitly install today's library sources. The compiler itself remains read-only.
export function prepareLibraryFixtures(root) {
  if (!existsSync(root) || !existsSync(join(root, 'main.aug'))) return;
  const used = new Set();
  for (const path of sourcePaths(root)) for (const match of readFileSync(path, 'utf8').matchAll(/\bfrom (web|crypto|json|time|memory)\b/g)) used.add(match[1]);
  if (!used.size) return;
  const config = loadConfig(root), file = join(root, 'main.yaml');
  let text = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const missing = [...used].filter(name => !config.config.packages[name]);
  if (missing.length) {
    const values = { ...config.config.packages, ...Object.fromEntries(missing.map(name => [name, name === 'crypto' ? localCrypto() : join(standard, name)])) };
    const block = 'packages:\n' + Object.entries(values).map(([name, value]) => '  ' + name + ': ' + JSON.stringify(value)).join('\n') + '\n';
    text = /^packages:/m.test(text) ? text.replace(/^packages:[^\n]*(?:\n|$)(?:[ \t][^\n]*(?:\n|$)|\n)*/m, block) : text.trimEnd() + '\n' + block;
    writeFileSync(file, text);
  }
  prepareRunPackages(root);
}
