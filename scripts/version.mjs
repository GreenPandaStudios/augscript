#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = path => JSON.parse(readFileSync(join(root, path), 'utf8'));
const write = (path, value) => writeFileSync(join(root, path), JSON.stringify(value, null, 2) + '\n');
const current = read('package.json').version;
const check = process.argv[2] === '--check', extensionOnly = process.argv[2] === '--extension';
const version = check ? current : process.argv[extensionOnly ? 3 : 2];
const semver = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
assert.match(version ?? '', semver, 'Provide a semver version, --extension VERSION, or --check');
const tagIndex = process.argv.indexOf('--tag');
if (tagIndex >= 0) assert.equal(process.argv[tagIndex + 1], (extensionOnly ? 'extension-v' : 'v') + version, 'Release tag must match the package version');
const paths = ['package.json', ...['cli', 'stdlib', 'web', 'crypto'].map(name => `packages/${name}/package.json`),
  ...['stdlib', 'web', 'crypto'].map(name => `packages/${name}/aug-package.json`)];
if (!extensionOnly) {
  for (const path of paths) {
    const data = read(path);
    if (check) {
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
  for (const path of ['docker/Dockerfile.build', 'docker/Dockerfile.run']) {
    const contents = readFileSync(join(root, path), 'utf8');
    if (check) assert.equal(/^ARG AUG_VERSION=(.+)$/m.exec(contents)?.[1], version, path);
    else writeFileSync(join(root, path), contents.replace(/^ARG AUG_VERSION=.+$/m, 'ARG AUG_VERSION=' + version));
  }
  const lock = read('package-lock.json');
  if (check) { assert.equal(lock.version, version); assert.equal(lock.packages[''].version, version); }
  else { lock.version = lock.packages[''].version = version; write('package-lock.json', lock); }
  const example = 'examples/packages/math/aug-package.json', manifest = read(example);
  if (check) assert.equal(manifest.compiler, version, example);
  else { manifest.compiler = version; write(example, manifest); }
}
const editor = read('vscode/package.json'), lock = read('vscode/package-lock.json');
if (check) {
  assert.match(editor.version, semver, 'Extension version');
  assert.equal(editor.augustCompilerVersion, current, 'Extension compiler pin');
  assert.equal(lock.version, editor.version, 'Extension lock version');
  assert.equal(lock.packages[''].version, editor.version, 'Extension root lock version');
} else {
  editor.version = version;
  editor.augustCompilerVersion = extensionOnly ? current : version;
  lock.version = lock.packages[''].version = version;
  write('vscode/package.json', editor); write('vscode/package-lock.json', lock);
}
process.stdout.write(`August ${extensionOnly ? current : version}, extension ${editor.version}: versions ${check ? 'verified' : 'updated'}\n`);
