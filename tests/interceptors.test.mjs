import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const cli = resolve(import.meta.dirname, '../bin/aug.mjs');
test('constructor interceptor failure releases the completed object and its owned fields before catch', () => runs({
  'main.aug': `import Resource and Box from app
try:
    own Resource value = Resource()
    own Box box = Box(value)
catch FileError error:
    print(value="caught")
`,
  'app.aug': `interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
interface Marker:
    pass
interceptor Reject<T>():
    around() returns T unless FileError:
        T completed = next()
        throw FileError()
interceptor Delegate<T>():
    around() returns T:
        return next()
[Delegate]
[Reject]
Box(own Resource value) unless FileError implements Marker:
    pass
`
}, 'caught\n', 1));
function withProject(files, callback) {
  const root = mkdtempSync(join(tmpdir(), 'augscript-interceptors-'));
  try {
    for (const [name, source] of Object.entries(files)) {
      const file = join(root, name);
      mkdirSync(resolve(file, '..'), { recursive: true });
      writeFileSync(file, source);
    }
    callback(root);
  } finally { rmSync(root, { recursive: true, force: true }); }
}
function command(root, name, file, source, offset, traceDrops = false) {
  if(process.env.AUG_TEST_BACKEND==='llvm')writeFileSync(join(root,'main.yaml'),'backend: llvm\n');
  const args = [cli, name, root];
  if (name === 'check') args.push('--json');
  if (file) args.push('--file', join(root, file), '--stdin-file', join(root, file));
  if (offset !== undefined) args.push('--offset', String(offset));
  const result = spawnSync(process.execPath, args, { encoding: 'utf8', input: source,
    env: { ...process.env, ...(traceDrops ? { AUG_TRACE_DROPS: '1' } : {}) } });
  assert.equal(result.error, undefined);
  return result;
}
function runs(files, output, drops) {
  withProject(files, root => {
    const result = command(root, 'run', undefined, undefined, undefined, drops !== undefined);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, output);
    if (drops !== undefined) assert.equal(result.stderr.match(/drop: (?:[^\n]*[:/])?Resource\n/g)?.length ?? 0, drops);
  });
}
function issues(files) {
  let result;
  withProject(files, root => { result = JSON.parse(command(root, 'check').stdout); });
  return result;
}

test('interceptor layers enter in order, map subsets, override inputs, and unwind results', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import format from app; print(value=format(name="hello", x=4));`,
  'app.aug': `import Console from august.io

    interceptor Outer<T>() {
      around(resolve Console console) returns T  uses Console.write {
        console.write(value="outer before");
        T result to next();
        console.write(value="outer after");
        return result;
      }
    }
    interceptor AddOne() {
      around(resolve Console console, int y) returns string  uses Console.write {
        console.write(value="inner before");
        string result to next(y=y + 1);
        console.write(value="inner after");
        return result + "!";
      }
    }
    [Outer]
    [AddOne(y=x)]
    format(resolve Console console, int x, string name) returns string  uses Console.write { console.write(value=x); return name; }
  `,
}, 'outer before\ninner before\n5\ninner after\nouter after\nhello!\n'));

test('next without overrides preserves original arguments even after parameter reassignment', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import show from app; print(value=show(x=4, label="original"));`,
  'app.aug': `import Console from august.io

    interceptor ChangeLocal() { around(int x) returns int { x to 99; return next(); } }
    [ChangeLocal]
    show(resolve Console console, int x, string label) returns int  uses Console.write { console.write(value=label); return x; }
  `,
}, 'original\n4\n'));

