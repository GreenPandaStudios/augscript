import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from './compiler-process.mjs';
import {prepareLibraryFixtures} from './library-fixtures.mjs';
const cli=resolve('bin/aug.mjs');
function project(main,functions,run){const root=mkdtempSync(join(tmpdir(),'aug-collection-ops-'));try{writeFileSync(join(root,'main.aug'),main);writeFileSync(join(root,'rules.aug'),functions);prepareLibraryFixtures(root);return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
function runBoth(root,expected){for(const backend of ['llvm','c']){const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,expected,backend);}}
const rules=`import Predicate and Transformation and Aggregator and Comparator from august.collections
Positive() implements Predicate<int>:
    accepts(int value):
        return value > 0
Double() implements Transformation<int, int>:
    apply(int value):
        return value * 2
Total() implements Aggregator<int, int>:
    combine(int total, int value):
        return total + value
record Item(int priority, string name)
ByPriority() implements Comparator<Item>:
    compare(Item left, Item right):
        return left.priority - right.priority
`;

test('collection functions preserve order and inputs, including empty selections',()=>project(`import filter and transform and aggregate and remove and find from august.collections
import Positive and Double and Total from rules
values = [-1, 0, 2, 3]
selected = filter(values, predicate=Positive())
for value in selected:
    print(value=value)
for value in transform(values=selected, transformation=Double()):
    print(value=value)
print(value=aggregate(values, aggregator=Total(), initial=7))
for value in remove(values, predicate=Positive()):
    print(value=value)
print(value=find(values, predicate=Positive()) otherwise -1)
List<int> empty = []
print(value=filter(values=empty, predicate=Positive()).length())
print(value=aggregate(values=empty, aggregator=Total(), initial=9))
print(value=find(values=empty, predicate=Positive()) otherwise -1)
print(value=values.length())
`,rules,root=>runBoth(root,'2\n3\n4\n6\n11\n-1\n0\n2\n0\n9\n-1\n4\n')));

test('stable sorting keeps tied records in input order and supports default scalar comparators',()=>project(`import sort and sortIntegers and sortText from august.collections
import Item and ByPriority from rules
items = [Item(priority=2, name="b"), Item(priority=1, name="a"), Item(priority=2, name="c")]
try:
    ordered = sort(values=items, comparator=ByPriority())
    for item in ordered:
        print(value=item.name)
    for value in sortIntegers(values=[7, -1, 0, 7]):
        print(value=value)
    for value in sortText(values=["pear", "apple", "pear"]):
        print(value=value)
    List<int> empty = []
    print(value=sortIntegers(values=empty).length())
catch IndexError error:
    print(value="unexpected index error")
for item in items:
    print(value=item.name)
`,rules,root=>runBoth(root,'a\nb\nc\n-1\n0\n7\n7\napple\npear\npear\n0\nb\na\nc\n')));

test('collection callback contracts reject hidden mutation and effects',()=>project('import filter from august.collections\n',`import Predicate from august.collections
import Console from august.io
Noisy(resolve Console console) implements Predicate<int>:
    accepts(int value):
        console.write(value="called")
        return true
`,root=>{
 const result=spawnSync(process.execPath,[cli,'check',root,'--json'],{encoding:'utf8'});assert.equal(result.status,1);const issues=JSON.parse(result.stdout);assert.ok(issues.some(issue=>issue.code==='TYPE'&&/interface signature/.test(issue.message)),result.stdout);assert.ok(!issues.some(issue=>issue.code==='IMPORT'),result.stdout);
}));


test('ordinal text comparison preserves prefix, NUL and multibyte byte order',()=>{
 const pairs=[['',''],['a','ab'],['ab','a'],['a\0b','a\0c'],['é','z'],['é','é'],['👋','👋']];
 let source='import parse from json\ntry:\n';
 pairs.forEach(([left,right],index)=>{
  source+=`    left${index} = parse(input=${JSON.stringify(JSON.stringify(left))}).string()\n    right${index} = parse(input=${JSON.stringify(JSON.stringify(right))}).string()\n    print(value=left${index}.compare(other=right${index}))\n`;
 });
 source+='catch JsonError error:\n    print(value="unexpected JSON error")\n';
 project(source,'',root=>runBoth(root,'0\n-1\n1\n-1\n1\n-1\n0\n'));
});

test('stable integer sorting matches an independent finite int64 grid',()=>{
 const boundaries=[-(1n<<63n),-99n,-1n,0n,1n,99n,(1n<<63n)-1n],vectors=[[],[0n],[1n,1n]];
 for(let row=0;row<128;row++)vectors.push(Array.from({length:row%31},(_,column)=>boundaries[(row*3+column*column+column)%boundaries.length]));
 const source=`import sortIntegers from august.collections
List<List<int>> cases = [${vectors.map(vector=>'['+vector.join(', ')+']').join(', ')}]
try:
    for values in cases:
        ordered = sortIntegers(values)
        print(value=ordered.length())
        for value in ordered:
            print(value=value)
catch IndexError error:
    print(value="unexpected index error")
`;
 const expected=vectors.flatMap(vector=>[String(vector.length),...vector.slice().sort((left,right)=>left<right?-1:left>right?1:0).map(String)]).join('\n')+'\n';
 project(source,'',root=>runBoth(root,expected));
});


test('new collection containers can change while selected references keep read-only permissions',()=>{
 const rules=`import Predicate and filter from august.collections
Every() implements Predicate<List<int>>:
    accepts(List<int> value):
        return true
`;
 project(`import filter from august.collections
import Every from rules
original = [[1]]
selected = filter(values=original, predicate=Every())
borrow selected:
    selected.append(value=[2])
print(value=original.length())
print(value=selected.length())
`,rules,root=>runBoth(root,'1\n2\n'));
 for(const action of ['selected.get(index=0).append(value=2)','freeze selected as saved','own List<List<int>> ownedCopy = filter(values=input, predicate=Every()); freeze ownedCopy as saved'])project(`import filter from august.collections
import Every and attempt from rules
`,rules+`attempt(List<List<int>> input):
    selected = filter(values=input, predicate=Every())
    ${action}
`,root=>{
  const result=spawnSync(process.execPath,[cli,'check',root,'--json'],{encoding:'utf8'});assert.equal(result.status,1,result.stdout);
  const issues=JSON.parse(result.stdout);assert.ok(issues.some(issue=>['OWN','BORROW','MUTABILITY'].includes(issue.code)),result.stdout);
 });
});


test('optional data retains null values in selection and sorting',()=>project(`import filter and find and sort from august.collections
import Any and NullLast from rules
List<optional int> values = [null, 1, null, -1]
for value in filter(values, predicate=Any()):
    print(value=value)
print(value=find(values, predicate=Any()) otherwise 7)
try:
    for value in sort(values, comparator=NullLast()):
        print(value=value)
catch IndexError error:
    print(value="unexpected index error")
`,`import Predicate and Comparator from august.collections
Any() implements Predicate<optional int>:
    accepts(optional int value):
        return true
NullLast() implements Comparator<optional int>:
    compare(optional int left, optional int right):
        if left == null:
            if right == null:
                return 0
            return 1
        if right == null:
            return -1
        if left < right:
            return -1
        if left > right:
            return 1
        return 0
`,root=>runBoth(root,'null\n1\nnull\n-1\n7\n-1\n1\nnull\nnull\n')));

test('fresh scalar copies can leave a borrow and freeze without retaining source containers',()=>project(`import select and sorted from rules
values = [7, 3]
borrow values:
    print(value=select(values).length())
try:
    for value in sorted(values):
        print(value=value)
catch IndexError error:
    print(value="unexpected index error")
`,`import Predicate and filter and sortIntegers from august.collections
Any() implements Predicate<int>:
    accepts(int value):
        return true
select(borrow List<int> values) returns immutable List<int>:
    own List<int> selected = filter(values, predicate=Any())
    freeze selected as saved
    return saved
sorted(List<int> values) returns immutable List<int>:
    own List<int> selected = sortIntegers(values)
    freeze selected as saved
    return saved
`,root=>runBoth(root,'2\n3\n7\n')));
