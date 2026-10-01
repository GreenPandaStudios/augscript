import { prepareLibraryFixtures } from './library-fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { spawnSync as fixtureSpawnSync } from 'node:child_process';

const cli = resolve('bin/aug.mjs');
function withProject(files, action) {
  const root = mkdtempSync(join(tmpdir(), 'aug-web-foundation-'));
  try {
    for (const [name, source] of Object.entries(files)) {
      const path = join(root, name);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, source);
    }
    action(root);
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test('immutable data rejects mutable aliases hidden in nested literals and generic records', () => withProject({
  'data.aug': 'record Envelope<T implements Data>(T value)\nrecord Nested(List<List<int>> items)\n',
  'main.aug': '',
}, root => {
  for (const construction of ['Envelope<List<int>>(value=items)', 'Nested(items=[items])', 'Json(value=[items])']) {
    writeFileSync(join(root, 'main.aug'), 'import Envelope and Nested from data\nitems = [1]\nvalue = ' + construction + '\n');
    const result = spawnSync(process.execPath, [cli, 'check', root], {encoding:'utf8'});
    assert.notEqual(result.status, 0, construction); assert.match(result.stderr, /Freeze/);
  }
}));

test('server components embed checked HTML and escape interpolated text and attributes', () => withProject({
  'pages.aug': `Layout(string title, List<Html> children) returns Html:
    return <main><h1>{title}</h1>{children}</main>
Page(string name) returns Html:
    return <Layout title={name}><p>Hello {name}</p><input name="login" value={name} required /></Layout>
`,
  'main.aug': `import Page from pages
print(value=Page(name="<script> & \\\""))
`,
}, root => {
  let result = spawnSync(process.execPath, [cli, 'run', root], {encoding:'utf8'});
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '<main><h1>&lt;script&gt; &amp; &quot;</h1><p>Hello &lt;script&gt; &amp; &quot;</p><input name="login" value="&lt;script&gt; &amp; &quot;" required></main>\n');
  writeFileSync(join(root, 'pages.aug'), 'Page(string name) returns Html:\n    return <a href="javascript:alert(1)">bad</a>\n');
  result = spawnSync(process.execPath, [cli, 'check', root], {encoding:'utf8'});
  assert.notEqual(result.status, 0); assert.match(result.stderr, /Executable URL/);
}));

test('Shared state grants mutation only inside a lock and forbids I/O while locked', () => withProject({
  'main.aug': `data = Shared(value=Map<string,int>())
lock data as state:
    state.set(key="apples", value=7)
lock data as state:
    value = state.take(key="apples")
    match value:
        when null:
            pass
        when some number:
            print(value=number)
`,
}, root => {
  let result = spawnSync(process.execPath, [cli, 'check', root], {encoding:'utf8'});
  assert.notEqual(result.status, 0); assert.match(result.stderr, /Release the lock/);
  writeFileSync(join(root, 'main.aug'), `data = Shared(value=Map<string,int>())
value = 0
lock data as state:
    state.set(key="apples", value=7)
    match state.take(key="apples"):
        when null:
            pass
        when some number:
            value = number
print(value=value)
`);
  result = spawnSync(process.execPath, [cli, 'run', root], {encoding:'utf8'});
  assert.equal(result.status, 0, result.stderr); assert.equal(result.stdout, '7\n');
}));

test('same-name arguments use their labels, independent of parameter order', () => withProject({
  'operations.aug': `subtract(int left, int right) returns int:
    return left - right
`,
  'main.aug': `import subtract from operations
int left = 9
int right = 4
print(value=subtract(right, left))
`,
}, root => {
  const result = spawnSync(process.execPath, [cli, 'run', root], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '5\n');
}));

test('private class state initializes without appearing in constructor inputs', () => withProject({
  'counter.aug': `interface Count:
    increment() changes self
    value() returns int

Counter() implements Count:
    mutable int _count = 0

    increment() changes self:
        _count = _count + 1

    value() returns int:
        return _count
`,
  'main.aug': `import Counter from counter
counter = Counter()
borrow counter:
    counter.increment()
print(value=counter.value())
`,
}, root => {
  const result = spawnSync(process.execPath, [cli, 'run', root], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '1\n');
}));

test('crypto capability hashes bytes and verifies native RSA signatures', () => withProject({
  'main.aug': `import Crypto and GnuTlsCrypto from crypto
implement Crypto with GnuTlsCrypto
resolve Crypto to crypto
try:
    input = "abc".bytes()
    digest = crypto.sha256(input)
    print(value=digest.base64url())
    key = crypto.generateRsa()
    signature = crypto.signRsa(key, input)
    publicKey = crypto.publicRsa(key)
    print(value=crypto.verifyRsa(publicKey, input, signature))
    input = "changed".bytes()
    print(value=crypto.verifyRsa(publicKey, input, signature))
catch CryptoError error:
    print(value="crypto failed")
`,
}, root => {
  const result = spawnSync(process.execPath, [cli, 'run', root], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0\ntrue\nfalse\n');
}));

test('typed JSON preserves integer precision, validates records, and escapes strings', () => withProject({
  'data.aug': `record Profile(string name, int id)
`,
  'main.aug': `import parse from json
import Profile from data
try:
    json = parse(input="{\\\"name\\\":\\\"Ada <script>\\\",\\\"id\\\":9223372036854775807}")
    profile = json.decode<Profile>()
    print(value=profile.name)
    print(value=profile.id)
    print(value=json.stringify())
catch JsonError error:
    print(value="invalid")
`,
}, root => {
  const result = spawnSync(process.execPath, [cli, 'run', root], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'Ada <script>\n9223372036854775807\n{"name":"Ada <script>","id":9223372036854775807}\n');
}));

test('optional JSON fields unify omitted input and null, and preserve a present value', () => withProject({
  'data.aug': `record Patch(optional string name)
describe(Patch input) returns string:
    match input.name:
        when null:
            return "null"
        when some value:
            return value
`,
  'main.aug': `import parse from json
import Patch and describe from data
try:
    print(value=describe(input=parse(input="{}").decode<Patch>()))
    print(value=describe(input=parse(input="{\\\"name\\\":null}").decode<Patch>()))
    print(value=describe(input=Patch(name="Ada")))
catch JsonError error:
    print(value="invalid")
`,
}, root => {
  const result = spawnSync(process.execPath, [cli, 'run', root], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'null\nnull\nAda\n');
}));

test('freeze shares collection data with records and removes mutation rights from every alias', () => withProject({
  'data.aug': `record Inventory(List<int> items)
`,
  'main.aug': `import Inventory from data
items = [1, 2]
alias = items
freeze items as saved
inventory = Inventory(items=saved)
print(value=alias.length())
print(value=inventory.items.length())
`,
}, root => {
  let result = spawnSync(process.execPath, [cli, 'run', root], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '2\n2\n');
  writeFileSync(join(root, 'main.aug'), readFileSync(join(root, 'main.aug'), 'utf8') + 'borrow alias:\n    alias.append(value=3)\n');
  result = spawnSync(process.execPath, [cli, 'check', root], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /frozen|read-only/i);
}));

function spawnSync(command, args, options) {
  if (args?.[0]?.endsWith("aug.mjs") && args[2]) prepareLibraryFixtures(args[2]);
  return fixtureSpawnSync(command, args, options);
}
