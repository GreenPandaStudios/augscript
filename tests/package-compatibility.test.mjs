import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,existsSync,chmodSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {compilerVersion,initPackage,installPackages,projectPackages,readPackage,addPackage} from '../src/package-manager.ts';

const fixture=action=>{const root=mkdtempSync(join(tmpdir(),'aug-compatibility-'));try{return action(root);}finally{rmSync(root,{recursive:true,force:true});}};
const manifest=(directory,change)=>{const path=join(directory,'aug-package.json');writeFileSync(path,JSON.stringify({...JSON.parse(readFileSync(path)),...change}));};
const git=(root,...args)=>{const result=spawnSync(process.env.AUG_GIT??'git',['-c','user.name=August test','-c','user.email=test@example.invalid',...args],{cwd:root,encoding:'utf8'});assert.equal(result.status,0,result.stderr);return result.stdout.trim();};

test('authors declare bounded compiler compatibility without widening first-party versions',()=>fixture(root=>{
  initPackage(root,'compatible');const [major,minor,patch]=compilerVersion().split('.').map(Number);
  for(const requirement of [compilerVersion(),`^${major}.${minor}.0`,`~${major}.${minor}.0`,`>=${major}.${minor}.0 <${major}.${minor+1}.0`]){
    manifest(root,{compiler:requirement});assert.equal(readPackage(root).manifest.compiler,requirement);
  }
  for(const requirement of ['*','>=0.0.0','0.23','^0.23.0 || ^0.24.0','~01.2.3','>=1.0.0 <0.1.0']){
    manifest(root,{compiler:requirement});assert.throws(()=>readPackage(root),/PACKAGE_COMPILER.*requirement/s);
  }
  manifest(root,{compiler:`${major}.${minor}.${patch+1}`});
  assert.throws(()=>readPackage(root),new RegExp(`compiler mismatch.*compatible.*${major}\\.${minor}\\.${patch+1}.*${compilerVersion()}`,'s'));
}));

test('a compiler upgrade preserves a locked Git commit; only --update advances it',()=>fixture(root=>{
  const library=join(root,'library'),app=join(root,'app'),cache=process.env.AUG_PACKAGE_CACHE;initPackage(library,'compatible');mkdirSync(app);
  const [major,minor]=compilerVersion().split('.').map(Number);manifest(library,{compiler:`>=0.0.0 <${major}.${minor+1}.0`});git(library,'init');git(library,'add','.');git(library,'commit','-m','First');
  const request='git+'+pathToFileURL(library).href;writeFileSync(join(app,'main.yaml'),`packages:\n  compatible: "${request}"\n`);
  process.env.AUG_PACKAGE_CACHE=join(root,'git-cache');
  try{
    const first=installPackages(app),path=join(app,'aug.lock.json');
    writeFileSync(join(library,'src/arithmetic.aug'),'add(int left, int right) { return left + right + 1 }\n');git(library,'add','.');git(library,'commit','-m','Next');
    writeFileSync(path,JSON.stringify({...first,compiler:'0.22.0'}));
    assert.throws(()=>installPackages(app,true,true),/Frozen.*compiler|matching aug.lock/);
    const upgraded=installPackages(app,false,true);assert.equal(upgraded.git[0].commit,first.git[0].commit);
    const updated=installPackages(app,false,false,true);assert.notEqual(updated.git[0].commit,first.git[0].commit);
  }finally{if(cache===undefined)delete process.env.AUG_PACKAGE_CACHE;else process.env.AUG_PACKAGE_CACHE=cache;}
}));