test('generic interceptors wrap constructors, methods, void calls, and default interface dispatch', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from app; import ScreenLogger from app; import Worker from app;
    implement Logger with ScreenLogger;
    worker to Worker(x=8);
    worker.work();
    worker.defaultWork();`,
  'app.aug': `import Console from august.io

    interface Logger { log(resolve Console console, string message) uses Console.write ; }
    ScreenLogger() implements Logger { log(resolve Console console, string message)  uses Console.write { console.write(value=message); } }
    interceptor Trace<T>(resolve Logger logger) {
      around(resolve Console console) returns T  uses Console.write {
        logger.log(message="before");
        T result to next();
        logger.log(message="after");
        return result;
      }
    }
    interface Work {
      work(resolve Logger logger, resolve Console console) uses Console.write ;
      [Trace]
      defaultWork(resolve Logger logger, resolve Console console) uses Console.write { console.write(value="default"); }
    }
    interceptor Construct<T>() { around() returns T { return next() } }
    [Construct]
    Worker(resolve Logger logger, int x) implements Work {
    initialize {
        x = x + 1
    }
    [Trace]
    work(resolve Logger logger, resolve Console console) uses Console.write {
        console.write(value=x)
    }
}
  `,
}, 'before\n9\nafter\nbefore\ndefault\nafter\n'));

test('constructor interceptor dependencies participate in eager DI ordering', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from app; import ScreenLogger from app; import Worker from app;
    implement app with Worker; implement Logger with ScreenLogger;
    resolve app to worker; worker.work();`,
  'app.aug': `import Console from august.io

    interface Logger { log(resolve Console console, string message) uses Console.write ; }
    ScreenLogger() implements Logger { log(resolve Console console, string message)  uses Console.write { console.write(value=message); } }
    interceptor Trace<T>(resolve Logger logger) {
      around() returns T { return next(); }
    }
    interface Work { work(resolve Console console) uses Console.write ; }
    [Trace] Worker(resolve Logger logger) implements Work { work(resolve Console console)  uses Console.write { console.write(value="working"); } }
  `,
}, 'working\n'));

test('a fresh interceptor instance is created for each invocation', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from app; import ScreenLogger from app; import work from app;
    implement Logger with ScreenLogger; work(); work();`,
  'app.aug': `import Console from august.io

    interface Logger { log(resolve Console console, string message) uses Console.write ; }
    ScreenLogger() implements Logger { log(resolve Console console, string message)  uses Console.write { console.write(value="original"); } }
    Replacement() implements Logger { log(resolve Console console, string message)  uses Console.write { console.write(value="replacement"); } }
    interceptor Fresh(resolve mutable Logger _logger) {
      around(resolve Console console)  changes self  uses Console.write { _logger.log(message="hello"); borrow self { _logger to Replacement(); } next(); }
    }
    [Fresh] work(resolve Logger logger, resolve Console console) uses Console.write {}
  `,
}, 'original\noriginal\n'));

test('a processor can short circuit without calling its target', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import cached from app; print(value=cached(x=1));`,
  'app.aug': `import Console from august.io
interceptor Cache() { around(int x) returns string { return "cached"; } }
    [Cache] cached(resolve Console console, int x) returns string  uses Console.write { console.write(value="unexpected"); return "target"; }`,
}, 'cached\n'));

test('interceptor errors are checked on functions and constructor calls', () => {
  const app = `Failure() implements Error {}
    interceptor Validate<T>() { around(int y) returns T unless Failure { throw Failure(); } }
    [Validate(y=x)] load(int x) returns string { return "ok"; }
    interface BoxContract {}
    [Validate(y=x)] Box(int x) implements BoxContract {}`;
  const found = issues({ 'main.aug': 'import load from app; import Box from app; load(x=0); Box(x=0);', 'app.aug': app });
  assert.equal(found.filter(issue => issue.code === 'THROWS' && /Unhandled Failure/.test(issue.message)).length, 2);
  runs({ 'main.aug': `import load from app; import Box from app; import Failure from app;
    try { load(x=0); } catch Failure error { print(value="function rejected"); }
    try { Box(x=0); } catch Failure error { print(value="constructor rejected"); }`, 'app.aug': app },
    'function rejected\nconstructor rejected\n');
});

