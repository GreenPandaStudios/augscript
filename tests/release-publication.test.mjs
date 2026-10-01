import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { packageOrder, repositoryRoot, releaseChecksums, validateReleaseRequest, verifyNpmRelease,
  verifyExtensionRelease, vsixEntries, extensionMatches } from '../scripts/release-publication.mjs';
import { registryMatches, publishPackages } from '../scripts/publish-release.mjs';
import { publishedExtensionMatches, publishExtension } from '../scripts/publish-extension.mjs';
import { projectArchive } from '../scripts/doc-downloads.mjs';
import { downloadRelease } from '../scripts/download-release.mjs';

const digest = (bytes, algorithm = 'sha256', format = 'hex') => createHash(algorithm).update(bytes).digest(format);
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const result = (status, value) => ({ status, stdout: JSON.stringify(value), stderr: '' });
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'aug-publication-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function checksums(root, files) {
  writeFileSync(join(root, 'SHA256SUMS'), files.map(file => `${digest(readFileSync(join(root, file)))}  ${file}`).join('\n') + '\n');
}
function npmFixture(t) {
  const root = fixture(t), packages = [];
  for (const name of packageOrder) {
    const manifest = read(join(repositoryRoot, 'packages', name, 'package.json'));
    const staged = join(root, name); mkdirSync(join(staged, 'package'), { recursive: true });
    writeFileSync(join(staged, 'package/package.json'), JSON.stringify(manifest));
    const filename = `greenpandastudios-aug-${name}-${manifest.version}.tgz`;
    assert.equal(spawnSync('tar', ['-czf', join(root, filename), '-C', staged, 'package']).status, 0);
    const bytes = readFileSync(join(root, filename));
    packages.push({ directory: name, name: manifest.name, version: manifest.version, filename,
      sha256: digest(bytes), integrity: 'sha512-' + digest(bytes, 'sha512', 'base64') });
  }
  writeFileSync(join(root, 'packages.json'), JSON.stringify(packages));
  const files = ['packages.json', ...packages.map(pkg => pkg.filename)]; checksums(root, files);
  return { root, packages, files };
}
function vsixFixture(t, transform = entries => entries) {
  const root = fixture(t), staged = join(root, 'staged'); mkdirSync(staged);
  const manifest = read(join(repositoryRoot, 'vscode/package.json'));
  const entries = transform(new Map([
    ['extension/package.json', Buffer.from(JSON.stringify(manifest))],
    ['extension.vsixmanifest', Buffer.from('<PackageManifest/>')],
    [`extension/${manifest.icon}`, Buffer.from('logo')],
    ['extension/compiler/bin/aug.mjs', Buffer.from('compiler')],
    ['extension/README.md', Buffer.from('Extension help')],
    ['[Content_Types].xml', Buffer.from('<Types/>')],
  ]));
  const name = `${manifest.name}-${manifest.version}.vsix`, file = join(root, name);
  writeFileSync(file, projectArchive(entries));
  checksums(root, [name]); return { root, file, entries };
}

test('release requests reject branches, mismatched versions and invalid tag inputs', () => {
  const version = read(join(repositoryRoot, 'package.json')).version, tag = `v${version}`;
  assert.equal(validateReleaseRequest(tag, `refs/tags/${tag}`), version);
  for (const [input, ref] of [[tag, 'refs/heads/main'], ['v0.0.1', 'refs/tags/v0.0.1'], ['--delete', 'refs/tags/--delete']])
    assert.throws(() => validateReleaseRequest(input, ref));
});

