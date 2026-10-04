import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import type { Expr, MethodDecl, Param, Span, TypeRef } from './ast.ts';
import { initializationOf, typeName } from './ast.ts';
import { checkProject, type CheckedProject } from './checker.ts';
import { builtinFunctions, builtinTypes, collectionOperations } from './builtins.ts';
import { loadProject, type Definition, type Project } from './project.ts';
import { compilerVersion } from './package-manager.ts';
import { libraryChild, libraryRelative } from './libraries.ts';
import { checkUnitTests, discoverTests, mergeTestAnalysis, uniqueDiagnostics } from './testing.ts';
import { tyName, type Ty } from './types.ts';
import {finishSourceRead,type SourcePermit} from './source-transaction.ts';
import {forwardingProvenance} from './forwarding.ts';

export const CHANGE_SCHEMA = 'august.checked-change/1';
export const ORDERING = 'root first; dependencies and callers by identity; occurrences by file and offset';
export const digest = (value: string): string => createHash('sha256').update(value).digest('hex');
export function canonical(value: unknown): string {
  const ordered = (value: any): any => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object' ?
    Object.fromEntries(Object.keys(value).sort().filter(key => value[key] !== undefined).map(key => [key, ordered(value[key])])) : value;
  return JSON.stringify(ordered(value));
}
export interface SourceLocation { file: string; start: number; end: number; line: number; column: number }
export interface ResolvedType { id: string; name: string; arguments: ResolvedType[]; optional: boolean }
export interface Revision {
  schema: typeof CHANGE_SCHEMA; compiler: string;compilerBuild:string; revision: string;
  sources: {file: string; digest: string}[]; configuration: string; dependencies: string;
}
export interface SymbolFact {
  id: string; name: string; kind: string; location: SourceLocation; public: boolean;
  owner?: string; contract?: Record<string, unknown>; source?: string;
  forwarding?:ReturnType<typeof forwardingProvenance>;
}
export interface Occurrence {
  symbol: string; role: 'declaration' | 'reference' | 'import' | 'export' | 'type' | 'label' | 'test';
  location: SourceLocation; caller?: string;
}
export interface Relationship {
  from: string; to: string;
  kind: 'call' | 'reference' | 'member' | 'implementation' | 'import' | 'export' | 'forward' | 'injection' | 'interceptor' | 'delegation' | 'test' | 'type';
  location: SourceLocation;
}
export interface Boundary { caller: string; kind: string; location: SourceLocation; reason: string }
export interface SemanticGraph {
  symbols: SymbolFact[]; occurrences: Occurrence[]; relationships: Relationship[]; boundaries: Boundary[];
}

/** Check every loaded source and every same-file test, never an import-only editor closure. */
export function analyzeChangeProject(root: string, overrides = new Map<string, string>(),permit?:SourcePermit): CheckedProject {
  const project = loadProject(root, overrides,undefined,permit), checked = checkProject(project), discovery = discoverTests(project);
  const tests = checkUnitTests(project, discovery.tests);
  checked.diagnostics = uniqueDiagnostics([...checked.diagnostics, ...discovery.diagnostics, ...tests.flatMap(test => test.checked.diagnostics)]);
  mergeTestAnalysis(checked, tests);
  return checked;
}

