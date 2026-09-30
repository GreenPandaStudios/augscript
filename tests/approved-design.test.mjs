import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const cli = resolve('bin/aug.mjs');
function project(files, action) {
  const root = mkdtempSync(join(tmpdir(), 'aug-approved-'));
  try {
    for (const [name, source] of Object.entries(files)) {
      mkdirSync(dirname(join(root, name)), { recursive: true });
      writeFileSync(join(root, name), source);
    }
    action(root);
  } finally { rmSync(root, { recursive: true, force: true }); }
}
const command = (root, name, args = [], input) => spawnSync(process.execPath,
  [cli, name, root, ...args], { encoding: 'utf8', input });
const runs = (files, output) => project(files, root => {
  const result = command(root, 'run');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, output);
});

test('records, destructuring, snapshot iteration and checked matching run natively', () => runs({
  'data.aug': `record Point(int x, int y)
record Box<T implements Data>(T value)
describe(optional bool value) returns string:
    match value:
        when null:
            return "absent"
        when some present:
            match present:
                when true:
                    return "yes"
                when false:
                    return "no"
`,
  'main.aug': `import Point and Box and describe from data
point = Point(y=2, x=1)
print(value=point == Point(x=1, y=2))
print(value={point, Point(x=1, y=2)}.length())
(left, right) = (3, "pear")
print(value=left)
print(value=right)
for (key, value) in {1: "apple", 2: "pear"}:
    print(value=value)
items = [1, 2]
for item in items:
    borrow items:
        items.append(value=3)
print(value=items.length())
print(value=describe(value=null))
print(value=describe(value=true))
print(value=describe(value=false))
`,
}, 'true\n1\n3\npear\napple\npear\n4\nabsent\nyes\nno\n'));

test('stateful DI is fresh by default, scopes cache locally, and compositions are imported explicitly', () => runs({
  'counter.aug': `interface Counter:
    increment() changes self
    count() returns int
CounterImpl() implements Counter:
    increment() changes self:
        pass
    count() returns int:
        return 0
composition Counters:
    implement Counter with CounterImpl
`,
  'main.aug': `import Counter and CounterImpl and Counters from counter
include Counters
resolve Counter to left
resolve Counter to right
print(value=left == right)
`,
}, 'false\n'));

