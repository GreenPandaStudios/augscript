import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from './compiler-process.mjs';
import * as changes from '../src/checked-changes.ts';
const cli=resolve('bin/aug.mjs');
const original='/** Add one to the supplied value. */\ncompute(int value) returns int { return value + 1 }\n\n_unused(string value) returns string { return value }\n\ntest compute { when arithmetic { it initial { assertEqual(actual=compute(value=7), expected=8) } } }\n';
const replacement='compute(int value) returns int { return value + 2 }\n';
function fixture(run,files={}){const root=mkdtempSync(join(tmpdir(),'aug-body-change-'));try{for(const [name,source] of Object.entries({'main.aug':'import compute from math\nprint(value=compute(value=7))\n','math.aug':original,...files}))writeFileSync(join(root,name),source);return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
const plan=(root,source=replacement,symbol='compute')=>changes.planChangeReplaceBody(root,'math.aug',symbol,source);
const run=(root,...args)=>spawnSync(process.execPath,[cli,...args,root],{encoding:'utf8'});

test('a body plan preserves neighboring source and separates compiler acceptance from real behavior',()=>fixture(root=>{
 const checked=plan(root);assert.equal(checked.operation,'replace-body');assert.equal(checked.replacementSource,replacement);assert.deepEqual(checked.scope,['math.aug']);assert.deepEqual(checked.publicDelta,[]);assert.equal(checked.behavioralEvidence,'not-run');
 assert.equal(readFileSync(join(root,'math.aug'),'utf8'),original);assert.equal(checked.edits.length,1);
 const committed=changes.applyChangePlan(root,checked);assert.equal(committed.operation,'replace-body');assert.equal(committed.status,'committed');assert.equal(committed.behavioralEvidence,'not-run');
 assert.equal(readFileSync(join(root,'math.aug'),'utf8'),original.replace('{ return value + 1 }','{ return value + 2 }'));
 for(const backend of ['c','llvm']){const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'9\n');}
 const evidence=spawnSync(process.execPath,[cli,'test',root,'--json'],{encoding:'utf8'});assert.equal(evidence.status,1,evidence.stderr);assert.equal(JSON.parse(evidence.stdout).failed,1);
}));

test('explicit checked errors remain the same contract while the author changes the body',()=>fixture(root=>{
 const source='compute(int value) returns int unless Problem { if value < 0 { throw Problem(message="negative") } return value + 2 }\n';
 const checked=plan(root,source);assert.deepEqual(checked.publicDelta,[]);changes.applyChangePlan(root,checked);
 const result=run(root,'check');assert.equal(result.status,0,result.stderr);
},{'math.aug':'error Problem(string message)\ncompute(int value) returns int unless Problem { if value < 0 { throw Problem(message="bad") } return value + 1 }\n','main.aug':'import compute and Problem from math\ntry { print(value=compute(value=7)) } catch Problem error { print(value=error.message) }\n'}));

test('function-reference implementation changes do not widen a public contract',()=>fixture(root=>{
 const checked=plan(root,'compute() returns Predicate { return _negative }\n');assert.deepEqual(checked.publicDelta,[]);changes.applyChangePlan(root,checked);
 const result=run(root,'check');assert.equal(result.status,0,result.stderr);
},{'main.aug':'','math.aug':'interface Predicate { accepts(int value) returns bool }\n_positive(int value) returns bool { return value > 0 }\n_negative(int value) returns bool { return value < 0 }\ncompute() returns Predicate { return _positive }\n'}));

test('inferred and private result changes are rejected before accepted writes',()=>{
 for(const name of ['compute','_compute'])fixture(root=>{
  assert.throws(()=>plan(root,name+'() { return "changed" }\n',name),/contract/i);assert.equal(readFileSync(join(root,'math.aug'),'utf8'),name+'() { return 7 }\n');assert.ok(!existsSync(join(root,'.aug-changes','pending.json')));
 },{'main.aug':'','math.aug':name+'() { return 7 }\n'});
});

test('source exchange rejects extra declarations, imports, fences and changed labels',()=>fixture(root=>{
 for(const source of [replacement+'other() {}\n','import Other from other\n'+replacement,'```aug\n'+replacement+'```\n','compute(int number) returns int { return number }\n']){
  assert.throws(()=>plan(root,source),/source unit|signature|header|parse/i);assert.equal(readFileSync(join(root,'math.aug'),'utf8'),original);
 }
}));

test('a rejected candidate returns exact edited source, revision and diagnostics',()=>fixture(root=>{
 let fault;try{plan(root,'compute(int value) returns int { return unknownValue }\n');}catch(error){fault=error;}
 assert.ok(fault);assert.equal(fault.code,'CHANGE_CANDIDATE');assert.match(fault.baseRevision,/^[a-f0-9]{64}$/);assert.match(fault.candidateRevision,/^[a-f0-9]{64}$/);
 const unit=fault.sourceUnits.find(unit=>unit.file==='math.aug');assert.ok(unit.source.includes('return unknownValue'));assert.match(unit.sha256,/^[a-f0-9]{64}$/);assert.ok(fault.diagnostics.some(issue=>issue.code==='NAME'&&issue.file==='math.aug'));
 assert.equal(readFileSync(join(root,'math.aug'),'utf8'),original);
}));

test('stale or altered body plans reject with no accepted source write',()=>{
 for(const mutate of [packet=>packet.edits[0].text='{}',packet=>packet.scope.push('main.aug'),packet=>packet.publicDelta.push({id:'invented'}),packet=>packet.replacementSource=packet.replacementSource.replace('+ 2','+ 3')])fixture(root=>{
  const packet=structuredClone(plan(root));mutate(packet);assert.throws(()=>changes.applyChangePlan(root,packet),/plan|scope|candidate|delta/i);assert.equal(readFileSync(join(root,'math.aug'),'utf8'),original);
 });
 for(const file of ['math.aug','main.yaml','package.json'])fixture(root=>{
  const packet=plan(root);writeFileSync(join(root,file),file==='math.aug'?original+'// concurrent edit\n':file==='main.yaml'?'block_style: braces\n':'{"description":"changed"}\n');
  assert.throws(()=>changes.applyChangePlan(root,packet),/STALE/);assert.ok(readFileSync(join(root,'math.aug'),'utf8').includes('return value + 1'));
 });
});

test('an interrupted body publication uses the existing rollback journal',()=>fixture(root=>{
 const packet=plan(root);assert.throws(()=>changes.applyChangePlan(root,packet,{checkpoint:event=>{if(event.phase==='written')throw new Error('injected interruption');}}),/interruption/);
 assert.equal(readFileSync(join(root,'math.aug'),'utf8'),original);assert.equal(changes.recoverSourceChanges(root).status,'clean');
}));


test('indentation bodies preserve the next declaration and its Javadoc byte for byte',()=>fixture(root=>{
 const before=readFileSync(join(root,'math.aug'),'utf8'),source='compute(int value) returns int:\n    return value + 2\n    // New body note.\n';
 const packet=plan(root,source);changes.applyChangePlan(root,packet);
 assert.equal(readFileSync(join(root,'math.aug'),'utf8'),before.replace('return value + 1','return value + 2').replace('// Old body note.','// New body note.'));
},{'math.aug':'compute(int value) returns int:\n    return value + 1\n    // Old body note.\n\n/** Preserve the neighboring declaration. */\n_unused() returns int:\n    return 99\n'}));

test('both block styles can supply a body without changing the parsed contract',()=>{
 for(const [before,after] of [['compute(int value) returns int { return value + 1 }\n','compute(int value) returns int:\n    return value + 2\n'],['compute(int value) returns int:\n    return value + 1\n','compute(int value) returns int { return value + 2 }\n']])fixture(root=>{
  changes.applyChangePlan(root,plan(root,after));assert.equal(run(root,'check').status,0);
 },{'math.aug':before});
});

test('unsupported public signatures cannot enter the body replacement profile',()=>{
 for(const source of ['extern C compute() returns int\n','compute<T>(T value) returns T { return value }\n','capability Audit { note() uses Audit.note }\ncompute(resolve Audit logger) uses Audit.note { logger.note() }\n','interface Resource { drop() {} }\ncompute(own Resource value) {}\n','interceptor Pass() { around(int value) returns int { return next() } }\n[Pass] compute(int value) returns int { return value }\n'])fixture(root=>{
  assert.throws(()=>plan(root,replacement),/managed standalone|implementation body|checked whole project/i);
  assert.equal(readFileSync(join(root,'math.aug'),'utf8'),source);
 },{'main.aug':'','math.aug':source});
});

test('public CLI captures exact UTF-8 units, commits once and retains rejected source evidence',()=>fixture(root=>{
 const unit=join(root,'replacement.txt'),out=join(root,'body.json');writeFileSync(unit,'\ufeff'+replacement);
 const planned=spawnSync(process.execPath,[cli,'change','plan-replace-body',root,'--file','math.aug','--symbol','compute','--source',unit,'--out',out,'--json'],{encoding:'utf8'});
 assert.equal(planned.status,0,planned.stderr||planned.stdout);const packet=JSON.parse(planned.stdout);assert.equal(packet.replacementSource,readFileSync(unit,'utf8'));assert.deepEqual(packet.publicDelta,[]);assert.equal(readFileSync(join(root,'math.aug'),'utf8'),original);
 let applied=spawnSync(process.execPath,[cli,'change','apply',root,'--plan',out,'--json'],{encoding:'utf8'});assert.equal(applied.status,0,applied.stdout);assert.equal(JSON.parse(applied.stdout).operation,'replace-body');
 applied=spawnSync(process.execPath,[cli,'change','apply',root,'--plan',out,'--json'],{encoding:'utf8'});assert.equal(applied.status,1);assert.equal(JSON.parse(applied.stdout).code,'CHANGE_STALE');
 writeFileSync(unit,'compute(int value) returns int { return unknownValue }\n');
 const rejected=spawnSync(process.execPath,[cli,'change','plan-replace-body',root,'--file','math.aug','--symbol','compute','--source',unit,'--json'],{encoding:'utf8'});
 assert.equal(rejected.status,1);const report=JSON.parse(rejected.stdout);assert.equal(report.stage,'candidate');assert.equal(report.code,'CHANGE_CANDIDATE');assert.ok(report.sourceUnits[0].source.includes('unknownValue'));assert.equal(report.rejectedCandidate.coverage.checkedProject,false);
 writeFileSync(unit,'```aug\n'+replacement+'```\n');
 const syntax=spawnSync(process.execPath,[cli,'change','plan-replace-body',root,'--file','math.aug','--symbol','compute','--source',unit,'--json'],{encoding:'utf8'});assert.equal(syntax.status,1);const parse=JSON.parse(syntax.stdout);assert.equal(parse.stage,'source-unit');assert.equal(parse.sourceUnits[0].file,'supplied-unit/math.aug');assert.ok(parse.diagnostics.every(issue=>issue.file==='supplied-unit/math.aug'));
}));

test('invalid source encoding and oversized exchanges reject without a plan file',()=>fixture(root=>{
 for(const bytes of [Buffer.from([0xff]),Buffer.alloc(1024*1024+1,32)]){const input=join(root,'input.txt'),out=join(root,'invalid.json');writeFileSync(input,bytes);
  const result=spawnSync(process.execPath,[cli,'change','plan-replace-body',root,'--file','math.aug','--symbol','compute','--source',input,'--out',out,'--json'],{encoding:'utf8'});assert.equal(result.status,1);assert.equal(JSON.parse(result.stdout).code,'CHANGE_SOURCE_UNIT');assert.ok(!existsSync(out));
 }
 assert.throws(()=>plan(root,'compute(int value) returns int { return "\ud800" }\n'),/UTF-8/);
 assert.equal(readFileSync(join(root,'math.aug'),'utf8'),original);
}));


test('indentation exchange cannot hide a neighboring private declaration in a comment',()=>{
 for(const suffix of ['', '\n'])fixture(root=>{
  const before=readFileSync(join(root,'math.aug'),'utf8');
  assert.throws(()=>plan(root,'compute():\n    return\n    // Author comment.'+suffix),/outside|neighbor|structure/);
  assert.equal(readFileSync(join(root,'math.aug'),'utf8'),before);
  assert.ok(!existsSync(join(root,'.aug-changes','pending.json')));
 },{'main.aug':'','math.aug':'compute() {} _neighbor() {}\n'});
});


test('a rejected base carries its starting source and revision rather than replacement evidence',()=>fixture(root=>{
 let fault;try{plan(root);}catch(error){fault=error;}
 assert.equal(fault?.code,'CHANGE_BASE');assert.equal(fault.stage,'base');
 assert.match(fault.baseRevision,/^[a-f0-9]{64}$/);assert.equal(fault.candidateRevision,undefined);
 assert.equal(fault.rejectedBase.coverage.checkedProject,false);assert.equal(fault.rejectedCandidate,undefined);
 assert.equal(fault.sourceUnits[0].source,readFileSync(join(root,'math.aug'),'utf8'));
 assert.ok(fault.diagnostics.some(issue=>issue.code==='NAME'&&issue.file==='math.aug'));
 assert.ok(!existsSync(join(root,'.aug-changes','pending.json')));
},{'math.aug':'compute(int value) returns int { return unknownStartingValue }\n'}));


test('a committed body recovery report names the operation without inventing local correspondence',()=>fixture(root=>{
 const packet=plan(root);let fault;
 try{changes.applyChangePlan(root,packet,{checkpoint:event=>{if(event.phase==='committed')throw new Error('cleanup interrupted');}});}catch(error){fault=error;}
 assert.equal(fault?.code,'CHANGE_COMMITTED_RECOVERY_REQUIRED');assert.equal(fault.operation,'replace-body');assert.equal(fault.baseRevision,packet.baseRevision);
 assert.equal(Object.hasOwn(fault,'identityMap'),false);assert.equal(fault.revision,packet.candidateRevision);
 assert.ok(readFileSync(join(root,'math.aug'),'utf8').includes('return value + 2'));
 assert.equal(changes.recoverSourceChanges(root).status,'completed');
}));
