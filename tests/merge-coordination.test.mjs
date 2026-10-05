import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {withSourceWriter as mechanicalWriter,publishSourceChange,sourceImage} from '../src/source-transactions.ts';
import {withSourceWriter as requestWriter,withSourceWriterAsync,beginSourceRead} from '../src/source-transaction.ts';
import {recoverAnySourceChange} from '../src/source-recovery.ts';
import {SemanticWorkspace} from '../src/semantic.ts';
import {planChangeRenameSymbol,planChangeReplaceBody} from '../src/checked-changes.ts';

function fixture(t){const root=mkdtempSync(join(tmpdir(),'aug-merge-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 writeFileSync(join(root,'main.aug'),'import dispatch from gateway\nprint(value=dispatch(value=3))\n');
 writeFileSync(join(root,'core.aug'),'increment(int value) returns int { return value + 1 }\n');
 writeFileSync(join(root,'gateway.aug'),'import increment from core\nforward dispatch to increment\n');return root;}

test('request and mechanical writers exclude each other in both directions',t=>{
 const root=fixture(t);
 mechanicalWriter(root,()=>assert.throws(()=>requestWriter(root,()=>{}),error=>error.code==='CHANGE_BUSY'));
 requestWriter(root,()=>assert.throws(()=>mechanicalWriter(root,()=>{}),error=>error.code==='CHANGE_BUSY'));
});
test('asynchronous request writer holds the common lock until completion',async t=>{
 const root=fixture(t);let done;const gate=new Promise(resolve=>done=resolve);
 const work=withSourceWriterAsync(root,async()=>await gate);
 assert.throws(()=>mechanicalWriter(root,()=>{}),error=>error.code==='CHANGE_BUSY');
 done();await work;mechanicalWriter(root,()=>{});
});
test('request readers reject an unfinished mechanical postimage and recovery recognizes it',t=>{
 const root=fixture(t),file='core.aug',before=readFileSync(join(root,file),'utf8');
 const image=sourceImage(root,file,before.replace('+ 1','+ 2'));
 mechanicalWriter(root,()=>publishSourceChange(root,[image],'a'.repeat(64),'b'.repeat(64),()=>{
  assert.equal(new SemanticWorkspace(root).document(join(root,"main.aug"),undefined,true).diagnostics.length,0);
 },event=>{if(event.phase==='written')assert.throws(()=>beginSourceRead(root),error=>error.code==='CHANGE_BUSY');}));
 assert.equal(recoverAnySourceChange(root).status,'clean');assert.equal(readFileSync(join(root,file),'utf8'),image.after);
});
test('bounded context shows forwarding provenance and callers without fabricated source occurrences',t=>{
 const root=fixture(t),workspace=new SemanticWorkspace(root),document=workspace.document(join(root,"core.aug"),undefined,true);
 assert.deepEqual(document.diagnostics,[]);
 const graph=document.graph(),alias=graph.symbols.find(symbol=>symbol.id==='gateway.aug:dispatch');assert.equal(alias.kind,'forward');
 assert(graph.relationships.some(edge=>edge.kind==='forward'&&edge.from===alias.id&&edge.to==='core.aug:increment'));
 assert(!graph.symbols.some(symbol=>symbol.owner===alias.id&&symbol.kind==='parameter'));
 const packet=document.describe({context:true,name:'increment',mode:'review',budget:100000});
 assert.equal(packet.status,'ready');const inherited=packet.contracts.find(fact=>fact.id===alias.id);
 assert.equal(inherited.callables[0].forwarding.immediate.id,'core.aug:increment');
 const gateway=readFileSync(join(root,'gateway.aug'),'utf8');
 for(const occurrence of graph.occurrences.filter(item=>item.file==='gateway.aug'))assert.equal(gateway.slice(occurrence.start,occurrence.end),graph.symbols.find(symbol=>symbol.id===occurrence.symbol)?.name);
 assert.throws(()=>planChangeRenameSymbol(root,'gateway.aug','dispatch','send'),/managed standalone/);
 assert.throws(()=>planChangeReplaceBody(root,'gateway.aug','dispatch','dispatch(int value) returns int { return value }'),/managed standalone/);
});

test('request defaults remain inherited public promises and unsafe conversions are rejected',async t=>{
 const {analyzeChangeProject,projectRevision,semanticGraph}=await import('../src/change-context.ts');
 const {publicInterfaceDelta,planCheckedChange}=await import('../src/checked-change-requests.ts');
 const root=fixture(t);
 writeFileSync(join(root,'core.aug'),'increment(int value = 1) returns int { return value }\n');
 writeFileSync(join(root,'gateway.aug'),'import increment from core\nforward dispatch to increment\n');
 writeFileSync(join(root,'main.aug'),'import dispatch from gateway\nprint(value=dispatch())\n');
 const before=analyzeChangeProject(root);assert.deepEqual(before.diagnostics,[]);
 const aliases=semanticGraph(before).symbols.filter(symbol=>['core.aug:increment','gateway.aug:dispatch'].includes(symbol.id));
 assert.equal(aliases.length,2);for(const fact of aliases){assert.equal(fact.contract.inputs[0].required,false);assert.equal(fact.contract.inputs[0].default,'1');}
 const after=analyzeChangeProject(root,new Map([[join(root,'core.aug'),'increment(int value = 2) returns int { return value }\n']]));
 assert.deepEqual(after.diagnostics,[]);assert.deepEqual(publicInterfaceDelta(before,after).map(delta=>delta.symbol),['core.aug:increment','gateway.aug:dispatch']);
 writeFileSync(join(root,'gateway.aug'),'import increment from core\ndispatch(int value = 2) returns int { return increment(value=value) }\ntest dispatch { when acceptance { it explicitInput { assert(condition=dispatch(value=3) == 3) } } }\n');
 const checked=analyzeChangeProject(root);assert.deepEqual(checked.diagnostics,[]);
 const request={baseRevision:projectRevision(checked.project).revision,root:'gateway.aug:dispatch',editScope:['gateway.aug'],operations:[{kind:'forward',symbol:'gateway.aug:dispatch'}],expectedPublicDelta:{kind:'unchanged'},requirements:[{id:'R1',text:'Retain the adjustment interface.'}],verification:{tests:[{group:'acceptance',requirements:['R1']}],provenance:{source:'Independent input cases',independence:'independent fixture'}}};
 assert.throws(()=>planCheckedChange(root,request),/interface|contract|forward/i);
});
test('request cleanup failures retain the committed revision and recover forward',async t=>{
 const {analyzeChangeProject,projectRevision}=await import('../src/change-context.ts');
 const {planCheckedChange,applyCheckedChange}=await import('../src/checked-change-requests.ts');
 const root=fixture(t);
 writeFileSync(join(root,'core.aug'),'increment(int value) returns int { return value + 1 }\ntest increment { when acceptance { it adjusts { assert(condition=increment(value=3) == 4) } } }\n');
 const plan=planCheckedChange(root,{baseRevision:projectRevision(analyzeChangeProject(root).project).revision,root:'core.aug:increment',editScope:['core.aug','gateway.aug'],operations:[{kind:'rename',symbol:'core.aug:increment',name:'increase'}],expectedPublicDelta:{kind:'rename',from:'core.aug:increment',to:'core.aug:increase'},requirements:[{id:'R1',text:'Retain increment behavior.'}],verification:{tests:[{group:'acceptance',requirements:['R1']}],provenance:{source:'Independent amount case',independence:'independent fixture'}}});
 assert.throws(()=>applyCheckedChange(root,plan,{onPhase(phase){if(phase==='committed')throw new Error('injected cleanup failure');}}),error=>{
  assert.equal(error.code,'CHANGE_COMMITTED_RECOVERY_REQUIRED');assert.equal(error.report.status,'committed');assert.equal(error.report.revision,plan.candidateRevision);assert.equal(error.report.recovery,'required');return true;
 });
 assert.match(readFileSync(join(root,'core.aug'),'utf8'),/^increase\(/);
 assert.equal(recoverAnySourceChange(root).status,'committed');assert.equal(projectRevision(analyzeChangeProject(root).project).revision,plan.candidateRevision);
});
test('atomic request writes retain saved permissions under a restrictive umask',async t=>{
 const {chmodSync,statSync}=await import('node:fs');
 const {atomicSourceWrite}=await import('../src/source-transaction.ts');
 const root=fixture(t),file=join(root,'core.aug');chmodSync(file,0o660);
 const previous=process.umask(0o022);
 try {atomicSourceWrite(file,readFileSync(file,'utf8'),statSync(file).mode&0o777);}finally{process.umask(previous);}
 assert.equal(statSync(file).mode&0o777,0o660);
});
