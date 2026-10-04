import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const cli=resolve('bin/aug.mjs');

test('aug add derives an ordinary alias and refuses to replace a different package',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-ergonomics-packages-'));
  try {
    const app=join(root,'app'),one=join(root,'one'),two=join(root,'two');
    for(const folder of [app,one,two])mkdirSync(folder);
    for(const folder of [one,two]){
      writeFileSync(join(folder,'aug-package.json'),JSON.stringify({format:1,name:'@example/aug-fruit',version:'1.0.0',compiler:'>=0.23.0 <1.0.0',source:'.'}));
      writeFileSync(join(folder,'export.aug'),'export apple from values\n');
      writeFileSync(join(folder,'values.aug'),'apple():\n    return "apple"\n');
    }
    writeFileSync(join(app,'main.aug'),'print(value="ready")\n');
    const add=request=>spawnSync(process.execPath,[cli,'add',request,'--project',app],{encoding:'utf8',timeout:60000});
    const installed=add(one);assert.equal(installed.status,0,installed.stderr);assert.match(installed.stdout,/Added fruit/);
    const before=readFileSync(join(app,'main.yaml'),'utf8'),lock=readFileSync(join(app,'aug.lock.json'),'utf8');
    const conflict=add(two);assert.equal(conflict.status,1);assert.match(conflict.stderr,/fruit.*already|already.*fruit/);assert.match(conflict.stderr,/--as/);
    assert.equal(readFileSync(join(app,'main.yaml'),'utf8'),before);assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),lock);
    writeFileSync(join(app,'main.aug'),'import apple from fruit\nprint(value=apple())\n');
    const run=spawnSync(process.execPath,[cli,'run',app,'--offline'],{encoding:'utf8',timeout:60000});
    assert.equal(run.status,0,run.stderr);assert.equal(run.stdout,'apple\n');
    const beforeInspection=readFileSync(join(app,'aug.lock.json'),'utf8');
    const dependencies=spawnSync(process.execPath,[cli,'dependencies',app,'--json'],{encoding:'utf8',timeout:60000});
    assert.equal(dependencies.status,0,dependencies.stderr);
    const report=JSON.parse(dependencies.stdout);
    assert.equal(report.roots.fruit,report.packages[0].id);
    assert.equal(report.packages[0].name,'@example/aug-fruit');
    assert.equal(report.imports[0].file,'main.aug');assert.deepEqual(report.imports[0].names,['apple']);
    assert.equal(report.imports[0].package,report.packages[0].id);
    assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),beforeInspection);

  } finally {rmSync(root,{recursive:true,force:true});}
});


test('package readiness distinguishes static checking from behavioral evidence and license selection',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-package-readiness-'));
  try {
    const init=spawnSync(process.execPath,[cli,'package','init',root,'--name','@example/aug-math'],{encoding:'utf8'});
    assert.equal(init.status,0,init.stderr);
    const inspect=()=>spawnSync(process.execPath,[cli,'package','check',root,'--json'],{encoding:'utf8'});
    const missing=inspect();assert.equal(missing.status,1,missing.stderr);
    const report=JSON.parse(missing.stdout);assert.equal(report.evidence.behavior,'not-run');
    assert.ok(report.checks.some(check=>check.id==='license'&&check.status==='error'));
    writeFileSync(join(root,'LICENSE'),'Test package license selected by its author.\n');
    const ready=inspect();assert.equal(ready.status,0,ready.stderr);assert.equal(JSON.parse(ready.stdout).ready,true);
    writeFileSync(join(root,'src/arithmetic.aug'),'add(int left, int right):\n    return left + right\n');
    const incomplete=inspect();assert.equal(incomplete.status,1,incomplete.stderr);
    assert.ok(JSON.parse(incomplete.stdout).checks.some(check=>check.id==='documentation'&&check.status==='error'));
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('package interface diffs use exports and report required input changes rather than private body edits',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-package-diff-'));
  try {
    const before=join(root,'before'),after=join(root,'after');
    for(const [directory,version] of [[before,'1.0.0'],[after,'1.1.0']]) {
      mkdirSync(directory);
      writeFileSync(join(directory,'aug-package.json'),JSON.stringify({format:1,name:'@example/math',version,compiler:'0.23.0',source:'.'}));
      writeFileSync(join(directory,'export.aug'),'export add from math\n');
      writeFileSync(join(directory,'math.aug'),'add(int left, int right):\n    return left + right\nhelper():\n    return 1\n');
    }
    const diff=()=>spawnSync(process.execPath,[cli,'package','diff',before,after,'--json'],{encoding:'utf8'});
    writeFileSync(join(after,'math.aug'),'add(int left, int right):\n    return left + right\nhelper():\n    return "private implementation"\n');
    const unchanged=diff();assert.equal(unchanged.status,0,unchanged.stderr);assert.deepEqual(JSON.parse(unchanged.stdout).changes,[]);
    writeFileSync(join(after,'math.aug'),'add(int left, int right, int adjustment):\n    return left + right + adjustment\n');
    const changed=diff();assert.equal(changed.status,0,changed.stderr);
    const delta=JSON.parse(changed.stdout).changes;assert.equal(delta.length,1);assert.equal(delta[0].name,'add');
    assert.equal(delta[0].after.callables[0].inputs.at(-1).label,'adjustment');
  }finally{rmSync(root,{recursive:true,force:true});}
});


test('public package diffs ignore private storage names and include inherited defaults',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-package-inheritance-'));
  try {
    const before=join(root,'before'),after=join(root,'after');
    for(const directory of [before,after]) {
      mkdirSync(directory);writeFileSync(join(directory,'aug-package.json'),JSON.stringify({format:1,name:'@example/counter',version:'1.0.0',compiler:'0.23.0',source:'.'}));
      writeFileSync(join(directory,'export.aug'),'export Counter from counter\n');
      writeFileSync(join(directory,'counter.aug'),'interface View { read(int input) returns int { return input } }\nCounter(int value to _value) implements View { }\n');
    }
    const diff=()=>spawnSync(process.execPath,[cli,'package','diff',before,after,'--json'],{encoding:'utf8'});
    writeFileSync(join(after,'counter.aug'),'interface View { read(int input) returns int { return input } }\nCounter(int value to _count) implements View { }\n');
    const renamed=diff();assert.equal(renamed.status,0,renamed.stderr);assert.deepEqual(JSON.parse(renamed.stdout).changes,[]);
    writeFileSync(join(after,'counter.aug'),'interface View { read(int input, int adjustment) returns int { return input + adjustment } }\nCounter(int value to _count) implements View { }\n');
    const changed=diff();assert.equal(changed.status,0,changed.stderr);const changes=JSON.parse(changed.stdout).changes;
    assert.equal(changes.length,1);assert.equal(changes[0].name,'Counter');
    assert.ok(changes[0].after.callables.find(method=>method.name==='read').inputs.some(input=>input.label==='adjustment'));
  }finally{rmSync(root,{recursive:true,force:true});}
});


