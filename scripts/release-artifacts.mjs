#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {verifyLLVMCompilerPins} from './release-publication.mjs';

const root = resolve(import.meta.dirname, '..');
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const extensionVersion = JSON.parse(readFileSync(join(root, 'vscode/package.json'), 'utf8')).version;
const output = join(root, 'dist/release');
const manifest=JSON.parse(readFileSync(join(root,'native/compiler-packs.json'),'utf8'));
let compilerPacks=0;
for(const pack of manifest.packs){
  const filename=new URL(pack.archive.url).pathname.split('/').at(-1);
  if(!/^aug-llvm-(macos-arm64|linux-x64|linux-arm64)\.tar\.gz$/.test(filename))throw new Error('Invalid compiler release asset name');
  const compilerPack=join(root,'.aug-build',filename);
  if(!existsSync(compilerPack)){
    if(process.env.AUG_RELEASE_NATIVE_REQUIRED==='1')throw new Error('Missing LLVM compiler pack: '+filename);
    continue;
  }
  if(manifest.compiler!==version||createHash('sha256').update(readFileSync(compilerPack)).digest('hex')!==pack.archive.sha256)throw new Error('LLVM release asset differs from the compiler-owned artifact pin: '+filename);
  copyFileSync(compilerPack,join(output,filename));compilerPacks++;
}
if(process.env.AUG_RELEASE_NATIVE_REQUIRED==='1'&&!compilerPacks)throw new Error('Missing compiler packs');
for (const path of ['dist/release/packages.json', `vscode/augscript-${extensionVersion}.vsix`, 'docs/.vitepress/dist/index.html',
  'docs/.vitepress/dist/third-party/NOTICE.txt', 'docs/.vitepress/dist/third-party/manifest.json',
  'docs/.vitepress/dist/third-party/Inter-OFL-1.1.txt'])
  if (!existsSync(join(root, path))) throw new Error(`Missing ${path}; build all packages, extension and docs first.`);
copyFileSync(join(root, `vscode/augscript-${extensionVersion}.vsix`), join(output, `augscript-${extensionVersion}.vsix`));
// Publishing a pack with one pin and a CLI/editor with another would make
// every cold LLVM installation fail. Check the shipped manifests, not just
// the contributor checkout used to assemble this release.
if(compilerPacks){
  const expected=readFileSync(join(root,'native/compiler-packs.json'),'utf8');
  verifyLLVMCompilerPins(output,expected);
}
// Retain the exact assembled catalog for verification from an immutable tag.
copyFileSync(join(root, 'native/compiler-packs.json'), join(output, 'compiler-packs.json'));
const archive = join(output, `augscript-docs-${version}.tar.gz`);
const site = join(root, 'dist/docs');
rmSync(site, {recursive: true, force: true});
mkdirSync(site, {recursive: true});
cpSync(join(root, 'docs/.vitepress/dist'), join(site, 'augscript'), {recursive: true});
writeFileSync(join(site, 'augscript/LOCAL_PREVIEW.txt'), 'Serve the parent directory of augscript/ with a static HTTP server, then open /augscript/. All documentation assets and search data are local. Source links require GitHub.\n');
const tar = spawnSync('tar', ['-czf', archive, '-C', site, 'augscript'], { encoding: 'utf8', env: {...process.env, COPYFILE_DISABLE: '1'} });
if (tar.status !== 0) throw new Error(tar.stderr);
const files = readdirSync(output).filter(file => file !== 'SHA256SUMS').sort();
writeFileSync(join(output, 'SHA256SUMS'), files.map(file =>
  `${createHash('sha256').update(readFileSync(join(output, file))).digest('hex')}  ${file}`).join('\n') + '\n');
process.stdout.write(`Release ${version}: ${files.length} artifacts plus SHA256SUMS\n`);
