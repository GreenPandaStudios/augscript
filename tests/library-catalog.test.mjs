import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync, mkdtempSync, existsSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {libraryCatalog} from '../src/library-catalog.ts';
const run = (...args) => spawnSync(process.execPath,['bin/aug.mjs','libraries',...args],{encoding:'utf8'});

test('task search is deterministic and includes actionable ordinary imports',()=>{
  const result=libraryCatalog('compression');assert.equal(result.format,1);assert.ok(result.compiler);
  assert.deepEqual(result.entries.map(entry=>entry.id),['zlib']);
  const entry=result.entries[0];assert.match(entry.install,/aug add.*aug-zlib#v0.1.5.*--as zlib/);
  assert.match(entry.example,/import .*compress.* from zlib/);assert.match(entry.ownership,/copied|managed/i);
  assert.ok(entry.license.summary);assert.match(entry.tests.url,/native-zlib|aug-zlib/);
  assert.equal(JSON.stringify(result),JSON.stringify(libraryCatalog('compression')));
  assert.deepEqual(libraryCatalog('CoMpReSsIoN').entries,result.entries);
  assert.equal(libraryCatalog('not-a-library').entries.length,0);
  assert.ok(libraryCatalog('sql database').entries.some(entry=>entry.id==='sqlite'));
  assert.deepEqual(libraryCatalog('openMemory').entries.map(entry=>entry.id),['sqlite']);
  assert.equal(libraryCatalog('aarch64-apple-darwin').entries.length,6);
  assert.equal(libraryCatalog('MIT').entries.length,15);
  const context=libraryCatalog('errorContext').entries.find(entry=>entry.id==='errors');
  assert.equal(context.source.module,'august.errors');assert.equal(context.install,undefined);assert.match(context.requirements,/Unreleased/);
  assert.ok(libraryCatalog('borrow').entries.some(entry=>entry.id==='sqlite'));
  assert.ok(libraryCatalog('scope exit').entries.some(entry=>entry.id==='pytorch'));
  assert.ok(!libraryCatalog('MIT').entries.every(entry=>/limit/i.test(entry.summary)));
});

test('native entries preserve the exact qualified revisions, hashes and host requirements',()=>{
  const entries=libraryCatalog().entries,qualification=JSON.parse(readFileSync('native/library-qualification.json','utf8'));
  for(const id of ['pytorch','sqlite','zlib','blake3']) {
    const entry=entries.find(entry=>entry.id===id);assert.ok(entry,id);
    assert.equal(entry.source.commit,qualification.targets['darwin-arm64'][id].commit);
    assert.equal(entry.version,qualification.targets['darwin-arm64'][id].version);
    assert.equal(entry.compilerRequirement,'0.23.0');
    for(const [host,selection] of Object.entries(qualification.targets)) {
      const triple={'darwin-arm64':'aarch64-apple-darwin','linux-x64':'x86_64-unknown-linux-gnu','linux-arm64':'aarch64-unknown-linux-gnu'}[host];
      const artifact=entry.artifacts.find(artifact=>artifact.target.triple===triple);
      assert.equal(artifact.sha256,selection[id].sha256);
      if(host.startsWith('linux'))assert.equal(artifact.target.minimumLibc,'2.36');else assert.equal(artifact.target.minimumOS,'14.0');
    }
    assert.equal(entry.evidence.artifactBytes,'not-checked-by-catalog');
  }
  assert.equal(entries.find(entry=>entry.id==='gpu').artifacts.length,1);
  assert.match(entries.find(entry=>entry.id==='pytorch').requirements,/CPU|cpu/);
  assert.match(entries.find(entry=>entry.id==='postgres').requirements,/server|database/i);
  for(const entry of entries) assert.ok(entry.license.url&&entry.tests.url&&entry.ownership,entry.id);
});

test('catalog JSON works offline and leaves project, package and native caches untouched',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-catalog-'));
  try {
    const env={...process.env,AUG_PACKAGE_CACHE:join(root,'source'),AUG_NATIVE_ARTIFACT_CACHE:join(root,'native')};
    const args=['bin/aug.mjs','libraries','compression','--json'];
    const result=spawnSync(process.execPath,args,{encoding:'utf8',env});assert.equal(result.status,0,result.stderr);
    assert.equal(JSON.parse(result.stdout).entries[0].id,'zlib');assert.equal(result.stderr,'');
    assert.equal(existsSync(env.AUG_PACKAGE_CACHE),false);assert.equal(existsSync(env.AUG_NATIVE_ARTIFACT_CACHE),false);
    const text=run('compression');assert.equal(text.status,0,text.stderr);assert.match(text.stdout,/aug add/);
    const empty=run('nonexistent');assert.equal(empty.status,0);assert.match(empty.stdout,/No catalog entries/);
    const invalid=run('--install');assert.equal(invalid.status,2);assert.match(invalid.stderr,/Use aug libraries/);
  }finally{rmSync(root,{recursive:true,force:true});}
});
