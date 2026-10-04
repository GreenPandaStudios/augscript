#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { verifyNpmRelease, verifyExtensionRelease, vsixEntries, verifyBundledCompiler } from './release-publication.mjs';
import { extensionReleaseSource } from './extension-release-source.mjs';

const root = resolve(import.meta.dirname, '..');
const source = extensionReleaseSource(process.env.RELEASE_TAG ?? '', process.env.RELEASE_COMMIT ?? '');
const directory = resolve(process.argv[2] ?? '.aug-build/extension-compiler');
const packages = verifyNpmRelease(directory), cli = packages.find(pkg => pkg.directory === 'cli'), stdlib = packages.find(pkg=>pkg.directory==='stdlib');
if (process.argv.includes('--compiler')) {
  process.stdout.write('AUG_EXTENSION_COMPILER_ARCHIVE=' + cli.file + '\nAUG_EXTENSION_STDLIB_ARCHIVE=' + stdlib.file + '\n');
} else {
  const output = join(root, 'dist/extension-release'); mkdirSync(output, { recursive: true });
  const name = 'augscript-' + source.version + '.vsix';
  copyFileSync(join(root, 'vscode', name), join(output, name));
  const entries = vsixEntries(join(output, name));
  verifyBundledCompiler(entries, cli.file, {stdlibArchive:stdlib.file,dependencyRoot:join(root,'node_modules')});
  // The published compiler supplies this catalog; source metadata cannot replace it.
  const catalog = entries.get('extension/compiler/native/compiler-packs.json');
  assert.ok(catalog, 'Missing released compiler catalog');
  const report = { schema: 1, ...source, compilerPackage: { name: cli.name, version: cli.version, sha256: cli.sha256,
    integrity: cli.integrity }, stdlibPackage: {name:stdlib.name,version:stdlib.version,sha256:stdlib.sha256,integrity:stdlib.integrity}, javascriptDependencies: Object.fromEntries(['tar','chownr','yallist','minipass','minizlib','@isaacs/fs-minipass'].map(name=>[name,JSON.parse(readFileSync(join(root,'package-lock.json'),'utf8')).packages['node_modules/'+name]])), vsix: { filename: name, sha256: createHash('sha256').update(readFileSync(join(output, name))).digest('hex') } };
  writeFileSync(join(output, 'extension-release.json'), JSON.stringify(report, null, 2) + '\n');
  const names = [name, 'extension-release.json'];
  writeFileSync(join(output, 'SHA256SUMS'), names.map(file => createHash('sha256').update(readFileSync(join(output, file))).digest('hex') + '  ' + file).join('\n') + '\n');
  verifyExtensionRelease(output);
  process.stdout.write('Prepared extension ' + source.version + ' with released compiler ' + source.compiler + '\n');
}
