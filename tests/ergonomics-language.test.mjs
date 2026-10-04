import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync} from 'node:fs';
import {join, dirname, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {checkProject} from '../src/checker.ts';
import {loadProject} from '../src/project.ts';

const cli=resolve('bin/aug.mjs');
function project(files, action) {
  const root=mkdtempSync(join(tmpdir(),'aug-ergonomics-'));
  try {
    for(const [file,source] of Object.entries(files)) {
      mkdirSync(dirname(join(root,file)),{recursive:true});writeFileSync(join(root,file),source);
    }
    return action(root);
  } finally {rmSync(root,{recursive:true,force:true});}
}
const command=(root,name,args=[])=>spawnSync(process.execPath,[cli,name,root,...args],{encoding:'utf8',timeout:60000});

test('indexing preserves checked list reads, optional map lookup, and constant tuple reads',()=>project({
  'main.aug': `values = [4, 7]
fruit = {1: "pear"}
pair = (9, "August")
try:
    print(value=values[1])
    print(value=fruit[1])
    print(value=fruit[2])
    print(value=pair[1])
    print(value=values[7])
catch IndexError error:
    print(value="out of bounds")
`
},root=>{
  for(const backend of ['llvm','c']) {
    const result=command(root,'run',['--backend',backend]);
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'7\npear\nnull\nAugust\nout of bounds\n');
  }
}));

test('otherwise evaluates only for null and preserves false, zero and empty text',()=>project({
  'main.aug': `import fallback from values
import Console and SystemConsole from august.io
implement Console with SystemConsole
optional string name = null
print(value=name otherwise fallback())
name = "Ada"
print(value=name otherwise fallback())
optional int count = 0
optional bool enabled = false
optional string empty = ""
print(value=count otherwise 9)
print(value=enabled otherwise true)
print(value=empty otherwise "replacement")
`,
  'values.aug': `import Console from august.io
fallback(resolve Console console):
    console.write(value="evaluated")
    return "Guest"
`
},root=>{
  for(const backend of ['llvm','c']) {
    const result=command(root,'run',['--backend',backend]);
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'evaluated\nGuest\nAda\n0\nfalse\n\n');
  }
}));

test('indexing and fallback retain checked diagnostics and survive formatting',()=>project({
  'main.aug': `try {
    values = [4, 7]
    optional string name = null
    print(value=values[1])
    print(value=name otherwise "Guest")
} catch IndexError error { print(value="unexpected") }
`
},root=>{
  const formatted=command(root,'format',['--write']);assert.equal(formatted.status,0,formatted.stderr);
  const source=readFileSync(join(root,'main.aug'),'utf8');assert.match(source,/values\[1\]/);assert.match(source,/otherwise "Guest"/);
  const rerun=command(root,'run',['--backend','llvm']);assert.equal(rerun.status,0,rerun.stderr);assert.equal(rerun.stdout,'7\nGuest\n');
  const fixtures=[
    ['values = [1]\nprint(value=values[4])\n',/Unhandled IndexError/],
    ['pair = (1, "two")\nindex = 0\nprint(value=pair[index])\n',/constant int/],
    ['optional int value = null\nprint(value=value otherwise "wrong")\n',/compatible values/],
    ['print(value="text"[0])\n',/Indexing reads a List, Map, or Tuple/]
  ];
  for(const [source,diagnostic] of fixtures){
    writeFileSync(join(root,'main.aug'),source);const checked=command(root,'check',['--json']);
    assert.equal(checked.status,1,checked.stderr);assert.match(checked.stdout,diagnostic);
  }
}));

