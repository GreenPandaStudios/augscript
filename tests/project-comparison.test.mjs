import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const cli=resolve('bin/aug.mjs');
function fixture(before,after,run){const root=mkdtempSync(join(tmpdir(),'aug-project-compare-'));try{const paths=['before','after'].map(name=>join(root,name));[before,after].forEach((files,index)=>{mkdirSync(paths[index]);for(const [name,source] of Object.entries(files)){const file=join(paths[index],name);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,source);}});return run(...paths);}finally{rmSync(root,{recursive:true,force:true});}}
const compare=(before,after,...options)=>spawnSync(process.execPath,[cli,'compare',before,after,...options],{encoding:'utf8'});

test('project comparison ignores installation paths and never writes source or reports behavior evidence',()=>{
 const files={'main.aug':'import answer from model\nprint(value=answer())\n','model.aug':'answer() returns int { return 7 }\n'};
 fixture(files,files,(before,after)=>{
  const names=[readdirSync(before),readdirSync(after)],result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(result.stdout);assert.equal(report.schema,1);assert.equal(report.status,'compared');assert.equal(report.before.revision,report.after.revision);
  assert.deepEqual(report.changes,[]);assert.deepEqual(report.sourceChanges,[]);assert.deepEqual(report.configurationChanges,[]);
  assert.equal(report.evidence.behavior,'not-run');assert.equal(report.before.coverage.checkedProject,true);
  assert.deepEqual([readdirSync(before),readdirSync(after)],names);assert.equal(readFileSync(join(after,'model.aug'),'utf8'),files['model.aug']);
  const repeated=compare(before,after,'--json');assert.equal(repeated.stdout,result.stdout);
 });
});

test('an implementation change retains its contract and reports transitive callers and independent test source',()=>{
 const files={'main.aug':'import outer from model\nprint(value=outer())\n','model.aug':'_inner() returns int { return 7 }\nouter() returns int { return _inner() }\n','consumer.aug':'import outer from model\nrun() returns int { return outer() }\ntest run { when basic { it positive { assert(condition=run() > 0) } } }\n','decoy.aug':'outer() returns int { return 99 }\n'};
 fixture(files,{...files,'model.aug':files['model.aug'].replace('return 7','return 8')},(before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
  const changed=report.changes.find(change=>change.id==='model.aug:_inner');assert.ok(changed,result.stdout);assert.deepEqual(changed.categories,['source']);assert.deepEqual(changed.contractDifferences,[]);
  const callers=changed.impact.after.map(entry=>entry.symbol);assert.ok(callers.includes('model.aug:outer'));assert.ok(callers.includes('consumer.aug:run'));assert.ok(callers.includes('module:main.aug'));assert.ok(callers.includes('module:consumer.aug'));
  assert.ok(!callers.includes('decoy.aug:outer'));assert.equal(report.evidence.tests,'source-only');
  const available=report.after.tests.find(unit=>unit.name==='positive');assert.ok(available);assert.equal(available.subject,'consumer.aug:run');assert.equal(available.independence,'not-assessed');assert.equal(available.execution,'not-run');
 });
});

test('checked project contracts reveal public label changes and type consumers',()=>{
 const common={'main.aug':'','model.aug':'record Item(int value)\nread(Item item, int amount) returns int { return amount }\n','consumer.aug':'import Item from model\ninspect(Item item) returns int { return item.value }\n'};
 fixture(common,{...common,'model.aug':'record Item(int value, int count = 1)\nread(Item item, int limit) returns int { return limit }\n'},(before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
  const read=report.changes.find(change=>change.id==='model.aug:read');assert.ok(read.contractDifferences.some(delta=>delta.path.endsWith('inputs[1].label')&&delta.before==='amount'&&delta.after==='limit'));
  const item=report.changes.find(change=>change.id==='model.aug:Item');assert.ok(item.impact.after.some(entry=>entry.symbol==='consumer.aug:inspect'&&entry.relation==='type'));
 });
});

