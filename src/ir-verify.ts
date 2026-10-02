import type {AugustIR,IrFunction,IrInstruction,IrTerminator} from './ir.ts';
import {isIRScalar} from './ir-types.ts';
import type {Span} from './ast.ts';
import {runtimeOperations,httpOperations,schemaKinds,runtimeArities} from './runtime-abi.ts';
import {runtimeAdapters,adapterSymbol} from './runtime-adapters.ts';

export class IRVerificationError extends Error {
  readonly code='IR_INVALID';
  readonly span:Span;
  constructor(span:Span,message:string){super(message);this.span=span;}
}
const identifier=/^[A-Za-z_][A-Za-z0-9_]*$/;
const successors=(t:IrTerminator)=>t.op==='return'?[]:t.op==='jump'?[t.target]:t.op==='error'?[t.failed,t.success]:[t.then,t.otherwise];

/** Check compiler data before emitting any native code. All slots are initialized
 * null root cells, including cells used only on failure/cleanup paths. This is a
 * structural and ABI verifier; source typing/loan analysis remains the frontend. */
export function verifyIR(ir:AugustIR):void {
  const span=ir.functions[0]?.span??{file:'main.aug',line:1,column:1,start:0,end:0};
  const fail=(message:string,at=span):never=>{throw new IRVerificationError(at,message);};
  if(ir.format!==1||!/^[0-9a-f]{64}$/.test(ir.sourceRevision))fail('Invalid IR format or source revision');
  const functions=new Map<string,IrFunction>();
  for(const fn of ir.functions){if(!identifier.test(fn.name)||functions.has(fn.name))fail('Duplicate or invalid function '+fn.name,fn.span);functions.set(fn.name,fn);}
  const entry=(name:string,count:number,receiver:boolean,at:Span)=>{
    const fn=functions.get(name);if(!fn)fail('Unresolved IR function '+name,at);
    if(fn!.parameters.length!==count||(fn!.receiver!==undefined)!==receiver)fail('Call signature differs for '+name,at);
  };
  entry(ir.main,0,false,span);
  if(ir.bindings.length!==ir.scoped.length)fail('Binding scope table has a different length');
  ir.bindings.forEach(binding=>entry(binding.function,0,false,span));
  const schemas=new Map(ir.schemas.map(schema=>[schema.name,schema]));
  if(schemas.size!==ir.schemas.length)fail('Duplicate data schema');
  for(const schema of ir.schemas){
    if(!identifier.test(schema.name)||!(schemaKinds as readonly string[]).includes(schema.kind))fail('Invalid data schema '+schema.name);
    for(const field of schema.fields)if(!schemas.has(field))fail('Unresolved schema '+field);
    if(schema.kind==='RECORD'){if(schema.fields.length!==schema.labels.length||!schema.maker)fail('Invalid record schema '+schema.name);entry(schema.maker!,schema.fields.length,false,span);}
    else if(schema.maker||schema.labels.length)fail('A nonrecord schema has a constructor or labels');
  }
  const routes=new Set<string>();
  for(const table of ir.routes){
    if(!identifier.test(table.name)||routes.has(table.name))fail('Duplicate or invalid route table');routes.add(table.name);
    for(const route of table.items){const fn=functions.get(route.function);if(!fn||fn.receiver!==undefined||fn.parameters.length>1)fail('Invalid route callback '+route.function);}
  }
  const components=new Set(ir.components);
  for(const component of components)if(!['crypto','http'].includes(component))fail('Unsupported runtime component '+component);
  if(routes.size&&!components.has('http'))fail('HTTP routes require their runtime component');
  for(const fn of ir.functions){
    const at=fn.span,slot=(value:number)=>{if(!Number.isSafeInteger(value)||value<0||value>=fn.slots)fail('Slot outside the registered root frame: '+value,at);};
    if(!Number.isSafeInteger(fn.slots)||fn.slots<1||fn.values.length!==fn.slots||fn.values.some(value=>!value.type.id||!value.type.name||value.storage!=='rooted-value'&&(value.storage!=='scalar-value'||!isIRScalar(value.type))))fail('Invalid typed root frame',at);
    for(const value of [...fn.parameters,...fn.owned,...fn.constructorResults,...fn.variables.map(variable=>variable.slot)])slot(value);
    if(fn.receiver!==undefined)slot(fn.receiver);
    if(new Set(fn.parameters).size!==fn.parameters.length||fn.parameters.includes(0)||fn.receiver===0||fn.receiver!==undefined&&fn.parameters.includes(fn.receiver))fail('Overlapping result/parameter/receiver cells',at);
    if(fn.owned.includes(0)||new Set(fn.owned).size!==fn.owned.length)fail('Invalid owned cleanup cells',at);
    const scopes=new Set<string>();
    for(const scope of fn.scopes){if(!identifier.test(scope.name)||scopes.has(scope.name)||scope.parent!==undefined&&!scopes.has(scope.parent))fail('Invalid lexical scope tree',at);scopes.add(scope.name);}
    for(const variable of fn.variables)if(variable.scope!==undefined&&!scopes.has(variable.scope))fail('Variable has an unresolved lexical scope',variable.span);
    const blocks=new Set(fn.blocks.map(block=>block.name));
    if(blocks.size!==fn.blocks.length||!blocks.has('entry_body')||!blocks.has('cleanup'))fail('Missing or duplicated entry/cleanup blocks',at);
    for(const block of fn.blocks){
      if(!identifier.test(block.name)||!block.terminator)fail('Invalid basic block',at);
      if(block.terminator.op==='return'&&block.name!=='cleanup'||block.name==='cleanup'&&block.terminator.op!=='return')fail('Return bypasses function cleanup',at);
      for(const target of successors(block.terminator))if(!blocks.has(target))fail('Branch to missing block '+target,at);
      const t=block.terminator;if(t.op==='branch')slot(t.condition);if(t.op==='null')slot(t.input);
      for(const instruction of block.instructions){
        if(instruction.debugScope!==undefined&&!scopes.has(instruction.debugScope))fail('Instruction has an unresolved lexical scope',instruction.span);
        if('out' in instruction&&instruction.out!==undefined)slot(instruction.out);
        if('input' in instruction)slot(instruction.input);
        if('slot' in instruction)slot(instruction.slot);
        if('args' in instruction)instruction.args.forEach(slot);
        if('receiver' in instruction&&instruction.receiver!==undefined)slot(instruction.receiver);
        verifyInstruction(instruction,ir,fn,entry,schemas,routes,components,slot,fail);
      }
    }
  }
}
function verifyInstruction(i:IrInstruction,ir:AugustIR,fn:IrFunction,entry:(name:string,count:number,receiver:boolean,at:Span)=>void,schemas:Map<string,unknown>,routes:Set<string>,components:Set<string>,slot:(n:number)=>void,fail:(message:string,at?:Span)=>never){
  const error=(message:string)=>fail(message,i.span);
  switch(i.op){
    case 'call':entry(i.function,i.args.length,i.receiver!==undefined,i.span);return;
    case 'method':if(!identifier.test(i.name))error('Invalid method identity');return;
    case 'start':entry(i.function,i.args.length,i.receiver!==undefined,i.span);if(i.owned.length!==i.args.length)error('Task capture ownership mask has a different length');return;
    case 'runtime':{
      if(!(runtimeOperations as readonly string[]).includes(i.operation)&&!(httpOperations as readonly string[]).includes(i.operation))error('Unknown runtime operation '+i.operation);
      const arity=runtimeArities[i.operation as keyof typeof runtimeArities];
      if(arity!=='variadic'&&i.args.length!==arity)error('Runtime argument count differs for '+i.operation);
      if(i.operation==='BINARY'&&!['+','-','*','/','==','!=','<','>','<=','>='].includes(i.text??''))error('Invalid binary operator');
      if(i.operation==='UNARY'&&!['!','-'].includes(i.text??''))error('Invalid unary operator');
      if(i.operation==='IS_TYPE'&&(typeof i.text!=='string'||!i.text||i.text.includes('\0')))error('Missing nominal type identity');
      if(i.operation==='HTTP_ACTION'){try{const action=JSON.parse(i.text!);if(!action||typeof action!=='object')throw new Error();}catch{error('Missing action metadata');}}
      if(i.operation.startsWith('HTTP_')&&!components.has('http'))error('HTTP operation has no runtime component');
      if(['FIELD','SET_FIELD'].includes(i.operation)&&(!Number.isSafeInteger(i.number)||i.number!<0))error('Invalid field offset');return;
    }
    case 'adapter':{const adapter=runtimeAdapters.find(adapter=>adapterSymbol(adapter)===i.name);if(!adapter||!components.has(adapter.component)||adapter.parameters.length!==i.args.length)error('Unsupported runtime adapter signature '+i.name);return;}
    case 'native':
      if(i.args.length!==i.binding.params.length||i.binding.callingConvention!=='C'||i.binding.thread!=='caller'||i.binding.retainsInputs)error('Unsupported native call contract');
      for(const view of [...i.binding.params,i.binding.result])if(view.kind==='resource'&&(!view.resource||!i.resources[view.resource]))error('Unresolved native resource identity');
      if(i.binding.error){if(!i.error||!i.errorFactory)error('Missing resolved native error factory');entry(i.errorFactory!,2,false,i.span);}return;
    case 'extern':if(i.types.length!==i.args.length||!identifier.test(i.name)||i.types.some(type=>!['int','c_int','float','bool','string'].includes(type))||!['void','int','c_int','float','bool'].includes(i.result))error('Unsupported direct C signature');return;
    case 'object':if(i.fields.length!==i.owned.length)error('Object ownership mask has a different length');i.methods.forEach(method=>{const target=ir.functions.find(fn=>fn.name===method.function);if(!target||target.receiver===undefined)error('Invalid object method callback');});return;
    case 'decode':slot(i.input);if(!schemas.has(i.schema))error('Unresolved decoding schema');if(i.format==='form'&&!components.has('http'))error('Form decoding has no HTTP component');return;
    case 'http-bind':slot(i.request);if(i.schema&&!schemas.has(i.schema))error('Unresolved wire schema');if(!components.has('http'))error('Wire decoding has no HTTP component');return;
    case 'html':i.attributes.forEach(slot);i.children.forEach(slot);if(i.attributes.length%2||!components.has('http'))error('Invalid HTML attribute/component contract');return;
    case 'http-policy':if(i.args.length!==3||!Number.isInteger(i.policy.kind)||i.policy.kind<1||i.policy.kind>7||!components.has('http'))error('Invalid HTTP policy contract');return;
    case 'http-failure':if(!components.has('http'))error('HTTP failure has no runtime component');return;
    case 'routes':if(!routes.has(i.name)||!components.has('http')||(i.port===undefined)===(i.out===undefined))error('Invalid route invocation');if(i.port!==undefined)slot(i.port);return;
    case 'binding-get':case 'binding-set':if(!Number.isSafeInteger(i.index)||i.index<0||i.index>=ir.bindings.length)error('Binding outside the global root table');return;
    case 'error-state':slot(i.error);slot(i.cancelled);if(i.error===i.cancelled)error('Overlapping error/cancellation cells');return;
    case 'scope':case 'lock':if(i.depth!==undefined)slot(i.depth);return;
    case 'wait':i.tasks.forEach(slot);if(!i.tasks.length)error('Empty task wait');return;
    case 'assert':slot(i.input);return;
    case 'cover':if(!ir.coverage.some(point=>point.file===i.file&&point.line===i.line))error('Unregistered statement coverage point');return;
    case 'debug-variable':if(!Number.isSafeInteger(i.variable)||i.variable<0||i.variable>=fn.variables.length)error('Unresolved debug variable');return;
    case 'literal':case 'copy':case 'clear':case 'checkpoint':case 'throw':case 'take-error':case 'drop':case 'scope-depth':case 'lock-depth':return;
    default:{const unreachable:never=i;error('Unsupported IR instruction '+JSON.stringify(unreachable));}
  }
}
