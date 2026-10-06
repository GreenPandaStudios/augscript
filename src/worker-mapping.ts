import {join} from 'node:path';
import type {Expr,MethodDecl,TypeRef} from './ast.ts';
import type {Definition,Project} from './project.ts';
import {checkProject,type CheckedProject} from './checker.ts';
import type {Ty} from './types.ts';

/** A resolved static bridge. No function value or behavior object is transferred. */
export interface WorkerMapPlan {
  transformation:Definition;
  input:Ty;
  result:Ty;
  transformationIndex:number;
}

/** Only the shipped source template is an intrinsic, never a same-named user function. */
export function workerMapTemplate(project:Project,definition:Definition|undefined):boolean {
  return !!definition && !!project.stdlibRoot && definition.file===join(project.stdlibRoot,'collections','workers.aug') &&
    !!project.files.get(definition.file)?.builtin && definition.node.kind==='function' &&
    ['mapWorkers','_mapWorkerChunk'].includes(definition.name);
}
export function isWorkerMap(project:Project,definition:Definition|undefined):boolean {
  return workerMapTemplate(project,definition) && definition!.name==='mapWorkers';
}

/** Specialize the checked package template before either backend. Recheck the
 * complete derived program, including the generated real worker entry. Canonical
 * AST, source identities and public semantic facts remain unchanged. */
export function lowerWorkerMaps(checked:CheckedProject):CheckedProject {
  if(!checked.workerMaps.size)return checked;
  if(checked.diagnostics.some(issue=>issue.severity!=='warning'))throw new Error('Cannot specialize a rejected worker mapping');
  const project=checked.project,template=[...project.definitions.values()].find(def=>isWorkerMap(project,def))!;
  const chunk=[...project.definitions.values()].find(def=>workerMapTemplate(project,def)&&def.name==='_mapWorkerChunk')!;
  const used=new Set<string>();
  const names=(node:any):void=>{if(!node||typeof node!=='object')return;if(typeof node.name==='string')used.add(node.name);for(const [key,value] of Object.entries(node))if(key!=='span'&&key!=='source')names(value);};
  for(const file of project.files.values())names(file.items);
  let sequence=0;
  const fresh=(kind:string):string=>{let name:string;do{name='_aug'+kind+sequence++;}while(used.has(name));used.add(name);return name;};
  const calls=new Map<Expr,{name:string;plan:WorkerMapPlan}>();
  const generated:Definition[]=[],typeAliases=new Map<string,Definition>();
  const typeRef=(type:Ty,original:TypeRef):TypeRef=>{
    let name=type.name;
    if(type.def){name=fresh('WorkerType');typeAliases.set(name,type.def);}
    return {...original,name,args:type.args.map(arg=>typeRef(arg,original)),nullable:type.nullable,optional:!!type.optional,immutable:type.immutable};
  };
  const targetAliases=new Map<string,Definition>();
  for(const [call,plan] of checked.workerMaps){
    const name=fresh('WorkerMap'),entry=fresh('WorkerChunk'),target=fresh('WorkerTransform');
    targetAliases.set(target,plan.transformation);calls.set(call,{name,plan});
    const clone=(value:any):any=>{
      if(!value||typeof value!=='object')return value;
      if(Array.isArray(value))return value.map(clone);
      if(!value.kind&&Array.isArray(value.args)&&'nullable' in value&&(value.name==='T'||value.name==='U'))return typeRef(value.name==='T'?plan.input:plan.result,value);
      if(value.kind==='call'&&value.callee.kind==='member'&&value.callee.object.kind==='name'&&value.callee.object.name==='transformation')
        return {...value,callee:{kind:'name',name:target,span:value.callee.span},args:value.args.map(clone),typeArgs:[]};
      if(value.kind==='call'&&value.callee.kind==='name'&&value.callee.name==='_mapWorkerChunk'){
        const index=checked.callPlans.get(value)?.sourceIndices[1];
        if(index===undefined)throw new Error('Worker chunk template has no resolved transformation input');
        return {...value,callee:{...value.callee,name:entry},args:value.args.filter((_:unknown,i:number)=>i!==index).map(clone),argLabels:value.argLabels.filter((_:unknown,i:number)=>i!==index),typeArgs:[]};
      }
      return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,key==='span'?child:clone(child)]));
    };
    for(const [definition,generatedName] of [[template,name],[chunk,entry]] as const){
      const node=clone(definition.node) as MethodDecl;
      node.name=generatedName;node.typeParams=[];node.typeConstraints={};node.params=node.params.filter(param=>param.name!=='transformation');
      generated.push({id:template.file+':'+generatedName,name:generatedName,file:template.file,node});
    }
  }
  const copies=new Map<object,any>();
  const rewrite=(value:any):any=>{
    if(!value||typeof value!=='object')return value;
    if(copies.has(value))return copies.get(value);
    const mapping=calls.get(value);
    if(mapping){
      const call=value as Extract<Expr,{kind:'call'}>,index=mapping.plan.transformationIndex;
      const result={...call,callee:{kind:'name',name:mapping.name,span:call.callee.span},args:call.args.filter((_,i)=>i!==index).map(rewrite),argLabels:call.argLabels.filter((_,i)=>i!==index),typeArgs:[]};
      copies.set(value,result);return result;
    }
    const result=Array.isArray(value)?value.map(rewrite):Object.fromEntries(Object.entries(value).map(([key,child])=>[key,key==='span'||key==='source'?child:rewrite(child)]));
    copies.set(value,result);return result;
  };
  const definitions=new Map<string,Definition>();
  for(const definition of project.definitions.values())if(!workerMapTemplate(project,definition))definitions.set(definition.id,{...definition,node:rewrite(definition.node)});
  generated.forEach(def=>definitions.set(def.id,def));
  const resolveDefinition=(def:Definition):Definition=>definitions.get(def.id)??def;
  const scopes=new Map([...project.scopes].map(([file,scope])=>[file,new Map([...scope].map(([name,def])=>[name,resolveDefinition(def)]))]));
  // Calls are compiler-resolved aliases, deliberately independent of source spellings.
  for(const [call,mapping] of calls)scopes.get(call.span.file)!.set(mapping.name,definitions.get(template.file+':'+mapping.name)!);
  for(const [name,def] of [...typeAliases,...targetAliases])scopes.get(template.file)!.set(name,resolveDefinition(def));
  generated.forEach(def=>scopes.get(template.file)!.set(def.name,def));
  const files=new Map([...project.files].map(([path,file])=>[path,{...file,items:file.items.filter(item=>!(path===template.file&&item.kind==='function'&&['mapWorkers','_mapWorkerChunk'].includes(item.name))).map(rewrite)}]));
  files.get(template.file)!.items.push(...generated.map(def=>def.node));
  const derived:Project={...project,files,definitions,scopes,imports:new Map([...project.imports].map(([node,defs])=>[rewrite(node),defs.map(resolveDefinition)])),main:project.main?rewrite(project.main):undefined};
  const result=checkProject(derived),issues=result.diagnostics.filter(issue=>issue.severity!=='warning');
  if(issues.length)throw new Error('Worker mapping specialization failed its compiler check: '+JSON.stringify(issues));
  return result;
}
