import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
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
