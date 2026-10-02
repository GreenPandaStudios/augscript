import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {httpLoad} from '../scripts/http-load.mjs';

test('HTTP measurements validate every keep-alive response and reject incorrect results', async () => {
  const connections = new Set(); let count = 0, correct = true;
  const server = http.createServer((request, response) => {
    count++; connections.add(request.socket);
    response.writeHead(200, {'content-type':'application/json'});
    response.end(JSON.stringify({id:correct ? 7 : 8, message:'hello'}));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const result = await httpLoad(server.address().port, 4, 40);
    assert.equal(count, 40); assert.equal(result.errors, 0);
    assert.equal(result.latencyMs.samples.length, 40);
    assert.ok(result.requestsPerSecond > 0); assert.equal(connections.size, 4);
    correct = false;
    await assert.rejects(httpLoad(server.address().port, 1, 1), /Expected values to be strictly deep-equal/);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('isolated HTTP client retains measured samples and rejects a wrong response', {timeout:10000}, async () => {
  let count=0,correct=true;
  const server=http.createServer((request,response)=>{
    count++;response.writeHead(200,{'content-type':'application/json'});
    response.end(JSON.stringify({id:correct?7:8,message:'hello'}));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const client=()=>new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[fileURLToPath(new URL('../scripts/http-load.mjs',import.meta.url)),
      '--url',`http://127.0.0.1:${server.address().port}/bench`,'--concurrency','2',
      '--warmup','4','--requests','8','--rounds','1','--raw-samples']);
    let stdout='',stderr='';child.stdout.on('data',data=>stdout+=data);child.stderr.on('data',data=>stderr+=data);
    child.once('error',reject);child.once('close',status=>resolve({status,stdout,stderr}));
  });
  try{
    const result=await client();assert.equal(result.status,0,result.stderr);
    const measured=JSON.parse(result.stdout).rounds[0];
    assert.equal(count,12);assert.equal(measured.requests,8);assert.equal(measured.errors,0);
    assert.equal(measured.latencyMs.samples.length,8);assert.ok(measured.elapsedMs>0);
    correct=false;const failed=await client();assert.equal(failed.status,1);assert.match(failed.stderr,/strictly deep-equal/);
  }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
