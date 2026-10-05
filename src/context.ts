import {idiomsFor} from './syntax-idioms.ts';
import {resolve} from 'node:path';
import {discoverTests} from './testing.ts';
import type {Expr,Span,TestDecl,TypeRef} from './ast.ts';
import {declarationSourceSpan} from './ast.ts';
import type {CheckedProject,Ty} from './checker.ts';
import {tyName} from './types.ts';
import {contractFacts,type ContractFact} from './contract-facts.ts';
import {semanticGraph,semanticSourcePath,type SemanticGraph,type SemanticEdge} from './symbols.ts';

export const contextModes=['implementation','interface-change','review'] as const;
export type ContextMode=typeof contextModes[number];
export interface ContextOptions {name?:string;budget?:number;mode?:ContextMode}

interface ResolvedTypeFact {
  id:string; name:string; display:string; kind:string; arguments:string[];
  nullable:boolean; immutable:boolean; definition?:Span;
}
interface Omission {section:string; reason:string; required:boolean; ids?:string[]; count?:number}
export interface ContextPacket {
  schema:3; revision:string; budget:number; truncated:boolean;
  status:'ready'|'budget-insufficient';minimumBudget:number;budgetUnit?:'utf16-code-units-with-newline';
  compiler?:SemanticGraph['compiler']; query?:{file:string;name?:string;roots:string[];mode:ContextMode};
  ordering?:string; requirements?:'not-supplied'; behaviorDescriptions?:'source-derived';
  coverage:{checkedProject:boolean; checkedScope:'project'|'import-closure'; graph:'resolved'|'bounded'; reverseCallers:'complete'|'incomplete';
    mandatory:'complete'|'incomplete'; delivered:'complete'|'truncated'; externalCallers:'outside-project'};
  evidence?:{compiler:'accepted'|'rejected';behavior:'not-run'};
  sources?:SemanticGraph['sources']; configuration?:SemanticGraph['configuration'];dependencies?:SemanticGraph['dependencies'];
  contracts:ContractFact[]; snippets:{id:string;source:string}[]; types?:ResolvedTypeFact[];
  tests?:{id:string;subject:string;location:Span;source:string;cases:string[];origin:'author-supplied';independence:'not-assessed'}[];
  reverseCallers?:SemanticEdge[]; occurrences?:SemanticGraph['occurrences']; boundaries?:SemanticGraph['boundaries'];
  imports?:{module:string;names:string[];location:Span}[]; idioms?:ReturnType<typeof idiomsFor>; omissions:Omission[];
}
const compare=(a:string,b:string)=>a<b?-1:a>b?1:0;

/** Context is checked compiler evidence about the starting program. Desired
 * requirements and independent acceptance results must be supplied separately. */
