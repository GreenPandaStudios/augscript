import {createHash} from 'node:crypto';
import type {CheckedProject} from './checker.ts';
import {checkProject} from './checker.ts';
import {loadProject} from './project.ts';
import {checkUnitTests,discoverTests,mergeTestAnalysis,uniqueDiagnostics} from './testing.ts';
import {semanticGraph,occurrencesAt,semanticSourcePath,type SemanticGraph} from './symbols.ts';
import {recordBindingFieldAt} from './binding-patterns.ts';
import {reservedKeywords} from './lexer.ts';
import {contractFacts} from './contract-facts.ts';
import {publicContract} from './public-contracts.ts';
import {javadocParameterSpans} from './javadoc.ts';
import type {MethodDecl} from './ast.ts';

export interface CheckedSourceEdit {file:string; start:number; end:number; text:string}
export interface IdentityMapping {before:string;after:string}
export interface InterfaceDelta {id:string; before:string|null; after:string|null}
export interface RenamePlan {format:1; operation:'rename'; revision:string; symbol:string; name:string;
  scope:string[]; sources:{file:string;sha256:string}[]; identityMap:IdentityMapping[]; edits:CheckedSourceEdit[]; publicDelta:InterfaceDelta[]; checked:true; behavioralEvidence:'not-run'}
export class RefactoringError extends Error {code='REFACTOR'; readonly diagnostics:unknown[]; constructor(message:string,diagnostics:unknown[]=[]){super(message);this.diagnostics=diagnostics;}}

export function checkedProjectWithTests(root:string,overrides:Map<string,string>,project=loadProject(root,overrides)) {
  const checked=checkProject(project),discovered=discoverTests(project),tests=checkUnitTests(project,discovered.tests);
  checked.diagnostics=uniqueDiagnostics([...checked.diagnostics,...discovered.diagnostics,...tests.flatMap(test=>test.checked.diagnostics)]);
  mergeTestAnalysis(checked,tests);return checked;
}
function publicShapes(checked:CheckedProject) {
  const facts=contractFacts(checked),all=new Map(facts.map(fact=>[fact.id,fact]));
  return new Map(facts.filter(fact=>fact.public).map(fact=>[fact.id,
    createHash('sha256').update(JSON.stringify(publicContract(checked,fact,all))).digest('hex')]));
}
export function interfaceDelta(before:CheckedProject,after:CheckedProject):InterfaceDelta[] {
  const left=publicShapes(before),right=publicShapes(after);
  return [...new Set([...left.keys(),...right.keys()])].sort().flatMap(id=>left.get(id)===right.get(id)?[]:[{id,before:left.get(id)??null,after:right.get(id)??null}]);
}