test('short error declarations remain checked errors with named data',()=>project({
  'main.aug': `import reject and InvalidQuantity from orders
try:
    reject(value=-3)
catch InvalidQuantity error:
    print(value=error.value)
`,
  'orders.aug': `error InvalidQuantity(int value)
reject(int value):
    throw InvalidQuantity(value)
`
},root=>{
  for(const backend of ['llvm','c']){
    const result=command(root,'run',['--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'-3\n');
  }
  const formatted=command(root,'format',['--write']);assert.equal(formatted.status,0,formatted.stderr);
  assert.match(readFileSync(join(root,'orders.aug'),'utf8'),/error InvalidQuantity\(int value\)/);
  writeFileSync(join(root,'main.aug'),'import reject from orders\nreject(value=4)\n');
  const checked=command(root,'check',['--json']);assert.equal(checked.status,1);assert.match(checked.stdout,/Unhandled InvalidQuantity/);
}));

test('literal parameter defaults are typed, labeled, and freshly constructed per call',()=>project({
  'main.aug': `import greet and size and Options from defaults
print(value=greet())
print(value=greet(name="Ada"))
print(value=greet(suffix=null))
print(value=size())
print(value=size(values=[4, 5]))
print(value=Options().limit)
print(value=Options(limit=7).limit)
`,
  'defaults.aug': `greet(string name = "August", optional string suffix = "!"):
    return "Hello, " + name + (suffix otherwise "")
size(List<int> values = []):
    return values.length()
record Options(int limit = 5)
`
},root=>{
  for(const backend of ['llvm','c']){
    const result=command(root,'run',['--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'Hello, August!\nHello, Ada!\nHello, August\n0\n2\n5\n7\n');
  }
  const format=command(root,'format',['--write']);assert.equal(format.status,0,format.stderr);
  const checked=command(root,'check');assert.equal(checked.status,0,checked.stderr);
  writeFileSync(join(root,'main.aug'),'import greet from defaults\ngreet(name=null)\n');
  const invalid=command(root,'check',['--json']);assert.equal(invalid.status,1);assert.match(invalid.stdout,/Expected string, got optional null/);
}));

test('defaults reject hidden computation, incompatible values, and changed interface promises',()=>project({
  'main.aug': 'print(value="ok")\n',
  'defaults.aug': 'wrong(int value = "text"):\n    pass\nrecord Settings(int limit = "bad")\ncomputed(int value = compute()):\n    pass\ncompute():\n    return 2\n'
},root=>{
  const checked=command(root,'check',['--json']);assert.equal(checked.status,1);
  assert.match(checked.stdout,/Default for value expects int/);assert.match(checked.stdout,/Default for limit expects int/);
  assert.match(checked.stdout,/default is literal data/);
  writeFileSync(join(root,'defaults.aug'),'interface Counter:\n    count(int value = 1) returns int\nImplementation() implements Counter:\n    count(int value = 2):\n        return value\n');
  const conflict=command(root,'check',['--json']);assert.equal(conflict.status,1);assert.match(conflict.stdout,/signature|implement/i);
}));

test('interpolation formats scalar values once and preserves literal braces and embedded expressions',()=>project({
  'main.aug': `import greeting from text
print(value=greeting(name="Ada", count=7))
print(value=$"literal {{braces}} and {false} {null} {1.25}")
print(value=$"nested {\"pear\" + \"s\"}")
`,
  'text.aug': 'greeting(string name, int count):\n    return $"Hello, {name}: {count + 1}"\n'
},root=>{
  for(const backend of ['llvm','c']){
    const result=command(root,'run',['--backend',backend]);assert.equal(result.status,0,result.stderr);
    assert.equal(result.stdout,'Hello, Ada: 8\nliteral {braces} and false null 1.25\nnested pears\n');
  }
  const format=command(root,'format',['--write']);assert.equal(format.status,0,format.stderr);
  assert.match(readFileSync(join(root,'text.aug'),'utf8'),/\$"Hello, \{name\}/);
  writeFileSync(join(root,'main.aug'),'print(value=$"{[1, 2]}")\n');
  const invalid=command(root,'check',['--json']);assert.equal(invalid.status,1);assert.match(invalid.stdout,/interpolation.*scalar|scalar.*interpolation/i);
}));

test('integer remainder has signed operands, checked zero, and defined minimum overflow',()=>project({
  'main.aug': `import remainder from numbers
print(value=-7 % 3)
print(value=7 % -3)
print(value=-9223372036854775808 % -1)
try:
    print(value=remainder(divisor=0))
catch ArithmeticError error:
    print(value="zero")
`,
  'numbers.aug':'remainder(int divisor):\n    return 7 % divisor\n'
},root=>{
  for(const backend of ['llvm','c']){
    const result=command(root,'run',['--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'-1\n1\n0\nzero\n');
  }
  writeFileSync(join(root,'main.aug'),'print(value=1.5 % 2)\n');
  const invalid=command(root,'check',['--json']);assert.equal(invalid.status,1);assert.match(invalid.stdout,/remainder.*integer|%.*integer/i);
}));

test('text helpers preserve Unicode and use checked strict parsing',()=>project({
  'main.aug': `print(value="apples".endsWith(suffix="les"))
try:
    print(value="banana".replace(search="na", replacement="!"))
catch ConversionError error:
    print(value="unexpected replacement error")
print(value=["one", "two", ""].join(separator=","))
try:
    print(value="👋é".codePointLength())
    print(value="-9223372036854775808".parseInteger())
    print(value="1.25e2".parseFloat())
    print(value="9223372036854775808".parseInteger())
catch ConversionError error:
    print(value="invalid integer")
try:
    print(value=" 7".parseInteger())
catch ConversionError error:
    print(value="no whitespace")
try:
    print(value="abc".replace(search="", replacement="x"))
catch ConversionError error:
    print(value="empty search")
`
},root=>{
  for(const backend of ['llvm','c']){
    const result=command(root,'run',['--backend',backend]);assert.equal(result.status,0,result.stderr);
    assert.equal(result.stdout,'true\nba!!\none,two,\n3\n-9223372036854775808\n125\ninvalid integer\nno whitespace\nempty search\n');
  }
  writeFileSync(join(root,'main.aug'),'print(value=[1,2].join(separator=","))\n');
  const wrong=command(root,'check',['--json']);assert.equal(wrong.status,1);assert.match(wrong.stdout,/join.*List<string>/);
}));

test('immutable collection contracts make deep record data explicit without accepting mutable aliases',()=>project({
  'main.aug': `import Invoice and first from invoices
immutable List<List<int>> rows = [[3, 4]]
invoice = Invoice(number="A1", items=rows)
try:
    print(value=first(invoice))
catch IndexError error:
    print(value="bad index")
`,
  'invoices.aug':'record Invoice(string number, immutable List<List<int>> items)\nfirst(Invoice invoice):\n    return invoice.items[0][0]\n'
},root=>{
  for(const backend of ['llvm','c']){
    const result=command(root,'run',['--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'3\n');
  }
  const formatted=command(root,'format',['--write']);assert.equal(formatted.status,0,formatted.stderr);
  writeFileSync(join(root,'main.aug'),'import Invoice from invoices\nrows = [[3,4]]\nInvoice(number="A1",items=rows)\n');
  const alias=command(root,'check',['--json']);assert.equal(alias.status,1);assert.match(alias.stdout,/immutable|Freeze/);
  writeFileSync(join(root,'main.aug'),'immutable List<int> rows = [1]\nborrow rows:\n    rows.append(value=2)\n');
  const mutation=command(root,'check',['--json']);assert.equal(mutation.status,1);assert.match(mutation.stdout,/read-only|frozen/i);
}));

test('record updates retain identity and unchanged data and rerun checked validation',()=>project({
  'main.aug': `import Invoice from invoices
original = Invoice(number="A1", total=4)
try:
    paid = original with (total=8)
    print(value=original.total)
    print(value=paid.total)
    print(value=paid.number)
    rejected = paid with (total=-1)
catch InvalidTotal error:
    print(value="invalid total")
`,
  'invoices.aug':'error InvalidTotal(int total)\nrecord Invoice(string number, int total):\n    initialize:\n        if total < 0:\n            throw InvalidTotal(total)\n'
},root=>{
  // Both the constructor and update retain the same checked validation contract.
  writeFileSync(join(root,'main.aug'),readFileSync(join(root,'main.aug'),'utf8').replace('import Invoice from invoices','import Invoice and InvalidTotal from invoices').replace('original = Invoice(number="A1", total=4)\ntry:', 'try:\n    original = Invoice(number="A1", total=4)'));
  for(const backend of ['llvm','c']){
    const result=command(root,'run',['--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'4\n8\nA1\ninvalid total\n');
  }
  const format=command(root,'format',['--write']);assert.equal(format.status,0,format.stderr);assert.match(readFileSync(join(root,'main.aug'),'utf8'),/with \(total=8\)/);
  writeFileSync(join(root,'main.aug'),'value = [1]\ncopy = value with (total=2)\n');
  const wrong=command(root,'check',['--json']);assert.equal(wrong.status,1);assert.match(wrong.stdout,/with.*record|record.*with/i);
}));

test('new expression forms do not conceal repeated interceptor delegation',()=>project({
  'main.aug':'import greet from greeting\nprint(value=greet())\n',
  'greeting.aug':'interceptor Repeat():\n    around():\n        return $"{next()} {next()}"\n[Repeat]\ngreet():\n    return "hello"\n'
},root=>{
  const checked=command(root,'check',['--json']);assert.equal(checked.status,1);assert.match(checked.stdout,/at most once|more than once/i);
}));

test('interpolation rejects the same invalid text as ordinary strings',()=>project({'main.aug':''},root=>{
  for(const text of ['$"bad\\0text"', '$"'+'\ud800'+'"']) {
    const checked=checkProject(loadProject(root,new Map([[join(root,'main.aug'),`print(value=${text})\n`]])));
    assert.ok(checked.diagnostics.some(issue=>/Unicode without NUL/.test(issue.message)),JSON.stringify(checked.diagnostics));
  }
}));

test('interpolation and record updates evaluate each input once in source order',()=>project({
  'main.aug':`import step and read and Amount from events
import Console and SystemConsole from august.io
implement Console with SystemConsole
print(value=$"{step(label=\"one\")} {step(label=\"two\")}")
print(value=$"outer {$\"inner {7}\"}")
copy = read() with (right=step(label="right"), left=step(label="left"))
print(value=copy.left + copy.right)
`,
  'events.aug':`import Console from august.io
record Amount(int left, int right)
step(string label, resolve Console console):
    console.write(value=label)
    return 2
read(resolve Console console):
    console.write(value="base")
    return Amount(left=1, right=1)
`
},root=>{
  for(const backend of ['llvm','c']) {
    const result=command(root,'run',['--backend',backend]);assert.equal(result.status,0,result.stderr);
    assert.equal(result.stdout,'one\ntwo\n2 2\nouter inner 7\nbase\nright\nleft\n4\n');
  }
  const first=command(root,'format',['--write']);assert.equal(first.status,0,first.stderr);
  const source=readFileSync(join(root,'main.aug'),'utf8');
  const second=command(root,'format',['--write']);assert.equal(second.status,0,second.stderr);
  assert.equal(readFileSync(join(root,'main.aug'),'utf8'),source);
  const checked=command(root,'check');assert.equal(checked.status,0,checked.stderr);
}));


test('loop control leaves the nearest loop and runs each always block',()=>project({
  'main.aug': `for item in [1, 2, 3, 4]:
    try:
        if item == 2:
            continue
        if item == 4:
            break
        print(value=item)
    always:
        print(value="cleanup")
count = 0
while count < 4:
    count = count + 1
    if count == 1:
        continue
    for item in [7, 8]:
        print(value=item)
        break
    if count == 3:
        break
print(value=count)
`
},root=>{
  for(const backend of ['llvm','c']) {
    const result=command(root,'run',['--backend',backend]);
    assert.equal(result.status,0,result.stderr);
    assert.equal(result.stdout,'1\ncleanup\ncleanup\n3\ncleanup\ncleanup\n7\n7\n3\n');
  }
  const format=command(root,'format');assert.equal(format.status,0,format.stderr);
  const spec=command(root,'spec');assert.equal(spec.status,0,spec.stderr);
  assert.match(readFileSync(join(root,'main.aug.md'),'utf8'),/loop/i);
}));


test('loop exits join child tasks, release borrows and locks, and propagate cleanup failures',()=>project({
  'main.aug': `import sum and failure from operations
values = [1]
state = Shared<List<int>>(value=[0])
for item in [1, 2, 3]:
    scope:
        own List<int> temporary = [item]
        task = start sum(values=[item])
        borrow values:
            values.append(value=item)
        lock state as current:
            current.append(value=item)
            continue
borrow values:
    values.append(value=9)
print(value=values.length())
bool correct = false
lock state as current:
    size = current.length()
    correct = size == 4
print(value=correct)
try:
    for item in [7]:
        try:
            try:
                break
            always:
                print(value="inner")
        always:
            failure()
catch IndexError error:
    print(value="cleanup failed")
print(value="finished")
`,
  'operations.aug': `sum(List<int> values):
    total = 0
    for value in values:
        total = total + value
    return total
failure() unless IndexError:
    values = [1]
    values.get(index=8)
`
},root=>{
  for(const backend of ['llvm','c']) {
    const result=command(root,'run',['--backend',backend]);
    assert.equal(result.status,0,result.stderr);
    assert.equal(result.stdout,'5\ntrue\ninner\ncleanup failed\nfinished\n');
  }
}));

test('loop flow rejects consumed inputs on continue and jumps outside a loop',()=>{
  project({'main.aug':'break\ncontinue\n'},root=>{
    const result=command(root,'check');assert.notEqual(result.status,0);assert.match(result.stderr,/requires an enclosing/);
  });
  project({'main.aug':`import consume from operations
own List<int> values = [1]
for item in [1, 2]:
    consume(values=values)
    continue
`, 'operations.aug':`consume(own List<int> values):
    pass
`},root=>{
    const result=command(root,'check');assert.notEqual(result.status,0);assert.match(result.stderr,/moved/);
  });
});


test('unreachable waits cannot erase a checked task failure on a loop exit',()=>project({
  'main.aug': `import fail from operations
for item in [1]:
    scope:
        task = start fail()
        continue
        try:
            wait for task
        catch FileError error:
            pass
`,
  'operations.aug': `fail() unless FileError:
    throw FileError()
`
},root=>{
  const result=command(root,'check');assert.notEqual(result.status,0);
  assert.match(result.stderr,/FileError/);
}));


test('a child failure during continue cleanup reaches the enclosing catch',()=>project({
  'main.aug': `import fail from operations
try:
    for item in [1, 2]:
        scope:
            task = start fail()
            continue
catch FileError error:
    print(value="joined failure")
print(value="after")
`,
  'operations.aug': `fail() unless FileError:
    throw FileError()
`
},root=>{
  for(const backend of ['llvm','c']) {
    const result=command(root,'run',['--backend',backend]);
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'joined failure\nafter\n');
  }
}));


test('breaking out of a constant loop cannot make an aliased constructor result owned',()=>project({
  'main.aug':`import build from objects
own Resource result = build()
`,
  'objects.aug':`interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
interceptor Alias(Resource existing):
    around() returns Resource:
        while true:
            break
        return existing
[Alias] build() returns Resource:
    return Resource()
`
},root=>{
  const result=command(root,'check');assert.notEqual(result.status,0);assert.match(result.stderr,/own|fresh|alias/i);
}));


test('cleanup after a loop jump sees released lexical borrows and hidden inner locals',()=>project({
  'main.aug':`items = [1]
for item in [1]:
    try:
        borrow items:
            local = 7
            break
    always:
        borrow items:
            items.append(value=2)
print(value=items.length())
`
},root=>{
  for(const backend of ['llvm','c']) {
    const result=command(root,'run',['--backend',backend]);
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'2\n');
  }
}));

test('loop jumps cannot be silently ignored as ordinary module declarations',()=>project({
  'main.aug':'', 'ignored.aug':'break\ncontinue\n'
},root=>{
  const result=command(root,'check');assert.notEqual(result.status,0);assert.match(result.stderr,/belong in main/);
}));


test('owned result contracts infer local ownership without inferring alias transfers',()=>project({
  'main.aug':`import make and consume from objects
for item in [1, 2]:
    resource = make()
    consume(value=resource)
print(value="done")
`,
  'objects.aug':`interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
make() returns own Resource:
    return Resource()
consume(own Resource value):
    pass
`
},root=>{
  for(const backend of ['llvm','c']) {
    const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000,env:{...process.env,AUG_TRACE_DROPS:'1'}});
    assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'done\n');
    assert.equal(result.stderr.split('\n').filter(line=>/^drop: .*Resource$/.test(line)).length,2);
  }
  writeFileSync(join(root,'main.aug'),'import make from objects\nresource = make()\nalias = resource\n');
  const rejected=command(root,'check');assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/owned|copy/i);
}));