test('download gates reject drafts, moved tags and other repositories before fetching assets', t => {
  const tag = 'v' + read(join(repositoryRoot, 'package.json')).version;
  const request = { kind: 'npm', directory: fixture(t), tag, ref: `refs/tags/${tag}`, repository: 'GreenPandaStudios/augscript', sha: 'a'.repeat(40) };
  for (const failure of ['draft', 'moved', 'repository', 'branch', 'service']) {
    const calls = [], candidate = { ...request };
    if (failure === 'repository') candidate.repository = 'other/augscript';
    if (failure === 'branch') candidate.ref = 'refs/heads/main';
    const run = (command, args) => {
      calls.push(args);
      if (failure === 'service') return { status: 1, stderr: 'service failure' };
      if (args[0] === 'api') return result(0, { object: { type: 'commit', sha: 'b'.repeat(40) } });
      return result(0, { tagName: tag, isDraft: failure === 'draft' });
    };
    assert.throws(() => downloadRelease(candidate, run), undefined, failure);
    assert(!calls.some(args => args[1] === 'download'));
  }
});

test('downloads resolve annotated tags and select reviewed archives for each destination', t => {
  const tag = 'v' + read(join(repositoryRoot, 'package.json')).version, sha = 'a'.repeat(40);
  for (const kind of ['npm', 'extension']) {
    const calls = [], run = (command, args) => {
      calls.push(args);
      if (args[0] === 'api') return result(0, { object: args[1].includes('/git/ref/') ? { type: 'tag', sha: 'b'.repeat(40) } : { type: 'commit', sha } });
      return result(0, { tagName: tag, isDraft: false, url: 'https://github.com/GreenPandaStudios/augscript/releases/tag/' + tag });
    };
    downloadRelease({ kind, directory: fixture(t), tag, ref: `refs/tags/${tag}`, repository: 'GreenPandaStudios/augscript', sha }, run);
    const download = calls.at(-1); assert.equal(download[1], 'download');
    assert(download.includes('SHA256SUMS')); assert(download.includes(kind === 'npm' ? 'packages.json' : `augscript-${tag.slice(1)}.vsix`));
  }
});

test('all npm artifacts and canonical manifests verify in dependency order', t => {
  const { root } = npmFixture(t); assert.deepEqual(verifyNpmRelease(root).map(pkg => pkg.directory), packageOrder);
});

test('release verification rejects tampered metadata, archives, integrity and manifests', t => {
  for (const kind of ['metadata', 'archive', 'integrity', 'manifest', 'path', 'duplicate']) {
    const { root, packages, files } = npmFixture(t);
    if (kind === 'archive') writeFileSync(join(root, packages[3].filename), 'tampered archive');
    else if (kind === 'manifest') {
      const staged = join(root, 'cli/package/package.json');
      writeFileSync(staged, JSON.stringify({ ...read(staged), scripts: { prepublishOnly: 'unreviewed command' } }));
      spawnSync('tar', ['-czf', join(root, packages[3].filename), '-C', join(root, 'cli'), 'package']);
      const bytes = readFileSync(join(root, packages[3].filename));
      packages[3].sha256 = digest(bytes); packages[3].integrity = 'sha512-' + digest(bytes, 'sha512', 'base64');
    } else if (kind === 'path') packages[0].filename = '../outside.tgz';
    else if (kind === 'duplicate') packages[1] = packages[0];
    else packages[0].integrity = 'sha512-wrong';
    writeFileSync(join(root, 'packages.json'), JSON.stringify(packages));
    if (kind !== 'metadata' && kind !== 'archive') checksums(root, files);
    assert.throws(() => verifyNpmRelease(root), undefined, kind);
  }
});

test('checksums reject duplicate entries and traversal', t => {
  const root = fixture(t), sum = '0'.repeat(64);
  for (const text of [`${sum}  packages.json\n${sum}  packages.json\n`, `${sum}  ../outside\n`]) {
    writeFileSync(join(root, 'SHA256SUMS'), text); assert.throws(() => releaseChecksums(root));
  }
});

test('registry retries skip identical versions and reject mismatches and service failures', () => {
  assert.equal(registryMatches(result(0, 'sha512-same'), 'sha512-same'), true);
  assert.equal(registryMatches(result(1, { error: { code: 'E404' } }), 'sha512-same'), false);
  assert.throws(() => registryMatches(result(0, 'sha512-other'), 'sha512-same'), /differs/);
  for (const code of ['E401', 'E403', 'E500', 'ETIMEDOUT'])
    assert.throws(() => registryMatches(result(1, { error: { code } }), 'sha512-same'), /lookup failed/);
});

