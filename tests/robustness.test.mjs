import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from './compiler-process.mjs';
import { parse } from '../src/parser.ts';
import { loadProject } from '../src/project.ts';
import { checkProject } from '../src/checker.ts';

const cli = resolve('bin/aug.mjs');
const random = initial => {
  let state = initial;
  return () => (state = Math.imul(state, 1664525) + 1013904223 | 0) >>> 0;
};

function run(source, optimization) {
  const root = mkdtempSync(join(tmpdir(), 'aug-robustness-'));
  try {
    writeFileSync(join(root, 'main.aug'), source);
    writeFileSync(join(root, 'main.yaml'), `optimization: ${optimization}\n`);
    const result = spawnSync(process.execPath, [cli, 'run', root], { encoding: 'utf8', timeout: 60000 });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
    return result.stdout.trimEnd().split('\n');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('seeded source mutations never crash parsing or project checking', () => {
  const seed = 0x53a9b17;
  const next = random(seed);
  const corpus = [
    'examples/collections/main.aug',
    'examples/hello/main.aug',
    'examples/hello/app/greeter.aug',
    'examples/ownership-transfer/resource.aug',
    'examples/oidc-login/client/views.aug',
  ].map(path => readFileSync(resolve(path), 'utf8'));
  const alphabet = '{}()[],:;<>?=+-*/!\n\t abcdefghijklmnopqrstuvwxyz0123456789"';
  const mutate = () => {
    const source = corpus[next() % corpus.length];
    const at = next() % (source.length + 1);
    const length = next() % 25;
    const replacement = Array.from({ length: next() % 15 }, () => alphabet[next() % alphabet.length]).join('');
    return source.slice(0, at) + replacement + source.slice(Math.min(source.length, at + length));
  };
  for (let index = 0; index < 5000; index++) {
    const source = mutate();
    assert.doesNotThrow(() => parse('/tmp/main.aug', source), `parser seed ${seed}, case ${index}`);
  }
  const root = resolve('examples/collections');
  const main = join(root, 'main.aug');
  const cache = new Map();
  for (let index = 0; index < 1000; index++) {
    const source = mutate();
    assert.doesNotThrow(() => checkProject(loadProject(root, new Map([[main, source]]), cache)),
      `checker seed ${seed}, case ${index}`);
  }
});

test('generated integer expressions match a wrapping BigInt oracle', () => {
  const next = random(0x6bd142);
  const wrap = value => BigInt.asIntN(64, value);
  const literals = [0n, 1n, -1n, 2n, -2n, 7n, -7n, 9223372036854775807n,
    -9223372036854775808n, 9007199254740993n];
  const generate = depth => {
    if (depth === 0 || next() % 3 === 0) {
      const value = literals[next() % literals.length];
      return { source: value < 0n ? `(${value})` : String(value), value };
    }
    const left = generate(depth - 1), right = generate(depth - 1);
    let operator = ['+', '-', '*', '/'][next() % 4];
    if (operator === '/' && right.value === 0n) operator = '+';
    const value = wrap(operator === '+' ? left.value + right.value : operator === '-' ? left.value - right.value :
      operator === '*' ? left.value * right.value : left.value / right.value);
    return { source: `(${left.source} ${operator} ${right.source})`, value };
  };
  const cases = Array.from({ length: 300 }, () => generate(4));
  const source = 'try:\n' + cases.map(item => `    print(value=${item.source})`).join('\n') +
    '\ncatch ArithmeticError error:\n    print(value="unexpected arithmetic error")\n';
  for (const optimization of ['debug', 'release']) {
    const actual = run(source, optimization);
    assert.equal(actual.length, cases.length, `${optimization} output count`);
    cases.forEach((item, index) => assert.equal(actual[index], String(item.value),
      `${optimization} case ${index}: ${item.source}`));
  }
});

test('generated Map and Set operations match JavaScript oracles', () => {
  const next = random(0x35ac19);
  const lines = ['Map<int,int> entries = {}', 'Set<int> unique = {}'];
  const expected = [];
  const map = new Map(), set = new Set();
  for (let index = 0; index < 350; index++) {
    const key = next() % 51 - 25, value = next() % 500 - 250, operation = next() % 8;
    if (operation === 0) { lines.push('borrow entries:', `    entries.set(key=${key}, value=${value})`); map.set(key, value); }
    if (operation === 1) {
      lines.push('borrow entries:', `    print(value=entries.take(key=${key}))`);
      expected.push(String(map.has(key) ? map.get(key) : 'null')); map.delete(key);
    }
    if (operation === 2) { lines.push(`print(value=entries.get(key=${key}))`); expected.push(String(map.has(key) ? map.get(key) : 'null')); }
    if (operation === 3) { lines.push(`print(value=entries.contains(key=${key}))`); expected.push(String(map.has(key))); }
    if (operation === 4) { lines.push('print(value=entries.length())'); expected.push(String(map.size)); }
    if (operation === 5) { lines.push('borrow unique:', `    unique.add(value=${key})`); set.add(key); }
    if (operation === 6) { lines.push(`print(value=unique.contains(value=${key}))`); expected.push(String(set.has(key))); }
    if (operation === 7) { lines.push('print(value=unique.length())'); expected.push(String(set.size)); }
  }
  for (const optimization of ['debug', 'release']) {
    const actual = run(lines.join('\n') + '\n', optimization);
    assert.deepEqual(actual, expected, `${optimization} seed 0x35ac19`);
  }
});
