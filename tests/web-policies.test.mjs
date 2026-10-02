import { prepareLibraryFixtures } from './library-fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawn,spawnSync as fixtureSpawnSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {get} from 'node:http';
import {loadProject as fixtureLoadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
test('HTTP response status literals are bounded and dynamic statuses infer HttpError',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-response-status-'));
  try {
    writeFileSync(join(root,'main.aug'),'');
    writeFileSync(join(root,'response.aug'),'make(int status) returns HttpResponse<string>:\n    return HttpResponse(body="ok", status=status)\n');
    const checked=checkProject(loadProject(root));
    assert.deepEqual(checked.diagnostics,[]);
    const method=checked.project.scopes.get(join(root,'response.aug')).get('make').node;
    assert.deepEqual(checked.callableContracts.get(method).errors.map(error=>error.name),['HttpError']);
    writeFileSync(join(root,'response.aug'),'make() returns HttpResponse<string>:\n    return HttpResponse(body="ok", status=199)\n');
    assert.ok(checkProject(loadProject(root)).diagnostics.some(issue=>issue.code==='HTTP'&&/200.*599/.test(issue.message)));
    writeFileSync(join(root,'response.aug'),'make(int status) returns HttpResponse<string> unless HttpError:\n    return HttpResponse(body="ok", status=status)\n');
    assert.deepEqual(checkProject(loadProject(root)).diagnostics,[]);
  } finally {rmSync(root,{recursive:true,force:true});}
});

