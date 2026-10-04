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
