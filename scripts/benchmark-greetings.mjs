#!/usr/bin/env node
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {closeSync,existsSync,mkdirSync,openSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {readRuntimePack,compileLLVM} from '../src/llvm-native.ts';
import {prepareLLVMCompiler} from '../src/compiler-packs.ts';
import {cCompiler} from './native-toolchain.mjs';
import {captureQualificationInputs} from './qualification-identity.mjs';
import {statistics} from './http-load.mjs';

const root=resolve(import.meta.dirname,'..');
const option=(name,fallback)=>{const index=process.argv.indexOf(name);return index<0?fallback:process.argv[index+1];};
const iterations=Number(option('--iterations','30')),warmup=Number(option('--warmup','3'));
assert.ok(Number.isInteger(iterations)&&iterations>0&&Number.isInteger(warmup)&&warmup>0);
const output=resolve(option('--output','docs/greeting-results.json'));
const home=join(root,'.aug-build/greetings');mkdirSync(home,{recursive:true});
const snapshot=captureQualificationInputs(root,{august:'benchmarks/greetings/main.aug',c:'benchmarks/greetings.c'});
const toolchain=await prepareLLVMCompiler(),checked=checkProject(loadProject(join(root,'benchmarks/greetings'),new Map([[join(root,'benchmarks/greetings/main.aug'),snapshot.sources.august]])));
assert.deepEqual(checked.diagnostics.filter(issue=>issue.severity!=='warning'),[]);
const compiled=compileLLVM(checked,{release:true,toolchain});
const cc=cCompiler(),reference=join(home,'c-greetings');
const sdk='/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk';
const run=(command,args,options={})=>{const result=spawnSync(command,args,{encoding:'utf8',timeout:120000,...options});assert.equal(result.status,0,result.stderr||result.error?.message);return result;};
const referenceSource=join(home,'reference.c');writeFileSync(referenceSource,snapshot.sources.c);
run(cc,[...(process.platform==='darwin'&&existsSync(sdk)?['-isysroot',sdk]:[]),'-std=c11','-O2',referenceSource,'-o',reference]);
snapshot.verify();
const message='Hello, August! 👋\n',count=1000000;
const hash=createHash('sha256');for(let i=0;i<count;i++)hash.update(message);
const expected={lines:count,bytes:Buffer.byteLength(message)*count,sha256:hash.digest('hex')};
const variants=[{name:'August',command:compiled.output},{name:'C',command:reference}],samples=variants.map(()=>[]);
for(let round=-warmup;round<iterations;round++)for(let position=0;position<variants.length;position++){
  const index=(round+warmup+position)%variants.length,variant=variants[index],file=join(home,'stdout.txt');
  const fd=openSync(file,'w');let elapsed;
  try{const start=performance.now();run(variant.command,[],{stdio:['ignore',fd,'pipe']});elapsed=performance.now()-start;}finally{closeSync(fd);}
  assert.equal(statSync(file).size,expected.bytes,variant.name+': wrong output length');
  const bytes=readFileSync(file);assert.equal(createHash('sha256').update(bytes).digest('hex'),expected.sha256,variant.name+': wrong output');
  if(round>=0)samples[index].push(elapsed);
}
snapshot.verify();
const report={format:1,status:'passed',recordedAt:new Date().toISOString(),...snapshot.identity,llvm:'23.1.2',
  compilerPack:{archiveSha256:toolchain.archiveSha256,runtimeSha256:readRuntimePack(toolchain.runtime).sourceSha256},cCompiler:run(cc,['--version']).stdout.split('\n')[0],
  methodology:{iterations,warmup,optimization:'O2 without LTO',includesProcessStartup:true,
    output:'Regular temporary file; each print flushes stdout in both programs; complete output verified outside timing',
    ordering:'Alternate implementation order each round',scope:'Printing throughput including file I/O, not string concatenation or general CPU performance'},
  expected,sources:snapshot.sources,
  results:variants.map((variant,index)=>({implementation:variant.name,milliseconds:statistics(samples[index])}))};
mkdirSync(resolve(output,'..'),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(report.results.map(row=>row.implementation+' '+row.milliseconds.median.toFixed(2)+' ms').join(', '));
console.log('Complete output: '+expected.bytes+' bytes, '+expected.sha256);
