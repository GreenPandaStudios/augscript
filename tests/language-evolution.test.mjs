import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from './compiler-process.mjs';

const cli = resolve('bin/aug.mjs');
function project(files, action) {
  const root = mkdtempSync(join(tmpdir(), 'aug-evolution-'));
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

test('collection literals infer integer lists, tuples, sets, and hash maps', () => runs({
  'main.aug': `try {
numbers = [1, 2]
pair = (1, 2)
unique = {1, 2, 1}
fruit = {1: "apples", 2: "pears", 1: "green apples"}
print(value=numbers.get(index=1))
print(value=pair.get(index=0))
print(value=unique.length())
print(value=unique.contains(value=2))
print(value=fruit.get(key=1))
print(value=fruit.length())
borrow numbers { numbers.append(value=3) }
borrow unique { unique.add(value=3) }
borrow fruit { fruit.set(value="plums", key=3) }
print(value=numbers.length())
print(value=unique.length())
print(value=fruit.contains(key=3))

} catch IndexError error { print(value="unexpected index failure") }
`,
}, '2\n1\n2\ntrue\ngreen apples\n2\n3\n3\ntrue\n'));

test('typed empty and nested collections use declaration, return, and argument context', () => runs({
  'main.aug': `import count and empty from functions
try {
List<int> numbers = []
Set<int> unique = {}
Map<int, string> fruit = {}
List<List<int>> nested = [[], [1, 2]]
Tuple<int, string> pair = (1, "apple")
singleton = (7,)
emptyPair = ()
print(value=numbers.length())
print(value=unique.length())
print(value=fruit.length())
print(value=nested.get(index=1).length())
print(value=pair.get(index=1))
print(value=singleton.get(index=0))
print(value=emptyPair.length())
print(value=count(values=[]))
print(value=empty().length())

} catch IndexError error { print(value="unexpected index failure") }
`,
  'functions.aug': `count(List<int> values) returns int { return values.length() }
empty() returns Map<int, string> { return {} }
`,
}, '0\n0\n0\n2\napple\n7\n0\n0\n0\n'));

test('decimal literals retain float types in inferred collections and tuples', () => {
  runs({ 'main.aug': `try {
numbers = [1.0, 2.0]
borrow numbers { numbers.append(value=3.5) }
pair = (1.0, "apple")
print(value=numbers.get(index=2))
print(value=pair.get(index=0) + 0.5)

} catch IndexError error { print(value="unexpected index failure") }
` }, '3.5\n1.5\n');
  project({ 'main.aug': 'List<int> numbers = [1.0, 2.0]\n' }, root => {
    const result = command(root, 'check', ['--json']);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /float/);
  });
});

test('heterogeneous tuples are valid, incompatible list and map items are errors', () => project({
  'main.aug': `List<int> numbers = [1, "two"]
Map<int, string> fruit = {1: "apple", "two": "pear"}
unknown = []
untyped = {}
mixed = {1, 2: "pear"}
`,
}, root => {
  const result = command(root, 'check', ['--json']);
  assert.equal(result.status, 1);
  const issues = JSON.parse(result.stdout);
  assert.ok(issues.filter(issue => issue.code === 'COLLECTION').length >= 5, result.stdout);
}));

test('set mutation and tuple indexing are checked before native compilation', () => project({
  'main.aug': `unique = {1, 2}
unique.add(value=3)
pair = (1, "apple")
int index = 0
pair.get(index=index)
pair.get(index=2)
`,
}, root => {
  const result = command(root, 'check', ['--json']);
  const issues = JSON.parse(result.stdout);
  assert.ok(issues.some(issue => issue.code === 'BORROW'));
  assert.ok(issues.some(issue => /constant int/.test(issue.message)));
  assert.ok(issues.some(issue => /Tuple index out of range/.test(issue.message)));
}));

test('hash maps and sets resize, preserve values, and compare tuple keys by value', () => runs({
  'main.aug': `Map<int, int> numbers = {}
Set<int> unique = {}
int index = 0
borrow numbers {
    borrow unique {
        while index < 1500 {
            numbers.set(key=index, value=index + 10)
            unique.add(value=index)
            unique.add(value=index)
            index = index + 1
        }
    }
}
print(value=numbers.length())
print(value=numbers.get(key=1499))
print(value=numbers.get(key=-1))
print(value=unique.length())
keys = {(1, "apple"): "found"}
print(value=keys.get(key=(1, "apple")))
numeric = {1, 1.0, 2.5}
print(value=numeric.length())
print(value=(1, "apple") == (1, "apple"))
`,
}, '1500\n1509\nnull\n1500\nfound\n2\ntrue\n'));

