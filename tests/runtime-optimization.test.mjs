import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const cli = resolve('bin/aug.mjs');
function run(source, expected, files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'aug-optimized-'));
  try {
    writeFileSync(join(root, 'main.aug'), source);
    for (const [name, content] of Object.entries(files)) writeFileSync(join(root, name), content);
    for (const optimization of ['debug', 'release']) {
      writeFileSync(join(root, 'main.yaml'), `optimization: ${optimization}\n`);
      const result = spawnSync(process.execPath, [cli, 'run', root], {encoding:'utf8', timeout:15000});
      assert.equal(result.status, 0, result.stderr); assert.equal(result.stdout, expected, optimization);
    }
  } finally { rmSync(root, {recursive:true, force:true}); }
}

test('scalar fast paths preserve mixed arithmetic, wraparound, short circuiting and checked errors', () => run(`
int maximum = 9223372036854775807
int minimum = -9223372036854775808
print(value=maximum + 1)
print(value=minimum - 1)
print(value=maximum * 2)
print(value=-minimum)
print(value=minimum / -1)
print(value=-7 / 2)
print(value=9007199254740993 != 9007199254740992)
print(value=3 + 0.5)
float widened = 3
print(value=widened + 0.5)
print(value=-widened)
print(value=3 / 2.0)
print(value=1 == 1.0)
print(value=2.0 < 3)
try:
    print(value=false && 1 / 0 == 0)
    print(value=true || 1 / 0 == 0)
    print(value=3.0 / -0.0)
catch ArithmeticError error:
    print(value="checked")
`, '-9223372036854775808\n9223372036854775807\n-2\n-9223372036854775808\n-9223372036854775808\n-3\ntrue\n3.5\n3.5\n-3\n1.5\ntrue\ntrue\nfalse\ntrue\nchecked\n'));

test('Map snapshots keep original values and order across replacement, deletion, growth and GC', () => run(`
own Map<int, string> entries = {1: "apple", 2: "pear", 3: "plum"}
int count = 0
int insertion = 0
for (key, value) in entries:
    print(value=value)
    entries.set(key=key, value="changed")
    entries.take(key=2)
    insertion = 10
    while insertion < 2010:
        entries.set(key=insertion, value="new")
        discarded = ["force", "collection"]
        insertion = insertion + 1
    count = count + 1
print(value=count)
print(value=entries.get(key=1))
print(value=entries.get(key=3))
own Set<int> unique = {}
int index = 0
while index < 3000:
    unique.add(value=index)
    unique.add(value=index)
    index = index + 1
print(value=unique.length())
print(value=unique.contains(value=2999))
print(value=unique.contains(value=-1))
`, 'apple\npear\nplum\n3\nchanged\nchanged\n3000\ntrue\nfalse\n'));

test('broad Data locals remain rooted when a primitive is replaced with a reference', () => run(`
Data stored = 7
stored = "retained"
int? maybe = null
maybe = 9
int allocation = 0
while allocation < 2500:
    garbage = ["trigger", "collection"]
    allocation = allocation + 1
print(value=stored)
print(value=maybe)
`, 'retained\n9\n'));

test('generic interface defaults compare both reference and primitive values by value', () => run(`
import Strings and Integers from comparison
strings = Strings()
integers = Integers()
print(value=strings.same(left="same", right="same"))
print(value=integers.same(left=7, right=7))
print(value=strings.same(left="same", right="different"))
`, 'true\ntrue\nfalse\n', {'comparison.aug': `interface Comparison<T implements Data>:
    same(T left, T right) returns bool:
        return left == right
Strings() implements Comparison<string>:
    pass
Integers() implements Comparison<int>:
    pass
`}));

test('native slot lowering leaves user string literals unchanged', () => run(`
int counter = 7
print(value="roots[2] aug_has_error aug_cancelled")
print(value="escaped \\"roots[2]\\" aug_has_error")
print(value=counter)
`, 'roots[2] aug_has_error aug_cancelled\nescaped "roots[2]" aug_has_error\n7\n'));