test('npm preflights every package before writes and resumes a partial publication', async t => {
  const { root } = npmFixture(t), packages = verifyNpmRelease(root), published = new Map([[packages[0].name, packages[0].integrity]]), calls = [];
  const run = (command, args) => {
    calls.push(args);
    if (args[0] === 'view') {
      const name = args[1].slice(0, args[1].lastIndexOf('@'));
      return published.has(name) ? result(0, published.get(name)) : result(1, { error: { code: 'E404' } });
    }
    const pkg = packages.find(pkg => pkg.file === args[1]); published.set(pkg.name, pkg.integrity); return { status: 0 };
  };
  await publishPackages(packages, run, () => {});
  assert(calls.slice(0, 4).every(args => args[0] === 'view'));
  assert.deepEqual(calls.filter(args => args[0] === 'publish').map(args => args[1]), packages.slice(1).map(pkg => pkg.file));
  assert(calls.filter(args => args[0] === 'publish').every(args => args.includes('--ignore-scripts') && args.includes('next')));
  calls.length = 0; await publishPackages(packages, run, () => {}); assert.equal(calls.length, 4);
  published.set(packages[3].name, 'sha512-unreviewed'); calls.length = 0;
  await assert.rejects(publishPackages(packages, run, () => {}), /differs/);
  assert(!calls.some(args => args[0] === 'publish'));
});

test('npm stops on publication failure and never publishes the CLI before its libraries', async t => {
  const { root } = npmFixture(t), calls = [], packages = verifyNpmRelease(root);
  const run = (command, args) => {
    calls.push(args);
    return args[0] === 'view' ? result(1, { error: { code: 'E404' } }) : { status: 1 };
  };
  await assert.rejects(publishPackages(packages, run, () => {}), /Publication failed/);
  assert.deepEqual(calls.filter(args => args[0] === 'publish').map(args => args[1]), [packages[0].file]);
});

test('npm waits for public visibility without uploading a package twice or advancing early', async t => {
  const { root } = npmFixture(t), packages = verifyNpmRelease(root), uploaded = [], probes = new Map(), pauses = [], messages = [];
  const run = (command, args) => {
    if (args[0] === 'publish') {
      const pkg = packages.find(pkg => pkg.file === args[1]);
      assert(uploaded.every(previous => probes.get(previous.name) >= 3));
      uploaded.push(pkg); return { status: 0 };
    }
    const pkg = packages.find(pkg => `${pkg.name}@${pkg.version}` === args[1]);
    if (!uploaded.includes(pkg)) return result(1, { error: { code: 'E404' } });
    const count = (probes.get(pkg.name) ?? 0) + 1; probes.set(pkg.name, count);
    return count >= 3 ? result(0, pkg.integrity) : result(1, { error: { code: 'E404' } });
  };
  await publishPackages(packages, run, text => messages.push(text), { pause: async ms => { pauses.push(ms); } });
  assert.deepEqual(uploaded, packages);
  assert.deepEqual(pauses, Array(8).fill(5000));
  assert.equal(messages.filter(text => text.startsWith('Upload accepted:')).length, 4);
});

test('npm visibility waits remain bounded and stop before publishing later packages', async t => {
  const { root } = npmFixture(t), packages = verifyNpmRelease(root), uploads = []; let pauses = 0;
  const run = (command, args) => {
    if (args[0] === 'publish') { uploads.push(args[1]); return { status: 0 }; }
    return result(1, { error: { code: 'E404' } });
  };
  await assert.rejects(publishPackages(packages, run, () => {}, { pause: async () => { pauses++; } }), /bounded visibility wait/);
  assert.equal(pauses, 60);
  assert.deepEqual(uploads, [packages[0].file]);
});

