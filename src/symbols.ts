import {createHash} from 'node:crypto';
import {existsSync,readFileSync,readdirSync,realpathSync} from 'node:fs';
import {dirname,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {Expr,MethodDecl,Param,Span,TypeRef} from './ast.ts';
import type {CheckedProject} from './checker.ts';
import {lex} from './lexer.ts';
import {compilerVersion} from './package-manager.ts';
import {libraryRelative} from './libraries.ts';
import {semanticDependencyMetadata,type DependencyMetadata} from './semantic-metadata.ts';

export interface SemanticSymbol {id:string; name:string; kind:string; location:Span; owner?:string; editable:boolean}
export interface Occurrence {symbol:string; file:string; start:number; end:number; line:number; column:number;
  role:'declaration'|'read'|'write'|'call'|'import'|'export'|'type'|'argument-label'|'shorthand-label'|'test'; caller?:string}
export interface SemanticEdge {from:string; to:string; kind:'call'|'callback-call'|'function-value'|'import'|'export'|'implements'|'inherits'|'injected'|'test'|'internal'|'interceptor'; location:Span}
export interface SemanticBoundary {kind:'interface-dispatch'|'native-code'|'interceptor-delegation'|'unresolved-call'; location:Span; target?:string}
export interface SemanticGraph {
  schema:2; compiler:{version:string; sha256:string}; revision:string; ordering:'file-offset-role';
  coverage:{checkedProject:boolean; checkedScope:'project'|'import-closure'; reverseCallers:'complete'|'incomplete'; dispatch:'resolved'|'bounded'; externalCallers:'outside-project'; errors:number};
  dependencies:DependencyMetadata[];
  sources:{file:string; sha256:string}[]; configuration:{file:string; sha256:string|null}[];
  symbols:SemanticSymbol[]; occurrences:Occurrence[]; relationships:SemanticEdge[]; boundaries:SemanticBoundary[];
  forwardDependencies:Record<string,SemanticEdge[]>; reverseCallers:Record<string,SemanticEdge[]>;
}

let compilerSha256:string|undefined;
export function compilerIdentity() {
  if(!compilerSha256) {
    const folder=fileURLToPath(new URL('.',import.meta.url)),hash=createHash('sha256');
    for(const entry of readdirSync(folder,{withFileTypes:true}).filter(entry=>entry.isFile()&&/\.(ts|js|mjs)$/.test(entry.name)).sort((a,b)=>compare(a.name,b.name)))
      hash.update(entry.name+'\0').update(readFileSync(join(folder,entry.name))).update('\0');
    compilerSha256=hash.digest('hex');
  }
  return {version:compilerVersion(),sha256:compilerSha256};
}
const compare=(a:string,b:string)=>a<b?-1:a>b?1:0;
const digest=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
/** Stable package paths are independent of the installing user's cache directory. */
export function semanticSourcePath(checked:CheckedProject,file:string):string {
  const project=checked.project,source=project.files.get(file);
  if(source?.builtin)return 'august/'+libraryRelative(project.libraries,file).replaceAll('\\','/');
  const scope=source?.package&&project.packages.scopes.get(source.package);
  if(scope)return `package/${scope.name}@${scope.version}/`+relative(scope.sourceRoot,file).replaceAll('\\','/');
  return relative(project.library?realpathSync(project.root):project.root,project.library&&existsSync(file)?realpathSync(file):file).replaceAll('\\','/');
}

/** The graph records compiler resolution. Dynamic dispatch is a boundary, not an invented implementation. */
export function semanticConfiguration(root:string) {
  return ['main.yaml','aug-package.json','aug.lock.json'].map(file=>({file,sha256:existsSync(join(root,file))?digest(readFileSync(join(root,file))):null}));
}
export function semanticGraph(checked:CheckedProject,wholeProject:boolean,checkedFiles?:ReadonlySet<string>,configuration=semanticConfiguration(checked.project.root),dependencies=semanticDependencyMetadata(checked.project)):SemanticGraph {
  const project=checked.project,symbols=new Map<string,SemanticSymbol>(),occurrences:Occurrence[]=[],relationships:SemanticEdge[]=[],boundaries:SemanticBoundary[]=[];
  const callableSpans:{id:string;span:Span}[]=[];
  const nodeIds=new WeakMap<object,string>(),paramIds=new WeakMap<Param,string>(),localIds=new Map<string,string>();
  const tokens=new Map([...project.files.values()].map(file=>[file.path,lex(file.path,file.source).tokens]));
  const location=(span:Span):Span=>({...span,file:semanticSourcePath(checked,span.file)});
  const selectedToken=(span:Span,name:string,last=false):Span|undefined=>{
    const candidates=(tokens.get(span.file)??[]).filter(token=>token.value===name&&span.start<=token.span.start&&token.span.end<=span.end);
    return (last?candidates.at(-1):candidates[0])?.span;
  };
  const localKey=(span:Span,name:string)=>`${span.file}:${span.start}:${name}`;
  const addOccurrence=(symbol:string,span:Span,role:Occurrence['role'],caller?:string)=>{
    occurrences.push({symbol,...location(span),role,caller});
  };
  const addSymbol=(id:string,name:string,kind:string,span:Span,owner?:string)=>{
    if(symbols.has(id))return;
    symbols.set(id,{id,name,kind,location:location(span),owner,editable:!project.files.get(span.file)?.builtin&&!project.files.get(span.file)?.package});
    addOccurrence(id,span,'declaration',owner);
  };
  const registerParams=(owner:string,params:Param[])=>{
    for(const param of params) {
      const label=param.label??param.name,id=owner+'/input/'+label;
      const span=param.nameSpan??selectedToken({...param.span,start:param.type.span.end},param.name)??param.span;
      addSymbol(id,param.name,'parameter',span,owner);paramIds.set(param,id);localIds.set(localKey(param.span,param.name),id);
    }
  };
  for(const def of project.definitions.values()) {
    const node=def.node,span=selectedToken(node.span,node.name)??node.span;
    nodeIds.set(node,def.id);addSymbol(def.id,node.name,node.kind,span);
    if(node.kind==='function'){registerParams(def.id,node.params);callableSpans.push({id:def.id,span:node.span});}
    if('fields' in node)registerParams(def.id,node.fields);
    if('methods' in node)for(const method of node.methods) {
      const id=def.id+'/method/'+method.name;nodeIds.set(method,id);callableSpans.push({id,span:method.span});
      addSymbol(id,method.name,'method',selectedToken(method.span,method.name)??method.span,def.id);registerParams(id,method.params);
    }
  }
  // Scope facts retain each declaration's identity across shadowing and rebinding.
  for(const scope of checked.scopes.values())for(const local of scope.locals) {
    if(!local.definition)continue;
    const key=localKey(local.definition,local.name);if(localIds.has(key))continue;
    const span=selectedToken(local.definition,local.name)??local.definition;
    const id='local:'+semanticSourcePath(checked,span.file)+':'+local.definition.start+':'+local.name;
    const owner=callableSpans.filter(callable=>callable.span.file===span.file&&callable.span.start<=span.start&&span.end<=callable.span.end).sort((a,b)=>b.span.start-a.span.start)[0]?.id;
    localIds.set(key,id);addSymbol(id,local.name,local.kind,span,owner);
  }
  const globalReference=(id:string,span:Span,name:string,role:Occurrence['role'],caller?:string,last=false)=>{
    const token=selectedToken(span,name,last);if(token)addOccurrence(id,token,role,caller);
  };
  const edge=(kind:SemanticEdge['kind'],from:string,to:string,span:Span)=>relationships.push({kind,from,to,location:location(span)});
  const visit=(value:unknown,caller:string,deferred=false):void=>{
    if(!value||typeof value!=='object')return;
    if(Array.isArray(value)){value.forEach(item=>visit(item,caller,deferred));return;}
    const node=value as {kind?:string;span?:Span;name?:string},expr=value as Expr;
    caller=nodeIds.get(value)??caller;
    if(node.kind==='function'||node.kind==='class')for(const layer of checked.interceptorPlans.get(value as MethodDecl|import('./ast.ts').ClassDecl)??[]) {
      globalReference(layer.definition.id,layer.annotation.span,layer.definition.name,'read',caller);
      edge('interceptor',caller,layer.definition.id,layer.annotation.span);
    }
    if(expr.kind==='lambda')deferred=true;
    const name=checked.resolvedNames.get(expr);
    if(name) {
      const id=name.global??localIds.get(localKey(name.definition,name.name));
      if(id)addOccurrence(id,expr.span,'read',caller);
    }
    const type=checked.resolvedTypes.get(value as TypeRef);
    if(type?.def&&node.span)globalReference(type.def.id,node.span,(value as TypeRef).name,'type',caller);
    const callback=checked.functionValues.get(expr);if(callback?.target)edge('function-value',caller,callback.target.id,expr.span);
    if(expr.kind==='markup') {const call=checked.markupCalls.get(expr);if(call)visit(call,caller,deferred);}
    if(expr.kind==='recordCopy') {const target=checked.expressionTypes.get(expr.base)?.def;if(target)edge(deferred?'callback-call':'call',caller,target.id,expr.span);}
    if(expr.kind==='handle') {const plan=checked.actions.get(expr);if(plan){globalReference(plan.endpoint.id,expr.call.span,plan.endpoint.name,'call',caller);edge(deferred?'callback-call':'call',caller,plan.endpoint.id,expr.span);}}
    if(expr.kind==='call') {
      const call=checked.resolvedCalls.get(expr),target=call&&nodeIds.get(call.node);
      if(target&&call) {
        globalReference(target,expr.callee.span,call.node.name,'call',caller,true);edge(deferred?'callback-call':'call',caller,target,expr.span);
        if(call.dispatch==='interface')boundaries.push({kind:'interface-dispatch',target,location:location(expr.span)});
        if(call.node.kind==='function'&&call.node.externC)boundaries.push({kind:'native-code',target,location:location(expr.span)});
        const plan=checked.callPlans.get(expr);
        call.params.forEach((param,index)=>{
          const source=plan?.sourceIndices[index],id=paramIds.get(param);if(source===undefined||!id)return;
          const argument=expr.args[source],label=expr.argLabelSpans?.[source];
          if(label)addOccurrence(id,label,'argument-label',caller);
          else if(!expr.indexed&&argument.kind==='name')addOccurrence(id,argument.span,'shorthand-label',caller);
        });
      } else if(expr.callee.kind==='name'&&expr.callee.name==='next')boundaries.push({kind:'interceptor-delegation',location:location(expr.span)});
      else if(!checked.expressionTypes.get(expr)||checked.expressionTypes.get(expr)?.kind==='error')boundaries.push({kind:'unresolved-call',location:location(expr.span)});
    }
    if(node.kind==='recordBinding')for(const field of (value as Extract<import('./ast.ts').BindingPattern,{kind:'recordBinding'}>).fields){
      const selected=checked.patternFields.get(field),id=selected&&paramIds.get(selected.field);
      if(id)addOccurrence(id,field.nameSpan,'read',caller);
    }
    if(expr.kind==='member') {
      const receiver=checked.expressionTypes.get(expr.object),owner=receiver?.def;
      if(owner&&'fields' in owner.node) {
        const param=owner.node.fields.find(field=>field.name===expr.name),id=param&&paramIds.get(param);
        if(id)globalReference(id,expr.span,expr.name,'read',caller,true);
      }
    }
    if(node.kind==='assign') {
      const target=(value as Extract<import('./ast.ts').Stmt,{kind:'assign'}>).target,resolved=checked.resolvedNames.get(target);
      const id=resolved&&(resolved.global??localIds.get(localKey(resolved.definition,resolved.name)));
      if(id)addOccurrence(id,target.span,'write',caller);
    }
    if(node.kind==='borrow'&&node.span&&node.name) {
      const scope=checked.scopes.get(`${node.span.file}:${node.span.start}:${node.span.end}`),local=scope?.locals.find(local=>local.name===node.name);
      const id=local?.definition&&localIds.get(localKey(local.definition,local.name));
      if(id)globalReference(id,node.span,node.name,'read',caller);
    }
    if(node.kind==='import'&&node.span) {
      const item=value as import('./ast.ts').ImportDecl;
      for(const def of project.imports.get(item)??[]) {
        const before=(tokens.get(item.span.file)??[]).filter(token=>item.span.start<=token.span.start&&token.span.end<=item.span.end);
        const from=before.findIndex(token=>token.kind==='from');
        const token=before.slice(0,from).find(token=>token.value===def.name);
        if(token)addOccurrence(def.id,token.span,'import',caller);
        edge('import',caller,def.id,item.span);
      }
    }
    if(node.kind==='export'&&node.span) {
      const item=value as import('./ast.ts').ExportDecl;
      if(!item.folder&&item.from) {
        const file=join(dirname(item.span.file),item.from+'.aug'),def=project.scopes.get(file)?.get(item.name);
        if(def){globalReference(def.id,item.span,item.name,'export',caller);edge(item.internal?'internal':'export',caller,def.id,item.span);}
      }
    }
    if(node.kind==='class') {
      const item=value as import('./ast.ts').ClassDecl;
      for(const type of item.implements){const target=checked.resolvedTypes.get(type)?.def;if(target)edge('implements',caller,target.id,type.span);}
    }
    if(node.kind==='interface')for(const type of (value as import('./ast.ts').InterfaceDecl).extends){const target=checked.resolvedTypes.get(type)?.def;if(target)edge('inherits',caller,target.id,type.span);}
    if(node.kind==='test') {
      const item=value as import('./ast.ts').TestDecl,target=project.scopes.get(item.span.file)?.get(item.type.name);
      if(target){globalReference(target.id,item.type.span,item.type.name,'test',caller);edge('test',caller,target.id,item.span);}
    }
    if(node.kind==='function') {
      for(const param of (value as MethodDecl).params.filter(param=>param.injected)) {
        const target=checked.resolvedTypes.get(param.type)?.def;if(target)edge('injected',caller,target.id,param.span);
      }
    }
    for(const [key,child] of Object.entries(value))if(key!=='span'&&!key.endsWith('Span')&&key!=='argLabelSpans')visit(child,caller,deferred);
  };
  for(const file of project.files.values())if(!checkedFiles||checkedFiles.has(file.path))visit(file.items,'module:'+semanticSourcePath(checked,file.path));
  // Callees are both resolved names and call targets; retain the more specific role.
  const unique=new Map<string,Occurrence>();
  for(const occurrence of occurrences) {
    const key=`${occurrence.file}:${occurrence.start}:${occurrence.end}:${occurrence.symbol}`+(['argument-label','shorthand-label'].includes(occurrence.role)?':label':'');
    const previous=unique.get(key);
    if(!previous||previous.role==='read'&&['call','declaration','write'].includes(occurrence.role))unique.set(key,occurrence);
  }
  const ordered=[...unique.values()].sort((a,b)=>compare(a.file,b.file)||a.start-b.start||compare(a.role,b.role));
  const forwardDependencies:SemanticGraph['forwardDependencies']={},reverseCallers:SemanticGraph['reverseCallers']={};
  relationships.sort((a,b)=>compare(a.location.file,b.location.file)||a.location.start-b.location.start||compare(a.kind,b.kind));
  for(const relation of relationships) {
    (forwardDependencies[relation.from]??=[]).push(relation);
    if(['call','callback-call','function-value','interceptor'].includes(relation.kind))(reverseCallers[relation.to]??=[]).push(relation);
  }
  const sources=[...project.files.values()].filter(file=>!checkedFiles||checkedFiles.has(file.path)).map(file=>({file:semanticSourcePath(checked,file.path),sha256:digest(file.source)})).sort((a,b)=>compare(a.file,b.file));
  const compiler=compilerIdentity(),errors=checked.diagnostics.filter(issue=>issue.severity!=='warning').length;
  const checkedScope=wholeProject?'project':'import-closure';
  const revision=digest(JSON.stringify({schema:2,compiler,checkedScope,sources,configuration,dependencies,config:project.config}));
  return {schema:2,compiler,revision,ordering:'file-offset-role',coverage:{checkedProject:wholeProject&&!errors,checkedScope,
    reverseCallers:wholeProject&&!errors?'complete':'incomplete',dispatch:boundaries.length?'bounded':'resolved',externalCallers:'outside-project',errors},sources,configuration,dependencies,
    symbols:[...symbols.values()].sort((a,b)=>compare(a.location.file,b.location.file)||a.location.start-b.location.start||compare(a.id,b.id)),
    occurrences:ordered,relationships,boundaries,forwardDependencies,reverseCallers};
}

export function occurrencesAt(graph:SemanticGraph,file:string,offset:number,includeDeclaration=true):Occurrence[] {
  const selected=graph.occurrences.filter(occurrence=>occurrence.file===file&&occurrence.start<=offset&&offset<occurrence.end);
  // In a shorthand call the label and local are distinct identities. Prefer the local for ordinary rename/navigation.
  const root=selected.find(occurrence=>occurrence.role!=='shorthand-label')??selected[0];
  return root?graph.occurrences.filter(occurrence=>occurrence.symbol===root.symbol&&(includeDeclaration||occurrence.role!=='declaration')):[];
}
