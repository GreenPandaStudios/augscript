import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync,mkdirSync,cpSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {runtimeRecipeFiles,runtimeSourceIdentity} from '../scripts/runtime-pack-identity.mjs';
import {buildProbe,buildWorkerWait,configuration,nativeEvidence,rssSummary,observe,completed} from '../scripts/runtime-reliability.mjs';

test('runtime qualification rejects empty domains, missing values and unsupported profiles',()=>{
  for(const args of [['--cycles','0'],['--rounds','0'],['--seconds','NaN'],['--seconds','0'],['--profile','unknown'],['--seconds'],['--rounds','2','--rounds','5'],['--unexpected','1']])
    assert.throws(()=>configuration(args),undefined,args.join(' '));
});
const sample={cycles:5,allocations:20,releases:20,liveBlocks:0,liveBytes:0,peakBytes:4096,acquired:5,released:5,cases:[1,1,1,1,1],elapsedSeconds:2,final:true};
test('runtime evidence rejects outstanding allocations, missed cleanup, omitted cases and incomplete duration',()=>{
  const accepted=nativeEvidence(JSON.stringify(sample),{cycles:5,seconds:2});assert.equal(accepted.final.cycles,5);
  for(const change of [{liveBytes:1},{liveBlocks:1},{releases:19},{released:4},{cases:[5,0,0,0,0]},{final:false},{elapsedSeconds:1},{allocations:NaN}])
    assert.throws(()=>nativeEvidence(JSON.stringify({...sample,...change}),{cycles:5,seconds:2}));
  assert.throws(()=>nativeEvidence(''));assert.throws(()=>nativeEvidence('{}'));
});
test('RSS qualification reports growth and rejects missing or malformed measurements',()=>{
  const samples=Array.from({length:20},(_,i)=>({elapsedSeconds:i,bytes:i<10?1024:2048}));
  assert.equal(rssSummary(samples,{required:true,budget:1024}).growthBytes,1024);
  assert.throws(()=>rssSummary(samples,{budget:512}),/growth/);
  assert.throws(()=>rssSummary([],{required:true}),/incomplete/);
  assert.throws(()=>rssSummary([{elapsedSeconds:1,bytes:NaN}]),/Invalid/);
  assert.equal(rssSummary(samples,{budget:null}).budgetEnforced,false);
});
for(const optimization of ['-O0','-O2'])test('completed worker event between polls does not become a deadlock ('+optimization+')',()=>{
  const root=resolve('.'),directory=mkdtempSync(join(tmpdir(),'aug-wait-event-'));
  try{
    const {binary}=buildWorkerWait(root,directory,{optimization});
    const result=spawnSync(binary,[],{encoding:'utf8',timeout:15000,env:{...process.env,AUG_WORKERS:'1'}});
    assert.equal(result.status,0,result.stderr||result.error?.message);assert.equal(result.stdout,'worker waits completed\n');
  }finally{rmSync(directory,{recursive:true,force:true});}
});
test('repeated native heap lifecycles balance allocations and detect an actual retained allocation',()=>{
  const root=resolve('.'),directory=mkdtempSync(join(tmpdir(),'aug-reliability-core-'));
  try{
    for(const optimization of ['-O0','-O2']){
      const built=buildProbe(root,join(directory,optimization),{optimization});
      for(const pool of [1,4]){
        const result=spawnSync(built.binary,['100','0'],{encoding:'utf8',timeout:20000,env:{...process.env,AUG_WORKERS:String(pool)}});
        assert.equal(result.status,0,result.stderr||result.error?.message);
        assert.equal(nativeEvidence(result.stdout,{cycles:100}).final.liveBytes,0);
      }
    }
    const built=buildProbe(root,join(directory,'retention-control'),{control:'AUG_PROBE_LEAK_CONTROL'});
    const result=spawnSync(built.binary,['5','0'],{encoding:'utf8',timeout:20000,env:{...process.env,AUG_WORKERS:'1'}});
    assert.equal(result.status,2);assert.match(result.stderr,/outstanding runtime allocation at quiescence/);
  }finally{rmSync(directory,{recursive:true,force:true});}
});
test('a rejected qualification replaces a previous accepted result with a failed report',()=>{
  const root=resolve('.'),directory=mkdtempSync(join(tmpdir(),'aug-reliability-report-')),output=join(directory,'results.json');
  try{
    writeFileSync(output,JSON.stringify({status:'passed',sourceSha256:'previous'}));
    const result=spawnSync(process.execPath,[join(root,'scripts/qualify-runtime.mjs'),'--cycles','0','--output',output],{encoding:'utf8',timeout:15000});
    assert.notEqual(result.status,0);const report=JSON.parse(readFileSync(output));assert.equal(report.status,'failed');assert.match(report.failure,/Invalid cycles/);
  }finally{rmSync(directory,{recursive:true,force:true});}
});

