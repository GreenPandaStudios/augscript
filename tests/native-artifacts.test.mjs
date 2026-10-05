import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {c as createArchive,Header,Pax} from 'tar';
import {test} from 'node:test';
import fs from 'node:fs';
import {ensureVerifiedArchive,verifyNativeArtifact} from '../src/native-artifacts.ts';
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

test('a native extraction write failure rejects cleanly without installing an accepted cache',()=>fixture(async f=>{
  const original=fs.writeSync;
  fs.writeSync=(fd,buffer,...args)=>{
    if(Buffer.isBuffer(buffer)&&buffer.subarray(0,22).toString()==='native library fixture'){
      const error=new Error('test disk full');error.code='ENOSPC';throw error;
    }
    return original(fd,buffer,...args);
  };
  try{
    await assert.rejects(ensureVerifiedArchive(f.metadata,{cache:f.cache}),error=>error.code==='ENOSPC');
    assert.equal(existsSync(join(f.cache,f.metadata.sha256)),false);
  }finally{fs.writeSync=original;}
}));

test('large native archives preserve file contents across bounded reader chunks',()=>fixture(async f=>{
  const source=join(f.root,'large');mkdirSync(source);const expected=randomBytes(20*1024*1024);
  writeFileSync(join(source,'library.so'),expected);writeFileSync(join(source,'files.json'),JSON.stringify({format:1,files:{'library.so':hash(expected)}}));
  const path=join(f.root,'large.tar.gz');createArchive({file:path,cwd:source,gzip:true,sync:true},['library.so','files.json']);
  const bytes=readFileSync(path);assert.ok(bytes.length>16*1024*1024);
  globalThis.fetch=async()=>new Response(bytes);
  const metadata={...f.metadata,sha256:hash(bytes),maximumDownloadBytes:bytes.length,maximumUnpackedBytes:expected.length+4096};
  const directory=await ensureVerifiedArchive(metadata,{cache:f.cache});
  assert.deepEqual(readFileSync(join(directory,'library.so')),expected);
  assert.equal(await ensureVerifiedArchive(metadata,{cache:f.cache,offline:true}),directory);
}));


