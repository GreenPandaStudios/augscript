import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {spawnSync} from './compiler-process.mjs';
import {checkedProjectWithTests,applySourceEdits} from '../src/refactoring.ts';
import {planChangeDependency,applyChangePlan} from '../src/checked-changes.ts';
import {SemanticWorkspace} from '../src/semantic.ts';

const cli=resolve('bin/aug.mjs');
const files={
  'main.aug':'import Reader and DoubleReader from ports\nimport load from entry\nimplement Reader with DoubleReader\nprint(value=load(value=4))\n',
  'ports/export.aug':'export Reader from adapters\nexport DoubleReader from adapters\n',
  'ports/adapters.aug':'capability Reader { read(int value) returns int uses Reader.read }\nDoubleReader() implements Reader { read(int value) { return value * 2 } }\n',
  'services/export.aug':'export calculate from calculations\n',
  'services/fetcher.aug':'import Reader from ports\nfetch(resolve Reader reader, int value) { return reader.read(value) }\n',
  'services/calculations.aug':'import fetch from fetcher\ncalculate(int value) { return fetch(value) }\n',
  'entry.aug':'import calculate from services\nload(int value) { return calculate(value) }\n',
  'main.yaml':'block_style: indent\n'
};
function fixture(run,changes={}) {
  const root=mkdtempSync(join(tmpdir(),'aug-capability-scaffold-'));
  try {for(const [file,source] of Object.entries({...files,...changes})){mkdirSync(dirname(join(root,file)),{recursive:true});writeFileSync(join(root,file),source);}return run(root);}
  finally {rmSync(root,{recursive:true,force:true});}
}
const command=(root,...args)=>spawnSync(process.execPath,[cli,'change',...args,root],{encoding:'utf8',timeout:30000});

test('a reviewed capability plan adds exact header dependencies through all callers without choosing a provider',()=>fixture(root=>{
  const original=Object.fromEntries(Object.keys(files).map(file=>[file,readFileSync(join(root,file),'utf8')]));
  const proposed=command(root,'plan-dependency','--file','services/calculations.aug','--symbol','calculate','--capability','Reader','--name','reader','--out','dependency.json','--json');
  assert.equal(proposed.status,0,proposed.stdout+proposed.stderr);
  const plan=JSON.parse(proposed.stdout);
  assert.equal(plan.operation,'add-dependency');
  assert.equal(plan.behavioralEvidence,'not-run');
  assert.equal(plan.coverage.checkedProject,true);
  assert.equal(plan.coverage.reverseCallers,'complete');
  assert.ok(plan.publicDelta.length>0);
  assert.deepEqual(plan.scope,['entry.aug','services/calculations.aug']);
  for(const [file,source] of Object.entries(original))assert.equal(readFileSync(join(root,file),'utf8'),source);
  const accepted=command(root,'apply','--plan','dependency.json','--json');
  assert.equal(accepted.status,0,accepted.stdout+accepted.stderr);
  assert.equal(JSON.parse(accepted.stdout).status,'committed');
  assert.match(readFileSync(join(root,'services/calculations.aug'),'utf8'),/calculate\(resolve Reader reader, int value\)/);
  assert.match(readFileSync(join(root,'entry.aug'),'utf8'),/load\(resolve Reader reader, int value\)/);
  assert.equal(readFileSync(join(root,'main.aug'),'utf8'),original['main.aug']);
  assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
  for(const backend of ['c','llvm']) {
    const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000});
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'8\n');
  }
}));

const proposed=root=>planChangeDependency(root,'services/calculations.aug','calculate','Reader','reader');
const snapshot=root=>Object.fromEntries(Object.keys(files).map(file=>[file,readFileSync(join(root,file),'utf8')]));

