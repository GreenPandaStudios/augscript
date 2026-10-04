import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {SemanticWorkspace} from '../src/semantic.ts';

function fixture(files,run) {
  const root=mkdtempSync(join(tmpdir(),'aug-references-'));
  try {for(const [name,source] of Object.entries(files)){mkdirSync(dirname(join(root,name)),{recursive:true});writeFileSync(join(root,name),source);}return run(root);}
  finally {rmSync(root,{recursive:true,force:true});}
}

test('whole-project references resolve declarations, imports, exports, callers and public labels',()=>fixture({
  'main.aug':'import double from math\nquantity=4\nprint(value=double(quantity))\n',
  'math/export.aug':'export double from numbers\n',
  'math/numbers.aug':'double(int quantity = 2):\n    return quantity * 2\n',
  'other.aug':'import double from math\nread():\n    return double(quantity=3)\n',
  'unrelated.aug':'double(int quantity):\n    return quantity\n'
},root=>{
  const view=new SemanticWorkspace(root).document(join(root,'math/numbers.aug'),undefined,true);
  assert.deepEqual(view.diagnostics,[]);
  const source=view.source,refs=view.references(source.indexOf('double'));
  assert.deepEqual(refs.map(ref=>[ref.file,ref.role]).sort(),[
    ['main.aug','call'],['main.aug','import'],['math/export.aug','export'],['math/numbers.aug','declaration'],['other.aug','call'],['other.aug','import']
  ].sort());
  const inputs=view.references(source.indexOf('quantity'));
  assert.ok(inputs.some(ref=>ref.file==='main.aug'&&ref.role==='shorthand-label'));
  assert.ok(inputs.some(ref=>ref.file==='other.aug'&&ref.role==='argument-label'));
  const graph=view.graph();
  assert.equal(graph.coverage.checkedProject,true);
  assert.equal(graph.coverage.checkedScope,'project');
  assert.equal(graph.reverseCallers['math/numbers.aug:double'].length,2);
  assert.ok(graph.sources.every(source=>!source.file.startsWith('/')));
  assert.match(graph.revision,/^[a-f0-9]{64}$/);
}));

test('local references exclude shadowed variables, comments, strings and member names',()=>fixture({
  'main.aug':'',
  'work.aug':'first(int amount):\n    // amount is documented here.\n    text="amount"\n    return amount\nsecond(int amount):\n    return amount + 1\n'
},root=>{
  const view=new SemanticWorkspace(root).document(join(root,'work.aug'),undefined,true);
  assert.deepEqual(view.diagnostics,[]);
  const refs=view.references(view.source.indexOf('amount'));
  assert.equal(refs.length,2,JSON.stringify(refs));
  assert.deepEqual(refs.map(ref=>ref.role),['declaration','read']);
}));

test('import-closure context cannot claim whole-project caller coverage',()=>fixture({
  'main.aug':'','work.aug':'value():\n    return 1\n','other.aug':'import value from work\nread():\n    return value()\n'
},root=>{
  const workspace=new SemanticWorkspace(root),file=join(root,'work.aug');
  const closure=workspace.document(file).graph();
  assert.equal(closure.coverage.checkedScope,'import-closure');
  assert.equal(closure.coverage.checkedProject,false);
  assert.equal(closure.coverage.reverseCallers,'incomplete');
  const full=workspace.document(file,undefined,true).graph();
  assert.equal(full.reverseCallers['work.aug:value'].length,1);
  assert.notEqual(full.revision,closure.revision);
  workspace.document(join(root,'other.aug'),{text:'read():\n    return 2\n',version:1});
  const changed=workspace.document(file,undefined,true).graph();
  assert.equal(changed.reverseCallers['work.aug:value']?.length??0,0);
  assert.notEqual(changed.revision,full.revision);
}));

test('interface dispatch is reported separately from resolved contract references',()=>fixture({
  'main.aug':'',
  'service.aug':'interface Value:\n    get() returns int\nOne() implements Value:\n    get():\n        return 1\nread(Value item):\n    return item.get()\n'
},root=>{
  const view=new SemanticWorkspace(root).document(join(root,'service.aug'),undefined,true),graph=view.graph();
  assert.deepEqual(view.diagnostics,[]);
  assert.ok(graph.boundaries.some(edge=>edge.kind==='interface-dispatch'));
  assert.equal(graph.coverage.dispatch,'bounded');
  const references=view.references(view.source.indexOf('get() returns'));
  assert.ok(references.some(ref=>ref.role==='call'));
}));

test('reference revisions include configuration bytes and caller writes without exposing mutable graph state',()=>fixture({
  'main.aug':'value=1\nvalue=2\nprint(value=value)\n', 'main.yaml':'optimization: debug\n'
},root=>{
  const workspace=new SemanticWorkspace(root),file=join(root,'main.aug'),view=workspace.document(file);
  assert.deepEqual(view.references(0).map(item=>item.role),['declaration','write','read']);
  const graph=view.graph();graph.symbols.length=0;
  assert.ok(view.graph().symbols.length>0);
  writeFileSync(join(root,'main.yaml'),'# changed configuration revision\noptimization: debug\n');
  assert.notEqual(workspace.document(file).graph().revision,view.graph().revision);
}));

test('rename plans expand shorthand labels, preserve unrelated text, and check the candidate without writing',()=>fixture({
  'main.aug':'import double from math\nquantity=4\nprint(value=double(quantity))\n',
  'math.aug':'double(int quantity):\n    // quantity remains a comment.\n    text="quantity"\n    return quantity * 2\n',
  'other.aug':'double(int quantity):\n    return quantity\n'
},root=>{
  const workspace=new SemanticWorkspace(root),file=join(root,'math.aug'),view=workspace.document(file,undefined,true);
  const plan=view.rename(view.source.indexOf('quantity'),'amount');
  assert.equal(plan.checked,true);assert.equal(plan.behavioralEvidence,'not-run');
  assert.ok(plan.edits.some(edit=>edit.file===join(root,'main.aug')&&edit.text==='amount=quantity'));
  assert.ok(!plan.edits.some(edit=>edit.file===join(root,'other.aug')));
  assert.equal(plan.edits.filter(edit=>edit.file===file).length,2);
  assert.equal(workspace.document(file,undefined,true).source,view.source);
  const local=workspace.document(join(root,'main.aug'),undefined,true),localPlan=local.rename(local.source.indexOf('quantity=4'),'count');
  assert.ok(localPlan.edits.some(edit=>edit.text==='quantity=count'));
  assert.deepEqual(localPlan.publicDelta,[]);
}));

test('rename rejects collisions and unsupported profiles before offering edits',()=>fixture({
  'main.aug':'import double from math\nprint(value=double(quantity=1))\n',
  'math.aug':'double(int quantity):\n    return quantity * 2\nother(int quantity):\n    return quantity\n'
},root=>{
  const view=new SemanticWorkspace(root).document(join(root,'math.aug'),undefined,true);
  assert.throws(()=>view.rename(0,'other'),/candidate does not check/);
  assert.throws(()=>view.rename(0,'return'),/reserved keyword/);
  const plan=view.rename(0,'twice');assert.equal(plan.edits.length,3);
  assert.ok(plan.publicDelta.some(delta=>delta.id==='math.aug:double'&&delta.after===null));
  assert.ok(plan.publicDelta.some(delta=>delta.id==='math.aug:twice'&&delta.before===null));
}));
