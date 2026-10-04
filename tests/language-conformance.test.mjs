import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from './compiler-process.mjs';

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
    assert.equal((result.stderr.match(/drop: (?:[^\n]+:)?Resource/g) ?? []).length, 1, result.stderr);
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
    assert.equal((result.stderr.match(/drop: (?:[^\n]+:)?Resource/g) ?? []).length, 1, result.stderr);
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
    assert.equal((result.stderr.match(/drop: (?:[^\n]+:)?Resource/g) ?? []).length, 1, result.stderr);
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

test('TASK-6: collection pressure cannot reclaim a resource captured by a child', () => {
  withProject({
    'operations.aug': `interface Readable:
    value() returns int
    drop()
Resource(int number) implements Readable:
    value() returns int:
        return number
    drop():
        pass
read(borrow Resource resource) returns int:
    return resource.value()
`,
    'main.aug': `import Resource and read from operations
scope:
    own Resource resource = Resource(number=7)
    pending = start read(resource=resource)
    int index = 0
    while index < 2500:
        trash = [index]
        index = index + 1
    print(value=wait for pending)
`
  }, root => {
    const result = aug(root, 'run', { AUG_TRACE_DROPS: '1' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '7\n');
    assert.equal((result.stderr.match(/drop: (?:[^\n]+:)?Resource/g) ?? []).length, 1, result.stderr);
  });
});

test('TASK-7: waiting for the last loop child does not release earlier captures', () => {
  withProject({
    'operations.aug': `inspect(List<int> values, int mode) returns int:
    if mode == 0:
        while true:
            pass
    return values.length()
`,
    'main.aug': `import inspect from operations
items = [1]
scope:
    optional Task<int> pending = null
    int index = 0
    while index < 2:
        pending = start inspect(values=items, mode=index)
        index = index + 1
    match pending:
        when null:
            pass
        when some current:
            wait for current
    borrow items:
        items.append(value=2)
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => /Cannot borrow items while a task uses it/.test(issue.message)), JSON.stringify(issues));
  });
});

test('TASK-8: an owned Shared wrapper cannot move while a child borrows it', () => {
  withProject({
    'operations.aug': `touch(borrow Shared<List<int>> state):
    pass
consume(own Shared<List<int>> state):
    pass
`,
    'main.aug': `import touch and consume from operations
scope:
    own Shared<List<int>> state = Shared(value=[1])
    pending = start touch(state=state)
    consume(state=state)
    wait for pending
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => issue.code === 'CONCURRENCY' || issue.code === 'BORROW'), JSON.stringify(issues));
  });
});

test('TASK-9: moving an owned Shared wrapper into its child transfers cleanup', () => {
  withProject({
    'operations.aug': `consume(own Shared<List<int>> state):
    pass
`,
    'main.aug': `import consume from operations
scope:
    own Shared<List<int>> state = Shared(value=[1])
    pending = start consume(state=state)
    wait for pending
`
  }, root => {
    const result = aug(root, 'run', { AUG_TRACE_DROPS: '1' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal((result.stderr.match(/drop: Shared/g) ?? []).length, 1, result.stderr);
  });
});

test('TASK-10: a child capture pins mutable nested fields through aliases', () => {
  withProject({
    'operations.aug': `interface BoxView:
    size() returns int
Box(mutable List<int> values) implements BoxView:
    size() returns int:
        return values.length()
observe(BoxView value) returns int:
    return value.size()
`,
    'main.aug': `import Box and observe from operations
box = Box(values=[1])
alias = box
scope:
    pending = start observe(value=box)
    borrow alias:
        alias.values.append(value=2)
    wait for pending
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => issue.code === 'CONCURRENCY' && /mutate/.test(issue.message)), JSON.stringify(issues));
  });
});

test('TASK-11: Shared construction cannot transfer a child-borrowed wrapper', () => {
  withProject({
    'operations.aug': `touch(borrow Shared<List<int>> state):
    pass
`,
    'main.aug': `import touch from operations
scope:
    own Shared<List<int>> state = Shared(value=[1])
    pending = start touch(state=state)
    own Shared<Shared<List<int>>> outer = Shared(value=state)
    wait for pending
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => /Cannot move state while a task uses it/.test(issue.message)), JSON.stringify(issues));
  });
});

test('TASK-12: owned rebinding cannot transfer a child-borrowed wrapper', () => {
  withProject({
    'operations.aug': `touch(borrow Shared<List<int>> state):
    pass
`,
    'main.aug': `import touch from operations
scope:
    own Shared<List<int>> state = Shared(value=[1])
    pending = start touch(state=state)
    own Shared<List<int>> transferred = state
    wait for pending
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => /Cannot move state while a task uses it/.test(issue.message)), JSON.stringify(issues));
  });
});

test('TASK-13: an owned return cannot outrun a child borrowing its value', () => {
  withProject({
    'operations.aug': `touch(borrow Shared<List<int>> state):
    pass
give(own Shared<List<int>> state) returns own Shared<List<int>>:
    scope:
        pending = start touch(state=state)
        return state
`,
    'main.aug': `import give from operations
own Shared<List<int>> result = give(state=Shared(value=[1]))
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => /Cannot move state while a task uses it/.test(issue.message)), JSON.stringify(issues));
  });
});