test('dependency plans include callers outside the import closure and leave unrelated same-named functions alone',()=>fixture(root=>{
  writeFileSync(join(root,'outside.aug'),'import calculate from services\nread(int value) { reader = 100; return calculate(value) + reader }\n');
  writeFileSync(join(root,'unrelated.aug'),'calculate(int value) { return value }\n');
  const plan=proposed(root);
  assert.ok(plan.scope.includes('outside.aug'));
  assert.ok(!plan.scope.includes('unrelated.aug'));
  applyChangePlan(root,plan);
  assert.match(readFileSync(join(root,'outside.aug'),'utf8'),/read\(resolve Reader reader2, int value\)/);
  assert.match(readFileSync(join(root,'outside.aug'),'utf8'),/reader = 100/);
  assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
}));

test('missing providers, unrelated errors and conflicting type names reject without source writes',()=>{
  for(const changes of [
    {'main.aug':files['main.aug'].replace('implement Reader with DoubleReader\n','')},
    {'entry.aug':files['entry.aug']+'broken() { return unknown }\n'},
    {'services/calculations.aug':files['services/calculations.aug']+'interface Reader { read() returns int }\n'}
  ])fixture(root=>{
    const before=snapshot(root);
    assert.throws(()=>proposed(root),/provider|unrelated|conflict|candidate|binding/i);
    assert.deepEqual(snapshot(root),before);
  },changes);
});

test('source, configuration, new callers and modified review facts invalidate a saved dependency plan',()=>{
  for(const change of [
    root=>writeFileSync(join(root,'entry.aug'),files['entry.aug']+'// concurrent edit\n'),
    root=>writeFileSync(join(root,'main.yaml'),'block_style: braces\n'),
    root=>writeFileSync(join(root,'new.aug'),'import calculate from services\nnextValue(int value) { return calculate(value) }\n')
  ])fixture(root=>{
    const plan=proposed(root);change(root);const before=snapshot(root);
    assert.throws(()=>applyChangePlan(root,plan),/STALE|revision/);assert.deepEqual(snapshot(root),before);
  });
  fixture(root=>{
    const plan=proposed(root),before=snapshot(root);
    for(const altered of [{...plan,publicDelta:[]},{...plan,headers:[]},{...plan,scope:[]},{...plan,edits:[]},{...plan,capability:'Other'}])
      assert.throws(()=>applyChangePlan(root,altered),/plan|dependency|delta|capability|selected/i);
    assert.deepEqual(snapshot(root),before);
  });
});

test('class methods receive constructor dependencies without rewriting their interface or choosing bindings',()=>fixture(root=>{
  const plan=planChangeDependency(root,'services/service.aug','Service.get','Reader','reader');
  assert.equal(plan.symbol,'services/service.aug:Service');
  applyChangePlan(root,plan);
  const source=readFileSync(join(root,'services/service.aug'),'utf8');
  assert.match(source,/Service\(resolve Reader reader\) implements Value/);
  assert.match(source,/get\(int value\) returns int uses Reader.read/);
  assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
  for(const backend of ['c','llvm']) {
    const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000});
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'8\n');
  }
},{
  'main.aug':'import Reader and DoubleReader from ports\nimport Value and Service from services\nimplement Reader with DoubleReader\nimplement Value with Service\nresolve Value to service\nprint(value=service.get(value=4))\n',
  'entry.aug':'','services/calculations.aug':'',
  'services/export.aug':'export Value from service\nexport Service from service\n',
  'services/service.aug':'import Reader from ports\nimport fetch from fetcher\ninterface Value { get(int value) returns int uses Reader.read }\nService() implements Value { get(int value) { return fetch(value) } }\n'
}));

