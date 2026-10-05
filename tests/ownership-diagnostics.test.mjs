import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {SemanticWorkspace} from '../src/semantic.ts';
const cli=resolve('bin/aug.mjs');
function project(t,files){
 const root=mkdtempSync(join(tmpdir(),'aug-ownership-diagnostic-'));
 t.after(()=>rmSync(root,{recursive:true,force:true}));
 for(const [name,source] of Object.entries(files)){mkdirSync(dirname(join(root,name)),{recursive:true});writeFileSync(join(root,name),source);}
 return root;
}
const check=(root,...flags)=>spawnSync(process.execPath,[cli,'check',root,...flags],{encoding:'utf8'});
function issues(root){const result=check(root,'--json');assert.equal(result.status,1,result.stderr);return JSON.parse(result.stdout);}
function issue(root,rule){const all=issues(root),found=all.find(item=>item.rule===rule);assert.ok(found,JSON.stringify(all));return found;}
const borrowed='values = [1]\nalias = values\nborrow values:\n    print(value=alias.length())\n';

test('conflicting alias reads identify their active borrow and conservative contract',t=>{
 const root=project(t,{'main.aug':borrowed}),found=issue(root,'ownership.read-during-borrow');
 assert.equal(found.code,'BORROW');assert.equal(found.line,4);
 assert.match(found.expected,/read access/);assert.match(found.actual,/possible overlap.*values/);
 assert.deepEqual(found.related,[{file:join(root,'main.aug'),line:3,column:1,message:'Mutable borrow of values begins here.'}]);
 const human=check(root);assert.match(human.stderr,/main.aug:3:1: Mutable borrow/);assert.match(human.stderr,/cannot prove.*separate/i);
});

test('conditional aliases remain possible overlap and unrelated objects remain readable',t=>{
 const root=project(t,{'main.aug':'values = [1]\nmutable List<int> alias = [2]\nif true:\n    alias = values\nborrow values:\n    alias.length()\n'});
 const found=issue(root,'ownership.read-during-borrow');assert.match(found.actual,/possible overlap/);assert.equal(found.related[0].line,5);
 writeFileSync(join(root,'main.aug'),'values = [1]\nalias = [2]\nborrow values:\n    alias.length()\n');
 assert.equal(check(root).status,0);
});

test('a second exclusive borrow and a move identify the loan that blocks them',t=>{
 const root=project(t,{'main.aug':'values = [1]\nalias = values\nborrow values:\n    borrow alias:\n        pass\n'});
 let found=issue(root,'ownership.borrow-overlap');assert.equal(found.related[0].line,3);assert.match(found.actual,/possible overlap/);
 writeFileSync(join(root,'operations.aug'),'consume(own List<int> value):\n    pass\n');
 writeFileSync(join(root,'main.aug'),'import consume from operations\nown List<int> values = [1]\nborrow values:\n    consume(value=values)\n');
 found=issue(root,'ownership.move-during-borrow');assert.equal(found.related[0].line,3);assert.match(found.expected,/move/);
});

test('conflicting call inputs point to the other written argument',t=>{
 const root=project(t,{'operations.aug':'combine(borrow List<int> left, List<int> right):\n    pass\n','main.aug':'import combine from operations\nvalues = [1]\nborrow values:\n    combine(left=values, right=values)\n'});
 const found=issue(root,'ownership.argument-overlap');assert.equal(found.line,4);assert.equal(found.column,32);
 assert.deepEqual(found.related,[{file:join(root,'main.aug'),line:4,column:18,message:'The other input or receiver is used here.'}]);
 assert.match(found.actual,/possible overlap/);
 writeFileSync(join(root,'main.aug'),'import combine from operations\nvalues = [1]\nother = [2]\nborrow values:\n    combine(left=values, right=other)\n');
 assert.equal(check(root).status,0);
});

