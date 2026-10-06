import {choiceMembers} from './choices.ts';
import {workerMapTemplate} from './worker-mapping.ts';
import type {ClassDecl, Diagnostic, Expr, MethodDecl, Span, TypeRef} from './ast.ts';
import {fieldsOf, initializationOf} from './ast.ts';
import type {CheckedProject} from './checker.ts';
import type {Definition} from './project.ts';
import {errorNames} from './builtins.ts';
import type {Ty} from './types.ts';

/** Check the complete reachable boundary before a task can enter a private heap.
 * Native worker safety is an explicit package-author assertion, not ABI inference. */
export function checkWorkers(checked:CheckedProject):Diagnostic[] {
  const {project}=checked, diagnostics:Diagnostic[]=[];
  const issue=(span:Span,message:string)=>diagnostics.push({...span,code:'WORKER',message});
  function visit(value:unknown,fn:(value:any)=>void) {
    if(!value||typeof value!=='object')return;
    if((value as {kind?:string}).kind==='test')return;
    if(Array.isArray(value)){for(const item of value)visit(item,fn);return;}
    fn(value);
    for(const [key,item] of Object.entries(value))if(key!=='span'&&key!=='source')visit(item,fn);
  }
  function resolve(ref:TypeRef,file:string,parameters:Map<string,Ty>):Ty|undefined {
    const parameter=parameters.get(ref.name);if(parameter)return parameter;
    const def=project.scopes.get(file)?.get(ref.name);
    const args=ref.args.map(arg=>resolve(arg,file,parameters));
    if(args.some(arg=>!arg))return;
    return {id:def?.id??'builtin:'+ref.name,name:ref.name,def,kind:def?.node.kind==='class'?'class':def?.node.kind==='choice'?'choice':def?.node.kind==='resource'?'resource':'builtin',args:args as Ty[],nullable:ref.nullable};
  }
  function copyable(type:Ty|undefined,seen=new Set<string>()):boolean {
    if(!type||['resource','interface','param','error','interceptor'].includes(type.kind))return false;
    if(errorNames.includes(type.name) && type.name !== 'Error')return true;
    if(['int','c_int','float','bool','string','void','null','Bytes','Json'].includes(type.name))return true;
    if(['List','Map','Set','Tuple'].includes(type.name))return type.args.every(arg=>copyable(arg,seen));
    if(type.kind==='choice'){if(seen.has(type.id))return true;seen.add(type.id);const members=choiceMembers(project,type);return !!members&&members.every(member=>copyable(member,seen));}
    const node=type.def?.node;
    if(node?.kind!=='class'||(!node.record&&!node.implements.some(ref=>ref.name==='Error'))||node.annotations?.length||node.methods.some(method=>method.name==='drop'))return false;
    const fingerprint=(value:Ty):string=>value.id+'<'+value.args.map(fingerprint).join(',')+'>';
    const identity=fingerprint(type);if(seen.has(identity))return true;seen.add(identity);
    const parameters=new Map(node.typeParams.map((name,index)=>[name,type.args[index]]));
    return fieldsOf(node).every(field=>!field.mutable&&!field.injected&&field.ownership==='managed'&&copyable(resolve(field.type,type.def!.file,parameters),seen));
  }
  function target(call:Extract<Expr,{kind:'call'}>,file:string):Definition|undefined {
    if(call.callee.kind==='name')return project.scopes.get(file)?.get(call.callee.name);
    const type=call.callee.kind==='member'?checked.expressionTypes.get(call.callee.object):undefined;
    return type?.def;
  }
  const starts=new Set<Extract<Expr,{kind:'start'}>>();
  const collect=(node:any)=>{if(node.kind==='start'&&node.worker)starts.add(node);};
  // A test has a synthesized entry point and only its reachable declarations.
  // Check that program, rather than unrelated original startup/test bodies.
  visit(project.main?.items,collect);
  for(const definition of project.definitions.values())if(!workerMapTemplate(project,definition))visit(definition.node,collect);
  const mappings=new Set<Extract<Expr,{kind:'start'}>>();
  for(const [expression,mapping] of checked.workerMaps){
    const argument:Expr={kind:'name',name:'value',span:expression.span};
    const call:Extract<Expr,{kind:'call'}>={kind:'call',callee:{kind:'name',name:(expression as Extract<Expr,{kind:'call'}>).args[mapping.transformationIndex].kind==='name'?((expression as Extract<Expr,{kind:'call'}>).args[mapping.transformationIndex] as Extract<Expr,{kind:'name'}>).name:mapping.transformation.name,span:expression.span},args:[argument],argLabels:['value'],typeArgs:[],span:expression.span};
    checked.expressionTypes.set(argument,mapping.input);checked.expressionTypes.set(call,mapping.result);
    const start:Extract<Expr,{kind:'start'}>={kind:'start',worker:true,call,span:expression.span};
    starts.add(start);mappings.add(start);
  }
  for(const start of starts){
    const call=start.call;if(call.kind!=='call')continue;
    if(call.callee.kind!=='name')issue(start.span,'Start a worker with a standalone function. Construct behavior objects and native resources inside that function.');
    for(const argument of call.args)if(!copyable(checked.expressionTypes.get(argument)))issue(argument.span,'A worker input must be copied data: scalars, records, bytes, JSON, or collections of copied data. Shared state, behavior objects, tasks, and native handles stay on their creating heap.');
    if(!copyable(checked.expressionTypes.get(call)))issue(call.span,'A worker must return copied data. Release native resources inside the worker and return their data.');
    const plan=checked.callPlans.get(call);
    if(plan?.ownerships?.some(mode=>mode==='own'||mode==='borrow'))issue(call.span,'Worker inputs are copied values. Remove own or borrow from the worker entry parameters.');
    const seen=new Set<object>();
    function contracts(node:MethodDecl|ClassDecl,file:string){
      const errors=node.kind==='class'?checked.constructorContracts.get(node)?.errors:checked.callableContracts.get(node)?.errors;
      for(const error of errors??[])if(!copyable(error))issue(start.span,`Worker error ${error.name} is not copied data. Use a concrete Error with copied fields.`);
      for(const layer of checked.interceptorPlans.get(node)??[]){
        if(layer.constructorKeys.some(Boolean)||layer.argumentBindings.some(Boolean))issue(start.span,'A worker interceptor cannot resolve bindings from the parent heap.');
        callable(layer.around,layer.definition.file);
      }
    }
    function reachesInterface(def:Definition,id:string,visited=new Set<string>()):boolean {
      if(def.id===id)return true;
      if(visited.has(def.id))return false;visited.add(def.id);
      const refs=def.node.kind==='class'?def.node.implements:def.node.kind==='interface'?def.node.extends:[];
      return refs.some(ref=>{const parent=project.scopes.get(def.file)?.get(ref.name);return !!parent&&reachesInterface(parent,id,visited);});
    }
    function declaration(def:Definition){
      if(def.node.kind==='function'){callable(def.node,def.file);return;}
      if(seen.has(def.node))return;seen.add(def.node);
      if(def.node.kind==='class'){
        contracts(def.node,def.file);
        for(const field of fieldsOf(def.node))if(field.injected)issue(start.span,`Construct ${def.name}'s dependencies inside the worker; its constructor resolves a parent binding.`);
        body(initializationOf(def.node),def.file);
        for(const method of def.node.methods)callable(method,def.file);
        for(const entry of checked.defaults.get(def.id)?.values()??[])callable(entry.method,entry.file);
      }else if(def.node.kind==='interface'){
        // Inspect every possible implementation, including inherited defaults.
        // This deliberately rejects a boundary that cannot be proved local.
        for(const implementation of project.definitions.values())if(implementation.node.kind==='class'&&reachesInterface(implementation,def.id))declaration(implementation);
        for(const method of def.node.methods)if(method.body)callable(method,def.file);
        for(const ref of def.node.extends){const parent=project.scopes.get(def.file)?.get(ref.name);if(parent)declaration(parent);}
      }
    }
    function body(value:unknown,file:string){
      visit(value,node=>{
        if(mappings.has(start)&&node.kind==='start')issue(start.span,'A mapWorkers transformation cannot start tasks, including through its reachable helpers.');
        if(node.kind==='serve'||node.kind==='handle'||node.kind==='yield')issue(start.span,'HTTP transport and streams remain on their creating heap.');
        if(node.kind==='resolve')issue(start.span,'Worker code cannot resolve bindings from the parent heap. Construct its dependencies locally.');
        const callback=checked.functionValues.get(node);if(callback?.target)declaration(callback.target);
        if(node.kind!=='call')return;
        const nested=node as Extract<Expr,{kind:'call'}>,plan=checked.callPlans.get(nested);
        const mapping=checked.workerMaps.get(nested);if(mapping){if(mappings.has(start))issue(start.span,'A mapWorkers transformation cannot schedule another worker mapping, including through its reachable helpers.');declaration(mapping.transformation);return;}
        if(plan?.bindingKeys.some(Boolean))issue(start.span,'Worker code cannot resolve parent bindings. Construct its dependencies inside the worker and pass them by label.');
        if(nested.callee.kind==='name'&&nested.callee.name==='arguments')issue(start.span,'Pass command-line data into a worker explicitly.');
        const def=target(nested,file);if(def)declaration(def);
      });
    }
    function callable(method:MethodDecl,file:string){
      if(seen.has(method))return;seen.add(method);
      if(method.endpoint)issue(start.span,`Worker code cannot enter HTTP endpoint ${method.name}. Keep HTTP transport on its creating heap.`);
      if(method.externC&&!checked.native.functions.get(method)?.workerSafe)issue(start.span,`Native call ${method.name} has no workerSafe contract. Its package must declare that independent instances can run on worker threads.`);
      contracts(method,file);body(method.body,file);
    }
    const def=target(call,start.span.file);
    if(def?.node.kind==='function'){
      if(def.node.params.some(param=>param.injected))issue(start.span,'Worker entry dependencies must be explicit copied inputs. Construct other dependencies inside the worker.');
      callable(def.node,def.file);
    }else issue(start.span,'Start a worker with a resolved standalone function.');
  }
  return diagnostics.filter((d,index,all)=>all.findIndex(other=>other.file===d.file&&other.line===d.line&&other.column===d.column&&other.message===d.message)===index);
}