test('collection values survive repeated garbage collection', () => runs({
  'main.aug': `try {
List<Map<int, string>> saved = []
int index = 0
borrow saved {
    while index < 2500 {
        saved.append(value={index: "fruit"})
        index = index + 1
    }
}
print(value=saved.get(index=0).get(key=0))
print(value=saved.get(index=2499).get(key=2499))

} catch IndexError error { print(value="unexpected index failure") }
`,
}, 'fruit\nfruit\n'));

test('optional semicolons work with signatures, multiline expressions, and bare returns', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import calculate and finish from functions
try {
print(value=calculate(
    values=[
        1,
        2,
    ],
))
int count = 1 +
    2
print(value=count); print(value=(1 + 2))
finish()
} catch IndexError error { print(value="unexpected index failure") }
`,
  'functions.aug': `import Console from august.io
interface Contract {
    done()
    value() returns int
}
calculate(List<int> values) returns int  unless IndexError {
    return values.get(index=0) + values.get(index=1)
}
finish(resolve Console console)  uses Console.write {
    return
    console.write(value="unreachable")
}
`,
}, '3\n3\n3\n'));

test('semicolonless function calls do not join across lines', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import first and second from functions
first()
second()
print(value=(1))
`,
  'functions.aug': `import Console from august.io
first(resolve Console console)  uses Console.write { console.write(value="first") }
second(resolve Console console)  uses Console.write { console.write(value="second") }
`,
}, 'first\nsecond\n1\n'));

test('unless error contracts remain checked and support and-separated failures', () => runs({
  'main.aug': `import load and OtherError from functions
try { print(value=load(fail=true)) } catch FileError error { print(value="caught") } catch OtherError error { print(value="other") }
print(value=1)
`,
  'functions.aug': `OtherError() implements Error {}
load(bool fail) returns string unless FileError and OtherError {
    if fail { throw FileError() }
    return "loaded"
}
`,
}, 'caught\n1\n'));

test('throws is rejected with a suggested migration to unless', () => project({
  'main.aug': '',
  'functions.aug': 'load() returns string throws FileError { return "loaded" }\n',
}, root => {
  const result = command(root, 'check', ['--json']);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Use unless instead of throws/);
  const fixes = command(root, 'fixes', ['--file', join(root, 'functions.aug')]);
  assert.ok(JSON.parse(fixes.stdout).some(fix => fix.edits.some(edit => edit.text === 'unless')), fixes.stdout);
}));

test('everything imports only public sibling declarations and folder exports', () => runs({
  'main.aug': `import everything from tools
import left and right from sibling
print(value=left() + right())
print(value=publicValue())
`,
  'sibling.aug': 'left() returns int { return 1 }\nright() returns int { return 2 }\n_hidden() returns int { return 9 }\n',
  'tools/export.aug': 'export publicValue from values\n',
  'tools/values.aug': 'publicValue() returns int { return 4 }\nnotExported() returns int { return 5 }\n',
}, '3\n4\n'));

test('everything excludes private and transitive names, and import conflicts are errors', () => project({
  'main.aug': `import everything from sibling
import publicValue from tools
import publicValue from sibling
_hidden()
dependency()
notExported()
`,
  'sibling.aug': 'import dependency from dep\npublicValue() {}\n_hidden() {}\n',
  'dep.aug': 'dependency() {}\n',
  'tools/export.aug': 'export publicValue from values\n',
  'tools/values.aug': 'publicValue() {}\nnotExported() {}\n',
}, root => {
  const result = command(root, 'check', ['--json']);
  const issues = JSON.parse(result.stdout);
  assert.ok(issues.some(issue => issue.code === 'IMPORT' && /conflicts/.test(issue.message)));
  for (const name of ['_hidden', 'dependency', 'notExported']) assert.ok(issues.some(issue => issue.message === `Unknown name ${name}`));
}));

const unitFiles = {
  'main.aug': 'print(value="production must not run during tests")\n',
  'counter.aug': `interface Counter { increment() returns int changes self }
interface State { value() returns int }
StateImpl() implements State { value() returns int { return 0 } }
FreshCount(resolve mutable State state) implements Counter {
    increment() returns int changes self {
        borrow self { state = UpdatedState(previous=state.value() + 1) }
        return state.value()
    }
}
UpdatedState(int previous) implements State { value() returns int { return previous } }
interface Worker { work() returns int changes self }
WorkerImpl(resolve mutable Counter counter) implements Worker {
    work() returns int changes self.counter { return counter.increment() }
}
test WorkerImpl worker {
    when fresh {
        implement Counter with FreshCount
        implement State with StateImpl
        worker = WorkerImpl()
        it first { borrow worker { assert(worker.work() == 1) } }
        it second { borrow worker { assert(condition=worker.work() == 1) } }
    }
    when other {
        implement Counter with FreshCount
        implement State with StateImpl
        worker = WorkerImpl()
        it "increments twice" {
            borrow worker {
            assert(worker.work() == 1)
            assert(worker.work() == 2)
            }
        }
    }
}
`,
};

