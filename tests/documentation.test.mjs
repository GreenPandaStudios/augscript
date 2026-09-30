import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, readFileSync, readdirSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
const root = resolve('.');
const cli = join(root, 'bin/aug.mjs');
const command = (project, name, args = []) => spawnSync(process.execPath, [cli, name, project, ...args], { encoding: 'utf8' });
const handwrittenGuides = directory => readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
  if (entry.name.startsWith('.') || ['api', 'examples', 'assets'].includes(entry.name)) return [];
  const file = join(directory, entry.name);
  return entry.isDirectory() ? handwrittenGuides(file) : entry.name.endsWith('.md') ? [file] : [];
});

test('reader instructions use the published starter and do not require language source setup',()=>{
  const guides=[join(root,'README.md'),...handwrittenGuides(join(root,'docs'))];
  for(const guide of guides) {
    const text=readFileSync(guide,'utf8');
    assert.doesNotMatch(text,/\bgit\s+clone\b|\b(?:from|use) a checkout\b|\bnode\s+(?:\/[^\s`]+\/)?bin\/aug\.mjs\b/i,guide);
  }
  for(const name of ['README.md','docs/getting-started.md']) {
    const text=readFileSync(join(root,name),'utf8');
    const firstShell=/```sh\n([\s\S]*?)\n```/.exec(text)?.[1];
    assert.equal(firstShell,'npx @greenpandastudios/aug-cli@next init hello-august',name+': one published starter command');
  }
});

test('the guided calculator change adds a passing case and regenerates a current spec', () => {
  const directory = mkdtempSync(join(tmpdir(), 'aug-guide-change-'));
  try {
    cpSync(join(root, 'examples/developer-workflow'), directory, {
      recursive: true, filter: path => !basename(path).startsWith('.')
    });
    const markdown = readFileSync(join(root, 'docs/guides/change-a-module.md'), 'utf8');
    const fragment = /```text\n([\s\S]*?)\n```/.exec(markdown)?.[1];
    assert.ok(fragment, 'The guide must contain its actual change fragment');
    const file = join(directory, 'calculator.aug');
    const source = readFileSync(file, 'utf8');
    const insertion = '        it "starts with fresh setup"';
    assert.ok(source.includes(insertion));
    const indented = fragment.split('\n').map(line => '        ' + line).join('\n');
    writeFileSync(file, source.replace(insertion, indented + '\n' + insertion));
    const check = command(directory, 'check');
    assert.equal(check.status, 0, check.stdout + check.stderr);
    const run = command(directory, 'test', ['--json']);
    assert.equal(run.status, 0, run.stdout + run.stderr);
    const report = JSON.parse(run.stdout);
    assert.equal(report.passed, 3);
    assert.equal(report.failed, 0);
    const spec = command(directory, 'spec');
    assert.equal(spec.status, 0, spec.stdout + spec.stderr);
    assert.match(readFileSync(file + '.md', 'utf8'), /adds a negative operand/);
    const drift = command(directory, 'spec', ['--check']);
    assert.equal(drift.status, 0, drift.stdout + drift.stderr);
  } finally { rmSync(directory, {recursive: true, force: true}); }
});

function guideProjects() {
  const projects = new Map();
  const guides = [join(root, 'README.md'), ...handwrittenGuides(join(root, 'docs'))];
  for (const guide of guides) {
    const markdown = readFileSync(guide, 'utf8');
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
  return projects;
}

test('guide code fences assemble, check, run and execute their documented tests', () => {
  const projects = guideProjects();
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

test('the book\'s deliberate mistakes produce the explained contract and test failures', () => {
  const projects = guideProjects();
  const failures = JSON.parse(readFileSync(join(root, 'docs/lesson-failures.json'), 'utf8'));
  for (const lesson of failures) {
    const files = new Map(projects.get(lesson.project));
    assert.ok(files.has(lesson.file), lesson.project + ': unknown lesson file');
    const original = files.get(lesson.file);
    if (lesson.source) files.set(lesson.file, lesson.source);
    else {
      assert.ok(original.includes(lesson.before), lesson.project + ': stale mistake demonstration');
      files.set(lesson.file, original.replace(lesson.before, lesson.after));
    }
    const directory = mkdtempSync(join(tmpdir(), 'aug-lesson-failure-'));
    try {
      for (const [path, source] of files) {
        const file = join(directory, path);
        mkdirSync(dirname(file), {recursive: true});
        writeFileSync(file, source);
      }
      const result = command(directory, lesson.command ?? 'check');
      assert.notEqual(result.status, 0, lesson.project + ': the deliberate mistake must fail');
      assert.ok((result.stdout + result.stderr).includes(lesson.diagnostic), lesson.project + ': ' + result.stdout + result.stderr);
    } finally { rmSync(directory, {recursive: true, force: true}); }
  }
});
