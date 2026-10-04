import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {connect} from 'node:net';
import {setTimeout as delay} from 'node:timers/promises';
import {prepareLibraryFixtures} from './library-fixtures.mjs';

async function receive(port, headers, body='', continueBody) {
  const socket=connect(port,'127.0.0.1');let raw='',sent=false;
  socket.on('error',()=>{});
  socket.on('data',chunk=>{raw+=chunk.toString('latin1');if(continueBody!==undefined&&!sent&&raw.includes('100 Continue')){sent=true;socket.write(continueBody);}});
  await new Promise(resolve=>socket.once('connect',resolve));
  socket.write('POST /upload HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n'+headers+'\r\n'+body);
  const start=performance.now();
  while(!/HTTP\/1\.1 [2-5]\d\d[\s\S]*\r\n\r\n[\s\S]+/.test(raw)&&!socket.destroyed&&performance.now()-start<1200)await delay(5);
  socket.destroy();
  return {raw,status:Number(/HTTP\/1\.1 ([2-5]\d\d)/.exec(raw)?.[1]??0),continued:raw.includes('100 Continue')};
}

test('headers can reject uploads before bytes, body limits, and 100 Continue', {timeout:60000},async()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-header-phase-'));let server;
  try {
    writeFileSync(join(root,'main.yaml'),'web:\n  body_limit: 16\n  headers_timeout: 100\n  request_timeout: 250\n  drain_timeout: 100\n');
    writeFileSync(join(root,'main.aug'),'import upload and stop from routes\nimport ServerControl and WebServerControl from web\nimplement ServerControl with WebServerControl\nserve upload and stop on port 0\nprint(value="drained")\n');
    writeFileSync(join(root,'routes.aug'),`import ServerControl from web
endpoint GET "/stop" as stop(resolve ServerControl control) returns string:
    control.stop(milliseconds=100)
    return "stopping"
endpoint POST "/upload" as upload(HttpRequest request from request) returns HttpResponse<int>:
    match request.headers.get(name="authorization"):
        when null:
            return HttpResponse(body=0, status=401)
        when some token:
            if token != "valid":
                return HttpResponse(body=0, status=401)
    scope:
        reading = start readBody(request)
        wait for reading as amount
        return HttpResponse(body=amount)
readBody(HttpRequest request) returns int:
    return request.body.length()
`);
    prepareLibraryFixtures(root);
    const built=spawnSync(process.execPath,[resolve('bin/aug.mjs'),'build',root,'--backend',process.env.AUG_TEST_BACKEND??'llvm'],{encoding:'utf8'});
    assert.equal(built.status,0,built.stderr);
    server=spawn(join(root,'.aug-build',root.split('/').at(-1)),[],{stdio:['ignore','pipe','pipe']});let errors='';server.stderr.on('data',chunk=>errors+=chunk);
    let output='';server.stdout.on('data',chunk=>output+=chunk);
    const lines=createInterface({input:server.stdout});
    const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(errors||'startup timeout')),10000);server.once('exit',code=>{clearTimeout(timer);reject(new Error('exit '+code+errors));});lines.on('line',line=>{const match=/port (\d+)/.exec(line);if(match){clearTimeout(timer);resolve(Number(match[1]));}});});
    for(const headers of ['Content-Length: 4\r\n','Content-Length: 4\r\nExpect: 100-continue\r\n','Content-Length: 1000000\r\n']) {
      const response=await receive(port,headers);
      assert.equal(response.status,401,JSON.stringify(response));
      assert.equal(response.continued,false,'rejected uploads must not receive Continue');
    }
    const accepted=await receive(port,'Authorization: valid\r\nContent-Length: 4\r\nExpect: 100-continue\r\n','', 'test');
    assert.equal(accepted.status,200,accepted.raw);assert.equal(accepted.continued,true);assert.match(accepted.raw,/\r\n\r\n4$/);
    const complete=await receive(port,'Authorization: valid\r\nContent-Length: 4\r\n','test');
    assert.equal(complete.status,200,complete.raw);assert.match(complete.raw,/\r\n\r\n4$/);
    const stalled=await receive(port,'Authorization: valid\r\nContent-Length: 4\r\n','t');
    assert.equal(stalled.status,408,stalled.raw+errors);assert.match(stalled.raw,/"title":"Request Timeout"/);
    const headerSocket=connect(port,'127.0.0.1');headerSocket.on('error',()=>{});
    await new Promise(resolve=>headerSocket.once('connect',resolve));
    headerSocket.write('POST /upload HTTP/1.1\r\nHost:');
    let closed=false;headerSocket.on('close',()=>closed=true);headerSocket.resume();
    await delay(500);headerSocket.destroy();assert.equal(closed,true,'incomplete headers exceed the absolute reception deadline');
    const tooLarge=await receive(port,'Authorization: valid\r\nContent-Length: 17\r\nExpect: 100-continue\r\n');
    assert.equal(tooLarge.status,413,tooLarge.raw);assert.equal(tooLarge.continued,false);
    const finishing=connect(port,'127.0.0.1');let drainedResponse='';finishing.on('error',()=>{});finishing.on('data',chunk=>drainedResponse+=chunk.toString('latin1'));
    await new Promise(resolve=>finishing.once('connect',resolve));
    finishing.write('POST /upload HTTP/1.1\r\nHost: localhost\r\nAuthorization: valid\r\nContent-Length: 4\r\nExpect: 100-continue\r\nConnection: close\r\n\r\n');
    for(let n=0;n<100&&!drainedResponse.includes('100 Continue');n++)await delay(5);
    assert.ok(drainedResponse.includes('100 Continue'),drainedResponse);
    server.kill('SIGTERM');await delay(20);finishing.write('test');
    await new Promise((resolve,reject)=>{if(server.exitCode!==null)return resolve();const timer=setTimeout(()=>reject(new Error('server did not drain: '+errors)),2000);server.once('exit',()=>{clearTimeout(timer);resolve();});});
    finishing.destroy();assert.match(drainedResponse,/HTTP\/1\.1 200/);assert.match(output,/drained/);assert.equal(server.exitCode,0,errors);

    // Reuse the compiled binary. A stop call must bound an unfinished upload.
    server=spawn(join(root,'.aug-build',root.split('/').at(-1)),[],{stdio:['ignore','pipe','pipe']});errors='';server.stderr.on('data',chunk=>errors+=chunk);
    const again=createInterface({input:server.stdout});const secondPort=await new Promise(resolve=>again.on('line',line=>{const match=/port (\d+)/.exec(line);if(match)resolve(Number(match[1]));}));
    const unfinished=connect(secondPort,'127.0.0.1');unfinished.on('error',()=>{});unfinished.resume();await new Promise(resolve=>unfinished.once('connect',resolve));
    unfinished.write('POST /upload HTTP/1.1\r\nHost: localhost\r\nAuthorization: valid\r\nContent-Length: 4\r\n\r\nt');
    await delay(15);const started=performance.now();
    const stopped=await fetch(`http://127.0.0.1:${secondPort}/stop`,{signal:AbortSignal.timeout(2000)});assert.equal(stopped.status,200);await stopped.text();
    await new Promise((resolve,reject)=>{if(server.exitCode!==null)return resolve();const timer=setTimeout(()=>reject(new Error('stop did not return: '+errors)),2000);server.once('exit',()=>{clearTimeout(timer);resolve();});});
    assert.ok(performance.now()-started<1500);assert.equal(server.exitCode,0,errors);unfinished.destroy();

  } finally {
    if(server&&server.exitCode===null&&server.signalCode===null){server.kill();await new Promise(resolve=>{const timer=setTimeout(()=>server.kill('SIGKILL'),1000);server.once('exit',()=>{clearTimeout(timer);resolve();});});}
    rmSync(root,{recursive:true,force:true});
  }
});


