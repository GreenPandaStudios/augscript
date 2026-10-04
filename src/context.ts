import {idiomsFor} from './syntax-idioms.ts';
import {resolve} from 'node:path';
import type {Expr,Span,TypeRef} from './ast.ts';
import type {CheckedProject,Ty} from './checker.ts';
import {tyName} from './types.ts';
import {contractFacts,type ContractFact} from './contract-facts.ts';
import {semanticGraph,semanticSourcePath,type SemanticGraph,type SemanticEdge} from './symbols.ts';

interface ResolvedTypeFact {
  id:string; name:string; display:string; kind:string; arguments:string[];
  nullable:boolean; immutable:boolean; definition?:Span;
}
interface Omission {section:string; reason:string; required:boolean; ids?:string[]; count?:number}
export interface ContextPacket {
  schema:2; revision:string; budget:number; truncated:boolean;
  compiler?:SemanticGraph['compiler']; query?:{file:string;name?:string;roots:string[]};
  ordering?:string; requirements?:'not-supplied'; behaviorDescriptions?:'source-derived';
  coverage:{checkedProject:boolean; checkedScope:'project'|'import-closure'; graph:'resolved'|'bounded'; reverseCallers:'complete'|'incomplete';
    mandatory:'complete'|'incomplete'; delivered:'complete'|'truncated'; externalCallers:'outside-project'};
  evidence?:{compiler:'accepted'|'rejected';behavior:'not-run'};
  sources?:SemanticGraph['sources']; configuration?:SemanticGraph['configuration'];
  contracts:ContractFact[]; snippets:{id:string;source:string}[]; types?:ResolvedTypeFact[];
  reverseCallers?:SemanticEdge[]; occurrences?:SemanticGraph['occurrences']; boundaries?:SemanticGraph['boundaries'];
  imports?:{module:string;names:string[];location:Span}[]; idioms?:ReturnType<typeof idiomsFor>; omissions:Omission[];
}
const compare=(a:string,b:string)=>a<b?-1:a>b?1:0;

/** Context is checked compiler evidence about the starting program. Desired
 * requirements and independent acceptance results must be supplied separately. */
