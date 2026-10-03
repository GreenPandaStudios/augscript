import test from 'node:test';
import assert from 'node:assert/strict';
import {generateGyms, negativeContracts} from '../gyms/corpus.mjs';
import {measureBatch} from '../scripts/batch-load.mjs';
import {kernels} from '../benchmarks/kernels.mjs';
import {qualificationIdentity} from '../scripts/qualification-identity.mjs';
import {mkdirSync,mkdtempSync,writeFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

test('qualification fingerprints native entry code, import stubs, configuration, fixtures and dependency pins',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-qualification-identity-'));
  try{
    for(const folder of ['src','runtime','benchmarks','gyms','scripts','native','tests','.github'])mkdirSync(join(root,folder),{recursive:true});
    for(const path of ['package-lock.json','tsconfig.json'])writeFileSync(join(root,path),'{}');
    writeFileSync(join(root,'package.json'),'{"version":"0.21.0"}');
    const paths=['native/entry.S','native/libSystem.tbd','benchmarks/main.yaml','.github/ci.yml','tests/case.mjs','package-lock.json'];
    for(const path of paths)writeFileSync(join(root,path),'base');
    const original=qualificationIdentity(root).sourceSha256;
    for(const path of paths){
      writeFileSync(join(root,path),'changed');
      assert.notEqual(qualificationIdentity(root).sourceSha256,original,path+': omitted effective input');
      writeFileSync(join(root,path),'base');assert.equal(qualificationIdentity(root).sourceSha256,original);
    }
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('qualification ignores generated nested caches and rejects ambiguous canonical symlinks',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-qualification-caches-'));
  try{
    for(const folder of ['src','runtime','benchmarks','gyms','scripts','native','tests','.github'])mkdirSync(join(root,folder),{recursive:true});
    for(const path of ['package-lock.json','tsconfig.json'])writeFileSync(join(root,path),'{}');
    writeFileSync(join(root,'package.json'),'{"version":"0.22.0"}');
    const original=qualificationIdentity(root).sourceSha256;
    for(const folder of ['.aug-spec','.aug-packages','node_modules','target','dist']){
      const cache=join(root,'src/stdlib/json',folder);mkdirSync(cache,{recursive:true});
      writeFileSync(join(cache,'copied.aug'),'generated declaration');
      assert.equal(qualificationIdentity(root).sourceSha256,original,'Cache altered canonical compiler identity: '+folder);
    }
    symlinkSync('/nonexistent/qualification-cache',join(root,'src/stdlib/json/.aug-native'));
    assert.equal(qualificationIdentity(root).sourceSha256,original);
    writeFileSync(join(root,'src/stdlib/json/contracts.aug'),'canonical declaration');
    assert.notEqual(qualificationIdentity(root).sourceSha256,original);
    symlinkSync('/nonexistent/qualification-source',join(root,'src/stdlib/json/alias.aug'));
    assert.throws(()=>qualificationIdentity(root),/must not be symbolic links/);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('gym generators are reproducible and reject empty or invalid domains',()=>{
  assert.deepEqual(generateGyms(123,16),generateGyms(123,16));
  assert.notDeepEqual(generateGyms(123,16),generateGyms(124,16));
  for(const [seed,count] of [[-1,16],[1,0],[NaN,16],[1,1.5]])assert.throws(()=>generateGyms(seed,count));
  const fixtures=generateGyms(123,16);
  assert.ok(fixtures.length>=4);
  for(const fixture of fixtures){
    assert.ok(fixture.expected.length>0&&fixture.vectors>0);
    assert.ok(fixture.mutant&&fixture.mutant.files);
    assert.notDeepEqual(fixture.mutant.files,fixture.files);
  }
  assert.ok(negativeContracts.length>=6);
});

test('batch measurements verify every result, retain raw samples and reject empty suites',()=>{
  assert.throws(()=>measureBatch({variants:[],iterations:3,warmup:1,expected:'7\n'}));
  const variants=[{name:'independent',command:process.execPath,args:['-e','console.log(7)']}];
  const result=measureBatch({variants,iterations:3,warmup:1,expected:'7\n'});
  assert.equal(result.length,1);assert.equal(result[0].milliseconds.samples.length,3);
  assert.ok(result[0].milliseconds.median>0);
  assert.throws(()=>measureBatch({variants,iterations:3,warmup:1,expected:'8\n'}));
});

test('expanded benchmarks have distinct operations and independent expected results',()=>{
  assert.equal(new Set(kernels.map(item=>item.name)).size,kernels.length);
  assert.ok(kernels.length>=8);
  for(const item of kernels){
    assert.ok(item.count>0);
    assert.ok(item.expected(item.count).endsWith('\n'));
    assert.notEqual(item.expected(item.count),item.expected(item.count+1),item.name+': size must affect the checked result');
  }
});
