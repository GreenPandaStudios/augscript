import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from './compiler-process.mjs';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {parse} from '../src/parser.ts';
import {formatFile} from '../src/formatter.ts';
import {hoverInfo,completions,semanticTokens} from '../src/editor.ts';
import {semanticGraph} from '../src/symbols.ts';
import {snippetCatalog,snippetBody} from '../src/snippets.ts';
const cli=resolve('bin/aug.mjs');
function project(main,functions,run){const root=mkdtempSync(join(tmpdir(),'aug-comprehensions-'));try{writeFileSync(join(root,'main.aug'),main);writeFileSync(join(root,'rules.aug'),functions);return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
function runBoth(root,expected){for(const backend of ['c','llvm']){const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,expected,backend);}}
function rejected(root,source,pattern){writeFileSync(join(root,'main.aug'),source);const result=spawnSync(process.execPath,[cli,'check',root,'--json'],{encoding:'utf8'});assert.equal(result.status,1,result.stdout+result.stderr);assert.match(result.stdout,pattern);}

test('comprehensions select and project in snapshot order without changing their inputs',()=>project(`values = [-1, 0, 2, 3]
selected = [value * 2 for value in values if value > 0]
for value in selected:
    print(value=value)
print(value=values.length())
List<int> empty = []
print(value=[value + 1 for value in empty].length())
print(value=[value for value in values if false].length())
borrow selected:
    selected.append(value=9)
print(value=selected.length())
`, '', root=>runBoth(root,'4\n6\n4\n0\n0\n3\n')));

test('comprehensions use record and tuple patterns over all existing iterable kinds',()=>project(`import Point from rules
points = [Point(x=2, y=3), Point(x=-1, y=9)]
for total in [x + y for {x, y} in points if x > 0]:
    print(value=total)
for text in [key for (key, (left, right)) in {"first": (7, 9), "second": (1, 3)} if left > 2]:
    print(value=text)
for item in [n * 2 for n in {3, 1, 3}]:
    print(value=item)
for item in [n for n in (7, 9)]:
    print(value=item)
for item in [n for (n,) in [(4,), (5,)]]:
    print(value=item)
`, 'record Point(int x, int y)\n',root=>runBoth(root,'5\nfirst\n6\n2\n7\n9\n4\n5\n')));

test('comprehension input runs once, predicates precede selected projections and iteration is a snapshot',()=>project(`import source and keep and project from rules
import Console and SystemConsole from august.io
implement Console with SystemConsole
values = source()
borrow values:
    selected = [project(value) for value in values if keep(values, value)]
    print(value=selected.length())
    print(value=values.length())
`, `import Console from august.io
source(resolve Console console) returns List<int>:
    console.write(value="source")
    return [1, 2, 3]
keep(borrow List<int> values, int value) returns bool:
    values.append(value=9)
    return value > 1
project(resolve Console console, int value) returns int:
    console.write(value=$"project {value}")
    return value * 2
`,root=>runBoth(root,'source\nproject 2\nproject 3\n2\n6\n')));

test('comprehensions narrow optional items and propagate checked errors without projecting rejected items',()=>project(`import project from rules
List<optional int> values = [null, 0, 2]
for value in [value + 1 for value in values if value != null]:
    print(value=value)
try:
    selected = [project(value) for value in [-1, 2] if value > 0]
    print(value=selected.length())
    failed = [project(value) for value in [2, -1]]
    print(value="unreachable")
catch ArithmeticError error:
    print(value="caught")
`, `project(int value) returns int unless ArithmeticError:
    if value < 0:
        throw ArithmeticError()
    return value * 2
`,root=>runBoth(root,'1\n3\n1\ncaught\n')));

test('comprehensions support nested selection and contextual empty projections',()=>project(`List<List<int>> emptyRows = [[] for value in [1, 2]]
print(value=emptyRows.length())
for row in [[inner * outer for inner in [1, 2]] for outer in [3, 4]]:
    for value in row:
        print(value=value)
`, '',root=>runBoth(root,'2\n3\n6\n4\n8\n')));

test('comprehension bindings stay local and reject collisions, invalid shapes and non-bool conditions',()=>project('', 'record Point(int x, int y)\n',root=>{
 const cases=[
 ['selected = [value for value in [1]]\nprint(value=value)',/Unknown name value/],
 ['value = 7\nselected = [value for value in [1]]',/Pattern variable value already exists/],
 ['selected = [x for (x, y) in [1]]',/Tuple with 2 positions/],
 ['selected = [x for x in 1]',/needs a List, Set, Map, or Tuple/],
 ['selected = [x for x in (1, "two")]',/tuple positions must have the same type/],
 ['selected = [x for x in [1] if 1]',/Condition must be bool/],
 ['selected = [print(value=x) for x in [1]]',/cannot contain void/],
 ['selected = [x for next in [1]]',/next is reserved/],
 ['List<string> selected = [x for x in [1]]',/expects string, got int/]
 ];
 for(const [source,message] of cases)rejected(root,source+'\n',message);
}));

test('selected references retain read-only access and native ownership cannot enter a comprehension',()=>project('',`interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
`,root=>{
 const cases=[
 ['values = [[1]]\nselected = [value for value in values]\nborrow selected:\n    selected.get(index=0).append(value=2)',/BORROW|MUTABILITY/],
 ['values = [[1]]\nselected = [value.append(value=2) for value in values]',/BORROW|MUTABILITY/],
 ['import Resource from rules\nown Resource resource = Resource()\nselected = [resource for value in [1]]',/cannot copy an owned value/]
 ];
 for(const [source,message] of cases)rejected(root,source+'\n',message);
}));

test('fresh scalar comprehension copies may leave a borrow, while retained external children cannot be frozen',()=>project(`import copy from rules
values = [1, 2]
borrow values:
    copied = copy(values)
    print(value=copied.length())
`, `copy(borrow List<int> values) returns immutable List<int>:
    own List<int> copied = [value for value in values]
    freeze copied as immutableCopy
    return immutableCopy
`,root=>{
 runBoth(root,'2\n');
 writeFileSync(join(root,'rules.aug'),`copy(List<List<int>> values):
    own List<List<int>> copied = [value for value in values]
    freeze copied as immutableCopy
`);
 rejected(root,'import copy from rules\n',/external input requires own ownership of every reachable reference/);
}));

test('comprehensions retain binding hover, completion, semantic identities and source descriptions',()=>project(`import Point from rules
points = [Point(x=2, y=3)]
selected = [x + y for {x, y} in points if x > 0]
print(value=selected.length())
`, '/** A point.\n * @param x Horizontal position.\n */\nrecord Point(int x, int y)\n',root=>{
 const loaded=loadProject(root),checked=checkProject(loaded);assert.deepEqual(checked.diagnostics,[]);
 const file=loaded.main,offset=file.source.indexOf('x + y');assert.equal(hoverInfo(checked,file.path,offset).detail,'int x');
 assert.ok(completions(checked,file.path,offset).some(item=>item.label==='x'));
 const graph=semanticGraph(checked,true),uses=graph.occurrences.filter(item=>item.file==='main.aug'&&item.start===offset&&item.role==='read');assert.equal(uses.length,1);assert.match(uses[0].symbol,/local:main.aug/);
 assert.ok(!completions(checked,file.path,file.source.indexOf('print')).some(item=>item.label==='x'));
 const before=file.source.slice(0,offset).split('\n');assert.ok(semanticTokens(checked,file.path).some(item=>item.line===before.length-1&&item.start===before.at(-1).length&&item.type==='variable'));
 const result=spawnSync(process.execPath,[cli,'spec',root],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
 const prose=readFileSync(file.path+'.md','utf8');assert.match(prose,/new list/);assert.match(prose,/snapshot/);assert.match(prose,/positive/);assert.ok(!prose.includes('`` as'),prose);
}));

test('comprehensions format and reparse both styles and preserve comments',()=>project(`selected = [
    // Output after selection.
    value * 2
    for value in [1, 2]
    if value > 0 // Keep positive values.
]
for value in selected:
    print(value=value)
`, '',root=>{
 const original=loadProject(root).main;
 for(const style of ['indent','braces'])for(const assignment of ['equals','to'])for(const indentation of ['spaces','tabs']){
  const settings={config:{block_style:style,assignment,indentation}},text=formatFile(settings,original);
  const reparsed=parse(original.path,text);assert.deepEqual(reparsed.diagnostics,[],text);assert.equal(formatFile(settings,reparsed.file),text);
  assert.match(text,/Output after selection/);assert.match(text,/Keep positive values/);
  writeFileSync(original.path,text);runBoth(root,'2\n4\n');
 }
 const snippet=snippetCatalog.find(item=>item.prefix==='select');assert.ok(snippet);
 assert.match(snippetBody(snippet.body,'indent',false,'to'),/ to /);
}));


test('worker tasks selected by a comprehension keep ordinary scope waits and copied inputs',()=>project(`import double from rules
try:
    scope:
        tasks = [start worker double(value) for value in [2, 3]]
        wait for tasks as results
        for result in results:
            print(value=result)
catch ConcurrencyError error:
    print(value="unexpected admission failure")
`, `double(int value) returns int:
    return value * 2
`,root=>runBoth(root,'4\n6\n')));

test('comprehensions reject repeated continuation calls, repeated owned transfers and unhandled failures',()=>project('', '',root=>{
 const cases=[
  ['interceptor Repeated():\n    around() returns List<int>:\n        return [next() for item in [1, 2]]\n',/NEXT/],
  [`interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
consume(own Resource resource) returns int:
    return 1
attempt(own Resource resource):
    selected = [consume(resource) for item in [1, 2]]
`,/moved value resource/],
  [`failed(int value) returns int unless ArithmeticError:
    throw ArithmeticError()
attempt() returns List<int> unless FileError:
    return [failed(value) for value in [1]]
`,/ArithmeticError/]
 ];
 for(const [rules,message] of cases){writeFileSync(join(root,'rules.aug'),rules);rejected(root,'',message);}
 rejected(root,'optional List<int> values = null\nselected = [value for value in values]\n',/Narrow an optional collection/);
}));

test('projection failures release enclosing owned resources once on both backends',()=>project(`import Resource and failed from rules
try:
    own Resource resource = Resource()
    selected = [failed(value) for value in [1, 2, 3]]
    print(value="unreachable")
catch ArithmeticError error:
    print(value="caught")
`, `interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
failed(int value) returns int unless ArithmeticError:
    if value == 2:
        throw ArithmeticError()
    return value
`,root=>{for(const backend of ['c','llvm']){
 const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000,env:{...process.env,AUG_TRACE_DROPS:'1'}});
 assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'caught\n');assert.equal((result.stderr.match(/drop: (?:[^\n]+:)?Resource/g)??[]).length,1,result.stderr);
}}));


