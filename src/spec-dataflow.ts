import {workerMapTemplate} from './worker-mapping.ts';
import {basename,dirname,join,relative} from 'node:path';
import {isStatement,type Expr,type MethodDecl,type SourceFile,type Span} from './ast.ts';
import type {CheckedProject} from './checker.ts';
import {semanticSourcePath,type SemanticGraph} from './symbols.ts';
import {tyName} from './types.ts';
import {callableResult} from './contracts.ts';
import {readingTestTitle} from './spec-reading.ts';

export interface FlowNode {id:string;label:string;category?:'local'|'package'|'entry'}
export interface FlowEdge {from:string;to:string;label:string;reply?:boolean;deferred?:boolean}
export interface FolderView {folder:string;path:string;files:SourceFile[]}
export interface DataFlowContract {from:string;to:string;operation:string;inputs:string;result:string;boundary:string;target:string;evidence:{caller:string;location:Span;role:'call'|'test'|'entry';context?:{name:string;anchor?:string}}[]}
export interface DataFlowView {nodes:FlowNode[];edges:FlowEdge[];contracts:DataFlowContract[]}
const compare=(a:string,b:string)=>a<b?-1:a>b?1:0;
const site=(span:Span)=>span.file+':'+span.start+':'+span.end;
const implementation=(file:SourceFile)=>basename(file.path)!=='export.aug'&&file.items.some(item=>item.kind!=='import'&&item.kind!=='export');

/** A folder is a reading level when it contains at least two implementation files,
 * including descendants. Export manifests do not inflate the threshold. */
export function diagramFolders(root:string,files:SourceFile[]):FolderView[]{
  const folders=new Set<string>();
  for(const file of files.filter(implementation)){
    let folder=dirname(relative(root,file.path)).replaceAll('\\','/');
    while(folder!=='.'){folders.add(folder);folder=dirname(folder).replaceAll('\\','/');}
  }
  return [...folders].sort(compare).flatMap(folder=>{
    const members=files.filter(file=>relative(root,file.path).replaceAll('\\','/').startsWith(folder+'/'));
    return members.filter(implementation).length>=2?[{folder,path:join(root,'.aug-spec','diagrams','folders',folder,'index.md'),files:members}]:[];
  });
}

/** Build requests and returned values from resolved calls, never from import
 * arrows or guesses about names. Each view groups one level of the folder tree. */
