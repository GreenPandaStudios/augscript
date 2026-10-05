import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,rmSync,symlinkSync,chmodSync,cpSync,realpathSync,lstatSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const cli=resolve('bin/aug.mjs');
const source=`interface Count { advance() changes self; value() returns int }
Counter(mutable int initial to _value) implements Count {
 advance() changes self { _value = _value + 1 }
 value() { return _value }
}
test Counter counter { when isolated {
 counter = Counter(initial=0)
 it fresh { borrow counter { counter.advance() }
 assert(counter.value() == 1); print(value="executed") }
} }
`;
function fixture(run){const root=mkdtempSync(join(tmpdir(),'aug-test-compilation-'));const project=join(root,'project'),cache=join(root,'cache');mkdirSync(project);writeFileSync(join(project,'main.aug'),'');writeFileSync(join(project,'counter.aug'),source);try{return run({root,project,cache});}finally{rmSync(root,{recursive:true,force:true});}}
function invoke(fixture,...options){const run=spawnSync(process.execPath,[cli,'test',fixture.project,'--backend','llvm','--json',...options],{encoding:'utf8',timeout:90000,env:{...process.env,...fixture.env,AUG_COMPILATION_CACHE:fixture.cache}});assert.equal(run.status,0,run.stderr+run.stdout);return JSON.parse(run.stdout);}

test('unchanged LLVM case compilation is reused while every invocation initializes and executes its own native test',()=>fixture(f=>{
 const a=invoke(f),b=invoke(f);assert.equal(a.tests[0].compilation.cache,'miss');assert.equal(b.tests[0].compilation.cache,'hit');
 assert.equal(a.tests[0].stdout,'executed\n');assert.equal(b.tests[0].stdout,'executed\n');assert.equal(b.passed,1);
 assert.equal(a.sourceRevision,b.sourceRevision);assert.equal(a.tests[0].compilation.key,b.tests[0].compilation.key);
 const rebuilt=invoke(f,'--rebuild');assert.equal(rebuilt.tests[0].compilation.cache,'refresh');assert.equal(rebuilt.passed,1);
}));

test('test bodies, dependency implementations, source positions and build modes invalidate compilation',()=>fixture(f=>{
 const first=invoke(f);const originalKey=first.tests[0].compilation.key;
 writeFileSync(join(f.project,'counter.aug'),source.replace('_value + 1','_value + 2').replace('value() == 1','value() == 2'));
 const changed=invoke(f);assert.equal(changed.tests[0].compilation.cache,'miss');assert.notEqual(changed.tests[0].compilation.key,originalKey);assert.equal(changed.passed,1);
 writeFileSync(join(f.project,'counter.aug'),'// Source positions changed.\n'+readFileSync(join(f.project,'counter.aug'),'utf8'));
 assert.equal(invoke(f).tests[0].compilation.cache,'miss');
 writeFileSync(join(f.project,'main.yaml'),'optimization: release\n');assert.equal(invoke(f).tests[0].compilation.cache,'miss');assert.equal(invoke(f).tests[0].compilation.cache,'hit');
 const covered=invoke(f,'--coverage');assert.equal(covered.tests[0].compilation.cache,'miss');const repeated=invoke(f,'--coverage');assert.equal(repeated.tests[0].compilation.cache,'hit');assert.equal(repeated.coverage.covered,covered.coverage.covered);
}));

test('corrupted cached binary bytes rebuild and project-local executables cannot replace trusted compilation',()=>fixture(f=>{
 const first=invoke(f),key=first.tests[0].compilation.key;
 writeFileSync(join(f.cache,key,'files/test-0'),'corrupted');
 const repaired=invoke(f);assert.equal(repaired.tests[0].compilation.cache,'miss');assert.equal(repaired.passed,1);
 writeFileSync(join(f.project,'.aug-build/tests/test-0'),'#!/bin/sh\necho POISON\n');
 const restored=invoke(f);assert.equal(restored.tests[0].compilation.cache,'hit');assert.equal(restored.tests[0].stdout,'executed\n');
}));

test('selected-case reordering cannot reuse a different test program',()=>fixture(f=>{
 writeFileSync(join(f.project,'counter.aug'),source.replace('it fresh {','it other { assert(condition=true); print(value="other") }\n it fresh {'));
 const all=invoke(f);assert.equal(all.passed,2);assert.equal(all.tests[0].stdout,'other\n');assert.equal(all.tests[1].stdout,'executed\n');
 const selected=invoke(f,'--case','counter.aug:Counter:isolated:fresh');assert.equal(selected.passed,1);assert.equal(selected.tests[0].stdout,'executed\n');assert.equal(selected.tests[0].compilation.cache,'miss');
 const warm=invoke(f,'--case','counter.aug:Counter:isolated:fresh');assert.equal(warm.tests[0].compilation.cache,'hit');assert.equal(warm.tests[0].stdout,'executed\n');
}));

