import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {initNativePackage} from '../src/native-init.ts';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const cli=resolve(import.meta.dirname,'../bin/aug.mjs');
const supported=process.platform==='darwin'&&process.arch==='arm64'&&existsSync('/usr/bin/clang')&&existsSync('/usr/bin/ar');

test('a native C starter builds real artifacts with checked public bindings',{skip:!supported},async t=>{
 const root=mkdtempSync(join(tmpdir(),'aug-native-init-')),library=join(root,'library'),cache=join(root,'cache');
 const env={...process.env,AUG_NATIVE_ARTIFACT_CACHE:cache};
 const run=(...args)=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8',env,timeout:60000});
 try{
  const license=join(root,'LICENSE');writeFileSync(license,'MIT fixture license supplied by the test author.\n');
  const result=run('package','init',library,'--native','c','--name','@example/identity','--repository','https://example.invalid/identity','--artifact-url','https://example.invalid/identity-v0.1.0.tar.gz','--license',license,'--clang','/usr/bin/clang','--ar','/usr/bin/ar');
  assert.equal(result.status,0,result.stderr);
  const manifest=JSON.parse(readFileSync(join(library,'aug-package.json'))),artifact=manifest.native.artifacts[0];
  assert.match(readFileSync(join(library,'AGENTS.md'),'utf8'),/Start in src\/export\.aug/);
  assert.equal(manifest.format,2);assert.equal(manifest.name,'@example/identity');assert.equal(artifact.target.minimumOS,'14.0');
  assert.match(artifact.fileManifestSha256,/^[0-9a-f]{64}$/);
  const archive=join(library,'.aug-build/native/macos-arm64.tar.gz');assert.equal(existsSync(archive),true);
  const cached=run('package','cache-native',library,'--artifact','macos-arm64','--archive',archive);assert.equal(cached.status,0,cached.stderr);
  const checked=run('check',library);assert.equal(checked.status,0,checked.stderr);
  await t.test('ordinary offline imports and same-file tests execute the native C through LLVM',{skip:!process.env.AUG_LLVM_HOME||!process.env.AUG_RUNTIME_PACK},()=>{
  const app=join(root,'app');mkdirSync(app);writeFileSync(join(app,'main.yaml'),'packages:\n  identity: "../library"\n');
  writeFileSync(join(app,'main.aug'),'import identity from identity\nprint(value=identity(value=-9223372036854775808))\nprint(value=identity(value=-1))\nprint(value=identity(value=7))\nprint(value=identity(value=9223372036854775807))\n');
  const consumer=spawnSync(process.execPath,[cli,'run',app,'--offline','--backend','llvm'],{encoding:'utf8',timeout:60000,env:{...env,PATH:'/no-native-tools',SDKROOT:'/missing-sdk',DEVELOPER_DIR:'/missing-developer-tools'}});
  assert.equal(consumer.status,0,consumer.stderr);assert.equal(consumer.stdout,'-9223372036854775808\n-1\n7\n9223372036854775807\n');
  const tests=run('test',library,'--offline','--backend','llvm');assert.equal(tests.status,0,tests.stderr);
  });
 }finally{rmSync(root,{recursive:true,force:true});}
});

function authorFixture(action){
 const root=mkdtempSync(join(tmpdir(),'aug-author-failure-')),directory=join(root,'library'),license=join(root,'LICENSE');
 writeFileSync(license,'Author-provided test license.\n');
 const options={name:'@example/identity',repository:'https://example.invalid/identity',artifactURL:'https://example.invalid/library.tar.gz',license,clang:'/usr/bin/clang',ar:'/usr/bin/ar'};
 const command=(...changes)=>spawnSync(process.execPath,[cli,'package','init',directory,'--native','c','--name',options.name,'--repository',options.repository,'--artifact-url',options.artifactURL,'--license',license,'--clang',options.clang,'--ar',options.ar,...changes],{encoding:'utf8',timeout:60000});
 try{return action({root,directory,license,options,command});}finally{rmSync(root,{recursive:true,force:true});}
}

