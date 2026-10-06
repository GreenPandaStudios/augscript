import {relative} from 'node:path';
import type {ClassDecl,GenericHeader,MethodDecl,Param,Span} from './ast.ts';
import type {CheckedProject,MissingInjection} from './checker.ts';
import {importItems} from './editor.ts';
import {lex,reservedKeywords} from './lexer.ts';
import {applySourceEdits,checkedProjectWithTests,interfaceDelta,RefactoringError,type CheckedSourceEdit} from './refactoring.ts';
import {semanticGraph,type SemanticGraph} from './symbols.ts';
import {sameType,tyKey,tyName,type Ty} from './types.ts';

export interface DependencyHeader {symbol:string;file:string;name:string;type:string;typeIdentity:string}
export interface DependencyEdit {
  edits:CheckedSourceEdit[];symbol:string;capability:string;headers:DependencyHeader[];
  publicDelta:ReturnType<typeof interfaceDelta>;coverage:SemanticGraph['coverage'];boundaries:SemanticGraph['boundaries'];
}
export class DependencyEditError extends RefactoringError {
  code='CHANGE_DEPENDENCY';
  readonly stage:'base'|'candidate';readonly rejectedSources:{file:string;source:string}[];
  constructor(message:string,checked:CheckedProject,stage:'base'|'candidate') {
    super(message,checked.diagnostics);this.stage=stage;
    this.rejectedSources=[...checked.project.files.values()].filter(file=>!file.builtin&&!file.package)
      .map(file=>({file:relative(checked.project.root,file.path).replaceAll('\\','/'),source:file.source})).sort((a,b)=>compare(a.file,b.file));
  }
}
type Header={id:string;file:string;node:MethodDecl|ClassDecl;inputs:Param[];additions:{name:string;type:Ty}[]};
const compare=(left:string,right:string)=>left<right?-1:left>right?1:0;
const validName=(name:string)=>/^[A-Za-z_]\w*$/.test(name)&&!reservedKeywords.includes(name as typeof reservedKeywords[number]);
const failures=(checked:CheckedProject)=>checked.diagnostics.filter(issue=>issue.severity!=='warning');
const identity=(checked:CheckedProject,node:MethodDecl|ClassDecl)=>[...checked.project.definitions.values()].find(def=>def.node===node)?.id;
const missing=(checked:CheckedProject)=>[...checked.missingInjections.values()].flat();

/** Mechanical header edits preserve the resolved generic owner while source
 * offsets move. Export owner-based identities without absolute cache paths. */
function dependencyTypes(checked:CheckedProject):(type:Ty)=>Ty {
  const parameters=new Map<string,string>();
  const register=(header:GenericHeader&{span:Span},id:string,file:string)=>{
    for(const name of header.typeParams)parameters.set('param:'+file+':'+header.span.start+':'+name,'param:'+id+':'+name);
  };
  for(const definition of checked.project.definitions.values()){
    const node=definition.node;
    if('typeParams' in node)register(node,definition.id,definition.file);
    if('methods' in node)for(const method of node.methods)register(method,definition.id+'/method/'+method.name,definition.file);
  }
  const normalize=(type:Ty):Ty=>({...type,id:type.kind==='param'?(parameters.get(type.id)??type.id):type.id,args:type.args.map(normalize)});
  return normalize;
}

