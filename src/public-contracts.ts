import type {CheckedProject} from './checker.ts';
import type {GenericHeader,MethodDecl,TypeRef} from './ast.ts';
import {fieldsOf} from './ast.ts';
import type {Ty} from './types.ts';
import {tyName,immutableType} from './types.ts';
import {schemaType} from './schemas.ts';
import type {EffectContract} from './effects.ts';
import {callableResult} from './contracts.ts';
import {contractFacts,type ContractFact,type CallableFact} from './contract-facts.ts';

/** Compare public promises using resolved identities, excluding source coordinates and private storage. */
export function publicContract(checked:CheckedProject,fact:ContractFact,allFacts=new Map(contractFacts(checked).map(entry=>[entry.id,entry]))) {
  const project=checked.project,definition=project.definitions.get(fact.id)!;
  const self=project.library?`package/${project.library.name}@${project.library.version}/`:undefined;
  const selfProvider=project.library?project.library.name+'@'+project.library.version:undefined;
  const identity=(id:string):string=>self&&id.startsWith(self)?'self/'+id.slice(self.length):id;
  const resolved=(type:Ty):unknown=>({id:type.kind==='param'?type.id:identity(type.id),
    nullable:!!(type.nullable||type.optional),immutable:!!type.immutable,args:type.args.map(resolved)});
  const parameters=(header:GenericHeader,base=new Map<string,Ty>(),scope='owner')=>new Map<string,Ty>([...base,...header.typeParams.map((name):[string,Ty]=>[name,{id:'parameter:'+scope+':'+name,name,kind:'param',args:[],nullable:false}])]);
  const type=(ref:TypeRef,file:string,params:Map<string,Ty>):Ty=>{
    const base=schemaType(project,ref,file,params),value=params.has(ref.name)?base:{...base,args:ref.args.map(argument=>type(argument,file,params))};
    return ref.immutable?immutableType(value):value;
  };
  const constraints=(header:GenericHeader,file:string,params:Map<string,Ty>)=>header.typeParams.map(name=>({name,
    types:(header.typeConstraints?.[name]??[]).map(ref=>resolved(type(ref,file,params)))}));
  const normalize=(value:unknown):unknown=>{
    if(Array.isArray(value))return value.map(normalize);
    if(!value||typeof value!=='object')return value;
    return Object.fromEntries(Object.entries(value).filter(([key])=>!['location','inferredEffects'].includes(key)).map(([key,child])=>[key,key==='provider'&&child===selfProvider?'self':normalize(child)]));
  };
  const callable=(original:CallableFact,method:MethodDecl|undefined,file:string,bindings:Map<string,Ty>,inheritedFrom?:string)=>{
    const params=method?parameters(method,bindings,'method'):bindings;
    const substitute=(value:Ty):Ty=>{
      const parameter=value.kind==='param'?(params.get(value.name)??ownerParams.get(value.name)):undefined;
      return parameter?{...parameter,nullable:value.nullable||parameter.nullable,optional:value.optional||parameter.optional,immutable:value.immutable||parameter.immutable}:{...value,args:value.args.map(substitute)};
    };
    const effects=(contract:EffectContract|undefined)=>[...(contract?.uses.entries()??[])].map(([key,effect])=>effect.capability?
      {operation:effect.operation,capability:resolved(substitute(effect.capability))}:{operation:effect.operation,key:key.startsWith('C:')?'C:'+identity(key.slice(2)):identity(key)})
      .sort((left,right)=>JSON.stringify(left).localeCompare(JSON.stringify(right),'en'));
    const inputRefs=method?.params??('fields' in definition.node?definition.node.fields:[]);
    const result=method?substitute(callableResult(checked,method)):{id:fact.id,name:fact.name,kind:'class' as const,args:definition.node.typeParams.map(name=>ownerParams.get(name)!),nullable:false};
    const baseErrors=method?checked.callableContracts.get(method)?.errors??method.throws.map(ref=>type(ref,file,params)):
      definition.node.kind==='class'?checked.constructorContracts.get(definition.node)?.errors??[]:[];
    const layers=method?checked.interceptorPlans.get(method)??[]:definition.node.kind==='class'?checked.interceptorPlans.get(definition.node)??[]:[];
    const errors=[...baseErrors,...layers.flatMap(layer=>layer.errors)].map(substitute);
    return {...original,changes:[...original.changes].sort(),capabilities:[...original.capabilities].sort(),capabilityIdentities:effects(method?checked.effectContracts.get(method):undefined),
      interceptors:original.interceptors.map((layer,index)=>({...layer,capabilityIdentities:effects(layers[index].effects)})),inputs:original.inputs.map(({name,...input},index)=>{const value=type(inputRefs[index].type,file,params);return {...input,type:tyName(value),typeIdentity:resolved(value)};}),
      result:(method?.returnOwnership==='own'?'own ':'')+tyName(result),resultIdentity:resolved(result),
      errors:[...new Set(errors.map(tyName))].sort(),errorIdentities:[...new Map(errors.map(error=>[JSON.stringify(resolved(error)),resolved(error)])).values()].sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b),'en')),
      resolvedConstraints:method?constraints(method,file,params):constraints(definition.node,file,params),
      ...(inheritedFrom?{inheritedFrom:identity(inheritedFrom)}:{})};
  };
  const ownerParams=parameters(definition.node);
  const local=fact.callables.map(original=>{const method=definition.node.kind==='function'?definition.node:'methods' in definition.node?definition.node.methods.find(method=>method.name===original.name&&method.span.start===original.location.start&&method.span.end===original.location.end):undefined;
    return callable(original,method,definition.file,ownerParams);});
  const entries=fact.kind==='interface'||fact.kind==='capability'?[...(checked.interfaceMembers.get(fact.id)?.values()??[])].flat().filter(entry=>entry.from!==fact.id):[...(checked.defaults.get(fact.id)?.values()??[])];
  const inherited=entries.filter(entry=>!entry.method.name.startsWith('_')).map(entry=>{
    const original=allFacts.get(entry.from)?.callables.find(method=>method.name===entry.method.name);
    if(!original)throw new Error('PUBLIC_CONTRACT: Missing inherited method '+entry.method.name);
    const canonical=(value:Ty):Ty=>value.kind==='param'&&ownerParams.has(value.name)?{...ownerParams.get(value.name)!,nullable:value.nullable,optional:value.optional,immutable:value.immutable}:{...value,args:value.args.map(canonical)};
    const params=new Map([...entry.params].map(([name,value])=>[name,canonical(value)]));for(const name of entry.method.typeParams)params.delete(name);
    return callable(original,entry.method,entry.file,params,entry.from);
  });
  const {id,location,documentation,calls,functionValues,tests,...publicFact}=fact;
  const interfaceRefs=definition.node.kind==='class'?definition.node.implements:definition.node.kind==='interface'?definition.node.extends:[];
  return normalize({...publicFact,...(definition.node.kind==='choice'?{alternativeTypes:definition.node.alternatives.map(ref=>resolved(type(ref,definition.file,ownerParams)))}:{}),interfaceTypes:interfaceRefs.map(ref=>resolved(type(ref,definition.file,ownerParams))),
    resolvedConstraints:constraints(definition.node,definition.file,ownerParams),
    fields:fact.fields.filter(field=>!field.storage.startsWith('_')).map(({storage,...field})=>{
      const ref=definition.node.kind==='class'||definition.node.kind==='interceptor'?fieldsOf(definition.node).find(input=>input.name===storage)?.type:undefined;
      return {...field,name:storage,...(ref?{typeIdentity:resolved(type(ref,definition.file,ownerParams))}:{})};}),
    callables:[...local,...inherited].sort((left,right)=>left.name<right.name?-1:left.name>right.name?1:0)});
}


/** Explicit value deltas let a review identify the changed promise without hiding the complete contracts. */
export function contractDifferences(before:unknown,after:unknown,path=''): {path:string;kind:'added'|'removed'|'changed';before:unknown;after:unknown}[] {
  if(JSON.stringify(before)===JSON.stringify(after))return [];
  if(Array.isArray(before)&&Array.isArray(after))return Array.from({length:Math.max(before.length,after.length)},(_,index)=>index)
    .flatMap(index=>contractDifferences(before[index],after[index],path+'['+index+']'));
  if(before&&after&&typeof before==='object'&&typeof after==='object'&&!Array.isArray(before)&&!Array.isArray(after)){
    const left=before as Record<string,unknown>,right=after as Record<string,unknown>;
    return [...new Set([...Object.keys(left),...Object.keys(right)])].sort().flatMap(key=>contractDifferences(left[key],right[key],path?path+'.'+key:key));
  }
  return [{path,kind:before===undefined?'added':after===undefined?'removed':'changed',before:before??null,after:after??null}];
}
