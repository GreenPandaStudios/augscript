import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from './compiler-process.mjs';
import { languageHelp } from '../src/help.ts';
import { reservedKeywords } from '../src/lexer.ts';

const repository = resolve(import.meta.dirname, '..');
const cli = join(repository, 'bin', 'aug.mjs');

test('file icon theme gives main and export their own SVG marks', () => {
  const directory = join(repository, 'vscode', 'icons');
  const theme = JSON.parse(readFileSync(join(directory, 'augscript-icon-theme.json'), 'utf8'));
  assert.notEqual(theme.fileNames['main.aug'], theme.fileExtensions.aug);
  assert.notEqual(theme.fileNames['export.aug'], theme.fileExtensions.aug);
  assert.notEqual(theme.fileNames['main.aug'], theme.fileNames['export.aug']);
  for (const definition of Object.values(theme.iconDefinitions)) {
    const file = join(directory, definition.iconPath);
    assert.ok(existsSync(file), `${file} is missing`);
    assert.match(readFileSync(file, 'utf8'), /^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  }
});

test('every reserved keyword has descriptive hover help', () => {
  for (const word of reservedKeywords) {
    assert.equal(languageHelp[word]?.category, 'keyword', word);
    assert.ok(languageHelp[word].documentation.length > 30, word);
  }
});

function project(files) {
  const root = mkdtempSync(join(tmpdir(), 'augscript-test-'));
  for (const [name, source] of Object.entries(files)) {
    const path = join(root, name);
    mkdirSync(resolve(path, '..'), { recursive: true });
    writeFileSync(path, source);
  }
  return root;
}

function check(root) {
  const result = spawnSync(process.execPath, [cli, 'check', root, '--json'], { encoding: 'utf8' });
  assert.equal(result.error, undefined);
  return { status: result.status, issues: JSON.parse(result.stdout) };
}

function run(root, traceDrops = false) {
  const result = spawnSync(process.execPath, [cli, 'run', root], { encoding: 'utf8',
    env: { ...process.env, ...(traceDrops ? { AUG_TRACE_DROPS: '1' } : {}) } });
  assert.equal(result.error, undefined);
  return result;
}

function withProject(files, callback) {
  const root = project(files);
  try { callback(root); } finally { rmSync(root, { recursive: true, force: true }); }
}

test('an implicit owned field assignment transfers its replacement', () => withProject({
  'holder.aug': `interface Item { value() returns int }
Resource(int number) implements Item { value() returns int { return number } }
interface Container { replace(own Resource replacement) changes self; value() returns int }
Holder(mutable own Resource item) implements Container {
    replace(own Resource replacement) { item = replacement }
    value() returns int { return item.value() }
}
`,
  'main.aug': `import Resource and Holder from holder
own Resource initial = Resource(number=1)
own Holder holder = Holder(item=initial)
own Resource replacement = Resource(number=7)
borrow holder { holder.replace(replacement) }
print(value=holder.value())
`
}, root => {
  const checked=check(root);assert.equal(checked.status,0,JSON.stringify(checked.issues));
  const result=run(root);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'7\n');
}));

