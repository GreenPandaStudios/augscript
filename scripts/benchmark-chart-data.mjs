import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const batchTitles={startup:'Startup',cpu:'Integer loop · 2 million steps','collections-20k':'Map + Set · 20,000 entries','collections-200k':'Map + Set · 200,000 entries',json:'JSON · 5,000 records'};
const kernelTitles={float:'Floating-point loop',calls:'Labeled calls',list:'List traversal',strings:'String processing','map-churn':'Map deletion and refill',errors:'Checked failures',records:'Record allocation',tasks:'Task scheduling'};
const sourceFor=name=>'/examples/'+({startup:'startup',cpu:'cpu','collections-20k':'collections','collections-200k':'collections',json:'json'}[name])+'-benchmark/main';

export function chartValue(name,measurement,divisor=1){
  assert.ok(measurement&&Number.isFinite(measurement.median)&&measurement.median>=0,'Missing or invalid chart median');
  assert.ok(Array.isArray(measurement.samples)&&measurement.samples.length>0,'Charts require recorded samples');
  assert.ok(measurement.samples.every(value=>Number.isFinite(value)&&value>=0),'Invalid chart sample');
  assert.ok(Number.isFinite(divisor)&&divisor>0,'Invalid chart unit conversion');
  const minimum=Math.min(...measurement.samples),maximum=Math.max(...measurement.samples);
  assert.ok(measurement.median>=minimum&&measurement.median<=maximum,'Median lies outside recorded samples');
  return {name,value:measurement.median/divisor,minimum:minimum/divisor,maximum:maximum/divisor,samples:measurement.samples.length};
}

export function buildBenchmarkCharts({current,baseline,kernels,dgx,dgxKernels}){
  assert.equal(kernels.status,'passed');assert.equal(dgxKernels.status,'passed');
  const batch=(report,names)=>report.batch.filter(item=>!names||names.includes(item.name)).map(item=>({
    name:batchTitles[item.name],source:sourceFor(item.name),values:item.results.filter(row=>['August','C','Node','Python'].includes(row.implementation)).map(row=>chartValue(row.implementation,row.milliseconds))
  }));
  const http=report=>report.http.map(item=>({name:item.concurrency+' concurrent clients',source:'/examples/http-benchmark/routes',values:item.results.filter(row=>['August','Node'].includes(row.implementation)).map(row=>chartValue(row.implementation,row.requestsPerSecond))}));
  const kernelGroups=report=>report.kernels.map(item=>({name:kernelTitles[item.name],source:'/examples/'+item.name+'-benchmark/main',values:['August','C'].map(name=>chartValue(name,item.results.find(row=>row.implementation===name)?.milliseconds))}));
  const chart=(title,unit,direction,groups)=>{
    assert.ok(groups.length>0&&groups.every(group=>group.name&&group.values.length>0),'Empty or unknown chart workload');
    for(const group of groups)assert.equal(new Set(group.values.map(row=>row.name)).size,group.values.length,'Duplicate implementation');
    return {title,unit,direction,groups};
  };
  const historical=(section,names,field)=>names.map(name=>({
    name:section==='batch'?batchTitles[name]:name+' concurrent clients',
    values:[['Before',baseline],['Current',current]].map(([label,report])=>{
      const workload=report[section].find(item=>section==='batch'?item.name===name:item.concurrency===name);
      assert.ok(workload,'Missing historical workload');
      return chartValue(label,workload.results.find(row=>row.implementation==='August')[field]);
    })
  }));
  return {
    execution:chart('Execution time','ms','lower',batch(current)),
    http:chart('HTTP throughput','requests/s','higher',http(current)),
    memory:chart('Peak process memory','MiB','lower',current.batch.filter(item=>['collections-20k','collections-200k'].includes(item.name)).map(item=>({name:batchTitles[item.name],values:item.results.filter(row=>['August','C','Node','Python'].includes(row.implementation)).map(row=>chartValue(row.implementation,row.peakRssBytes,1048576))}))),
    'improvements-execution':chart('Earlier and current execution time','ms','lower',historical('batch',['cpu','collections-20k','collections-200k'],'milliseconds')),
    'improvements-http':chart('Earlier and current HTTP throughput','requests/s','higher',historical('http',current.http.map(item=>item.concurrency),'requestsPerSecond')),
    kernels:chart('Eight August and C programs','ms','lower',kernelGroups(kernels)),
    'dgx-execution':chart('DGX Spark execution time','ms','lower',batch(dgx)),
    'dgx-kernels':chart('DGX Spark application kernels','ms','lower',kernelGroups(dgxKernels)),
    'dgx-http':chart('DGX Spark HTTP throughput','requests/s','higher',http(dgx))
  };
}

export function benchmarkChartData(root){
  const read=name=>JSON.parse(readFileSync(join(root,'docs',name+'.json'),'utf8'));
  return JSON.stringify(buildBenchmarkCharts({current:read('benchmark-results'),baseline:read('benchmark-baseline'),kernels:read('kernel-results'),dgx:read('dgx-performance'),dgxKernels:read('dgx-kernels')}),null,2)+'\n';
}
