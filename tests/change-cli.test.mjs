import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {analyzeChangeProject,projectRevision} from '../src/change-context.ts';
import {withSourceWriter,beginSourceRead,finishSourceRead} from '../src/source-transaction.ts';
import {suggestedFixes} from '../src/fixes.ts';
import {installPackagesWithNative} from '../src/package-manager.ts';
const cli=new URL('../bin/aug.mjs',import.meta.url).pathname;
function fixture(t){const root=mkdtempSync(join(tmpdir(),'aug-change-cli-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 writeFileSync(join(root,'main.aug'),'import dispatch from gateway\nprint(value=dispatch(value=3))\n');
 writeFileSync(join(root,'core.aug'),'increment(int value) returns int { return value + 1 }\n');
 writeFileSync(join(root,'gateway.aug'),'import increment from core\nforward dispatch to increment\n\ntest dispatch { when acceptance { it increments { assert(condition=dispatch(value=3) == 4) } } }\n');return root;}
const run=(root,...args)=>spawnSync(process.execPath,[cli,...args],{cwd:root,encoding:'utf8',timeout:30000});
test('CLI context, plan, independent check and apply exchange exact revision-bearing JSON',t=>{
 const root=fixture(t),context=run(root,'change','context',root,'--file','core.aug','--name','increment','--json');assert.equal(context.status,0,context.stderr);
 const packet=JSON.parse(context.stdout);assert(packet.coverage.requiredContextComplete);assert(packet.compilerBuild);assert(!context.stdout.includes(root));
 const symbols=JSON.parse(run(root,'symbols',root).stdout),alias=symbols.find(symbol=>symbol.id==='gateway.aug:dispatch');
 assert.equal(alias.kind,'forward');assert.equal(alias.contract.inputs[0].label,'value');assert.equal(alias.contract.provenance.inputs,'inherited');
 assert.equal(alias.forwarding.immediate.id,'core.aug:increment');assert.equal(alias.forwarding.implementation.id,'core.aug:increment');
 const request={baseRevision:packet.revision,root:'core.aug:increment',editScope:['core.aug','gateway.aug'],operations:[{kind:'rename',symbol:'core.aug:increment',name:'increase'}],
 expectedPublicDelta:{kind:'rename',from:'core.aug:increment',to:'core.aug:increase'},requirements:[{id:'R1',text:'Preserve amount adjustment.'}],
 verification:{tests:[{group:'acceptance',requirements:['R1']}],provenance:{source:'Independent increment case',independence:'independent fixture'}}};
 writeFileSync(join(root,'request.json'),JSON.stringify(request));const plan=run(root,'change','plan',root,'request.json');assert.equal(plan.status,0,plan.stdout+plan.stderr);
 const parsed=JSON.parse(plan.stdout);assert(parsed.exchange.specification.readOnly);assert.equal(parsed.exchange.requirements[0].id,'R1');assert.equal(parsed.exchange.acceptance.length,1);assert(parsed.exchange.idioms.compiler);
 writeFileSync(join(root,'plan.json'),plan.stdout);const checked=run(root,'change','check',root,'plan.json');assert.equal(checked.status,0,checked.stdout);assert(readFileSync(join(root,'core.aug'),'utf8').startsWith('increment('));
 const applied=run(root,'change','apply',root,'plan.json');assert.equal(applied.status,0,applied.stdout);assert.equal(JSON.parse(applied.stdout).status,'committed');
 const stale=run(root,'change','apply',root,'plan.json');assert.equal(stale.status,1);assert.equal(JSON.parse(stale.stdout).code,'CHANGE_STALE');
});
test('reader epochs and independent processes refuse concurrent writers',async t=>{
 const root=fixture(t),old=beginSourceRead(root);withSourceWriter(root,()=>{});assert.throws(()=>finishSourceRead(root,old),error=>error.code==='CHANGE_BUSY');
 const module=new URL('../src/source-transaction.ts',import.meta.url).href;
 const script=`import {withSourceWriter} from ${JSON.stringify(module)};try {withSourceWriter(process.argv[1],()=>process.stdout.write('acquired'));}catch(error){process.stdout.write(error.code);process.exitCode=1;}`;
 withSourceWriter(root,()=>{const child=spawnSync(process.execPath,['--input-type=module','-e',script,root],{encoding:'utf8',timeout:3000});assert.equal(child.status,1,child.stderr);assert.equal(child.stdout,'CHANGE_BUSY');});
 const checked=analyzeChangeProject(root);withSourceWriter(root,()=>{});assert.throws(()=>projectRevision(checked.project),error=>error.code==='CHANGE_BUSY');
});
test('binding and assignment-as-condition mistakes have parser diagnostics and deterministic syntax fixes',t=>{
 const root=fixture(t);for(const [source,code,after]of [
 ['example() { let value = 3; return value }\n','BINDING','example() { value = 3; return value }\n'],
 ['example(int x) { if x = 3 { return 1 } return 0 }\n','CONDITION','example(int x) { if x == 3 { return 1 } return 0 }\n']]){
  const file=join(root,'example.aug');writeFileSync(file,source);const checked=analyzeChangeProject(root);assert(checked.diagnostics.some(issue=>issue.code===code));
  const fix=suggestedFixes(checked,file).find(fix=>fix.issue.code===code);let candidate=after;
  if(code==='CONDITION')assert.equal(fix,undefined,'The author must choose the intended comparison.');
  else {assert(fix);candidate=source;for(const edit of fix.edits)candidate=candidate.slice(0,edit.start)+edit.text+candidate.slice(edit.end);assert.equal(candidate,after);}
  writeFileSync(file,candidate);assert.deepEqual(analyzeChangeProject(root).diagnostics,[]);
 }
});
test('package installation respects an independent checked source writer',t=>{
 const root=fixture(t);
 withSourceWriter(root,()=>{
  const installed=run(root,'install','--offline');
  assert.equal(installed.status,1,installed.stdout+installed.stderr);
  assert.match(installed.stderr,/checked source change is in progress/);
 });
 assert.equal(run(root,'install','--offline').status,0);
});
test('native package verification holds the source permit across asynchronous work',async t=>{
 const root=fixture(t),start=beginSourceRead(root);
 const pending=installPackagesWithNative(root,false,true);
 assert.throws(()=>beginSourceRead(root),error=>error.code==='CHANGE_BUSY');
 assert.throws(()=>withSourceWriter(root,()=>{}),error=>error.code==='CHANGE_BUSY');
 const reader=run(root,'check');assert.equal(reader.status,1);assert.match(reader.stderr,/checked source change is in progress/);
 await pending;
 assert.throws(()=>finishSourceRead(root,start),error=>error.code==='CHANGE_BUSY');
 assert.equal(run(root,'check').status,0);
});