test('an unavailable optional compilation cache does not prevent native execution',()=>fixture(f=>{
 writeFileSync(f.cache,'not a directory');const report=invoke(f);assert.equal(report.passed,1);assert.equal(report.tests[0].compilation.cache,'disabled');assert.match(report.tests[0].compilation.reason,/cache/i);
}));


test('cached generic, interceptor and owned cleanup code follows a changed dependency implementation',()=>fixture(f=>{
 writeFileSync(join(f.project,'helpers.aug'),`record Box<T implements Data>(T value)
interceptor Adjust() { around(int input) returns int { return next(input=input + 1) } }
[Adjust] doubled(int input) { return input * 2 }
owned() returns own Box<int> { return Box<int>(value=7) }
`);
 writeFileSync(join(f.project,'counter.aug'),`import Box and doubled and owned from helpers
check() { pass }
test check { when managed {
 it value {
  own Box<int> item = owned()
  assert(item.value == 7)
  assert(doubled(input=3) == 8)
  print(value="managed")
 }
} }
`);
 const first=invoke(f),second=invoke(f);assert.equal(first.tests[0].compilation.cache,'miss');assert.equal(second.tests[0].compilation.cache,'hit');assert.equal(second.tests[0].stdout,'managed\n');
 writeFileSync(join(f.project,'helpers.aug'),readFileSync(join(f.project,'helpers.aug'),'utf8').replace('input + 1','input + 2'));
 const failed=spawnSync(process.execPath,[cli,'test',f.project,'--backend','llvm','--json'],{encoding:'utf8',env:{...process.env,AUG_COMPILATION_CACHE:f.cache}});
 assert.equal(failed.status,1,failed.stderr);const report=JSON.parse(failed.stdout);assert.equal(report.failed,1);assert.equal(report.tests[0].compilation.cache,'miss');assert.match(report.tests[0].stderr,/assertion failed/);
}));

test('unqualified task-runtime compilation stays uncached and still executes fresh',()=>fixture(f=>{
 writeFileSync(join(f.project,'counter.aug'),`calculate() { return 7 }
check() { pass }
test check { when tasks { it finishes {
 scope {
  loading = start calculate()
  wait for loading as result
  assert(result == 7)
 }
 print(value="task")
} } }
`);
 for(let i=0;i<2;i++){const report=invoke(f);assert.equal(report.tests[0].compilation.cache,'disabled');assert.match(report.tests[0].compilation.reason,/runtime components/);assert.equal(report.tests[0].stdout,'task\n');}
}));

test('manifest traversal, symbolic artifact files and shared writable caches cannot supply compiler output',()=>fixture(f=>{
 const first=invoke(f),entry=join(f.cache,first.tests[0].compilation.key),manifest=join(entry,'manifest.json');
 const altered=JSON.parse(readFileSync(manifest,'utf8'));altered.files[0].path='../outside';writeFileSync(manifest,JSON.stringify(altered));
 assert.equal(invoke(f).tests[0].compilation.cache,'miss');
 const binary=join(entry,'files/test-0'),outside=join(f.root,'outside');writeFileSync(outside,'untrusted');rmSync(binary);symlinkSync(outside,binary);
 assert.equal(invoke(f).tests[0].compilation.cache,'miss');assert.equal(readFileSync(outside,'utf8'),'untrusted');
 chmodSync(f.cache,0o777);const shared=invoke(f);assert.equal(shared.tests[0].compilation.cache,'disabled');assert.equal(shared.tests[0].stdout,'executed\n');
 chmodSync(f.cache,0o700);
}));