function headerFor(checked:CheckedProject,need:MissingInjection):{id:string;node:MethodDecl|ClassDecl} {
  // A class dependency belongs to its constructor, so ordinary interface method
  // signatures remain intact and every instance receives an explicit provider.
  const node=need.owner?.node.kind==='class'?need.owner.node:need.callable;
  const id=identity(checked,node);
  if(!id||node.kind==='function'&&(!node.body||node.forward||node.externC))
    throw new DependencyEditError('Dependency scaffolding needs an editable function or class header. Interface defaults and interceptor headers require an explicit contract decision.',checked,'candidate');
  const source=checked.project.files.get(node.span.file);
  if(!source||source.builtin||source.package)throw new DependencyEditError('The dependency reaches a read-only package. Edit and publish its source repository first.',checked,'candidate');
  return {id,node};
}
function selectedNeeds(checked:CheckedProject,file:string,symbol:string):MissingInjection[] {
  const parts=symbol.split('.'),def=checked.project.scopes.get(file)?.get(parts[0]);
  if(parts.length>2||parts.some(part=>!validName(part))||!def||def.file!==file)
    throw new DependencyEditError('Select FUNCTION, CLASS, or CLASS.METHOD declared in the selected file.',checked,'base');
  if(def.node.kind==='function'&&parts.length===1)return missing(checked).filter(need=>need.callable===def.node);
  if(def.node.kind==='class')return missing(checked).filter(need=>need.owner?.node===def.node&&(!parts[1]||need.callable.name===parts[1]));
  throw new DependencyEditError('Select a function or class with a resolved missing header dependency.',checked,'base');
}
function freshName(node:MethodDecl|ClassDecl,preferred:string,additional:string[]=[]):string {
  const names=new Set<string>(additional);
  const visit=(value:unknown):void=>{
    if(!value||typeof value!=='object')return;
    if(Array.isArray(value)){value.forEach(visit);return;}
    if('name' in value&&typeof value.name==='string')names.add(value.name);
    for(const [key,child] of Object.entries(value))if(key!=='span'&&!key.endsWith('Span'))visit(child);
  };
  visit(node);
  let name=preferred,index=2;while(names.has(name))name=preferred+index++;
  return name;
}
function editsFor(checked:CheckedProject,headers:Map<string,Header>):CheckedSourceEdit[] {
  const edits:CheckedSourceEdit[]=[],imports=new Map<string,Map<string,string>>();
  const render=(type:Ty,header:Header):string=>{
    if(type.kind==='error'||type.kind==='null')throw new DependencyEditError('A dependency type is unresolved. Supply its checked declaration before planning.',checked,'base');
    if(type.kind==='param'&&!header.node.typeParams.includes(type.name))
      throw new DependencyEditError('The dependency uses a type parameter outside the receiving header. Make the generic boundary explicit.',checked,'base');
    if(type.def) {
      const scope=checked.project.scopes.get(header.file),visible=scope?.get(type.name);
      if(visible&&visible.id!==type.def.id)throw new DependencyEditError('The imported dependency conflicts with another '+type.name+' in '+header.file+'. Rename that declaration explicitly first.',checked,'base');
      if(!visible) {
        const options=importItems(checked,checked.project.files.get(header.file)!).filter(item=>item.definitionId===type.def!.id);
        const declarations=[...new Set(options.map(item=>'import '+item.insertText))].sort();
        if(!declarations.length)throw new DependencyEditError('No legal public import for '+type.def.id+' from '+header.file+'. Export it explicitly first.',checked,'base');
        const added=imports.get(header.file)??new Map<string,string>();
        if(added.has(type.name)&&added.get(type.name)!==declarations[0])throw new DependencyEditError('Two distinct dependency types share '+type.name+'. Choose explicit nonconflicting public names.',checked,'base');
        added.set(type.name,declarations[0]);imports.set(header.file,added);
      }
    }
    return (type.optional||type.nullable?'optional ':'')+(type.immutable?'immutable ':'')+type.name+
      (type.args.length?'<'+type.args.map(arg=>render(arg,header)).join(', ')+'>':'');
  };
  for(const header of [...headers.values()].sort((a,b)=>compare(a.id,b.id))) {
    const source=checked.project.files.get(header.file)!,tokens=lex(header.file,source.source).tokens;
    const open=tokens.find(token=>token.kind==='('&&header.node.span.start<=token.span.start&&token.span.start<(header.node.headerEnd??header.node.span.end));
    if(!open)throw new DependencyEditError('The receiving declaration has no editable input list.',checked,'base');
    const text=header.additions.map(input=>'resolve '+render(input.type,header)+' '+input.name).join(', ')+(header.inputs.length?', ':'');
    edits.push({file:header.file,start:open.span.end,end:open.span.end,text});
  }
  for(const [file,added] of imports)edits.push({file,start:0,end:0,text:[...added.values()].sort().join('\n')+'\n'});
  return edits.sort((a,b)=>compare(a.file,b.file)||a.start-b.start);
}

/** Plan compiler-resolved dependency propagation. The body and every provider
 * remain author decisions; rejected candidates never write source. */
