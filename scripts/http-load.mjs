#!/usr/bin/env node
import assert from 'node:assert/strict';
import http from 'node:http';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const statistics = samples => {
  const sorted = [...samples].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
  return {samples, minimum:sorted[0], median:sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2,
    p95:sorted[Math.ceil(sorted.length * .95) - 1]};
};

/** Closed-loop HTTP/1.1 load with a fixed number of keep-alive clients.
 * Every response is checked; failed requests fail the measurement.
 */
export async function httpLoad(target, concurrency, count, expected = {id:7, message:'hello'}) {
  assert.ok(Number.isInteger(concurrency) && concurrency > 0);
  assert.ok(Number.isInteger(count) && count > 0);
  const url = new URL(typeof target === 'number' ? `http://127.0.0.1:${target}/bench` : target);
  assert.equal(url.protocol, 'http:', 'This benchmark measures HTTP/1.1 without TLS');
  const agent = new http.Agent({keepAlive:true, maxSockets:concurrency}), latencies = [];
  let next = 0;
  const started = performance.now();
  try {
    await Promise.all(Array.from({length:concurrency}, async () => {
      while (next++ < count) {
        const begin = performance.now();
        await new Promise((resolve, reject) => {
          const req = http.get(url, {agent}, response => {
            let body = ''; response.on('data', chunk => {body += chunk;});
            response.on('error', reject); response.on('end', () => {
              try {
                assert.equal(response.statusCode, 200);
                assert.match(response.headers['content-type'], /application\/json/);
                assert.deepEqual(JSON.parse(body), expected);
                latencies.push(performance.now() - begin); resolve();
              } catch (error) { reject(error); }
            });
          });
          req.setTimeout(10000, () => req.destroy(new Error('HTTP request timed out'))); req.on('error', reject);
        });
      }
    }));
    assert.equal(latencies.length, count);
    const elapsedMs = performance.now() - started;
    return {requests:count, errors:0, elapsedMs, requestsPerSecond:count * 1000 / elapsedMs, latencyMs:statistics(latencies)};
  } finally { agent.destroy(); }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const option = (name, fallback) => {
    const index = process.argv.indexOf('--' + name);
    return index < 0 ? fallback : process.argv[index + 1];
  };
  try {
    const url = option('url');
    assert.ok(url, 'Use --url http://127.0.0.1:PORT/bench [--concurrency 64 --requests 5000 --warmup 1000 --rounds 3]');
    const concurrency = Number(option('concurrency', 16)), requests = Number(option('requests', 5000));
    const warmup = Number(option('warmup', 1000)), rounds = Number(option('rounds', 3));
    assert.ok(Number.isInteger(rounds) && rounds > 0);
    const expected = JSON.parse(option('expected', '{"id":7,"message":"hello"}'));
    const results = [];
    for (let i = 0; i < rounds; i++) {
      await httpLoad(url, concurrency, warmup, expected);
      const result = await httpLoad(url, concurrency, requests, expected);
      if(!process.argv.includes('--raw-samples'))delete result.latencyMs.samples;
      results.push(result);
    }
    const measured = statistics(results.map(result => result.requestsPerSecond));
    console.log(JSON.stringify({url, concurrency, warmup, rounds:results, requestsPerSecond:measured}, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