test('HTTP policies guard decoding, bound requests, handle CORS, compress output, and time out a producer', {timeout:60000}, async()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-policies-'));let server;
  try {
    writeFileSync(join(root,'main.yaml'),'openapi:\n  enabled: true\n');
    writeFileSync(join(root,'main.aug'),`import secured and permitted and limited and zipped and slow and slowChild and events and endless and encoded and empty from endpoints
import Authentication and Authorization and RequestLogger and WebRequestLogger from web
import DemoAuthentication and DemoAuthorization from auth
implement Authentication with DemoAuthentication
implement Authorization with DemoAuthorization
implement RequestLogger with WebRequestLogger scoped
serve secured and permitted and limited and zipped and slow and slowChild and events and endless and encoded and empty on port 0
`);
    writeFileSync(join(root,'auth.aug'),`import Authentication and Authorization and Principal from web
DemoAuthentication() implements Authentication:
    authenticate(HttpRequest request) returns optional Principal uses Authentication.authenticate unless HttpError:
        match request.headers.get(name="authorization"):
            when null:
                return null
            when some token:
                if token == "Bearer valid":
                    return Principal(subject="ada", permissions=["read"])
                return null
DemoAuthorization() implements Authorization:
    authorize(Principal identity, string permission) returns bool uses Authorization.authorize unless HttpError:
        for allowed in identity.permissions:
            if allowed == permission:
                return true
        return false
`);
    writeFileSync(join(root,'endpoints.aug'),`import Authentication and Authorization and RequestLogger from web
record Message(string value)
[LogRequest(logger=logger)]
[RequireLogin(authentication=auth)]
endpoint POST "/secured" as secured(Message input from body, resolve Authentication auth, resolve RequestLogger logger) returns Message uses auth.authenticate and logger.complete unless HttpError:
    return input
[RequirePermission(authorization=permissions, authentication=auth, permission="write")]
endpoint GET "/permitted" as permitted(resolve Authentication auth, resolve Authorization permissions) returns string uses auth.authenticate and permissions.authorize unless HttpError:
    return "allowed"
[RateLimit(requests=2, seconds=60)]
endpoint GET "/limited" as limited() returns string:
    return "ok"
[Cors(origins=["https://example.test"], headers=["content-type"], credentials=true)]
[Compress]
endpoint GET "/zipped" as zipped() returns string:
    return "compressed response"
[Timeout(milliseconds=50)]
endpoint GET "/slow" as slow() returns string:
    while true:
        pass
[Timeout(milliseconds=50)]
endpoint GET "/slow-child" as slowChild() returns string:
    scope:
        pending = start spin()
        wait for pending
    return "finished"
spin():
    while true:
        pass
[Timeout(milliseconds=50)]
endpoint GET "/events" as events() streams ServerEvent<string> unless HttpError:
    yield ServerEvent(data="started")
    while true:
        pass
[LogRequest(logger=logger)]
[Compress]
endpoint GET "/endless" as endless(resolve RequestLogger logger) streams Bytes uses logger.complete unless HttpError:
    while true:
        yield "pending".bytes()
[Compress]
endpoint GET "/encoded" as encoded() returns HttpResponse<Bytes> unless HttpError:
    return HttpResponse(body="already encoded".bytes(), headers=Headers().with(name="content-encoding", value="identity"))
[Compress]
endpoint GET "/empty" as empty() returns HttpResponse<string>:
    return HttpResponse(body="", status=204)
`);
    const built=spawnSync(process.execPath,[resolve('bin/aug.mjs'),'build',root],{encoding:'utf8'});assert.equal(built.status,0,built.stderr);
    server=spawn(join(root,'.aug-build',root.split('/').at(-1)),[],{stdio:['ignore','pipe','pipe']});let errors='';server.stderr.on('data',chunk=>errors+=chunk);
    const lines=createInterface({input:server.stdout});const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(errors||'startup timeout')),10000);server.once('exit',code=>{clearTimeout(timer);reject(new Error('exit '+code+errors));});lines.on('line',line=>{const match=/port (\d+)/.exec(line);if(match){clearTimeout(timer);resolve(Number(match[1]));}});});
    const request=(path,options={})=>fetch(`http://127.0.0.1:${port}${path}`,{signal:AbortSignal.timeout(5000),...options});
    const api=await (await request('/openapi.json')).json();
    assert.ok(api.paths['/secured'].post.responses['401']);assert.ok(api.paths['/zipped'].get.responses['403']);assert.ok(api.paths['/slow'].get.responses['504']);
    let response=await request('/secured',{method:'POST',headers:{'content-type':'application/json'},body:'bad json'});assert.equal(response.status,401);
    response=await request('/secured',{method:'POST',headers:{authorization:'Bearer valid','content-type':'application/json'},body:'bad json'});assert.equal(response.status,400);
    response=await request('/secured',{method:'POST',headers:{authorization:'Bearer valid','content-type':'application/json'},body:'{"value":"hello"}'});assert.equal(response.status,200);assert.deepEqual(await response.json(),{value:'hello'});
    assert.equal((await request('/permitted')).status,401);assert.equal((await request('/permitted',{headers:{authorization:'Bearer valid'}})).status,403);
    assert.equal((await request('/limited')).status,200);assert.equal((await request('/limited')).status,200);assert.equal((await request('/limited')).status,429);
    response=await request('/zipped',{headers:{origin:'https://example.test','accept-encoding':'gzip'}});assert.equal(response.headers.get('access-control-allow-origin'),'https://example.test');assert.equal(response.headers.get('access-control-allow-credentials'),'true');assert.equal(response.headers.get('content-encoding'),'gzip');assert.equal(await response.text(),'"compressed response"');
    assert.equal((await request('/zipped',{headers:{origin:'https://evil.test'}})).status,403);
    response=await request('/zipped',{method:'OPTIONS',headers:{origin:'https://example.test','access-control-request-method':'GET','access-control-request-headers':'content-type'}});assert.equal(response.status,204);assert.equal(response.headers.get('access-control-allow-methods'),'GET');
    response=await request('/zipped',{headers:{'accept-encoding':'gzip;q=0, *;q=1'}});assert.equal(response.headers.get('content-encoding'),null);assert.equal(await response.text(),'"compressed response"');
    response=await request('/encoded',{headers:{'accept-encoding':'gzip'}});assert.equal(response.headers.get('content-encoding'),'identity');assert.equal(await response.text(),'already encoded');
    response=await request('/empty',{headers:{'accept-encoding':'gzip'}});assert.equal(response.status,204);assert.equal(response.headers.get('content-encoding'),null);assert.equal(await response.text(),'');
    assert.equal((await request('/slow')).status,504);
    assert.equal((await request('/slow-child')).status,504);
    assert.equal((await request('/empty')).status,204, 'request group finished after cancelling its child');
    const started=Date.now();response=await request('/events');assert.equal(response.status,200);assert.equal(await response.text(),'data: "started"\n\n');assert.ok(Date.now()-started<2000);
    await new Promise((resolve,reject)=>{
      // Multiple compressed chunks cross the managed allocation/collection threshold.
      let bytes=0,complete=false;
      const finish=error=>{if(complete)return;complete=true;clearTimeout(timer);server.off('exit',stopped);call.destroy();error?reject(error):resolve();};
      const stopped=()=>finish(new Error(errors||'server exited during stream'));
      const timer=setTimeout(()=>finish(new Error(`Stream stopped after ${bytes} bytes: ${errors}`)),5000);
      server.once('exit',stopped);
      const call=get(`http://127.0.0.1:${port}/endless`,{headers:{'accept-encoding':'gzip'}},incoming=>{incoming.on('data',chunk=>{bytes+=chunk.length;if(bytes>=65536){incoming.destroy();finish();}});});
      call.on('error',error=>{if(error.code!=='ECONNRESET')finish(error);});
    });
    await new Promise((resolve,reject)=>{if(errors.includes('"status":499'))return resolve();const timer=setTimeout(()=>reject(new Error('Disconnected stream was not logged: '+errors)),3000);const listener=()=>{if(errors.includes('"status":499')){clearTimeout(timer);server.stderr.off('data',listener);resolve();}};server.stderr.on('data',listener);});
    const logs=errors.split('\n').filter(line=>line.startsWith('{')).map(line=>JSON.parse(line));assert.deepEqual(logs.filter(log=>log.path==='/secured').map(log=>log.status),[401,400,200]);assert.ok(logs.every(log=>log.milliseconds>=0));
    assert.equal(server.exitCode,null,errors);
  } finally {if(server&&server.exitCode===null&&server.signalCode===null){server.kill();await new Promise(resolve=>{const timer=setTimeout(()=>server.kill('SIGKILL'),1000);server.once('exit',()=>{clearTimeout(timer);resolve();});});}rmSync(root,{recursive:true,force:true});}
});

