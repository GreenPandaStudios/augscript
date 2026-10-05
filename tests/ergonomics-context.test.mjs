import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {SemanticWorkspace} from '../src/semantic.ts';

function fixture(files,run) {
  const root=mkdtempSync(join(tmpdir(),'aug-context-'));
  try {for(const [name,text] of Object.entries(files))writeFileSync(join(root,name),text);return run(root);}
  finally {rmSync(root,{recursive:true,force:true});}
}

test('context delivers the root implementation and resolved contracts before unused imports',()=>fixture({
  'main.aug':'import calculate from work\nprint(value=calculate(value=4))\n',
  'work.aug':'import Input and increment and ignored from values\ncalculate(int value) { input = Input(value); return increment(input) }\n',
  'values.aug':'record Input(int value)\nincrement(Input input) { return input.value + 1 }\nignored() { return "unused" }\n'
},root=>{
  const view=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true);
  assert.deepEqual(view.diagnostics,[]);
  const report=view.describe({name:'calculate',context:true,budget:100000});
  assert.equal(report.schema,3);assert.equal(report.contracts[0].name,'calculate');
  assert.match(report.snippets[0].source,/input = Input/);
  assert.equal(report.coverage.mandatory,'complete');assert.equal(report.coverage.reverseCallers,'complete');
  assert.ok(report.reverseCallers.some(caller=>caller.location.file==='main.aug'));
  assert.ok(report.types.some(type=>type.name==='Input'&&type.id==='values.aug:Input'));
  assert.ok(report.idioms.some(idiom=>idiom.id==='bindings-and-comparisons'&&idiom.origin==='independent-example'));
  assert.ok(report.idioms.every(idiom=>idiom.verification.compiler.sha256===report.compiler.sha256));
  assert.equal(report.requirements,'not-supplied');assert.equal(report.evidence.behavior,'not-run');
  assert.match(report.revision,/^[a-f0-9]{64}$/);
  assert.ok(report.sources.every(source=>!source.file.startsWith('/')));
  const constrained=view.describe({name:'calculate',context:true,budget:6000});
  assert.equal(constrained.contracts[0].name,'calculate');assert.ok(constrained.snippets.some(snippet=>snippet.source.includes('calculate')));
  assert.ok(JSON.stringify(constrained).length<=6000);
}));

test('truncated and closure-only packets cannot claim complete required context',()=>fixture({
  'main.aug':'', 'work.aug':'value(int input) { return input + 1 }\n', 'other.aug':'import value from work\nread() { return value(input=1) }\n'
},root=>{
  const file=join(root,'work.aug'),workspace=new SemanticWorkspace(root);
  const complete=workspace.document(file,undefined,true).describe({name:'value',context:true,budget:100000});
  const small=workspace.document(file,undefined,true).describe({name:'value',context:true,budget:512});
  assert.equal(small.coverage.mandatory,'incomplete');assert.equal(small.coverage.delivered,'truncated');
  assert.ok(small.omissions.length);assert.ok(JSON.stringify(small).length<=512);
  const closure=workspace.document(file).describe({name:'value',context:true,budget:100000});
  assert.equal(closure.coverage.checkedProject,false);assert.equal(closure.coverage.reverseCallers,'incomplete');
  assert.notEqual(complete.revision,closure.revision);
  writeFileSync(join(root,'main.yaml'),'block_style: indent\n');
  const changed=workspace.document(file,undefined,true).describe({name:'value',context:true,budget:100000});
  assert.notEqual(complete.revision,changed.revision);
  const result=spawnSync(process.execPath,['bin/aug.mjs','context',root,'--file',file,'--name','value','--budget','512','--json','--require-complete'],{encoding:'utf8'});
  assert.equal(result.status,1,result.stderr);assert.equal(JSON.parse(result.stdout).coverage.mandatory,'incomplete');
}));

test('context identifies dynamic dispatch boundaries instead of inventing an implementation',()=>fixture({
  'main.aug':'', 'work.aug':'interface Reader { read() returns int }\nread(Reader reader) { return reader.read() }\n'
},root=>{
  const packet=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true).describe({name:'read',context:true,budget:100000});
  assert.equal(packet.coverage.graph,'bounded');
  assert.ok(packet.boundaries.some(boundary=>boundary.kind==='interface-dispatch'));
  assert.ok(packet.contracts.some(contract=>contract.name==='Reader'));
  assert.equal(packet.evidence.behavior,'not-run');
}));


