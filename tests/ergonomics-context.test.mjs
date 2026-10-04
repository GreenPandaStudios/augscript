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
  assert.equal(report.schema,2);assert.equal(report.contracts[0].name,'calculate');
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
