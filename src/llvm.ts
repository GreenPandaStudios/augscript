import type {AugustIR,IrFunction,IrInstruction,IrTerminator} from './ir.ts';
import type {NativeView} from './native-contracts.ts';

export interface RuntimeLayout {
  abi:'compiler-private-runtime-v1';valueSize:16;valueAlignment:8;valuePayloadOffset:8;
  frameSize:24;methodEntrySize:24;pointerSize:8;
}
export const runtimeLayout:RuntimeLayout={abi:'compiler-private-runtime-v1',valueSize:16,valueAlignment:8,valuePayloadOffset:8,frameSize:24,methodEntrySize:24,pointerSize:8};
const operations=['PRINT','BINARY','UNARY','FIELD','SET_FIELD','LIST','TUPLE','SET','MAP','MAP_SET','LIST_LENGTH','LIST_GET','LIST_AT','LIST_APPEND','TUPLE_LENGTH','TUPLE_GET','SET_LENGTH','SET_ADD','SET_CONTAINS','MAP_LENGTH','MAP_GET','MAP_TAKE','MAP_CONTAINS','STRING_LENGTH','STRING_BYTES','STRING_SPLIT','STRING_STARTS_WITH','STRING_IS_TOKEN','BYTES_LENGTH','BYTES_TEXT','BYTES_BASE64URL','BASE64URL_DECODE','C_INT','READ_FILE','WRITE_FILE','ARGUMENTS','FREEZE','ITER','MAP_ITER'];
const symbol=(name:string)=>'@'+name;