function completionItems(root, file, source, offset = source.length) {
  const path = join(root, file);
  const result = spawnSync(process.execPath, [cli, 'complete', root, '--file', path,
    '--offset', String(offset), '--stdin-file', path], { encoding: 'utf8', input: source });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function editorCommand(root, command, file, source, offset) {
  const path = join(root, file);
  const args = [cli, command, root, '--file', path, '--stdin-file', path];
  if (offset !== undefined) args.push('--offset', String(offset));
  const result = spawnSync(process.execPath, args, { encoding: 'utf8', input: source });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('multi-file interface DI compiles and runs', () => withProject({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logging;
import ConsoleLogger from logging;
import Greeter from app;
implement Logger with ConsoleLogger;
implement app with Greeter;
resolve app to greeter;
greeter.greet(name="AugScript");
`,
  'logging/export.aug': 'export Logger from logger;\nexport ConsoleLogger from console;\n',
  'logging/logger.aug': `import Console from august.io
interface Logger { log(resolve Console console, string message) returns void uses Console.write ; }
`,
  'logging/console.aug': `import Console from august.io
import Logger from logger;
ConsoleLogger() implements Logger {
log(resolve Console console, string message) returns void  uses Console.write { console.write(value=message); }
}
`,
  'app/export.aug': 'export Greeter from greeter;\n',
  'app/greeter.aug': `import Console from august.io
import Logger from logging;
interface AugMarker_Greeter {} Greeter(resolve Logger logger) implements AugMarker_Greeter {
greet(resolve Console console, string name) returns void  uses Console.write { logger.log(message="Hello, " + name + "!"); }
}
`,
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'Hello, AugScript!\n');
}));

test('omitted return types are void for functions and interface methods', () => withProject({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Worker from worker;
import announce from worker;
Worker().work();
announce();
`,
  'worker.aug': `import Console from august.io
interface Work { work(resolve Console console) uses Console.write ; }
Worker() implements Work { work(resolve Console console)  uses Console.write { console.write(value="working"); return; } }
announce(resolve Console console)  uses Console.write { console.write(value="done"); }
`,
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'working\ndone\n');
  const source = 'import Worker from worker;\nworker = Worker();\nworker.';
  const method = completionItems(root, 'main.aug', source).find(item => item.label === 'work');
  assert.match(method?.detail ?? '', /returns void/);
}));

test('an explicitly void function cannot return a value', () => withProject({
  'main.aug': 'import value from helper;\nvalue();\n',
  'helper.aug': 'value() returns void { return 7; }\n',
}, root => {
  const result = check(root);
  assert.notEqual(result.status, 0);
  assert.ok(result.issues.some(issue => /Expected return void, got int/.test(issue.message)));
}));

test('resolve parameters inject bindings and labeled arguments ignore order', () => withProject({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from service;
import ConsoleLogger from service;
import Greeter from service;
import add from service;
implement Logger with ConsoleLogger;
greeter = Greeter(x=4);
greeter.greet(message="hello");
print(value=add(b=2, a=3));
`,
  'service.aug': `import Console from august.io
interface Logger { log(resolve Console console, string message) uses Console.write ; }
ConsoleLogger() implements Logger { log(resolve Console console, string message)  uses Console.write { console.write(value=message); } }
interface AugMarker_Greeter {} Greeter(resolve Logger logger, int x) implements AugMarker_Greeter {
  greet(resolve Console console, string message)  uses Console.write { logger.log(message=message); console.write(value=x); }
}
add(resolve Console console, resolve Logger logger, int a, int b) returns int  uses Console.write {
  logger.log(message="adding"); return a * 10 + b;
}
`,
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'hello\n4\nadding\n32\n');
}));

test('positional, duplicate, and injected arguments are rejected', () => withProject({
  'main.aug': 'import Logger from service;\nimport ConsoleLogger from service;\n' +
    'import Greeter from service;\nimplement Logger with ConsoleLogger;\n' +
    'Greeter(4);\nGreeter(x=1, x=2);\nGreeter(logger=ConsoleLogger(), x=3);\n',
  'service.aug': 'interface Logger {}\nConsoleLogger() implements Logger {}\n' +
    'interface AugMarker_Greeter {} Greeter(resolve Logger logger, int x) implements AugMarker_Greeter {}\n',
}, root => {
  const result = check(root);
  assert.notEqual(result.status, 0);
  assert.ok(result.issues.some(issue => /arguments require labels/.test(issue.message)));
  assert.ok(result.issues.some(issue => /Duplicate argument x/.test(issue.message)));
  assert.ok(result.issues.some(issue => /logger is resolved from DI/.test(issue.message)));
}));

test('a shared binding rejects constructors that need ordinary arguments', () => withProject({
  'main.aug': 'import Logger from service;\nimport ConsoleLogger from service;\n' +
    'import Greeter from service;\nimplement Logger with ConsoleLogger;\n' +
    'implement app with Greeter;\n',
  'service.aug': 'interface Logger {}\nConsoleLogger() implements Logger {}\n' +
    'interface AugMarker_Greeter {} Greeter(resolve Logger logger, int x) implements AugMarker_Greeter {}\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => issue.code === 'DI' &&
    /Greeter cannot be bound because x needs a constructor argument/.test(issue.message)));
}));

test('generic resolve parameters find a concrete interface binding', () => withProject({
  'main.aug': 'import Repository from types;\nimport NumberRepository from types;\n' +
    'import select from types;\nimplement Repository<int> with NumberRepository;\n' +
    'print(value=select<int>(fallback=0));\n',
  'types.aug': 'interface Repository<T> { get() returns T; }\n' +
    'NumberRepository() implements Repository<int> { get() returns int { return 7; } }\n' +
    'select<T>(resolve Repository<T> repository, T fallback) returns T {\n' +
    '  return repository.get();\n}\n',
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '7\n');
}));

test('constructor and method labels select parameters independently of order', () => withProject({
  'main.aug': 'import Pair from pair;\n' +
    'pair to Pair(right=2, left=3);\n' +
    'print(value=pair.combine(right=4, left=5));\n',
  'pair.aug': 'interface AugMarker_Pair {} Pair(int left, int right) implements AugMarker_Pair {\n' +
    '  combine(int left, int right) returns int {\n' +
    '    return self.left * 1000 + self.right * 100 + left * 10 + right;\n' +
    '  }\n}\n',
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '3254\n');
}));

test('constructor body runs after labeled fields are initialized', () => withProject({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Greeter from types;
import SilentLogger from types;
Greeter(logger=SilentLogger()).greet();
`,
  'types.aug': `import Console from august.io
interface Logger { log(resolve Console console, string message) uses Console.write ; }
SilentLogger() implements Logger { log(resolve Console console, string message)  uses Console.write {} }
ConsoleLogger() implements Logger { log(resolve Console console, string message)  uses Console.write { console.write(value=message); } }
interface IGreeter { greet(resolve Console console) uses Console.write ; }
Greeter(Logger logger) implements IGreeter {
    initialize {
        logger = ConsoleLogger()
    }
    greet(resolve Console console) uses Console.write {
        logger.log(message="ready")
    }
}
`,
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'ready\n');
  const source = readFileSync(join(root, 'types.aug'), 'utf8');
  const fields = completionItems(root, 'types.aug', source, source.indexOf('logger =') + 3);
  assert.ok(fields.some(item => item.label === 'logger' && item.kind === 'property'));
}));

test('old class and function prefixes are rejected', () => withProject({
  'main.aug': '',
  'types.aug': 'interface IWorker {}\nclass Worker() implements IWorker {}\nfunction work();\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => /Remove class/.test(issue.message)));
  assert.ok(result.issues.some(issue => /Remove function/.test(issue.message)));
}));

test('bodyless bare headers are functions', () => withProject({
  'main.aug': '',
  'api.aug': 'greet(string name);\nload(string path) returns string;\n',
}, root => {
  assert.equal(check(root).status, 0);
  const tokens = editorCommand(root, 'semantic-tokens', 'api.aug',
    readFileSync(join(root, 'api.aug'), 'utf8'));
  assert.equal(tokens.filter(token => token.type === 'function' && token.declaration).length, 2);
}));

test('calling a bodyless top-level function is a compile error', () => withProject({
  'main.aug': 'import greet from api;\ngreet(name="Ada");\n',
  'api.aug': 'greet(string name);\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => issue.code === 'CALL' && /has no body/.test(issue.message)));
}));

test('bare function and method definitions compile while calls in main stay calls', () => withProject({
  'main.aug': 'import counter from counter;\nimport Counter from counter;\n' +
    'print(value=counter());\nvalue = Counter();\nprint(value=value.read());\n',
  'counter.aug': '/** Produces the starting count. */\n' +
    'counter() returns int { return 7; }\n' +
    'interface Readable { read() returns int; }\n' +
    'Counter() implements Readable {\n' +
    '  /** Reads the count. */\n' +
    '  read() returns int { return counter(); }\n' +
    '}\n',
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '7\n7\n');
  const source = readFileSync(join(root, 'counter.aug'), 'utf8');
  const method = editorCommand(root, 'hover', 'counter.aug', source,
    source.indexOf('read() returns int {') + 1);
  assert.match(method.documentation, /Reads the count/);
  const declarations = editorCommand(root, 'semantic-tokens', 'counter.aug', source)
    .filter(token => token.declaration);
  assert.ok(declarations.some(token => token.type === 'function'));
  assert.ok(declarations.some(token => token.type === 'method'));
}));

