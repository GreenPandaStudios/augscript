<script setup lang="ts">
import {computed, ref, useId, watch} from 'vue';
import {withBase} from 'vitepress';
import charts from './benchmark-data.json';

type Value = {name: string; value: number; minimum: number; maximum: number; samples: number};
type Group = {name: string; source?: string; values: Value[]};
type Chart = {title: string; unit: string; direction: string; groups: Group[]};
const props=defineProps<{chart: string}>();
const data=computed(()=>(charts as Record<string, Chart>)[props.chart]);
const id=useId();
const names=computed(()=>Array.from(new Set(data.value.groups.flatMap(group=>group.values.map(row=>row.name)))));
const selected=ref(names.value.slice());
const ranges=ref(false);
watch(()=>props.chart,()=>{selected.value=names.value.slice();ranges.value=false;});
const colors: Record<string,string>={August:'var(--vp-c-brand-1)',C:'var(--aug-series-c)',Node:'var(--aug-series-node)',Python:'var(--aug-series-python)',Before:'var(--aug-series-c)',Current:'var(--vp-c-brand-1)'};
const visible=(group: Group)=>group.values.filter(row=>selected.value.includes(row.name));
const maximum=(group: Group)=>Math.max(1e-12,...visible(group).map(row=>ranges.value?row.maximum:row.value));
const percent=(value: number,group: Group)=>value/maximum(group)*100;
const format=(value: number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:data.value.unit==='requests/s'?0:2}).format(value);
</script>

<template>
  <figure class="aug-chart" :aria-labelledby="id+'-title'">
    <figcaption>
      <h3 :id="id+'-title'">{{data.title}}</h3>
      <p>Median {{data.unit}} · {{data.direction==='lower'?'shorter is better':'longer is better'}}. Each panel starts at zero and scales to the implementations shown.</p>
    </figcaption>
    <div class="aug-chart-controls">
      <fieldset>
        <legend>Compare</legend>
        <label v-for="name in names" :key="name">
          <input v-model="selected" type="checkbox" :value="name" :disabled="selected.length===1 && selected.includes(name)">
          <span class="aug-chart-dot" :style="{background:colors[name]}" aria-hidden="true"></span>{{name}}
        </label>
      </fieldset>
      <label class="aug-chart-range-toggle"><input v-model="ranges" type="checkbox"> Show observed ranges</label>
    </div>
    <p v-if="ranges" class="aug-chart-note">Range markers show the smallest and largest recorded samples, not confidence intervals.</p>
    <div class="aug-chart-panels">
      <section v-for="(group,index) in data.groups" :key="group.name" :aria-labelledby="id+'-'+index">
        <h4 :id="id+'-'+index"><a v-if="group.source" :href="withBase(group.source)">{{group.name}}<span class="aug-chart-source">Code and spec ↗</span></a><span v-else>{{group.name}}</span></h4>
        <ul>
          <li v-for="row in visible(group)" :key="row.name" :style="{'--series-color':colors[row.name]}">
            <span class="aug-chart-label">{{row.name}}</span>
            <span class="aug-chart-track" aria-hidden="true">
              <span class="aug-chart-bar" :style="{width:percent(row.value,group)+'%'}"></span>
              <span v-if="ranges" class="aug-chart-range" :style="{left:percent(row.minimum,group)+'%',width:percent(row.maximum-row.minimum,group)+'%'}"></span>
            </span>
            <span class="aug-chart-value">{{format(row.value)}}<span class="aug-chart-unit">{{' '+data.unit}}</span></span>
          </li>
        </ul>
        <div class="aug-chart-axis" aria-hidden="true"><span>0</span><span>{{format(maximum(group))}} {{data.unit}}</span></div>
      </section>
    </div>
    <details class="aug-chart-details">
      <summary>Exact values and sample ranges</summary>
      <div class="aug-chart-table"><table>
        <caption>{{data.title}} · {{data.unit}}</caption>
        <thead><tr><th scope="col">Program</th><th scope="col">Implementation</th><th scope="col">Median</th><th scope="col">Minimum</th><th scope="col">Maximum</th><th scope="col">Samples</th></tr></thead>
        <tbody><template v-for="group in data.groups" :key="group.name"><tr v-for="row in group.values" :key="row.name"><th scope="row">{{group.name}}</th><td>{{row.name}}</td><td>{{format(row.value)}}</td><td>{{format(row.minimum)}}</td><td>{{format(row.maximum)}}</td><td>{{row.samples}}</td></tr></template></tbody>
      </table></div>
    </details>
  </figure>