export function planDependencyEdits(checked:CheckedProject,file:string,symbol:string,capability:string,name?:string):DependencyEdit {
  if(name!==undefined&&!validName(name))throw new DependencyEditError('The dependency name must be an August identifier, not a keyword.',checked,'base');
  for(const source of checked.project.files.values())if(!source.builtin&&!source.package)for(const item of source.items) {
    if(!('name' in item)||!['class','function','interface','interceptor','resource','choice','composition'].includes(item.kind))continue;
    const declared=checked.project.scopes.get(source.path)?.get(item.name);
    if(declared?.file===source.path&&!checked.project.definitions.has(declared.id))
      throw new DependencyEditError('Dependency scaffolding requires whole-project analysis, not an import closure.',checked,'base');
  }
  const initial=failures(checked);
  if(initial.some(issue=>issue.code!=='DI'||!/^Declare a resolve .+ dependency in .+'s header$/.test(issue.message)))
    throw new DependencyEditError('Repair unrelated errors and explicitly select missing or ambiguous providers before scaffolding a header dependency.',checked,'base');
  const normalize=dependencyTypes(checked);
  const needs=selectedNeeds(checked,file,symbol).filter(need=>tyName(need.type)===capability||tyKey(need.type)===capability||tyKey(normalize(need.type))===capability);
  const types=[...new Map(needs.map(need=>[tyKey(need.type),need.type])).values()];
  if(types.length!==1)throw new DependencyEditError(types.length?'The capability spelling is ambiguous. Select its resolved type identity from context.':'The selected declaration has no missing '+capability+' dependency.',checked,'base');
  const type=types[0];
  if(type.def?.node.kind!=='interface'||!type.def.node.capability||type.optional||type.nullable)
    throw new DependencyEditError('Select a non-null capability interface required by a resolved call.',checked,'base');
  const root=headerFor(checked,needs[0]),headers=new Map<string,Header>();
  const requested=name??freshName(root.node,needs[0].parameter.name);
  const add=(current:CheckedProject,need:MissingInjection,rootName?:string):boolean=>{
    const target=headerFor(current,need),original=checked.project.definitions.get(target.id);
    if(!original||original.node.kind!=='class'&&original.node.kind!=='function')throw new DependencyEditError('A required header is outside the checked editable project.',current,'candidate');
    const node=original.node,header=headers.get(target.id)??{id:target.id,file:original.file,node,inputs:node.kind==='class'?node.fields:node.params,additions:[]};
    const type=dependencyTypes(current)(need.type);
    if(header.additions.some(input=>sameType(input.type,type)))return false;
    if(header.additions.length>=64||headers.size>=512)throw new DependencyEditError('Dependency propagation exceeds 512 headers or 64 inputs per header. Split the change into explicit module seams.',current,'candidate');
    const inputName=rootName??freshName(node,requested,header.additions.map(input=>input.name));
    if(freshName(node,inputName,header.additions.map(input=>input.name))!==inputName)
      throw new DependencyEditError('The proposed dependency name conflicts with an existing name in the declaration or body. Choose a fresh name to preserve resolved references.',current,'candidate');
    header.additions.push({name:inputName,type});headers.set(target.id,header);return true;
  };
  add(checked,needs[0],requested);
  let candidate=checked,edits:CheckedSourceEdit[]=[];
  for(let round=0;round<=512;round++) {
    edits=editsFor(checked,headers);
    const overrides=new Map([...checked.project.files.values()].filter(source=>!source.builtin&&!source.package).map(source=>[source.path,source.source]));
    for(const path of new Set(edits.map(edit=>edit.file)))overrides.set(path,applySourceEdits(overrides.get(path)!,edits.filter(edit=>edit.file===path)));
    candidate=checkedProjectWithTests(checked.project.root,overrides);
    let progress=false;
    for(const need of missing(candidate)) {
      const call=candidate.resolvedCalls.get(need.call),id=call&&identity(candidate,call.node),target=id&&headers.get(id);
      if(target&&target.additions.some(input=>input.name===need.parameter.name))progress=add(candidate,need)||progress;
    }
    if(progress)continue;
    if(failures(candidate).length)throw new DependencyEditError('The complete candidate still fails checking. Review its diagnostics; providers, public interface bounds, worker restrictions and recovery choices are not inferred.',candidate,'candidate');
    const graph=semanticGraph(candidate,true);
    if(!graph.coverage.checkedProject||graph.coverage.reverseCallers!=='complete')throw new DependencyEditError('Complete checked caller coverage is required before source edits.',candidate,'candidate');
    const normalize=dependencyTypes(candidate);
    for(const header of headers.values()) {
      const definition=candidate.project.definitions.get(header.id),inputs=definition?.node.kind==='class'?definition.node.fields:definition?.node.kind==='function'?definition.node.params:[];
      for(const added of header.additions) {
        const parameter=inputs.find(input=>input.name===added.name),actual=parameter&&candidate.parameterTypes.get(parameter);
        if(!actual||!sameType(normalize(actual),added.type))throw new DependencyEditError('A dependency import changed its resolved type identity in '+header.id+' input '+added.name+'. Expected '+tyKey(added.type)+'; found '+(actual?tyKey(actual):'unresolved')+'. Choose an unambiguous public boundary.',candidate,'candidate');
      }
    }
    return {symbol:root.id,capability:tyKey(dependencyTypes(checked)(type)),edits,headers:[...headers.values()].flatMap(header=>header.additions.map(input=>({symbol:header.id,file:relative(checked.project.root,header.file).replaceAll('\\','/'),name:input.name,type:tyName(input.type),typeIdentity:tyKey(input.type)}))),
      publicDelta:interfaceDelta(checked,candidate),coverage:graph.coverage,boundaries:graph.boundaries};
  }
  throw new DependencyEditError('Dependency propagation did not converge. Make the unsupported boundary explicit.',candidate,'candidate');
}
