import {defaultText} from './parameters.ts';
import {mkdirSync,lstatSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import type {Diagnostic,MethodDecl} from './ast.ts';
import {typeName} from './ast.ts';
import type {CheckedProject} from './checker.ts';
import {analyzeChangeProject,canonical,CHANGE_SCHEMA,checkedContext,digest,interfaceSnapshot,projectRevision,semanticGraph,sourceIdentity,type Revision} from './change-context.ts';
import {parse} from './parser.ts';
import {suggestedFixes,syntaxFixes} from './fixes.ts';
import {generateC} from './codegen.ts';
import {compileNative} from './native.ts';
import {checkUnitTests,discoverTests} from './testing.ts';
import {withPackageLock} from './package-locking.ts';
import {atomicSourceWrite,checkedSourcePath,clearSourceJournal,recordAcceptedChange,writeSourceJournal,withSourceWriter,type SourceJournal,type SourcePermit} from './source-transaction.ts';
import {EvidenceRejected,prepareBoundedEvidence,runBoundedEvidence,type BoundedGenerator} from './bounded-evidence.ts';
import {requestSyntaxIdioms as syntaxIdioms} from './syntax-idioms.ts';
import {generateSpecs} from './spec.ts';

export type ChangeOperation =
 | {kind:'rename';symbol:string;name:string}
 | {kind:'replace-body';symbol:string;source:string}
 | {kind:'forward';symbol:string};
export interface PublicDelta {symbol:string;before:string|null;after:string|null}
export type ExpectedDelta = {kind:'unchanged'}|{kind:'rename';from:string;to:string}|{kind:'exact';changes:PublicDelta[]};
export interface VerificationSelection {
  generators?:BoundedGenerator[];
  tests:{group:string;name?:string;file?:string;requirements:string[]}[];
  provenance:{source:string;independence:'engineer asserted'|'independent fixture'};
  timeout?:number;
}
export interface ChangeRequest {
  baseRevision:string;root:string;editScope:string[];operations:ChangeOperation[];
  expectedPublicDelta:ExpectedDelta;requirements:{id:string;text:string}[];verification:VerificationSelection;
}
export interface SourceEdit {file:string;start:number;end:number;before:string;after:string;symbol:string;role:string}
export interface ChangePlan {
  schema:typeof CHANGE_SCHEMA;compiler:string;id:string;base:Revision;request:ChangeRequest;
  candidateRevision:string;edits:SourceEdit[];publicDelta:PublicDelta[];
  context:ReturnType<typeof checkedContext>;unresolvedDecisions:string[];unsupportedOccurrences:unknown[];
  candidate:{revision:string;sources:{file:string;digest:string;source:string}[]};
  verification:{selection:VerificationSelection;tests:{id:string;sourceDigest:string;requirements:string[]}[]};
  exchange:{requirements:ChangeRequest['requirements'];implementation:{file:string;source:string};acceptance:{id:string;file:string;source:string}[];
    context:ReturnType<typeof checkedContext>;idioms:ReturnType<typeof syntaxIdioms>;specification:{file:string;text:string;readOnly:true};operations:string[]};
  status:'checked proposal; behavioral checks and engineer review are separate';
}
export class ChangeRejected extends Error {
  readonly code:string;
  readonly report:Record<string,unknown>;
  constructor(code:string,message:string,report:Record<string,unknown>={}) {super(message);this.code=code;this.report={schema:CHANGE_SCHEMA,status:'rejected',code,message,...report};}
}
function reject(code:string,message:string,report:Record<string,unknown>={}):never {throw new ChangeRejected(code,message,report);}
const hasErrors=(checked:CheckedProject)=>checked.diagnostics.some(issue=>issue.severity!=='warning');

/** The compiler compares complete resolved public interfaces, including inherited aliases. */
export function publicInterfaceDelta(before:CheckedProject,after:CheckedProject):PublicDelta[] {
  const left=new Map(interfaceSnapshot(semanticGraph(before)).map(value=>[value.id,value.shape]));
  const right=new Map(interfaceSnapshot(semanticGraph(after)).map(value=>[value.id,value.shape]));
  return [...new Set([...left.keys(),...right.keys()])].sort().flatMap(symbol=>left.get(symbol)===right.get(symbol)?[]:
    [{symbol,before:left.get(symbol)??null,after:right.get(symbol)??null}]);
}
function validateRequest(value:ChangeRequest):void {
  if(!value||typeof value!=='object'||!/^([a-f0-9]{64})$/.test(value.baseRevision)||typeof value.root!=='string')reject('CHANGE_REQUEST','Provide a revision and resolved root definition identity.');
  if(!Array.isArray(value.editScope)||!value.editScope.length||value.editScope.some(file=>typeof file!=='string')||new Set(value.editScope).size!==value.editScope.length)
    reject('CHANGE_SCOPE','Provide distinct root-relative source files as the permitted edit scope.');
  if(!Array.isArray(value.operations)||value.operations.length!==1)reject('CHANGE_OPERATION','The initial profile accepts one resolved rename, body replacement, or forwarding conversion per plan.');
  const operation=value.operations[0];if(!operation||!['rename','replace-body','forward'].includes(operation.kind)||operation.symbol!==value.root)
    reject('CHANGE_OPERATION','The operation must name the resolved root. Adding inputs or errors is not an edit operation in this profile.');
  if(!value.expectedPublicDelta||!['unchanged','rename','exact'].includes(value.expectedPublicDelta.kind))reject('CHANGE_PUBLIC_DELTA','State the intended public interface delta explicitly.');
  if(value.expectedPublicDelta.kind==='exact'&&(!Array.isArray(value.expectedPublicDelta.changes)||value.expectedPublicDelta.changes.some(delta=>
    !delta||typeof delta.symbol!=='string'||[delta.before,delta.after].some(hash=>hash!==null&&!/^[a-f0-9]{64}$/.test(hash!)))))reject('CHANGE_PUBLIC_DELTA','Exact public deltas need resolved identities and interface hashes.');
  if(!Array.isArray(value.requirements)||!value.requirements.length||value.requirements.some(requirement=>!requirement||typeof requirement.id!=='string'||!requirement.id.trim()||typeof requirement.text!=='string'||!requirement.text.trim())||new Set(value.requirements.map(requirement=>requirement.id)).size!==value.requirements.length)
    reject('CHANGE_REQUIREMENTS','Keep the engineer\'s ordered requirements as distinct named entries.');
  const selection=value.verification;
  if(!selection||!Array.isArray(selection.tests)||!selection.tests.length||!selection.provenance?.source?.trim()||!['engineer asserted','independent fixture'].includes(selection.provenance.independence))
    reject('CHANGE_VERIFICATION','Select independent behavioral tests and record their provenance; an empty selection cannot pass.');
  if(selection.timeout!==undefined&&(!Number.isInteger(selection.timeout)||selection.timeout<1||selection.timeout>60000))reject('CHANGE_VERIFICATION','Test timeout must be 1 to 60000 milliseconds.');
  const ids=new Set(value.requirements.map(requirement=>requirement.id)),covered=new Set<string>();
  for(const test of selection.tests){if(!test?.group?.trim()||!Array.isArray(test.requirements)||!test.requirements.length||test.requirements.some(id=>!ids.has(id)))reject('CHANGE_VERIFICATION','Every test selection must link to known requirements.');test.requirements.forEach(id=>covered.add(id));}
  if([...ids].some(id=>!covered.has(id)))reject('CHANGE_VERIFICATION','Every requirement needs an explicitly linked independent check.');
  if(selection.generators!==undefined&&(!Array.isArray(selection.generators)||selection.generators.some(generator=>!Array.isArray(generator?.requirements)||generator.requirements.some(id=>!ids.has(id)))))reject('CHANGE_VERIFICATION','Bounded generators must link to the request requirements.');
}
function selectedTests(checked:CheckedProject,request:ChangeRequest) {
  const discovered=discoverTests(checked.project),matched=discovered.tests.filter(unit=>request.verification.tests.some(selection=>
    selection.group===unit.group.name&&(!selection.name||selection.name===unit.test.name)&&(!selection.file||selection.file===sourceIdentity(checked.project,unit.file))));
  for(const selection of request.verification.tests)if(!matched.some(unit=>unit.group.name===selection.group&&(!selection.name||unit.test.name===selection.name)&&(!selection.file||sourceIdentity(checked.project,unit.file)===selection.file)))
    reject('CHANGE_VERIFICATION',`No tests match ${selection.group}${selection.name?' / '+selection.name:''}.`);
  if(!matched.length)reject('CHANGE_VERIFICATION','The selected behavioral domain is empty.');
  return matched;
}
function diagnosticReport(checked:CheckedProject,base:Revision,candidate:ChangePlan['candidate'],root:string) {
  const fixes=[...checked.project.files.values()].filter(file=>!file.builtin&&!file.package).flatMap(file=>suggestedFixes(checked,file.path).map(fix=>({file:file.path,fix})));
  const graph=semanticGraph(checked);
  return {baseRevision:base.revision,candidate,diagnosticSources:[...new Set(checked.diagnostics.map(issue=>issue.file))].flatMap(path=>{
    const source=checked.project.files.get(path)?.source;return source===undefined?[]:[{file:sourceIdentity(checked.project,path),revision:candidate.revision,digest:digest(source),source}];}),diagnostics:checked.diagnostics.map(issue=>{
    const file=sourceIdentity(checked.project,issue.file),source=checked.project.files.get(issue.file)?.source??'';
    const offset=source.split('\n').slice(0,issue.line-1).reduce((count,line)=>count+line.length+1,0)+issue.column-1;
    const symbol=graph.symbols.filter(symbol=>symbol.location.file===file&&symbol.location.start<=offset&&offset<symbol.location.end)
      .sort((a,b)=>(a.location.end-a.location.start)-(b.location.end-b.location.start))[0]?.id;
    const caller=graph.occurrences.find(occurrence=>occurrence.location.file===file&&occurrence.location.start<=offset&&offset<occurrence.location.end)?.caller;
    return {...issue,file,revision:candidate.revision,symbol:symbol??root,caller,fixes:fixes.filter(({file:fixFile,fix})=>fixFile===issue.file&&fix.issue.line===issue.line&&fix.issue.column===issue.column&&fix.issue.code===issue.code)
      .map(({file:fixFile,fix})=>({...fix,file:sourceIdentity(checked.project,fixFile),edits:fix.edits.map(edit=>({...edit,file:sourceIdentity(checked.project,edit.file)}))}))};
  })};
}
function functionHeader(method:MethodDecl):string {
  return canonical({name:method.name,params:method.params.map(param=>({name:param.name,label:param.label??param.name,type:typeName(param.type),ownership:param.ownership,injected:param.injected,source:param.source,default:param.defaultValue?defaultText(param.defaultValue):undefined})),
    typeParams:method.typeParams,returns:typeName(method.returns),returnOwnership:method.returnOwnership,errors:method.throws.map(typeName),changes:method.changes??[],uses:(method.uses??[]).map(use=>({source:use.source,operation:use.operation})),declared:method.declared,endpoint:method.endpoint,externC:method.externC,annotations:method.annotations});
}
function editsFor(checked:CheckedProject,request:ChangeRequest):SourceEdit[] {
  const project=checked.project,definition=project.definitions.get(request.root),operation=request.operations[0];
  if(!definition||definition.node.kind!=='function'||definition.node.externC||definition.node.endpoint||definition.node.annotations?.length||definition.node.typeParams.length||!definition.node.body)
    reject('CHANGE_PROFILE','The first edit profile requires an ordinary concrete standalone implementation.');
  const method=definition.node,graph=semanticGraph(checked),edits:SourceEdit[]=[];
  if(method.returnOwnership!=='managed'||method.params.some(param=>param.ownership!=='managed'||param.injected||param.mutable||param.source)||
    checked.effectContracts.get(method)?.uses.size||checked.effectContracts.get(method)?.changes.length)
    reject('CHANGE_PROFILE','The first edit profile requires managed inputs/results and empty capability and mutation contracts, with no injected inputs.');
  const add=(file:string,start:number,end:number,after:string,symbol=request.root,role='body')=>{
    const name=sourceIdentity(project,file);if(!request.editScope.includes(name))reject('CHANGE_SCOPE',`Required occurrence is outside the permitted scope: ${name}`,{symbol,location:{file:name,start,end}});
    checkedSourcePath(project.root,name);
    const source=project.files.get(file)?.source;if(source===undefined)reject('CHANGE_SCOPE','The edit target is not part of the checked source inventory.');
    const edit={file:name,start,end,before:source.slice(start,end),after,symbol,role};if(!edits.some(existing=>canonical(existing)===canonical(edit)))edits.push(edit);
  };
  if(operation.kind==='rename') {
    if(!/^[A-Za-z_]\w*$/.test(operation.name)||operation.name==='next')reject('CHANGE_NAME','Use an ordinary declaration name; next is reserved.');
    if(method.name===operation.name)reject('CHANGE_NAME','The new name is unchanged.');
    const occurrences=graph.occurrences.filter(occurrence=>occurrence.symbol===definition.id&&['declaration','reference','import','export','test'].includes(occurrence.role));
    if(!occurrences.length)reject('CHANGE_COVERAGE','No checked occurrences are available.');
    for(const occurrence of occurrences){const path=resolve(project.root,occurrence.location.file),scope=project.scopes.get(path),collision=scope?.get(operation.name);
      if(collision&&collision.id!==definition.id)reject('CHANGE_NAME',`The new name conflicts with ${collision.id}.`,{occurrence});
      const original=project.files.get(path)?.source.slice(occurrence.location.start,occurrence.location.end);
      if(original!==definition.name)reject('CHANGE_COVERAGE','An occurrence does not match the resolved source symbol.',{occurrence,original});
      add(path,occurrence.location.start,occurrence.location.end,operation.name,definition.id,occurrence.role);
    }
  } else if(operation.kind==='replace-body') {
    if(typeof operation.source!=='string'||operation.source.length>1024*1024)reject('CHANGE_SOURCE_UNIT','Supply one August source unit, at most 1 MiB.');
    const parsed=parse(definition.file,operation.source),functions=parsed.file.items.filter(item=>item.kind==='function');
    if(parsed.diagnostics.length)reject('CHANGE_SOURCE_UNIT','The proposed source unit did not parse.',{baseRevision:request.baseRevision,
      candidate:{kind:'source unit; not a checked project',revision:digest(operation.source),sources:[{file:sourceIdentity(project,definition.file),source:operation.source,digest:digest(operation.source)}]},
      diagnostics:parsed.diagnostics.map(issue=>({...issue,file:sourceIdentity(project,issue.file),revision:digest(operation.source),symbol:request.root,
        fixes:syntaxFixes(parsed.file,parsed.diagnostics).filter(fix=>fix.issue.code===issue.code&&fix.issue.line===issue.line&&fix.issue.column===issue.column)
          .map(fix=>({...fix,file:sourceIdentity(project,issue.file),edits:fix.edits.map(edit=>({...edit,file:sourceIdentity(project,edit.file)}))}))}))});
    if(functions.length!==1||parsed.file.items.some(item=>item.kind!=='function'&&item.kind!=='import'))reject('CHANGE_SOURCE_UNIT','A body replacement source unit contains imports and exactly one implementation.');
    const replacement=functions[0];
    if(method.forward||!replacement.body||method.headerEnd===undefined||replacement.headerEnd===undefined||functionHeader(replacement)!==functionHeader(method))
      reject('CHANGE_SOURCE_UNIT','This operation replaces the body while preserving the source header. Copy the checked implementation header, including its inference choices.');
    add(definition.file,method.headerEnd,method.span.end,operation.source.slice(replacement.headerEnd,replacement.span.end));
    const originalImports=project.files.get(definition.file)!.items.filter(item=>item.kind==='import');
    const extra=parsed.file.items.filter(item=>item.kind==='import'&&!originalImports.some(existing=>canonical({names:existing.names,everything:existing.everything,from:existing.from})===canonical({names:item.names,everything:item.everything,from:item.from})));
    if(extra.length)add(definition.file,0,0,extra.map(item=>operation.source.slice(item.span.start,item.span.end)).join('\n')+'\n',definition.id,'imports');
  } else {
    const statement=method.body?.[0],call=statement?.kind==='return'?statement.value:undefined;
    const target=call?.kind==='call'&&call.callee.kind==='name'?project.scopes.get(definition.file)?.get(call.callee.name):undefined;
    const imported=target&&[...project.imports].some(([item,defs])=>item.span.file===definition.file&&!item.everything&&defs.some(def=>def.id===target.id));
    const pure=(node:MethodDecl)=>!node.forward&&!node.typeParams.length&&!node.externC&&!node.endpoint&&!node.annotations?.length&&node.returnOwnership==='managed'&&
      node.params.every(param=>param.ownership==='managed'&&!param.injected&&!param.source&&!param.mutable)&&!checked.effectContracts.get(node)?.uses.size&&!checked.effectContracts.get(node)?.changes.length;
    if(method.forward||method.body?.length!==1||call?.kind!=='call'||call.callee.kind!=='name'||!target||!imported||target.name.startsWith('_')||target.node.kind!=='function'||!pure(method)||
      (!target.node.forward&&!pure(target.node))||call.typeArgs.length||call.args.length!==method.params.length||call.args.some((arg,index)=>arg.kind!=='name'||arg.name!==method.params[index]?.name||call.argLabels[index]!== (method.params[index]?.label??method.params[index]?.name)))
      reject('CHANGE_PROFILE','Only a single direct return of an imported function with unchanged labeled parameters and an empty effect contract can become a forward.');
    const snapshot=interfaceSnapshot(graph),own=snapshot.find(fact=>fact.id===definition.id)?.contract as any,other=snapshot.find(fact=>fact.id===target.id)?.contract as any;
    if(!own||!other||canonical(own)!==canonical(other))reject('CHANGE_PROFILE','Forwarding conversion must preserve the complete resolved interface.');
    // Do not delete comments embedded in a wrapper body during a mechanical conversion.
    if(/\/\/|\/\*/.test(project.files.get(definition.file)!.source.slice(method.span.start,method.span.end)))reject('CHANGE_PROFILE','Move body comments to declaration documentation before converting this wrapper.');
    add(definition.file,method.span.start,method.span.end,`forward ${method.name} to ${target.name}\n`,definition.id,'forward');
  }
  return edits.sort((a,b)=>a.file.localeCompare(b.file)||a.start-b.start||a.end-b.end);
}
function applyEdits(checked:CheckedProject,edits:SourceEdit[]):Map<string,string> {
  const overrides=new Map<string,string>();
  for(const file of new Set(edits.map(edit=>edit.file))){const path=resolve(checked.project.root,file);let source=checked.project.files.get(path)!.source;
    const values=edits.filter(edit=>edit.file===file).sort((a,b)=>b.start-a.start||b.end-a.end);
    for(let i=0;i<values.length;i++){const edit=values[i];if(i&&edit.end>values[i-1].start)reject('CHANGE_EDITS','Overlapping source operations are not supported.');
      if(source.slice(edit.start,edit.end)!==edit.before)reject('CHANGE_STALE','A source edit precondition changed.');source=source.slice(0,edit.start)+edit.after+source.slice(edit.end);}
    overrides.set(path,source);
  }
  return overrides;
}
function expectedDelta(checked:CheckedProject,request:ChangeRequest):PublicDelta[] {
  const expected=request.expectedPublicDelta;
  if(expected.kind==='unchanged')return [];
  if(expected.kind==='exact')return expected.changes.slice().sort((a,b)=>a.symbol.localeCompare(b.symbol));
  const operation=request.operations[0],definition=checked.project.definitions.get(request.root)!;
  const next=definition.id.slice(0,definition.id.lastIndexOf(':')+1)+(operation.kind==='rename'?operation.name:'');
  if(operation.kind!=='rename'||expected.from!==definition.id||expected.to!==next)reject('CHANGE_PUBLIC_DELTA','The intended rename delta must match the resolved operation identities.');
  const shape=interfaceSnapshot(semanticGraph(checked)).find(value=>value.id===definition.id)?.shape;
  if(!shape)return [];
  return [{symbol:definition.id,before:shape,after:null},{symbol:next,before:null,after:shape}].sort((a,b)=>a.symbol.localeCompare(b.symbol));
}

/** Plan construction is read-only: every edit, contract delta, and source precondition is reviewable. */
export function planCheckedChange(root:string,request:ChangeRequest,permit?:SourcePermit):ChangePlan {
  validateRequest(request);root=resolve(root);
  const checked=analyzeChangeProject(root,new Map(),permit),base=projectRevision(checked.project);
  if(request.baseRevision!==base.revision)reject('CHANGE_STALE','The source, configuration, or dependency revision changed. Obtain fresh context.',{expected:request.baseRevision,actual:base.revision});
  if(hasErrors(checked))reject('CHANGE_BASE','Check the complete baseline project before planning edits.',diagnosticReport(checked,base,
    {revision:base.revision,sources:[...checked.project.files].filter(([,file])=>!file.builtin&&!file.package).map(([path,file])=>({file:sourceIdentity(checked.project,path),source:file.source,digest:digest(file.source)}))},request.root));
  const context=checkedContext(checked,[request.root],1000000);
  if(!context.coverage.requiredContextComplete)reject('CHANGE_COVERAGE','Required context has unsupported or unresolved relationships.',{context});
  const definition=checked.project.definitions.get(request.root);
  if(!definition||definition.node.kind!=='function')reject('CHANGE_PROFILE','The first edit profile requires a resolved standalone function.',{context});
  const file=checked.project.files.get(definition.file)!;
  const specification=generateSpecs(checked,{files:[file]}).find(output=>!output.kind&&output.source===file.path)!;
  const exchange={requirements:request.requirements,implementation:{file:sourceIdentity(checked.project,file.path),source:file.source},
    acceptance:selectedTests(checked,request).map(unit=>({id:unit.id,file:sourceIdentity(checked.project,unit.file),source:checked.project.files.get(unit.file)!.source.slice(unit.group.span.start,unit.group.span.end)})),
    context,idioms:syntaxIdioms(),specification:{file:sourceIdentity(checked.project,file.path)+'.md',text:specification.text,readOnly:true as const},operations:['rename','replace-body','forward']};
  try{
  request.editScope.forEach(file=>{checkedSourcePath(root,file);const source=checked.project.files.get(resolve(root,file));if(!source||source.builtin||source.package)reject('CHANGE_SCOPE','The permitted scope must contain only checked project-owned source files.',{file});});
  const edits=editsFor(checked,request),overrides=applyEdits(checked,edits),candidateChecked=analyzeChangeProject(root,overrides,permit);
  const candidateRevision=projectRevision(candidateChecked.project).revision,candidate={revision:candidateRevision,
    sources:[...overrides].map(([file,source])=>({file:sourceIdentity(checked.project,file),digest:digest(source),source})).sort((a,b)=>a.file.localeCompare(b.file))};
  if(hasErrors(candidateChecked))reject('CHANGE_CANDIDATE','The exact proposed program failed checking.',diagnosticReport(candidateChecked,base,candidate,request.root));
  const publicDelta=publicInterfaceDelta(checked,candidateChecked),expected=expectedDelta(checked,request);
  if(canonical(publicDelta)!==canonical(expected))reject('CHANGE_PUBLIC_DELTA','The candidate changed a public interface outside the declared delta.',{baseRevision:base.revision,candidate,expected,actual:publicDelta});
  const tests=selectedTests(checked,request).map(unit=>({id:unit.id,sourceDigest:digest(checked.project.files.get(unit.file)!.source.slice(unit.test.span.start,unit.test.span.end)),
    requirements:[...new Set(request.verification.tests.filter(selection=>selection.group===unit.group.name&&(!selection.name||selection.name===unit.test.name)&&(!selection.file||selection.file===sourceIdentity(checked.project,unit.file))).flatMap(selection=>selection.requirements))]}));
  for(const generator of request.verification.generators??[])prepareBoundedEvidence(candidateChecked,generator,permit);
  const values={schema:CHANGE_SCHEMA as typeof CHANGE_SCHEMA,compiler:base.compiler,base,request,candidateRevision,edits,publicDelta,context,exchange,unresolvedDecisions:[],unsupportedOccurrences:[],candidate,
    verification:{selection:request.verification,tests},status:'checked proposal; behavioral checks and engineer review are separate' as const};
  return {...values,id:digest(canonical(values))};
  }catch(error){if(error instanceof EvidenceRejected)reject('CHANGE_VERIFICATION',error.message,{...error.report,exchange});if(error instanceof ChangeRejected)error.report.exchange=exchange;throw error;}
}
function verifyCandidate(checked:CheckedProject,plan:ChangePlan,permit?:SourcePermit) {
  const tests=selectedTests(checked,plan.request),checks=checkUnitTests(checked.project,tests),outcomes:{id:string;passed:boolean;stdout:string;stderr:string;exit:number|null;signal:string|null}[]=[];
  const build=join(checked.project.root,'.aug-build','changes',plan.candidateRevision);mkdirSync(build,{recursive:true});
  for(let index=0;index<checks.length;index++){
    const {unit,checked:program}=checks[index];if(hasErrors(program))reject('CHANGE_VERIFICATION','The selected test program failed checking.',{...diagnosticReport(program,plan.base,plan.candidate,plan.request.root),exchange:plan.exchange,test:unit.id});
    let result:ReturnType<typeof spawnSync>;
    try{const output=compileNative(checked.project.root,generateC(program),{testIndex:index,checked:program,config:checked.project.config,buildDirectory:build});
      if(output.status!==0)reject('CHANGE_VERIFICATION','The independent test did not compile to a native executable.',{candidate:plan.candidate,exchange:plan.exchange,test:unit.id,diagnostics:output.diagnostics.map(issue=>({...issue,revision:plan.candidateRevision,symbol:plan.request.root})),error:output.error});
      result=spawnSync(output.output,[],{cwd:checked.project.root,encoding:'utf8',timeout:plan.request.verification.timeout??10000,killSignal:'SIGKILL',maxBuffer:1024*1024});}
    catch(error){if(error instanceof ChangeRejected)throw error;reject('CHANGE_VERIFICATION','Could not execute the independent behavioral check.',{candidate:plan.candidate,exchange:plan.exchange,test:unit.id,error:(error as Error).message});}
    outcomes.push({id:unit.id,passed:result!.status===0&&!result!.error,stdout:String(result!.stdout??''),stderr:String(result!.stderr??''),exit:result!.status,signal:result!.signal});
  }
  const generated=(plan.request.verification.generators??[]).map(request=>runBoundedEvidence(checked,request,{timeout:plan.request.verification.timeout,permit}));
  return {status:outcomes.every(outcome=>outcome.passed)&&generated.every(record=>record.behavior.status==='passed finite checks')?'passed finite checks':'failed',finite:true,universalProof:false,count:outcomes.length,outcomes,generated,
    provenance:plan.verification,independence:'Recorded author assertion; the compiler does not establish who authored an oracle.'};
}

/** Behavioral checking is available without committing any source. */
export function checkChangeCandidate(root:string,plan:ChangePlan){
  const current=planCheckedChange(root,plan.request);
  if(current.id!==plan.id||canonical(current)!==canonical(plan))reject('CHANGE_PLAN','The plan or candidate was modified.');
  const candidate=analyzeChangeProject(root,new Map(current.candidate.sources.map(source=>[resolve(root,source.file),source.source]))),behavior=verifyCandidate(candidate,current);
  if(projectRevision(analyzeChangeProject(root).project).revision!==current.base.revision)reject('CHANGE_STALE','The source changed while checking the candidate.');
  return {schema:CHANGE_SCHEMA,status:behavior.status==='passed finite checks'?'verified candidate':'rejected',candidate:current.candidate,publicDelta:current.publicDelta,
    compiler:{status:'passed',revision:current.candidateRevision},behavior,formalProof:'not provided',engineerReview:'not recorded'};
}

/** Recheck under an exclusive writer permit, test the isolated candidate, then journal source writes. */
export function applyCheckedChange(root:string,plan:ChangePlan,options:{onPhase?:(phase:string,writes:number)=>void}={}) {
  root=resolve(root);
  if(!plan||plan.schema!==CHANGE_SCHEMA)reject('CHANGE_PLAN','Unknown checked change plan schema.');
  let accepted:Record<string,unknown>|undefined;
  try{return withPackageLock(join(root,'.aug-install.lock'),()=>withSourceWriter(root,permit=>{
    const current=planCheckedChange(root,plan.request,permit);
    if(current.id!==plan.id||canonical(current)!==canonical(plan))reject('CHANGE_PLAN','The plan or candidate was modified. Replan from the typed request.');
    const overrides=new Map(current.candidate.sources.map(source=>[resolve(root,source.file),source.source]));
    const candidate=analyzeChangeProject(root,overrides,permit),behavior=verifyCandidate(candidate,current,permit);
    if(behavior.status!=='passed finite checks')reject('CHANGE_BEHAVIOR','The compiler checked the candidate, but independent behavioral checks rejected it.',{baseRevision:plan.base.revision,candidate:plan.candidate,exchange:plan.exchange,behavior});
    options.onPhase?.('verified',0);
    const refreshed=projectRevision(analyzeChangeProject(root,new Map(),permit).project);
    if(refreshed.revision!==plan.base.revision)reject('CHANGE_STALE','Source changed while behavioral checks ran. No source was committed.',{actual:refreshed.revision,expected:plan.base.revision});
    const evidence={plan:current.id,publicDelta:current.publicDelta,compiler:{status:'passed',revision:current.candidateRevision},behavior,
      runtimeEnforcement:'existing language/runtime rules',formalProof:'not provided',engineerReview:'not recorded by this compiler operation'};
    const journal:SourceJournal={format:1,transaction:current.id,status:'prepared',baseRevision:current.base.revision,candidateRevision:current.candidateRevision,
      entries:current.candidate.sources.map(source=>{const path=checkedSourcePath(root,source.file),before=readFileSync(path,'utf8');
        if(digest(before)!==current.base.sources.find(entry=>entry.file===source.file)?.digest)reject('CHANGE_STALE','An edit target changed before journal preparation.');
        return {file:source.file,before,after:source.source,mode:lstatSync(path).mode&0o777};}),evidence};
    writeSourceJournal(root,journal);let writes=0;
    try{
      options.onPhase?.('prepared',writes);
      for(const entry of journal.entries){const path=checkedSourcePath(root,entry.file);if(readFileSync(path,'utf8')!==entry.before)reject('CHANGE_STALE','An edit target changed after preparation.');
        atomicSourceWrite(path,entry.after,entry.mode);options.onPhase?.('written',++writes);}
      const committed=projectRevision(analyzeChangeProject(root,new Map(),permit).project);
      if(committed.revision!==current.candidateRevision)reject('CHANGE_STALE','The written project does not match the checked candidate.');
      journal.status='committed';writeSourceJournal(root,journal);
      accepted={schema:CHANGE_SCHEMA,status:'committed',baseRevision:current.base.revision,revision:current.candidateRevision,evidence};
      options.onPhase?.('committed',writes);
      recordAcceptedChange(root,journal);clearSourceJournal(root);
    }catch(error){
      // A publication can rename the committed marker before its directory sync fails.
      // Decide from the visible journal, not the in-memory status set before writing it.
      if(!accepted&&journal.status==='committed'){
        let visible:SourceJournal;
        try{visible=JSON.parse(readFileSync(join(root,'.aug-changes','journal.json'),'utf8'));}
        catch{reject('CHANGE_RECOVERY','Cannot establish the journal commit state. Preserve it for explicit recovery.',{cause:(error as Error).message});}
        if(visible!.status==='committed'&&visible!.transaction===journal.transaction&&visible!.candidateRevision===journal.candidateRevision)
          accepted={schema:CHANGE_SCHEMA,status:'committed',baseRevision:current.base.revision,revision:current.candidateRevision,evidence};
        else if(visible!.status==='prepared'&&visible!.transaction===journal.transaction)journal.status='prepared';
        else reject('CHANGE_RECOVERY','The journal identity changed during publication. Preserve it for inspection.');
      }
      if(journal.status==='prepared'){
        for(const entry of journal.entries){const path=checkedSourcePath(root,entry.file),text=readFileSync(path,'utf8');if(text!==entry.before&&text!==entry.after)
          reject('CHANGE_RECOVERY','An external edit conflicts with rollback. The journal remains for explicit recovery.',{file:entry.file,cause:(error as Error).message});}
        for(const entry of journal.entries)atomicSourceWrite(checkedSourcePath(root,entry.file),entry.before,entry.mode);
        clearSourceJournal(root);
      }
      throw error;
    }
    return {schema:CHANGE_SCHEMA,status:'committed',baseRevision:current.base.revision,revision:current.candidateRevision,evidence};
  }));}catch(error){
    if(accepted)reject('CHANGE_COMMITTED_RECOVERY_REQUIRED','The checked change committed, but publication cleanup was interrupted. Run aug change recover: '+(error as Error).message,{...accepted,recovery:'required'});
    throw error;
  }
}
