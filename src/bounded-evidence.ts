import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import type {CheckedProject} from './checker.ts';
import {analyzeChangeProject,canonical,digest,projectRevision,sourceIdentity} from './change-context.ts';
import {lex} from './lexer.ts';
import {checkUnitTests,discoverTests} from './testing.ts';
import {generateC} from './codegen.ts';
import {compileNative} from './native.ts';
import type {SourcePermit} from './source-transaction.ts';

export const GENERATOR_VERSION='august.enumerated-rows/1';
type Value=string|number|boolean|null;
export interface BoundedGenerator {
  version:typeof GENERATOR_VERSION;file:string;group:string;case:string;
  domains:{parameter:string;values:Value[]}[];limit:number;
  exclude?:{indices:number[];reason:string}[];
  requirements:string[];provenance:{source:string;independence:'engineer asserted'|'independent fixture'};
}
export class EvidenceRejected extends Error {
  readonly code='EVIDENCE';readonly report:Record<string,unknown>;
  constructor(message:string,report:Record<string,unknown>={}){super(message);this.report=report;}
}
const fail=(message:string,report:Record<string,unknown>={}):never=>{throw new EvidenceRejected(message,report);};
const valueSource=(value:Value)=>typeof value==='number'&&Number.isInteger(value)?String(value):JSON.stringify(value);

/** Enumerate literal domains into existing checked tuple rows; no oracle is generated. */
export function prepareBoundedEvidence(checked:CheckedProject,request:BoundedGenerator,permit?:SourcePermit){
  if(checked.diagnostics.some(issue=>issue.severity!=='warning'))fail('Check the complete baseline project before generating evidence.');
  if(!request||request.version!==GENERATOR_VERSION||typeof request.file!=='string'||!request.group?.trim()||!request.case?.trim()||
    !Number.isInteger(request.limit)||request.limit<1||request.limit>256||!Array.isArray(request.domains)||!request.domains.length||
    !request.provenance?.source?.trim()||!['engineer asserted','independent fixture'].includes(request.provenance.independence)||
    !Array.isArray(request.requirements)||!request.requirements.length||request.requirements.some(id=>typeof id!=='string'||!id.trim()))
    fail('Use a versioned generator with literal domains, a 1–256 vector limit, requirement links and independent-check provenance.');
  const units=discoverTests(checked.project).tests.filter(unit=>sourceIdentity(checked.project,unit.file)===request.file&&unit.group.name===request.group&&unit.test.name===request.case);
  const unit=units[0];if(!unit||!unit.test.rows||!unit.test.parameters)fail('A generator must select one existing parameterized same-file test.');
  if(request.domains.length!==unit.test.parameters!.length||request.domains.some((domain,index)=>domain.parameter!==unit.test.parameters![index]||!Array.isArray(domain.values)||!domain.values.length||
    domain.values.some(value=>value!==null&&!['string','number','boolean'].includes(typeof value)||typeof value==='number'&&(!Number.isFinite(value)||Number.isInteger(value)&&!Number.isSafeInteger(value)))))
    fail('Domains must match the checked row parameters in order and contain nonempty, finite scalar literal values.');
  let count=1;for(const domain of request.domains){count*=domain.values.length;if(count>request.limit)fail('The complete domain exceeds the declared limit. Narrow it explicitly; vectors are never silently truncated.');}
  const vectors:{indices:number[];values:Value[];row:string}[]=[];
  const enumerate=(indices:number[],values:Value[])=>{if(indices.length===request.domains.length){vectors.push({indices,values,row:'('+values.map(valueSource).join(', ')+(values.length===1?',':'')+')'});return;}
    request.domains[indices.length].values.forEach((value,index)=>enumerate([...indices,index],[...values,value]));};enumerate([],[]);
  const discarded:{indices:number[];values:Value[];reason:string}[]=[];
  if(request.exclude!==undefined&&!Array.isArray(request.exclude))fail('Excluded vectors need explicit index lists and reasons.');
  for(const excluded of request.exclude??[]){
    if(!excluded?.reason?.trim()||!Array.isArray(excluded.indices)||excluded.indices.length!==request.domains.length||excluded.indices.some((index,dimension)=>!Number.isInteger(index)||index<0||index>=request.domains[dimension].values.length))fail('An excluded vector must be in the domain and have a reason.');
    if(discarded.some(value=>canonical(value.indices)===canonical(excluded.indices)))fail('An excluded vector was listed twice.');
    discarded.push({...vectors.find(vector=>canonical(vector.indices)===canonical(excluded.indices))!,reason:excluded.reason});
  }
  const retained=vectors.filter(vector=>!discarded.some(value=>canonical(value.indices)===canonical(vector.indices)));
  if(!retained.length)fail('An empty retained domain cannot pass.');
  const source=checked.project.files.get(unit.file)!,tokens=lex(unit.file,source.source).tokens.filter(token=>token.span.start>=unit.test.span.start&&token.span.end<=unit.test.span.end);
  const inIndex=tokens.findIndex(token=>token.kind==='in'),open=inIndex>=0?tokens[inIndex+1]:undefined;
  if(open?.kind!=='[')fail('Cannot locate the parser-checked row list.');
  let depth=0,end:number|undefined;
  for(const token of tokens.slice(inIndex+1)){if(token.kind==='[')depth++;if(token.kind===']'&&--depth===0){end=token.span.end;break;}}
  if(end===undefined)fail('The checked row list has no closing delimiter.');
  const generated=source.source.slice(0,open!.span.start)+'['+retained.map(vector=>vector.row).join(', ')+']'+source.source.slice(end);
  const overrides=new Map([...checked.project.files].filter(([,file])=>!file.builtin&&!file.package).map(([path,file])=>[path,path===unit.file?generated:file.source]));
  const candidate=analyzeChangeProject(checked.project.root,overrides,permit),revision=projectRevision(candidate.project).revision;
  if(candidate.diagnostics.some(issue=>issue.severity!=='warning'))fail('Generated rows failed checking. Invalid inputs are not discarded implicitly.',{candidate:{revision,file:request.file,source:generated},
    diagnostics:candidate.diagnostics.map(issue=>({...issue,file:sourceIdentity(candidate.project,issue.file),revision}))});
  const tests=discoverTests(candidate.project).tests.filter(value=>value.file===unit.file&&value.group.name===request.group&&value.test.name===request.case);
  if(tests.length!==retained.length)fail('The checked row count differs from the enumerated domain.');
  return {checked:candidate,tests,record:{generator:GENERATOR_VERSION,request,projectRevision:projectRevision(checked.project).revision,checkedRevision:revision,
    ordering:'domain declaration order; value index order; last dimension varies fastest',limit:request.limit,enumerated:count,discarded,vectors:retained,
    oracle:{file:request.file,group:request.group,case:request.case,digest:digest(source.source.slice(unit.test.span.start,unit.test.span.end))},
    replayCases:retained.map((vector,index)=>({name:`${request.case} [${index+1}]`,parameters:unit.test.parameters,row:vector.row,
      source:`it ${JSON.stringify(`${request.case} [${index+1}]`)} for (${unit.test.parameters!.join(', ')}) in [${vector.row}] `+source.source.slice(tokens.find(token=>token.span.start>=end!&&['{',':'].includes(token.kind))?.span.start??end!,unit.test.span.end)}))}};
}

