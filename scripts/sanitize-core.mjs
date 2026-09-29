import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const fixtures = [
  {
    name: 'Map/Set stress',
    files: { 'main.aug': `Map<int,int> entries = {}
Set<int> unique = {}
int index = 0
while index < 5000:
    borrow entries:
        entries.set(key=index, value=index * 3)
    borrow unique:
        unique.add(value=index)
    index = index + 1
index = 0
while index < 2500:
    borrow entries:
        entries.take(key=index)
    index = index + 1
print(value=entries.length())
print(value=unique.length())
` },
    expected: '2500\n5000\n',
  },
  {
    name: 'task start/wait',
    files: {
      'operations.aug': `read(List<int> values) returns int:
    return values.length()
`,
      'main.aug': `import read from operations
items = [1]
scope:
    pending = start read(values=items)
    print(value=wait for pending)
`,
    },
    expected: '1\n',
  },
  {
    name: 'owned Shared transfer to child',
    files: {
      'operations.aug': `consume(own Shared<List<int>> state):
    pass
`,
      'main.aug': `import consume from operations
scope:
    own Shared<List<int>> state = Shared(value=[1])
    pending = start consume(state=state)
    wait for pending
print(value="done")
`,
    },
    expected: 'done\n',
  },
];

for (const fixture of fixtures) {
  const root = mkdtempSync(join(tmpdir(), 'aug-sanitize-core-'));
  try {
    for (const [name, source] of Object.entries(fixture.files)) writeFileSync(join(root, name), source);
    const build = spawnSync(process.execPath, [resolve('bin/aug.mjs'), 'build', root], {
      encoding: 'utf8', timeout: 60000,
    });
    assert.equal(build.status, 0, `${fixture.name}: ${build.stderr || build.stdout || build.error?.message}`);

    const output = join(root, '.aug-build', basename(root));
    const metadata = JSON.parse(readFileSync(output + '.augmap.json', 'utf8'));
    const args = [...metadata.arguments];
    const optimization = args.findIndex(arg => arg === '-O0' || arg === '-O2');
    if (optimization >= 0) args[optimization] = '-O1';
    const outputFlag = args.indexOf('-o');
    assert.ok(outputFlag >= 0, `${fixture.name}: native compiler arguments include an output path`);
    const sanitized = join(root, '.aug-build', 'sanitized');
    args[outputFlag + 1] = sanitized;
    args.unshift('-fsanitize=address,undefined', '-fno-omit-frame-pointer');
    const compile = spawnSync(metadata.compiler, args, { encoding: 'utf8', timeout: 60000 });
    assert.equal(compile.status, 0, `${fixture.name}: ${compile.stderr || compile.stdout || compile.error?.message}`);

    const run = spawnSync(sanitized, [], {
      encoding: 'utf8', timeout: 60000,
      env: { ...process.env, ASAN_OPTIONS: 'detect_leaks=0:halt_on_error=1', UBSAN_OPTIONS: 'halt_on_error=1' },
    });
    assert.equal(run.status, 0, `${fixture.name}: ${run.stderr || run.error?.message}`);
    assert.equal(run.stdout, fixture.expected, `${fixture.name}: output`);
    process.stdout.write(`${fixture.name} passed AddressSanitizer and UBSan.\n`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
