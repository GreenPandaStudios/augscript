#!/usr/bin/env node
/** Exercise adversarial August programs, analyze every emitted C unit, then run with ASan and UBSan. */
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const fixtureRoot = join(root, 'tests', 'fixtures', 'safety');
const cases = [
  { name: 'collections', output: '31\n63\n31\n6\n12\n0\n3906\n' },
  { name: 'errors', output: 'caught arithmetic\narithmetic cleanup\ncaught index\nindex cleanup\n' },
  { name: 'tasks', output: '4\n3\n3\ncaught task error\n' },
  { name: 'ownership', output: '2\nreleased\n' },
  { name: 'json', output: 'Ada\ntrue\ncaught json error\n' },
  { name: 'crypto', output: 'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0\ntrue\nfalse\ntrue\ncaught invalid random size\n' },
  { name: 'http', test: true, output: '' },
  { name: 'oidc-login', source: join(root, 'examples', 'oidc-login'), staticOnly: true },
];

function run(command, args, label, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 90000, ...options });
  assert.equal(result.status, 0, `${label}: ${result.error?.message || result.stderr || result.stdout}`);
  return result;
}

function analysisFlags(args) {
  const flags = [];
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '-isysroot') { flags.push(arg, args[++index]); continue; }
    if (arg.startsWith('-I') || arg.startsWith('-D') || arg.startsWith('-std=') || arg === '-pthread') flags.push(arg);
  }
  return flags;
}

const selected = new Set(process.argv.slice(2));
for (const name of selected) assert.ok(cases.some(item => item.name === name), `Unknown safety case: ${name}`);
for (const fixture of cases.filter(item => selected.size === 0 || selected.has(item.name))) {
  const project = mkdtempSync(join(tmpdir(), `aug-c-audit-${fixture.name}-`));
  try {
    cpSync(fixture.source ?? join(fixtureRoot, fixture.name), project, {
      recursive: true,
      filter: path => statSync(path).isDirectory() || path.endsWith('.aug') || path.endsWith('main.yaml'),
    });
    const build = run(process.execPath, [join(root, 'bin', 'aug.mjs'), fixture.test ? 'test' : 'build', project,
      ...(fixture.test ? ['--json'] : [])], `${fixture.name} build`);
    if (fixture.test) {
      const report = JSON.parse(build.stdout);
      assert.equal(report.passed, 1, `${fixture.name}: native endpoint test passed`);
      assert.equal(report.failed, 0, `${fixture.name}: native endpoint test has no failures`);
    }
    const executable = fixture.test ? join(project, '.aug-build', 'tests', 'test-0') : build.stdout.trim();
    const metadata = JSON.parse(readFileSync(executable + '.augmap.json', 'utf8'));
    const units = metadata.arguments.filter(arg => arg.endsWith('.c') && arg.startsWith(join(project, '.aug-build')));
    assert.ok(units.some(unit => basename(unit) === (fixture.test ? 'test-0.c' : 'program.c')),
      `${fixture.name}: generated C is present`);
    for (const unit of units) {
      // Clang 14 reports required zero-initialized GC slots as dead stores. Keep every safety checker enabled.
      const analysis = run('clang', ['--analyze', '-Xanalyzer', '-analyzer-output=text',
        '-Xanalyzer', '-analyzer-disable-checker=deadcode.DeadStores',
        '-std=c11', '-Wall', '-Wextra', ...analysisFlags(metadata.arguments), unit], `${fixture.name} static analysis of ${basename(unit)}`);
      assert.doesNotMatch(analysis.stderr + analysis.stdout, /(?:warning|error):/,
        `${fixture.name}: Clang found a problem in ${basename(unit)}`);
    }

    if (fixture.staticOnly) {
      process.stdout.write(`${fixture.name}: ${units.length} C units analyzed\n`);
      continue;
    }
    const args = [...metadata.arguments];
    const optimization = args.findIndex(arg => arg === '-O0' || arg === '-O2');
    if (optimization >= 0) args[optimization] = '-O1';
    const outputFlag = args.indexOf('-o');
    assert.ok(outputFlag >= 0, `${fixture.name}: native compiler output is recorded`);
    const sanitized = join(project, '.aug-build', 'sanitized');
    args[outputFlag + 1] = sanitized;
    args.unshift('-fsanitize=address,undefined', '-fno-omit-frame-pointer');
    run(metadata.compiler, args, `${fixture.name} sanitizer build`);
    const execution = run(sanitized, [], `${fixture.name} sanitizer run`, {
      env: { ...process.env, ASAN_OPTIONS: 'detect_leaks=0:halt_on_error=1', UBSAN_OPTIONS: 'halt_on_error=1' },
    });
    assert.equal(execution.stdout, fixture.output, `${fixture.name}: observed behavior`);
    process.stdout.write(`${fixture.name}: ${units.length} C units analyzed; ASan and UBSan passed\n`);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
}
