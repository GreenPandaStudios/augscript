#!/usr/bin/env node
// Measure in a fresh process whose heap does not contain compiler work.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {statistics} from './http-load.mjs';

export function measureBatch({variants,iterations,warmup,expected}) {
  assert.ok(Array.isArray(variants)&&variants.length>0,'No benchmark implementations selected');
  assert.ok(Number.isInteger(iterations)&&iterations>0&&Number.isInteger(warmup)&&warmup>0);
  assert.equal(typeof expected,'string');assert.ok(expected.length>0);
  const samples=variants.map(()=>[]);
  for(let round=-warmup;round<iterations;round++)for(let position=0;position<variants.length;position++){
    const index=(round+warmup+position)%variants.length,variant=variants[index],start=performance.now();
    const result=spawnSync(variant.command,variant.args,{encoding:'utf8',timeout:120000,maxBuffer:1024*1024});
    const elapsed=performance.now()-start;
    assert.equal(result.status,0,variant.name+': '+(result.stderr||result.error?.message));
    assert.equal(result.stdout,expected,variant.name+': incorrect benchmark output');
    if(round>=0)samples[index].push(elapsed);
  }
  return variants.map((variant,index)=>({implementation:variant.name,milliseconds:statistics(samples[index])}));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
  process.stdout.write(JSON.stringify(measureBatch(JSON.parse(readFileSync(0,'utf8'))))+'\n');
}
