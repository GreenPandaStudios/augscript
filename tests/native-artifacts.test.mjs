import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {c as createArchive} from 'tar';
import {test} from 'node:test';
import {ensureVerifiedArchive} from '../src/native-artifacts.ts';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

function fixture(run){
  const root=mkdtempSync(join(tmpdir(),'aug-artifact-')),source=join(root,'source'),cache=join(root,'cache');mkdirSync(source);
  const data=Buffer.from('native library fixture');writeFileSync(join(source,'library.dylib'),data);
  writeFileSync(join(source,'files.json'),JSON.stringify({format:1,files:{'library.dylib':hash(data)}}));
  const archive=join(root,'archive.tar.gz');createArchive({file:archive,cwd:source,gzip:true,sync:true},['library.dylib','files.json']);
  const bytes=readFileSync(archive),metadata={url:'https://example.invalid/native.tar.gz',sha256:hash(bytes),maximumDownloadBytes:bytes.length,maximumUnpackedBytes:4096,fileManifest:'files.json'};
  const original=globalThis.fetch;let requests=0;globalThis.fetch=async()=>{requests++;return new Response(bytes)};
  return Promise.resolve().then(()=>run({root,cache,bytes,metadata,requests:()=>requests})).finally(()=>{globalThis.fetch=original;rmSync(root,{recursive:true,force:true});});
}

test('concurrent installs share one verified immutable artifact and restore offline',()=>fixture(async f=>{
  const [a,b]=await Promise.all([ensureVerifiedArchive(f.metadata,{cache:f.cache}),ensureVerifiedArchive(f.metadata,{cache:f.cache})]);
  assert.equal(a,b);assert.equal(f.requests(),1);
  assert.equal(await ensureVerifiedArchive(f.metadata,{cache:f.cache,offline:true}),a);
  writeFileSync(join(a,'library.dylib'),'changed');
  await assert.rejects(ensureVerifiedArchive(f.metadata,{cache:f.cache,offline:true}),/file hash mismatch/);
}));

test('bad downloads and expansion bounds install no accepted cache',()=>fixture(async f=>{
  const rejected={...f.metadata,sha256:'a'.repeat(64)};
  await assert.rejects(ensureVerifiedArchive(rejected,{cache:f.cache}),/SHA-256/);
  assert.equal(existsSync(join(f.cache,rejected.sha256)),false);
  await assert.rejects(ensureVerifiedArchive({...f.metadata,maximumUnpackedBytes:1},{cache:f.cache}),/unpacked size/);
  assert.equal(existsSync(join(f.cache,f.metadata.sha256)),false);
}));

test('offline cache misses and insecure redirects give actionable errors',()=>fixture(async f=>{
  await assert.rejects(ensureVerifiedArchive(f.metadata,{cache:f.cache,offline:true}),/NATIVE_OFFLINE/);
  globalThis.fetch=async()=>new Response(null,{status:302,headers:{Location:'http://example.invalid/unverified'}});
  await assert.rejects(ensureVerifiedArchive(f.metadata,{cache:f.cache}),/redirects require HTTPS/);
}));

test('extra files in a verified cache are rejected',()=>fixture(async f=>{
  const directory=await ensureVerifiedArchive(f.metadata,{cache:f.cache});writeFileSync(join(directory,'install.sh'),'exit 1');
  await assert.rejects(ensureVerifiedArchive(f.metadata,{cache:f.cache}),/file set differs/);
}));
