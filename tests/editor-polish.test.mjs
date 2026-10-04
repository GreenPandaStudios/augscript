import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { loadProject } from '../src/project.ts';
import { checkProject } from '../src/checker.ts';
import { completions } from '../src/editor.ts';
import { suggestedFixes } from '../src/fixes.ts';
import { snippetBody, snippetCatalog } from '../src/snippets.ts';
import { parse } from '../src/parser.ts';

function fixture(files, action) {
  const root = mkdtempSync(join(tmpdir(), 'aug-editor-polish-'));
  try {
    for (const [name, source] of Object.entries(files)) { const file = join(root, name); mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, source); }
    action(root, () => checkProject(loadProject(root)));
  } finally { rmSync(root, { recursive: true, force: true }); }
}
const expand = text => text.replace(/\$\{\d+:([^}]+)\}/g, '$1').replace(/\$\d+/g, '').replace(/\\([\\$}])/g, '$1');
const apply = (source, edits) => [...edits].sort((a, b) => b.start - a.start).reduce((text, edit) => text.slice(0, edit.start) + edit.text + text.slice(edit.end), source);

test('call completion fills labeled values, omits injected inputs, and produces checkable source', () => fixture({
  'main.aug': 'import calculate from work\nprint(value=calcu)\n',
  'work.aug': 'calculate(int quantity, string name) { return quantity }\n',
}, (root, checked) => {
  const file = join(root, 'main.aug'), source = readFileSync(file, 'utf8');
  const choice = completions(checked(), file, source.indexOf('calcu)') + 5).find(item => item.label === 'calculate');
  assert.match(choice.insertText, /calculate\(quantity=\$\{1:0\}, name=\$\{2:""\}\)/);
  writeFileSync(file, apply(source, [{ ...choice.replacement, text: expand(choice.insertText) }]));
  assert.deepEqual(checked().diagnostics, []);
}));

test('auto-import completion adds one import and a labeled call as nonoverlapping edits', () => fixture({
  'main.aug': 'print(value=calcu)\n',
  'work.aug': '/** Calculate a quantity. */\ncalculate(int quantity) { return quantity + 1 }\n',
}, (root, checked) => {
  const file = join(root, 'main.aug'), source = readFileSync(file, 'utf8');
  const choice = completions(checked(), file, source.indexOf('calcu') + 5).find(item => item.label === 'calculate');
  assert.ok(choice, 'an exported sibling function is discoverable');
  const edits = [...(choice.additionalEdits ?? []), { ...choice.replacement, text: expand(choice.insertText) }];
  const result = apply(source, edits);
  assert.match(result, /^import calculate from work\n/);
  assert.match(result, /calculate\(quantity=0\)/);
  writeFileSync(file, result); assert.deepEqual(checked().diagnostics, []);
}));

test('name and argument-label fixes repair the compiler error when applied', () => {
  for (const [source, title] of [
    ['calculate(int quantity) { return quantity }\nrun() { return calclate(quantity=2) }\n', 'Replace calclate with calculate'],
    ['calculate(int quantity) { return quantity }\nrun() { return calculate(quantty=2) }\n', 'Use argument label quantity'],
  ]) fixture({ 'work.aug': source, 'main.aug': '' }, (root, checked) => {
    const file = join(root, 'work.aug'), fixes = suggestedFixes(checked(), file), fix = fixes.find(fix => fix.title === title);
    assert.ok(fix, JSON.stringify(fixes));
    writeFileSync(file, apply(source, fix.edits)); assert.deepEqual(checked().diagnostics, []);
  });
});

test('missing method fixes produce valid class structure in braces and indentation', () => {
  for (const [source, style] of [
    ['interface Worker { run(); }\nQuiet() implements Worker { }\n', 'braces'],
    ['interface Worker:\n    run()\nQuiet() implements Worker:\n    existing():\n        pass\n', 'indent'],
  ]) fixture({ 'work.aug': source, 'main.aug': '', 'main.yaml': 'block_style: ' + style + '\n' }, (root, checked) => {
    const file = join(root, 'work.aug'), fixes = suggestedFixes(checked(), file), fix = fixes.find(fix => fix.title === 'Implement run in Quiet');
    assert.ok(fix, JSON.stringify(fixes));
    writeFileSync(file, apply(source, fix.edits)); assert.deepEqual(checked().diagnostics, []);
  });
});

test('stream and control-flow templates parse in both block styles', () => {
  for (const prefix of ['generic', 'method', 'stream', 'test', 'interceptor']) for (const style of ['braces', 'indent']) {
    const snippet = snippetCatalog.find(item => item.prefix === prefix);
    const source = expand(snippetBody(snippet.body.replace('$0', 'pass'), style));
    assert.deepEqual(parse('example.aug', source + '\n').diagnostics, [], prefix + ': ' + source);
  }
});

test('call completion uses compatible same-name locals and omits default inputs',()=>fixture({
  'main.aug':'import greet from greeting\nname = "Ada"\nprint(value=gree)\n',
  'greeting.aug':'greet(string name, string suffix = "!"):\n    return name + suffix\n'
},(root,checked)=>{
  const file=join(root,'main.aug'),source=readFileSync(file,'utf8');
  const choice=completions(checked(),file,source.indexOf('gree)')+4).find(item=>item.label==='greet');
  assert.equal(choice.insertText,'greet(name)$0');
  writeFileSync(file,apply(source,[{...choice.replacement,text:expand(choice.insertText)}]));
  assert.deepEqual(checked().diagnostics,[]);
  writeFileSync(file,'import greet from greeting\nname = 7\nprint(value=gree)\n');
  const incompatible=completions(checked(),file,readFileSync(file,'utf8').indexOf('gree)')+4).find(item=>item.label==='greet');
  assert.doesNotMatch(incompatible.insertText,/greet\(name\)/);
}));

test('borrow fixes are checked before being offered and honor the project block style',()=>{
  for(const style of ['braces','indent'])fixture({
    'main.aug':'items = [1]\nitems.append(value=2)\n',
    'main.yaml':`block_style: ${style}\nindentation: tabs\n`
  },(root,checked)=>{
    const file=join(root,'main.aug'),source=readFileSync(file,'utf8'),fix=suggestedFixes(checked(),file).find(fix=>/borrow items block/.test(fix.title));
    assert.ok(fix);assert.match(fix.description,/exclusive|mutable/i);
    assert.match(fix.edits[0].text,style==='indent'?/^borrow items:\n\t/:/^borrow items \{\n\t/);
    writeFileSync(file,apply(source,fix.edits));assert.deepEqual(checked().diagnostics,[]);
    writeFileSync(file,'immutable List<int> items = [1]\nitems.append(value=2)\n');
    assert.ok(!suggestedFixes(checked(),file).some(fix=>/borrow items block/.test(fix.title)));
  });
});
