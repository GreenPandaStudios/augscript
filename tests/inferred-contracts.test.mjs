import { prepareLibraryFixtures } from './library-fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync as fixtureSpawnSync } from 'node:child_process';
import { loadProject as fixtureLoadProject } from '../src/project.ts';
import { checkProject, tyName } from '../src/checker.ts';
import { SemanticWorkspace } from '../src/semantic.ts';
import { generateSpecs } from '../src/spec.ts';
import { generateOpenApi } from '../src/openapi.ts';

function project(source, main, action) {
  const root = mkdtempSync(join(tmpdir(), 'aug-contracts-'));
  try {
    writeFileSync(join(root, 'main.aug'), main);
    const file = join(root, 'work.aug'); writeFileSync(file, source);
    const checked = checkProject(loadProject(root));
    const method = name => checked.project.scopes.get(file).get(name).node;
    action({root, file, checked, method, issues: checked.diagnostics.filter(issue => issue.severity !== 'warning')});
  } finally { rmSync(root, {recursive:true, force:true}); }
}

test('public bodies infer forward generic results, capabilities and escaping errors; specs and hints agree', () => {
  const source = `import Console from august.io
emit(resolve Console console, string text) { console.write(value=text) }
load(bool fail) { return _load(fail) }
_load(bool fail) { if fail { throw FileError() } return "ready" }
identity<T>(T value) { return value }
numbers() { return [identity(value=1), 2] }
safe() { try { return load(fail=true) } catch FileError error { return "fallback" } }
maybe(bool present) { if present { return "ready" } return null }
`;
  project(source, '', ({root, file, checked, method, issues}) => {
    assert.deepEqual(issues, []);
    assert.equal(tyName(checked.callableContracts.get(method('numbers')).result), 'List<int>');
    assert.equal(tyName(checked.callableContracts.get(method('identity')).result), 'T');
    assert.equal(tyName(checked.callableContracts.get(method('maybe')).result), 'optional string');
    assert.deepEqual(checked.callableContracts.get(method('load')).errors.map(tyName), ['FileError']);
    assert.deepEqual(checked.callableContracts.get(method('safe')).errors, []);
    const view = new SemanticWorkspace(root).document(file), hints = view.inlayHints();
    assert.ok(hints.some(hint => hint.label === 'returns string unless FileError'));
    assert.ok(hints.some(hint => hint.label === 'uses Console.write'));
    assert.ok(hints.some(hint => hint.label === 'returns List<int>'));
    assert.ok(hints.every(hint => !hint.textEdits));
    assert.equal(hints.find(hint => hint.label === 'uses Console.write').offset, source.indexOf(' {'));
    assert.deepEqual(view.inlayHints(0, source.indexOf('load(bool fail)')), hints.slice(0,1));
    assert.match(view.hover(source.indexOf('load(bool fail)')).detail, /returns string unless FileError/);
    assert.doesNotMatch(view.format(), /uses|unless|returns/);
    const spec = generateSpecs(checked).find(output => output.path === file + '.md').text;
    assert.match(spec, /Failures can raise `FileError`/);
    assert.match(spec, /Console/);
  });
});

test('mutation inference follows aliases and calls while managed access and pure interfaces stay checked', () => {
  project(`interface Counter { increment() changes self; read() returns int }
Count(mutable int initial to _value) implements Counter {
 increment() { _value = _value + 1 }
 read() { return _value }
}
update(borrow Counter counter) { counter.increment() }
bad(Counter counter) { counter.increment() }
interface Pure { increment() }
Bad(mutable int initial to _value) implements Pure { increment() { _value = 2 } }
`, '', ({checked, method, issues}) => {
    assert.deepEqual(checked.effectContracts.get(method('update')).changes, ['counter']);
    assert.ok(issues.some(issue => issue.code === 'BORROW' || issue.code === 'MUTABILITY'), JSON.stringify(issues));
    assert.ok(issues.some(issue => /interface signature/.test(issue.message)), JSON.stringify(issues));
    assert.ok(!issues.some(issue => /must declare changes/.test(issue.message)), JSON.stringify(issues));
  });
});

