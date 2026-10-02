#!/usr/bin/env node
// Maintainer build. Consumers use the resulting verified pack, never this script.
import {mkdirSync,readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {buildRuntimeComponents} from './runtime-components.mjs';
import {runtimeIdentifiers,runtimeIdentifierSha256} from '../src/runtime-abi.ts';
import {llvmPlatform} from '../src/llvm-platform.ts';
import {prepareLinuxRuntimes} from './prepare-linux-runtimes.mjs';
const root=resolve(import.meta.dirname,'..'),output=resolve(process.argv[2]??join(root,'.aug-native/llvm/runtime'));
const platform=llvmPlatform(),mac=process.platform==='darwin';
const linuxRuntime=mac?undefined:await prepareLinuxRuntimes(root);
const cc=process.env.AUG_CC??(mac?'/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang':'clang');
const sdk='/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk';
const minicoro=join(root,'.aug-native/sources/minicoro');
const yyjson=join(root,'.aug-native/sources/yyjson');
const inputPins={'minicoro.h':'476c8f593a46eaa6d12fef397de738317a5c9a0566b3abcd9cbe5985822c4a11','LICENSE':'338d8339165cf98b04af7e422ac11292748c0ae36b88eb79228a03d30600e8fe'};
for(const [file,digest] of Object.entries(inputPins)){
  if(createHash('sha256').update(readFileSync(join(minicoro,file))).digest('hex')!==digest)throw new Error('Pinned minicoro input changed: '+file);
}
const jsonPins={'src/yyjson.c':'ac2e9bbb2e2d9149d90878d40506a1d624fa0b33c979a11b61075c54782c6d6a','src/yyjson.h':'175867c5493a5df648cec566717fa1c29aa2f6096f5f0cf1efad0b65e1f6d7b3','LICENSE':'45e384d3d52c73cba3a64d6e6c25d47cd738cd8a55c30629e3201046eda62947'};
for(const [file,digest] of Object.entries(jsonPins)){
  if(createHash('sha256').update(readFileSync(join(yyjson,file))).digest('hex')!==digest)throw new Error('Pinned yyjson input changed: '+file);
}
const flags=[...(mac?['-isysroot',sdk,'-mmacosx-version-min=14.0']:[]),'-std=c11','-D_POSIX_C_SOURCE=200809L','-O2','-g','-fPIC','-ffile-prefix-map='+root+'=/august','-I'+join(root,'runtime'),'-I'+minicoro,'-I'+join(yyjson,'src')];
const run=(args)=>{const result=spawnSync(cc,[...flags,...args],{encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr||result.error?.message||'Runtime build failed');};
mkdirSync(join(output,'lib'),{recursive:true});mkdirSync(join(output,'platform'),{recursive:true});mkdirSync(join(output,'licenses'),{recursive:true});
const libraryName=mac?'lib/libaug_runtime.1.dylib':'lib/libaug_runtime.so.1',library=join(output,libraryName);
const sources=['aug_runtime.c','aug_values.c','aug_tasks.c','aug_json.c','aug_time.c','aug_ir.c'];
// Private runtime functions use their own definitions, as in the C reference.
// Keep data symbols preemptible: application/native callbacks share runtime state.
run([...(mac?['-dynamiclib','-Wl,-install_name,@rpath/libaug_runtime.1.dylib']:['-shared','-Wl,-Bsymbolic-functions','-Wl,-soname,libaug_runtime.so.1','-Wl,-rpath,$ORIGIN','-pthread']),...sources.map(f=>join(root,'runtime',f)),join(yyjson,'src/yyjson.c'),...(!mac?['-lm']:[]),'-o',library]);
const probe=join(output,'layout.c'),binary=join(output,'layout');
const measurements={valueSize:'sizeof(AugValue)',valueAlignment:'_Alignof(AugValue)',valuePayloadOffset:'offsetof(AugValue,as)',frameSize:'sizeof(AugFrame)',methodEntrySize:'sizeof(AugMethodEntry)',pointerSize:'sizeof(void*)',schemaSize:'sizeof(AugSchema)',schemaPointerMakerOffset:'offsetof(AugSchema,pointer_make)',routeSize:'sizeof(AugRoute)',routePointerHandlerOffset:'offsetof(AugRoute,pointer_handler)',policySize:'sizeof(AugHttpPolicy)',httpErrorSize:'sizeof(AugIrHttpError)',executionErrorOffset:'offsetof(AugExecution,has_error)',executionCancelledOffset:'offsetof(AugExecution,cancelled)',executionFiberOffset:'offsetof(AugExecution,fiber)',booleanSize:'sizeof(bool)'};
const probeFormat='{"abi":"compiler-private-runtime-v1",'+Object.keys(measurements).map(key=>'"'+key+'":%zu').join(',')+'}\n';
writeFileSync(probe,'#include "aug_http_ir.h"\n#include <stdio.h>\n'+Object.entries(runtimeIdentifiers).map(([name,value])=>`_Static_assert(${name}==${value},"Runtime identifier ${name}");`).join('\n')+'\nint main(void){printf('+JSON.stringify(probeFormat)+','+Object.values(measurements).join(',')+');}\n');
run([probe,'-o',binary]);const measurement=spawnSync(binary,[],{encoding:'utf8'});if(measurement.status!==0)throw new Error('Runtime layout probe failed');
const layout=JSON.parse(measurement.stdout);
if(mac)copyFileSync(join(root,'native/platform/macos-arm64/libSystem.tbd'),join(output,'platform/libSystem.tbd'));
else {copyFileSync(join(root,'native/platform',platform.entry),join(output,'platform/start.S'));run(['-c',join(output,'platform/start.S'),'-o',join(output,'platform/start.o')]);}
copyFileSync(join(root,'LICENSE'),join(output,'licenses/August.txt'));
copyFileSync(join(minicoro,'LICENSE'),join(output,'licenses/minicoro.txt'));
copyFileSync(join(yyjson,'LICENSE'),join(output,'licenses/yyjson.txt'));
const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const files=[libraryName,...(mac?['platform/libSystem.tbd']:['platform/start.S','platform/start.o']),'licenses/August.txt','licenses/minicoro.txt','licenses/yyjson.txt'];
const extra=buildRuntimeComponents({root,output,nativeRoot:resolve(process.env.AUG_LLVM_NATIVE_HOME??join(root,'.aug-native')),compile:run,linuxRuntime});
files.push(...extra.files);
const sourceDigest=createHash('sha256');for(const f of ['aug_runtime.h','aug_ir.h',...sources])sourceDigest.update(f+'\0').update(readFileSync(join(root,'runtime',f)));
for(const file of Object.keys(inputPins))sourceDigest.update('minicoro/'+file+'\0').update(readFileSync(join(minicoro,file)));
for(const file of Object.keys(jsonPins))sourceDigest.update('yyjson/'+file+'\0').update(readFileSync(join(yyjson,file)));
for(const file of ['scripts/runtime-components.mjs','scripts/build-runtime-pack.mjs','src/runtime-adapters.ts'])sourceDigest.update(file+'\0').update(readFileSync(join(root,file)));
for(const file of extra.files.filter(file=>file.startsWith('sources/')||file.startsWith('licenses/')).sort())sourceDigest.update(file+'\0').update(readFileSync(join(output,file)));
writeFileSync(join(output,'runtime.json'),JSON.stringify({format:1,version:JSON.parse(readFileSync(join(root,'package.json'))).version,target:platform.target,minimumOS:platform.minimumOS,minimumLibc:platform.minimumLibc,layout,identifierSha256:runtimeIdentifierSha256,files:Object.fromEntries(files.map(f=>[f,sha(join(output,f))])),libraries:[libraryName],components:extra.components,sourceSha256:sourceDigest.digest('hex'),compiler:spawnSync(cc,['--version'],{encoding:'utf8'}).stdout.trim()},null,2)+'\n');
console.log('Built maintainer runtime pack: '+output);
