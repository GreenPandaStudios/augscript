import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync,writeFileSync,readFileSync,rmSync,realpathSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {compileLLVM} from '../src/llvm-native.ts';

const compilerRoot=resolve(import.meta.dirname,'..'),mac=process.platform==='darwin';
const enabled=!!process.env.AUG_LLVM_HOME&&(mac&&process.arch==='arm64'||process.platform==='linux'&&['x64','arm64'].includes(process.arch));
test('LLVM emits native floating arithmetic and preserves widened integer behavior',{skip:!enabled},()=>{
  const root=realpathSync(mkdtempSync(join(tmpdir(),'aug-llvm-float-')));
  try{
    writeFileSync(join(root,'main.aug'),`float sum = 0.0
int index = 0
while index < 1000:
    sum = sum + 0.125
    index = index + 1
print(value=sum)
float integerLeft = 7
float integerRight = 2
try:
    print(value=integerLeft / integerRight)
catch ArithmeticError error:
    print(value="wrong")
print(value=integerLeft + 0.5)
float maximum = 9223372036854775807
print(value=maximum + 1)
try:
    float zero = -0.0
    print(value=sum / zero)
catch ArithmeticError error:
    print(value="checked")
`);
    const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[]);
    const compiled=compileLLVM(checked,{release:true});
    assert.match(readFileSync(join(root,'.aug-build/program.optimized.ll'),'utf8'),/fadd double/,'A checked floating loop must contain native floating arithmetic');
    const result=spawnSync(compiled.output,[],{encoding:'utf8',timeout:10000});
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'125\n3\n7.5\n-9223372036854775808\nchecked\n');
  }finally{rmSync(root,{recursive:true,force:true});}
});
const minimalPrograms=[
  {name:'scalar print',source:'print(value=7)\n',expected:'7\n'},
  {name:'checked division',source:'try:\n    int divisor = 2\n    print(value=14 / divisor)\ncatch ArithmeticError error:\n    print(value="wrong")\n',expected:'7\n'},
  {name:'collection iteration',source:'own Map<int, int> values = {1: 3, 2: 6}\nown Set<int> keys = {1, 2}\nint sum = 0\nfor (key, value) in values:\n    if keys.contains(value=key):\n        sum = sum + value\nprint(value=sum)\n',expected:'9\n'},
];
for(const release of [false,true])for(const program of minimalPrograms)test(`LLVM ${program.name} omits unrelated JSON and task services (${release?'optimized':'development'})`,{skip:!enabled},()=>{
  const root=realpathSync(mkdtempSync(join(tmpdir(),'aug-llvm-minimal-')));
  try{
    writeFileSync(join(root,'main.aug'),program.source);
    const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[]);
    const compiled=compileLLVM(checked,{release});
    const inspector=mac?'/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/nm':'nm';
    const symbols=spawnSync(inspector,['--defined-only',compiled.output],{encoding:'utf8'});
    assert.equal(symbols.status,0,symbols.stderr);
    assert.doesNotMatch(symbols.stdout,/\b_?aug_ir_operation\b|\b_?aug_json_\w+\b|\b_?aug_task_spawn\b/,'A core-only program must not retain the generic runtime dispatcher or unrelated native services');
    const result=spawnSync(compiled.output,[],{encoding:'utf8',timeout:10000});
    assert.equal(result.status,0,result.stderr||result.error?.message);assert.equal(result.stdout,program.expected);
  }finally{rmSync(root,{recursive:true,force:true});}
});
for(const release of [false,true])for(const cancel of [false,true])test(`LLVM main observes installed checkpoint hooks and cancellation (${release?'optimized':'development'}, ${cancel?'cancel':'count'})`,{skip:!enabled},()=>{
  const root=realpathSync(mkdtempSync(join(tmpdir(),'aug-llvm-execution-')));
  try{
    const helper=join(root,'hook.c'),filename=mac?'libhook.dylib':'libhook.so';
    writeFileSync(helper,`#include "aug_runtime.h"
#include <stdio.h>
static int calls;
static void observe(void) {
  ++calls;
  if (${cancel?1:0} && calls == 3) {
    puts("cancelled by hook");
    aug_execution_current()->cancelled = true;
  }
}
void installHook(void) { calls = 0; aug_task_checkpoint_hook = observe; }
int hookCount(void) { return calls; }
void removeHook(void) { aug_task_checkpoint_hook = NULL; }
`);
    const cc=mac?'/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang':'clang';
    const flags=mac?['-isysroot',process.env.AUG_TEST_MACOS_SDK??'/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk','-dynamiclib','-mmacosx-version-min=14.0','-Wl,-undefined,dynamic_lookup','-Wl,-install_name,@rpath/'+filename]:['-shared','-fPIC','-Wl,-soname,'+filename];
    const native=spawnSync(cc,[...flags,'-I'+join(compilerRoot,'runtime'),helper,'-o',join(root,filename)],{encoding:'utf8'});
    assert.equal(native.status,0,native.stderr);
    writeFileSync(join(root,'hooks.aug'),'extern C installHook()\nextern C hookCount() returns c_int\nextern C removeHook()\n');
    writeFileSync(join(root,'main.aug'),`import installHook and hookCount and removeHook from hooks
unsafe:
    installHook()
int index = 0
while index < 4:
    index = index + 1
unsafe:
    print(value=hookCount())
    removeHook()
`);
    const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[]);
    const compiled=compileLLVM(checked,{release,native:[{directory:root,libraries:[filename],runtimeFiles:[]}]});
    if(mac){
      const inspector='/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/dyld_info';
      const dynamic=spawnSync(inspector,['-dependents','-exports',compiled.output],{encoding:'utf8'});
      assert.equal(dynamic.status,0,dynamic.stderr);
      assert.doesNotMatch(dynamic.stdout,/libaug_runtime/,'core-only programs must contain one statically linked runtime');
      const exports=[...dynamic.stdout.matchAll(/\b(_aug_\w+)\b/g)].map(match=>match[1]).sort();
      assert.deepEqual(exports,['_aug_execution_current','_aug_native_cancelled_v1','_aug_task_checkpoint_hook'],'export only hook entry and the read-only native cancellation probe');
    }else{
      const dynamic=spawnSync('readelf',['--dynamic','--dyn-syms','--wide',compiled.output],{encoding:'utf8'});
      assert.equal(dynamic.status,0,dynamic.stderr);
      assert.doesNotMatch(dynamic.stdout,/Shared library: \[libaug_runtime/,'core-only programs must contain one statically linked runtime');
      const exports=[...dynamic.stdout.matchAll(/\bGLOBAL\s+DEFAULT\s+\d+\s+(aug_\w+)/g)].map(match=>match[1]).sort();
      assert.deepEqual(exports,['aug_execution_current','aug_native_cancelled_v1','aug_task_checkpoint_hook'],'export only hook entry and the read-only native cancellation probe');
    }
    const result=spawnSync(compiled.output,[],{encoding:'utf8',timeout:10000});
    assert.equal(result.status,0,result.stderr||result.error?.message);
    assert.equal(result.stdout,cancel?'cancelled by hook\n':'5\n');
  }finally{rmSync(root,{recursive:true,force:true});}
});