export function contextPacket(checked:CheckedProject,fileName:string,options:{name?:string;budget?:number}={},providedGraph?:SemanticGraph):ContextPacket {
  const file=checked.project.files.get(resolve(fileName));if(!file)throw new Error('Unknown source file '+fileName);
  const graph=providedGraph??semanticGraph(checked,true),budget=Math.max(512,Math.min(options.budget??12000,100000));
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
  const addDependency=(id:string|undefined)=>{if(id&&!required.has(id)){required.add(id);queue.push(id);}};
  const typeFacts=new Map<string,ResolvedTypeFact>(),constructs=new Set<string>(),effectBoundaries:SemanticGraph['boundaries']=[];
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
    if(!value||typeof value!=='object')return;if(Array.isArray(value)){value.forEach(scan);return;}
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
  for(let index=0;index<queue.length;index++) {
    const id=queue[index],def=definitions.get(id);if(def)scan(def.node);
    for(const relation of graph.relationships)if(declaration(relation.from)===id&&['call','implements','injected'].includes(relation.kind))addDependency(declaration(relation.to));
  }
  const normalize=<T>(value:T):T=>{
    if(Array.isArray(value))return value.map(normalize) as T;
    if(!value||typeof value!=='object')return value;
    return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,key==='file'&&typeof child==='string'&&checked.project.files.has(child)?semanticSourcePath(checked,child):normalize(child)])) as T;
  };
  const boundaryRelevant=(span:Span)=>queue.some(id=>{
    const fact=facts.get(id)!;return semanticSourcePath(checked,fact.location.file)===span.file&&fact.location.start<=span.start&&span.end<=fact.location.end;
  })||!roots.length&&span.file===semanticSourcePath(checked,file.path);
  const boundaries=[...graph.boundaries.filter(boundary=>boundaryRelevant(boundary.location)),...effectBoundaries];
  const callers=graph.relationships.filter(edge=>edge.kind==='call'&&rootSet.has(declaration(edge.to)??''));
  const full:ContextPacket={schema:2,compiler:graph.compiler,revision:graph.revision,budget,truncated:false,
    query:{file:semanticSourcePath(checked,file.path),name:options.name,roots},
    ordering:'root-contract,root-source,resolved-types,dependency-contracts,callers,occurrences,imports',
    requirements:'not-supplied',behaviorDescriptions:'source-derived',
    coverage:{checkedProject:graph.coverage.checkedProject,checkedScope:graph.coverage.checkedScope,
      graph:boundaries.length?'bounded':'resolved',reverseCallers:graph.coverage.reverseCallers,
      mandatory:'complete',delivered:'complete',externalCallers:'outside-project'},
    evidence:{compiler:graph.coverage.errors?'rejected':'accepted',behavior:'not-run'},
    sources:graph.sources,configuration:graph.configuration,contracts:[],snippets:[],types:[],reverseCallers:[],occurrences:[],boundaries,imports:[],idioms:[],omissions:[]};
  const units:{section:'contracts'|'snippets'|'types'|'reverseCallers'|'occurrences'|'imports'|'idioms';id:string;value:unknown;required:boolean}[]=[];
  const contract=(id:string)=>{
    const fact=facts.get(id)!;
    units.push({section:'contracts',id,value:normalize({...fact,documentation:undefined,tests:[],
      calls:graph.relationships.filter(edge=>edge.kind==='call'&&declaration(edge.from)===id).map(edge=>({target:edge.to,location:edge.location}))}),required:true});
  };
  const source=(id:string)=>{
    const fact=facts.get(id)!,sourceFile=checked.project.files.get(fact.location.file)!;
    units.push({section:'snippets',id,value:{id,source:sourceFile.source.slice(fact.location.start,fact.location.end)},required:true});
  };
  roots.forEach(contract);roots.forEach(source);
  if(!roots.length)units.push({section:'snippets',id:'module:'+semanticSourcePath(checked,file.path),value:{id:'module:'+semanticSourcePath(checked,file.path),source:file.source},required:true});
  for(const value of [...typeFacts.values()].sort((a,b)=>compare(a.id,b.id)||compare(a.display,b.display)))units.push({section:'types',id:value.id+':'+value.display,value,required:true});
  queue.filter(id=>!rootSet.has(id)).forEach(contract);
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
  // Reserve a compact inventory before adding facts. An optional import never
  // displaces the implementation or a required dependency contract.
  for(const [index,unit] of units.entries()) {
    full.omissions=inventory([...omitted,...units.slice(index+1)]);
    const list=full[unit.section] as unknown[];list.push(unit.value);
    if((!unit.required&&omitted.some(unit=>unit.required))||JSON.stringify(full).length+32>budget){list.pop();omitted.push(unit);}
  }
  full.omissions=inventory(omitted);
  full.coverage.mandatory=omitted.some(item=>item.required)?'incomplete':'complete';
  full.coverage.delivered=omitted.length?'truncated':'complete';full.truncated=omitted.length>0;
  // Include exact omitted identities whenever the packet has room. If not, say
  // explicitly that the inventory itself is summarized.
  const expanded=full.omissions.map(entry=>({...entry,ids:omitted.filter(unit=>unit.section===entry.section&&unit.required===entry.required).map(unit=>unit.id)}));
  if(JSON.stringify({...full,omissions:expanded}).length<=budget)full.omissions=expanded;
  else if(omitted.length)full.omissions.forEach(entry=>entry.reason='budget; identities summarized');
  if(JSON.stringify(full).length>budget) {
    const small:ContextPacket={schema:2,revision:graph.revision,budget,truncated:true,
      coverage:{...full.coverage,mandatory:'incomplete',delivered:'truncated'},contracts:[],snippets:[],
      omissions:[{section:'required-context-and-inventory',reason:'budget',required:true,count:units.length}]};
    return small;
  }
  return full;
}

/** A graph boundary needs an explicit operation-specific review before edits. */
export function hasRequiredContext(packet:ContextPacket):boolean {
  return packet.coverage.checkedProject&&packet.coverage.reverseCallers==='complete'&&packet.coverage.graph==='resolved'&&packet.coverage.mandatory==='complete';
}
