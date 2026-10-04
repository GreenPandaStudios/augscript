import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';

for(const backend of ['c','llvm'])test('equality assertions show checked values once, retain privacy and fail even when caught ('+backend+')',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-assertions-'));
  try {
    writeFileSync(join(root,'main.aug'),'');
    writeFileSync(join(root,'values.aug'),`record Result(string name, int secret to _secret)
read(int value) { return value }
interface Counter { next() returns int changes self; read() returns int }
Count(mutable int initial to _value) implements Counter { next() { _value = _value + 1; return _value } read() { return _value } }
test read {
 when values {
  it scalar { assertEqual(expected=2, actual=read(value=1)) }
  it record { assertEqual(actual=Result(name="first", secret=123456789), expected=Result(name="second", secret=987654321)) }
  it catches { try { assertEqual(actual=1, expected=2) } catch Error error { assert(condition=true) } }
  it ordered { counter = Count(initial=0); borrow counter { try { assertEqual(expected=counter.next(), actual=counter.next()) } catch Error error { assertEqual(actual=counter.read(), expected=2) } } }
  it succeeds { assertEqual(actual=(1,"yes"), expected=(1,"yes")) }
 }
}
`);
    const result=spawnSync(process.execPath,['bin/aug.mjs','test',root,'--backend',backend,'--json'],{encoding:'utf8'});
    assert.equal(result.status,1,result.stderr);assert.ok(result.stdout.trim(),result.stderr);const report=JSON.parse(result.stdout);
    assert.equal(report.failed,4);assert.equal(report.passed,1);
    assert.match(report.tests[0].stderr,/actual: 1/);assert.match(report.tests[0].stderr,/expected: 2/);
    assert.match(report.tests[1].stderr,/name.*first/s);assert.match(report.tests[1].stderr,/name.*second/s);
    assert.doesNotMatch(report.tests[1].stderr,/123456789|987654321|_secret/);
    assert.match(report.tests[1].stderr,/private fields omitted/);
    assert.match(report.tests[3].stderr,/actual: 2/);assert.match(report.tests[3].stderr,/expected: 1/);
    assert.equal(report.tests[3].stderr.match(/assertion failed/g).length,1);
  }finally{rmSync(root,{recursive:true,force:true});}
});


test('equality assertions require labeled comparable values and a test scope',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-assertion-errors-'));
  try {
    const check=(main,other='')=>{writeFileSync(join(root,'main.aug'),main);writeFileSync(join(root,'values.aug'),other);return spawnSync(process.execPath,['bin/aug.mjs','check',root,'--json'],{encoding:'utf8'});};
    let result=check('assertEqual(actual=1, expected=1)');
    assert.equal(result.status,1);assert.match(result.stdout,/belongs inside a test/);
    result=check('', 'read() { return 1 } test read { when values { it incompatible { assertEqual(actual=1, expected="1") } } }');
    assert.equal(result.status,1);assert.match(result.stdout,/cannot compare actual int with expected string/);
    result=check('', 'read() { return 1 } test read { when values { it unlabeled { assertEqual(1, 1) } } }');
    assert.equal(result.status,1);assert.match(result.stdout,/label/);
  }finally{rmSync(root,{recursive:true,force:true});}
});

for(const backend of ['c','llvm'])test('equality output is bounded UTF-8 and collections retain identity equality ('+backend+')',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-assertion-limits-'));
  try {
    writeFileSync(join(root,'main.aug'),'');
    writeFileSync(join(root,'values.aug'),`read() { return 1 }
test read {
 when limits {
  it text { assertEqual(actual="${'🌍'.repeat(100)}", expected="é") }
  it collections { assertEqual(actual=[1], expected=[1]) }
  it numbers { assertEqual(actual=1, expected=1.0) }
 }
}
`);
    const result=spawnSync(process.execPath,['bin/aug.mjs','test',root,'--backend',backend,'--json'],{encoding:'utf8'});
    assert.equal(result.status,1,result.stderr);const report=JSON.parse(result.stdout);
    assert.equal(report.failed,2);assert.equal(report.passed,1);
    assert.match(report.tests[0].stderr,/🌍.*\.\.\./s);assert.doesNotMatch(report.tests[0].stderr,/�/);
    assert.ok(report.tests[0].stderr.length<1000);
    assert.match(report.tests[1].stderr,/identity equality/);
  }finally{rmSync(root,{recursive:true,force:true});}
});
