import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { SemanticWorkspace } from '../src/semantic.ts';
const cli = resolve('bin/aug.mjs');
function create(files) {
  const root = mkdtempSync(join(tmpdir(), 'aug-tools-'));
  for (const [name, text] of Object.entries(files)) { const path = join(root, name); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); }
  return root;
}
const command = (root, name, args = []) => spawnSync(process.execPath, [cli, name, root, ...args], { encoding: 'utf8' });

test('web editor help and context preserve wire sources, literal policies and endpoint tests',()=>{
  const source=`[Cors(origins=["https://example.test"], credentials=true)]
[Timeout(milliseconds=100)]
/** Find one user by their public identifier. */
endpoint GET "/users/{id}" as user(int id from path) returns int:
    return id
test endpoint user client:
    when routing:
        it found:
            response = client.request(method="GET", path="/users/7")
            assert(condition=response.status == 200)
`;
  const root=create({'main.aug':'','api.aug':source});
  try {
    const workspace=new SemanticWorkspace(root),view=workspace.document(join(root,'api.aug'));
    assert.deepEqual(view.diagnostics,[]);
    assert.match(view.hover(source.indexOf('milliseconds')).documentation,/deadline/);
    assert.match(view.hover(source.indexOf('user(int')).detail,/endpoint GET/);
    assert.ok(view.complete(source.indexOf('credentials')).some(item=>item.label==='credentials'));
    const fact=view.describe().contracts.find(item=>item.name==='user');
    assert.deepEqual(fact.callables[0].http,{method:'GET',path:'/users/{id}',status:200,streaming:false,errors:[]});
    assert.deepEqual(fact.callables[0].inputs[0].source,{kind:'path',name:undefined});
    assert.deepEqual(fact.callables[0].policies.map(policy=>[policy.name,policy.order]),[['Cors',1],['Timeout',2]]);
    assert.equal(fact.tests[0].name,'found');
  } finally {rmSync(root,{recursive:true,force:true});}
});

