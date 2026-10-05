import {SemanticWorkspace} from '../src/semantic.ts';
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


test('borrow fixes require the same-file test candidate to check completely',()=>fixture({
  'main.aug':'',
  'values.aug':`count():
    return 1
test count:
    when editing:
        it example:
            items = [1]
            items.append(value=2)
            unknown()
            assert(condition=true)
`
},(root)=>{
  const workspace=new SemanticWorkspace(root),view=workspace.document(join(root,'values.aug'),undefined,true);
  assert.ok(!view.fixes().some(fix=>/borrow items block/.test(fix.title)));
}));


test('dependency hover explains the checked provider and forwarded header instead of guessing',()=>fixture({
  'main.aug': 'import Clock and FixedClock and read and forwarded from work\nimplement Clock with FixedClock scoped\nscope { read(); forwarded() }\n',
  'work.aug': `interface Clock { now() returns int }
FixedClock() implements Clock { now() { return 7 } }
read(resolve Clock clock) { return clock.now() }
forwarded(resolve Clock supplied) { return read() }
`
},(root,checked)=>{
  assert.deepEqual(checked().diagnostics,[]);
  const workspace=new SemanticWorkspace(root),main=join(root,'main.aug'),source=readFileSync(main,'utf8');
  const provider=workspace.document(main,undefined,true).hover(source.indexOf('read();')).documentation;
  assert.match(provider,/clock.*FixedClock/s);assert.match(provider,/scoped/);assert.match(provider,/file:\/\//);
  const work=join(root,'work.aug'),body=readFileSync(work,'utf8'),forward=workspace.document(work).hover(body.lastIndexOf('read()')).documentation;
  assert.match(forward,/supplied.*header/s);assert.doesNotMatch(forward,/FixedClock/);
  writeFileSync(work,body.replace('resolve Clock supplied','resolve Clock first, resolve Clock second'));
  const ambiguous=workspace.document(work).hover(readFileSync(work,'utf8').lastIndexOf('read()')).documentation;
  assert.match(ambiguous,/Ambiguous/);assert.doesNotMatch(ambiguous,/supplied by.*first/i);
}));

test('ownership hover follows aliases, active captures and the source of a move',()=>fixture({
  'main.aug':`import read and take from work
items = [1]
alias = items
borrow items { items.append(value=2) }
scope {
    child = start read(items)
    alias.length()
    wait for child as count
}
own List<int> owned = [3]
take(items=owned)
owned.length()
`,
  'work.aug':'read(List<int> items) { return items.length() }\ntake(own List<int> items) { pass }\n'
},root=>{
  const source=readFileSync(join(root,'main.aug'),'utf8'),view=new SemanticWorkspace(root).document(join(root,'main.aug'),undefined,true);
  const alias=view.hover(source.indexOf('alias.length')).documentation;
  assert.match(alias,/items/);assert.match(alias,/task.*capture/i);assert.match(alias,/file:\/\//);
  const moved=view.hover(source.indexOf('owned.length')).documentation;
  assert.match(moved,/moved/i);assert.match(moved,/file:\/\//);
  const borrower=view.hover(source.indexOf('items.append')).documentation;
  assert.match(borrower,/exclusive borrow/i);
}));


test('owned-result hints expose the checked contract and stay out of formatting',()=>fixture({
  'main.aug':'import make from work\nresult = make()\n',
  'work.aug':'make() returns own List<int> { return [1] }\n'
},root=>{
  const file=join(root,'main.aug'),source=readFileSync(file,'utf8'),view=new SemanticWorkspace(root).document(file,undefined,true);
  assert.deepEqual(view.diagnostics,[]);
  const hint=view.inlayHints().find(hint=>hint.offset===source.indexOf('result')+6);
  assert.equal(hint.label,': own List<int>');assert.match(hint.tooltip,/checked call result/);
  assert.doesNotMatch(view.format(),/own/);
}));
