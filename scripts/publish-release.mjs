#!/usr/bin/env node
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { verifyNpmRelease } from './release-publication.mjs';

/** Registry failures must not be mistaken for an unpublished version. */
export function registryMatches(result, integrity) {
  const response = JSON.parse(result.stdout || '{}');
  if (result.status === 0) {
    assert.equal(response, integrity, 'Published version differs from the reviewed archive; cannot skip this version');
    return true;
  }
  assert.equal(response.error?.code, 'E404', 'Registry lookup failed; retry after resolving the registry error');
  return false;
}

export async function publishPackages(packages, run = spawnSync, log = text => process.stdout.write(text + '\n'), { pause = wait } = {}) {
  // Preflight every existing version before publishing any package.
  const existing = packages.map(pkg => registryMatches(run('npm', ['view', `${pkg.name}@${pkg.version}`, 'dist.integrity',
    '--json', '--registry=https://registry.npmjs.org'], { encoding: 'utf8' }), pkg.integrity));
  for (const [index, pkg] of packages.entries()) {
    if (existing[index]) { log(`Already published: ${pkg.name}@${pkg.version}`); continue; }
    const result = run('npm', ['publish', pkg.file, '--access', 'public', '--tag', 'next', '--ignore-scripts',
      '--registry=https://registry.npmjs.org'], { stdio: 'inherit' });
    assert.equal(result.status, 0, `Publication failed for ${pkg.name}; check its npm trusted publisher for publish-npm.yml / npm`);
    // npm can accept an upload several minutes before its public metadata is visible.
    // Only a missing version is retried; other errors and integrity mismatches still stop publication.
    let confirmed = false;
    for (let attempt = 0; attempt < 61; attempt++) {
      const response = run('npm', ['view', `${pkg.name}@${pkg.version}`, 'dist.integrity', '--json', '--registry=https://registry.npmjs.org'], { encoding: 'utf8' });
      if (registryMatches(response, pkg.integrity)) { confirmed = true; break; }
      if (attempt === 0) log(`Upload accepted: waiting for ${pkg.name}@${pkg.version} to become publicly available`);
      if (attempt < 60) await pause(5000);
    }
    assert.equal(confirmed, true, `Registry has not confirmed ${pkg.name} after the bounded visibility wait; wait for npm processing, then retry the same release`);
    log(`Published and verified: ${pkg.name}@${pkg.version}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const packages = verifyNpmRelease(resolve(process.argv[2] ?? 'release'));
    if (process.argv.includes('--verify-only')) process.stdout.write('All four npm release archives verified.\n');
    else await publishPackages(packages);
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