test('declared capability promises supply their resolved dependency contracts even without a call',()=>fixture({
  'main.aug':'', 'work.aug':'import Console from august.io\nnoop() uses Console.write { pass }\n'
},root=>{
  const view=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true);assert.deepEqual(view.diagnostics,[]);
  const packet=view.describe({name:'noop',context:true,budget:100000});
  assert.ok(packet.contracts.some(contract=>contract.name==='Console'));
  assert.ok(packet.types.some(type=>type.name==='Console'&&type.definition.file.startsWith('august/')));
}));

test('owned idioms follow checked inference rather than only written qualifiers',()=>fixture({
  'main.aug':'', 'work.aug':'make() returns own List<int> { return [1] }\nuse() { values = make(); return values.length() }\n'
},root=>{
  const packet=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true).describe({name:'use',context:true,budget:100000});
  assert.ok(packet.idioms.some(idiom=>idiom.id==='owned-results'));
}));


test('native capability promises retain the boundary even without an invocation',()=>fixture({
  'main.aug':'', 'work.aug':'extern C puts(string text) returns int\nnoop() uses C.puts { pass }\n'
},root=>{
  const view=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true);assert.deepEqual(view.diagnostics,[]);
  const packet=view.describe({name:'noop',context:true,budget:100000});
  assert.ok(packet.contracts.some(contract=>contract.name==='puts'));
  assert.equal(packet.coverage.graph,'bounded');
  assert.ok(packet.boundaries.some(boundary=>boundary.kind==='native-code'));
}));


test('a context budget must hold the selected contract and implementation before it succeeds',()=>fixture({
 'main.aug':'', 'work.aug':'calculate(int input) returns int { return input + 1 }\n'
},root=>{
 const file=join(root,'work.aug'),view=new SemanticWorkspace(root).document(file,undefined,true);
 const short=view.describe({name:'calculate',context:true,budget:512});
 assert.equal(short.status,'budget-insufficient');assert.ok(short.minimumBudget>512);
 assert.ok(JSON.stringify(short).length+1<=512);
 const adequate=view.describe({name:'calculate',context:true,budget:short.minimumBudget});
 assert.equal(adequate.status,'ready');assert.equal(adequate.contracts[0].name,'calculate');
 assert.match(adequate.snippets[0].source,/return input \+ 1/);
 assert.ok(JSON.stringify(adequate).length+1<=adequate.budget);
 const cli=spawnSync(process.execPath,['bin/aug.mjs','context',root,'--file',file,'--name','calculate','--budget','512','--json'],{encoding:'utf8'});
 assert.equal(cli.status,1,cli.stderr);assert.equal(JSON.parse(cli.stdout).status,'budget-insufficient');
}));

test('interface-change context includes transitive known callers outside the import closure',()=>fixture({
 'main.aug':'', 'work.aug':'calculate(int input) returns int { return input + 1 }\n',
 'caller.aug':'import calculate from work\nconsume(int number) returns int { return calculate(input=number) }\n',
 'outer.aug':'import consume from caller\nrun() returns int { return consume(number=7) }\n'
},root=>{
 const view=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true);
 const ordinary=view.describe({name:'calculate',context:true,budget:100000});
 assert.ok(!ordinary.snippets.some(item=>item.id==='outer.aug:run'));
 const changed=view.describe({name:'calculate',context:true,mode:'interface-change',budget:100000});
 assert.equal(changed.query.mode,'interface-change');
 assert.ok(changed.contracts.some(item=>item.id==='outer.aug:run'));
 assert.ok(changed.snippets.some(item=>item.id==='caller.aug:consume'&&item.source.includes('calculate(input=number)')));
 assert.ok(changed.snippets.some(item=>item.id==='outer.aug:run'));
 assert.equal(changed.coverage.externalCallers,'outside-project');
 assert.equal(changed.evidence.behavior,'not-run');
 const cli=spawnSync(process.execPath,['bin/aug.mjs','context',root,'--file',join(root,'work.aug'),'--name','calculate','--mode','interface-change','--budget','100000'],{encoding:'utf8'});
 assert.equal(cli.status,0,cli.stderr);assert.deepEqual(JSON.parse(cli.stdout),JSON.parse(JSON.stringify(changed)));
}));


