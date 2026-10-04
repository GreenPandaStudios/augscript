import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync,readdirSync,chmodSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {c as archive} from 'tar';
import {compilerVersion,installPackages} from '../src/package-manager.ts';
import {prepareNativePackages} from '../src/native-artifacts.ts';
import {nativeHostTarget} from '../src/native-contracts.ts';
const cli=resolve(import.meta.dirname,'../bin/aug.mjs'),sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('doctor separates missing, verified and changed native bytes from frozen lock readiness without writes',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'aug-setup-native-')),oldCache=process.env.AUG_NATIVE_ARTIFACT_CACHE,oldFetch=globalThis.fetch;
  try{
    const app=join(directory,'app'),library=join(directory,'library'),payload=join(directory,'payload'),cache=join(directory,'cache');
    for(const path of [app,payload,join(library,'src')])mkdirSync(path,{recursive:true});
    const contents={'lib/setup.bin':'Test native artifact','provenance.json':'{}','notices.md':'Test fixture notices'};
    for(const [name,bytes] of Object.entries(contents)){mkdirSync(join(payload,name,'..'),{recursive:true});writeFileSync(join(payload,name),bytes);}
    writeFileSync(join(payload,'files.json'),JSON.stringify({format:1,files:Object.fromEntries(Object.keys(contents).map(name=>[name,sha(readFileSync(join(payload,name)))]))}));
    const transport=join(directory,'native.tar.gz');archive({file:transport,cwd:payload,gzip:true,sync:true},[...Object.keys(contents),'files.json']);
    const bytes=readFileSync(transport),target=nativeHostTarget(),artifact={id:'test-host',target,url:'https://example.invalid/setup.tar.gz',sha256:sha(bytes),maximumDownloadBytes:bytes.length,maximumUnpackedBytes:4096,
      link:{kind:'dynamic',libraries:['lib/setup.bin']},runtime:{files:['lib/setup.bin'],relocation:'loader-relative'},components:[],fileManifest:'files.json',provenance:'provenance.json',notices:'notices.md'};
    const descriptor=JSON.stringify({format:1,profile:'aug-native-abi-1',resources:[],functions:[]});
    writeFileSync(join(library,'native.abi.json'),descriptor);
    writeFileSync(join(library,'aug-package.json'),JSON.stringify({format:2,name:'@example/setup',version:'1.0.0',compiler:compilerVersion(),source:'src',dependencies:{},native:{profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:sha(descriptor),upstream:{repository:'https://example.invalid/library',version:'1.0.0',sourceRevision:'b'.repeat(40)},artifacts:[artifact]}}));
    writeFileSync(join(library,'src/api.aug'),'value() returns int:\n    return 7\n');writeFileSync(join(library,'src/export.aug'),'export value from api\n');
    writeFileSync(join(app,'main.yaml'),'packages:\n  setup: "../library"\n');writeFileSync(join(app,'main.aug'),'import value from setup\nprint(value=value())\n');
    installPackages(app,false,true);
    const env={...process.env,AUG_NATIVE_ARTIFACT_CACHE:cache};delete env.AUG_LLVM_HOME;delete env.AUG_RUNTIME_PACK;
    const inspect=()=>{const lock=readFileSync(join(app,'aug.lock.json'),'utf8'),names=readdirSync(app);const result=spawnSync(process.execPath,[cli,'doctor',app,'--json'],{env,encoding:'utf8'});
      assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),lock);assert.deepEqual(readdirSync(app),names);return {status:result.status,report:JSON.parse(result.stdout)};};
    const missing=inspect();assert.equal(missing.status,0);assert.equal(missing.report.offlineReady,false);assert.equal(missing.report.frozenReady,false);
    const selection=missing.report.artifacts.find(entry=>entry.package==='@example/setup@1.0.0');
    assert.equal(selection.status,'missing');assert.equal(selection.sha256,artifact.sha256);assert.equal(selection.target.triple,target.triple);assert.deepEqual(selection.runtimeFiles,['lib/setup.bin']);
    assert.match(selection.recovery,/aug install/);assert.equal(existsSync(cache),false);
    assert.ok(missing.report.checks.some(check=>check.id==='native-lock'&&check.status==='warning'));
    process.env.AUG_NATIVE_ARTIFACT_CACHE=cache;globalThis.fetch=async()=>new Response(bytes);await prepareNativePackages(app);
    const installed=inspect();assert.equal(installed.status,0);assert.equal(installed.report.artifacts.find(entry=>entry.package==='@example/setup@1.0.0').status,'verified');
    assert.ok(installed.report.checks.some(check=>check.id==='native-lock'&&check.status==='ok'));
    const lock=JSON.parse(readFileSync(join(app,'aug.lock.json'))),key=Object.keys(lock.native.targets)[0];lock.native.targets[key].packages[0].artifact.sha256='a'.repeat(64);writeFileSync(join(app,'aug.lock.json'),JSON.stringify(lock));
    const stale=inspect();assert.equal(stale.status,1);assert.equal(stale.report.frozenReady,false);assert.ok(stale.report.checks.some(check=>check.id==='native-lock'&&check.status==='error'&&/aug install/.test(check.recovery)));
    lock.native.targets[key].packages[0].artifact=artifact;writeFileSync(join(app,'aug.lock.json'),JSON.stringify(lock));
    writeFileSync(join(cache,artifact.sha256,'lib/setup.bin'),'Changed native artifact');const changed=inspect();assert.equal(changed.status,1);
    const failed=changed.report.artifacts.find(entry=>entry.package==='@example/setup@1.0.0');assert.equal(failed.status,'invalid');assert.match(failed.message,/hash mismatch/);
    assert.match(failed.recovery,/Stop active builds/);assert.match(failed.recovery,new RegExp(artifact.sha256));assert.equal(readFileSync(join(cache,artifact.sha256,'lib/setup.bin'),'utf8'),'Changed native artifact');
    writeFileSync(join(cache,artifact.sha256,'lib/setup.bin'),contents['lib/setup.bin']);
    const manifestPath=join(library,'aug-package.json'),manifest=JSON.parse(readFileSync(manifestPath));
    manifest.native.artifacts[0].link.libraries=['lib/absent.bin'];writeFileSync(manifestPath,JSON.stringify(manifest));installPackages(app,false,true);
    const absent=inspect();assert.equal(absent.status,1);assert.match(absent.report.artifacts[0].message,/missing declared file lib\/absent.bin/);assert.match(absent.report.artifacts[0].recovery,/maintainer.*corrected release/);assert.doesNotMatch(absent.report.artifacts[0].recovery,/removing/);
    const other=target.triple.startsWith('aarch64')?'x86_64':'aarch64';manifest.native.artifacts[0].target={...target,triple:target.triple.replace(/^(aarch64|x86_64)/,other),arch:other==='aarch64'?'arm64':'x64',cpuBaseline:other==='aarch64'?'armv8-a':'x86-64'};
    writeFileSync(manifestPath,JSON.stringify(manifest));installPackages(app,false,true);
    const unsupported=inspect();assert.equal(unsupported.status,1);assert.ok(unsupported.report.checks.some(check=>check.id==='dependencies'&&/NATIVE_TARGET.*Supported artifacts/.test(check.message)));
    assert.equal(unsupported.report.execution,'not-run');assert.equal(unsupported.report.backend,'llvm');
  }finally{globalThis.fetch=oldFetch;if(oldCache===undefined)delete process.env.AUG_NATIVE_ARTIFACT_CACHE;else process.env.AUG_NATIVE_ARTIFACT_CACHE=oldCache;rmSync(directory,{recursive:true,force:true});}
});