test('next errors can be handled by an interceptor', () => runs({
  'main.aug': `import load from app; import Failure from app;
    try { print(value=load()); } catch Failure error { print(value="unexpected"); }`,
  'app.aug': `Failure() implements Error {}
    interceptor Recover() {
      around() returns string { try { return next(); } catch Failure error { return "recovered"; } }
    }
    [Recover] load() returns string unless Failure { throw Failure(); }`,
}, 'recovered\n'));

test('mutually exclusive next calls are allowed, repeated and catch retry paths are rejected', () => {
  runs({ 'main.aug': 'import work from app; print(value=work(x=1)); print(value=work(x=0));',
    'app.aug': `interceptor Branch() { around(int x) returns int {
      if x > 0 { return next(x=x + 1); } else { return next(x=x - 1); }
    } } [Branch] work(int x) returns int { return x; }` }, '2\n-1\n');
  for (const body of ['next(); next();', 'while true { next(); }',
    'try { next(); } catch Error error { next(); }',
    'if true { next(); } next();']) {
    const found = issues({ 'main.aug': '', 'app.aug': `interceptor Retry() { around() { ${body} } }` });
    assert.ok(found.some(issue => issue.code === 'NEXT'), body);
  }
});

test('incompatible labels, mappings, results, and next overrides fail before C compilation', () => {
  for (const [tag, body, expected] of [
    ['[Adjust(y=missing)]', 'return next();', /no parameter missing/],
    ['[Adjust(z=x)]', 'return next();', /no parameter z/],
    ['[Adjust(y=x, y=x)]', 'return next();', /Duplicate mapping/],
    ['[Adjust(y=x)]', 'return next(y="wrong");', /expects int, got string/],
  ]) {
    const found = issues({ 'main.aug': '', 'app.aug': `interceptor Adjust() {
      around(int y) returns int { ${body} }
    } ${tag} work(int x) returns int { return x; }` });
    assert.ok(found.some(issue => expected.test(issue.message)), JSON.stringify(found));
  }
  assert.ok(issues({ 'main.aug': '', 'app.aug': `interceptor Wrong() { around() returns string { return "x"; } }
    [Wrong] work() returns int { return 1; }` }).some(issue => /requires int/.test(issue.message)));
});

test('owned inputs are forwarded once or dropped on short circuit', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Resource from app; import consume from app; import skip from app;
    own Resource a to Resource(); consume(item=a);
    own Resource b to Resource(); skip(item=b);`,
  'app.aug': `import Console from august.io
interface Disposable { drop(); }
    Resource() implements Disposable { drop() {  } }
    interceptor Pass() { around(own Resource item) { next(); } }
    interceptor Stop() { around() {} }
    [Pass] consume(resolve Console console, own Resource item)  uses Console.write { console.write(value="consume"); }
    [Stop] skip(resolve Console console, own Resource item)  uses Console.write { console.write(value="unexpected"); }`,
}, 'consume\n', 2));

test('using a moved interceptor input after next is a compile error', () => {
  const found = issues({ 'main.aug': '', 'app.aug': `interface Marker {} Resource() implements Marker {}
    interceptor Invalid() { around(own Resource item) { next(); print(value=item); } }
    [Invalid] consume(own Resource item) {}` });
  assert.ok(found.some(issue => issue.code === 'OWN' && /moved value item/.test(issue.message)));
});

test('interceptor errors must respect implemented interface contracts', () => {
  const found = issues({ 'main.aug': '', 'app.aug': `Failure() implements Error {}
    interceptor Validate() { around() unless Failure { throw Failure(); } }
    interface Work { work(); }
    Worker() implements Work { [Validate] work() {} }` });
  assert.ok(found.some(issue => /does not match the interface signature/.test(issue.message)));
});

test('interceptors import and export normally, and private interceptors stay file scoped', () => runs({
  'main.aug': 'import work from app; print(value=work(x=4));',
  'tools/export.aug': 'export AddOne from helpers;',
  'tools/helpers.aug': 'interceptor AddOne() { around(int x) returns int { return next(x=x + 1); } }',
  'app.aug': 'import AddOne from tools; [AddOne] work(int x) returns int { return x; }',
}, '5\n'));

test('annotated native functions retain the unsafe requirement and wrap the native call', () => {
  const app = `interceptor Show() { around(string text) returns c_int { return next(text="before native " + text); } }
    [Show] extern C puts(string text) returns c_int;`;
  assert.ok(issues({ 'main.aug': 'import puts from app; puts(text="hello");', 'app.aug': app })
    .some(issue => issue.code === 'FFI'));
  runs({ 'main.aug': 'import puts from app; unsafe { puts(text="hello"); }', 'app.aug': app }, 'before native hello\n');
});

test('generic inferred and explicit interceptor inputs work with nested collection types', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import length from app; items to List<int>(1, 2); print(value=length(items=items));`,
  'app.aug': `import Console from august.io
interceptor Count<T>() {
      around(resolve Console console, List<T> values) returns int  uses Console.write { console.write(value=values.length()); return next(); }
    }
    [Count<int>(values=items)] length(resolve Console console, List<int> items) returns int  uses Console.write { return items.length(); }`,
}, '2\n2\n'));

