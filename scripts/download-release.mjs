#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { validateReleaseRequest, validateExtensionReleaseRequest } from './release-publication.mjs';

export function downloadRelease({ kind, directory, tag, ref, repository, sha }, runner = spawnSync) {
  assert.ok(['npm', 'extension'].includes(kind), 'Choose npm or extension artifacts');
  const version = (kind === 'extension' ? validateExtensionReleaseRequest : validateReleaseRequest)(tag, ref), repo = 'GreenPandaStudios/augscript';
  assert.equal(repository, repo, 'Publishing is restricted to the canonical repository');
  const run = args => {
    const result = runner('gh', args, { encoding: 'utf8' });
    assert.equal(result.status, 0, `GitHub release command failed: ${result.stderr}`);
    return result.stdout;
  };
  const release = JSON.parse(run(['release', 'view', tag, '--repo', repo, '--json', 'tagName,isDraft,url']));
  assert.equal(release.tagName, tag); assert.equal(release.isDraft, false, 'Review and publish the GitHub release first');
  let object = JSON.parse(run(['api', `repos/${repo}/git/ref/tags/${tag}`])).object;
  for (let depth = 0; object?.type === 'tag' && depth < 8; depth++)
    object = JSON.parse(run(['api', `repos/${repo}/git/tags/${object.sha}`])).object;
  assert.equal(object?.type, 'commit', 'Release tag must resolve to a commit');
  assert.equal(object.sha, sha, 'Release tag moved since this workflow began; use a fresh verified release');
  mkdirSync(resolve(directory), { recursive: true });
  run(['release', 'download', tag, '--repo', repo, '--pattern', 'SHA256SUMS',
    ...(kind === 'npm' ? ['--pattern', '*.tgz', '--pattern', 'packages.json'] : ['--pattern', `augscript-${version}.vsix`]),
    '--dir', resolve(directory)]);
  return release.url;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [kind, directory = 'release'] = process.argv.slice(2);
    const url = downloadRelease({ kind, directory, tag: process.env.RELEASE_TAG, ref: process.env.GITHUB_REF,
      repository: process.env.GITHUB_REPOSITORY, sha: process.env.GITHUB_SHA });
    process.stdout.write(`Downloaded ${kind} artifacts from ${url}\n`);
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
