import {createHash} from 'node:crypto';
import {relative,resolve} from 'node:path';
import {isStatement,fieldsOf,initializationOf,type Expr,type MethodDecl,type ClassDecl,type MatchPattern,type BindingPattern,type Stmt,type Span,type Param} from './ast.ts';
import {typeName} from './ast.ts';
import type {CheckedProject,CallPlan,InterceptorLayer} from './checker.ts';
import type {Definition} from './project.ts';
import type {Ty} from './types.ts';
import type {NativeFunction} from './native-contracts.ts';
import {errorNames,builtinProperties} from './builtins.ts';
import {DataSchemas,schemaType,type DataSchema} from './schemas.ts';
import {runtimeAdapters,adapterSymbol} from './runtime-adapters.ts';
import {generateOpenApi,apiExplorer,apiExplorerScript} from './openapi.ts';
import {actionSchema,actionTransport} from './actions.ts';
import {httpPolicyNames,type HttpPolicyPlan} from './http-policies.ts';
import type {Config} from './config.ts';
import {interceptorChain,InterceptorInvocation} from './interceptors.ts';
import {verifyIR} from './ir-verify.ts';
import {isIRScalar} from './ir-types.ts';

export interface IrHttpPolicy {kind:number;permission:string;amount:number;seconds:number;credentials:boolean;origins:string;headers:string}
export interface IrRoute {method:string;path:string;function:string;stream:number;status:number;policies:IrHttpPolicy[]}

