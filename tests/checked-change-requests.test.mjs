import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,rmSync,existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {analyzeChangeProject,projectRevision} from '../src/change-context.ts';
import {planCheckedChange,applyCheckedChange} from '../src/checked-change-requests.ts';
import {withSourceWriter,recoverSourceChange,SourceBusy} from '../src/source-transaction.ts';
import {loadProject} from '../src/project.ts';

const files={
 'main.aug':'import lower from bridge\nvalue = lower(x=3)\n',
 'bridge/export.aug':'export lower from core\n',
 'bridge/core.aug':'// lower is documented here; the comment must stay.\nlower(int x) returns int:\n    return x + 1\n\ntest lower:\n    when "acceptance":\n        it "increments":\n            assert(condition=lower(x=3) == 4)\n',
 'separate.aug':'import lower from bridge\n\nseparate(int x) returns int:\n    return lower(x=x)\n',
 'shadow.aug':'import lower from bridge\n\nshadow(string lower) returns string:\n    return lower\n\nunrelated() returns string:\n    return "lower"\n',
 'same.aug':'lower(string value) returns string:\n    return value\n',
};
function fixture(t){const root=mkdtempSync(join(tmpdir(),'aug-change-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 for(const [file,source]of Object.entries(files)){mkdirSync(join(root,file,'..'),{recursive:true});writeFileSync(join(root,file),source);}return root;}
const snapshot=root=>Object.fromEntries(Object.keys(files).map(file=>[file,readFileSync(join(root,file),'utf8')]));
function request(root,operation={kind:'rename',symbol:'bridge/core.aug:lower',name:'higher'}){
 return {baseRevision:projectRevision(analyzeChangeProject(root).project).revision,root:'bridge/core.aug:lower',editScope:Object.keys(files),operations:[operation],
   expectedPublicDelta:operation.kind==='rename'?{kind:'rename',from:'bridge/core.aug:lower',to:`bridge/core.aug:${operation.name}`}:{kind:'unchanged'},
   requirements:[{id:'R1',text:'Preserve increment behavior.'}],verification:{tests:[{group:'acceptance',requirements:['R1']}],provenance:{source:'Independently authored increment example',independence:'independent fixture'}}};
}
test('resolved rename updates declarations, exports, imports, test subjects and callers only',t=>{
 const root=fixture(t),before=snapshot(root),plan=planCheckedChange(root,request(root));assert.deepEqual(snapshot(root),before);
 assert.equal(plan.publicDelta.length,2);const result=applyCheckedChange(root,plan);assert.equal(result.status,'committed');assert.equal(result.evidence.behavior.count,1);
 assert(readFileSync(join(root,'bridge/core.aug'),'utf8').includes('// lower is documented here;'));
 assert.equal(readFileSync(join(root,'same.aug'),'utf8'),before['same.aug']);
 assert.equal(readFileSync(join(root,'shadow.aug'),'utf8'),before['shadow.aug'].replace('import lower from bridge','import higher from bridge'));
 assert(readFileSync(join(root,'separate.aug'),'utf8').includes('higher(x=x)'));
 assert.deepEqual(analyzeChangeProject(root).diagnostics,[]);assert.equal(projectRevision(analyzeChangeProject(root).project).revision,result.revision);
 assert(existsSync(join(root,'.aug-changes/revisions',result.revision+'.json')));
});
test('stale source, newly discovered files, config and dependency locks reject without accepted writes',t=>{
 for(const [file,text]of [['main.aug','\n// edit\n'],['new.aug','newValue() returns int:\n    return 9\n'],['main.yaml','block_style: braces\n'],['aug.lock.json','{}\n']]){
  const root=fixture(t),plan=planCheckedChange(root,request(root));writeFileSync(join(root,file),existsSync(join(root,file))?readFileSync(join(root,file),'utf8')+text:text);
  const before=snapshot(root);assert.throws(()=>applyCheckedChange(root,plan),error=>error.code==='CHANGE_STALE');assert.deepEqual(snapshot(root),before);
  assert(!existsSync(join(root,'.aug-changes/revisions')));
 }
});
test('out-of-scope callers, collisions and tampered plans reject before source writes',t=>{
 const root=fixture(t),before=snapshot(root),out=request(root);out.editScope=out.editScope.filter(file=>file!=='separate.aug');
 assert.throws(()=>planCheckedChange(root,out),error=>error.code==='CHANGE_SCOPE');
 writeFileSync(join(root,'separate.aug'),files['separate.aug']+'\nhigher() returns int:\n    return 0\n');
 assert.throws(()=>planCheckedChange(root,request(root)),error=>error.code==='CHANGE_NAME');writeFileSync(join(root,'separate.aug'),files['separate.aug']);
 const plan=planCheckedChange(root,request(root));plan.candidate.sources[0].source+='\n// tamper\n';assert.throws(()=>applyCheckedChange(root,plan),error=>error.code==='CHANGE_PLAN');assert.deepEqual(snapshot(root),before);
});
test('rejections return the exact candidate and its revision-bearing repair diagnostics',t=>{
 const root=fixture(t),before=snapshot(root),change=request(root,{kind:'replace-body',symbol:'bridge/core.aug:lower',source:'lower(int x) returns int:\n    return x + unknown\n'});
 let report;assert.throws(()=>planCheckedChange(root,change),error=>{report=error.report;return error.code==='CHANGE_CANDIDATE';});
 assert(report.candidate.sources.some(source=>source.source.includes('return x + unknown')));assert(report.diagnostics.length>0);
 assert(report.diagnostics.every(issue=>issue.revision===report.candidate.revision));assert.deepEqual(snapshot(root),before);
 assert(report.exchange.specification.readOnly);assert.equal(report.exchange.requirements[0].id,'R1');assert(report.diagnosticSources.some(source=>source.source.includes('return x + unknown')));
 const invalid=request(root,{kind:'replace-body',symbol:'bridge/core.aug:lower',source:'lower(int x) returns int { let value = x; return value }\n'});
 assert.throws(()=>planCheckedChange(root,invalid),error=>{
  const issue=error.report.diagnostics.find(issue=>issue.code==='BINDING');assert.equal(issue.revision,error.report.candidate.revision);
  assert.equal(issue.fixes[0].edits[0].file,'bridge/core.aug');assert.equal(issue.fixes[0].edits[0].text,'');assert(error.report.exchange);
  return error.code==='CHANGE_CANDIDATE';
 });assert.deepEqual(snapshot(root),before);
});
test('compiling a wrong implementation does not substitute for independent behavioral acceptance',t=>{
 const root=fixture(t),before=snapshot(root),change=request(root,{kind:'replace-body',symbol:'bridge/core.aug:lower',source:'lower(int x) returns int:\n    return x + 2\n'});
 const plan=planCheckedChange(root,change);assert.throws(()=>applyCheckedChange(root,plan),error=>error.code==='CHANGE_BEHAVIOR'&&error.report.behavior.outcomes[0].passed===false);
 assert.deepEqual(snapshot(root),before);assert(!existsSync(join(root,'.aug-changes/revisions')));
});
test('injected write failures roll back and concurrent readers and writers reject',t=>{
 const root=fixture(t),before=snapshot(root),plan=planCheckedChange(root,request(root));
 assert.throws(()=>applyCheckedChange(root,plan,{onPhase(phase,writes){if(phase==='written'&&writes===1)throw new Error('injected failure');}}),/injected failure/);
 assert.deepEqual(snapshot(root),before);assert(!existsSync(join(root,'.aug-changes/journal.json')));
 withSourceWriter(root,permit=>{
  assert.throws(()=>loadProject(root),SourceBusy);assert.equal(loadProject(root,new Map(),undefined,permit).root,root);
  assert.throws(()=>withSourceWriter(root,()=>{}),SourceBusy);
 });
 assert.deepEqual(analyzeChangeProject(root).diagnostics,[]);
});
test('process death before or after the durable commit point has defined recoverable behavior',t=>{
 for(const phase of ['written','committed']){
  const root=fixture(t),before=snapshot(root),plan=planCheckedChange(root,request(root)),planFile=join(root,'plan.json');writeFileSync(planFile,JSON.stringify(plan));
  const module=new URL('../src/checked-change-requests.ts',import.meta.url).href;
  const script=`import {readFileSync} from 'node:fs';import {applyCheckedChange} from ${JSON.stringify(module)};const [root,path,phase]=process.argv.slice(1);applyCheckedChange(root,JSON.parse(readFileSync(path,'utf8')),{onPhase(current,writes){if(current===phase&&(phase==='committed'||writes===1))process.kill(process.pid,'SIGKILL');}});`;
  const child=spawnSync(process.execPath,['--input-type=module','-e',script,root,planFile,phase],{encoding:'utf8',timeout:30000});assert.equal(child.signal,'SIGKILL',child.stderr);
  assert.throws(()=>loadProject(root),SourceBusy);const recovered=recoverSourceChange(root);assert.equal(recovered.status,phase==='written'?'rolled back':'committed');
  assert.deepEqual(analyzeChangeProject(root).diagnostics,[]);
  if(phase==='written'){assert.deepEqual(snapshot(root),before);assert(!existsSync(join(root,'.aug-changes/revisions')));}
  else assert(existsSync(join(root,'.aug-changes/revisions',plan.candidateRevision+'.json')));
 }
});
test('recovery preserves an external edit and leaves the journal for reconciliation',t=>{
 const root=fixture(t),plan=planCheckedChange(root,request(root));
 assert.throws(()=>applyCheckedChange(root,plan,{onPhase(phase){if(phase==='written'){writeFileSync(join(root,'bridge/core.aug'),files['bridge/core.aug']+'\n// outside edit\n');throw new Error('failure');}}}),error=>error.code==='CHANGE_RECOVERY');
 const edited=readFileSync(join(root,'bridge/core.aug'),'utf8');assert.throws(()=>recoverSourceChange(root),SourceBusy);
 assert.equal(readFileSync(join(root,'bridge/core.aug'),'utf8'),edited);assert(existsSync(join(root,'.aug-changes/journal.json')));
});