test('explicit contracts remain assertions; unhandled inferred errors are checked in main', () => {
  project(`import Console and FileReader from august.io
wrong() returns void { return 1 }
read(resolve FileReader files, string path) unless FileError { return files.read(path) }
limited(resolve Console console, resolve FileReader files) uses console.write { return files.read(path="x") }
`, 'import read from work\nimport FileReader and NativeFileReader from august.io\nimplement FileReader with NativeFileReader\nvalue = read(path="missing")', ({issues}) => {
    assert.ok(issues.some(issue => /Expected return void, got int/.test(issue.message)), JSON.stringify(issues));
    assert.ok(issues.some(issue => issue.code === 'EFFECT' && /limited is pure/.test(issue.message)), JSON.stringify(issues));
    assert.ok(issues.some(issue => issue.code === 'THROWS' && issue.file.endsWith('main.aug')), JSON.stringify(issues));
  });
});

test('recursive results need an anchor and inferred results still require all paths to return', () => {
  project(`first() { return second() }
second() { return first() }
partial(bool yes) { if yes { return 1 } }
inconsistent(bool yes) { if yes { return 1 } return "wrong" }
`, '', ({issues}) => {
    assert.ok(issues.some(issue => issue.code === 'INFERENCE' && /first/.test(issue.message)), JSON.stringify(issues));
    assert.ok(issues.some(issue => /partial must return/.test(issue.message)), JSON.stringify(issues));
    assert.ok(issues.some(issue => /Expected return int, got string/.test(issue.message)), JSON.stringify(issues));
  });
});

test('cached editor revisions infer afresh without mutating parsed source or old views', () => {
  project('answer() { return 7 }', '', ({root,file}) => {
    const workspace = new SemanticWorkspace(root), first = workspace.document(file);
    const next = workspace.document(file, {text:'answer() { return "seven" }',version:2});
    assert.match(first.inlayHints()[0].label, /returns int/);
    assert.match(next.inlayHints()[0].label, /returns string/);
    assert.deepEqual(next.diagnostics, []);
    assert.equal(workspace.document(file), next);
  });
});

test('inferred endpoint results generate a typed OpenAPI response', () => {
  project('record Message(string text)\nendpoint GET "/message" as message() { return Message(text="hello") }',
    'import message from work\nserve message on port 9876', ({checked, issues}) => {
      assert.deepEqual(issues, []);
      const result = generateOpenApi(checked);
      assert.deepEqual(result.diagnostics, []);
      assert.ok(JSON.stringify(result).includes('Message_'));
    });
});

test('concise contracts compile to native C, preserve mutation, checked errors and generic values', () => {
  project(`interface Counter { increment() changes self; read() returns int }
Count(mutable int initial to _value) implements Counter {
 increment() { _value = _value + 1 }
 read() { return _value }
}
update(borrow Counter counter) { counter.increment() }
identity<T>(T value) { return value }
load() { throw FileError() }
`, `import Count and update and identity and load from work
counter = Count(initial=4)
borrow counter { update(counter) }
print(value=identity(value=counter.read()))
try { load() } catch FileError error { print(value="failed") }
`, ({root,issues}) => {
    assert.deepEqual(issues, []);
    const result = spawnSync(process.execPath, ['bin/aug.mjs','run',root], {encoding:'utf8'});
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(result.stdout, '5\nfailed\n');
  });
});

test('a forwarding interceptor infers the target result independently for each application', () => {
  project(`interceptor Forward() { around() { return next() } }
[Forward] number() { return 7 }
[Forward] word() { return "seven" }
`, 'import number and word from work\nprint(value=number())\nprint(value=word())', ({root,issues}) => {
    assert.deepEqual(issues, []);
    const result = spawnSync(process.execPath, ['bin/aug.mjs','run',root], {encoding:'utf8'});
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(result.stdout, '7\nseven\n');
  });
});

test('Javadoc checks inferred results and errors, and generic method contracts supply result context', () => {
  project(`/** Read a value. @return Ready text. @throws FileError On failure. */
load() { throw FileError(); return "ready" }
interface Identity { value<T>(T input) returns T }
Echo() implements Identity { value<U>(U input) { return input } }
`, '', ({issues}) => { assert.deepEqual(issues, []); });
});

