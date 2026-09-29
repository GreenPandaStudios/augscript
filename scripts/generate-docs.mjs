#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { loadProject } from '../src/project.ts';
import { checkProject } from '../src/checker.ts';
import { javadocBefore } from '../src/javadoc.ts';
import { callableDocumentation } from '../src/documentation.ts';
import { languageHelp } from '../src/help.ts';
import { collectionOperations } from '../src/builtins.ts';

const root = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const outputs = new Map();
const checked = checkProject(loadProject(join(root, 'examples/approved-design')));
const errors = checked.diagnostics.filter(issue => issue.severity !== 'warning');
if (errors.length) throw new Error('Cannot generate API docs from an invalid project: ' + JSON.stringify(errors));
const project = checked.project;
const header = source => source.slice(0, source.indexOf('\n') < 0 ? source.length : source.indexOf('\n')).trim().replace(/[:{]\s*$/, '');
const signature = node => header(project.files.get(node.span.file).source.slice(node.span.start));
const inferredEffects = node => {
  const contract = checked.effectContracts.get(node);
  return contract?.inferred ? '\n\nInferred capabilities: ' +
    ([...contract.uses.values()].map(effect => `\`${effect.source}.${effect.operation}\``).join(', ') || 'none (pure)') + '.' : '';
};
const fence = text => `\`\`\`text\n${text}\n\`\`\``;
// Hover examples are syntax fragments; runnable guides alone use executable aug fences.
const reference = text => text.replace(/```aug(?=\s|$)/g, '```text');
const generated = source => `---\ngenerated: true\nsource: ${source}\neditLink: false\n---\n\n`;
const link = node => {
  const path = relative(root, node.span.file).split(/[/\\]/).join('/');
  return `[Source](https://github.com/GreenPandaStudios/augscript/blob/main/${path}#L${node.span.line})`;
};
for (const module of ['io', 'json', 'memory', 'time', 'web', 'crypto']) {
  const folder = join(project.stdlibRoot, module);
  const exports = project.files.get(join(folder, 'export.aug')).items.filter(item => item.kind === 'export' && !item.folder);
  const sections = [generated(`src/stdlib/${module}`) + `# august.${module}\n\n` +
    `Public declarations exported by this module. Import names explicitly from \`august.${module}\`. Built-in wire/value types are described in [language constructs](../language-constructs.md).\n\n` +
    exports.map(item => `- [${item.name}](#api-${item.name})`).join('\n')];
  for (const item of exports) {
    const def = project.scopes.get(join(folder, `${item.from}.aug`)).get(item.name);
    const node = def.node;
    const doc = node.kind === 'function' ? callableDocumentation(project, node) :
      javadocBefore(project.files.get(def.file).source, node.annotations?.[0]?.span.start ?? node.span.start);
    sections.push(`## ${item.name} {#api-${item.name}}\n\n${fence(signature(node))}\n\n${doc?.markdown ?? 'The signature defines this public contract.'}\n\n${link(node)}`);
    for (const method of node.methods ?? []) {
      if (method.name.startsWith('_')) continue;
      const help = callableDocumentation(project, method, def);
      sections.push(`### ${item.name}.${method.name}\n\n${fence(signature(method))}\n\n${help?.markdown ?? 'The signature declares inputs, result, effects and checked errors.'}${inferredEffects(method)}\n\n${link(method)}`);
    }
  }
  outputs.set(`docs/api/${module}.md`, sections.join('\n\n') + '\n');
}
const constructs = [generated('src/help.ts and src/builtins.ts') + '# Language constructs\n\nThis reference uses the same help as VS Code hover and completion. See [the guide](reference.md) for complete, compiler-checked examples.'];
for (const [name, help] of Object.entries(languageHelp).sort(([a], [b]) => a.localeCompare(b)))
  constructs.push(`## ${name}\n\n${fence(help.detail)}\n\n${reference(help.documentation)}`);
for (const [type, operations] of Object.entries(collectionOperations)) {
  constructs.push(`## ${type} operations`);
  for (const operation of operations) constructs.push(`### ${type}.${operation.name}\n\n${operation.documentation}`);
}
outputs.set('docs/language-constructs.md', constructs.join('\n\n') + '\n');
const stale = [];
for (const [path, content] of outputs) {
  const file = join(root, path);
  if (check) { if (!existsSync(file) || readFileSync(file, 'utf8') !== content) stale.push(path); }
  else { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, content); }
}
for (const file of readdirSync(join(root, 'docs/api'))) if (file.endsWith('.md') && !outputs.has('docs/api/' + file))
  stale.push('Unexpected generated API page: ' + file);
if (stale.length) throw new Error('Documentation is stale; run npm run docs:generate:\n' + stale.join('\n'));
process.stdout.write(`${outputs.size} documentation pages ${check ? 'match source' : 'generated'}\n`);