/** Separate native processes give each ordinary row fresh setup and bounded execution. */
export function runBoundedEvidence(checked:CheckedProject,request:BoundedGenerator,options:{timeout?:number;permit?:SourcePermit}={}){
  const timeout=options.timeout??10000;if(!Number.isInteger(timeout)||timeout<1||timeout>60000)fail('Evidence timeout must be 1–60000 milliseconds.');
  const prepared=prepareBoundedEvidence(checked,request,options.permit),checks=checkUnitTests(prepared.checked.project,prepared.tests);
  const directory=join(checked.project.root,'.aug-build','evidence',digest(canonical(prepared.record)));mkdirSync(directory,{recursive:true});
  const outcomes=checks.map(({unit,checked:program},index)=>{
    const native=compileNative(checked.project.root,generateC(program),{checked:program,config:checked.project.config,testIndex:index,buildDirectory:directory});
    if(native.status!==0)fail('An evidence row did not compile to native code.',{row:index,diagnostics:native.diagnostics,error:native.error});
    const run=spawnSync(native.output,[],{encoding:'utf8',cwd:checked.project.root,timeout,killSignal:'SIGKILL',maxBuffer:1024*1024});
    return {id:unit.id,vector:index,passed:run.status===0&&!run.error,exit:run.status,signal:run.signal,stdout:run.stdout??'',stderr:run.error?.message??run.stderr??''};
  });
  return {...prepared.record,compiler:{status:'passed',revision:prepared.record.checkedRevision},behavior:{status:outcomes.every(result=>result.passed)?'passed finite checks':'failed',finite:true,universalProof:false,outcomes},
    runtimeEnforcement:'existing language/runtime rules',formalProof:'not provided',engineerReview:'not recorded',independence:'Recorded author assertion; the compiler does not establish oracle independence.'};
}
export function replayBoundedEvidence(checked:CheckedProject,record:ReturnType<typeof runBoundedEvidence>){
  if(record?.generator!==GENERATOR_VERSION||record.projectRevision!==projectRevision(checked.project).revision)fail('Replay requires the recorded compiler/source/configuration/dependency revision.');
  const result=runBoundedEvidence(checked,record.request);
  if(canonical(result.vectors)!==canonical(record.vectors)||result.checkedRevision!==record.checkedRevision)fail('The replay domain differs from the recorded evidence.');
  return result;
}