test('bare generic functions, void methods, and extern C declarations compile', () => withProject({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import identity from helpers;
import Greeter from helpers;
import puts from native;
print(value=identity<int>(value=5));
Greeter().greet();
unsafe { puts(text="from C"); }
`,
  'helpers.aug': `import Console from august.io
identity<T>(T value) returns T { return value; }
interface Greeting { greet(resolve Console console) uses Console.write ; }
Greeter() implements Greeting { greet(resolve Console console)  uses Console.write { console.write(value="hello"); } }
`,
  'native.aug': `extern C puts(string text) returns c_int;
`,
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '5\nhello\nfrom C\n');
}));

test('implement with, resolve to, and both assignment spellings compile and run', () => withProject({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logging;
import ConsoleLogger from logging;
import Greeter from app;
implement app with Greeter;
implement Logger with ConsoleLogger;
resolve app to greeter;
greeter.greet(name="AugScript");
int myInt to 7;
print(value=myInt);
myInt to myInt + 1;
print(value=myInt);
myInt = 9;
print(value=myInt);
`,
  'logging/export.aug': 'export Logger from logger;\nexport ConsoleLogger from console;\n',
  'logging/logger.aug': `import Console from august.io
interface Logger { log(resolve Console console, string message) returns void uses Console.write ; }
`,
  'logging/console.aug': `import Console from august.io
import Logger from logger;
ConsoleLogger() implements Logger {
log(resolve Console console, string message) returns void  uses Console.write { console.write(value=message); }
}
`,
  'app/export.aug': 'export Greeter from greeter;\n',
  'app/greeter.aug': `import Console from august.io
import Logger from logging;
interface AugMarker_Greeter {} Greeter(resolve Logger logger) implements AugMarker_Greeter {
greet(resolve Console console, string name) returns void  uses Console.write { logger.log(message="Hello, " + name + "!"); }
}
`,
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'Hello, AugScript!\n7\n8\n9\n');
}));

test('to works for typed generics, owned declarations, and member mutation', () => withProject({
  'main.aug': `import Counter from types;
import Resource from types;
try {
Counter counter to Counter(count=1);
borrow counter { counter.increment(); }
print(value=counter.value());
List<int> numbers to List<int>(3);
borrow numbers { numbers.append(value=4); }
print(value=numbers.get(index=1));
own Resource resource to Resource();

} catch IndexError error { print(value="unexpected index failure") }
`,
  'types.aug': `interface AugMarker_Counter {} Counter(mutable int count) implements AugMarker_Counter {
increment() returns void  changes self { borrow self { self.count to self.count + 1; } }
value() returns int { return count; }
}
interface AugMarker_Resource {} Resource() implements AugMarker_Resource { drop() returns void {  } }
`,
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '2\n4\n');
}));

test('generic interfaces, generic methods, and defaults compile and run', () => {
  const result = run(join(repository, 'examples', 'generics'));
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /generic method called/);
  assert.match(result.stdout, /inside a generic box/);
});

test('generic interface bindings construct in dependency order', () => {
  const result = run(join(repository, 'examples', 'generic-di'));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '7\n');
});

test('multiple interface inheritance uses both defaults', () => withProject({
  'main.aug': 'import Impl from types;\nvalue = Impl();\nprint(value=value.one());\nprint(value=value.two());\n',
  'types.aug': 'interface A { one() returns int { return 1; } }\ninterface B { two() returns int { return 2; } }\ninterface Combined extends A, B {}\nImpl() implements Combined {}\n',
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '1\n2\n');
}));

test('interface-derived errors satisfy Error', () => withProject({
  'main.aug': 'import fail from errors;\ntry { fail(); } catch Error error { print(value="caught"); }\n',
  'errors.aug': 'interface DomainError extends Error {}\nFailure() implements DomainError {}\nfail() returns void unless Failure { throw Failure(); }\n',
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'caught\n');
}));

test('ownership examples run and drop resources', () => {
  const drop = run(join(repository, 'examples', 'drop'), true);
  assert.equal(drop.status, 0, drop.stderr);
  assert.equal(drop.stdout, 'using resource\n');
  assert.equal(drop.stderr.match(/drop: (?:[^\n]+:)?Resource\n/g)?.length, 1);
  const transfer = run(join(repository, 'examples', 'ownership-transfer'), true);
  assert.equal(transfer.status, 0, transfer.stderr);
  assert.equal(transfer.stdout, 'consumed\nend of main\n');
  assert.equal(transfer.stderr.match(/drop: (?:[^\n]+:)?Resource\n/g)?.length, 2);
});

test('checked exception is caught at runtime', () => {
  const result = run(join(repository, 'examples', 'errors'));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'caught FileError\n');
});

test('checked constructor failure releases transferred fields and retains its declared error', () => withProject({
  'operations.aug': `interface Item:\n    pass\nResource() implements Item:\n    pass\nFailure(int code, string message) implements Error:\n    pass\nHolder(own Resource value) unless Failure implements Item:\n    initialize:\n        throw Failure(code=9, message="rejected")\n`,
  'main.aug': `import Resource and Holder and Failure from operations\ntry:\n    own Resource value = Resource()\n    Holder(value)\ncatch Failure error:\n    print(value=error.code)\nprint(value="done")\n`
}, root => {
  const result=run(root,true);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'9\ndone\n');
  assert.equal(result.stderr.match(/drop: (?:[^\n]+:)?Resource\n/g)?.length,1);
  assert.doesNotMatch(result.stderr,/drop: (?:[^\n]+:)?Holder\n/);
  const file=join(root,'main.aug'),source=readFileSync(file,'utf8');
  writeFileSync(file,source.slice(0,source.indexOf('try:'))+'own Resource value = Resource()\nHolder(value)\n');
  assert.ok(check(root).issues.some(issue=>issue.code==='THROWS'&&/Unhandled Failure/.test(issue.message)));
}));