test('package diffs expand inherited interface requirements and substitute class default types',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-package-interface-inheritance-'));
  try {
    const before=join(root,'before'),after=join(root,'after');
    for(const directory of [before,after]) {
      mkdirSync(directory);writeFileSync(join(directory,'aug-package.json'),JSON.stringify({format:1,name:'@example/view',version:'1.0.0',compiler:'0.23.0',source:'.'}));
      writeFileSync(join(directory,'export.aug'),'export View from view\nexport Counter from view\n');
      writeFileSync(join(directory,'view.aug'),'interface Reader<T> { read(T input) returns T { return input } }\ninterface View extends Reader<int> {}\nCounter() implements Reader<string> {}\n');
    }
    const diff=()=>spawnSync(process.execPath,[cli,'package','diff',before,after,'--json'],{encoding:'utf8'});
    writeFileSync(join(after,'view.aug'),'interface Reader<T> { read(T input, int adjustment) returns T { return input } }\ninterface View extends Reader<int> {}\nCounter() implements Reader<string> {}\n');
    const result=diff();assert.equal(result.status,0,result.stderr);const changes=JSON.parse(result.stdout).changes;
    assert.deepEqual(changes.map(change=>change.name),['Counter','View']);
    const method=changes.find(change=>change.name==='View').after.callables.find(method=>method.name==='read');
    assert.equal(method.inputs[0].type,'int');assert.equal(method.result,'int');
    const defaultMethod=changes.find(change=>change.name==='Counter').after.callables.find(method=>method.name==='read');
    assert.equal(defaultMethod.inputs[0].type,'string');assert.equal(defaultMethod.result,'string');
    for(const directory of [before,after]) {
      writeFileSync(join(directory,'export.aug'),'export View from view\n');
      writeFileSync(join(directory,'view.aug'),'interface Reader<T implements Data> { read(immutable List<T> input) returns T }\ninterface View extends Reader<int> {}\n');
    }
    writeFileSync(join(after,'view.aug'),'interface Reader<T implements Data> { read(immutable List<T> input, int adjustment) returns T }\ninterface View extends Reader<int> {}\n');
    const immutable=diff();assert.equal(immutable.status,0,immutable.stderr);
    assert.equal(JSON.parse(immutable.stdout).changes[0].after.callables[0].inputs[0].type,'immutable List<int>');
    for(const folder of [before,after])writeFileSync(join(folder,'view.aug'),'interface Reader<T> { read(T input) returns T }\ninterface View extends Reader<List<int>> {}\n');
    writeFileSync(join(after,'view.aug'),'interface Reader<T> { read(T input, int adjustment) returns T }\ninterface View extends Reader<List<int>> {}\n');
    const collections=diff();assert.equal(collections.status,0,collections.stderr);
    const inherited=JSON.parse(collections.stdout).changes[0].after.callables[0];
    assert.equal(inherited.inputs[0].type,'List<int>');assert.equal(inherited.result,'List<int>');

  }finally{rmSync(root,{recursive:true,force:true});}
});
