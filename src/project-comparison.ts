import {discoverTests} from './testing.ts';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {checkedProjectWithTests} from './refactoring.ts';
import {contractFacts} from './contract-facts.ts';
import {publicContract,contractDifferences} from './public-contracts.ts';
import {semanticGraph,semanticSourcePath,type SemanticGraph} from './symbols.ts';
import type {Diagnostic,Span} from './ast.ts';
import {declarationSourceSpan} from './ast.ts';
import type {CheckedProject} from './checker.ts';
const compare=(left:string,right:string)=>left<right?-1:left>right?1:0;
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');

function snapshot(checked:CheckedProject) {
  const graph=semanticGraph(checked,true),facts=contractFacts(checked),all=new Map(facts.map(fact=>[fact.id,fact]));
  const location=(span:Span)=>({...span,file:semanticSourcePath(checked,span.file)});
  const declarations=new Map(facts.filter(fact=>{
    if(!graph.coverage.checkedProject)return false;
    const file=checked.project.files.get(fact.location.file);return !file?.builtin&&!file?.package;
  }).map(fact=>{
    const node=checked.project.definitions.get(fact.id)!.node;
    const span=declarationSourceSpan(node),source=checked.project.files.get(fact.location.file)!.source.slice(span.start,span.end);
    return [fact.id,{id:fact.id,name:fact.name,location:location(fact.location),visibility:fact.visibility,
      contract:publicContract(checked,fact,all),sourceSha256:digest(source)}] as const;
  }));
  const diagnostics=checked.diagnostics.map((issue):Diagnostic=>({...issue,file:semanticSourcePath(checked,issue.file),
    ...(issue.related?{related:issue.related.map(item=>({...item,file:semanticSourcePath(checked,item.file)}))}:{})}));
  const tests=discoverTests(checked.project).tests.filter(unit=>{const file=checked.project.files.get(unit.file);return !file?.builtin&&!file?.package;}).map(unit=>({
    id:unit.id,subject:checked.project.scopes.get(unit.file)?.get(unit.suite.type.name)?.id??null,group:unit.group.name,name:unit.test.name,
    location:location(unit.test.span),origin:'author-supplied',independence:'not-assessed',execution:'not-run'
  }));
  return {graph,declarations,diagnostics,tests};
}
type Snapshot=ReturnType<typeof snapshot>;
/** Graph boundaries remain visible; consumers mean possible checked relationships,
 * not observed calls or an assertion that external implementations were examined. */
function consumers(graph:SemanticGraph,root:string) {
  const symbols=new Map(graph.symbols.map(symbol=>[symbol.id,symbol]));
  const belongs=(id:string,owner:string)=>id===owner||id.startsWith(owner+'/');
  const result:{symbol:string;relation:string;location:Span;via:string}[]=[],pending=[root],seen=new Set(pending),sites=new Set<string>();
  const include=(symbol:string,relation:string,location:Span,via:string)=>{
    if(symbol===root)return;
    const key=symbol+'\0'+relation+'\0'+location.file+'\0'+location.start+'\0'+via;
    if(!sites.has(key)){sites.add(key);result.push({symbol,relation,location,via});}
    if(!seen.has(symbol)){seen.add(symbol);pending.push(symbol);}
  };
  for(let index=0;index<pending.length;index++) {
    const target=pending[index];
    for(const edge of graph.relationships)if(belongs(edge.to,target))include(edge.from,edge.kind,edge.location,target);
    for(const occurrence of graph.occurrences)if(occurrence.caller&&belongs(occurrence.symbol,target)&&['type','read','write'].includes(occurrence.role))
      include(occurrence.caller,occurrence.role,{file:occurrence.file,start:occurrence.start,end:occurrence.end,line:occurrence.line,column:occurrence.column},target);
    // A changed member belongs to its declaration's contract; a consumer can
    // reference that enclosing type without naming the particular member.
    const owner=symbols.get(target)?.owner;if(owner&&!seen.has(owner)){seen.add(owner);pending.push(owner);}
  }
  return result.sort((a,b)=>compare(a.symbol,b.symbol)||compare(a.location.file,b.location.file)||a.location.start-b.location.start||compare(a.relation,b.relation)||compare(a.via,b.via));
}
function inputDifferences<T extends {file:string}>(before:T[],after:T[]) {
  const left=new Map(before.map(value=>[value.file,value])),right=new Map(after.map(value=>[value.file,value]));
  return [...new Set([...left.keys(),...right.keys()])].sort(compare).flatMap(file=>JSON.stringify(left.get(file))===JSON.stringify(right.get(file))?[]:[{file,before:left.get(file)??null,after:right.get(file)??null}]);
}
function compareSnapshots(before:Snapshot,after:Snapshot) {
  const accepted=before.graph.coverage.checkedProject&&after.graph.coverage.checkedProject;
  const envelope=(value:Snapshot)=>({revision:value.graph.revision,compiler:value.graph.compiler,coverage:value.graph.coverage,
    sources:value.graph.sources,configuration:value.graph.configuration,dependencies:value.graph.dependencies,boundaries:value.graph.boundaries,diagnostics:value.diagnostics,tests:value.tests});
  const changes=accepted?[...new Set([...before.declarations.keys(),...after.declarations.keys()])].sort(compare).flatMap(id=>{
    const left=before.declarations.get(id),right=after.declarations.get(id),differences=contractDifferences(left?.contract,right?.contract);
    const categories=[...(differences.length?['contract']:[]),...(left?.sourceSha256!==right?.sourceSha256?['source']:[]),
      ...(JSON.stringify(left?.visibility)!==JSON.stringify(right?.visibility)?['visibility']:[])];
    if(!categories.length)return [];
    return [{id,kind:!left?'added':!right?'removed':'changed',categories,before:left??null,after:right??null,contractDifferences:differences,
      impact:{before:consumers(before.graph,id),after:consumers(after.graph,id)}}];
  }):[];
  return {schema:1,status:accepted?'compared':'rejected',ordering:'declaration-id,file-offset-relation',before:envelope(before),after:envelope(after),changes,
    sourceChanges:inputDifferences(before.graph.sources,after.graph.sources),configurationChanges:inputDifferences(before.graph.configuration,after.graph.configuration),
    dependencyChanges:inputDifferences(before.graph.dependencies,after.graph.dependencies),
    evidence:{compiler:accepted?'accepted':'rejected',behavior:'not-run',tests:'source-only',externalConsumers:'outside-project',correspondence:'exact-identities-only'}};
}
/** Compiler-internal comparison of whole projects already checked with authored
 * tests. This entry writes nothing; source-loading clients use projectComparison. */
export function compareCheckedProjects(before:CheckedProject,after:CheckedProject) {return structuredClone(compareSnapshots(snapshot(before),snapshot(after)));}

/** Local CLI entry. Repeat capture detects changing semantic inputs; it does not
 * promise atomic observation of uncoordinated external writers or ABA changes. */
export function projectComparison(beforeDirectory:string,afterDirectory:string) {
  const capture=(directory:string)=>{
    const first=snapshot(checkedProjectWithTests(resolve(directory),new Map())),second=snapshot(checkedProjectWithTests(resolve(directory),new Map()));
    const fingerprint=(value:Snapshot)=>JSON.stringify({graph:value.graph,contracts:[...value.declarations],diagnostics:value.diagnostics});
    if(fingerprint(first)!==fingerprint(second))throw new Error('PROJECT_COMPARE_STALE: Inputs changed during checking; retry with stable local source and dependency metadata.');
    return first;
  };
  return compareSnapshots(capture(beforeDirectory),capture(afterDirectory));
}
