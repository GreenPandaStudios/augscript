import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
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

/** Editor patches have their own tags and retain an explicit compiler pin. */
export function validateExtensionReleaseRequest(tag, ref, root = repositoryRoot) {
  const editor = json(join(root, 'vscode/package.json'));
  assert.equal(editor.augustCompilerVersion, json(join(root, 'package.json')).version, 'Extension compiler pin mismatch');
  assert.ok(tag === 'extension-v' + editor.version || tag === 'v' + editor.augustCompilerVersion, 'Release tag does not match this extension or compiler');
  assert.equal(ref, 'refs/tags/' + tag, 'Select the release tag as the workflow ref, not a branch');
  return editor.version;
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

/** Check pins in the archives consumers install, independently of build staging. */
export function verifyLLVMCompilerPins(directory, expected, extensionVersion = json(join(repositoryRoot, 'vscode/package.json')).version) {
  const pin=JSON.parse(expected),packages=json(join(directory,'packages.json'));
  const cli=packages.find(pkg=>pkg.directory==='cli');
  assert.ok(cli,'Missing CLI archive');assert.match(cli.filename,/^[A-Za-z0-9][A-Za-z0-9._-]*$/);
  const archive=spawnSync('tar',['-xOf',join(directory,cli.filename),'package/native/compiler-packs.json'],{encoding:'utf8',maxBuffer:1024*1024});
  assert.equal(archive.status,0,'Packaged CLI is missing its compiler-owned LLVM manifest');
  assert.equal(archive.stdout,expected,'Packaged CLI has a different LLVM artifact pin');
  const editor=spawnSync('unzip',['-p',join(directory,`augscript-${extensionVersion}.vsix`),'extension/compiler/native/compiler-packs.json'],{encoding:'utf8',maxBuffer:1024*1024});
  assert.equal(editor.status,0,'Packaged extension is missing its compiler-owned LLVM manifest');
  assert.equal(editor.stdout,expected,'Packaged extension has a different LLVM artifact pin');
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
  assert.equal(expected.augustCompilerVersion, json(join(root, 'package.json')).version, 'Extension compiler pin mismatch');
  const artifact = verifiedFile(directory, `${expected.name}-${expected.version}.vsix`, releaseChecksums(directory));
  const entries = vsixEntries(artifact.file);
  assert.ok(entries.has('extension/package.json') && entries.has('extension.vsixmanifest'), 'Incomplete VSIX');
  assert.deepEqual(JSON.parse(entries.get('extension/package.json')), expected, 'VSIX manifest differs from canonical extension manifest');
  assert.ok(entries.has(`extension/${expected.icon}`), 'VSIX is missing its logo');
  assert.ok(entries.has('extension/compiler/bin/aug.mjs'), 'VSIX is missing its compiler');
  const compiler = JSON.parse(entries.get('extension/compiler/package.json') ?? 'null');
  assert.equal(compiler?.version, expected.augustCompilerVersion, 'Bundled compiler version mismatch');
  const catalog = entries.get('extension/compiler/native/compiler-packs.json');
  assert.ok(catalog, 'VSIX is missing compiler artifact pins');
  assert.equal(JSON.parse(catalog).compiler, expected.augustCompilerVersion, 'Bundled LLVM compiler version mismatch');
  assert.equal(catalog.toString(), readFileSync(join(root, 'native/compiler-packs.json'), 'utf8'), 'Bundled LLVM artifact pins differ from the reviewed catalog');
  return { file: artifact.file, entries, name: expected.name, publisher: expected.publisher, version: expected.version, compilerVersion: expected.augustCompilerVersion };
}

/** An editor-only release ships exactly the public compiler archive, with no extra compiler files. */
export function verifyBundledCompiler(entries, archive, {stdlibArchive, dependencyRoot} = {}) {
  const listing = spawnSync('tar', ['-tzf', archive], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
  assert.equal(listing.status, 0, 'Cannot read released compiler archive');
  const expected = new Map();
  for (const name of listing.stdout.trim().split(/\r?\n/)) {
    assert.ok(name.startsWith('package/') && !name.includes('\\') && !name.split('/').includes('..'), 'Unsafe compiler archive path');
    if (name.endsWith('/')) continue;
    const key = 'extension/compiler/' + name.slice('package/'.length);
    assert.ok(!expected.has(key), 'Duplicate compiler archive file');
    const file = spawnSync('tar', ['-xOf', archive, name], { maxBuffer: 32 * 1024 * 1024 });
    assert.equal(file.status, 0, 'Cannot read compiler file: ' + name);
    expected.set(key, hash(file.stdout));
  }
  if (stdlibArchive) {
    const stdlib = spawnSync('tar', ['-tzf', stdlibArchive], {encoding:'utf8'});
    assert.equal(stdlib.status, 0);
    for (const name of stdlib.stdout.trim().split(/\r?\n/)) {
      assert.ok(name.startsWith('package/') && !name.split('/').includes('..') && !name.includes('\\'));
      if (name.endsWith('/')) continue;
      const file = spawnSync('tar',['-xOf',stdlibArchive,name],{maxBuffer:32*1024*1024});
      assert.equal(file.status,0);
      expected.set('extension/compiler/node_modules/@greenpandastudios/aug-stdlib/' + name.slice(8), hash(file.stdout));
    }
  }
  if (dependencyRoot) {
    const visit = (directory, prefix) => {
      for (const entry of readdirSync(directory,{withFileTypes:true})) {
        const file=join(directory,entry.name), name=prefix+'/'+entry.name;
        if(entry.isDirectory()) visit(file,name);
        else { assert.ok(entry.isFile(),'Nonregular compiler dependency file'); expected.set(name,hash(readFileSync(file))); }
      }
    };
    for(const name of ['tar','chownr','yallist','minipass','minizlib','@isaacs/fs-minipass'])
      visit(join(dependencyRoot,name),'extension/compiler/node_modules/'+name);
  }
  const actual = new Map([...entries].filter(([name]) => name.startsWith('extension/compiler/') && !name.endsWith('/'))
    .map(([name, bytes]) => [name, hash(bytes)]));
  assert.deepEqual(actual, expected, 'Bundled compiler differs from the verified public CLI archive');
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