test('editor previews a checked project-wide capability repair using unsaved source',()=>fixture(root=>{
  const workspace=new SemanticWorkspace(root),file=join(root,'services/calculations.aug');
  const text=files['services/calculations.aug'].replace('fetch(value)','fetch(value=value + 1)');
  const view=workspace.document(file,{text,version:7},true);
  const fix=view.fixes().find(fix=>/Review Reader dependency/.test(fix.title));
  assert.ok(fix,JSON.stringify(view.fixes()));
  assert.match(fix.description,/provider|public contract/i);
  assert.ok(fix.edits.some(edit=>edit.file===join(root,'entry.aug')));
  assert.ok(fix.review.publicDelta.length>0);
  const paths=[...new Set(fix.edits.map(edit=>edit.file))];
  for(const path of paths)writeFileSync(path,applySourceEdits(path===file?text:readFileSync(path,'utf8'),fix.edits.filter(edit=>edit.file===path)));
  assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
  assert.match(readFileSync(file,'utf8'),/fetch\(value=value \+ 1\)/);
}));


test('generic dependency propagation preserves concrete instantiations and supplies distinct header names',()=>fixture(root=>{
  const plan=planChangeDependency(root,'services/calculations.aug','calculate','Reader<T>','reader');
  assert.ok(!JSON.stringify([plan.capability,plan.headers]).includes(root),'generic dependency identities must use resolved owners, not absolute source paths');
  applyChangePlan(root,plan);
  const source=readFileSync(join(root,'entry.aug'),'utf8');
  assert.match(source,/resolve Reader<int> reader/);assert.match(source,/resolve Reader<string> reader2/);
  assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
  for(const backend of ['c','llvm']) {
    const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000});
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'8\nhi!\n');
  }
},{
  'ports/adapters.aug':'capability Reader<T> { read(T value) returns T uses Reader.read }\nDoubleReader() implements Reader<int> { read(int value) { return value * 2 } }\nTextReader() implements Reader<string> { read(string value) { return value + "!" } }\n',
  'ports/export.aug':'export Reader from adapters\nexport DoubleReader from adapters\nexport TextReader from adapters\n',
  'services/fetcher.aug':'import Reader from ports\nfetch<T>(resolve Reader<T> reader, T value) { return reader.read(value) }\n',
  'services/calculations.aug':'import fetch from fetcher\ncalculate<T>(T value) { return fetch<T>(value) }\n',
  'entry.aug':'import calculate from services\nload() returns Tuple<int, string> { return (calculate(value=4), calculate(value="hi")) }\n',
  'main.aug':'import Reader and DoubleReader and TextReader from ports\nimport load from entry\nimplement Reader<int> with DoubleReader\nimplement Reader<string> with TextReader\n(number, text) = load()\nprint(value=number)\nprint(value=text)\n'
}));

test('recursive caller propagation converges and preserves the body, comments and checked result',()=>fixture(root=>{
  const plan=proposed(root);applyChangePlan(root,plan);
  assert.match(readFileSync(join(root,'services/calculations.aug'),'utf8'),/nextValue\(resolve Reader reader, int value\)/);
  assert.match(readFileSync(join(root,'services/calculations.aug'),'utf8'),/Reader stays in this comment/);
  assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
  for(const backend of ['c','llvm']) {
    const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000});
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'8\n');
  }
},{'services/calculations.aug':'import fetch from fetcher\ncalculate(int value) returns int { if value == 0 { return fetch(value=4) }\n return nextValue(value=value-1) }\n// Reader stays in this comment.\nnextValue(int value) returns int { return calculate(value) }\n'}));

test('same-file tests participate in the complete candidate and run with their explicit providers',()=>fixture(root=>{
  const plan=proposed(root);applyChangePlan(root,plan);
  for(const backend of ['c','llvm']) {
    const result=spawnSync(process.execPath,[cli,'test',root,'--backend',backend,'--json'],{encoding:'utf8',timeout:60000});
    assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).passed,1);
  }
},{'services/calculations.aug':files['services/calculations.aug']+'import Reader and DoubleReader from ports\ntest calculate { when reading { implement Reader with DoubleReader; it "uses the selected test provider" { assertEqual(actual=calculate(value=3), expected=6) } } }\n'}));



