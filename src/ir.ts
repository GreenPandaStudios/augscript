import {createHash} from 'node:crypto';
import {relative} from 'node:path';
import {isStatement,fieldsOf,initializationOf,type Expr,type MethodDecl,type ClassDecl,type Stmt,type Span,type Param} from './ast.ts';
import {typeName} from './ast.ts';
import type {CheckedProject,CallPlan} from './checker.ts';
import type {Definition} from './project.ts';
import type {Ty} from './types.ts';
import type {NativeFunction} from './native-contracts.ts';
import {errorNames} from './builtins.ts';

export type IrInstruction = {span:Span}&(
  {op:'literal';out:number;value:string|boolean|null;numeric?:{kind:'int'|'float';text:string}}|
  {op:'copy';out:number;input:number}|{op:'clear';slot:number}|
  {op:'runtime';out:number;operation:string;args:number[];text?:string;number?:number}|
  {op:'call';out:number;function:string;args:number[];receiver?:number}|
  {op:'method';out:number;receiver:number;name:string;args:number[]}|
  {op:'start';out:number;function:string;receiver?:number;args:number[];owned:boolean[]}|
  {op:'wait';out:number;tasks:number[]}|{op:'checkpoint'}|
  {op:'native';out:number;binding:NativeFunction;args:number[];resources:Record<string,{id:string;release:string}>;error?:string;errorFactory?:string}|
  {op:'extern';out:number;name:string;types:string[];result:string;args:number[]}|
  {op:'object';out:number;type:string;fields:string[];owned:boolean[];methods:{name:string;function:string}[];record:boolean}|
  {op:'assert';input:number;expression:string}|{op:'throw';input:number}|{op:'take-error';out:number}|
  {op:'drop';slot:number}|{op:'binding-get';out:number;index:number}|{op:'binding-set';input:number;index:number}|
  {op:'scope-depth';out:number}|{op:'scope';action:'enter'|'leave'|'join'|'restore';depth?:number}|
  {op:'lock-depth';out:number}|{op:'lock';action:'leave'|'restore';depth?:number}|
  {op:'error-state';action:'save'|'restore';error:number;cancelled:number}
);
export type IrTerminator = {op:'jump';target:string}|{op:'branch';condition:number;then:string;otherwise:string}|
  {op:'error';failed:string;success:string}|{op:'error-type';type:string;then:string;otherwise:string}|
  {op:'cancel';then:string;otherwise:string}|
  {op:'null';input:number;then:string;otherwise:string}|{op:'return'};
export interface IrBlock {name:string;instructions:IrInstruction[];terminator:IrTerminator}
export interface IrFunction {name:string;span:Span;slots:number;parameters:number[];receiver?:number;owned:number[];failedResult?:boolean;blocks:IrBlock[]}
export interface AugustIR {
  format:1;sourceRevision:string;functions:IrFunction[];main:string;bindings:{function:string;shared:boolean}[];
  scoped:boolean[];test:boolean;
}

export class BackendUnsupported extends Error {
  readonly span:Span;readonly code='BACKEND_UNSUPPORTED';
  constructor(span:Span,feature:string){super('LLVM preview does not support '+feature+'. No C fallback occurred.');this.span=span;}
}