test('partial constructor cleanup skips the completed-object drop method',()=>withProject({
  'operations.aug':`interface Item:\n    pass\nResource() implements Item:\n    pass\nFailure() implements Error:\n    pass\nfail() returns int unless Failure:\n    throw Failure()\nBroken(own Resource item) unless Failure implements Item:\n    int first = fail()\n    int second = 4\n    drop():\n        int value = second + 1\n`,
  'main.aug':`import Resource and Broken and Failure from operations\ntry:\n    own Resource item = Resource()\n    Broken(item)\ncatch Failure error:\n    print(value="constructor error")\n`
},root=>{
  const result=run(root,true);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'constructor error\n');
  assert.equal(result.stderr.match(/drop: (?:[^\n]+:)?Resource\n/g)?.length,1);assert.doesNotMatch(result.stderr,/drop: (?:[^\n]+:)?Broken\n/);
}));

test('C FFI call inside unsafe block runs', () => {
  const result = run(join(repository, 'examples', 'ffi'));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'hello from C FFI\n');
});

test('lists and maps compile and run', () => {
  const result = run(join(repository, 'examples', 'collections'));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '3\n4\ntrue\n42\n1\n');
});

test('logical operators skip the unneeded operand', () => withProject({
  'main.aug': `import Console and SystemConsole from august.io
implement Console with SystemConsole
import probe from helper;
print(value=false and probe());
print(value=true or probe());
`,
  'helper.aug': `import Console from august.io
probe(resolve Console console) returns bool  uses Console.write { console.write(value="called"); return true; }
`,
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'false\ntrue\n');
}));

test('text file IO works with checked FileError', () => withProject({
  'main.aug': 'try { write_file(content="saved", path="note.txt"); print(value=read_file(path="note.txt")); } catch FileError error { print(value="failed"); }\n',
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'saved\n');
}));

test('file IO failure reaches catch FileError', () => withProject({
  'main.aug': 'try { print(value=read_file(path="missing.txt")); } catch FileError error { print(value="missing"); }\n',
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, 'missing\n');
}));

test('main.yaml configures a release build and output name', () => withProject({
  'main.aug': 'print(value="configured");\n',
  'main.yaml': 'output: configured-app\noptimization: release\n',
}, root => {
  const result = spawnSync(process.execPath, [cli, 'build', root], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), join(root, '.aug-build', 'configured-app'));
  const program = spawnSync(result.stdout.trim(), [], { encoding: 'utf8' });
  assert.equal(program.status, 0, program.stderr);
  assert.equal(program.stdout, 'configured\n');
}));

test('definition command locates an imported declaration', () => withProject({
  'main.aug': 'import Service from services;\nvalue = Service();\n',
  'services.aug': 'Service() implements AugMarker_Service {} interface AugMarker_Service {}\n',
}, root => {
  const result = spawnSync(process.execPath, [cli, 'definition', root, '--file',
    join(root, 'main.aug'), '--name', 'Service'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    name: 'Service', file: join(root, 'services.aug'), line: 1, column: 1, kind: 'class',
  });
}));

test('ctrl-click from or a sibling module opens its source file', () => withProject({
  'main.aug': 'import Service from services;\nvalue = Service();\n',
  'services.aug': 'interface AugMarker_Service {} Service() implements AugMarker_Service {}\n',
}, root => {
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  for (const offset of [source.indexOf('from') + 1, source.indexOf('services') + 1]) {
    const target = editorCommand(root, 'definition', 'main.aug', source, offset);
    assert.deepEqual(target, { name: 'services', file: join(root, 'services.aug'),
      line: 1, column: 1, kind: 'module' });
  }
  const declaration = editorCommand(root, 'definition', 'main.aug', source,
    source.indexOf('Service') + 1);
  assert.equal(declaration.file, join(root, 'services.aug'));
  assert.equal(declaration.kind, 'class');
}));

test('ctrl-click a folder import opens its export.aug at the exported name', () => withProject({
  'main.aug': 'import Logger from logging;\n',
  'logging/export.aug': 'export Unrelated from other;\nexport Logger from logger;\n',
  'logging/logger.aug': 'interface Logger {}\n',
  'logging/other.aug': 'interface AugMarker_Unrelated {} Unrelated() implements AugMarker_Unrelated {}\n',
}, root => {
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  for (const offset of [source.indexOf('from') + 1, source.indexOf('logging') + 1]) {
    const target = editorCommand(root, 'definition', 'main.aug', source, offset);
    assert.deepEqual(target, { name: 'Logger', file: join(root, 'logging/export.aug'),
      line: 2, column: 1, kind: 'module' });
  }
  const exported = readFileSync(join(root, 'logging/export.aug'), 'utf8');
  for (const offset of [exported.lastIndexOf('from') + 1, exported.lastIndexOf('logger') + 1]) {
    const target = editorCommand(root, 'definition', 'logging/export.aug', exported, offset);
    assert.equal(target.file, join(root, 'logging/logger.aug'));
  }
  const declaration = editorCommand(root, 'definition', 'logging/export.aug', exported,
    exported.lastIndexOf('Logger') + 1);
  assert.equal(declaration.file, join(root, 'logging/logger.aug'));
  assert.equal(declaration.kind, 'interface');
}));

test('dotted import segments and folder exports navigate each folder', () => withProject({
  'main.aug': 'import Thing from parent.child;\n',
  'parent/export.aug': 'export folder child;\n',
  'parent/child/export.aug': 'export Thing from value;\n',
  'parent/child/value.aug': 'interface AugMarker_Thing {} Thing() implements AugMarker_Thing {}\n',
}, root => {
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  const parent = editorCommand(root, 'definition', 'main.aug', source,
    source.indexOf('parent') + 1);
  assert.equal(parent.file, join(root, 'parent/export.aug'));
  const child = editorCommand(root, 'definition', 'main.aug', source,
    source.indexOf('child') + 1);
  assert.equal(child.file, join(root, 'parent/child/export.aug'));
  const from = editorCommand(root, 'definition', 'main.aug', source,
    source.indexOf('from') + 1);
  assert.equal(from.file, join(root, 'parent/child/export.aug'));
  const parentSource = readFileSync(join(root, 'parent/export.aug'), 'utf8');
  const childExport = editorCommand(root, 'definition', 'parent/export.aug', parentSource,
    parentSource.indexOf('child') + 1);
  assert.equal(childExport.file, join(root, 'parent/child/export.aug'));
}));