test('same-file unit tests use fresh test DI and never run production startup', () => project(unitFiles, root => {
  const result = command(root, 'test', ['--json']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const data = JSON.parse(result.stdout);
  assert.equal(data.passed, 3);
  assert.equal(data.failed, 0);
  assert.ok(data.tests.every(item => item.stdout === ''));
}));

test('CLI selects a named test group and lists tests without running them', () => project(unitFiles, root => {
  const result = command(root, 'test', ['fresh', '--json']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(JSON.parse(result.stdout).passed, 2);
  const list = command(root, 'test', ['--group', 'other', '--list', '--json']);
  assert.equal(list.status, 0, list.stderr || list.stdout);
  const listed = JSON.parse(list.stdout);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].name, 'increments twice');
  const missing = command(root, 'test', ['--group', 'missing']);
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /No test group named missing/);
}));

test('failed assertions report source, fail even when caught, and do not stop other cases', () => project({
  'main.aug': '',
  'worker.aug': `interface Worker {}
WorkerImpl() implements Worker {}
test WorkerImpl worker {
    when assertions {
        worker = WorkerImpl()
        it fails { assert(1 == 2) }
        it catches { try { assert(false) } catch Error error { assert(true) } }
        it passes { assert(true) }
        it empty {}
    }
}
`,
}, root => {
  const result = command(root, 'test', ['--json']);
  assert.equal(result.status, 1);
  const data = JSON.parse(result.stdout);
  assert.equal(data.failed, 3);
  assert.equal(data.passed, 1);
  assert.match(data.tests[0].stderr, /worker\.aug:6: assertion failed: 1 == 2/);
  assert.match(data.tests[3].stderr, /no assertions/);
}));

test('setup assertions cannot satisfy a case and setup cannot skip its body with return', () => {
  project({
    'main.aug': '',
    'worker.aug': `interface Worker {}
WorkerImpl() implements Worker {}
test WorkerImpl worker {
    when ready {
        worker = WorkerImpl()
        assert(true)
        it empty {}
        it checked { assert(true) }
    }
}
`,
  }, root => {
    const result = command(root, 'test', ['--json']);
    assert.equal(result.status, 1);
    const data = JSON.parse(result.stdout);
    assert.equal(data.failed, 1);
    assert.equal(data.passed, 1);
    assert.match(data.tests[0].stderr, /no assertions/);
  });
  project({
    'main.aug': '',
    'worker.aug': `interface Worker {}
WorkerImpl() implements Worker {}
test WorkerImpl worker {
    when ready {
        worker = WorkerImpl()
        if true { return }
        it checked { assert(true) }
    }
}
`,
  }, root => {
    const result = command(root, 'test', ['--json']);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /Test setup cannot return/);
  });
});

test('generic class suites and punctuation in names have distinct selectable test ids', () => project({
  'main.aug': '',
  'box.aug': `interface Value<T> { get() returns T }
Box<T>(T value) implements Value<T> { get() returns T { return value } }
test Box<int> box {
    when "typed: values" {
        box = Box(value=7)
        it "has: a value" { assert(box.get() == 7) }
    }
}
test Box<string> box {
    when "typed: values" {
        box = Box(value="apple")
        it "has: a value" { assert(box.get() == "apple") }
    }
}
`,
}, root => {
  const listing = command(root, 'test', ['--list', '--json']);
  assert.equal(listing.status, 0, listing.stderr || listing.stdout);
  const listed = JSON.parse(listing.stdout);
  assert.equal(listed.length, 2);
  assert.notEqual(listed[0].id, listed[1].id);
  assert.equal(listed[0].id.split(':').length, 4);
  for (const unit of listed) {
    const result = command(root, 'test', ['--case', unit.id, '--json']);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const data = JSON.parse(result.stdout);
    assert.equal(data.passed, 1);
    assert.equal(data.tests[0].id, unit.id);
  }
}));

test('unit test subject, bool assertions, group order, and duplicate cases are checked', () => project({
  'main.aug': '',
  'worker.aug': `import Imported from other
test Imported subject {
    when bad {
        subject = Imported()
        it duplicate { assert(7) }
        it duplicate { assert(true) }
    }
}
`,
  'other.aug': 'interface Contract {}\nImported() implements Contract {}\n',
}, root => {
  const result = command(root, 'test', ['--json']);
  const issues = JSON.parse(result.stdout);
  assert.ok(issues.some(issue => /same file/.test(issue.message)));
  assert.ok(issues.some(issue => /bool condition/.test(issue.message)));
  assert.ok(issues.some(issue => /Duplicate test case/.test(issue.message)));
}));