test('using a transferred value links to the move, including conditional transfers',t=>{
 const root=project(t,{'operations.aug':'consume(own List<int> value):\n    pass\n','main.aug':'import consume from operations\nown List<int> values = [1]\nif true:\n    consume(value=values)\nvalues.length()\n'});
 const found=issue(root,'ownership.use-after-move');assert.equal(found.code,'OWN');assert.equal(found.related[0].line,4);
 assert.equal(found.related[0].column,19);assert.match(found.actual,/checked path/);
});

test('active task loans link reads and writes to their captures and disappear after a join',t=>{
 const operations='append(borrow List<int> values) changes values:\n    values.append(value=2)\nread(List<int> values):\n    return values.length()\n';
 const root=project(t,{'operations.aug':operations,'main.aug':'import append from operations\nown List<int> values = [1]\nscope:\n    task = start append(values)\n    values.length()\n    wait for task\n'});
 let found=issue(root,'ownership.read-during-task');assert.equal(found.related[0].line,4);assert.equal(found.related[0].column,25);assert.match(found.actual,/mutable task capture/);
 writeFileSync(join(root,'main.aug'),'import read from operations\nvalues = [1]\nborrow values:\n    scope:\n        task = start read(values)\n        values.append(value=2)\n        wait for task\n');
 found=issue(root,'ownership.mutation-during-task');assert.equal(found.code,'CONCURRENCY');assert.equal(found.related[0].line,5);assert.match(found.actual,/task capture/);
 writeFileSync(join(root,'main.aug'),'import append from operations\nown List<int> values = [1]\nscope:\n    task = start append(values)\n    wait for task\n    values.length()\n');
 assert.equal(check(root).status,0);
});

test('ownership evidence is detached and follows unsaved source revisions',t=>{
 const root=project(t,{'main.aug':borrowed}),file=join(root,'main.aug'),workspace=new SemanticWorkspace(root),before=workspace.document(file);
 const found=before.diagnostics.find(item=>item.rule==='ownership.read-during-borrow');assert.ok(found);
 assert.throws(()=>{found.related[0].line=999;},TypeError);
 const after=workspace.document(file,{text:'\n'+borrowed,version:1});
 assert.notEqual(after.revision,before.revision);assert.equal(after.diagnostics.find(item=>item.rule===found.rule).related[0].line,4);assert.equal(found.related[0].line,3);
 const accepted=workspace.document(file,{text:'values = [1]\nalias = values\nborrow values:\n    values.append(value=2)\nalias.length()\n',version:2});
 assert.deepEqual(accepted.diagnostics,[]);
});


test('a conflicting new task and a captured owned move retain the prior capture site',t=>{
 const operations='read(List<int> values):\n    return values.length()\nappend(borrow List<int> values) changes values:\n    values.append(value=2)\nconsume(own List<int> value):\n    pass\n';
 const root=project(t,{'operations.aug':operations,'main.aug':'import append from operations\nown List<int> values = [1]\nscope:\n    first = start append(values)\n    second = start append(values)\n'});
 let found=issue(root,'ownership.capture-overlap');assert.equal(found.related[0].line,4);assert.match(found.actual,/possible overlap/);
 writeFileSync(join(root,'main.aug'),'import read and consume from operations\nown List<int> values = [1]\nscope:\n    task = start read(values)\n    consume(value=values)\n');
 found=issue(root,'ownership.move-during-task');assert.equal(found.related[0].line,4);assert.match(found.related[0].message,/read access/);
});

test('capture witnesses are bounded, ordered and explicit about omitted sites',t=>{
 const main='import read from operations\nvalues = [1]\nscope:\n'+Array.from({length:9},(_,index)=>'    child'+index+' = start read(values)\n').join('')+'    borrow values:\n        values.append(value=2)\n';
 const root=project(t,{'main.aug':main,'operations.aug':'read(List<int> values):\n    return values.length()\n'});
 const first=issue(root,'ownership.borrow-during-task'),second=issue(root,'ownership.borrow-during-task');assert.deepEqual(first,second);
 assert.equal(first.related.length,7);assert.deepEqual(first.related.map(site=>site.line),[4,5,6,7,8,9,12]);
 assert.match(first.related.at(-1).message,/2 other checked sites omitted/);
});

