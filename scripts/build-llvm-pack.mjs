#!/usr/bin/env node
// Explicit maintainer build. This packages official LLVM tools and a built runtime;
// it does not copy an Apple SDK, linker, or SDK stub into the distribution.
import {copyFileSync,existsSync,mkdirSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {c as createArchive} from 'tar';
const root=resolve(import.meta.dirname,'..'),version=JSON.parse(readFileSync(join(root,'package.json'))).version;
const llvm=resolve(process.argv[2]??join(root,'.aug-build/llvm-tools'));
const runtime=resolve(process.argv[3]??join(root,'.aug-native/llvm/runtime'));
const directory=join(root,'.aug-build/compiler-pack'),output=join(root,'.aug-build/aug-llvm-macos-arm64.tar.gz');
const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const pins={llc:'7a9ff3ffea3ed5f3e4c2e6603b5792446702cfcb46d978e80bc6cd1678f192eb',lld:'87de299f2482f07991579207d3673694f5e152cfcd41e9c8c7c864fc91d1398e',opt:'c171130f261590f9fa30f015d8a2bb161216eadae13c0d9b114c93685bc64a09',dsymutil:'f715be35dd492c435f8a064cac7ca9c69f11e00139bcb2c3aca586e1036240cc'};
rmSync(directory,{recursive:true,force:true});for(const path of ['bin','runtime','licenses'])mkdirSync(join(directory,path),{recursive:true});
for(const [tool,digest] of Object.entries(pins)){
  const source=join(llvm,'bin',tool);if(sha(source)!==digest)throw new Error('Official LLVM tool changed: '+tool);copyFileSync(source,join(directory,'bin',tool));
}
const manifest=JSON.parse(readFileSync(join(runtime,'runtime.json')));if(manifest.version!==version)throw new Error('Runtime/compiler versions differ');
for(const [file,digest] of Object.entries(manifest.files)){
  if(sha(join(runtime,file))!==digest)throw new Error('Runtime pack file changed');mkdirSync(resolve(directory,'runtime',file,'..'),{recursive:true});copyFileSync(join(runtime,file),join(directory,'runtime',file));
}copyFileSync(join(runtime,'runtime.json'),join(directory,'runtime/runtime.json'));
for(const file of readdirSync(join(root,'.aug-build/llvm-licenses'))){
  const source=join(root,'.aug-build/llvm-licenses',file);if(!existsSync(source))throw new Error('Missing pinned upstream license: '+source);copyFileSync(source,join(directory,'licenses',file));
}
copyFileSync(join(root,'LICENSE'),join(directory,'licenses/August.txt'));
const inspection=spawnSync(join(llvm,'bin/llc'),['--version'],{encoding:'utf8'});if(inspection.status!==0||!inspection.stdout.includes('23.1.2'))throw new Error('LLVM version does not match its pin');
writeFileSync(join(directory,'compiler-pack.json'),JSON.stringify({format:1,compiler:version,host:'darwin-arm64',target:'aarch64-apple-darwin',minimumOS:'14.0',llvm:'23.1.2',llvmSource:'85ac560262434c9ccfc0c183ec22d4138ed647fb',upstreamArchive:{url:'https://github.com/llvm/llvm-project/releases/download/llvmorg-23.1.2/LLVM-23.1.2-macOS-ARM64.tar.zst',sha256:'3da0e91b5dfe3a5ec795ad2be79b3f5e6f28c8b23edcd3847fad7742b25e0507'},tools:pins,runtime:manifest.sourceSha256},null,2)+'\n');
const files={};let unpacked=0;const walk=(folder,prefix='')=>{for(const entry of readdirSync(folder,{withFileTypes:true})){const path=prefix+entry.name;if(entry.isDirectory())walk(join(folder,entry.name),path+'/');else{files[path]=sha(join(folder,entry.name));unpacked+=readFileSync(join(folder,entry.name)).length;}}};walk(directory);
writeFileSync(join(directory,'files.json'),JSON.stringify({format:1,files},null,2)+'\n');unpacked+=readFileSync(join(directory,'files.json')).length;
createArchive({file:output,cwd:directory,gzip:true,sync:true,portable:true},readdirSync(directory).sort());
const archive={url:`https://github.com/GreenPandaStudios/augscript/releases/download/v${version}/aug-llvm-macos-arm64.tar.gz`,sha256:sha(output),maximumDownloadBytes:readFileSync(output).length,maximumUnpackedBytes:unpacked,fileManifest:'files.json'};
writeFileSync(join(root,'native/compiler-packs.json'),JSON.stringify({format:1,compiler:version,llvm:'23.1.2',packs:[{host:'darwin-arm64',target:'aarch64-apple-darwin',minimumOS:'14.0',archive}]},null,2)+'\n');
console.log(JSON.stringify({artifact:output,...archive}));
