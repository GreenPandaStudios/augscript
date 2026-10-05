import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync,mkdirSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn,spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {SemanticWorkspace} from '../src/semantic.ts';
const cli=resolve('bin/aug.mjs');
function fixture(files,run){const root=mkdtempSync(join(tmpdir(),'aug-diagnostic-context-'));try{for(const [file,source] of Object.entries(files)){mkdirSync(dirname(join(root,file)),{recursive:true});writeFileSync(join(root,file),source);}return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
const check=(root,...options)=>spawnSync(process.execPath,[cli,'check',root,...options],{encoding:'utf8'});

test('call type errors name the public input and link to its resolved declaration',()=>fixture({
 'main.aug':'import echo from values\necho(amount="bad")\n',
 'values.aug':'echo(int amount) returns int:\n    return amount\n',
 'other.aug':'echo(string amount) returns string:\n    return amount\n'
},root=>{
 const json=check(root,'--json');assert.equal(json.status,1,json.stderr);
 const issues=JSON.parse(json.stdout),issue=issues.find(issue=>issue.code==='TYPE');
 assert.equal(issue.expected,'int');assert.equal(issue.actual,'string');assert.match(issue.message,/amount/);
 assert.deepEqual(issue.related,[{file:join(root,'values.aug'),line:1,column:10,message:'Input amount is declared here.'}]);
 const human=check(root);assert.match(human.stderr,/main.aug:2:/);assert.match(human.stderr,/values.aug:1:10/);assert.match(human.stderr,/echo\(int amount\)/);
 assert.doesNotMatch(human.stderr,/other.aug/);
}));

test('a bad input label shows the accepted labels without speculative missing-input errors',()=>fixture({
 'main.aug':'import echo from values\necho(amunt=1)\n',
 'values.aug':'echo(int amount, int limit = 10) returns int:\n    return amount\n'
},root=>{
 const result=check(root,'--json');assert.equal(result.status,1,result.stderr);
 const issues=JSON.parse(result.stdout);assert.equal(issues.length,1,JSON.stringify(issues));
 assert.equal(issues[0].code,'CALL');assert.equal(issues[0].expected,'amount, limit');assert.equal(issues[0].actual,'amunt');
 assert.deepEqual(issues[0].related,[{file:join(root,'values.aug'),line:1,column:1,message:'Caller input labels: amount, limit.'}]);
 writeFileSync(join(root,'main.aug'),'import echo from values\necho()\n');
 const missing=JSON.parse(check(root,'--json').stdout);assert.equal(missing.length,1);assert.match(missing[0].message,/Missing argument amount/);
 assert.deepEqual(missing[0].related,[{file:join(root,'values.aug'),line:1,column:10,message:'Required input amount is declared here.'}]);
 // The existing deterministic label repair still works with the richer diagnostic.
 writeFileSync(join(root,'main.aug'),'import echo from values\necho(amunt=1)\n');
 const fixes=spawnSync(process.execPath,[cli,'fixes',root,'--file',join(root,'main.aug'),'--json'],{encoding:'utf8'});
 assert.equal(fixes.status,0,fixes.stderr);assert.match(fixes.stdout,/amount/);
}));

test('constructor and inherited generic method failures retain the declaration label and substituted type',()=>fixture({
 'main.aug':'import Box from values\nbox = Box<int>(value="bad")\n',
 'values.aug':'interface Marker {}\nBox<T>(T value to _storage) implements Marker {}\ninterface Input<T>:\n    read(T item) returns int\ninterface IntInput extends Input<int> {}\ninspect(IntInput input):\n    return input.read(item="bad")\n'
},root=>{
 const result=check(root,'--json');assert.equal(result.status,1,result.stderr);
 const issues=JSON.parse(result.stdout).filter(issue=>issue.code==='TYPE');assert.equal(issues.length,2,result.stdout);
 const field=issues.find(issue=>issue.file===join(root,'main.aug'));assert.equal(field.expected,'int');assert.equal(field.actual,'string');
 assert.match(field.message,/input value/);assert.doesNotMatch(field.message,/_storage/);
 assert.equal(field.related[0].file,join(root,'values.aug'));assert.equal(field.related[0].line,2);assert.match(field.related[0].message,/Input value/);
 const inherited=issues.find(issue=>issue.file===join(root,'values.aug'));assert.equal(inherited.expected,'int');assert.equal(inherited.actual,'string');
 assert.equal(inherited.related[0].line,4);assert.equal(inherited.related[0].column,12);assert.match(inherited.message,/input item/);
}));


test('the language server publishes related declaration locations for unsaved caller and dependency revisions',async()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-diagnostic-lsp-'));
 writeFileSync(join(root,'main.aug'),'');writeFileSync(join(root,'values.aug'),'echo(int amount) returns int { return amount }\n');
 const child=spawn(process.execPath,[cli,'lsp',root],{stdio:['pipe','pipe','pipe']});
 let buffer=Buffer.alloc(0),sequence=0,stderr='';const pending=new Map(),notifications=[];
 child.stderr.on('data',chunk=>stderr+=chunk);
 child.stdout.on('data',chunk=>{
  buffer=Buffer.concat([buffer,chunk]);
  while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())[1]);if(buffer.length<end+4+length)return;
   const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);
   if(message.id!==undefined){const receive=pending.get(message.id);pending.delete(message.id);receive?.(message);}else notifications.push(message);
  }
 });
 const send=(method,params,id)=>{const data=Buffer.from(JSON.stringify({jsonrpc:'2.0',method,params,...(id===undefined?{}:{id})}));child.stdin.write(Buffer.concat([Buffer.from(`Content-Length: ${data.length}\r\n\r\n`),data]));};
 const request=(method,params)=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>reject(new Error('LSP timeout '+method+stderr)),10000);pending.set(id,message=>{clearTimeout(timer);message.error?reject(new Error(message.error.message)):resolve(message.result);});send(method,params,id);});
 const published=async(uri,version)=>{const until=Date.now()+10000;while(Date.now()<until){const item=notifications.find(item=>item.method==='textDocument/publishDiagnostics'&&item.params.uri===uri&&item.params.version===version);if(item)return item.params.diagnostics;await new Promise(resolve=>setTimeout(resolve,20));}throw new Error('No published diagnostic: '+stderr);};
 try{
  await request('initialize',{capabilities:{textDocument:{publishDiagnostics:{relatedInformation:true}}}});
  const uri=pathToFileURL(join(root,'caller.aug')).href,target=pathToFileURL(join(root,'values.aug')).href;
  const text='import echo from values\nread():\n    return echo(amount="bad")\n';
  send('textDocument/didOpen',{textDocument:{uri,languageId:'augscript',version:1,text}});
  const issues=await published(uri,1),issue=issues.find(issue=>issue.code==='TYPE');
  assert.equal(issue.relatedInformation[0].location.uri,target);assert.deepEqual(issue.relatedInformation[0].location.range.start,{line:0,character:9});
  assert.equal(issue.data.expected,'int');assert.equal(issue.data.actual,'string');
  send('textDocument/didOpen',{textDocument:{uri:target,languageId:'augscript',version:1,text:'echo(string amount) returns string { return amount }\n'}});
  send('textDocument/didChange',{textDocument:{uri,version:2},contentChanges:[{text}]});
  assert.deepEqual(await published(uri,2),[]);
  send('textDocument/didChange',{textDocument:{uri:target,version:2},contentChanges:[{text:'\necho(int amount) returns int { return amount }\n'}]});
  send('textDocument/didChange',{textDocument:{uri,version:3},contentChanges:[{text}]});
  const updated=(await published(uri,3)).find(issue=>issue.code==='TYPE');
  assert.deepEqual(updated.relatedInformation[0].location.range.start,{line:1,character:9});
  const borrowed='inspect():\n    values = [1]\n    alias = values\n    borrow values:\n        alias.length()\n';
  send('textDocument/didChange',{textDocument:{uri,version:4},contentChanges:[{text:borrowed}]});
  const borrow=(await published(uri,4)).find(issue=>issue.code==='BORROW');
  assert.equal(borrow.data.rule,'ownership.read-during-borrow');assert.match(borrow.data.actual,/possible overlap/);
  assert.equal(borrow.relatedInformation[0].location.uri,uri);assert.deepEqual(borrow.relatedInformation[0].location.range.start,{line:3,character:4});
  send('textDocument/didChange',{textDocument:{uri,version:5},contentChanges:[{text:'\n'+borrowed}]});
  const relocated=(await published(uri,5)).find(issue=>issue.code==='BORROW');
  assert.deepEqual(relocated.relatedInformation[0].location.range.start,{line:4,character:4});
  assert.deepEqual(borrow.relatedInformation[0].location.range.start,{line:3,character:4});
  send('textDocument/didChange',{textDocument:{uri,version:6},contentChanges:[{text:borrowed.replace('        alias.length()', '        pass\n    alias.length()')}]});
  assert.deepEqual(await published(uri,6),[]);
  await request('shutdown',{});
 }finally{child.kill();rmSync(root,{recursive:true,force:true});}
});

