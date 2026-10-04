import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {compilerVersion} from '../src/package-manager.ts';
import {SemanticWorkspace} from '../src/semantic.ts';

test('an explicit compiler pin checks before installation and reaches editor diagnostics',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-toolchain-'));
 try {
  const file=join(root,'main.aug');writeFileSync(file,'print(value="hello")\n');
  const cli=(...args)=>spawnSync(process.execPath,['bin/aug.mjs',...args,root,'--json'],{encoding:'utf8'});
  writeFileSync(join(root,'main.yaml'),'compiler: '+compilerVersion()+'\n');
  assert.equal(cli('check').status,0);
  writeFileSync(join(root,'main.yaml'),'compiler: 99.0.0\n');
  const wrong=cli('check');assert.equal(wrong.status,1);assert.match(wrong.stdout,/requires August 99.0.0/);
  assert.match(wrong.stdout,/npx @greenpandastudios\/aug-cli@99.0.0/);
  assert.ok(new SemanticWorkspace(root).document(file,undefined,true).diagnostics.some(issue=>issue.code==='CONFIG'&&/requires August/.test(issue.message)));
  const run=cli('run');assert.equal(run.status,1);assert.match(run.stderr,/requires August 99.0.0/);
  assert.deepEqual(readdirSync(root).sort(),['main.aug','main.yaml']);
  writeFileSync(join(root,'main.yaml'),'compiler: ">=0.23.0"\n');
  const invalid=cli('check');assert.equal(invalid.status,1);assert.match(invalid.stdout,/exact/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
