import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from './compiler-process.mjs';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
const cli=resolve('bin/aug.mjs');
function fixture(files,callback){const root=mkdtempSync(join(tmpdir(),'aug-workers-'));try{for(const [file,source] of Object.entries(files))writeFileSync(join(root,file),source);callback(root);}finally{rmSync(root,{recursive:true,force:true});}}
function run(root,extra={}){return spawnSync(process.execPath,[cli,'run',root],{encoding:'utf8',timeout:20000,...extra});}
function clean(result,expected){assert.equal(result.status,0,result.stderr||result.error?.message);assert.equal(result.stdout,expected);}
for(const optimization of ['debug','release'])test(`workers use Task waits with copied values and nested scopes (${optimization})`,()=>fixture({
 'main.yaml':`optimization: ${optimization}\n`,
 'operations.aug':`double(int value) returns int:
    return value * 2
size(List<int> values) returns int:
    return values.length()
nested(int value) returns int:
    scope:
        local = start cooperative(value)
        return wait for local
cooperative(int value) returns int:
    scope:
        child = start worker double(value)
        return wait for child
`,
 'main.aug':`import double and size and nested from operations
values = [1, 2, 3]
scope:
    first = start worker size(values)
    borrow values:
        values.append(value=4)
    second = start worker nested(value=9)
    wait for first and second to count and answer
    print(value=count)
    print(value=answer)
    pending = [start worker double(value=3), start worker double(value=7)]
    for value in wait for pending:
        print(value)
print(value=values.length())
`
},root=>clean(run(root,{env:{...process.env,AUG_WORKERS:'1'}}),'3\n18\n6\n14\n4\n')));
test('worker errors cancel and join siblings and release local resources',()=>fixture({
 'operations.aug':`interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
fail() returns int unless FileError:
    own Resource resource = Resource()
    throw FileError()
spin() returns int:
    while true:
        pass
    return 0
`,
 'main.aug':`import fail and spin from operations
try:
    scope:
        first = start worker spin()
        second = start worker fail()
        wait for first
catch FileError error:
    print(value="caught")
`
},root=>{const result=run(root,{env:{...process.env,AUG_WORKERS:'2',AUG_TRACE_DROPS:'1'}});clean(result,'caught\n');assert.equal((result.stderr.match(/drop: (?:operations\.aug:)?Resource\n/g)??[]).length,1,result.stderr);}));
for(const [name,operations,main] of [
 ['owned captures','interface Resource:\n    drop()\nObject() implements Resource:\n    drop():\n        pass\nuse(own Object value):\n    pass\n','own Object value = Object()\nscope:\n    pending = start worker use(value)\n'],
 ['shared state','read(Shared<List<int>> value) returns int:\n    return 1\n','value = Shared(value=[1])\nscope:\n    pending = start worker read(value)\n'],
 ['transitive DI','interface Number:\n    get() returns int\nConstant() implements Number:\n    get() returns int:\n        return 1\nread(resolve Number number) returns int:\n    return number.get()\nindirect(resolve Number number) returns int:\n    return read()\n','implement Number with Constant\nscope:\n    pending = start worker indirect()\n']
])test(`workers reject ${name} before native execution`,()=>fixture({'operations.aug':operations,'main.aug':'import everything from operations\n'+main},root=>assert.ok(checkProject(loadProject(root)).diagnostics.some(d=>d.code==='WORKER'),JSON.stringify(checkProject(loadProject(root)).diagnostics))));

for(const [name,operations] of [
 ['nested constructor calls', `extern C value pure probe() returns int
interface Value:
    value() returns int
Inner() implements Value:
    initialize:
        unsafe:
            probe()
    value() returns int:
        return 1
Outer() implements Value:
    initialize:
        inner = Inner()
    value() returns int:
        return 1
calculate() returns int:
    return Outer().value()
`],
 ['inherited defaults', `extern C value pure probe() returns int
interface Parent:
    value() returns int:
        unsafe:
            probe()
        return 1
interface Child extends Parent:
    pass
Adapter() implements Child:
    pass
calculate() returns int:
    return Adapter().value()
`],
 ['inherited dynamic dispatch', `extern C value pure probe() returns int
interface Parent:
    value() returns int
interface Child extends Parent:
    pass
Adapter() implements Child:
    value() returns int:
        unsafe:
            probe()
        return 1
invoke(Parent value) returns int:
    return value.value()
calculate() returns int:
    return invoke(value=Adapter())
`]
])test(`workers reject ${name} through the complete call graph`,()=>fixture({'operations.aug':operations,'main.aug':`import calculate from operations
scope:
    pending = start worker calculate()
    print(value=wait for pending)
`},root=>{
 const diagnostics=checkProject(loadProject(root)).diagnostics;
 assert.ok(diagnostics.some(d=>d.code==='WORKER'),JSON.stringify(diagnostics));
 assert.ok(!diagnostics.some(d=>d.code!=='WORKER'&&d.severity!=='warning'),JSON.stringify(diagnostics));
}));

test('copied records, nested maps, sets and errors survive collection in either heap',()=>fixture({
 'operations.aug':`record Row(int value)
Failure(List<Row> rows) implements Error:
    pass
copy(Map<string,List<Row>> input) returns Map<string,List<Row>>:
    int index = 0
    while index < 4000:
        unused = "garbage" + "value"
        index = index + 1
    return input
copySet(Set<int> input) returns Set<int>:
    return input
fail(List<Row> rows) unless Failure:
    throw Failure(rows)
`,
 'main.aug':`import Row and copy and copySet and fail and Failure from operations
rows = [Row(value=4), Row(value=9)]
input = {"rows": rows}
scope:
    job = start worker copy(input)
    result = wait for job
    match result.get(key="rows"):
        when some copied:
            for row in copied:
                print(value=row.value)
        when null:
            print(value=0)
    setJob = start worker copySet(input={4, 9})
    copiedSet = wait for setJob
    print(value=copiedSet.contains(value=9))
    print(value=copiedSet.length())
try:
    scope:
        bad = start worker fail(rows)
        wait for bad
catch Failure error:
    for row in error.rows:
        print(value=row.value)
`
},root=>clean(run(root),'4\n9\ntrue\n2\n4\n9\n')));
