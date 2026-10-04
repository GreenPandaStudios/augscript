import {createHash} from 'node:crypto';
import {readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import type {Diagnostic} from './ast.ts';
import {checkProject,type CheckedProject} from './checker.ts';
import {loadProject,type Project} from './project.ts';
import {prepareRunPackagesWithNative} from './package-manager.ts';
import {prepareNativePackages} from './native-artifacts.ts';
import {prepareLLVMCompiler} from './compiler-packs.ts';
import {checkUnitTests,discoverTests,mergeTestAnalysis,uniqueDiagnostics,type UnitTest} from './testing.ts';
import {semanticGraph,semanticSourcePath,semanticConfiguration,type SemanticGraph} from './symbols.ts';
import {contextPacket,type ContextPacket} from './context.ts';
import {generateSpecs} from './spec.ts';

interface Requirement {id:string;description:string;tests:string[]}
export interface AcceptanceRequirements {format:1;requirements:Requirement[]}
export interface VerificationOptions {requirements:string;backend?:'c'|'llvm';offline?:boolean;frozen?:boolean;timeout?:number}
type EvidenceStatus='passed'|'failed'|'not-run'|'incomplete';
interface CaseResult {id:string;group:string;name:string;passed:boolean;stdout:string;stderr:string}
export interface VerificationReport {
  format:1;status:'passed'|'failed'|'rejected'|'stale'|'incomplete';revision:string;compilerIdentity:SemanticGraph['compiler'];
  compiler:{status:'accepted'|'rejected';diagnostics:Diagnostic[]};
  source:{files:SemanticGraph['sources'];configuration:SemanticGraph['configuration'];coverage:SemanticGraph['coverage']};
  requirements:{origin:'author-supplied';independence:'author-declared';file:string;sha256:string;items:(Requirement&{status:EvidenceStatus})[]};
  review:{sources:{file:string;text:string;sha256:string}[];contexts:ContextPacket[];specifications:{file:string;text:string;origin:'source-derived'}[];
    testGroups:{file:string;subject:string;group:string;source:string;cases:string[]}[]};
  behavior:{status:EvidenceStatus;backend:'c'|'llvm';passed:number;failed:number;results:CaseResult[];
    sourceRevision?:string;execution?:unknown;error?:string};
  freshness:{status:'unchanged'|'changed';afterRevision?:string;reason?:string;diagnostics?:Diagnostic[]};
  engineerReview:'required';generalProof:'not-established';
}
const failure=(message:string)=>new Error('VERIFY: '+message);
const digest=(text:string)=>createHash('sha256').update(text).digest('hex');
const record=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);

/** Requirements and expected answers come from authors. Generated specifications cannot supply an acceptance oracle. */
export function parseAcceptanceRequirements(text:string):AcceptanceRequirements {
  if(Buffer.byteLength(text)>1024*1024)throw failure('Author requirements exceed the 1 MiB limit.');
  let value:unknown;try{value=JSON.parse(text);}catch{throw failure('Supply author requirements as format 1 JSON, with descriptions and test ids from aug test --list.');}
  if(!record(value)||value.format!==1||Object.keys(value).some(key=>!['format','requirements'].includes(key))||
    !Array.isArray(value.requirements)||!value.requirements.length||value.requirements.length>256)
    throw failure('Author requirements need format 1 and 1–256 requirements; unknown fields are not accepted.');
  const ids=new Set<string>(),cases=new Set<string>();let links=0;
  for(const item of value.requirements) {
    if(!record(item)||Object.keys(item).some(key=>!['id','description','tests'].includes(key))||
      typeof item.id!=='string'||!item.id.trim()||item.id.length>128||ids.has(item.id)||
      typeof item.description!=='string'||!item.description.trim()||item.description.length>4096||
      !Array.isArray(item.tests)||!item.tests.length||item.tests.length>256||
      item.tests.some(id=>typeof id!=='string'||!id.trim()||id.length>512)||new Set(item.tests).size!==item.tests.length)
      throw failure('Each requirement needs a unique nonempty id, author description and 1–256 distinct test ids.');
    ids.add(item.id);item.tests.forEach(id=>cases.add(id));links+=item.tests.length;
  }
  if(cases.size>256||links>4096)throw failure('A verification run selects at most 256 cases and 4096 requirement-to-case links. Split larger reviews explicitly.');
  return value as unknown as AcceptanceRequirements;
}

