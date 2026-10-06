import DefaultTheme from 'vitepress/theme';
import {inBrowser, onContentUpdated, useData, type Theme} from 'vitepress';
import {onBeforeUnmount, onMounted} from 'vue';
import './style.css';
import BenchmarkChart from './BenchmarkChart.vue';
import CodeDiagram from './CodeDiagram.vue';
import {createDiagramNavigation} from './diagram-navigation';

export default {
  extends: DefaultTheme,
  enhanceApp({app}) { app.component('BenchmarkChart', BenchmarkChart); app.component('CodeDiagram',CodeDiagram); },
  setup() {
    if (!inBrowser) return;
    const {site}=useData();
    let diagramNavigation:ReturnType<typeof createDiagramNavigation>|undefined;
    const key = 'august-example-block-style';
    let preferred = 'Indentation';
    try { if (localStorage.getItem(key) === 'Braces') preferred = 'Braces'; } catch {}
    const groups = () => Array.from(document.querySelectorAll('.vp-code-group')).filter(group => {
      const labels = Array.from(group.querySelectorAll('.tabs label')).map(label => label.textContent?.trim());
      return labels.length === 2 && labels[0] === 'Indentation' && labels[1] === 'Braces';
    });
    const apply = () => {
      for (const group of groups()) {
        group.querySelector('.tabs')?.setAttribute('role', 'radiogroup');
        group.querySelector('.tabs')?.setAttribute('aria-label', 'August block style');
        const inputs = group.querySelectorAll<HTMLInputElement>('.tabs input');
        const blocks = group.querySelector('.blocks')?.children;
        inputs.forEach((input, index) => {
          const label = index === 0 ? 'Indentation' : 'Braces', active = label === preferred;
          input.checked = active;
          input.setAttribute('aria-label', label);
          blocks?.[index]?.classList.toggle('active', active);
          blocks?.[index]?.setAttribute('aria-hidden', String(!active));
        });
        // The canonical anchor must belong to the visible style so native and
        // VitePress scrolling agree, including repeated clicks on the same hash.
        const selected=preferred==='Braces'?'braces':'indent';
        for(const pre of group.querySelectorAll<HTMLElement>('pre[data-aug-source-style]')) {
          for(const anchor of pre.querySelectorAll<HTMLElement>('[data-aug-source-id]'))
            anchor.id=anchor.dataset.augSourceId!+(pre.dataset.augSourceStyle===selected?'':'-'+pre.dataset.augSourceStyle);
        }
      }
    };
    const focusSource = (scroll=true) => {
      document.querySelectorAll('.aug-source-selected').forEach(line=>line.classList.remove('aug-source-selected'));
      let anchor:string;
      try{anchor=decodeURIComponent(location.hash.slice(1));}catch{return;}
      if(!/^source-L[1-9][0-9]*(?:-L[1-9][0-9]*)?$/.test(anchor))return;
      const style=preferred==='Braces'?'braces':'indent';
      for(const pre of document.querySelectorAll<HTMLElement>('pre[data-aug-source-style="'+style+'"]')) {
        const links=JSON.parse(pre.dataset.augSourceLinks??'[]') as {id:string;first:number;last:number}[];
        const link=links.find(link=>link.id===anchor);if(!link)continue;
        let first:HTMLElement|undefined;
        for(const line of pre.querySelectorAll<HTMLElement>('[data-aug-line]')) {
          const number=Number(line.dataset.augLine);
          if(number>=link.first&&number<=link.last){line.classList.add('aug-source-selected');first??=line;}
        }
        if(first&&scroll){first.scrollIntoView({block:'center'});first.tabIndex=-1;first.focus({preventScroll:true});}
      }
    };
    const sourceChanged=()=>requestAnimationFrame(()=>focusSource());
    const changed = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      const group = input.closest('.vp-code-group');
      if (!group || !groups().includes(group)) return;
      preferred = Array.from(group.querySelectorAll('.tabs input')).indexOf(input) === 0 ? 'Indentation' : 'Braces';
      try { localStorage.setItem(key, preferred); } catch {}
      apply();sourceChanged();
    };
    onContentUpdated(()=>{apply();sourceChanged();diagramNavigation?.select();});
    onMounted(() => { diagramNavigation=createDiagramNavigation(window,document,()=>site.value.scrollOffset);apply();sourceChanged();document.addEventListener('change', changed);window.addEventListener('hashchange',sourceChanged); });
    onBeforeUnmount(() => {diagramNavigation?.stop();document.removeEventListener('change', changed);window.removeEventListener('hashchange',sourceChanged);});
  }
} satisfies Theme;
