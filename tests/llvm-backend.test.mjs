import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync, readFileSync, realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {test} from 'node:test';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {compileLLVM} from '../src/llvm-native.ts';
import {prepareLibraryFixtures} from './library-fixtures.mjs';

function runProgram(files, expected, {traceDrops=false,checkStderr,release=false,testMode=false}={}) {
  const root=realpathSync(mkdtempSync(join(tmpdir(),'aug-llvm-')));
  try {
    for(const [name,source] of Object.entries(files))writeFileSync(join(root,name),source);
    prepareLibraryFixtures(root);
    const project=loadProject(root);project.testMode=testMode;
    const checked=checkProject(project);
    assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[]);
    const compiled=compileLLVM(checked,{release});
    const run=spawnSync(compiled.output,[],{encoding:'utf8',timeout:30000,env:{...process.env,SDKROOT:'/nonexistent',DEVELOPER_DIR:'/nonexistent',...(traceDrops?{AUG_TRACE_DROPS:'1'}:{})}});
    assert.equal(run.status,0,run.stderr||run.error?.message);
    assert.equal(run.stdout,expected);
    checkStderr?.(run.stderr);
    assert.match(readFileSync(join(root,'.aug-build/program.ll'),'utf8'),/define i32 @main/);
    return readFileSync(join(root,'.aug-build/program.ll'),'utf8');
  } finally {rmSync(root,{recursive:true,force:true});}
}

const enabled=process.platform==='darwin'&&process.arch==='arm64'&&!!process.env.AUG_LLVM_HOME;
for(const release of [false,true])test('LLVM JSON decodes concrete generic records and checked collections '+(release?'optimized':'development'),{skip:!enabled},()=>runProgram({
  'data.aug':`record Envelope<T implements Data>(T value)
record Profile(string name, optional string nickname, List<int> scores)
`,
  'main.aug':`import parse from json
import Envelope and Profile from data
try:
    profile = parse(input="{\\\"value\\\":{\\\"name\\\":\\\"August\\\",\\\"scores\\\":[3,5]}}").decode<Envelope<Profile>>()
    assert(condition=profile.value.name == "August")
    assert(condition=profile.value.nickname == null)
    assert(condition=profile.value.scores.get(index=1) == 5)
    numbers = parse(input="[2,2,3]").decode<Set<int>>()
    assert(condition=numbers.length() == 2)
    pair = parse(input="[7,\\\"seven\\\"]").decode<Tuple<int,string>>()
    assert(condition=pair.get(index=0) == 7)
    names = parse(input="{\\\"first\\\":\\\"Ada\\\"}").decode<Map<string,string>>()
    assert(condition=names.get(key="first") == "Ada")
    item = parse(input="{\\\"active\\\":true,\\\"count\\\":9}")
    assert(condition=item.require(name="active").boolean())
    assert(condition=item.require(name="count").integer() == 9)
    assert(condition=item.get(name="missing") == null)
    assert(condition=parse(input=Json(value=42).stringify()).integer() == 42)
    assert(condition=parse(input="[1,2]").items().get(index=0).integer() == 1)
    print(value="json works")
catch JsonError error:
    assert(condition=false)
try:
    parse(input="{\\\"name\\\":\\\"A\\\",\\\"scores\\\":[],\\\"extra\\\":1}").decode<Profile>()
    assert(condition=false)
catch JsonError error:
    print(value="unknown field rejected")
try:
    parse(input="{\\\"name\\\":\\\"A\\\",\\\"scores\\\":[\\\"wrong\\\"]}").decode<Profile>()
    assert(condition=false)
catch JsonError error:
    print(value="type rejected")
try:
    parse(input="{\\\"a\\\":1,\\\"a\\\":2}")
    assert(condition=false)
catch JsonError error:
    print(value="duplicate rejected")
`
},'json works\nunknown field rejected\ntype rejected\nduplicate rejected\n',{release,testMode:true}));
test('LLVM calls a clock through its resolved capability and pointer ABI',{skip:!enabled},()=>runProgram({
  'main.aug':`import Clock and SystemClock from time
implement Clock with SystemClock
resolve Clock to clock
try:
    now = clock.now()
    print(value=now > 1700000000)
catch TimeError error:
    print(value="clock failed")
`
},'true\n'));
test('LLVM crypto executes real GnuTLS hashes, RSA signatures and checked failures',{skip:!enabled},()=>runProgram({
  'main.aug':`import Crypto and GnuTlsCrypto from crypto
implement Crypto with GnuTlsCrypto
resolve Crypto to crypto
try:
    data = "abc".bytes()
    print(value=crypto.sha256(input=data).base64url())
    private = crypto.generateRsa()
    public = crypto.publicRsa(key=private)
    signature = crypto.signRsa(key=private, input=data)
    print(value=crypto.verifyRsa(publicKey=public, input=data, signature))
    print(value=crypto.verifyRsa(publicKey=public, input="different".bytes(), signature))
    parts = crypto.exportRsa(publicKey=public)
    copied = crypto.importRsa(modulus=parts.get(index=0), exponent=parts.get(index=1))
    print(value=crypto.verifyRsa(publicKey=copied, input=data, signature))
    print(value=crypto.random(size=16).length())
    print(value=crypto.passwordHash(password=data, salt="0123456789abcdef".bytes(), iterations=100000).length())
    decoded = crypto.decodeBase64url(input="YWJj")
    print(value=crypto.equal(left=data, right=decoded))
catch CryptoError error:
    print(value="crypto failed")
catch IndexError error:
    print(value="bad tuple")
try:
    crypto.random(size=-1)
catch CryptoError error:
    print(value="invalid input rejected")
`
},'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0\ntrue\nfalse\ntrue\n16\n32\ntrue\ninvalid input rejected\n',{release:true}));
test('LLVM matches optional values, literals and resolved record identities',{skip:!enabled},()=>runProgram({
  'data.aug':`record Point(int x, int y)
record Label(string value)
describe(optional bool value) returns string:
    match value:
        when null:
            return "absent"
        when some present:
            match present:
                when true:
                    return "yes"
                when false:
                    return "no"
shape(Data value) returns string:
    match value:
        when Point point:
            return "point"
        when Label label:
            return label.value
        else:
            return "other"
`,
  'main.aug':`import Point and Label and describe and shape from data
print(value=describe(value=null))
print(value=describe(value=true))
print(value=describe(value=false))
print(value=shape(value=Point(x=1, y=2)))
print(value=shape(value=Label(value="named")))
print(value=shape(value=7))
`
},'absent\nyes\nno\npoint\nnamed\nother\n'));