test('definition uses unsaved import text and favors a sibling file over a folder', () => withProject({
  'main.aug': 'import Widget from other;\n',
  'widget.aug': 'interface AugMarker_Widget {} Widget() implements AugMarker_Widget {}\n',
  'widget/export.aug': 'export Widget from value;\n',
  'widget/value.aug': 'interface AugMarker_Widget {} Widget() implements AugMarker_Widget {}\n',
}, root => {
  const unsaved = 'import Widget from widget;\n';
  const target = editorCommand(root, 'definition', 'main.aug', unsaved,
    unsaved.indexOf('from') + 1);
  assert.equal(target.file, join(root, 'widget.aug'));
  const incomplete = 'import Widget from widget';
  const duringEdit = editorCommand(root, 'definition', 'main.aug', incomplete,
    incomplete.indexOf('from') + 1);
  assert.equal(duringEdit.file, join(root, 'widget.aug'));
}));

test('editor completion suggests typed members in an unfinished file', () => withProject({
  'main.aug': 'import Box from types;\nbox = Box(value=1);\nbox.',
  'types.aug': 'interface AugMarker_Box {} Box(int value) implements AugMarker_Box { get() returns int { return value; } }\n',
}, root => {
  const source = 'import Box from types;\nbox = Box(value=1);\nbox.';
  const result = spawnSync(process.execPath, [cli, 'complete', root, '--file',
    join(root, 'main.aug'), '--offset', String(source.length), '--stdin-file', join(root, 'main.aug')],
  { encoding: 'utf8', input: source });
  assert.equal(result.status, 0, result.stderr);
  const items = JSON.parse(result.stdout);
  assert.ok(items.some(item => item.label === 'get' && item.kind === 'method' &&
    item.signature.includes('returns int')));
  assert.ok(items.some(item => item.label === 'value' && item.kind === 'property'));
}));

test('editor completion suggests explicit DI bindings', () => withProject({
  'main.aug': 'import Service from types;\nbind app to Service;\nresolve ',
  'types.aug': 'interface AugMarker_Service {} Service() implements AugMarker_Service {}\n',
}, root => {
  const source = 'import Service from types;\nbind app to Service;\nresolve ';
  const result = spawnSync(process.execPath, [cli, 'complete', root, '--file',
    join(root, 'main.aug'), '--offset', String(source.length), '--stdin-file', join(root, 'main.aug')],
  { encoding: 'utf8', input: source });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(JSON.parse(result.stdout).some(item => item.label === 'app'));
}));

test('editor suggests ordinary argument labels and describes injected fields', () => withProject({
  'main.aug': 'import Greeter from service;\nGreeter(',
  'service.aug': 'interface Logger {}\ninterface AugMarker_Greeter {} Greeter(resolve Logger logger, int x, int y) implements AugMarker_Greeter {}\n',
}, root => {
  const first = 'import Greeter from service;\nGreeter(';
  const labels = completionItems(root, 'main.aug', first);
  assert.deepEqual(labels.map(item => item.label).sort(), ['x', 'y']);
  assert.ok(labels.every(item => item.insertText?.endsWith('=')));
  const second = 'import Greeter from service;\nGreeter(y=2, ';
  assert.deepEqual(completionItems(root, 'main.aug', second).map(item => item.label), ['x']);
  const symbol = completionItems(root, 'main.aug', 'import Greeter from service;\nGreeter')
    .find(item => item.label === 'Greeter');
  assert.match(symbol.documentation, /Injected inputs: resolve Logger logger/);
  assert.equal(symbol.signature, 'Greeter(x=int, y=int)');
}));

test('editor helps with implement, resolve to, and assignment to', () => withProject({
  'main.aug': 'import Service from types;\nimplement service with Service;\n' +
    'resolve service to app;\nint count to 7;\n',
  'types.aug': 'interface AugMarker_Service {} Service() implements AugMarker_Service {}\n',
}, root => {
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  for (const word of ['implement', 'with', 'resolve', 'to']) {
    const hover = editorCommand(root, 'hover', 'main.aug', source, source.indexOf(word) + 1);
    assert.ok(hover.documentation.length > 30, word);
  }
  const bindingSource = 'import Service from types;\nimplement service with ';
  const bindingItems = completionItems(root, 'main.aug', bindingSource);
  assert.ok(bindingItems.some(item => item.label === 'Service' && item.kind === 'class'));
  assert.ok(!bindingItems.some(item => item.label === 'print'));
  const assignmentSource = 'import Service from types;\nint count to ';
  const assignmentItems = completionItems(root, 'main.aug', assignmentSource);
  assert.ok(assignmentItems.some(item => item.label === 'print'));
}));

test('editor completion respects folder exports for imports', () => withProject({
  'main.aug': 'import Logger from ',
  'logging/export.aug': 'export Logger from logger;\n',
  'logging/logger.aug': 'interface Logger {}\n',
  'hidden/secret.aug': 'interface AugMarker_Secret {} Secret() implements AugMarker_Secret {}\n',
}, root => {
  const source = 'import Logger from ';
  const result = spawnSync(process.execPath, [cli, 'complete', root, '--file',
    join(root, 'main.aug'), '--offset', String(source.length), '--stdin-file', join(root, 'main.aug')],
  { encoding: 'utf8', input: source });
  assert.equal(result.status, 0, result.stderr);
  const items = JSON.parse(result.stdout);
  assert.ok(items.some(item => item.label === 'logging'));
  assert.ok(!items.some(item => item.label === 'hidden'));
}));