test('related diagnostic data remains immutable across semantic revisions',()=>fixture({
 'main.aug':'','values.aug':'echo(int amount) returns int { return amount }\n','caller.aug':'import echo from values\nread():\n    return echo(amount="bad")\n'
},root=>{
 const workspace=new SemanticWorkspace(root),view=workspace.document(join(root,'caller.aug'));
 const issue=view.diagnostics.find(issue=>issue.code==='TYPE');assert.throws(()=>{issue.related[0].line=99;},TypeError);assert.throws(()=>issue.related.push({}),TypeError);
 workspace.document(join(root,'values.aug'),{text:'echo(string amount) returns string { return amount }\n',version:1});
 assert.deepEqual(workspace.document(join(root,'caller.aug')).diagnostics,[]);assert.equal(issue.related[0].line,1);
}));

test('duplicate and resolved inputs report the first definite error with honest declaration links',()=>fixture({
 'main.aug':'import consume and Logger and Silent from values\nimplement Logger with Silent\nconsume(logger=Silent())\n',
 'values.aug':'interface Logger {}\nSilent() implements Logger {}\nconsume(resolve Logger logger, int amount) {}\n'
},root=>{
 let result=check(root,'--json'),issues=JSON.parse(result.stdout);assert.equal(result.status,1,result.stderr);assert.equal(issues.length,1,result.stdout);
 assert.match(issues[0].message,/resolved from DI/);assert.equal(issues[0].expected,'amount');assert.equal(issues[0].related[0].line,3);
 writeFileSync(join(root,'main.aug'),'print(value=1, value=2)\n');
 result=check(root,'--json');issues=JSON.parse(result.stdout);assert.equal(result.status,1);assert.equal(issues.length,1);
 assert.match(issues[0].message,/Duplicate argument value/);assert.deepEqual(issues[0].related,[{file:join(root,'main.aug'),line:1,column:13,message:'Input value was first passed here.'}]);
 const scratch=spawnSync(process.execPath,[cli,'scratch',join(root,'main.aug'),'--json'],{encoding:'utf8'}),report=JSON.parse(scratch.stdout);
 assert.equal(scratch.status,1);assert.equal(report.diagnostics[0].file,join(root,'main.aug'));assert.equal(report.diagnostics[0].related[0].file,join(root,'main.aug'));
 writeFileSync(join(root,'main.aug'),'print(wrong=1)\n');
 result=check(root);assert.equal(result.status,1);assert.match(result.stderr,/caller input labels: value/);assert.doesNotMatch(result.stderr,/related:|Missing argument/);
}));

