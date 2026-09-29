import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
const root = resolve('.');
const cli = join(root, 'bin/aug.mjs');
const command = (project, name, args = []) => spawnSync(process.execPath, [cli, name, project, ...args], { encoding: 'utf8' });

test('guide code fences assemble, check, run and execute their documented tests', () => {
  const projects = new Map();
  const guides = ['README.md', ...readdirSync(join(root, 'docs')).filter(file => file.endsWith('.md')).map(file => 'docs/' + file)];
  for (const guide of guides) {
    const markdown = readFileSync(join(root, guide), 'utf8');
    const fences = [...markdown.matchAll(/```aug([^\n]*)\n([\s\S]*?)\n```/g)];
    for (const [, metadata, source] of fences) {
      const attributes = Object.fromEntries(metadata.trim().split(/\s+/).map(value => value.split('=')));
      assert.ok(attributes.project && attributes.file, guide + ': executable aug fences need project and file metadata');
      assert.ok(!attributes.file.includes('..') && !attributes.file.startsWith('/'));
      const files = projects.get(attributes.project) ?? new Map();
      assert.ok(!files.has(attributes.file), attributes.project + ': duplicate documentation source');
      files.set(attributes.file, source + '\n'); projects.set(attributes.project, files);
    }
  }
  const expected = JSON.parse(readFileSync(join(root, 'docs/examples.json'), 'utf8'));
  assert.deepEqual([...projects.keys()].sort(), Object.keys(expected).sort());
  for (const [name, files] of projects) {
    const directory = mkdtempSync(join(tmpdir(), 'aug-guide-' + name + '-'));
    try {
      for (const [path, source] of files) { const file = join(directory, path); mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, source); }
      const check = command(directory, 'check'); assert.equal(check.status, 0, name + ': ' + check.stderr + check.stdout);
      const buildOnly=!!expected[name].buildOnly;
      const run = command(directory, buildOnly?'build':'run'); assert.equal(run.status, 0, name + ': ' + run.stderr);
      if(!buildOnly)assert.equal(run.stdout, expected[name].stdout, name);
      if (expected[name].tests) {
        const cases = command(directory, 'test', ['--json', '--coverage']); assert.equal(cases.status, 0, name + ': ' + cases.stderr + cases.stdout);
        const report = JSON.parse(cases.stdout);
        assert.equal(report.passed, expected[name].tests, name);
        assert.equal(report.failed, 0); assert.ok(report.coverage.covered > 0);
      }
      const format = command(directory, 'format', ['--write']); assert.equal(format.status, 0, name + ': ' + format.stderr);
      const again = command(directory, 'format', ['--json']); assert.equal(again.status, 0, again.stderr);
      for (const file of JSON.parse(again.stdout)) assert.equal(file.text, readFileSync(file.file, 'utf8'), name + ': formatter idempotence');
      const after = command(directory, buildOnly?'check':'run'); assert.equal(after.status, 0, name + ': ' + after.stderr);
      if(!buildOnly)assert.equal(after.stdout, run.stdout, name + ': formatting changed behavior');
    } finally { rmSync(directory, { recursive: true, force: true }); }
  }
});