test('configured header deadline can exceed the native library ten-second default', {timeout:30000},async()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-long-header-'));let server,socket;
  try {
    writeFileSync(join(root,'main.yaml'),'web:\n  headers_timeout: 14000\n  request_timeout: 20000\n');
    writeFileSync(join(root,'main.aug'),'import health from routes\nserve health on port 0\n');
    writeFileSync(join(root,'routes.aug'),'endpoint GET "/health" as health() returns string:\n    return "ready"\n');
    prepareLibraryFixtures(root);
    const built=spawnSync(process.execPath,[resolve('bin/aug.mjs'),'build',root,'--backend',process.env.AUG_TEST_BACKEND??'llvm'],{encoding:'utf8'});assert.equal(built.status,0,built.stderr);
    server=spawn(join(root,'.aug-build',root.split('/').at(-1)),[],{stdio:['ignore','pipe','pipe']});let errors='';server.stderr.on('data',chunk=>errors+=chunk);
    const lines=createInterface({input:server.stdout});
    const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Startup timeout '+errors)),5000);server.once('exit',()=>{clearTimeout(timer);reject(Error(errors));});lines.on('line',line=>{const match=/port (\d+)/.exec(line);if(match){clearTimeout(timer);resolve(Number(match[1]));}});});
    socket=connect(port,'127.0.0.1');socket.on('error',()=>{});socket.resume();await new Promise(resolve=>socket.once('connect',resolve));socket.write('GET /health HTTP/1.1\r\nHost:');
    let closed=false;socket.on('close',()=>closed=true);const began=performance.now();
    await delay(11250);assert.equal(closed,false,'The configured deadline must not be replaced by the library default');
    while(!closed&&performance.now()-began<17000)await delay(25);
    assert.equal(closed,true,'The absolute configured deadline closes incomplete headers');
    assert.ok(performance.now()-began<17000);
  }finally{socket?.destroy();if(server&&server.exitCode===null&&server.signalCode===null){server.kill();await new Promise(resolve=>{const timer=setTimeout(()=>server.kill('SIGKILL'),1000);server.once('exit',()=>{clearTimeout(timer);resolve();});});}rmSync(root,{recursive:true,force:true});}
});
