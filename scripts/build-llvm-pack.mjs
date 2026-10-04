#!/usr/bin/env node
// Explicit maintainer build. This packages official LLVM tools and a built runtime;
// it does not copy an Apple SDK, linker, or SDK stub into the distribution.
import {copyFileSync,existsSync,mkdirSync,readFileSync,readdirSync,realpathSync,rmSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {c as createArchive} from 'tar';
import {llvmPlatform} from '../src/llvm-platform.ts';
import {prepareLinuxRuntimes} from './prepare-linux-runtimes.mjs';
const root=resolve(import.meta.dirname,'..'),version=JSON.parse(readFileSync(join(root,'package.json'))).version;
const platform=llvmPlatform(),inputs=JSON.parse(readFileSync(join(root,'native/llvm-inputs.json'))),input=inputs.hosts[platform.host];
const llvm=resolve(process.argv[2]??join(root,'.aug-build/llvm-tools'));
const runtime=resolve(process.argv[3]??join(root,'.aug-native/llvm/runtime'));
const directory=join(root,'.aug-build/compiler-pack'),filename='aug-llvm-'+platform.artifact+'.tar.gz',output=join(root,'.aug-build',filename);
const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const pins=input.tools;
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
if(process.platform==='linux'){
  const linux=await prepareLinuxRuntimes(root,join(root,'.aug-build/linux-runtime-tools'),{tools:true}),contract=JSON.parse(readFileSync(join(linux,'redistribution.json')));
  for(const [file,digest] of Object.entries(contract.files)){
    if(sha(join(linux,file))!==digest)throw new Error('Linux runtime redistribution input changed');
    mkdirSync(resolve(directory,file,'..'),{recursive:true});copyFileSync(join(linux,file),join(directory,file));
  }
  copyFileSync(join(linux,'redistribution.json'),join(directory,'linux-redistribution.json'));
}
const inspection=spawnSync(join(llvm,'bin/llc'),['--version'],{encoding:'utf8'});if(inspection.status!==0||!inspection.stdout.includes('23.1.2'))throw new Error('LLVM version does not match its pin');
for(const tool of platform.tools){const args=tool==='lld'?['-flavor',process.platform==='darwin'?'darwin':'gnu','--version']:['--version'];const result=spawnSync(join(directory,'bin',tool),args,{encoding:'utf8'});if(result.status!==0||!(result.stdout+result.stderr).includes(inputs.llvm))throw new Error('Packaged LLVM tool cannot run: '+tool+' '+(result.stderr||result.error?.message));}
if(process.platform==='linux')for(const tool of platform.tools){
  const result=spawnSync('ldd',[join(directory,'bin',tool)],{encoding:'utf8'});if(result.status!==0||result.stdout.includes('not found'))throw new Error('Incomplete LLVM tool dependencies: '+result.stdout);
  for(const match of result.stdout.matchAll(/^\s*(\S+) => (\S+)/gm))if(!['libc.so.6','libm.so.6','libpthread.so.0','libdl.so.2','librt.so.1',platform.loader.split('/').at(-1)].includes(match[1])&&!realpathSync(match[2]).startsWith(realpathSync(join(directory,'lib'))+'/'))throw new Error('LLVM tool uses an unpackaged dependency: '+match[0]);
}
writeFileSync(join(directory,'compiler-pack.json'),JSON.stringify({format:1,compiler:version,host:platform.host,target:platform.target,minimumOS:platform.minimumOS,minimumLibc:platform.minimumLibc,llvm:inputs.llvm,llvmSource:inputs.revision,upstreamArchive:input.archive,tools:pins,runtime:manifest.sourceSha256},null,2)+'\n');
const files={};let unpacked=0;const walk=(folder,prefix='')=>{for(const entry of readdirSync(folder,{withFileTypes:true})){const path=prefix+entry.name;if(entry.isDirectory())walk(join(folder,entry.name),path+'/');else{files[path]=sha(join(folder,entry.name));unpacked+=readFileSync(join(folder,entry.name)).length;}}};walk(directory);
writeFileSync(join(directory,'files.json'),JSON.stringify({format:1,files},null,2)+'\n');unpacked+=readFileSync(join(directory,'files.json')).length;
createArchive({file:output,cwd:directory,gzip:true,sync:true,portable:true},readdirSync(directory).sort());
const archive={url:`https://github.com/GreenPandaStudios/augscript/releases/download/v${version}/${filename}`,sha256:sha(output),maximumDownloadBytes:readFileSync(output).length,maximumUnpackedBytes:unpacked,fileManifest:'files.json',fileManifestSha256:sha(join(directory,'files.json'))};
const pack={host:platform.host,target:platform.target,minimumOS:platform.minimumOS,minimumLibc:platform.minimumLibc,archive};
const file=join(root,'native/compiler-packs.json'),previous=existsSync(file)?JSON.parse(readFileSync(file)):{packs:[]};
const merged={format:1,compiler:version,llvm:inputs.llvm,packs:[...(previous.compiler===version?previous.packs.filter(entry=>entry.host!==platform.host):[]),pack].sort((a,b)=>a.host.localeCompare(b.host))};
writeFileSync(file,JSON.stringify(merged,null,2)+'\n');
writeFileSync(join(root,'.aug-build/compiler-pack-'+platform.host+'.json'),JSON.stringify({format:1,compiler:version,llvm:inputs.llvm,packs:[pack]},null,2)+'\n');
console.log(JSON.stringify({artifact:output,...archive}));
