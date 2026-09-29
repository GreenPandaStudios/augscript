import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const cli = resolve('bin/aug.mjs');

function withProject(files, check) {
  const root = mkdtempSync(join(tmpdir(), 'aug-conformance-'));
  try {
    for (const [name, source] of Object.entries(files)) writeFileSync(join(root, name), source);
    check(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function aug(root, command, environment = {}) {
  return spawnSync(process.execPath, [cli, command, root], {
    encoding: 'utf8', timeout: 10000, env: { ...process.env, ...environment }
  });
}

function diagnostics(root) {
  const result = spawnSync(process.execPath, [cli, 'check', root, '--json'], { encoding: 'utf8' });
  assert.equal(result.status, 1, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}
const diagnosticCodes = root => diagnostics(root).map(issue => issue.code);

test('OWN-1: moving an owned value invalidates its old name and drops it once', () => {
  const resource = `interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
consume(own Resource item):
    pass
`;
  withProject({ 'operations.aug': resource, 'main.aug': `import Resource and consume from operations
scope:
    own Resource item = Resource()
    consume(item=item)
print(value="done")
` }, root => {
    const result = aug(root, 'run', { AUG_TRACE_DROPS: '1' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'done\n');
    assert.equal((result.stderr.match(/drop: Resource/g) ?? []).length, 1, result.stderr);
  });
  withProject({ 'operations.aug': resource, 'main.aug': `import Resource and consume from operations
own Resource item = Resource()
consume(item=item)
consume(item=item)
` }, root => assert.ok(diagnosticCodes(root).includes('OWN')));
});

test('OWN-2: a local owned value is dropped once when its scope throws', () => {
  withProject({
    'operations.aug': `interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
`,
    'main.aug': `import Resource from operations
try:
    scope:
        own Resource item = Resource()
        throw FileError()
catch FileError error:
    print(value="caught")
`
  }, root => {
    const result = aug(root, 'run', { AUG_TRACE_DROPS: '1' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'caught\n');
    assert.equal((result.stderr.match(/drop: Resource/g) ?? []).length, 1, result.stderr);
  });
});

test('SHARED-1: an owned Shared wrapper drops its transferred payload once', () => {
  withProject({
    'operations.aug': `interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
`,
    'main.aug': `import Resource from operations
scope:
    own Resource item = Resource()
    own Shared<Resource> state = Shared(value=item)
print(value="done")
`
  }, root => {
    const result = aug(root, 'run', { AUG_TRACE_DROPS: '1' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'done\n');
    assert.equal((result.stderr.match(/drop: Resource/g) ?? []).length, 1, result.stderr);
    assert.equal((result.stderr.match(/drop: Shared/g) ?? []).length, 1, result.stderr);
  });
  withProject({
    'operations.aug': `interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
`,
    'main.aug': `import Resource from operations
own Resource item = Resource()
own Shared<Resource> state = Shared(value=item)
item.drop()
`
  }, root => assert.ok(diagnosticCodes(root).includes('OWN')));
});

test('BORROW-1: a mutable loan excludes alias reads until its block exits', () => {
  withProject({ 'main.aug': `items = [1]
alias = items
borrow items:
    items.append(value=2)
    print(value=alias.length())
` }, root => assert.ok(diagnosticCodes(root).includes('BORROW')));
  withProject({ 'main.aug': `items = [1]
alias = items
borrow items:
    items.append(value=2)
print(value=alias.length())
` }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '2\n');
  });
});

test('TASK-1: a task read loan pins an alias until wait releases it', () => {
  const operations = `size(List<int> values) returns int:
    return values.length()
`;
  const prefix = `import size from operations
items = [1]
alias = items
scope:
    pending = start size(values=alias)
`;
  withProject({ 'operations.aug': operations, 'main.aug': prefix + `    borrow items:
        items.append(value=2)
    wait for pending
` }, root => {
    const codes = diagnosticCodes(root);
    assert.ok(codes.includes('BORROW'), codes.join(', '));
  });
  withProject({ 'operations.aug': operations, 'main.aug': prefix + `    wait for pending
    borrow items:
        items.append(value=2)
print(value=alias.length())
` }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '2\n');
  });
});

test('TASK-2: starting a child inside a borrow suspends the parent mutation right', () => {
  withProject({
    'operations.aug': `size(List<int> values) returns int:
    return values.length()
`,
    'main.aug': `import size from operations
items = [1]
scope:
    borrow items:
        pending = start size(values=items)
        items.append(value=2)
        wait for pending
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => issue.code === 'CONCURRENCY' && /mutate.*task/.test(issue.message)), JSON.stringify(issues));
  });
  withProject({
    'operations.aug': `size(List<int> values) returns int:
    return values.length()
touch(borrow List<int> values):
    pass
`,
    'main.aug': `import size and touch from operations
items = [1]
scope:
    borrow items:
        pending = start size(values=items)
        touch(values=items)
        wait for pending
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => issue.code === 'CONCURRENCY' && /mutable access.*task/.test(issue.message)), JSON.stringify(issues));
  });
});

test('TASK-3: a task reading self blocks a direct field write until wait', () => {
  withProject({
    'operations.aug': `interface Store:
    read() returns int
    update() changes self
StoreImpl() implements Store:
    mutable int _value = 1
    read() returns int:
        return _value
    update() changes self:
        scope:
            pending = start observe(store=self)
            _value = 2
            wait for pending
observe(Store store) returns int:
    return store.read()
`,
    'main.aug': `import StoreImpl from operations
store = StoreImpl()
borrow store:
    store.update()
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => issue.code === 'CONCURRENCY' && /mutate _value.*task/.test(issue.message)), JSON.stringify(issues));
  });
  withProject({
    'operations.aug': `interface Store:
    read() returns int
StoreImpl() implements Store:
    mutable int _value = 1
    initialize:
        scope:
            pending = start observe(store=self)
            _value = 2
            wait for pending
    read() returns int:
        return _value
observe(Store store) returns int:
    return store.read()
`,
    'main.aug': `import StoreImpl from operations
store = StoreImpl()
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => issue.code === 'CONCURRENCY' && /mutate _value.*task/.test(issue.message)), JSON.stringify(issues));
  });
});

