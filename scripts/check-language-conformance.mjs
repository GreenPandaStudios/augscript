#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,renameSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {formatFile} from '../src/formatter.ts';
import {conformanceLedger} from './conformance-ledger.mjs';
import {readRuntimePack,compileLLVM} from '../src/llvm-native.ts';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export function compilerIdentity(root){
 const files={};
 function walk(folder,prefix){for(const entry of readdirSync(folder,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))){
  if(entry.isDirectory())walk(join(folder,entry.name),prefix+entry.name+'/');
  else if(/\.(ts|aug)$/.test(entry.name))files[prefix+entry.name]=sha(readFileSync(join(folder,entry.name)));
 }}
 walk(join(root,'src'),'src/');return sha(JSON.stringify(files));
}
export function validateCorpus(corpus){
 assert.equal(corpus.format,1);assert.ok(typeof corpus.oracle==='string'&&corpus.oracle.length);
 assert.ok(Array.isArray(corpus.cases)&&corpus.cases.length,'The independent corpus must not be empty');
 const ids=new Set();
 for(const example of corpus.cases){
  assert.match(example.id,/^[a-z][a-z0-9-]*$/);assert.ok(!ids.has(example.id),'Duplicate case '+example.id);ids.add(example.id);
  assert.ok(Object.hasOwn(example,'stdout')!==Object.hasOwn(example,'diagnostic'),'Each case needs exactly one independent oracle');
  if(Object.hasOwn(example,'stdout'))assert.equal(typeof example.stdout,'string');
  else assert.match(example.diagnostic,/^[A-Z][A-Z0-9_]*$/);
  assert.ok(example.files&&Object.keys(example.files).length&&Object.hasOwn(example.files,'main.aug'),'Each case needs source units including main.aug');
  for(const [file,source] of Object.entries(example.files)){assert.match(file,/^(?:[\w-]+\/)*[\w-]+\.aug$/);assert.equal(typeof source,'string');}
 }
 for(const mutation of corpus.mutations??[]){
  const original=corpus.cases.find(c=>c.id===mutation.case);assert.ok(original&&Object.hasOwn(original,'stdout'),'Mutants need a behavioral oracle');
  assert.ok(original.files[mutation.file]?.includes(mutation.before)&&mutation.before!==mutation.after,'Mutation must change a known source unit');
 }
 return corpus;
}
function execute(example,optimization,syntax){
 const directory=mkdtempSync(join(tmpdir(),'aug-conformance-'));
 try{
  for(const [file,source] of Object.entries(example.files)){const path=join(directory,file);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,source);}
  writeFileSync(join(directory,'main.yaml'),`backend: llvm\noptimization: ${optimization}\nblock_style: ${syntax}\n`);
  let project=loadProject(directory),checked=checkProject(project);
  if(example.diagnostic){assert.ok(checked.diagnostics.some(d=>d.code===example.diagnostic),`${example.id}: expected ${example.diagnostic}: ${JSON.stringify(checked.diagnostics)}`);return;}
  assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[],example.id);
  for(const unit of project.files.values())if(!unit.builtin&&!unit.package)writeFileSync(unit.path,formatFile(project,unit));
  project=loadProject(directory);checked=checkProject(project);assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[],example.id+' after formatting');
  const compiled=compileLLVM(checked,{release:optimization==='release'});
  const result=spawnSync(compiled.output,[],{encoding:'utf8',timeout:15000,env:{...process.env,AUG_WORKERS:'2'}});
  assert.equal(result.status,0,example.id+': '+(result.stderr||result.error?.message));return result.stdout;
 }finally{rmSync(directory,{recursive:true,force:true});}
}
export function runConformance(root=resolve(import.meta.dirname,'..')){
 const directory=join(root,'.aug-build'),output=join(directory,'language-conformance.json');mkdirSync(directory,{recursive:true});
 const report={format:1,target:process.platform+'-'+process.arch,compiler:JSON.parse(readFileSync(join(root,'package.json'))).version,compilerSha256:compilerIdentity(root),outcomes:[],mutations:[],passed:false,status:'running',omissions:['Finite examples do not prove arbitrary behavior. Invalid source fixtures are checked once in their written style before lowering. GPU execution requires separate hardware qualification.']};
 const save=()=>{writeFileSync(output+'.tmp',JSON.stringify(report,null,2)+'\n');renameSync(output+'.tmp',output);};save();
 try{
  const {corpus}=conformanceLedger(root);validateCorpus(corpus);
  report.corpusSha256=sha(readFileSync(join(root,'conformance/cases.json')));report.rulesSha256=sha(readFileSync(join(root,'conformance/rules.json')));report.oracle=corpus.oracle;
  report.runtimeSha256=readRuntimePack(process.env.AUG_RUNTIME_PACK??join(root,'.aug-native/llvm/runtime')).sourceSha256;
  for(const example of corpus.cases){
   const variants=example.diagnostic?[['check','fixture']]:['debug','release'].flatMap(mode=>['indent','braces'].map(style=>[mode,style]));
   for(const [optimization,syntax] of variants){
    const result=execute(example,optimization==='check'?'debug':optimization,syntax==='fixture'?'indent':syntax);
    if(!example.diagnostic)assert.equal(result,example.stdout,example.id);
    report.outcomes.push({case:example.id,optimization,syntax,status:'passed'});
   }
  }
  for(const mutation of corpus.mutations??[]){
   const original=corpus.cases.find(c=>c.id===mutation.case),files={...original.files,[mutation.file]:original.files[mutation.file].replace(mutation.before,mutation.after)};
   const stdout=execute({...original,files},'release','indent');assert.notEqual(stdout,original.stdout,'Independent oracle missed mutation '+mutation.id);
   report.mutations.push({id:mutation.id,case:mutation.case,compiled:true,detected:true,stdout});
  }
  report.checked=report.outcomes.length;report.passed=true;report.status='passed';save();
  console.log(`${corpus.cases.length} independent examples passed in ${report.checked} checks on ${report.target}; ${report.mutations.length} valid behavioral mutations detected.`);return report;
 }catch(error){report.status='failed';report.failure=error.message;save();throw error;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)runConformance();
