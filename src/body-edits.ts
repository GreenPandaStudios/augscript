import {createHash} from 'node:crypto';
import type {Diagnostic,MethodDecl,SourceFile} from './ast.ts';
import type {CheckedProject} from './checker.ts';
import {parse} from './parser.ts';
import {lex} from './lexer.ts';
import {checkedChangeRevision} from './change-revisions.ts';
import {contractFacts} from './contract-facts.ts';
import {publicContract} from './public-contracts.ts';
import {semanticGraph,semanticSourcePath,type SemanticGraph} from './symbols.ts';
import {RefactoringError,requireManagedStandaloneEdit,checkedProjectWithTests,applySourceEdits,interfaceDelta,type CheckedSourceEdit} from './refactoring.ts';

export const sourceUnitLimit=1024*1024;
const digest=(source:string)=>createHash('sha256').update(source).digest('hex');

/** Rejections retain the captured base, supplied unit or edited candidate, never restored source
 * paired with diagnostics from a different program. No behavioral checks run. */
export class BodyEditError extends RefactoringError {
  override code:string;
  readonly stage:'base'|'source-unit'|'candidate';readonly baseRevision:string;readonly candidateRevision?:string;
  readonly sourceUnits:{file:string;source:string;sha256:string}[];
  readonly rejectedBase?:Pick<SemanticGraph,'compiler'|'sources'|'configuration'|'dependencies'|'coverage'|'boundaries'>;
  readonly rejectedCandidate?:Pick<SemanticGraph,'compiler'|'sources'|'configuration'|'dependencies'|'coverage'|'boundaries'>;
  constructor(message:string,baseRevision:string,stage:'base'|'source-unit'|'candidate',file:string,source:string|undefined,
    diagnostics:Diagnostic[]=[],candidate?:SemanticGraph) {
    super(message,diagnostics);this.code=stage==='base'?'CHANGE_BASE':stage==='candidate'?'CHANGE_CANDIDATE':'CHANGE_SOURCE_UNIT';this.stage=stage;this.baseRevision=baseRevision;
    this.sourceUnits=source===undefined?[]:[{file,source,sha256:digest(source)}];
    this.candidateRevision=stage==='candidate'&&candidate?checkedChangeRevision(candidate):undefined;
    if(candidate){
      const metadata={compiler:candidate.compiler,sources:candidate.sources,configuration:candidate.configuration,
        dependencies:candidate.dependencies,coverage:candidate.coverage,boundaries:candidate.boundaries};
      if(stage==='base')this.rejectedBase=metadata;else this.rejectedCandidate=metadata;
    }
  }
}
/** Coordinates change after a splice; every other syntax fact stays visible. */
function syntaxTree(value:unknown):unknown {
  return Array.isArray(value)?value.map(syntaxTree):value&&typeof value==='object'?
    Object.fromEntries(Object.entries(value).filter(([key])=>key!=='span'&&!key.endsWith('Span')&&key!=='argLabelSpans'&&key!=='headerEnd').map(([key,child])=>[key,syntaxTree(child)])):value;
}
function header(method:MethodDecl):unknown {
  const {body,...signature}=method;return syntaxTree(signature);
}
function enclosingSyntax(file:SourceFile,selected:MethodDecl):unknown {
  return file.items.map(item=>item===selected?header(selected):syntaxTree(item));
}
/** Layout dedents can reach the next declaration past its comments. Concrete
 * tokens and indented comments bound the body without consuming its neighbor. */
function bodyRange(method:MethodDecl,source:string) {
  const start=method.headerEnd!;
  if(source[start]==='{')return {start,end:method.span.end};
  const tokens=lex(method.span.file,source,true).tokens.filter(token=>start<=token.span.start&&token.span.end<=method.span.end&&
    !['indent','dedent','newline','eof'].includes(token.kind)&&(token.kind!=='comment'||token.span.column>method.span.column));
  return {start,end:tokens.reduce((end,token)=>Math.max(end,token.span.end),start)};
}
const diagnostics=(checked:CheckedProject)=>checked.diagnostics.map(issue=>({...issue,file:semanticSourcePath(checked,issue.file),
  ...(issue.related?{related:issue.related.map(site=>({...site,file:semanticSourcePath(checked,site.file)}))}:{})}));

/** One author-written source unit supplies implementation only. Imports, parsed
 * headers, neighboring source and checked public contracts remain bounded. */