test('frozen restore accepts equivalent duplicate native selections from legacy locks',async()=>{
  const {compilerVersion,installPackages,projectPackages}=await import('../src/package-manager.ts');
  const {prepareNativePackages}=await import('../src/native-artifacts.ts');
  const {nativeHostTarget}=await import('../src/native-contracts.ts');
  const root=mkdtempSync(join(tmpdir(),'aug-legacy-native-')),originalFetch=globalThis.fetch,previousCache=process.env.AUG_NATIVE_ARTIFACT_CACHE;
  try{
    const payload=join(root,'payload');mkdirSync(payload);
    for(const [path,bytes] of Object.entries({'library.bin':'verified test library','provenance.json':'{}','THIRD_PARTY_NOTICES.md':'Test fixture'}))writeFileSync(join(payload,path),bytes);
    const files=Object.fromEntries(['library.bin','provenance.json','THIRD_PARTY_NOTICES.md'].map(path=>[path,hash(readFileSync(join(payload,path)))]));
    writeFileSync(join(payload,'files.json'),JSON.stringify({format:1,files}));
    const archive=join(root,'native.tar.gz');createArchive({file:archive,cwd:payload,gzip:true,sync:true},[...Object.keys(files),'files.json']);
    const bytes=readFileSync(archive),target=nativeHostTarget();
    const artifact={id:'test-host',target,url:'https://example.invalid/native.tar.gz',sha256:hash(bytes),maximumDownloadBytes:bytes.length,maximumUnpackedBytes:4096,
      link:{kind:'dynamic',libraries:['library.bin']},runtime:{files:['library.bin'],relocation:'loader-relative'},components:[],fileManifest:'files.json',provenance:'provenance.json',notices:'THIRD_PARTY_NOTICES.md'};
    const descriptor=JSON.stringify({format:1,profile:'aug-native-abi-1',resources:[],functions:[]});
    const native={profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:hash(descriptor),upstream:{repository:'https://example.invalid/upstream',version:'1.0.0',sourceRevision:'b'.repeat(40)},artifacts:[artifact]};
    for(const name of ['first','second']){
      const directory=join(root,name);mkdirSync(join(directory,'src'),{recursive:true});writeFileSync(join(directory,'src/export.aug'),'');writeFileSync(join(directory,'native.abi.json'),descriptor);
      writeFileSync(join(directory,'aug-package.json'),JSON.stringify({format:2,name:'@example/duplicate',version:'1.0.0',compiler:compilerVersion(),source:'src',dependencies:{},native}));
    }
    const app=join(root,'app');mkdirSync(app);writeFileSync(join(app,'main.yaml'),'packages:\n  first: "../first"\n  second: "../second"\n');
    const lock=installPackages(app,false,true),key=target.triple+'/'+(target.os==='macos'?'macos14':target.libc);
    const selections=[...projectPackages(app,lock.specifications).scopes.values()].map(entry=>({sourcePackage:entry.name+'@'+entry.version,sourceDigest:entry.digest,contractSha256:entry.native.bindingsSha256,artifact:entry.native.artifacts[0]}));
    assert.equal(selections.length,2);assert.deepEqual(selections[0],selections[1]);
    const prefix=lock.packages[0].path.match(/^(snapshots\/[a-f0-9]{64}\/)/)[1];
    for(const entry of lock.packages){const source=join(app,'.aug-packages',entry.path);entry.path=entry.path.slice(prefix.length);const destination=join(app,'.aug-packages',entry.path);mkdirSync(join(app,'.aug-packages','packages'),{recursive:true});fs.renameSync(source,destination);}
    lock.roots=Object.fromEntries(Object.entries(lock.roots).map(([alias,path])=>[alias,path.slice(prefix.length)]));
    lock.native={format:1,targets:{[key]:{target,packages:selections}}};
    const lockPath=join(app,'aug.lock.json'),accepted=JSON.stringify(lock);writeFileSync(lockPath,accepted);
    process.env.AUG_NATIVE_ARTIFACT_CACHE=join(root,'cache');globalThis.fetch=async()=>new Response(bytes);
    const restored=installPackages(app,true,true);assert.deepEqual(restored.native,lock.native);
    assert.equal((await prepareNativePackages(app,{frozen:true})).length,1);assert.equal(readFileSync(lockPath,'utf8'),accepted);
    assert.equal((await prepareNativePackages(app,{frozen:true,offline:true})).length,1);
    lock.native.targets[key].packages[1].sourceDigest='c'.repeat(64);const conflicting=JSON.stringify(lock);writeFileSync(lockPath,conflicting);
    await assert.rejects(prepareNativePackages(app,{frozen:true,offline:true}),/NATIVE_LOCK.*no matching native target/);
    assert.equal(readFileSync(lockPath,'utf8'),conflicting);
  }finally{globalThis.fetch=originalFetch;if(previousCache===undefined)delete process.env.AUG_NATIVE_ARTIFACT_CACHE;else process.env.AUG_NATIVE_ARTIFACT_CACHE=previousCache;rmSync(root,{recursive:true,force:true});}
});


test('a compiler-owned member-manifest pin rejects a regenerated self-manifest after offline restoration',()=>fixture(async f=>{
  const directory=await ensureVerifiedArchive(f.metadata,{cache:f.cache});
  const pinned={...f.metadata,fileManifestSha256:hash(readFileSync(join(directory,'files.json')))};
  assert.equal(await ensureVerifiedArchive(pinned,{cache:f.cache,offline:true}),directory);
  writeFileSync(join(directory,'library.dylib'),'different bytes');
  writeFileSync(join(directory,'files.json'),JSON.stringify({format:1,files:{'library.dylib':hash(Buffer.from('different bytes'))}}));
  await assert.rejects(ensureVerifiedArchive(pinned,{cache:f.cache,offline:true}),/file manifest differs from its compiler-owned identity/);
  assert.equal(f.requests(),1,'Rejected offline cache bytes must not be fetched or accepted again');
}));


test('an unpinned native package rejects a replaced library and regenerated cached member manifest',()=>fixture(async f=>{
  const directory=await ensureVerifiedArchive(f.metadata,{cache:f.cache});
  writeFileSync(join(directory,'library.dylib'),'replacement native library');
  writeFileSync(join(directory,'files.json'),JSON.stringify({format:1,files:{'library.dylib':hash(Buffer.from('replacement native library'))}}));
  await assert.rejects(ensureVerifiedArchive(f.metadata,{cache:f.cache,offline:true}),/NATIVE_INTEGRITY/);
  assert.equal(f.requests(),1,'Offline verification must not download or accept the replaced cache');
}));


