import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

export const repositoryRoot = resolve(import.meta.dirname, '..');
export const packageOrder = ['stdlib', 'web', 'crypto', 'cli'];
const json = file => JSON.parse(readFileSync(file, 'utf8'));
const hash = (bytes, algorithm = 'sha256', encoding = 'hex') => createHash(algorithm).update(bytes).digest(encoding);

/** A manual retry must run the same tagged, version-matched workflow as the release. */
export function validateReleaseRequest(tag, ref, root = repositoryRoot) {
  const version = json(join(root, 'package.json')).version;
  assert.match(tag ?? '', /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, 'Provide a version release tag');
  assert.equal(tag, `v${version}`, 'Release tag does not match this checkout');
  assert.equal(ref, `refs/tags/${tag}`, 'Select the release tag as the workflow ref, not a branch');
  return version;
}

/** Checksums cover metadata as well as archives. Never accept duplicate or unsafe names. */
export function releaseChecksums(directory) {
  const result = new Map();
  for (const line of readFileSync(join(directory, 'SHA256SUMS'), 'utf8').trim().split(/\r?\n/)) {
    const entry = /^([a-f0-9]{64})  ([A-Za-z0-9][A-Za-z0-9._-]*)$/.exec(line);
    assert.ok(entry, 'Invalid release checksum entry');
    assert.ok(!result.has(entry[2]), `Duplicate release checksum: ${entry[2]}`);
    result.set(entry[2], entry[1]);
  }
  return result;
}

function verifiedFile(directory, name, checksums) {
  assert.match(name, /^[A-Za-z0-9][A-Za-z0-9._-]*$/, 'Unsafe artifact filename');
  const file = resolve(directory, name), contents = readFileSync(file);
  assert.equal(hash(contents), checksums.get(name), `Release checksum mismatch: ${name}`);
  return { file, contents };
}

export function verifyNpmRelease(directory, root = repositoryRoot) {
  const version = json(join(root, 'package.json')).version, checksums = releaseChecksums(directory);
  const metadata = verifiedFile(directory, 'packages.json', checksums);
  const packages = JSON.parse(metadata.contents);
  assert.ok(Array.isArray(packages) && packages.length === packageOrder.length, 'Expected exactly four packages');
  return packageOrder.map(directoryName => {
    const expected = json(join(root, 'packages', directoryName, 'package.json'));
    assert.equal(expected.version, version, 'Source manifests must have matching versions');
    const matches = packages.filter(pkg => pkg.directory === directoryName);
    assert.equal(matches.length, 1, `Missing or duplicate ${directoryName} package`);
    const pkg = matches[0];
    assert.equal(pkg.name, expected.name); assert.equal(pkg.version, version);
    assert.equal(pkg.filename, `greenpandastudios-aug-${directoryName}-${version}.tgz`);
    const { file, contents } = verifiedFile(directory, pkg.filename, checksums);
    assert.equal(hash(contents), pkg.sha256, 'Package metadata checksum mismatch');
    const integrity = 'sha512-' + hash(contents, 'sha512', 'base64');
    assert.equal(integrity, pkg.integrity, 'Package integrity mismatch');
    const extracted = spawnSync('tar', ['-xOf', file, 'package/package.json'], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
    assert.equal(extracted.status, 0, 'Cannot read package manifest');
    assert.deepEqual(JSON.parse(extracted.stdout), expected, `Archive manifest differs from canonical ${directoryName} manifest`);
    return { ...pkg, file, integrity };
  });
}

/** Read entries without extracting paths or executing archive contents. */
export function vsixEntries(file) {
  const listing = spawnSync('unzip', ['-Z1', file], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
  assert.equal(listing.status, 0, 'Cannot read VSIX entries');
  const result = new Map();
  for (const name of listing.stdout.trim().split(/\r?\n/)) {
    assert.ok(name && !name.startsWith('/') && !name.includes('\\') && !name.split('/').includes('..'), 'Unsafe VSIX entry');
    assert.ok(!result.has(name), `Duplicate VSIX entry: ${name}`);
    const entry = spawnSync('unzip', ['-p', file, name.replace(/([*?\[\]])/g, '\\$1')], { maxBuffer: 32 * 1024 * 1024 });
    assert.equal(entry.status, 0, `Cannot read VSIX entry: ${name}`);
    result.set(name, entry.stdout);
  }
  return result;
}

export function verifyExtensionRelease(directory, root = repositoryRoot) {
  const expected = json(join(root, 'vscode/package.json'));
  assert.equal(expected.version, json(join(root, 'package.json')).version);
  const artifact = verifiedFile(directory, `${expected.name}-${expected.version}.vsix`, releaseChecksums(directory));
  const entries = vsixEntries(artifact.file);
  assert.ok(entries.has('extension/package.json') && entries.has('extension.vsixmanifest'), 'Incomplete VSIX');
  assert.deepEqual(JSON.parse(entries.get('extension/package.json')), expected, 'VSIX manifest differs from canonical extension manifest');
  assert.ok(entries.has(`extension/${expected.icon}`), 'VSIX is missing its logo');
  assert.ok(entries.has('extension/compiler/bin/aug.mjs'), 'VSIX is missing its compiler');
  return { file: artifact.file, entries, name: expected.name, publisher: expected.publisher, version: expected.version };
}

/** Marketplace may add signatures; every shipped extension file must still match. */
export function extensionMatches(expected, actual) {
  const contents = entries => new Map([...entries].filter(([name]) => name.startsWith('extension/') && !name.endsWith('/'))
    .map(([name, bytes]) => [name, hash(bytes)]));
  const wanted = contents(expected), published = contents(actual);
  const changed = [...new Set([...wanted.keys(), ...published.keys()])].filter(name => wanted.get(name) !== published.get(name)).sort();
  assert.equal(changed.length, 0, `Published extension differs from the reviewed VSIX; cannot skip this version. Changed files: ${changed.slice(0, 5).join(', ')}${changed.length > 5 ? ` (and ${changed.length - 5} more)` : ''}`);
  return true;
}