test('a reader holding the previous lock can still read its source after an upgrade',()=>fixture(root=>{
  const library=join(root,'library'),app=join(root,'app');initPackage(library,'library');mkdirSync(app);
  const specifications={library:'../library'};writeFileSync(join(app,'main.yaml'),'packages:\n  library: "../library"\n');
  const first=installPackages(app,false,true),oldSource=join(app,'.aug-packages',first.packages[0].path,'src/arithmetic.aug');
  const before=readFileSync(oldSource,'utf8');manifest(library,{version:'0.1.1'});writeFileSync(join(library,'src/arithmetic.aug'),'add(int left, int right) { return left + right + 1 }\n');
  const next=installPackages(app,false,true);assert.notEqual(first.packages[0].path,next.packages[0].path);
  assert.equal(readFileSync(oldSource,'utf8'),before);
  assert.deepEqual(projectPackages(app,specifications).diagnostics,[]);
}));

test('killing an installer before lock publication keeps the accepted graph readable and recoverable',()=>fixture(root=>{
  const library=join(root,'library'),app=join(root,'app');initPackage(library,'library');mkdirSync(app);
  const specifications={library:'../library'};writeFileSync(join(app,'main.yaml'),'packages:\n  library: "../library"\n');
  installPackages(app,false,true);const lockPath=join(app,'aug.lock.json'),before=readFileSync(lockPath,'utf8');manifest(library,{version:'0.1.1'});
  const module=pathToFileURL(resolve(import.meta.dirname,'../src/package-manager.ts')).href;
  const child=`import fs from 'node:fs';import {syncBuiltinESMExports} from 'node:module';const rename=fs.renameSync;fs.renameSync=(from,to)=>{if(to===${JSON.stringify(lockPath)})process.kill(process.pid,'SIGKILL');return rename(from,to);};syncBuiltinESMExports();const {installPackages}=await import(${JSON.stringify(module)});installPackages(${JSON.stringify(app)},false,true);`;
  const result=spawnSync(process.execPath,['--input-type=module','-e',child],{encoding:'utf8'});assert.equal(result.signal,'SIGKILL',result.stderr);
  assert.equal(readFileSync(lockPath,'utf8'),before);assert.deepEqual(projectPackages(app,specifications).diagnostics,[]);
  const recovered=installPackages(app,false,true);assert.equal(recovered.packages[0].version,'0.1.1');assert.deepEqual(projectPackages(app,specifications).diagnostics,[]);
  assert.equal(existsSync(join(app,'.aug-install.lock')),false);
}));

test('compiler ranges respect preview boundaries and exclude prereleases',async()=>{
  const {acceptsCompiler}=await import('../src/package-compatibility.ts');
  for(const [requirement,accepted,rejected] of [
    ['^1.2.3',['1.2.3','1.9.0'],['1.2.2','2.0.0','1.3.0-rc.1']],
    ['~1.2.3',['1.2.3','1.2.9'],['1.3.0','1.1.9']],
    ['^0.23.0',['0.23.0','0.23.9'],['0.24.0','1.0.0']],
    ['^0.0.3',['0.0.3'],['0.0.2','0.0.4']],
    ['>=0.23.0 <0.25.0',['0.23.1','0.24.2'],['0.22.9','0.25.0']],
    ['1.0.0-rc.1',['1.0.0-rc.1'],['1.0.0','1.0.0-rc.2']]
  ]){
    for(const compiler of accepted)assert.equal(acceptsCompiler(requirement,compiler),true,requirement+' '+compiler);
    for(const compiler of rejected)assert.equal(acceptsCompiler(requirement,compiler),false,requirement+' '+compiler);
  }
  for(const requirement of ['^1.0.0-rc.1','~1.0.0-rc.1','1.0.0-01','1.0.0+build','>=1.0.0 <1.0.0','^9007199254740991.0.0'])assert.throws(()=>acceptsCompiler(requirement,'1.0.0'),/requirement/);
});