test('invalid labels postpone dependent generic and constant-index guesses',()=>{
 for(const [main,values] of [
  ['import echo from values\necho(amunt=1)\n','echo<T>(T amount) returns T { return amount }\n'],
  ['import Box from values\nbox = Box(vlue=1)\n','interface Marker {}\nBox<T>(T value to _storage) implements Marker {}\n'],
  ['pair = (1, "two")\nvalue = pair.get(indx=0)\n',''],
  ['import Box from values\nbox = Box(vlue=1)\nprint(value=box.read())\n','interface Marker { read() returns int }\nBox<T>(T value to _storage) implements Marker { read() { return 1 } }\n']
 ])fixture({'main.aug':main,'values.aug':values},root=>{
  const result=check(root,'--json'),issues=JSON.parse(result.stdout);assert.equal(result.status,1,result.stderr);
  assert.equal(issues.length,1,result.stdout);assert.equal(issues[0].code,'CALL');assert.match(issues[0].message,/has no parameter/);
  writeFileSync(join(root,'main.aug'),main.replace('amunt=','amount=').replace('vlue=','value=').replace('indx=','index='));
  const repaired=check(root,'--json');assert.equal(repaired.status,0,repaired.stdout+repaired.stderr);
 });
});

test('an inferred capability exceeding an interface points to the declared bound',()=>fixture({
 'main.aug':'',
 'values.aug':`import Console from august.io
interface Logger:
    log(string message)
ConsoleLogger(resolve Console console) implements Logger:
    log(string message):
        _emit(console, message)
_emit(Console console, string message):
    console.write(value=message)
`
},root=>{
 const result=check(root,'--json');assert.equal(result.status,1,result.stderr);
 const issue=JSON.parse(result.stdout).find(issue=>/interface signature/.test(issue.message));assert.ok(issue,result.stdout);
 assert.equal(issue.expected,'uses none');assert.equal(issue.actual,'uses Console.write (inferred)');
 assert.deepEqual(issue.related[0],{file:join(root,'values.aug'),line:3,column:5,message:'Logger.log declares the permitted contract here.'});
 const human=check(root);assert.match(human.stderr,/uses Console.write/);assert.match(human.stderr,/values.aug:3:5/);
}));