test('LLVM scoped DI restores nested scopes after fallthrough, failure and return',{skip:!enabled},()=>runProgram({
  'counter.aug':`interface Counter:
    increment() changes self
CounterImpl() implements Counter:
    increment() changes self:
        pass
Failure() implements Error:
    pass
same(resolve Counter first, resolve Counter second) returns bool:
    return first == second
checkReturn(resolve Counter first) returns bool:
    scope:
        return same()
fail(resolve Counter first) unless Failure:
    scope:
        same()
        throw Failure()
`,
  'main.aug':`import Counter and CounterImpl and Failure and fail and checkReturn from counter
implement Counter with CounterImpl scoped mutable
scope:
    resolve Counter to first
    resolve Counter to second
    print(value=first == second)
    scope:
        resolve Counter to nested
        print(value=first == nested)
    try:
        fail()
    catch Failure error:
        resolve Counter to restored
        print(value=first == restored)
    print(value=checkReturn())
    resolve Counter to afterReturn
    print(value=first == afterReturn)
`
},'true\nfalse\ntrue\ntrue\ntrue\n'));

test('LLVM always blocks preserve returns, catches, pending errors and cleanup failures',{skip:!enabled},()=>runProgram({
  'operations.aug':`import Console from august.io
Failure(int code) implements Error:
    pass
work(resolve Console console, int mode) returns int unless Failure:
    try:
        if mode == 1:
            return 7
        if mode == 2 or mode == 3:
            throw Failure(code=mode)
        console.write(value="body")
    catch Failure error:
        console.write(value=error.code)
        if mode == 3:
            throw Failure(code=30)
    always:
        console.write(value="cleanup")
    return 9
cleanupFailure() unless Failure:
    try:
        throw Failure(code=1)
    always:
        throw Failure(code=2)
nested(resolve Console console) returns int:
    try:
        try:
            return 5
        always:
            console.write(value="inner")
    always:
        console.write(value="outer")
`,
  'main.aug':`import Failure and work and cleanupFailure and nested from operations
import Console and SystemConsole from august.io
implement Console with SystemConsole
try:
    print(value=work(mode=0))
    print(value=work(mode=1))
    print(value=work(mode=2))
    work(mode=3)
catch Failure error:
    print(value=error.code)
try:
    cleanupFailure()
catch Failure error:
    print(value=error.code)
print(value=nested())
`
},'body\ncleanup\n9\ncleanup\n7\n2\ncleanup\n9\n3\ncleanup\n30\n2\ninner\nouter\n5\n'));

test('LLVM releases locks before catch, always and return paths',{skip:!enabled},()=>runProgram({
  'operations.aug':`capability Counter:
    update() uses Counter.update
edit(Shared<List<int>> state, bool fail) returns int uses Counter.update unless FileError:
    try:
        lock state as values:
            values.append(value=2)
            if fail:
                throw FileError()
            return values.length()
    always:
        lock state as values:
            values.append(value=3)
`,
  'main.aug':`import edit from operations
state = Shared(value=[1])
int afterFailure = 0
try:
    edit(state, fail=true)
catch FileError error:
    lock state as values:
        afterFailure = values.length()
print(value=afterFailure)
try:
    print(value=edit(state, fail=false))
catch FileError error:
    print(value="unexpected")
int length = 0
lock state as values:
    length = values.length()
print(value=length)
`
},'3\n4\n5\n'));
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
