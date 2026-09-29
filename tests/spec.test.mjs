import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, statSync, symlinkSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { loadProject } from '../src/project.ts';
import { checkProject } from '../src/checker.ts';
import { discoverTests, checkUnitTests, mergeTestAnalysis } from '../src/testing.ts';
import { generateSpecs, updateSpecs } from '../src/spec.ts';
import { parse } from '../src/parser.ts';
import { formatFile, migrateFile } from '../src/formatter.ts';
import { compilerVersion } from '../src/package-manager.ts';
import { block, flow, paragraph, renderSpecTree, section, sequence, step } from '../src/spec-tree.ts';

const cli = resolve('bin/aug.mjs');
function project(files, action) {
  const root = mkdtempSync(join(tmpdir(), 'aug-spec-'));
  try {
    for (const [name, text] of Object.entries(files)) {
      const file=join(root,name); mkdirSync(dirname(file),{recursive:true}); writeFileSync(file,text);
    }
    return action(root);
  } finally { rmSync(root,{recursive:true,force:true}); }
}
function checked(root) {
  const project=loadProject(root), result=checkProject(project), discovery=discoverTests(project);
  const tests=checkUnitTests(project,discovery.tests);
  result.diagnostics.push(...discovery.diagnostics,...tests.flatMap(test=>test.checked.diagnostics));
  mergeTestAnalysis(result,tests);
  return result;
}
const valid = result => assert.deepEqual(result.diagnostics.filter(issue=>issue.severity!=='warning'),[]);
const command = (root,name,args=[]) => spawnSync(process.execPath,[cli,name,root,...args],{encoding:'utf8'});
const files = {
  'main.aug': 'import everything from service\nprint(value=compute(values=[1, 2]))\n',
  'service.aug': `/** Invalid input prevents a result. */
BadInput() implements Error {}
/** Sum valid values.
 * @param values Values to inspect.
 * @return The total.
 */
compute(List<int> values) returns int {
    total = 0
    for value in values {
        try { total = total + _positive(value) }
        catch BadInput error { total = total + 0 }
        always { pass }
    }
    while total < 3 { total = total + 1 }
    if not total == 0 and total > 0 { return total }
    else { return 0 }
}
_positive(int value) returns int unless BadInput {
    if value < 0 { throw BadInput() }
    return value
}
unused() returns int { return 77 }
test compute {
    when "valid values" {
        it "sums values" { assert(compute(values=[1, 2]) == 3) }
    }
}
`,
};

test('specs explain all local behavior and only the dependency surface used by wildcard consumers', () => project(files, root => {
  const result=checked(root); valid(result);
  const outputs=generateSpecs(result), main=outputs.find(output=>output.path===join(root,'main.aug.md')).text;
  const service=outputs.find(output=>output.path===join(root,'service.aug.md')).text;
  assert.match(main,/compute.*service\.aug\.md#symbol-compute/);
  assert.match(main,/through import everything/);
  assert.doesNotMatch(main,/_positive|unused|Sum valid values|For each/);
  for(const word of ['Values to inspect','Private to its defining scope','For each','While','Otherwise','Try','Catch','Always','Fail with','valid values','sums values'])assert.ok(service.includes(word),word);
  assert.match(service,/If `total` does not equal `0` and/);
  assert.ok(main.indexOf('## Startup')<main.indexOf('## Dependencies'));
  assert.equal(service.match(/Sum valid values\./g)?.length,1);
  assert.doesNotMatch(service,/Author documentation|What it does|In this file|Shared language rules|\n\n\n/);
  assert.match(main,/## Built-ins.*print/s);
}));

test('spec generation is byte deterministic across project locations and validates all offline links', () => {
  const example={...files,'main.aug':'import Console and SystemConsole from august.io\nimport everything from service\nimplement Console with SystemConsole\nresolve Console to console\nconsole.write(value=compute(values=[1,2]))\n'};
  const render=root=>{const result=checked(root);valid(result);return generateSpecs(result).map(output=>({path:relative(root,output.path),text:output.text}));};
  const first=project(example,render), second=project(example,render);
  assert.deepEqual(first,second);
  const map=new Map(first.map(output=>[resolve('/project',output.path),output.text]));
  for(const output of first)for(const match of output.text.matchAll(/\]\(([^)]+)\)/g)) {
    if(/^https:/.test(match[1]))continue;
    const [href,fragment]=match[1].split('#');
    const target=resolve(dirname(resolve('/project',output.path)),decodeURIComponent(href));
    if(target.endsWith('.aug.md')) {
      assert.ok(map.has(target),`Missing ${match[1]} from ${output.path}`);
      if(fragment)assert.ok(map.get(target).includes(`id="${decodeURIComponent(fragment)}"`),`Missing anchor ${match[1]}`);
    } else assert.ok(map.has(target)||Object.hasOwn(example,relative('/project',target)),`Missing source ${match[1]}`);
  }
});

