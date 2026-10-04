#!/usr/bin/env node
/* Maintainer qualification uses real libraries. --local-artifacts substitutes
   only release transport before publication; it is never consumer installation. */
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {prepareNativePackages} from '../src/native-artifacts.ts';
import {prepareLLVMCompiler} from '../src/compiler-packs.ts';
import {installPackages} from '../src/package-manager.ts';

const compiler=resolve(import.meta.dirname,'..');
const parent=process.argv[2]&&resolve(process.argv[2]);
if(!parent)throw new Error('Usage: node scripts/qualify-native.mjs PACKAGE_REPOSITORY_PARENT [--local-artifacts]');
const local=process.argv.includes('--local-artifacts'),names=['pytorch','sqlite','zlib','blake3'];
const archives=new Map();
if(local){
  const tools=JSON.parse(readFileSync(join(compiler,'native/compiler-packs.json')));
  archives.set(tools.packs[0].archive.url,join(compiler,'.aug-build/aug-llvm-macos-arm64.tar.gz'));
  for(const name of names){
    const root=join(parent,'aug-'+name),manifest=JSON.parse(readFileSync(join(root,'aug-package.json')));
    archives.set(manifest.native.artifacts[0].url,join(root,'.aug-build/native/native-macos-arm64.tar.gz'));
  }
}
const originalFetch=globalThis.fetch;
if(local)globalThis.fetch=async(input,options)=>{
  const file=archives.get(String(input));
  return file?new Response(readFileSync(file)):originalFetch(input,options);
};
const outcomes=[];
try{
  for(const name of names){
    const root=join(parent,'aug-'+name);
    installPackages(root);
    await prepareNativePackages(root);
    await prepareLLVMCompiler(false,{root});
    const env={...process.env,PATH:'/nonexistent',SDKROOT:'/nonexistent',DEVELOPER_DIR:'/nonexistent'};
    delete env.AUG_LLVM_HOME;delete env.AUG_RUNTIME_PACK;delete env.AUG_GIT;
    const args=[join(compiler,'bin/aug.mjs'),'test',root,'--offline','--frozen','--json'];
    const run=spawnSync(process.execPath,args,{encoding:'utf8',env,timeout:120000});
    if(run.status!==0)throw new Error(name+': '+(run.stderr||run.stdout||run.error?.message));
    const result=JSON.parse(run.stdout);
    outcomes.push({package:name,results:result});
    console.log(name+': '+run.stdout.trim());
  }
}finally{globalThis.fetch=originalFetch;}
const output=join(compiler,'.aug-build/native-qualification.json');mkdirSync(resolve(output,'..'),{recursive:true});
writeFileSync(output,JSON.stringify({format:1,host:process.platform+'-'+process.arch,transport:local?'local-release-assets':'public-release-assets',nativeToolingOnPath:false,compiler:JSON.parse(readFileSync(join(compiler,'package.json'))).version,outcomes},null,2)+'\n');
console.log('Qualification report: '+output);
