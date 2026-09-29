import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
const cli = resolve('bin/aug.mjs');
test('grouped waits observe all selected children including failed cancellation cleanup', () => {
  const root=mkdtempSync(join(tmpdir(),'aug-group-errors-'));
  try {
    writeFileSync(join(root,'main.aug'),'import outer from operations\nprint(value=outer())\n');
    writeFileSync(join(root,'operations.aug'),`fail() returns int unless FileError:
    throw FileError()
spin() returns int unless HttpError:
    try:
        while true:
            pass
    always:
        throw HttpError()
outer() returns string:
    scope:
        running = start spin()
        failing = start fail()
        try:
            wait for failing and running
        catch FileError error:
            pass
        catch HttpError error:
            pass
    return "joined"
`);
    const result=spawnSync(process.execPath,[cli,'run',root],{encoding:'utf8',timeout:5000});
    assert.equal(result.status,0,result.error?.message||result.stderr);
    assert.equal(result.stdout,'joined\n');
  } finally {rmSync(root,{recursive:true,force:true});}
});
test('task errors are checked at waits and implicit joins, rather than at scheduling', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-task-errors-'));
  try {
    writeFileSync(join(root, 'main.aug'), '');
    const failure = 'fail() returns int unless FileError:\n    throw FileError()\n';
    writeFileSync(join(root, 'operations.aug'), failure + `outer():
    scope:
        try:
            pending = start fail()
        catch FileError error:
            pass
`);
    assert.ok(checkProject(loadProject(root)).diagnostics.some(issue => issue.code === 'THROWS' && /FileError/.test(issue.message)), 'implicit join occurs outside the catch');
    writeFileSync(join(root, 'operations.aug'), failure + `outer():
    scope:
        pending = start fail()
        try:
            wait for pending
        catch FileError error:
            pass
`);
    assert.deepEqual(checkProject(loadProject(root)).diagnostics, [], 'observed failure is handled at the wait');
    writeFileSync(join(root, 'operations.aug'), failure + `outer():
    scope:
        pending = start fail()
        try:
            throw KeyError()
            wait for pending
        catch KeyError error:
            pass
        catch FileError error:
            pass
`);
    assert.ok(checkProject(loadProject(root)).diagnostics.some(issue => issue.code === 'THROWS' && /FileError/.test(issue.message)), 'an earlier caught error leaves the task for the join');
    writeFileSync(join(root, 'operations.aug'), failure + `spin():
    while true:
        pass
outer():
    scope:
        running = start spin()
        failing = start fail()
        wait for running
        try:
            wait for failing
        catch FileError error:
            pass
`);
    assert.ok(checkProject(loadProject(root)).diagnostics.some(issue => issue.code === 'THROWS' && /FileError/.test(issue.message)), 'a wait can observe an unhandled sibling failure');
  } finally {rmSync(root, {recursive:true, force:true});}
});
test('an unrelated owned local does not join children before a later cancellation', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-unrelated-resource-'));
  try {
    writeFileSync(join(root, 'operations.aug'), `interface Readable:
    value() returns int
Resource(int number) implements Readable:
    value() returns int:
        return number
spin():
    while true:
        pass
outer() unless FileError:
    scope:
        pending = start spin()
        if true:
            own Resource unrelated = Resource(number=1)
        throw FileError()
`);
    writeFileSync(join(root, 'main.aug'), 'import outer from operations\ntry:\n    outer()\ncatch FileError error:\n    print(value="caught")\n');
    const result = spawnSync(process.execPath, [cli, 'run', root], {encoding:'utf8', timeout:5000});
    assert.equal(result.status, 0, result.error?.message || result.stderr);
    assert.equal(result.stdout, 'caught\n');
  } finally {rmSync(root, {recursive:true, force:true});}
});
test('scope exit joins a child before dropping the owned resource it borrowed', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-task-resource-'));
  try {
    writeFileSync(join(root, 'operations.aug'), `interface Readable:
    value() returns int
Resource(int number) implements Readable:
    value() returns int:
        return number
    drop():
        pass
read(borrow Resource resource) returns int:
    return resource.value()
`);
    writeFileSync(join(root, 'main.aug'), `import Resource and read from operations
scope:
    own Resource resource = Resource(number=7)
    pending = start read(resource)
print(value="joined")
`);
    const result = spawnSync(process.execPath, [cli, 'run', root], {encoding:'utf8', timeout:5000});
    assert.equal(result.status, 0, result.error?.message || result.stderr);
    assert.equal(result.stdout, 'joined\n');
  } finally {rmSync(root, {recursive:true, force:true});}
});
test('long pure work inside a shared lock allows other children to finish afterward', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-lock-progress-'));
  try {
    writeFileSync(join(root, 'operations.aug'), `capability Counter:
    increment() uses Counter.increment
increment(Shared<Map<string, int>> state) uses Counter.increment:
    lock state as counts:
        int index = 0
        while index < 5000:
            index = index + 1
        match counts.get(key="done"):
            when null:
                pass
            when some done:
                counts.set(key="done", value=done + 1)
`);
    writeFileSync(join(root, 'main.aug'), `import increment from operations
state = Shared(value={"done": 0})
scope:
    first = start increment(state)
    second = start increment(state)
int done = 0
lock state as counts:
    match counts.get(key="done"):
        when null:
            pass
        when some value:
            done = value
print(value=done)
`);
    const result = spawnSync(process.execPath, [cli, 'run', root], {encoding:'utf8', timeout:5000});
    assert.equal(result.status, 0, result.error?.message || result.stderr);
    assert.equal(result.stdout, '2\n');
  } finally {rmSync(root, {recursive:true, force:true});}
});
test('a task pins mutable inputs until it is waited for and cannot escape its scope', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-task-loans-'));
  try {
    writeFileSync(join(root, 'operations.aug'), 'size(List<int> values) returns int:\n    return values.length()\n');
    const prefix = 'import size from operations\nitems = [1]\nscope:\n    pending = start size(values=items)\n';
    writeFileSync(join(root, 'main.aug'), prefix + '    borrow items:\n        items.append(value=2)\n    wait for pending\n');
    let result = spawnSync(process.execPath, [cli, 'check', root], {encoding:'utf8'});
    assert.notEqual(result.status, 0); assert.match(result.stderr, /task/);
    writeFileSync(join(root, 'main.aug'), prefix + '    wait for pending\n    borrow items:\n        items.append(value=2)\nprint(value=items.length())\n');
    result = spawnSync(process.execPath, [cli, 'run', root], {encoding:'utf8'});
    assert.equal(result.status, 0, result.stderr); assert.equal(result.stdout, '2\n');
    writeFileSync(join(root, 'operations.aug'), 'escape() returns Task<int>:\n    scope:\n        pending = start size(values=[1])\n        return pending\nsize(List<int> values) returns int:\n    return values.length()\n');
    writeFileSync(join(root, 'main.aug'), '');
    result = spawnSync(process.execPath, [cli, 'check', root], {encoding:'utf8'});
    assert.notEqual(result.status, 0); assert.match(result.stderr, /scope/);
  } finally {rmSync(root, {recursive:true, force:true});}
});
test('tasks track mutable dependencies injected into scheduled calls', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-injected-task-loans-'));
  try {
    writeFileSync(join(root, 'operations.aug'), `interface Counter:
    increment() changes self
    value() returns int
CounterImpl() implements Counter:
    mutable int _count = 0
    increment() changes self:
        _count = _count + 1
    value() returns int:
        return _count
read(resolve Counter counter) returns int:
    return counter.value()
`);
    const prefix = `import Counter and CounterImpl and read from operations
implement Counter with CounterImpl shared mutable
resolve Counter to counter
scope:
    first = start read()
`;
    writeFileSync(join(root, 'main.aug'), prefix + '    borrow counter:\n        counter.increment()\n    wait for first\n');
    let result = spawnSync(process.execPath, [cli, 'check', root], {encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /task/i);
    writeFileSync(join(root, 'main.aug'), prefix + '    wait for first\n    borrow counter:\n        counter.increment()\n');
    result = spawnSync(process.execPath, [cli, 'run', root], {encoding: 'utf8', timeout: 5000});
    assert.equal(result.status, 0, result.stderr);
  } finally { rmSync(root, {recursive: true, force: true}); }
});
test('injected read access cannot alias an exclusive written argument', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-injected-call-alias-'));
  try {
    writeFileSync(join(root, 'operations.aug'), `interface Counter:
    increment() changes self
    value() returns int
CounterImpl() implements Counter:
    mutable int _count = 0
    increment() changes self:
        _count = _count + 1
    value() returns int:
        return _count
readAndWrite(resolve Counter reader, borrow Counter target) changes target:
    int previous = reader.value()
    target.increment()
`);
    writeFileSync(join(root, 'main.aug'), `import Counter and CounterImpl and readAndWrite from operations
implement Counter with CounterImpl shared mutable
resolve Counter to counter
borrow counter:
    readAndWrite(target=counter)
`);
    const result = spawnSync(process.execPath, [cli, 'check', root], {encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /exclusive argument aliases another argument/);
  } finally { rmSync(root, {recursive: true, force: true}); }
});
test('dropping an owned Shared wrapper drops its transferred payload before later locals', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-shared-drop-'));
  try {
    writeFileSync(join(root, 'operations.aug'), `interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
Marker() implements Disposable:
    drop():
        pass
`);
    writeFileSync(join(root, 'main.aug'), `import Resource and Marker from operations
scope:
    own Shared<Resource> state = Shared(value=Resource())
own Marker marker = Marker()
`);
    const result = spawnSync(process.execPath, [cli, 'run', root], {
      encoding: 'utf8', timeout: 5000, env: {...process.env, AUG_TRACE_DROPS: '1'}
    });
    assert.equal(result.status, 0, result.stderr);
    const resource = result.stderr.indexOf('drop: Resource');
    const marker = result.stderr.indexOf('drop: Marker');
    assert.ok(resource >= 0 && marker > resource, result.stderr);
  } finally { rmSync(root, {recursive: true, force: true}); }
});
test('scope-owned tasks support ordered grouped and collection waits', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-tasks-'));
  try {
    writeFileSync(join(root, 'operations.aug'), `double(int value) returns int:
    return value * 2
`);
    writeFileSync(join(root, 'main.aug'), `import double from operations
scope:
    first = start double(value=3)
    second = start double(value=5)
    wait for first and second to a and b
    print(value=a)
    print(value=b)
    pending = [start double(value=7), start double(value=9)]
    values = wait for pending
    for value in values:
        print(value=value)
`);
    const result = spawnSync(process.execPath, [cli, 'run', root], {encoding:'utf8', timeout:10000});
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '6\n10\n14\n18\n');
  } finally {rmSync(root, {recursive:true, force:true});}
});

