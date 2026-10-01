import { prepareLibraryFixtures } from './library-fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn as fixtureSpawn, spawnSync as fixtureSpawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { once } from 'node:events';

const root = resolve(import.meta.dirname, '..');
const cli = join(root, 'bin/aug.mjs');
const fixtureCache = process.env.AUG_NATIVE_HOME ?? join(root, '.aug-native');
function fixture(source, action) {
  const directory = mkdtempSync(join(tmpdir(), 'aug-run-setup-'));
  const app = join(directory, 'app'), native = join(directory, 'native');
  mkdirSync(app); writeFileSync(join(app, 'main.aug'), source);
  const run = (args = [], env = {}) => spawnSync(process.execPath, [cli, 'run', app, ...args], {
    encoding: 'utf8', timeout: 60000, env: { ...process.env, AUG_NATIVE_HOME: native, ...env } });
  try { action({ directory, app, native, run }); }
  finally { rmSync(directory, { recursive: true, force: true }); }
}

test('run prepares only the JSON dependency, reuses it, and keeps setup out of program stdout', () => {
  fixture('import parse from json\ntry:\n    value = parse(input="null")\n    print(value="parsed")\ncatch JsonError error:\n    exit(status=1)\n', ({ directory, native, run }) => {
    // Exercise the download and checksum path with the actual pinned archive, without relying on a public server.
    const dependency = JSON.parse(readFileSync(join(root, 'scripts/native-dependencies.lock.json'))).dependencies.find(item => item.name === 'yyjson');
    const archive = join(fixtureCache, 'downloads', dependency.archive);
    assert.ok(existsSync(archive), 'Prepare the pinned native downloads before running native regression tests');
    const preload = join(directory, 'fetch.mjs');
    writeFileSync(preload, `import {readFileSync} from 'node:fs';\nglobalThis.fetch = async url => { if (String(url) !== ${JSON.stringify(dependency.url)}) throw Error('Unexpected dependency '+url); return new Response(readFileSync(${JSON.stringify(archive)})); };\n`);
    const first = run([], { NODE_OPTIONS: `--import=${pathToFileURL(preload)}` });
    assert.equal(first.status, 0, first.stderr); assert.equal(first.stdout, 'parsed\n');
    assert.match(first.stderr, /Preparing.*JSON/i);
    assert.ok(!existsSync(join(native, 'sources', 'gnutls')));
    writeFileSync(preload, 'globalThis.fetch = async () => { throw Error("Cached run must not download"); };\n');
    const second = run(['--offline'], { NODE_OPTIONS: `--import=${pathToFileURL(preload)}` });
    assert.equal(second.status, 0, second.stderr); assert.equal(second.stdout, 'parsed\n');
    assert.doesNotMatch(second.stderr, /Preparing/);
  });
});

test('pure programs do not acquire dependencies because their strings contain runtime names', () => {
  fixture('print(value="aug_http_ aug_json_ aug_task_")\n', ({ native, run }) => {
    const result = run(['--offline']);
    assert.equal(result.status, 0, result.stderr); assert.equal(result.stdout, 'aug_http_ aug_json_ aug_task_\n');
    assert.ok(!existsSync(native));
  });
});

test('missing C compiler has a concrete recovery step instead of a spawn error', () => {
  fixture('print(value="hello")\n', ({ directory, run }) => {
    const result = run([], { CC: join(directory, 'missing-cc') });
    assert.equal(result.status, 1); assert.match(result.stderr, /C compiler/); assert.match(result.stderr, /CC/);
    assert.match(result.stderr, /install|xcode-select|build-essential/i); assert.doesNotMatch(result.stderr, /spawnSync|at .*\.mjs/);
  });
});