test('mutable collection aliases cannot widen their element types', () => project({
  'main.aug': `List<int> whole = [1]
List<float> numbers = whole
Set<int> integers = {1}
Set<float> decimals = integers
Map<int, int> counts = {1: 2}
Map<int, float> values = counts
`,
}, root => {
  const result = command(root, 'check', ['--json']);
  assert.equal(result.status, 1);
  const issues = JSON.parse(result.stdout);
  assert.equal(issues.filter(issue => /Cannot assign/.test(issue.message)).length, 3);
}));

test('user-defined generics infer nested collection arguments', () => runs({
  'main.aug': `import first and Box from functions
try {
print(value=first(values=[7, 8]))
box = Box(values=["apple", "pear"])
print(value=box.get())
} catch IndexError error { print(value="unexpected index failure") }
`,
  'functions.aug': `first<T>(List<T> values) returns T  unless IndexError { return values.get(index=0) }
interface Value<T> { get() returns T unless IndexError  }
Box<T>(List<T> values) implements Value<T> { get() returns T  unless IndexError { return values.get(index=0) } }
`,
}, '7\napple\n'));

test('nonvoid function bodies must produce a value on every path', () => project({
  'main.aug': '',
  'functions.aug': 'maybe(bool ready) returns int { if ready { return 1 } }\n',
}, root => {
  const result = command(root, 'check', ['--json']);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /must return a value or throw on every path/);
}));

test('interface parameter ownership must match its implementation', () => project({
  'main.aug': '',
  'functions.aug': `interface Contract { consume(List<int> values) }
Consumer() implements Contract { consume(own List<int> values) {} }
`,
}, root => {
  const result = command(root, 'check', ['--json']);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /signature|implement/i);
}));

test('one case can be selected by id and hanging cases fail with a timeout', () => project({
  'main.aug': '',
  'worker.aug': `interface Worker {}
WorkerImpl() implements Worker {}
test WorkerImpl worker {
    when waiting {
        worker = WorkerImpl()
        it hangs { while true {} }
        it passes { assert(true) }
    }
}
`,
}, root => {
  const selected = command(root, 'test', ['--case', 'worker.aug:WorkerImpl:waiting:passes', '--json']);
  assert.equal(selected.status, 0, selected.stderr || selected.stdout);
  assert.equal(JSON.parse(selected.stdout).passed, 1);
  const timedOut = command(root, 'test', ['--timeout', '2000', '--json']);
  assert.equal(timedOut.status, 1);
  const data = JSON.parse(timedOut.stdout);
  assert.equal(data.failed, 1, timedOut.stdout);
  assert.equal(data.passed, 1);
  assert.match(data.tests[0].stderr, /exceeded 2000ms/);
}));

test('editor discovers inferred literal types, set methods, and test locals', () => project({
  'main.aug': 'numbers = {1, 2}\nnumbers.contains(value=1)\n',
  'worker.aug': `interface Worker { work() returns int }
WorkerImpl() implements Worker { work() returns int { return 7 } }
test WorkerImpl worker {
    when ready {
        worker = WorkerImpl()
        it works { assert(worker.work() == 7) }
    }
}
`,
}, root => {
  const source = 'numbers = {1, 2}\nnumbers.contains(value=1)\n';
  const hover = command(root, 'hover', ['--file', join(root, 'main.aug'), '--offset', String(source.indexOf('{'))]);
  assert.equal(JSON.parse(hover.stdout).detail, 'Set<int> literal');
  const members = command(root, 'complete', ['--file', join(root, 'main.aug'), '--offset', String(source.indexOf('contains'))]);
  assert.ok(JSON.parse(members.stdout).some(item => item.label === 'contains' && /value=int/.test(item.detail)));
  const workerSource = `interface Worker { work() returns int }
WorkerImpl() implements Worker { work() returns int { return 7 } }
test WorkerImpl worker {
    when ready {
        worker = WorkerImpl()
        it works { assert(worker.work() == 7) }
    }
}
`;
  const local = command(root, 'hover', ['--file', join(root, 'worker.aug'), '--offset', String(workerSource.lastIndexOf('worker.work'))]);
  assert.equal(JSON.parse(local.stdout).detail, 'WorkerImpl worker');
  const assertion = command(root, 'hover', ['--file', join(root, 'worker.aug'), '--offset', String(workerSource.indexOf('assert'))]);
  assert.match(JSON.parse(assertion.stdout).documentation, /Catch/);
}));