test('record validation infers checked failures; construction stays pure and main handles them', () => {
  project(`record Positive(int value) {
 initialize { if value < 0 { throw FileError() } }
}
`, 'import Positive from work\nPositive(value=-1)', ({root,file,checked,issues}) => {
    assert.ok(issues.some(issue => issue.code === 'THROWS' && issue.file.endsWith('main.aug')), JSON.stringify(issues));
    const record = checked.project.scopes.get(file).get('Positive').node;
    assert.deepEqual(checked.constructorContracts.get(record).errors.map(tyName), ['FileError']);
    const view = new SemanticWorkspace(root).document(file);
    assert.ok(view.inlayHints().some(hint => hint.label === 'unless FileError'));
    writeFileSync(join(root,'main.aug'), 'import Positive from work\ntry { Positive(value=-1) } catch FileError error { print(value="rejected") }');
    const result = spawnSync(process.execPath, ['bin/aug.mjs','run',root], {encoding:'utf8'});
    assert.equal(result.status,0,result.stdout+result.stderr);
    assert.equal(result.stdout,'rejected\n');
  });
});

test('HTTP policies infer only their mapped capability operations; explicit limits still apply', () => {
  const source = `import Authentication from web
[RequireLogin(authentication=auth)]
endpoint GET "/" as home(resolve Authentication auth) { return "ok" }
`;
  project(source, '', ({root,file,checked,method,issues}) => {
    assert.deepEqual(issues, []);
    const uses = [...checked.effectContracts.get(method('home')).uses.values()].map(effect => `${effect.source}.${effect.operation}`);
    assert.deepEqual(uses, ['Authentication.authenticate']);
    const hints = new SemanticWorkspace(root).document(file).inlayHints();
    assert.ok(hints.some(hint => /uses Authentication.authenticate/.test(hint.label)));
  });
});

test('inherited default bodies and nested interceptor errors participate in the inference fixed point', () => {
  project(`interface Value { read() { return 7 } }
Default() implements Value {}
read() { item = Default(); return item.read() }
interceptor Failure() { around() { throw FileError(); return next() } }
[Failure] inner() { return 1 }
interceptor Outer() { around() { inner(); return next() } }
[Outer] outer() { return 2 }
`, '', ({checked,method,issues}) => {
    assert.deepEqual(issues, []);
    assert.equal(tyName(checked.callableContracts.get(method('read')).result), 'int');
    assert.deepEqual(checked.interceptorPlans.get(method('outer'))[0].errors.map(tyName), ['FileError']);
    assert.equal(checked.callableContracts.get(method('outer')).errors.length, 0);
  });
});

test('empty result literals need an anchor; other returns can supply their item type', () => {
  project('empty() { return [] }\nmaybe(bool yes) { if yes { return [] } return [1] }', '', ({checked,method,issues}) => {
    assert.ok(issues.some(issue => issue.code === 'INFERENCE' && /empty/.test(issue.message)),JSON.stringify(issues));
    assert.equal(tyName(checked.callableContracts.get(method('maybe')).result),'List<int>');
    assert.ok(!issues.some(issue => issue.line === 2),JSON.stringify(issues));
  });
});

test('pure local synchronized storage needs no artificial effect clause', () => {
  project('local() { storage = Shared(value=[1]); lock storage as values { values.append(value=2) } }', '', ({issues}) => {
    assert.deepEqual(issues, []);
  });
});

test('long inferred capability contracts collapse inline and remain complete in tooltips', () => {
  const names = Array.from({length:5}, (_, index) => 'writeDetailedOperation' + index);
  const source = `capability Output { ${names.map(name => `${name}() uses Output.${name}`).join(';')} }\nemit(resolve Output output) { ${names.map(name => `output.${name}()`).join(';')} }`;
  project(source, '', ({root,file,issues}) => {
    assert.deepEqual(issues, []);
    const hint = new SemanticWorkspace(root).document(file).inlayHints()[0];
    assert.equal(hint.label,'uses 5 operations');
    for(const name of names) assert.ok(hint.tooltip.includes('Output.'+name));
  });
});

function spawnSync(command, args, options) {
  if (args?.[0]?.endsWith("aug.mjs") && args[2]) prepareLibraryFixtures(args[2]);
  return fixtureSpawnSync(command, args, options);
}

function loadProject(root, ...args) { prepareLibraryFixtures(root); return fixtureLoadProject(root, ...args); }
