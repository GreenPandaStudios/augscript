import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const cli=resolve('bin/aug.mjs');
const invoke=(directory,...args)=>spawnSync(process.execPath,[cli,'scratch',...args],{cwd:directory,encoding:'utf8',timeout:60000,env:{...process.env,TMPDIR:directory}});

test('scratch checks an isolated normal main module without running it or editing its neighbors',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-scratch-test-'));
 try{
  const file=join(root,'experiment.aug'),source='value = 20 + 22\nprint(value=$"result: {value}")\n';
  writeFileSync(file,source);writeFileSync(join(root,'main.yaml'),'compiler: 999.0.0\n');
  const before=readdirSync(root).sort(),result=invoke(root,file,'--json');
  assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
  assert.equal(report.checked,true);assert.equal(report.executed,false);assert.equal(report.prepared,false);
  assert.equal(report.source.file,file);assert.equal(report.source.sha256,createHash('sha256').update(source).digest('hex'));
  assert.deepEqual(report.diagnostics,[]);assert.deepEqual(readdirSync(root).sort(),before);assert.equal(readFileSync(file,'utf8'),source);
  assert.doesNotMatch(result.stdout,/result: 42/);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('scratch diagnostics retain the original source locations and normal module rules',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-scratch-errors-'));
 try{
  const file=join(root,'experiment.aug');
  writeFileSync(file,'value = 1\nprint(value=unknown)\n');
  let result=invoke(root,file,'--json'),report=JSON.parse(result.stdout);
  assert.equal(result.status,1);assert.equal(report.checked,false);assert.equal(report.diagnostics[0].file,file);
  assert.equal(report.diagnostics[0].line,2);assert.match(report.diagnostics[0].help,/declared|imported/);
  result=invoke(root,file);assert.match(result.stderr,/experiment.aug:2:13: NAME/);assert.match(result.stderr,/print\(value=unknown\)/);
  writeFileSync(file,'read() { return 1 }\nprint(value=read())\n');
  result=invoke(root,file,'--json');report=JSON.parse(result.stdout);assert.equal(result.status,1);
  assert.ok(report.diagnostics.some(issue=>issue.code==='MAIN'&&issue.file===file));
  assert.deepEqual(readdirSync(root),['experiment.aug']);
 }finally{rmSync(root,{recursive:true,force:true});}
});

for(const backend of ['c','llvm'])test('explicit scratch execution uses the native backend, passes arguments and removes its temporary files ('+backend+')',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-scratch-run-'));
 try{
  const file=join(root,'experiment.aug'),source='import Arguments and ProcessArguments from august.io\nimplement Arguments with ProcessArguments\nresolve Arguments to args\nprint(value=42)\nprint(value=args.read().length())\n';
  writeFileSync(file,source);
  const result=invoke(root,file,'--run','--offline','--backend',backend,'--','one','two');
  assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'42\n2\n');
  assert.equal(readFileSync(file,'utf8'),source);assert.deepEqual(readdirSync(root),['experiment.aug']);
  writeFileSync(file,'exit(status=7)\n');
  const rejected=invoke(root,file,'--run','--offline','--backend',backend);
  assert.equal(rejected.status,7,rejected.stderr);assert.deepEqual(readdirSync(root),['experiment.aug']);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('scratch preparation resolves a real tagged source package without executing its code',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-scratch-import-'));
 try{
  const file=join(root,'experiment.aug'),library=join(root,'library');
  const initialized=spawnSync(process.execPath,[cli,'package','init',library],{encoding:'utf8'});assert.equal(initialized.status,0,initialized.stderr);
  const git=(...args)=>{const result=spawnSync(process.env.AUG_GIT??'git',['-c','core.hooksPath=/dev/null',...args],{cwd:library,encoding:'utf8'});assert.equal(result.status,0,result.stderr);};
  git('init');git('add','.');git('-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','Library');git('tag','v0.1.0');
  writeFileSync(file,'import add from "git+file://'+library+'#v0.1.0"\nprint(value=add(left=20, right=22))\n');
  let result=invoke(root,file,'--json');assert.equal(result.status,1);assert.equal(JSON.parse(result.stdout).prepared,false);assert.match(JSON.parse(result.stdout).recovery,/--prepare/);
  result=invoke(root,file,'--prepare','--json');assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(result.stdout);assert.equal(report.checked,true);assert.equal(report.prepared,true);assert.equal(report.executed,false);
  assert.doesNotMatch(result.stdout,/^42$/m);
  result=invoke(root,file,'--run','--backend','llvm');assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'42\n');
  // Parent aliases and neighboring files are outside the standalone entry profile.
  writeFileSync(file,'import add from library\nprint(value=add(left=20, right=22))\n');
  result=invoke(root,file,'--json');assert.equal(result.status,1);assert.match(result.stdout,/library/);
  writeFileSync(file,'import add from "https://github.com/GreenPandaStudios/aug-scratch-missing#missing"\nprint(value=add(left=20, right=22))\n');
  result=invoke(root,file,'--prepare','--offline','--json');assert.equal(result.status,1);assert.match(result.stderr,/offline|Offline|cached|cache/);
  assert.deepEqual(readdirSync(root).sort(),['experiment.aug','library']);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('scratch rejects ambiguous or invalid options and cleans failed preparation',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-scratch-options-'));
 try{
  const file=join(root,'experiment.aug');writeFileSync(file,'print(value=1)\n');
  for(const args of [[file,'--run','--json'],[file,'--run','--run'],[file,'--backend','no'],[file,'--unknown'],[file,'--','argument'],[file,file]]){
   const result=invoke(root,...args);assert.equal(result.status,2,result.stderr);
  }
  const missing=invoke(root,join(root,'missing.aug'));assert.equal(missing.status,1);assert.match(missing.stderr,/ENOENT/);
  assert.deepEqual(readdirSync(root),['experiment.aug']);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('the guide entry uses the public scratch frontend',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-scratch-guide-'));
 try{
  const guide=readFileSync(resolve('docs/guides/try-a-snippet.md'),'utf8'),source=[...guide.matchAll(/```text\n([\s\S]*?)\n```/g)][0][1];
  const file=join(root,'experiment.aug');writeFileSync(file,source);
  const result=invoke(root,file,'--run','--backend','llvm','--offline');assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'result: 42\n');
  assert.equal(invoke(root,'--help').status,0);assert.deepEqual(readdirSync(root),['experiment.aug']);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('the guide imports and runs the real public native zlib package',{skip:process.env.AUG_TEST_PUBLIC_SCRATCH!=='1'},()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-scratch-public-'));
 try{
  const guide=readFileSync(resolve('docs/guides/try-a-snippet.md'),'utf8'),source=[...guide.matchAll(/```text\n([\s\S]*?)\n```/g)][1][1];
  const file=join(root,'compression.aug');writeFileSync(file,source);
  let result=invoke(root,file,'--prepare','--json');assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(result.stdout);assert.equal(report.checked,true);assert.equal(report.executed,false);assert.equal(report.prepared,true);
  result=invoke(root,file,'--run','--backend','llvm');assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'scratch zlib\n');
  assert.equal(readFileSync(file,'utf8'),source);assert.deepEqual(readdirSync(root),['compression.aug']);
 }finally{rmSync(root,{recursive:true,force:true});}
});