test('Javadoc from exported declarations appears in completion and hover data', () => withProject({
  'main.aug': 'import Logger from logging;\nLogger',
  'logging/export.aug': 'export Logger from logger;\n',
  'logging/logger.aug': '/** Application logging interface. */\ninterface Logger {}\n',
}, root => {
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  const symbol = completionItems(root, 'main.aug', source).find(item => item.label === 'Logger');
  assert.match(symbol.documentation, /Application logging interface/);
  const imported = completionItems(root, 'main.aug', 'import Log', 'import Log'.length)
    .find(item => item.label === 'Logger');
  assert.match(imported.documentation, /Application logging interface/);
}));

test('Javadoc tags enrich method and parameter hints', () => withProject({
  'main.aug': 'import Greeter from greeter;\ngreeter = Greeter();\ngreeter.',
  'greeter.aug': 'interface AugMarker_Greeter {} Greeter() implements AugMarker_Greeter {\n' +
    '  /** Greets a person with {@code hello}.\n' +
    '   * @param name The person to greet.\n' +
    '   * @return A greeting.\n' +
    '   * @throws FileError If writing fails.\n' +
    '   */\n' +
    '  greet(string name) returns string unless FileError { return name; }\n' +
    '}\n',
}, root => {
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  const method = completionItems(root, 'main.aug', source).find(item => item.label === 'greet');
  assert.match(method.documentation, /Greets a person with `hello`/);
  assert.match(method.documentation, /\*\*Returns\*\* A greeting/);
  assert.match(method.documentation, /\*\*Throws\*\*[\s\S]*`FileError`: If writing fails/);
  assert.deepEqual(method.parameterDocumentation, ['The person to greet.']);
}));

test('class methods inherit interface Javadoc and local parameters expose @param', () => withProject({
  'main.aug': 'import Worker from worker;\nworker = Worker();\nworker.',
  'worker.aug': '/** A worker. */\ninterface Work {\n' +
    '  /** Performs work.\n   * @param task A named task.\n   */\n' +
    '  work(string task) returns void;\n}\n' +
    'Worker() implements Work {\n' +
    '  work(string task) returns void { print(value=task); }\n}\n',
}, root => {
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  const method = completionItems(root, 'main.aug', source).find(item => item.label === 'work');
  assert.match(method.documentation, /Performs work/);
  assert.deepEqual(method.parameterDocumentation, ['A named task.']);
  const worker = readFileSync(join(root, 'worker.aug'), 'utf8');
  const offset = worker.indexOf('print(value=task)') + 'print(value=task'.length;
  const parameter = completionItems(root, 'worker.aug', worker, offset)
    .find(item => item.label === 'task');
  assert.match(parameter.documentation, /^A named task\./);
}));

test('Javadoc does not attach past another declaration', () => withProject({
  'main.aug': 'import second from helpers;\nsecond();\n',
  'helpers.aug': '/** First only. */\nfirst() returns void {}\n' +
    'second() returns void {}\n',
}, root => {
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  const second = completionItems(root, 'main.aug', source).find(item => item.label === 'second');
  assert.doesNotMatch(second.documentation ?? '', /First only/);
}));

test('hover explains keywords, punctuation, imported symbols, and Javadoc tags', () => withProject({
  'main.aug': 'import Logger from logging;\nLogger',
  'logging/export.aug': 'export Logger from logger;\n',
  'logging/logger.aug': '/** Logs messages.\n * @param message Text to log.\n */\n' +
    'interface Logger { log(string message) returns void; }\n',
}, root => {
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  const keyword = editorCommand(root, 'hover', 'main.aug', source, source.indexOf('import') + 1);
  assert.match(keyword.documentation, /Bring public declarations/);
  const semicolon = editorCommand(root, 'hover', 'main.aug', source, source.indexOf(';'));
  assert.match(semicolon.documentation, /Optional statement separator/);
  const imported = editorCommand(root, 'hover', 'main.aug', source, source.lastIndexOf('Logger') + 1);
  assert.match(imported.documentation, /Logs messages/);
  const declaration = readFileSync(join(root, 'logging/logger.aug'), 'utf8');
  const tag = editorCommand(root, 'hover', 'logging/logger.aug', declaration,
    declaration.indexOf('@param') + 1);
  assert.match(tag.documentation, /Document a parameter/);
}));

test('hover resolves class headers, method declarations, and built-in collection methods', () => withProject({
  'main.aug': 'import Worker from worker;\nworker = Worker(count=1);\nitems = List<int>(1);\nitems.get(index=0);\n',
  'worker.aug': '/** A worker.\n * @param count Number of runs.\n */\n' +
    'Worker(int count) implements AugMarker_Worker {\n' +
    '  /** Return the run count. */\n' +
    '  runs() returns int { return count; }\n}\ninterface AugMarker_Worker {}\n',
}, root => {
  const worker = readFileSync(join(root, 'worker.aug'), 'utf8');
  const field = editorCommand(root, 'hover', 'worker.aug', worker,
    worker.indexOf('int count') + 'int '.length);
  assert.match(field.documentation, /Number of runs/);
  const method = editorCommand(root, 'hover', 'worker.aug', worker,
    worker.indexOf('runs()') + 1);
  assert.match(method.documentation, /Return the run count/);
  const main = readFileSync(join(root, 'main.aug'), 'utf8');
  const type = editorCommand(root, 'hover', 'main.aug', main,
    main.indexOf('Worker(count=1)') + 1);
  assert.match(type.documentation, /A worker/);
  const member = editorCommand(root, 'hover', 'main.aug', main,
    main.indexOf('get(index=0)') + 1);
  assert.match(member.documentation, /zero-based position/);
}));

test('quick fix imports a visible declaration', () => withProject({
  'main.aug': 'Logger();\n',
  'logging/export.aug': 'export Logger from logger;\n',
  'logging/logger.aug': 'interface AugMarker_Logger {} Logger() implements AugMarker_Logger {}\n',
}, root => {
  const file = join(root, 'main.aug');
  const source = readFileSync(file, 'utf8');
  const fixes = editorCommand(root, 'fixes', 'main.aug', source);
  const fix = fixes.find(item => item.title === 'Import Logger from logging');
  assert.ok(fix);
  const edit = fix.edits[0];
  writeFileSync(file, source.slice(0, edit.start) + edit.text + source.slice(edit.end));
  assert.equal(check(root).status, 0);
}));

