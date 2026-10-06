import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {conformanceLedger} from '../scripts/conformance-ledger.mjs';
import {validateCorpus,compilerIdentity,checkCleanupCounts,coverageSummary,runConformance,preparedInputIdentity,requirePreparedIdentity} from '../scripts/check-language-conformance.mjs';
const root=resolve('.');
function ledger(callback){
 const directory=mkdtempSync(join(tmpdir(),'aug-ledger-')),manifest=JSON.parse(readFileSync('conformance/rules.json'));
 try{
  const paths=['conformance/rules.json','conformance/cases.json','docs/grammar.md',...manifest.rules.map(r=>'docs/'+r.reference.split('#')[0]),...manifest.rules.flatMap(r=>r.regressions.map(e=>e.file))];
  for(const path of new Set(paths)){mkdirSync(dirname(join(directory,path)),{recursive:true});cpSync(join(root,path),join(directory,path));}
  callback(directory,manifest);
 }finally{rmSync(directory,{recursive:true,force:true});}
}
test('conformance ledger covers every grammar production with existing named regressions',()=>{
 const {manifest,corpus}=conformanceLedger(root);assert.ok(manifest.rules.length>100);validateCorpus(corpus);
 assert.match(compilerIdentity(root),/^[a-f0-9]{64}$/);
});
test('conformance ledger rejects renamed regressions, omitted grammar and missing reference pages',()=>ledger((directory,manifest)=>{
 const check=(change,expected)=>{const candidate=structuredClone(manifest);change(candidate);writeFileSync(join(directory,'conformance/rules.json'),JSON.stringify(candidate));assert.throws(()=>conformanceLedger(directory),expected);};
 check(c=>c.rules[0].regressions[0].test='no such test',/no test named/);
 check(c=>c.rules[0].productions=[],/Every documented grammar/);
 check(c=>c.rules[0].reference='no-such-guide.md',/no reference page/);
 check(c=>c.rules[0].cases=['not-in-corpus'],/unknown acceptance/);
}));
test('independent conformance oracles reject empty domains, conflicting expectations and unsafe paths',()=>{
 const original=JSON.parse(readFileSync('conformance/cases.json'));
 const check=change=>{const c=structuredClone(original);change(c);assert.throws(()=>validateCorpus(c));};
 check(c=>c.cases=[]);check(c=>c.cases.push(c.cases[0]));
 check(c=>c.cases[0].diagnostic='TYPE');check(c=>delete c.cases[0].stdout);
 check(c=>c.cases[0].files['../escape.aug']='print(value=1)');
 check(c=>c.mutations[0].before='not in original');
 check(c=>c.mutations[0].after=c.mutations[0].before);
 check(c=>c.mutations=[]);check(c=>delete c.mutations);
 check(c=>c.mutations[1].id=c.mutations[0].id);
 check(c=>c.mutations[0].before='');
 check(c=>c.cases.find(x=>x.stdout!==undefined).drops={});
 check(c=>c.cases.find(x=>x.stdout!==undefined).drops={Guard:0});
 check(c=>c.cases.find(x=>x.diagnostic).drops={Guard:1});
});