test('one implementation must satisfy every independently inherited interface contract',()=>fixture({
 'main.aug':'',
 'values.aug':`interface TextInput:
    accept(string value)
interface IntegerInput:
    accept(int value)
OnlyText() implements TextInput, IntegerInput:
    accept(string value):
        pass
`
},root=>{
 const result=check(root,'--json');assert.equal(result.status,1,result.stderr);
 const issues=JSON.parse(result.stdout);assert.equal(issues.length,1,result.stdout);
 assert.equal(issues[0].expected,'input value: int');assert.equal(issues[0].actual,'input value: string');
 assert.equal(issues[0].related[0].line,4);assert.match(issues[0].related[0].message,/IntegerInput.accept/);
}));

test('capability diagnostics retain the shortest checked helper path',()=>fixture({
 'main.aug':'',
 'values.aug':`import Console from august.io
interface Logger:
    log()
Live(resolve Console console) implements Logger:
    log():
        _long(console)
        _short(console)
_long(Console console):
    _middle(console)
_middle(Console console):
    _short(console)
_short(Console console):
    console.write(value="hello")
`,
 'decoy.aug':'_short() {}\n'
},root=>{
 const result=check(root,'--json');assert.equal(result.status,1,result.stderr);
 const issue=JSON.parse(result.stdout).find(issue=>/interface signature/.test(issue.message));assert.ok(issue,result.stdout);
 assert.deepEqual(issue.related.slice(1).map(site=>[site.file,site.line]),[[join(root,'values.aug'),7],[join(root,'values.aug'),13]]);
 assert.match(issue.related[1].message,/log calls _short/);assert.match(issue.related[2].message,/_short calls write/);
}));