/** Checked, resolved execution IR. Source AST and semantic facts remain read-only. */
export function lowerToIR(checked:CheckedProject):AugustIR {
  if(checked.diagnostics.some(d=>d.severity!=='warning'))throw new Error('Cannot lower a rejected August project');
  return new Lowering(checked).lower();
}
class Lowering {
  readonly checked:CheckedProject;readonly names=new Map<string,string>();readonly functions:IrFunction[]=[];
  constructor(checked:CheckedProject){this.checked=checked;let i=0;for(const def of checked.project.definitions.values())this.names.set(def.id,'aug_fn_'+i++);}
  name(def:Definition){return this.names.get(def.id)!;}
  method(def:Definition,name:string){return this.name(def)+'_'+name;}
  binding(key:string){const i=this.checked.bindings.findIndex(b=>b.key===key);if(i<0)throw new Error('Missing checked binding '+key);return 'aug_resolve_'+i;}
  definition(file:string,name:string){return this.checked.project.scopes.get(file)?.get(name);}
  lower():AugustIR {
    const active=new Set<string>();
    const visit=(file:string)=>{if(active.has(file))return;active.add(file);for(const item of this.checked.project.files.get(file)?.items??[])if(item.kind==='import')for(const d of this.checked.project.imports.get(item)??[])visit(d.file);};
    for(const file of this.checked.project.files.values())if(!file.builtin)visit(file.path);
    for(const def of this.checked.project.definitions.values()){
      if(!active.has(def.file))continue;
      const node=def.node;
      if(node.kind==='interceptor')throw new BackendUnsupported(node.span,'interceptors');
      if(node.kind==='function'){
        if(node.endpoint)throw new BackendUnsupported(node.span,'HTTP endpoints');
        if(node.annotations?.length)throw new BackendUnsupported(node.span,'interceptor layers');
        if(node.body)this.add(def,this.name(def),node,node.params,node.body);
      }
      if(node.kind==='class'){
        if(node.annotations?.length)throw new BackendUnsupported(node.span,'constructor interceptor layers');
        const methods=[...node.methods];
        for(const entry of this.checked.defaults.get(def.id)?.values()??[])if(!methods.some(m=>m.name===entry.method.name))methods.push(entry.method);
        for(const method of methods)if(method.body)this.add(def,this.method(def,method.name),method,method.params,method.body,true);
        const body=new FunctionLowering(this,def.file,node.span,def);
        node.fields.forEach((param,i)=>body.parameter(param,i));
        body.instruction({op:'object',out:0,type:def.id,fields:fieldsOf(node).map(f=>f.name),owned:fieldsOf(node).map(f=>f.ownership==='own'),methods:methods.map(m=>({name:m.name,function:this.method(def,m.name)})),record:!!node.record});
        node.fields.forEach((param,i)=>{body.runtime('SET_FIELD',[0,body.parameters[i]],undefined,i);if(param.ownership==='own')body.instruction({op:'clear',slot:body.parameters[i]});});
        node.fields.forEach(param=>body.locals.delete(param.name));
        body.locals.set('self',0);
        for(const stmt of initializationOf(node))body.statement(stmt);
        if(node.record)body.runtime('FREEZE',[0]);
        this.functions.push({...body.finish(this.name(def)),failedResult:true});
      }
    }
    this.checked.bindings.forEach((binding,index)=>{
      const body=new FunctionLowering(this,binding.declaration.span.file,binding.declaration.span);
      if(binding.lifetime!=='fresh'){
        body.instruction({op:'binding-get',out:0,index});const create=body.block(),done=body.block();
        body.terminate({op:'null',input:0,then:create,otherwise:done});body.enter(done);body.terminate({op:'jump',target:'cleanup'});body.enter(create);
      }
      const args=binding.constructorKeys.map(key=>body.call(this.binding(key),[]));
      body.instruction({op:'call',out:0,function:this.name(binding.target),args});body.checkError();
      if(binding.lifetime!=='fresh')body.instruction({op:'binding-set',input:0,index});
      this.functions.push(body.finish('aug_resolve_'+index));
    });
    const main=this.checked.project.main;if(!main)throw new Error('LLVM executable requires main.aug');
    const body=new FunctionLowering(this,main.path,{file:main.path,start:0,end:main.source.length,line:1,column:1});
    for(const stmt of main.items)if(isStatement(stmt))body.statement(stmt);
    this.functions.push(body.finish('aug_main_body'));
    const project=this.checked.project,scopes=[...project.packages.scopes.values()];
    const hashes=[...project.files.values()].map(f=>{
      const scope=scopes.find(s=>f.path.startsWith(s.sourceRoot+'/'));
      const path=scope?scope.name+'@'+scope.version+'/'+relative(scope.sourceRoot,f.path):f.builtin?'august/'+relative(project.stdlibRoot!,f.path):relative(project.root,f.path);
      return [path.replaceAll('\\','/'),createHash('sha256').update(f.source).digest('hex')];
    }).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
    const dependencies=scopes.map(s=>({name:s.name,version:s.version,digest:s.digest,native:s.native?.bindingsSha256})).sort((a,b)=>a.name.localeCompare(b.name,'en'));
    return {format:1,sourceRevision:createHash('sha256').update(JSON.stringify({sources:hashes,configuration:project.config,dependencies})).digest('hex'),functions:this.functions,main:'aug_main_body',bindings:this.checked.bindings.map((b,i)=>({function:'aug_resolve_'+i,shared:b.lifetime==='shared'})),scoped:this.checked.bindings.map(b=>b.lifetime==='scoped'),test:!!this.checked.project.testMode};
  }
  add(def:Definition,name:string,method:MethodDecl,params:Param[],stmts:Stmt[],receiver=false){
    const body=new FunctionLowering(this,method.span.file,method.span,receiver?def:undefined);
    if(receiver){body.receiver=body.slot();body.locals.set('self',body.receiver);}
    params.forEach((p,i)=>body.parameter(p,i));stmts.forEach(s=>body.statement(s));this.functions.push(body.finish(name));
  }
}

