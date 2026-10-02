// Maintainer-only target components. Consumers download machine-code artifacts.
import {copyFileSync,existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {runtimeAdapters,adapterSymbol} from '../src/runtime-adapters.ts';

export function buildRuntimeComponents({root,output,nativeRoot,compile,linuxRuntime}) {
  const prefix=join(nativeRoot,'prefix'),manifest=JSON.parse(readFileSync(join(prefix,'aug-native-manifest.json')));
  const lock=JSON.parse(readFileSync(join(root,'scripts/native-dependencies.lock.json')));
  const mac=process.platform==='darwin';
  const tool='/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/';
  const run=(name,args)=>{const result=spawnSync(mac?(name==='codesign'?'/usr/bin/codesign':tool+name):name,args,{encoding:'utf8'});if(result.status!==0)throw new Error(name+': '+(result.stderr||result.error?.message));return result.stdout;};
  if(manifest.platform!==process.platform||manifest.architecture!==process.arch)throw new Error('LLVM runtime dependencies must target this host');
  const names=mac?['libgnutls.30.dylib','libhogweed.6.dylib','libnettle.8.dylib','libgmp.10.dylib']:['libgnutls.so.30','libhogweed.so.6','libnettle.so.8','libgmp.so.10'];
  const files=[],metadata=[];
  const save=(path,source)=>{mkdirSync(join(output,path,'..'),{recursive:true});copyFileSync(source,join(output,path));files.push(path);};
  for(const name of names){
    const source=join(prefix,'lib',name);
    if(!existsSync(source))throw new Error('LLVM runtime requires '+source+'. Build pinned dependencies with MACOSX_DEPLOYMENT_TARGET=14.0 in a fresh cache.');
    if(mac){const floor=run('otool',['-l',source]).match(/\bminos\s+([\d.]+)/)?.[1];
      if(!floor||Number(floor.split('.')[0])>14||(Number(floor.split('.')[0])===14&&floor.split('.').slice(1).some(part=>Number(part)>0)))throw new Error(name+' requires macOS '+(floor??'unknown')+'. Rebuild in a fresh cache with MACOSX_DEPLOYMENT_TARGET=14.0.');}
    save('lib/'+name,source);
  }
  const relocate=(path)=>{
    if(!mac){
      const file=join(output,path);
      for(const match of run('readelf',['-d',file]).matchAll(/Shared library: \[([^\]]+)\]/g)){
        const loader=process.arch==='x64'?'ld-linux-x86-64.so.2':'ld-linux-aarch64.so.1';
        if(![...names,'libaug_runtime.so.1','libz.so.1','libc.so.6','libm.so.6','libdl.so.2','libpthread.so.0','librt.so.1','libgcc_s.so.1',loader].includes(match[1]))throw new Error('Unpackaged runtime dependency '+match[1]);
      }
      for(const match of run('readelf',['--version-info',file]).matchAll(/\bGLIBC_(\d+)\.(\d+)\b/g))if(Number(match[1])>2||Number(match[1])===2&&Number(match[2])>36)throw new Error('Runtime requires a newer glibc than 2.36');
      run('patchelf',['--set-rpath','$ORIGIN',file]);return;
    }
    const file=join(output,path);const args=['-id','@rpath/'+basename(path)];
    for(const match of run('otool',['-L',file]).matchAll(/^\t(.+?) \(compatibility version/gm)){
      const dependency=match[1];if(dependency===file||dependency.endsWith('/'+basename(path)))continue;
      if(names.includes(basename(dependency)))args.push('-change',dependency,'@rpath/'+basename(dependency));
      else if(dependency!=='@rpath/libaug_runtime.1.dylib'&&!dependency.startsWith('/usr/lib/')&&!dependency.startsWith('/System/Library/'))throw new Error('Unpackaged runtime dependency '+dependency);
    }
    let loaderPath=false;
    for(const match of run('otool',['-l',file]).matchAll(/cmd LC_RPATH\n[^\n]*\n\s*path (.+?) \(offset/g)){
      if(match[1]==='@loader_path')loaderPath=true;else args.push('-delete_rpath',match[1]);
    }
    if(!loaderPath)args.push('-add_rpath','@loader_path');args.push(file);run('install_name_tool',args);run('codesign',['--force','--sign','-',file]);
  };
  names.forEach(name=>relocate('lib/'+name));
  const bridgeFor=component=>{
  const bridge=join(output,component+'-bridge.c'),adapters=runtimeAdapters.filter(adapter=>adapter.component===component);
  writeFileSync(bridge,'#include "aug_ir.h"\n'+adapters.map(adapter=>{
    const argumentsList=adapter.parameters.map((_,i)=>'a['+i+']').join(',');
    const result='AugValue';
    return `extern ${result} ${adapter.name}(${adapter.parameters.length?adapter.parameters.map(()=> 'AugValue').join(','):'void'});\nvoid ${adapterSymbol(adapter)}(AugValue *out,AugValue *a,int count){\n  *out=aug_null();if(count!=${adapter.parameters.length}){aug_error_named("NativeContractError");return;}\n  *out=${adapter.name}(${argumentsList});\n}\n`;
  }).join('\n'));return bridge;};
  const core=join(output,mac?'lib/libaug_runtime.1.dylib':'lib/libaug_runtime.so.1');
  const crypto=mac?'lib/libaug_crypto.1.dylib':'lib/libaug_crypto.so.1';
  compile([...(mac?['-dynamiclib','-Wl,-install_name,@rpath/libaug_crypto.1.dylib','-Wl,-rpath,@loader_path']:['-shared','-Wl,-soname,libaug_crypto.so.1','-Wl,-rpath,$ORIGIN']),'-I'+join(prefix,'include'),join(root,'runtime/aug_crypto.c'),bridgeFor('crypto'),core,...names.map(name=>join(output,'lib',name)),'-o',join(output,crypto)]);
  files.push(crypto);relocate(crypto);
  const http=mac?'lib/libaug_http.1.dylib':'lib/libaug_http.so.1',websockets=join(prefix,'lib/libwebsockets.a');
  if(mac){const floors=[...run('otool',['-l',websockets]).matchAll(/\bminos\s+([\d.]+)/g)].map(match=>match[1]);
    if(!floors.length||floors.some(floor=>Number(floor.split('.')[0])>14||Number(floor.split('.')[0])===14&&floor.split('.').slice(1).some(part=>Number(part)>0)))throw new Error('libwebsockets requires a newer macOS target. Rebuild with MACOSX_DEPLOYMENT_TARGET=14.0.');}
  compile([...(mac?['-dynamiclib','-D_DARWIN_C_SOURCE','-Wl,-install_name,@rpath/libaug_http.1.dylib','-Wl,-rpath,@loader_path']:['-shared','-Wl,-soname,libaug_http.so.1','-Wl,-rpath,$ORIGIN','-pthread']),'-DAUG_HTTP_RUNTIME','-I'+join(prefix,'include'),...['aug_http.c','aug_html.c','aug_http_ir.c'].map(file=>join(root,'runtime',file)),bridgeFor('http'),websockets,core,...names.map(name=>join(output,'lib',name)),'-lz',...(mac?['-framework','CoreFoundation','-framework','SystemConfiguration']:[]),'-o',join(output,http)]);
  files.push(http);relocate(http);
  const linuxFiles=[];
  if(!mac){
    const inputs=JSON.parse(readFileSync(join(linuxRuntime,'redistribution.json')));
    for(const [path,digest] of Object.entries(inputs.files)){
      if(createHash('sha256').update(readFileSync(join(linuxRuntime,path))).digest('hex')!==digest)throw new Error('Pinned Linux runtime input changed');
      if(path.startsWith('lib/')&&!['lib/libz.so.1','lib/libgcc_s.so.1'].includes(path))continue;
      save(path,join(linuxRuntime,path));if(path.startsWith('lib/'))linuxFiles.push(path);else metadata.push(path);
    }
    const provenance='sources/linux-redistribution.json';save(provenance,join(linuxRuntime,'redistribution.json'));metadata.push(provenance);
  }
  for(const name of ['gmp','nettle','gnutls','libwebsockets','yyjson','minicoro']){
    const pin=lock.dependencies.find(pin=>pin.name===name),built=manifest.dependencies.find(entry=>entry.name===name);
    if(!built||built.sha256!==pin.sha256)throw new Error('LLVM component dependency differs from the source lock: '+name);
    const archive=join(nativeRoot,'downloads',pin.archive);
    if(createHash('sha256').update(readFileSync(archive)).digest('hex')!==pin.sha256)throw new Error('Changed corresponding source archive: '+name);
    const path='sources/'+pin.archive;save(path,archive);metadata.push(path);
    for(const file of readdirSync(join(nativeRoot,'sources',name)).filter(file=>/^COPYING/.test(file))){const path='licenses/'+name+'-'+file;save(path,join(nativeRoot,'sources',name,file));metadata.push(path);}
    const license=join(nativeRoot,'sources',name,'LICENSE');if(existsSync(license)){const path='licenses/'+name+'-LICENSE';save(path,license);metadata.push(path);}
  }
  // Include the exact adapter/runtime sources and build recipes beside upstream
  // archives, so redistribution does not depend on a moving website or branch.
  for(const file of readdirSync(join(root,'runtime')).filter(file=>/\.[ch]$/.test(file))){const path='sources/august/runtime/'+file;save(path,join(root,'runtime',file));metadata.push(path);}
  for(const file of ['scripts/runtime-components.mjs','scripts/build-runtime-pack.mjs','scripts/bootstrap-native.mjs','scripts/native-dependencies.lock.json','scripts/native-home.mjs','scripts/native-toolchain.mjs','scripts/native-setup.mjs','src/runtime-adapters.ts','src/runtime-abi.ts','src/http-policies.ts','src/llvm-platform.ts','src/native-contracts.ts',...(mac?['native/platform/macos-arm64/libSystem.tbd']:['native/platform/linux-'+process.arch+'/start.S','scripts/prepare-linux-runtimes.mjs','native/linux-runtimes.lock.json']),'package.json','LICENSE']){
    const path='sources/august/'+file;save(path,join(root,file));metadata.push(path);
  }
  const notice='licenses/native-runtime.txt';
  writeFileSync(join(output,notice),'Crypto and HTTP use the pinned GnuTLS, Nettle and GMP libraries under their accompanying licenses. HTTP also uses libwebsockets and the operating system zlib.\nThe crypto dependencies remain replaceable dynamic libraries in lib/. Corresponding upstream source archives, August runtime sources and maintainer build recipes are in sources/.\nThe compiler pack and each crypto/HTTP deployment retain these files. Native build tools are needed only to rebuild these components.\n');files.push(notice);metadata.push(notice);
  const instructions='sources/BUILD.md';
  writeFileSync(join(output,instructions),'# Rebuild the runtime components\n\nThese are maintainer steps on '+(mac?'macOS ARM64 with Xcode':'Debian 12 x86-64 or ARM64 with Clang and patchelf')+', Node 24+, make and m4. Ordinary August consumers use the prebuilt components.\n\nThe original pinned library archives are beside this file. August runtime sources and the complete build recipes are in `august/`. To rebuild, enter that folder, make `.aug-native/downloads`, copy the adjacent library archives into it, then run:\n\n```sh\n'+(mac?'MACOSX_DEPLOYMENT_TARGET=14.0 ':'')+'node scripts/bootstrap-native.mjs\nnode scripts/build-runtime-pack.mjs\n```\n\nBootstrap verifies the source archives and obtains any missing build utilities. It does not install them system-wide. The component builder checks platform versions and the full dependency closure. '+(mac?'It rewrites library dependencies to `@rpath` and signs the resulting copies.':'It checks the glibc 2.36 floor and rewrites library search paths to `$ORIGIN`.')+' Its generated pointer bridges come from `src/runtime-adapters.ts`. The original dependency libraries in the build cache remain unchanged.\n\nApplication deployments keep dependency libraries replaceable in `lib/`, with these sources and notices under `share/august-native/`. Review the accompanying library licenses when redistributing a deployment.\n');files.push(instructions);metadata.push(instructions);
  return {files,components:{crypto:{libraries:[crypto],runtimeFiles:[...names.map(name=>'lib/'+name),...linuxFiles],metadata},http:{libraries:[http],runtimeFiles:[...names.map(name=>'lib/'+name),...linuxFiles],metadata}}};
}
