import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {c as archive} from 'tar';
import {compilerVersion,installPackages} from '../src/package-manager.ts';
import {nativeHostTarget} from '../src/native-contracts.ts';
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {prepareNativePackages,cacheLocalNativeArtifact} from '../src/native-artifacts.ts';
const cli=resolve(import.meta.dirname,'../bin/aug.mjs'),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function fixture(run){
 const root=mkdtempSync(join(tmpdir(),'aug-native-local-')),library=join(root,'library'),payload=join(root,'payload'),cache=join(root,'cache');
 mkdirSync(join(library,'src'),{recursive:true});mkdirSync(payload);
 const contents={'library.a':'Native fixture; not executed','provenance.json':'{}','notices.md':'MIT fixture'};
 for(const [name,bytes] of Object.entries(contents))writeFileSync(join(payload,name),bytes);
 writeFileSync(join(payload,'files.json'),JSON.stringify({format:1,files:Object.fromEntries(Object.entries(contents).map(([name,bytes])=>[name,sha(bytes)]))}));
 const transport=join(root,'native.tar.gz');archive({file:transport,cwd:payload,gzip:true,sync:true},[...Object.keys(contents),'files.json']);
 const bytes=readFileSync(transport),descriptor=JSON.stringify({format:1,profile:'aug-native-abi-1',resources:[],functions:[]});
 const artifact={id:'host',target:nativeHostTarget(),url:'https://example.invalid/not-published.tar.gz',sha256:sha(bytes),maximumDownloadBytes:bytes.length,maximumUnpackedBytes:4096,link:{kind:'static',libraries:['library.a']},runtime:{files:[],relocation:'loader-relative'},components:[],fileManifest:'files.json',provenance:'provenance.json',notices:'notices.md'};
 const manifest={format:2,name:'@example/local',version:'1.0.0',compiler:compilerVersion(),source:'src',dependencies:{},native:{profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:sha(descriptor),upstream:{repository:'https://example.invalid/source',version:'1.0.0',sourceRevision:'b'.repeat(40)},artifacts:[artifact]}};
 writeFileSync(join(library,'aug-package.json'),JSON.stringify(manifest));writeFileSync(join(library,'native.abi.json'),descriptor);
 writeFileSync(join(library,'src/api.aug'),'answer():\n    return 42\n');writeFileSync(join(library,'src/export.aug'),'export answer from api\n');
 const command=(...args)=>spawnSync(process.execPath,[cli,'package','cache-native',library,...args],{encoding:'utf8',timeout:30000,env:{...process.env,AUG_NATIVE_ARTIFACT_CACHE:cache}});
 return Promise.resolve().then(()=>run({root,library,cache,transport,artifact,manifest,command})).finally(()=>rmSync(root,{recursive:true,force:true}));
}

test('maintainers cache an exact local native archive for ordinary offline consumers without publication',()=>fixture(async f=>{
 const original=readFileSync(join(f.library,'aug-package.json'));
 const result=f.command('--artifact','host','--archive',f.transport,'--json');assert.equal(result.status,0,result.stderr);
 const report=JSON.parse(result.stdout);assert.equal(report.status,'verified');assert.equal(report.artifact.sha256,f.artifact.sha256);
 assert.equal(report.execution,'not-run');assert.equal(report.publication,'not-run');assert.equal(report.package,'@example/local@1.0.0');
 assert.deepEqual(readFileSync(join(f.library,'aug-package.json')),original);assert.equal(existsSync(join(f.library,'aug.lock.json')),false);
 const app=join(f.root,'app');mkdirSync(app);writeFileSync(join(app,'main.yaml'),'packages:\n  local: "../library"\n');writeFileSync(join(app,'main.aug'),'import answer from local\nprint(value=answer())\n');
 installPackages(app,false,true);const oldCache=process.env.AUG_NATIVE_ARTIFACT_CACHE,oldFetch=globalThis.fetch;
 try{process.env.AUG_NATIVE_ARTIFACT_CACHE=f.cache;globalThis.fetch=async()=>{throw new Error('No local workflow may download');};
   const inputs=await prepareNativePackages(app,{offline:true});assert.equal(inputs.length,1);assert.deepEqual(inputs[0].libraries,['library.a']);
 }finally{globalThis.fetch=oldFetch;if(oldCache===undefined)delete process.env.AUG_NATIVE_ARTIFACT_CACHE;else process.env.AUG_NATIVE_ARTIFACT_CACHE=oldCache;}
}));


test('local cache hits still check the supplied archive and preserve accepted bytes after rejection',()=>fixture(f=>{
 let result=f.command('--artifact','host','--archive',f.transport);assert.equal(result.status,0,result.stderr);
 const path=join(f.cache,f.artifact.sha256),before=readFileSync(join(path,'library.a'));
 writeFileSync(f.transport,Buffer.alloc(f.artifact.maximumDownloadBytes));
 result=f.command('--artifact','host','--archive',f.transport);assert.equal(result.status,1);assert.match(result.stderr,/NATIVE_INTEGRITY|TAR_BAD_ARCHIVE/);
 assert.deepEqual(readFileSync(join(path,'library.a')),before);
 writeFileSync(f.transport,Buffer.alloc(f.artifact.maximumDownloadBytes+1));
 result=f.command('--artifact','host','--archive',f.transport);assert.equal(result.status,1);assert.match(result.stderr,/download limit/);
}));

