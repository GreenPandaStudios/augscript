#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync,writeFileSync,renameSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {compileLLVM} from '../src/llvm-native.ts';
import {prepareLLVMCompiler} from '../src/compiler-packs.ts';
import {qualificationIdentity} from './qualification-identity.mjs';
import {runtimeSourceIdentity} from './runtime-pack-identity.mjs';
import {reliabilityWorkloads} from './reliability-workloads.mjs';
import {configuration,buildProbe,buildWorkerWait,observe,nativeEvidence,rssSummary,completed,nativeCases,rssGrowthBudgetBytes} from './runtime-reliability.mjs';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function qualifyRuntime(args=process.argv.slice(2),root=resolve(import.meta.dirname,'..')){
  const supplied=args.indexOf('--output'),output=resolve(supplied>=0&&args[supplied+1]&&!args[supplied+1].startsWith('--')?args[supplied+1]:join(root,'.aug-build/runtime-reliability/results.json'));
  const directory=resolve(output,'..');mkdirSync(directory,{recursive:true});
  const report={format:1,generatorVersion:1,recordedAt:new Date().toISOString(),status:'running',...qualificationIdentity(root),
    native:[],llvm:[],controls:[],omissions:[
      'Finite and duration-bounded workloads do not prove arbitrary programs or native libraries safe.',
      'Allocator accounting covers explicit allocations in the instrumented core/harness and minicoro malloc hooks; it excludes libc/pthreads, mmap stacks and third-party internals.',
      'RSS includes allocator/system effects. Its fixed workload budget is not an application production SLO.',
      'LeakSanitizer is disabled in these sanitizer runs; exact allocation/resource accounting and RSS are separate evidence.',
      'Uncatchable process termination and allocation failure are not graceful cancellation and do not promise always cleanup.',
      'Sanitizer RSS is informational because diagnostic runtimes retain quarantine and history; the unsanitized circuits enforce the RSS budget.',
      'GPU devices and HTTP/crypto protocol conformance require their separate package/application qualification.'
    ]};
  const save=()=>{writeFileSync(output+'.tmp',JSON.stringify(report,null,2)+'\n');renameSync(output+'.tmp',output);};save();
  try{
    const options=configuration(args);report.options=options;report.nativeCases=nativeCases;
    const toolchain=await prepareLLVMCompiler();
    const llvmVersion=spawnSync(join(toolchain.tools,'bin/llc'),['--version'],{encoding:'utf8',timeout:10000});
    assert.equal(llvmVersion.status,0,llvmVersion.stderr||llvmVersion.error?.message);
    report.llvmVersion=llvmVersion.stdout.trim();report.llvmExecutableSha256=sha(readFileSync(join(toolchain.tools,'bin/llc')));report.compilerTransport={developmentOverride:toolchain.developmentOverride,artifactSha256:toolchain.archiveSha256,tools:toolchain.tools};report.runtimeSha256=JSON.parse(readFileSync(join(toolchain.runtime,'runtime.json'))).sourceSha256;
    const runtimeManifest=JSON.parse(readFileSync(join(toolchain.runtime,'runtime.json')));
    assert.equal(runtimeSourceIdentity(root,toolchain.runtime,Object.keys(runtimeManifest.files)),report.runtimeSha256,'Runtime pack is stale; rebuild it from the source revision being qualified');
    report.method={native:'At every quiescent cycle, zero instrumented outstanding blocks/bytes; acquired resources equal released resources on their owner thread.',
      rss:'Sample the child process every 250ms; discard the first fifth; compare first and last quarter medians.',
      rssGrowthBudgetBytes,soak:'Only O2/pool4 uses the configured minimum duration; other native variants run one-second burst circuits.',
      oracle:'Authored expected output and exact drop counts; no expectation is generated from compiler output.'};
    for(const optimization of ['-O0','-O2']){
      const home=join(directory,'worker-wait-'+optimization.slice(1)),built=buildWorkerWait(root,home,{optimization});
      const result=await observe(built.binary,[],{env:{...process.env,AUG_WORKERS:'1'},timeoutMs:15000,log:join(home,'run')});
      completed(result);assert.equal(result.stdout,'worker waits completed\n');
      report.controls.push({id:'completion-between-polls',optimization,passed:true,binarySha256:sha(readFileSync(built.binary)),command:[built.binary],elapsedSeconds:result.elapsedSeconds});save();
    }
    for(const optimization of ['-O0','-O2'])for(const pool of [1,4]){
      const seconds=optimization==='-O2'&&pool===4?options.seconds:1;
      const home=join(directory,'native-'+optimization.slice(1)+'-pool'+pool),built=buildProbe(root,home,{optimization});
      report.nativeCompiler={command:built.compiler,version:built.compilerVersion};
      report.minicoroSha256=sha(readFileSync(built.dependency));save();
      const result=await observe(built.binary,[String(options.cycles),String(seconds)],{env:{...process.env,AUG_WORKERS:String(pool)},timeoutMs:(seconds+120)*1000,log:join(home,'run')});
      completed(result);const evidence=nativeEvidence(result.stdout,{cycles:options.cycles,seconds});
      report.native.push({optimization,pool,sanitizer:null,minimumSeconds:seconds,command:[built.binary,String(options.cycles),String(seconds)],elapsedSeconds:result.elapsedSeconds,
        evidence,rss:result.rss,memory:rssSummary(result.rss,{required:true}),binarySha256:sha(readFileSync(built.binary)),flags:built.flags,passed:true});save();
      console.log('Native '+optimization+'/pool'+pool+': '+evidence.final.cycles+' balanced lifecycle cycles');
    }
    for(const sanitizer of ['address,undefined','thread'])for(const pool of [1,4]){
      const home=join(directory,'sanitized-'+sanitizer.replace(',','-')+'-pool'+pool),built=buildProbe(root,home,{optimization:'-O1',sanitizer});
      const result=await observe(built.binary,[String(options.cycles),'1'],{env:{...process.env,AUG_WORKERS:String(pool),ASAN_OPTIONS:'detect_leaks=0:halt_on_error=1:quarantine_size_mb=8:thread_local_quarantine_size_kb=256',UBSAN_OPTIONS:'halt_on_error=1',TSAN_OPTIONS:'halt_on_error=1'},log:join(home,'run')});
      completed(result);const evidence=nativeEvidence(result.stdout,{cycles:options.cycles,seconds:1});
      report.native.push({optimization:'-O1',pool,sanitizer,minimumSeconds:1,elapsedSeconds:result.elapsedSeconds,evidence,rss:result.rss,memory:rssSummary(result.rss,{required:true,budget:null}),command:[built.binary,String(options.cycles),'1'],binarySha256:sha(readFileSync(built.binary)),flags:built.flags,compiler:built.compiler,compilerVersion:built.compilerVersion,passed:true});save();
      console.log(sanitizer+'/pool'+pool+': '+evidence.final.cycles+' balanced lifecycle cycles');
    }
    const leakHome=join(directory,'allocation-retention-control'),leak=buildProbe(root,leakHome,{control:'AUG_PROBE_LEAK_CONTROL'});
    const rejected=await observe(leak.binary,['5','0'],{env:{...process.env,AUG_WORKERS:'1'},log:join(leakHome,'run')});
    assert.ok(!rejected.error&&!rejected.timedOut&&!rejected.signal);assert.equal(rejected.status,2);assert.match(rejected.stderr,/runtime probe: outstanding runtime allocation at quiescence/);
    report.controls.push({id:'real-unreleased-allocation',detected:true,exitStatus:rejected.status,diagnostic:rejected.stderr});save();
    for(const fixture of reliabilityWorkloads(options.rounds)){
      for(const mode of ['debug','release']){
        const home=join(directory,fixture.id+'-'+mode);mkdirSync(home,{recursive:true});
        for(const [name,source]of Object.entries(fixture.files))writeFileSync(join(home,name),source);
        writeFileSync(join(home,'main.yaml'),'backend: llvm\noptimization: '+mode+'\n');
        writeFileSync(join(home,'expected.txt'),fixture.expected);
        const checked=checkProject(loadProject(home));assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[],fixture.id);
        const compiled=compileLLVM(checked,{release:mode==='release',toolchain});
        assert.equal(JSON.parse(readFileSync(compiled.output+'.augmap.json')).runtime,report.runtimeSha256,'Runtime changed during qualification');
        const pools=fixture.id.startsWith('worker')?[1,4]:[1];
        for(const pool of pools){
          const result=await observe(compiled.output,[],{env:{...process.env,AUG_WORKERS:String(pool),AUG_TRACE_DROPS:'1'},timeoutMs:600000,log:join(home,'pool'+pool)});
          completed(result);assert.equal(result.stdout,fixture.expected,fixture.id+'/'+mode+'/pool'+pool);
          const drops=(result.stderr.match(/drop: (?:[^\n]+:)?Resource\n/g)??[]).length;assert.equal(drops,fixture.drops,'LLVM resource cleanup differs');
          report.llvm.push({id:fixture.id,mode,pool,rounds:fixture.rounds,expected:fixture.expected,actual:result.stdout,expectedDrops:fixture.drops,actualDrops:drops,
            sources:Object.fromEntries(Object.keys(fixture.files).map(file=>[file,sha(readFileSync(join(home,file)))])),binarySha256:sha(readFileSync(compiled.output)),command:[compiled.output],elapsedSeconds:result.elapsedSeconds,rss:result.rss,memory:rssSummary(result.rss,{required:result.elapsedSeconds>=1}),map:compiled.output+'.augmap.json',passed:true});save();
          console.log('LLVM '+fixture.id+'/'+mode+'/pool'+pool+': '+fixture.rounds+' rounds, '+drops+' drops');
        }
        if(mode==='release'&&fixture.mutant){
          const {file,before,after}=fixture.mutant;assert.ok(fixture.files[file].includes(before));
          const mutantHome=join(directory,fixture.id+'-mutant');mkdirSync(mutantHome,{recursive:true});
          for(const [name,source]of Object.entries(fixture.files))writeFileSync(join(mutantHome,name),name===file?source.replace(before,after):source);
          writeFileSync(join(mutantHome,'main.yaml'),'backend: llvm\noptimization: release\n');
          writeFileSync(join(mutantHome,'expected.txt'),fixture.expected);
          const candidate=checkProject(loadProject(mutantHome));assert.deepEqual(candidate.diagnostics.filter(d=>d.severity!=='warning'),[]);
          const mutant=compileLLVM(candidate,{release:true,toolchain});
          const result=await observe(mutant.output,[],{env:{...process.env,AUG_WORKERS:'1'},timeoutMs:600000,log:join(mutantHome,'run')});
          completed(result);assert.notEqual(result.stdout,fixture.expected,'Behavioral mutant survived independent oracle');
          report.controls.push({id:'valid-wrong-worker-result',detected:true,compiled:true,exitStatus:result.status,actual:result.stdout,expected:fixture.expected,map:mutant.output+'.augmap.json',binarySha256:sha(readFileSync(mutant.output))});save();
        }
      }
    }
    assert.equal(qualificationIdentity(root).sourceSha256,report.sourceSha256,'Sources changed during runtime qualification; replay one revision');
    assert.equal(JSON.parse(readFileSync(join(toolchain.runtime,'runtime.json'))).sourceSha256,report.runtimeSha256,'Runtime pack changed during qualification');
    report.status='passed';save();console.log('Runtime reliability report: '+output);return report;
  }catch(error){report.status='failed';report.failure=error.message;save();throw error;}
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  try{await qualifyRuntime();}catch(error){console.error(error.stack);process.exitCode=1;}
}
