#!/usr/bin/env node
// Real public-source qualification; native execution remains the separate library consumer gate.
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {libraryCatalog} from '../src/library-catalog.ts';
const root=resolve(import.meta.dirname,'..'),temporary=mkdtempSync(join(tmpdir(),'aug-public-preview-'));
const run=(...args)=>{const result=spawnSync(process.execPath,[join(root,'bin/aug.mjs'),...args],{encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024});assert.equal(result.status,0,result.stderr||result.error?.message);return result.stdout;};
try{
  const entry=libraryCatalog('sqlite').entries.find(entry=>entry.id==='sqlite'),app=join(temporary,'app');mkdirSync(app);writeFileSync(join(app,'main.aug'),'');
  run('add',entry.source.request,'--as','sqlite','--project',app);
  for(const file of ['main.aug','database.aug'])writeFileSync(join(app,file),readFileSync(join(root,'examples/native-sqlite',file),'utf8').replace(/^\/\/ aug-spec:.*\n/,'').replaceAll('"'+entry.source.request+'"','sqlite'));
  const accepted=readFileSync(join(app,'aug.lock.json'),'utf8'),report=JSON.parse(run('update',app,'--preview','--json'));
  assert.equal(report.ready,true);assert.equal(report.acceptedWrites,false);assert.equal(report.behavioralEvidence,'not-run');
  assert.equal(report.packages.length,1);assert.equal(report.packages[0].after.source.commit,entry.source.commit);assert.deepEqual(report.packages[0].contracts.changes,[]);
  assert.equal(report.application.after.checked,true);assert.equal(report.native.status,'selected');assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),accepted);
  assert.ok(report.native.artifacts.every(artifact=>artifact.status==='verified'));
  console.log('SQLite public repository alias: exact reviewed commit, complete contract comparison, current callers and cached native bytes verified; accepted lock unchanged.');
}finally{rmSync(temporary,{recursive:true,force:true});}
