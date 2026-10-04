#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Editor-only patches must reuse a released compiler, not unqualified compiler changes. */
export function extensionReleaseSource(tag, expectedSha, directory = resolve(import.meta.dirname, '..')) {
  assert.match(tag, /^extension-v\d+\.\d+\.\d+$/, 'Supply an existing extension-vVERSION tag');
  assert.match(expectedSha, /^[0-9a-f]{40}$/, 'Supply the reviewed full commit SHA');
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: directory, encoding: 'utf8' });
    assert.equal(result.status, 0, 'Cannot read extension release source: ' + result.stderr);
    return result.stdout.trim();
  };
  const sha = git('rev-parse', '--verify', `refs/tags/${tag}^{commit}`);
  assert.equal(sha, expectedSha, 'Extension tag differs from the reviewed commit');
  const read = file => JSON.parse(git('show', `${sha}:${file}`));
  const editor = read('vscode/package.json'), compiler = read('package.json').version;
  assert.equal(tag, 'extension-v' + editor.version, 'Extension tag/version mismatch');
  assert.equal(editor.augustCompilerVersion, compiler, 'Extension compiler pin mismatch');
  const lock = read('vscode/package-lock.json');
  assert.equal(lock.version, editor.version, 'Extension lock version mismatch');
  assert.equal(lock.packages?.['']?.version, editor.version, 'Extension root lock version mismatch');
  const compilerTag = 'v' + compiler;
  const compilerSha = git('rev-parse', '--verify', `refs/tags/${compilerTag}^{commit}`);
  assert.equal(JSON.parse(git('show', `${compilerSha}:package.json`)).version, compiler, 'Released compiler version mismatch');
  // Metadata/docs/artwork may change. Compiler, runtime and bootstrap inputs may not.
  const inputs = ['src', 'runtime', 'bin', 'packages/cli/package.json', 'scripts/bootstrap-native.mjs',
    'scripts/native-home.mjs', 'scripts/native-home.d.mts', 'scripts/native-setup.mjs',
    'scripts/native-setup.d.mts', 'scripts/native-toolchain.mjs', 'scripts/native-toolchain.d.mts',
    'scripts/native-dependencies.lock.json'];
  for (const input of inputs)
    assert.equal(git('rev-parse', `${sha}:${input}`), git('rev-parse', `${compilerSha}:${input}`),
      'Compiler inputs changed; prepare a full compiler release: ' + input);
  return { tag, sha, version: editor.version, compiler, compilerTag, compilerSha };
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const source = extensionReleaseSource(process.argv[2] ?? '', process.argv[3] ?? '');
    for (const [key, value] of Object.entries(source)) process.stdout.write(key + '=' + value + '\n');
  } catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
