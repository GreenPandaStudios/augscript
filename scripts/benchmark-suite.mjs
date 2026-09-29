#!/usr/bin/env node
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import os from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import {httpLoad, statistics as stats} from './http-load.mjs';
import { loadProject } from '../src/project.ts';
import { checkProject } from '../src/checker.ts';
import { generateC } from '../src/codegen.ts';
import { compileNative } from '../src/native.ts';
import { nativeHome } from './native-home.mjs';
import {createHash} from 'node:crypto';

const root = resolve(import.meta.dirname, '..'), sources = join(root, 'benchmarks'), build = join(root, '.aug-build/benchmarks');
mkdirSync(build, { recursive: true });
const option = (name, fallback) => { const index = process.argv.indexOf(name); return index < 0 ? fallback : Number(process.argv[index + 1]); };
const stringOption = name => { const index = process.argv.indexOf(name); return index < 0 ? undefined : process.argv[index + 1]; };
const only = stringOption('--only')?.split(',');
if (only) for (const name of only) assert.ok(['startup', 'cpu', 'collections-20k', 'collections-200k', 'json', 'http'].includes(name), `Unknown workload: ${name}`);
const iterations = option('--iterations', 15), warmup = option('--warmup', 3), rounds = option('--http-rounds', 3), requests = option('--http-requests', 5000);
for (const value of [iterations, warmup, rounds, requests]) assert.ok(Number.isInteger(value) && value >= 1);
const python = process.env.AUG_BENCH_PYTHON ?? 'python3';
const cc = process.env.CC ?? (existsSync('/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang') ? '/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang' : 'clang');
const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 120000, ...options });
  if (result.error || result.status !== 0) throw new Error(`${command}: ${result.error?.message ?? result.stderr}`);
  return result;
};
const yyjson = join(nativeHome(root), 'sources/yyjson/src');
const cBinary = join(build, 'reference');
const cArgs = ['-O2', '-std=c11', '-I' + yyjson, join(sources, 'reference.c'), join(yyjson, 'yyjson.c'), '-o', cBinary];
const sdk = '/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk';
if (process.platform === 'darwin' && existsSync(sdk) && !process.env.SDKROOT) cArgs.unshift('-isysroot', sdk);
const compileStart = performance.now(); run(cc, cArgs); const referenceCompileMs = performance.now() - compileStart;
const digest = createHash('sha256');
for (const folder of ['src', 'runtime', 'benchmarks', 'scripts'])
  for (const file of readdirSync(join(root, folder), {recursive:true}).filter(file => /\.(ts|mjs|c|h|aug)$/.test(file)).sort())
    digest.update(folder + '/' + file + '\0').update(readFileSync(join(root, folder, file)));
const report = { recordedAt: new Date().toISOString(), version: JSON.parse(readFileSync(join(root, 'package.json'))).version,
  sourceSha256:digest.digest('hex'),
  environment: { platform: process.platform, release: os.release(), architecture: process.arch, cpu: os.cpus()[0]?.model,
    logicalCpus: os.cpus().length, node: process.version, python: run(python, ['--version']).stdout.trim(),
    compiler: run(cc, ['--version']).stdout.split('\n')[0] },
  methodology: { optimization: '-O2, no LTO', iterations, warmup, includesProcessStartup: true,
    ordering: 'Rotate implementations each round; new process per sample; verify every checksum',
    memory: 'Three separate peak-RSS measurements using /usr/bin/time; bytes, includes interpreter/runtime',
    cBaseline: 'Specialized int64 open-addressed hash tables; yyjson parse/type probe/write without August record binding',
    http: 'Same-host HTTP/1.1 loopback, keep-alive, closed-loop concurrency, JSON validated on every response; no TLS/auth/logging',
    httpRounds: rounds, requestsPerRound: requests, client: 'Node http.Agent', referenceCompileMs }, batch: [], http: [] };