test('adding a dependency keeps previously locked Git revisions',()=>fixture(root=>{
  const library=join(root,'library'),extra=join(root,'extra'),app=join(root,'app'),cache=process.env.AUG_PACKAGE_CACHE;
  initPackage(library,'library');initPackage(extra,'extra');mkdirSync(app);git(library,'init');git(library,'add','.');git(library,'commit','-m','First');
  process.env.AUG_PACKAGE_CACHE=join(root,'git-cache');const request='git+'+pathToFileURL(library).href;
  try{
    writeFileSync(join(app,'main.yaml'),`packages:\n  library: "${request}"\n`);const first=installPackages(app);
    manifest(library,{version:'0.1.1'});git(library,'add','.');git(library,'commit','-m','Next');
    writeFileSync(join(app,'main.yaml'),`packages:\n  library: "${request}"\n  extra: "../extra"\n`);
    assert.equal(installPackages(app,false,true).git[0].commit,first.git[0].commit);
  }finally{if(cache===undefined)delete process.env.AUG_PACKAGE_CACHE;else process.env.AUG_PACKAGE_CACHE=cache;}
}));

test('a native artifact failure preserves the accepted source lock and add restores its alias configuration',async()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-native-transaction-')),fetch=globalThis.fetch;
  try{
    const {createHash}=await import('node:crypto'),{nativeHostTarget}=await import('../src/native-contracts.ts');
    const {installPackagesWithNative,addPackageWithNative}=await import('../src/package-manager.ts');
    const library=join(root,'native'),app=join(root,'app');initPackage(library,'native');mkdirSync(app);writeFileSync(join(app,'main.yaml'),'');
    installPackages(app,false,true);const lockPath=join(app,'aug.lock.json'),before=readFileSync(lockPath,'utf8');
    const descriptor=JSON.stringify({format:1,profile:'aug-native-abi-1',resources:[],functions:[]});writeFileSync(join(library,'native.abi.json'),descriptor);
    manifest(library,{format:2,native:{profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:createHash('sha256').update(descriptor).digest('hex'),upstream:{repository:'https://example.invalid/native',version:'1.0.0',sourceRevision:'a'.repeat(40)},artifacts:[{id:'host',target:nativeHostTarget(),url:'https://example.invalid/missing-native.tgz',sha256:'b'.repeat(64),maximumDownloadBytes:4096,maximumUnpackedBytes:8192,link:{kind:'dynamic',libraries:['lib/native.so']},runtime:{files:['lib/native.so'],relocation:'loader-relative'},components:[{id:'native',version:'1.0.0',compatibilityKey:'native',linkage:'dynamic',required:true}],fileManifest:'files.json',provenance:'provenance.json',notices:'THIRD_PARTY_NOTICES.md'}]}});
    globalThis.fetch=async()=>new Response('missing',{status:404});
    await assert.rejects(addPackageWithNative(app,'../native','native'),/NATIVE_DOWNLOAD.*Missing artifact/);
    assert.equal(readFileSync(lockPath,'utf8'),before);assert.equal(readFileSync(join(app,'main.yaml'),'utf8'),'');
    writeFileSync(join(app,'main.yaml'),'packages:\n  native: "../native"\n');
    const phases=[];
    await assert.rejects(installPackagesWithNative(app,false,false,false,()=>phases.push('native artifacts')),/NATIVE_DOWNLOAD.*Missing artifact/);assert.equal(readFileSync(lockPath,'utf8'),before);assert.deepEqual(phases,['native artifacts']);
    writeFileSync(join(app,'main.aug'),'');
    const failedRun=spawnSync(process.execPath,[resolve('bin/aug.mjs'),'run',app,'--offline','--progress'],{encoding:'utf8'});
    assert.equal(failedRun.status,1);assert.match(failedRun.stderr,/native artifacts: failed/);assert.match(failedRun.stderr,/NATIVE_OFFLINE/);assert.equal(readFileSync(lockPath,'utf8'),before);
    await assert.rejects(installPackagesWithNative(app,false,true),/NATIVE_OFFLINE/);assert.equal(readFileSync(lockPath,'utf8'),before);
    assert.equal(existsSync(join(app,'.aug-install.lock')),false);
  }finally{globalThis.fetch=fetch;rmSync(root,{recursive:true,force:true});}
});

