import { prepareLibraryFixtures } from './library-fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, statSync, symlinkSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync as fixtureSpawnSync } from 'node:child_process';
import { loadProject as fixtureLoadProject } from '../src/project.ts';
import { checkProject } from '../src/checker.ts';
import { discoverTests, checkUnitTests, mergeTestAnalysis } from '../src/testing.ts';
import { generateSpecs, updateSpecs } from '../src/spec.ts';
import { parse } from '../src/parser.ts';
import { formatFile, migrateFile } from '../src/formatter.ts';
import { compilerVersion } from '../src/package-manager.ts';
import { action, attempt, branch, choice, flow, loop, paragraph, planFlow, renderSpecTree, scope, section, sequence, step } from '../src/spec-tree.ts';
import { updateSpecHints } from '../src/spec-hints.ts';

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
  for(const word of ['Values to inspect','Private to its defining scope','For each','while','otherwise','tries','raises','always','valid values','sums values'])assert.ok(service.toLowerCase().includes(word.toLowerCase()),word);
  assert.match(service,/if `total` does not equal `0` and/);
  assert.ok(main.indexOf('## Startup')<main.indexOf('## Dependencies'));
  assert.equal(service.match(/Sum valid values\./g)?.length,1);
  assert.doesNotMatch(service,/Author documentation|What it does|In this file|Shared language rules|\n\n\n/);
  assert.match(main,/Built-in operations follow.*language reference/);
  assert.doesNotMatch(service,/^\s*(?:-|\d+\.) /m,'generated behavior must be prose, without outline lists');
}));