test('quick fix removes an obsolete declaration keyword', () => withProject({
  'main.aug': 'import Worker from worker;\nWorker().run();\n',
  'worker.aug': 'interface AugMarker_Worker {} Worker() implements AugMarker_Worker { function run() returns void {} }\n',
}, root => {
  const file = join(root, 'worker.aug');
  const source = readFileSync(file, 'utf8');
  const fixes = editorCommand(root, 'fixes', 'worker.aug', source);
  const fix = fixes.find(item => item.title === 'Remove function');
  assert.ok(fix, JSON.stringify(fixes));
  const edit = fix.edits[0];
  writeFileSync(file, source.slice(0, edit.start) + edit.text + source.slice(edit.end));
  assert.equal(check(root).status, 0);
}));

test('quick fixes wrap mutable access, C calls, and checked errors', () => {
  const cases = [
    {
      files: { 'main.aug': 'items = List<int>(1);\nitems.append(value=2);\n' },
      title: 'Wrap statement in borrow items block',
    },
    {
      files: { 'main.aug': 'import puts from native;\nputs(text="hello");\n',
        'native.aug': 'extern C puts(string text) returns int;\n' },
      title: 'Wrap statement in unsafe block',
    },
    {
      files: { 'main.aug': 'print(value=read_file(path="note.txt"));\n' },
      title: 'Catch FileError and report the failure',
    },
  ];
  for (const { files, title } of cases) withProject(files, root => {
    const file = join(root, 'main.aug');
    const source = readFileSync(file, 'utf8');
    const fixes = editorCommand(root, 'fixes', 'main.aug', source);
    const fix = fixes.find(item => item.title === title);
    assert.ok(fix, `${title}: ${JSON.stringify(fixes)}`);
    const edit = fix.edits[0];
    writeFileSync(file, source.slice(0, edit.start) + edit.text + source.slice(edit.end));
    assert.equal(check(root).status, 0, title);
  });
});

test('editor semantic tokens color declarations and member calls', () => withProject({
  'main.aug': 'import Box from types;\nbox = Box(value=1);\nprint(value=box.get());\n',
  'types.aug': 'interface AugMarker_Box {} Box(int value) implements AugMarker_Box { get() returns int { return value; } }\n',
}, root => {
  const result = spawnSync(process.execPath, [cli, 'semantic-tokens', root,
    '--file', join(root, 'main.aug')], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const tokens = JSON.parse(result.stdout);
  assert.ok(tokens.some(token => token.type === 'class'));
  assert.ok(tokens.some(token => token.type === 'variable'));
  assert.ok(tokens.some(token => token.type === 'method'));
  const declaration = editorCommand(root, 'semantic-tokens', 'types.aug',
    readFileSync(join(root, 'types.aug'), 'utf8'));
  assert.ok(declaration.some(token => token.type === 'class' && token.declaration));
}));

test('unexported folder cannot be imported', () => withProject({
  'main.aug': 'import Secret from hidden;\n',
  'hidden/secret.aug': 'interface AugMarker_Secret {} Secret() implements AugMarker_Secret {}\n',
}, root => {
  const result = check(root);
  assert.equal(result.status, 1);
  assert.ok(result.issues.some(issue => issue.code === 'IMPORT' && /does not export/.test(issue.message)));
}));

test('every crossed folder boundary must export its child', () => withProject({
  'main.aug': 'import Public from parent.child;\n',
  'parent/export.aug': 'export Public from missing;\n',
  'parent/child/export.aug': 'export Public from value;\n',
  'parent/child/value.aug': 'interface AugMarker_Public {} Public() implements AugMarker_Public {}\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => /does not export child folder child/.test(issue.message)));
}));

test('generic argument mismatch is rejected before C generation', () => withProject({
  'main.aug': 'import Box from types;\nbox = Box<int>(value="wrong");\n',
  'types.aug': 'interface AugMarker_Box {} Box<T>(T value) implements AugMarker_Box {}\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => /Expected int, got string/.test(issue.message)));
}));

test('unchecked thrown error is rejected', () => withProject({
  'main.aug': 'import fail from errors;\nfail();\n',
  'errors.aug': 'Failure() implements Error {}\nfail() returns void unless Failure { throw Failure(); }\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => issue.code === 'THROWS'));
}));

test('unchecked file error is rejected', () => withProject({
  'main.aug': 'print(value=read_file(path="missing.txt"));\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => issue.code === 'THROWS' && /FileError/.test(issue.message)));
  assert.ok(result.issues.some(issue => issue.code === 'THROWS' && /try\/catch/.test(issue.help)));
}));

test('statements outside main are rejected', () => withProject({
  'main.aug': 'import work from work;\nwork();\n',
  'work.aug': 'work() returns void {}\nprint(value="hidden side effect");\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => issue.code === 'MAIN' && /Executable statements/.test(issue.message)));
}));

test('C FFI call requires unsafe block', () => withProject({
  'main.aug': 'import puts from native;\nputs(text="hello");\n',
  'native.aug': 'extern C puts(string text) returns int;\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => issue.code === 'FFI' && /requires unsafe/.test(issue.message)));
}));

test('explicit mutable fields are public and require a caller borrow', () => withProject({
  'main.aug': 'import Box from types;\nbox = Box(value=1);\n' +
    'borrow box { box.value = 2; }\nprint(value=box.value);\n',
  'types.aug': 'interface AugMarker_Box {} Box(mutable int value) implements AugMarker_Box {}\n',
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '2\n');
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  const members = completionItems(root, 'main.aug', `${source}box.`);
  assert.ok(members.some(item => item.label === 'value' && item.kind === 'property'));
}));

