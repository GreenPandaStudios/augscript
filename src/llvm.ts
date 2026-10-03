import type {AugustIR,IrFunction,IrInstruction,IrTerminator,IrHttpPolicy} from './ir.ts';
import type {NativeView} from './native-contracts.ts';
import {runtimeOperations as operations,httpOperations,schemaKinds} from './runtime-abi.ts';
import {verifyIR} from './ir-verify.ts';
import {DebugMetadata} from './llvm-debug.ts';

export interface RuntimeLayout {
  abi:'compiler-private-runtime-v2';valueSize:16;valueAlignment:8;valuePayloadOffset:8;
  frameSize:24;methodEntrySize:24;pointerSize:8;schemaSize:48;schemaPointerMakerOffset:40;
  routeSize:56;routePointerHandlerOffset:48;policySize:56;httpErrorSize:16;
  executionErrorOffset:40;executionCancelledOffset:41;executionFiberOffset:48;booleanSize:1;
}
export const runtimeLayout:RuntimeLayout={abi:'compiler-private-runtime-v2',valueSize:16,valueAlignment:8,valuePayloadOffset:8,frameSize:24,methodEntrySize:24,pointerSize:8,schemaSize:48,schemaPointerMakerOffset:40,routeSize:56,routePointerHandlerOffset:48,policySize:56,httpErrorSize:16,executionErrorOffset:40,executionCancelledOffset:41,executionFiberOffset:48,booleanSize:1};
const symbol=(name:string)=>'@'+name;

