// Maintainer qualification helpers. Instrumentation is confined to test builds.
import assert from 'node:assert/strict';
import {existsSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {cCompiler} from './native-toolchain.mjs';
import {nativeHome} from './native-home.mjs';

export const nativeCases=['copied cyclic graphs and allocation pressure','cancelled owned child before entry',
  'entered worker cancellation with a primary error','nested worker/cooperative progress','failing drop preserves primary error'];
export const rssGrowthBudgetBytes=64*1024*1024;

export function configuration(args){
  const defaults={smoke:{seconds:5,cycles:50,rounds:30},ci:{seconds:30,cycles:200,rounds:200},soak:{seconds:1800,cycles:1000,rounds:1000}};
  const supplied={};for(let i=0;i<args.length;i++){
    const name=args[i];assert.ok(['--profile','--seconds','--cycles','--rounds','--output'].includes(name),'Unknown option '+name);
    assert.ok(!Object.hasOwn(supplied,name),'Duplicate option '+name);
    assert.ok(args[i+1]&&!args[i+1].startsWith('--'),'Missing value for '+name);supplied[name]=args[++i];
  }
  const profile=supplied['--profile']??'ci';assert.ok(Object.hasOwn(defaults,profile),'Unknown reliability profile');
  const result={profile,...defaults[profile],output:supplied['--output']};
  for(const [name,min,max] of [['seconds',1,86400],['cycles',5,10000000],['rounds',5,100000]]){
    if(supplied['--'+name]!==undefined)result[name]=Number(supplied['--'+name]);
    assert.ok(Number.isSafeInteger(result[name])&&result[name]>=min&&result[name]<=max,'Invalid '+name);
  }
  return result;
}
function probeToolchain(root,directory,{optimization='-O2',sanitizer=''}={}){
  mkdirSync(directory,{recursive:true});
  const cc=process.env.AUG_SANITIZER_CC??cCompiler(),native=nativeHome(root);
  // Dependency extraction already verifies its pin; include its bytes in the report.
  assert.ok(existsSync(join(native,'sources/minicoro/minicoro.h')),'Prepare the pinned minicoro dependency');
  const sdk=process.env.AUG_TEST_MACOS_SDK??'/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk';
  const flags=[...(process.platform==='darwin'?['-isysroot',sdk]:[]),optimization,'-g','-std=c11','-D_POSIX_C_SOURCE=200809L',
    '-D_DARWIN_C_SOURCE','-D_DEFAULT_SOURCE','-pthread',...(sanitizer?['-fsanitize='+sanitizer,'-fno-omit-frame-pointer']:[])];
  const run=args=>{const r=spawnSync(cc,args,{encoding:'utf8',timeout:120000});assert.equal(r.status,0,r.stderr||r.error?.message);};
  return {cc,native,flags,run};
}
export function buildWorkerWait(root,directory,{optimization='-O2'}={}){
  const {cc,native,flags,run}=probeToolchain(root,directory,{optimization});
  const binary=join(directory,'wait');
  run([...flags,'-DAUG_TEST_SCHEDULER_STEP','-I'+join(root,'runtime'),'-I'+join(native,'sources/minicoro'),
    join(root,'tests/native/worker-wait.c'),...['aug_runtime.c','aug_values.c','aug_tasks.c'].map(f=>join(root,'runtime',f)),'-o',binary]);
  return {binary,compiler:cc,flags};
}
export function buildProbe(root,directory,{optimization='-O2',sanitizer='',control=''}={}){
  const {cc,native,flags,run}=probeToolchain(root,directory,{optimization,sanitizer});
  const allocator=join(directory,'allocator.o'),binary=join(directory,'probe');
  run([...flags,'-c',join(root,'tests/native/reliability_alloc.c'),'-o',allocator]);
  run([...flags,'-I'+join(root,'runtime'),'-I'+join(native,'sources/minicoro'),
    '-include',join(root,'tests/native/reliability_alloc.h'),...(control?['-D'+control]:[]),
    join(root,'tests/native/reliability.c'),...['aug_runtime.c','aug_values.c','aug_tasks.c'].map(f=>join(root,'runtime',f)),allocator,'-o',binary]);
  return {binary,compiler:cc,compilerVersion:spawnSync(cc,['--version'],{encoding:'utf8'}).stdout.split('\n')[0],
    flags,dependency:join(native,'sources/minicoro/minicoro.h')};
}
function currentRss(pid){
  if(process.platform==='linux'){
    const status=readFileSync('/proc/'+pid+'/status','utf8'),match=status.match(/^VmRSS:\s+(\d+)\s+kB$/m);
    if(!match)return null;return Number(match[1])*1024;
  }
  if(process.platform==='darwin'){
    const r=spawnSync('/bin/ps',['-o','rss=','-p',String(pid)],{encoding:'utf8',timeout:2000});
    if(r.status!==0)return null;
    const value=r.stdout.trim();assert.match(value,/^\d+$/,'Invalid RSS sample');return Number(value)*1024;
  }
  throw new Error('Runtime reliability has no RSS collector for '+process.platform);
}
export async function observe(command,args,{env=process.env,timeoutMs=120000,log}={}){
  const start=performance.now(),rss=[];let stdout='',stderr='',samplingError=null,timedOut=false,overflow=false;
  const child=spawn(command,args,{env,stdio:['ignore','pipe','pipe']});
  const append=(name,chunk)=>{if(name==='stdout')stdout+=chunk;else stderr+=chunk;if(Buffer.byteLength(stdout)+Buffer.byteLength(stderr)>8*1024*1024){overflow=true;child.kill('SIGKILL');}};
  child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
  child.stdout.on('data',value=>append('stdout',value));child.stderr.on('data',value=>append('stderr',value));
  const sample=()=>{if(!child.pid)return;try{const bytes=currentRss(child.pid);if(bytes!==null&&bytes>0)rss.push({elapsedSeconds:(performance.now()-start)/1000,bytes});}
    catch(error){if(error.code!=='ENOENT'&&error.code!=='ESRCH')samplingError=error.message;}};
  sample();const timer=setInterval(sample,250);
  const timeout=setTimeout(()=>{timedOut=true;child.kill('SIGKILL');},timeoutMs);
  let status,signal,error;
  try{
    ({status,signal,error}=await new Promise(resolve=>{child.on('error',error=>resolve({status:null,signal:null,error:error.message}));child.on('close',(status,signal)=>resolve({status,signal}));}));
  }finally{clearInterval(timer);clearTimeout(timeout);}
  const result={status,signal,error,timedOut,overflow,samplingError,elapsedSeconds:(performance.now()-start)/1000,stdout,stderr,rss};
  if(log){writeFileSync(log+'.stdout',stdout);writeFileSync(log+'.stderr',stderr);}
  return result;
}
export function rssSummary(samples,{required=false,budget=rssGrowthBudgetBytes}={}){
  assert.ok(Array.isArray(samples));
  for(const s of samples)assert.ok(Number.isFinite(s.elapsedSeconds)&&s.elapsedSeconds>=0&&Number.isSafeInteger(s.bytes)&&s.bytes>0,'Invalid RSS sample');
  if(required)assert.ok(samples.length>=3,'RSS observation is incomplete');
  if(!samples.length)return {samples:0,omission:'Process ended before an RSS sample was available'};
  const warmup=Math.floor(samples.length/5),rest=samples.slice(warmup),window=Math.max(1,Math.floor(rest.length/4));
  const median=values=>{const sorted=values.slice().sort((a,b)=>a-b);return sorted[Math.floor(sorted.length/2)];};
  const baseline=median(rest.slice(0,window).map(s=>s.bytes)),tail=median(rest.slice(-window).map(s=>s.bytes));
  const growth=tail-baseline;assert.ok(budget===null||growth<=budget,'RSS continued growth exceeded the fixed workload budget: '+growth);
  return {samples:samples.length,warmupSamples:warmup,baselineBytes:baseline,tailBytes:tail,growthBytes:growth,
    maximumBytes:Math.max(...samples.map(s=>s.bytes)),growthBudgetBytes:budget,budgetEnforced:budget!==null};
}
export function nativeEvidence(stdout,{cycles=5,seconds=0}={}){
  const lines=stdout.trim().split('\n');assert.ok(stdout.trim(),'No native allocation evidence');
  const samples=lines.map(line=>JSON.parse(line));let previous=0;
  for(const sample of samples){
    for(const name of ['cycles','allocations','releases','liveBlocks','liveBytes','peakBytes','acquired','released'])
      assert.ok(Number.isSafeInteger(sample[name])&&sample[name]>=0,'Invalid native metric '+name);
    assert.ok(sample.cycles>=previous,'Native cycles moved backwards');previous=sample.cycles;
    assert.equal(sample.liveBlocks,0,'Outstanding runtime allocations');assert.equal(sample.liveBytes,0,'Outstanding runtime bytes');
    assert.equal(sample.allocations,sample.releases,'Runtime allocation balance differs');
    assert.equal(sample.acquired,sample.released,'Native resource cleanup differs');
    assert.ok(Array.isArray(sample.cases)&&sample.cases.length===nativeCases.length);
    assert.ok(sample.cases.every(count=>Number.isSafeInteger(count)&&count>=0));
    assert.equal(sample.cases.reduce((sum,n)=>sum+n,0),sample.cycles,'Native case coverage differs');
    assert.ok(Number.isFinite(sample.elapsedSeconds)&&sample.elapsedSeconds>=0);
  }
  const final=samples.at(-1);assert.equal(final.final,true,'Native run did not complete');
  assert.ok(final.cycles>=cycles&&final.cycles%nativeCases.length===0,'Native run did not cover complete cycles');
  assert.ok(final.cases.every(n=>n>0)&&new Set(final.cases).size===1,'A native lifecycle case was omitted');
  assert.ok(final.elapsedSeconds>=seconds,'Native soak ended too early');
  assert.ok(final.allocations>0&&final.peakBytes>0&&final.acquired>0,'Native probe performed no work');
  return {samples,final};
}
export function completed(result){
  assert.ok(!result.error&&!result.timedOut&&!result.overflow&&!result.samplingError,'Observation failed: '+JSON.stringify({error:result.error,timeout:result.timedOut,overflow:result.overflow,sampling:result.samplingError}));
  assert.equal(result.status,0,result.stderr||'Child exited '+result.status+' ('+result.signal+')');
}
