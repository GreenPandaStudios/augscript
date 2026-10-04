import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {analyzeChangeProject,checkedContext,semanticGraph,projectRevision} from '../src/change-context.ts';
import {generateC} from '../src/codegen.ts';
import {compileNative} from '../src/native.ts';
import {compileLLVM} from '../src/llvm-native.ts';
import {generateSpecs} from '../src/spec.ts';
import {formatFile} from '../src/formatter.ts';
import {hoverInfo} from '../src/editor.ts';
import {definitionAt} from '../src/navigation.ts';
import {planCheckedChange,publicInterfaceDelta} from '../src/checked-changes.ts';
import {completions,semanticTokens} from '../src/editor.ts';

function fixture(t,files){const root=mkdtempSync(join(tmpdir(),'aug-forward-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 for(const [file,source]of Object.entries(files)){mkdirSync(join(root,file,'..'),{recursive:true});writeFileSync(join(root,file),source);}return root;}
const files={
 'export.aug':'export deliver from gateway\nexport dispatch from bridge\n',
 'main.aug':`import dispatch from gateway
import make from billing
try { value = dispatch(item=make(), fail=false); print(value=value) }
catch Error error { print(value="unexpected") }
try { dispatch(item=make(), fail=true); print(value="unexpected") }
catch Error error { print(value="failed") }
`,
 'billing/export.aug':'export apply from operations\nexport make from operations\n',
 'billing/operations.aug':`record Item(int value)
Failure() implements Error {}
apply(Item item, bool fail) returns int unless Failure {
    if fail { throw Failure() }
    return item.value
}
make() returns Item { return Item(value=7) }
`,
 'bridge.aug':'import apply from billing\nforward dispatch to apply\n',
 'gateway.aug':'import dispatch from bridge\nforward dispatch to dispatch\n',
};
// Same-name imported aliases are intentionally forbidden by existing module collision rules.
files['gateway.aug']='import dispatch from bridge\nforward deliver to dispatch\n';
files['main.aug']=files['main.aug'].replaceAll('dispatch','deliver');
for(const backend of ['c','llvm'])test('forward chains preserve resolved types, labeled arguments and checked failures ('+backend+')',
 {skip:backend==='llvm'&&!process.env.AUG_LLVM_HOME},t=>{
 const root=fixture(t,files),checked=analyzeChangeProject(root);assert.deepEqual(checked.diagnostics,[]);
 const alias=checked.project.scopes.get(join(root,'gateway.aug')).get('deliver');assert.equal(alias.node.forward.implementationId,'billing/operations.aug:apply');
 const packet=checkedContext(checked,[alias.id]);assert.equal(packet.coverage.requiredContextComplete,true,JSON.stringify({unresolved:packet.unresolved,omissions:packet.omissions}));
 const fact=packet.facts.find(fact=>fact.id===alias.id);assert.equal(fact.contract.inputs[0].type.id,'billing/operations.aug:Item');
 assert.equal(fact.contract.errors[0].id,'billing/operations.aug:Failure');assert.equal(fact.contract.provenance.inputs,'inherited');
 const output=backend==='llvm'?compileLLVM(checked):compileNative(root,generateC(checked),{checked});assert.equal(output.status,0,output.error);
 const run=spawnSync(output.output,[],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);assert.equal(run.stdout,'7\nfailed\n');
 const file=checked.project.files.get(join(root,'gateway.aug'));assert.match(formatFile(checked.project,file),/forward deliver to dispatch/);
 const hover=hoverInfo(checked,file.path,file.source.indexOf('deliver'));assert.match(hover.detail,/Item item/);assert.match(hover.documentation,/Inherited interface/);
 const navigation=definitionAt(checked.project,file.path,file.source.indexOf('deliver'));assert.equal(navigation.kind,'forward');assert.equal(navigation.column,9);assert.equal(navigation.implementation.name,'apply');
 const target=definitionAt(checked.project,file.path,file.source.lastIndexOf('dispatch'));assert.equal(target.name,'dispatch');
 const complete=completions(checked,file.path,file.source.lastIndexOf('dispatch')+8).find(item=>item.label==='dispatch');assert.equal(complete.insertText,'dispatch');
 assert(semanticTokens(checked,file.path).some(token=>token.line===1&&token.start===0&&token.type==='keyword'));
 const spec=generateSpecs(checked).find(output=>output.source===file.path&&!output.kind);assert(spec);assert.match(spec.text,/inherited/);
 assert(semanticGraph(checked).relationships.some(edge=>edge.kind==='forward'&&edge.from===alias.id));
});
test('target edits propagate through unchanged exported alias files and remain caller errors',t=>{
 const root=fixture(t,files),before=analyzeChangeProject(root);
 writeFileSync(join(root,'billing/operations.aug'),files['billing/operations.aug'].replace('bool fail)','bool fail, string reason)'));
 const after=analyzeChangeProject(root);assert(after.diagnostics.some(issue=>/reason/.test(issue.message)));
 const delta=publicInterfaceDelta(before,after);assert(delta.some(change=>change.symbol==='bridge.aug:dispatch'));assert(delta.some(change=>change.symbol==='gateway.aug:deliver'));
 assert(semanticGraph(after).relationships.some(edge=>edge.kind==='export'&&edge.to==='gateway.aug:deliver'));
});
test('inferred results/errors and omitted optional inputs retain target identities despite same-spelled local types',t=>{
 const root=fixture(t,{'main.aug':`import dispatch from alias
import make from work
try { print(value=dispatch(item=make(), fail=false).value) }
catch Error error { print(value="unexpected") }
try { dispatch(item=make(), fail=true) }
catch Error error { print(value="failed") }
`,
 'work.aug':`record Item(int value)
Failure() implements Error {}
make() { return Item(value=7) }
target(Item item, bool fail, optional string note) {
    if fail { throw Failure() }
    return item
}
`,
 'alias.aug':`import target from work
record Item(string value)
Failure() implements Error {}
forward dispatch to target
`});
 const checked=analyzeChangeProject(root);assert.deepEqual(checked.diagnostics,[]);const fact=semanticGraph(checked).symbols.find(fact=>fact.id==='alias.aug:dispatch');
 assert.equal(fact.contract.result.id,'work.aug:Item');assert.equal(fact.contract.errors[0].id,'work.aug:Failure');assert.equal(fact.contract.inputs[2].required,false);
 const output=compileNative(root,generateC(checked),{checked});assert.equal(output.status,0,output.error);assert.equal(spawnSync(output.output,[],{encoding:'utf8'}).stdout,'7\nfailed\n');
 const spec=generateSpecs(checked).find(output=>!output.kind&&output.source===join(root,'alias.aug')).text;assert.match(spec,/work\.aug\.md#symbol-Item/);assert.match(spec,/work\.aug\.md#symbol-Failure/);
});
test('argument evaluation occurs once in ordinary source order for direct and forwarded calls',t=>{
 const root=fixture(t,{'main.aug':`import Console and SystemConsole from august.io
import observe and sum from work
import dispatch from alias
implement Console with SystemConsole
print(value=dispatch(right=observe(value=2), left=observe(value=1)))
print(value=sum(right=observe(value=2), left=observe(value=1)))
`,
 'work.aug':`import Console from august.io
observe(resolve Console console, int value) returns int { if value == 1 { console.write(value="first") } else { console.write(value="second") } return value }
sum(int left, int right) returns int { return left + right }
`,
 'alias.aug':'import sum from work\nforward dispatch to sum\n'});
 const checked=analyzeChangeProject(root);assert.deepEqual(checked.diagnostics,[]);const output=compileNative(root,generateC(checked),{checked});assert.equal(output.status,0,output.error);
 const result=spawnSync(output.output,[],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'second\nfirst\n3\nsecond\nfirst\n3\n');
});
test('contextual forward remains an ordinary callable name and void forwarding is native',t=>{
 const root=fixture(t,{'main.aug':'import dispatch from alias\ndispatch(x=3)\n',
 'work.aug':'forward(int x) {}\n','alias.aug':'import forward from work\nforward dispatch to forward\n'});
 const checked=analyzeChangeProject(root);assert.deepEqual(checked.diagnostics,[]);
 const output=compileNative(root,generateC(checked),{checked});assert.equal(output.status,0,output.error);assert.equal(spawnSync(output.output).status,0);
});
test('unsupported profiles, private targets, local targets, bodies, annotations and cycles fail closed',t=>{
 for(const source of [
 'target<T>(T x) returns T { return x }',
 'target(own int x) returns int { return x }',
 'target(borrow List<int> x) { x.append(value=1) }',
 'target(resolve Error x) {}',
 'extern C target(int x) returns int',
 'endpoint GET "/" as target() returns string { return "x" }',
 '_target() returns int { return 1 }',
 ]){const root=fixture(t,{'main.aug':'pass\n','work.aug':source+'\n','alias.aug':`import ${source.startsWith('_')?'_target':'target'} from work\nforward dispatch to ${source.startsWith('_')?'_target':'target'}\n`});
  assert(analyzeChangeProject(root).diagnostics.length>0,source);}
 for(const alias of ['target() { return 1 }\nforward dispatch to target\n','import target from work\nforward dispatch to target {}\n',
  'import everything from work\nforward dispatch to target\n',
  'import target from work\n[Layer]\nforward dispatch to target\n']){
  const root=fixture(t,{'main.aug':'pass\n','work.aug':'target() { return 1 }\n','alias.aug':alias});assert(analyzeChangeProject(root).diagnostics.length>0);}
 const root=fixture(t,{'main.aug':'pass\n','a.aug':'import other from b\nforward first to other\n','b.aug':'import first from a\nforward other to first\n'});
 assert(analyzeChangeProject(root).diagnostics.some(issue=>/cycle/.test(issue.message)));
 const hidden=fixture(t,{'main.aug':'pass\n','work.aug':'target() returns int { return 1 }\n','alias.aug':'import target from work\nforward _dispatch to target\n','export.aug':'export _dispatch from alias\n'});
 assert(analyzeChangeProject(hidden).diagnostics.some(issue=>issue.code==='PRIVATE'));
});
test('pure-wrapper conversion preserves interfaces and rejects added behavior',t=>{
 const source='import target from work\ndispatch(int x) returns int { return target(x=x) }\n';
 const root=fixture(t,{'main.aug':'pass\n','work.aug':'target(int x) returns int { return x + 1 }\n','alias.aug':source+
 'test dispatch:\n    when "acceptance":\n        it "increments":\n            assert(condition=dispatch(x=3) == 4)\n'});
 const request={baseRevision:projectRevision(analyzeChangeProject(root).project).revision,root:'alias.aug:dispatch',editScope:['alias.aug'],operations:[{kind:'forward',symbol:'alias.aug:dispatch'}],
 expectedPublicDelta:{kind:'unchanged'},requirements:[{id:'R1',text:'Keep increment behavior.'}],verification:{tests:[{group:'acceptance',requirements:['R1']}],provenance:{source:'Independent increment example',independence:'independent fixture'}}};
 const plan=planCheckedChange(root,request);assert.match(plan.candidate.sources[0].source,/forward dispatch to target/);assert.deepEqual(plan.publicDelta,[]);
 writeFileSync(join(root,'alias.aug'),readFileSync(join(root,'alias.aug'),'utf8').replace('return target','unused = 1; return target'));request.baseRevision=projectRevision(analyzeChangeProject(root).project).revision;
 assert.throws(()=>planCheckedChange(root,request),error=>error.code==='CHANGE_PROFILE');
});