test('a side-effecting comprehension iterable expression is evaluated exactly once',()=>project(`import source from rules
import Console and SystemConsole from august.io
implement Console with SystemConsole
selected = [value * 2 for value in source() if value > 0]
for value in selected:
    print(value=value)
`, `import Console from august.io
source(resolve Console console) returns List<int>:
    console.write(value="source")
    return [1, 2, 3]
`,root=>runBoth(root,'source\n2\n4\n6\n')));


test('a frozen factory result cannot acquire mutable permission through a mutable return annotation',()=>{
 for(const returned of ['saved','copied','alias'])project('import copy from rules\n',`copy(List<int> values) returns List<int>:
    ${returned==='alias'?'':'own List<int> '}copied = [value for value in values]
${returned==='alias'?'    alias = copied\n':''}    freeze copied as saved
    return ${returned}
`,root=>rejected(root,`import copy from rules
copied = copy(values=[1, 2])
borrow copied:
    copied.append(value=3)
`,/BORROW|MUTABILITY/));
});

test('multiline match projections, inputs and conditions format without attaching iteration to a case',()=>project(`flag = true
selected = [match value:
    when true:
        1
    when false:
        0
for value in [true, false]]
for value in selected:
    print(value=value)
fromChoice = [value for value in match flag:
    when true:
        [2, 3]
    when false:
        [4]
if match value:
    when 2:
        true
    else:
        false
]
for value in fromChoice:
    print(value=value)
`, '',root=>{
 const original=loadProject(root).main;
 for(const style of ['indent','braces'])for(const assignment of ['equals','to'])for(const indentation of ['spaces','tabs']){
  const settings={config:{block_style:style,assignment,indentation}},text=formatFile(settings,original);
  const reparsed=parse(original.path,text);assert.deepEqual(reparsed.diagnostics,[],text);assert.equal(formatFile(settings,reparsed.file),text);
  writeFileSync(original.path,text);assert.deepEqual(checkProject(loadProject(root)).diagnostics,[],text);
 }
 runBoth(root,'1\n0\n2\n');
}));


test('generic calls provide the result context for empty comprehension projections',()=>project(`import count from rules
print(value=count(values=[[] for value in [1, 2]], example=7))
`, `count<T>(List<List<T>> values, T example) returns int:
    return values.length()
`,root=>runBoth(root,'2\n')));
