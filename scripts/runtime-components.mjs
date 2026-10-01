// Maintainer-only target components. Consumers download machine-code artifacts.
import {copyFileSync,existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {runtimeAdapters,adapterSymbol} from '../src/runtime-adapters.ts';

export function buildRuntimeComponents({root,output,nativeRoot,compile}) {
  const prefix=join(nativeRoot,'prefix'),manifest=JSON.parse(readFileSync(join(prefix,'aug-native-manifest.json')));
  const lock=JSON.parse(readFileSync(join(root,'scripts/native-dependencies.lock.json')));
  const tool='/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/';
  const run=(name,args)=>{const result=spawnSync(name==='codesign'?'/usr/bin/codesign':tool+name,args,{encoding:'utf8'});if(result.status!==0)throw new Error(name+': '+(result.stderr||result.error?.message));return result.stdout;};
  if(manifest.platform!=='darwin'||manifest.architecture!=='arm64')throw new Error('LLVM runtime dependencies must target macOS ARM64');
  const names=['libgnutls.30.dylib','libhogweed.6.dylib','libnettle.8.dylib','libgmp.10.dylib'];
  const files=[],metadata=[];
  const save=(path,source)=>{mkdirSync(join(output,path,'..'),{recursive:true});copyFileSync(source,join(output,path));files.push(path);};
  for(const name of names){
    const source=join(prefix,'lib',name);
    if(!existsSync(source))throw new Error('LLVM runtime requires '+source+'. Build pinned dependencies with MACOSX_DEPLOYMENT_TARGET=14.0 in a fresh cache.');
    const floor=run('otool',['-l',source]).match(/\bminos\s+([\d.]+)/)?.[1];
    if(!floor||Number(floor.split('.')[0])>14||(Number(floor.split('.')[0])===14&&floor.split('.').slice(1).some(part=>Number(part)>0)))throw new Error(name+' requires macOS '+(floor??'unknown')+'. Rebuild in a fresh cache with MACOSX_DEPLOYMENT_TARGET=14.0.');
    save('lib/'+name,source);
  }
  const relocate=(path)=>{
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
  const crypto='lib/libaug_crypto.1.dylib';
  compile(['-dynamiclib','-Wl,-install_name,@rpath/libaug_crypto.1.dylib','-Wl,-rpath,@loader_path','-I'+join(prefix,'include'),join(root,'runtime/aug_crypto.c'),bridgeFor('crypto'),join(output,'lib/libaug_runtime.1.dylib'),...names.map(name=>join(output,'lib',name)),'-o',join(output,crypto)]);
  files.push(crypto);relocate(crypto);
  const http='lib/libaug_http.1.dylib',websockets=join(prefix,'lib/libwebsockets.a');
  const floors=[...run('otool',['-l',websockets]).matchAll(/\bminos\s+([\d.]+)/g)].map(match=>match[1]);
  if(!floors.length||floors.some(floor=>Number(floor.split('.')[0])>14||Number(floor.split('.')[0])===14&&floor.split('.').slice(1).some(part=>Number(part)>0)))throw new Error('libwebsockets requires a newer macOS target. Rebuild with MACOSX_DEPLOYMENT_TARGET=14.0.');
  compile(['-dynamiclib','-DAUG_HTTP_RUNTIME','-D_DARWIN_C_SOURCE','-Wl,-install_name,@rpath/libaug_http.1.dylib','-Wl,-rpath,@loader_path','-I'+join(prefix,'include'),...['aug_http.c','aug_html.c','aug_http_ir.c'].map(file=>join(root,'runtime',file)),bridgeFor('http'),websockets,join(output,'lib/libaug_runtime.1.dylib'),...names.map(name=>join(output,'lib',name)),'-lz','-framework','CoreFoundation','-framework','SystemConfiguration','-o',join(output,http)]);
  files.push(http);relocate(http);
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
  for(const file of ['scripts/runtime-components.mjs','scripts/build-runtime-pack.mjs','scripts/bootstrap-native.mjs','scripts/native-dependencies.lock.json','scripts/native-home.mjs','scripts/native-toolchain.mjs','scripts/native-setup.mjs','src/runtime-adapters.ts','native/platform/macos-arm64/libSystem.tbd','package.json','LICENSE']){
    const path='sources/august/'+file;save(path,join(root,file));metadata.push(path);
  }
  const notice='licenses/native-runtime.txt';
  writeFileSync(join(output,notice),'Crypto and HTTP use the pinned GnuTLS, Nettle and GMP libraries under their accompanying licenses. HTTP also uses libwebsockets and the operating system zlib.\nThe crypto dependencies remain replaceable dynamic libraries in lib/. Corresponding upstream source archives, August runtime sources and maintainer build recipes are in sources/.\nThe compiler pack and each crypto/HTTP deployment retain these files. Native build tools are needed only to rebuild these components.\n');files.push(notice);metadata.push(notice);
  const instructions='sources/BUILD.md';
  writeFileSync(join(output,instructions),'# Rebuild the runtime components\n\nThese are maintainer steps on macOS ARM64 with Xcode, Node 24+, make and m4. Ordinary August consumers use the prebuilt components.\n\nThe original pinned library archives are beside this file. August runtime sources and the complete build recipes are in `august/`. To rebuild, enter that folder, make `.aug-native/downloads`, copy the adjacent library archives into it, then run:\n\n```sh\nMACOSX_DEPLOYMENT_TARGET=14.0 node scripts/bootstrap-native.mjs\nnode scripts/build-runtime-pack.mjs\n```\n\nBootstrap verifies the source archives and obtains any missing build utilities. It does not install them system-wide. The component builder checks minimum OS versions, rewrites library dependencies to `@rpath`, and signs the resulting copies. Its generated pointer bridges come from `src/runtime-adapters.ts`. The original dependency libraries in the build cache remain unchanged.\n\nApplication deployments keep dependency libraries replaceable in `lib/`, with these sources and notices under `share/august-native/`. Review the accompanying library licenses when redistributing a deployment.\n');files.push(instructions);metadata.push(instructions);
  return {files,components:{crypto:{libraries:[crypto],runtimeFiles:names.map(name=>'lib/'+name),metadata},http:{libraries:[http],runtimeFiles:names.map(name=>'lib/'+name),metadata}}};
}
