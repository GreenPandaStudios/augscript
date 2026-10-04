import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {syntaxIdioms,idiomsFor} from '../src/syntax-idioms.ts';
import {parse} from '../src/parser.ts';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';

for(const idiom of syntaxIdioms)test('independent context idiom compiles and runs: '+idiom.id,()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-idiom-'));
  try {
    for(const [file,source] of Object.entries(idiom.files))writeFileSync(join(root,file),source);
    for(const backend of ['c','llvm']) {
      const result=spawnSync(process.execPath,['bin/aug.mjs','run',root,'--backend',backend],{encoding:'utf8'});
      assert.equal(result.status,0,result.stdout+result.stderr);assert.equal(result.stdout,idiom.output);
    }
    const record=idiomsFor(new Set(idiom.constructs)).find(example=>example.id===idiom.id);
    assert.equal(record.origin,'independent-example');assert.match(record.sha256,/^[a-f0-9]{64}$/);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('diagnostics teach bindings and comparisons while preserving ordinary identifiers',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-binding-'));
  try {
    writeFileSync(join(root,'main.aug'),'');writeFileSync(join(root,'work.aug'),'read() { let quantity = 4; return quantity }\n');
    const binding=checkProject(loadProject(root));
    assert.ok(binding.diagnostics.some(issue=>issue.code==='BINDING'&&/name = value/.test(issue.message)),JSON.stringify(binding.diagnostics));
    writeFileSync(join(root,'work.aug'),'record let(int value)\nread() { let quantity = let(value=4); return quantity.value }\n');
    assert.deepEqual(checkProject(loadProject(root)).diagnostics,[]);
  }finally{rmSync(root,{recursive:true,force:true});}
  for(const keyword of ['if','while']) {
    const condition=parse('work.aug',`read(int value) { ${keyword} value = 4 { return true } return false }\n`);
    assert.ok(condition.diagnostics.some(issue=>issue.code==='CONDITION'&&/==/.test(issue.message)),JSON.stringify(condition.diagnostics));
  }
  assert.deepEqual(parse('work.aug','let(int value) { return value }\nread() { return let(value=4) }\n').diagnostics,[]);
});