test('Node version and native bootstrap help fail or explain usage before loading or preparing tools', () => {
  fixture('print(value="should not run")\n', ({ directory, native, run }) => {
    const preload = join(directory, 'older-node.mjs');
    writeFileSync(preload, 'Object.defineProperty(process.versions, "node", {value: "22.0.0"});\n');
    const version = run([], { NODE_OPTIONS: `--import=${pathToFileURL(preload)}` });
    assert.equal(version.status, 1); assert.match(version.stderr, /needs Node.js 24/); assert.equal(version.stdout, '');
    const help = spawnSync(process.execPath, [join(root, 'scripts/bootstrap-native.mjs'), '--help'], { encoding: 'utf8', env: { ...process.env, AUG_NATIVE_HOME: native } });
    assert.equal(help.status, 0, help.stderr); assert.match(help.stdout, /Usage: aug-native/); assert.ok(!existsSync(native));
    const invalid = spawnSync(process.execPath, [join(root, 'scripts/bootstrap-native.mjs'), '--typo'], { encoding: 'utf8', env: { ...process.env, AUG_NATIVE_HOME: native } });
    assert.equal(invalid.status, 1); assert.match(invalid.stderr, /Unknown option --typo/); assert.ok(!existsSync(native));
  });
});

test('source diagnostics show the line, pointer, and help; JSON remains machine readable', () => {
  fixture('print(value=unknownName)\n', ({ app, native, run }) => {
    const result = run();
    assert.equal(result.status, 1); assert.match(result.stderr, /print\(value=unknownName\)/);
    assert.match(result.stderr, /\^/); assert.match(result.stderr, /help:/i); assert.ok(!existsSync(native));
    const json = spawnSync(process.execPath, [cli, 'check', app, '--json'], { encoding: 'utf8' });
    assert.equal(json.status, 1); const issues = JSON.parse(json.stdout);
    assert.ok(issues.some(issue => issue.code === 'NAME' && issue.help));
  });
});

test('run installs declared packages on first use and restores a missing snapshot from the lock', () => {
  fixture('import add from math\nprint(value=add(left=20, right=22))\n', ({ directory, app, run }) => {
    const library = join(directory, 'math');
    const init = spawnSync(process.execPath, [cli, 'package', 'init', library, '--name', '@example/aug-math'], { encoding: 'utf8' });
    assert.equal(init.status, 0, init.stderr);
    writeFileSync(join(app, 'main.yaml'), 'packages:\n  math: "../math"\n');
    const first = run(['--offline']);
    assert.equal(first.status, 0, first.stderr); assert.equal(first.stdout, '42\n'); assert.match(first.stderr, /Installing/);
    const lock = readFileSync(join(app, 'aug.lock.json'), 'utf8');
    rmSync(join(app, '.aug-packages'), { recursive: true });
    const restored = run(['--offline']);
    assert.equal(restored.status, 0, restored.stderr); assert.equal(restored.stdout, '42\n');
    assert.equal(readFileSync(join(app, 'aug.lock.json'), 'utf8'), lock);
    writeFileSync(join(app, '.aug-packages', JSON.parse(readFileSync(join(app,'aug.lock.json'),'utf8')).roots.math, 'src/arithmetic.aug'), 'add(int left, int right) returns int { return 0 }\n');
    const changed = run(['--offline']);
    assert.equal(changed.status, 1); assert.match(changed.stderr, /changed/); assert.match(changed.stderr, /aug install/);
  });
});

test('offline setup and invalid options fail with useful errors before running a program', () => {
  fixture('import parse from json\ntry:\n    value = parse(input="null")\ncatch JsonError error:\n    exit(status=1)\n', ({ run }) => {
    const result = run(['--offline']);
    assert.equal(result.status, 1); assert.match(result.stderr, /offline/i); assert.match(result.stderr, /aug run/);
  });
  fixture('print(value="should not run")\n', ({ run }) => {
    for (const args of [['--out'], ['--typo']]) {
      const result = run(args); assert.equal(result.status, 2); assert.equal(result.stdout, ''); assert.match(result.stderr, /--out|--typo/);
    }
  });
});