function native(name, template, replace) {
  const directory = join(build, name); mkdirSync(directory, { recursive: true });
  cpSync(join(sources, template), directory, { recursive: true, filter: file => !file.includes('.aug-build') });
  if (replace) { const file = join(directory, 'main.aug'); writeFileSync(file, readFileSync(file, 'utf8').replaceAll(replace[0], replace[1])); }
  writeFileSync(join(directory, 'main.yaml'), 'optimization: release\nweb:\n  host: "127.0.0.1"\n');
  const start = performance.now(), checked = checkProject(loadProject(directory));
  assert.deepEqual(checked.diagnostics.filter(issue => issue.severity !== 'warning'), []);
  const generated = generateC(checked), frontendMs = performance.now() - start;
  const result = compileNative(directory, generated, { release: true, checked });
  assert.equal(result.status, 0, result.error);
  return { binary: result.output, frontendMs, buildMs: performance.now() - start };
}
const cases = [
  { name: 'startup', count: 0, expected: '7\n' },
  { name: 'cpu', count: 2000000 },
  { name: 'collections-20k', template: 'collections', workload: 'collections', count: 20000 },
  { name: 'collections-200k', template: 'collections', workload: 'collections', count: 200000, replace: ['20000', '200000'] },
  { name: 'json', count: 5000 },
];
for (const item of cases.filter(item => !only || only.includes(item.name))) {
  const workload = item.workload ?? item.name;
  if (workload === 'cpu') { let state = 123; for (let i = 0; i < item.count; i++) state = state * 48271 % 2147483647; item.expected = state + '\n'; }
  if (workload === 'collections') item.expected = (item.count * (item.count - 1) / 2 * 3) + '\ntrue\n';
  if (workload === 'json') item.expected = item.count * (7 + '{"id":7,"message":"hello","values":[1,2,3]}'.length) + '\n';
  const compiled = native(item.name, item.template ?? item.name, item.replace);
  const variants = [
    { name: 'August', command: compiled.binary, args: [] },
    { name: 'C', command: cBinary, args: [workload, String(item.count)] },
    { name: 'Node', command: process.execPath, args: [join(sources, 'reference.mjs'), workload, String(item.count)] },
    { name: 'Python', command: python, args: [join(sources, 'reference.py'), workload, String(item.count)] },
  ];
  const samples = variants.map(() => []);
  for (let round = -warmup; round < iterations; round++) for (let i = 0; i < variants.length; i++) {
    const index = (i + round + warmup) % variants.length, variant = variants[index], start = performance.now();
    const result = run(variant.command, variant.args);
    const elapsed = performance.now() - start; assert.equal(result.stdout, item.expected, `${item.name}/${variant.name}`);
    if (round >= 0) samples[index].push(elapsed);
  }
  const results = variants.map((variant, index) => {
    const memory = [];
    for (let i = 0; i < 3; i++) {
      const result = run('/usr/bin/time', [process.platform === 'darwin' ? '-l' : '-v', variant.command, ...variant.args]);
      assert.equal(result.stdout, item.expected);
      const rss = process.platform === 'darwin' ? /([\d]+)\s+maximum resident set size/.exec(result.stderr) : /Maximum resident set size \(kbytes\):\s*(\d+)/.exec(result.stderr);
      assert.ok(rss, result.stderr); memory.push(Number(rss[1]) * (process.platform === 'darwin' ? 1 : 1024));
    }
    return { implementation: variant.name, milliseconds: stats(samples[index]), peakRssBytes: stats(memory) };
  });
  report.batch.push({ name: item.name, count: item.count, expectedOutput: item.expected, frontendMs: compiled.frontendMs,
    buildMs: compiled.buildMs, results });
  process.stdout.write(item.name + ': ' + results.map(result => `${result.implementation} ${result.milliseconds.median.toFixed(2)}ms`).join(', ') + '\n');
}

async function startServer(command, args) {
  const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] }); let errors = '';
  child.stderr.on('data', chunk => { errors += chunk; });
  try {
    const port = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Server did not start: ' + errors)), 10000);
      child.once('error', error => { clearTimeout(timer); reject(error); });
      child.once('exit', code => { clearTimeout(timer); reject(new Error('Server exited ' + code + ': ' + errors)); });
      createInterface({ input: child.stdout }).on('line', line => {
        const match = /(?:PORT |August HTTP listening on port )(\d+)/.exec(line);
        if (match) { clearTimeout(timer); resolve(Number(match[1])); }
      });
    });
    return { child, port };
  } catch (error) { child.kill(); throw error; }
}
async function stopServer(child) {
  if (child.exitCode !== null) return;
  await new Promise(resolve => {
    const timer = setTimeout(() => child.kill('SIGKILL'), 2000);
    child.once('exit', () => { clearTimeout(timer); resolve(); }); child.kill('SIGTERM');
  });
}
if (!process.argv.includes('--skip-http') && (!only || only.includes('http'))) {
  const compiled = native('http', 'http');
  for (const concurrency of [1, 16, 64]) {
    const variants = [{ name: 'August', command: compiled.binary, args: [] },
      { name: 'Node', command: process.execPath, args: [join(sources, 'reference.mjs'), 'http', '0'] }];
    const results = variants.map(variant => ({ implementation: variant.name, rounds: [] }));
    for (let round = 0; round < rounds; round++) for (let i = 0; i < variants.length; i++) {
      const index = (round + i) % variants.length, variant = variants[index];
      const { child, port } = await startServer(variant.command, variant.args);
      try {
        await httpLoad(port, concurrency, 1000);
        const measured = await httpLoad(port, concurrency, requests);
        measured.requestsPerSecond = requests * 1000 / measured.elapsedMs;
        // Keep the raw data in the JSON artifact without flooding terminal output.
        results[index].rounds.push(measured);
      } finally { await stopServer(child); }
    }
    for (const result of results) result.requestsPerSecond = stats(result.rounds.map(round => round.requestsPerSecond));
    report.http.push({ concurrency, frontendMs: compiled.frontendMs, buildMs: compiled.buildMs, results });
    process.stdout.write(`HTTP concurrency ${concurrency}: ` + results.map(result => `${result.implementation} ${Math.round(result.requestsPerSecond.median)} requests/s`).join(', ') + '\n');
  }
}
const output = stringOption('--output') ? resolve(stringOption('--output')) : only ? join(build, 'results-focused.json') :
  process.argv.includes('--skip-http') ? join(build, 'results-core.json') : join(root, 'docs/benchmark-results.json');
writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
process.stdout.write('Raw results: ' + output + '\n');
