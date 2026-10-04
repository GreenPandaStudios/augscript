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
const cli=resolve('bin/aug.mjs');
const command=(root,name,args=[])=>spawnSync(process.execPath,[cli,name,root,...args],{encoding:'utf8',timeout:60000});
function project(files,run){const root=mkdtempSync(join(tmpdir(),'aug-match-values-'));try{for(const [name,text] of Object.entries(files)){mkdirSync(dirname(join(root,name)),{recursive:true});writeFileSync(join(root,name),text);}return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
const runBoth=(root,expected)=>{for(const backend of ['llvm','c']){const result=command(root,'run',['--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,expected);}};

test('exhaustive match expressions return inferred values and narrow optional patterns',()=>project({
 'main.aug':'import greet and classify from values\nprint(value=greet(name=null))\nprint(value=greet(name="Ada"))\nprint(value=greet(name=""))\nprint(value=classify(active=true))\nprint(value=classify(active=false))\n',
 'values.aug':`greet(optional string name):
    return match name:
        when null:
            "Guest"
        when some person:
            $"Hello, {person}!"

classify(bool active):
    result = match active:
        when true:
            7
        when false:
            0
    return result + 1
`
},root=>runBoth(root,'Guest\nHello, Ada!\nHello, !\n8\n1\n')));

test('match input is evaluated once and only the selected result executes',()=>project({
 'main.aug':`import choose and yes and no from choices
import Console and SystemConsole from august.io
implement Console with SystemConsole
answer = match choose():
    when true:
        yes()
    when false:
        no()
print(value=answer)
`,
 'choices.aug':`import Console from august.io
choose(resolve Console console):
    console.write(value="input")
    return true
yes(resolve Console console):
    console.write(value="selected")
    return "yes"
no(resolve Console console):
    console.write(value="unselected")
    return "no"
`
},root=>runBoth(root,'input\nselected\nyes\n')));

test('signed and exact int64 literal patterns preserve identity and else remains required',()=>project({
 'main.aug':`import label from values
print(value=label(value=-7))
print(value=label(value=9007199254740992))
print(value=label(value=9007199254740993))
print(value=label(value=0))
`,
 'values.aug':`label(int value):
    return match value:
        when -7:
            "negative"
        when 9007199254740992:
            "first"
        when 9007199254740993:
            "second"
        else:
            "other"
`
},root=>runBoth(root,'negative\nfirst\nsecond\nother\n')));

test('expression results retain checked errors and selected failure propagation',()=>project({
 'main.aug':`import load and ReadFailed from values
try:
    print(value=load(fail=false))
    print(value=load(fail=true))
catch ReadFailed error:
    print(value=error.message)
`,
 'values.aug':`error ReadFailed(string message)
_fail() returns string:
    throw ReadFailed(message="selected failure")
load(bool fail):
    return match fail:
        when true:
            _fail()
        when false:
            "ok"
`
},root=>runBoth(root,'ok\nselected failure\n')));

test('match expressions reject incomplete, incompatible, repeated, empty and statement bodies',()=>project({'main.aug':''},root=>{
 const fixtures=[
  ['x = match true { when true { 1 } }',/incomplete/],
  ['x = match true { when true { 1 } when false { "two" } }',/compatible|same type/],
  ['x = match true { when true { 1 } when true { 2 } else { 3 } }',/Unreachable|repeated/],
  ['x = match true { when true { } when false { 2 } }',/one result expression/],
  ['x = match true { when true { return 1 } when false { 2 } }',/one result expression/],
  ['x = match true { when true { 1; 2 } when false { 3 } }',/one result expression/],
  ['x = match 1 { when 01 { 1 } when 1 { 2 } else { 3 } }',/Unreachable|repeated/],
  ['x = match 1.0 { when 1 { 1 } when 1.0 { 2 } else { 3 } }',/Unreachable|repeated/],
  ['x = match true { when true { print(value=1) } when false { 3 } }',/returns void/]
 ];
 for(const [source,message] of fixtures){writeFileSync(join(root,'main.aug'),source+'\n');const result=command(root,'check',['--json']);assert.equal(result.status,1,source+': '+result.stderr);assert.match(result.stdout,message,source);}
}));

test('match expressions cannot copy an owned value and branch consumption remains a possible move',()=>project({
 'main.aug':'import select from values\n',
 'values.aug':`interface Value {}
Item() implements Value {}
select(bool flag, own Item item):
    return match flag:
        when true:
            item
        when false:
            Item()
`
},root=>{let result=command(root,'check',['--json']);assert.equal(result.status,1);assert.match(result.stdout,/match expression.*ownership|owned.*match expression/i);
 writeFileSync(join(root,'values.aug'),`interface Value {}
Item() implements Value {}
consume(own Item item):
    return 1
select(bool flag, own Item item):
    result = match flag:
        when true:
            consume(item)
        when false:
            0
    consume(item)
    return result
`);
 result=command(root,'check',['--json']);assert.equal(result.status,1);assert.match(result.stdout,/moved/);
}));

test('nested expressions check in both formatter styles and expose narrowed editor facts',()=>project({
 'main.aug':'import size from values\nprint(value=size(name="Ada"))\n',
 'values.aug':`size(optional string name):
    return match name:
        when null:
            0
        when some person:
            match person == "Ada":
                when true:
                    person.length()
                when false:
                    1
`
},root=>{
 const loaded=loadProject(root),checked=checkProject(loaded);assert.deepEqual(checked.diagnostics,[]);
 const file=loaded.files.get(join(root,'values.aug')),offset=file.source.indexOf('person.length()');
 const info=hoverInfo(checked,file.path,offset);assert.match(info.detail,/string person/);assert.ok(completions(checked,file.path,offset).some(item=>item.label==='person'));assert.ok(semanticTokens(checked,file.path).some(item=>item.line===7&&item.start===20&&item.type==='variable'));
 for(const style of ['indent','braces'])for(const assignment of ['equals','to'])for(const indentation of ['spaces','tabs']){
  const text=formatFile({config:{block_style:style,assignment,indentation}},file);assert.deepEqual(parse(file.path,text).diagnostics,[]);writeFileSync(file.path,text);
  const result=command(root,'check',['--json']);assert.equal(result.status,0,result.stdout+result.stderr);
 }
 runBoth(root,'3\n');
 const spec=command(root,'spec');assert.equal(spec.status,0,spec.stderr);const text=readFileSync(file.path+'.md','utf8');assert.match(text,/chooses|choice|match/i);assert.match(text,/Ada/);assert.match(text,/source/);
}));


test('choice results preserve read-only and borrowed aliases rather than granting mutation or escape',()=>project({'main.aug':''},root=>{
 const fixtures=[
  [`interface Value {}
Item() implements Value {}
select(own optional Item value):
    return match value:
        when null:
            Item()
        when some item:
            item
`,/match expression.*ownership/i],
  [`select(bool flag, borrow List<int> values):
    return match flag:
        when true:
            values
        when false:
            [1]
`,/borrow.*escape|return.*borrow/i],
  [`select(bool flag, List<int> values):
    choice = match flag:
        when true:
            values
        when false:
            [1]
    choice.append(value=2)
`,/read.only|borrow/]
 ];
 for(const [source,message] of fixtures){writeFileSync(join(root,'values.aug'),source);const result=command(root,'check',['--json']);assert.equal(result.status,1,result.stdout+result.stderr);assert.match(result.stdout,message);}
}));

test('parenthesized choices and repeated unary signs keep their values in formatted calls',()=>project({
 'main.aug':`result = (match true { when true { 3 } when false { 7 } }) + 2
print(value=result)
print(value=match --1 { when --1 { "one" } else { "other" } })
`
},root=>{
 runBoth(root,'5\none\n');const loaded=loadProject(root),file=loaded.main;
 for(const style of ['indent','braces']){writeFileSync(file.path,formatFile({config:{block_style:style}},file));runBoth(root,'5\none\n');}
}));


test('concrete type patterns narrow results and an expected interface accepts either implementation',()=>project({
 'main.aug':'import select and Person and Other from values\nprint(value=select(flag=true).read())\nprint(value=select(flag=false).read())\n',
 'values.aug':`interface Value { read() returns int }
Person(int number) implements Value { read() returns int { return number } }
Other(int number) implements Value { read() returns int { return number } }
select(bool flag) returns Value:
    value = match flag:
        when true:
            Person(number=7)
        when false:
            Person(number=4)
    return match value:
        when Person person:
            match flag:
                when true:
                    person
                when false:
                    Other(number=3)
        else:
            Other(number=0)
`
},root=>runBoth(root,'7\n3\n')));


test('same-spelled foreign classes have distinct match identities through C and LLVM',()=>project({
 'main.aug':`import Item from left
import create from right
value = create()
answer = match value:
    when Item item:
        1
    else:
        2
print(value=answer)
match value:
    when Item item:
        print(value="left")
    else:
        print(value="right")
`,
 'common.aug':'interface Value {}\n',
 'left.aug':'import Value from common\nItem() implements Value {}\n',
 'right.aug':'import Value from common\nItem() implements Value {}\ncreate() returns Value { return Item() }\n'
},root=>runBoth(root,'2\nright\n')));

test('case names in class state initializers receive the same checked editor support',()=>project({
 'main.aug':'import Picker from values\nprint(value=Picker(name="Ada").read())\n',
 'values.aug':`interface NameReader { read() returns string }
Picker(optional string name) implements NameReader:
    mutable string label = match name:
        when null:
            "Guest"
        when some chosenName:
            chosenName
    read():
        return label
`
},root=>{
 const loaded=loadProject(root),checked=checkProject(loaded),file=loaded.files.get(join(root,'values.aug'));assert.deepEqual(checked.diagnostics,[]);
 const offset=file.source.lastIndexOf('chosenName'),info=hoverInfo(checked,file.path,offset);assert.equal(info.detail,'string chosenName');assert.ok(completions(checked,file.path,offset).some(item=>item.label==='chosenName'));
 const tokens=semanticTokens(checked,file.path).filter(item=>item.type==='variable');assert.ok(tokens.some(item=>item.line===5&&item.start===18));assert.ok(tokens.some(item=>item.line===6&&item.start===12));
 runBoth(root,'Ada\n');
}));


test('formatting keeps comments inside their choice case in both block styles',()=>project({
 'main.aug':'import choose from values\nprint(value=choose(flag=true))\n',
 'values.aug':`choose(bool flag):
    return match flag: // Choose once.
        when true:
            1 // First result.
        when false:
            2 // Second result.
    // After the choice.
`
},root=>{
 const loaded=loadProject(root),file=loaded.files.get(join(root,'values.aug'));
 for(const style of ['indent','braces']){
  const text=formatFile({config:{block_style:style}},file);assert.match(text,/1[^\n]*First result\.[\s\S]*when false/);assert.match(text,/2[^\n]*Second result\./);assert.match(text,/match flag[\s\S]*Choose once[\s\S]*1/);
  const parsed=parse(file.path,text);assert.deepEqual(parsed.diagnostics,[]);assert.equal(formatFile({config:{block_style:style}},parsed.file),text);writeFileSync(file.path,text);runBoth(root,'1\n');
  assert.ok(text.indexOf('After the choice')>text.indexOf('Second result'));
 }
}));

test('port choices expose their narrowed names in semantic tokens and hover',()=>project({
 'main.aug':`import home from web
optional int requested = null
serve home on port match requested:
    when null:
        8787
    when some chosenPort:
        chosenPort
`,
 'web.aug':'endpoint GET "/" as home() { return "home" }\n'
},root=>{
 const loaded=loadProject(root),checked=checkProject(loaded);assert.deepEqual(checked.diagnostics,[]);const file=loaded.main,offset=file.source.lastIndexOf('chosenPort');assert.equal(hoverInfo(checked,file.path,offset).detail,'int chosenPort');assert.ok(semanticTokens(checked,file.path).some(item=>item.line===6&&item.start===8&&item.type==='variable'));
}));


test('nested match inputs and optional numeric results survive all formatting preferences',()=>project({
 'main.aug':`value = match (match true { when true { false } when false { true } }) { when true { null } when false { 7 } }
print(value=value otherwise 0)
`
},root=>{
 const loaded=loadProject(root),file=loaded.main;runBoth(root,'7\n');
 for(const style of ['indent','braces'])for(const assignment of ['equals','to'])for(const indentation of ['spaces','tabs']){const text=formatFile({config:{block_style:style,assignment,indentation}},file);writeFileSync(file.path,text);runBoth(root,'7\n');}
}));

test('C custom checked errors keep their resolved identities after nominal match repair',()=>project({
 'main.aug':`import ReadFailed from left
import fail from right
try:
    fail()
catch ReadFailed error:
    print(value="wrong")
catch Error error:
    print(value="right")
`,
 'left.aug':'error ReadFailed(string message)\n',
 'right.aug':'error ReadFailed(string message)\nfail() { throw ReadFailed(message="right") }\n'
},root=>runBoth(root,'right\n')));