test('a committed native starter is reported if writer cleanup fails',{skip:!supported},()=>authorFixture(f=>{
 const original=fs.unlinkSync;let injected=false;
 fs.unlinkSync=(...args)=>{
  if(existsSync(join(f.directory,'aug-package.json'))){injected=true;throw Object.assign(new Error('Injected filesystem cleanup failure'),{code:'EIO'});}
  return original(...args);
 };syncBuiltinESMExports();
 try{assert.throws(()=>initNativePackage(f.directory,f.options),error=>{
  assert.equal(error.code,'NATIVE_INIT_COMMITTED');assert.equal(error.report.directory,f.directory);
  assert.match(error.message,/preserved/);return true;
 });}finally{fs.unlinkSync=original;syncBuiltinESMExports();}
 assert.equal(injected,true);assert.equal(existsSync(join(f.directory,'src/export.aug')),true);
 assert.equal(existsSync(join(f.directory,'.aug-build/native/macos-arm64.tar.gz')),true);
}));


test('native starter options reject incomplete, duplicate and unsupported requests before creation',()=>authorFixture(f=>{
 for(const args of [
  ['package','init',f.directory,'--native','rust'],
  ['package','init',f.directory,'--native','c'],
  ['package','init',f.directory,'--repository',f.options.repository],
  ['init',f.directory,'--native','c']
 ]){
  const result=spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});assert.equal(result.status,2,result.stderr);assert.equal(existsSync(f.directory),false);
 }
 for(const extra of [['--native','c'],['--clang'],['--build','yes']]){
  const result=f.command(...extra);assert.equal(result.status,2,result.stderr);assert.equal(existsSync(f.directory),false);
 }
}));

test('native starter metadata and tool failures preserve empty and populated destinations',{skip:!supported},()=>authorFixture(f=>{
 mkdirSync(f.directory);
 for(const options of [
  {...f.options,repository:'http://example.invalid/source'},
  {...f.options,artifactURL:'https://user:secret@example.invalid/archive'},
  {...f.options,clang:'/does-not-exist/clang'},
  {...f.options,ar:'/usr/bin/false'}
 ]){
  assert.throws(()=>initNativePackage(f.directory,options),/NATIVE_INIT/);
  assert.deepEqual(fs.readdirSync(f.directory),[]);
  assert.equal(fs.readdirSync(f.root).some(name=>name.startsWith('.aug-native-init-')||name.endsWith('.aug-native-init.lock')),false);
 }
 writeFileSync(join(f.directory,'existing.txt'),'Preserve this work.');
 assert.throws(()=>initNativePackage(f.directory,f.options),/new or empty real directory/);
 assert.equal(readFileSync(join(f.directory,'existing.txt'),'utf8'),'Preserve this work.');
}));

test('native starter rejects linked destinations and linked licenses',{skip:!supported},()=>authorFixture(f=>{
 const target=join(f.root,'target');mkdirSync(target);symlinkSync(target,f.directory,'dir');
 assert.throws(()=>initNativePackage(f.directory,f.options),/new or empty real directory/);
 assert.deepEqual(fs.readdirSync(target),[]);rmSync(f.directory);symlinkSync(join(f.root,'absent'),f.directory,'dir');
 assert.throws(()=>initNativePackage(f.directory,f.options),/new or empty real directory/);assert.equal(fs.lstatSync(f.directory).isSymbolicLink(),true);
 rmSync(f.directory);const linked=join(f.root,'linked-license');symlinkSync(f.license,linked);
 assert.throws(()=>initNativePackage(f.directory,{...f.options,license:linked}),/ELOOP|symbolic link/);assert.equal(existsSync(f.directory),false);
}));

test('native C source generation honors all eight supported formatting combinations',{skip:!supported},()=>authorFixture(f=>{
 let index=0;
 for(const blockStyle of ['indent','braces'])for(const indentation of ['spaces','tabs'])for(const assignment of ['equals','to']){
  const directory=join(f.root,'style-'+index++),result=initNativePackage(directory,{...f.options,preferences:{block_style:blockStyle,indentation,assignment}});
  assert.equal(result.directory,directory);
  assert.match(readFileSync(join(directory,'main.yaml'),'utf8'),new RegExp('assignment: '+assignment));
  const source=readFileSync(join(directory,'src/api.aug'),'utf8');
  assert.equal(source.includes('unsafe {'),blockStyle==='braces');assert.equal(source.includes('	'),indentation==='tabs');
  const checked=spawnSync(process.execPath,[cli,'check',directory],{encoding:'utf8'});assert.equal(checked.status,0,checked.stderr);
 }
}));