test('direct native verification rejects both regenerated manifests and changed original transports',()=>fixture(async f=>{
  const directory=await ensureVerifiedArchive(f.metadata,{cache:f.cache});
  const artifact={...f.metadata,link:{libraries:['library.dylib']},runtime:{files:[]},provenance:'library.dylib',notices:'library.dylib'};
  assert.deepEqual(Object.keys(verifyNativeArtifact(directory,artifact)),['library.dylib']);
  const original=readFileSync(join(directory,'files.json'));
  writeFileSync(join(directory,'library.dylib'),'replacement');
  writeFileSync(join(directory,'files.json'),JSON.stringify({format:1,files:{'library.dylib':hash(Buffer.from('replacement'))}}));
  assert.throws(()=>verifyNativeArtifact(directory,artifact),/file manifest differs from its authenticated archive/);
  writeFileSync(join(directory,'files.json'),original);writeFileSync(join(directory,'library.dylib'),'native library fixture');
  writeFileSync(join(f.cache,f.metadata.sha256+'.tar.gz'),Buffer.alloc(f.bytes.length));
  assert.throws(()=>verifyNativeArtifact(directory,artifact),/NATIVE_INTEGRITY|TAR_BAD_ARCHIVE/);
  assert.equal(f.requests(),1);
}));

test('legacy unanchored caches require authenticated online restoration without trusting cached contents',()=>fixture(async f=>{
  const directory=await ensureVerifiedArchive(f.metadata,{cache:f.cache}),proof=join(f.cache,f.metadata.sha256+'.tar.gz');
  rmSync(proof);
  await assert.rejects(ensureVerifiedArchive(f.metadata,{cache:f.cache,offline:true}),/NATIVE_OFFLINE.*authenticated original archive/);
  assert.equal(f.requests(),1);
  assert.equal(await ensureVerifiedArchive(f.metadata,{cache:f.cache}),directory);assert.equal(f.requests(),2);
  assert.deepEqual(readFileSync(proof),f.bytes);
  rmSync(proof);writeFileSync(join(directory,'library.dylib'),'replacement');
  writeFileSync(join(directory,'files.json'),JSON.stringify({format:1,files:{'library.dylib':hash(Buffer.from('replacement'))}}));
  await assert.rejects(ensureVerifiedArchive(f.metadata,{cache:f.cache}),/file manifest differs/);
  assert.equal(existsSync(proof),false,'Rejected legacy content cannot publish an authenticated transport');
  assert.equal(readFileSync(join(directory,'library.dylib'),'utf8'),'replacement');
}));

test('cache authentication enforces current size bounds and refuses linked original archives',()=>fixture(async f=>{
  const directory=await ensureVerifiedArchive(f.metadata,{cache:f.cache}),proof=join(f.cache,f.metadata.sha256+'.tar.gz');
  await assert.rejects(ensureVerifiedArchive({...f.metadata,maximumDownloadBytes:f.bytes.length-1},{cache:f.cache,offline:true}),/download limit/);
  await assert.rejects(ensureVerifiedArchive({...f.metadata,maximumUnpackedBytes:1},{cache:f.cache,offline:true}),/unpacked size/);
  rmSync(proof);symlinkSync(join(f.root,'archive.tar.gz'),proof);
  await assert.rejects(ensureVerifiedArchive(f.metadata,{cache:f.cache,offline:true}),error=>error.code==='ELOOP');
  assert.equal(readFileSync(join(directory,'library.dylib'),'utf8'),'native library fixture');assert.equal(f.requests(),1);
}));

test('compiler-owned manifest pins verify offline without retaining the original archive',()=>fixture(async f=>{
  const directory=await ensureVerifiedArchive(f.metadata,{cache:f.cache});
  const pinned={...f.metadata,fileManifestSha256:hash(readFileSync(join(directory,'files.json')))};
  rmSync(join(f.cache,f.metadata.sha256+'.tar.gz'));
  assert.equal(await ensureVerifiedArchive(pinned,{cache:f.cache,offline:true}),directory);assert.equal(f.requests(),1);
}));


