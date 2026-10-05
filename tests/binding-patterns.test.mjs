import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {parse} from '../src/parser.ts';
import {formatFile} from '../src/formatter.ts';
import {hoverInfo,completions,semanticTokens} from '../src/editor.ts';
import {snippetCatalog,snippetBody} from '../src/snippets.ts';
import {semanticGraph} from '../src/symbols.ts';
const cli=resolve('bin/aug.mjs');
const command=(root,name,args=[])=>spawnSync(process.execPath,[cli,name,root,...args],{encoding:'utf8',timeout:60000});
function project(files,run){const root=mkdtempSync(join(tmpdir(),'aug-binding-patterns-'));try{for(const [name,text] of Object.entries(files)){mkdirSync(dirname(join(root,name)),{recursive:true});writeFileSync(join(root,name),text);}return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
const runBoth=(root,expected)=>{for(const backend of ['llvm','c']){const result=command(root,'run',['--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,expected);}};

test('named record and nested tuple patterns bind checked fields',()=>project({
 'main.aug':`import Person and Address from people
person = Person(name="Ada", address=Address(city="London"), ratings=(7, 9))
{name, address: {city}, ratings: (first, second)} = person
print(value=name)
print(value=city)
print(value=first + second)
(outer, (inner, last)) = (1, (2, 3))
print(value=outer + inner + last)
`,
 'people.aug':'record Address(string city)\nrecord Person(string name, Address address, Tuple<int, int> ratings)\n'
},root=>runBoth(root,'Ada\nLondon\n16\n6\n')));

test('loop patterns read snapshots of named records and nested map entries',()=>project({
 'main.aug':`import Point from points
points = [Point(x=2, y=3)]
borrow points:
    for {x, y} in points:
        print(value=x + y)
        points.append(value=Point(x=9, y=9))
print(value=points.length())
entries = {"first": (7, 9)}
for (key, (left, right)) in entries:
    print(value=key)
    print(value=left + right)
for (cell,) in [(4,), (5,)]:
    print(value=cell)
`,
 'points.aug':'record Point(int x, int y)\n'
},root=>runBoth(root,'5\n2\nfirst\n16\n4\n5\n')));


test('patterns reject wrong shapes, duplicate fields/names, existing names and private reads',()=>project({'main.aug':'','data.aug':'record Pair(int left, int right)\nrecord Secret(int _hidden)\n'},root=>{
 const fixtures=[
  ['(a, (b, c)) = (1, 2)',/Tuple with 2 positions/],
  ['(a,) = (1, 2)',/Tuple with 1 positions/],
  ['{left, unknown} = Pair(left=1, right=2)',/no record field unknown/],
  ['{left, left} = Pair(left=1, right=2)',/Repeated record field left/],
  ['{left: same, right: same} = Pair(left=1, right=2)',/variable same already exists/],
  ['left = 0\n{left} = Pair(left=1, right=2)',/variable left already exists/],
  ['{left} = {"left": 1}',/immutable record/],
  ['optional Pair value = null\n{left} = value',/Narrow optional/],
  ['{_hidden} = Secret(hidden=1)',/private to Secret/],
  ['([a], b) = (1, 2)',/binding pattern/]
 ];
 for(const [source,message] of fixtures){writeFileSync(join(root,'main.aug'),'import Pair and Secret from data\n'+source+'\n');const result=command(root,'check',['--json']);assert.equal(result.status,1,result.stdout+result.stderr);assert.match(result.stdout,message,source);}
}));

test('generic records, aliases and optional narrowing retain checked editor and source identities',()=>project({
 'main.aug':`import Envelope from data
optional Envelope<string> entry = Envelope<string>(value="Ada", rank=7)
match entry:
    when null:
        print(value="none")
    when some found:
        {value: name} = found
        print(value=name)
`,
 'data.aug':'record Envelope<T implements Data>(T value, int rank)\n'
},root=>{
 const loaded=loadProject(root),checked=checkProject(loaded);assert.deepEqual(checked.diagnostics,[]);const file=loaded.main,offset=file.source.lastIndexOf('name');assert.equal(hoverInfo(checked,file.path,offset).detail,'string name');assert.ok(completions(checked,file.path,offset).some(item=>item.label==='name'));
 const graph=semanticGraph(checked,true),read=graph.occurrences.find(item=>item.file==='main.aug'&&item.role==='read'&&item.start===file.source.indexOf('value: name'));assert.ok(read);assert.match(read.symbol,/Envelope\/input\/value$/);
 for(const style of ['indent','braces'])for(const assignment of ['equals','to'])for(const indentation of ['spaces','tabs']){const text=formatFile({config:{block_style:style,assignment,indentation}},file);assert.deepEqual(parse(file.path,text).diagnostics,[]);writeFileSync(file.path,text);runBoth(root,'Ada\n');}
 const spec=command(root,'spec');assert.equal(spec.status,0,spec.stderr);const prose=readFileSync(file.path+'.md','utf8');assert.match(prose,/value.*name/);assert.match(prose,/source/);
}));

test('patterns preserve read-only access and borrowed aliases',()=>project({'main.aug':''},root=>{
 const fixtures=[
  ['select(Tuple<List<int>> value) { (items,) = value; items.append(value=7) }',/borrow|read.only/],
  ['select(borrow Tuple<List<int>> value) returns List<int> { (items,) = value; return items }',/borrow.*escape|return.*borrow/i],
  ['select(List<Tuple<List<int>>> values) { for (items,) in values { items.append(value=7) } }',/borrow|read.only/],
  ['select(Tuple<List<int>> value) { (items,) = value; freeze items as saved }',/Freezing an external input requires own/],
  ['select(List<Tuple<List<int>>> values) { for (items,) in values { freeze items as saved } }',/Freezing an external input requires own/],
  ['select() { (next,) = (1,) }',/next is reserved/],
  ['select(Tuple<List<int>> value) { (items,) = (value.get(index=0),); freeze items as saved }',/Freezing an external input requires own/],
  ['identity(Tuple<List<int>> value) { return value }\nselect(Tuple<List<int>> value) { (items,) = identity(value); freeze items as saved }',/Freezing an external input requires own/]
 ];
 for(const [source,message] of fixtures){writeFileSync(join(root,'data.aug'),source+'\n');const result=command(root,'check',['--json']);assert.equal(result.status,1,result.stdout+result.stderr);assert.match(result.stdout,message);}
}));


test('renamed property labels provide field help and navigation while locals keep their own identity',()=>project({
 'main.aug':`import Person from data
person = Person(name="Ada", age=37)
{name: displayName} = person
print(value=displayName)
`,
 'data.aug':'/** A person.\n * @param name The display name.\n */\nrecord Person(string name, int age)\n'
},root=>{
 const checked=checkProject(loadProject(root)),file=checked.project.main;assert.deepEqual(checked.diagnostics,[]);const fieldOffset=file.source.indexOf('name: displayName'),localOffset=file.source.lastIndexOf('displayName');
 const field=hoverInfo(checked,file.path,fieldOffset);assert.equal(field.detail,'string Person.name');assert.match(field.documentation,/display name/);assert.equal(hoverInfo(checked,file.path,localOffset).detail,'string displayName');
 const navigation=command(root,'definition',['--file',file.path,'--offset',String(fieldOffset)]);assert.equal(navigation.status,0,navigation.stderr);const target=JSON.parse(navigation.stdout);assert.equal(target.name,'name');assert.equal(target.file,join(root,'data.aug'));assert.equal(target.line,4);
 assert.ok(semanticTokens(checked,file.path).some(item=>item.line===2&&item.start===1&&item.type==='property'));
 runBoth(root,'Ada\n');
}));

test('pattern sources and checked failures are evaluated and propagated once',()=>project({
 'main.aug':`import read and Point and Unavailable from data
import Console and SystemConsole from august.io
implement Console with SystemConsole
try:
    {x, y} = read(fail=false)
    print(value=x + y)
    {x: nextX} = read(fail=true)
    print(value=nextX)
catch Unavailable error:
    print(value="caught")
`,
 'data.aug':`import Console from august.io
record Point(int x, int y)
error Unavailable(string message)
read(bool fail, resolve Console console):
    console.write(value="read")
    if fail:
        throw Unavailable(message="failed")
    return Point(x=2, y=3)
`
},root=>runBoth(root,'read\n5\nread\ncaught\n')));


test('pattern aliases can read borrowed inputs without gaining mutation permission',()=>project({
 'main.aug':`import total from data
items = ([3, 7],)
borrow items:
    print(value=total(value=items))
`,
 'data.aug':`total(borrow Tuple<List<int>> value):
    (items,) = value
    result = 0
    for item in items:
        result = result + item
    return result
`
},root=>runBoth(root,'10\n')));

test('formatting keeps nested pattern comments inside their delimiters',()=>project({
 'main.aug':`import Pair from data
{left: (first, /* second cell */ second /* tuple end */),
 // right field
 right /* record end */} = Pair(left=(1, 2), right=3)
print(value=first + second + right)
`,
 'data.aug':'record Pair(Tuple<int, int> left, int right)\n'
},root=>{
 const loaded=loadProject(root);
 for(const style of ['indent','braces']){
  const config={block_style:style,assignment:'equals',indentation:'spaces'},text=formatFile({config},loaded.main);
  assert.ok(text.indexOf('tuple end')<text.indexOf('right field'),text);
  assert.ok(text.indexOf('record end')<text.indexOf('= Pair'),text);
  assert.deepEqual(parse(loaded.main.path,text).diagnostics,[]);
  const formatted=parse(loaded.main.path,text).file;
  assert.equal(formatFile({config},formatted),text);
  writeFileSync(loaded.main.path,text);runBoth(root,'6\n');
 }
}));


test('binding templates use the selected assignment and indentation preferences',()=>{
 for(const prefix of ['bindrecord','bindtuple']){
  const template=snippetCatalog.find(item=>item.prefix===prefix);assert.ok(template);
  for(const style of ['braces','indent'])for(const tabs of [false,true])for(const assignment of ['equals','to']){
   const text=snippetBody(template.body,style,tabs,assignment);
   assert.ok(text.includes(assignment==='to'?' to ':' = '),text);
  }
 }
});


test('empty patterns check their source shape and describe no binding',()=>project({
 'main.aug':`import Point from data
{} = Point(x=7)
() = ()
print(value="done")
`,
 'data.aug':'record Point(int x)\n'
},root=>{
 runBoth(root,'done\n');const result=command(root,'spec');assert.equal(result.status,0,result.stderr);
 const prose=readFileSync(join(root,'main.aug.md'),'utf8');assert.match(prose,/empty pattern creates no bindings/);assert.doesNotMatch(prose,/binds \./);
}));