test('compiler preparation and diagnosis use the same closed lock identity regardless of key order',async()=>{
  const {compilerLockMatches}=await import('../src/compiler-packs.ts');
  const expected={version:'0.23.0',llvm:'23.1.2',host:'darwin-arm64',target:'aarch64-apple-darwin',artifactSha256:'a'.repeat(64),runtimeSha256:'b'.repeat(64)};
  const reordered={runtimeSha256:'b'.repeat(64),artifactSha256:'a'.repeat(64),target:'aarch64-apple-darwin',host:'darwin-arm64',llvm:'23.1.2',version:'0.23.0'};
  assert.equal(compilerLockMatches(expected,reordered),true);
  for(const rejected of [null,[],{...expected,extra:true},{...expected,runtimeSha256:'c'.repeat(64)},{...expected,host:'linux-x64'}])assert.equal(compilerLockMatches(expected,rejected),false);
});


test('intact compiler artifacts distinguish lost executable permission from incompatible runtime contracts',async()=>{
  const {compilerPackIdentity,CompilerToolAccessError,compilerPackSelection}=await import('../src/compiler-packs.ts');
  const {runtimeLayout}=await import('../src/llvm.ts');const {runtimeIdentifierSha256}=await import('../src/runtime-abi.ts');const {llvmPlatform}=await import('../src/llvm-platform.ts');
  const root=mkdtempSync(join(tmpdir(),'aug-setup-tools-'));
  try{
    const selection=compilerPackSelection(),platform=llvmPlatform(),runtime=join(root,'runtime');mkdirSync(join(root,'bin'));mkdirSync(join(runtime,'platform'),{recursive:true});
    const platformFile=platform.entry?'platform/start.o':'platform/libSystem.tbd',files={};
    for(const path of ['libtest.a',platformFile]){writeFileSync(join(runtime,path),'Compiler contract fixture');files[path]=sha(readFileSync(join(runtime,path)));}
    const pack={format:1,version:compilerVersion(),target:platform.target,...(platform.minimumOS?{minimumOS:platform.minimumOS}:{minimumLibc:platform.minimumLibc}),layout:runtimeLayout,identifierSha256:runtimeIdentifierSha256,files,libraries:['libtest.a'],components:{},sourceSha256:'c'.repeat(64)};
    writeFileSync(join(runtime,'runtime.json'),JSON.stringify(pack));
    writeFileSync(join(root,'compiler-pack.json'),JSON.stringify({format:1,compiler:compilerVersion(),llvm:selection.manifest.llvm,host:selection.host,target:selection.target.triple,runtime:pack.sourceSha256}));
    for(const tool of platform.tools){writeFileSync(join(root,'bin',tool),'Tool fixture; never executed');chmodSync(join(root,'bin',tool),0o755);}
    assert.equal(compilerPackIdentity(root,selection).runtimeSha256,'c'.repeat(64));
    const tool=join(root,'bin',platform.tools[0]),bytes=readFileSync(tool);chmodSync(tool,0o644);
    assert.throws(()=>compilerPackIdentity(root,selection),error=>error instanceof CompilerToolAccessError&&error.message.includes(platform.tools[0]));assert.deepEqual(readFileSync(tool),bytes);
    chmodSync(tool,0o755);pack.identifierSha256='d'.repeat(64);writeFileSync(join(runtime,'runtime.json'),JSON.stringify(pack));
    assert.throws(()=>compilerPackIdentity(root,selection),error=>!(error instanceof CompilerToolAccessError)&&/operation identifiers differ/.test(error.message));
  }finally{rmSync(root,{recursive:true,force:true});}
});
