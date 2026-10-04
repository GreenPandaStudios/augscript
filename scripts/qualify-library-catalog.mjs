#!/usr/bin/env node
// Consumer checks use aug add, ordinary alias imports, retained native artifacts and the selected compiler.
import {mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {libraryCatalog} from '../src/library-catalog.ts';
const root=resolve(import.meta.dirname,'..'),temporary=mkdtempSync(join(tmpdir(),'aug-catalog-consumer-'));
const fixtures=[['pytorch','tensors','21'],['sqlite','database','August'],['zlib','compression','The world runs on language'],['blake3','hashing','6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85']];
const run=(...args)=>{
  const result=spawnSync(process.execPath,[join(root,'bin/aug.mjs'),...args],{encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});
  assert.equal(result.status,0,result.stderr||result.error?.message);return result.stdout;
};
try {
  for(const [id,helper,expected]of fixtures) {
    const entry=libraryCatalog(id).entries.find(entry=>entry.id===id),directory=join(temporary,id);mkdirSync(directory);
    writeFileSync(join(directory,'main.aug'),'');
    run('add',entry.source.request,'--as',id,'--project',directory);
    for(const file of ['main.aug',helper+'.aug']) {
      const source=readFileSync(join(root,'examples/native-'+id,file),'utf8').replace(/^\/\/ aug-spec:.*\n/,'')
        .replaceAll('"'+entry.source.request+'"',id);
      writeFileSync(join(directory,file),source);
    }
    assert.equal(run('run',directory).trim(),expected);
    const tests=JSON.parse(run('test',directory,'--json'));assert.ok(tests.passed>0);assert.equal(tests.failed,0);
    const lock=JSON.parse(readFileSync(join(directory,'aug.lock.json'),'utf8'));
    assert.equal(lock.git.find(source=>source.repository===entry.source.request.split('#')[0]+'.git').commit,entry.source.commit);
    console.log(id+': repository alias import, native result, same-file test and exact source lock passed.');
  }
}finally{rmSync(temporary,{recursive:true,force:true});}