test('authenticated archives reject duplicate paths and native links before accepting any files',()=>fixture(async f=>{
  const source=join(f.root,'invalid');mkdirSync(source);
  writeFileSync(join(source,'library.dylib'),'native library fixture');writeFileSync(join(source,'files.json'),JSON.stringify({format:1,files:{'library.dylib':hash(Buffer.from('native library fixture'))}}));
  symlinkSync('library.dylib',join(source,'link'));
  for(const names of [['library.dylib','library.dylib','files.json'],['library.dylib','link','files.json']]){
    const transport=join(f.root,'invalid.tar.gz');createArchive({file:transport,cwd:source,gzip:true,sync:true},names);const bytes=readFileSync(transport);
    globalThis.fetch=async()=>new Response(bytes);const metadata={...f.metadata,sha256:hash(bytes),maximumDownloadBytes:bytes.length};
    await assert.rejects(ensureVerifiedArchive(metadata,{cache:f.cache}),/Duplicate archive path|links and special files/);
    assert.equal(existsSync(join(f.cache,metadata.sha256)),false);assert.equal(existsSync(join(f.cache,metadata.sha256+'.tar.gz')),false);
  }
}));


test('cached members exceeding the declared unpacked bound reject before whole-file hashing',()=>fixture(async f=>{
 const directory=await ensureVerifiedArchive(f.metadata,{cache:f.cache});
 writeFileSync(join(directory,'library.dylib'),Buffer.alloc(f.metadata.maximumUnpackedBytes+1));
 await assert.rejects(ensureVerifiedArchive(f.metadata,{cache:f.cache,offline:true}),/unpacked size/);
}));


test('archive bounds count PAX metadata bytes and every metadata header including empty ones',()=>fixture(async f=>{
 const bytes=Buffer.from(JSON.stringify({format:1,files:{}})),header=new Header({path:'files.json',size:bytes.length,mode:0o644,type:'File'});header.encode();
 const regular=Buffer.concat([header.block,bytes,Buffer.alloc((512-bytes.length%512)%512),Buffer.alloc(1024)]);
 const empty=new Header({path:'PaxHeader',size:0,mode:0o644,type:'ExtendedHeader'});empty.encode();
 for(const [meta,bound] of [[new Pax({comment:'a'.repeat(5632)}).encode(),1024],[Buffer.concat(Array.from({length:20001},()=>empty.block)),1024]]){
   const bytes=gzipSync(Buffer.concat([meta,regular]));globalThis.fetch=async()=>new Response(bytes);
   const metadata={...f.metadata,sha256:hash(bytes),maximumDownloadBytes:bytes.length,maximumUnpackedBytes:bound};
   await assert.rejects(ensureVerifiedArchive(metadata,{cache:f.cache}),/unpacked size|file limit/);
   assert.equal(existsSync(join(f.cache,metadata.sha256)),false);
 }
}));


test('ordinary PAX, global and GNU long-path metadata preserve the authenticated member identity',()=>fixture(async f=>{
 const contents=Buffer.from(JSON.stringify({format:1,files:{}}));
 const header=new Header({path:'placeholder',size:contents.length,type:'File',mode:0o644});header.encode();
 const tail=Buffer.concat([header.block,contents,Buffer.alloc((512-contents.length%512)%512),Buffer.alloc(1024)]);
 const long=Buffer.from('files.json\0'),gnu=new Header({path:'LongLink',size:long.length,type:'NextFileHasLongPath',mode:0o644});gnu.encode();
 const cases=[new Pax({path:'files.json'}).encode(),Buffer.concat([new Pax({mtime:new Date('2026-01-01')},true).encode(),new Pax({path:'files.json'}).encode()]),Buffer.concat([gnu.block,long,Buffer.alloc((512-long.length%512)%512)])];
 for(const meta of cases){const bytes=gzipSync(Buffer.concat([meta,tail]));globalThis.fetch=async()=>new Response(bytes);const metadata={...f.metadata,sha256:hash(bytes),maximumDownloadBytes:bytes.length};
   const directory=await ensureVerifiedArchive(metadata,{cache:f.cache});assert.deepEqual(readFileSync(join(directory,'files.json')),contents);assert.equal(await ensureVerifiedArchive(metadata,{cache:f.cache,offline:true}),directory);
 }
}));