test('immutable semantic revisions cache import closures and ignore unfinished composition', () => {
  const root = create({ 'main.aug': "resolve Missing to broken\n", 'math.aug': 'value() returns int { return 2 }\n',
    'worker.aug': 'import value from math\nread() returns int { return value() }\n', 'unrelated.aug': 'other() {}\n' });
  try {
    const workspace = new SemanticWorkspace(root), path = join(root, 'worker.aug');
    const first = workspace.document(path);
    assert.deepEqual(first.diagnostics, []);
    assert.equal(workspace.document(path), first);
    workspace.document(join(root, 'unrelated.aug'), { text: 'other() returns int { return 3 }', version: 2 });
    assert.equal(workspace.document(path), first);
    workspace.document(join(root, 'math.aug'), { text: 'value() returns string { return "pear" }', version: 3 });
    const changed = workspace.document(path);
    assert.notEqual(changed.revision, first.revision);
    assert.ok(changed.diagnostics.some(issue => /Expected return int, got string/.test(issue.message)));
    assert.deepEqual(first.diagnostics, []);
    workspace.document(join(root, 'math.aug'), { text: 'value() returns int { return 9 }', version: 1 });
    assert.equal(workspace.document(path), changed);
    assert.ok(workspace.stats.cacheHits >= 3);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('persistent LSP handles split UTF-8 frames, local edits, definitions and cached revisions', async () => {
  const root = create({ 'main.aug': 'resolve Missing to absent', 'math.aug': 'value() returns int { return 2 }\n' });
  const child = spawn(process.execPath, [cli, 'lsp', root], { stdio: ['pipe', 'pipe', 'pipe'] });
  let bytes = Buffer.alloc(0), sequence = 0, stderr = '';
  const pending = new Map();
  child.stderr.on('data', chunk => stderr += chunk);
  child.stdout.on('data', chunk => {
    bytes = Buffer.concat([bytes, chunk]);
    while (true) {
      const end = bytes.indexOf('\r\n\r\n'); if (end < 0) return;
      const length = Number(/Content-Length:\s*(\d+)/i.exec(bytes.subarray(0, end).toString())[1]);
      if (bytes.length < end + 4 + length) return;
      const message = JSON.parse(bytes.subarray(end + 4, end + 4 + length)); bytes = bytes.subarray(end + 4 + length);
      if (message.id !== undefined) { const handle = pending.get(message.id); pending.delete(message.id); handle?.(message); }
    }
  });
  const request = (method, params) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => reject(new Error(`LSP timeout: ${method}; ${stderr}`)), 10000);
    pending.set(id, message => { clearTimeout(timer); message.error ? reject(new Error(message.error.message)) : resolve(message.result); });
    const body = Buffer.from(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
    const packet = Buffer.concat([Buffer.from(`Content-Length: ${body.length}\r\n\r\n`), body]);
    child.stdin.write(packet.subarray(0, 13)); child.stdin.write(packet.subarray(13));
  });
  try {
    const capabilities = (await request('initialize', { capabilities: {} })).capabilities;
    assert.equal(capabilities.textDocumentSync.change, 1);
    assert.equal(capabilities.inlayHintProvider, true);
    const uri = pathToFileURL(join(root, 'worker.aug')).href;
    const source = 'import value from math\n/** Café 🍐. */\nread() { return value() }\n';
    const issues = await request('aug/editor', { uri, text: source, version: 4, command: 'diagnostics' }); assert.deepEqual(issues, []);
    const hints = await request('textDocument/inlayHint', {textDocument:{uri},range:{start:{line:2,character:0},end:{line:3,character:0}}});
    assert.equal(hints[0].label, 'returns int');
    assert.deepEqual(hints[0].position, {line:2,character:6});
    const target = await request('aug/editor', { uri, command: 'definition', offset: source.lastIndexOf('value()') });
    assert.equal(target.file, join(root, 'math.aug'));
    const before = await request('aug/stats', {});
    await request('textDocument/hover', { textDocument: { uri }, position: { line: 2, character: 1 } });
    const after = await request('aug/stats', {}); assert.equal(after.analyses, before.analyses); assert.ok(after.cacheHits > before.cacheHits);
    const stale = await request('aug/editor', { uri, text: 'invalid edit', version: 1, command: 'diagnostics' }); assert.deepEqual(stale, []);
    await request('shutdown', {});
  } finally { child.kill(); rmSync(root, { recursive: true, force: true }); }
});

test('coverage records executed and unexecuted lines; native builds write source metadata', () => {
  const root = create({ 'main.aug': '', 'math.aug': `choose(bool left) returns int:
    if left:
        return 1
    return 2
test choose:
    when positive:
        it true_branch:
            assert(choose(left=true) == 1)
` });
  try {
    const result = command(root, 'test', ['--coverage', '--json']); assert.equal(result.status, 0, result.stderr || result.stdout);
    const coverage = JSON.parse(result.stdout).coverage;
    assert.ok(coverage.covered > 0 && coverage.covered < coverage.executable, result.stdout);
    assert.ok(coverage.files[0].lines.some(line => line.line === 4 && line.count === 0));
    assert.ok(existsSync(join(root, '.aug-build', 'coverage', 'lcov.info')));
    const build = command(root, 'build', ['--json']); assert.equal(build.status, 0, build.stderr);
    const output = JSON.parse(build.stdout); assert.ok(existsSync(output.sourceMap));
    assert.match(readFileSync(join(root, '.aug-build', 'program.c'), 'utf8'), /#line 3 ".*math\.aug"/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('FFI widths, narrowing errors and native benchmark reports are explicit', () => {
  const root = create({ 'native.aug': 'extern C abs(c_int value) returns c_int\nabsolute(int value) returns int uses C.abs unless ConversionError { unsafe { return abs(value=c_int(value=value)) } }\n',
    'main.aug': `import absolute from native
try:
    print(value=absolute(value=-7))
    absolute(value=2147483648)
catch ConversionError error:
    print(value="overflow")
` });
  try {
    const result = command(root, 'run'); assert.equal(result.status, 0, result.stderr); assert.equal(result.stdout, '7\noverflow\n');
    const report = command(root, 'bench', ['--iterations', '3', '--warmup', '1', '--json']); assert.equal(report.status, 0, report.stderr);
    const stats = JSON.parse(report.stdout); assert.equal(stats.samples.length, 3); assert.ok(stats.median > 0); assert.equal(stats.includesProcessStartup, true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('native diagnostics point back to a foreign declaration and architecture snapshots show public changes', () => {
  const root = create({ 'main.aug': '', 'foreign.aug': 'extern C stdin() returns int\n', 'math.aug': 'value() returns int { return 1 }\n' });
  try {
    const native = command(root, 'build', ['--json']); assert.equal(native.status, 1, native.stdout);
    assert.match(readFileSync(join(root,'foreign.aug'),'utf8'),/^\/\/ aug-spec:/);
    assert.ok(JSON.parse(native.stdout).some(issue => issue.code === 'NATIVE' && issue.file.endsWith('/foreign.aug') && issue.line === 2), native.stderr || native.stdout);
    const baseline = command(root, 'explain', ['--file', join(root, 'math.aug'), '--json']); assert.equal(baseline.status, 0);
    writeFileSync(join(root, 'before.json'), baseline.stdout);
    writeFileSync(join(root, 'math.aug'), 'value() returns int { return 1 }\nother() returns int { return 2 }\n');
    const changed = command(root, 'explain', ['--file', join(root, 'math.aug'), '--baseline', join(root, 'before.json'), '--json']);
    const delta = JSON.parse(changed.stdout).changes[0]; assert.deepEqual(delta.addedPublic, ['other']); assert.ok(delta.memberGrowth > 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('dependency and checked-error fixes produce valid local and whole-project contracts', () => {
  const root = create({
    'store.aug': 'interface Store {}\nStoreImpl() implements Store {}\n',
    'service.aug': "import Store from store\nread() returns Store { resolve Store to service; return service }\n",
    'math.aug': 'first() returns int unless FileError { values = [1]; return values.get(index=0) }\n',
    'main.aug': 'import Store and StoreImpl from store\nimport read from service\nimport first from math\nimplement Store with StoreImpl\nvalue = read()\ntry { print(value=first()) } catch Error error { print(value="failed") }\n',
  });
  try {
    const workspace = new SemanticWorkspace(root);
    for (const [path, title] of [['service.aug', 'Lift Store into the dependency header'], ['math.aug', 'Propagate IndexError with unless']]) {
      const view = workspace.document(join(root, path));
      const fix = view.fixes().find(fix => fix.title === title); assert.ok(fix, JSON.stringify(view.fixes()));
      let source = view.source;
      for (const edit of [...fix.edits].sort((left, right) => right.start - left.start)) source = source.slice(0, edit.start) + edit.text + source.slice(edit.end);
      writeFileSync(join(root, path), source);
    }
    const checked = command(root, 'check', ['--json']); assert.equal(checked.status, 0, checked.stdout || checked.stderr);
    const run = command(root, 'run'); assert.equal(run.status, 0, run.stderr); assert.equal(run.stdout, '1\n');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('inline and multiline documentation tags validate public labels, returns and effective errors', () => {
  const root = create({ 'main.aug': '', 'bad.aug': `interface Value { read() returns int }
/** A field. @param _storage Private spelling is not the public label. */
Box(int input to _storage) implements Value { read() returns int { return _storage } }
/** No result.
 * @return Invalid void documentation.
 * @throws FileError Absent from the signature.
 */
empty() {}
` });
  try {
    const result = command(root, 'check', ['--json']); assert.equal(result.status, 1);
    const issues = JSON.parse(result.stdout);
    for (const fragment of ['@param _storage', '@return requires', '@throws FileError']) assert.ok(issues.some(issue => issue.code === 'DOC' && issue.message.includes(fragment)), result.stdout);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('formatting empty indentation bodies retains following declaration documentation', () => {
  const root = create({ 'main.aug': '', 'main.yaml': 'block_style: indent\nindentation: tabs\n',
    'data.aug': 'interface Marker:\n\tpass\n/** A validation error. */\nFailure() implements Error:\n\tpass\n/** Preserve this callable description.\n * @param amount Value to double.\n * @return Doubled value.\n */\ndouble(int amount) returns int:\n\treturn amount * 2\n' });
  try {
    const formatted = command(root, 'format', ['--write']); assert.equal(formatted.status, 0, formatted.stderr);
    const check = command(root, 'check'); assert.equal(check.status, 0, check.stderr);
    const file = join(root, 'data.aug'), source = readFileSync(file, 'utf8');
    const view = new SemanticWorkspace(root).document(file);
    assert.match(view.hover(source.indexOf('double(int')).documentation, /Preserve this callable description/);
    const again = command(root, 'format', ['--json']); assert.equal(again.status, 0, again.stderr);
    assert.equal(JSON.parse(again.stdout).find(entry => entry.file === file).text, source);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('formatting long nested calls wraps source and remains stable in both block styles', () => {
  for(const style of ['indent', 'braces']) {
    const root=create({'main.aug':'', 'main.yaml':`block_style: ${style}\n`, 'data.aug': `record Forecast(string date, int temperatureC, int temperatureF, string summary)
forecasts() {
  return [Forecast(date="2026-01-01", temperatureC=0, temperatureF=32, summary="Below freezing temperatures"), Forecast(date="2026-01-02", temperatureC=10, temperatureF=50, summary="Cool"), Forecast(date="2026-01-03", temperatureC=20, temperatureF=68, summary="Mild")]
}
`});
    try {
      const formatted=command(root,'format',['--write']); assert.equal(formatted.status,0,formatted.stderr);
      const file=join(root,'data.aug'),source=readFileSync(file,'utf8');
      assert.match(source,/return \[\n\s+Forecast\(/);
      assert.match(source,/Forecast\(\n\s+date=/);
      assert.ok(source.split('\n').every(line=>line.length<=90),source);
      const check=command(root,'check',['--json']); assert.equal(check.status,0,check.stdout||check.stderr);
      const again=command(root,'format',['--json']); assert.equal(again.status,0,again.stderr);
      assert.equal(JSON.parse(again.stdout).find(entry=>entry.file===file).text,source);
    } finally {rmSync(root,{recursive:true,force:true});}
  }
});

test('context describes rejection layers, generic contracts and stable public surfaces', () => {
  const root = create({ 'main.aug': '', 'values.aug': `Failure() implements Error {}
interceptor Validate<T> {
    around(int amount) returns T unless Failure { if amount < 0 { throw Failure() }; return next() }
}
interceptor Constant { around(int amount) returns int { /* next() is deliberately skipped. */ return 7 } }
[Validate]
positive(int amount) returns int { return amount }
[Constant]
constant(int amount) returns int { return amount }
interface Named { name() returns string }
describe<T implements Named>(T value) returns string { return value.name() }
interface Producer<out T> { read() returns T }
interface Value { read() returns int }
Box(int input to _storage) implements Value { read() returns int { return _storage } }
` });
  try {
    const file = join(root, 'values.aug');
    const initial = new SemanticWorkspace(root).document(file).describe({ budget: 40000 });
    const positive = initial.contracts.find(fact => fact.name === 'positive').callables[0];
    assert.equal(positive.interceptors[0].delegates, true); assert.equal(positive.interceptors[0].mayShortCircuit, true);
    assert.equal(initial.contracts.find(fact => fact.name === 'constant').callables[0].interceptors[0].delegates, false);
    assert.equal(initial.contracts.find(fact => fact.name === 'Producer').genericParameters[0].variance, 'out');
    assert.deepEqual(initial.contracts.find(fact => fact.name === 'describe').callables[0].genericParameters[0].constraints, ['Named']);
    writeFileSync(file, readFileSync(file, 'utf8').replaceAll('_storage', '_value'));
    const changed = new SemanticWorkspace(root).document(file).describe({ budget: 40000, baseline: initial });
    assert.deepEqual(changed.changes, [], 'Private implementation renames are not public interface changes');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
