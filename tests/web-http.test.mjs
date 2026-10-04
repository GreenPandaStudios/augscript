import { prepareLibraryFixtures } from './library-fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawn, spawnSync as fixtureSpawnSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {request} from 'node:http';

const cli = resolve('bin/aug.mjs');
test('native endpoints bind typed HTTP input and map invalid bodies to problem details', {timeout:30000}, async () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-http-'));
  let server;
  try {
    writeFileSync(join(root, 'main.aug'), 'import greet and readQuery and readHeader and readCookie and readForm and readComplex from endpoints\nserve greet and readQuery and readHeader and readCookie and readForm and readComplex on port 0\n');
    writeFileSync(join(root, 'endpoints.aug'), `record Greeting(string name)
record Reply(int id, string greeting)
record Details(int id)
record Complex(Details detail, List<int> items, c_int limit, Json metadata)
endpoint POST "/hello/{id}" as greet(int id from path, Greeting input from body) returns Reply with status 201:
    return Reply(id=id, greeting="Hello " + input.name)
endpoint GET "/query" as readQuery(int id from query) returns int:
    return id
endpoint GET "/header" as readHeader(string authorization from header) returns string:
    return authorization
endpoint GET "/cookie" as readCookie(string ticket from cookie) returns string:
    return ticket
endpoint POST "/form" as readForm(Greeting input from form) returns Greeting:
    return input
endpoint POST "/complex" as readComplex(Complex input from form) returns Complex:
    return input
`);
    const built = spawnSync(process.execPath, [cli, 'build', root], {encoding: 'utf8'});
    assert.equal(built.status, 0, built.stderr);
    server = spawn(join(root, '.aug-build', root.split('/').at(-1)), [], {stdio: ['ignore', 'pipe', 'pipe']});
    let errors = ''; server.stderr.on('data', chunk => {errors += chunk;});
    const lines = createInterface({input: server.stdout});
    const port = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Server startup timed out: ' + errors)), 10000);
      server.once('exit', code => {clearTimeout(timer); reject(new Error('Server exited ' + code + ': ' + errors));});
      lines.on('line', line => {
        const found = /August HTTP listening on port (\d+)/.exec(line);
        if (found) {clearTimeout(timer); resolve(Number(found[1]));}
      });
    });
    const url = `http://127.0.0.1:${port}/hello/7`;
    let response = await fetch(url, {method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({name: 'Ada'})});
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), {id: 7, greeting: 'Hello Ada'});
    response = await fetch(url, {method:'POST', headers:{'content-type':'application/json'}, body:'{bad'});
    assert.equal(response.status, 400);
    assert.match(response.headers.get('content-type'), /application\/problem\+json/);
    response = await fetch(url, {method:'POST', headers:{'content-type':'application/json'}, body:'{"name":7}'});
    assert.equal(response.status, 422);
    response = await fetch(url, {method:'POST', headers:{'content-type':'text/plain'}, body:'hello'});
    assert.equal(response.status, 415);
    response = await fetch(url.replace('/7', '/wrong'), {method:'POST', headers:{'content-type':'application/json'}, body:'{"name":"Ada"}'});
    assert.equal(response.status, 400);
    response = await fetch(url);
    assert.equal(response.status, 405);
    for (const [path, method, headers, body] of [
      ['/query?id=1&id=2', 'GET', {}, undefined],
      ['/cookie', 'GET', {cookie:'ticket=one; ticket=two'}, undefined],
      ['/form', 'POST', {'content-type':'application/x-www-form-urlencoded'}, 'name=Ada&name=Grace'],
      ['/header', 'GET', ['authorization','one','authorization','two'], undefined],
    ]) {
      const status = await new Promise((resolve, reject) => {
        const call = request({host:'127.0.0.1', port, path, method, headers}, reply => {
          reply.resume(); reply.once('end', () => resolve(reply.statusCode));
        });
        call.once('error', reject); call.end(body);
      });
      assert.equal(status, 400, 'duplicate input: ' + path);
      response = await fetch(`http://127.0.0.1:${port}/query?id=7`);
      assert.equal(response.status, 200, 'server survives invalid input');
      assert.equal(await response.json(), 7);
    }
    const complex = new URLSearchParams({detail:'{"id":9007199254740993}',items:'[1,2]',limit:'4',metadata:'{"ok":true}'});
    response = await fetch(`http://127.0.0.1:${port}/complex`, {method:'POST',body:complex});
    assert.equal(response.status,200);
    assert.equal(await response.text(),'{"detail":{"id":9007199254740993},"items":[1,2],"limit":4,"metadata":{"ok":true}}');
    complex.set('detail','{"id":"wrong"}');
    response = await fetch(`http://127.0.0.1:${port}/complex`, {method:'POST',body:complex});
    assert.equal(response.status,422);
  } finally {
    if (server && server.exitCode === null && server.signalCode === null) {server.kill('SIGTERM'); await new Promise(resolve => server.once('exit', resolve));}
    rmSync(root, {recursive:true, force:true});
  }
});

test('an endpoint can await an HTTP request to its own August application', async () => {
  const root = mkdtempSync(join(tmpdir(), 'aug-self-http-')); let server;
  try {
    writeFileSync(join(root, 'main.aug'), `import answer and relay from endpoints
import HttpClient and WebHttpClient from web
implement HttpClient with WebHttpClient
serve answer and relay on port 0
`);
    writeFileSync(join(root, 'endpoints.aug'), `import HttpClient from web
record Answer(string message)
endpoint GET "/answer" as answer() returns Answer:
    return Answer(message="provider and client share this process")
endpoint GET "/relay" as relay(HttpRequest request from request, resolve HttpClient client) returns HttpResponse<Bytes> uses client.request unless HttpError with status 502:
    match request.headers.get(name="host"):
        when null:
            throw HttpError()
        when some address:
            return client.request(method="GET", url="http://" + address + "/answer")
`);
    const built = spawnSync(process.execPath, [cli, 'build', root], {encoding:'utf8'});
    assert.equal(built.status, 0, built.stderr);
    server = spawn(join(root, '.aug-build', root.split('/').at(-1)), [], {stdio:['ignore','pipe','pipe']});
    let errors = ''; server.stderr.on('data', chunk => {errors += chunk;});
    const lines = createInterface({input:server.stdout});
    const port = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Startup timed out: ' + errors)), 10000);
      server.once('exit', code => {clearTimeout(timer); reject(new Error('Server exited ' + code + ': ' + errors));});
      lines.on('line', line => {const match = /port (\d+)/.exec(line); if (match) {clearTimeout(timer); resolve(Number(match[1]));}});
    });
    const response = await fetch(`http://127.0.0.1:${port}/relay`, {signal:AbortSignal.timeout(5000)});
    assert.equal(response.status, 200, errors);
    assert.deepEqual(await response.json(), {message:'provider and client share this process'});
  } finally {
    if (server && server.exitCode === null && server.signalCode === null) {server.kill('SIGTERM'); await new Promise(resolve => server.once('exit', resolve));}
    rmSync(root, {recursive:true, force:true});
  }
});

function spawnSync(command, args, options) {
  if (args?.[0]?.endsWith("aug.mjs") && args[2]) prepareLibraryFixtures(args[2]);
  return fixtureSpawnSync(command, args, options);
}
