import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync,writeFileSync,rmSync,realpathSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {compileLLVM} from '../src/llvm-native.ts';

const compilerRoot=resolve(import.meta.dirname,'..'),mac=process.platform==='darwin';
const enabled=!!process.env.AUG_LLVM_HOME&&(mac&&process.arch==='arm64'||process.platform==='linux'&&['x64','arm64'].includes(process.arch));
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
    const result=spawnSync(compiled.output,[],{encoding:'utf8',timeout:10000});
    assert.equal(result.status,0,result.stderr||result.error?.message);
    assert.equal(result.stdout,cancel?'cancelled by hook\n':'5\n');
  }finally{rmSync(root,{recursive:true,force:true});}
});