test('concurrent stale-lock recovery serializes writers and leaves a valid accepted graph',async()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-concurrent-recovery-'));
  try{
    const {spawn}=await import('node:child_process');const library=join(root,'library'),app=join(root,'app');initPackage(library,'library');mkdirSync(app);
    writeFileSync(join(app,'main.yaml'),'packages:\n  library: "../library"\n');installPackages(app,false,true);
    const lock=join(app,'.aug-install.lock');mkdirSync(lock);writeFileSync(join(lock,'owner-00000000-0000-0000-0000-000000000000'),'2147483647');
    const module=pathToFileURL(resolve(import.meta.dirname,'../src/package-manager.ts')).href;
    const script=`const {installPackages}=await import(${JSON.stringify(module)});for(let i=0;i<6;i++)installPackages(${JSON.stringify(app)},true,true);`;
    const outcomes=await Promise.all(Array.from({length:5},()=>new Promise((accept,reject)=>{
      const child=spawn(process.execPath,['--input-type=module','-e',script],{stdio:['ignore','pipe','pipe']});let stderr='';child.stderr.on('data',data=>stderr+=data);child.once('error',reject);child.once('exit',code=>accept({code,stderr}));
    })));
    for(const outcome of outcomes)assert.equal(outcome.code,0,outcome.stderr);
    assert.deepEqual(projectPackages(app,{library:'../library'}).diagnostics,[]);assert.equal(existsSync(lock),false);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('interrupted add rolls back before publication and preserves its configuration after publication',()=>{
  for(const phase of ['before','after'])fixture(root=>{
    const library=join(root,'library'),app=join(root,'app');initPackage(library,'library');mkdirSync(app);writeFileSync(join(app,'main.yaml'),'optimization: release\n');
    installPackages(app,false,true);const before=readFileSync(join(app,'main.yaml'),'utf8'),lockPath=join(app,'aug.lock.json');
    const module=pathToFileURL(resolve(import.meta.dirname,'../src/package-manager.ts')).href;
    const child=`import fs from 'node:fs';import {syncBuiltinESMExports} from 'node:module';const rename=fs.renameSync;fs.renameSync=(from,to)=>{if(to===${JSON.stringify(lockPath)}&&${JSON.stringify(phase)}==='before')process.kill(process.pid,'SIGKILL');const result=rename(from,to);if(to===${JSON.stringify(lockPath)}&&${JSON.stringify(phase)}==='after')process.kill(process.pid,'SIGKILL');return result;};syncBuiltinESMExports();const {addPackage}=await import(${JSON.stringify(module)});addPackage(${JSON.stringify(app)},'../library','library',true);`;
    const result=spawnSync(process.execPath,['--input-type=module','-e',child],{encoding:'utf8'});assert.equal(result.signal,'SIGKILL',result.stderr);
    assert.equal(existsSync(join(app,'.aug-add.json')),true);assert.equal(statSync(join(app,'.aug-add.json')).mode&0o777,0o600);const recovered=installPackages(app,false,true);
    if(phase==='before'){assert.equal(readFileSync(join(app,'main.yaml'),'utf8'),before);assert.equal(recovered.packages.length,0);}
    else{assert.match(readFileSync(join(app,'main.yaml'),'utf8'),/library:/);assert.equal(recovered.packages.length,1);}
    assert.equal(existsSync(join(app,'.aug-add.json')),false);
  });
});

test('inconsistent copies of one public package version reject without replacing the accepted graph',()=>fixture(root=>{
  const first=join(root,'first'),second=join(root,'second'),app=join(root,'app');initPackage(first,'shared');initPackage(second,'shared');mkdirSync(app);
  writeFileSync(join(app,'main.yaml'),'packages:\n  first: "../first"\n');installPackages(app,false,true);
  const path=join(app,'aug.lock.json'),before=readFileSync(path,'utf8');
  writeFileSync(join(second,'src/arithmetic.aug'),'add(int left, int right) { return left - right }\n');
  writeFileSync(join(app,'main.yaml'),'packages:\n  first: "../first"\n  second: "../second"\n');
  assert.throws(()=>installPackages(app,false,true),/Conflicting contents or dependencies for shared@0.1.0/);assert.equal(readFileSync(path,'utf8'),before);
}));

test('unsupported lock formats and malformed paths reject before accepted writes',()=>fixture(root=>{
  initPackage(join(root,'library'),'library');const app=join(root,'app');mkdirSync(app);writeFileSync(join(app,'main.yaml'),'packages:\n  library: "../library"\n');
  const original=installPackages(app,false,true),path=join(app,'aug.lock.json');
  for(const mutate of [lock=>lock.format=999,lock=>lock.packages[0].path='../escape',lock=>lock.packages[0].dependencies=[],lock=>lock.native={format:999,targets:{}}]){
    const lock=structuredClone(original);mutate(lock);const bytes=JSON.stringify(lock);writeFileSync(path,bytes);
    assert.throws(()=>installPackages(app,false,true),/PACKAGE_LOCK.*structure/);assert.equal(readFileSync(path,'utf8'),bytes);
  }
}));

test('adding a package preserves private configuration permissions and protects recovery contents',()=>fixture(root=>{
  const library=join(root,'library'),app=join(root,'app');initPackage(library,'library');mkdirSync(app);
  const configuration=join(app,'main.yaml');writeFileSync(configuration,'optimization: debug\n');chmodSync(configuration,0o600);
  addPackage(app,'../library','library',true);assert.equal(statSync(configuration).mode&0o777,0o600);
  assert.equal(existsSync(join(app,'.aug-add.json')),false);
}));

test('a successor taking an empty released lock cannot turn a successful action into an error',async()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-lock-handoff-'));
  const fs=(await import('node:fs')).default,{syncBuiltinESMExports}=await import('node:module');
  const {withPackageLock}=await import('../src/package-locking.ts');
  const original=fs.unlinkSync,path=join(root,'install.lock'),successor=join(root,'successor');mkdirSync(successor);
  const owner='owner-11111111-1111-1111-1111-111111111111';writeFileSync(join(successor,owner),String(process.pid));
  fs.unlinkSync=file=>{const result=original(file);if(String(file).startsWith(path+'/owner-'))fs.renameSync(successor,path);return result;};syncBuiltinESMExports();
  try{
    assert.equal(withPackageLock(path,()=>42),42);assert.equal(readFileSync(join(path,owner),'utf8'),String(process.pid));
  }finally{fs.unlinkSync=original;syncBuiltinESMExports();rmSync(root,{recursive:true,force:true});}
});


test('a lock edit made while source is staged is rejected without overwriting that edit',async()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-lock-precondition-'));
  const fs=(await import('node:fs')).default,{syncBuiltinESMExports}=await import('node:module');
  const original=fs.readFileSync;
  try{
    const library=join(root,'library'),app=join(root,'app');initPackage(library,'library');mkdirSync(app);
    writeFileSync(join(app,'main.yaml'),'packages:\n  library: "../library"\n');installPackages(app,false,true);
    const lockPath=join(app,'aug.lock.json'),lock=JSON.parse(readFileSync(lockPath,'utf8'));
    const edited=JSON.stringify({...lock,native:{format:1,targets:{}}});let changed=false;
    fs.readFileSync=(path,...args)=>{
      const result=original(path,...args);
      if(String(path)===fs.realpathSync(join(library,'src/arithmetic.aug'))&&!changed){changed=true;writeFileSync(lockPath,edited);}
      return result;
    };syncBuiltinESMExports();
    assert.throws(()=>installPackages(app,false,true),/PACKAGE_LOCK.*accepted lock changed/);
    assert.equal(changed,true);assert.equal(readFileSync(lockPath,'utf8'),edited);
  }finally{fs.readFileSync=original;syncBuiltinESMExports();rmSync(root,{recursive:true,force:true});}
});