function authorFile(path:string):string {
  if(path.endsWith('.aug.md'))throw failure('A compiled specification describes source; supply a separate author requirements JSON file.');
  if(statSync(path).size>1024*1024)throw failure('Author requirements exceed the 1 MiB limit.');
  const text=readFileSync(path,'utf8');
  if(Buffer.byteLength(text)>1024*1024)throw failure('Author requirements exceed the 1 MiB limit.');
  return text;
}
function selectedCases(project:Project,requirements:AcceptanceRequirements):UnitTest[] {
  const discovered=discoverTests(project),ids=new Set(requirements.requirements.flatMap(item=>item.tests));
  const missing=[...ids].find(id=>!discovered.tests.some(unit=>unit.id===id));
  if(missing)throw failure('No test named '+missing+'. Use aug test --list --json and map exact case ids; no checks ran.');
  return discovered.tests.filter(unit=>ids.has(unit.id));
}
function checkedProject(project:Project):CheckedProject {
  const checked=checkProject(project),discovered=discoverTests(project),tests=checkUnitTests(project,discovered.tests);
  checked.diagnostics=uniqueDiagnostics([...checked.diagnostics,...discovered.diagnostics,...tests.flatMap(test=>test.checked.diagnostics)]);
  mergeTestAnalysis(checked,tests);return checked;
}
function checkedSnapshot(root:string) {
  const configuration=semanticConfiguration(root),checked=checkedProject(loadProject(root));
  if(JSON.stringify(semanticConfiguration(root))!==JSON.stringify(configuration))
    throw failure('Configuration changed while checking source. Review and rerun; no behavioral checks ran.');
  return {checked,configuration};
}
function reviewSources(checked:CheckedProject,selected:UnitTest[]):VerificationReport['review']['sources'] {
  const paths=new Set([...selected.map(unit=>unit.file),...checked.diagnostics.map(issue=>issue.file)]);let bytes=0;
  const sources:VerificationReport['review']['sources']=[];
  for(const path of paths) {
    const file=checked.project.files.get(path);if(!file||file.builtin||file.package)continue;
    bytes+=Buffer.byteLength(file.source);if(bytes>1024*1024)throw failure('Selected source review exceeds 1 MiB. Split the review; no behavioral checks ran.');
    sources.push({file:semanticSourcePath(checked,path),text:file.source,sha256:digest(file.source)});
  }
  return sources;
}
function reviewPacket(checked:CheckedProject,selected:UnitTest[],graph:SemanticGraph):VerificationReport['review'] {
  const contexts:ContextPacket[]=[],seen=new Set<string>();
  for(const unit of selected) {
    const key=unit.file+'\0'+unit.suite.type.name;if(seen.has(key))continue;seen.add(key);
    const packet=contextPacket(checked,unit.file,{name:unit.suite.type.name,budget:100000},graph);
    if(!packet.coverage.checkedProject||packet.coverage.mandatory!=='complete')
      throw failure('Required review context is incomplete for '+unit.suite.type.name+'. No behavioral checks ran.');
    contexts.push(packet);
  }
  const files=[...new Set(selected.map(unit=>unit.file))].map(file=>checked.project.files.get(file)!);
  const specifications=generateSpecs(checked,{files,sourceHints:false}).filter(output=>!output.kind&&output.path.endsWith('.aug.md')).map(output=>({
    file:semanticSourcePath(checked,output.path),text:output.text,origin:'source-derived' as const}));
  const groups=new Map<UnitTest['group'],VerificationReport['review']['testGroups'][number]>();
  for(const unit of selected) {
    let group=groups.get(unit.group);
    if(!group){group={file:semanticSourcePath(checked,unit.file),subject:unit.suite.type.name,group:unit.group.name,
      source:checked.project.files.get(unit.file)!.source.slice(unit.group.span.start,unit.group.span.end),cases:[]};groups.set(unit.group,group);}
    group.cases.push(unit.id);
  }
  return {sources:reviewSources(checked,selected),contexts,specifications,testGroups:[...groups.values()]};
}
function caseResults(value:unknown,selected:UnitTest[]):value is {sourceRevision:string;tests:CaseResult[];execution?:unknown} {
  if(!record(value)||typeof value.sourceRevision!=='string'||!Array.isArray(value.tests)||value.tests.length!==selected.length)return false;
  const expected=new Set(selected.map(unit=>unit.id)),seen=new Set<string>();
  for(const item of value.tests) {
    if(!record(item)||typeof item.id!=='string'||!expected.has(item.id)||seen.has(item.id)||typeof item.passed!=='boolean'||
      typeof item.group!=='string'||typeof item.name!=='string'||typeof item.stdout!=='string'||typeof item.stderr!=='string')return false;
    seen.add(item.id);
  }
  return true;
}

