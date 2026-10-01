#!/usr/bin/env node
import { chmodSync, cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const output = join(root, 'dist', 'packages');
const run = (args) => {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Package preparation failed: ${args.join(' ')}`);
};
run(['scripts/version.mjs', '--check']);
run(['scripts/generate-docs.mjs', '--check']);
run(['node_modules/typescript/bin/tsc', '-p', 'tsconfig.build.json']);
rmSync(output, { recursive: true, force: true });
const copy = (source, destination) => {
  const from = join(root, source);
  cpSync(from, destination, { recursive: true,
    filter: file => !relative(from, file).split(/[\\/]/).some(part => part.startsWith('.') && part!=='.aug-spec' || part === 'node_modules') });
};
const libraryTargets = new Map(['io','json','memory','time','web','crypto'].map(module =>
  [module, join(output,['web','crypto'].includes(module)?module:'stdlib','august',module)]));
const publishedRoots = new Map(['stdlib','web','crypto','cli'].map(name=>[
  join(output,name),join(output,JSON.parse(readFileSync(join(root,'packages',name,'package.json'),'utf8')).name.split('/').at(-1))]));
const publishedPath = file => {
  for(const [staged,published] of publishedRoots)if(file===staged||file.startsWith(staged+'/'))return join(published,relative(staged,file));
  return file;
};
for (const name of ['stdlib', 'web', 'crypto', 'cli']) {
  const target = join(output, name);
  mkdirSync(target, { recursive: true });
  for (const file of ['package.json', 'README.md']) copy(`packages/${name}/${file}`, join(target, file));
  copy('LICENSE', join(target, 'LICENSE'));
  if (name === 'cli') {
    cpSync(join(root, '.aug-build/compiler-js'), join(target, 'src'), { recursive: true });
    mkdirSync(join(target, 'bin'));
    writeFileSync(join(target, 'bin/aug.mjs'), readFileSync(join(root, 'bin/aug.mjs'), 'utf8').replace('../src/cli.ts', '../src/cli.js'));
    chmodSync(join(target, 'bin/aug.mjs'), 0o755);
    for (const directory of ['runtime', 'docs', 'examples']) copy(directory, join(target, directory));
    mkdirSync(join(target, 'scripts'));
    for (const file of ['bootstrap-native.mjs', 'native-home.mjs', 'native-setup.mjs', 'native-toolchain.mjs', 'native-dependencies.lock.json']) copy(`scripts/${file}`, join(target, 'scripts', file));
    chmodSync(join(target, 'scripts/bootstrap-native.mjs'), 0o755);
  } else {
    copy(`packages/${name}/aug-package.json`, join(target, 'aug-package.json'));
    const modules = name === 'stdlib' ? ['io'] : [name];
    for (const module of modules) {
      copy(`src/stdlib/${module}`, join(target, 'august', module));
      copy(`docs/api/${module}.md`, join(target, 'docs', `${module}.md`));
    }
    if (name === 'stdlib') copy('src/stdlib/export.aug', join(target, 'august/export.aug'));
    else for (const file of ['web.md', 'web-library-gaps.md']) copy(`docs/${file}`, join(target, 'docs', file));
  }
  if (name !== 'stdlib') copy('THIRD_PARTY_NOTICES.md', join(target, 'THIRD_PARTY_NOTICES.md'));
  process.stdout.write(`Prepared ${name}\n`);
}
// Preserve offline source/spec navigation when one source tree is split into npm packages.
const rewriteSpecs = (folder, originalFolder) => {
  for(const entry of readdirSync(folder,{withFileTypes:true})) {
    const file=join(folder,entry.name),original=join(originalFolder,entry.name);
    if(entry.isDirectory())rewriteSpecs(file,original);
    else if(entry.name.endsWith('.aug.md')) {
      const text=readFileSync(file,'utf8').replace(/\]\(([^)]+)\)/g,(match,href)=>{
        if(/^[a-z]+:/i.test(href))return match;
        const [path,anchor]=href.split('#'),target=resolve(dirname(original),decodeURIComponent(path));
        const libraryPath=relative(join(root,'src/stdlib'),target).split(/[\\/]/);
        const destination=libraryPath.length===1&&libraryPath[0].startsWith('export.aug')?join(output,'stdlib','august',libraryPath[0]):
          libraryTargets.has(libraryPath[0])?join(libraryTargets.get(libraryPath[0]),...libraryPath.slice(1)):undefined;
        if(!destination)return match;
        const link=relative(dirname(publishedPath(file)),publishedPath(destination)).split(/[\\/]/).map(encodeURIComponent).join('/');
        return `](${link}${anchor?'#'+anchor:''})`;
      });
      writeFileSync(file,text);
    }
  }
};
for(const module of ['web','crypto'])rewriteSpecs(libraryTargets.get(module),join(root,'src/stdlib',module));
rewriteSpecs(join(output,'stdlib','august'),join(root,'src/stdlib'));