test('runtime identity detects changed component headers, sources, locks, platform and newly added inputs',()=>{
  const root=resolve('.'),directory=mkdtempSync(join(tmpdir(),'aug-runtime-identity-'));
  try{
    cpSync(join(root,'runtime'),join(directory,'runtime'),{recursive:true});
    for(const file of runtimeRecipeFiles()){
      mkdirSync(dirname(join(directory,file)),{recursive:true});cpSync(join(root,file),join(directory,file));
    }
    for(const file of ['minicoro/minicoro.h','minicoro/LICENSE','yyjson/src/yyjson.c','yyjson/src/yyjson.h','yyjson/LICENSE']){
      const path='.aug-native/sources/'+file;mkdirSync(dirname(join(directory,path)),{recursive:true});cpSync(join(root,path),join(directory,path));
    }
    const output=join(directory,'pack');mkdirSync(join(output,'sources/august/runtime'),{recursive:true});
    const archived='sources/august/runtime/aug_http_ir.h';cpSync(join(root,'runtime/aug_http_ir.h'),join(output,archived));
    const before=runtimeSourceIdentity(directory,output,[archived]);
    assert.ok(runtimeRecipeFiles().includes('scripts/runtime-pack-identity.mjs'),'Rebuild recipe omits its helper');
    for(const platform of ['darwin','linux'])for(const file of ['scripts/prepare-linux-runtimes.mjs','scripts/prepare-patched-libstdcxx.mjs','native/gcc12-aligned-new.patch','native/tests/aligned-new-overflow.cpp'])
      assert.ok(runtimeRecipeFiles(platform,'arm64').includes(file),'Static import or patched runtime material omitted from '+platform+' recipe: '+file);
    const platform=runtimeRecipeFiles().find(file=>file.startsWith('native/platform/'));
    for(const path of ['runtime/aug_http_ir.h','runtime/aug_crypto.c','scripts/native-dependencies.lock.json','scripts/prepare-patched-libstdcxx.mjs','native/gcc12-aligned-new.patch','native/tests/aligned-new-overflow.cpp',platform]){
      const file=join(directory,path),original=readFileSync(file);
      writeFileSync(file,Buffer.concat([original,Buffer.from('\nchanged build input\n')]));
      assert.notEqual(runtimeSourceIdentity(directory,output,[archived]),before,path);writeFileSync(file,original);
    }
    writeFileSync(join(directory,'runtime/additional.c'),'new input');assert.notEqual(runtimeSourceIdentity(directory,output,[archived]),before);
  }finally{rmSync(directory,{recursive:true,force:true});}
});
test('failed child observations retain raw RSS and status for replay',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'aug-observation-')),log=join(directory,'rejected');
  try{
    const args=['-e','setTimeout(()=>process.exit(2),600)'];
    const result=await observe(process.execPath,args,{log,timeoutMs:5000});
    assert.equal(result.status,2);assert.throws(()=>completed(result));
    const saved=JSON.parse(readFileSync(log+'.observation.json'));
    assert.deepEqual(saved.rss,result.rss);assert.ok(saved.rss.length>0);assert.equal(saved.status,2);
    assert.equal(saved.command,process.execPath);assert.deepEqual(saved.args,args);
  }finally{rmSync(directory,{recursive:true,force:true});}
});
