import test from 'node:test';
import {createHash} from 'node:crypto';
import {nativeHostTarget} from '../src/native-contracts.ts';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,readdirSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {compilerVersion,installPackages,withPackageUpdatePreview} from '../src/package-manager.ts';
const cli=resolve(import.meta.dirname,'../bin/aug.mjs');
const write=(root,file,text)=>writeFileSync(join(root,file),text);
function fixture(action){
  const root=mkdtempSync(join(tmpdir(),'aug-update-preview-')),app=join(root,'app'),library=join(root,'library');
  for(const path of [app,library])mkdirSync(path);
  const release=(version,source)=>{write(library,'aug-package.json',JSON.stringify({format:1,name:'@example/math',version,compiler:compilerVersion(),source:'.',dependencies:{}}));write(library,'export.aug','export add from api\n');write(library,'api.aug',source);};
  release('1.0.0','add(int left, int right):\n    return left + right\n');
  write(app,'main.yaml','packages:\n  math: "../library"\n');write(app,'main.aug','import add from math\nprint(value=add(left=2, right=3))\n');installPackages(app,false,true);
  const preview=(...args)=>spawnSync(process.execPath,[cli,'update',app,'--preview','--offline','--json',...args],{encoding:'utf8',timeout:30000});
  const lock=readFileSync(join(app,'aug.lock.json'),'utf8'),source=readFileSync(join(app,'main.aug'),'utf8'),snapshots=readdirSync(join(app,'.aug-packages/snapshots'));
  const unchanged=()=>{assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),lock);assert.equal(readFileSync(join(app,'main.aug'),'utf8'),source);assert.deepEqual(readdirSync(join(app,'.aug-packages/snapshots')),snapshots);assert.ok(!readdirSync(app).some(name=>name.startsWith('.aug-install-')||name==='.aug-install.lock'));};
  try{action({root,app,library,release,preview,unchanged});}finally{rmSync(root,{recursive:true,force:true});}
}

test('update preview checks changed public labels and rejects missing caller decisions without accepting source',()=>fixture(({release,preview,unchanged})=>{
  release('1.1.0','add(int left, int right, int adjustment):\n    return left + right + adjustment\n');
  const result=preview();assert.equal(result.status,1,result.stderr);const report=JSON.parse(result.stdout);
  assert.equal(report.acceptedWrites,false);assert.equal(report.application.before.checked,true);assert.equal(report.application.after.checked,false);
  assert.ok(report.application.after.diagnostics.some(issue=>/adjustment/.test(issue.message)));
  assert.equal(report.packages.length,1);assert.equal(report.packages[0].contracts.status,'checked');
  assert.equal(report.packages[0].contracts.changes[0].after.callables[0].inputs.at(-1).label,'adjustment');
  assert.equal(report.packages[0].before.version,'1.0.0');assert.equal(report.packages[0].after.version,'1.1.0');
  assert.equal(report.behavioralEvidence,'not-run');unchanged();
}));

test('update preview separates explanations and own-version changes from interfaces',()=>fixture(({release,preview,unchanged})=>{
  release('1.1.0','add(int left, int right):\n    return left + right + 1\n');
  const result=preview();assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout),changes=report.packages[0].contracts;
  assert.deepEqual(changes.changes,[]);assert.equal(changes.specChanges.length,1);assert.equal(report.application.after.checked,true);
  assert.equal(report.native.status,'selected');assert.deepEqual(report.native.after,[]);assert.equal(report.native.downloadMaximumBytes,0);
  assert.equal(report.native.artifactEvidence,'metadata-only');unchanged();
}));

test('update preview refuses a pending add transaction instead of recovering or changing it',()=>fixture(({app,preview,unchanged})=>{
  const journal='{"unresolved":"test"}\n';write(app,'.aug-add.json',journal);
  const result=preview();assert.equal(result.status,1);assert.match(result.stderr,/pending.*aug add|aug add.*pending/i);
  assert.equal(readFileSync(join(app,'.aug-add.json'),'utf8'),journal);unchanged();
}));

