import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { extensionReleaseSource } from '../scripts/extension-release-source.mjs';

test('extension patch freezes its tag and compiler inputs while allowing editor-only changes', t => {
  const root = mkdtempSync(join(tmpdir(), 'aug-extension-source-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => {
    const r = spawnSync('git', args, { cwd: root, encoding: 'utf8',
      env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' } });
    assert.equal(r.status, 0, r.stderr); return r.stdout.trim();
  };
  const write = (path, data) => { mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof data === 'string' ? data : JSON.stringify(data)); };
  git('init'); git('config', 'user.name', 'Release test'); git('config', 'user.email', 'release@example.invalid');
  write('package.json', { version: '0.23.0' }); write('packages/cli/package.json', { version: '0.23.0' });
  for (const path of ['src/compiler.ts', 'runtime/value.c', 'bin/aug.mjs', ...['bootstrap-native.mjs',
    'native-home.mjs', 'native-home.d.mts', 'native-setup.mjs', 'native-setup.d.mts',
    'native-toolchain.mjs', 'native-toolchain.d.mts', 'native-dependencies.lock.json'].map(f => 'scripts/' + f)])
    write(path, 'frozen compiler input');
  git('add', '.'); git('commit', '-m', 'Compiler fixture'); git('tag', 'v0.23.0');
  const compilerSha = git('rev-parse', 'HEAD');
  write('vscode/package.json', { version: '0.23.1', augustCompilerVersion: '0.23.0' });
  write('vscode/package-lock.json', { version: '0.23.1', packages: { '': { version: '0.23.1' } } });
  write('vscode/media/mark.svg', 'new artwork');
  git('add', '.'); git('commit', '-m', 'Editor patch'); git('tag', '-a', 'extension-v0.23.1', '-m', 'Reviewed patch');
  const sha = git('rev-parse', 'HEAD');
  const expected = { tag: 'extension-v0.23.1', sha, version: '0.23.1', compiler: '0.23.0', compilerTag: 'v0.23.0', compilerSha };
  assert.deepEqual(extensionReleaseSource(expected.tag, sha, root), expected);
  assert.throws(() => extensionReleaseSource(expected.tag, compilerSha, root), /reviewed commit/);
  for (const [path, value, message] of [
    ['src/compiler.ts', 'changed lowering', /Compiler inputs changed/],
    ['runtime/value.c', 'changed runtime', /Compiler inputs changed/],
    ['scripts/native-setup.mjs', 'changed installer', /Compiler inputs changed/],
    ['vscode/package.json', { version: '0.23.1', augustCompilerVersion: '0.22.0' }, /compiler pin mismatch/],
    ['vscode/package.json', { version: '0.23.2', augustCompilerVersion: '0.23.0' }, /tag\/version mismatch/],
    ['vscode/package-lock.json', { version: '0.23.1', packages: { '': { version: '0.23.0' } } }, /root lock version/],
  ]) {
    git('restore', '--source', sha, '.'); write(path, value); git('add', '.'); git('commit', '-m', 'Invalid patch');
    const invalid = git('rev-parse', 'HEAD'); git('tag', '-f', expected.tag, invalid);
    assert.throws(() => extensionReleaseSource(expected.tag, invalid, root), message);
  }
  for (const tag of ['main', 'v0.23.0', '--delete', 'extension-v0.23.1\nsha=bad'])
    assert.throws(() => extensionReleaseSource(tag, sha, root), /existing extension/);
});