test('TASK-4: every branch must wait before the parent regains mutation rights', () => {
  const operations = `size(List<int> values) returns int:
    return values.length()
`;
  const prefix = `import size from operations
items = [1]
scope:
    pending = start size(values=items)
`;
  withProject({ 'operations.aug': operations, 'main.aug': prefix + `    if true:
        wait for pending
    borrow items:
        items.append(value=2)
` }, root => assert.ok(diagnostics(root).some(issue => /Cannot borrow items while a task uses it/.test(issue.message))));
  withProject({ 'operations.aug': operations, 'main.aug': prefix + `    if true:
        wait for pending
    else:
        wait for pending
    borrow items:
        items.append(value=2)
print(value=items.length())
` }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '2\n');
  });
});

test('TASK-5: an inner scope join releases its capture before an outer mutation', () => {
  withProject({
    'operations.aug': `size(List<int> values) returns int:
    return values.length()
`,
    'main.aug': `import size from operations
items = [1]
scope:
    scope:
        pending = start size(values=items)
    borrow items:
        items.append(value=2)
print(value=items.length())
`
  }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '2\n');
  });
});

test('ERROR-1: starting defers a checked error until wait or implicit join', () => {
  const operations = `fail() returns int unless FileError:
    throw FileError()
`;
  withProject({ 'operations.aug': operations, 'main.aug': `import fail from operations
scope:
    pending = start fail()
    try:
        wait for pending
    catch FileError error:
        print(value="caught")
` }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'caught\n');
  });
  withProject({ 'operations.aug': operations, 'main.aug': `import fail from operations
scope:
    pending = start fail()
` }, root => assert.ok(diagnosticCodes(root).includes('THROWS')));
});

test('ERROR-2: a parent error stays primary while cancelled child cleanup fails', () => {
  withProject({
    'operations.aug': `spin() returns int unless HttpError:
    try:
        while true:
            pass
    always:
        throw HttpError()
ready() returns int:
    return 1
outer() unless FileError and HttpError:
    scope:
        running = start spin()
        quick = start ready()
        wait for quick
        throw FileError()
`,
    'main.aug': `import outer from operations
try:
    outer()
catch FileError error:
    print(value="parent")
catch HttpError error:
    print(value="child")
`
  }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'parent\n');
  });
});

test('CLEANUP-1: always executes before a returned result is observed', () => {
  withProject({
    'operations.aug': `import Console from august.io
answer(resolve Console output) returns int uses output.write:
    try:
        return 7
    always:
        output.write(value="cleanup")
`,
    'main.aug': `import answer from operations
import Console and SystemConsole from august.io
implement Console with SystemConsole
print(value=answer())
`
  }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'cleanup\n7\n');
  });
});

test('CLEANUP-2: returning from a scope joins its child before the caller resumes', () => {
  withProject({
    'operations.aug': `import Console from august.io
say(resolve Console output) uses output.write:
    output.write(value="child")
answer(resolve Console output) returns int uses output.write:
    scope:
        pending = start say()
        return 7
`,
    'main.aug': `import answer from operations
import Console and SystemConsole from august.io
implement Console with SystemConsole
print(value=answer())
`
  }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'child\n7\n');
  });
});

test('SYNTAX-1: braces and indentation preserve ownership and join behavior', () => {
  const operations = `double(int value) returns int:
    return value * 2
`;
  for (const [style, main] of Object.entries({
    indent: `import double from operations
scope:
    own List<int> values = [1]
    pending = start double(value=7)
    print(value=wait for pending)
`,
    braces: `import double from operations
scope {
    own List<int> values = [1]
    pending = start double(value=7)
    print(value=wait for pending)
}
`
  })) withProject({ 'operations.aug': operations, 'main.aug': main }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, `${style}: ${result.stderr}`);
    assert.equal(result.stdout, '14\n');
  });
});

test('CANCEL-1: an unhandled child error cancels siblings and runs always cleanup', () => {
  withProject({
    'operations.aug': `import Console from august.io
fail() returns int unless FileError:
    throw FileError()
spin(resolve Console output) uses output.write:
    try:
        while true:
            pass
    always:
        output.write(value="cleanup")
`,
    'main.aug': `import fail and spin from operations
import Console and SystemConsole from august.io
implement Console with SystemConsole
try:
    scope:
        running = start spin()
        broken = start fail()
        wait for running
catch FileError error:
    print(value="caught")
`
  }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'cleanup\ncaught\n');
  });
});
