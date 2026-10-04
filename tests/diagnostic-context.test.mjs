import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn,spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {SemanticWorkspace} from '../src/semantic.ts';
const cli=resolve('bin/aug.mjs');
function fixture(files,run){const root=mkdtempSync(join(tmpdir(),'aug-diagnostic-context-'));try{for(const [file,source] of Object.entries(files))writeFileSync(join(root,file),source);return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
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
