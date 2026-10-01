import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync, readFileSync, realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {test} from 'node:test';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {compileLLVM} from '../src/llvm-native.ts';

function runProgram(files, expected, {traceDrops=false,checkStderr}={}) {
  const root=realpathSync(mkdtempSync(join(tmpdir(),'aug-llvm-')));
  try {
    for(const [name,source] of Object.entries(files))writeFileSync(join(root,name),source);
    const checked=checkProject(loadProject(root));
    assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[]);
    const compiled=compileLLVM(checked);
    const run=spawnSync(compiled.output,[],{encoding:'utf8',timeout:10000,env:{...process.env,SDKROOT:'/nonexistent',DEVELOPER_DIR:'/nonexistent',...(traceDrops?{AUG_TRACE_DROPS:'1'}:{})}});
    assert.equal(run.status,0,run.stderr||run.error?.message);
    assert.equal(run.stdout,expected);
    checkStderr?.(run.stderr);
    assert.match(readFileSync(join(root,'.aug-build/program.ll'),'utf8'),/define i32 @main/);
    return readFileSync(join(root,'.aug-build/program.ll'),'utf8');
  } finally {rmSync(root,{recursive:true,force:true});}
}

const enabled=process.platform==='darwin'&&process.arch==='arm64'&&!!process.env.AUG_LLVM_HOME;
test('LLVM runs labeled calls, loops, short circuit logic and collections',{skip:!enabled},()=>{
  const ir=runProgram({
    'math.aug':`add(int left, int right) returns int:
    return left + right
unexpected() returns bool unless IndexError:
    List<int> values = [1]
    return values.get(index=99) == 0
`,
    'main.aug':`import add and unexpected from math
int count = 0
while count < 10:
    count = add(right=1, left=count)
List<int> values = [1, 2, 3]
int sum = 0
for item in values:
    sum = sum + item
print(value=count == 10 and sum == 6)
try:
    print(value=true or unexpected())
catch IndexError error:
    print(value="unexpected")
print(value=sum)
`
  },'true\ntrue\n6\n');
  assert.doesNotMatch(ir,/#include/);
});

test('LLVM dispatches interface methods and maps checked failures',{skip:!enabled},()=>runProgram({
  'service.aug':`interface Counter:
    value() returns int
ConcreteCounter(int number) implements Counter:
    value() returns int:
        return number
Failure(int code, string message) implements Error:
    pass
load(bool fail) returns string unless Failure:
    if fail:
        throw Failure(code=7, message="failed")
    return "loaded"
`,
  'main.aug':`import Counter and ConcreteCounter and Failure and load from service
Counter counter = ConcreteCounter(number=42)
print(value=counter.value() == 42)
try:
    load(fail=true)
catch Failure error:
    print(value=error.code == 7)
    print(value=error.message)
`
},'true\ntrue\nfailed\n'));

test('an owned field keeps a transferred object alive and drops the replaced value',{skip:!enabled},()=>runProgram({
  'holder.aug':`interface Item:
    value() returns int
Resource(int number) implements Item:
    value() returns int:
        return number
interface Container:
    value() returns int
Holder(mutable own Resource item) implements Container:
    value() returns int:
        return item.value()
replace(borrow Holder holder, own Resource replacement):
    holder.item = replacement
`,
  'main.aug':`import Resource and Holder and replace from holder
own Resource initial = Resource(number=1)
own Holder holder = Holder(item=initial)
own Resource replacement = Resource(number=7)
replace(holder, replacement)
print(value=holder.value())
`
},'7\n'));

test('LLVM cleans transferred fields when a checked constructor fails',{skip:!enabled},()=>runProgram({
  'operations.aug':`interface Item:\n    pass\nResource() implements Item:\n    pass\nFailure(int code, string message) implements Error:\n    pass\nHolder(own Resource value) unless Failure implements Item:\n    initialize:\n        throw Failure(code=9, message="rejected")\n`,
  'main.aug':`import Resource and Holder and Failure from operations\ntry:\n    own Resource value = Resource()\n    Holder(value)\ncatch Failure error:\n    print(value=error.code)\nprint(value="done")\n`
},'9\ndone\n'));

test('partial construction does not call drop against uninitialized local fields',{skip:!enabled},()=>runProgram({
  'operations.aug':`interface Item:\n    pass\nResource() implements Item:\n    pass\nFailure() implements Error:\n    pass\nfail() returns int unless Failure:\n    throw Failure()\nBroken(own Resource item) unless Failure implements Item:\n    int first = fail()\n    int second = 4\n    drop():\n        int value = second + 1\n`,
  'main.aug':`import Resource and Broken and Failure from operations\ntry:\n    own Resource item = Resource()\n    Broken(item)\ncatch Failure error:\n    print(value="constructor error")\n`
},'constructor error\n',{traceDrops:true,checkStderr(stderr){
  assert.equal(stderr.match(/drop: .*Resource\n/g)?.length,1);assert.doesNotMatch(stderr,/drop: .*Broken\n/);
}}));