test('same-file function suites use explicit imported fixtures and independent parameter rows', () => project({
  'main.aug': '',
  'fixtures.aug': 'fixture seven() returns int { return 7 }\n',
  'math.aug': `import seven from fixtures
add(int left, int right) returns int { return left + right }
test add:
    when examples:
        it adds for (left, right, expected) in [(1, 2, 3), (4, 3, 7)]:
            assert(add(right=right, left=left) == expected)
        it fixture:
            assert(add(left=seven(), right=0) == 7)
`,
}, root => {
  const result = command(root, 'test', ['--json']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(JSON.parse(result.stdout).passed, 3);
}));

test('formatting preserves comments and uses the configured canonical syntax', () => project({
  'main.yaml': 'block_style: indent\nindentation: tabs\nassignment: to\n',
  'math.aug': '/** Add two values.\n * @param left Left input.\n * @param right Right input.\n * @return The sum.\n */\nadd(int left,int right) returns int { return left+right; }\n',
  'main.aug': 'import everything from math;\n// Visible startup\nint value=add(right=2,left=1); print(value=value);\n',
}, root => {
  const formatted = command(root, 'format', ['--write']); assert.equal(formatted.status, 0, formatted.stderr);
  const second = command(root, 'format', ['--json']); assert.equal(second.status, 0, second.stderr);
  const files = JSON.parse(second.stdout);
  assert.match(files.find(file => file.file.endsWith('/main.aug')).text, /import everything from math\n\/\/ Visible startup\nint value to/);
  assert.match(files.find(file => file.file.endsWith('/math.aug')).text, /add\(int left, int right\) returns int:\n\treturn left \+ right/);
  const result = command(root, 'run'); assert.equal(result.status, 0, result.stderr); assert.equal(result.stdout, '3\n');
}));

test('module policy, documentation validation, and configuration run during check', () => project({
  'main.yaml': 'optimization: quick\nmodule_dependencies:\n  - "a: contracts"\n',
  'main.aug': '',
  'a/export.aug': 'export first from first\n',
  'a/first.aug': '/** First.\n * @param missing No such input.\n */\nimport second from b\nfirst() { second() }\n',
  'b/export.aug': 'export second from second\n',
  'b/second.aug': 'import first from a\nsecond() { first() }\n',
}, root => {
  const result = command(root, 'check', ['--json']); assert.equal(result.status, 1);
  const issues = JSON.parse(result.stdout);
  assert.ok(issues.some(issue => issue.code === 'CONFIG'), result.stdout);
  assert.ok(issues.some(issue => issue.message.includes('Import cycle')), result.stdout);
  assert.ok(issues.some(issue => issue.message.includes('may not depend')), result.stdout);
}));

test('explain exposes effects and context obeys its output budget', () => project({
  'main.aug': 'import save from service\n',
  'service.aug': `import FileWriter from august.io
/** Save text. @see FileWriter */
save(resolve FileWriter files, string path, string content) uses files.write unless FileError:
    files.write(path=path, content=content)
`,
}, root => {
  const result = command(root, 'explain', ['--file', join(root, 'service.aug'), '--name', 'save', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const fact = JSON.parse(result.stdout).contracts[0];
  assert.equal(fact.callables[0].capabilities[0], 'files.write');
  assert.deepEqual(fact.callables[0].errors, ['FileError']);
  const context = command(root, 'context', ['--file', join(root, 'service.aug'), '--budget', '1024', '--json']);
  assert.equal(context.status, 0, context.stderr); assert.ok(context.stdout.trim().length <= 1024, context.stdout);
}));

test('scoped DI caches within a scope, restores nested scopes, and rejects escape', () => {
  const counter = `interface Counter { increment() changes self }
CounterImpl() implements Counter { increment() changes self { pass } }\n`;
  runs({ 'counter.aug': counter, 'main.aug': `import Counter and CounterImpl from counter
implement Counter with CounterImpl scoped mutable
scope:
    resolve Counter to first
    resolve Counter to second
    print(value=first == second)
    scope:
        resolve Counter to third
        print(value=first == third)
    resolve Counter to restored
    print(value=first == restored)
`, }, 'true\nfalse\ntrue\n');
  project({ 'counter.aug': counter, 'main.aug': `import Counter and CounterImpl from counter
implement Counter with CounterImpl scoped mutable
optional Counter outside = null
scope:
    resolve Counter to outside
resolve Counter to bad
`, }, root => {
    const result = command(root, 'check', ['--json']);
    assert.equal(result.status, 1);
    assert.ok(JSON.parse(result.stdout).some(issue => issue.message.includes('cannot escape')), result.stdout);
    assert.ok(JSON.parse(result.stdout).some(issue => issue.message.includes('inside a scope')), result.stdout);
  });
});

test('recoverable list and arithmetic errors, optional lookup, and exact wrapping integers', () => runs({
  'main.aug': `items = [1, 2]
try:
    print(value=items.get(index=8))
catch IndexError error:
    print(value="bounds")
print(value=items.at(index=8))
try:
    print(value=4 / 0)
catch ArithmeticError error:
    print(value="arithmetic")
print(value=9223372036854775807 + 1)
print(value=-9223372036854775808 / -1)
print(value=9007199254740993 > 9007199254740992)
`,
}, 'bounds\nnull\narithmetic\n-9223372036854775808\n-9223372036854775808\ntrue\n'));

test('ownership rejects alias overlap, escaping loans, and moves on loop re-entry', () => project({
  'main.aug': `import pair and consume and escape from loans
values = [1]
alias = values
borrow values:
    pair(first=values, second=alias)
own List<int> owned = [2]
while true:
    consume(value=owned)
`,
  'loans.aug': `pair(borrow List<int> first, List<int> second) changes first:
    first.append(value=1)
consume(own List<int> value):
    pass
escape(borrow List<int> value) returns Tuple<List<int>>:
    return (value,)
`,
}, root => {
  const result = command(root, 'check', ['--json']);
  assert.equal(result.status, 1);
  const diagnostics = JSON.parse(result.stdout);
  for (const fragment of ['aliases another argument', 'cannot escape', 'moved value'])
    assert.ok(diagnostics.some(issue => issue.message.includes(fragment)), result.stdout);
}));

test('empty inputs infer from sibling labels and invalid records/matches/numbers are rejected', () => {
  runs({
    'fn.aug': 'size<T>(T example, List<T> values) returns int { return values.length() }\n',
    'main.aug': 'import size from fn\nprint(value=size(values=[], example=7))\n',
  }, '0\n');
  project({
    'data.aug': 'record Bad(List<int> values)\nmissing(bool value) returns int { match value { when true { return 1 } } }\n',
    'main.aug': 'import Bad from data\nitems = [1]\nbad = Bad(values=items)\nprint(value=9223372036854775808)\n',
  }, root => {
    const result = command(root, 'check', ['--json']);
    assert.equal(result.status, 1);
    for (const code of ['RECORD', 'MATCH', 'NUMBER']) assert.ok(JSON.parse(result.stdout).some(issue => issue.code === code), result.stdout);
  });
});

test('colon blocks accept tabs, spaces, nesting, braced children and multiline collections', () => runs({
  'main.aug': `int index = 0
while index < 2:
\tif index == 0:
\t\tprint(value="first")
\telse { print(value="second") }
\tindex = index + 1
numbers = [
    1,
  2,
]
if true:
    fruit = {
        1:
          "apple",
        2: "pear",
    }
    print(value=fruit.get(key=1))
    borrow numbers:
        numbers.append(value=3)
    print(value=numbers.length())
print(value="done")
`,
}, 'first\nsecond\napple\n3\ndone\n'));

test('indented declarations, constructor bodies, interceptors and same-file tests compile', () => project({
  'main.aug': 'import NumberImpl and increment from number\nprint(value=NumberImpl(value=6).get())\nprint(value=increment(value=3))\n',
  'number.aug': `interface Number:
    get() returns int
NumberImpl(int value) implements Number:
    initialize:
        value = value + 1
    get() returns int:
        return value
interceptor Identity<T>:
    around(T value) returns T:
        return next()
[Identity]
increment(
    int value
) returns int:
    return value + 1
test NumberImpl number:
    when constructor:
        number = NumberImpl(value=6)
        it increments:
            assert(number.get() == 7)
interface Empty:
    pass
EmptyImpl() implements Empty:
    pass
`,
}, root => {
  const run = command(root, 'run');
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stdout, '7\n4\n');
  const tests = command(root, 'test', ['--json']);
  assert.equal(tests.status, 0, tests.stderr || tests.stdout);
  assert.equal(JSON.parse(tests.stdout).passed, 1);
}));

test('ambiguous indentation, missing bodies and accidental nesting are rejected', () => {
  for (const source of [
    'if true:\n \tprint(value=1)\n',
    'if true:\n    print(value=1)\n  print(value=2)\n',
    'if true:\n    print(value=1)\n        print(value=2)\n',
    'if true: print(value=1)\n',
    'if true:\nprint(value=1)\n',
  ]) project({ 'main.aug': source }, root => {
    const result = command(root, 'check', ['--json']);
    assert.equal(result.status, 1, source);
    assert.ok(JSON.parse(result.stdout).some(issue => issue.code === 'INDENT'), result.stdout);
  });
});

test('generic constraints permit interface methods and explicit checked variance permits producers', () => runs({
  'main.aug': `import Item and describe and Holder and Named and Producer from types
print(value=describe(value=Item()))
Producer<Named> item = Holder(value=Item())
print(value=item.get().name())
`,
  'types.aug': `interface Named { name() returns string }
Item() implements Named { name() returns string { return "item" } }
describe<T implements Named>(T value) returns string { return value.name() }
interface Producer<out T> { get() returns T }
Holder<T>(T value) implements Producer<T> { get() returns T { return value } }
`,
}, 'item\nitem\n'));

test('invariant aliases, conflicting inference, invalid variance and unmet constraints fail early', () => project({
  'main.aug': `import Box and choose and constrained and empty from types
Box<int> box = Box(value=1)
Box<float> wider = box
choose(left=1, right="one")
constrained(value=1)
empty()
`,
  'types.aug': `interface Value<T> { get() returns T }
Box<T>(T value) implements Value<T> { get() returns T { return value } }
choose<T>(T left, T right) returns T { return left }
interface Named { name() returns string }
constrained<T implements Named>(T value) returns string { return value.name() }
empty<T>() returns T { while true {} }
interface Bad<out T> { set(T value) }
`,
}, root => {
  const result = command(root, 'check', ['--json']);
  assert.equal(result.status, 1);
  const diagnostics = JSON.parse(result.stdout);
  for (const fragment of ['Cannot assign Box<int> to Box<float>', 'Conflicting inference', 'must implement Named', 'Cannot infer empty', 'incompatible input'])
    assert.ok(diagnostics.some(issue => issue.message.includes(fragment)), result.stdout);
}));

test('non-null branches, short-circuit conditions and early return guards narrow local values', () => runs({
  'main.aug': `import Item and inspect from item
print(value=inspect(value=Item()))
print(value=inspect(value=null))
`,
  'item.aug': `interface Value { get() returns int }
Item() implements Value { get() returns int { return 7 } }
inspect(optional Value value) returns int:
    if value != null and value.get() == 7:
        return value.get()
    if value == null:
        return 0
    return value.get()
`,
}, '7\n0\n'));

test('explicit capabilities and header DI forward dependencies through class and function calls', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
import Logger and ConsoleLogger and Worker from logging
implement Console with SystemConsole
implement Logger with ConsoleLogger
worker = Worker()
worker.work()
`,
  'logging.aug': `import Console from august.io
interface Logger { log(string message) uses Console.write }
ConsoleLogger(resolve Console console) implements Logger {
    log(string message) uses console.write { console.write(value=message) }
}
emit(resolve Logger logger, string message) uses Console.write { logger.log(message=message) }
interface Work { work() uses Console.write }
Worker(resolve Logger _logger) implements Work {
    work() uses Console.write { emit(message="explicit dependency") }
}
`,
}, 'explicit dependency\n'));

test('declared mutation and private storage use public constructor labels and caller borrow', () => runs({
  'main.aug': `import Counter from counter
counter = Counter(initial=3)
borrow counter { counter.increment() }
print(value=counter.value())
`,
  'counter.aug': `interface Count { increment() changes self; value() returns int }
Counter(mutable int initial to _count) implements Count {
    increment() changes self { _count = _count + 1 }
    value() returns int { return _count }
}
`,
}, '4\n'));

test('pure bodies, read-only aliases, ambient I/O and hidden service lookups are rejected', () => project({
  'main.aug': 'import Bad from bad\nitem = Bad(value=1)\nborrow item { item.value = 2 }\n',
  'bad.aug': `interface Data { read() returns int }
Bad(int value) implements Data { read() returns int { return value } }
mutate(List<int> values) { copy = values; borrow copy { copy.append(value=7) } }
log() { print(value="hidden output") }
lookup() { resolve app to dependency }
`,
}, root => {
  const result = command(root, 'check', ['--json']);
  assert.equal(result.status, 1);
  const diagnostics = JSON.parse(result.stdout);
  for (const fragment of ['read-only', 'Use a resolve Console', 'callable header'])
    assert.ok(diagnostics.some(issue => issue.message.includes(fragment)), result.stdout);
}));

test('injected return references retain scope origins and transitive shared captures fail', () => project({
  'services.aug': `interface Store { read() returns int }
StoreImpl() implements Store { read() returns int { return 1 } }
readDependency(resolve Store store) returns Store { return store }
interface Worker { read() returns int }
WorkerImpl(resolve Store store) implements Worker { read() returns int { return store.read() } }
`,
  'main.aug': `import Store and StoreImpl and Worker and WorkerImpl and readDependency from services
implement Store with StoreImpl scoped
implement Worker with WorkerImpl shared
optional Store outside = null
scope {
    outside = readDependency()
}
`,
}, root => {
  const result = command(root, 'check', ['--json']); assert.equal(result.status, 1);
  const issues = JSON.parse(result.stdout);
  assert.ok(issues.some(issue => issue.message.includes('cannot escape into outer variable')), result.stdout);
  assert.ok(issues.some(issue => issue.message.includes('cannot retain a scoped dependency')), result.stdout);
}));

test('cleanup annotations cannot add recoverable errors', () => project({
  'main.aug': 'import Resource from resource\nresource = Resource()\n',
  'resource.aug': `interface Value {}
Failure() implements Error {}
interceptor Reject<T> {
    around() returns T unless Failure { throw Failure() }
}
Resource() implements Value {
    [Reject]
    drop() {}
}
`,
}, root => {
  const result = command(root, 'check', ['--json']); assert.equal(result.status, 1);
  assert.ok(JSON.parse(result.stdout).some(issue => issue.code === 'EFFECT' && issue.message.includes('drop interceptor layers')), result.stdout);
}));

test('test setup includes explicitly imported compositions with private adapters', () => project({
  'main.aug': '',
  'services.aug': `interface Store { read() returns int }
_TestStore() implements Store { read() returns int { return 3 } }
composition TestServices { implement Store with _TestStore }
`,
  'worker.aug': `import Store and TestServices from services
interface Value { read() returns int }
Worker(resolve Store store) implements Value { read() returns int { return store.read() * 2 } }
test Worker worker:
    when dependencies:
        include TestServices
        worker = Worker()
        it reads:
            assert(worker.read() == 6)
`,
}, root => {
  const result = command(root, 'test', ['--json']); assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(JSON.parse(result.stdout).passed, 1);
  const format = command(root, 'format', ['--write']); assert.equal(format.status, 0, format.stderr);
}));