/** Apply resolved, disjoint source edits without changing neighboring layout. */
export function applySourceEdits(source:string,edits:readonly Pick<CheckedSourceEdit,'start'|'end'|'text'>[]):string {
  let result=source,boundary=source.length;
  for(const edit of [...edits].sort((a,b)=>b.start-a.start)) {
    if(!Number.isSafeInteger(edit.start)||!Number.isSafeInteger(edit.end)||edit.start<0||edit.end<edit.start||edit.end>boundary||typeof edit.text!=='string')
      throw new RefactoringError('Source edits must be resolved, bounded and disjoint. No source was written.');
    result=result.slice(0,edit.start)+edit.text+result.slice(edit.end);boundary=edit.start;
  }
  return result;
}
/** Shared supported signature; this does not certify implementation behavior. */
export function requireManagedStandaloneEdit(checked:CheckedProject,fn:MethodDecl):void {
  const effects=checked.effectContracts.get(fn);
  if(fn.externC||fn.endpoint||fn.annotations?.length||fn.typeParams.length||fn.returnOwnership==='own'||fn.params.some(param=>param.injected||param.ownership!=='managed')||effects?.uses.size||effects?.changes.length)
    throw new RefactoringError('This checked edit profile requires a managed standalone function without native linkage, injection, generics, effects, mutation, endpoints, or interceptors.');
}
/** Plan a narrow mechanical edit. The caller owns approval and publication; this function writes nothing. */
export function planRename(checked:CheckedProject,graph:SemanticGraph,file:string,offset:number,name:string):RenamePlan {
  if(!graph.coverage.checkedProject||graph.coverage.reverseCallers!=='complete')throw new RefactoringError('Rename needs a checked whole project and complete caller enumeration. Repair project errors and retry.');
  if(!/^[A-Za-z_]\w*$/.test(name)||reservedKeywords.includes(name as typeof reservedKeywords[number]))throw new RefactoringError('The new name must be an August identifier, not a reserved keyword.');
  const references=occurrencesAt(graph,semanticSourcePath(checked,file),offset),selected=references[0];
  if(!selected)throw new RefactoringError('Select a resolved declaration or reference to rename.');
  const symbol=graph.symbols.find(symbol=>symbol.id===selected.symbol)!;
  if(name===symbol.name)throw new RefactoringError('The declaration already has that name.');
  if(!symbol.editable)throw new RefactoringError('Installed packages and the standard library are read only. Change the package source repository.');
  const ownerId=symbol.owner??symbol.id,owner=checked.project.definitions.get(ownerId.split('/method/')[0]);
  if(symbol.kind==='method'||owner&&owner.node.kind!=='function')throw new RefactoringError('This rename profile supports standalone functions and their local inputs and variables. Member and type edits require implementation coverage.');
  if(owner?.node.kind==='function') {
    requireManagedStandaloneEdit(checked,owner.node);
  }
  const fileByIdentity=new Map([...checked.project.files.keys()].map(path=>[semanticSourcePath(checked,path),path]));
  const edits:CheckedSourceEdit[]=[],seen=new Set<string>();
  for(const reference of references) {
    const path=fileByIdentity.get(reference.file);
    if(!path||checked.project.files.get(path)?.builtin||checked.project.files.get(path)?.package)throw new RefactoringError('The edit reaches a read-only source unit.');
    const key=`${reference.file}:${reference.start}:${reference.end}`;if(seen.has(key))continue;seen.add(key);
    const same=graph.occurrences.filter(item=>item.file===reference.file&&item.start===reference.start&&item.end===reference.end);
    const label=same.find(item=>item.role==='shorthand-label'),value=same.find(item=>item.role==='read');
    let text=name;
    if(label&&value&&label.symbol!==value.symbol)text=label.symbol===symbol.id?name+'='+checked.project.files.get(path)!.source.slice(reference.start,reference.end):
      checked.project.files.get(path)!.source.slice(reference.start,reference.end)+'='+name;
    const field=recordBindingFieldAt(checked,path,reference.start);
    if(field?.shorthand&&reference.role==='declaration')text=field.field.name+': '+name;
    edits.push({file:path,start:reference.start,end:reference.end,text});
  }
  if(symbol.kind==='parameter'&&owner?.node.kind==='function') {
    const source=checked.project.files.get(owner.file)!.source;
    for(const tag of javadocParameterSpans(source,owner.node.span.start).filter(tag=>tag.name===symbol.name))
      edits.push({file:owner.file,start:tag.start,end:tag.end,text:name});
  }
  edits.sort((a,b)=>(a.file<b.file?-1:a.file>b.file?1:0)||a.start-b.start);
  const overrides=new Map([...checked.project.files.values()].filter(source=>!source.builtin&&!source.package).map(source=>[source.path,source.source]));
  for(const path of new Set(edits.map(edit=>edit.file))) {
    overrides.set(path,applySourceEdits(overrides.get(path)!,edits.filter(edit=>edit.file===path)));
  }
  const candidate=checkedProjectWithTests(checked.project.root,overrides),errors=candidate.diagnostics.filter(issue=>issue.severity!=='warning');
  if(errors.length)throw new RefactoringError('The renamed candidate does not check. No source was written.',errors);
  const after=semanticGraph(candidate,true);
  const identityMap=verifyRenameBindings(graph,after,edits.map(edit=>({...edit,file:semanticSourcePath(checked,edit.file)})),symbol.id,name);
  return {format:1,operation:'rename',revision:graph.revision,symbol:symbol.id,name,scope:[...new Set(edits.map(edit=>semanticSourcePath(checked,edit.file)))],
    sources:[...checked.project.files.values()].filter(source=>!source.builtin&&!source.package).map(source=>({file:source.path,sha256:createHash('sha256').update(source.source).digest('hex')})),
    identityMap,edits,publicDelta:interfaceDelta(checked,candidate),checked:true,behavioralEvidence:'not-run'};
}
/** A compiling candidate can still capture a name. Preserve declaration and
 * occurrence bindings across the source-coordinate changes, including expanded
 * shorthand labels, before returning any identity correspondence. The selected
 * identity and changed coordinate/owner-derived identities come from this check. */
function verifyRenameBindings(before:SemanticGraph,after:SemanticGraph,edits:CheckedSourceEdit[],renamed:string,name:string) {
  const translated=(file:string,start:number,end:number)=>{
    let shift=0;
    for(const edit of edits.filter(edit=>edit.file===file).sort((a,b)=>a.start-b.start)) {
      if(edit.end<=start)shift+=edit.text.length-(edit.end-edit.start);
      else if(edit.start<=start&&end<=edit.end)return {start:edit.start+shift,end:edit.start+shift+edit.text.length};
    }
    return {start:start+shift,end:end+shift};
  };
  const identities=new Map<string,string>();
  for(const symbol of before.symbols) {
    const position=translated(symbol.location.file,symbol.location.start,symbol.location.end),expected=symbol.id===renamed?name:symbol.name;
    const matches=after.symbols.filter(item=>item.kind===symbol.kind&&item.name===expected&&item.location.file===symbol.location.file&&
      position.start<=item.location.start&&item.location.end<=position.end);
    if(matches.length!==1)throw new RefactoringError(`Rename collision: declaration ${symbol.name} would lose its binding identity. No source was written.`);
    identities.set(symbol.id,matches[0].id);
  }
  const role=(value:string)=>value==='shorthand-label'?'argument-label':value;
  for(const occurrence of before.occurrences) {
    const position=translated(occurrence.file,occurrence.start,occurrence.end),identity=identities.get(occurrence.symbol);
    if(!after.occurrences.some(item=>item.file===occurrence.file&&item.symbol===identity&&role(item.role)===role(occurrence.role)&&
      position.start<=item.start&&item.end<=position.end))
      throw new RefactoringError('Rename collision: a resolved occurrence would change its binding. No source was written.');
  }
  return [...identities].filter(([before,after])=>before===renamed||before!==after)
    .sort(([a],[b])=>a<b?-1:a>b?1:0).map(([before,after])=>({before,after}));
}
