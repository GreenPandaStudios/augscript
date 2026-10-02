#!/usr/bin/env node
// Installed CLI gate. --local-compiler substitutes only unpublished compiler transport.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,cpSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..'),directory=mkdtempSync(join(root,'.aug-build/worker-consumer-'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const packages=JSON.parse(readFileSync(join(root,'dist/release/packages.json'))),archive=packages.find(p=>p.directory==='cli');
const env={...process.env,PATH:'/nonexistent',SDKROOT:'/nonexistent',DEVELOPER_DIR:'/nonexistent',AUG_WORKERS:'2',AUG_PACKAGE_CACHE:join(directory,'sources'),AUG_NATIVE_ARTIFACT_CACHE:join(directory,'artifacts')};
for(const key of ['AUG_GIT','AUG_LLVM_HOME','AUG_RUNTIME_PACK','AUG_NATIVE_HOME'])delete env[key];
const run=(command,args,options={})=>{const result=spawnSync(command,args,{cwd:directory,encoding:'utf8',timeout:240000,...options});assert.equal(result.status,0,result.stderr||result.error?.message);return result.stdout;};
const report={format:1,target:process.platform+'-'+process.arch,compiler:archive.version,cliArchiveSha256:archive.sha256,compilerTransport:process.argv.includes('--local-compiler')?'reviewed local candidate':'public release',toolsUnavailable:true,outcomes:[],passed:false};
try{
 assert.equal(sha(readFileSync(join(root,'dist/release',archive.filename))),archive.sha256);
 writeFileSync(join(directory,'package.json'),'{}\n');
 run('npm',['install','--ignore-scripts','--no-audit','--no-fund',...packages.map(p=>join(root,'dist/release',p.filename))],{env:{...process.env,npm_config_cache:join(directory,'npm-cache')}});
 const compiler=join(directory,'node_modules/@greenpandastudios/aug-cli'),cli=join(compiler,'bin/aug.mjs');
 const manifest=JSON.parse(readFileSync(join(compiler,'native/compiler-packs.json'))),pack=manifest.packs.find(p=>p.host===report.target);assert.ok(pack);
 report.compilerArchiveSha256=pack.archive.sha256;
 if(process.argv.includes('--local-compiler')){
  const {prepareLLVMCompiler}=await import(pathToFileURL(join(compiler,'src/compiler-packs.js')));
  const fetch=globalThis.fetch,settings={};
  for(const key of ['AUG_NATIVE_ARTIFACT_CACHE','AUG_LLVM_HOME','AUG_RUNTIME_PACK'])settings[key]=process.env[key];
  process.env.AUG_NATIVE_ARTIFACT_CACHE=env.AUG_NATIVE_ARTIFACT_CACHE;delete process.env.AUG_LLVM_HOME;delete process.env.AUG_RUNTIME_PACK;
  globalThis.fetch=async(input,options)=>String(input)===pack.archive.url?new Response(readFileSync(join(root,'.aug-build',new URL(pack.archive.url).pathname.split('/').at(-1)))):fetch(input,options);
  try{await prepareLLVMCompiler();}finally{globalThis.fetch=fetch;for(const [key,value] of Object.entries(settings))if(value===undefined)delete process.env[key];else process.env[key]=value;}
 }
 const cpu=join(directory,'cpu');mkdirSync(cpu);
 writeFileSync(join(cpu,'math.aug'),'total(List<int> values):\n    int sum = 0\n    for value in values:\n        sum = sum + value\n    return sum\n');
 writeFileSync(join(cpu,'main.aug'),'import total from math\nscope:\n    first = start worker total(values=[4, 6])\n    second = start worker total(values=[2, 3])\n    wait for first and second as left and right\n    print(value=left)\n    print(value=right)\n');
 const aug=(...args)=>run(process.execPath,[cli,...args],{env});
 for(const mode of ['debug','release']){
  writeFileSync(join(cpu,'main.yaml'),'optimization: '+mode+'\n');assert.equal(aug('run',cpu),'10\n5\n');report.outcomes.push({program:'cpu-workers',optimization:mode,passed:true});
 }
 if(process.argv.includes('--gpu')){
  assert.equal(report.target,'darwin-arm64','Metal qualification requires an Apple Silicon host');
  const gpu=join(directory,'gpu');mkdirSync(gpu);for(const file of ['main.aug','compute.aug'])cpSync(join(root,'examples/native-gpu',file),join(gpu,file));
  for(const mode of ['debug','release']){
   writeFileSync(join(gpu,'main.yaml'),'optimization: '+mode+'\n');assert.equal(aug('run',gpu),'5\n7\n9\n11\n22\n');report.outcomes.push({program:'real-metal-workers',optimization:mode,passed:true});
  }
  const lock=JSON.parse(readFileSync(join(gpu,'aug.lock.json')));report.gpuSources=lock.packages.map(p=>({name:p.name,version:p.version,digest:p.digest}));report.gpuSourceRevisions=lock.git.map(p=>({repository:p.repository,revision:p.revision,commit:p.commit}));report.gpuNative=lock.native;
 }else report.gpu='not selected; requires real hardware qualification';
 report.passed=true;console.log('Installed CLI workers passed with native tools hidden'+(process.argv.includes('--gpu')?', including public GPU source and artifact imports.':'.'));
}catch(error){report.failure=error.message;throw error;}finally{writeFileSync(join(root,'.aug-build/worker-consumer-qualification.json'),JSON.stringify(report,null,2)+'\n');rmSync(directory,{recursive:true,force:true});}
