import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadProject } from '../src/project.ts';
import { checkProject } from '../src/checker.ts';
import { SemanticWorkspace } from '../src/semantic.ts';

function project(source, action) {
  const root = mkdtempSync(join(tmpdir(), 'aug-effects-'));
  try {
    writeFileSync(join(root, 'main.aug'), '');
    const file = join(root, 'work.aug'); writeFileSync(file, source);
    const checked = checkProject(loadProject(root));
    action({ root, file, checked, issues: checked.diagnostics.filter(issue => issue.severity !== 'warning') });
  } finally { rmSync(root, { recursive: true, force: true }); }
}
const declarations = `import Console from august.io
interface Logger { log(string message) uses Console.write }
ConsoleLogger(resolve Console console) implements Logger {
    log(string message) { _emit(console, message) }
}
_emit(Console console, string message) { _last(console, message) }
_last(Console console, string message) { console.write(value=message) }
`;

test('implementations and forward private helpers infer capabilities; hover and explain expose them', () => {
  project(declarations + 'emit(Console console, string message) uses Console.write { _emit(console, message) }\n', ({ root, file, checked, issues }) => {
    assert.deepEqual(issues, []);
    const type = checked.project.scopes.get(file).get('ConsoleLogger').node;
    const method = type.methods[0], contract = checked.effectContracts.get(method);
    assert.equal(contract.inferred, true);
    assert.deepEqual([...contract.uses.values()].map(effect => `${effect.source}.${effect.operation}`), ['Console.write']);
    const view = new SemanticWorkspace(root).document(file);
    const hover = view.hover(declarations.indexOf('log(string message) {'));
    assert.match(hover.documentation, /Inferred capabilities/);
    assert.match(hover.documentation, /Console.write/);
    assert.ok(JSON.stringify(view.describe()).includes('"inferredEffects":true'));
  });
});

test('inference still enforces pure interfaces and public function contracts', () => {
  project(declarations.replace('log(string message) uses Console.write', 'log(string message)') +
    'emit(Console console, string message) { _emit(console, message) }\n', ({ issues }) => {
    assert.ok(issues.some(issue => issue.message.includes('signature') || issue.message.includes('compatible')), JSON.stringify(issues));
    assert.ok(issues.some(issue => issue.code === 'EFFECT' && issue.message.includes('emit is pure')), JSON.stringify(issues));
  });
});

test('generic capability identities substitute through inferred helpers and recursive calls', () => {
  project(`capability Sink<T> { put(T value) uses Sink.put }
interface Store<T> { save(T value) uses Sink.put }
StoreImpl<T>(Sink<T> sink) implements Store<T> {
    save(T value) { _save(sink, value, recurse=false) }
}
_save<T>(Sink<T> sink, T value, bool recurse) {
    if recurse { _save(sink, value, recurse=false) }
    sink.put(value)
}
saveInt(Sink<int> sink) uses sink.put { _save(sink, value=7, recurse=false) }
`, ({ issues }) => { assert.deepEqual(issues, []); });
});

test('explicit uses is an upper bound; constructors and lock regions retain their checks', () => {
  project(`import Console from august.io
capability Reader { read() returns int uses Reader.read }
interface Value { read() returns int }
Bad(Console console) => { _write(console) } implements Value {
    read() returns int { return 1 }
}
_write(Console console) { console.write(value="hidden") }
_limited(Console console, Reader reader) uses reader.read { _write(console) }
locked(Console console) uses Console.write {
    storage = Shared(value=1)
    lock storage as value { _write(console) }
}
`, ({ issues }) => {
    assert.ok(issues.some(issue => issue.code === 'EFFECT' && issue.message.includes('Bad is pure')), JSON.stringify(issues));
    assert.ok(issues.some(issue => issue.code === 'EFFECT' && issue.message.includes('_limited is pure')), JSON.stringify(issues));
    assert.ok(issues.some(issue => issue.code === 'CONCURRENCY' && issue.message.includes('lock')), JSON.stringify(issues));
  });
});

test('type-changing recursive effect inference fails with a bounded actionable diagnostic', () => {
  project(`capability Sink<T> {
    put(T value) uses Sink.put
    next() returns Sink<List<T>>
}
_recur<T>(Sink<T> sink, T value) {
    sink.put(value)
    _recur(sink=sink.next(), value=[value])
}
`, ({ issues }) => {
    assert.ok(issues.some(issue => issue.message.includes('finite contract') && issue.message.includes('_recur')), JSON.stringify(issues));
    assert.ok(!issues.some(issue => issue.message.includes('finite contract') && issue.file.includes('stdlib')), JSON.stringify(issues));
  });
});