export type IrInstruction = {span:Span;debugScope?:string}&(
  {op:'literal';out:number;value:string|boolean|null;numeric?:{kind:'int'|'float';text:string}}|
  {op:'copy';out:number;input:number}|{op:'clear';slot:number}|
  {op:'cover';file:string;line:number}|
  {op:'debug-variable';variable:number}|
  {op:'runtime';out:number;operation:string;args:number[];text?:string;number?:number}|
  {op:'decode';out:number;input:number;schema:string;format:'json'|'form'}|
  {op:'adapter';out:number;name:string;args:number[]}|
  {op:'html';out:number;tag:string;attributes:number[];children:number[]}|
  {op:'http-bind';out:number;request:number;source:string;name:string;schema?:string}|
  {op:'http-policy';policy:IrHttpPolicy;args:number[]}|
  {op:'http-failure';out:number;errors:{type:string;status:number}[]}|
  {op:'routes';out?:number;name:string;port?:number}|
  {op:'call';out:number;function:string;args:number[];receiver?:number}|
  {op:'method';out:number;receiver:number;name:string;args:number[]}|
  {op:'start';out:number;function:string;receiver?:number;args:number[];owned:boolean[];worker?:boolean}|
  {op:'wait';out:number;tasks:number[]}|{op:'checkpoint'}|
  {op:'native';out:number;binding:NativeFunction;args:number[];resources:Record<string,{id:string;release:string}>;error?:string;errorFactory?:string}|
  {op:'extern';out:number;name:string;types:string[];result:string;args:number[]}|
  {op:'object';out:number;type:string;fields:string[];owned:boolean[];methods:{name:string;function:string}[];record:boolean}|
  {op:'assert';input:number;expression:string}|{op:'assert-equal';actual:number;expected:number;expression:string}|{op:'throw';input:number}|{op:'take-error';out:number}|
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
export interface IrType {id:string;name:string;args:IrType[];nullable:boolean;optional:boolean}
export interface IrValue {storage:'rooted-value'|'scalar-value';type:IrType;span:Span}
export interface IrVariable {name:string;slot:number;span:Span;type:IrType;argument?:number;scope?:string}
export interface IrLexicalScope {name:string;parent?:string;span:Span}
export interface IrFunction {name:string;sourceName:string;span:Span;slots:number;values:IrValue[];variables:IrVariable[];scopes:IrLexicalScope[];parameters:number[];receiver?:number;owned:number[];constructorResults:number[];failedResult?:boolean;blocks:IrBlock[]}
export interface AugustIR {
  format:1;sourceRevision:string;functions:IrFunction[];main:string;bindings:{function:string;shared:boolean}[];
  scoped:boolean[];test:boolean;schemas:DataSchema[];components:string[];
  routes:{name:string;items:IrRoute[]}[];web:Config['web'];
  coverage:{file:string;line:number}[];
}
const dynamicType:IrType={id:'compiler:dynamic',name:'Data',args:[],nullable:true,optional:false};
const scalarType=(name:string):IrType=>({id:'builtin:'+name,name,args:[],nullable:false,optional:false});
const irType=(type:Ty):IrType=>({id:type.id,name:type.name,args:type.args.map(irType),nullable:type.nullable,optional:!!type.optional});

export class BackendUnsupported extends Error {
  readonly span:Span;readonly code='BACKEND_UNSUPPORTED';
  constructor(span:Span,feature:string){super('LLVM preview does not support '+feature+'. No C fallback occurred.');this.span=span;}
}

/** Checked, resolved execution IR. Source AST and semantic facts remain read-only. */
export function lowerToIR(checked:CheckedProject,options:{coverage?:boolean}={}):AugustIR {
  if(checked.diagnostics.some(d=>d.severity!=='warning'))throw new Error('Cannot lower a rejected August project');
  const ir=new Lowering(checked,options).lower();verifyIR(ir);return ir;
}
class Lowering {
  private callbackSequence = 0;
  callbackName():string {return 'aug_callback_'+this.callbackSequence++;}
  readonly checked:CheckedProject;readonly names=new Map<string,string>();readonly functions:IrFunction[]=[];
  readonly schemas:DataSchemas;
  readonly components=new Set<string>();
  readonly routes:{name:string;items:IrRoute[]}[]=[];
  readonly coverage=new Map<string,{file:string;line:number}>();readonly options:{coverage?:boolean};
  constructor(checked:CheckedProject,options:{coverage?:boolean}){this.checked=checked;this.options=options;let i=0;for(const def of checked.project.definitions.values())this.names.set(def.id,'aug_fn_'+i++);this.schemas=new DataSchemas(checked.project,def=>this.name(def));}
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
      if(node.kind==='function'){
        if(node.body)this.add(def,this.name(def),node,node.params,node.body);
        else if(node.externC&&this.checked.interceptorPlans.get(node)?.length){
          const body=new FunctionLowering(this,def.file,node.span);node.params.forEach((param,index)=>body.parameter(param,index));body.nativeBody(def);
          this.functions.push(body.finish(interceptorChain(this.name(def),this.checked.interceptorPlans.get(node)??[]).body));this.layers(node,this.name(def),node.params,false);
        }
        if(node.endpoint){const body=new FunctionLowering(this,def.file,node.span);body.endpoint(def);this.functions.push(body.finish(this.name(def)+'_http'));this.components.add('http');}
      }
      if(node.kind==='class'||node.kind==='interceptor'){
        const methods=node.methods.filter(method=>node.kind!=='interceptor'||method.name!=='around');
        for(const entry of this.checked.defaults.get(def.id)?.values()??[])if(!methods.some(m=>m.name===entry.method.name))methods.push(entry.method);
        for(const method of methods)if(method.body)this.add(def,this.method(def,method.name),method,method.params,method.body,true);
        const body=new FunctionLowering(this,def.file,node.span,def);
        node.fields.forEach((param,i)=>body.parameter(param,i));
        body.instruction({op:'object',out:0,type:def.id,fields:fieldsOf(node).map(f=>f.name),owned:fieldsOf(node).map(f=>f.ownership==='own'),methods:methods.map(m=>({name:m.name,function:this.method(def,m.name)})),record:node.kind==='class'&&!!node.record});
        node.fields.forEach((param,i)=>{body.runtime('SET_FIELD',[0,body.parameters[i]],undefined,i);if(param.ownership==='own')body.instruction({op:'clear',slot:body.parameters[i]});});
        node.fields.forEach(param=>body.locals.delete(param.name));
        body.locals.set('self',0);
        if(node.kind==='class')for(const stmt of initializationOf(node))body.statement(stmt);
        if(node.kind==='class'&&node.record)body.runtime('FREEZE',[0]);
        const chain=node.kind==='class'?interceptorChain(this.name(def),this.checked.interceptorPlans.get(node)??[]):{body:this.name(def)};
        this.functions.push({...body.finish(chain.body),failedResult:true});
        if(node.kind==='class')this.layers(node,this.name(def),node.fields,false);
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
    for(let index=0;index<=main.items.length;index++){
      if(this.checked.project.testBodyStart===index)body.runtime('TEST_CASE',[]);
      const stmt=main.items[index];if(stmt&&isStatement(stmt))body.statement(stmt);
    }
    this.functions.push(body.finish('aug_main_body'));
    const project=this.checked.project,scopes=[...project.packages.scopes.values()];
    const hashes=[...project.files.values()].map(f=>{
      const scope=scopes.find(s=>f.path.startsWith(s.sourceRoot+'/'));
      const path=scope?scope.name+'@'+scope.version+'/'+relative(scope.sourceRoot,f.path):f.builtin?'august/'+relative(project.stdlibRoot!,f.path):relative(project.root,f.path);
      return [path.replaceAll('\\','/'),createHash('sha256').update(f.source).digest('hex')];
    }).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
    const dependencies=scopes.map(s=>({name:s.name,version:s.version,digest:s.digest,native:s.native?.bindingsSha256})).sort((a,b)=>a.name.localeCompare(b.name,'en'));
    const web=project.config.web,tls=Object.fromEntries(Object.entries(web.tls).map(([key,value])=>[key,value?resolve(project.root,value):''])) as Config['web']['tls'];
    return {format:1,sourceRevision:createHash('sha256').update(JSON.stringify({sources:hashes,configuration:project.config,dependencies})).digest('hex'),functions:this.functions,main:'aug_main_body',bindings:this.checked.bindings.map((b,i)=>({function:'aug_resolve_'+i,shared:b.lifetime==='shared'})),scoped:this.checked.bindings.map(b=>b.lifetime==='scoped'),test:!!this.checked.project.testMode,schemas:this.schemas.nodes,components:[...this.components].sort(),routes:this.routes,web:{...web,tls},coverage:[...this.coverage.values()].sort((a,b)=>a.file.localeCompare(b.file,'en')||a.line-b.line)};
  }
  policy(plan:HttpPolicyPlan):IrHttpPolicy {
    const options=plan.options;return {kind:httpPolicyNames.indexOf(plan.name)+1,permission:String(options.permission??''),amount:Number(options.requests??options.milliseconds??0),seconds:Number(options.seconds??0),credentials:!!options.credentials,origins:(options.origins as string[]??[]).join('\n'),headers:(options.headers as string[]??[]).map(header=>header.toLowerCase()).join(', ')};
  }
  routeTable(file:string,names:string[]){
    this.components.add('http');const name='aug_routes_'+this.routes.length;
    const items:IrRoute[]=names.map(name=>{const def=this.definition(file,name)!,fn=def.node as MethodDecl,endpoint=fn.endpoint!;
      return {method:endpoint.method,path:endpoint.path,function:this.name(def)+'_http',stream:endpoint.streams?fn.returns.name==='ServerEvent'?1:fn.returns.name==='Bytes'?2:3:0,status:endpoint.status,policies:(this.checked.httpPolicies.get(fn)??[]).map(plan=>this.policy(plan))};
    });
    // Reserve its name before adding generated documentation handlers.
    this.routes.push({name,items});
    const config=this.checked.project.config.openapi;
    const assets=config.enabled?[
      {path:config.path,type:'application/json',content:JSON.stringify(generateOpenApi(this.checked).document)},
      {path:config.docs,type:'text/html; charset=utf-8',content:apiExplorer(config.path,config.docs+'/client.js')},
      {path:config.docs+'/client.js',type:'application/javascript; charset=utf-8',content:apiExplorerScript}
    ]:[];
    if(this.checked.actions.size)assets.push({path:'/__aug/actions.js',type:'application/javascript; charset=utf-8',content:actionTransport});
    assets.forEach((asset,index)=>{const body=new FunctionLowering(this,file,this.checked.project.main!.items[0]?.span??{file,start:0,end:0,line:1,column:1});
      const bytes=body.runtime('STRING_BYTES',[body.literal(asset.content)]),headers=body.runtime('HTTP_HEADERS',[]);
      const typed=body.runtime('HTTP_HEADERS_WITH',[headers,body.literal('content-type'),body.literal(asset.type)]);
      const result=body.runtime('HTTP_RESPONSE',[bytes,body.literal(null,{kind:'int',text:'200'}),typed]);body.instruction({op:'copy',out:0,input:result});
      const fn=name+'_asset_'+index;this.functions.push(body.finish(fn));items.push({method:'GET',path:asset.path,function:fn,stream:0,status:200,policies:[]});
    });return name;
  }
  add(def:Definition,name:string,method:MethodDecl,params:Param[],stmts:Stmt[],receiver=false){
    const body=new FunctionLowering(this,method.span.file,method.span,receiver?def:undefined);
    body.sourceName=method.name;
    if(receiver){body.receiver=body.slot();body.locals.set('self',body.receiver);}
    params.forEach((p,i)=>body.parameter(p,i));stmts.forEach(s=>body.statement(s));this.functions.push(body.finish(interceptorChain(name,this.checked.interceptorPlans.get(method)??[]).body));this.layers(method,name,params,receiver);
  }
  layers(node:MethodDecl|ClassDecl,name:string,params:Param[],receiver:boolean){
    for(const entry of interceptorChain(name,this.checked.interceptorPlans.get(node)??[]).entries){
      const body=new FunctionLowering(this,entry.layer.definition.file,entry.layer.around.span,entry.layer.definition);
      body.sourceName=node.name+' ['+entry.layer.definition.name+']';
      if(receiver){body.receiver=body.slot();body.locals.set('self',body.receiver);}
      params.forEach((param,index)=>body.parameter(param,index));body.interceptor(entry.layer,params,entry.next);
      entry.layer.around.body!.forEach(stmt=>body.statement(stmt));this.functions.push(body.finish(entry.name));
    }
  }
}

type InstructionInput = IrInstruction extends infer I ? I extends IrInstruction ? Omit<I,'span'> : never : never;
interface LoopExit {target:string; owned:Set<number>; depth:number; locks:number}
class FunctionLowering {
  readonly generator:Lowering;readonly file:string;readonly span:Span;readonly owner?:Definition;
  readonly parameters:number[]=[];receiver?:number;readonly locals=new Map<string,number>();readonly owned=new Set<number>();
  readonly values:IrValue[]=[];readonly variables:IrVariable[]=[];
  readonly scopes:IrLexicalScope[]=[];private debugScope?:string;
  sourceName?:string;
  private continuation?:InterceptorInvocation;
  private constructionNext=false;private readonly constructorResults=new Set<number>();
  private loop?: {breaking:LoopExit; continuing:LoopExit};
  private slots=1;private sequence=0;private source:Span;private error='cleanup';private returning='cleanup';
  private blocks:{name:string;instructions:IrInstruction[];terminator?:IrTerminator}[]=[];
  private current:{name:string;instructions:IrInstruction[];terminator?:IrTerminator};
  constructor(generator:Lowering,file:string,span:Span,owner?:Definition){this.generator=generator;this.file=file;this.span=span;this.source=span;this.owner=owner;this.values.push({storage:'rooted-value',type:dynamicType,span});this.current={name:'entry_body',instructions:[]};this.blocks.push(this.current);}
  slot(type:IrType=dynamicType){this.values.push({storage:'rooted-value',type,span:this.source});return this.slots++;}
  block(){return 'block_'+this.sequence++;}
  enter(name:string){this.current={name,instructions:[]};this.blocks.push(this.current);}
  terminate(terminator:IrTerminator){this.current.terminator=terminator;}
  instruction(value:InstructionInput){if(this.current.terminator)this.enter(this.block());this.current.instructions.push({...value,span:this.source,debugScope:this.debugScope} as IrInstruction);}
  private local(name:string,slot:number,span:Span,type:IrType=this.values[slot].type){
    this.locals.set(name,slot);this.values[slot].type=type;
    const variable=this.variables.length;this.variables.push({name,slot,span,type,scope:this.debugScope});
    const source=this.source;this.source=span;this.instruction({op:'debug-variable',variable});this.source=source;
  }
  parameter(param:Param,index:number,supplied?:Ty){const type=irType(supplied??schemaType(this.generator.checked.project,param.type,this.file)),slot=this.slot(type);this.parameters[index]=slot;this.locals.set(param.name,slot);this.variables.push({name:param.name,slot,span:param.span,type,argument:index+1});if(param.ownership==='own')this.owned.add(slot);}
  checkError(){const errors=this.block(),next=this.block();this.terminate({op:'cancel',then:this.returning,otherwise:errors});this.enter(errors);this.terminate({op:'error',failed:this.error,success:next});this.enter(next);}
  runtime(operation:string,args:number[],text?:string,number?:number,check=true){
    if(operation.startsWith('HTTP_'))this.generator.components.add('http');
    const comparisons=['==','!=','<','>','<=','>='],integers=args.length===2&&args.every(slot=>isIRScalar(this.values[slot].type)&&this.values[slot].type.name==='int');
    const binary=operation==='BINARY'&&integers&&(comparisons.includes(text!)||['+','-','*','/'].includes(text!));
    const integerResult=['LIST_LENGTH','TUPLE_LENGTH','SET_LENGTH','MAP_LENGTH','STRING_LENGTH','BYTES_LENGTH','JSON_INTEGER','STRING_COMPARE'].includes(operation);
    const booleanResult=['SET_CONTAINS','MAP_CONTAINS','STRING_STARTS_WITH','STRING_IS_TOKEN','IS_TYPE','JSON_BOOLEAN'].includes(operation);
    const out=this.slot(integerResult?scalarType('int'):booleanResult?scalarType('bool'):binary?scalarType(comparisons.includes(text!)?'bool':'int'):dynamicType);
    this.instruction({op:'runtime',out,operation,args,text,number});
    if(check&&!(binary&&text!=='/'))this.checkError();return out;
  }
  call(name:string,args:number[],receiver?:number){const out=this.slot();this.instruction({op:'call',out,function:name,args,receiver});this.checkError();return out;}
  literal(value:string|boolean|null,numeric?:{kind:'int'|'float';text:string}){const out=this.slot(numeric?scalarType(numeric.kind):typeof value==='boolean'?scalarType('bool'):dynamicType);this.instruction({op:'literal',out,value,numeric});return out;}
  private fieldIndex(object:Expr,name:string){const node=this.generator.checked.expressionTypes.get(object)?.def?.node;
    if(node?.kind==='class'||node?.kind==='interceptor'){const i=fieldsOf(node).findIndex(f=>f.name===name);if(i>=0)return i;}
    const type=this.generator.checked.expressionTypes.get(object);if(type?.kind==='builtin'){const index=builtinProperties[type.name]?.findIndex(field=>field.name===name);if(index!==undefined&&index>=0)return index;}
    if(name==='code')return 0;if(name==='message')return 1;throw new BackendUnsupported(object.span,'field '+name);
  }
  private field(name:string):number|undefined{const node=this.owner?.node;if(node?.kind!=='class'&&node?.kind!=='interceptor')return;const i=fieldsOf(node).findIndex(f=>f.name===name);return i<0?undefined:i;}
  private arguments(expr:Extract<Expr,{kind:'call'}>,plan?:CallPlan){
    const source=expr.args.map(a=>this.expression(a));
    return plan?plan.sourceIndices.map((index,i)=>{if(index!==undefined)return source[index];if(plan.defaults?.[i])return this.expression(plan.defaults[i]!);const injected=plan.injectionSources?.[i];
      if(injected?.startsWith('self.'))return this.runtime('FIELD',[this.locals.get('self')!],undefined,this.field(injected.slice(5))!);
      if(injected){const slot=this.locals.get(injected);if(slot!==undefined)return slot;}
      return plan.bindingKeys[i]?this.call(this.generator.binding(plan.bindingKeys[i]!),[]):this.literal(null);
    }):source;
  }
  expression(expr:Expr):number {
    const firstNewSlot=this.slots,result=this.expressionValue(expr),type=this.generator.checked.expressionTypes.get(expr);
    if(result>=firstNewSlot&&type)this.values[result].type=irType(type);
    return result;
  }
  private bindPattern(pattern:BindingPattern,value:number):void {
    if(pattern.kind==='nameBinding'){this.local(pattern.name,value,pattern.span,irType(this.generator.checked.patternTypes.get(pattern)!));return;}
    if(pattern.kind==='tupleBinding')pattern.items.forEach((item,index)=>this.bindPattern(item,this.runtime('TUPLE_GET',[value,this.literal(null,{kind:'int',text:String(index)})])));
    else for(const entry of pattern.fields)this.bindPattern(entry.pattern,this.runtime('FIELD',[value],undefined,this.generator.checked.patternFields.get(entry)!.index));
  }
  private matchBranch(clause:MatchPattern,value:number,literal:number|undefined,body:string,next:string):void {
    if(clause.pattern==='else')this.terminate({op:'jump',target:body});
    else if(clause.pattern==='null'||clause.pattern==='some')this.terminate({op:'null',input:value,then:clause.pattern==='null'?body:next,otherwise:clause.pattern==='null'?next:body});
    else{
      const condition=clause.pattern==='type'?this.runtime('IS_TYPE',[value],this.generator.definition(this.file,clause.type!.name)?.id??clause.type!.name):this.runtime('BINARY',[value,literal!],'==');
      this.terminate({op:'branch',condition,then:body,otherwise:next});
    }
  }
  private expressionValue(expr:Expr):number {
    this.source=expr.span;
    const callback=this.generator.checked.functionValues.get(expr);
    if(callback){
      const captures=callback.captures.map(capture=>this.expression(capture.expression));
      const name=this.generator.callbackName();
      const body=new FunctionLowering(this.generator,expr.span.file,expr.span);
      body.receiver=body.slot(irType(callback.type));body.locals.set('self',body.receiver);
      callback.params.forEach((param,index)=>body.parameter(param,index,callback.inputs[index]));
      if(callback.target){const result=body.call(this.generator.name(callback.target),callback.order.map(index=>body.parameters[index]));body.instruction({op:'copy',out:0,input:result});}
      else{
        callback.captures.forEach((capture,index)=>body.local(capture.name,body.runtime('FIELD',[body.receiver!],undefined,index),capture.expression.span,irType(capture.type)));
        body.statement({kind:'return',value:callback.body!,span:callback.body!.span});
      }
      this.generator.functions.push(body.finish(name));
      const out=this.slot(irType(callback.type));this.instruction({op:'object',out,type:'compiler:callback:'+expr.span.file+':'+expr.span.start,fields:callback.captures.map(capture=>capture.name),owned:captures.map(()=>false),methods:[{name:callback.signature.method.name,function:name}],record:false});
      captures.forEach((value,index)=>this.runtime('SET_FIELD',[out,value],undefined,index));return out;
    }
    if(expr.kind==='comprehension'){
      const iterable=this.expression(expr.iterable),values=this.runtime('ITER',[iterable]),result=this.runtime('LIST',[]);
      const index=this.slot(scalarType('int')),one=this.literal(null,{kind:'int',text:'1'});
      this.instruction({op:'copy',out:index,input:this.literal(null,{kind:'int',text:'0'})});
      const length=this.runtime('LIST_LENGTH',[values]),test=this.block(),body=this.block(),next=this.block(),done=this.block();
      this.terminate({op:'jump',target:test});this.enter(test);this.instruction({op:'checkpoint'});this.checkError();
      const condition=this.runtime('BINARY',[index,length],'<');this.terminate({op:'branch',condition,then:body,otherwise:done});this.enter(body);
      const locals=new Map(this.locals),parent=this.debugScope;
      this.debugScope='scope_'+this.scopes.length;this.scopes.push({name:this.debugScope,parent,span:expr.span});
      this.bindPattern(expr.pattern,this.runtime('LIST_AT',[values,index],undefined,undefined,false));
      if(expr.condition){const selected=this.block();this.terminate({op:'branch',condition:this.expression(expr.condition),then:selected,otherwise:next});this.enter(selected);}
      this.runtime('LIST_APPEND',[result,this.expression(expr.projection)]);
      this.terminate({op:'jump',target:next});this.enter(next);
      this.instruction({op:'copy',out:index,input:this.runtime('BINARY',[index,one],'+')});this.terminate({op:'jump',target:test});
      this.locals.clear();for(const [name,slot] of locals)this.locals.set(name,slot);this.debugScope=parent;
      this.enter(done);return result;
    }
    if(expr.kind==='matchValue'){
      const value=this.expression(expr.value),out=this.slot(),done=this.block();
      const literals=expr.cases.map(clause=>clause.literal?this.expression(clause.literal):undefined);
      for(const [index,clause] of expr.cases.entries()){
        const body=this.block(),next=this.block();
        this.matchBranch(clause,value,literals[index],body,next);
        this.enter(body);const locals=new Map(this.locals),parent=this.debugScope;
        this.debugScope='scope_'+this.scopes.length;this.scopes.push({name:this.debugScope,parent,span:clause.span});
        if(clause.name)this.local(clause.name,value,clause.span);
        const result=this.expression(clause.result);this.instruction({op:'copy',out,input:result});
        this.locals.clear();for(const [name,slot] of locals)this.locals.set(name,slot);this.debugScope=parent;
        this.terminate({op:'jump',target:done});this.enter(next);
      }
      this.terminate({op:'jump',target:done});this.enter(done);return out;
    }
    if(expr.kind==='recordCopy'){
      const base=this.expression(expr.base),def=this.generator.checked.expressionTypes.get(expr.base)!.def!,node=def.node as ClassDecl;
      const replacements=new Map(expr.fields.map(field=>[field.name,this.expression(field.value)]));
      const args=node.fields.map((field,index)=>replacements.get(field.label??field.name)??this.runtime('FIELD',[base],undefined,index));
      return this.call(this.generator.name(def),args);
    }
    if(expr.kind==='interpolation'){
      let result=this.literal('');
      for(const part of expr.parts)result=this.runtime('BINARY',[result,this.runtime('TEXT',[this.expression('text' in part ? {kind:'literal',value:part.text,span:part.span} : part.value)])],'+');
      return result;
    }
    if(expr.kind==='handle'){
      const plan=this.generator.checked.actions.get(expr)!,endpoint=(plan.endpoint.node as MethodDecl).endpoint!;
      const metadata={method:endpoint.method,path:endpoint.path,parameters:plan.parameters.map(({param,type,form})=>({name:param.source?.name??param.name,source:param.source?.kind,form,schema:actionSchema(this.generator.checked.project,type)}))};
      const values=(expr.call as Extract<Expr,{kind:'call'}>).args.map(argument=>argument.kind==='formInput'?this.literal(null):this.expression(argument));
      const args=plan.parameters.map(parameter=>parameter.form||parameter.source===undefined?this.literal(null):values[parameter.source]);
      return this.runtime('HTTP_ACTION',args,JSON.stringify(metadata));
    }
    if(expr.kind==='markupText')return this.literal(expr.text);
    if(expr.kind==='markup'){
      const component=this.generator.checked.markupCalls.get(expr);if(component)return this.expression(component);
      this.generator.components.add('http');const names=expr.attributes.map(attribute=>this.literal(attribute.name));
      const values=expr.attributes.map(attribute=>this.expression(attribute.value)),children=expr.children.map(child=>this.expression(child)),out=this.slot();
      this.instruction({op:'html',out,tag:expr.tag,attributes:names.flatMap((name,index)=>[name,values[index]]),children});this.checkError();return out;
    }
    if(expr.kind==='literal')return typeof expr.value==='number'?this.literal(null,{kind:expr.numericType??'int',text:expr.numericText??String(expr.value)}):this.literal(expr.value);
    if(expr.kind==='name'){
      const slot=this.locals.get(expr.name);if(slot!==undefined)return slot;
      const index=this.field(expr.name);if(index!==undefined)return this.runtime('FIELD',[this.locals.get('self')!],undefined,index);
      throw new BackendUnsupported(expr.span,'unresolved value '+expr.name);
    }
    if(expr.kind==='resolve')return this.call(this.generator.binding(expr.name+(expr.typeArgs.length?'<'+expr.typeArgs.map(typeName).join(',')+'>':'')),[]);
    if(expr.kind==='member')return this.generator.checked.expressionTypes.get(expr.object)?.id==='builtin:HttpRequest'&&expr.name==='body'
      ?this.runtime('HTTP_BODY',[this.expression(expr.object)]):this.runtime('FIELD',[this.expression(expr.object)],undefined,this.fieldIndex(expr.object,expr.name));
    if(expr.kind==='unary'){
      const input=this.expression(expr.value),type=this.values[input].type;
      const pure=isIRScalar(type)&&(type.name==='int'&&expr.op==='-'||type.name==='bool'&&expr.op==='!');
      return this.runtime('UNARY',[input],expr.op,undefined,!pure);
    }
    if(expr.kind==='binary'){
      const left=this.expression(expr.left);
      if(expr.op==='otherwise'){
        const out=this.slot(),fallback=this.block(),after=this.block();this.instruction({op:'copy',out,input:left});
        this.terminate({op:'null',input:left,then:fallback,otherwise:after});this.enter(fallback);
        const right=this.expression(expr.right);this.instruction({op:'copy',out,input:right});
        this.terminate({op:'jump',target:after});this.enter(after);return out;
      }
      if(expr.op==='&&'||expr.op==='||'){
        const out=this.slot();this.instruction({op:'copy',out,input:left});const evaluate=this.block(),after=this.block();
        this.terminate({op:'branch',condition:left,then:expr.op==='&&'?evaluate:after,otherwise:expr.op==='&&'?after:evaluate});this.enter(evaluate);
        const right=this.expression(expr.right);this.instruction({op:'copy',out,input:right});this.terminate({op:'jump',target:after});this.enter(after);return out;
      }
      const right=this.expression(expr.right),a=this.values[left].type,b=this.values[right].type;
      const pure=isIRScalar(a)&&isIRScalar(b)&&(a.name==='int'&&b.name==='int'&&['+','-','*','==','!=','<','>','<=','>='].includes(expr.op)||a.name==='bool'&&b.name==='bool'&&['==','!='].includes(expr.op));
      return this.runtime('BINARY',[left,right],expr.op,undefined,!pure);
    }
    if(expr.kind==='collection'){
      const values=expr.items.map(item=>this.expression(item)),kind=this.generator.checked.expressionTypes.get(expr)?.name??expr.collection;
      const out=kind==='Map'?this.runtime('MAP',[]):this.runtime(kind.toUpperCase(),values);
      if(kind==='Map')for(let i=0;i<values.length;i+=2)this.runtime('MAP_SET',[out,values[i],values[i+1]]);
      if(this.generator.checked.expressionTypes.get(expr)?.immutable)this.runtime('FREEZE',[out]);
      return out;
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
      const out=this.slot();this.instruction({op:'start',out,function:name,receiver,args,worker:expr.worker,owned:args.map((_,i)=>this.generator.checked.callPlans.get(call)?.ownerships?.[i]==='own')});
      this.generator.checked.callPlans.get(call)?.ownerships?.forEach((mode,i)=>{if(mode==='own')this.instruction({op:'clear',slot:args[i]});});
      this.checkError();return out;
    }
    if(expr.kind!=='call')throw new BackendUnsupported(expr.span,expr.kind+' expressions');
    const receiver=expr.callee.kind==='member'?this.expression(expr.callee.object):undefined;
    const args=expr.callee.kind==='name'&&expr.callee.name==='next'?expr.args.map(arg=>this.expression(arg)):this.arguments(expr,this.generator.checked.callPlans.get(expr));
    return this.invoke(expr,receiver,args);
  }
  private invoke(expr:Extract<Expr,{kind:'call'}>,receiver:number|undefined,args:number[],unwrapped=false):number {
    this.source=expr.span;
    if(expr.callee.kind==='member'){
      const type=this.generator.checked.expressionTypes.get(expr.callee.object)!,name=expr.callee.name;
      if(type.kind==='builtin'&&(type.name==='Json'&&name==='decode'||type.name==='HttpRequest'&&name==='form')){
        const out=this.slot(),schema=this.generator.schemas.request(this.generator.checked.expressionTypes.get(expr)!);
        if(name==='form')this.generator.components.add('http');this.instruction({op:'decode',out,input:receiver!,schema,format:name==='form'?'form':'json'});this.checkError();return out;
      }
      const operations:Record<string,string>={
        'List.length':'LIST_LENGTH','List.get':'LIST_GET','List.at':'LIST_AT','List.append':'LIST_APPEND','Tuple.length':'TUPLE_LENGTH','Tuple.get':'TUPLE_GET',
        'Set.length':'SET_LENGTH','Set.add':'SET_ADD','Set.contains':'SET_CONTAINS','Map.length':'MAP_LENGTH','Map.get':'MAP_GET','Map.take':'MAP_TAKE','Map.contains':'MAP_CONTAINS','Map.set':'MAP_SET',
        'List.join':'LIST_JOIN','string.compare':'STRING_COMPARE','string.endsWith':'STRING_ENDS_WITH','string.replace':'STRING_REPLACE','string.codePointLength':'STRING_CODE_POINT_LENGTH','string.parseInteger':'STRING_PARSE_INTEGER','string.parseFloat':'STRING_PARSE_FLOAT',
        'string.length':'STRING_LENGTH','string.bytes':'STRING_BYTES','string.split':'STRING_SPLIT','string.startsWith':'STRING_STARTS_WITH','string.isToken':'STRING_IS_TOKEN',
        'Bytes.slice':'BYTES_SLICE','Bytes.hex':'BYTES_HEX','float.isFinite':'FLOAT_IS_FINITE','float.float32':'FLOAT_FLOAT32','string.trim':'STRING_TRIM','string.utf16Length':'STRING_UTF16_LENGTH','string.isDecimal':'STRING_IS_DECIMAL','string.compareDecimal':'STRING_COMPARE_DECIMAL','Json.has':'JSON_HAS',
        'Bytes.length':'BYTES_LENGTH','Bytes.text':'BYTES_TEXT','Bytes.base64url':'BYTES_BASE64URL',
        'Json.stringify':'JSON_STRINGIFY','Json.get':'JSON_GET','Json.require':'JSON_REQUIRE','Json.string':'JSON_STRING',
        'Json.integer':'JSON_INTEGER','Json.boolean':'JSON_BOOLEAN','Json.items':'JSON_ITEMS',
        'Headers.with':'HTTP_HEADERS_WITH','Headers.get':'HTTP_HEADERS_GET','Headers.all':'HTTP_HEADERS_ALL','HttpTestClient.request':'HTTP_CLIENT_REQUEST'
      };
      const operation=operations[type.name+'.'+name];if(operation){
        const noFailure=['LIST_LENGTH','LIST_AT','LIST_APPEND','TUPLE_LENGTH','SET_LENGTH','SET_ADD','SET_CONTAINS','MAP_LENGTH','MAP_SET','MAP_GET','MAP_TAKE','MAP_CONTAINS','STRING_COMPARE','STRING_LENGTH','STRING_BYTES','STRING_SPLIT','STRING_STARTS_WITH','STRING_IS_TOKEN','BYTES_LENGTH','BYTES_BASE64URL'].includes(operation);
        return this.runtime(operation,[receiver!,...args],undefined,undefined,!noFailure);
      }
      args=this.transferArguments(expr,args,false);
      const out=this.slot();this.instruction({op:'method',out,receiver:receiver!,name,args});
      if(this.generator.checked.callPlans.get(expr)?.returnOwnership==='own')this.owned.add(out);
      this.checkError();return out;
    }
    if(expr.callee.kind!=='name')throw new BackendUnsupported(expr.span,'indirect callable values');
    const name=expr.callee.name;
    if(name==='next'){
      const next=this.continuation!,plan=this.generator.checked.callPlans.get(expr)!;
      const {args:forwarded,transfers}=next.forward(plan.sourceIndices,args);
      const argumentsList=[...forwarded];
      for(const {original,replacement} of transfers){
        const temporary=this.slot();this.instruction({op:'copy',out:temporary,input:replacement});
        argumentsList[this.parameters.indexOf(original)]=temporary;
        if(replacement!==original)this.instruction({op:'drop',slot:original});
        this.instruction({op:'clear',slot:original});
        if(replacement!==original&&this.owned.has(replacement))this.instruction({op:'clear',slot:replacement});
      }
      const out=this.call(next.target,argumentsList,next.receiver);
      if(this.constructionNext)this.constructorResults.add(out);
      if(plan.returnOwnership==='own')this.owned.add(out);return out;
    }
    if(name==='assertEqual'){this.instruction({op:'assert-equal',actual:args[0],expected:args[1],expression:'assertEqual(actual, expected)'});this.checkError();return this.literal(null);}
    if(name==='assert'){this.instruction({op:'assert',input:args[0],expression:this.generator.checked.project.files.get(this.file)?.source.slice(expr.args[0].span.start,expr.args[0].span.end)??'assertion'});this.checkError();return this.literal(null);}
    if(name==='int')return args[0];
    if(errorNames.includes(name)){
      const out=this.slot();this.instruction({op:'object',out,type:name,fields:[],owned:[],methods:[],record:false});return out;
    }
    if(name==='Shared'){
      const result=this.runtime('SHARED',[args[0]]);if(this.owned.has(args[0]))this.instruction({op:'clear',slot:args[0]});return result;
    }
    if(name==='HttpTestClient'){
      const endpoint=this.generator.checked.project.testEndpoint!,out=this.slot(),routes=this.generator.routeTable(endpoint.file,[endpoint.name]);
      this.instruction({op:'routes',out,name:routes});this.checkError();return out;
    }
    const builtins:Record<string,string>={exit:'EXIT',print:'PRINT',arguments:'ARGUMENTS',c_int:'C_INT',read_file:'READ_FILE',write_file:'WRITE_FILE',base64url_decode:'BASE64URL_DECODE',Json:'JSON_WRAP',Headers:'HTTP_HEADERS',HttpResponse:'HTTP_RESPONSE',ServerEvent:'HTTP_EVENT'};
    if(builtins[name])return this.runtime(builtins[name],args);
    if(['List','Tuple','Set','Map'].includes(name))return this.runtime(name.toUpperCase(),args);
    const def=this.generator.definition(this.file,name);if(!def)throw new BackendUnsupported(expr.span,'builtin '+name);
    if(def.node.kind==='function'&&def.node.externC){
      if(!unwrapped&&this.generator.checked.interceptorPlans.get(def.node)?.length){const result=this.call(this.generator.name(def),this.transferArguments(expr,args,false));if(def.node.returnOwnership==='own')this.owned.add(result);return result;}
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
        if(def.node.valueAbi){
          // Compiler-owned adapters use the target pack's pointer thunks. Arbitrary
          // aggregate C declarations remain unsupported, even on an LLVM host.
          const adapters:Record<string,{types:string[];result:string;operation:string}>={
            _aug_json_parse_compatible:{types:['string'],result:'Json',operation:'JSON_PARSE_COMPATIBLE'},
            _aug_json_parse:{types:['string'],result:'Json',operation:'JSON_PARSE'},
            _aug_time_now:{types:[],result:'int',operation:'TIME_NOW'}
          };
          const adapter=adapters[def.node.name];
          const plain=(type:typeof def.node.returns)=>!type.nullable&&!type.optional&&!type.args.length;
          if(adapter&&plain(def.node.returns)&&def.node.returns.name===adapter.result&&def.node.params.length===adapter.types.length&&def.node.params.every((param,i)=>plain(param.type)&&param.type.name===adapter.types[i]))this.instruction({op:'runtime',out,operation:adapter.operation,args});
          else {
            const entry=runtimeAdapters.find(entry=>entry.name===def.node.name);
            if(!entry||def.node.typeParams.length||def.node.returnOwnership!=='managed'||typeName(def.node.returns)!==entry.returns||def.node.params.length!==entry.parameters.length||def.node.params.some((param,i)=>param.ownership!=='managed'||typeName(param.type)!==entry.parameters[i]))throw new BackendUnsupported(expr.span,'legacy AugValue native adapter '+def.node.name+' with this signature');
            this.generator.components.add(entry.component);this.instruction({op:'adapter',out,name:adapterSymbol(entry),args});
          }
        }else this.instruction({op:'extern',out,name:def.node.name,types:def.node.params.map(p=>p.type.name),result:def.node.returns.name,args});
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
  interceptor(layer:InterceptorLayer,params:Param[],next:string){
    this.constructionNext=layer.constructorResultFresh===true;
    this.continuation=new InterceptorInvocation(layer,params,[...this.parameters],next,this.receiver);
    const dependencies=this.continuation.dependencies().map(slot=>slot??this.literal(null));
    const self=this.call(this.generator.name(layer.definition),dependencies);this.locals.set('self',self);
    for(const input of this.continuation.inputs()){
      if(input.reuseOwnedSlot){this.locals.set(input.name,input.slot!);continue;}
      const slot=this.slot();this.locals.set(input.name,slot);this.instruction({op:'copy',out:slot,input:input.slot??this.literal(null)});
    }
  }
  nativeBody(def:Definition){
    const call:Extract<Expr,{kind:'call'}>={kind:'call',callee:{kind:'name',name:def.name,span:def.node.span},args:[],argLabels:[],typeArgs:[],span:def.node.span};
    const result=this.invoke(call,undefined,[...this.parameters],true);this.instruction({op:'copy',out:0,input:result});
    if(this.owned.has(result))this.instruction({op:'clear',slot:result});
  }
  private scoped(stmts:Stmt[],composition=false,setup?:()=>void,span?:Span){
    const locals=new Map(this.locals),owned=new Set(this.owned),parent=this.debugScope;
    const first=span??stmts[0]?.span??this.source,last=stmts.at(-1)?.span;
    this.debugScope='scope_'+this.scopes.length;this.scopes.push({name:this.debugScope,parent,span:{...first,end:last?.end??first.end}});
    setup?.();for(const stmt of stmts)this.statement(stmt);
    if(composition&&!this.current.terminator)this.instruction({op:'scope',action:'join'});
    if(!this.current.terminator)for(const slot of this.owned)if(!owned.has(slot))this.instruction({op:'drop',slot});
    this.locals.clear();for(const [name,slot] of locals)this.locals.set(name,slot);
    this.debugScope=parent;
  }
  endpoint(def:Definition){
    const fn=def.node as MethodDecl,endpoint=fn.endpoint!,request=this.slot(),failed=this.block(),finished=this.block();
    this.parameters.push(request);this.error=failed;this.returning=failed;
    this.instruction({op:'scope',action:'enter'});
    const args=fn.params.map(()=>this.slot());
    fn.params.forEach((param,index)=>{if(!param.injected)return;
      const type=schemaType(this.generator.checked.project,param.type,def.file);
      const key=type.name+(type.args.length?'<'+type.args.map(arg=>arg.name).join(',')+'>':'');
      const value=this.call(this.generator.binding(key),[]);this.instruction({op:'copy',out:args[index],input:value});
    });
    for(const policy of this.generator.checked.httpPolicies.get(fn)??[]){
      this.instruction({op:'http-policy',policy:this.generator.policy(policy),args:[request,...[0,1].map(index=>policy.dependencies[index]===undefined?this.literal(null):args[policy.dependencies[index]])]});this.checkError();
    }
    fn.params.forEach((param,index)=>{if(param.injected)return;
      const schema=param.source!.kind==='request'?undefined:this.generator.schemas.request(schemaType(this.generator.checked.project,param.type,def.file));
      this.instruction({op:'http-bind',out:args[index],request,source:param.source!.kind,name:param.source!.name??param.name,schema});this.checkError();
    });
    const result=this.call(this.generator.name(def),args),response=this.runtime('HTTP_RESPONSE_STATUS',[result,this.literal(null,{kind:'int',text:String(endpoint.status)})]);
    this.instruction({op:'copy',out:0,input:response});this.terminate({op:'jump',target:finished});
    this.enter(failed);this.instruction({op:'http-failure',out:0,errors:endpoint.errors.map(error=>({type:this.generator.definition(def.file,error.type.name)?.id??error.type.name,status:error.status}))});this.terminate({op:'jump',target:finished});
    this.enter(finished);this.error='cleanup';this.returning='cleanup';
    const completed=this.runtime('HTTP_FINISH',[0]);this.instruction({op:'copy',out:0,input:completed});
  }
  private loopTargets(breaking:string, continuing:string): {breaking:LoopExit; continuing:LoopExit} {
    const depth=this.slot(), locks=this.slot(), owned=new Set(this.owned);
    this.instruction({op:'scope-depth',out:depth});this.instruction({op:'lock-depth',out:locks});
    return {breaking:{target:breaking,owned,depth,locks}, continuing:{target:continuing,owned,depth,locks}};
  }
  private loopExit(target:LoopExit):void {
    this.instruction({op:'lock',action:'restore',depth:target.locks});
    this.instruction({op:'scope',action:'join',depth:target.depth});
    for(const slot of this.owned)if(!target.owned.has(slot))this.instruction({op:'drop',slot});
    this.instruction({op:'scope',action:'restore',depth:target.depth});this.checkError();
    this.terminate({op:'jump',target:target.target});
  }
  private tryAlways(stmt:Extract<Stmt,{kind:'try'}>){
    const outerError=this.error,outerReturn=this.returning,outerLoop=this.loop,owned=new Set(this.owned);
    const caught=this.block(),failed=this.block(),returned=this.block(),cleanup=this.block(),finalized=this.block(),done=this.block();
    const depth=this.slot(),locks=this.slot(),pending=this.slot(),cancelled=this.slot(),returning=this.slot(),failure=this.slot();
    this.instruction({op:'scope-depth',out:depth});this.instruction({op:'lock-depth',out:locks});
    this.instruction({op:'copy',out:returning,input:this.literal(false)});this.instruction({op:'copy',out:failure,input:this.literal(false)});
    const breaking=this.block(),continuing=this.block(),jumpReason=this.slot();
    this.instruction({op:'copy',out:jumpReason,input:this.literal(null,{kind:'int',text:'0'})});
    if(outerLoop)this.loop={breaking:{target:breaking,owned,depth,locks},continuing:{target:continuing,owned,depth,locks}};
    this.error=caught;this.returning=returned;this.scoped(stmt.body);
    if(!this.current.terminator)this.terminate({op:'jump',target:cleanup});
    this.enter(caught);this.instruction({op:'lock',action:'restore',depth:locks});this.instruction({op:'scope',action:'join',depth});
    for(const slot of this.owned)if(!owned.has(slot))this.instruction({op:'drop',slot});
    this.instruction({op:'scope',action:'restore',depth});
    const handlers=this.block();this.terminate({op:'cancel',then:failed,otherwise:handlers});this.enter(handlers);this.error=failed;
    for(const clause of stmt.catches){
      const handler=this.block(),next=this.block();this.terminate({op:'error-type',type:this.generator.definition(this.file,clause.type.name)?.id??clause.type.name,then:handler,otherwise:next});this.enter(handler);
      const error=this.slot();this.instruction({op:'take-error',out:error});
      this.scoped(clause.body,false,()=>this.local(clause.name,error,clause.span,irType(schemaType(this.generator.checked.project,clause.type,this.file))),clause.span);
      if(!this.current.terminator)this.terminate({op:'jump',target:cleanup});this.enter(next);
    }
    this.terminate({op:'jump',target:failed});this.enter(failed);this.instruction({op:'copy',out:failure,input:this.literal(true)});this.terminate({op:'jump',target:cleanup});
    this.enter(returned);this.instruction({op:'copy',out:returning,input:this.literal(true)});this.terminate({op:'jump',target:cleanup});
    if(outerLoop){
      this.enter(breaking);this.instruction({op:'copy',out:jumpReason,input:this.literal(null,{kind:'int',text:'1'})});this.terminate({op:'jump',target:cleanup});
      this.enter(continuing);this.instruction({op:'copy',out:jumpReason,input:this.literal(null,{kind:'int',text:'2'})});this.terminate({op:'jump',target:cleanup});
    }
    this.enter(cleanup);this.instruction({op:'lock',action:'restore',depth:locks});this.instruction({op:'scope',action:'join',depth});
    for(const slot of this.owned)if(!owned.has(slot))this.instruction({op:'drop',slot});
    this.instruction({op:'scope',action:'restore',depth});this.instruction({op:'error-state',action:'save',error:pending,cancelled});
    this.loop=undefined;this.error=finalized;this.returning=finalized;this.scoped(stmt.always!);
    if(!this.current.terminator)this.terminate({op:'jump',target:finalized});
    this.enter(finalized);this.instruction({op:'error-state',action:'restore',error:pending,cancelled});
    const returnedCheck=this.block(),errorCheck=this.block(),failedCheck=this.block();
    this.terminate({op:'cancel',then:outerReturn,otherwise:returnedCheck});this.enter(returnedCheck);
    this.terminate({op:'branch',condition:returning,then:outerReturn,otherwise:errorCheck});this.enter(errorCheck);
    this.terminate({op:'error',failed:outerError,success:failedCheck});this.enter(failedCheck);
    this.terminate({op:'branch',condition:failure,then:outerError,otherwise:done});this.enter(done);
    this.error=outerError;this.returning=outerReturn;this.loop=outerLoop;
    if(outerLoop){
      const breakBranch=this.block(),continueTest=this.block(),continueBranch=this.block(),after=this.block();
      const isBreak=this.runtime('BINARY',[jumpReason,this.literal(null,{kind:'int',text:'1'})],'==');
      this.terminate({op:'branch',condition:isBreak,then:breakBranch,otherwise:continueTest});
      this.enter(breakBranch);this.loopExit(outerLoop.breaking);this.enter(continueTest);
      const isContinue=this.runtime('BINARY',[jumpReason,this.literal(null,{kind:'int',text:'2'})],'==');
      this.terminate({op:'branch',condition:isContinue,then:continueBranch,otherwise:after});
      this.enter(continueBranch);this.loopExit(outerLoop.continuing);this.enter(after);
    }
  }
  statement(stmt:Stmt):void {
    this.source=stmt.span;if(this.current.terminator)this.enter(this.block());
    if(this.generator.options.coverage&&!this.generator.checked.project.files.get(stmt.span.file)?.builtin){
      this.generator.coverage.set(stmt.span.file+':'+stmt.span.line,{file:stmt.span.file,line:stmt.span.line});
      this.instruction({op:'cover',file:stmt.span.file,line:stmt.span.line});
    }
    if(stmt.kind==='serve'){const port=this.expression(stmt.port),routes=this.generator.routeTable(this.file,stmt.names);this.instruction({op:'routes',name:routes,port});this.checkError();return;}
    if(stmt.kind==='yield'){this.runtime('HTTP_YIELD',[this.expression(stmt.value)]);return;}
    if(stmt.kind==='expr'){const value=this.expression(stmt.expr);if(this.owned.has(value))this.instruction({op:'drop',slot:value});return;}
    if(stmt.kind==='assign'){
      const value=this.expression(stmt.value);this.source=stmt.span;
      let targetOwns=(stmt.ownership==='own'||this.generator.checked.inferredOwned.has(stmt));
      if(stmt.target.kind==='name'){
        const field=this.field(stmt.target.name);
        if(!this.locals.has(stmt.target.name)&&field!==undefined){
          targetOwns ||= this.owner?.node.kind==='class'&&fieldsOf(this.owner.node)[field].ownership==='own';
          this.runtime('SET_FIELD',[this.locals.get('self')!,value],undefined,field);
        }
        else{let out=this.locals.get(stmt.target.name);if(out===undefined){const type=stmt.declaredType?irType(schemaType(this.generator.checked.project,stmt.declaredType,this.file)):this.values[value].type;out=this.slot(type);this.local(stmt.target.name,out,stmt.span,type);}this.instruction({op:'copy',out,input:value});if((stmt.ownership==='own'||this.generator.checked.inferredOwned.has(stmt)))this.owned.add(out);}
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
      const value=this.runtime('SHARED_LOCK',[this.expression(stmt.value)]);
      this.scoped(stmt.body,false,()=>this.local(stmt.name,value,stmt.span),stmt.span);
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
        this.matchBranch(clause,value,literals[index],body,next);
        this.enter(body);this.scoped(clause.body,false,()=>{if(clause.name)this.local(clause.name,value,clause.span);},clause.span);
        if(!this.current.terminator)this.terminate({op:'jump',target:done});this.enter(next);
      }
      this.terminate({op:'jump',target:done});this.enter(done);return;
    }
    if(stmt.kind==='break'||stmt.kind==='continue'){this.loopExit(this.loop![stmt.kind==='break'?'breaking':'continuing']);return;}
    if(stmt.kind==='while'){
      const test=this.block(),body=this.block(),done=this.block(),outerLoop=this.loop;this.loop=this.loopTargets(done,test);this.terminate({op:'jump',target:test});this.enter(test);
      this.instruction({op:'checkpoint'});this.checkError();
      const condition=this.expression(stmt.test);this.terminate({op:'branch',condition,then:body,otherwise:done});this.enter(body);this.scoped(stmt.body);
      if(!this.current.terminator)this.terminate({op:'jump',target:test});this.enter(done);this.loop=outerLoop;return;
    }
    if(stmt.kind==='freeze'){const value=this.expression(stmt.value),out=this.runtime('FREEZE',[value]);this.local(stmt.name,out,stmt.span);if(this.owned.has(value))this.instruction({op:'clear',slot:value});return;}
    if(stmt.kind==='destructure'){
      const value=this.expression(stmt.value);if(stmt.pattern){this.bindPattern(stmt.pattern,value);return;}stmt.names.forEach((name,i)=>this.local(name,this.runtime('TUPLE_GET',[value,this.literal(null,{kind:'int',text:String(i)})]),stmt.span,this.values[value].type.args[i]??dynamicType));return;
    }
    if(stmt.kind==='for'){
      const iterable=this.expression(stmt.iterable),map=this.generator.checked.expressionTypes.get(stmt.iterable)?.name==='Map'&&!stmt.pattern&&stmt.names.length===2;
      const values=this.runtime(map?'MAP_ITER':'ITER',[iterable]),index=this.slot(scalarType('int')),one=this.literal(null,{kind:'int',text:'1'});this.instruction({op:'copy',out:index,input:this.literal(null,{kind:'int',text:'0'})});
      const length=this.runtime('LIST_LENGTH',[values]),test=this.block(),body=this.block(),done=this.block(),outerLoop=this.loop;this.loop=this.loopTargets(done,test);this.terminate({op:'jump',target:test});this.enter(test);
      this.instruction({op:'checkpoint'});this.checkError();
      const condition=this.runtime('BINARY',[index,length],'<');this.terminate({op:'branch',condition,then:body,otherwise:done});this.enter(body);
      this.scoped(stmt.body,false,()=>{
        // The private snapshot cannot be changed by source code. Its length
        // guards this index; map snapshots contain an even number of cells.
        // Source List.get still retains its checked bounds behavior.
        if(map){stmt.names.forEach((name,i)=>{this.local(name,this.runtime('LIST_AT',[values,index],undefined,undefined,false),stmt.span,this.values[iterable].type.args[i]??dynamicType);this.instruction({op:'copy',out:index,input:this.runtime('BINARY',[index,one],'+')});});}
        else{const item=this.runtime('LIST_AT',[values,index],undefined,undefined,false);if(stmt.pattern)this.bindPattern(stmt.pattern,item);else stmt.names.forEach((name,i)=>this.local(name,stmt.names.length===1?item:this.runtime('TUPLE_GET',[item,this.literal(null,{kind:'int',text:String(i)})]),stmt.span,(stmt.names.length===1?this.values[iterable].type.args[0]:this.values[iterable].type.args[0]?.args[i])??dynamicType));this.instruction({op:'copy',out:index,input:this.runtime('BINARY',[index,one],'+')});}
      },stmt.span);
      if(!this.current.terminator)this.terminate({op:'jump',target:test});this.enter(done);this.loop=outerLoop;return;
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
        const error=this.slot();this.instruction({op:'take-error',out:error});this.scoped(clause.body,false,()=>this.local(clause.name,error,clause.span,irType(schemaType(this.generator.checked.project,clause.type,this.file))),clause.span);
        if(!this.current.terminator)this.terminate({op:'jump',target:done});this.enter(next);
      });this.terminate({op:'jump',target:outer});this.enter(done);return;
    }
    const unreachable:never=stmt;throw new Error('Unexpected August statement '+JSON.stringify(unreachable));
  }
  finish(name:string):IrFunction {
    for(const value of this.values)if(isIRScalar(value.type))value.storage='scalar-value';
    if(!this.current.terminator)this.terminate({op:'jump',target:'cleanup'});
    this.enter('cleanup');this.terminate({op:'return'});
    return {name,sourceName:this.sourceName??this.owner?.name??(name==='aug_main_body'?'main':name),span:this.span,slots:this.slots,values:this.values,variables:this.variables,scopes:this.scopes,parameters:this.parameters,receiver:this.receiver,owned:[...this.owned],constructorResults:[...this.constructorResults],blocks:this.blocks as IrBlock[]};
  }
}