test('unsealed contributor tools and changing external helpers stay uncached',()=>fixture(f=>{
 const tools=process.env.AUG_LLVM_HOME;assert.ok(tools,'The native regression gate supplies its qualified LLVM tools');
 const directory=join(f.root,'tools');mkdirSync(join(directory,'bin'),{recursive:true});
 for(const tool of ['llc','opt','lld'])symlinkSync(join(tools,'bin',tool),join(directory,'bin',tool));
 // LLVM only invokes dsymutil on macOS; another platform uses a forwarding lld.
 const tool=process.platform==='darwin'?'dsymutil':'lld',file=join(directory,'bin',tool);
 if(tool==='lld')rmSync(file);
 const quote=value=>"'"+value.replaceAll("'","'\\''")+"'";
 const helper=join(f.root,'helper.sh');
 writeFileSync(helper,'#!/bin/sh\nexec '+quote(join(tools,'bin',tool))+' "$@"\n',{mode:0o755});
 writeFileSync(file,'#!/bin/sh\nexec '+quote(helper)+' "$@"\n',{mode:0o755});
 f.env={AUG_LLVM_HOME:directory};
 for(let i=0;i<2;i++){const report=invoke(f);assert.equal(report.tests[0].compilation.cache,'disabled');assert.match(report.tests[0].compilation.reason,/verified complete compiler tool pack/);}
 // Wrapper bytes/version are unchanged. The external helper must still run.
 writeFileSync(helper,'#!/bin/sh\necho changed-external-helper >&2\nexit 17\n');
 const changed=spawnSync(process.execPath,[cli,'test',f.project,'--backend','llvm','--json'],{encoding:'utf8',env:{...process.env,...f.env,AUG_COMPILATION_CACHE:f.cache}});
 assert.equal(changed.status,1);assert.match(changed.stderr,/changed-external-helper/);assert.equal(changed.stdout,'');

}));

test('runtime bytes must still pass pack integrity before a cached program can execute',()=>fixture(f=>{
 const runtime=join(f.root,'runtime');cpSync(process.env.AUG_RUNTIME_PACK,runtime,{recursive:true});f.env={AUG_RUNTIME_PACK:runtime};
 const first=invoke(f);assert.equal(invoke(f).tests[0].compilation.cache,'hit');
 const file=join(runtime,'runtime.json'),pack=JSON.parse(readFileSync(file,'utf8'));
 const notice=Object.keys(pack.files).find(path=>path.startsWith('licenses/'));assert.ok(notice);
 writeFileSync(join(runtime,notice),readFileSync(join(runtime,notice),'utf8')+'\nUpdated contributor notice.\n');
 const rejected=spawnSync(process.execPath,[cli,'test',f.project,'--backend','llvm','--json'],{encoding:'utf8',env:{...process.env,...f.env,AUG_COMPILATION_CACHE:f.cache}});
 assert.equal(rejected.status,1);assert.match(rejected.stderr,/NATIVE_INTEGRITY/);assert.equal(rejected.stdout,'');
 pack.files[notice]=createHash('sha256').update(readFileSync(join(runtime,notice))).digest('hex');writeFileSync(file,JSON.stringify(pack));
 const changed=invoke(f);assert.equal(changed.tests[0].compilation.cache,'miss');assert.notEqual(changed.tests[0].compilation.key,first.tests[0].compilation.key);assert.equal(changed.tests[0].stdout,'executed\n');
}));

test('rebuild is restricted to one test option and the C reference continues to compile normally',()=>fixture(f=>{
 for(const options of [['run',f.project,'--rebuild'],['test',f.project,'--rebuild','--rebuild']]){
  const run=spawnSync(process.execPath,[cli,...options],{encoding:'utf8'});assert.equal(run.status,2);assert.match(run.stderr,/--rebuild is valid once for aug test/);
 }
 const run=spawnSync(process.execPath,[cli,'test',f.project,'--backend','c','--rebuild','--json'],{encoding:'utf8'});assert.equal(run.status,0,run.stderr+run.stdout);const report=JSON.parse(run.stdout);assert.equal(report.tests[0].compilation.cache,'disabled');assert.equal(report.tests[0].stdout,'executed\n');
}));


test('a cache hit reads current external inputs and can fail after a previous passing run',()=>fixture(f=>{
 writeFileSync(join(f.project,'input.txt'),'ready');writeFileSync(join(f.project,'counter.aug'),`check() { pass }
test check { when external { it reads {
  text = read_file(path="input.txt")
  print(value=text)
  assert(text == "ready")
} } }
`);
 const first=invoke(f);assert.equal(first.tests[0].compilation.cache,'miss');assert.equal(first.tests[0].stdout,'ready\n');
 writeFileSync(join(f.project,'input.txt'),'changed');
 const failed=spawnSync(process.execPath,[cli,'test',f.project,'--backend','llvm','--json'],{encoding:'utf8',env:{...process.env,AUG_COMPILATION_CACHE:f.cache}});
 assert.equal(failed.status,1,failed.stderr);const report=JSON.parse(failed.stdout);assert.equal(report.tests[0].compilation.cache,'hit');assert.equal(report.failed,1);assert.equal(report.tests[0].stdout,'changed\n');
}));


