import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {mkdtempSync,writeFileSync,mkdirSync,cpSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {analyzeChangeProject,checkedContext,projectRevision,semanticGraph,interfaceSnapshot} from '../src/change-context.ts';

function fixture(t,files){const root=mkdtempSync(join(tmpdir(),'aug-context-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 for(const [name,source]of Object.entries(files)){mkdirSync(join(root,name,'..'),{recursive:true});writeFileSync(join(root,name),source);}return root;}
const files={
 'main.aug':'import top from caller\nvalue = top(x=3)\n',
 'core.aug':'lower(int x) returns int:\n    return x + 1\n\ntest lower:\n    when "acceptance":\n        it "increments":\n            assert(condition=lower(x=3) == 4)\n',
 'caller.aug':'import lower from core\n\ntop(int x) returns int:\n    return lower(x=x)\n',
 'separate.aug':'import lower from core\n\nseparate(int x) returns int:\n    return lower(x=x)\n',
 'shadow.aug':'import lower from core\n\nshadow(string lower) returns string:\n    return lower\n\nunrelated() returns string:\n    return "lower"\n',
};
test('checked context discovers reverse callers outside the import closure with exact identities',t=>{
 const root=fixture(t,files),checked=analyzeChangeProject(root);assert.deepEqual(checked.diagnostics,[]);
 const packet=checkedContext(checked,['core.aug:lower']);assert.equal(packet.coverage.requiredContextComplete,true,JSON.stringify(packet.unresolved));
 assert(packet.reverseCallers.includes('separate.aug:separate'));assert(packet.reverseCallers.includes('caller.aug:top'));assert(packet.reverseCallers.includes('module:main.aug'));
 assert(packet.facts.some(fact=>fact.id==='core.aug:lower'&&fact.contract.inputs[0].type.id==='builtin:int'));
 const graph=semanticGraph(checked),shadow=graph.occurrences.filter(occurrence=>occurrence.symbol==='core.aug:lower'&&occurrence.location.file==='shadow.aug');
 assert.deepEqual(shadow.map(occurrence=>occurrence.role),['import']);
 assert(graph.symbols.some(symbol=>symbol.id==='shadow.aug:shadow::parameter:lower'));
 assert(graph.occurrences.some(occurrence=>occurrence.role==='label'&&occurrence.symbol==='core.aug:lower::parameter:x'));
 assert(!JSON.stringify(packet).includes(root));
});
test('source revision is portable and detects new source, config and lock changes',t=>{
 const root=fixture(t,files),first=projectRevision(analyzeChangeProject(root).project);
 const copy=fixture(t,{});cpSync(root,copy,{recursive:true});assert.deepEqual(projectRevision(analyzeChangeProject(copy).project),first);
 writeFileSync(join(root,'new.aug'),'newCaller() returns int:\n    return 7\n');assert.notEqual(projectRevision(analyzeChangeProject(root).project).revision,first.revision);
 const next=projectRevision(analyzeChangeProject(root).project);writeFileSync(join(root,'main.yaml'),'block_style: braces\n');
 assert.notEqual(projectRevision(analyzeChangeProject(root).project).configuration,next.configuration);
 const config=projectRevision(analyzeChangeProject(root).project);writeFileSync(join(root,'aug.lock.json'),'{}\n');
 assert.notEqual(projectRevision(analyzeChangeProject(root).project).dependencies,config.dependencies);
});
test('truncated packets cannot claim acceptance coverage and retain the query and revision',t=>{
 const root=fixture(t,files),packet=checkedContext(analyzeChangeProject(root),['core.aug:lower'],512);
 assert.equal(packet.coverage.requiredContextComplete,false);assert.equal(packet.status.mandatory,'incomplete');assert(packet.omissions.length>0);
 assert.deepEqual(packet.query.roots,['core.aug:lower']);assert.match(packet.revision,/^[a-f0-9]{64}$/);
});
test('interface dispatch is a visible boundary even when the loaded program checks',t=>{
 const root=fixture(t,{'main.aug':'pass\n','worker.aug':'interface Worker:\n    work() returns int\n\nuse(Worker worker) returns int:\n    return worker.work()\n'});
 const checked=analyzeChangeProject(root);assert.deepEqual(checked.diagnostics,[]);
 const packet=checkedContext(checked,['worker.aug:use']);assert.equal(packet.status.project,'checked');assert.equal(packet.status.graph,'partial');
 assert.equal(packet.coverage.requiredContextComplete,false);assert(packet.unresolved.some(boundary=>boundary.kind==='interface-dispatch'));
 writeFileSync(join(root,'pure.aug'),'identity(int value) returns int { return value }\n');
 const unrelated=checkedContext(analyzeChangeProject(root),['pure.aug:identity']);assert.equal(unrelated.status.graph,'partial');
 assert.equal(unrelated.coverage.requiredContextComplete,true);assert(unrelated.graphCoverage.omittedBoundaries.callers.includes('worker.aug:use'));
});
test('generic identities and explicit type occurrences remain stable when declaration offsets move',t=>{
 const root=fixture(t,{'main.aug':'pass\n','work.aug':'identity<T>(T value) returns T { return value }\n'}),first=semanticGraph(analyzeChangeProject(root));
 writeFileSync(join(root,'work.aug'),'// A new comment.\nidentity<T>(T value) returns T { return value }\n');
 const next=semanticGraph(analyzeChangeProject(root));assert.equal(first.symbols.find(fact=>fact.id==='work.aug:identity').contract.result.id,'work.aug:identity::generic:T');
 assert.deepEqual(first.symbols.find(fact=>fact.id==='work.aug:identity').contract,next.symbols.find(fact=>fact.id==='work.aug:identity').contract);
 assert(next.occurrences.some(occurrence=>occurrence.role==='reference'&&occurrence.symbol==='work.aug:identity::parameter:value'));
 assert(next.occurrences.some(occurrence=>occurrence.role==='type'&&occurrence.symbol==='work.aug:identity::generic:T'));
});
test('opaque native implementations and unsupported function-value edges cannot appear complete',t=>{
 const native=fixture(t,{'main.aug':'pass\n','work.aug':'extern C abs(c_int value) returns c_int\nuse(c_int value) returns c_int uses C.abs { unsafe { return abs(value=value) } }\n'});
 const packet=checkedContext(analyzeChangeProject(native),['work.aug:use']);assert.equal(packet.coverage.requiredContextComplete,false);assert(packet.unresolved.some(boundary=>boundary.kind==='native-call'));
 const value=fixture(t,{'main.aug':'import operation from work\nunused = operation\n','work.aug':'operation() {}\n'});
 const fact=checkedContext(analyzeChangeProject(value),['work.aug:operation']);assert(fact.unresolved.some(boundary=>boundary.kind==='function-value'));assert.equal(fact.coverage.requiredContextComplete,false);
});

test('folder exports retain resolved module edges and public visibility paths',t=>{
 const root=fixture(t,{'main.aug':'pass\n','export.aug':'export folder billing\n','billing/export.aug':'export adjust from work\n','billing/work.aug':'adjust(int value) returns int { return value + 1 }\n'});
 const checked=analyzeChangeProject(root);assert.deepEqual(checked.diagnostics,[]);const graph=semanticGraph(checked);
 assert(graph.relationships.some(edge=>edge.kind==='export'&&edge.from==='module:export.aug'&&edge.to==='module:billing/export.aug'));
 const shape=interfaceSnapshot(graph).find(fact=>fact.id==='billing/work.aug:adjust');assert.deepEqual(shape.exportedBy,['module:billing/export.aug','module:export.aug']);
 writeFileSync(join(root,'export.aug'),'');const after=interfaceSnapshot(semanticGraph(analyzeChangeProject(root))).find(fact=>fact.id===shape.id);
 assert.notEqual(after.shape,shape.shape);assert.deepEqual(after.exportedBy,['module:billing/export.aug']);
});