test('inherited generic results, ownership, mutation, defaults and escaping errors show their actual contract fragments',()=>{
 const cases=[
  [`interface Result<T>:\n    read() returns T\ninterface IntResult extends Result<int> {}\nBad() implements IntResult:\n    read() returns string { return "bad" }\n`,'returns int','returns string',2],
  [`interface Writer:\n    write(borrow List<int> values) changes values\nBad() implements Writer:\n    write(List<int> values) {}\n`,'input values ownership borrow','input values ownership managed',2],
  [`interface Reader:\n    read(borrow List<int> values)\nBad() implements Reader:\n    read(borrow List<int> values) { values.append(value=1) }\n`,'changes none','changes values (inferred)',2],
  [`interface Reader:\n    read(int amount=4) returns int\nBad() implements Reader:\n    read(int amount=7) returns int { return amount }\n`,'input amount default 4','input amount default 7',2],
  [`interface Reader:\n    read() returns int\nBad() implements Reader:\n    read() returns int:\n        int zero = 0\n        return 1 / zero\n`,'unless none','unless ArithmeticError (inferred)',2]
 ];
 for(const [source,expected,actual,line] of cases) fixture({'main.aug':'','values.aug':source},root=>{
  const result=check(root,'--json');assert.equal(result.status,1,result.stderr);
  const issues=JSON.parse(result.stdout);assert.equal(issues.length,1,result.stdout);
  assert.equal(issues[0].expected,expected);assert.equal(issues[0].actual,actual);
  assert.equal(issues[0].related[0].file,join(root,'values.aug'));assert.equal(issues[0].related[0].line,line);
 });
});

test('a selected default method must also satisfy the other interface requirements',()=>fixture({
 'main.aug':'',
 'values.aug':`interface TextInput:
    accept(string value) { pass }
interface IntegerInput:
    accept(int value)
OnlyText() implements TextInput, IntegerInput {}
`
},root=>{
 const result=check(root,'--json');assert.equal(result.status,1,result.stderr);
 const issues=JSON.parse(result.stdout);assert.equal(issues.length,1,result.stdout);
 assert.equal(issues[0].expected,'input value: int');assert.equal(issues[0].actual,'input value: string');
 assert.equal(issues[0].related[0].line,4);assert.match(issues[0].message,/Default method accept/);
}));

test('a helper declared capability remains an obligation even when its body only recurses',()=>fixture({
 'main.aug':'',
 'values.aug':`import Console from august.io
interface Logger:
    log()
Live(resolve Console console) implements Logger:
    log():
        _repeat(console)
_repeat(Console console) uses Console.write:
    _repeat(console)
`
},root=>{
 const result=check(root,'--json');assert.equal(result.status,1,result.stderr);
 const issue=JSON.parse(result.stdout).find(issue=>/interface signature/.test(issue.message));assert.ok(issue,result.stdout);
 assert.equal(issue.actual,'uses Console.write (inferred)');
 assert.deepEqual(issue.related.slice(1).map(site=>site.line),[6]);assert.match(issue.related[1].message,/log calls _repeat/);
}));

test('compatible shared method requirements and substituted defaults execute through both native backends',()=>fixture({
 'values.aug':`interface First:
    read() returns int
interface Second:
    read() returns int
Selected() implements First, Second:
    read() { return 11 }
interface DefaultFirst extends First:
    read() returns int { return 7 }
BothDefaults() implements DefaultFirst, Second {}
readFirst(First source) { return source.read() }
readSecond(Second source) { return source.read() }
`,
 'main.aug':`import Selected and BothDefaults and readFirst and readSecond from values
value = Selected()
fallback = BothDefaults()
print(value=readFirst(source=value))
print(value=readSecond(source=value))
print(value=readFirst(source=fallback))
print(value=readSecond(source=fallback))
`
},root=>{
 for(const backend of ['c','llvm']) {
  const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'11\n11\n7\n7\n');
 }
}));

test('unsaved interface revisions refresh contract evidence without changing older snapshots',()=>fixture({
 'main.aug':'',
 'values.aug':`import Console from august.io
interface Logger:
    log()
Live(resolve Console console) implements Logger:
    log():
        console.write(value="hello")
`
},root=>{
 const file=join(root,'values.aug'),workspace=new SemanticWorkspace(root),before=workspace.document(file);
 const issue=before.diagnostics.find(issue=>/interface signature/.test(issue.message));assert.ok(issue);
 assert.equal(issue.related[0].line,3);assert.equal(issue.related[1].line,6);
 assert.throws(()=>{issue.related[1].line=999;},TypeError);
 const accepted=workspace.document(file,{text:'\nimport Console from august.io\ninterface Logger:\n    log() uses Console.write\nLive(resolve Console console) implements Logger:\n    log():\n        console.write(value="hello")\n',version:1});
 assert.deepEqual(accepted.diagnostics,[]);assert.notEqual(accepted.revision,before.revision);
 const rejected=workspace.document(file,{text:'\nimport Console from august.io\ninterface Logger:\n    log()\nLive(resolve Console console) implements Logger:\n    log():\n        console.write(value="hello")\n',version:2});
 const changed=rejected.diagnostics.find(issue=>/interface signature/.test(issue.message));
 assert.equal(changed.related[0].line,4);assert.equal(changed.related[1].line,7);
 assert.equal(issue.related[0].line,3);assert.equal(issue.related[1].line,6);
}));