test('native cleanup oracles reject omitted and repeated destruction',()=>{
 const example={id:'owned-cleanup',drops:{Guard:2,Shared:1}};
 assert.deepEqual(checkCleanupCounts(example,'drop: operation.aug:Guard\ndrop: operation.aug:Guard\ndrop: Shared\n'),{Guard:2,Shared:1});
 for(const stderr of ['','drop: Guard\ndrop: Shared\n','drop: Guard\ndrop: Guard\ndrop: Guard\ndrop: Shared\n'])assert.throws(()=>checkCleanupCounts(example,stderr),/must drop exactly/);
});
test('conformance coverage separates independent programs from linked regressions',()=>{
 const {manifest}=conformanceLedger(root),coverage=coverageSummary(manifest);
 assert.equal(coverage.totalRules,manifest.rules.length);
 assert.equal(coverage.independentRules.length+coverage.regressionOnlyRules.length,coverage.totalRules);
 assert.ok(coverage.independentRules.some(rule=>rule.id==='FORWARD'));
 assert.ok(coverage.regressionOnlyRules.some(rule=>rule.id==='NATIVE'));
 assert.match(coverage.regressionExecution,/not executed by this command/);
});
test('conformance identity includes runtime, dependency pins, oracle and grammar and ignores generated caches',()=>{
 const directory=mkdtempSync(join(tmpdir(),'aug-conformance-identity-'));
 try{
  for(const folder of ['src','runtime','benchmarks','gyms','scripts','native','tests','.github','conformance','docs'])mkdirSync(join(directory,folder));
  for(const file of ['package-lock.json','tsconfig.json','conformance/cases.json','conformance/rules.json','docs/grammar.md','runtime/core.c','scripts/native-dependencies.lock.json'])writeFileSync(join(directory,file),'base');
  writeFileSync(join(directory,'package.json'),'{"version":"0.23.0"}');
  const original=compilerIdentity(directory);
  for(const file of ['runtime/core.c','scripts/native-dependencies.lock.json','conformance/cases.json','conformance/rules.json','docs/grammar.md']){
   writeFileSync(join(directory,file),'changed');assert.notEqual(compilerIdentity(directory),original,file);writeFileSync(join(directory,file),'base');
  }
  mkdirSync(join(directory,'src/.aug-spec'));writeFileSync(join(directory,'src/.aug-spec/copied.aug'),'generated');assert.equal(compilerIdentity(directory),original);
  rmSync(join(directory,'docs/grammar.md'));symlinkSync(join(directory,'conformance/rules.json'),join(directory,'docs/grammar.md'));
  assert.throws(()=>compilerIdentity(directory),/must not be symbolic links/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});


test('a rejected qualification invalidates an earlier passing report before input validation',()=>{
 const directory=mkdtempSync(join(tmpdir(),'aug-conformance-rejection-'));
 try{
  mkdirSync(join(directory,'.aug-build'));
  writeFileSync(join(directory,'package.json'),'{"version":"0.23.0"}');
  writeFileSync(join(directory,'.aug-build/language-conformance.json'),'{"passed":true,"status":"passed"}');
  symlinkSync('/nonexistent/canonical-source',join(directory,'src'));
  assert.throws(()=>runConformance(directory),/must not be symbolic links/);
  const result=JSON.parse(readFileSync(join(directory,'.aug-build/language-conformance.json')));
  assert.equal(result.status,'failed');assert.equal(result.passed,false);assert.match(result.failure,/must not be symbolic links/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});


test('prepared-input checks reject coherent same-source runtime replacement and tool changes',()=>{
 const directory=mkdtempSync(join(tmpdir(),'aug-conformance-prepared-')),tools=join(directory,'tools'),runtime=join(directory,'runtime');
 try{
  mkdirSync(join(tools,'bin'),{recursive:true});mkdirSync(runtime);
  writeFileSync(join(tools,'bin/llc'),'tool');writeFileSync(join(runtime,'core.a'),'original');
  const manifest=bytes=>JSON.stringify({sourceSha256:'a'.repeat(64),files:{'core.a':bytes}});
  writeFileSync(join(runtime,'runtime.json'),manifest('original-hash'));
  const expected=preparedInputIdentity(tools,runtime,['llc'],['core.a']);
  const verify=()=>requirePreparedIdentity(expected,tools,runtime,['llc'],['core.a']);verify();
  // Replace both manifest and artifact while retaining the source identity.
  writeFileSync(join(runtime,'runtime.json'),manifest('replacement-hash'));writeFileSync(join(runtime,'core.a'),'replacement');
  assert.throws(verify,/runtime changed during qualification/);
  writeFileSync(join(runtime,'runtime.json'),manifest('original-hash'));writeFileSync(join(runtime,'core.a'),'original');verify();
  writeFileSync(join(tools,'bin/llc'),'replacement');assert.throws(verify,/tools or runtime changed/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});
