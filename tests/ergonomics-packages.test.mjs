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
  } finally {rmSync(root,{recursive:true,force:true});}
});