test('literal record lists state fields once and retain every row in order', () => project({
  'main.aug': '',
  'data.aug': `record Forecast(string date, int temperature, string summary)
forecasts() {
  return [Forecast(date="Monday", temperature=1, summary="Cold"), Forecast(date="Tuesday", temperature=2, summary="Cool"), Forecast(date="Wednesday", temperature=3, summary="Mild")]
}
computed(int value) {
  return [Forecast(date="Monday", temperature=1, summary="Cold"), Forecast(date="Tuesday", temperature=2, summary="Cool"), Forecast(date="Wednesday", temperature=value, summary="Mild")]
}
`,
}, root => {
  const state=checked(root); valid(state);
  const spec=generateSpecs(state).find(output=>output.path===join(root,'data.aug.md')).text;
  assert.match(spec,/a list of 3 .*Forecast.*records, with `\(date, temperature, summary\)` values of `\("Monday", 1, "Cold"\)`.*`\("Tuesday", 2, "Cool"\)`.*`\("Wednesday", 3, "Mild"\)`, in that order/);
  assert.match(spec,/temperature.*`value`/,'computed inputs must keep their individual explanations');
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
  assert.match(main,/sets `numbers` to a list of `int` containing `2`, `4`/);
  assert.match(main,/uses \[`address`\]\(links\.aug\.md#symbol-address\) from `links`/);
  assert.doesNotMatch(main,/takes `host`|The result is|type parameters/,'dependency contracts are linked, not copied');
  assert.match(links,/takes `host` and `path` as strings/);
  assert.match(links,/builds `location` as the text `https:\/\/{host}\/{path}\?view=full`/);
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
  assert.match(readFileSync(file,'utf8'),/returns `78`/);
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
import parse from json
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
  assert.match(readFileSync(join(root,'values.aug.md'),'utf8'),/Omitted optional inputs are null/);
}));

test('explanation tree keeps related steps together and renders nested control flow consistently', () => {
  const document=section('`sample.aug`',1,[
    section('`sample`',2,[
      paragraph('Explain the operation.'),
      flow([branch('the input is valid',[action('set','`saved` to the input')],[action('return','null')]),
        sequence('Join the parts in order',['the host','the path'])]),
    ]),
  ]);
  assert.equal(renderSpecTree(document),
    '# `sample.aug`\n\n## `sample`\n\nExplain the operation. If the input is valid, it sets `saved` to the input. Otherwise, it returns null. Join the parts in order: the host and the path.\n');
});

test('long header chains become one ordered operation', () => project({
  'main.aug':`try {
    headers = Headers().with(name="first", value="1").with(name="second", value="2").with(name="third", value="3")
} catch HttpError error { pass }
`,
},root=>{
  const result=checked(root);valid(result);
  const text=generateSpecs(result).find(output=>output.path===join(root,'main.aug.md')).text;
  assert.match(text,/sets? `headers` from a `Headers` by adding these header fields in order:/);
  assert.match(text,/`"first"` to `"1"`, `"second"` to `"2"`, and `"third"` to `"3"`/);
  assert.doesNotMatch(text,/the result of `with` on the result of `with`/);
}));

test('prose planning preserves nested scopes, repeated effects and a source ledger through aggregation', () => {
  let identity=0;
  const fact=node=>({...node,source:'fact-'+identity++});
  const repeated=()=>fact(action('call','`audit`'));
  const body=[fact(loop('For each `item` in `items`',[
    fact(attempt([
      fact(branch('`ready` is true',[repeated(),repeated()],[fact(action('fail','with `BadInput`'))])),
    ],[{error:'`BadInput`',name:'`error`',children:[fact(action('set','`recovered` to true'))]}],
    [fact(action('call','`cleanup`'))])),
  ],'Repeat for each remaining item.')),
  fact(scope('While holding the lock on `shared`',[fact(action('set','`value` to `1`'))],'Release the lock on exit.')),
  fact(choice('`value`',[
    {condition:'If `value` is null',children:[fact(action('return','null'))]},
    {condition:'Otherwise',children:[fact(action('return','`value`'))]},
  ])),fact(action('call','`after`'))];
  const result=planFlow(body), prose=result.paragraphs.join('\n\n');
  assert.equal(new Set(result.sources).size,identity);
  assert.equal(result.sources.length,identity);
  assert.equal((prose.match(/calls `audit`/g)??[]).length,2,'identical calls are distinct effects');
  assert.match(prose,/if `ready` is true, it calls `audit`; then it calls `audit`\. Otherwise, it raises/);
  assert.ok(prose.indexOf('If this work raises `BadInput`')<prose.indexOf('always calls `cleanup`'));
  assert.ok(prose.indexOf('always calls `cleanup`')<prose.indexOf('After the loop'));
  assert.ok(prose.indexOf('Release the lock')<prose.indexOf('If `value` is null'));
  assert.match(prose,/Otherwise, it returns `value`\.\s+It calls `after`/);
  assert.doesNotMatch(prose,/This ends|execution continues|following steps|Repeat for each remaining/);
  assert.doesNotMatch(prose,/^\s*[-\d]+[. ]/m);
});

test('scope-free sentences keep negation, short circuit order and numeric grouping',()=>project({
  'main.aug':'import calculate from numbers\ntry { print(value=calculate(left=1, right=2)) } catch ArithmeticError error { pass }\n',
  'numbers.aug':`calculate(int left,int right) returns int unless ArithmeticError {
    if left == 1 or right == 2 or left == 3 { return left - (right - 1) }
    if not (left == 1 and right == 2) { return left / (right / 2) }
    return left + (right + 1)
}
`,
},root=>{
  const result=checked(root);valid(result);
  const text=generateSpecs(result).find(output=>output.path.endsWith('numbers.aug.md')).text;
  assert.match(text,/If `left` equals `1` or `right` equals `2` or `left` equals `3`, it returns `left` minus \(`right` minus `1`\)/);
  assert.match(text,/returns `left` divided by \(`right` divided by `2`\) if not \(.*and.*\)/);
  assert.match(text,/or `left` plus \(`right` plus `1`\) otherwise/);
}));

test('complete generated paragraphs read as concise explanations without contract or block boilerplate',()=>project({
  'main.aug':'import total and welcome from text\nprint(value=total(price=7, quantity=3))\nprint(value=welcome(name="Ada"))\n',
  'text.aug':`total(int price,int quantity) returns int {
    if quantity > 0 { return price * quantity }
    return 0
}
welcome(string name) returns string { return "Hello, " + name + "!" }
`,
},root=>{
  const result=checked(root);valid(result);
  const text=generateSpecs(result).find(output=>output.path.endsWith('text.aug.md')).text;
  const prose=text.split('\n').filter(line=>line&&!line.startsWith('#')&&!line.startsWith('<')).join('\n');
  assert.equal(prose,'It takes `price` and `quantity` as integers. It returns `price` times `quantity` if `quantity` is positive, or `0` otherwise.\nIt takes `name` as a string. It returns the text `Hello, {name}!`.');
  assert.doesNotMatch(text,/The caller supplies|The result is|It can use|the value from|This ends|execution continues|^\s*[-*] /m);
}));

test('grouped validations and repeated value generation preserve each source operation',()=>project({
  'main.aug':'import requireValid and BadInput from inputs\ntry { print(value=requireValid(value=3, mode="read")) } catch BadInput error { pass }\n',
  'inputs.aug':`BadInput() implements Error {}
requireValid(int value,string mode) returns int unless BadInput {
    if value < 0 { throw BadInput() }
    if mode != "read" and mode != "write" { throw BadInput() }
    return value
}
`,
},root=>{
  const result=checked(root);valid(result);
  const text=generateSpecs(result).find(output=>output.path.endsWith('inputs.aug.md')).text;
  assert.match(text,/checks that `value` is at least `0` and `mode` is either `"read"` or `"write"/);
  assert.equal((text.match(/at the first failed check/g)??[]).length,1);
  assert.match(text,/It returns `value`/);
  const nodes=['first','second','third'].map(name=>({...action('set','`'+name+'` to `create`'),source:name}));
  const plan=planFlow(nodes);
  assert.deepEqual(plan.sources,['first','second','third']);
  assert.deepEqual(plan.paragraphs,['It sets `first`, `second`, and `third` separately, each to `create`.']);
}));

test('plain HTTP and collection descriptions follow checked built-ins, not arbitrary operation names',()=>project({
  'main.aug':`import FakeCrypto from fake
value = FakeCrypto().random(size=7)
try {
    numbers = [1,2]
    borrow numbers { numbers.append(value=3) }
    print(value=numbers.get(index=1))
} catch IndexError error { pass }
`,
  'fake.aug':`interface Crypto { random(int size) returns int }
FakeCrypto() implements Crypto { random(int size) returns int { return size } }
endpoint GET "/failure" as failure() returns HttpResponse<string> { return HttpResponse(body="No such item", status=404) }
endpoint GET "/page" as page(int number from query) returns int { return number }
`,
},root=>{
  const result=checked(root);valid(result);
  const specs=generateSpecs(result), main=specs.find(output=>output.path.endsWith('main.aug.md')).text, fake=specs.find(output=>output.path.endsWith('fake.aug.md')).text;
  assert.match(main,/appends `3` to `numbers`/);
  assert.match(main,/prints the item at index `1` in `numbers`/);
  assert.doesNotMatch(main,/random bytes|the value from/);
  assert.match(fake,/It returns HTTP 404 with `"No such item"`/);
  assert.match(fake,/It parses `number` as `int`/);
  assert.equal((fake.match(/Unhandled request failures/g)??[]).length,1,'shared HTTP behavior is explained once per file');
  assert.doesNotMatch(fake,/a new `HttpResponse`|\(`body`/);
}));

test('spec pointers are idempotent, preserve comments and CRLF, refresh after renames and never enter the removable manifest',()=>project({
  'main.aug':'// Handwritten context.\r\nprint(value=7)\r\n',
},root=>{
  const path=join(root,'main.aug'), original=readFileSync(path,'utf8');
  const preview=updateSpecs(checked(root),true);
  assert.ok(preview.stale.includes('main.aug'));assert.equal(readFileSync(path,'utf8'),original);
  updateSpecs(checked(root));
  const hinted=readFileSync(path,'utf8');
  assert.match(hinted,/^\/\/ aug-spec: "main\.aug\.md".*Read it before changes.*\r\n/);
  assert.equal(hinted.slice(hinted.indexOf('\n')+1),original);
  const manifest=readFileSync(join(root,'.aug-spec/manifest.json'),'utf8');
  assert.ok(!JSON.parse(manifest).files.includes('main.aug'));
  assert.deepEqual(updateSpecs(checked(root),true).stale,[]);
  updateSpecs(checked(root));assert.equal(readFileSync(path,'utf8'),hinted);
  assert.equal(readFileSync(join(root,'.aug-spec/manifest.json'),'utf8'),manifest);
  writeFileSync(join(root,'renamed.aug'),hinted.replace('print(value=7)','example() returns int { return 7 }'));
  updateSpecs(checked(root));
  const renamed=readFileSync(join(root,'renamed.aug'),'utf8');
  assert.match(renamed,/^\/\/ aug-spec: "renamed\.aug\.md"/);
  assert.equal((renamed.match(/\/\/ aug-spec:/g)??[]).length,1);
  assert.match(readFileSync(join(root,'renamed.aug.md'),'utf8'),/source\]\(renamed\.aug#L3\)/);
}));

test('native preparation reparses pointers before source maps and rejects changed sources without overwriting them',()=>project({
  'main.aug':'print(value=7)\n',
},root=>{
  const first=checked(root), refreshed=updateSpecHints(first), path=join(root,'main.aug');
  assert.equal(first.project.files.get(path).items[0].span.line,1);
  assert.equal(refreshed.project.files.get(path).items[0].span.line,2);
  assert.equal(updateSpecHints(refreshed),refreshed);
  const disk=readFileSync(path,'utf8').replace('7','8');writeFileSync(path,disk);
  // Remove the managed line in the older checked view to force pointer preparation.
  first.project.files.get(path).source='print(value=7)\n';
  assert.throws(()=>updateSpecHints(first),/Source changed during compilation/);
  assert.equal(readFileSync(path,'utf8'),disk);
}));

test('dependency prose resolves foreign generic constraints and checked errors, and type parameters shadow named types',()=>project({
  'main.aug':'import describe and T from contract\ntry { print(value=describe(value=T())) } catch Error error { pass }\n',
  'contract.aug':`interface Named { name() returns string }
Failure() implements Error {}
T() implements Named { name() returns string { return "named" } }
describe<T implements Named>(T value) returns string unless Failure { return value.name() }
interface Box<T> { read() returns T }
IntBox(int value) implements Box<int> { read() returns int { return value } }
`,
},root=>{
  const result=checked(root);valid(result);
  const specs=generateSpecs(result), main=specs.find(output=>output.path.endsWith('main.aug.md')).text;
  const contract=specs.find(output=>output.path.endsWith('contract.aug.md')).text;
  assert.match(main,/\[`describe`\]\(contract\.aug\.md#symbol-describe\)/);
  assert.doesNotMatch(main,/must satisfy|Failures can raise/,'the importing file links the contract');
  const describe=contract.split('## `describe`')[1].split('<a id="symbol-Box">')[0];
  assert.match(describe,/`value` as `T`/);
  assert.match(describe,/must satisfy \[`Named`\]\(contract\.aug\.md#symbol-Named\)/);
  assert.match(describe,/Failures can raise \[`Failure`\]\(contract\.aug\.md#symbol-Failure\)/);
  assert.doesNotMatch(describe,/\[`T`\]/);
  assert.match(describe,/\[`value.name`\]\(contract\.aug\.md#symbol-Named.name\)/);
  assert.match(contract,/implements \[`Box<int>`\]\(contract\.aug\.md#symbol-Box\)/);
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

function spawnSync(command, args, options) {
  if (args?.[0]?.endsWith("aug.mjs") && args[2]) prepareLibraryFixtures(args[2]);
  return fixtureSpawnSync(command, args, options);
}

function loadProject(root, ...args) { prepareLibraryFixtures(root); return fixtureLoadProject(root, ...args); }


test('owned bindings explain their types and ordered calls once, including nested cleanup', () => project({
  'main.aug': 'import exercise from resources\nexercise()\n',
  'resources.aug': `interface Resource {}
  Item() implements Resource {}
  acquire() returns own Item { return Item() }
  exercise() {
    own Item first = acquire()
    scope {
      own Item second = acquire()
    }
  }
  `,
}, root => {
  const state=checked(root); valid(state);
  const text=generateSpecs(state).find(output=>output.path===join(root,'resources.aug.md')).text;
  const body=text.slice(text.indexOf('## `exercise`'));
  assert.match(body,/calls .*acquire.* and stores the result in owned `first` \(.*Item.*\)/);
  assert.match(body,/calls .*acquire.* and stores the result in owned `second` \(.*Item.*\)/);
  assert.ok(body.indexOf('owned `first`')<body.indexOf('owned `second`'));
  assert.equal((body.match(/stores /g)??[]).length,2);
  assert.doesNotMatch(body,/owns this value/);
}));
