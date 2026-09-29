#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = path => JSON.parse(readFileSync(join(root, path), 'utf8'));
const write = (path, value) => writeFileSync(join(root, path), JSON.stringify(value, null, 2) + '\n');
const current = read('package.json').version;
const version = process.argv[2] === '--check' ? current : process.argv[2];
assert.match(version ?? '', /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, 'Provide a semver version or --check');
const tagIndex = process.argv.indexOf('--tag');
if (tagIndex >= 0) assert.equal(process.argv[tagIndex + 1], `v${version}`, 'Release tag must match the package version');
const paths = ['package.json', 'vscode/package.json', ...['cli', 'stdlib', 'web', 'crypto'].map(name => `packages/${name}/package.json`),
  ...['stdlib', 'web', 'crypto'].map(name => `packages/${name}/aug-package.json`)];
for (const path of paths) {
  const data = read(path);
  if (process.argv[2] === '--check') {
    assert.equal(data.version, version, path);
    if (data.compiler) assert.equal(data.compiler, version, path);
    for (const [name, dependency] of Object.entries(data.dependencies ?? {}))
      if (name.startsWith('@greenpandastudios/aug-')) assert.equal(dependency, version, path + ': ' + name);
  } else {
    data.version = version;
    if (data.compiler) data.compiler = version;
    for (const name of Object.keys(data.dependencies ?? {})) if (name.startsWith('@greenpandastudios/aug-')) data.dependencies[name] = version;
    write(path, data);
  }
}
for (const path of ['package-lock.json', 'vscode/package-lock.json']) {
  const lock = read(path);
  if (process.argv[2] === '--check') { assert.equal(lock.version, version, path); assert.equal(lock.packages[''].version, version, path); }
  else { lock.version = lock.packages[''].version = version; write(path, lock); }
}
process.stdout.write(`August ${version}: versions ${process.argv[2] === '--check' ? 'match' : 'updated'}\n`);
