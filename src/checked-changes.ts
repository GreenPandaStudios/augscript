import {readFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {checkedProjectWithTests,planRename,applySourceEdits,type CheckedSourceEdit,type InterfaceDelta,type IdentityMapping} from './refactoring.ts';
import type {CheckedProject} from './checker.ts';
import {planDependencyEdits,type DependencyHeader} from './dependency-edits.ts';
import {planBodyReplacement} from './body-edits.ts';
import {checkedChangeRevision} from './change-revisions.ts';
import {semanticGraph,semanticConfiguration} from './symbols.ts';
import {semanticDependencyMetadata} from './semantic-metadata.ts';
import {SourceChangeError,coherentSourceRead,sourceChangeRoot,sourceChangePath,sourceImage,withSourceWriter,publishSourceChange,recoverSourceJournal,type SourceCheckpoint} from './source-transactions.ts';

export interface ChangeRenamePlan {
  format:1;operation:'rename';baseRevision:string;compiler:{version:string;sha256:string};file:string;offset:number;name:string;symbol:string;
  scope:string[];sources:{file:string;sha256:string}[];configuration:{file:string;sha256:string|null}[];edits:CheckedSourceEdit[];publicDelta:InterfaceDelta[];identityMap:IdentityMapping[];
  candidateRevision:string;dependencyMetadata:{file:string;sha256:string|null}[];coverage:ReturnType<typeof semanticGraph>['coverage'];boundaries:ReturnType<typeof semanticGraph>['boundaries'];checked:true;behavioralEvidence:'not-run';
}
export interface ChangeBodyPlan extends Omit<ChangeRenamePlan,'operation'|'offset'|'name'|'identityMap'> {
  operation:'replace-body';name:string;replacementSource:string;
}
export interface ChangeDependencyPlan extends Omit<ChangeRenamePlan,'operation'|'offset'|'identityMap'> {
  operation:'add-dependency';symbolName:string;capability:string;headers:DependencyHeader[];
  baseDiagnostics:CheckedProject['diagnostics'];
}
export type ChangePlan=ChangeRenamePlan|ChangeBodyPlan|ChangeDependencyPlan;
const digest=(text:string)=>createHash('sha256').update(text).digest('hex');
function candidate(root:string,plan:ChangePlan) {
  const overrides=new Map<string,string>();
  for(const file of plan.scope)overrides.set(join(root,file),applySourceEdits(readFileSync(sourceChangePath(root,file),'utf8'),plan.edits.filter(edit=>edit.file===file)));
  return checkedProjectWithTests(root,overrides);
}
function dependencyMetadata(checked:CheckedProject) {
  try {return semanticDependencyMetadata(checked.project);}
  catch(error){throw new SourceChangeError('CHANGE_PLAN',error instanceof Error?error.message:String(error));}
}

const revision=(checked:CheckedProject,configuration=semanticConfiguration(checked.project.root))=>{
  const graph=semanticGraph(checked,true,undefined,configuration),dependencies=dependencyMetadata(checked);
  return {graph,dependencies,revision:checkedChangeRevision(graph,dependencies)};
};
function snapshot(root:string) {
  const configuration=semanticConfiguration(root),checked=checkedProjectWithTests(root,new Map()),first=revision(checked,configuration);
  const refreshed=checkedProjectWithTests(root,new Map()),second=revision(refreshed,configuration);
  if(first.revision!==second.revision||JSON.stringify(configuration)!==JSON.stringify(semanticConfiguration(root)))
    throw new SourceChangeError('CHANGE_STALE','Source or dependency metadata changed while taking the checked snapshot. Retry planning.');
  return {checked:refreshed,...second};
}
function renameFromSnapshot(root:string,file:string,offset:number,name:string,current:ReturnType<typeof snapshot>):ChangeRenamePlan {
  const checked=current.checked,graph=current.graph,path=sourceChangePath(root,file),rename=planRename(checked,graph,path,offset,name);
  const edits=rename.edits.map(edit=>({...edit,file:relative(root,edit.file).replaceAll('\\','/')}));
  for(const edit of edits)sourceChangePath(root,edit.file);
  const plan:ChangeRenamePlan={format:1,operation:'rename',baseRevision:current.revision,compiler:graph.compiler,file,offset,name,symbol:rename.symbol,
    scope:[...new Set(edits.map(edit=>edit.file))].sort(),sources:graph.sources,configuration:graph.configuration,edits,publicDelta:rename.publicDelta,identityMap:rename.identityMap,
    candidateRevision:'',dependencyMetadata:current.dependencies,coverage:graph.coverage,boundaries:graph.boundaries,checked:true,behavioralEvidence:'not-run'};
  plan.candidateRevision=revision(candidate(root,plan),graph.configuration).revision;
  if(snapshot(root).revision!==current.revision)throw new SourceChangeError('CHANGE_STALE','Source changed while planning. Retry without the concurrent edit.');return plan;
}
/** Disk source units and package/configuration identities are part of the plan.
 * Planning never writes or executes code; applying regenerates this exact plan. */
export function planChangeRename(projectRoot:string,file:string,offset:number,name:string):ChangeRenamePlan {
  const root=sourceChangeRoot(projectRoot);
  if(!Number.isSafeInteger(offset)||offset<0)throw new SourceChangeError('CHANGE_PLAN','The selected offset must be a nonnegative source offset.');
  sourceChangePath(root,file);
  return coherentSourceRead(root,()=>{
    return renameFromSnapshot(root,file,offset,name,snapshot(root));
  });
}
/** Select a declared standalone function, or its qualified public input label,
 * without asking a human to calculate a UTF-16 offset. Selection and edits use
 * one checked snapshot; detected concurrent source changes reject planning. */
export function planChangeRenameSymbol(projectRoot:string,file:string,symbol:string,name:string):ChangeRenamePlan {
  const root=sourceChangeRoot(projectRoot),path=sourceChangePath(root,file),parts=symbol.split('.');
  if(parts.length>2||parts.some(part=>!/^[A-Za-z_]\w*$/.test(part)))throw new SourceChangeError('CHANGE_PLAN','Select FUNCTION or FUNCTION.INPUT in the selected source file.');
  return coherentSourceRead(root,()=>{
    const current=snapshot(root),checked=current.checked,definition=checked.project.scopes.get(path)?.get(parts[0]);
    if(!definition||definition.file!==path||definition.node.kind!=='function')throw new SourceChangeError('CHANGE_PLAN','Select a standalone function declared in this file.');
    const graph=current.graph,id=definition.id+(parts.length===2?'/input/'+parts[1]:'');
    const target=graph.symbols.find(item=>item.id===id);
    if(!target)throw new SourceChangeError('CHANGE_PLAN','The selected function has no public input label '+parts[1]+'.');
    return renameFromSnapshot(root,file,target.location.start,name,current);
  });
}
/** The author supplies a complete function source unit. Only its body is planned;
 * checked contracts are preserved and publication still requires a reviewed plan. */
export function planChangeReplaceBody(projectRoot:string,file:string,name:string,replacementSource:string):ChangeBodyPlan {
  const root=sourceChangeRoot(projectRoot),path=sourceChangePath(root,file);
  if(!/^[A-Za-z_]\w*$/.test(name))throw new SourceChangeError('CHANGE_PLAN','Select one standalone function name.');
  return coherentSourceRead(root,()=>{
    const current=snapshot(root),original=current.checked.project.files.get(path);
    if(original&&sourceImage(root,file,original.source).before!==original.source)throw new SourceChangeError('CHANGE_STALE','The selected source differs from the checked preimage. Retry planning.');
    const replacement=planBodyReplacement(current.checked,current.graph,path,name,replacementSource,current.revision);
    const edits=replacement.edits.map(edit=>({...edit,file:relative(root,edit.file).replaceAll('\\','/')}));
    const plan:ChangeBodyPlan={format:1,operation:'replace-body',baseRevision:current.revision,compiler:current.graph.compiler,file,name,replacementSource,
      symbol:replacement.symbol,scope:[...new Set(edits.map(edit=>edit.file))].sort(),sources:current.graph.sources,configuration:current.graph.configuration,
      edits,publicDelta:replacement.publicDelta,candidateRevision:'',dependencyMetadata:current.dependencies,coverage:current.graph.coverage,
      boundaries:current.graph.boundaries,checked:true,behavioralEvidence:'not-run'};
    plan.candidateRevision=revision(candidate(root,plan),current.graph.configuration).revision;
    if(snapshot(root).revision!==current.revision)throw new SourceChangeError('CHANGE_STALE','Source changed while planning the body replacement. Retry against stable inputs.');
    return plan;
  });
}

/** Add a selected missing capability and propagate its resolved requirement to
 * every checked caller. Provider selection and behavioral evidence stay explicit. */
export function planChangeDependency(projectRoot:string,file:string,symbolName:string,capability:string,name:string):ChangeDependencyPlan {
  const root=sourceChangeRoot(projectRoot),path=sourceChangePath(root,file);
  return coherentSourceRead(root,()=>{
    const current=snapshot(root),dependency=planDependencyEdits(current.checked,path,symbolName,capability,name);
    const edits=dependency.edits.map(edit=>({...edit,file:relative(root,edit.file).replaceAll('\\','/')}));
    const plan:ChangeDependencyPlan={format:1,operation:'add-dependency',baseRevision:current.revision,compiler:current.graph.compiler,
      file,name,symbolName,capability:dependency.capability,symbol:dependency.symbol,headers:dependency.headers,
      baseDiagnostics:current.checked.diagnostics.map(issue=>({...issue,file:relative(root,issue.file).replaceAll('\\','/')})),
      scope:[...new Set(edits.map(edit=>edit.file))].sort(),sources:current.graph.sources,configuration:current.graph.configuration,
      edits,publicDelta:dependency.publicDelta,candidateRevision:'',dependencyMetadata:current.dependencies,coverage:dependency.coverage,
      boundaries:dependency.boundaries,checked:true,behavioralEvidence:'not-run'};
    plan.candidateRevision=revision(candidate(root,plan),current.graph.configuration).revision;
    if(snapshot(root).revision!==current.revision)throw new SourceChangeError('CHANGE_STALE','Source changed while planning dependency propagation. Retry against stable inputs.');
    return plan;
  });
}

export function applyChangePlan(projectRoot:string,input:unknown,options:{checkpoint?:(event:SourceCheckpoint)=>void}={}) {
  const root=sourceChangeRoot(projectRoot),plan=input as ChangePlan;
  if(!plan||plan.format!==1||!['rename','replace-body','add-dependency'].includes(plan.operation)||typeof plan.file!=='string'||typeof plan.name!=='string'||
    (plan.operation==='rename'? !Number.isSafeInteger(plan.offset)||plan.offset<0:plan.operation==='replace-body'?typeof plan.replacementSource!=='string':typeof plan.capability!=='string'||typeof plan.symbolName!=='string')||
    !/^[a-f0-9]{64}$/.test(plan.baseRevision)||plan.checked!==true||plan.behavioralEvidence!=='not-run')throw new SourceChangeError('CHANGE_PLAN','Use a supported checked source plan. No source was written.');
  return withSourceWriter(root,()=>{
    const current=snapshot(root),before=current.checked,graph=current.graph;
    if(current.revision!==plan.baseRevision)throw new SourceChangeError('CHANGE_STALE','The source, compiler, configuration or dependency revision differs from the plan. Make and review a fresh plan. No source was written.');
    const regenerated=plan.operation==='rename'?planChangeRename(root,plan.file,plan.offset,plan.name):plan.operation==='replace-body'?planChangeReplaceBody(root,plan.file,plan.name,plan.replacementSource):planChangeDependency(root,plan.file,plan.symbolName,plan.capability,plan.name);
    // Compare the entire review packet: do not trust supplied edits, flags,
    // scope, source claims or public deltas merely because a plan says checked.
    const keys=Object.keys(regenerated).sort();
    if(Object.keys(plan).sort().join('\0')!==keys.join('\0')||keys.some(key=>JSON.stringify((plan as unknown as Record<string,unknown>)[key])!==JSON.stringify((regenerated as unknown as Record<string,unknown>)[key])))
      throw new SourceChangeError('CHANGE_PLAN','The operation, edit scope, candidate or expected public delta differs from the checked plan. Regenerate it and review the changes. No source was written.');
    options.checkpoint?.({phase:'validated'});
    const after=candidate(root,regenerated),candidateIdentity=revision(after),candidateRevision=candidateIdentity.revision;
    if(candidateRevision!==regenerated.candidateRevision||!candidateIdentity.graph.coverage.checkedProject)throw new SourceChangeError('CHANGE_STALE','The candidate differs from the reviewed revision. No source was written.');
    options.checkpoint?.({phase:'candidate-checked'});
    const images=regenerated.scope.map(file=>sourceImage(root,file,after.project.files.get(join(root,file))!.source));
    for(const image of images)if(image.beforeSha256!==digest(before.project.files.get(join(root,image.file))!.source))
      throw new SourceChangeError('CHANGE_STALE','The source preimage differs from the reviewed revision: '+image.file+'. No source was written.');
    let accepted:ReturnType<typeof publishSourceChange>;
    try {accepted=publishSourceChange(root,images,current.revision,candidateRevision,()=>{
      const written=checkedProjectWithTests(root,new Map()),actual=revision(written);
      if(!actual.graph.coverage.checkedProject||actual.revision!==candidateRevision)throw new SourceChangeError('CHANGE_STALE','Source or metadata changed before commit. The candidate cannot be accepted.');
      for(const image of images)if(digest(written.project.files.get(join(root,image.file))!.source)!==image.afterSha256)throw new SourceChangeError('CHANGE_STALE','A source postimage changed before commit.');
    },options.checkpoint);}catch(error){
      if(error instanceof SourceChangeError&&error.code==='CHANGE_COMMITTED_RECOVERY_REQUIRED')
        Object.assign(error,{baseRevision:current.revision,operation:regenerated.operation,...(regenerated.operation==='rename'?{identityMap:structuredClone(regenerated.identityMap)}:{})});
      throw error;
    }
    return {format:1,status:'committed' as const,operation:plan.operation,baseRevision:current.revision,revision:candidateRevision,transaction:accepted.transaction,scope:plan.scope,
      ...(regenerated.operation==='rename'?{identityMap:regenerated.identityMap}:{}),publicDelta:plan.publicDelta,checked:true as const,behavioralEvidence:'not-run' as const,review:'required' as const};
  });
}
export const recoverSourceChanges=recoverSourceJournal;
