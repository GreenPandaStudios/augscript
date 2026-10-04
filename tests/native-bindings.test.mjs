import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {bindNativeHeader} from '../src/native-bindings.ts';
import {nativeHostTarget,validateNativeDescriptor} from '../src/native-contracts.ts';

const clang=process.env.AUG_BIND_CLANG??(process.platform==='darwin'?'/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang':'clang');
const enabled=spawnSync(clang,['--version'],{encoding:'utf8'}).status===0;
if(process.env.AUG_REQUIRE_NATIVE_HEADER==='1'&&!enabled)throw new Error('The compatibility gate requires its selected maintainer Clang.');
const abiHeader=resolve(import.meta.dirname,'../native/aug-native-abi-1.h');
const header=`#include "${abiHeader}"
typedef struct Handle Handle;
void release(Handle *);
int32_t make(int64_t, Handle **, aug_native_error_v1 *);
int32_t read(const Handle *, double *, aug_native_error_v1 *);
int32_t update(Handle *, uint8_t, aug_native_error_v1 *);
int32_t copy(const void *, uint64_t, void **, uint64_t *, aug_native_error_v1 *);
void releaseBuffer(void *);
int64_t count(void);
`;
const fn=(name,params,result,status='i32')=>({module:'api',name,symbol:name,params,result,...(status==='i32'?{error:'errors.Failure'}:{}),callingConvention:'C',status,uses:[],changes:[],thread:'caller',retainsInputs:false});
const descriptor={format:1,profile:'aug-native-abi-1',resources:[{module:'handles',name:'Handle',release:'release'}],functions:[
  fn('make',[{name:'size',kind:'i64'}],{kind:'resource',resource:'handles.Handle'}),
  fn('read',[{name:'handle',kind:'resource',resource:'handles.Handle',ownership:'read'}],{kind:'f64'}),
  fn('update',[{name:'handle',kind:'resource',resource:'handles.Handle',ownership:'borrow'},{name:'enabled',kind:'bool'}],{kind:'void'}),
  fn('copy',[{name:'input',kind:'bytes'}],{kind:'bytes',release:'releaseBuffer'}),
  fn('count',[],{kind:'i64'},'direct')
]};
function fixture(callback){const root=mkdtempSync(join(tmpdir(),'aug-bind-test-'));try{writeFileSync(join(root,'library.h'),header);writeFileSync(join(root,'native.abi.json'),JSON.stringify(descriptor));callback(root,{header:join(root,'library.h'),contract:join(root,'native.abi.json'),target:nativeHostTarget().triple,output:join(root,'generated'),clang});}finally{rmSync(root,{recursive:true,force:true});}}
test('native maintainer command checks real declarations and generates deterministic source without inferring ownership',{skip:!enabled},()=>fixture((root,options)=>{
  bindNativeHeader(options);const report=JSON.parse(readFileSync(join(options.output,'header-check.json')));
  assert.deepEqual(report.errorLayout,{size:520,alignment:4,offsets:[0,4,8]});assert.equal(report.ownership,'author-declared');
  assert.ok(report.inputs.some(input=>input.path==='library.h'));assert.equal(report.signatures.length,7);
  const source=readFileSync(join(options.output,'src/api.aug'),'utf8');
  assert.match(source,/extern C make\(int size\) returns own Handle unless Failure/);
  assert.match(source,/extern C update\(borrow Handle handle, bool enabled\) returns void unless Failure/);
  const second={...options,output:join(root,'second')};bindNativeHeader(second);
  assert.equal(readFileSync(join(second.output,'header-check.json'),'utf8'),readFileSync(join(options.output,'header-check.json'),'utf8'));
  assert.throws(()=>bindNativeHeader(options),/Output already exists/);
}));
test('native header drift rejects signedness, byte bool, pointer, buffer length, callbacks, release and error layout before writing',{skip:!enabled},()=>{
  const mutations=[
    source=>source.replace('int64_t count','uint64_t count'),
    source=>source.replace('uint8_t,','_Bool,'),
    source=>source.replace('update(Handle *','update(const Handle *'),
    source=>source.replace('const void *, uint64_t','const void *, uint32_t'),
    source=>source.replace('int64_t count(void)','int64_t count(void (*callback)(void))'),
    source=>source.replace('void releaseBuffer(void *)','void releaseBuffer(double *)'),
    source=>source.replace('uint32_t message_length','uint64_t message_length'),
    source=>source.replace('int32_t code','uint32_t code'),
    source=>source.replace('typedef struct Handle Handle;','typedef struct Body {int value;} Handle;'),
    source=>source.replace('typedef struct Handle Handle;','typedef uint64_t Handle;'),
  ];
  for(const mutate of mutations)fixture((root,options)=>{writeFileSync(options.header,mutate(header.replace(`#include "${abiHeader}"`,readFileSync(abiHeader,'utf8'))));assert.throws(()=>bindNativeHeader(options),/NATIVE_HEADER/);assert.equal(existsSync(options.output),false);});
});
test('packaged CLI exposes explicit native maintainer options and reports missing declarations',{skip:!enabled},()=>fixture((root,options)=>{
  const result=spawnSync(process.execPath,[resolve('bin/aug.mjs'),'bind','header',options.header,'--contract',options.contract,'--target',options.target,'--output',options.output,'--clang',clang],{encoding:'utf8',timeout:60000});
  assert.equal(result.status,0,result.stderr);assert.ok(existsSync(join(options.output,'native.abi.json')));
  const invalid=spawnSync(process.execPath,[resolve('bin/aug.mjs'),'bind','header',options.header,'--contract',options.contract],{encoding:'utf8'});
  assert.equal(invalid.status,2);assert.match(invalid.stderr,/requires.*--target/);
}));


test('native worker permission is an explicit boolean promise and defaults to false',()=>{
  assert.equal(validateNativeDescriptor(descriptor).functions[0].workerSafe??false,false);
  const copy=structuredClone(descriptor);copy.functions[0].workerSafe=true;
  assert.equal(validateNativeDescriptor(copy).functions[0].workerSafe,true);
  for(const invalid of ['true',1,null]){copy.functions[0].workerSafe=invalid;assert.throws(()=>validateNativeDescriptor(copy),/workerSafe/);}
});
