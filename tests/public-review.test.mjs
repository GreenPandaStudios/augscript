import test from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,readdirSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {compilerVersion,installPackages} from '../src/package-manager.ts';
const cli=resolve(import.meta.dirname,'../bin/aug.mjs');
const write=(directory,name,source)=>writeFileSync(join(directory,name),source);
function library(directory,name,version='1.0.0',dependencies={}){mkdirSync(directory);write(directory,'aug-package.json',JSON.stringify({format:1,name,version,compiler:compilerVersion(),source:'.',dependencies}));}
const diff=(before,after)=>spawnSync(process.execPath,[cli,'package','diff',before,after,'--json'],{encoding:'utf8'});

test('public review detects resolved type changes when dependency types have identical spelling',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-public-types-'));
  try{
    for(const name of ['accounts','customers']){const path=join(root,name);library(path,'@example/'+name);write(path,'export.aug','export User from user\n');write(path,'user.aug','record User(string name)\n');}
    const before=join(root,'before'),after=join(root,'after');
    for(const [path,dependency,version] of [[before,'accounts','1.0.0'],[after,'customers','1.1.0']]){library(path,'@example/lookup',version,{domain:'../'+dependency});write(path,'export.aug','export identity from api\n');write(path,'api.aug','import User from domain\nidentity(User value) returns User:\n    return value\n');installPackages(path,false,true);}
    const result=diff(before,after);assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
    assert.equal(report.changes.length,1);assert.equal(report.changes[0].name,'identity');
    const oldInput=report.changes[0].before.callables[0].inputs[0],newInput=report.changes[0].after.callables[0].inputs[0];
    assert.equal(oldInput.type,newInput.type);assert.match(oldInput.typeIdentity.id,/@example\/accounts@1\.0\.0/);assert.match(newInput.typeIdentity.id,/@example\/customers@1\.0\.0/);
    assert.equal(report.evidence,'checked-public-contracts');assert.equal(report.behavioralEvidence,'not-run');
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('public review pairs generated explanations with contracts while ignoring unexported helpers and source coordinates',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-public-prose-'));
  try{
    const before=join(root,'before'),after=join(root,'after');
    for(const [path,version] of [[before,'1.0.0'],[after,'1.1.0']]){library(path,'@example/arithmetic',version);write(path,'export.aug','export add from api\n');write(path,'api.aug','add(int left, int right):\n    return left + right\nhelper():\n    return "private"\n');}
    const inspect=()=>{const names=[readdirSync(before),readdirSync(after)],sources=[readFileSync(join(before,'api.aug'),'utf8'),readFileSync(join(after,'api.aug'),'utf8')];const result=diff(before,after);assert.equal(result.status,0,result.stderr);assert.deepEqual([readdirSync(before),readdirSync(after)],names);assert.deepEqual([readFileSync(join(before,'api.aug'),'utf8'),readFileSync(join(after,'api.aug'),'utf8')],sources);return JSON.parse(result.stdout);};
    write(after,'api.aug','// Ordinary comments and shifted lines do not change the public explanation.\n\nadd(int left, int right):\n    return left + right\nhelper():\n    return "changed internal helper"\n');
    const unchanged=inspect();assert.deepEqual(unchanged.changes,[]);assert.deepEqual(unchanged.specChanges,[]);
    write(after,'api.aug','add(int left, int right):\n    return left + right + 1\nhelper():\n    return "private"\n');
    const changed=inspect();assert.deepEqual(changed.changes,[]);assert.equal(changed.specChanges.length,1);assert.equal(changed.specChanges[0].name,'add');
    assert.ok(changed.specChanges[0].before.includes('It returns `left` plus `right`.'));assert.match(changed.specChanges[0].after,/1/);
    assert.doesNotMatch(changed.specChanges[0].after,/helper|source-sha256|\.aug-spec|\[source\]|<details>/);
    assert.match(changed.specChanges[0].source.after.file,/api\.aug$/);assert.equal(changed.specChanges[0].source.after.line,1);
    assert.equal(changed.behavioralEvidence,'not-run');
  }finally{rmSync(root,{recursive:true,force:true});}
});


test('public review keeps generic identities stable across versions and reports inherited resolved error changes',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-public-generic-'));
  try{
    const before=join(root,'before'),after=join(root,'after');
    for(const [path,version] of [[before,'1.0.0'],[after,'1.1.0']]){library(path,'@example/view',version);write(path,'export.aug','export View from api\nexport Failure from api\n');write(path,'api.aug','error Failure(string message)\ninterface Reader<T implements Data> { read(T input) returns T unless Failure }\ninterface View extends Reader<immutable List<int>> {}\n');}
    let result=diff(before,after);assert.equal(result.status,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout).changes,[]);
    write(after,'api.aug','error Failure(string message)\ninterface Reader<T implements Data> { read(T input) returns T unless Failure and Error }\ninterface View extends Reader<immutable List<int>> {}\n');
    result=diff(before,after);assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout),view=report.changes.find(change=>change.name==='View');
    assert.ok(view);assert.equal(view.before.callables[0].inputs[0].typeIdentity.immutable,true);
    assert.ok(view.after.callables[0].errorIdentities.some(type=>type.id==='builtin:Error'));
    assert.match(view.before.callables[0].errorIdentities[0].id,/^self\//);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('public review detects deep immutable collection contracts at every type argument',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-public-deep-data-'));
  try{
    const before=join(root,'before'),after=join(root,'after');
    for(const path of [before,after]){library(path,'@example/data');write(path,'export.aug','export size from api\n');write(path,'api.aug','size(List<List<int>> values) returns int:\n    return 1\n');}
    write(after,'api.aug','size(List<immutable List<int>> values) returns int:\n    return 1\n');
    const result=diff(before,after);assert.equal(result.status,0,result.stderr);const changes=JSON.parse(result.stdout).changes;
    assert.equal(changes.length,1);const input=changes[0].after.callables[0].inputs[0];
    assert.equal(input.type,'List<immutable List<int>>');assert.equal(input.typeIdentity.immutable,false);assert.equal(input.typeIdentity.args[0].immutable,true);
    assert.ok(changes[0].differences.some(change=>change.path.endsWith('typeIdentity.args[0].immutable')&&change.after===true));
  }finally{rmSync(root,{recursive:true,force:true});}
});


