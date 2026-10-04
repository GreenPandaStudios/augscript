import { defineConfig } from 'vitepress';
import { copyFileSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import container from 'markdown-it-container';

const repo = 'https://github.com/GreenPandaStudios/augscript';
const root = resolve(import.meta.dirname, '../..');
const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;
const grammar = JSON.parse(readFileSync(resolve(root, 'vscode/syntaxes/augscript.tmLanguage.json'), 'utf8'));
const chartNames = new Set(Object.keys(JSON.parse(readFileSync(resolve(root, 'docs/.vitepress/theme/benchmark-data.json'), 'utf8'))));
export default defineConfig({
  title: 'August',
  description: 'Code that reads like pseudocode, a compiled human-readable spec, and measured native performance.',
  base: process.env.AUG_DOCS_BASE ?? '/augscript/',
  cleanUrls: true,
  head: [['link', {rel: 'icon', type: 'image/svg+xml', href: (process.env.AUG_DOCS_BASE ?? '/augscript/') + 'brand/favicon.svg'}]],
  lastUpdated: true,
  buildEnd(site) {
    for (const file of ['benchmark-results.json', 'benchmark-baseline.json', 'benchmarks.json', 'greeting-results.json', 'kernel-results.json', 'gym-results.json', 'dgx-performance.json', 'dgx-kernels.json', 'dgx-gyms.json', 'dgx-consumers.json', 'release-macos-public-consumers.json', 'release-dgx-public-consumers.json', 'ci-linux-arm64-qualified.json.gz', 'ci-linux-arm64-rejected.json.gz', 'ci-linux-arm64-repeat.json.gz'])
      copyFileSync(resolve(root, 'docs', file), resolve(site.outDir, file));
  },
  sitemap: { hostname: 'https://GreenPandaStudios.github.io/augscript/' },
  markdown: {
    languages: [{ ...grammar, name: 'aug', aliases: ['augscript'] }],
    config(md) {
      md.set({ html: false });
      for (const name of ['example-compare', 'example-code', 'example-spec'])
        md.use(container, name, { render: (tokens, index) => `<${tokens[index].nesting === 1 ? 'div' : '/div'}${tokens[index].nesting === 1 ? ` class="aug-${name}"` : ''}>\n` });
      md.use(container, 'benchmark-chart', {render: (tokens, index) => {
        if (tokens[index].nesting !== 1) return '';
        const chart = tokens[index].info.trim().split(/\s+/)[1];
        if (!chartNames.has(chart)) throw new Error(`Unknown benchmark chart: ${chart}`);
        return `<BenchmarkChart chart="${chart}" />\n`;
      }});
      const render = md.renderer.rules.link_open;
      md.renderer.rules.link_open = (tokens, index, options, env, self) => {
        const token = tokens[index];
        const href = token.attrGet('href');
        if (href?.startsWith('../') && env.path) {
          const [path, anchor] = href.split('#');
          const target = resolve(dirname(env.path), path);
          if (!target.startsWith(resolve(root, 'docs') + '/')) token.attrSet('href',
            `${repo}/blob/main/${relative(root, target)}${anchor ? '#' + anchor : ''}`);
        }
        return render ? render(tokens, index, options, env, self) : self.renderToken(tokens, index, options);
      };
    }
  },
  themeConfig: {
    logo: {light: '/brand/august-mark.svg', dark: '/brand/august-mark-dark.svg', alt: 'August'},
    siteTitle: `August ${version}`,
    nav: [{ text: 'Learn', link: '/learn/' }, { text: 'Guides', link: '/guides/' },
      { text: 'Reference', link: '/reference' }, { text: 'Examples', link: '/examples/' },
      { text: 'About', link: '/about' }, { text: 'Performance', link: '/performance' }],
    search: { provider: 'local' },
    sidebar: [
      { text: 'The August book', items: [
        { text: 'How to use this book', link: '/learn/' },
        { text: '1. Your first project', link: '/getting-started' },
        { text: '2. Values and functions', link: '/learn/values-and-functions' },
        { text: '3. Data and failures', link: '/learn/data-and-errors' },
        { text: '4. Modules and dependencies', link: '/learn/modules-and-dependencies' },
        { text: '5. State and tests', link: '/learn/state-and-tests' },
        { text: '6. Change an unfamiliar module', link: '/guides/change-a-module' }
      ]},
      { text: 'Task guides', collapsed: false, items: [
        { text: 'Choose a guide', link: '/guides/' },
        { text: 'Weather API', link: '/weather-api' }, { text: 'VS Code', link: '/editor' },
        { text: 'Tests', link: '/testing' }, { text: 'Web applications', link: '/web' },
        { text: 'Native service boundaries', link: '/native-service-boundaries' },
        { text: 'Compiled specifications', link: '/specifications' },
        { text: 'Packages and installation', link: '/packages' },
        { text: 'Find a library', link: '/library-catalog' },
        { text: 'Native library packages', link: '/native-packages' },
        { text: 'Package compatibility', link: '/package-compatibility' },
        { text: 'Multicore workers', link: '/workers' },
        { text: 'Docker deployment', link: '/docker' },
        { text: 'VS Code Dev Containers', link: '/dev-containers' },
        { text: 'Diagnostics', link: '/diagnostics' }
      ]},
      { text: 'Language and tools', collapsed: true, items: [
        { text: 'Language reference', link: '/reference' }, { text: 'Grammar', link: '/grammar' },
        { text: 'Constructs and built-ins', link: '/language-constructs' },
        { text: 'Native ABI', link: '/native-abi' },
        { text: 'CLI, configuration, and editor', link: '/tooling' }
      ]},
      { text: 'Library reference', collapsed: true, items: ['io', 'collections', 'math', 'json', 'memory', 'time', 'web', 'crypto'].map(module => ({ text: `august.${module}`, link: `/api/${module}` })) },
      { text: 'About August', collapsed: true, items: [
        { text: 'Why August exists', link: '/about' }, { text: 'Example projects', link: '/examples/' },
        { text: 'Performance', link: '/performance' }, { text: 'Production readiness', link: '/production-readiness' },
        { text: 'Safety gyms', link: '/safety-gyms' },
        { text: 'DGX Spark results', link: '/dgx-spark' },
        { text: 'Roadmap to 1.0', link: '/roadmap' }, { text: 'Compatibility', link: '/compatibility' },
        { text: 'Library gaps', link: '/web-library-gaps' }
      ]},
      { text: 'Contribute', collapsed: true, items: [
        { text: 'Release process', link: '/releasing' },
        { text: 'Benchmark maintenance', link: '/contributing-benchmarks' },
        { text: 'Documentation maintenance', link: '/maintaining-docs' }, { text: 'Writing guide', link: '/writing-docs' },
        { text: 'Editorial research', link: '/research/wiki-editorial-design' },
        { text: 'Ownership and task conformance', link: '/language-conformance' },
        { text: 'Runtime reliability', link: '/runtime-reliability' },
        { text: 'Compiler architecture', link: '/implementation-map' }, { text: 'Design principles', link: '/language-design-audit' }
      ]}
    ],
    editLink: { pattern: `${repo}/edit/main/docs/:path`, text: 'Edit this page on GitHub' },
    socialLinks: [{ icon: 'github', link: repo }],
    footer: { message: 'The world runs on language', copyright: 'MIT · August contributors' }
  }
});