test('generic capability bounds distinguish same-spelled arguments from separate modules',()=>fixture({
 'main.aug':'',
 'audit.aug':'capability Audit<T> { note(T value) uses Audit.note }\n',
 'app/export.aug':'export Value from model\n',
 'app/model.aug':'record Value(int number)\n',
 'logging/export.aug':'export Value from model\n',
 'logging/model.aug':'record Value(int number)\n',
 'promises.aug':'import Value from app\nimport Audit from audit\ninterface Logger<T> { log() uses Audit.note }\ninterface Wanted extends Logger<Value> {}\n',
 'actual.aug':'import Value from logging\nimport Audit from audit\nimport Wanted from promises\nBad(resolve Audit<Value> logger) implements Wanted { log() { logger.note(value=Value(number=1)) } }\n'
},root=>{
 const result=check(root,'--json');assert.equal(result.status,1,result.stderr);
 const issue=JSON.parse(result.stdout).find(issue=>/interface signature/.test(issue.message));assert.ok(issue,result.stdout);
 assert.equal(issue.related[0].file,join(root,'promises.aug'));
}));

test('same-spelled nominal types and capabilities retain distinct source identities in mismatch text',()=>{
 const cases=[
  {'left.aug':'record Payload(int value)\n','right.aug':'record Payload(int value)\n','promises.aug':'import Payload from left\ninterface Reader { read(Payload value) }\n','actual.aug':'import Payload from right\nimport Reader from promises\nWrong() implements Reader { read(Payload value) {} }\n',expected:'left.aug:Payload',actual:'right.aug:Payload'},
  {'left.aug':'capability Sink { write() uses Sink.write }\n','right.aug':'capability Sink { write() uses Sink.write }\n','promises.aug':'import Sink from left\ninterface Writer { run() uses Sink.write }\n','actual.aug':'import Sink from right\nimport Writer from promises\nWrong() implements Writer { run() uses Sink.write {} }\n',expected:'left.aug:Sink',actual:'right.aug:Sink'}
 ];
 for(const {expected,actual,...files} of cases) fixture({'main.aug':'',...files},root=>{
  const result=check(root,'--json');assert.equal(result.status,1,result.stderr);
  const issue=JSON.parse(result.stdout).find(issue=>/interface signature/.test(issue.message));assert.ok(issue,result.stdout);
  assert.notEqual(issue.expected,issue.actual);assert.ok(issue.expected.includes(expected),issue.expected);assert.ok(issue.actual.includes(actual),issue.actual);
 });
});

test('explicit generic capability mismatches show substituted arguments',()=>fixture({
 'main.aug':'',
 'values.aug':`capability Audit<T> { note(T value) uses Audit.note }
interface Logger<T> { log() uses Audit.note }
interface Wanted extends Logger<int> {}
Bad<T>() implements Wanted { log() uses Audit.note {} }
`
},root=>{
 const result=check(root,'--json');assert.equal(result.status,1,result.stderr);
 const issue=JSON.parse(result.stdout).find(issue=>/interface signature/.test(issue.message));assert.ok(issue,result.stdout);
 assert.equal(issue.expected,'uses Audit<int>.note');assert.equal(issue.actual,'uses Audit<T>.note');
 assert.equal(issue.related[0].file,join(root,'values.aug'));assert.equal(issue.related[0].line,2);
}));