test('a captured object field write points to the outstanding read loan',t=>{
 const root=project(t,{'main.aug':'import State and read from operations\nown State state = State(number=1)\nscope:\n    task = start read(state)\n    borrow state:\n        state.number = 2\n',
 'operations.aug':'interface Marker {}\nState(mutable int number) implements Marker {}\nread(State state):\n    return state.number\n'});
 const found=issue(root,'ownership.mutation-during-task');assert.equal(found.line,6);assert.equal(found.related[0].line,4);assert.match(found.related[0].message,/read access/);
});


test('cleanup of a captured owned local links to the task that can outlive it',t=>{
 const root=project(t,{'main.aug':'import read from operations\nscope:\n    if true:\n        own List<int> values = [1]\n        task = start read(values)\n', 'operations.aug':'read(List<int> values):\n    return values.length()\n'});
 const found=issue(root,'ownership.cleanup-during-task');assert.equal(found.line,4);assert.equal(found.related[0].line,5);assert.match(found.expected,/cleanup/);
});

test('isolated workers do not introduce shared task loans into ownership diagnostics',t=>{
 const root=project(t,{'main.aug':'import read from operations\nvalues = [1]\ntry:\n    scope:\n        task = start worker read(values)\n        borrow values:\n            values.append(value=2)\n        wait for task\ncatch ConcurrencyError error:\n    pass\n', 'operations.aug':'read(List<int> values):\n    return values.length()\n'});
 const result=check(root,'--json');assert.equal(result.status,0,result.stdout+result.stderr);assert.deepEqual(JSON.parse(result.stdout),[]);
});


test('capture diagnostics identify only inputs that can reach the conflicting data',t=>{
 const root=project(t,{'main.aug':'import read from operations\nvalues = [1]\nother = [2]\nscope:\n    task = start read(spare=other, selected=values)\n    borrow values:\n        pass\n',
 'operations.aug':'read(List<int> selected, List<int> spare):\n    return selected.length() + spare.length()\n'});
 const found=issue(root,'ownership.borrow-during-task');assert.equal(found.related.length,1);assert.equal(found.related[0].line,5);assert.equal(found.related[0].column,45);
});

test('exclusive-borrow witnesses use the same mutable reachability as the rejected check',t=>{
 const root=project(t,{'main.aug':'import Box and readBox and readList from operations\nvalues = [1]\nbox = Box(contents=values, number=0)\nscope:\n    first = start readBox(box)\n    second = start readList(values)\n    borrow box:\n        pass\n',
 'operations.aug':'interface Marker {}\nBox(List<int> contents, mutable int number) implements Marker {}\nreadBox(Box box):\n    return box.number\nreadList(List<int> values):\n    return values.length()\n'});
 const found=issue(root,'ownership.borrow-during-task');assert.equal(found.related.length,1);assert.equal(found.related[0].line,5);
});


test('a new exclusive capture retains bounded witnesses from every conflicting child',t=>{
 const main='import read and append from operations\nown List<int> values = [1]\nscope:\n'+Array.from({length:9},(_,index)=>'    child'+index+' = start read(values)\n').join('')+'    writer = start append(values)\n';
 const root=project(t,{'main.aug':main,'operations.aug':'read(List<int> values):\n    return values.length()\nappend(borrow List<int> values) changes values:\n    values.append(value=2)\n'});
 const first=issue(root,'ownership.capture-overlap'),second=issue(root,'ownership.capture-overlap');assert.deepEqual(first,second);
 assert.equal(first.related.length,7);assert.deepEqual(first.related.map(site=>site.line),[4,5,6,7,8,9,12]);
 assert.match(first.related.at(-1).message,/2 other checked sites omitted/);
 assert.ok(first.related.every(site=>site.message.includes('read access')));
});
