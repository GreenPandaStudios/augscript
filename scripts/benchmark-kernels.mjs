#!/usr/bin/env node
import assert from 'node:assert/strict';
import {cpSync,existsSync,mkdirSync,readFileSync,rmSync,statSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {kernels} from '../benchmarks/kernels.mjs';
import {qualificationIdentity} from './qualification-identity.mjs';
import {checkProject} from '../src/checker.ts';
import {loadProject} from '../src/project.ts';
import {compileLLVM} from '../src/llvm-native.ts';
import {generateC} from '../src/codegen.ts';
import {compileNative} from '../src/native.ts';
import {prepareLLVMCompiler} from '../src/compiler-packs.ts';
import {cCompiler} from './native-toolchain.mjs';
const root=resolve(import.meta.dirname,'..'),home=join(root,'.aug-build/kernels');
const identity=qualificationIdentity(root);
mkdirSync(home,{recursive:true});
const option=(name,fallback)=>{const at=process.argv.indexOf(name);return at<0?fallback:process.argv[at+1];};
const iterations=Number(option('--iterations','30')),warmup=Number(option('--warmup','3'));
assert.ok(Number.isInteger(iterations)&&iterations>=1&&Number.isInteger(warmup)&&warmup>=1);
const selected=option('--only','').split(',').filter(Boolean);
for(const name of selected)assert.ok(kernels.some(item=>item.name===name),'Unknown kernel: '+name);
const output=resolve(option('--output',join(root,'.aug-build/kernels/results.json')));
const toolchain=await prepareLLVMCompiler(),cc=process.env.CC??cCompiler(),reference=join(home,'reference');
const run=(command,args,options={})=>{const result=spawnSync(command,args,{encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024,...options});
  assert.equal(result.status,0,command+': '+(result.stderr||result.error?.message));return result;};
const sdk='/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk';
run(cc,[...(process.platform==='darwin'&&existsSync(sdk)?['-isysroot',sdk]:[]),'-std=c11','-O2','-ffp-contract=off',join(root,'benchmarks/kernels.c'),'-o',reference]);
const report={format:1,recordedAt:new Date().toISOString(),...identity,backend:'llvm',llvm:'23.1.2',
  cCompiler:run(cc,['--version']).stdout.split('\n')[0],
  runtime:JSON.parse(readFileSync(join(toolchain.runtime,'runtime.json'))).sourceSha256,
  methodology:{iterations,warmup,optimization:'O2; no LTO or fast-math',includesProcessStartup:true,
    ordering:'Rotate implementations each round in a fresh measurement process; check every output',
    references:'Concrete C types and explicit cleanup; C task reference uses sequential calls, not a scheduler; ordered map reference uses linear search'},
  kernels:[],status:'running'};
mkdirSync(resolve(output,'..'),{recursive:true});
const save=()=>writeFileSync(output,JSON.stringify(report,null,2)+'\n');save();
try{
  for(const item of kernels.filter(item=>!selected.length||selected.includes(item.name))){
    const variants=[{name:'C',command:reference,args:[item.name,String(item.count)]}],builds=[];
    for(const backend of ['llvm','c']){
      const directory=join(home,item.name+'-'+backend);rmSync(directory,{recursive:true,force:true});
      cpSync(join(root,'benchmarks',item.name),directory,{recursive:true,filter:file=>!file.includes('.aug-build')});
      writeFileSync(join(directory,'main.yaml'),'optimization: release\n');
      const start=performance.now(),checked=checkProject(loadProject(directory));
      assert.deepEqual(checked.diagnostics.filter(issue=>issue.severity!=='warning'),[],item.name);
      const frontendMs=performance.now()-start;
      const compiled=backend==='llvm'?compileLLVM(checked,{release:true,toolchain}):compileNative(directory,generateC(checked),{release:true,checked});
      if(backend==='c')assert.equal(compiled.status,0,compiled.error);
      builds.push({backend,frontendMs,buildMs:performance.now()-start,executableBytes:statSync(compiled.output).size});
      variants.push({name:backend==='llvm'?'August':'August (C backend)',command:compiled.output,args:[]});
    }
    const measured=run(process.execPath,[join(root,'scripts/batch-load.mjs')],{input:JSON.stringify({variants,iterations,warmup,expected:item.expected(item.count)})});
    const results=JSON.parse(measured.stdout);
    report.kernels.push({name:item.name,count:item.count,description:item.description,source:'benchmarks/'+item.name,
      expected:item.expected(item.count),builds,results});
    save();console.log(item.name+': '+results.map(result=>result.implementation+' '+result.milliseconds.median.toFixed(2)+'ms').join(', '));
  }
  assert.equal(qualificationIdentity(root).sourceSha256,report.sourceSha256,'Compiler or benchmark sources changed during measurement; rerun against one revision');
  report.status='passed';
}catch(error){report.status='failed';report.failure=error.message;process.exitCode=1;console.error(error.message);}
save();console.log('Kernel report: '+output);