</template>

<style scoped>
.aug-chart { margin: 28px 0; padding: 22px; border: 1px solid var(--vp-c-divider); border-radius: 5px; background: var(--vp-c-bg-soft); }
.aug-chart figcaption h3 { margin: 0; font-size: 18px; }
.aug-chart figcaption p,.aug-chart-note { margin: 8px 0 18px; color: var(--vp-c-text-2); font-size: 13px; line-height: 1.6; }
.aug-chart-controls { display: flex; gap: 12px 20px; flex-wrap: wrap; align-items: center; margin-bottom: 20px; font-size: 13px; }
.aug-chart fieldset { display: flex; gap: 8px 14px; flex-wrap: wrap; margin: 0; padding: 0; border: 0; }
.aug-chart legend { float: left; margin-right: 14px; font-weight: 600; }
.aug-chart label { display: inline-flex; align-items: center; gap: 5px; cursor: pointer; }
.aug-chart input { accent-color: var(--vp-c-brand-1); }
.aug-chart input:focus-visible,.aug-chart summary:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.aug-chart-dot { width: 8px; height: 8px; border-radius: 50%; }
.aug-chart-panels { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit,minmax(min(100%,270px),1fr)); }
.aug-chart-panels section { min-width: 0; padding: 15px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); }
.aug-chart h4 { margin: 0 0 14px; font-size: 14px; line-height: 1.5; }
.aug-chart h4 a { color: var(--vp-c-text-1); text-decoration: none; }
.aug-chart h4 a:hover { color: var(--vp-c-brand-1); }
.aug-chart-source { display: block; margin-top: 3px; color: var(--vp-c-text-2); font-size: 11px; font-weight: 400; }
.aug-chart ul { margin: 0; padding: 0; list-style: none; }
.aug-chart li { display: grid; grid-template-columns: 52px minmax(0,1fr) 83px; gap: 9px; align-items: center; margin: 9px 0; font-size: 12px; line-height: 1.4; }
.aug-chart-label { font-weight: 500; }
.aug-chart-track { position: relative; height: 18px; background: var(--vp-c-bg-soft); border-left: 1px solid var(--vp-c-divider); border-radius: 0 3px 3px 0; }
.aug-chart-bar { display: block; height: 100%; background: var(--series-color); border-radius: 0 3px 3px 0; }
.aug-chart-range { position: absolute; top: 8px; height: 2px; border-left: 2px solid var(--vp-c-text-1); border-right: 2px solid var(--vp-c-text-1); background: var(--vp-c-text-1); min-width: 2px; }
.aug-chart-value { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.aug-chart-unit { color: var(--vp-c-text-2); font-size: 10px; }
.aug-chart-axis { display: flex; justify-content: space-between; margin: 6px 92px 0 61px; color: var(--vp-c-text-3); font-size: 10px; white-space: nowrap; }
.aug-chart-details { margin-top: 20px; font-size: 13px; }
.aug-chart summary { cursor: pointer; color: var(--vp-c-text-2); }
.aug-chart-table { max-width: 100%; overflow-x: auto; }
.aug-chart table { display: table; width: 100%; font-size: 12px; }
.aug-chart caption { padding: 12px 0 6px; text-align: left; font-weight: 600; }
.aug-chart th,.aug-chart td { white-space: nowrap; }
@media (max-width: 640px) { .aug-chart { padding: 14px; margin: 20px 0; } .aug-chart-panels section { padding: 12px; } }
</style>
