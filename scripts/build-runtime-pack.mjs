#!/usr/bin/env node
// Maintainer build. Consumers use the resulting verified pack, never this script.
import {mkdirSync,readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..'),output=resolve(process.argv[2]??join(root,'.aug-native/llvm/runtime'));
if(process.platform!=='darwin'||process.arch!=='arm64')throw new Error('Initial runtime pack builder requires macOS ARM64');
const cc=process.env.AUG_CC??'/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang';
const sdk='/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk';
const minicoro=join(root,'.aug-native/sources/minicoro');
const inputPins={'minicoro.h':'476c8f593a46eaa6d12fef397de738317a5c9a0566b3abcd9cbe5985822c4a11','LICENSE':'338d8339165cf98b04af7e422ac11292748c0ae36b88eb79228a03d30600e8fe'};
for(const [file,digest] of Object.entries(inputPins)){
  if(createHash('sha256').update(readFileSync(join(minicoro,file))).digest('hex')!==digest)throw new Error('Pinned minicoro input changed: '+file);
}
const flags=['-isysroot',sdk,'-mmacosx-version-min=14.0','-std=c11','-D_POSIX_C_SOURCE=200809L','-O2','-g','-fPIC','-ffile-prefix-map='+root+'=/august','-I'+join(root,'runtime'),'-I'+minicoro];
const run=(args)=>{const result=spawnSync(cc,[...flags,...args],{encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr||result.error?.message||'Runtime build failed');};
mkdirSync(join(output,'lib'),{recursive:true});mkdirSync(join(output,'platform'),{recursive:true});mkdirSync(join(output,'licenses'),{recursive:true});
const library=join(output,'lib/libaug_runtime.1.dylib');
run(['-dynamiclib','-Wl,-install_name,@rpath/libaug_runtime.1.dylib',...['aug_runtime.c','aug_values.c','aug_tasks.c','aug_ir.c'].map(f=>join(root,'runtime',f)),'-o',library]);
const probe=join(output,'layout.c'),binary=join(output,'layout');
writeFileSync(probe,'#include "aug_ir.h"\n#include <stdio.h>\nint main(void){printf("{\\"abi\\":\\"compiler-private-runtime-v1\\",\\"valueSize\\":%zu,\\"valueAlignment\\":%zu,\\"valuePayloadOffset\\":%zu,\\"frameSize\\":%zu,\\"methodEntrySize\\":%zu,\\"pointerSize\\":%zu}\\n",sizeof(AugValue),_Alignof(AugValue),offsetof(AugValue,as),sizeof(AugFrame),sizeof(AugMethodEntry),sizeof(void*));}\n');
run([probe,'-o',binary]);const measurement=spawnSync(binary,[],{encoding:'utf8'});if(measurement.status!==0)throw new Error('Runtime layout probe failed');
const layout=JSON.parse(measurement.stdout);
copyFileSync(join(root,'native/platform/macos-arm64/libSystem.tbd'),join(output,'platform/libSystem.tbd'));
copyFileSync(join(root,'LICENSE'),join(output,'licenses/August.txt'));
copyFileSync(join(minicoro,'LICENSE'),join(output,'licenses/minicoro.txt'));
const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const files=['lib/libaug_runtime.1.dylib','platform/libSystem.tbd','licenses/August.txt','licenses/minicoro.txt'];
const sourceDigest=createHash('sha256');for(const f of ['aug_runtime.h','aug_runtime.c','aug_values.c','aug_tasks.c','aug_ir.h','aug_ir.c'])sourceDigest.update(f+'\0').update(readFileSync(join(root,'runtime',f)));
for(const file of Object.keys(inputPins))sourceDigest.update('minicoro/'+file+'\0').update(readFileSync(join(minicoro,file)));
writeFileSync(join(output,'runtime.json'),JSON.stringify({format:1,version:JSON.parse(readFileSync(join(root,'package.json'))).version,target:'aarch64-apple-darwin',minimumOS:'14.0',layout,files:Object.fromEntries(files.map(f=>[f,sha(join(output,f))])),libraries:['lib/libaug_runtime.1.dylib'],sourceSha256:sourceDigest.digest('hex'),compiler:spawnSync(cc,['--version'],{encoding:'utf8'}).stdout.trim()},null,2)+'\n');
console.log('Built maintainer runtime pack: '+output);
