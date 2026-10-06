import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {existsSync,mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {c as createArchive} from 'tar';
import {compilerCandidateArchive,withLocalCompilerArchive} from '../scripts/compiler-candidate-transport.mjs';
import {ensureVerifiedArchive} from '../src/native-artifacts.ts';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function fixture(t){
  const root=mkdtempSync(join(tmpdir(),'aug-compiler-transport-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  const source=join(root,'source');mkdirSync(source);mkdirSync(join(root,'.aug-build'));
  const value=Buffer.from('native compiler test payload');writeFileSync(join(source,'tool'),value);
  const manifest=Buffer.from(JSON.stringify({format:1,files:{tool:hash(value)}}));writeFileSync(join(source,'files.json'),manifest);
  const file=join(root,'.aug-build/aug-llvm-test.tar.gz');createArchive({file,cwd:source,gzip:true,sync:true},['tool','files.json']);
  const bytes=readFileSync(file),archive={url:'https://example.invalid/releases/aug-llvm-test.tar.gz',sha256:hash(bytes),fileManifest:'files.json',fileManifestSha256:hash(manifest),maximumDownloadBytes:bytes.length,maximumUnpackedBytes:4096};
  return {root,file,archive,bytes,cache:join(root,'cache')};
}
test('candidate transport is explicit and refuses ambiguous arguments',t=>{
  const f=fixture(t);
  assert.equal(compilerCandidateArchive(f.root,f.archive,[]),undefined);
  assert.equal(compilerCandidateArchive(f.root,f.archive,['--local-compiler']),f.file);
  for(const args of [['--local'],['--local-compiler','--local-compiler'],['--local-compiler','other']])assert.throws(()=>compilerCandidateArchive(f.root,f.archive,args));
  for(const url of ['https://example.invalid/','https://example.invalid/../no%2Farchive.tar.gz'])assert.throws(()=>compilerCandidateArchive(f.root,{...f.archive,url},['--local-compiler']));
});
test('an unpublished archive uses the normal verifier and restores transport after success',async t=>{
  const f=fixture(t),original=globalThis.fetch;
  const directory=await withLocalCompilerArchive(f.archive,f.file,()=>ensureVerifiedArchive(f.archive,{cache:f.cache}));
  assert.equal(globalThis.fetch,original);assert.equal(readFileSync(join(directory,'tool'),'utf8'),'native compiler test payload');
  assert.equal(await ensureVerifiedArchive(f.archive,{cache:f.cache,offline:true}),directory);
  writeFileSync(join(directory,'tool'),'changed');
  await assert.rejects(withLocalCompilerArchive(f.archive,f.file,()=>ensureVerifiedArchive(f.archive,{cache:f.cache})),/file hash mismatch/);
  assert.equal(globalThis.fetch,original);
});
test('missing, linked, oversized and changed candidate archives cannot install a cache',async t=>{
  const f=fixture(t),original=globalThis.fetch;let invoked=false;
  const work=()=>{invoked=true;return ensureVerifiedArchive(f.archive,{cache:f.cache});};
  await assert.rejects(withLocalCompilerArchive(f.archive,join(f.root,'missing'),work),/ENOENT/);
  const linked=join(f.root,'linked');symlinkSync(f.file,linked);await assert.rejects(withLocalCompilerArchive(f.archive,linked,work),/regular file/);
  await assert.rejects(withLocalCompilerArchive({...f.archive,maximumDownloadBytes:1},f.file,work),/download bound/);
  writeFileSync(f.file,Buffer.alloc(f.bytes.length));await assert.rejects(withLocalCompilerArchive(f.archive,f.file,work),/source-owned SHA-256/);
  assert.equal(invoked,false);assert.equal(globalThis.fetch,original);assert.equal(existsSync(f.cache),false);
});
test('a verified warm cache cannot hide a modified candidate transport',async t=>{
  const f=fixture(t),original=globalThis.fetch;
  await withLocalCompilerArchive(f.archive,f.file,()=>ensureVerifiedArchive(f.archive,{cache:f.cache}));
  writeFileSync(f.file,Buffer.alloc(f.bytes.length));let invoked=false;
  await assert.rejects(withLocalCompilerArchive(f.archive,f.file,()=>{invoked=true;return ensureVerifiedArchive(f.archive,{cache:f.cache});}),/source-owned SHA-256/);
  assert.equal(invoked,false);assert.equal(globalThis.fetch,original);
});
test('a wrong file-manifest pin is rejected and unexpected downloads never fall back',async t=>{
  const f=fixture(t),original=globalThis.fetch;
  await assert.rejects(withLocalCompilerArchive({...f.archive,fileManifestSha256:'0'.repeat(64)},f.file,()=>ensureVerifiedArchive({...f.archive,fileManifestSha256:'0'.repeat(64)},{cache:f.cache})),/file manifest differs/);
  assert.equal(existsSync(join(f.cache,f.archive.sha256)),false);
  await assert.rejects(withLocalCompilerArchive(f.archive,f.file,()=>fetch('https://example.invalid/other')),/unexpected download/);
  assert.equal(globalThis.fetch,original);
});
test('CI, Docker and release cache tests use sealed candidates before the test suite',()=>{
  const ci=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8').split('\n  native:\n')[1].split('\n  native-consumer-macos14:')[0];
  const prepare=ci.indexOf('node scripts/prepare-qualified-test-tools.mjs --local-compiler');
  assert.ok(prepare>0&&prepare<ci.indexOf('run: npm test'));
  assert.equal(ci.split('run: node scripts/build-llvm-pack.mjs').length,2);assert.ok(ci.indexOf('run: node scripts/build-llvm-pack.mjs')<prepare);
  const release=readFileSync(new URL('../.github/workflows/release.yml',import.meta.url),'utf8').split('\n  release:\n')[1].split('\n  consumers:')[0];
  const releasePrepare=release.indexOf('node scripts/prepare-qualified-test-tools.mjs --local-compiler');
  assert.ok(release.indexOf('node scripts/merge-compiler-packs.mjs .aug-build/release-packs')<releasePrepare&&releasePrepare<release.indexOf('run: npm test'));
  const docker=readFileSync(new URL('../docker/Dockerfile.compiler-tests',import.meta.url),'utf8');
  assert.ok(docker.indexOf('node scripts/build-llvm-pack.mjs')<docker.indexOf('node scripts/prepare-qualified-test-tools.mjs --local-compiler'));
});
