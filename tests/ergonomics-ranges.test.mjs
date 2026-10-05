import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';

for(const backend of ['c','llvm'])test('bounded ranges handle directions, invalid limits and int64 edges ('+backend+')',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-ranges-'));
  try {
    writeFileSync(join(root,'main.aug'),`import range and RangeError from august.collections
try {
 print(value=range(end=4).length())
 print(value=range(end=2, limit=2).length())
 for value in range(start=5, end=-1, step=-2) { print(value=value) }
 print(value=range(start=4, end=1).length())
 print(value=range(start=9223372036854775806, end=9223372036854775807, step=2).length())
 print(value=range(start=-9223372036854775807, end=-9223372036854775808, step=-2).length())
} catch RangeError error { print(value="unexpected failure") }
try { range(end=2, step=0) } catch RangeError error { print(value="zero step") }
try { range(end=3, limit=2) } catch RangeError error { print(value="limit") }
try { range(end=0, limit=0) } catch RangeError error { print(value="invalid limit") }
`);
    const result=spawnSync(process.execPath,['bin/aug.mjs','run',root,'--backend',backend,'--offline'],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'4\n2\n5\n3\n1\n0\n1\n1\nzero step\nlimit\ninvalid limit\n');
  }finally{rmSync(root,{recursive:true,force:true});}
});


for(const backend of ['c','llvm'])test('contextual start and wait names remain readable inputs ('+backend+')',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-contextual-task-'));
 try {
  writeFileSync(join(root,'work.aug'),'measure(int start, int wait) { return start + wait }\n');
  writeFileSync(join(root,'main.aug'),'import measure from work\nscope { task = start measure(start=2, wait=3); wait for task as result; print(value=result) }\n');
  const result=spawnSync(process.execPath,['bin/aug.mjs','run',root,'--backend',backend,'--offline'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'5\n');
 }finally{rmSync(root,{recursive:true,force:true});}
});
