#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { loadProject } from '../src/project.ts';
import { checkProject } from '../src/checker.ts';
import { callableResult, callableErrors, constructorErrors } from '../src/contracts.ts';
import { tyName } from '../src/types.ts';
import { javadocBefore } from '../src/javadoc.ts';
import { prepareRunPackages } from '../src/package-manager.ts';
import { defaultText } from '../src/parameters.ts';
import { typeName } from '../src/ast.ts';
import { callableDocumentation } from '../src/documentation.ts';
import { languageHelp } from '../src/help.ts';
import { collectionOperations } from '../src/builtins.ts';
import { generateSpecs } from '../src/spec.ts';
import { specHint } from '../src/spec-hints.ts';
import { buildExamplePages, examples } from './example-docs.mjs';
import { benchmarkChartData } from './benchmark-chart-data.mjs';
import { homepageExample,homepageDiagrams,homepageBenchmark } from './homepage-docs.mjs';
import {conformancePage} from './conformance-ledger.mjs';
import { nativePackageExamples } from './native-package-docs.mjs';
import {libraryCatalogPage} from './library-catalog-docs.mjs';
import {coreLibraryModules,standardLibraryModules} from '../src/library-modules.ts';

const root = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const outputs = new Map();
outputs.set('docs/.vitepress/theme/benchmark-data.json', benchmarkChartData(root));
outputs.set('docs/native-package-examples.md', nativePackageExamples(root));
outputs.set('docs/library-catalog.md',libraryCatalogPage());
outputs.set('docs/conformance-rules.md',conformancePage(root));
// Analyze the pending source pointers too, so one generation pass has correct API/source links.
const entry=join(root,'examples/approved-design');
const initial=checkProject(loadProject(entry));
const sourceOverrides=new Map([...initial.project.files.values()].filter(file=>file.builtin).map(file=>[file.path,specHint(file).text]));
let checked = checkProject(loadProject(entry,sourceOverrides));
const errors = checked.diagnostics.filter(issue => issue.severity !== 'warning');
if (errors.length) throw new Error('Cannot generate API docs from an invalid project: ' + JSON.stringify(errors));
let project = checked.project;
// The core root export is a source unit too. Check its adjacent spec with the
// same core modules, so folder links point to their canonical neighbors.
const coreFiles=[...project.files.values()].filter(file=>file.builtin);
const rootExport=join(root,'src/stdlib/export.aug');
for(const output of generateSpecs(checked,{manifest:false,files:coreFiles,diagramRoot:join(root,'src/stdlib')}))
  if(output.source===rootExport||output.path.startsWith(join(root,'src/stdlib/.aug-spec/diagrams')+'/'))outputs.set(relative(root,output.path),output.text);
