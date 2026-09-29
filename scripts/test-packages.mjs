#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const artifacts = join(root, 'dist/release');
const packages = JSON.parse(readFileSync(join(artifacts, 'packages.json'), 'utf8'));
const directory = mkdtempSync(join(tmpdir(), 'aug-installed-'));
const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, { cwd: directory, encoding: 'utf8', ...options });
  assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${result.stderr}\n${result.stdout}`);
  return result.stdout;
};
try {
  for (const pkg of packages) assert.equal(createHash('sha256').update(readFileSync(join(artifacts, pkg.filename))).digest('hex'), pkg.sha256);
  run('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', ...packages.map(pkg => join(artifacts, pkg.filename))]);
  const cliRoot = join(directory, 'node_modules/@greenpandastudios/aug-cli');
  const cli = join(cliRoot, 'bin/aug.mjs');
  const aug = (...args) => run(process.execPath, [cli, ...args], {
    env: { ...process.env, AUG_NATIVE_HOME: process.env.AUG_NATIVE_HOME ?? join(root, '.aug-native') }
  });
  assert.equal(aug('--version').trim(), packages.find(pkg => pkg.directory === 'cli').version);
  assert.match(aug('--help'), /Usage: aug/);
  const project = join(directory, 'hello');
  mkdirSync(project);
  const main = `import Console and SystemConsole from august.io\nimport Crypto from august.crypto\nimport HttpClient from august.web\nimplement Console with SystemConsole\nresolve Console to console\nconsole.write(value="installed August works")\n`;
  writeFileSync(join(project, 'main.aug'), main);
  aug('check', project);
  assert.equal(aug('run', project), 'installed August works\n');
  const library = join(directory, 'my-math');
  aug('package', 'init', library, '--name', '@example/aug-math');
  aug('check', library);
  const libraryTests = JSON.parse(aug('test', library, '--json'));
  assert.equal(libraryTests.passed, 1);
  const archive = aug('package', 'pack', library).trim();
  const consumer = join(directory, 'my-app'); mkdirSync(consumer);
  writeFileSync(join(consumer, 'main.yaml'), `packages:\n  math: "${archive}"\n`);
  writeFileSync(join(consumer, 'main.aug'), 'import add from math\nprint(value=add(left=20, right=22))\n');
  aug('install', consumer, '--offline'); aug('install', consumer, '--frozen', '--offline');
  assert.equal(aug('run', consumer), '42\n');
  const globalPrefix = join(directory, 'global');
  run('npm', ['install', '--global', '--prefix', globalPrefix, '--offline', '--ignore-scripts', '--no-audit', '--no-fund',
    ...packages.map(pkg => join(artifacts, pkg.filename))]);
  const globalAug = join(globalPrefix, 'bin/aug');
  assert.equal(run(globalAug, ['--version']).trim(), packages.find(pkg => pkg.directory === 'cli').version);
  assert.equal(run(globalAug, ['run', project], {env: {...process.env, AUG_NATIVE_HOME: process.env.AUG_NATIVE_HOME ?? join(root, '.aug-native')}}),
    'installed August works\n');
  const definition = JSON.parse(aug('definition', project, '--file', join(project, 'main.aug'), '--offset', String(main.indexOf('from august.crypto') + 2)));
  assert.ok(definition.file.endsWith('/aug-crypto/august/crypto/export.aug'), JSON.stringify(definition));
  const rootExport = realpathSync(join(directory, 'node_modules/@greenpandastudios/aug-stdlib/august/export.aug'));
  const exportOffset = readFileSync(rootExport, 'utf8').indexOf('crypto');
  const folderDefinition = JSON.parse(aug('definition', project, '--file', rootExport, '--offset', String(exportOffset)));
  assert.ok(folderDefinition.file.endsWith('/aug-crypto/august/crypto/export.aug'), JSON.stringify(folderDefinition));
  writeFileSync(join(project, 'main.aug'), main + 'import ');
  const items = JSON.parse(aug('complete', project, '--file', join(project, 'main.aug'), '--offset', String(main.length + 7)));
  assert.ok(items.some(item => item.detail === 'import GnuTlsCrypto from august.crypto'), JSON.stringify(items));
  writeFileSync(join(project, 'main.aug'), main);
  aug('check', join(cliRoot, 'examples/oidc-login'));
  const emitted = aug('emit-c', join(cliRoot, 'examples/oidc-login'));
  assert.match(emitted, /aug_http_configure/);
  if (process.argv.includes('--native')) {
    const proof = join(directory, 'oidc-login');
    cpSync(join(cliRoot, 'examples/oidc-login'), proof, {recursive: true});
    aug('build', proof);
    const tests = JSON.parse(aug('test', proof, '--group', 'signed_identity_claims', '--json'));
    assert.equal(tests.failed, 0);
    assert.ok(tests.passed >= 11);
    process.stdout.write(`Installed native web/crypto: OIDC application builds; ${tests.passed} signed identity tests pass.\n`);
  }
  const nativePath = run(process.execPath, ['--input-type=module', '-e',
    `import {nativeHome} from ${JSON.stringify(join(cliRoot, 'scripts/native-home.mjs'))}; console.log(nativeHome(${JSON.stringify(cliRoot)}));`],
    { env: Object.fromEntries(Object.entries(process.env).filter(([name]) => name !== 'AUG_NATIVE_HOME')) }).trim();
  assert.ok(!nativePath.startsWith(directory));
  assert.match(nativePath, /\.cache\/augscript\/native\//);
  const manifestFile = join(directory, 'node_modules/@greenpandastudios/aug-crypto/aug-package.json');
  writeFileSync(manifestFile, JSON.stringify({ ...JSON.parse(readFileSync(manifestFile, 'utf8')), version: '999.0.0' }));
  const mismatch = spawnSync(process.execPath, [cli, 'check', project], { cwd: directory, encoding: 'utf8' });
  assert.notEqual(mismatch.status, 0);
  assert.match(mismatch.stderr, /must match compiler/);
  process.stdout.write('Installed package smoke tests passed: compiler, native execution, split libraries, navigation, completion, OIDC emission, cache and version compatibility.\n');
} finally { rmSync(directory, { recursive: true, force: true }); }