test('rejected snapshots include their own revision and exact diagnostics without accepted comparison',()=>fixture(
 {'main.aug':'print(value=7)\n'}, {'main.aug':'print(value=unknownValue)\n'}, (before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,1,result.stderr);const report=JSON.parse(result.stdout);
  assert.equal(report.status,'rejected');assert.match(report.before.revision,/^[a-f0-9]{64}$/);assert.match(report.after.revision,/^[a-f0-9]{64}$/);
  assert.equal(report.before.diagnostics.length,0);assert.ok(report.after.diagnostics.some(issue=>issue.code==='NAME'&&issue.file==='main.aug'));assert.deepEqual(report.changes,[]);
 }));

test('configuration and physical dependency metadata changes retain exact revisions without invented declaration deltas',()=>{
 const common={'main.aug':'print(value=7)\n','main.yaml':'optimization: debug\n','package.json':'{"name":"example","description":"before"}\n'};
 fixture(common,{...common,'main.yaml':'optimization: release\n','package.json':'{"name":"example","description":"after"}\n'},(before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
  assert.notEqual(report.before.revision,report.after.revision);assert.deepEqual(report.changes,[]);assert.deepEqual(report.sourceChanges,[]);
  assert.ok(report.configurationChanges.some(change=>change.file==='main.yaml'));assert.ok(report.dependencyChanges.some(change=>change.file==='project/package.json'));
 });
});

test('folder export removals remain visible when the implementation source does not change',()=>{
 const common={'main.aug':'','service/api.aug':'answer() returns int { return 7 }\n','service/export.aug':'export answer from api\n'};
 fixture(common,{...common,'service/export.aug':'internal answer from api\n'},(before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
  const change=report.changes.find(change=>change.id==='service/api.aug:answer');assert.ok(change,result.stdout);
  assert.ok(change.categories.includes('visibility'));assert.ok(!change.categories.includes('source'));
  assert.equal(change.before.visibility.folder,'exported');assert.equal(change.after.visibility.folder,'internal');
 });
});

test('moving a declaration is removal and addition with no guessed identity correspondence',()=>fixture(
 {'main.aug':'','old.aug':'answer() returns int { return 7 }\n'},
 {'main.aug':'','new.aug':'answer() returns int { return 7 }\n'},(before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
  assert.deepEqual(report.changes.map(change=>[change.id,change.kind]),[['new.aug:answer','added'],['old.aug:answer','removed']]);assert.equal(report.evidence.correspondence,'exact-identities-only');
 }));

test('pure function references belong to implementation changes rather than public promises',()=>{
 const common={'main.aug':'','model.aug':'interface Predicate { accepts(int value) returns bool }\n_positive(int value) returns bool { return value > 0 }\n_negative(int value) returns bool { return value < 0 }\nchoose() returns Predicate { return _positive }\n'};
 fixture(common,{...common,'model.aug':common['model.aug'].replace('return _positive','return _negative')},(before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout),change=report.changes.find(change=>change.id==='model.aug:choose');
  assert.deepEqual(change.categories,['source']);assert.deepEqual(change.contractDifferences,[]);assert.ok(!Object.hasOwn(change.after.contract,'functionValues'));
 });
});

test('dynamic and native call boundaries remain explicit in a checked comparison',()=>{
 const files={'main.aug':'','model.aug':'interface Name { name() returns string }\nread(Name value) returns string { return value.name() }\nextern C nativeValue() returns int\nraw() returns int { unsafe { return nativeValue() } }\n'};
 fixture(files,files,(before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
  assert.equal(report.after.coverage.dispatch,'bounded');assert.ok(report.after.boundaries.some(boundary=>boundary.kind==='interface-dispatch'));assert.ok(report.after.boundaries.some(boundary=>boundary.kind==='native-code'));
  assert.equal(report.evidence.externalConsumers,'outside-project');assert.equal(report.evidence.behavior,'not-run');
 });
});