export function planBodyReplacement(checked:CheckedProject,graph:SemanticGraph,file:string,name:string,source:string,baseRevision:string) {
  const original=checked.project.files.get(file),definition=checked.project.scopes.get(file)?.get(name);
  if(!graph.coverage.checkedProject||graph.coverage.reverseCallers!=='complete')throw new BodyEditError('Body replacement needs a checked whole project, including authored tests.',baseRevision,'base',semanticSourcePath(checked,file),original?.source,diagnostics(checked),graph);
  if(typeof source!=='string'||Buffer.byteLength(source,'utf8')>sourceUnitLimit||Buffer.from(source,'utf8').toString('utf8')!==source)throw new RefactoringError('The replacement source unit must be UTF-8 text of at most 1 MiB.');
  if(!original||original.builtin||original.package||!definition||definition.file!==file||definition.node.kind!=='function')
    throw new RefactoringError('Select a standalone implementation declared in an editable project source file.');
  const method=definition.node;requireManagedStandaloneEdit(checked,method);
  if(!method.body||method.headerEnd===undefined)throw new RefactoringError('Select a function with an implementation body.');
  const identity=semanticSourcePath(checked,file),unitIdentity='supplied-unit/'+identity,parsed=parse(unitIdentity,source);
  const rejectUnit=(message:string)=>{throw new BodyEditError(message,baseRevision,'source-unit',unitIdentity,source,
    parsed.diagnostics.map(issue=>({...issue,file:unitIdentity})));};
  if(parsed.diagnostics.some(issue=>issue.severity!=='warning'))rejectUnit('The replacement source unit does not parse. Supply one complete August function without Markdown fences.');
  if(parsed.file.items.length!==1||parsed.file.items[0].kind!=='function')rejectUnit('The replacement source unit must contain exactly one function, with no imports or other declarations.');
  const replacement=parsed.file.items[0] as MethodDecl;
  if(!replacement.body||replacement.headerEnd===undefined)rejectUnit('The replacement source unit requires an implementation body.');
  if(JSON.stringify(header(method))!==JSON.stringify(header(replacement)))rejectUnit('The replacement header must retain the selected function signature, including input storage names and declared contracts.');
  const beforeRange=bodyRange(method,original.source),afterRange=bodyRange(replacement,source);
  const edit:CheckedSourceEdit={file,...beforeRange,text:source.slice(afterRange.start,afterRange.end)};
  if(original.source.slice(edit.start,edit.end)===edit.text)throw new RefactoringError('The supplied body does not change the implementation source.');
  const edited=applySourceEdits(original.source,[edit]);
  const candidate=checkedProjectWithTests(checked.project.root,new Map([[file,edited]])),candidateGraph=semanticGraph(candidate,true),issues=diagnostics(candidate);
  const rejectCandidate=(message:string)=>{throw new BodyEditError(message,baseRevision,'candidate',identity,edited,issues,candidateGraph);};
  if(!candidateGraph.coverage.checkedProject)rejectCandidate('The replacement candidate does not check. No source was written.');
  const candidateFile=candidate.project.files.get(file),candidateMethod=candidate.project.scopes.get(file)?.get(name)?.node;
  if(!candidateFile||candidateMethod?.kind!=='function'||JSON.stringify(enclosingSyntax(original,method))!==JSON.stringify(enclosingSyntax(candidateFile,candidateMethod)))
    rejectCandidate('The replacement changes syntax outside the selected body, including a neighboring private declaration. Keep the enclosing source structure intact.');
  const beforeFacts=contractFacts(checked),afterFacts=contractFacts(candidate),beforeAll=new Map(beforeFacts.map(fact=>[fact.id,fact])),afterAll=new Map(afterFacts.map(fact=>[fact.id,fact]));
  const before=beforeAll.get(definition.id)!,after=afterAll.get(definition.id);
  if(!after||JSON.stringify(publicContract(checked,before,beforeAll))!==JSON.stringify(publicContract(candidate,after,afterAll)))
    rejectCandidate('The replacement changes the selected checked contract, including inferred promises of a private function. Review a separate contract change.');
  const publicDelta=interfaceDelta(checked,candidate);
  if(publicDelta.length)rejectCandidate('The replacement changes another public contract through inference. Review a separate contract change.');
  return {symbol:definition.id,edits:[edit],publicDelta,checked:true as const,behavioralEvidence:'not-run' as const};
}