test('comment-free code yields a readable local flow and ordered long expressions', () => project({
  'main.aug':'import address from links\nnumbers = List<int>(2, 4)\nprint(value=address(host="example.test", path="users"))\n',
  'links.aug':`address(string host, string path) returns string {
    location = "https://" + host + "/" + path + "?view=full"
    return location
}
`,
},root=>{
  const result=checked(root);valid(result);
  const outputs=generateSpecs(result),main=outputs.find(output=>output.path.endsWith('main.aug.md')).text;
  const links=outputs.find(output=>output.path.endsWith('links.aug.md')).text;
  assert.ok(main.indexOf('## Startup')<main.indexOf('## Dependencies'));
  assert.match(main,/Set `numbers` to a list of `int` containing `2`, `4`/);
  assert.match(main,/\[`address`\]\(links\.aug\.md#symbol-address\).*\(`host`: `string`, `path`: `string`\) → `string`/s);
  assert.match(links,/Join `"https:\/\/"`, `host`, `"\/"`, `path` and `"\?view=full"` to make `location`/);
  assert.doesNotMatch(links,/Author documentation|the result of call|\(\(\(/);
}));

test('spec --check detects source drift and never writes; successful native builds refresh specs', () => project(files, root => {
  let result=command(root,'spec');assert.equal(result.status,0,result.stderr);
  const file=join(root,'service.aug.md'), original=readFileSync(file,'utf8'), modified=statSync(file).mtimeMs;
  writeFileSync(join(root,'service.aug'),files['service.aug'].replace('return 77','return 78'));
  result=command(root,'spec',['--check','--json']);assert.equal(result.status,1,result.stderr);
  assert.ok(JSON.parse(result.stdout).stale.includes('service.aug.md'));
  assert.equal(readFileSync(file,'utf8'),original);assert.equal(statSync(file).mtimeMs,modified);
  result=command(root,'build');assert.equal(result.status,0,result.stderr);
  assert.match(readFileSync(file,'utf8'),/Return `78`/);
  assert.equal(command(root,'spec',['--check']).status,0);
}));

test('spec output protects handwritten neighbors and symlinks inside the project', () => project({'main.aug':'','main.aug.md':'Handwritten notes'}, root => {
  assert.throws(()=>updateSpecs(checked(root)),/handwritten/);
  assert.equal(readFileSync(join(root,'main.aug.md'),'utf8'),'Handwritten notes');
  rmSync(join(root,'main.aug.md'));
  symlinkSync(join(root,'main.aug'),join(root,'main.aug.md'));
  assert.throws(()=>updateSpecs(checked(root)),/symbolic link/);
  assert.equal(readFileSync(join(root,'main.aug'),'utf8'),'');
}));

test('comment requirements are configurable, include private helpers only under all, and inherit interface docs', () => project({
  'main.aug':'',
  'service.aug':`/** Read-only service. */
interface Service {
    /** Return one. */
    value() returns int
}
/** Concrete read-only service. */
Impl() implements Service {
    value() returns int { return self._one() }
    _one() returns int { return 1 }
}
`,
},root=>{
  valid(checked(root));
  writeFileSync(join(root,'main.yaml'),'spec:\n  require_comments: public\n');valid(checked(root));
  const text=generateSpecs(checked(root)).find(output=>output.path.endsWith('service.aug.md')).text;
  assert.equal(text.match(/Return one\./g).length,2);
  writeFileSync(join(root,'main.yaml'),'spec:\n  require_comments: all\n');
  assert.ok(checked(root).diagnostics.some(issue=>issue.code==='DOC'&&issue.message.includes('_one')));
  writeFileSync(join(root,'main.yaml'),'spec:\n  require_comments: sometimes\n');
  assert.ok(checked(root).diagnostics.some(issue=>issue.code==='CONFIG'));
}));

test('word operators bind comparisons before not and preserve short circuit and grouping natively', () => project({
  'main.aug':`print(value=not 1 == 0 and 2 > 1)
print(value=not (true and false))
print(value=false and read_file(path="absent") == "x")
print(value=true or read_file(path="absent") == "x")
print(value=not false == true)
`,
},root=>{
  // Root built-ins still have checked failures, even when a branch short-circuits.
  const source=readFileSync(join(root,'main.aug'),'utf8');
  writeFileSync(join(root,'main.aug'),source.replace('print(value=false and','try { print(value=false and').replace('print(value=not false == true)','} catch FileError error { print(value="unexpected") }\nprint(value=not false == true)'));
  const result=command(root,'run');assert.equal(result.status,0,result.stderr);
  assert.equal(result.stdout,'true\ntrue\nfalse\ntrue\ntrue\n');
  const state=loadProject(root),file=state.files.get(join(root,'main.aug'));
  const formatted=formatFile(state,file);assert.match(formatted,/not \(true and false\)/);
  assert.equal(parse(file.path,formatted).diagnostics.length,0);
}));

test('initialize establishes local class state and record validation with checked errors', () => project({
  'data.aug':`DomainError() implements Error {}
record Positive(int value) unless DomainError {
    initialize { if value < 1 { throw DomainError() } }
}
interface Count { read() returns int }
Counter(int initial to _count) implements Count {
    initialize { _count = _count + 1 }
    read() returns int { return _count }
}
record Empty() {}
`,
  'main.aug':`import Positive and DomainError and Counter from data
print(value=Counter(initial=4).read())
try { Positive(value=0) } catch DomainError error { print(value="rejected") }
`,
},root=>{
  const result=command(root,'run');assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'5\nrejected\n');
  const text=readFileSync(join(root,'data.aug.md'),'utf8');assert.match(text,/Counter\.initialize/);assert.match(text,/Construction can fail.*DomainError/);
}));

test('legacy spellings are rejected with a verified migration that retains semantics and comments', () => project({
  'service.aug':`interface Service { ok() returns bool }
Impl(int value) => { value = 2 } implements Service {
    /** Check the stored value. */
    ok() returns bool { return !(value == 0) && true || false }
}
Adapter() implements Service { ok() returns bool { return true } }
`,
  'main.aug':'import Service and Adapter from service\nbind Service to Adapter\nitem = resolve Service\nprint(value=item.ok())\n',
},root=>{
  const state=loadProject(root);
  assert.ok(state.diagnostics.filter(issue=>issue.code==='SYNTAX').length>=5);
  for(const file of state.files.values())if(!file.builtin&&!file.package) {
    const text=migrateFile(state,file);
    assert.doesNotMatch(text,/&&|\|\||=>|\bbind\b|= resolve/);
    writeFileSync(file.path,text);
  }
  valid(checked(root));
  const source=readFileSync(join(root,'service.aug'),'utf8');assert.match(source,/initialize/);assert.match(source,/Check the stored value/);
  assert.ok(parse('test.aug','print(value=1 != 2)').diagnostics.length===0);
}));

test('packed August libraries ship adjacent specs and precise-version offline dependencies', () => project({
  'aug-package.json':JSON.stringify({format:1,name:'@example/spec-library',version:'1.2.3',compiler:compilerVersion(),source:'src'}),
  'package.json':JSON.stringify({name:'@example/spec-library',version:'1.2.3',files:['src']}),
  'src/export.aug':'export add from math\n',
  'src/math.aug':'import Console from august.io\nadd(resolve Console console,int left,int right) returns int { return left + right }\n',
},root=>{
  const result=command(root,'pack');assert.equal(result.status,0,result.stderr);
  const tar=spawnSync('tar',['-tzf',result.stdout.trim()],{encoding:'utf8'});assert.equal(tar.status,0,tar.stderr);
  assert.match(tar.stdout,/package\/src\/math\.aug\.md/);
  assert.match(tar.stdout,/package\/src\/export\.aug\.md/);
  assert.match(tar.stdout,/package\/\.aug-spec\/manifest\.json/);
  assert.ok(tar.stdout.includes(`package/.aug-spec/august/${compilerVersion()}/io/contracts.aug.md`));
  assert.ok(existsSync(join(root,'src/math.aug.md')));
}));

test('optional values have exactly value or null; omission, explicit null, generics and narrowing agree', () => project({
  'values.aug':`record Note(optional string text)
describe(optional string text) returns string {
    if text != null { return text }
    return "none"
}
first(List<optional int> values) returns optional int unless IndexError { return values.get(index=0) }
`,
  'main.aug':`import Note and describe and first from values
import parse from august.json
print(value=describe())
print(value=describe(text=null))
print(value=describe(text="present"))
print(value=Note().text == Note(text=null).text)
try {
    List<optional int> values = [null, 7]
    print(value=first(values) == null)
    absent = parse(input="{}").decode<Note>()
    explicit = parse(input="{\\\"text\\\":null}").decode<Note>()
    print(value=absent == explicit)
    print(value=Json(value=absent).stringify())
    print(value=parse(input="{\\\"text\\\":null}").get(name="text") == null)
} catch JsonError error { print(value="invalid JSON") }
catch IndexError error { print(value="invalid index") }
`,
},root=>{
  const result=command(root,'run');assert.equal(result.status,0,result.stderr);
  assert.equal(result.stdout,'none\nnone\npresent\ntrue\ntrue\ntrue\n{"text":null}\ntrue\n');
  assert.match(readFileSync(join(root,'values.aug.md'),'utf8'),/omitted means null/);
}));

test('explanation tree keeps related steps together and renders nested control flow consistently', () => {
  const document=section('`sample.aug`',1,[
    section('`sample`',2,[
      paragraph('Explain the operation.'),
      flow([block('If the input is valid',[step('Save it.'),block('Otherwise',[step('Return null.')])]),
        sequence('Join the parts in order',['the host','the path'])]),
    ]),
  ]);
  assert.equal(renderSpecTree(document),
    '# `sample.aug`\n\n## `sample`\n\nExplain the operation.\n\n- If the input is valid:\n  - Save it.\n  - Otherwise:\n    - Return null.\n- Join the parts in order:\n  1. the host\n  2. the path\n');
});

test('long header chains become one ordered operation', () => project({
  'main.aug':`try {
    headers = Headers().with(name="first", value="1").with(name="second", value="2").with(name="third", value="3")
} catch HttpError error { pass }
`,
},root=>{
  const result=checked(root);valid(result);
  const text=generateSpecs(result).find(output=>output.path===join(root,'main.aug.md')).text;
  assert.match(text,/Set `headers` from a new `Headers` by adding these header fields in order:/);
  assert.match(text,/1\. `"first"` to `"1"`\n\s+2\. `"second"` to `"2"`\n\s+3\. `"third"` to `"3"`/);
  assert.doesNotMatch(text,/the result of `with` on the result of `with`/);
}));

test('Type? and missing are rejected; simple migration uses optional Type and null, conflicting old cases require a choice', () => project({
  'values.aug':'read(string? value) returns string { match value { when missing { return "none" } when some text { return text } } }\n',
  'main.aug':'',
},root=>{
  const state=loadProject(root),file=state.files.get(join(root,'values.aug'));
  assert.ok(state.diagnostics.some(issue=>issue.code==='SYNTAX'&&issue.message.includes('Type?')));
  const source=migrateFile(state,file);assert.match(source,/optional string/);assert.match(source,/when null/);assert.doesNotMatch(source,/\?|missing/);
  writeFileSync(file.path,source);valid(checked(root));
  const conflict=parse(file.path,'read(optional string? value) returns string { match value { when missing { return "missing" } when null { return "null" } when some text { return text } } }');
  assert.throws(()=>migrateFile(state,conflict.file),/Merge the old missing and null/);
}));