test('local author errors reject unknown artifacts, invalid bindings and malformed options before cache acceptance',()=>fixture(f=>{
 let result=f.command('--artifact','unknown','--archive',f.transport);assert.equal(result.status,1);assert.match(result.stderr,/Unknown artifact unknown.*host/);assert.equal(existsSync(f.cache),false);
 for(const args of [[],['--artifact'],['--artifact','host','--archive'],['--artifact','host','--archive',f.transport,'--json','--json'],['--artifact','host','--artifact','host','--archive',f.transport],['--artifact','host','--archive',f.transport,'--build'],['extra','--artifact','host','--archive',f.transport]]){
   result=f.command(...args);assert.equal(result.status,2,result.stderr);assert.equal(existsSync(f.cache),false);
 }
 writeFileSync(join(f.library,'native.abi.json'),'{}');result=f.command('--artifact','host','--archive',f.transport);assert.equal(result.status,1);assert.match(result.stderr,/digest|binding|descriptor/i);assert.equal(existsSync(f.cache),false);
}));

test('local archives must contain every declared link, runtime, provenance, notice and closure file',()=>fixture(f=>{
 for(const missing of ['link','runtime','provenance','notices','closure']){
   const manifest=structuredClone(f.manifest),artifact=manifest.native.artifacts[0];
   if(missing==='link')artifact.link.libraries=['absent.a'];
   if(missing==='runtime')artifact.runtime.files=['absent.so'];
   if(missing==='closure')artifact.runtime.closureManifest='absent.json';
   if(missing==='provenance'||missing==='notices')artifact[missing]='absent.md';
   writeFileSync(join(f.library,'aug-package.json'),JSON.stringify(manifest));
   const result=f.command('--artifact','host','--archive',f.transport);assert.equal(result.status,1,result.stderr);assert.match(result.stderr,/missing declared file absent/);
   assert.equal(existsSync(join(f.cache,f.artifact.sha256)),false);assert.equal(existsSync(join(f.cache,f.artifact.sha256+'.tar.gz')),false);
 }
}));

test('local caching refuses linked and special input paths without waiting on a producer',()=>fixture(f=>{
 const link=join(f.root,'linked.tar.gz');symlinkSync(f.transport,link);
 let result=f.command('--artifact','host','--archive',link);assert.equal(result.status,1);assert.match(result.stderr,/ELOOP|symbolic link/);
 const fifo=join(f.root,'pipe.tar.gz');assert.equal(spawnSync('mkfifo',[fifo]).status,0);
 result=f.command('--artifact','host','--archive',fifo);assert.equal(result.status,1);assert.match(result.stderr,/regular file/);
 assert.equal(existsSync(join(f.cache,f.artifact.sha256)),false);
}));

test('changed author metadata rejects publication while preserving the external edit',()=>fixture(async f=>{
 const original=fs.readSync;let changed=false;
 fs.readSync=(fd,buffer,...args)=>{
   const length=original(fd,buffer,...args);
   if(!changed&&length>1&&buffer[0]===0x1f&&buffer[1]===0x8b){changed=true;f.manifest.native.upstream.sourceRevision='c'.repeat(40);writeFileSync(join(f.library,'aug-package.json'),JSON.stringify(f.manifest));}
   return length;
 };syncBuiltinESMExports();
 try{await assert.rejects(cacheLocalNativeArtifact(f.library,'host',f.transport,{cache:f.cache}),/NATIVE_LOCAL_STALE/);}
 finally{fs.readSync=original;syncBuiltinESMExports();}
 assert.equal(changed,true);assert.equal(existsSync(join(f.cache,f.artifact.sha256)),false);
 assert.equal(JSON.parse(readFileSync(join(f.library,'aug-package.json'))).native.upstream.sourceRevision,'c'.repeat(40));
}));


test('cache-hit verification rejects a special member manifest instead of waiting for data',()=>fixture(f=>{
 let result=f.command('--artifact','host','--archive',f.transport);assert.equal(result.status,0,result.stderr);
 const manifest=join(f.cache,f.artifact.sha256,'files.json');rmSync(manifest);assert.equal(spawnSync('mkfifo',[manifest]).status,0);
 result=spawnSync(process.execPath,[cli,'package','cache-native',f.library,'--artifact','host','--archive',f.transport],{encoding:'utf8',timeout:1000,env:{...process.env,AUG_NATIVE_ARTIFACT_CACHE:f.cache}});
 assert.equal(result.error,undefined,'Forbidden cached file types must reject without blocking');assert.equal(result.status,1);assert.match(result.stderr,/regular file|special file/);
}));
