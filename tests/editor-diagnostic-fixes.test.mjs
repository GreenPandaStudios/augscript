import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);

test('extension repairs match both published LSP diagnostics and direct editor diagnostics',async t=>{
  const {diagnosticForFix,diagnosticMessage}=require('../vscode/diagnostics.cjs');
  const root=mkdtempSync(join(tmpdir(),'aug-editor-fix-'));
  writeFileSync(join(root,'main.aug'),'');
  writeFileSync(join(root,'greeting.aug'),'greet(string name) { return "Hello, " + name }\n');
  const child=spawn(process.execPath,[resolve('bin/aug.mjs'),'lsp',root],{stdio:['pipe','pipe','pipe']});
  t.after(()=>{child.kill();rmSync(root,{recursive:true,force:true});});
  let buffer=Buffer.alloc(0),sequence=0,stderr='';const pending=new Map(),notifications=[];
  child.stderr.on('data',chunk=>stderr+=chunk);
  child.stdout.on('data',chunk=>{
    buffer=Buffer.concat([buffer,chunk]);
    while(true){
      const end=buffer.indexOf('\r\n\r\n');if(end<0)return;
      const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())[1]);
      if(buffer.length<end+4+length)return;
      const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);
      if(message.id!==undefined){const receive=pending.get(message.id);pending.delete(message.id);receive?.(message);}else notifications.push(message);
    }
  });
  const request=(method,params)=>new Promise((resolve,reject)=>{
    const id=++sequence,timer=setTimeout(()=>reject(new Error('LSP timeout '+method+stderr)),10000);
    pending.set(id,message=>{clearTimeout(timer);message.error?reject(new Error(message.error.message)):resolve(message.result);});
    const data=Buffer.from(JSON.stringify({jsonrpc:'2.0',method,params,id}));
    child.stdin.write(Buffer.concat([Buffer.from(`Content-Length: ${data.length}\r\n\r\n`),data]));
  });
  await request('initialize',{capabilities:{}});
  const uri=pathToFileURL(join(root,'main.aug')).href,text='import greet from greeting\nprint(value=greet(naem="August"))\n';
  await request('aug/editor',{uri,text,version:1,command:'diagnostics'});
  // A real didChange schedules the published form; editor queries also return the raw form.
  await request('textDocument/didChange',{textDocument:{uri,version:2},contentChanges:[{text}]});
  const deadline=Date.now()+10000;
  while(!notifications.some(item=>item.method==='textDocument/publishDiagnostics'&&item.params.version===2)&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,20));
  const publication=notifications.find(item=>item.method==='textDocument/publishDiagnostics'&&item.params.version===2);
  assert.ok(publication,'Expected published diagnostic: '+stderr);
  const fixes=await request('aug/editor',{uri,command:'fixes'}),fix=fixes.find(item=>item.title==='Use argument label name');
  assert.ok(fix,JSON.stringify(fixes));
  const errors=publication.params.diagnostics.map(issue=>({...issue,range:issue.range}));
  const matched=diagnosticForFix(errors,fix.issue);
  assert.ok(matched,'A published labeled-input error must retain its repair');
  assert.equal(matched.message,diagnosticMessage(fix.issue));
  assert.match(matched.message,/Caller input labels: name/);
  const direct={...matched,message:fix.issue.message};
  assert.equal(diagnosticForFix([direct],fix.issue),direct);
  for(const changed of [
    {...matched,message:'A different call error'},
    {...matched,code:'TYPE'},
    {...matched,source:'Other language'},
    {...matched,range:{...matched.range,start:{...matched.range.start,line:matched.range.start.line+1}}}
  ])assert.equal(diagnosticForFix([changed],fix.issue),undefined,'Do not match unrelated or relocated diagnostics');
  const repaired=[...fix.edits].sort((a,b)=>b.start-a.start).reduce((source,edit)=>source.slice(0,edit.start)+edit.text+source.slice(edit.end),text);
  assert.deepEqual(await request('aug/editor',{uri,text:repaired,version:3,command:'diagnostics'}),[]);
  await request('shutdown',{});
});
