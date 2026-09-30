#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const order = ['stdlib', 'web', 'crypto', 'cli'];

/** Verify every archive before granting any package publication. */
export function verifyRelease(directory) {
  const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
  const packages = JSON.parse(readFileSync(join(directory, 'packages.json'), 'utf8'));
  assert.equal(packages.length, order.length, 'Expected exactly four packages');
  const checksums = new Map(readFileSync(join(directory, 'SHA256SUMS'), 'utf8').trim().split('\n')
    .map(line => { const match = /^([a-f0-9]{64})  ([^/]+)$/.exec(line); assert.ok(match, 'Invalid checksum entry'); return [match[2], match[1]]; }));
  return order.map(name => {
    const expected = JSON.parse(readFileSync(join(root, 'packages', name, 'package.json'), 'utf8'));
    const matches = packages.filter(pkg => pkg.directory === name);
    assert.equal(matches.length, 1, `Missing or duplicate ${name} package`);
    const pkg = matches[0];
    assert.equal(pkg.name, expected.name); assert.equal(pkg.version, version);
    assert.equal(pkg.filename, `greenpandastudios-aug-${name}-${version}.tgz`);
    const file = resolve(directory, pkg.filename), contents = readFileSync(file);
    const checksum = createHash('sha256').update(contents).digest('hex');
    assert.equal(checksum, pkg.sha256, 'Package metadata checksum mismatch');
    assert.equal(checksum, checksums.get(pkg.filename), 'Release checksum mismatch');
    const integrity = 'sha512-' + createHash('sha512').update(contents).digest('base64');
    assert.equal(integrity, pkg.integrity, 'Package integrity mismatch');
    const extracted = spawnSync('tar', ['-xOf', file, 'package/package.json'], { encoding: 'utf8' });
    assert.equal(extracted.status, 0, extracted.stderr);
    const manifest = JSON.parse(extracted.stdout);
    assert.equal(manifest.name, expected.name); assert.equal(manifest.version, version);
    assert.deepEqual(manifest.dependencies, expected.dependencies);
    return { ...pkg, file, integrity };
  });
}

export function registryMatches(result, integrity) {
  const response = JSON.parse(result.stdout || '{}');
  if (result.status === 0) {
    assert.equal(response, integrity, 'Published version differs from the reviewed archive; refusing to skip');
    return true;
  }
  assert.equal(response.error?.code, 'E404', `Registry lookup failed: ${result.stderr}`);
  return false;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const packages = verifyRelease(resolve(process.argv[2] ?? 'release'));
  for (const pkg of packages) {
    const existing = spawnSync('npm', ['view', `${pkg.name}@${pkg.version}`, 'dist.integrity', '--json', '--registry=https://registry.npmjs.org'], { encoding: 'utf8' });
    if (registryMatches(existing, pkg.integrity)) { process.stdout.write(`Already published: ${pkg.name}@${pkg.version}\n`); continue; }
    const result = spawnSync('npm', ['publish', pkg.file, '--access', 'public', '--tag', 'next', '--ignore-scripts', '--registry=https://registry.npmjs.org'], { stdio: 'inherit' });
    assert.equal(result.status, 0, `Publication failed: ${pkg.name}`);
  }
}