test('task programs prepare minicoro without downloading JSON or the HTTP stack', () => {
  fixture('import double from operations\nscope:\n    pending = start double(value=21)\n    value = wait for pending\n    print(value)\n', ({ directory, app, native, run }) => {
    writeFileSync(join(app, 'operations.aug'), 'double(int value) returns int:\n    return value * 2\n');
    const dependency = JSON.parse(readFileSync(join(root, 'scripts/native-dependencies.lock.json'))).dependencies.find(item => item.name === 'minicoro');
    const preload = join(directory, 'fetch.mjs');
    writeFileSync(preload, `import {readFileSync} from 'node:fs';\nglobalThis.fetch = async url => { if (String(url) !== ${JSON.stringify(dependency.url)}) throw Error('Unexpected dependency '+url); return new Response(readFileSync(${JSON.stringify(join(fixtureCache, 'downloads', dependency.archive))})); };\n`);
    const result = run([], { NODE_OPTIONS: `--import=${pathToFileURL(preload)}` });
    assert.equal(result.status, 0, result.stderr); assert.equal(result.stdout, '42\n');
    assert.ok(existsSync(join(native, 'sources/minicoro/minicoro.h'))); assert.ok(!existsSync(join(native, 'sources/yyjson')));
  });
});

test('a failed download has recovery guidance, no stack, and leaves no unverified archive or lock', () => {
  fixture('import parse from json\ntry:\n    value = parse(input="null")\ncatch JsonError error:\n    exit(status=1)\n', ({ directory, native, run }) => {
    const preload = join(directory, 'fetch.mjs');
    writeFileSync(preload, 'globalThis.fetch = async () => { throw Error("connection unavailable"); };\n');
    const result = run([], { NODE_OPTIONS: `--import=${pathToFileURL(preload)}` });
    assert.equal(result.status, 1); assert.match(result.stderr, /Could not download yyjson/); assert.match(result.stderr, /retry aug run/i);
    assert.doesNotMatch(result.stderr, /at .*\.mjs/); assert.ok(!existsSync(join(native, '.setup-lock')));
    const dependency = JSON.parse(readFileSync(join(root, 'scripts/native-dependencies.lock.json'))).dependencies.find(item => item.name === 'yyjson');
    assert.ok(!existsSync(join(native, 'downloads', dependency.archive)));
    writeFileSync(preload, 'globalThis.fetch = async () => new Response("corrupt archive");\n');
    const corrupt = run([], { NODE_OPTIONS: `--import=${pathToFileURL(preload)}` });
    assert.equal(corrupt.status, 1); assert.match(corrupt.stderr, /checksum/); assert.ok(!existsSync(join(native, 'downloads', dependency.archive)));
  });
});

