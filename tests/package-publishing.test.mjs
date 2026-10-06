import {compilerVersion} from '../src/compiler-version.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, writeFileSync, rmSync, realpathSync, mkdirSync, symlinkSync, existsSync, cpSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {packageRelease} from '../src/package-publishing.ts';
import {c as createArchive} from 'tar';
import {createHash} from 'node:crypto';
import {nativeHostTarget} from '../src/native-contracts.ts';
import {nativePackageSelections, nativeTargetKey} from '../src/native-artifacts.ts';
const cli=resolve(import.meta.dirname,'../bin/aug.mjs');
const gitExecutable=process.env.AUG_GIT??'git';
const run=(...args)=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8',timeout:30000});
const ok=(...args)=>{const result=run(...args);assert.equal(result.status,0,result.stderr+result.stdout);return result.stdout;};
const git=(directory,...args)=>{const result=spawnSync(gitExecutable,['-c','core.hooksPath=/dev/null',...args],{cwd:directory,encoding:'utf8'});assert.equal(result.status,0,result.stderr);return result.stdout.trim();};
function fixture(){
  const directory=realpathSync(mkdtempSync(join(tmpdir(),'aug-publishing-')));
  ok('package','init',directory,'--name','@example/arithmetic');
  writeFileSync(join(directory,'LICENSE'),'MIT\n');
  ok('install',directory,'--offline');
  ok('spec',directory);
  git(directory,'init');git(directory,'add','.');
  git(directory,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','Library');
  git(directory,'tag','v0.1.0');return directory;
}

test('release metadata verifies the exact tag and checked public source without claiming behavior',()=>{
  const directory=fixture();
  try{
    const before=readFileSync(join(directory,'aug.lock.json'),'utf8');
    const report=JSON.parse(ok('package','release',directory,'--tag','v0.1.0','--json'));
    assert.equal(report.ready,true);assert.equal(report.name,'@example/arithmetic');
    assert.equal(report.source.commit,git(directory,'rev-parse','HEAD'));
    assert.equal(report.source.tag,'v0.1.0');assert.equal(report.contracts[0].name,'add');
    assert.equal(report.contracts[0].contract.callables[0].inputs[0].label,'left');
    assert.equal(report.evidence.behavior,'not-run');assert.equal(report.evidence.publication,'not-run');
    assert.equal(report.lock.sha256.length,64);assert.equal(readFileSync(join(directory,'aug.lock.json'),'utf8'),before);
  }finally{rmSync(directory,{recursive:true,force:true});}
});

test('authors preview and create pinned CI without overwriting an existing workflow',()=>{
  const directory=fixture();
  try{
    const report=JSON.parse(ok('package','workflow',directory,'--json'));
    assert.equal(report.backend,'llvm');
    if(compilerVersion()==='0.23.0'){assert.equal(report.availability,'requires-next-compiler-release');assert.match(report.workflow,/# STAGED:/);}
    else {assert.equal(report.availability,'requires-containing-published-release');assert.doesNotMatch(report.workflow,/# STAGED:/);}assert.deepEqual(report.jobs.map(job=>job.runner),['ubuntu-24.04']);
    assert.match(report.workflow,/permissions:\n  contents: read/);
    assert.match(report.workflow,/persist-credentials: false/);
    assert.match(report.workflow,/--ignore-scripts/);
    assert.match(report.workflow,/aug install --frozen/);
    assert.match(report.workflow,/aug test/);assert.match(report.workflow,/aug spec --check/);
    assert.match(report.workflow,/aug package release/);
    assert.match(report.workflow,/actions\/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a/);
    assert.match(report.workflow,/Regenerate it after that release/);
    assert.doesNotMatch(report.workflow,/npm publish|gh release create|contents: write/);
    ok('package','workflow',directory,'--write');
    const path=join(directory,'.github/workflows/august.yml');assert.equal(readFileSync(path,'utf8'),report.workflow);
    const repeated=run('package','workflow',directory,'--write');assert.notEqual(repeated.status,0);assert.match(repeated.stderr,/already exists/);
    assert.equal(readFileSync(path,'utf8'),report.workflow);
  }finally{rmSync(directory,{recursive:true,force:true});}
});


test('release review rejects wrong tags, moved tags and uncommitted source',()=>{
  const directory=fixture();
  try{
    let rejected=run('package','release',directory,'--tag','v0.2.0','--json');
    assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/Expected tag v0.1.0/);
    writeFileSync(join(directory,'src/arithmetic.aug'),'add(int left, int right):\n    return 99\n');
    rejected=run('package','release',directory,'--tag','v0.1.0','--json');
    assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/uncommitted/);
    git(directory,'add','.');git(directory,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','Change');
    rejected=run('package','release',directory,'--tag','v0.1.0','--json');
    assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/tag must point/);
  }finally{rmSync(directory,{recursive:true,force:true});}
});

test('tagged source with stale explanations is rejected with a specific recovery',()=>{
  const directory=fixture();
  try{
    const file=join(directory,'src/arithmetic.aug');
    writeFileSync(file,readFileSync(file,'utf8').replace('return left + right','return left + right + 1'));
    git(directory,'add','.');git(directory,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','Changed behavior');git(directory,'tag','-f','v0.1.0');
    const rejected=run('package','release',directory,'--tag','v0.1.0','--json');
    assert.equal(rejected.status,1,rejected.stderr);const report=JSON.parse(rejected.stdout);
    assert.equal(report.ready,false);const drift=report.checks.find(check=>check.id==='specifications');
    assert.equal(drift.status,'error');assert.match(drift.message,/src\/arithmetic.aug.md/);assert.match(drift.recovery,/review and commit/);
  }finally{rmSync(directory,{recursive:true,force:true});}
});

test('ignored source still needs to be present in the release commit',()=>{
  const directory=fixture();
  try{
    writeFileSync(join(directory,'.git/info/exclude'),'src/hidden.aug\n');
    writeFileSync(join(directory,'src/hidden.aug'),'internal():\n    return 7\n');
    const rejected=run('package','release',directory,'--tag','v0.1.0','--json');
    assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/hidden.aug/);
  }finally{rmSync(directory,{recursive:true,force:true});}
});

test('workflow creation rejects directory links and invalid flags without changing their targets',()=>{
  const directory=fixture(),outside=mkdtempSync(join(tmpdir(),'aug-workflow-outside-'));
  try{
    symlinkSync(outside,join(directory,'.github'),'dir');
    const rejected=run('package','workflow',directory,'--write');assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/real directories/);
    assert.equal(existsSync(join(outside,'workflows')),false);
    for(const args of [['workflow','--replace'],['release','--tag'],['release','--tag','v0.1.0','--tag','v0.1.0']]){
      const result=run('package',args[0],directory,...args.slice(1));assert.equal(result.status,2,result.stderr);
    }
  }finally{rmSync(directory,{recursive:true,force:true});rmSync(outside,{recursive:true,force:true});}
});

test('generated CI test-copy steps run the real LLVM tests while preserving the tagged lock',()=>{
  const directory=fixture(),temporary=realpathSync(mkdtempSync(join(tmpdir(),'aug-workflow-run-')));
  try{
    const workflow=JSON.parse(ok('package','workflow',directory,'--json')).workflow;
    const copy=workflow.match(/Prepare an isolated test copy\n        run: \|\n([\s\S]*?)      - name: Run independent/)[1].split('\n').map(line=>line.slice(10)).join('\n');
    const script=workflow.match(/Run independent same-file tests through LLVM\n        run: \|\n([\s\S]*?)      - name: Retain/)[1].split('\n').map(line=>line.slice(10)).join('\n');
    const accepted=readFileSync(join(directory,'aug.lock.json'),'utf8');
    // Put the actual candidate CLI on PATH; production CI installs its exact published version.
    const executable=join(temporary,'bin');mkdirSync(executable);
    const quote=value=>"'"+value.replaceAll("'","'\"'\"'")+"'";
    writeFileSync(join(executable,'aug'),'#!/bin/sh\nexec '+quote(process.execPath)+' '+quote(cli)+' \"$@\"\n',{mode:0o755});
    const result=spawnSync('sh',['-eu','-c',copy+'\n'+script],{cwd:directory,encoding:'utf8',timeout:120000,
      env:{...process.env,RUNNER_TEMP:temporary,PATH:executable+':'+process.env.PATH}});
    assert.equal(result.status,0,result.stderr+result.stdout);
    const tests=JSON.parse(readFileSync(join(directory,'.aug-build/qualification/tests.json'),'utf8'));assert.equal(tests.passed,1);assert.equal(tests.failed,0);
    assert.equal(readFileSync(join(directory,'aug.lock.json'),'utf8'),accepted);
    assert.ok(existsSync(join(temporary,'august-check/aug.lock.json')));
    assert.equal(existsSync(join(temporary,'august-check/.git')),false);
    assert.equal(git(directory,'status','--porcelain'),'');
  }finally{rmSync(directory,{recursive:true,force:true});rmSync(temporary,{recursive:true,force:true});}
});


test('correct but ignored generated specs cannot qualify a tagged checkout',()=>{
  const directory=fixture();
  try{
    git(directory,'rm','--cached','src/arithmetic.aug.md');
    writeFileSync(join(directory,'.git/info/exclude'),'*.aug.md\n');
    git(directory,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','Omit compiled spec');git(directory,'tag','-f','v0.1.0');
    const rejected=run('package','release',directory,'--tag','v0.1.0','--json');
    assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/arithmetic.aug.md/);
  }finally{rmSync(directory,{recursive:true,force:true});}
});

test('release review rejects configuration or source added by a concurrent writer even when ignored',()=>{
  for(const file of ['main.yaml','src/hidden.aug']){
    const directory=fixture(),read=fs.readFileSync;
    let changed=false;
    try{
      if(file==='main.yaml'){
        git(directory,'rm','main.yaml');git(directory,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','Use defaults');git(directory,'tag','-f','v0.1.0');
        ok('spec',directory);git(directory,'add','.');git(directory,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--allow-empty','-m','Spec defaults');git(directory,'tag','-f','v0.1.0');
      }
      writeFileSync(join(directory,'.git/info/exclude'),file+'\n');
      fs.readFileSync=(path,...args)=>{
        const bytes=read(path,...args);
        if(!changed&&String(path)===join(directory,'LICENSE')){
          changed=true;writeFileSync(join(directory,file),file==='main.yaml'?'block_style: indent\n':'internal():\n    return 7\n');
        }
        return bytes;
      };
      syncBuiltinESMExports();
      assert.throws(()=>packageRelease(directory,'v0.1.0'),/PACKAGE_RELEASE_STALE/);
      assert.equal(changed,true);
    }finally{fs.readFileSync=read;syncBuiltinESMExports();rmSync(directory,{recursive:true,force:true});}
  }
});

test('repository-root workflow profile rejects nested packages clearly',()=>{
  const root=realpathSync(mkdtempSync(join(tmpdir(),'aug-workflow-monorepo-')));
  try{
    git(root,'init');const directory=join(root,'library');ok('package','init',directory);
    const result=run('package','workflow',directory,'--write');assert.equal(result.status,1);assert.match(result.stderr,/repository root/);
    assert.equal(existsSync(join(directory,'.github')),false);
  }finally{rmSync(root,{recursive:true,force:true});}
});


test('native release evidence requires both verified bytes and matching committed host selections',()=>{
  const directory=fixture(),cache=mkdtempSync(join(tmpdir(),'aug-release-cache-')),previous=process.env.AUG_NATIVE_ARTIFACT_CACHE;
  try{
    process.env.AUG_NATIVE_ARTIFACT_CACHE=cache;
    const descriptor=JSON.stringify({format:1,profile:'aug-native-abi-1',resources:[],functions:[]});
    const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),target=nativeHostTarget();
    const payload={'library.bin':'Native fixture bytes; not executed','provenance.json':'{}','THIRD_PARTY_NOTICES.md':'Fixture notices'};
    const contents=join(cache,'payload');mkdirSync(contents);
    for(const [name,bytes] of Object.entries(payload))writeFileSync(join(contents,name),bytes);
    writeFileSync(join(contents,'files.json'),JSON.stringify({format:1,files:Object.fromEntries(Object.entries(payload).map(([name,bytes])=>[name,sha(bytes)]))}));
    const transport=join(cache,'fixture.tar.gz');createArchive({file:transport,cwd:contents,gzip:true,sync:true},[...Object.keys(payload),'files.json']);
    const archiveBytes=readFileSync(transport);
    const artifact={id:'host',target,url:'https://example.invalid/native.tar.gz',sha256:sha(archiveBytes),maximumDownloadBytes:4096,maximumUnpackedBytes:8192,
      link:{kind:'dynamic',libraries:['library.bin']},runtime:{files:['library.bin'],relocation:'loader-relative'},components:[],fileManifest:'files.json',provenance:'provenance.json',notices:'THIRD_PARTY_NOTICES.md'};
    const manifest=JSON.parse(readFileSync(join(directory,'aug-package.json'),'utf8'));manifest.format=2;
    manifest.native={profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:sha(descriptor),upstream:{repository:'https://example.invalid/library',version:'1.0.0',sourceRevision:'b'.repeat(40)},artifacts:[artifact]};
    writeFileSync(join(directory,'aug-package.json'),JSON.stringify(manifest));writeFileSync(join(directory,'native.abi.json'),descriptor);writeFileSync(join(directory,'THIRD_PARTY_NOTICES.md'),'Fixture notices');
    ok('spec',directory);git(directory,'add','.');git(directory,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','Native contract');git(directory,'tag','-f','v0.1.0');
    let result=run('package','release',directory,'--tag','v0.1.0','--json');assert.equal(result.status,1,result.stderr);
    let report=JSON.parse(result.stdout);assert.equal(report.native.selections[0].status,'missing');assert.equal(report.checks.find(check=>check.id==='native-lock').status,'error');
    assert.equal(existsSync(join(cache,artifact.sha256)),false);
    const output=join(cache,artifact.sha256);mkdirSync(output);writeFileSync(join(cache,artifact.sha256+'.tar.gz'),archiveBytes);
    for(const [name,bytes] of Object.entries(payload))writeFileSync(join(output,name),bytes);
    writeFileSync(join(output,'files.json'),JSON.stringify({format:1,files:Object.fromEntries(Object.entries(payload).map(([name,bytes])=>[name,sha(bytes)]))}));
    result=run('package','release',directory,'--tag','v0.1.0','--json');assert.equal(result.status,1,result.stderr);
    report=JSON.parse(result.stdout);assert.equal(report.native.selections[0].status,'verified');assert.equal(report.ready,false);
    const lockPath=join(directory,'aug.lock.json'),lock=JSON.parse(readFileSync(lockPath,'utf8'));
    lock.native={format:1,targets:{[nativeTargetKey(target)]:{target,packages:nativePackageSelections(directory,lock,join(directory,'.aug-packages'))}}};
    writeFileSync(lockPath,JSON.stringify(lock,null,2)+'\n');git(directory,'add','.');git(directory,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','Lock host');git(directory,'tag','-f','v0.1.0');
    report=JSON.parse(ok('package','release',directory,'--tag','v0.1.0','--json'));assert.equal(report.ready,true);assert.equal(report.native.locked.packages.length,1);
    assert.equal(report.evidence.behavior,'not-run');assert.equal(report.evidence.otherPlatforms,'not-qualified');
    writeFileSync(join(output,'library.bin'),'Damaged');result=run('package','release',directory,'--tag','v0.1.0','--json');assert.equal(result.status,1,result.stderr);
    report=JSON.parse(result.stdout);assert.equal(report.native.selections[0].status,'invalid');assert.match(report.native.selections[0].error,/hash mismatch/);
    const members=JSON.parse(readFileSync(join(output,'files.json')));members.files['library.bin']=sha('Damaged');writeFileSync(join(output,'files.json'),JSON.stringify(members));
    result=run('package','release',directory,'--tag','v0.1.0','--json');assert.equal(result.status,1,result.stderr);
    report=JSON.parse(result.stdout);assert.equal(report.native.selections[0].status,'invalid');assert.match(report.native.selections[0].error,/file manifest differs from its authenticated archive/);
  }finally{
    if(previous===undefined)delete process.env.AUG_NATIVE_ARTIFACT_CACHE;else process.env.AUG_NATIVE_ARTIFACT_CACHE=previous;
    rmSync(directory,{recursive:true,force:true});rmSync(cache,{recursive:true,force:true});
  }
});


test('hosted workflow generation rejects native floors and hardware features beyond its bounded profile',()=>{
  const directory=fixture();
  try{
    const descriptor=JSON.stringify({format:1,profile:'aug-native-abi-1',resources:[],functions:[]}),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
    writeFileSync(join(directory,'native.abi.json'),descriptor);
    const manifest=JSON.parse(readFileSync(join(directory,'aug-package.json'),'utf8'));manifest.format=2;
    const artifact={id:'mac',target:{triple:'aarch64-apple-darwin',os:'macos',arch:'arm64',minimumOS:'26.0',cpuBaseline:'armv8-a',libc:'libSystem'},url:'https://example.invalid/native.tar.gz',sha256:'a'.repeat(64),maximumDownloadBytes:4096,maximumUnpackedBytes:8192,
      link:{kind:'dynamic',libraries:['library.bin']},runtime:{files:['library.bin'],relocation:'loader-relative'},components:[],fileManifest:'files.json',provenance:'provenance.json',notices:'THIRD_PARTY_NOTICES.md'};
    manifest.native={profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:sha(descriptor),upstream:{repository:'https://example.invalid/library',version:'1.0.0',sourceRevision:'b'.repeat(40)},artifacts:[artifact]};
    const inspect=()=>{writeFileSync(join(directory,'aug-package.json'),JSON.stringify(manifest));return run('package','workflow',directory,'--json');};
    let result=inspect();assert.equal(result.status,1);assert.match(result.stderr,/macos-15.*cannot qualify/);
    artifact.target.minimumOS='14.0';result=inspect();assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).jobs[0].runner,'macos-15');
    artifact.target.features=['cuda'];result=inspect();assert.equal(result.status,1);assert.match(result.stderr,/maintainer-written runner/);
    artifact.target={triple:'x86_64-unknown-linux-gnu',os:'linux',arch:'x64',minimumLibc:'2.50',cpuBaseline:'x86-64',libc:'glibc'};
    result=inspect();assert.equal(result.status,1);assert.match(result.stderr,/ubuntu-24.04.*cannot qualify/);
    artifact.target.minimumLibc='2.36';result=inspect();assert.equal(result.status,0,result.stderr);
  }finally{rmSync(directory,{recursive:true,force:true});}
});

test('alias paths preserve local dependency locks and repository-relative spec evidence',()=>{
  const parent=realpathSync(mkdtempSync(join(tmpdir(),'aug-release-alias-'))),alias=parent+'-alias';
  try{
    symlinkSync(parent,alias,'dir');
    const physical=join(parent,'library'),directory=join(alias,'library');
    ok('package','init',join(parent,'helper'),'--name','@example/helper');
    ok('package','init',directory,'--name','@example/alias');
    const manifest=JSON.parse(readFileSync(join(directory,'aug-package.json'),'utf8'));
    manifest.dependencies={helper:'../helper'};
    writeFileSync(join(directory,'aug-package.json'),JSON.stringify(manifest));
    writeFileSync(join(directory,'LICENSE'),'MIT\n');
    writeFileSync(join(directory,'src/arithmetic.aug'),'import add from helper\n/** Add two values through a local dependency. */\nsum(int left, int right):\n    return add(left, right)\ntest sum:\n    when arithmetic:\n        it "adds":\n            assert(sum(left=20, right=22) == 42)\n');
    writeFileSync(join(directory,'src/export.aug'),'export sum from arithmetic\n');
    ok('install',directory,'--offline');ok('spec',directory);ok('spec',directory,'--check');
    const outputs=JSON.parse(readFileSync(join(directory,'.aug-spec/manifest.json'),'utf8'));
    assert.ok(outputs.files.every(file=>!file.startsWith('..')&&!file.startsWith('/')),JSON.stringify(outputs));
    git(directory,'init');git(directory,'add','.');
    git(directory,'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','Alias project');git(directory,'tag','v0.1.0');
    const before=readFileSync(join(directory,'aug.lock.json'),'utf8');
    const report=JSON.parse(ok('package','release',directory,'--tag','v0.1.0','--json'));
    assert.equal(report.ready,true);assert.equal(report.contracts[0].name,'sum');
    assert.ok(report.source.files.every(file=>!file.file.startsWith('..')));
    assert.equal(readFileSync(join(directory,'aug.lock.json'),'utf8'),before);
    assert.equal(git(physical,'status','--porcelain'),'');
    const application=join(alias,'application');ok('init',application);
    ok('spec',application);ok('spec',application,'--check');
    const appOutputs=JSON.parse(readFileSync(join(application,'.aug-spec/manifest.json'),'utf8'));
    assert.ok(appOutputs.files.every(file=>!file.startsWith('..')&&!file.startsWith('/')));
    assert.doesNotMatch(readFileSync(join(application,'main.aug.md'),'utf8'),/aug-release-alias-/);
  }finally{rmSync(alias,{force:true});rmSync(parent,{recursive:true,force:true});}
});