/** Emit LLVM directly from checked August execution IR. No application C is generated. */
export function generateLLVM(ir:AugustIR,options:{triple?:string;layout?:RuntimeLayout;release?:boolean}={}):string {
  verifyIR(ir);
  if(JSON.stringify(options.layout??runtimeLayout)!==JSON.stringify(runtimeLayout))throw new Error('NATIVE_ABI: Runtime pack layout differs from this compiler');
  const module=new ModuleEmitter(ir,options.triple??'arm64-apple-macosx14.0.0',!!options.release);return module.generate();
}
class ModuleEmitter {
  readonly ir:AugustIR;readonly triple:string;readonly globals:string[]=[];readonly declarations=new Map<string,string>();
  readonly debug:DebugMetadata;
  private strings=new Map<string,string>();private sequence=0;
  constructor(ir:AugustIR,triple:string,release:boolean){this.ir=ir;this.triple=triple;this.debug=new DebugMetadata(ir,release);}
  text(value:string):string {
    const found=this.strings.get(value);if(found)return found;
    const name='@aug_text_'+this.sequence++,bytes=Buffer.from(value+'\0','utf8');
    const escaped=[...bytes].map(b=>b>=32&&b<127&&b!==34&&b!==92?String.fromCharCode(b):'\\'+b.toString(16).padStart(2,'0').toUpperCase()).join('');
    this.globals.push(`${name} = private unnamed_addr constant [${bytes.length} x i8] c"${escaped}", align 1`);this.strings.set(value,name);return name;
  }
  declare(name:string,result:string,params:string[]){const signature=`declare ${result} @${name}(${params.join(', ')})`;
    const previous=this.declarations.get(name);if(previous&&previous!==signature)throw new Error('NATIVE_ABI: Conflicting physical signatures for '+name);
    this.declarations.set(name,signature);
  }
  table(prefix:string,fields:string[],owned:boolean[],methods:{name:string;function:string}[]){
    const name='@aug_table_'+this.sequence++,names=name+'_names',mask=name+'_owned';
    this.globals.push(`${names} = private constant [${Math.max(1,fields.length)} x ptr] [${fields.length?fields.map(f=>'ptr '+this.text(f)).join(', '):'ptr null'}]`);
    this.globals.push(`${mask} = private constant [${Math.max(1,owned.length)} x i8] [${owned.length?owned.map(o=>'i8 '+(o?1:0)).join(', '):'i8 0'}]`);
    this.globals.push(`${name} = private constant [${Math.max(1,methods.length)} x %AugMethodEntry] [${methods.length?methods.map(m=>`%AugMethodEntry {ptr ${this.text(m.name)}, ptr null, ptr @${m.function}}`).join(', '):'%AugMethodEntry zeroinitializer'}]`);
    return {name,names,mask};
  }
  policyValue(policy:IrHttpPolicy){return `{i32 ${policy.kind}, ptr ${this.text(policy.permission)}, i64 ${policy.amount}, i64 ${policy.seconds}, i8 ${policy.credentials?1:0}, ptr ${this.text(policy.origins)}, ptr ${this.text(policy.headers)}}`;}
  policy(policy:IrHttpPolicy){const name='@aug_policy_'+this.sequence++;this.globals.push(`${name} = private constant %AugHttpPolicy ${this.policyValue(policy)}, align 8`);return name;}
  generate(){
    const bodies=this.ir.functions.map(fn=>new FunctionEmitter(this,fn).generate());
    const kinds:readonly string[]=schemaKinds;
    for(const schema of this.ir.schemas){
      const kind=kinds.indexOf(schema.kind);if(kind<0)throw new Error('Unknown IR schema kind '+schema.kind);
      const fields='@'+schema.name+'_fields',names='@'+schema.name+'_names';
      if(schema.fields.length)this.globals.push(`${fields} = private constant [${schema.fields.length} x ptr] [${schema.fields.map(field=>'ptr @'+field).join(', ')}]`);
      if(schema.labels.length)this.globals.push(`${names} = private constant [${schema.labels.length} x ptr] [${schema.labels.map(name=>'ptr '+this.text(name)).join(', ')}]`);
      this.globals.push(`@${schema.name} = private constant %AugSchema {i32 ${kind}, i8 ${schema.nullable?1:0}, i8 ${schema.optional?1:0}, i64 ${schema.fields.length}, ptr ${schema.fields.length?fields:'null'}, ptr ${schema.labels.length?names:'null'}, ptr null, ptr ${schema.maker?'@'+schema.maker:'null'}}, align 8`);
    }
    for(const table of this.ir.routes){
      const routes=table.items.map((route,index)=>{
        const policies='@'+table.name+'_policies_'+index;
        if(route.policies.length)this.globals.push(`${policies} = private constant [${route.policies.length} x %AugHttpPolicy] [${route.policies.map(policy=>'%AugHttpPolicy '+this.policyValue(policy)).join(', ')}], align 8`);
        return `%AugRoute {ptr ${this.text(route.method)}, ptr ${this.text(route.path)}, ptr null, i32 ${route.stream}, i32 ${route.status}, ptr ${route.policies.length?policies:'null'}, i64 ${route.policies.length}, ptr @${route.function}}`;
      });
      this.globals.push(`@${table.name} = private constant [${routes.length} x %AugRoute] [${routes.join(', ')}], align 8`);
    }
    this.declare('aug_register_globals','void',['ptr','i64']);this.declare('aug_set_cli_args','void',['i32','ptr']);
    this.declare('aug_ir_exit_status','i32',['i1 zeroext']);this.declare('aug_shutdown','void',[]);
    const globalCount=this.ir.bindings.length;
    const coverage=this.ir.coverage.map(point=>`  call void @aug_coverage_register(ptr ${this.text(point.file)}, i64 ${point.line})`);
    if(coverage.length)this.declare('aug_coverage_register','void',['ptr','i64']);
    const web=this.ir.web,configure=this.ir.components.includes('http')?[
      `  call void @aug_http_configure(ptr ${this.text(web.host)}, ptr ${this.text(web.tls.certificate)}, ptr ${this.text(web.tls.private_key)}, ptr ${this.text(web.tls.ca)}, i64 ${web.body_limit}, i64 ${web.response_limit}, i1 zeroext ${web.http3?'true':'false'}, i64 ${web.headers_timeout}, i64 ${web.request_timeout}, i64 ${web.drain_timeout}, i64 ${web.max_requests})`
    ]:[];
    if(configure.length)this.declare('aug_http_configure','void',['ptr','ptr','ptr','ptr','i64','i64','i1 zeroext','i64','i64','i64','i64']);
    const startup=this.ir.bindings.filter(b=>b.shared).flatMap((b,i)=>[
      `  call void @${b.function}(ptr %result, ptr null, ptr null, i32 0)`,
      `  %binding_error_${i} = call zeroext i1 @aug_ir_has_error()`,
      `  br i1 %binding_error_${i}, label %done, label %binding_ready_${i}`,
      `binding_ready_${i}:`]);
    const entryFunction={...this.ir.functions.find(fn=>fn.name===this.ir.main)!,name:'main',sourceName:'August entry'};
    const entrySubprogram=this.debug.function(entryFunction),entryLocation=this.debug.location(entryFunction,entryFunction.span);
    const main=[`define i32 @main(i32 %argc, ptr %argv) !dbg ${entrySubprogram} {`,`entry:`,`  %result = alloca %AugValue, align 8`,`  store %AugValue zeroinitializer, ptr %result, align 8`,
      `  call void @aug_register_globals(ptr @aug_globals, i64 ${globalCount})`,`  call void @aug_set_cli_args(i32 %argc, ptr %argv)`,...coverage,...configure,...startup,
      `  %startup_error = call zeroext i1 @aug_ir_has_error()`,`  br i1 %startup_error, label %done, label %run`,`run:`,
      `  call void @${this.ir.main}(ptr %result, ptr null, ptr null, i32 0)`,`  br label %done`,`done:`,
      `  %status = call i32 @aug_ir_exit_status(i1 zeroext ${this.ir.test?'true':'false'})`,`  call void @aug_shutdown()`,`  ret i32 %status`,`}`].map(line=>line.startsWith('  ')?line+', !dbg '+entryLocation:line).join('\n');
    this.declare('aug_ir_has_error','zeroext i1',[]);
    return [`; August checked execution IR ${this.ir.format}; source revision ${this.ir.sourceRevision}`,`target triple = "${this.triple}"`,
      `%AugValue = type {i32, i64}`,`%AugFrame = type {ptr, i64, ptr}`,`%AugMethodEntry = type {ptr, ptr, ptr}`,`%AugSchema = type {i32, i8, i8, i64, ptr, ptr, ptr, ptr}`,`%NativeError = type {i32, i32, [512 x i8]}`,
      `%AugRoute = type {ptr, ptr, ptr, i32, i32, ptr, i64, ptr}`,`%AugHttpPolicy = type {i32, ptr, i64, i64, i8, ptr, ptr}`,`%AugHttpError = type {ptr, i32}`,
      `@aug_globals = internal global [${Math.max(1,globalCount)} x %AugValue] zeroinitializer, align 8`,
      `@aug_task_checkpoint_hook = external thread_local global ptr, align 8`,
      `@aug_scoped = private constant [${Math.max(1,globalCount)} x i8] [${globalCount?this.ir.scoped.map(scoped=>'i8 '+(scoped?1:0)).join(', '):'i8 0'}]`,...this.globals,...this.declarations.values(),...bodies,main,this.debug.generate(),''].join('\n\n');
  }
}
class FunctionEmitter {
  readonly module:ModuleEmitter;readonly fn:IrFunction;private sequence=0;private lines:string[]=[];private allocations:string[]=[];
  private debugLocation?:string;
  private pairedStates=new Map<string,string>();
  private errorStates=new Map<string,string>();
  constructor(module:ModuleEmitter,fn:IrFunction){
    this.module=module;this.fn=fn;
    const incoming=new Map<string,number>(),blocks=new Map(fn.blocks.map(block=>[block.name,block]));
    for(const block of fn.blocks){const t=block.terminator;
      const targets=t.op==='jump'?[t.target]:t.op==='return'?[]:t.op==='error'?[t.failed,t.success]:[t.then,t.otherwise];
      for(const target of targets)incoming.set(target,(incoming.get(target)??0)+1);
    }
    for(const block of fn.blocks){const t=block.terminator;if(t.op!=='cancel')continue;
      const next=blocks.get(t.otherwise);
      if(next&&incoming.get(next.name)===1&&!next.instructions.length&&next.terminator.op==='error'){
        const state=this.temp('state');this.pairedStates.set(block.name,state);this.errorStates.set(next.name,state);
      }
    }
  }
  private temp(prefix='value'){return '%'+prefix+'_'+this.sequence++;}
  private label(prefix='native'){return prefix+'_'+this.sequence++;}
  private line(value:string){this.lines.push('  '+value+(this.debugLocation?', !dbg '+this.debugLocation:''));}
  private allocate(type:string){const name=this.temp('storage');this.allocations.push(`  ${name} = alloca ${type}, align 8`);return name;}
  private ptr(slot:number){return '%slot_'+slot;}
  /** The maintainer pack measures these private offsets on the target. A
   * function keeps its own execution pointer across cooperative suspension,
   * matching the existing C backend; another fiber cannot dispose its frame. */
  private executionFlag(offset:number){
    const value=this.temp(),condition=this.temp();
    this.line(`${value} = load i8, ptr ${offset===runtimeLayout.executionErrorOffset?'%execution_error':'%execution_cancelled'}, align 1`);
    this.line(`${condition} = icmp ne i8 ${value}, 0`);return condition;
  }
  private load(slot:number){const name=this.temp();this.line(`${name} = load %AugValue, ptr ${this.ptr(slot)}, align 8`);return name;}
  private store(slot:number,value:string){this.line(`store %AugValue ${value}, ptr ${this.ptr(slot)}, align 8`);}
  private clear(slot:number){this.store(slot,'zeroinitializer');}
  private call(name:string,result:string,params:{type:string;value:string}[]):string {
    this.module.declare(name,result,params.map(p=>p.type));const target=result==='void'?'':this.temp('call');
    this.line(`${target?target+' = ':''}call ${result} @${name}(${params.map(p=>p.type+' '+p.value).join(', ')})`);return target;
  }
  private args(slots:number[]):string {
    if(!slots.length)return 'null';const array=this.allocate(`[${slots.length} x %AugValue]`);
    slots.forEach((slot,i)=>{const ptr=this.temp('arg');this.line(`${ptr} = getelementptr [${slots.length} x %AugValue], ptr ${array}, i64 0, i64 ${i}`);this.line(`store %AugValue ${this.load(slot)}, ptr ${ptr}, align 8`);});return array;
  }
  private boxed(out:number,tag:number,payload:string){const a=this.temp(),b=this.temp();this.line(`${a} = insertvalue %AugValue zeroinitializer, i32 ${tag}, 0`);this.line(`${b} = insertvalue %AugValue ${a}, i64 ${payload}, 1`);this.store(out,b);}
  private integer(slot:number){return this.call('aug_ir_integer','i64',[{type:'ptr',value:this.ptr(slot)}]);}
  private float(slot:number){return this.call('aug_ir_float','double',[{type:'ptr',value:this.ptr(slot)}]);}
  private floats(bits:string){const value=this.temp();this.line(`${value} = bitcast double ${bits} to i64`);return value;}
  private directType(type:string){return type==='int'?'i64':type==='c_int'?'i32':type==='float'?'double':type==='bool'?'i1':type==='string'?'ptr':'void';}
  private nativeType(view:NativeView){return view.kind==='i64'?'i64':view.kind==='i32'?'i32':view.kind==='f64'?'double':view.kind==='bool'?'i8':view.kind==='void'?'void':'ptr';}
  private scalarKind(slot:number):string|undefined {
    const type=this.fn.values[slot].type;
    return this.fn.values[slot].storage==='scalar-value'&&['int','float','bool'].includes(type.name)?type.name:undefined;
  }
  private payload(slot:number){const value=this.temp();this.line(`${value} = extractvalue %AugValue ${this.load(slot)}, 1`);return value;}
  private scalarBoolean(slot:number){const byte=this.temp(),condition=this.temp();this.line(`${byte} = trunc i64 ${this.payload(slot)} to i8`);this.line(`${condition} = icmp ne i8 ${byte}, 0`);return condition;}
  private boxBoolean(out:number,condition:string){const payload=this.temp();this.line(`${payload} = zext i1 ${condition} to i64`);this.boxed(out,3,payload);}
  /** A widened float slot can still contain an integer. Preserve that case,
   * including integer division and wraparound, before emitting strict FP IR. */
  private floatingOperation(i:Extract<IrInstruction,{op:'runtime'}>,left:number,right:number):boolean {
    const operator=i.text,arithmetic:Record<string,string>={'+':'fadd','-':'fsub','*':'fmul','/':'fdiv'},
      comparisons:Record<string,string>={'==':'oeq','!=':'une','<':'olt','>':'ogt','<=':'ole','>=':'oge'};
    if(!operator||(!arithmetic[operator]&&!comparisons[operator]))return false;
    const number=(slot:number)=>{
      const stored=this.load(slot),tag=this.temp(),payload=this.temp(),integer=this.temp(),converted=this.temp(),bits=this.temp(),value=this.temp();
      this.line(`${tag} = extractvalue %AugValue ${stored}, 0`);
      this.line(`${payload} = extractvalue %AugValue ${stored}, 1`);
      this.line(`${integer} = icmp eq i32 ${tag}, 1`);
      this.line(`${converted} = sitofp i64 ${payload} to double`);
      this.line(`${bits} = bitcast i64 ${payload} to double`);
      this.line(`${value} = select i1 ${integer}, double ${converted}, double ${bits}`);
      return {integer,value};
    };
    const a=number(left),b=number(right),both=this.temp(),fallback=this.label('number_runtime'),native=this.label('number_native'),done=this.label('number_done');
    this.line(`${both} = and i1 ${a.integer}, ${b.integer}`);
    let slow=both;
    if(operator==='/'){
      const zero=this.temp();slow=this.temp();this.line(`${zero} = fcmp oeq double ${b.value}, 0.0`);
      this.line(`${slow} = or i1 ${both}, ${zero}`);
    }
    this.line(`br i1 ${slow}, label %${fallback}, label %${native}`);this.lines.push(fallback+':');
    this.call('aug_ir_binary','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.module.text(operator)},...i.args.map(slot=>({type:'ptr',value:this.ptr(slot)}))]);
    this.line(`br label %${done}`);this.lines.push(native+':');const result=this.temp();
    if(comparisons[operator]){
      this.line(`${result} = fcmp ${comparisons[operator]} double ${a.value}, ${b.value}`);this.boxBoolean(i.out,result);
    }else{
      this.line(`${result} = ${arithmetic[operator]} double ${a.value}, ${b.value}`);const payload=this.temp();
      this.line(`${payload} = bitcast double ${result} to i64`);this.boxed(i.out,2,payload);
    }
    this.line(`br label %${done}`);this.lines.push(done+':');return true;
  }
  /** Preserve wrapping integer operations and the actual widened numeric tags. */
  private scalarOperation(i:Extract<IrInstruction,{op:'runtime'}>):boolean {
    const [left,right]=i.args,kind=this.scalarKind(left),operator=i.text;
    if(i.operation==='UNARY'){
      if(operator==='!'&&kind==='bool'){const result=this.temp();this.line(`${result} = xor i1 ${this.scalarBoolean(left)}, true`);this.boxBoolean(i.out,result);return true;}
      if(operator==='-'&&kind==='int'){
        const result=this.temp(),value=this.payload(left);
        this.line(`${result} = sub i64 0, ${value}`);this.boxed(i.out,1,result);return true;
      }return false;
    }
    if(i.operation!=='BINARY')return false;
    const other=this.scalarKind(right),comparisons:Record<string,string>={'==':'eq','!=':'ne','<':'slt','>':'sgt','<=':'sle','>=':'sge'};
    if(kind==='bool'&&other==='bool'&&(operator==='=='||operator==='!=')){
      const a=this.scalarBoolean(left),b=this.scalarBoolean(right),result=this.temp();this.line(`${result} = icmp ${comparisons[operator]} i1 ${a}, ${b}`);this.boxBoolean(i.out,result);return true;
    }
    if(['int','float'].includes(kind??'')&&['int','float'].includes(other??'')&&(kind==='float'||other==='float'))
      return this.floatingOperation(i,left,right);
    if(kind!=='int'||other!=='int')return false;
    const comparison=operator&&comparisons[operator],arithmetic:Record<string,string>={'+':'add','-':'sub','*':'mul'};
    if(operator==='/'){
      const a=this.payload(left),b=this.payload(right),zero=this.temp(),failed=this.label('division_zero'),success=this.label('division_value'),done=this.label('division_done');
      this.line(`${zero} = icmp eq i64 ${b}, 0`);this.line(`br i1 ${zero}, label %${failed}, label %${success}`);this.lines.push(failed+':');
      this.call('aug_ir_binary','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.module.text('/')},...i.args.map(slot=>({type:'ptr',value:this.ptr(slot)}))]);
      this.line(`br label %${done}`);this.lines.push(success+':');
      const minimum=this.temp(),negativeOne=this.temp(),overflow=this.temp(),safeDivisor=this.temp(),result=this.temp();
      this.line(`${minimum} = icmp eq i64 ${a}, -9223372036854775808`);this.line(`${negativeOne} = icmp eq i64 ${b}, -1`);this.line(`${overflow} = and i1 ${minimum}, ${negativeOne}`);
      this.line(`${safeDivisor} = select i1 ${overflow}, i64 1, i64 ${b}`);this.line(`${result} = sdiv i64 ${a}, ${safeDivisor}`);this.boxed(i.out,1,result);
      this.line(`br label %${done}`);this.lines.push(done+':');return true;
    }
    if(!comparison&&!arithmetic[operator??''])return false;
    const a=this.payload(left),b=this.payload(right),result=this.temp();
    if(comparison){
      this.line(`${result} = icmp ${comparison} i64 ${a}, ${b}`);this.boxBoolean(i.out,result);
    }else{
      this.line(`${result} = ${arithmetic[operator!]} i64 ${a}, ${b}`);this.boxed(i.out,1,result);
    }return true;
  }
  private instruction(i:IrInstruction){
    switch(i.op){
      case 'literal':{
        if(i.numeric){if(i.numeric.kind==='int')this.boxed(i.out,1,i.numeric.text);else{const bytes=Buffer.alloc(8);bytes.writeDoubleBE(Number(i.numeric.text));this.boxed(i.out,2,this.floats('0x'+bytes.toString('hex').toUpperCase()));}}
        else if(typeof i.value==='string')this.call('aug_ir_string','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.module.text(i.value)},{type:'i64',value:String(Buffer.byteLength(i.value))}]);
        else if(typeof i.value==='boolean')this.boxed(i.out,3,i.value?'1':'0');else this.clear(i.out);return;
      }
      case 'copy':this.store(i.out,this.load(i.input));return;
      case 'clear':this.clear(i.slot);return;
      case 'cover':this.call('aug_cover','void',[{type:'ptr',value:this.module.text(i.file)},{type:'i64',value:String(i.line)}]);return;
      case 'debug-variable':this.lines.push(this.variable(this.fn.variables[i.variable]));return;
      case 'runtime':{
        if((i.operation==='BINARY'||i.operation==='UNARY')&&this.scalarOperation(i))return;
        if(i.operation==='BINARY'||i.operation==='UNARY'){
          this.call('aug_ir_'+i.operation.toLowerCase(),'void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.module.text(i.text!)},...i.args.map(slot=>({type:'ptr',value:this.ptr(slot)}))]);return;
        }
        if(['LIST','TUPLE','SET'].includes(i.operation)){
          this.call('aug_ir_'+i.operation.toLowerCase()+'_new','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.args(i.args)},{type:'i32',value:String(i.args.length)}]);return;
        }
        const services:Record<string,'void'|'i8'|'i64'|'value'>={PRINT:'void',MAP:'value',ITER:'value',MAP_ITER:'value',LIST_APPEND:'void',TUPLE_LENGTH:'i64',TUPLE_GET:'value',STRING_LENGTH:'i64',STRING_BYTES:'value',STRING_SPLIT:'value',MAP_SET:'void',SET_ADD:'void',SET_CONTAINS:'i8',MAP_CONTAINS:'i8',LIST_LENGTH:'i64',SET_LENGTH:'i64',MAP_LENGTH:'i64',LIST_GET:'value',LIST_AT:'value',MAP_GET:'value',MAP_TAKE:'value'};
        const result=services[i.operation];
        if(result){
          const args=i.args.map(slot=>({type:'ptr',value:this.ptr(slot)}));
          const value=this.call('aug_ir_'+i.operation.toLowerCase(),result==='value'?'void':result,result==='value'?[{type:'ptr',value:this.ptr(i.out)},...args]:args);
          if(result==='void')this.clear(i.out);
          else if(result==='i64')this.boxed(i.out,1,value);
          else if(result==='i8'){const payload=this.temp();this.line(`${payload} = zext i8 ${value} to i64`);this.boxed(i.out,3,payload);}
          return;
        }
        const http=i.operation.startsWith('HTTP_'),catalog:readonly string[]=http?httpOperations:operations,op=catalog.indexOf(i.operation)+1;if(!op)throw new Error('Unknown IR runtime operation '+i.operation);
        this.call(http?'aug_ir_http_operation':'aug_ir_operation','void',[{type:'ptr',value:this.ptr(i.out)},{type:'i32',value:String(op)},{type:'ptr',value:this.args(i.args)},{type:'i32',value:String(i.args.length)},{type:'ptr',value:i.text===undefined?'null':this.module.text(i.text)},{type:'i64',value:String(i.number??0)}]);return;
      }
      case 'decode':this.call(i.format==='form'?'aug_ir_http_form':'aug_ir_json_decode','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.ptr(i.input)},{type:'ptr',value:'@'+i.schema}]);return;
      case 'adapter':this.call(i.name,'void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.args(i.args)},{type:'i32',value:String(i.args.length)}]);return;
      case 'html':this.call('aug_ir_html','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.module.text(i.tag)},{type:'ptr',value:this.args(i.attributes)},{type:'i32',value:String(i.attributes.length/2)},{type:'ptr',value:this.args(i.children)},{type:'i32',value:String(i.children.length)}]);return;
      case 'http-bind':this.call('aug_ir_http_bind','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.ptr(i.request)},{type:'ptr',value:this.module.text(i.source)},{type:'ptr',value:this.module.text(i.name)},{type:'ptr',value:i.schema?'@'+i.schema:'null'}]);return;
      case 'http-policy':this.call('aug_ir_http_policy','void',[{type:'ptr',value:this.module.policy(i.policy)},{type:'ptr',value:this.args(i.args)}]);return;
      case 'http-failure':{
        const errors=this.allocate(`[${Math.max(1,i.errors.length)} x %AugHttpError]`);
        this.line(`store [${Math.max(1,i.errors.length)} x %AugHttpError] [${i.errors.length?i.errors.map(error=>`%AugHttpError {ptr ${this.module.text(error.type)}, i32 ${error.status}}`).join(', '):'%AugHttpError zeroinitializer'}], ptr ${errors}, align 8`);
        this.call('aug_ir_http_failure','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:errors},{type:'i32',value:String(i.errors.length)}]);return;
      }
      case 'routes':{
        const count=this.module.ir.routes.find(table=>table.name===i.name)!.items.length;
        if(i.port!==undefined)this.call('aug_ir_http_serve','void',[{type:'ptr',value:'@'+i.name},{type:'i32',value:String(count)},{type:'ptr',value:this.ptr(i.port)}]);
        else this.call('aug_ir_http_test_client','void',[{type:'ptr',value:this.ptr(i.out!)},{type:'ptr',value:'@'+i.name},{type:'i32',value:String(count)}]);return;
      }
      case 'call':this.line(`call void @${i.function}(ptr ${this.ptr(i.out)}, ptr ${i.receiver===undefined?'null':this.ptr(i.receiver)}, ptr ${this.args(i.args)}, i32 ${i.args.length})`);return;
      case 'method':this.call('aug_ir_method','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.ptr(i.receiver)},{type:'ptr',value:this.module.text(i.name)},{type:'ptr',value:this.args(i.args)},{type:'i32',value:String(i.args.length)}]);return;
      case 'start':{
        const mask=this.allocate(`[${Math.max(1,i.owned.length)} x i8]`);
        this.line(`store [${Math.max(1,i.owned.length)} x i8] [${i.owned.length?i.owned.map(own=>'i8 '+(own?1:0)).join(', '):'i8 0'}], ptr ${mask}, align 1`);
        this.call(i.worker?'aug_task_start_worker_pointer':'aug_task_start_pointer','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:'@'+i.function},{type:'ptr',value:i.receiver===undefined?'null':this.ptr(i.receiver)},{type:'ptr',value:this.args(i.args)},{type:'i32',value:String(i.args.length)},{type:'ptr',value:mask}]);return;
      }
      case 'wait':this.call('aug_ir_task_wait','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.args(i.tasks)},{type:'i32',value:String(i.tasks.length)}]);return;
      case 'checkpoint':{
        const fiber=this.temp(),hook=this.temp(),active=this.temp(),observed=this.temp(),needed=this.temp(),run=this.label('checkpoint'),done=this.label('checkpoint_done');
        this.line(`${fiber} = load ptr, ptr %execution_fiber, align 8`);this.line(`${hook} = load ptr, ptr @aug_task_checkpoint_hook, align 8`);
        this.line(`${active} = icmp ne ptr ${fiber}, null`);this.line(`${observed} = icmp ne ptr ${hook}, null`);this.line(`${needed} = or i1 ${active}, ${observed}`);
        this.line(`br i1 ${needed}, label %${run}, label %${done}`);this.lines.push(run+':');this.call('aug_task_checkpoint','void',[]);this.line(`br label %${done}`);this.lines.push(done+':');return;
      }
      case 'drop':this.call('aug_ir_drop','void',[{type:'ptr',value:this.ptr(i.slot)}]);return;
      case 'throw':this.call('aug_ir_throw','void',[{type:'ptr',value:this.ptr(i.input)}]);return;
      case 'take-error':this.call('aug_ir_take_error','void',[{type:'ptr',value:this.ptr(i.out)}]);return;
      case 'assert':this.call('aug_ir_assert','void',[{type:'ptr',value:this.ptr(i.input)},{type:'ptr',value:this.module.text(i.expression)},{type:'ptr',value:this.module.text(i.span.file)},{type:'i32',value:String(i.span.line)}]);return;
      case 'object':{
        const table=this.module.table(this.fn.name,i.fields,i.owned,i.methods);
        this.call('aug_ir_object','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.module.text(i.type)},{type:'i64',value:String(i.fields.length)},{type:'ptr',value:table.mask},{type:'ptr',value:table.name},{type:'i64',value:String(i.methods.length)},{type:'ptr',value:table.names},{type:'i1 zeroext',value:i.record?'true':'false'}]);return;
      }
      case 'binding-get':this.call('aug_ir_binding_get','void',[{type:'ptr',value:this.ptr(i.out)},{type:'i64',value:String(i.index)}]);return;
      case 'binding-set':this.call('aug_ir_binding_set','void',[{type:'i64',value:String(i.index)},{type:'ptr',value:this.ptr(i.input)}]);return;
      case 'scope-depth':this.boxed(i.out,1,this.call('aug_scope_depth','i64',[]));return;
      case 'lock-depth':this.boxed(i.out,1,this.call('aug_lock_depth','i64',[]));return;
      case 'lock':this.call(i.action==='leave'?'aug_lock_leave':'aug_lock_restore','void',i.depth===undefined?[]:[{type:'i64',value:this.integer(i.depth)}]);return;
      case 'error-state':this.call(i.action==='save'?'aug_ir_save_error_state':'aug_ir_restore_error_state','void',[{type:'ptr',value:this.ptr(i.error)},{type:'ptr',value:this.ptr(i.cancelled)}]);return;
      case 'scope':{
        if(i.action==='enter')this.call('aug_scope_enter','void',[{type:'ptr',value:'@aug_scoped'}]);
        else if(i.action==='leave')this.call('aug_scope_leave','void',[]);
        else{
          let depth:string;
          if(i.depth===undefined){const current=this.call('aug_scope_depth','i64',[]);depth=this.temp('scope_parent');this.line(`${depth} = sub i64 ${current}, 1`);}
          else depth=this.integer(i.depth);
          this.call(i.action==='join'?'aug_scope_join_to':'aug_scope_restore','void',[{type:'i64',value:depth}]);
        }return;
      }
      case 'native':this.native(i);return;
      case 'extern':{
        const params=i.types.map((type,n)=>{
          const native=this.directType(type);let value:string;
          if(type==='string'){
            const data=this.allocate('ptr'),length=this.allocate('i64');this.call('aug_ir_data','zeroext i1',[{type:'ptr',value:this.ptr(i.args[n])},{type:'ptr',value:data},{type:'ptr',value:length}]);value=this.temp();this.line(`${value} = load ptr, ptr ${data}`);
          }else if(type==='float')value=this.float(i.args[n]);else if(type==='bool')value=this.call('aug_ir_truthy','zeroext i1',[{type:'ptr',value:this.ptr(i.args[n])}]);
          else{value=this.integer(i.args[n]);if(type==='c_int'){const narrow=this.temp();this.line(`${narrow} = trunc i64 ${value} to i32`);value=narrow;}}
          return {type:native,value};
        });const result=this.directType(i.result),value=this.call(i.name,result,params);
        if(result==='void')this.clear(i.out);else if(result==='double')this.boxed(i.out,2,this.floats(value));else if(result==='ptr')throw new Error('FFI_PROFILE: Direct C string returns need an explicit descriptor lifetime');
        else if(result==='i32'||result==='i1'){const wide=this.temp();this.line(`${wide} = ${result==='i32'?'sext':'zext'} ${result} ${value} to i64`);this.boxed(i.out,result==='i1'?3:1,wide);}else this.boxed(i.out,1,value);return;
      }
    }
  }
  private native(i:Extract<IrInstruction,{op:'native'}>){
    const fn=i.binding,params:{type:string;value:string}[]=[],temporary:string[]=[],error=this.allocate('%NativeError'),statusSlot=this.allocate('i32');
    const failed=this.label('native_failed'),success=this.label('native_success'),done=this.label('native_done');
    this.line(`store %NativeError zeroinitializer, ptr ${error}, align 8`);this.line(`store i32 -1, ptr ${statusSlot}`);
    const cleanupSlots:string[]=[];
    const guard=(condition:string)=>{const next=this.label('native_input');this.line(`br i1 ${condition}, label %${next}, label %${failed}`);this.lines.push(next+':');};
    // Allocate all temporary pointer cells first, so a failed earlier conversion
    // can release every initialized cell without reading an uninitialized one.
    const storage=fn.params.map(view=>{
      if(['utf8','bytes','f64-list','utf8-list'].includes(view.kind)){
        const data=this.allocate('ptr'),count=this.allocate('i64'),lengths=view.kind==='utf8-list'?this.allocate('ptr'):undefined;
        this.line(`store ptr null, ptr ${data}`);this.line(`store i64 0, ptr ${count}`);if(lengths)this.line(`store ptr null, ptr ${lengths}`);
        if(view.kind==='f64-list'||view.kind==='utf8-list')cleanupSlots.push(data);if(lengths)cleanupSlots.push(lengths);return {data,count,lengths};
      }return undefined;
    });
    const resultType=this.nativeType(fn.result),result=fn.result.kind==='void'?undefined:this.allocate(resultType),resultLength=['utf8','bytes','f64-list'].includes(fn.result.kind)?this.allocate('i64'):undefined;
    if(result)this.line(`store ${resultType} ${resultType==='ptr'?'null':resultType==='double'?'0.0':'0'}, ptr ${result}`);
    if(resultLength)this.line(`store i64 0, ptr ${resultLength}`);
    fn.params.forEach((view,n)=>{
      const slot=i.args[n],cell=storage[n];
      if(cell){
        const ok=this.call(view.kind==='f64-list'?'aug_ir_floats':view.kind==='utf8-list'?'aug_ir_strings':'aug_ir_data','zeroext i1',[
          {type:'ptr',value:this.ptr(slot)},{type:'ptr',value:cell.data},...(cell.lengths?[{type:'ptr',value:cell.lengths}]:[]),{type:'ptr',value:cell.count}]);guard(ok);
        const data=this.temp(),count=this.temp();this.line(`${data} = load ptr, ptr ${cell.data}`);this.line(`${count} = load i64, ptr ${cell.count}`);
        params.push({type:'ptr',value:data});if(cell.lengths){const lengths=this.temp();this.line(`${lengths} = load ptr, ptr ${cell.lengths}`);params.push({type:'ptr',value:lengths});}params.push({type:'i64',value:count});
      }else if(view.kind==='resource'){
        const resource=i.resources[view.resource!];if(!resource)throw new Error('NATIVE_ABI: Missing resource identity '+view.resource);
        const pointer=this.call('aug_ir_resource_pointer','ptr',[{type:'ptr',value:this.ptr(slot)},{type:'ptr',value:this.module.text(resource.id)}]);
        const valid=this.temp();this.line(`${valid} = icmp ne ptr ${pointer}, null`);guard(valid);params.push({type:'ptr',value:pointer});
      }else if(view.kind==='f64')params.push({type:'double',value:this.float(slot)});
      else if(view.kind==='bool'){const b=this.call('aug_ir_truthy','zeroext i1',[{type:'ptr',value:this.ptr(slot)}]),wide=this.temp();this.line(`${wide} = zext i1 ${b} to i8`);params.push({type:'i8',value:wide});}
      else{
        const value=this.integer(slot);
        const minimum=view.minimum??(view.kind==='i32'?-2147483648:undefined),maximum=view.maximum??(view.kind==='i32'?2147483647:undefined);
        if(minimum!==undefined){const valid=this.temp();this.line(`${valid} = icmp sge i64 ${value}, ${minimum}`);guard(valid);}if(maximum!==undefined){const valid=this.temp();this.line(`${valid} = icmp sle i64 ${value}, ${maximum}`);guard(valid);}
        if(view.kind==='i32'){const narrow=this.temp();this.line(`${narrow} = trunc i64 ${value} to i32`);params.push({type:'i32',value:narrow});}else params.push({type:'i64',value});
      }
    });
    fn.params.forEach((view,n)=>{if(view.kind==='resource'&&view.ownership==='consume')this.call('aug_ir_resource_move','void',[{type:'ptr',value:this.ptr(i.args[n])}]);});
    if(fn.status==='direct'){
      const value=this.call(fn.symbol,resultType,params);
      if(result)this.line(`store ${resultType} ${value}, ptr ${result}`);this.line(`br label %${success}`);
    }else{
      if(result)params.push({type:'ptr',value:result});if(resultLength)params.push({type:'ptr',value:resultLength});params.push({type:'ptr',value:error});
      const status=this.call(fn.symbol,'i32',params);this.line(`store i32 ${status}, ptr ${statusSlot}`);const ok=this.temp();this.line(`${ok} = icmp eq i32 ${status}, 0`);this.line(`br i1 ${ok}, label %${success}, label %${failed}`);
    }
    this.lines.push(success+':');
    if(!result)this.clear(i.out);
    else{
      const value=this.temp();this.line(`${value} = load ${resultType}, ptr ${result}`);
      if(fn.result.kind==='resource'){
        const resource=i.resources[fn.result.resource!];this.module.declare(resource.release,'void',['ptr']);
        this.call('aug_ir_resource','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value},{type:'ptr',value:this.module.text(resource.id)},{type:'ptr',value:symbol(resource.release)}]);this.line(`store ptr null, ptr ${result}`);
      }else if(resultLength){
        const length=this.temp();this.line(`${length} = load i64, ptr ${resultLength}`);
        this.call(fn.result.kind==='utf8'?'aug_ir_copy_utf8':fn.result.kind==='bytes'?'aug_ir_copy_bytes':'aug_ir_copy_floats','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value},{type:'i64',value:length}]);
      }else if(resultType==='double')this.boxed(i.out,2,this.floats(value));
      else if(resultType==='i8')this.call('aug_ir_copy_bool','void',[{type:'ptr',value:this.ptr(i.out)},{type:'i8',value}]);
      else if(resultType==='i32'){const wide=this.temp();this.line(`${wide} = sext i32 ${value} to i64`);this.boxed(i.out,1,wide);}else this.boxed(i.out,1,value);
    }
    this.line(`br label %${done}`);this.lines.push(failed+':');
    if(fn.status==='i32'){
      const code=this.temp(),payloadCode=this.temp(),status=this.temp(),hasCode=this.temp(),lengthPtr=this.temp(),length=this.temp(),bounded=this.temp(),isBounded=this.temp(),wide=this.temp(),message=this.temp();
      this.line(`${payloadCode} = load i32, ptr ${error}`);this.line(`${status} = load i32, ptr ${statusSlot}`);this.line(`${hasCode} = icmp ne i32 ${payloadCode}, 0`);this.line(`${code} = select i1 ${hasCode}, i32 ${payloadCode}, i32 ${status}`);
      this.line(`${lengthPtr} = getelementptr %NativeError, ptr ${error}, i32 0, i32 1`);this.line(`${length} = load i32, ptr ${lengthPtr}`);
      this.line(`${isBounded} = icmp ule i32 ${length}, 512`);this.line(`${bounded} = select i1 ${isBounded}, i32 ${length}, i32 512`);this.line(`${wide} = zext i32 ${bounded} to i64`);this.line(`${message} = getelementptr %NativeError, ptr ${error}, i32 0, i32 2`);
      this.call('aug_ir_native_error','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:i.errorFactory?symbol(i.errorFactory):'null'},{type:'i32',value:code},{type:'ptr',value:message},{type:'i64',value:wide}]);
    }else this.call('aug_ir_contract_error','void',[{type:'ptr',value:this.ptr(i.out)}]);
    this.line(`br label %${done}`);this.lines.push(done+':');
    for(const cell of cleanupSlots){const value=this.temp();this.line(`${value} = load ptr, ptr ${cell}`);this.call('aug_ir_free','void',[{type:'ptr',value}]);}
    if(result&&(fn.result.release||fn.result.kind==='resource')){
      const value=this.temp(),nonnull=this.temp(),release=this.label('native_release'),after=this.label('native_released');this.line(`${value} = load ptr, ptr ${result}`);this.line(`${nonnull} = icmp ne ptr ${value}, null`);this.line(`br i1 ${nonnull}, label %${release}, label %${after}`);this.lines.push(release+':');
      const args=[{type:'ptr',value}];if(fn.result.releaseLength&&resultLength){const length=this.temp();this.line(`${length} = load i64, ptr ${resultLength}`);args.push({type:'i64',value:length});}
      this.call(fn.result.release??i.resources[fn.result.resource!].release,'void',args);this.line(`br label %${after}`);this.lines.push(after+':');
    }
  }
  private terminator(t:IrTerminator,blockName:string){
    if(t.op==='jump'){this.line('br label %'+t.target);return;}
    if(t.op==='return'){
      this.call('aug_lock_restore','void',[{type:'i64',value:'%lock_base'}]);
      this.call('aug_scope_join_to','void',[{type:'i64',value:'%scope_base'}]);
      for(const slot of this.fn.owned)this.call('aug_ir_drop','void',[{type:'ptr',value:this.ptr(slot)}]);
      for(const slot of this.fn.constructorResults)this.call('aug_ir_constructor_result','void',[{type:'ptr',value:this.ptr(slot)},{type:'ptr',value:this.ptr(0)}]);
      if(this.fn.failedResult)this.call('aug_ir_failed_result','void',[{type:'ptr',value:this.ptr(0)}]);
      this.call('aug_scope_restore','void',[{type:'i64',value:'%scope_base'}]);
      this.line(`store %AugValue ${this.load(0)}, ptr %out, align 8`);this.call('aug_frame_leave','void',[{type:'ptr',value:'%frame'}]);this.line('ret void');return;
    }
    let condition:string,yes:string,no:string;
    if(t.op==='error'){
      const state=this.errorStates.get(blockName);
      if(state){condition=this.temp();this.line(`${condition} = icmp eq i8 ${state}, 2`);}else condition=this.executionFlag(runtimeLayout.executionErrorOffset);
      yes=t.failed;no=t.success;
    }
    else if(t.op==='cancel'){
      const paired=this.pairedStates.get(blockName);
      if(paired){const cancelled=this.executionFlag(runtimeLayout.executionCancelledOffset),failed=this.executionFlag(runtimeLayout.executionErrorOffset),error=this.temp();this.line(`${error} = select i1 ${failed}, i8 2, i8 0`);this.line(`${paired} = select i1 ${cancelled}, i8 1, i8 ${error}`);condition=cancelled;}else condition=this.executionFlag(runtimeLayout.executionCancelledOffset);
      yes=t.then;no=t.otherwise;
    }
    else if(t.op==='error-type'){condition=this.call('aug_error_is','zeroext i1',[{type:'ptr',value:this.module.text(t.type)}]);yes=t.then;no=t.otherwise;}
    else if(t.op==='null'){condition=this.call('aug_ir_is_null','zeroext i1',[{type:'ptr',value:this.ptr(t.input)}]);yes=t.then;no=t.otherwise;}
    else{condition=this.scalarKind(t.condition)==='bool'?this.scalarBoolean(t.condition):this.call('aug_ir_truthy','zeroext i1',[{type:'ptr',value:this.ptr(t.condition)}]);yes=t.then;no=t.otherwise;}
    this.line(`br i1 ${condition}, label %${yes}, label %${no}`);
  }
  generate(){
    const subprogram=this.module.debug.function(this.fn);
    for(const block of this.fn.blocks){this.lines.push(block.name+':');for(const instruction of block.instructions){this.debugLocation=this.module.debug.location(this.fn,instruction.span,instruction.debugScope);this.instruction(instruction);}this.terminator(block.terminator,block.name);}
    const variables=this.fn.variables.filter(variable=>variable.argument).map(variable=>this.variable(variable));
    const prologue=[`define internal void @${this.fn.name}(ptr %out, ptr %self, ptr %args, i32 %count) !dbg ${subprogram} {`,`entry:`,
      `  %roots = alloca [${this.fn.slots} x %AugValue], align 8`,`  %frame = alloca %AugFrame, align 8`,...this.allocations,
      `  store [${this.fn.slots} x %AugValue] zeroinitializer, ptr %roots, align 8`,
      ...this.fn.values.flatMap((value,i)=>value.storage==='scalar-value'?[`  %slot_${i} = alloca %AugValue, align 8`,`  store %AugValue zeroinitializer, ptr %slot_${i}, align 8`]:[`  %slot_${i} = getelementptr [${this.fn.slots} x %AugValue], ptr %roots, i64 0, i64 ${i}`]),
      ...this.fn.parameters.flatMap((slot,i)=>[`  %parameter_ptr_${i} = getelementptr %AugValue, ptr %args, i64 ${i}`,`  %parameter_${i} = load %AugValue, ptr %parameter_ptr_${i}, align 8`,`  store %AugValue %parameter_${i}, ptr %slot_${slot}, align 8`]),
      ...(this.fn.receiver===undefined?[]:[`  %receiver = load %AugValue, ptr %self, align 8`,`  store %AugValue %receiver, ptr %slot_${this.fn.receiver}, align 8`]),
      ...variables,
      `  call void @aug_ir_frame_enter(ptr %frame, ptr %roots, i64 ${this.fn.slots})`,`  %scope_base = call i64 @aug_scope_depth()`,`  %lock_base = call i64 @aug_lock_depth()`,`  br label %entry_body`];
    prologue.splice(-1,0,`  %execution = call ptr @aug_execution_current()`,
      `  %execution_error = getelementptr i8, ptr %execution, i64 ${runtimeLayout.executionErrorOffset}`,
      `  %execution_cancelled = getelementptr i8, ptr %execution, i64 ${runtimeLayout.executionCancelledOffset}`,
      `  %execution_fiber = getelementptr i8, ptr %execution, i64 ${runtimeLayout.executionFiberOffset}`);
    this.module.declare('aug_execution_current','ptr',[]);
    this.module.declare('aug_scope_depth','i64',[]);
    this.module.declare('aug_lock_depth','i64',[]);
    this.module.declare('aug_ir_frame_enter','void',['ptr','ptr','i64']);return [...prologue,...this.lines,'}'].join('\n');
  }
  private variable(variable:IrFunction['variables'][number]){
    if(this.fn.values[variable.slot].storage==='scalar-value')return `  #dbg_declare(ptr %slot_${variable.slot}, ${this.module.debug.variable(this.fn,variable)}, !DIExpression(), ${this.module.debug.location(this.fn,variable.span,variable.scope)})`;
    return `  #dbg_declare(ptr %roots, ${this.module.debug.variable(this.fn,variable)}, !DIExpression(DW_OP_plus_uconst, ${variable.slot*runtimeLayout.valueSize}), ${this.module.debug.location(this.fn,variable.span,variable.scope)})`;
  }
}
