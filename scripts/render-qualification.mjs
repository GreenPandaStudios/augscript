#!/usr/bin/env node
// Render only complete passing reports. No partial run can replace wiki evidence.
import assert from 'node:assert/strict';
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {kernels} from '../benchmarks/kernels.mjs';
const root=resolve(import.meta.dirname,'..');
const benchmark=JSON.parse(readFileSync(join(root,'docs/kernel-results.json'),'utf8'));
const gyms=JSON.parse(readFileSync(join(root,'docs/gym-results.json'),'utf8'));
assert.equal(benchmark.status,'passed');assert.equal(gyms.status,'passed');assert.equal(gyms.profile,'full');
assert.equal(benchmark.backend,'llvm');assert.equal(gyms.backend,'llvm');
assert.equal(benchmark.sourceSha256,gyms.sourceSha256,'Reports must measure the same compiler and exercise sources');
assert.ok(benchmark.methodology.iterations>=30&&benchmark.methodology.warmup>=3);
assert.ok(gyms.vectorsPerGenerator>=256);
assert.deepEqual(benchmark.kernels.map(item=>item.name).sort(),kernels.map(item=>item.name).sort());
assert.equal(gyms.cases.length,gyms.fixtures.length*2);
assert.equal(gyms.mutations.length,gyms.cases.length);
assert.ok(gyms.cases.every(item=>item.status==='passed')&&gyms.mutations.every(item=>item.status==='detected'));
assert.equal(gyms.contracts.length,gyms.negativeContracts.length);
assert.ok(gyms.contracts.every(item=>item.status==='rejected'));
assert.equal(gyms.circuits.length,6);assert.ok(gyms.circuits.every(item=>item.status==='passed'));
const titles={'float':'Floating-point loop',calls:'Labeled function calls',list:'List traversal',strings:'String processing','map-churn':'Map deletion and refill',errors:'Checked failures',records:'Record allocation',tasks:'Task scheduling'};
const outputs=new Map();
const publish=(path,contents)=>outputs.set(join(root,path),contents);
const lines=[
  '---',
  'generatedBy: scripts/render-qualification.mjs',
  '---',
  '# Extended performance and safety results','',
  'These results cover August '+benchmark.compiler+' on **'+benchmark.cpu+'**, '+benchmark.platform+' '+benchmark.os+' '+benchmark.architecture+', recorded '+benchmark.recordedAt.slice(0,10)+'. August uses LLVM '+benchmark.llvm+'. Every measured program produced its expected result. These measurements apply to this host and workload.','',
  '## Eight more C comparisons','',
  '::: benchmark-chart kernels',':::','',
  'Each value is the median of '+benchmark.methodology.iterations+' fresh executable processes after '+benchmark.methodology.warmup+' warmups. Order rotates within a separate measurement process. Timings include startup and exclude compilation. Both implementations use O2 without LTO or fast-math. [Raw samples, build times and code sizes](kernel-results.json) also include the same August programs compiled through the C migration backend.','',
  '| Program and code/spec | Work per run | August | C | August / C |',
  '| --- | ---: | ---: | ---: | ---: |',
];
for(const item of benchmark.kernels){
  const a=item.results.find(result=>result.implementation==='August').milliseconds.median,c=item.results.find(result=>result.implementation==='C').milliseconds.median;
  lines.push('| ['+titles[item.name]+'](examples/'+item.name+'-benchmark/main.md) | '+item.count.toLocaleString('en-US')+' | '+a.toFixed(2)+' ms | '+c.toFixed(2)+' ms | '+(a/c).toFixed(2)+' |');
}
lines.push('',
  'Ratios above 1 mean August took longer. The C references use concrete values and explicit cleanup. Their ordered map uses linear searches and their task case makes sequential calls; it does not pay for a scheduler. The string reference copies each part, while August also creates managed strings and a list. Records retain individually allocated values in both programs, with different layouts and lifetime tracking. The timings include these differences in the work performed. [Read the C references](https://github.com/GreenPandaStudios/augscript/blob/main/benchmarks/kernels.c) before drawing conclusions.',
  '',
  'The float program checks its exact accumulated binary-fraction result. The call loop carries each result into the next call. Lists and records retain data and read it afterward. Map deletion checks reinsertion order as well as values. Error cases verify both the sum and number of failures; task cases verify the joined sum. Their [downloadable projects](examples/index.md#measured-programs) show code beside compiled specs in either indentation or braces style.',
  '',
  '## Safety qualification','',
  'Seed **'+gyms.seed+'**, generator version **'+gyms.generatorVersion+'**, '+gyms.vectorsPerGenerator+' generated vectors per exercise plus fixed edge cases. Both development and optimized LLVM builds ran the corpus.',
  '',
  '| Exercise | Vectors executed across both builds | Result |',
  '| --- | ---: | --- |',
);
for(const fixture of gyms.fixtures)lines.push('| '+fixture.id+' | '+gyms.cases.filter(item=>item.id===fixture.id).reduce((sum,item)=>sum+item.vectors,0)+' | Passed; both behavioral mutations detected |');
lines.push('',
  'The suite executed **'+gyms.cases.reduce((sum,item)=>sum+item.vectors,0)+' generated/edge-case checks**, rejected **'+gyms.contracts.length+' forbidden contracts**, and detected **'+gyms.mutations.length+' valid behavioral mutants**. Each deliberately faulty program compiled and finished, but produced a wrong result or cleanup count compared with the independent oracle.',
  '',
  '| Additional circuit | Executed tests | Skipped tests | Result |',
  '| --- | ---: | ---: | --- |',
);
for(const circuit of gyms.circuits)lines.push('| '+circuit.id+' | '+(circuit.totals.tests===undefined?'LLVM instrumentation + overflow negative control':circuit.totals.pass)+' | '+(circuit.totals.skipped??0)+' | '+circuit.status+' |');
lines.push('',
  '[The full report](gym-results.json) includes original and faulty source units, inputs, expected and actual results, cleanup counts, compiler source identity and commands. Source mutation includes 5,000 parser cases and 1,000 checker cases. Core sanitizers instrument August LLVM accesses and the C runtime; they do not instrument the interiors of prebuilt foreign libraries or establish a whole-process leak proof.',
  '',
  'The [safety gym guide](safety-gyms.md) explains each gate and its limits. [Contributor commands](contributing-benchmarks.md) reproduce these reports or explore another seed. New-platform CI reports remain separate until that target completes qualification.',
  '',
  '## Source identity','',
  'Both reports use source SHA-256 `'+benchmark.sourceSha256+'`. This fingerprints compiler, runtime, native platform inputs, package contracts, configuration, dependencies, test fixtures, generators and measured programs. These results describe that snapshot. Rerun the suite to measure changed code.',
  '',
);
publish('docs/qualification-results.md',lines.join('\n'));
for(const[path,contents]of outputs){
  if(process.argv.includes('--check'))assert.ok(existsSync(path)&&readFileSync(path,'utf8')===contents,'Qualification documentation drift: '+path);
  else{mkdirSync(dirname(path),{recursive:true});writeFileSync(path,contents);}
}
console.log(process.argv.includes('--check')?'Qualification documentation matches its evidence.':'Qualification tables rendered.');