export function contextPacket(checked:CheckedProject,fileName:string,options:ContextOptions={},providedGraph?:SemanticGraph):ContextPacket {
  const file=checked.project.files.get(resolve(fileName));if(!file)throw new Error('Unknown source file '+fileName);
  const graph=providedGraph??semanticGraph(checked,true),budget=options.budget??12000,mode=options.mode??'implementation';
  if(!Number.isInteger(budget)||budget<512||budget>100000)throw new Error('Context budget must be an integer from 512 to 100000.');
  if(!contextModes.includes(mode))throw new Error('Context mode must be implementation, interface-change or review.');
  const allFacts=contractFacts(checked),facts=new Map(allFacts.map(fact=>[fact.id,fact])),definitions=checked.project.definitions;
  const roots=allFacts.filter(fact=>fact.location.file===file.path&&(options.name?fact.name===options.name:fact.public)).map(fact=>fact.id);
  if(options.name&&!roots.length) {
    const def=checked.project.scopes.get(file.path)?.get(options.name);
    if(def&&facts.has(def.id))roots.push(def.id);else throw new Error('No declaration named '+options.name+' in '+fileName);
  }
  const rootSet=new Set(roots),required=new Set(roots),queue=[...roots],symbols=new Map(graph.symbols.map(symbol=>[symbol.id,symbol]));
  const declaration=(id:string):string|undefined=>{
    const visited=new Set<string>();
    while(!facts.has(id)&&!visited.has(id)){visited.add(id);const owner=symbols.get(id)?.owner;if(!owner)return undefined;id=owner;}
    return facts.has(id)?id:undefined;
  };
  const consumers=new Set<string>(),consumerModules=new Map<string,Set<import('./ast.ts').TopLevel>>(),consumerSuites=new Set<TestDecl>();
  const filesByIdentity=new Map([...checked.project.files.values()].map(file=>[semanticSourcePath(checked,file.path),file]));
  const addConsumer=(from:string,span:Span)=>{
    const caller=declaration(from);
    if(caller)return caller;
    if(from.startsWith('module:')) {
      const sourceFile=filesByIdentity.get(span.file),item=sourceFile?.items.find(item=>item.span.start<=span.start&&span.end<=item.span.end);
      if(item?.kind==='test')consumerSuites.add(item);
      else if(item){const items=consumerModules.get(span.file)??new Set();items.add(item);consumerModules.set(span.file,items);}
    }
  };
  if(mode!=='implementation') {
    const pending=[...roots],seen=new Set(pending);
    for(let index=0;index<pending.length;index++) {
      const include=(from:string,span:Span)=>{const caller=addConsumer(from,span);if(caller){consumers.add(caller);if(!seen.has(caller)){seen.add(caller);pending.push(caller);}}};
      for(const edge of graph.relationships)if(['call','callback-call','function-value','implements','inherits','injected','export','internal','interceptor'].includes(edge.kind)&&declaration(edge.to)===pending[index])include(edge.from,edge.location);
      for(const occurrence of graph.occurrences)if(['type','read','write'].includes(occurrence.role)&&occurrence.caller&&declaration(occurrence.symbol)===pending[index])include(occurrence.caller,{...occurrence});
    }
  }

  const addDependency=(id:string|undefined)=>{if(id&&!required.has(id)){required.add(id);queue.push(id);}};
  const typeFacts=new Map<string,ResolvedTypeFact>(),constructs=new Set<string>(),effectBoundaries:SemanticGraph['boundaries']=[];
  const scanned=new WeakSet<object>(),selectedSpans:Span[]=[],selectedSuites=new Set<TestDecl>();
  const location=(span:Span):Span=>({...span,file:semanticSourcePath(checked,span.file)});
  const type=(value:Ty|undefined):void=>{
    if(!value||value.kind==='error')return;
    const display=tyName(value),key=value.id+'\0'+display;
    if(typeFacts.has(key))return;
    typeFacts.set(key,{id:value.id,name:value.name,display,kind:value.kind,arguments:value.args.map(tyName),nullable:value.nullable,
      immutable:!!value.frozen,definition:value.def?location(value.def.node.span):undefined});
    addDependency(value.def?.id);value.args.forEach(type);
  };
  const scan=(value:unknown):void=>{
    if(!value||typeof value!=='object'||scanned.has(value))return;scanned.add(value);if(Array.isArray(value)){value.forEach(scan);return;}
    type(checked.resolvedTypes.get(value as TypeRef));type(checked.expressionTypes.get(value as Expr));
    const method=value as import('./ast.ts').MethodDecl;
    if(method.kind)constructs.add(method.kind);
    if('ownership' in value&&value.ownership==='own'||'returnOwnership' in value&&value.returnOwnership==='own'||checked.inferredOwned.has(value as import('./ast.ts').Stmt))constructs.add('own');
    if(method.kind==='function') {
      const contract=checked.callableContracts.get(method);type(contract?.result);contract?.errors.forEach(type);
      for(const [key,effect] of checked.effectContracts.get(method)?.uses ?? []) {
        type(effect.capability);
        if(key.startsWith('C:')) {
          addDependency(key.slice(2));effectBoundaries.push({kind:'native-code',target:key.slice(2),location:location(effect.span)});
        }
      }
      for(const layer of checked.interceptorPlans.get(method)??[]){addDependency(layer.definition.id);layer.errors.forEach(type);}
    }
    if(method.kind as string==='class') {
      const node=value as import('./ast.ts').ClassDecl;
      checked.constructorContracts.get(node)?.errors.forEach(type);
      for(const layer of checked.interceptorPlans.get(node)??[]){addDependency(layer.definition.id);layer.errors.forEach(type);}
    }
    for(const [key,child] of Object.entries(value))if(key!=='span'&&!key.endsWith('Span'))scan(child);
  };
  // A composition module has statements rather than a declaration. Its actual
  // implementation and explicitly imported contracts are mandatory context.
  if(!roots.length) {
    scan(file.items);
    for(const item of file.items)if(item.kind==='import')for(const def of checked.project.imports.get(item)??[])addDependency(def.id);
  }
  const contained=(outer:Span,inner:Span)=>outer.file===inner.file&&outer.start<=inner.start&&inner.end<=outer.end;
  const scanSelected=(item:import('./ast.ts').TopLevel)=>{
    scan(item);const span=location(declarationSourceSpan(item));selectedSpans.push(span);
    for(const relation of graph.relationships)if(contained(span,relation.location)&&['call','callback-call','function-value','test'].includes(relation.kind))addDependency(declaration(relation.to));
  };
  consumers.forEach(addDependency);
  for(const items of consumerModules.values())items.forEach(scanSelected);
  const suites=[...checked.project.files.values()].filter(file=>!file.builtin&&!file.package).flatMap(file=>file.items.filter((item):item is TestDecl=>item.kind==='test'));
  // A suite can be relevant through its subject or through calls made by setup
  // and cases. Follow its checked dependencies without treating it as evidence.
  let processed=0;
  for(;;) {
    for(;processed<queue.length;processed++) {
      const id=queue[processed],def=definitions.get(id);if(def)scan(def.node);
      for(const relation of graph.relationships)if(declaration(relation.from)===id&&['call','callback-call','function-value','implements','inherits','injected','interceptor'].includes(relation.kind))addDependency(declaration(relation.to));
    }
    let added=false;
    for(const suite of suites)if(!selectedSuites.has(suite)) {
      const subject=checked.project.scopes.get(suite.span.file)?.get(suite.type.name)?.id;
      if(consumerSuites.has(suite)||subject&&required.has(subject)){selectedSuites.add(suite);scanSelected(suite);added=true;}
    }
    if(!added&&processed===queue.length)break;
  }
  const normalize=<T>(value:T):T=>{
    if(Array.isArray(value))return value.map(normalize) as T;
    if(!value||typeof value!=='object')return value;
    return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,key==='file'&&typeof child==='string'&&checked.project.files.has(child)?semanticSourcePath(checked,child):normalize(child)])) as T;
  };
  const boundaryRelevant=(span:Span)=>queue.some(id=>{
    const selected=declarationSourceSpan(definitions.get(id)!.node);return contained(location(selected),span);
  })||selectedSpans.some(selected=>contained(selected,span))||!roots.length&&span.file===semanticSourcePath(checked,file.path);
  const boundaries=[...graph.boundaries.filter(boundary=>boundaryRelevant(boundary.location)),...effectBoundaries];
  const callers=graph.relationships.filter(edge=>['call','callback-call','function-value','interceptor'].includes(edge.kind)&&rootSet.has(declaration(edge.to)??''));
  const full:ContextPacket={schema:3,compiler:graph.compiler,revision:graph.revision,budget,truncated:false,status:'ready',minimumBudget:0,budgetUnit:'utf16-code-units-with-newline',
    query:{file:semanticSourcePath(checked,file.path),name:options.name,roots,mode},
    ordering:'root-contract,root-source,resolved-types,dependency-contracts,callers,occurrences,imports',
    requirements:'not-supplied',behaviorDescriptions:'source-derived',
    coverage:{checkedProject:graph.coverage.checkedProject,checkedScope:graph.coverage.checkedScope,
      graph:boundaries.length?'bounded':'resolved',reverseCallers:graph.coverage.reverseCallers,
      mandatory:'complete',delivered:'complete',externalCallers:'outside-project'},
    evidence:{compiler:graph.coverage.errors?'rejected':'accepted',behavior:'not-run'},
    sources:graph.sources,configuration:graph.configuration,dependencies:graph.dependencies,contracts:[],snippets:[],types:[],reverseCallers:[],occurrences:[],boundaries,imports:[],tests:[],idioms:[],omissions:[]};
  const units:{section:'contracts'|'snippets'|'types'|'reverseCallers'|'occurrences'|'imports'|'tests'|'idioms';id:string;value:unknown;required:boolean}[]=[];
  const contract=(id:string)=>{
    const fact=facts.get(id)!;
    units.push({section:'contracts',id,value:normalize({...fact,documentation:undefined,tests:[],
      calls:graph.relationships.filter(edge=>edge.kind==='call'&&declaration(edge.from)===id).map(edge=>({target:edge.to,location:edge.location})),
      functionValues:graph.relationships.filter(edge=>['function-value','callback-call'].includes(edge.kind)&&declaration(edge.from)===id).map(edge=>({kind:edge.kind,target:edge.to,location:edge.location}))}),required:true});
  };
  const source=(id:string)=>{
    const fact=facts.get(id)!,sourceFile=checked.project.files.get(fact.location.file)!,span=declarationSourceSpan(definitions.get(id)!.node);
    units.push({section:'snippets',id,value:{id,source:sourceFile.source.slice(span.start,span.end)},required:true});
  };
  roots.forEach(contract);roots.forEach(source);
  if(!roots.length)units.push({section:'snippets',id:'module:'+semanticSourcePath(checked,file.path),value:{id:'module:'+semanticSourcePath(checked,file.path),source:file.source},required:true});
  for(const value of [...typeFacts.values()].sort((a,b)=>compare(a.id,b.id)||compare(a.display,b.display)))units.push({section:'types',id:value.id+':'+value.display,value,required:true});
  queue.filter(id=>!rootSet.has(id)).forEach(contract);
  for(const id of consumers)if(!rootSet.has(id))source(id);
  for(const [path,items] of [...consumerModules].sort(([left],[right])=>compare(left,right))){
    const sourceFile=filesByIdentity.get(path)!;
    for(const item of [...items].sort((left,right)=>left.span.start-right.span.start))units.push({section:'snippets',id:'module:'+path+':'+item.span.start,
      value:{id:'module:'+path+':'+item.span.start,source:sourceFile.source.slice(declarationSourceSpan(item).start,item.span.end)},required:true});
  }
  const availableTests=discoverTests(checked.project).tests;
  for(const suite of selectedSuites) {
    const sourceFile=checked.project.files.get(suite.span.file)!;
    const subject=checked.project.scopes.get(sourceFile.path)?.get(suite.type.name)?.id;
    if(subject)units.push({section:'tests',id:'test:'+semanticSourcePath(checked,sourceFile.path)+':'+suite.span.start,required:false,
      value:{id:'test:'+semanticSourcePath(checked,sourceFile.path)+':'+suite.span.start,subject,location:location(suite.span),source:sourceFile.source.slice(suite.span.start,suite.span.end),
        cases:availableTests.filter(unit=>unit.suite===suite).map(unit=>unit.id),origin:'author-supplied',independence:'not-assessed'}});
  }

  callers.forEach((value,index)=>units.push({section:'reverseCallers',id:String(index),value,required:true}));
  for(const value of graph.occurrences.filter(occurrence=>rootSet.has(declaration(occurrence.symbol)??'')))
    units.push({section:'occurrences',id:value.file+':'+value.start+':'+value.role,value,required:true});
  for(const value of idiomsFor(constructs))units.push({section:'idioms',id:value.id,value:{...value,verification:{...value.verification,compiler:graph.compiler}},required:false});
  for(const item of file.items)if(item.kind==='import')units.push({section:'imports',id:item.from.join('.'),required:false,
    value:{module:item.from.join('.'),names:(checked.project.imports.get(item)??[]).map(def=>def.id),location:location(item.span)}});
  const omitted:typeof units=[];
  const inventory=(pending:typeof units)=>{
    const entries=new Map<string,Omission>();
    for(const unit of pending) {
      const key=unit.section+':'+unit.required,entry=entries.get(key)??{section:unit.section,reason:'budget',required:unit.required,count:0};
      entry.count!++;entries.set(key,entry);
    }
    return [...entries.values()];
  };
  // Root obligations are indivisible. Reserve them and the omission inventory
  // before any optional fact; compact CLI framing includes its final newline.
  const rootUnits=units.filter(unit=>rootSet.has(unit.id)&&['contracts','snippets'].includes(unit.section)||!roots.length&&unit.id==='module:'+semanticSourcePath(checked,file.path));
  const remaining=units.filter(unit=>!rootUnits.includes(unit));
  for(const unit of rootUnits)(full[unit.section] as unknown[]).push(unit.value);
  full.omissions=inventory(remaining);
  full.coverage.mandatory=remaining.some(unit=>unit.required)?'incomplete':'complete';
  full.coverage.delivered=remaining.length?'truncated':'complete';full.truncated=remaining.length>0;
  for(let previous=-1;previous!==full.minimumBudget;){previous=full.minimumBudget;full.minimumBudget=JSON.stringify({...full,budget:full.minimumBudget}).length+1;}
  if(budget<full.minimumBudget) {
    const small:ContextPacket={schema:3,revision:graph.revision,budget,truncated:true,status:'budget-insufficient',minimumBudget:full.minimumBudget,
      coverage:{...full.coverage,mandatory:'incomplete',delivered:'truncated'},contracts:[],snippets:[],
      omissions:[{section:'target',reason:'budget',required:true}]};
    return small;
  }
  for(const [index,unit] of remaining.entries()) {
    full.omissions=inventory([...omitted,...remaining.slice(index+1)]);
    const list=full[unit.section] as unknown[];list.push(unit.value);
    if((!unit.required&&omitted.some(unit=>unit.required))||JSON.stringify(full).length+32>budget){list.pop();omitted.push(unit);}
  }
  full.omissions=inventory(omitted);
  full.coverage.mandatory=omitted.some(item=>item.required)?'incomplete':'complete';
  full.coverage.delivered=omitted.length?'truncated':'complete';full.truncated=omitted.length>0;
  const expanded=full.omissions.map(entry=>({...entry,ids:omitted.filter(unit=>unit.section===entry.section&&unit.required===entry.required).map(unit=>unit.id)}));
  if(JSON.stringify({...full,omissions:expanded}).length+1<=budget)full.omissions=expanded;
  else if(omitted.length)full.omissions.forEach(entry=>entry.reason='budget');

  return full;
}

/** A graph boundary needs an explicit operation-specific review before edits. */
export function hasRequiredContext(packet:ContextPacket):boolean {
  return packet.status==='ready'&&packet.coverage.checkedProject&&packet.coverage.reverseCallers==='complete'&&packet.coverage.graph==='resolved'&&packet.coverage.mandatory==='complete';
}
