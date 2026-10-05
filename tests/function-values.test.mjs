import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from './compiler-process.mjs';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {semanticGraph} from '../src/symbols.ts';
import {parse} from '../src/parser.ts';
import {formatFile} from '../src/formatter.ts';
import {hoverInfo,completions,semanticTokens} from '../src/editor.ts';
const cli=resolve('bin/aug.mjs');
function project(main,rules,run){const root=mkdtempSync(join(tmpdir(),'aug-functions-'));try{writeFileSync(join(root,'main.aug'),main);writeFileSync(join(root,'rules.aug'),rules);return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
function runBoth(root,expected){for(const backend of ['c','llvm']){const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,expected,backend);}}
function rejected(root,main,rules,pattern){writeFileSync(join(root,'main.aug'),main);writeFileSync(join(root,'rules.aug'),rules);const result=spawnSync(process.execPath,[cli,'check',root,'--json'],{encoding:'utf8'});assert.equal(result.status,1,result.stdout+result.stderr);assert.match(result.stdout,pattern);}
const imports='import Predicate and Transformation and Aggregator and Comparator and filter and transform and aggregate and sort from august.collections\n';

test('standalone function values reuse checked callback interfaces and match labels independently of order',()=>project(imports+`import positive and double and total and compare from rules
Predicate<int> predicate = positive
print(value=predicate.accepts(value=2))
print(value=filter(values=[], predicate=positive).length())
print(value=transform(values=[], transformation=double).length())
for value in filter(values=[-1, 2, 3], predicate=positive):
    print(value=value)
for value in transform(values=[2, 3], transformation=double):
    print(value=value)
print(value=aggregate(values=[2, 3], initial=7, aggregator=total))
try:
    for value in sort(values=[3, 1, 2], comparator=compare):
        print(value=value)
catch IndexError error:
    print(value="unexpected")
`, `positive(int value) returns bool:
    return value > 0
double(int value) returns int:
    return value * 2
total(int value, int total) returns int:
    return total + value
compare(int right, int left) returns int:
    return left - right
`,root=>runBoth(root,'true\n0\n0\n2\n3\n4\n6\n12\n1\n2\n3\n')));

test('pure closures capture scalar values at creation and work directly as labeled callback arguments',()=>project(imports+`limit = 2
Predicate<int> above = (int value) => value > limit
limit = 99
print(value=above.accepts(value=3))
for value in filter(values=[1, 2, 3], predicate=(int value) => value > 1):
    print(value=value)
for value in transform(values=[2, 3], transformation=(int value) => value * 2):
    print(value=value)
print(value=aggregate(values=[2, 3], initial=7, aggregator=(int total, int value) => total + value))
`, '',root=>runBoth(root,'true\n2\n3\n4\n6\n12\n')));

test('closures return from factories and retain immutable record and frozen collection captures',()=>project(imports+`import Limit and above from rules
predicate = above(limit=Limit(minimum=2))
print(value=predicate.accepts(value=3))
values = [7, 9]
freeze values as fixed
Transformation<int, int> counted = (int value) => fixed.length() + value
print(value=counted.apply(value=3))
`, `import Predicate from august.collections
record Limit(int minimum)
above(Limit limit) returns Predicate<int>:
    return (int value) => value > limit.minimum
`,root=>runBoth(root,'true\n5\n')));

test('record storage supplies the existing deep immutable capture guarantee',()=>project(imports+`import Limit and above from rules
predicate = above(limit=Limit(values=[7, 9]))
print(value=predicate.accepts(value=1))
`, `import Predicate from august.collections
record Limit(List<int> values)
above(Limit limit) returns Predicate<int>:
    return (int value) => limit.values.length() > value
`,root=>runBoth(root,'true\n')));

test('closure inputs narrow optional data and labels stay mandatory on invocation',()=>project(imports+`Predicate<optional int> present = (optional int value) => value != null
for value in filter(values=[null, 1, 2], predicate=present):
    print(value=value)
`, '',root=>{
 runBoth(root,'1\n2\n');
 rejected(root,imports+'Predicate<int> predicate = (int value) => value > 0\nprint(value=predicate.accepts(2))\n','',/label|input|parameter/);
}));

test('callback conversion rejects effects, errors, ownership, defaults and unsupported native/generic contracts',()=>project('', '',root=>{
 const cases=[
  [imports+'Predicate<int> callback = noisy\n','noisy(int value) returns bool:\n    print(value=value)\n    return true\n',/CALLBACK/],
  [imports+'import failed from rules\nPredicate<int> callback = failed\n','failed(int value) returns bool unless FileError:\n    throw FileError()\n',/CALLBACK/],
  [imports+'import defaulted from rules\nPredicate<int> callback = defaulted\n','defaulted(int value=1) returns bool:\n    return true\n',/CALLBACK/],
  [imports+'import generic from rules\nPredicate<int> callback = generic\n','generic<T>(T value) returns bool:\n    return true\n',/CALLBACK/],
  [imports+'Predicate<int> callback = (borrow int value) => true\n','',/CALLBACK/],
  [imports+'Predicate<int> callback = (int other) => true\n','',/CALLBACK/],
  [imports+'Predicate<int> callback = (int value) => print(value=value)\n','',/EFFECT|CALLBACK/],
  ['callback = (int value) => value > 0\n','',/CALLBACK/],
  [imports+'import positive from rules\ncallback = positive\n','positive(int value) returns bool:\n    return true\n',/CALLBACK/]
 ];
 // The first case also needs an ordinary explicit import, so missing imports
 // cannot masquerade as the expected callback-contract diagnostic.
 cases[0][0]=imports+'import noisy from rules\nPredicate<int> callback = noisy\n';
 for(const [main,rules,expected] of cases)rejected(root,main,rules,expected);
}));

test('closures reject mutable, owned and borrowed reference captures without moving outer values',()=>project('', '',root=>{
 const cases=[
  [imports+'values = [1, 2]\nPredicate<int> callback = (int value) => values.length() > value\n','',/CALLBACK/],
  [imports+'import Holder from rules\nown Holder holder = Holder()\nPredicate<int> callback = (int value) => holder.count() > value\n','interface Counter:\n    count() returns int\nHolder() implements Counter:\n    count():\n        return 2\n',/CALLBACK/],
  ['import Holder from rules\n',imports+'interface Factory:\n    make() returns Predicate<int>\nHolder(int limit) implements Factory:\n    make():\n        return (int value) => value > self.limit\n',/NAME|CALLBACK/],
  ['import factory from rules\n',imports+'factory(Data values) returns Predicate<int>:\n    return (int value) => values == [value]\n',/CALLBACK/],
  [imports+'values = [1]\nTuple<Data> box = (values,)\nPredicate<int> callback = (int value) => box.get(index=0) == [value]\n','',/CALLBACK/],
  ['import factory from rules\n',imports+'factory<T implements Data>(Tuple<T> left, Tuple<T> right) returns Predicate<int>:\n    return (int value) => left.get(index=0) == right.get(index=0)\n',/CALLBACK/],
  ['import factory from rules\n',imports+'factory(borrow immutable List<int> values) returns Predicate<int>:\n    return (int value) => values.length() > value\n',/BORROW|CALLBACK/]
 ];
 for(const [main,rules,expected] of cases)rejected(root,main,rules,expected);
}));

test('lambda parameters can shadow outer names, keep source help and never escape into enclosing completion',()=>project(imports+`value = 99
Predicate<int> predicate = (int value) => value > 0
print(value=predicate.accepts(value=2))
print(value=value)
`, '',root=>{
 runBoth(root,'true\n99\n');const loaded=loadProject(root),checked=checkProject(loaded);assert.deepEqual(checked.diagnostics,[]);
 const file=loaded.main,offset=file.source.indexOf('value > 0');assert.equal(hoverInfo(checked,file.path,offset).detail,'int value');
 assert.ok(completions(checked,file.path,offset).some(item=>item.label==='value'));
 const arrow=hoverInfo(checked,file.path,file.source.indexOf('=>'));assert.match(arrow.detail,/Predicate<int>\.accepts\(int value\) returns bool/);
 assert.match(arrow.documentation,/No local values/);
 const colors=semanticTokens(checked,file.path), colorAt=offset=>{const prefix=file.source.slice(0,offset).split('\n');return colors.find(token=>token.line===prefix.length-1&&token.start===prefix.at(-1).length)?.type;};
 assert.equal(colorAt(file.source.indexOf('value = 99')),'variable');
 assert.equal(colorAt(file.source.indexOf('int value')+4),'parameter');
 assert.equal(colorAt(file.source.lastIndexOf('value)')),'variable');
 assert.ok(completions(checked,file.path,file.source.length).some(item=>item.label==='callback template'&&item.insertText.includes('=>')));
 const result=spawnSync(process.execPath,[cli,'spec',root],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.match(readFileSync(file.path+'.md','utf8'),/callback/);
}));

test('pure callback syntax formats multiline decisions in all preferences',()=>project(imports+`Predicate<int> predicate = (int value) => match value > 0:
    when true:
        true
    when false:
        false
print(value=predicate.accepts(value=2))
`, '',root=>{
 const original=loadProject(root).main;
 for(const style of ['indent','braces'])for(const assignment of ['equals','to'])for(const indentation of ['spaces','tabs']){
  const settings={config:{block_style:style,assignment,indentation}},text=formatFile(settings,original),reparsed=parse(original.path,text);
  assert.deepEqual(reparsed.diagnostics,[],text);assert.equal(formatFile(settings,reparsed.file),text);
  writeFileSync(original.path,text);assert.deepEqual(checkProject(loadProject(root)).diagnostics,[],text);
 }
 runBoth(root,'true\n');
}));

test('callbacks survive stored fields and collection pressure with separate creation-time captures',()=>project(imports+`import Checker and keep from rules
List<Predicate<int>> callbacks = []
for limit in [0, 1, 2]:
    Predicate<int> callback = (int value) => value > limit
    borrow callbacks:
        callbacks.append(value=callback)
for index in [1 for ignored in [1, 2, 3]]:
    print(value=index)
checker = Checker(predicate=keep(limit=3))
index = 0
while index < 20000:
    Predicate<int> discarded = (int value) => value > index
    index = index + 1
for callback in callbacks:
    print(value=callback.accepts(value=2))
print(value=checker.accepts(value=4))
`, `import Predicate from august.collections
interface Check:
    accepts(int value) returns bool
Checker(Predicate<int> predicate) implements Check:
    accepts(int value):
        return predicate.accepts(value)
keep(int limit) returns Predicate<int>:
    return (int value) => value > limit
`,root=>runBoth(root,'1\n1\n1\ntrue\ntrue\nfalse\ntrue\n')));

test('function values preserve resolved nominal identities and reject larger/default interfaces',()=>project('', '',root=>{
 const cases=[
  ['import Callback and target from rules\nCallback callback = target\n','record Left(int value)\nrecord Right(int value)\ninterface Callback:\n    accepts(Left value) returns bool\ntarget(Right value) returns bool:\n    return true\n',/CALLBACK/],
  ['import Derived from rules\nDerived callback = (string value) => value + "!"\n','interface Parent:\n    apply(int value) returns string\ninterface Derived extends Parent:\n    apply(string value) returns string\n',/CALLBACK|INTERFACE/],
  ['import Both from rules\nBoth callback = (int value) => true\n','interface Left:\n    accepts(int value) returns bool\ninterface Right:\n    accepts(int value) returns bool unless FileError\ninterface Both extends Left, Right:\n    pass\n',/CALLBACK/],
  ['import Both from rules\nBoth callback = (int value) => value > 0\n','interface Left:\n    accepts(int value) returns bool\ninterface Right:\n    accepts(string value) returns bool\ninterface Both extends Left, Right:\n    pass\n',/CALLBACK/],
  ['import Callback and target from rules\nCallback callback = target\n','interface Callback:\n    accepts(int value) returns bool\n    other(int value) returns bool\ntarget(int value) returns bool:\n    return true\n',/CALLBACK/],
  ['import Callback and target from rules\nCallback callback = target\n','interface Callback:\n    accepts(int value) returns bool:\n        return true\ntarget(int value) returns bool:\n    return true\n',/CALLBACK/],
  [imports+'extern C positive(int value) returns bool\nPredicate<int> callback = positive\n','',/CALLBACK/],
  [imports+'Predicate<int> callback = (int value) => 1 / value > 0\n','',/ERROR|THROW/]
 ];
 for(const [main,rules,expected] of cases)rejected(root,main,rules,expected);
 writeFileSync(join(root,'main.aug'),'import Callback and target from rules\nCallback callback = target\nprint(value=callback.accepts(value=2))\n');
 writeFileSync(join(root,'rules.aug'),'interface Parent:\n    accepts(int value) returns bool\ninterface Callback extends Parent:\n    pass\ntarget(int value) returns bool:\n    return value > 0\n');
 runBoth(root,'true\n');
}));

test('callbacks created in a worker use its heap and cannot transfer between heaps',()=>project(`import calculate from rules
try:
    scope:
        job = start worker calculate(values=[1, 2, 3])
        for value in wait for job:
            print(value=value)
catch ConcurrencyError error:
    print(value="unexpected")
`, `import transform from august.collections
calculate(List<int> values) returns List<int>:
    return transform(values, transformation=(int value) => value * 3)
`,root=>{
 runBoth(root,'3\n6\n9\n');
 rejected(root,imports+'import use from rules\nPredicate<int> callback = (int value) => value > 0\ntry:\n    scope:\n        job = start worker use(callback)\ncatch ConcurrencyError error:\n    pass\n', 'import Predicate from august.collections\nuse(Predicate<int> callback) returns bool:\n    return callback.accepts(value=2)\n',/WORKER/);
}));

test('semantic context distinguishes callback dependencies from immediate calls',()=>project(imports+'import positive from rules\nPredicate<int> callback = positive\n','positive(int value) returns bool:\n    return value > 0\n',root=>{
 const value=semanticGraph(checkProject(loadProject(root)),true),reference=value.relationships.find(edge=>edge.kind==='function-value');assert.ok(reference);
 assert.ok(!value.relationships.some(edge=>edge.kind==='call'&&edge.to===reference.to));
 const context=spawnSync(process.execPath,[cli,'context',root,'--file',join(root,'rules.aug'),'--name','positive','--json'],{encoding:'utf8'});assert.equal(context.status,0,context.stderr);
 assert.ok(JSON.parse(context.stdout).reverseCallers.some(edge=>edge.kind==='function-value'));
}));

test('closure body dependencies are retained as deferred calls in both context APIs',()=>project('import make from rules\ncallback = make()\n',`import Predicate from august.collections
positive(int value) returns bool:
    return value > 0
make() returns Predicate<int>:
    return (int value) => positive(value)
`,root=>{
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 const value=semanticGraph(checked,true),reference=value.relationships.find(edge=>edge.kind==='callback-call');assert.ok(reference);
 assert.ok(!value.relationships.some(edge=>edge.kind==='call'&&edge.from===reference.from&&edge.to===reference.to));
 const context=spawnSync(process.execPath,[cli,'context',root,'--file',join(root,'rules.aug'),'--name','make','--json'],{encoding:'utf8'});assert.equal(context.status,0,context.stderr);
 const packet=JSON.parse(context.stdout),contract=packet.contracts.find(value=>value.name==='make');assert.deepEqual(contract.calls,[]);
 assert.ok(contract.functionValues.some(value=>value.kind==='callback-call'&&value.target.endsWith(':positive')));
 assert.ok(packet.contracts.some(value=>value.name==='positive'));
}));

test('same-file test programs retain checked callback plans and captures',()=>project('',`import Transformation from august.collections
double(int value):
    return value * 2
test double:
    when callbacks:
        it delegates:
            offset = 1
            Transformation<int, int> callback = (int value) => double(value) + offset
            assertEqual(actual=callback.apply(value=2), expected=5)
`,root=>{
 for(const backend of ['c','llvm']){const result=spawnSync(process.execPath,[cli,'test',root,'--backend',backend,'--json'],{encoding:'utf8',timeout:60000});assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).passed,1);}
}));

test('factory callbacks retain caller ownership and borrow boundaries through their captured data',()=>project('', '',root=>{
 const declarations=`import Predicate from august.collections
record Limit(int minimum)
make(Limit limit) returns Predicate<int>:
    return (int value) => value > limit.minimum
escape(own Limit limit) returns Predicate<int>:
    callback = make(limit)
    return callback
`;
 rejected(root,'import escape from rules\n',declarations,/OWN|BORROW/);
 const borrowed=`import Predicate from august.collections
record Limit(int minimum)
make(Limit limit) returns Predicate<int>:
    return (int value) => value > limit.minimum
escape(borrow Limit limit) returns Predicate<int>:
    return make(limit)
`;
 rejected(root,'import escape from rules\n',borrowed,/OWN|BORROW/);
}));