export function sourceIdentity(project: Project, path: string): string {
  const file = project.files.get(path);
  if (file?.builtin) return `august:${libraryRelative(project.libraries, path).replaceAll('\\', '/')}`;
  const scope = file?.package && project.packages.scopes.get(file.package);
  if (scope) return `package:${scope.name}@${scope.version}/${relative(scope.sourceRoot, path).replaceAll('\\', '/')}`;
  const name = relative(project.root, path).replaceAll('\\', '/');
  if (name === '..' || name.startsWith('../')) throw new Error('Source outside the checked project has no package identity');
  return name;
}
export function location(project: Project, span: Span): SourceLocation { return {...span, file: sourceIdentity(project, span.file)}; }
function stableId(project: Project, id: string): string {
  for (const file of project.files.keys()) if (id.includes(file)) id = id.replaceAll(file, sourceIdentity(project, file));
  return id.replaceAll('\\', '/');
}
export function resolvedType(project: Project, type: Ty): ResolvedType {
  let id=stableId(project,type.id);
  if(type.kind==='param')for(const definition of project.definitions.values()){
    const node=definition.node,headers=node.kind==='function'?[{node,id:definition.id}]:[{node,id:definition.id},...('methods' in node?node.methods.map(method=>({node:method,id:`${definition.id}::${method.name}`})):[])];
    const header=headers.find(header=>type.id===`param:${definition.file}:${header.node.span.start}:${type.name}`&&header.node.typeParams.some(name=>name===type.name));
    if(header){id=`${header.id}::generic:${type.name}`;break;}
  }
  return {id, name: tyName(type), arguments: type.args.map(arg => resolvedType(project, arg)), optional: !!type.nullable || !!type.optional};
}
function referenceType(project: Project, ref: TypeRef, owner: Definition): ResolvedType {
  const def = ref.definitionId?project.definitions.get(ref.definitionId):project.scopes.get(ref.span.file)?.get(ref.name);
  const method='methods' in owner.node?owner.node.methods.find(method=>method.span.start<=ref.span.start&&ref.span.end<=method.span.end&&method.typeParams.includes(ref.name)):undefined;
  const generic=method?`${owner.id}::${method.name}::generic:${ref.name}`:owner.node.typeParams.some(name=>name===ref.name)?`${owner.id}::generic:${ref.name}`:undefined;
  return {id: def?.id ?? generic ?? (ref.name in builtinTypes?`builtin:${ref.name}`:`unresolved:${ref.name}`),
    name: typeName(ref), arguments: ref.args.map(arg => referenceType(project, arg, owner)), optional: !!ref.nullable || !!ref.optional};
}
export function callableIdentity(definition: Definition, method: MethodDecl): string {
  return definition.node.kind === 'function' ? definition.id : `${definition.id}::${method.name}`;
}

/** Content identity includes newly discovered files, absent config files, and dependency locks. */
export function projectRevision(project: Project): Revision {
  if(project.sourceRead)finishSourceRead(project.root,project.sourceRead.epoch,project.sourceRead.permit);
  const sources = [...project.files].map(([path, file]) => ({file: sourceIdentity(project, path), digest: digest(file.source)})).sort((a,b) => a.file.localeCompare(b.file));
  const bytes = (path: string) => existsSync(path) ? digest(readFileSync(path, 'utf8')) : null;
  const configuration = digest(canonical(['main.yaml', 'aug-package.json'].map(file => [file, bytes(join(project.root, file))])));
  const dependencies = digest(canonical({lock: bytes(join(project.root, 'aug.lock.json')),
    packages: [...project.packages.scopes.values()].map(scope => ({name:scope.name, version:scope.version, digest:scope.digest,
      dependencies:scope.dependencies, manifest:bytes(join(scope.directory,'aug-package.json')), config:bytes(join(scope.directory,'main.yaml'))})).sort((a,b) => canonical(a).localeCompare(canonical(b)))}));
  if(project.sourceRead)finishSourceRead(project.root,project.sourceRead.epoch,project.sourceRead.permit);
  const values = {schema: CHANGE_SCHEMA as typeof CHANGE_SCHEMA, compiler:compilerVersion(),compilerBuild:compilerBuild(), sources, configuration, dependencies};
  return {...values, revision:digest(canonical(values))};
}
let buildIdentity:string|undefined;
/** Unreleased builds with the same package version cannot exchange stale compiler plans. */
function compilerBuild(){
  if(buildIdentity)return buildIdentity;
  const root=new URL('../',import.meta.url),files:{file:string;digest:string}[]=[];
  const walk=(path:string)=>{const folder=new URL(path+'/',root);if(!existsSync(folder))return;
    for(const entry of readdirSync(folder,{withFileTypes:true})){const name=path+'/'+entry.name;
      if(entry.isDirectory()&&entry.name!=='stdlib')walk(name);
      else if(entry.isFile()&&/\.(?:ts|js|mjs|c|h|json)$/.test(entry.name))files.push({file:name,digest:digest(readFileSync(new URL(name,root),'utf8'))});}};
  for(const path of ['src','runtime'])walk(path);
  buildIdentity=digest(canonical(files.sort((a,b)=>a.file.localeCompare(b.file))));return buildIdentity;
}

