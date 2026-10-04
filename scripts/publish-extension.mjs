#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { extensionMatches, repositoryRoot, verifyExtensionRelease, vsixEntries } from './release-publication.mjs';

export async function publishedExtensionMatches(extension, fetcher = fetch) {
  const url = `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${encodeURIComponent(extension.publisher)}/vsextensions/${encodeURIComponent(extension.name)}/${encodeURIComponent(extension.version)}/vspackage`;
  const response = await fetcher(url, { signal: AbortSignal.timeout(60_000) });
  if (response.status === 404) return false;
  assert.equal(response.status, 200, 'Marketplace lookup failed; resolve the service error before retrying');
  const directory = mkdtempSync(join(tmpdir(), 'aug-marketplace-'));
  try {
    const file = join(directory, 'published.vsix');
    writeFileSync(file, Buffer.from(await response.arrayBuffer()));
    return extensionMatches(extension.entries, vsixEntries(file));
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

export async function publishExtension(extension, { matches = publishedExtensionMatches, run = spawnSync, pause = wait } = {}) {
  if (await matches(extension)) return 'already published';
  const vsce = join(repositoryRoot, 'vscode/node_modules/@vscode/vsce/vsce');
  const result = run(process.execPath, [vsce, 'publish', '--packagePath', extension.file, '--oidc'], { stdio: 'inherit' });
  assert.equal(result.status, 0, 'Marketplace publication failed; check the augscript trusted policy for publish-extension.yml / marketplace');
  for (let attempt = 0; attempt < 12; attempt++) {
    if (await matches(extension)) return 'published and verified';
    if (attempt < 11) await pause(5000);
  }
  throw new Error('Marketplace has not confirmed the VSIX; retry after it becomes available');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const extension = verifyExtensionRelease(resolve(process.argv[2] ?? 'release'));
    const status = process.argv.includes('--verify-only') ? 'verified' : await publishExtension(extension);
    process.stdout.write(`${extension.publisher}.${extension.name}@${extension.version}: ${status}\n`);
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