test('public review canonicalizes owner parameters through inherited default methods',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-public-owner-'));
  try{
    const before=join(root,'before'),after=join(root,'after');
    for(const [path,version,prefix] of [[before,'1.0.0',''],[after,'1.1.0','// Shift the inherited parameter location.\n\n']]){
      library(path,'@example/owners',version);write(path,'export.aug','export View from api\nexport Counter from api\n');
      write(path,'api.aug',prefix+'interface Base<T> { echo(T input) returns T { return input } }\ninterface View<U> extends Base<U> {}\nCounter<U>() implements Base<U> {}\n');
    }
    const result=diff(before,after);assert.equal(result.status,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout).changes,[]);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('public review ignores only the own native provider version and preserves native promises',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-public-native-'));
  try{
    const before=join(root,'before'),after=join(root,'after');
    const descriptor={format:1,profile:'aug-native-abi-1',resources:[{module:'api',name:'Handle',release:'handle_release_v1'}],functions:[{module:'api',name:'readValue',symbol:'value_v1',params:[],result:{kind:'i64'},callingConvention:'C',status:'direct',uses:[],changes:[],thread:'caller',retainsInputs:false}]};
    const bytes=JSON.stringify(descriptor);
    const native={profile:descriptor.profile,bindings:'native.abi.json',bindingsSha256:createHash('sha256').update(bytes).digest('hex'),upstream:{repository:'https://github.com/example/native',version:'1.0.0',sourceRevision:'b'.repeat(40)},artifacts:[{id:'macos-arm64',target:{triple:'aarch64-apple-darwin',os:'macos',arch:'arm64',minimumOS:'14.0',cpuBaseline:'armv8-a',libc:'libSystem'},url:'https://github.com/example/native/releases/download/v1/native.tar.gz',sha256:'a'.repeat(64),maximumDownloadBytes:4096,maximumUnpackedBytes:8192,link:{kind:'dynamic',libraries:['lib/libexample.1.dylib']},runtime:{files:['lib/libexample.1.dylib'],relocation:'loader-relative'},components:[{id:'example',version:'1.0.0',compatibilityKey:'example',linkage:'dynamic',required:true}],fileManifest:'files.json',provenance:'provenance.json',notices:'THIRD_PARTY_NOTICES.md'}]};
    for(const [path,version] of [[before,'1.0.0'],[after,'1.1.0']]){
      library(path,'@example/native',version);write(path,'aug-package.json',JSON.stringify({format:2,name:'@example/native',version,compiler:compilerVersion(),source:'.',dependencies:{},native}));
      write(path,'native.abi.json',bytes);write(path,'export.aug','export Handle from api\nexport readValue from api\n');write(path,'api.aug','extern C resource Handle\nextern C readValue() returns int\n');
    }
    let result=diff(before,after);assert.equal(result.status,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout).changes,[]);
    const manifest=JSON.parse(readFileSync(join(after,'aug-package.json'),'utf8'));manifest.native.upstream.version='2.0.0';write(after,'aug-package.json',JSON.stringify(manifest));
    result=diff(before,after);assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
    assert.equal(report.changes.length,2);assert.ok(report.changes.every(change=>change.differences.some(delta=>delta.path.endsWith('upstream.version'))));
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('public review resolves capability effects rather than comparing their spelling',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-public-effects-'));
  try{
    for(const name of ['alpha','beta']){const path=join(root,name);library(path,'@example/'+name);write(path,'export.aug','export Audit from api\n');write(path,'api.aug','capability Audit { note() uses Audit.note }\n');}
    const before=join(root,'before'),after=join(root,'after');
    for(const [path,dependency] of [[before,'alpha'],[after,'beta']]){library(path,'@example/application','1.0.0',{audit:'../'+dependency});write(path,'export.aug','export run from api\n');write(path,'api.aug','import Audit from audit\nrun() uses Audit.note { pass }\n');installPackages(path,false,true);}
    const result=diff(before,after);assert.equal(result.status,0,result.stderr);const changes=JSON.parse(result.stdout).changes;
    assert.equal(changes.length,1);assert.deepEqual(changes[0].before.callables[0].capabilities,changes[0].after.callables[0].capabilities);
    assert.match(changes[0].before.callables[0].capabilityIdentities[0].capability.id,/@example\/alpha@1\.0\.0/);
    assert.match(changes[0].after.callables[0].capabilityIdentities[0].capability.id,/@example\/beta@1\.0\.0/);
  }finally{rmSync(root,{recursive:true,force:true});}
});


test('public review keeps generic interceptor effects local to each application',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-public-layers-'));
  try{
    const before=join(root,'before'),after=join(root,'after');
    const head='capability Audit<T> { note(T input) uses Audit.note }\ninterceptor Trace<T>() { around(resolve Audit<T> logger, T input) returns T { logger.note(input); return next() } }\n[Trace] runInt(resolve Audit<int> logger, int input) returns int { return input }\n';
    for(const [path,type] of [[before,'string'],[after,'bool']]){library(path,'@example/layers');write(path,'export.aug','export runInt from api\n');write(path,'api.aug',head+'[Trace] helper(resolve Audit<'+type+'> logger, '+type+' input) returns '+type+' { return input }\n');}
    let result=diff(before,after);assert.equal(result.status,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout).changes,[]);
    write(after,'api.aug',head.replace('runInt(resolve Audit<int> logger, int input)', 'runInt(resolve Audit<int> logger, int input, int count)')+'[Trace] helper(resolve Audit<bool> logger, bool input) returns bool { return input }\n');
    result=diff(before,after);assert.equal(result.status,0,result.stderr);const change=JSON.parse(result.stdout).changes[0];
    assert.equal(change.before.callables[0].interceptors[0].capabilityIdentities[0].capability.args[0].id,'builtin:int');
    assert.equal(change.after.callables[0].interceptors[0].capabilityIdentities[0].capability.args[0].id,'builtin:int');
    const source=readFileSync(join(before,'api.aug'),'utf8'),hover=spawnSync(process.execPath,[cli,'hover',before,'--file',join(realpathSync(before),'api.aug'),'--offset',String(source.indexOf('runInt(')+1)],{encoding:'utf8'});
    assert.equal(hover.status,0,hover.stderr);assert.match(JSON.parse(hover.stdout).documentation,/Layer 1 Trace: dependencies Audit<int>;.*uses Audit<int>\.note/);
  }finally{rmSync(root,{recursive:true,force:true});}
});