test('owned return contracts survive an interceptor chain', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import create from app; import Resource from app;
    own Resource resource to create(); resource.show();`,
  'app.aug': `import Console from august.io
interface Disposable { show(resolve Console console) uses Console.write ; drop(); }
    Resource() implements Disposable {
      show(resolve Console console)  uses Console.write { console.write(value="resource"); } drop() {  }
    }
    interceptor Wrap<T>() { around() returns own T { return next(); } }
    [Wrap] create() returns own Resource { return Resource(); }`,
}, 'resource\n', 1));

test('interceptor constructor DI cycles are rejected', () => {
  const found = issues({
    'main.aug': `import Service from app; import App from app; implement Service with App;`,
    'app.aug': `interface Service {} interceptor Cycle<T>(resolve Service service) {
      around() returns T { return next(); }
    } [Cycle] App(resolve Service service) implements Service {}`,
  });
  assert.ok(found.some(issue => issue.code === 'DI' && /Dependency cycle/.test(issue.message)));
});

test('interceptor mapping, tag, around, and next hover preserve Javadoc and inferred types', () => withProject({
  'main.aug': '',
  'validators.aug': `/** Adjusts a numeric input. */
    interceptor Adjust<T>() {
      /** Wrap the target.
       * @param y The selected number.
       */
      around(int y) returns T { return next(y=y + 1); }
    }`,
  'app.aug': `import Adjust from validators;
    /** Formats a value.
     * @param x The original number.
     */
    [Adjust(y=x)]
    format(int x, string name) returns string { return name; }`,
}, root => {
  const app = `import Adjust from validators;
    /** Formats a value.
     * @param x The original number.
     */
    [Adjust(y=x)]
    format(int x, string name) returns string { return name; }`;
  const tag = app.indexOf('[Adjust');
  const hover = offset => JSON.parse(command(root, 'hover', 'app.aug', app, offset).stdout);
  assert.match(hover(tag + 1).documentation, /Adjusts a numeric input/);
  assert.match(hover(tag + 1).documentation, /T = string/);
  assert.match(hover(app.indexOf('y=x')).documentation, /selected number/);
  assert.match(hover(app.indexOf('y=x') + 2).documentation, /original number/);
  assert.match(hover(app.indexOf('format(')).documentation, /Formats a value/);
  const validators = `/** Adjusts a numeric input. */
    interceptor Adjust<T>() {
      /** Wrap the target. @param y The selected number. */
      around(int y) returns T { return next(y=y + 1); }
    }`;
  const next = JSON.parse(command(root, 'hover', 'validators.aug', validators, validators.indexOf('next(')).stdout);
  assert.match(next.detail, /next\(y=int\) returns T/);
  assert.match(next.documentation, /at most one/);
  const around = JSON.parse(command(root, 'hover', 'validators.aug', validators, validators.indexOf('around(')).stdout);
  assert.match(around.documentation, /Wrap the target/);
}));

test('tag completion suggests interceptors and both sides of argument mappings', () => withProject({
  'main.aug': '',
  'app.aug': `interceptor Adjust() { around(int y) returns int { return next(); } }
    [Adjust(y=x)] format(int x) returns int { return x; }`,
}, root => {
  const source = `interceptor Adjust() { around(int y) returns int { return next(); } }
    [Adjust(y=x)] format(int x) returns int { return x; }`;
  const items = offset => JSON.parse(command(root, 'complete', 'app.aug', source, offset).stdout);
  assert.equal(items(source.indexOf('[Adjust') + 1).find(item => item.label === 'Adjust')?.kind, 'interceptor');
  assert.equal(items(source.indexOf('y=x')).find(item => item.label === 'y')?.insertText, 'y=');
  assert.ok(items(source.indexOf('y=x') + 2).some(item => item.label === 'x'));
  const nextItems = items(source.indexOf('next(') + 5);
  assert.equal(nextItems.find(item => item.label === 'y')?.insertText, 'y');
  const partial = 'interceptor Adjust<T>() { around(int y) returns T { next(';
  const unfinished = JSON.parse(command(root, 'complete', 'app.aug', partial, partial.length).stdout);
  assert.ok(unfinished.some(item => item.label === 'y'), JSON.stringify(unfinished));
}));

test('navigation from tags and mappings finds interceptor and parameter declarations', () => withProject({
  'main.aug': '',
  'validators.aug': 'interceptor Adjust() { around(int y) returns int { return next(); } }',
  'app.aug': 'import Adjust from validators; [Adjust(y=x)] format(int x) returns int { return x; }',
}, root => {
  const source = 'import Adjust from validators; [Adjust(y=x)] format(int x) returns int { return x; }';
  const at = offset => JSON.parse(command(root, 'definition', 'app.aug', source, offset).stdout);
  assert.equal(at(source.indexOf('[Adjust') + 1).file, join(root, 'validators.aug'));
  assert.equal(at(source.indexOf('y=x')).name, 'y');
  assert.equal(at(source.indexOf('y=x')).file, join(root, 'validators.aug'));
  assert.equal(at(source.indexOf('y=x') + 2).name, 'x');
  assert.equal(at(source.indexOf('y=x') + 2).file, join(root, 'app.aug'));
}));

test('quick fixes import interceptors and migrate process to around', () => withProject({
  'main.aug': '',
  'validators.aug': 'interceptor Adjust() { around() {} }',
  'app.aug': '[Adjust] work() {}',
}, root => {
  const source = '[Adjust] work() {}';
  const fixes = JSON.parse(command(root, 'fixes', 'app.aug', source).stdout);
  assert.ok(fixes.some(fix => /Import Adjust/.test(fix.title)));
  const old = 'interceptor Old() { process() { print(value="old"); } }';
  const migrated = JSON.parse(command(root, 'fixes', 'app.aug', old).stdout);
  assert.ok(migrated.some(fix => fix.title === 'Rename process to around'));
}));

test('interceptor names and tags receive semantic decorator tokens', () => withProject({
  'main.aug': '', 'app.aug': 'interceptor Wrap() { around() { next(); } } [Wrap] work() {}',
}, root => {
  const source = 'interceptor Wrap() { around() { next(); } } [Wrap] work() {}';
  const tokens = JSON.parse(command(root, 'semantic-tokens', 'app.aug', source).stdout);
  assert.equal(tokens.filter(token => token.type === 'decorator').length, 2);
  assert.ok(tokens.some(token => token.type === 'method' && token.declaration));
}));

test('generic interceptor inputs infer interface arguments from concrete classes', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Box from app; import read from app; print(value=read(box=Box<int>(value=7)));`,
  'app.aug': `import Console from august.io
interface IBox<T> { get() returns T; }
    Box<T>(T value) implements IBox<T> { get() returns T { return value; } }
    interceptor Inspect<T>() {
      around(resolve Console console, IBox<T> input) returns int  uses Console.write { console.write(value=input.get()); return next(); }
    }
    [Inspect(input=box)] read(resolve Console console, Box<int> box) returns int  uses Console.write { return box.get(); }`,
}, '7\n7\n'));