test('accepted managed package source and configuration identities invalidate reuse through ordinary imports',()=>fixture(f=>{
 const library=join(f.root,'library');mkdirSync(library);writeFileSync(join(library,'aug-package.json'),JSON.stringify({format:1,name:'@test/aug-value',version:'0.1.0',compiler:'>=0.23.0 <1.0.0',source:'.'}));
 writeFileSync(join(library,'export.aug'),'export value from api\n');writeFileSync(join(library,'api.aug'),'value() { return 7 }\n');
 writeFileSync(join(f.project,'main.yaml'),'packages:\n  values: "../library"\n');writeFileSync(join(f.project,'counter.aug'),'import value from values\ncheck() { pass }\ntest check { when imported { it reads { assert(value() == 7); print(value="imported") } } }\n');
 const install=()=>{const installed=spawnSync(process.execPath,[cli,'install',f.project,'--offline'],{encoding:'utf8'});assert.equal(installed.status,0,installed.stderr);};
 install();const first=invoke(f);assert.equal(first.tests[0].compilation.cache,'miss');assert.equal(invoke(f).tests[0].compilation.cache,'hit');
 // The legacy source digest does not include configuration. Cache identity must
 // still include the actual accepted configuration; lock-format migration is separate.
 const lock=JSON.parse(readFileSync(join(f.project,'aug.lock.json'),'utf8'));
 const accepted=join(f.project,'.aug-packages',lock.packages[0].path);
 writeFileSync(join(accepted,'main.yaml'),'# Accepted configuration bytes changed.\n');
 const configuration=invoke(f);assert.equal(configuration.tests[0].compilation.cache,'miss');assert.notEqual(configuration.tests[0].compilation.key,first.tests[0].compilation.key);
 writeFileSync(join(library,'api.aug'),'value() { return 8 }\n');writeFileSync(join(f.project,'counter.aug'),readFileSync(join(f.project,'counter.aug'),'utf8').replace('value() == 7','value() == 8'));install();
 const source=invoke(f);assert.equal(source.tests[0].compilation.cache,'miss');assert.equal(source.tests[0].stdout,'imported\n');
}));


test('self-authored tool-pack manifests cannot qualify a contributor cache even in a retained SHA-named directory',()=>fixture(f=>{
 const original=realpathSync(process.env.AUG_LLVM_HOME),before=readFileSync(join(original,'files.json')),home=join(f.root,'tool-pack',original.split('/').at(-1));cpSync(original,home,{recursive:true});
 assert.equal(lstatSync(home).isSymbolicLink(),false,'The tampering fixture must own its tool files, even when the configured path is a symlink');
 // Real retained native tools still run. A regenerated self-manifest cannot
 // establish the origin of an additional unreviewed tool/helper closure.
 const manifestFile=join(home,'files.json'),manifest=JSON.parse(readFileSync(manifestFile,'utf8'));
 writeFileSync(join(home,'unreviewed-helper'),'unreviewed');manifest.files['unreviewed-helper']=createHash('sha256').update('unreviewed').digest('hex');
 writeFileSync(manifestFile,JSON.stringify(manifest));f.env={AUG_LLVM_HOME:home};
 for(let i=0;i<2;i++){const report=invoke(f);assert.equal(report.tests[0].compilation.cache,'disabled');assert.match(report.tests[0].compilation.reason,/verified complete compiler tool pack/);assert.equal(report.tests[0].stdout,'executed\n');}
 assert.deepEqual(readFileSync(join(original,'files.json')),before,'Tampering qualification must preserve the accepted tools');
}));

test('cached owned cleanup executes with the current native-process environment',()=>fixture(f=>{
 writeFileSync(join(f.project,'counter.aug'),`interface Disposable { drop() }
Resource() implements Disposable { drop() { pass } }
check() { pass }
test check { when cleanup { it releases {
 own Resource held = Resource()
 assert(held == held)
} } }
`);
 f.env={AUG_TRACE_DROPS:undefined};const first=invoke(f);assert.equal(first.tests[0].stderr,'');
 f.env={AUG_TRACE_DROPS:'1'};const second=invoke(f);assert.equal(second.tests[0].compilation.cache,'hit');assert.match(second.tests[0].stderr,/drop: .*Resource\n/);assert.equal(second.passed,1);
}));