test('two projects can prepare and use one native cache concurrently', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'aug-concurrent-setup-'));
  try {
    const native = join(directory, 'native'), preload = join(directory, 'fetch.mjs');
    const dependency = JSON.parse(readFileSync(join(root, 'scripts/native-dependencies.lock.json'))).dependencies.find(item => item.name === 'yyjson');
    writeFileSync(preload, `import {readFileSync} from 'node:fs';\nglobalThis.fetch = async () => { await new Promise(resolve => setTimeout(resolve, 800)); return new Response(readFileSync(${JSON.stringify(join(fixtureCache, 'downloads', dependency.archive))})); };\n`);
    const runs = ['first', 'second'].map(name => {
      const app = join(directory, name); mkdirSync(app);
      writeFileSync(join(app, 'main.aug'), 'import parse from json\ntry:\n    value = parse(input="null")\n    print(value="parsed")\ncatch JsonError error:\n    exit(status=1)\n');
      return new Promise((accept, reject) => {
        const child = spawn(process.execPath, [cli, 'run', app], { env: { ...process.env, AUG_NATIVE_HOME: native, NODE_OPTIONS: `--import=${pathToFileURL(preload)}` } });
        let stdout = '', stderr = ''; child.stdout.on('data', data => stdout += data); child.stderr.on('data', data => stderr += data);
        child.on('error', reject); child.on('close', status => accept({ status, stdout, stderr }));
      });
    });
    const results = await Promise.all(runs);
    for (const result of results) { assert.equal(result.status, 0, result.stderr); assert.equal(result.stdout, 'parsed\n'); }
    assert.ok(results.some(result => /Waiting for another August process/.test(result.stderr)));
    assert.ok(!existsSync(join(native, '.setup-lock')));
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('invalid native metadata and foreign architecture caches have specific recovery guidance', () => {
  fixture(readFileSync(join(root, 'docker/crypto-smoke/main.aug'), 'utf8'), ({ native, run }) => {
    mkdirSync(join(native, 'prefix'), { recursive: true });
    const path = join(native, 'prefix/aug-native-manifest.json');
    for (const content of ['{broken', JSON.stringify({ platform: process.platform, architecture: process.arch, dependencies: {} })]) {
      writeFileSync(path, content); const result = run(['--offline']);
      assert.equal(result.status, 1); assert.match(result.stderr, /metadata is unreadable/); assert.match(result.stderr, /AUG_NATIVE_HOME/);
    }
    writeFileSync(path, JSON.stringify({ platform: 'other', architecture: 'other', dependencies: [] }));
    const foreign = run(['--offline']);
    assert.equal(foreign.status, 1); assert.match(foreign.stderr, /targets other\/other/); assert.match(foreign.stderr, /unset it/);
  });
});

test('interrupting setup stops its child process and a subsequent run recovers its cache lock', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'aug-interrupt-setup-'));
  let child, owner;
  try {
    const app = join(directory, 'app'), native = join(directory, 'native'), preload = join(directory, 'fetch.mjs');
    mkdirSync(app); writeFileSync(join(app, 'main.aug'), 'import parse from json\ntry:\n    value = parse(input="null")\n    print(value="parsed")\ncatch JsonError error:\n    exit(status=1)\n');
    writeFileSync(preload, 'globalThis.fetch = async () => { await new Promise(accept => setTimeout(accept, 30000)); throw Error("interrupted"); };\n');
    child = spawn(process.execPath, [cli, 'run', app], { env: { ...process.env, AUG_NATIVE_HOME: native, NODE_OPTIONS: `--import=${pathToFileURL(preload)}` } });
    let errors = ''; child.stderr.on('data', data => errors += data); child.stdout.resume();
    for (let attempt = 0; attempt < 100 && !existsSync(join(native, '.setup-lock')); attempt++) await new Promise(accept => setTimeout(accept, 50));
    assert.ok(existsSync(join(native, '.setup-lock')), errors); owner = JSON.parse(readFileSync(join(native, '.setup-lock'))).pid;
    const closed = once(child, 'close'); child.kill('SIGTERM');
    const [status] = await closed; assert.equal(status, 143, errors); assert.match(errors, /cancelled by SIGTERM/);
    assert.throws(() => process.kill(owner, 0), { code: 'ESRCH' });
    const dependency = JSON.parse(readFileSync(join(root, 'scripts/native-dependencies.lock.json'))).dependencies.find(item => item.name === 'yyjson');
    writeFileSync(preload, `import {readFileSync} from 'node:fs';\nglobalThis.fetch = async () => new Response(readFileSync(${JSON.stringify(join(fixtureCache, 'downloads', dependency.archive))}));\n`);
    const resumed = spawnSync(process.execPath, [cli, 'run', app], { encoding: 'utf8', timeout: 30000, env: { ...process.env, AUG_NATIVE_HOME: native, NODE_OPTIONS: `--import=${pathToFileURL(preload)}` } });
    assert.equal(resumed.status, 0, resumed.stderr); assert.equal(resumed.stdout, 'parsed\n');
  } finally {
    if (child?.exitCode === null && child?.signalCode === null) child.kill('SIGKILL');
    if (owner) try { process.kill(owner, 'SIGKILL'); } catch { /* Already stopped. */ }
    rmSync(directory, { recursive: true, force: true });
  }
});

function spawnSync(command, args, options) {
  if (args?.[0]?.endsWith("aug.mjs") && args[2]) prepareLibraryFixtures(args[2]);
  return fixtureSpawnSync(command, args, options);
}

function spawn(command, args, options) {
  if (args?.[0]?.endsWith("aug.mjs") && args[2]) prepareLibraryFixtures(args[2]);
  return fixtureSpawn(command, args, options);
}
