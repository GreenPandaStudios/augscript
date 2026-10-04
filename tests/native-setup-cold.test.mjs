import {prepareRunPackages} from '../src/package-manager.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';

test('cold crypto and HTTP setup works through an aliased cache and serves a real response', {
  skip: process.env.AUG_TEST_COLD_NATIVE !== '1', timeout: 900000,
}, async () => {
  const root = resolve(import.meta.dirname, '..'), directory = mkdtempSync(join(tmpdir(), 'aug-cold-native-'));
  let server;
  try {
    const actual = join(directory, 'actual'), alias = join(directory, 'cache');
    mkdirSync(join(actual, 'downloads'), { recursive: true }); symlinkSync(actual, alias, 'dir');
    const prepared = process.env.AUG_NATIVE_HOME ?? join(root, '.aug-native');
    const dependencies = JSON.parse(readFileSync(join(root, 'scripts/native-dependencies.lock.json'))).dependencies;
    for (const dependency of dependencies.filter(item => !item.platforms || item.platforms.includes(process.platform)))
      cpSync(join(prepared, 'downloads', dependency.archive), join(actual, 'downloads', dependency.archive));
    const env = { ...process.env, AUG_NATIVE_HOME: alias }, cli = join(root, 'bin/aug.mjs');
    const crypto = join(directory, 'crypto'); cpSync(join(root, 'docker/crypto-smoke'), crypto, { recursive: true });
    prepareRunPackages(crypto);
    const digest = spawnSync(process.execPath, [cli, 'run', crypto, '--backend', 'c', '--offline'], { env, encoding: 'utf8', timeout: 600000 });
    assert.equal(digest.status, 0, digest.stderr);
    assert.equal(digest.stdout, 'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0\n');
    assert.ok(!existsSync(join(actual, 'sources/libwebsockets')), 'crypto must not download HTTP');
    const web = join(directory, 'web'); cpSync(join(root, 'docker/web-smoke'), web, { recursive: true });
    // An ephemeral port is selected independently for this test server.
    const { createServer } = await import('node:net');
    const reservation = createServer(); reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening');
    const port = reservation.address().port; await new Promise(accept => reservation.close(accept));
    writeFileSync(join(web, 'main.aug'), `import health from endpoints\nserve health on port ${port}\n`);
    const build = spawnSync(process.execPath, [cli, 'build', web, '--backend', 'c', '--offline'], { env, encoding: 'utf8', timeout: 600000 });
    assert.equal(build.status, 0, build.stderr);
    server = spawn(build.stdout.trim(), [], { env, stdio: ['ignore', 'ignore', 'pipe'] });
    let errors = ''; server.stderr.on('data', data => errors += data);
    let response;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { response = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(1000) }); break; }
      catch { if (server.exitCode !== null || server.signalCode !== null) break; await new Promise(accept => setTimeout(accept, 100)); }
    }
    assert.ok(response, errors); assert.equal(response.status, 200); assert.equal(await response.text(), '{"status":"ok"}');
  } finally {
    if (server && server.exitCode === null && server.signalCode === null) { const closed = once(server, 'close'); server.kill('SIGTERM'); await closed; }
    rmSync(directory, { recursive: true, force: true });
  }
});