/** Check source and its review context, then run author-selected ordinary tests in fresh native processes. No source/spec edits occur. */
export async function verifyAcceptance(rootPath:string,options:VerificationOptions):Promise<VerificationReport> {
  const root=resolve(rootPath),path=resolve(root,options.requirements),text=authorFile(path),requirements=parseAcceptanceRequirements(text);
  // Invalid/empty selections fail before package preparation or native execution.
  selectedCases(loadProject(root),requirements);
  await prepareRunPackagesWithNative(root,options.offline,options.frozen);
  let snapshot=checkedSnapshot(root),checked=snapshot.checked,selected=selectedCases(checked.project,requirements);
  const backend=options.backend??checked.project.config.backend??'llvm';
  // A rejected source program never triggers toolchain downloads or test execution.
  if(!checked.diagnostics.some(issue=>issue.severity!=='warning')&&backend==='llvm') {
    await prepareNativePackages(root,{offline:options.offline,frozen:options.frozen});
    await prepareLLVMCompiler(options.offline,{root,frozen:options.frozen});
    snapshot=checkedSnapshot(root);checked=snapshot.checked;selected=selectedCases(checked.project,requirements);
  }
  if(authorFile(path)!==text)throw failure('Author requirements changed during preparation. Retry with the intended requirements.');
  const graph=semanticGraph(checked,true,undefined,snapshot.configuration),rejected=checked.diagnostics.some(issue=>issue.severity!=='warning');
  const report:VerificationReport={format:1,status:rejected?'rejected':'incomplete',revision:graph.revision,compilerIdentity:graph.compiler,
    compiler:{status:rejected?'rejected':'accepted',diagnostics:checked.diagnostics},
    source:{files:graph.sources,configuration:graph.configuration,coverage:graph.coverage},
    requirements:{origin:'author-supplied',independence:'author-declared',file:semanticSourcePath(checked,path),sha256:digest(text),
      items:requirements.requirements.map(item=>({...item,status:'not-run'}))},
    review:{sources:reviewSources(checked,selected),contexts:[],specifications:[],testGroups:[]},behavior:{status:'not-run',backend,passed:0,failed:0,results:[]},
    freshness:{status:'unchanged'},engineerReview:'required',generalProof:'not-established'};
  if(rejected)return report;
  report.review=reviewPacket(checked,selected,graph);
  const cli=fileURLToPath(new URL('../bin/aug.mjs',import.meta.url));
  const args=[cli,'test',root,'--json','--backend',backend,'--expected-revision',graph.revision,'--timeout',String(options.timeout??10000),
    ...(options.offline?['--offline']:[]),...(options.frozen?['--frozen']:[]),...selected.flatMap(unit=>['--case',unit.id])];
  const run=spawnSync(process.execPath,args,{encoding:'utf8',cwd:root,maxBuffer:32*1024*1024});
  let result:unknown;try{result=JSON.parse(run.stdout??'');}catch{ /* An interrupted or malformed run supplies no complete evidence. */ }
  const runnerRevision=record(result)&&typeof result.sourceRevision==='string'?result.sourceRevision:undefined;
  if(caseResults(result,selected)&&[0,1].includes(run.status??-1)) {
    const passed=result.tests.filter(item=>item.passed).length,failed=result.tests.length-passed;
    if(run.status!==(failed?1:0))report.behavior={...report.behavior,status:'incomplete',error:'Native test process status disagrees with its case results.'};
    else {
      report.behavior={status:failed?'failed':'passed',backend,passed,failed,results:result.tests,sourceRevision:result.sourceRevision,execution:result.execution};
      const results=new Map(result.tests.map(item=>[item.id,item]));
      report.requirements.items.forEach(item=>item.status=item.tests.every(id=>results.get(id)?.passed)?'passed':'failed');
    }
  } else report.behavior={...report.behavior,status:'incomplete',error:run.error?.message||run.stderr||'Native test process returned no complete case evidence.'};
  if(runnerRevision)report.behavior.sourceRevision=runnerRevision;
  try {
    const currentSnapshot=checkedSnapshot(root),current=semanticGraph(currentSnapshot.checked,true,undefined,currentSnapshot.configuration);report.freshness.afterRevision=current.revision;
    if(currentSnapshot.checked.diagnostics.some(issue=>issue.severity!=='warning'))
      report.freshness={status:'changed',afterRevision:current.revision,reason:'Current source or dependency metadata was rejected while refreshing evidence; review the diagnostics and rerun.',diagnostics:currentSnapshot.checked.diagnostics};
    else if(current.revision!==graph.revision||authorFile(path)!==text||report.behavior.sourceRevision&&report.behavior.sourceRevision!==graph.revision)
      report.freshness={status:'changed',afterRevision:current.revision,reason:'Source, configuration, dependencies, compiler or author requirements changed; review and rerun.'};
  }catch(error){report.freshness={status:'changed',reason:error instanceof Error?error.message:String(error)};}
  report.status=report.freshness.status==='changed'?'stale':report.behavior.status==='passed'?'passed':report.behavior.status==='failed'?'failed':'incomplete';
  return report;
}

/** Human output states the separate compiler, finite behavior and review gates. JSON retains the full source/contracts/specs and results. */
export function verificationSummary(report:VerificationReport):string {
  return 'Verification '+report.status+'; source '+report.revision+'\nCompiler: '+report.compiler.status+'\n'+
    report.requirements.items.map(item=>item.id+': '+item.status+' — '+item.description).join('\n')+'\n'+
    report.behavior.passed+' passed, '+report.behavior.failed+' failed; native behavior '+report.behavior.status+'\n'+
    report.compiler.diagnostics.map(issue=>issue.file+':'+issue.line+': '+issue.code+': '+issue.message+'\n').join('')+
    (report.behavior.error?report.behavior.error+'\n':'')+(report.freshness.reason?report.freshness.reason+'\n':'')+
    'Engineer review required. These finite cases do not establish a general proof. Use --json for author requirements, checked source/contracts, generated explanations and concrete case results.\n';
}