const header = source => source.slice(0, source.indexOf('\n') < 0 ? source.length : source.indexOf('\n')).trim().replace(/[:{]\s*$/, '').trimEnd();
const parameter = param => (param.injected ? 'resolve ' : '') +
  (param.ownership === 'borrow' ? 'borrow ' : param.ownership === 'own' ? 'own ' : '') +
  typeName(param.type) + ' ' + (param.label ?? param.name) + (param.defaultValue ? ' = ' + defaultText(param.defaultValue) : '');
const genericParameters = node => node.typeParams.length ? '<' + node.typeParams.map(name =>
  (node.typeVariance?.[name] ? node.typeVariance[name] + ' ' : '') + name +
  (node.typeConstraints?.[name]?.length ? ' implements ' + node.typeConstraints[name].map(typeName).join(' and ') : '')).join(', ') + '>' : '';
const formatHeader = (node, params, prefix = '') => {
  const name = prefix + node.name + genericParameters(node);
  const result = name + '(' + params.join(', ') + ')';
  return result.length > 85 && params.length > 1 ? name + '(\n    ' + params.join(',\n    ') + '\n)' : result;
};
const signature = node => {
  if (node.kind === 'class') {
    let result = formatHeader(node, node.fields.map(parameter), node.errorShorthand ? 'error ' : node.record ? 'record ' : '');
    const errors = constructorErrors(checked, node);
    if (errors.length) result += ' unless ' + errors.join(' and ');
    if (!node.errorShorthand && node.implements.length) result += ' implements ' + node.implements.map(typeName).join(', ');
    return result;
  }
  if (node.kind !== 'function' && node.kind !== 'method') return header(project.files.get(node.span.file).source.slice(node.span.start));
  let result = formatHeader(node, node.params.map(parameter));
  const returns = tyName(callableResult(checked, node)), errors = callableErrors(checked, node);
  if (returns !== 'void') result += ' returns ' + returns;
  if (errors.length) result += ' unless ' + errors.join(' and ');
  return result;
};
const effects = node => {
  const contract = checked.effectContracts.get(node);
  const changes = contract?.changes ?? [], uses = [...(contract?.uses.values() ?? [])];
  const sentences = [];
  if (changes.length) sentences.push('May change ' + changes.map(name => '`' + name + '`').join(' and ') + '.');
  if (uses.length) sentences.push('Uses ' + uses.map(effect => '`' + effect.source + '.' + effect.operation + '`').join(' and ') + '.');
  return sentences.length ? '\n\n' + sentences.join(' ') : '';
};
const fence = text => `\`\`\`text\n${text}\n\`\`\``;
// Hover examples are syntax fragments; runnable guides alone use executable aug fences.
const reference = text => text.replace(/```aug(?=\s|$)/g, '```text');
const generated = source => `---\ngenerated: true\nsource: ${source}\neditLink: false\n---\n\n`;
const link = node => {
  const path = relative(root, node.span.file).split(/[/\\]/).join('/');
  return `[Source](https://github.com/GreenPandaStudios/augscript/blob/main/${path}#L${node.span.line})`;
};
for (const module of standardLibraryModules) {
  const folder = join(root, 'src/stdlib', module);
  prepareRunPackages(folder);
  const before = loadProject(folder);
  for (const file of before.files.values()) if (!file.package) sourceOverrides.set(file.path, specHint(file).text);
  checked = checkProject(loadProject(folder, sourceOverrides)); project = checked.project;
  if (checked.diagnostics.some(issue => issue.severity !== 'warning')) throw new Error(JSON.stringify(checked.diagnostics));
  const owned=[...project.files.values()].filter(file=>!file.package&&file.path.startsWith(folder+'/'));
  for(const file of owned)outputs.set(relative(root,file.path),specHint(file).text);
  for (const output of generateSpecs(checked, { manifest: false,files:owned })) outputs.set(relative(root, output.path), output.text);
  const exports = project.files.get(join(folder, 'export.aug')).items.filter(item => item.kind === 'export' && !item.internal && !item.folder);
  const sections = [generated(`src/stdlib/${module}`) + `# august.${module}\n\n` +
    (coreLibraryModules.includes(module) ? (module!=='io'?'**August 1.0:** ':'')+'Supplied with the compiler. Import public names from `august.' + module + '`.' :
      'Install this source library with `aug add https://github.com/GreenPandaStudios/augscript/src/stdlib/' + module + ' --as ' + module + '`, then import its public names from `' + module + '`.') +
    '\n\nSignatures show result types and checked errors. See [packages](../packages.md) to pin a release and [language constructs](../language-constructs.md) for built-in types.'];
  for (const item of exports) {
    const def = project.scopes.get(join(folder, `${item.from}.aug`)).get(item.name);
    const node = def.node;
    const doc = node.kind === 'function' ? callableDocumentation(project, node) :
      javadocBefore(project.files.get(def.file).source, node.annotations?.[0]?.span.start ?? node.span.start);
    sections.push(`## ${item.name} {#api-${item.name}}\n\n${fence(signature(node))}\n\n${doc?.markdown ?? ''}${node.kind === 'function' ? effects(node) : ''}\n\n${link(node)}`);
    for (const method of node.methods ?? []) {
      if (method.name.startsWith('_')) continue;
      const help = callableDocumentation(project, method, def);
      sections.push(`### ${item.name}.${method.name}\n\n${fence(signature(method))}\n\n${help?.markdown ?? ''}${effects(method)}\n\n${link(method)}`);
    }
  }
  outputs.set(`docs/api/${module}.md`, sections.join('\n\n').replace(/\n{3,}/g, '\n\n') + '\n');
}
const constructs = [generated('src/help.ts and src/builtins.ts') + '# Language constructs\n\nSyntax and built-in operations. For complete programs, read [the language reference](reference.md). These descriptions also appear in VS Code help.'];
const unsupported = new Set(['class','function','bind','throws','missing','&&','||','!','=>','->','?']);
for (const [name, help] of Object.entries(languageHelp).sort(([a], [b]) => a.localeCompare(b))) {
  if (unsupported.has(name)) continue;
  constructs.push(`## ${name}\n\n${fence(help.detail)}\n\n${reference(help.documentation)}`);
}
for (const [type, operations] of Object.entries(collectionOperations)) {
  constructs.push(`## ${type} operations`);
  for (const operation of operations) constructs.push(`### ${type}.${operation.name}\n\n${operation.documentation}`);
}
constructs.push('## Unsupported spellings\n\nUse `and`, `or`, `not`, `unless`, `optional T`, `null`, `implement … with …`, and `initialize`. Declarations start with their name, without a class or function prefix. Symbolic booleans, arrow constructors, and `T?` are rejected. [Diagnostics](diagnostics.md) explains fixes and migration.');
outputs.set('docs/language-constructs.md', constructs.join('\n\n') + '\n');
for (const [path, text] of buildExamplePages(sourceOverrides)) outputs.set(path, text);
outputs.set('docs/.vitepress/home-example.md',homepageExample(root,outputs));
outputs.set('docs/.vitepress/home-diagram.md',homepageDiagrams(root,outputs));
const performance=homepageBenchmark(root);
outputs.set('docs/.vitepress/home-performance.md',performance.slice(performance.indexOf('### Native performance, compared with C')).replace('This program writes','A separate [million-greeting program](examples/greetings-benchmark/main.md) writes'));
const stale = [];
for (const [path, content] of outputs) {
  const file = join(root, path);
  if (check) { if (!existsSync(file) || !readFileSync(file).equals(Buffer.from(content))) stale.push(path); }
  else { mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, content); }
}
for (const file of readdirSync(join(root, 'docs/api'))) if (file.endsWith('.md') && !outputs.has('docs/api/' + file))
  stale.push('Unexpected generated API page: ' + file);
const pruneGallery = directory => {
  for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
    const path = directory + '/' + entry.name;
    if (entry.isDirectory()) pruneGallery(path);
    else if (entry.isFile() && path.endsWith('.md') && !outputs.has(path) &&
      /^---\n[\s\S]*?\ngenerated: true\n[\s\S]*?\n---\n/.test(readFileSync(join(root, path), 'utf8'))) {
      if (check) stale.push('Unexpected generated example page: ' + path);
      else rmSync(join(root, path));
    }
  }
};
if (existsSync(join(root, 'docs/examples'))) pruneGallery('docs/examples');
// The temporary gallery projects do not carry old snapshots. Prune those owned
// copies in the canonical examples too, so downloads and source stay current.
const pruneSnapshots = directory => {
  if (!existsSync(join(root, directory))) return;
  for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
    const path=directory+'/'+entry.name;
    if (entry.isDirectory()) pruneSnapshots(path);
    else if (entry.isFile() && /\.aug(?:\.diagrams)?(?:\.md)?$|\/diagrams\/index\.md$/.test(path) && !outputs.has(path) &&
      /^(?:<!-- Generated by aug spec\.|\/\/ Generated by aug spec\.)/.test(readFileSync(join(root,path),'utf8'))) {
      if (check) stale.push('Unexpected generated dependency copy: '+path);
      else rmSync(join(root,path));
    }
  }
};
for (const example of examples) pruneSnapshots(example.path+'/.aug-spec');
const downloads='docs/public/downloads';
if(existsSync(join(root,downloads)))for(const file of readdirSync(join(root,downloads))) {
  const path=downloads+'/'+file;
  if(/\.(?:zip|tar\.gz)$/.test(file)&&!outputs.has(path)) {
    if(check)stale.push('Unexpected generated example download: '+path);
    else rmSync(join(root,path));
  }
}
if (stale.length) throw new Error('Documentation is stale; run npm run docs:generate:\n' + stale.join('\n'));
process.stdout.write(`${outputs.size} documentation files ${check ? 'match source' : 'generated'}\n`);