test('update preview reports exact Git commits while preserving the accepted revision',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-update-git-')),library=join(root,'library'),app=join(root,'app'),cache=join(root,'cache');
  const git=(...args)=>{const result=spawnSync(process.env.AUG_GIT??'git',args,{cwd:library,encoding:'utf8'});assert.equal(result.status,0,result.stderr);return result.stdout.trim();};
  try{
    mkdirSync(library);mkdirSync(app);git('init','-b','main');git('config','user.email','fixture@example.invalid');git('config','user.name','Fixture');
    const release=version=>{write(library,'aug-package.json',JSON.stringify({format:1,name:'@example/math',version,compiler:compilerVersion(),source:'.',dependencies:{}}));write(library,'export.aug','export add from api\n');write(library,'api.aug','add(int left, int right) returns int { return left + right }\n');git('add','.');git('commit','-m',version);return git('rev-parse','HEAD');};
    const before=release('1.0.0'),request='git+file://'+library+'#main';write(app,'main.yaml','packages:\n  math: '+JSON.stringify(request)+'\n');write(app,'main.aug','import add from math\nprint(value=add(left=2, right=3))\n');
    const command=(...args)=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8',env:{...process.env,AUG_PACKAGE_CACHE:cache},timeout:30000});
    let result=command('install',app);assert.equal(result.status,0,result.stderr);const lock=readFileSync(join(app,'aug.lock.json'),'utf8'),after=release('1.1.0');
    result=command('update',app,'--preview','--json');assert.equal(result.status,0,result.stderr);const item=JSON.parse(result.stdout).packages[0];
    assert.equal(item.before.source.commit,before);assert.equal(item.after.source.commit,after);assert.deepEqual(item.contracts.changes,[]);
    assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),lock);assert.ok(!readdirSync(app).some(name=>name.startsWith('.aug-install-')));
    result=command('update',app,'--preview','--offline');assert.equal(result.status,1);assert.match(result.stderr,/revision.*not cached|offline.*revision|cached/i);assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),lock);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('update previews describe missing native bytes and unsupported platforms without downloading artifacts',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-update-native-')),library=join(root,'library'),app=join(root,'app'),cache=join(root,'empty-native-cache');
  try{
    mkdirSync(library);mkdirSync(app);
    const descriptor={format:1,profile:'aug-native-abi-1',resources:[],functions:[{module:'api',name:'_answer',symbol:'answer_v1',params:[],result:{kind:'i64'},callingConvention:'C',status:'direct',uses:[],changes:[],thread:'caller',retainsInputs:false}]},bytes=JSON.stringify(descriptor);
    const target=nativeHostTarget(),artifact={id:'host',target,url:'https://example.invalid/never-download.tar.gz',sha256:'a'.repeat(64),maximumDownloadBytes:4096,maximumUnpackedBytes:8192,link:{kind:'static',libraries:['lib/libanswer.a']},runtime:{files:[],relocation:'loader-relative'},components:[],fileManifest:'files.json',provenance:'provenance.json',notices:'THIRD_PARTY_NOTICES.md'};
    const manifest={format:2,name:'@example/answer',version:'1.0.0',compiler:compilerVersion(),source:'.',dependencies:{},native:{profile:descriptor.profile,bindings:'native.abi.json',bindingsSha256:createHash('sha256').update(bytes).digest('hex'),upstream:{repository:'https://github.com/example/answer',version:'1.0.0',sourceRevision:'b'.repeat(40)},artifacts:[artifact]}};
    write(library,'aug-package.json',JSON.stringify(manifest));write(library,'native.abi.json',bytes);write(library,'export.aug','export answer from api\n');write(library,'api.aug','extern C _answer() returns int\nanswer() returns int { unsafe { return _answer() } }\n');
    write(app,'main.yaml','packages:\n  answer: "../library"\n');write(app,'main.aug','import answer from answer\nprint(value=answer())\n');installPackages(app,false,true);
    const lock=readFileSync(join(app,'aug.lock.json'),'utf8'),preview=()=>spawnSync(process.execPath,[cli,'update',app,'--preview','--offline','--json'],{encoding:'utf8',env:{...process.env,AUG_NATIVE_ARTIFACT_CACHE:cache}});
    let result=preview();assert.equal(result.status,0,result.stderr);let report=JSON.parse(result.stdout);
    assert.equal(report.native.downloadMaximumBytes,4096);assert.equal(report.native.artifacts[0].status,'missing');assert.equal(report.native.sizeEvidence,'declared-upper-bounds');assert.equal(report.native.execution,'not-run');
    assert.equal(existsSync(cache),false);assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),lock);
    manifest.version='1.1.0';manifest.native.artifacts[0].target=target.os==='macos'?{triple:'x86_64-unknown-linux-gnu',os:'linux',arch:'x64',cpuBaseline:'x86-64-v2',libc:'glibc',minimumLibc:'2.36'}:{triple:'aarch64-apple-darwin',os:'macos',arch:'arm64',minimumOS:'14.0',cpuBaseline:'armv8-a',libc:'libSystem'};write(library,'aug-package.json',JSON.stringify(manifest));
    result=preview();assert.equal(result.status,1,result.stderr);report=JSON.parse(result.stdout);assert.equal(report.native.status,'rejected');assert.match(report.native.error,/compatible|target|platform/i);
    assert.equal(existsSync(cache),false);assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),lock);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('preview source preconditions reject a concurrent author edit and remove the isolated candidate',()=>fixture(({app,unchanged})=>{
  assert.throws(()=>withPackageUpdatePreview(app,true,()=>{write(app,'main.aug','// Concurrent edit\n');return 'stale candidate';}),/UPDATE_STALE/);
  write(app,'main.aug','import add from math\nprint(value=add(left=2, right=3))\n');unchanged();
}));

