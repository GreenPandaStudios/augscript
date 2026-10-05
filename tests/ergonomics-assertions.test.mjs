import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
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

for(const backend of ['c','llvm'])test('equality differences identify public record and tuple paths without exposing private storage ('+backend+')',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-assertion-paths-'));
  try{
    writeFileSync(join(root,'main.aug'),'');
    writeFileSync(join(root,'values.aug'),`record Address(string city, int secret to _secret)
record Result(Tuple<int, Address> address)
record SecretBox(Address address to _address)
record Wide(int ${'field'.repeat(70)})
read() { return 1 }
test read {
 when paths {
  it nested { assertEqual(actual=Result(address=(1, Address(city="London", secret=123456789))), expected=Result(address=(1, Address(city="Paris", secret=987654321)))) }
  it hidden { assertEqual(actual=Result(address=(1, Address(city="Paris", secret=123456789))), expected=Result(address=(1, Address(city="Paris", secret=987654321)))) }
  it deep { assertEqual(actual=(1,(2,(3,(4,(5,6))))), expected=(1,(2,(3,(4,(5,7)))))) }
  it wide { assertEqual(actual=(${Array(70).fill('0').join(',')},1), expected=(${Array(70).fill('0').join(',')},2)) }
  it scalar { assertEqual(actual=false, expected=true) }
  it privateObject { assertEqual(actual=SecretBox(address=Address(city="hidden actual", secret=1)), expected=SecretBox(address=Address(city="hidden expected", secret=2))) }
  it longField { assertEqual(actual=Wide(${'field'.repeat(70)}=1), expected=Wide(${'field'.repeat(70)}=2)) }
 }
}
`);
    const result=spawnSync(process.execPath,['bin/aug.mjs','test',root,'--backend',backend,'--json'],{encoding:'utf8'});
    assert.equal(result.status,1,result.stderr);assert.ok(result.stdout.trim(),result.stderr);const report=JSON.parse(result.stdout);
    assert.equal(report.failed,7,result.stdout);
    assert.match(report.tests[0].stderr,/difference at \$\.address\[1\]\.city/);
    assert.match(report.tests[1].stderr,/difference at \$\.address\[1\]: private field differs/);
    for(const caseResult of report.tests)assert.doesNotMatch(caseResult.stderr,/_secret|123456789|987654321/);
    assert.match(report.tests[2].stderr,/difference path unavailable: comparison limit reached/);
    assert.match(report.tests[3].stderr,/difference path unavailable: comparison limit reached/);
    assert.match(report.tests[4].stderr,/difference at \$\n/);
    assert.match(report.tests[5].stderr,/difference at \$: private field differs/);
    assert.doesNotMatch(report.tests[5].stderr,/hidden actual|hidden expected|_address|city/);
    assert.match(report.tests[6].stderr,/difference path unavailable: comparison limit reached/);
    if(backend==='c'&&process.env.AUG_TEST_ASSERTION_SANITIZERS==='1'){
      for(let index=0;index<report.tests.length;index++){
        const metadata=JSON.parse(readFileSync(join(root,'.aug-build/tests/test-'+index+'.augmap.json'),'utf8'));
        const output=join(root,'.aug-build/tests/sanitized-'+index),args=[...metadata.arguments];
        args[args.indexOf('-o')+1]=output;
        const optimization=args.indexOf('-O0');if(optimization>=0)args[optimization]='-O1';
        args.unshift('-fsanitize=address,undefined','-fno-omit-frame-pointer');
        const compiled=spawnSync(metadata.compiler,args,{encoding:'utf8',timeout:60000});
        assert.equal(compiled.status,0,compiled.stderr);
        const sanitized=spawnSync(output,[],{encoding:'utf8',timeout:10000,env:{...process.env,ASAN_OPTIONS:'detect_leaks=0:halt_on_error=1',UBSAN_OPTIONS:'halt_on_error=1'}});
        assert.equal(sanitized.status,1,sanitized.stderr);
        assert.match(sanitized.stderr,/assertion failed/);
        assert.doesNotMatch(sanitized.stderr,/AddressSanitizer|runtime error:|UndefinedBehaviorSanitizer/);
      }
      process.stdout.write('Assertion difference paths: seven failing cases passed ASan and UBSan.\n');
    }
  }finally{rmSync(root,{recursive:true,force:true});}
});


for(const backend of ['c','llvm'])test('assertion control-character escapes stay within their fixed byte lengths ('+backend+')',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-assertion-escapes-'));
 try{
  const controls=String.fromCharCode(...Array.from({length:31},(_,i)=>i+1),127);
  const literal=value=>'\"'+value.replaceAll('\n','\\n').replaceAll('\r','\\r').replaceAll('\t','\\t')+'\"';
  writeFileSync(join(root,'main.aug'),'');
  writeFileSync(join(root,'values.aug'),`read() { return 1 }
test read { when escaping {
 it controls { assertEqual(actual=${literal(controls)}, expected="") }
 it truncated { assertEqual(actual=${literal(controls.repeat(100))}, expected="") }
} }
`);
  const result=spawnSync(process.execPath,['bin/aug.mjs','test',root,'--backend',backend,'--json'],{encoding:'utf8'});
  assert.equal(result.status,1,result.stderr);const report=JSON.parse(result.stdout);assert.equal(report.failed,2,result.stdout+result.stderr);
  const escaped=[...controls].map(value=>'\\u'+value.charCodeAt(0).toString(16).padStart(4,'0')).join('');
  assert.ok(report.tests[0].stderr.includes('actual: "'+escaped+'"'),report.tests[0].stderr);
  assert.ok(report.tests[1].stderr.length<1600);assert.doesNotMatch(report.tests[1].stderr,/�|AddressSanitizer|runtime error:/);
  if(backend==='c'&&process.env.AUG_TEST_ASSERTION_SANITIZERS==='1')for(let index=0;index<report.tests.length;index++){
   const metadata=JSON.parse(readFileSync(join(root,'.aug-build/tests/test-'+index+'.augmap.json'),'utf8')),output=join(root,'.aug-build/tests/sanitized-'+index),args=[...metadata.arguments];
   args[args.indexOf('-o')+1]=output;const optimization=args.indexOf('-O0');if(optimization>=0)args[optimization]='-O1';args.unshift('-fsanitize=address,undefined','-fno-omit-frame-pointer');
   const compiled=spawnSync(metadata.compiler,args,{encoding:'utf8',timeout:60000});assert.equal(compiled.status,0,compiled.stderr);
   const sanitized=spawnSync(output,[],{encoding:'utf8',timeout:10000,env:{...process.env,ASAN_OPTIONS:'detect_leaks=0:halt_on_error=1',UBSAN_OPTIONS:'halt_on_error=1'}});
   assert.equal(sanitized.status,1,sanitized.stderr);assert.match(sanitized.stderr,/assertion failed/);assert.doesNotMatch(sanitized.stderr,/AddressSanitizer|runtime error:|UndefinedBehaviorSanitizer/);
  }
 }finally{rmSync(root,{recursive:true,force:true});}
});