test('npm never retries service errors or mismatched integrity during visibility confirmation', async t => {
  const { root } = npmFixture(t), packages = verifyNpmRelease(root);
  for (const failure of [result(0, 'sha512-unreviewed'), ...['E401', 'E403', 'E500', 'ETIMEDOUT'].map(code => result(1, { error: { code } }))]) {
    const uploads = []; let pauses = 0;
    const run = (command, args) => {
      if (args[0] === 'publish') { uploads.push(args[1]); return { status: 0 }; }
      return uploads.length ? failure : result(1, { error: { code: 'E404' } });
    };
    await assert.rejects(publishPackages(packages, run, () => {}, { pause: async () => { pauses++; } }), /differs|lookup failed/);
    assert.equal(pauses, 0);
    assert.deepEqual(uploads, [packages[0].file]);
  }
});

test('VSIX verification checks complete identity, artwork and bundled compiler', t => {
  const fixture = vsixFixture(t); assert.equal(verifyExtensionRelease(fixture.root).publisher, 'augscript');
  for (const transform of [
    entries => { entries.delete('extension/compiler/bin/aug.mjs'); return entries; },
    entries => { entries.delete('extension/media/augscript.png'); return entries; },
    entries => { const manifest = JSON.parse(entries.get('extension/package.json')); manifest.publisher = 'other'; entries.set('extension/package.json', Buffer.from(JSON.stringify(manifest))); return entries; },
  ]) assert.throws(() => verifyExtensionRelease(vsixFixture(t, transform).root));
  writeFileSync(fixture.file, 'tampered'); assert.throws(() => verifyExtensionRelease(fixture.root), /checksum/);
});

test('Marketplace retries compare extension contents while permitting service signatures', t => {
  const { entries, file } = vsixFixture(t), actual = vsixEntries(file);
  actual.set('extension.signature.p7s', Buffer.from('service signature'));
  assert.equal(extensionMatches(entries, actual), true);
  for (const change of ['modify', 'remove', 'add']) {
    const mismatch = new Map(actual);
    if (change === 'modify') mismatch.set('extension/compiler/bin/aug.mjs', Buffer.from('different compiler'));
    if (change === 'remove') mismatch.delete('extension/README.md');
    if (change === 'add') mismatch.set('extension/unreviewed.js', Buffer.from('extra file'));
    assert.throws(() => extensionMatches(entries, mismatch), /differs/);
  }
});

test('Marketplace lookups distinguish a missing version from service errors', async t => {
  const { root, file } = vsixFixture(t), extension = verifyExtensionRelease(root);
  assert.equal(await publishedExtensionMatches(extension, async () => ({ status: 404 })), false);
  assert.equal(await publishedExtensionMatches(extension, async () => ({ status: 200, arrayBuffer: async () => readFileSync(file) })), true);
  for (const status of [401, 403, 429, 500])
    await assert.rejects(publishedExtensionMatches(extension, async () => ({ status })), /lookup failed/);
});

test('extension publishing delegates the verified VSIX with OIDC and rechecks publication', async t => {
  const { root } = vsixFixture(t), extension = verifyExtensionRelease(root), calls = []; let seen = false;
  const options = { matches: async () => seen, run: (command, args) => { calls.push(args); seen = true; return { status: 0 }; } };
  assert.equal(await publishExtension(extension, options), 'published and verified');
  assert(calls[0].includes('--oidc')); assert(calls[0].includes(extension.file)); assert(!calls[0].includes('--skip-duplicate'));
  assert.equal(await publishExtension(extension, options), 'already published'); assert.equal(calls.length, 1);
  await assert.rejects(publishExtension(extension, { matches: async () => false, run: () => ({ status: 1 }) }), /publication failed/);
  await assert.rejects(publishExtension(extension, { matches: async () => false, run: () => ({ status: 0 }), pause: async () => {} }), /not confirmed/);
  let probes = 0, pauses = 0;
  assert.equal(await publishExtension(extension, { matches: async () => ++probes >= 4, run: () => ({ status: 0 }),
    pause: async () => { pauses++; } }), 'published and verified');
  assert.equal(pauses, 2);
});
