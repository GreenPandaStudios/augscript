import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildProbe,buildWorkerWait,configuration,nativeEvidence,rssSummary} from '../scripts/runtime-reliability.mjs';

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