test('HTTP policy dependencies are canonical capabilities and singleton policies cannot conflict',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-policy-check-'));
  try {
    writeFileSync(join(root,'main.aug'),'');
    writeFileSync(join(root,'api.aug'),`capability Authentication:
    authenticate() returns bool uses Authentication.authenticate
[RequireLogin(authentication=auth)]
endpoint GET "/" as home(resolve Authentication auth) returns string uses auth.authenticate:
    return "ok"
`);
    assert.ok(checkProject(loadProject(root)).diagnostics.some(issue=>issue.code==='HTTP'&&/compatible Authentication/.test(issue.message)));
    writeFileSync(join(root,'api.aug'),`[Cors(origins=["https://one.test"])]
[Cors(origins=["https://two.test"])]
endpoint GET "/" as home() returns string:
    return "ok"
`);
    assert.ok(checkProject(loadProject(root)).diagnostics.some(issue=>issue.code==='HTTP'&&/only once/.test(issue.message)));
  } finally {rmSync(root,{recursive:true,force:true});}
});

function spawnSync(command, args, options) {
  if (args?.[0]?.endsWith("aug.mjs") && args[2]) prepareLibraryFixtures(args[2]);
  return fixtureSpawnSync(command, args, options);
}

function loadProject(root, ...args) { prepareLibraryFixtures(root); return fixtureLoadProject(root, ...args); }
