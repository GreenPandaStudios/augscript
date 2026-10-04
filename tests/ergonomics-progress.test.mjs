import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';

for(const backend of ['c','llvm'])test('run reports useful phases without changing program output ('+backend+')',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-progress-'));
 try {
  writeFileSync(join(root,'main.aug'),'print(value="hello")\n');
  const run=spawnSync(process.execPath,['bin/aug.mjs','run',root,'--backend',backend,'--offline','--progress'],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);assert.equal(run.stdout,'hello\n');
  const phases=[...run.stderr.matchAll(/^\[August\] (.+?): (started|completed|failed)/gm)].map(match=>[match[1],match[2]]);
  assert.deepEqual(phases.slice(0,4),[['source resolution','started'],['source resolution','completed'],['checking','started'],['checking','completed']]);
  assert.ok(phases.some(([phase,state])=>phase==='execution'&&state==='completed'));
  if(backend==='llvm')assert.ok(phases.some(([phase,state])=>phase==='linking'&&state==='completed'));
  writeFileSync(join(root,'main.aug'),'print(value=unknownValue)\n');
  const failed=spawnSync(process.execPath,['bin/aug.mjs','run',root,'--backend',backend,'--offline','--progress'],{encoding:'utf8'});
  assert.equal(failed.status,1);assert.match(failed.stderr,/checking: failed/);assert.match(failed.stderr,/Unknown name unknownValue/);
  assert.doesNotMatch(failed.stderr,/execution: started/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
