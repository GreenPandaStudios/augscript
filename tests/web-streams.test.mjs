import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {get} from 'node:http';
const cli=resolve('bin/aug.mjs');
test('typed streams yield SSE, bytes and escaped HTML through a live request scope', {timeout:30000},async()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-stream-'));let server;
  try {
    writeFileSync(join(root,'main.yaml'),'openapi:\n  enabled: true\n');
    writeFileSync(join(root,'main.aug'),'import events and chunks and page and rejected and failing and endless from endpoints\nimport Console and SystemConsole from august.io\nimplement Console with SystemConsole\nserve events and chunks and page and rejected and failing and endless on port 0\n');
    writeFileSync(join(root,'endpoints.aug'),`import Console from august.io
record Tick(int count)
endpoint GET "/events" as events() streams ServerEvent<Tick> unless HttpError:
    yield ServerEvent(data=Tick(count=1), event="tick", id="first", retry=1000)
    yield ServerEvent(data=Tick(count=2))
endpoint GET "/bytes" as chunks() streams Bytes unless HttpError:
    yield "first".bytes()
    yield "second".bytes()
endpoint GET "/html" as page() streams Html unless HttpError:
    yield <p>{"<unsafe>"}</p>
    yield <p>Done</p>
endpoint GET "/rejected" as rejected() streams Bytes unless FileError with status 404:
    throw FileError()
endpoint GET "/failing" as failing() streams Bytes unless FileError and HttpError:
    yield "first".bytes()
    throw FileError()
endpoint GET "/endless" as endless(resolve Console console) streams Bytes uses console.write unless HttpError:
    try:
        while true:
            yield "pending".bytes()
    always:
        console.write(value="stream closed")
`);
    const built=spawnSync(process.execPath,[cli,'build',root],{encoding:'utf8'});assert.equal(built.status,0,built.stderr);
    server=spawn(join(root,'.aug-build',root.split('/').at(-1)),[],{stdio:['ignore','pipe','pipe']});let errors='',output='';server.stderr.on('data',chunk=>errors+=chunk);server.stdout.on('data',chunk=>output+=chunk);
    const lines=createInterface({input:server.stdout}), port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(errors)),10000);server.once('exit',()=>{clearTimeout(timer);reject(Error(errors));});lines.on('line',line=>{const m=/port (\d+)/.exec(line);if(m){clearTimeout(timer);resolve(Number(m[1]));}});});const base=`http://127.0.0.1:${port}`;
    let response=await fetch(base+'/events');assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/text\/event-stream/);assert.equal(await response.text(),'id: first\nevent: tick\nretry: 1000\ndata: {"count":1}\n\ndata: {"count":2}\n\n');
    response=await fetch(base+'/bytes');assert.equal(await response.text(),'firstsecond');
    response=await fetch(base+'/html');assert.equal(await response.text(),'<p>&lt;unsafe&gt;</p><p>Done</p>');
    response=await fetch(base+'/rejected');assert.equal(response.status,404);assert.equal((await response.json()).status,404);
    response=await fetch(base+'/failing');assert.equal(response.status,200);const reader=response.body.getReader();let received='';try {for(;;){const part=await reader.read();if(part.done)break;received+=new TextDecoder().decode(part.value);}}catch{}assert.equal(received,'first');assert.doesNotMatch(received,/problem|status/);
    response=await fetch(base+'/openapi.json');const api=await response.json();assert.ok(api.paths['/events'].get.responses['200'].content['text/event-stream'].itemSchema);
    await new Promise((resolve,reject)=>{const request=get(base+'/endless',response=>{response.once('data',chunk=>{assert.match(chunk.toString(),/pending/);response.destroy();request.destroy();resolve();});});request.on('error',error=>{if(error.code!=='ECONNRESET')reject(error);});});
    await new Promise((resolve,reject)=>{if(output.includes('stream closed'))return resolve();const timer=setTimeout(()=>reject(Error('Disconnect cleanup did not run: '+errors)),3000);const listener=()=>{if(output.includes('stream closed')){clearTimeout(timer);server.stdout.off('data',listener);resolve();}};server.stdout.on('data',listener);});
  } finally {if(server&&server.exitCode===null&&server.signalCode===null){server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));}rmSync(root,{recursive:true,force:true});}
});