test('underscore fields and methods are visible only inside their class', () => withProject({
  'main.aug': 'import Box from types;\nbox = Box(_value=2);\nprint(value=box.read());\n' +
    'print(value=box._value);\nbox._hidden();\n',
  'types.aug': 'interface Readable { read() returns int; }\n' +
    'Box(int _value) implements Readable {\n' +
    '  _hidden() returns int { return _value; }\n' +
    '  read() returns int { return self._hidden(); }\n}\n',
}, root => {
  const result = check(root);
  assert.equal(result.issues.filter(issue => issue.code === 'PRIVATE').length, 2);
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  const members = completionItems(root, 'main.aug', `${source}box.`);
  assert.ok(members.some(item => item.label === 'read'));
  assert.ok(!members.some(item => item.label === '_value' || item.label === '_hidden'));
  const declaration = readFileSync(join(root, 'types.aug'), 'utf8');
  const inside = completionItems(root, 'types.aug', declaration,
    declaration.indexOf('self._hidden') + 'self.'.length);
  assert.ok(inside.some(item => item.label === '_value' && item.kind === 'property'));
  assert.ok(inside.some(item => item.label === '_hidden' && item.kind === 'method'));
}));

test('private top-level names cannot cross files or be exported', () => withProject({
  'main.aug': 'import _Secret from types;\nimport Public from types;\nPublic();\n',
  'types.aug': 'interface ISecret {}\n_Secret() implements ISecret {}\n' +
    'Public() implements ISecret {}\n',
  'export.aug': 'export _Secret from types;\nexport Public from types;\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => issue.code === 'PRIVATE' && /import private name _Secret/.test(issue.message)));
  assert.ok(result.issues.some(issue => issue.code === 'PRIVATE' && /export private name _Secret/.test(issue.message)));
  const items = completionItems(root, 'main.aug', 'import ');
  assert.ok(!items.some(item => item.label === '_Secret'));
  assert.ok(items.some(item => item.label === 'Public'));
}));

test('private declarations work within their own file', () => withProject({
  'main.aug': 'import answer from types;\nprint(value=answer());\n',
  'types.aug': 'interface ISecret {}\n_Secret() implements ISecret {}\n' +
    '_helper() returns int { _Secret(); return 7; }\n' +
    'answer() returns int { return _helper(); }\n',
}, root => {
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '7\n');
}));

test('underscore modules and folders cannot be imported or exported', () => withProject({
  'main.aug': 'import Public from _types;\nimport Public from _hidden;\n',
  '_types.aug': 'interface IPrivate {}\nPublic() implements IPrivate {}\n',
  '_hidden/export.aug': 'export Public from types;\n',
  '_hidden/types.aug': 'interface IPrivate {}\nPublic() implements IPrivate {}\n',
  'export.aug': 'export Public from _types;\nexport folder _hidden;\n',
}, root => {
  const messages = check(root).issues.filter(issue => issue.code === 'PRIVATE').map(issue => issue.message);
  assert.ok(messages.some(message => /import from private module _types/.test(message)));
  assert.ok(messages.some(message => /import from private module _hidden/.test(message)));
  assert.ok(messages.some(message => /export from private module _types/.test(message)));
  assert.ok(messages.some(message => /export private folder _hidden/.test(message)));
}));

test('underscore binding keys stay in main.aug', () => withProject({
  'main.aug': 'import Service from services;\nimport use from helper;\n' +
    'implement _app with Service;\nresolve _app to local;\nuse();\n',
  'services.aug': 'interface IService {}\nService() implements IService {}\n',
  'helper.aug': 'use() { resolve _app; }\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => issue.code === 'PRIVATE' &&
    /Binding _app is private to main.aug/.test(issue.message)));
}));

test('underscore interface methods stay within their interface', () => withProject({
  'main.aug': 'import IWork from types;\nimport Work from types;\n' +
    'implement IWork with Work;\nresolve IWork to worker;\n' +
    'print(value=worker.run());\nworker._helper();\n',
  'types.aug': 'interface IWork {\n' +
    '  _helper() returns int { return 7; }\n' +
    '  run() returns int { return self._helper(); }\n}\n' +
    'Work() implements IWork {}\n',
}, root => {
  const result = check(root);
  assert.equal(result.issues.filter(issue => issue.code === 'PRIVATE').length, 1);
  const source = readFileSync(join(root, 'main.aug'), 'utf8');
  const members = completionItems(root, 'main.aug', `${source}worker.`);
  assert.ok(members.some(item => item.label === 'run'));
  assert.ok(!members.some(item => item.label === '_helper'));
}));

test('duplicate binding and dependency cycle are rejected', () => withProject({
  'main.aug': "import A from types;\nimport B from types;\nimplement a with A;\nimplement a with B;\nimplement b with B;\n",
  'types.aug': 'interface AugMarker_A {} A(resolve B b) implements AugMarker_A {}\ninterface AugMarker_B {} B(resolve A a) implements AugMarker_B {}\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => issue.code === 'DI' && /Duplicate binding/.test(issue.message)));
}));

test('dependency cycle is rejected without a duplicate binding', () => withProject({
  'main.aug': "import A from types;\nimport B from types;\nimport AImpl from types;\nimport BImpl from types;\nimplement A with AImpl;\nimplement B with BImpl;\n",
  'types.aug': 'interface A {}\ninterface B {}\nAImpl(resolve B b) implements A {}\nBImpl(resolve A a) implements B {}\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => issue.code === 'DI' && /Dependency cycle/.test(issue.message)));
}));

test('moving an owned value inside a branch invalidates later reads', () => withProject({
  'main.aug': 'import Resource from resource;\nimport consume from resource;\nown Resource item = Resource();\nif true { consume(item=item); }\nprint(value=item);\n',
  'resource.aug': 'interface AugMarker_Resource {} Resource() implements AugMarker_Resource {}\nconsume(own Resource item) returns void {}\n',
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => issue.code === 'OWN' && /moved value item/.test(issue.message)));
}));

test('non-boolean logical operands are rejected', () => withProject({
  'main.aug': "print(value=1 and 2);\n",
}, root => {
  const result = check(root);
  assert.ok(result.issues.some(issue => /requires bool operands/.test(issue.message)));
}));
