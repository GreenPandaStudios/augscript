import DefaultTheme from 'vitepress/theme';
import {inBrowser, onContentUpdated, type Theme} from 'vitepress';
import {onBeforeUnmount, onMounted} from 'vue';
import './style.css';
import BenchmarkChart from './BenchmarkChart.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({app}) { app.component('BenchmarkChart', BenchmarkChart); },
  setup() {
    if (!inBrowser) return;
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
      }
    };
    const changed = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      const group = input.closest('.vp-code-group');
      if (!group || !groups().includes(group)) return;
      preferred = Array.from(group.querySelectorAll('.tabs input')).indexOf(input) === 0 ? 'Indentation' : 'Braces';
      try { localStorage.setItem(key, preferred); } catch {}
      apply();
    };
    onContentUpdated(apply);
    onMounted(() => { apply(); document.addEventListener('change', changed); });
    onBeforeUnmount(() => document.removeEventListener('change', changed));
  }
} satisfies Theme;