test('comparison options are checked before source reads and human output retains evidence limits',()=>{
 const help=spawnSync(process.execPath,[cli,'compare','--help'],{encoding:'utf8'});assert.equal(help.status,0,help.stderr);assert.match(help.stdout,/aug compare BEFORE AFTER/);
 for(const options of [[],['before'],['before','after','--unknown'],['before','after','--json','--json']]){
  const result=spawnSync(process.execPath,[cli,'compare',...options],{encoding:'utf8'});assert.equal(result.status,2);assert.match(result.stderr,/Use aug compare/);
 }
 fixture({'main.aug':''},{'main.aug':''},(before,after)=>{const result=compare(before,after);assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/Behavior was not tested/);});
});


test('an applied interceptor retains resolved consumers and delegation uncertainty',()=>{
 const files={'main.aug':'import run from model\nprint(value=run(input=7))\n','model.aug':'interceptor PlusOne() { around(int input) returns int { return next() + 1 } }\n[PlusOne] run(int input) returns int { return input }\n'};
 fixture(files,{...files,'model.aug':files['model.aug'].replace('next() + 1','next() + 2')},(before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
  const changed=report.changes.find(change=>change.id==='model.aug:PlusOne');assert.deepEqual(changed.categories,['source']);
  const application=changed.impact.after.find(entry=>entry.symbol==='model.aug:run'&&entry.relation==='interceptor');assert.ok(application,result.stdout);
  assert.equal(files['model.aug'].slice(application.location.start,application.location.end),'[PlusOne]');
  assert.ok(changed.impact.before.some(entry=>entry.symbol==='module:main.aug'));assert.ok(changed.impact.after.some(entry=>entry.symbol==='module:main.aug'));
  assert.ok(report.after.boundaries.some(boundary=>boundary.kind==='interceptor-delegation'));
  const packet=spawnSync(process.execPath,[cli,'context',after,'--file',join(after,'model.aug'),'--name','PlusOne','--mode','review','--budget','100000'],{encoding:'utf8'});
  assert.equal(packet.status,0,packet.stderr);assert.ok(JSON.parse(packet.stdout).contracts.some(contract=>contract.id==='model.aug:run'));assert.match(JSON.parse(packet.stdout).snippets.find(snippet=>snippet.id==='model.aug:run').source,/^\[PlusOne\]/);
 });
});

test('a checked constructor and same-named member retain distinct callable contracts',()=>{
 const files={'main.aug':'','model.aug':'interface I { Foo() returns int }\nFoo(int value) implements I { Foo() returns int { return value } }\n'};
 fixture(files,files,(before,after)=>{const result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout).changes,[]);});
 fixture(files,{...files,'model.aug':files['model.aug'].replace('int value','int value, int extra = 1')},(before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);const change=JSON.parse(result.stdout).changes.find(change=>change.id==='model.aug:Foo');
  const callables=change.after.contract.callables;assert.equal(callables.find(callable=>callable.inputs.length===2).inputs[1].label,'extra');assert.equal(callables.find(callable=>callable.inputs.length===0).result,'int');
 });
});


test('interceptor mappings are implementation source even when expanded contracts stay equal',()=>{
 const files={'main.aug':'','model.aug':'interceptor Select() { around(int input) returns int { return input } }\n[Select(input=left)] choose(int left, int right) returns int { return 0 }\n'};
 fixture(files,{...files,'model.aug':files['model.aug'].replace('input=left','input=right')},(before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,0,result.stderr);const change=JSON.parse(result.stdout).changes.find(change=>change.id==='model.aug:choose');
  assert.ok(change,result.stdout);assert.deepEqual(change.categories,['source']);assert.deepEqual(change.contractDifferences,[]);
 });
});

test('a rejected incomplete declaration returns checker diagnostics instead of projecting a contract',()=>fixture(
 {'main.aug':''},{'main.aug':'','model.aug':'Foo(Unknown value) implements Missing { Foo() returns int { return 7 } }\n'},(before,after)=>{
  const result=compare(before,after,'--json');assert.equal(result.status,1,result.stderr);const report=JSON.parse(result.stdout);assert.equal(report.status,'rejected');assert.ok(report.after.diagnostics.length>0);assert.deepEqual(report.changes,[]);
 }));