test('transparent constructor interception preserves a fresh result for ownership', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Resource from app; own Resource resource to Resource(); resource.show();`,
  'app.aug': `import Console from august.io
interceptor Wrap<T>() {
      around() returns T { T result to next(); return result; }
    }
    interface Disposable { show(resolve Console console) uses Console.write ; drop(); }
    [Wrap] Resource() implements Disposable {
      show(resolve Console console)  uses Console.write { console.write(value="resource"); } drop() {  }
    }`,
}, 'resource\n', 1));

test('constructor interception returning an existing input cannot claim fresh ownership', () => {
  const found = issues({ 'main.aug': '', 'app.aug': `
    interface Marker {}
    interceptor Reuse() { around(Resource existing) returns Resource { return existing; } }
    [Reuse] Resource(Resource existing) implements Marker {}
    adopt(Resource original) { own Resource resource to Resource(existing=original); }
  ` });
  assert.ok(found.some(issue => issue.code === 'OWN' && /new object or another owned value/.test(issue.message)), JSON.stringify(found));
});

test('nonvoid around bodies must return or throw on every path', () => {
  const found = issues({ 'main.aug': '', 'app.aug': `interceptor Incomplete() {
    around(bool flag) returns string { if flag { return next(); } }
  }` });
  assert.ok(found.some(issue => issue.code === 'INTERCEPTOR' && /every execution path/.test(issue.message)));
});

test('constructor and interceptor roots survive repeated garbage collection', () => runs({
  'main.aug': `import Box from app;
    int count to 0; int sum to 0;
    while count < 2500 { sum to sum + Box(value=1).get(); count to count + 1; }
    print(value=sum);`,
  'app.aug': `interceptor Pass<T>() { around() returns T { return next(); } }
    interface Readable { get() returns int; }
    [Pass] Box(int value) implements Readable {
    initialize {
        temporary = List<int>(value)
    }
    get() returns int {
        return value
    }
}`,
}, '2500\n'));

test('around resolve parameters use DI and are omitted from argument mappings', () => runs({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from app; import ScreenLogger from app; import work from app;
    implement Logger with ScreenLogger; print(value=work(x=4));`,
  'app.aug': `import Console from august.io
interface Logger { log(resolve Console console, string message) uses Console.write ; }
    ScreenLogger() implements Logger { log(resolve Console console, string message)  uses Console.write { console.write(value=message); } }
    interceptor Log<T>() {
      around(resolve Console console, resolve Logger logger) returns T  uses Console.write { logger.log(message="logged"); return next(); }
    }
    [Log] work(resolve Logger logger, resolve Console console, int x) returns int  uses Console.write { return x; }`,
}, 'logged\n4\n'));

test('private interceptor declarations cannot be imported or exported', () => {
  const found = issues({ 'main.aug': 'import _Wrap from helpers;',
    'helpers.aug': 'interceptor _Wrap() { around() { next(); } }' });
  assert.ok(found.some(issue => issue.code === 'PRIVATE' && /Cannot import private name/.test(issue.message)));
});

test('two next labels cannot override one target argument', () => {
  const found = issues({ 'main.aug': '', 'app.aug': `interceptor Alias() {
      around(int a, int b) returns int { return next(a=a, b=b); }
    }
    [Alias(a=x, b=x)] work(int x) returns int { return x; }` });
  assert.ok(found.some(issue => issue.code === 'NEXT' && /same target parameter/.test(issue.message)));
});
