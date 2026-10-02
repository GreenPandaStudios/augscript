import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {benchmarkChartData,chartValue} from '../scripts/benchmark-chart-data.mjs';

test('chart ranges retain observed extremes and convert units without inventing evidence',()=>{
  assert.deepEqual(chartValue('August',{median:2048,samples:[1024,4096,2048]},1024),
    {name:'August',value:2,minimum:1,maximum:4,samples:3});
  for(const measurement of [{median:1,samples:[]},{median:1,samples:[NaN]},{median:10,samples:[1,2]}])
    assert.throws(()=>chartValue('August',measurement));
});

test('published charts separate hosts and retain native C reference measurements',()=>{
  const charts=JSON.parse(benchmarkChartData(new URL('..',import.meta.url).pathname));
  const mac=JSON.parse(readFileSync(new URL('../docs/benchmark-results.json',import.meta.url)));
  const dgx=JSON.parse(readFileSync(new URL('../docs/dgx-performance.json',import.meta.url)));
  const cpu=chart=>chart.groups.find(group=>group.name.startsWith('Integer loop'));
  const median=report=>report.batch.find(group=>group.name==='cpu').results.find(row=>row.implementation==='August').milliseconds.median;
  assert.equal(cpu(charts.execution).values.find(row=>row.name==='August').value,median(mac));
  assert.equal(cpu(charts['dgx-execution']).values.find(row=>row.name==='August').value,median(dgx));
  assert.deepEqual(charts.kernels.groups[0].values.map(row=>row.name),['August','C']);
  assert.deepEqual(charts.greetings.groups[0].values.map(row=>row.name),['August','C']);
  assert.ok(!Object.keys(charts).some(name=>name.startsWith('improvements-')));
  assert.equal(charts.http.unit,'requests/s');assert.equal(charts.http.direction,'higher');
  assert.equal(charts.memory.unit,'MiB');assert.equal(charts.memory.direction,'lower');
});
