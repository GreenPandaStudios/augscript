import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {nativeHome} from '../scripts/native-home.mjs';
const runtime=resolve('runtime'),native=nativeHome(resolve('.'));
const sanitizer=process.env.AUG_WORKER_SANITIZER;
for(const optimization of ['-O0','-O2'])test(`worker runtime overlaps OS threads, isolates heaps, and releases on the owner thread (${optimization}${sanitizer?', '+sanitizer:''})`,()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-worker-runtime-'));
 try{
  const cc=process.env.AUG_SANITIZER_CC??(process.platform==='darwin'?'/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang':'clang');
  assert.ok(existsSync(join(native,'sources/minicoro/minicoro.h')),'Prepare the pinned task dependency before runtime qualification');
  const binary=join(root,'test'),flags=[...(process.platform==='darwin'?['-isysroot',process.env.AUG_TEST_MACOS_SDK??'/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk']:[]),optimization,'-g','-std=c11','-D_POSIX_C_SOURCE=200809L','-D_DARWIN_C_SOURCE','-D_DEFAULT_SOURCE','-pthread','-I'+runtime,'-I'+join(native,'sources/minicoro'),...(sanitizer?['-fsanitize='+sanitizer,'-fno-omit-frame-pointer']:[])];
  const build=spawnSync(cc,[...flags,resolve('tests/native/workers.c'),...['aug_runtime.c','aug_values.c','aug_tasks.c'].map(file=>join(runtime,file)),'-o',binary],{encoding:'utf8'});
  assert.equal(build.status,0,build.stderr);
  const run=spawnSync(binary,[],{encoding:'utf8',timeout:15000,env:{...process.env,AUG_WORKERS:'2',TSAN_OPTIONS:'halt_on_error=1',ASAN_OPTIONS:'detect_leaks=0:halt_on_error=1'}});
  assert.equal(run.status,0,run.stderr||run.error?.message);assert.equal(run.stdout,'parallel copies cleanup ok\n');
 }finally{rmSync(root,{recursive:true,force:true});}
});