test('an explicit dependency name cannot capture a global function value',()=>fixture(root=>{
  const before=snapshot(root);
  assert.throws(()=>planChangeDependency(root,'entry.aug','load','Reader','helper'),/conflicts with an existing name|preserve resolved references/);
  assert.deepEqual(snapshot(root),before);
  const plan=planChangeDependency(root,'entry.aug','load','Reader','reader');
  applyChangePlan(root,plan);
  assert.match(readFileSync(join(root,'entry.aug'),'utf8'),/consume\(reader=helper\)/);
  for(const backend of ['c','llvm']) {
    const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000});
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'104\n');
  }
},{
  'ports/adapters.aug':'capability Reader { read() returns int }\nDoubleReader() implements Reader { read() { return 4 } }\n',
  'services/fetcher.aug':'import Reader from ports\nfetch(resolve Reader reader) { return reader.read() }\n',
  'services/calculations.aug':'import fetch from fetcher\ncalculate(resolve Reader reader) { return fetch() }\nimport Reader from ports\n',
  'entry.aug':'import Reader from ports\nimport calculate from services\nhelper() { return 100 }\nconsume(Reader reader) { return reader.read() }\nload() { return calculate() + consume(reader=helper) }\n',
  'main.aug':'import Reader and DoubleReader from ports\nimport load from entry\nimplement Reader with DoubleReader\nprint(value=load())\n'
}));

test('LSP dependency actions are review-only for both versioned and unversioned clients',async t=>{
  const root=mkdtempSync(join(tmpdir(),'aug-capability-lsp-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  for(const [file,source] of Object.entries(files)){mkdirSync(dirname(join(root,file)),{recursive:true});writeFileSync(join(root,file),source);}
  const {Server}=createRequire(import.meta.url)('../vscode/server.cjs');
  for(const capabilities of [{},{workspace:{workspaceEdit:{documentChanges:true,changeAnnotationSupport:{groupsOnLabel:true}}}}]) {
    const connection=new Server({command:process.execPath,args:[cli,'lsp',root],env:process.env},()=>{},()=>{});
    try {
      await connection.ready;await connection.request('initialize',{capabilities});
      const uri=pathToFileURL(join(root,'services/calculations.aug')).href;
      await connection.request('aug/editor',{uri,text:files['services/calculations.aug'],version:7,command:'diagnostics'});
      const actions=await connection.request('textDocument/codeAction',{textDocument:{uri}});
      const preview=actions.find(action=>/Review Reader dependency/.test(action.title));
      assert.ok(preview,JSON.stringify(actions));
      assert.match(preview.disabled.reason,/plan-dependency.*apply/);
      assert.equal(preview.edit,undefined);assert.equal(preview.command,undefined);
      assert.ok(preview.data.candidateEdits.some(edit=>edit.file===join(root,'entry.aug')));
      assert.ok(preview.data.review.publicDelta.length>0);
      assert.equal(preview.data.review.request.symbol,'calculate');
      const saved=snapshot(root);
      writeFileSync(join(root,'main.yaml'),'block_style: braces\n');
      writeFileSync(join(root,'extra.aug'),'import calculate from services\nextra(int value) { return calculate(value) }\n');
      connection.changed();
      const refreshed=(await connection.request('textDocument/codeAction',{textDocument:{uri}})).find(action=>/Review Reader dependency/.test(action.title));
      assert.ok(refreshed);assert.notEqual(refreshed.data.revision,preview.data.revision);
      assert.ok(refreshed.data.review.headers.some(header=>header.file==='extra.aug'));
      assert.equal(refreshed.edit,undefined);assert.equal(refreshed.command,undefined);
      for(const [file,source] of Object.entries(saved))if(file!=='main.yaml')assert.equal(readFileSync(join(root,file),'utf8'),source);
    }finally {connection.dispose();writeFileSync(join(root,'main.yaml'),files['main.yaml']);rmSync(join(root,'extra.aug'),{force:true});}
  }
});
