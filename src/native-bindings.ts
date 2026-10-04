import {createHash} from 'node:crypto';
import {existsSync,mkdtempSync,mkdirSync,readFileSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join,relative,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {nativeTarget,validateNativeDescriptor,type NativeDescriptor,type NativeView} from './native-contracts.ts';

interface Declaration {id?:string;kind:string;name?:string;type?:{qualType:string};decl?:{id:string};completeDefinition?:boolean;inner?:Declaration[]}
const fail=(message:string):never=>{throw new Error('NATIVE_HEADER: '+message);};
const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
const scalar=(view:NativeView)=>({void:'void',i64:'int64_t',i32:'int32_t',f64:'double',bool:'uint8_t'} as Record<string,string>)[view.kind];

/** Check a maintainer-supplied ownership contract against real C declarations.
 * Clang is invoked only by this explicit command, never by package installation.
 * The result records physical checks, not proof of allocator or thread promises.
 */
export function bindNativeHeader(options:{header:string;contract:string;target:string;output:string;clang:string;flags?:string[]}):void {
  const header=resolve(options.header),contract=resolve(options.contract),output=resolve(options.output),flags=options.flags??[];
  nativeTarget(options.target);
  if(existsSync(output))fail('Output already exists. Select a new directory; accepted bindings are never overwritten.');
  const descriptor=validateNativeDescriptor(JSON.parse(readFileSync(contract,'utf8'))),initialHeader=hash(header),initialContract=hash(contract);
  const invoke=(args:string[])=>{
    const result=spawnSync(options.clang,args,{encoding:'utf8',timeout:60000,maxBuffer:32*1024*1024});
    if(result.status!==0)fail('Clang rejected the header or ABI probe. '+(result.error?.message??result.stderr.split('\n').filter(line=>!/^\.+ /.test(line)).join('\n').slice(0,8000)));
    return result;
  };
  const compiler=invoke(['--version']).stdout.trim();
  if(!/clang version\s+(\d+)/.test(compiler))fail('The selected executable is not Clang.');
  // Force parsing and probing as C. C++ libraries expose a C adapter header.
  const base=[...flags,'-target',options.target,'-std=c11','-x','c'];
  const includePaths=(stderr:string)=>stderr.split('\n').flatMap(line=>{const match=/^\.+ (.+)$/.exec(line);return match&&existsSync(match[1])?[resolve(match[1])]:[];});
  const parsed=invoke([...base,'-H','-Xclang','-ast-dump=json','-fsyntax-only',header]);
  const ast=JSON.parse(parsed.stdout) as Declaration;
  const headerInputs=new Map([...new Set([header,...includePaths(parsed.stderr)])].map(path=>[path,hash(path)]));
  const declarations=new Map<string,Declaration>(),records=new Map<string,Declaration>(),aliases=new Map<string,Declaration>();
  const visit=(node:Declaration)=>{
    if(node.kind==='FunctionDecl'&&node.name){
      const previous=declarations.get(node.name);
      if(previous&&previous.type?.qualType!==node.type?.qualType)fail('Conflicting declarations for '+node.name);
      declarations.set(node.name,node);
    }
    if(node.kind==='RecordDecl'&&node.name){records.set(node.name,node);if(node.id)records.set(node.id,node);}
    if(node.kind==='TypedefDecl'&&node.name)aliases.set(node.name,node);
    for(const child of node.inner??[])visit(child);
  };visit(ast);
  const get=(symbol:string)=>declarations.get(symbol)??fail('Missing C declaration for '+symbol);
  const params=(node:Declaration)=>(node.inner??[]).filter(child=>child.kind==='ParmVarDecl').map(child=>child.type!.qualType);
  const opaque=new Map<string,string>();
  for(const resource of descriptor.resources){
    const declaration=get(resource.release),arguments_=params(declaration);
    if(arguments_.length!==1)fail(resource.release+' must release exactly one opaque pointer.');
    const type=arguments_[0].replace(/\s+/g,' ').trim();
    if(!/^(?:struct )?[A-Za-z_]\w* \*$/.test(type)||type.startsWith('const '))fail(resource.release+' requires a mutable opaque pointer.');
    const name=type.replace(/ \*$/,'').replace(/^struct /,'');
    if(name!=='void'){
      let record=records.get(name);
      const findRecord=(node:Declaration)=>{if(node.kind==='RecordType'&&node.decl)record=records.get(node.decl.id);for(const child of node.inner??[])findRecord(child);};
      const alias=aliases.get(name);if(alias)findRecord(alias);
      if(!record||record.completeDefinition)fail('Resource '+resource.name+' requires an incomplete C record or void pointer; use an opaque adapter.');
    }
    opaque.set(resource.module+'.'+resource.name,type);
  }
  const checks:string[]=[],signatures:{symbol:string;parameters:string[];result:string}[]=[];
  const check=(symbol:string,result:string,arguments_:string[])=>{
    get(symbol);const index=checks.length;
    checks.push(`typedef ${result} (*aug_check_${index})(${arguments_.join(', ')||'void'});\n_Static_assert(__builtin_types_compatible_p(__typeof__(&${symbol}), aug_check_${index}), "ABI mismatch: ${symbol}");`);
    signatures.push({symbol,parameters:arguments_,result});
  };
  for(const resource of descriptor.resources)check(resource.release,'void',[opaque.get(resource.module+'.'+resource.name)!]);
  const input=(view:NativeView,actual:string):string[]=>{
    const primitive=scalar(view);if(primitive)return [primitive];
    if(view.kind==='resource'){
      const type=opaque.get(view.resource!)!,unqualified=actual.replace(/^const\s+/,'').replace(/\s+/g,' ').trim();
      if(unqualified!==type||view.ownership!=='read'&&/^const\s/.test(actual))fail('Resource pointer or mutable loan differs for '+view.resource);
      return [actual];
    }
    if(view.kind==='f64-list')return ['const double *','uint64_t'];
    if(view.kind==='utf8-list')return ['const void *const *','const uint64_t *','uint64_t'];
    return ['const void *','uint64_t'];
  };
  for(const fn of descriptor.functions){
    const actual=params(get(fn.symbol)),arguments_:string[]=[];
    for(const view of fn.params)arguments_.push(...input(view,actual[arguments_.length]??''));
    if(fn.status==='i32'){
      const result=scalar(fn.result);
      if(fn.result.kind==='resource')arguments_.push(opaque.get(fn.result.resource!)!+'*');
      else if(result&&result!=='void')arguments_.push(result+' *');
      else if(!result)arguments_.push(fn.result.kind==='f64-list'?'double **':'void **','uint64_t *');
      arguments_.push('aug_native_error_v1 *');
    }
    check(fn.symbol,fn.status==='i32'?'int32_t':scalar(fn.result)!,arguments_);
    if(fn.result.release)check(fn.result.release,'void',[fn.result.kind==='f64-list'?'double *':'void *',...(fn.result.releaseLength?['uint64_t']:[])]);
  }
  const stage=mkdtempSync(join(tmpdir(),'aug-header-check-'));
  try{
    const probe=join(stage,'probe.c');
    const layout=descriptor.functions.some(fn=>fn.status==='i32')?`
_Static_assert(sizeof(aug_native_error_v1)==520, "error size");
_Static_assert(_Alignof(aug_native_error_v1)==4, "error alignment");
_Static_assert(offsetof(aug_native_error_v1,code)==0, "error code offset");
_Static_assert(offsetof(aug_native_error_v1,message_length)==4, "error length offset");
_Static_assert(offsetof(aug_native_error_v1,message)==8, "error buffer offset");
_Static_assert(__builtin_types_compatible_p(__typeof__(((aug_native_error_v1*)0)->code),int32_t), "error code type");
_Static_assert(__builtin_types_compatible_p(__typeof__(((aug_native_error_v1*)0)->message_length),uint32_t), "error length type");
_Static_assert(__builtin_types_compatible_p(__typeof__(((aug_native_error_v1*)0)->message),unsigned char[512]), "error buffer type");` : '';
    writeFileSync(probe,'#include <stdint.h>\n#include <stddef.h>\n#include '+JSON.stringify(header)+'\n'+layout+'\n'+checks.join('\n')+'\n');
    const verified=invoke([...base,'-Werror','-H','-fsyntax-only',probe]);
    const included=[...new Set([header,...includePaths(verified.stderr)])].sort();
    const inputs=included.map(path=>({path:relative(dirname(header),path).replaceAll('\\','/'),sha256:hash(path)}));
    for(const [path,digest] of headerInputs)if(!existsSync(path)||hash(path)!==digest)fail('An included header changed during validation; retry.');
    if(hash(header)!==initialHeader||hash(contract)!==initialContract)fail('Header or ownership contract changed during validation; retry.');
    mkdirSync(dirname(output),{recursive:true});const generated=mkdtempSync(join(dirname(output),'.aug-bind-'));
    try{
      writeFileSync(join(generated,'native.abi.json'),JSON.stringify(descriptor,null,2)+'\n');
      writeFileSync(join(generated,'header-check.json'),JSON.stringify({format:1,profile:descriptor.profile,target:options.target,compiler,flags,contractSha256:initialContract,inputs,signatures,errorLayout:layout?{size:520,alignment:4,offsets:[0,4,8]}:undefined,ownership:'author-declared',retention:'author-declared',allocatorPairing:'author-declared'},null,2)+'\n');
      emitDeclarations(descriptor,generated);renameSync(generated,output);
    }finally{rmSync(generated,{recursive:true,force:true});}
  }finally{rmSync(stage,{recursive:true,force:true});}
}

function emitDeclarations(descriptor:NativeDescriptor,directory:string){
  const modules=new Map<string,{imports:Set<string>;lines:string[]}>();
  const module=(name:string)=>{if(!modules.has(name))modules.set(name,{imports:new Set(),lines:[]});return modules.get(name)!;};
  const type=(view:NativeView,current:string):string=>{
    if(view.kind==='resource'){
      const dot=view.resource!.lastIndexOf('.'),source=view.resource!.slice(0,dot),name=view.resource!.slice(dot+1);
      if(source!==current)module(current).imports.add(`import ${name} from ${source.replaceAll('/','.')}`);
      return name;
    }
    return ({void:'void',i64:'int',i32:'c_int',f64:'float',bool:'bool',utf8:'string',bytes:'Bytes','f64-list':'List<float>','utf8-list':'List<string>'})[view.kind];
  };
  for(const resource of descriptor.resources)module(resource.module).lines.push('extern C resource '+resource.name);
  for(const fn of descriptor.functions){
    const parameters=fn.params.map(view=>(view.ownership==='consume'?'own ':view.ownership==='borrow'?'borrow ':'')+type(view,fn.module)+' '+view.name);
    let error='';if(fn.error){const dot=fn.error.lastIndexOf('.'),name=fn.error.slice(dot+1),source=fn.error.slice(0,dot);if(source!==fn.module)module(fn.module).imports.add(`import ${name} from ${source.replaceAll('/','.')}`);error=' unless '+name;}
    module(fn.module).lines.push(`extern C ${fn.name}(${parameters.join(', ')}) returns ${fn.result.kind==='resource'?'own ':''}${type(fn.result,fn.module)}${error}${fn.uses.length?' uses '+fn.uses.join(' and '):''}${fn.changes.length?' changes '+fn.changes.join(' and '):''}`);
  }
  for(const [name,value] of [...modules].sort(([a],[b])=>a.localeCompare(b,'en'))){const file=join(directory,'src',name+'.aug');mkdirSync(dirname(file),{recursive:true});writeFileSync(file,[...value.imports].sort().concat(value.lines).join('\n')+'\n');}
}