export function semanticGraph(checked: CheckedProject): SemanticGraph {
  const project = checked.project, symbols = new Map<string, SymbolFact>(), occurrences: Occurrence[] = [], relationships: Relationship[] = [], boundaries: Boundary[] = [];
  const tokens = new Map([...project.files].map(([path,file]) => [path, lexTokens(path,file.source)]));
  const parameterIds=new Map<Param,string>();
  const atName = (span: Span, name: string, last = false): Span => {
    const matches = tokens.get(span.file)?.filter(token => token.value === name && token.span.start >= span.start && token.span.end <= span.end) ?? [];
    return (last ? matches.at(-1) : matches[0])?.span ?? span;
  };
  const occurrence = (symbol: string, role: Occurrence['role'], span: Span, caller?: string) => occurrences.push({symbol,role,location:location(project,span),caller});
  const edge = (from: string, to: string, kind: Relationship['kind'], span: Span) => relationships.push({from,to,kind,location:location(project,span)});
  const addTypes = (from: string, type: ResolvedType, span: Span) => {
    edge(from,type.id,'type',span);
    if (!symbols.has(type.id) && type.id.startsWith('builtin:')) symbols.set(type.id,{id:type.id,name:type.name,kind:'intrinsic-type',public:true,location:location(project,span),contract:{name:type.name}});
    type.arguments.forEach(arg => addTypes(from,arg,span));
  };
  const parameter = (owner: Definition, id: string, param: Param) => {
    const type = checked.parameterTypes.get(param), fact = type ? resolvedType(project,type) : referenceType(project,param.type,owner);
    const label = param.label ?? param.name, identity = `${id}::parameter:${label}`;
    parameterIds.set(param,identity);
    const required=!param.injected&&!fact.optional;
    symbols.set(identity,{id:identity,name:param.name,kind:'parameter',public:false,owner:id,location:location(project,atName(param.span,param.name,true)),
      contract:{label,type:fact,ownership:param.ownership,injected:param.injected,required}});
    if(!(owner.node.kind==='function'&&owner.node.forward))occurrence(identity,'declaration',atName(param.span,param.name,true),id);
    edge(id,identity,'member',param.span);addTypes(id,fact,param.type.span);
    if (param.injected) edge(id,fact.id,'injection',param.span);
    return {id:identity,label,type:fact,ownership:param.ownership,injected:param.injected,required};
  };
  const callable = (owner: Definition, method: MethodDecl) => {
    const id = callableIdentity(owner,method), contract = checked.callableContracts.get(method), effects = checked.effectContracts.get(method);
    const errors = [...(contract?.errors ?? []), ...(checked.interceptorPlans.get(method) ?? []).flatMap(layer=>layer.errors)];
    const inputs = method.params.map(param=>parameter(owner,id,param));
    const result = contract ? resolvedType(project,contract.result) : referenceType(project,method.returns,owner);
    const inherited=forwardingProvenance(project,method);
    const fact: SymbolFact = {id,name:method.name,kind:method.forward?'forward':owner.node.kind === 'function'?'function':'method',owner:owner.node.kind==='function'?undefined:owner.id,
      public:!method.name.startsWith('_'),location:location(project,method.span),source:project.files.get(method.span.file)?.source.slice(method.span.start,method.span.end),
      contract:{inputs,result,returnOwnership:method.returnOwnership,errors:[...new Map(errors.map(type=>[type.id,resolvedType(project,type)])).values()].sort((a,b)=>a.id.localeCompare(b.id)),
        capabilities:[...(effects?.uses.entries()??[])].map(([key,effect])=>({id:stableId(project,key),source:effect.source,operation:effect.operation})).sort((a,b)=>canonical(a).localeCompare(canonical(b))),
        changes:[...(effects?.changes??[])].sort(),generics:method.typeParams,endpoint:method.endpoint,externC:method.externC,
        provenance:{inputs:inherited?'inherited':'declared',result:inherited?'inherited':contract?.inferredResult?'inferred':'declared',errors:inherited?'inherited':contract?.inferredErrors?'inferred':'declared',effects:inherited?'inherited':effects?.inferred?'inferred':'declared'}},
      forwarding:inherited?{...inherited,immediate:inherited.immediate?{...inherited.immediate,location:location(project,inherited.immediate.location)}:undefined,
        implementation:inherited.implementation?{...inherited.implementation,location:location(project,inherited.implementation.location)}:undefined}:undefined};
    symbols.set(id,fact); occurrence(id,'declaration',atName(method.span,method.name)); addTypes(id,result,method.returns.span);
    for (const type of errors) addTypes(id,resolvedType(project,type),method.span);
    if (owner.node.kind !== 'function') edge(owner.id,id,'member',method.span);
    for (const layer of checked.interceptorPlans.get(method) ?? []) {
      edge(id,`${layer.definition.id}::around`,'interceptor',layer.annotation.span);
      edge(`${layer.definition.id}::around`,id,'delegation',layer.annotation.span);
    }
  };
  const generics=(owner:Definition,header:import('./ast.ts').GenericHeader,id:string,span:Span)=>header.typeParams.map(name=>{
    const identity=`${id}::generic:${name}`,bounds=(header.typeConstraints?.[name]??[]).map(ref=>referenceType(project,ref,owner)),variance=header.typeVariance?.[name]??'invariant';
    symbols.set(identity,{id:identity,name,kind:'type-parameter',public:false,owner:id,location:location(project,atName(span,name)),contract:{variance,bounds}});
    edge(id,identity,'member',span);bounds.forEach(type=>addTypes(identity,type,span));return {name,variance,bounds};
  });
  for (const definition of project.definitions.values()) {
    const node = definition.node;
    const genericContracts=generics(definition,node,definition.id,node.span);
    if (node.kind === 'function') callable(definition,node);
    else {
      symbols.set(definition.id,{id:definition.id,name:definition.name,kind:node.kind,public:!node.name.startsWith('_'),location:location(project,node.span),
        contract:{generics:node.typeParams,genericContracts,fields:'fields' in node?node.fields.filter(param=>!param.name.startsWith('_')).map(param=>({label:param.label??param.name,type:referenceType(project,param.type,definition),ownership:param.ownership,injected:param.injected})):[]}});
      occurrence(definition.id,'declaration',atName(node.span,node.name));
      if ('methods' in node) node.methods.forEach(method=>{callable(definition,method);symbols.get(callableIdentity(definition,method))!.contract!.genericContracts=generics(definition,method,callableIdentity(definition,method),method.span);});
      if (node.kind === 'class') {
        const id = `${definition.id}::constructor`, contract = checked.constructorContracts.get(node);
        symbols.set(id,{id,name:node.name,kind:'constructor',public:true,owner:definition.id,location:location(project,node.span),contract:{inputs:node.fields.map(param=>parameter(definition,id,param)),
          result:{id:definition.id,name:node.name,arguments:[],optional:false},errors:contract?.errors.map(type=>resolvedType(project,type))??[]}});
        edge(definition.id,id,'member',node.span);
        for (const ref of node.implements) {const type=referenceType(project,ref,definition);addTypes(definition.id,type,ref.span);edge(definition.id,type.id,'implementation',ref.span);}
      }
    }
    if(node.kind==='function')symbols.get(definition.id)!.contract!.genericContracts=genericContracts;
  }
  const visit = (value: unknown, caller: string, file: string): void => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {value.forEach(item=>visit(item,caller,file));return;}
    const expr = value as Expr;
    const reference=value as TypeRef;
    if(typeof reference.name==='string'&&Array.isArray(reference.args)&&typeof reference.nullable==='boolean'&&reference.span){
      const owner=project.definitions.get(caller)??[...project.definitions.values()].find(definition=>caller.startsWith(definition.id+'::'));
      const definition=reference.definitionId?project.definitions.get(reference.definitionId):project.scopes.get(file)?.get(reference.name);
      const type=owner?referenceType(project,reference,owner):{id:definition?.id??(reference.name in builtinTypes?`builtin:${reference.name}`:`unresolved:${reference.name}`),name:typeName(reference),arguments:[],optional:!!reference.optional||!!reference.nullable};
      addTypes(caller,type,reference.span);const span=atName(reference.span,reference.name);
      if(project.files.get(span.file)?.source.slice(span.start,span.end)===reference.name)occurrence(type.id,'type',span,caller);
    }
    if(expr.kind==='name'){
      const resolved=checked.resolvedNames.get(expr),id=resolved?.definition?.id??(resolved?.parameter?parameterIds.get(resolved.parameter):undefined);
      if(id)occurrence(id,'reference',expr.span,caller);
      if(resolved?.definition?.node.kind==='function'){edge(caller,resolved.definition.id,'reference',expr.span);boundaries.push({caller,kind:'function-value',location:location(project,expr.span),reason:'A function used as a value has no supported direct-call edge in this edit profile.'});}
    }
    if (expr.kind === 'call') {
      const target = checked.callPlans.get(expr)?.target;
      if (target) {
        edge(caller,target.id,'call',expr.span);
        occurrence(target.id,'reference',expr.callee.kind==='member'?atName(expr.callee.span,expr.callee.name,true):expr.callee.span,caller);
        if (target.dispatch === 'interface') boundaries.push({caller,kind:'interface-dispatch',location:location(project,expr.span),reason:'Runtime implementers outside the checked project are not enumerable.'});
        if(symbols.get(target.id)?.contract?.externC)boundaries.push({caller,kind:'native-call',location:location(project,expr.span),reason:'The declared native contract is checked; the foreign implementation and its callers are outside this graph.'});
        const contract = symbols.get(target.id)?.contract;
        const params = contract?.inputs as {id:string;label:string}[]|undefined;
        expr.argLabels.forEach((label,index)=>{
          const param = params?.find(param=>param.label===label); if (!param) return;
          const previous = index ? expr.args[index-1].span.end : expr.callee.span.end;
          const token = tokens.get(file)?.find(token=>token.value===label&&token.span.start>=previous&&token.span.end<=expr.args[index].span.start);
          if (token) occurrence(param.id,'label',token.span,caller);
        });
      } else {
        const callee = expr.callee;
        const receiver = callee.kind === 'member' ? checked.expressionTypes.get(callee.object) : undefined;
        const intrinsic = callee.kind==='name'?builtinFunctions.find(fn=>fn.name===callee.name) :
          receiver?.id.startsWith('builtin:') && callee.kind==='member'?collectionOperations[receiver.name]?.find(method=>method.name===callee.name):undefined;
        if (intrinsic || expr.callee.kind==='name' && expr.callee.name in builtinTypes) {
          const name = expr.callee.kind==='name'?expr.callee.name:`${receiver?.name}.${expr.callee.kind==='member'?expr.callee.name:''}`, id = `intrinsic:${name}`;
          symbols.set(id,{id,name,kind:'intrinsic',public:true,location:location(project,expr.span),contract:intrinsic?{...intrinsic}: {constructor:name}}); edge(caller,id,'call',expr.span);
        } else if (!(expr.callee.kind==='name'&&expr.callee.name==='next')) boundaries.push({caller,kind:'unresolved-call',location:location(project,expr.span),reason:'No checked source or intrinsic target identity is available.'});
      }
    }
    for (const [key,child] of Object.entries(value)) if (!['span','nameSpan','sourceSpan'].includes(key)) visit(child,caller,file);
  };
  for (const [file,source] of project.files) {
    const module = `module:${sourceIdentity(project,file)}`;
    symbols.set(module,{id:module,name:sourceIdentity(project,file),kind:'module',public:false,location:location(project,{file,start:0,end:source.source.length,line:1,column:1})});
    for (const item of source.items) {
      if (item.kind === 'import') {
        const beforeFrom = tokens.get(file)?.filter(token=>token.span.start>=item.span.start&&token.span.end<=item.span.end)??[];
        const limit = beforeFrom.find(token=>token.value==='from')?.span.start??item.span.end;
        for (const def of project.imports.get(item)??[]) {
          edge(module,def.id,'import',item.span);
          const token = beforeFrom.find(token=>token.value===def.name&&token.span.start<limit);
          if (token) occurrence(def.id,'import',token.span);
        }
      } else if (item.kind === 'export' && item.folder) {
        const child=join(source.builtin?libraryChild(project.libraries,dirname(file),item.name):join(dirname(file),item.name),'export.aug');
        if(project.files.has(child)){
          const target=`module:${sourceIdentity(project,child)}`;edge(module,target,'export',item.span);occurrence(target,'export',atName(item.span,item.name));
        }
      } else if (item.kind === 'export') {
        const def = project.scopes.get(resolve(file,'..',`${item.from}.aug`))?.get(item.name);
        if (def) {edge(module,def.id,'export',item.span);occurrence(def.id,'export',atName(item.span,item.name));}
      } else if (item.kind === 'test') {
        const subject = project.scopes.get(file)?.get(item.type.name);
        if (subject) occurrence(subject.id,'test',atName(item.type.span,item.type.name));
        for (const group of item.groups) for (const test of group.cases) {
          const id=`test:${sourceIdentity(project,file)}:${item.type.name}:${group.name}:${test.name}`;
          symbols.set(id,{id,name:test.name,kind:'test',public:false,location:location(project,test.span),contract:{group:group.name,rows:test.rows?.length??1}});
          if (subject) edge(id,subject.id,'test',test.span);
          visit(group.setup,id,file);visit(test.body,id,file);visit(test.rows,id,file);
        }
      } else if (item.kind === 'function') {
        const def=project.scopes.get(file)?.get(item.name); if (def) {
          if(item.forward?.targetId){edge(def.id,item.forward.targetId,'forward',item.forward.targetSpan);occurrence(item.forward.targetId,'reference',item.forward.targetSpan,def.id);}
          else visit(item.body,def.id,file);
        }
      } else if ('methods' in item) {
        const def=project.scopes.get(file)?.get(item.name); if (!def) continue;
        item.methods.forEach(method=>visit(method.body,callableIdentity(def,method),file));
        if (item.kind==='class') visit(initializationOf(item),`${def.id}::constructor`,file);
      } else visit(item,module,file);
    }
  }
  // Lexical type occurrences refer to their definition scope, never a spelling search across modules.
  for(const definition of project.definitions.values()){
    const node=definition.node;if(node.kind==='function'&&node.forward)continue;
    const types=(value:unknown,caller:string):void=>{
      if(!value||typeof value!=='object')return;if(Array.isArray(value)){value.forEach(child=>types(child,caller));return;}
      const reference=value as TypeRef;
      if(typeof reference.name==='string'&&Array.isArray(reference.args)&&typeof reference.nullable==='boolean'&&reference.span){
        const type=referenceType(project,reference,definition);addTypes(caller,type,reference.span);
        const span=atName(reference.span,reference.name);if(project.files.get(span.file)?.source.slice(span.start,span.end)===reference.name)occurrence(type.id,'type',span,caller);
      }
      for(const [key,child]of Object.entries(value))if(!['span','nameSpan','sourceSpan','targetSpan'].includes(key))types(child,caller);
    };
    types(node,definition.id);
  }
  const unique = <T extends {location:SourceLocation}>(values:T[]) => [...new Map(values.map(value=>[canonical(value),value])).values()]
    .sort((a,b)=>a.location.file.localeCompare(b.location.file)||a.location.start-b.location.start||a.location.end-b.location.end||canonical(a).localeCompare(canonical(b)));
  return {symbols:[...symbols.values()].sort((a,b)=>a.id.localeCompare(b.id)),occurrences:unique(occurrences),relationships:unique(relationships),boundaries:unique(boundaries)};
}