test('review context keeps available tests and startup code separate from execution evidence',()=>fixture({
 'main.aug':'import calculate from work\nprint(value=calculate(input=4))\n',
 'work.aug':'calculate(int input) returns int { return input + 1 }\ntest calculate { when examples { it known { assertEqual(actual=calculate(input=4), expected=5) } } }\n'
},root=>{
 const packet=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true).describe({name:'calculate',context:true,mode:'review',budget:100000});
 assert.ok(packet.snippets.some(item=>item.id.startsWith('module:main.aug')&&item.source.includes('print(value=calculate')));
 assert.ok(!packet.snippets.some(item=>item.id.startsWith('module:work.aug')&&item.source.includes('test calculate')));
 const suite=packet.tests.find(item=>item.subject==='work.aug:calculate');
 assert.match(suite.source,/expected=5/);assert.deepEqual(suite.cases,['work.aug:calculate:examples:known']);
 assert.equal(suite.origin,'author-supplied');assert.equal(suite.independence,'not-assessed');assert.equal(packet.evidence.behavior,'not-run');
 const small=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true).describe({name:'calculate',context:true,mode:'review',budget:packet.minimumBudget});
 assert.equal(small.contracts[0].name,'calculate');assert.ok(small.omissions.some(item=>item.section==='tests'));
}));


test('interface-change context covers inherited implementations and record type consumers',()=>fixture({
 'main.aug':'',
 'work.aug':'interface Base { read() returns int }\ninterface Child extends Base {}\nConcrete() implements Child { read() { return 1 } }\nuse(Child input) { return input.read() }\nrecord Info(int value)\ninspect(Info input) { return input.value }\n'
},root=>{
 const view=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true);assert.deepEqual(view.diagnostics,[]);
 const inherited=view.describe({name:'Base',context:true,mode:'interface-change',budget:100000});
 assert.ok(inherited.contracts.some(item=>item.name==='Concrete'));assert.ok(inherited.snippets.some(item=>item.source.includes('Concrete()')));
 assert.equal(inherited.coverage.graph,'bounded');
 const data=view.describe({name:'Info',context:true,mode:'interface-change',budget:100000});
 assert.ok(data.contracts.some(item=>item.name==='inspect'));assert.ok(data.snippets.some(item=>item.source.includes('input.value')));
}));


test('review includes a suite that calls the target under another subject',()=>fixture({
 'main.aug':'',
 'work.aug':'calculate(int input) returns int { return input + 1 }\nother() returns int { return 0 }\ntest other { when examples { it caller { assertEqual(actual=calculate(input=4), expected=5) } } }\n'
},root=>{
 const packet=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true).describe({name:'calculate',context:true,mode:'review',budget:100000});
 const suite=packet.tests.find(item=>item.subject==='work.aug:other');
 assert.ok(suite);assert.match(suite.source,/calculate\(input=4\)/);
 assert.deepEqual(suite.cases,['work.aug:other:examples:caller']);
 assert.equal(packet.evidence.behavior,'not-run');
}));

test('review includes native contracts and boundaries inside selected startup statements',()=>fixture({
 'main.aug':'import calculate and puts from work\nif calculate(input=7) > 0 { unsafe { puts(text="hello") } }\n',
 'work.aug':'extern C puts(string text) returns int\ncalculate(int input) returns int { return input + 1 }\n'
},root=>{
 const view=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true);assert.deepEqual(view.diagnostics,[]);
 const packet=view.describe({name:'calculate',context:true,mode:'review',budget:100000});
 assert.ok(packet.snippets.some(item=>item.source.includes('puts(text="hello")')));
 assert.ok(packet.contracts.some(item=>item.name==='puts'));
 assert.equal(packet.coverage.graph,'bounded');
 assert.ok(packet.boundaries.some(item=>item.kind==='native-code'&&item.target==='work.aug:puts'&&item.location.file==='main.aug'));
}));

test('review retains foreign boundaries in selected test callers',()=>fixture({
 'main.aug':'',
 'work.aug':'extern C puts(string text) returns int\ncalculate(int input) returns int { return input + 1 }\nother() returns int { return 0 }\ntest other { when examples { it caller { assertEqual(actual=calculate(input=4), expected=5); unsafe { puts(text="hello") } } } }\n'
},root=>{
 const view=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true);assert.deepEqual(view.diagnostics,[]);
 const packet=view.describe({name:'calculate',context:true,mode:'review',budget:100000});
 assert.ok(packet.tests.some(item=>item.subject==='work.aug:other'));
 assert.ok(packet.contracts.some(item=>item.name==='puts'));
 assert.equal(packet.coverage.graph,'bounded');
 assert.ok(packet.boundaries.some(item=>item.kind==='native-code'&&item.target==='work.aug:puts'));
}));
