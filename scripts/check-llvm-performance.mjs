#!/usr/bin/env node
// Migration acceptance uses the same August sources, not the specialized C oracle.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
assert.ok(process.argv[2],'Pass a complete --backend llvm --compare-c-backend benchmark report');
const report=JSON.parse(readFileSync(resolve(process.argv[2]))),gate=JSON.parse(readFileSync(resolve(root,'native/llvm-performance-gates.json')));
assert.equal(gate.format,1);assert.equal(report.backend,'llvm');assert.equal(report.referenceBackend,'c');
assert.match(report.sourceSha256,/^[0-9a-f]{64}$/);assert.equal(report.llvm.version,'23.1.2');
assert.ok(report.methodology.iterations>=gate.minimumSamples);assert.ok(report.methodology.warmup>=gate.minimumWarmup);
assert.ok(report.methodology.httpRounds>=gate.minimumHttpRounds);
assert.deepEqual(report.batch.map(item=>item.name).sort(),Object.keys(gate.maximumBatchMedianRatio).sort());
assert.deepEqual(report.http.map(item=>item.concurrency).sort((a,b)=>a-b),gate.httpConcurrency);
const failures=[];
for(const item of report.batch){
  const current=item.results.find(result=>result.implementation==='August'),baseline=item.results.find(result=>result.implementation===gate.baselineImplementation);
  assert.ok(current&&baseline,'Missing independently compiled backend comparison');
  const a=current.milliseconds.median,b=baseline.milliseconds.median;assert.ok(a>0&&b>0);
  const limit=Math.max(b*gate.maximumBatchMedianRatio[item.name],b+gate.batchAbsoluteAllowanceMs);
  console.log(`${item.name}: LLVM/C backend ${(a/b).toFixed(3)}, ${a.toFixed(2)}ms / ${b.toFixed(2)}ms`);
  if(a>limit)failures.push(item.name+' median exceeded its frozen migration limit');
}
for(const item of report.http){
  const current=item.results.find(result=>result.implementation==='August'),baseline=item.results.find(result=>result.implementation===gate.baselineImplementation);
  assert.ok(current&&baseline);assert.ok(current.rounds.length>=gate.minimumHttpRounds&&baseline.rounds.length>=gate.minimumHttpRounds);
  const ratio=current.requestsPerSecond.median/baseline.requestsPerSecond.median;assert.ok(Number.isFinite(ratio)&&ratio>0);
  console.log(`HTTP concurrency ${item.concurrency}: LLVM/C backend ${ratio.toFixed(3)}`);
  if(ratio<gate.minimumHttpThroughputRatio)failures.push('HTTP '+item.concurrency+' throughput fell below its frozen migration limit');
}
assert.deepEqual(failures,[],'LLVM performance qualification failed');
console.log('LLVM migration performance gates passed; finite workload evidence only.');
