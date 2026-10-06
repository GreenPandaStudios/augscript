#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,renameSync,lstatSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {formatFile} from '../src/formatter.ts';
import {conformanceLedger} from './conformance-ledger.mjs';
import {qualificationIdentity} from './qualification-identity.mjs';
import {readRuntimePack,compileLLVM} from '../src/llvm-native.ts';
import {llvmPlatform} from '../src/llvm-platform.ts';
import {nativePath} from '../src/native-contracts.ts';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export function compilerIdentity(root){
 const digest=createHash('sha256').update(qualificationIdentity(root).sourceSha256);
 // Include the independent oracle and grammar as well as compiler/runtime inputs.
 for(const file of ['conformance/cases.json','conformance/rules.json','docs/grammar.md']){
  let path=root;
  for(const part of file.split('/')){path=join(path,part);assert.ok(!lstatSync(path).isSymbolicLink(),'Canonical conformance inputs must not be symbolic links: '+file);}
  digest.update(file+'\0').update(readFileSync(path));
 }
 return digest.digest('hex');
}
/** Fingerprint selected native inputs, including manifest changes that keep sourceSha256. */
export function preparedInputIdentity(tools,runtime,toolNames,runtimeFiles){
 const digest=createHash('sha256');
 for(const [directory,files] of [[tools,toolNames.map(name=>'bin/'+name)],[runtime,['runtime.json',...runtimeFiles]]]){
  for(const file of [...new Set(files)].sort())digest.update(file+'\0').update(readFileSync(join(directory,nativePath(file))));
 }
 return digest.digest('hex');
}
export function requirePreparedIdentity(expected,tools,runtime,toolNames,runtimeFiles){
 assert.equal(preparedInputIdentity(tools,runtime,toolNames,runtimeFiles),expected,'Prepared compiler tools or runtime changed during qualification');
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
  if(example.drops!==undefined){
   assert.ok(Object.hasOwn(example,'stdout'),'Cleanup counts require a native behavior case');
   assert.ok(example.drops&&typeof example.drops==='object'&&!Array.isArray(example.drops)&&Object.keys(example.drops).length,'Cleanup counts must not be empty');
   for(const [name,count] of Object.entries(example.drops)){assert.match(name,/^[A-Za-z_][A-Za-z0-9_]*$/);assert.ok(Number.isSafeInteger(count)&&count>0,'Cleanup counts must be positive integers');}
  }
  if(example.dropOrder!==undefined){
   assert.ok(Array.isArray(example.dropOrder)&&example.dropOrder.length>=2,'Cleanup order requires at least two distinct resources');
   assert.equal(new Set(example.dropOrder).size,example.dropOrder.length,'Cleanup order must use distinct resources');
   for(const name of example.dropOrder)assert.equal(example.drops?.[name],1,'Ordered cleanup resources must each have exactly one expected drop');
  }
 }
 assert.ok(Array.isArray(corpus.mutations)&&corpus.mutations.length>=2,'At least two behavioral detection controls are required');
 const mutationIds=new Set();
 for(const mutation of corpus.mutations){
  assert.match(mutation.id,/^[a-z][a-z0-9-]*$/);assert.ok(!mutationIds.has(mutation.id),'Duplicate mutation '+mutation.id);mutationIds.add(mutation.id);
  const original=corpus.cases.find(c=>c.id===mutation.case);assert.ok(original&&Object.hasOwn(original,'stdout'),'Mutants need a behavioral oracle');
  assert.equal(typeof mutation.before,'string');assert.ok(mutation.before.length);assert.equal(typeof mutation.after,'string');
  assert.ok(original.files[mutation.file]?.includes(mutation.before)&&mutation.before!==mutation.after,'Mutation must change a known source unit');
  assert.equal(original.files[mutation.file].split(mutation.before).length,2,'Mutation must select exactly one source occurrence');
 }
 return corpus;
}
function dropSequence(stderr){
 return [...stderr.matchAll(/^drop: (?:[^\n:]+:)?([A-Za-z_][A-Za-z0-9_]*)$/gm)].map(match=>match[1]);
}
export function checkCleanupCounts(example,stderr){
 const trace=dropSequence(stderr),counts=new Map();
 for(const name of trace)counts.set(name,(counts.get(name)??0)+1);
 const observed=Object.fromEntries(counts);
 for(const [name,count] of Object.entries(example.drops??{}))assert.equal(observed[name]??0,count,`${example.id}: ${name} must drop exactly ${count} times`);
 let previous=-1;
 for(const name of example.dropOrder??[]){
  const index=trace.indexOf(name);
  assert.ok(index>previous,`${example.id}: cleanup must occur in order: ${example.dropOrder.join(', ')}`);previous=index;
 }
 return observed;
}
export function coverageSummary(manifest){
 const independent=manifest.rules.filter(rule=>rule.cases.length),linked=manifest.rules.filter(rule=>!rule.cases.length);
 return {totalRules:manifest.rules.length,independentRules:independent.map(rule=>({id:rule.id,cases:rule.cases})),
  regressionOnlyRules:linked.map(rule=>({id:rule.id,regressions:rule.regressions})),
  regressionExecution:'not executed by this command; required separately by the full test suite'};
}
function execute(example,optimization,syntax,toolchain){
 const directory=mkdtempSync(join(tmpdir(),'aug-conformance-'));
 try{
  for(const [file,source] of Object.entries(example.files)){const path=join(directory,file);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,source);}
  writeFileSync(join(directory,'main.yaml'),`backend: llvm\noptimization: ${optimization}\nblock_style: ${syntax}\n`);
  let project=loadProject(directory),checked=checkProject(project);
  if(example.diagnostic){
   const errors=checked.diagnostics.filter(d=>d.severity!=='warning');assert.ok(errors.some(d=>d.code===example.diagnostic),`${example.id}: expected ${example.diagnostic}: ${JSON.stringify(errors)}`);
   return {diagnostics:errors.map(d=>({code:d.code,message:d.message}))};
  }
  assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[],example.id);
  for(const unit of project.files.values())if(!unit.builtin&&!unit.package)writeFileSync(unit.path,formatFile(project,unit));
  project=loadProject(directory);checked=checkProject(project);assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[],example.id+' after formatting');
  const compiled=compileLLVM(checked,{release:optimization==='release',toolchain});
  const environment={...process.env,AUG_WORKERS:'2'};delete environment.AUG_TRACE_DROPS;
  if(example.drops)environment.AUG_TRACE_DROPS='1';
  const result=spawnSync(compiled.output,[],{encoding:'utf8',timeout:15000,env:environment});
  assert.equal(result.status,0,example.id+': '+(result.stderr||result.error?.message));
  const drops=example.drops?checkCleanupCounts(example,result.stderr):undefined;
  return {stdout:result.stdout,...(drops?{drops,dropSequence:dropSequence(result.stderr)}:{})};
 }finally{rmSync(directory,{recursive:true,force:true});}
}
export function runConformance(root=resolve(import.meta.dirname,'..')){
 const directory=join(root,'.aug-build'),output=join(directory,'language-conformance.json');mkdirSync(directory,{recursive:true});
 const report={format:1,target:process.platform+'-'+process.arch,compiler:null,compilerSha256:null,outcomes:[],mutations:[],passed:false,status:'running',omissions:['Finite examples do not prove arbitrary behavior. Invalid source fixtures are checked once in their written style before lowering. GPU execution requires separate hardware qualification. Named regression links are not execution evidence from this command.']};
 const save=()=>{writeFileSync(output+'.tmp',JSON.stringify(report,null,2)+'\n');renameSync(output+'.tmp',output);};save();
 try{
  report.compiler=JSON.parse(readFileSync(join(root,'package.json'))).version;report.compilerSha256=compilerIdentity(root);
  const {manifest,corpus}=conformanceLedger(root);validateCorpus(corpus);report.coverage=coverageSummary(manifest);
  report.corpusSha256=sha(readFileSync(join(root,'conformance/cases.json')));report.rulesSha256=sha(readFileSync(join(root,'conformance/rules.json')));report.oracle=corpus.oracle;
  assert.ok(process.env.AUG_LLVM_HOME,'Prepare AUG_LLVM_HOME before contributor conformance qualification');
  const toolchain={tools:resolve(process.env.AUG_LLVM_HOME),runtime:resolve(process.env.AUG_RUNTIME_PACK??join(root,'.aug-native/llvm/runtime')),developmentOverride:true};
  const pack=readRuntimePack(toolchain.runtime),toolNames=llvmPlatform().tools,runtimeFiles=Object.keys(pack.files);
  report.runtimeSha256=pack.sourceSha256;report.preparedInputSha256=preparedInputIdentity(toolchain.tools,toolchain.runtime,toolNames,runtimeFiles);
  report.preparedInputScope={tools:toolNames,runtimeFiles:['runtime.json',...runtimeFiles].sort(),developmentOverride:true};
  report.omissions.push('Contributor tool overrides may invoke external helpers; their undeclared closure is not qualified by this report. Release producers separately build and seal the complete compiler archive.');
  const verifyPrepared=()=>requirePreparedIdentity(report.preparedInputSha256,toolchain.tools,toolchain.runtime,toolNames,runtimeFiles);
  for(const example of corpus.cases){
   const variants=example.diagnostic?[['check','fixture']]:['debug','release'].flatMap(mode=>['indent','braces'].map(style=>[mode,style]));
   for(const [optimization,syntax] of variants){
    report.current={case:example.id,optimization,syntax};
    verifyPrepared();
    const result=execute(example,optimization==='check'?'debug':optimization,syntax==='fixture'?'indent':syntax,toolchain);
    verifyPrepared();
    if(!example.diagnostic)assert.equal(result.stdout,example.stdout,example.id);
    report.outcomes.push({...report.current,status:'passed',...result});
   }
  }
  for(const mutation of corpus.mutations){
   report.current={mutation:mutation.id,case:mutation.case};
   const original=corpus.cases.find(c=>c.id===mutation.case),files={...original.files,[mutation.file]:original.files[mutation.file].replace(mutation.before,mutation.after)};
   verifyPrepared();
   const {stdout}=execute({...original,files},'release','indent',toolchain);verifyPrepared();assert.notEqual(stdout,original.stdout,'Independent oracle missed mutation '+mutation.id);
   report.mutations.push({id:mutation.id,case:mutation.case,compiled:true,detected:true,stdout});
  }
  verifyPrepared();
  assert.equal(compilerIdentity(root),report.compilerSha256,'Compiler, runtime, configuration or acceptance inputs changed during qualification');
  delete report.current;report.checked=report.outcomes.length;report.passed=true;report.status='passed';save();
  console.log(`${corpus.cases.length} independent examples passed in ${report.checked} checks on ${report.target}; ${report.mutations.length} valid behavioral mutations detected.`);return report;
 }catch(error){report.status='failed';report.failure=error.message;save();throw error;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)runConformance();