test('TASK-14: freeze waits for a child with mutable access', () => {
  withProject({
    'operations.aug': `change(borrow List<int> values) changes values:
    values.append(value=2)
`,
    'main.aug': `import change from operations
scope:
    own List<int> values = [1]
    pending = start change(values=values)
    freeze values as saved
    wait for pending
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => /Cannot read values while a task has mutable access/.test(issue.message)), JSON.stringify(issues));
  });
  withProject({
    'operations.aug': `change(borrow List<int> values) changes values:
    values.append(value=2)
`,
    'main.aug': `import change from operations
scope:
    own List<int> values = [1]
    pending = start change(values=values)
    wait for pending
    freeze values as saved
    print(value=saved.length())
`
  }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '2\n');
  });
});

test('TASK-15: waiting for one loop iteration does not release earlier children', () => {
  withProject({
    'operations.aug': `inspect(List<int> values, int mode) returns int:
    if mode == 0:
        while true:
            pass
    return values.length()
probe(borrow List<int> items) changes items:
    scope:
        optional Task<int> pending = null
        int index = 0
        while index < 2:
            pending = start inspect(values=items, mode=index)
            index = index + 1
        match pending:
            when null:
                return
            when some current:
                wait for current
        items.append(value=2)
`,
    'main.aug': `import probe from operations
items = [1]
borrow items:
    probe(items=items)
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => /task/.test(issue.message) && /mutate|borrow/.test(issue.message)), JSON.stringify(issues));
  });
});

test('TASK-16: a scope inside each loop iteration joins its own child', () => {
  withProject({
    'operations.aug': `size(List<int> values) returns int:
    return values.length()
`,
    'main.aug': `import size from operations
items = [1]
int index = 0
while index < 2:
    scope:
        pending = start size(values=items)
        wait for pending
    borrow items:
        items.append(value=index)
    index = index + 1
print(value=items.length())
`
  }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '3\n');
  });
});

test('TASK-17: throwing an owned error cannot outrun a child borrowing it', () => {
  withProject({
    'operations.aug': `Failure() implements Error:
    pass
inspect(Failure value):
    pass
fail(own Failure failure) unless Failure:
    scope:
        pending = start inspect(value=failure)
        throw failure
`,
    'main.aug': `import Failure and fail from operations
try:
    fail(failure=Failure())
catch Failure error:
    pass
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => /Cannot move failure while a task uses it/.test(issue.message)), JSON.stringify(issues));
  });
});

test('TASK-18: waiting for a dynamic collection element does not release sibling captures', () => {
  withProject({
    'operations.aug': `size(List<int> values) returns int:
    return values.length()
probe() unless IndexError:
    items = [1]
    scope:
        first = start size(values=items)
        second = start size(values=items)
        tasks = [first, second]
        int index = 0
        wait for tasks.get(index=index)
        borrow items:
            items.append(value=2)
`,
    'main.aug': `import probe from operations
try:
    probe()
catch IndexError error:
    pass
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => /Cannot borrow items while a task uses it/.test(issue.message)), JSON.stringify(issues));
  });
  withProject({
    'operations.aug': `size(List<int> values) returns int:
    return values.length()
probe() returns int:
    items = [1]
    scope:
        first = start size(values=items)
        second = start size(values=items)
        tasks = [first, second]
        wait for tasks
        borrow items:
            items.append(value=2)
    return items.length()
`,
    'main.aug': `import probe from operations
print(value=probe())
`
  }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '2\n');
  });
});

test('TASK-19: waiting for a task that references another task does not join both', () => {
  withProject({
    'operations.aug': `size(List<int> values) returns int:
    return values.length()
echo(List<Task<int>> tasks) returns List<Task<int>>:
    return tasks
probe():
    items = [1]
    scope:
        second = start size(values=items)
        tasks = [second]
        first = start echo(tasks=tasks)
        wait for first
        borrow items:
            items.append(value=2)
`,
    'main.aug': `import probe from operations
probe()
`
  }, root => {
    const issues = diagnostics(root);
    assert.ok(issues.some(issue => /Cannot borrow items while a task uses it/.test(issue.message)), JSON.stringify(issues));
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

test('ERROR-3: a public Task<T> parameter exposes Error at a helper wait', () => {
  const operations = `fail() returns int unless FileError:
    throw FileError()
observe(Task<int> pending) returns int unless Error:
    return wait for pending
`;
  withProject({
    'operations.aug': operations,
    'main.aug': `import fail and observe from operations
try:
    scope:
        pending = start fail()
        observe(pending=pending)
catch Error error:
    print(value="caught")
`
  }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'caught\n');
  });
  withProject({
    'operations.aug': operations.replace('observe(Task<int> pending) returns int unless Error:', 'observe(Task<int> pending) returns int:'),
    'main.aug': 'import observe from operations\n'
  }, root => {
    const result = spawnSync(process.execPath, [cli, 'explain', root, '--file', join(root, 'operations.aug'), '--json'], {encoding:'utf8'});
    assert.equal(result.status, 0, result.stderr);
    const facts = JSON.parse(result.stdout).contracts;
    assert.deepEqual(facts.find(fact => fact.name === 'observe').callables[0].errors, ['Error']);
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

test('CANCEL-2: an inner scope failure cancels outer siblings and joins cleanup', () => {
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
outer(resolve Console output) uses output.write unless FileError:
    scope:
        running = start spin()
        scope:
            broken = start fail()
`,
    'main.aug': `import outer from operations
import Console and SystemConsole from august.io
implement Console with SystemConsole
try:
    outer()
catch FileError error:
    print(value="caught")
`
  }, root => {
    const result = aug(root, 'run');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'cleanup\ncaught\n');
  });
});
