#!/usr/bin/env node
// Explicit maintainer tools. Clang and sanitizer runtimes never enter consumer packs.
import {createReadStream,createWriteStream,existsSync,mkdirSync,readFileSync,writeFileSync,chmodSync,copyFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join,dirname} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {createZstdDecompress,constants} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {Parser} from 'tar';
import {prepareLinuxRuntimes} from './prepare-linux-runtimes.mjs';

const root=resolve(import.meta.dirname,'..'),pins=JSON.parse(readFileSync(join(root,'native/llvm-inputs.json'))),host=process.platform+'-'+process.arch,input=pins.hosts[host];
if(!input)throw Error('No qualified LLVM maintainer input for '+host);
const archive=resolve(process.argv[2]??join(root,'.aug-build',input.prefix+'.tar.zst')),output=resolve(process.argv[3]??join(root,'.aug-build/llvm-maintainer'));
if(!existsSync(archive))throw Error('Prepare the pinned official archive with scripts/prepare-llvm-tools.mjs, or pass its local filename.');
const digest=createHash('sha256');let bytes=0;
for await(const chunk of createReadStream(archive)){digest.update(chunk);bytes+=chunk.length;}
if(bytes!==input.archive.bytes||digest.digest('hex')!==input.archive.sha256)throw Error('Maintainer LLVM archive differs from its pin');
const version=pins.llvm.split('.')[0],files={},pending=[],aliases=[];
const parser=new Parser({strict:true,onReadEntry(entry){
  if(!entry.path.startsWith(input.prefix+'/')){entry.resume();return;}
  const path=entry.path.slice(input.prefix.length+1);
  const selected=['bin/clang','bin/clang-'+version,'bin/llvm-dwarfdump'].includes(path)||path.startsWith('lib/clang/'+version+'/include/')||path.startsWith('lib/clang/'+version+'/lib/');
  if(!selected||entry.type==='Directory'){entry.resume();return;}
  if(path.split('/').some(part=>!part||part==='.'||part==='..')||entry.size>400000000)throw Error('Unexpected maintainer archive member');
  if(entry.type==='SymbolicLink'&&path==='bin/clang'&&entry.linkpath==='clang-'+version){aliases.push(path);entry.resume();return;}
  if(entry.type!=='File')throw Error('Unsupported maintainer archive member '+path);
  if(files[path]!==undefined)throw Error('Duplicate maintainer member '+path);files[path]='';
  mkdirSync(dirname(join(output,path)),{recursive:true});
  pending.push(pipeline(entry,createWriteStream(join(output,path))));
}});
await pipeline(createReadStream(archive),createZstdDecompress({params:{[constants.ZSTD_d_windowLogMax]:30}}),parser);
await Promise.all(pending);
for(const alias of aliases){copyFileSync(join(output,'bin/clang-'+version),join(output,alias));files[alias]='';}
if(process.platform==='linux'){
  const inputs=await prepareLinuxRuntimes(root,join(root,'.aug-build/linux-runtime-maintainer'),{tools:true});
  const redistribution=JSON.parse(readFileSync(join(inputs,'redistribution.json')));
  for(const file of Object.keys(redistribution.files).filter(file=>file.startsWith('lib/'))){
    mkdirSync(dirname(join(output,file)),{recursive:true});copyFileSync(join(inputs,file),join(output,file));files[file]='';
  }
  copyFileSync(join(inputs,'redistribution.json'),join(output,'linux-redistribution.json'));files['linux-redistribution.json']='';
}
for(const tool of ['clang','llvm-dwarfdump']){
  const path=join(output,'bin',tool);if(!existsSync(path))throw Error('Official maintainer archive omitted '+tool);chmodSync(path,0o755);
  const result=spawnSync(path,['--version'],{encoding:'utf8'});if(result.status!==0||!(result.stdout+result.stderr).includes(pins.llvm))throw Error('Maintainer tool cannot run at the pinned version: '+tool);
}
for(const path of Object.keys(files).sort())files[path]=createHash('sha256').update(readFileSync(join(output,path))).digest('hex');
writeFileSync(join(output,'maintainer-inputs.json'),JSON.stringify({format:1,host,llvm:pins.llvm,sourceRevision:pins.revision,archive:input.archive,files},null,2)+'\n');
console.log('Prepared explicit LLVM maintainer tools: '+output);