type InstructionInput = IrInstruction extends infer I ? I extends IrInstruction ? Omit<I,'span'> : never : never;
class FunctionLowering {
  readonly generator:Lowering;readonly file:string;readonly span:Span;readonly owner?:Definition;
  readonly parameters:number[]=[];receiver?:number;readonly locals=new Map<string,number>();readonly owned=new Set<number>();
  private slots=1;private sequence=0;private source:Span;private error='cleanup';private returning='cleanup';
  private blocks:{name:string;instructions:IrInstruction[];terminator?:IrTerminator}[]=[];
  private current:{name:string;instructions:IrInstruction[];terminator?:IrTerminator};
  constructor(generator:Lowering,file:string,span:Span,owner?:Definition){this.generator=generator;this.file=file;this.span=span;this.source=span;this.owner=owner;this.current={name:'entry_body',instructions:[]};this.blocks.push(this.current);}
  slot(){return this.slots++;}
  block(){return 'block_'+this.sequence++;}
  enter(name:string){this.current={name,instructions:[]};this.blocks.push(this.current);}
  terminate(terminator:IrTerminator){this.current.terminator=terminator;}
  instruction(value:InstructionInput){if(this.current.terminator)this.enter(this.block());this.current.instructions.push({...value,span:this.source} as IrInstruction);}
  parameter(param:Param,index:number){const slot=this.slot();this.parameters[index]=slot;this.locals.set(param.name,slot);if(param.ownership==='own')this.owned.add(slot);}
  checkError(){const errors=this.block(),next=this.block();this.terminate({op:'cancel',then:this.returning,otherwise:errors});this.enter(errors);this.terminate({op:'error',failed:this.error,success:next});this.enter(next);}
  runtime(operation:string,args:number[],text?:string,number?:number){const out=this.slot();this.instruction({op:'runtime',out,operation,args,text,number});this.checkError();return out;}
  call(name:string,args:number[],receiver?:number){const out=this.slot();this.instruction({op:'call',out,function:name,args,receiver});this.checkError();return out;}
  literal(value:string|boolean|null,numeric?:{kind:'int'|'float';text:string}){const out=this.slot();this.instruction({op:'literal',out,value,numeric});return out;}
  private fieldIndex(object:Expr,name:string){const node=this.generator.checked.expressionTypes.get(object)?.def?.node;
    if(node?.kind==='class'){const i=fieldsOf(node).findIndex(f=>f.name===name);if(i>=0)return i;}
    if(name==='code')return 0;if(name==='message')return 1;throw new BackendUnsupported(object.span,'field '+name);
  }
  private field(name:string):number|undefined{const node=this.owner?.node;if(node?.kind!=='class')return;const i=fieldsOf(node).findIndex(f=>f.name===name);return i<0?undefined:i;}
  private arguments(expr:Extract<Expr,{kind:'call'}>,plan?:CallPlan){
    const source=expr.args.map(a=>this.expression(a));
    return plan?plan.sourceIndices.map((index,i)=>{if(index!==undefined)return source[index];const injected=plan.injectionSources?.[i];
      if(injected?.startsWith('self.'))return this.runtime('FIELD',[this.locals.get('self')!],undefined,this.field(injected.slice(5))!);
      if(injected){const slot=this.locals.get(injected);if(slot!==undefined)return slot;}
      return plan.bindingKeys[i]?this.call(this.generator.binding(plan.bindingKeys[i]!),[]):this.literal(null);
    }):source;
  }
  expression(expr:Expr):number {
    this.source=expr.span;
    if(expr.kind==='literal')return typeof expr.value==='number'?this.literal(null,{kind:expr.numericType??'int',text:expr.numericText??String(expr.value)}):this.literal(expr.value);
    if(expr.kind==='name'){
      const slot=this.locals.get(expr.name);if(slot!==undefined)return slot;
      const index=this.field(expr.name);if(index!==undefined)return this.runtime('FIELD',[this.locals.get('self')!],undefined,index);
      throw new BackendUnsupported(expr.span,'unresolved value '+expr.name);
    }
    if(expr.kind==='resolve')return this.call(this.generator.binding(expr.name+(expr.typeArgs.length?'<'+expr.typeArgs.map(typeName).join(',')+'>':'')),[]);
    if(expr.kind==='member')return this.runtime('FIELD',[this.expression(expr.object)],undefined,this.fieldIndex(expr.object,expr.name));
    if(expr.kind==='unary')return this.runtime('UNARY',[this.expression(expr.value)],expr.op);
    if(expr.kind==='binary'){
      const left=this.expression(expr.left);
      if(expr.op==='&&'||expr.op==='||'){
        const out=this.slot();this.instruction({op:'copy',out,input:left});const evaluate=this.block(),after=this.block();
        this.terminate({op:'branch',condition:left,then:expr.op==='&&'?evaluate:after,otherwise:expr.op==='&&'?after:evaluate});this.enter(evaluate);
        const right=this.expression(expr.right);this.instruction({op:'copy',out,input:right});this.terminate({op:'jump',target:after});this.enter(after);return out;
      }
      return this.runtime('BINARY',[left,this.expression(expr.right)],expr.op);
    }
    if(expr.kind==='collection'){
      const values=expr.items.map(item=>this.expression(item)),kind=this.generator.checked.expressionTypes.get(expr)?.name??expr.collection;
      if(kind==='Map'){const out=this.runtime('MAP',[]);for(let i=0;i<values.length;i+=2)this.runtime('MAP_SET',[out,values[i],values[i+1]]);return out;}
      return this.runtime(kind.toUpperCase(),values);
    }
    if(expr.kind==='wait'){
      const tasks=expr.tasks.map(task=>this.expression(task)),out=this.slot();this.instruction({op:'wait',out,tasks});this.checkError();return out;
    }
    if(expr.kind==='start'&&expr.call.kind==='call'){
      const call=expr.call,receiver=call.callee.kind==='member'?this.expression(call.callee.object):undefined;
      // Capture evaluation and injected dependencies in the parent. The child
      // receives those values; it never reevaluates an argument or resolves DI.
      const args=this.arguments(call,this.generator.checked.callPlans.get(call));
      const thunk=new FunctionLowering(this.generator,this.file,expr.span,this.owner);
      if(receiver!==undefined)thunk.receiver=thunk.slot();
      args.forEach((_,i)=>{const slot=thunk.slot();thunk.parameters[i]=slot;
        if(this.generator.checked.callPlans.get(call)?.ownerships?.[i]==='own')thunk.owned.add(slot);
      });
      const result=thunk.invoke(call,thunk.receiver,[...thunk.parameters]);thunk.instruction({op:'copy',out:0,input:result});
      if(thunk.owned.has(result))thunk.instruction({op:'clear',slot:result});
      const name='aug_task_thunk_'+this.generator.functions.length;
      this.generator.functions.push(thunk.finish(name));
      const out=this.slot();this.instruction({op:'start',out,function:name,receiver,args,owned:args.map((_,i)=>this.generator.checked.callPlans.get(call)?.ownerships?.[i]==='own')});
      this.generator.checked.callPlans.get(call)?.ownerships?.forEach((mode,i)=>{if(mode==='own')this.instruction({op:'clear',slot:args[i]});});
      this.checkError();return out;
    }
    if(expr.kind!=='call')throw new BackendUnsupported(expr.span,expr.kind+' expressions');
    const receiver=expr.callee.kind==='member'?this.expression(expr.callee.object):undefined;
    const args=this.arguments(expr,this.generator.checked.callPlans.get(expr));
    return this.invoke(expr,receiver,args);
  }
  private invoke(expr:Extract<Expr,{kind:'call'}>,receiver:number|undefined,args:number[]):number {
    this.source=expr.span;
    if(expr.callee.kind==='member'){
      const type=this.generator.checked.expressionTypes.get(expr.callee.object)!,name=expr.callee.name;
      const operations:Record<string,string>={
        'List.length':'LIST_LENGTH','List.get':'LIST_GET','List.at':'LIST_AT','List.append':'LIST_APPEND','Tuple.length':'TUPLE_LENGTH','Tuple.get':'TUPLE_GET',
        'Set.length':'SET_LENGTH','Set.add':'SET_ADD','Set.contains':'SET_CONTAINS','Map.length':'MAP_LENGTH','Map.get':'MAP_GET','Map.take':'MAP_TAKE','Map.contains':'MAP_CONTAINS','Map.set':'MAP_SET',
        'string.length':'STRING_LENGTH','string.bytes':'STRING_BYTES','string.split':'STRING_SPLIT','string.startsWith':'STRING_STARTS_WITH','string.isToken':'STRING_IS_TOKEN',
        'Bytes.length':'BYTES_LENGTH','Bytes.text':'BYTES_TEXT','Bytes.base64url':'BYTES_BASE64URL'
      };
      const operation=operations[type.name+'.'+name];if(operation)return this.runtime(operation,[receiver!,...args]);
      args=this.transferArguments(expr,args,false);
      const out=this.slot();this.instruction({op:'method',out,receiver:receiver!,name,args});
      if(this.generator.checked.callPlans.get(expr)?.returnOwnership==='own')this.owned.add(out);
      this.checkError();return out;
    }
    if(expr.callee.kind!=='name')throw new BackendUnsupported(expr.span,'indirect callable values');
    const name=expr.callee.name;
    if(name==='assert'){this.instruction({op:'assert',input:args[0],expression:this.generator.checked.project.files.get(this.file)?.source.slice(expr.args[0].span.start,expr.args[0].span.end)??'assertion'});this.checkError();return this.literal(null);}
    if(name==='int')return args[0];
    if(errorNames.includes(name)){
      const out=this.slot();this.instruction({op:'object',out,type:name,fields:[],owned:[],methods:[],record:false});return out;
    }
    if(name==='Shared'){
      const result=this.runtime('SHARED',[args[0]]);if(this.owned.has(args[0]))this.instruction({op:'clear',slot:args[0]});return result;
    }
    const builtins:Record<string,string>={print:'PRINT',arguments:'ARGUMENTS',c_int:'C_INT',read_file:'READ_FILE',write_file:'WRITE_FILE',base64url_decode:'BASE64URL_DECODE'};
    if(builtins[name])return this.runtime(builtins[name],args);
    if(['List','Tuple','Set','Map'].includes(name))return this.runtime(name.toUpperCase(),args);
    const def=this.generator.definition(this.file,name);if(!def)throw new BackendUnsupported(expr.span,'builtin '+name);
    if(def.node.kind==='function'&&def.node.externC){
      const binding=this.generator.checked.native.functions.get(def.node),out=this.slot();
      if(binding){
        args=this.transferArguments(expr,args,true);
        const resources:Record<string,{id:string;release:string}>={};
        for(const [node,resource] of this.generator.checked.native.resources){
          if(this.generator.checked.native.providers.get(node)!==this.generator.checked.native.providers.get(def.node))continue;
          const definition=this.generator.definition(node.span.file,node.name)!;resources[resource.module+'.'+resource.name]={id:definition.id,release:resource.release};
        }
        const error=this.generator.checked.native.errors.get(def.node);
        this.instruction({op:'native',out,binding,args,resources,error:error?.id,errorFactory:error&&this.generator.name(error)});
      }else{
        if(def.node.valueAbi)throw new BackendUnsupported(expr.span,'legacy AugValue native adapters');
        this.instruction({op:'extern',out,name:def.node.name,types:def.node.params.map(p=>p.type.name),result:def.node.returns.name,args});
      }
      if(def.node.returnOwnership==='own')this.owned.add(out);
      this.checkError();return out;
    }
    args=this.transferArguments(expr,args,false);
    const out=this.slot();this.instruction({op:'call',out,function:this.generator.name(def),args});
    if(def.node.kind==='function'&&def.node.returnOwnership==='own')this.owned.add(out);
    this.checkError();return out;
  }
  private transferArguments(expr:Extract<Expr,{kind:'call'}>,args:number[],native:boolean){
    const transferred=[...args],plan=this.generator.checked.callPlans.get(expr);
    plan?.ownerships?.forEach((mode,i)=>{
      if(mode!=='own')return;
      const temporary=this.slot();this.instruction({op:'copy',out:temporary,input:args[i]});
      this.instruction({op:'clear',slot:args[i]});transferred[i]=temporary;
      // Native marshalling can reject the input before ownership crosses the ABI.
      // The move helper clears this slot only after every input is valid.
      if(native)this.owned.add(temporary);
    });return transferred;
  }
  private scoped(stmts:Stmt[],composition=false){const locals=new Map(this.locals),owned=new Set(this.owned);for(const stmt of stmts)this.statement(stmt);
    if(composition&&!this.current.terminator)this.instruction({op:'scope',action:'join'});
    if(!this.current.terminator)for(const slot of this.owned)if(!owned.has(slot))this.instruction({op:'drop',slot});
    this.locals.clear();for(const [name,slot] of locals)this.locals.set(name,slot);
  }
  private tryAlways(stmt:Extract<Stmt,{kind:'try'}>){
    const outerError=this.error,outerReturn=this.returning,owned=new Set(this.owned);
    const caught=this.block(),failed=this.block(),returned=this.block(),cleanup=this.block(),finalized=this.block(),done=this.block();
    const depth=this.slot(),locks=this.slot(),pending=this.slot(),cancelled=this.slot(),returning=this.slot(),failure=this.slot();
    this.instruction({op:'scope-depth',out:depth});this.instruction({op:'lock-depth',out:locks});
    this.instruction({op:'copy',out:returning,input:this.literal(false)});this.instruction({op:'copy',out:failure,input:this.literal(false)});
    this.error=caught;this.returning=returned;this.scoped(stmt.body);
    if(!this.current.terminator)this.terminate({op:'jump',target:cleanup});
    this.enter(caught);this.instruction({op:'lock',action:'restore',depth:locks});this.instruction({op:'scope',action:'join',depth});
    for(const slot of this.owned)if(!owned.has(slot))this.instruction({op:'drop',slot});
    this.instruction({op:'scope',action:'restore',depth});
    const handlers=this.block();this.terminate({op:'cancel',then:failed,otherwise:handlers});this.enter(handlers);this.error=failed;
    for(const clause of stmt.catches){
      const handler=this.block(),next=this.block();this.terminate({op:'error-type',type:this.generator.definition(this.file,clause.type.name)?.id??clause.type.name,then:handler,otherwise:next});this.enter(handler);
      const error=this.slot();this.instruction({op:'take-error',out:error});const names=new Map(this.locals);this.locals.set(clause.name,error);this.scoped(clause.body);
      this.locals.clear();for(const entry of names)this.locals.set(...entry);
      if(!this.current.terminator)this.terminate({op:'jump',target:cleanup});this.enter(next);
    }
    this.terminate({op:'jump',target:failed});this.enter(failed);this.instruction({op:'copy',out:failure,input:this.literal(true)});this.terminate({op:'jump',target:cleanup});
    this.enter(returned);this.instruction({op:'copy',out:returning,input:this.literal(true)});this.terminate({op:'jump',target:cleanup});
    this.enter(cleanup);this.instruction({op:'lock',action:'restore',depth:locks});this.instruction({op:'scope',action:'join',depth});
    for(const slot of this.owned)if(!owned.has(slot))this.instruction({op:'drop',slot});
    this.instruction({op:'scope',action:'restore',depth});this.instruction({op:'error-state',action:'save',error:pending,cancelled});
    this.error=finalized;this.returning=finalized;this.scoped(stmt.always!);
    if(!this.current.terminator)this.terminate({op:'jump',target:finalized});
    this.enter(finalized);this.instruction({op:'error-state',action:'restore',error:pending,cancelled});
    const returnedCheck=this.block(),errorCheck=this.block(),failedCheck=this.block();
    this.terminate({op:'cancel',then:outerReturn,otherwise:returnedCheck});this.enter(returnedCheck);
    this.terminate({op:'branch',condition:returning,then:outerReturn,otherwise:errorCheck});this.enter(errorCheck);
    this.terminate({op:'error',failed:outerError,success:failedCheck});this.enter(failedCheck);
    this.terminate({op:'branch',condition:failure,then:outerError,otherwise:done});this.enter(done);
    this.error=outerError;this.returning=outerReturn;
  }
  statement(stmt:Stmt):void {
    this.source=stmt.span;if(this.current.terminator)this.enter(this.block());
    if(stmt.kind==='expr'){const value=this.expression(stmt.expr);if(this.owned.has(value))this.instruction({op:'drop',slot:value});return;}
    if(stmt.kind==='assign'){
      const value=this.expression(stmt.value);this.source=stmt.span;
      let targetOwns=stmt.ownership==='own';
      if(stmt.target.kind==='name'){
        const field=this.field(stmt.target.name);
        if(!this.locals.has(stmt.target.name)&&field!==undefined){
          targetOwns ||= this.owner?.node.kind==='class'&&fieldsOf(this.owner.node)[field].ownership==='own';
          this.runtime('SET_FIELD',[this.locals.get('self')!,value],undefined,field);
        }
        else{let out=this.locals.get(stmt.target.name);if(out===undefined){out=this.slot();this.locals.set(stmt.target.name,out);}this.instruction({op:'copy',out,input:value});if(stmt.ownership==='own')this.owned.add(out);}
      }else if(stmt.target.kind==='member'){
        const fieldName=stmt.target.name;
        const node=this.generator.checked.expressionTypes.get(stmt.target.object)?.def?.node;
        targetOwns ||= node?.kind==='class'&&fieldsOf(node).some(field=>field.name===fieldName&&field.ownership==='own');
        this.runtime('SET_FIELD',[this.expression(stmt.target.object),value],undefined,this.fieldIndex(stmt.target.object,stmt.target.name));
      }
      if(targetOwns&&this.owned.has(value))this.instruction({op:'clear',slot:value});return;
    }
    if(stmt.kind==='return'){
      if(stmt.value){const value=this.expression(stmt.value);this.instruction({op:'copy',out:0,input:value});if(this.owned.has(value))this.instruction({op:'clear',slot:value});}
      this.terminate({op:'jump',target:this.returning});return;
    }
    if(stmt.kind==='throw'){this.instruction({op:'throw',input:this.expression(stmt.value)});this.terminate({op:'jump',target:this.error});return;}
    if(stmt.kind==='unsafe'||stmt.kind==='borrow'){this.scoped(stmt.body);return;}
    if(stmt.kind==='scope'){
      this.instruction({op:'scope',action:'enter'});this.scoped(stmt.body,true);
      if(!this.current.terminator){this.instruction({op:'scope',action:'leave'});this.checkError();}return;
    }
    if(stmt.kind==='lock'){
      const names=new Map(this.locals),value=this.runtime('SHARED_LOCK',[this.expression(stmt.value)]);this.locals.set(stmt.name,value);
      this.scoped(stmt.body);this.locals.clear();for(const entry of names)this.locals.set(...entry);
      if(!this.current.terminator){this.instruction({op:'lock',action:'leave'});this.checkError();}return;
    }
    if(stmt.kind==='if'){
      const condition=this.expression(stmt.test),yes=this.block(),no=this.block(),done=this.block();this.terminate({op:'branch',condition,then:yes,otherwise:no});
      this.enter(yes);this.scoped(stmt.then);if(!this.current.terminator)this.terminate({op:'jump',target:done});
      this.enter(no);this.scoped(stmt.otherwise);if(!this.current.terminator)this.terminate({op:'jump',target:done});this.enter(done);return;
    }
    if(stmt.kind==='match'){
      const value=this.expression(stmt.value),done=this.block();
      // Match literals are checked constants. Keep the source ordering used by
      // the reference backend, while evaluating the matched value only once.
      const literals=stmt.cases.map(clause=>clause.literal?this.expression(clause.literal):undefined);
      for(const [index,clause] of stmt.cases.entries()){
        const body=this.block(),next=this.block();
        if(clause.pattern==='else')this.terminate({op:'jump',target:body});
        else if(clause.pattern==='null'||clause.pattern==='some')this.terminate({op:'null',input:value,then:clause.pattern==='null'?body:next,otherwise:clause.pattern==='null'?next:body});
        else{
          const condition=clause.pattern==='type'?this.runtime('IS_TYPE',[value],this.generator.definition(this.file,clause.type!.name)?.id??clause.type!.name):this.runtime('BINARY',[value,literals[index]!],'==');
          this.terminate({op:'branch',condition,then:body,otherwise:next});
        }
        this.enter(body);const names=new Map(this.locals);if(clause.name)this.locals.set(clause.name,value);
        this.scoped(clause.body);this.locals.clear();for(const entry of names)this.locals.set(...entry);
        if(!this.current.terminator)this.terminate({op:'jump',target:done});this.enter(next);
      }
      this.terminate({op:'jump',target:done});this.enter(done);return;
    }
    if(stmt.kind==='while'){
      const test=this.block(),body=this.block(),done=this.block();this.terminate({op:'jump',target:test});this.enter(test);
      this.instruction({op:'checkpoint'});this.checkError();
      const condition=this.expression(stmt.test);this.terminate({op:'branch',condition,then:body,otherwise:done});this.enter(body);this.scoped(stmt.body);
      if(!this.current.terminator)this.terminate({op:'jump',target:test});this.enter(done);return;
    }
    if(stmt.kind==='freeze'){const value=this.expression(stmt.value),out=this.runtime('FREEZE',[value]);this.locals.set(stmt.name,out);if(this.owned.has(value))this.instruction({op:'clear',slot:value});return;}
    if(stmt.kind==='destructure'){
      const value=this.expression(stmt.value);stmt.names.forEach((name,i)=>this.locals.set(name,this.runtime('TUPLE_GET',[value,this.literal(null,{kind:'int',text:String(i)})])));return;
    }
    if(stmt.kind==='for'){
      const iterable=this.expression(stmt.iterable),map=this.generator.checked.expressionTypes.get(stmt.iterable)?.name==='Map'&&stmt.names.length===2;
      const values=this.runtime(map?'MAP_ITER':'ITER',[iterable]),index=this.slot(),one=this.literal(null,{kind:'int',text:'1'});this.instruction({op:'copy',out:index,input:this.literal(null,{kind:'int',text:'0'})});
      const length=this.runtime('LIST_LENGTH',[values]),test=this.block(),body=this.block(),done=this.block();this.terminate({op:'jump',target:test});this.enter(test);
      this.instruction({op:'checkpoint'});this.checkError();
      const condition=this.runtime('BINARY',[index,length],'<');this.terminate({op:'branch',condition,then:body,otherwise:done});this.enter(body);
      const names=new Map(this.locals);
      if(map){stmt.names.forEach(name=>{this.locals.set(name,this.runtime('LIST_GET',[values,index]));this.instruction({op:'copy',out:index,input:this.runtime('BINARY',[index,one],'+')});});}
      else{const item=this.runtime('LIST_GET',[values,index]);stmt.names.forEach((name,i)=>this.locals.set(name,stmt.names.length===1?item:this.runtime('TUPLE_GET',[item,this.literal(null,{kind:'int',text:String(i)})])));this.instruction({op:'copy',out:index,input:this.runtime('BINARY',[index,one],'+')});}
      this.scoped(stmt.body);this.locals.clear();for(const entry of names)this.locals.set(...entry);
      if(!this.current.terminator)this.terminate({op:'jump',target:test});this.enter(done);return;
    }
    if(stmt.kind==='try'){
      if(stmt.always){this.tryAlways(stmt);return;}
      const outer=this.error,failed=this.block(),done=this.block(),owned=new Set(this.owned),depth=this.slot(),locks=this.slot();
      this.instruction({op:'scope-depth',out:depth});this.instruction({op:'lock-depth',out:locks});this.error=failed;this.scoped(stmt.body);
      if(!this.current.terminator)this.terminate({op:'jump',target:done});this.enter(failed);this.error=outer;
      this.instruction({op:'lock',action:'restore',depth:locks});this.instruction({op:'scope',action:'join',depth});
      for(const slot of this.owned)if(!owned.has(slot))this.instruction({op:'drop',slot});
      this.instruction({op:'scope',action:'restore',depth});
      stmt.catches.forEach(clause=>{const handler=this.block(),next=this.block();this.terminate({op:'error-type',type:this.generator.definition(this.file,clause.type.name)?.id??clause.type.name,then:handler,otherwise:next});this.enter(handler);
        const error=this.slot();this.instruction({op:'take-error',out:error});const names=new Map(this.locals);this.locals.set(clause.name,error);this.scoped(clause.body);this.locals.clear();for(const entry of names)this.locals.set(...entry);
        if(!this.current.terminator)this.terminate({op:'jump',target:done});this.enter(next);
      });this.terminate({op:'jump',target:outer});this.enter(done);return;
    }
    throw new BackendUnsupported(stmt.span,stmt.kind+' statements');
  }
  finish(name:string):IrFunction {
    if(!this.current.terminator)this.terminate({op:'jump',target:'cleanup'});
    this.enter('cleanup');this.terminate({op:'return'});
    return {name,span:this.span,slots:this.slots,parameters:this.parameters,receiver:this.receiver,owned:[...this.owned],blocks:this.blocks as IrBlock[]};
  }
}