test('a failed child cancels its siblings and always cleanup runs before the scope exits', () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-cancel-'));
  try {
    writeFileSync(join(root, 'operations.aug'), `import Console from august.io
fail() returns int unless FileError:
    throw FileError()
spin(resolve Console output) uses output.write:
    try:
        while true:
            pass
    always:
        output.write(value="cleanup")
`);
    writeFileSync(join(root, 'main.aug'), `import fail and spin from operations
import Console and SystemConsole from august.io
implement Console with SystemConsole
try:
    scope:
        running = start spin()
        broken = start fail()
        wait for broken
catch FileError error:
    print(value="caught")
`);
    const result = spawnSync(process.execPath, [cli, 'run', root], {encoding:'utf8', timeout:10000});
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, 'cleanup\ncaught\n');
    const main = `import fail and spin from operations
import Console and SystemConsole from august.io
implement Console with SystemConsole
try:
    scope:
        running = start spin()
        broken = start fail()
        wait for running
catch FileError error:
    print(value="caught")
`;
    writeFileSync(join(root, 'main.aug'), main);
    const sibling = spawnSync(process.execPath, [cli, 'run', root], {encoding:'utf8', timeout:10000});
    assert.equal(sibling.status, 0, sibling.stderr);
    assert.equal(sibling.stdout, 'cleanup\ncaught\n', 'the original error remains catchable while waiting on a cancelled sibling');
  } finally {rmSync(root, {recursive:true, force:true});}
});
