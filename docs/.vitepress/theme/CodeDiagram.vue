<script setup lang="ts">
import {computed,onBeforeUnmount,onMounted,ref,useId,watch} from 'vue';
import {useData} from 'vitepress';
const props=defineProps<{encoded:string}>();
const source=computed(()=>new TextDecoder().decode(Uint8Array.from(atob(props.encoded),char=>char.charCodeAt(0))));
const {isDark}=useData(),element=ref<HTMLElement>(),viewport=ref<HTMLElement>(),availableWidth=ref(640),svg=ref(''),error=ref(''),zoom=ref(100),naturalWidth=ref(640),fit=ref(false);
const drawnWidth=computed(()=> (fit.value?Math.min(naturalWidth.value,availableWidth.value):Math.min(naturalWidth.value,Math.max(naturalWidth.value*.8,availableWidth.value)))*(zoom.value/100));
const id='aug-diagram-'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
let observer:IntersectionObserver|undefined,resizeObserver:ResizeObserver|undefined,visible=false,disposed=false,revision=0;
async function render(){
  const selected=++revision;error.value='';
  try{
    const {default:mermaid}=await import('mermaid');
    if(disposed||selected!==revision)return;
    mermaid.initialize({startOnLoad:false,securityLevel:'strict',suppressErrorRendering:true,theme:'base',look:'classic',
      fontFamily:'system-ui, sans-serif',flowchart:{htmlLabels:false},
      themeVariables:isDark.value
        ?{primaryColor:'#302629',primaryTextColor:'#eee7e5',primaryBorderColor:'#a65c72',lineColor:'#c998a6',secondaryColor:'#272326',tertiaryColor:'#272326',background:'#201e20',noteBkgColor:'#302629',noteTextColor:'#eee7e5',noteBorderColor:'#a65c72'}
        :{primaryColor:'#f5edef',primaryTextColor:'#30272a',primaryBorderColor:'#863f56',lineColor:'#863f56',secondaryColor:'#faf7f4',tertiaryColor:'#faf7f4',background:'#faf7f4',noteBkgColor:'#f5edef',noteTextColor:'#30272a',noteBorderColor:'#863f56'}});
    const result=await mermaid.render(id,source.value);
    if(!disposed&&selected===revision){
      const viewBox=result.svg.match(/viewBox="[^"]*?\s([\d.]+)\s+[\d.]+"/);
      naturalWidth.value=viewBox?Number(viewBox[1]):640;svg.value=result.svg;
    }
  }catch{if(!disposed&&selected===revision){svg.value='';error.value='This diagram could not be drawn. Its Mermaid source is available below.';}}
}
onMounted(()=>{
  resizeObserver=new ResizeObserver(entries=>{if(entries[0])availableWidth.value=entries[0].contentRect.width;});
  if(viewport.value)resizeObserver.observe(viewport.value);
  observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){visible=true;observer?.disconnect();void render();}},{rootMargin:'200px'});
  if(element.value)observer.observe(element.value);
});
watch([source,isDark],()=>{if(visible)void render();});
onBeforeUnmount(()=>{disposed=true;revision++;observer?.disconnect();resizeObserver?.disconnect();});
</script>

<template>
  <figure ref="element" class="aug-diagram" aria-label="Generated code diagram">
    <div class="aug-diagram-controls" aria-label="Diagram magnification">
      <button type="button" :disabled="zoom <= 100" aria-label="Zoom out" @click="fit=false; zoom -= 25">−</button>
      <button type="button" :disabled="zoom >= 400" aria-label="Zoom in" @click="fit=false; zoom += 25">+</button>
      <button type="button" @click="fit=true; zoom=100">Fit</button><button type="button" @click="fit=false; zoom=100">Readable</button><span>{{ zoom }}%</span>
    </div>
    <p v-if="error" role="status">{{ error }}</p>
    <div v-else ref="viewport" class="aug-diagram-viewport" tabindex="0" role="region" aria-label="Scrollable diagram">
      <div :style="{width: drawnWidth+'px'}" v-html="svg" />
    </div>
    <details><summary>Mermaid source</summary><pre>{{ source }}</pre></details>
  </figure>
</template>

<style scoped>
.aug-diagram { margin:1.5rem 0; border:1px solid var(--vp-c-divider); border-radius:6px; }
.aug-diagram-controls { display:flex; flex-wrap:wrap; align-items:center; gap:.5rem; padding:.5rem .75rem; border-bottom:1px solid var(--vp-c-divider); font-size:.8rem; }
.aug-diagram-controls button { padding:.15rem .6rem; border:1px solid var(--vp-c-divider); border-radius:3px; }
.aug-diagram-controls button:disabled { opacity:.4; }
.aug-diagram-controls button:focus-visible,.aug-diagram-viewport:focus-visible { outline:2px solid var(--vp-c-brand-1); outline-offset:2px; }
.aug-diagram-viewport { overflow:auto; max-height:70vh; padding:1rem; min-height:6rem; }
.aug-diagram-viewport :deep(svg) { display:block; width:100%; height:auto; max-width:none !important; }
.aug-diagram-viewport :deep(svg .rect) { fill:var(--vp-c-bg-soft) !important; }
.aug-diagram-viewport :deep(svg [filter]) { filter:none !important; }
.aug-diagram details { padding:.5rem .75rem; font-size:.85rem; border-top:1px solid var(--vp-c-divider); }
.aug-diagram pre { overflow:auto; padding:.75rem; font-size:.8rem; line-height:1.5; }
.aug-diagram p { padding:.5rem .75rem; }
</style>