test('preview compares an explicitly changed dependency declaration against the accepted lock',()=>fixture(({app,root,preview})=>{
  const next=join(root,'next');mkdirSync(next);write(next,'aug-package.json',JSON.stringify({format:1,name:'@example/math',version:'2.0.0',compiler:compilerVersion(),source:'.',dependencies:{}}));write(next,'export.aug','export add from api\n');write(next,'api.aug','add(int left, int right, int adjustment=0):\n    return left + right + adjustment\n');
  const lock=readFileSync(join(app,'aug.lock.json'),'utf8');write(app,'main.yaml','packages:\n  math: "../next"\n');
  const result=preview();assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
  assert.equal(report.packages.length,1);assert.equal(report.packages[0].before.version,'1.0.0');assert.equal(report.packages[0].after.version,'2.0.0');
  assert.equal(report.packages[0].contracts.changes[0].after.callables[0].inputs.at(-1).default,'0');
  assert.equal(report.application.before.checked,true);assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),lock);assert.equal(readFileSync(join(app,'main.yaml'),'utf8'),'packages:\n  math: "../next"\n');
}));

test('preview rejects changes to the accepted dependency snapshot during analysis',()=>fixture(({app})=>{
  const lock=readFileSync(join(app,'aug.lock.json'),'utf8'),entry=JSON.parse(lock).packages[0],path=join(app,'.aug-packages',entry.path,'api.aug');
  const source=readFileSync(path,'utf8');
  assert.throws(()=>withPackageUpdatePreview(app,true,()=>{writeFileSync(path,source+'// Changed concurrently\n');}),/UPDATE_STALE/);
  assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),lock);assert.ok(!readdirSync(app).some(name=>name.startsWith('.aug-install-')));
}));

test('preview reports inherited public changes through a transitive dependency',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-update-transitive-')),core=join(root,'core'),facade=join(root,'facade'),app=join(root,'app');
  try{
    for(const path of [core,facade,app])mkdirSync(path);
    const manifest=(name,version,dependencies={})=>JSON.stringify({format:1,name,version,compiler:compilerVersion(),source:'.',dependencies});
    write(core,'aug-package.json',manifest('@example/core','1.0.0'));write(core,'export.aug','export Reader from api\n');write(core,'api.aug','interface Reader { read(int index) returns int }\n');
    write(facade,'aug-package.json',manifest('@example/facade','1.0.0',{core:'../core'}));write(facade,'export.aug','export View from api\n');write(facade,'api.aug','import Reader from core\ninterface View extends Reader {}\n');
    write(app,'main.yaml','packages:\n  facade: "../facade"\n');write(app,'main.aug','import View from facade\n');installPackages(app,false,true);
    const lock=readFileSync(join(app,'aug.lock.json'),'utf8');write(core,'aug-package.json',manifest('@example/core','1.1.0'));write(core,'api.aug','interface Reader { read(int index, int limit=1) returns int }\n');
    const result=spawnSync(process.execPath,[cli,'update',app,'--preview','--offline','--json'],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
    assert.equal(report.packages.length,2);const view=report.packages.find(item=>item.after.name==='@example/facade').contracts.changes.find(change=>change.name==='View');
    assert.equal(view.after.callables[0].inputs.at(-1).label,'limit');assert.equal(view.after.callables[0].inputs.at(-1).default,'1');assert.match(view.after.callables[0].inheritedFrom,/@example\/core@1\.1\.0/);
    assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),lock);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('preview labels rejected package contracts as unavailable rather than reporting an accepted API',()=>fixture(({release,preview,unchanged})=>{
  release('1.1.0','add(int left, int right) returns int { return "wrong type" }\n');
  const result=preview();assert.equal(result.status,1,result.stderr);const report=JSON.parse(result.stdout);
  assert.equal(report.packages[0].contracts.status,'unavailable');assert.equal(report.coverage.contracts,'incomplete');assert.ok(report.packages[0].contracts.diagnostics.some(issue=>/int.*string|string.*int/.test(issue.message)));
  assert.equal(report.application.after.checked,false);unchanged();
}));

test('preview fingerprints installed configuration additions, edits and removals',()=>fixture(({app})=>{
  const lock=readFileSync(join(app,'aug.lock.json'),'utf8'),entry=JSON.parse(lock).packages[0],path=join(app,'.aug-packages',entry.path,'main.yaml');
  assert.throws(()=>withPackageUpdatePreview(app,true,()=>{writeFileSync(path,'strict_modules: true\n');}),/UPDATE_STALE/);
  assert.throws(()=>withPackageUpdatePreview(app,true,()=>{writeFileSync(path,'strict_modules: false\n');}),/UPDATE_STALE/);
  assert.throws(()=>withPackageUpdatePreview(app,true,()=>{rmSync(path);}),/UPDATE_STALE/);
  assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),lock);assert.ok(!readdirSync(app).some(name=>name.startsWith('.aug-install-')));
}));

test('preview fingerprints the root library transport identity as a checked input',()=>fixture(({library})=>{
  write(library,'package.json',JSON.stringify({name:'@example/math',version:'1.0.0'}));installPackages(library,false,true);
  const lock=readFileSync(join(library,'aug.lock.json'),'utf8');
  assert.throws(()=>withPackageUpdatePreview(library,true,()=>{write(library,'package.json',JSON.stringify({name:'@example/different',version:'1.0.0'}));}),/UPDATE_STALE/);
  assert.equal(readFileSync(join(library,'aug.lock.json'),'utf8'),lock);assert.ok(!readdirSync(library).some(name=>name.startsWith('.aug-install-')));
}));
