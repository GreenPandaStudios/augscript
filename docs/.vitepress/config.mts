import { defineConfig } from 'vitepress';
import { copyFileSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import container from 'markdown-it-container';

const repo = 'https://github.com/GreenPandaStudios/augscript';
const root = resolve(import.meta.dirname, '../..');
const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;
const grammar = JSON.parse(readFileSync(resolve(root, 'vscode/syntaxes/augscript.tmLanguage.json'), 'utf8'));
export default defineConfig({
  title: 'August',
  description: 'A language for readable modules, explicit dependencies, and developers working with LLMs.',
  base: process.env.AUG_DOCS_BASE ?? '/augscript/',
  cleanUrls: true,
  lastUpdated: true,
  buildEnd(site) {
    for (const file of ['benchmark-results.json', 'benchmark-baseline.json', 'benchmarks.json'])
      copyFileSync(resolve(root, 'docs', file), resolve(site.outDir, file));
  },
  sitemap: { hostname: 'https://GreenPandaStudios.github.io/augscript/' },
  markdown: {
    languages: [{ ...grammar, name: 'aug', aliases: ['augscript'] }],
    config(md) {
      md.set({ html: false });
      for (const name of ['example-compare', 'example-code', 'example-spec'])
        md.use(container, name, { render: (tokens, index) => `<${tokens[index].nesting === 1 ? 'div' : '/div'}${tokens[index].nesting === 1 ? ` class="aug-${name}"` : ''}>\n` });
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
    siteTitle: `August ${version}`,
    nav: [{ text: 'Get started', link: '/getting-started' }, { text: 'Guide', link: '/reference' }, { text: 'Web', link: '/web' },
      { text: 'Examples', link: '/examples/' }, { text: 'Packages', link: '/packages' }, { text: 'Performance', link: '/performance' }, { text: 'GitHub', link: repo }],
    search: { provider: 'local' },
    sidebar: [
      { text: 'Learn August', items: [
        { text: 'Start here', link: '/index' }, { text: 'Getting started', link: '/getting-started' }, { text: 'Language guide', link: '/reference' },
        { text: 'Example projects', link: '/examples/' },
        { text: 'Grammar', link: '/grammar' }, { text: 'Constructs and built-ins', link: '/language-constructs' },
        { text: 'Testing', link: '/testing' }, { text: 'Web and crypto', link: '/web' },
        { text: 'Compiled specifications', link: '/specifications' },
        { text: 'Diagnostics', link: '/diagnostics' }, { text: 'CLI and VS Code', link: '/tooling' },
        { text: 'Performance and benchmarks', link: '/performance' }
      ]},
      { text: 'Library API', items: ['io', 'json', 'memory', 'time', 'web', 'crypto'].map(module => ({ text: `august.${module}`, link: `/api/${module}` })) },
      { text: 'Project and releases', items: [
        { text: 'Packages', link: '/packages' }, { text: 'Docker images', link: '/docker' },
        { text: 'Production readiness', link: '/production-readiness' }, { text: 'Compatibility', link: '/compatibility' }, { text: 'Ownership and task conformance', link: '/language-conformance' }, { text: 'Roadmap to 1.0', link: '/roadmap' },
        { text: 'Release process', link: '/releasing' },
        { text: 'Documentation maintenance', link: '/maintaining-docs' }, { text: 'Library gaps', link: '/web-library-gaps' },
        { text: 'Implementation map', link: '/implementation-map' }, { text: 'Design audit', link: '/language-design-audit' }
      ]}
    ],
    editLink: { pattern: `${repo}/edit/main/docs/:path`, text: 'Edit this page on GitHub' },
    socialLinks: [{ icon: 'github', link: repo }],
    footer: { message: 'The world runs on language', copyright: 'MIT · August contributors' }
  }
});