export function dataFlowView(checked:CheckedProject,graph:SemanticGraph,files:SourceFile[],root:string,folder=''):DataFlowView{
  const symbols=new Map(graph.symbols.map(symbol=>[symbol.id,symbol])),own=new Map(files.map(file=>[semanticSourcePath(checked,file.path),relative(root,file.path).replaceAll('\\','/')]));
  const packageNames=new Map([...checked.project.packages.roots].sort(([a],[b])=>compare(a,b)).map(([name,scope])=>['package/'+scope.name+'@'+scope.version,/^url_[0-9a-f]{20}$/.test(name)?scope.name:name]));
  const callerContext=(caller:string,location:Span):Pick<DataFlowContract['evidence'][number],'role'|'context'>=>{
    if(!caller.startsWith('module:'))return {role:'call'};
    const file=[...checked.project.files.values()].find(file=>semanticSourcePath(checked,file.path)===location.file);
    const contains=(span:Span)=>span.start<=location.start&&span.end>=location.end;
    const suite=file?.items.find(item=>item.kind==='test'&&contains(item.span));
    if(suite?.kind==='test'){
      const name=readingTestTitle(suite);
      return {role:'test',context:{name,anchor:'symbol-'+name}};
    }
    if(file?.items.some(item=>isStatement(item)&&contains(item.span)))return {role:'call',context:{name:'Startup',anchor:'startup'}};
    return {role:'call',context:{name:'Module context'}};
  };
  const calls=new Map<string,Extract<Expr,{kind:'call'}>>(),copies=new Map<string,Extract<Expr,{kind:'recordCopy'}>>(),actions=new Set([...checked.actions.keys()].map(expr=>site({...expr.span,file:semanticSourcePath(checked,expr.span.file)})));
  const declarations=new Map<string,MethodDecl>();
  for(const def of checked.project.definitions.values()){if(def.node.kind==='function')declarations.set(def.id,def.node);if('methods' in def.node)for(const method of def.node.methods)declarations.set(def.id+'/method/'+method.name,method);}
  const visit=(value:unknown):void=>{
    if(!value||typeof value!=='object')return;
    if(Array.isArray(value)){value.forEach(visit);return;}
    const node=value as {kind?:string;span?:Span};
    if(node.kind==='call'&&node.span)calls.set(site({...node.span,file:semanticSourcePath(checked,node.span.file)}),value as Extract<Expr,{kind:'call'}>);
    if(node.kind==='recordCopy'&&node.span)copies.set(site({...node.span,file:semanticSourcePath(checked,node.span.file)}),value as Extract<Expr,{kind:'recordCopy'}>);
    for(const [key,child] of Object.entries(value))if(key!=='span'&&key!=='source')visit(child);
  };
  files.forEach(file=>visit(file.items));
  const nodes=new Map<string,FlowNode>(),edges:FlowEdge[]=[],contracts:DataFlowView['contracts']=[];
  const group=(source:string):string=>{
    const path=own.get(source)??source;
    if(!own.has(source)&&path.startsWith('august/'))return folder?'august/'+path.split('/')[1]:'August libraries';
    if(!own.has(source)&&path.startsWith('package/')){const parts=path.split('/');return parts.slice(0,parts[1].startsWith('@')?3:2).join('/');}
    if(folder&&!path.startsWith(folder+'/'))return path.includes('/')?path.split('/')[0]:path;
    const local=folder?path.slice(folder.length+1):path;
    return local.includes('/')?(folder?folder+'/':'')+local.split('/')[0]:path;
  };
  const label=(id:string)=>id==='main.aug'?'Startup':packageNames.get(id)??(id.startsWith('package/')?id.slice(8).replace(/@(?:[0-9]|0\.0\.0-git)[^/]*$/,''):id.endsWith('.aug')?basename(id,'.aug'):id);
  const add=(id:string)=>{if(!nodes.has(id))nodes.set(id,{id,label:label(id),category:id==='HTTP requests'?'entry':id.startsWith('package/')||id.startsWith('august/')||id==='August libraries'?'package':'local'});};
  for(const file of files.filter(implementation)){
    const path=semanticSourcePath(checked,file.path);if(!folder||own.get(path)!.startsWith(folder+'/'))add(group(path));
  }
  for(const edge of graph.relationships){
    if(!['call','callback-call','forward'].includes(edge.kind))continue;
    const source=symbols.get(edge.from)?.location.file??(edge.from.startsWith('module:')?edge.from.slice(7):undefined),target=symbols.get(edge.to);
    if(!source||!target||!own.has(source)||folder&&!own.get(source)?.startsWith(folder+'/')&&!own.get(target.location.file)?.startsWith(folder+'/'))continue;
    const from=group(source),to=group(target.location.file);if(from===to)continue;
    const call=calls.get(site(edge.location)),copy=copies.get(site(edge.location)),candidate=call&&checked.workerMaps.get(call);
    const mapping=candidate?.transformation.id===target.id?candidate:undefined;
    const resolved=!mapping&&call?checked.resolvedCalls.get(call):undefined,plan=!mapping&&call?checked.callPlans.get(call):undefined;
    const declaration=declarations.get(target.id),constructor=checked.project.definitions.get(target.id)?.node;
    const params=resolved?.params??declaration?.params??(constructor?.kind==='class'?constructor.fields:[]);
    const inputs=params.flatMap((param,index)=>{
      if(param.injected)return [];
      const sourceIndex=plan?.sourceIndices[index],type=mapping?mapping.input:sourceIndex!==undefined&&call?checked.expressionTypes.get(call.args[sourceIndex]):checked.resolvedTypes.get(param.type);
      return [(param.label??param.name)+': '+(param.ownership==='own'||param.ownership==='borrow'?param.ownership+' ':'')+(type?tyName(type):param.type.name)];
    }).join(', ');
    const type=mapping?.result??(copy?checked.expressionTypes.get(copy)??checked.expressionTypes.get(copy.base):call?checked.expressionTypes.get(call):declaration&&callableResult(checked,declaration));
    const result=type?(declaration?.returnOwnership==='own'?'own ':'')+tyName(type):edge.kind==='forward'?'inherited result':'declared result';
    let operation=(target.owner?symbols.get(target.owner)?.name+'.':'')+target.name;
    const template=call?.callee.kind==='member'&&call.callee.object.kind==='name'&&call.callee.object.name==='transformation'&&call.callee.name==='apply'&&workerMapTemplate(checked.project,checked.project.scopes.get(call.span.file)?.get('_mapWorkerChunk'));
    const boundary=mapping?'isolated worker transformation':template?'compile-time target placeholder':constructor?.kind==='class'&&(constructor.record||constructor.implements.some(type=>type.name==='Error'))?'value construction':actions.has(site(edge.location))?'deferred HTTP action':edge.kind==='callback-call'?'deferred callback':resolved?.dispatch==='interface'?'interface dispatch':resolved?.node.kind==='function'&&resolved.node.externC?'native boundary':edge.kind==='forward'?'forwarded contract':'';
    if(template)operation='selected transformation';
    if(boundary==='deferred HTTP action'&&declaration?.endpoint)operation='on submission: '+declaration.endpoint.method+' '+declaration.endpoint.path;
    add(from);add(to);contracts.push({from,to,operation,inputs,result,boundary,target:target.id,evidence:[{caller:edge.from,location:edge.location,...callerContext(edge.from,edge.location)}]});
  }
  // HTTP entry points are declared external inputs. They are not inferred from
  // ordinary local function calls or from an assumed request ordering.
  for(const file of files)for(const node of file.items)if(node.kind==='function'&&node.endpoint){
    const source=semanticSourcePath(checked,file.path);if(folder&&!own.get(source)?.startsWith(folder+'/'))continue;
    const to=group(source),from='HTTP requests';add(from);add(to);
    const inputs=node.params.filter(param=>!param.injected).map(param=>(param.label??param.name)+': '+(checked.parameterTypes.get(param)?tyName(checked.parameterTypes.get(param)!):param.type.name)+(param.source?' from '+param.source.kind:'')).join(', ');
    const target=[...checked.project.definitions.values()].find(def=>def.node===node)!.id;
    contracts.push({from,to,operation:node.endpoint.method+' '+node.endpoint.path,inputs,result:tyName(callableResult(checked,node)),boundary:node.endpoint.streams?'HTTP stream':'HTTP endpoint',target,evidence:[{caller:'HTTP requests',location:{...node.span,file:source},role:'entry',context:{name:'HTTP requests',anchor:'symbol-'+node.name}}]});
  }
  // Keep the complete operation contracts in the table. The overview has at most
  // one request and one result arrow per pair of logical units.
  const pairs=new Map<string,DataFlowView['contracts']>();
  for(const contract of contracts.filter(contract=>contract.evidence.some(item=>item.role!=='test')&&contract.boundary!=='value construction'&&contract.boundary!=='compile-time target placeholder')){const key=contract.from+'\0'+contract.to;const list=pairs.get(key)??[];list.push(contract);pairs.set(key,list);}
  const dataLabel=(type:string)=>type.replace(/HttpResponse<([^<>]+)>/g,'$1 response').replace(/List<([^<>]+)>/g,'list of $1').replaceAll('<','‹').replaceAll('>','›');
  const summary=(items:string[])=>{const values=[...new Set(items)].sort(compare);return values.slice(0,2).join(' / ')+(values.length>2?' + '+(values.length-2)+' more':'');};
  for(const entries of pairs.values()){
    const first=entries[0];
    const operation=(entry:DataFlowView['contracts'][number])=>{const names=[...entry.inputs.matchAll(/(?:^|, )([A-Za-z_][A-Za-z0-9_]*):/g)].map(match=>match[1]);return entry.operation+(names.length?'('+names.slice(0,2).join(', ')+(names.length>2?', …':'')+')':'');};
    edges.push({from:first.from,to:first.to,deferred:entries.every(entry=>entry.boundary.startsWith('deferred')),label:entries.every(entry=>entry.boundary.startsWith('HTTP'))&&entries.length>1?entries.length+' HTTP routes':summary(entries.map(operation))});
    const results=entries.filter(entry=>entry.result!=='void'&&!entry.boundary.startsWith('deferred'));
    if(results.length)edges.push({from:first.to,to:first.from,label:summary(results.map(entry=>dataLabel(entry.result))),reply:true});
  }
  const merged=new Map<string,DataFlowContract>();
  for(const contract of contracts){
    const {evidence,...surface}=contract,key=JSON.stringify(surface),previous=merged.get(key);
    if(previous)previous.evidence.push(...evidence);else merged.set(key,{...surface,evidence:[...evidence]});
  }
  for(const contract of merged.values())contract.evidence=[...new Map(contract.evidence.map(item=>[item.caller+'\0'+site(item.location),item])).values()]
    .sort((a,b)=>compare(a.location.file,b.location.file)||a.location.start-b.location.start||compare(a.caller,b.caller));
  return {nodes:[...nodes.values()].sort((a,b)=>compare(a.id,b.id)),edges,contracts:[...merged.values()].sort((a,b)=>compare(a.from,b.from)||compare(a.to,b.to)||compare(a.operation,b.operation)||compare(a.inputs,b.inputs))};
}