/** Emit LLVM directly from checked August execution IR. No application C is generated. */
export function generateLLVM(ir:AugustIR,options:{triple?:string;layout?:RuntimeLayout}={}):string {
  if(JSON.stringify(options.layout??runtimeLayout)!==JSON.stringify(runtimeLayout))throw new Error('NATIVE_ABI: Runtime pack layout differs from this compiler');
  const module=new ModuleEmitter(ir,options.triple??'arm64-apple-macosx14.0.0');return module.generate();
}
class ModuleEmitter {
  readonly ir:AugustIR;readonly triple:string;readonly globals:string[]=[];readonly declarations=new Map<string,string>();
  private strings=new Map<string,string>();private sequence=0;
  constructor(ir:AugustIR,triple:string){this.ir=ir;this.triple=triple;}
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
  generate(){
    const bodies=this.ir.functions.map(fn=>new FunctionEmitter(this,fn).generate());
    this.declare('aug_register_globals','void',['ptr','i64']);this.declare('aug_set_cli_args','void',['i32','ptr']);
    this.declare('aug_ir_exit_status','i32',['i1 zeroext']);this.declare('aug_shutdown','void',[]);
    const globalCount=this.ir.bindings.length;
    const startup=this.ir.bindings.filter(b=>b.shared).flatMap((b,i)=>[
      `  call void @${b.function}(ptr %result, ptr null, ptr null, i32 0)`,
      `  %binding_error_${i} = call zeroext i1 @aug_ir_has_error()`,
      `  br i1 %binding_error_${i}, label %done, label %binding_ready_${i}`,
      `binding_ready_${i}:`]);
    const main=[`define i32 @main(i32 %argc, ptr %argv) {`,`entry:`,`  %result = alloca %AugValue, align 8`,`  store %AugValue zeroinitializer, ptr %result, align 8`,
      `  call void @aug_register_globals(ptr @aug_globals, i64 ${globalCount})`,`  call void @aug_set_cli_args(i32 %argc, ptr %argv)`,...startup,
      `  %startup_error = call zeroext i1 @aug_ir_has_error()`,`  br i1 %startup_error, label %done, label %run`,`run:`,
      `  call void @${this.ir.main}(ptr %result, ptr null, ptr null, i32 0)`,`  br label %done`,`done:`,
      `  %status = call i32 @aug_ir_exit_status(i1 zeroext ${this.ir.test?'true':'false'})`,`  call void @aug_shutdown()`,`  ret i32 %status`,`}`].join('\n');
    this.declare('aug_ir_has_error','zeroext i1',[]);
    return [`; August checked execution IR ${this.ir.format}; source revision ${this.ir.sourceRevision}`,`target triple = "${this.triple}"`,
      `%AugValue = type {i32, i64}`,`%AugFrame = type {ptr, i64, ptr}`,`%AugMethodEntry = type {ptr, ptr, ptr}`,`%NativeError = type {i32, i32, [512 x i8]}`,
      `@aug_globals = internal global [${Math.max(1,globalCount)} x %AugValue] zeroinitializer, align 8`,...this.globals,...this.declarations.values(),...bodies,main,''].join('\n\n');
  }
}
class FunctionEmitter {
  readonly module:ModuleEmitter;readonly fn:IrFunction;private sequence=0;private lines:string[]=[];private allocations:string[]=[];
  constructor(module:ModuleEmitter,fn:IrFunction){this.module=module;this.fn=fn;}
  private temp(prefix='value'){return '%'+prefix+'_'+this.sequence++;}
  private label(prefix='native'){return prefix+'_'+this.sequence++;}
  private line(value:string){this.lines.push('  '+value);}
  private allocate(type:string){const name=this.temp('storage');this.allocations.push(`  ${name} = alloca ${type}, align 8`);return name;}
  private ptr(slot:number){return '%slot_'+slot;}
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
  private instruction(i:IrInstruction){
    switch(i.op){
      case 'literal':{
        if(i.numeric){if(i.numeric.kind==='int')this.boxed(i.out,1,i.numeric.text);else{const bytes=Buffer.alloc(8);bytes.writeDoubleBE(Number(i.numeric.text));this.boxed(i.out,2,this.floats('0x'+bytes.toString('hex').toUpperCase()));}}
        else if(typeof i.value==='string')this.call('aug_ir_string','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.module.text(i.value)},{type:'i64',value:String(Buffer.byteLength(i.value))}]);
        else if(typeof i.value==='boolean')this.boxed(i.out,3,i.value?'1':'0');else this.clear(i.out);return;
      }
      case 'copy':this.store(i.out,this.load(i.input));return;
      case 'clear':this.clear(i.slot);return;
      case 'runtime':{
        const op=operations.indexOf(i.operation)+1;if(!op)throw new Error('Unknown IR runtime operation '+i.operation);
        this.call('aug_ir_operation','void',[{type:'ptr',value:this.ptr(i.out)},{type:'i32',value:String(op)},{type:'ptr',value:this.args(i.args)},{type:'i32',value:String(i.args.length)},{type:'ptr',value:i.text===undefined?'null':this.module.text(i.text)},{type:'i64',value:String(i.number??0)}]);return;
      }
      case 'call':this.line(`call void @${i.function}(ptr ${this.ptr(i.out)}, ptr ${i.receiver===undefined?'null':this.ptr(i.receiver)}, ptr ${this.args(i.args)}, i32 ${i.args.length})`);return;
      case 'method':this.call('aug_ir_method','void',[{type:'ptr',value:this.ptr(i.out)},{type:'ptr',value:this.ptr(i.receiver)},{type:'ptr',value:this.module.text(i.name)},{type:'ptr',value:this.args(i.args)},{type:'i32',value:String(i.args.length)}]);return;
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
  private terminator(t:IrTerminator){
    if(t.op==='jump'){this.line('br label %'+t.target);return;}
    if(t.op==='return'){
      for(const slot of this.fn.owned)this.call('aug_ir_drop','void',[{type:'ptr',value:this.ptr(slot)}]);
      if(this.fn.failedResult)this.call('aug_ir_failed_result','void',[{type:'ptr',value:this.ptr(0)}]);
      this.line(`store %AugValue ${this.load(0)}, ptr %out, align 8`);this.call('aug_frame_leave','void',[{type:'ptr',value:'%frame'}]);this.line('ret void');return;
    }
    let condition:string,yes:string,no:string;
    if(t.op==='error'){condition=this.call('aug_ir_has_error','zeroext i1',[]);yes=t.failed;no=t.success;}
    else if(t.op==='error-type'){condition=this.call('aug_error_is','zeroext i1',[{type:'ptr',value:this.module.text(t.type)}]);yes=t.then;no=t.otherwise;}
    else if(t.op==='null'){condition=this.call('aug_ir_is_null','zeroext i1',[{type:'ptr',value:this.ptr(t.input)}]);yes=t.then;no=t.otherwise;}
    else{condition=this.call('aug_ir_truthy','zeroext i1',[{type:'ptr',value:this.ptr(t.condition)}]);yes=t.then;no=t.otherwise;}
    this.line(`br i1 ${condition}, label %${yes}, label %${no}`);
  }
  generate(){
    for(const block of this.fn.blocks){this.lines.push(block.name+':');for(const instruction of block.instructions)this.instruction(instruction);this.terminator(block.terminator);}
    const prologue=[`define internal void @${this.fn.name}(ptr %out, ptr %self, ptr %args, i32 %count) {`,`entry:`,
      `  %roots = alloca [${this.fn.slots} x %AugValue], align 8`,`  %frame = alloca %AugFrame, align 8`,...this.allocations,
      `  store [${this.fn.slots} x %AugValue] zeroinitializer, ptr %roots, align 8`,
      ...Array.from({length:this.fn.slots},(_,i)=>`  %slot_${i} = getelementptr [${this.fn.slots} x %AugValue], ptr %roots, i64 0, i64 ${i}`),
      ...this.fn.parameters.flatMap((slot,i)=>[`  %parameter_ptr_${i} = getelementptr %AugValue, ptr %args, i64 ${i}`,`  %parameter_${i} = load %AugValue, ptr %parameter_ptr_${i}, align 8`,`  store %AugValue %parameter_${i}, ptr %slot_${slot}, align 8`]),
      ...(this.fn.receiver===undefined?[]:[`  %receiver = load %AugValue, ptr %self, align 8`,`  store %AugValue %receiver, ptr %slot_${this.fn.receiver}, align 8`]),
      `  call void @aug_ir_frame_enter(ptr %frame, ptr %roots, i64 ${this.fn.slots})`,`  br label %entry_body`];
    this.module.declare('aug_ir_frame_enter','void',['ptr','ptr','i64']);return [...prologue,...this.lines,'}'].join('\n');
  }
}