import { lex } from './lexer.ts';
const lexTokens = (file:string,source:string) => lex(file,source).tokens;

export function interfaceSnapshot(graph: SemanticGraph): {id:string;shape:string;contract:unknown;exportedBy:string[]}[] {
  return graph.symbols.filter(symbol=>symbol.public&&(!symbol.owner||graph.symbols.find(owner=>owner.id===symbol.owner)?.public)&&['function','forward','method','class','interface','interceptor','constructor'].includes(symbol.kind)).map(symbol=>{
    const contract = {...symbol.contract}; delete contract.provenance;
    if (Array.isArray(contract.inputs)) contract.inputs=contract.inputs.map(({id,...input}:any)=>input);
    const exports=new Set<string>(),pending=[symbol.id];
    while(pending.length){const target=pending.shift()!;for(const edge of graph.relationships.filter(edge=>edge.kind==='export'&&edge.to===target))
      if(!exports.has(edge.from)){exports.add(edge.from);pending.push(edge.from);}}
    const exportedBy=[...exports].sort();
    return {id:symbol.id,shape:digest(canonical({kind:symbol.kind==='forward'?'function':symbol.kind,contract,exportedBy})),contract,exportedBy};
  });
}

/** Mandatory checked contracts and caller facts are delivered before optional source prose. */
export function checkedContext(checked: CheckedProject, roots: string[], budget = 100000) {
  if (!Number.isSafeInteger(budget) || budget < 512 || budget > 1000000) throw new Error('Context budget must be 512 to 1000000 characters');
  const graph=semanticGraph(checked), revision=projectRevision(checked.project), symbols=new Map(graph.symbols.map(symbol=>[symbol.id,symbol]));
  for (const root of roots) if (!symbols.has(root)) throw new Error(`Unknown query identity ${root}`);
  const callers=new Set<string>(), dependencies=new Set<string>(), affected=new Set(roots);
  // Traverse explicitly to keep forward dependencies distinct from reverse callers.
  const reverse=[...roots], reverseSeen=new Set(roots);callers.clear();affected.clear();roots.forEach(root=>affected.add(root));
  while (reverse.length) {
    const to=reverse.shift()!;
    for (const edge of graph.relationships.filter(edge=>edge.to===to&&['call','reference','forward','test','delegation'].includes(edge.kind))) if (!reverseSeen.has(edge.from)) {
      reverseSeen.add(edge.from);callers.add(edge.from);affected.add(edge.from);reverse.push(edge.from);
    }
  }
  const forward=[...affected], seen=new Set(affected);
  while (forward.length) {
    const from=forward.shift()!;
    for (const edge of graph.relationships.filter(edge=>edge.from===from&&!['export','import','test','delegation'].includes(edge.kind))) if (!seen.has(edge.to)) {
      seen.add(edge.to);dependencies.add(edge.to);forward.push(edge.to);
    }
  }
  const unresolved=graph.boundaries.filter(boundary=>seen.has(boundary.caller));
  const missing=[...seen].filter(id=>!symbols.has(id));
  const required=[...roots,...[...seen].filter(id=>!roots.includes(id)).sort()];
  const facts:SymbolFact[]=[], occurrences:Occurrence[]=[], relationships:Relationship[]=[], omissions:{kind:string;identities:string[];reason:string}[]=[], snippets:{id:string;source:string}[]=[];
  const projectChecked=!checked.diagnostics.some(issue=>issue.severity!=='warning');
  const packet = () => ({...revision,query:{roots,ordering:ORDERING},checkedScope:{kind:'loaded-project',files:revision.sources.map(source=>source.file),externalConsumers:'not checked'},
    status:{project:projectChecked?'checked':'rejected',graph:graph.boundaries.length||missing.length?'partial':'complete within checked scope',mandatory:omissions.length?'incomplete':'complete',packet:omissions.length?'incomplete':'complete'},
    graphCoverage:{scope:'loaded-project',boundaries:graph.boundaries.length,requiredBoundaries:unresolved.length,
      omittedBoundaries:{reason:'outside the query dependency and reverse caller closure',count:graph.boundaries.length-unresolved.length,
        callers:[...new Set(graph.boundaries.filter(boundary=>!seen.has(boundary.caller)).map(boundary=>boundary.caller))].sort()}},
    dependencies:[...dependencies].sort(),reverseCallers:[...callers].sort(),facts,occurrences,relationships,unresolved,omissions,snippets,
    diagnostics:checked.diagnostics.map(issue=>({...issue,file:sourceIdentity(checked.project,issue.file),revision:revision.revision})),behavior:'source-derived descriptions describe the current program, not desired requirements',budget,
    budgetPolicy:'Semantic content target; required identity and omission metadata are retained even when larger than the target.'});
  const fit = <T>(list:T[],value:T):boolean => {list.push(value);if(canonical(packet()).length>budget){list.pop();return false;}return true;};
  for (const id of required) {
    const symbol=symbols.get(id);if(!symbol)continue;
    const {source,...fact}=symbol;if(!fit(facts,fact)) omissions.push({kind:'contract',identities:[id],reason:'budget truncation'});
  }
  for (const occurrence of graph.occurrences.filter(occurrence=>seen.has(occurrence.symbol)||!!occurrence.caller&&seen.has(occurrence.caller)))
    if(!fit(occurrences,occurrence)) omissions.push({kind:'occurrence',identities:[occurrence.symbol],reason:'budget truncation'});
  for (const edge of graph.relationships.filter(edge=>seen.has(edge.from)||seen.has(edge.to))) if(!fit(relationships,edge))
    omissions.push({kind:'relationship',identities:[edge.from,edge.to],reason:'budget truncation'});
  if(missing.length)omissions.push({kind:'unresolved-symbol',identities:missing.sort(),reason:'no checked contract fact'});
  // Optional source never displaces a required contract or occurrence. Its omissions are reported separately.
  const optionalOmissions:string[]=[];
  for(const id of required){const source=symbols.get(id)?.source;if(source&&!fit(snippets,{id,source}))optionalOmissions.push(id);}
  return {...packet(),optionalOmissions,budgetExceeded:canonical(packet()).length>budget,
    coverage:{required:required.length,delivered:facts.length,externalCode:'unknown',requiredContextComplete:projectChecked&&!unresolved.length&&!missing.length&&!omissions.length}};
}
