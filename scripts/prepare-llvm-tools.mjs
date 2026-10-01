#!/usr/bin/env node
// Maintainer input preparation. Consumers download the smaller August pack.
import {createReadStream,createWriteStream,existsSync,mkdirSync,readFileSync,renameSync,rmSync,writeFileSync,chmodSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {Transform,Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {createZstdDecompress,constants} from 'node:zlib';
import {Parser} from 'tar';

const root=resolve(import.meta.dirname,'..'),directory=resolve(process.argv[2]??join(root,'.aug-build/llvm-tools'));
const archive=resolve(process.argv[3]??join(root,'.aug-build/LLVM-23.1.2-macOS-ARM64.tar.zst'));
const upstream={url:'https://github.com/llvm/llvm-project/releases/download/llvmorg-23.1.2/LLVM-23.1.2-macOS-ARM64.tar.zst',sha256:'3da0e91b5dfe3a5ec795ad2be79b3f5e6f28c8b23edcd3847fad7742b25e0507',bytes:873761429};
mkdirSync(resolve(archive,'..'),{recursive:true});mkdirSync(join(directory,'bin'),{recursive:true});mkdirSync(join(root,'.aug-build/llvm-licenses'),{recursive:true});
if(!existsSync(archive)){
  const response=await fetch(upstream.url,{signal:AbortSignal.timeout(900000)});
  if(!response.ok||!response.body)throw new Error('Official LLVM archive download failed: '+response.status);
  let count=0;const hash=createHash('sha256');
  try{
    await pipeline(Readable.fromWeb(response.body),new Transform({transform(chunk,encoding,callback){count+=chunk.length;if(count>upstream.bytes)return callback(new Error('LLVM archive exceeds pinned size'));hash.update(chunk);callback(null,chunk);}}),createWriteStream(archive+'.part'));
    if(count!==upstream.bytes||hash.digest('hex')!==upstream.sha256)throw new Error('Official LLVM archive integrity differs from its pin');
    renameSync(archive+'.part',archive);
  }finally{rmSync(archive+'.part',{force:true});}
}
const archiveHash=createHash('sha256');let archiveBytes=0;
for await(const chunk of createReadStream(archive)){archiveHash.update(chunk);archiveBytes+=chunk.length;}
if(archiveBytes!==upstream.bytes||archiveHash.digest('hex')!==upstream.sha256)throw new Error('Cached official LLVM archive changed');
const selected=new Set(['llc','lld','opt']),pending=[],seen=new Set();
const parser=new Parser({strict:true,onReadEntry(entry){
  const match=/^LLVM-23\.1\.2-macOS-ARM64\/bin\/(llc|lld|opt)$/.exec(entry.path);
  if(match){
    const name=match[1];if(entry.type!=='File'||seen.has(name)||entry.size>200000000)throw new Error('Unexpected LLVM tool archive entry');seen.add(name);
    pending.push(pipeline(entry,createWriteStream(join(directory,'bin',name))));
  }else if(entry.path==='LLVM-23.1.2-macOS-ARM64/include/llvm/Support/LICENSE.TXT'){
    pending.push(pipeline(entry,createWriteStream(join(root,'.aug-build/llvm-licenses/LLVM-Support.txt'))));
  }else entry.resume();
}});
await pipeline(createReadStream(archive),createZstdDecompress({params:{[constants.ZSTD_d_windowLogMax]:30}}),parser);
await Promise.all(pending);
if([...selected].some(name=>!seen.has(name)))throw new Error('Official archive omitted a required LLVM tool');
const tools={};for(const tool of selected){const file=join(directory,'bin',tool);chmodSync(file,0o755);tools[tool]=createHash('sha256').update(readFileSync(file)).digest('hex');}
for(const [name,component] of [['LLVM','llvm'],['LLD','lld']]){
  const url=`https://raw.githubusercontent.com/llvm/llvm-project/85ac560262434c9ccfc0c183ec22d4138ed647fb/${component}/LICENSE.TXT`;
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(60000)});if(!response.ok)throw new Error('Cannot obtain pinned LLVM notice');
  const bytes=Buffer.from(await response.arrayBuffer());if(bytes.length>100000||!bytes.toString().includes('Apache'))throw new Error('Unexpected LLVM license input');writeFileSync(join(root,'.aug-build/llvm-licenses',name+'.txt'),bytes);
}
writeFileSync(join(directory,'upstream.json'),JSON.stringify({format:1,llvm:'23.1.2',revision:'85ac560262434c9ccfc0c183ec22d4138ed647fb',archive:upstream,tools},null,2)+'\n');
console.log(JSON.stringify({directory,tools}));
