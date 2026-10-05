import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {SemanticWorkspace} from '../src/semantic.ts';
const cli=resolve('bin/aug.mjs');
function fixture(files,run){const root=mkdtempSync(join(tmpdir(),'aug-composition-tooling-'));try{for(const [file,source] of Object.entries(files)){mkdirSync(dirname(join(root,file)),{recursive:true});writeFileSync(join(root,file),source);}return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
const apply=(source,choice)=>[...(choice.additionalEdits??[]),{...choice.replacement,text:(choice.insertText??choice.label).replace(/\$\d+/g,'')}].sort((a,b)=>b.start-a.start).reduce((source,edit)=>source.slice(0,edit.start)+edit.text+source.slice(edit.end),source);

test('include completion discovers exported compositions and adds only their ordinary import',()=>fixture({
 'main.aug':'include Serv\n',
 'services/wiring.aug':'/** Application services. */\ncomposition Services {}\ncomposition _Private {}\ncomposition Unexported {}\n',
 'services/export.aug':'export Services from wiring\n',
 'other.aug':'unrelated() {}\n'
},root=>{
 const file=join(root,'main.aug'),source=readFileSync(file,'utf8'),workspace=new SemanticWorkspace(root);
 const choices=workspace.document(file).complete(source.indexOf('Serv')+4),choice=choices.find(item=>item.label==='Services');
 assert.ok(choice,JSON.stringify(choices));assert.equal(choice.kind,'composition');assert.equal(choice.insertText,'Services');
 assert.match(choice.documentation,/Application services/);assert.deepEqual(choices.map(item=>item.label),['Services']);
 const completed=apply(source,choice);assert.equal(completed,'import Services from services\ninclude Services\n');writeFileSync(file,completed);
 assert.deepEqual(new SemanticWorkspace(root).document(file).diagnostics,[]);
}));

const services=`interface Clock { now() returns int }
Fixed() implements Clock { now() { return 7 } }
Live() implements Clock { now() { return 9 } }
interface Worker { read() returns int }
Reader(resolve Clock clock) implements Worker { read() { return clock.now() } }
composition Services {
    implement Clock with Live
    implement Worker with Reader
}
composition TestServices {
    implement Clock with Fixed
    implement Worker with Reader
}
test Reader subject {
    when isolated {
        include TestServices
        subject = Reader()
        it reads { assert(subject.read() == 7) }
    }
}
`;
const invoke=(root,...args)=>spawnSync(process.execPath,[cli,'graph',root,'--composition',...args],{encoding:'utf8'});

test('the read-only composition graph shows actual application and same-file test providers',()=>fixture({
 'main.aug':'import Services and Worker from services\ninclude Services\nresolve Worker to worker\nprint(value=worker.read())\n',
 'services.aug':services
},root=>{
 const before=readFileSync(join(root,'main.aug'),'utf8'),app=invoke(root,'--json');assert.equal(app.status,0,app.stderr);
 const report=JSON.parse(app.stdout);assert.equal(report.checked,true);assert.equal(report.scope.kind,'application');assert.equal(report.behavioralChecks,'not-run');
 assert.match(report.revision,/^[a-f0-9]{64}$/);assert.deepEqual(report.bindings.map(binding=>[binding.key,binding.target.name,binding.lifetime]),[['Clock','Live','shared'],['Worker','Reader','shared']]);
 assert.equal(report.bindings[0].includedAt.file,'main.aug');assert.equal(report.bindings[0].includedAt.line,2);assert.equal(report.bindings[0].composition,'services.aug:Services');
 assert.deepEqual(report.dependencies.map(edge=>[edge.from,edge.to,edge.input]),[['Worker','Clock','clock']]);assert.equal(report.dependencies[0].location.file,'services.aug');
 const isolated=invoke(root,'--case','services.aug:Reader:isolated:reads','--json');assert.equal(isolated.status,0,isolated.stderr);
 const tests=JSON.parse(isolated.stdout);assert.equal(tests.scope.kind,'test');assert.notEqual(tests.revision,report.revision);
 assert.deepEqual(tests.bindings.map(binding=>[binding.key,binding.target.name]),[['Clock','Fixed'],['Worker','Reader']]);assert.equal(tests.bindings[0].includedAt.line,16);
 const diagram=invoke(root,'--mermaid');assert.equal(diagram.status,0,diagram.stderr);assert.match(diagram.stdout,/^flowchart TD\n/);assert.match(diagram.stdout,/Live/);assert.match(diagram.stdout,/clock/);assert.doesNotMatch(diagram.stdout,/Fixed/);
 assert.equal(readFileSync(join(root,'main.aug'),'utf8'),before);
}));

for(const backend of ['c','llvm'])test('composition inspection matches real application and test execution ('+backend+')',()=>fixture({
 'main.aug':'import Services and Worker from services\ninclude Services\nresolve Worker to worker\nprint(value=worker.read())\n',
 'services.aug':services
},root=>{
 for(const command of ['run','test']){
  const result=spawnSync(process.execPath,[cli,command,root,'--backend',backend,...(command==='test'?['--json']:[])],{encoding:'utf8',timeout:60000});
  assert.equal(result.status,0,result.stderr+result.stdout);
  if(command==='run')assert.equal(result.stdout,'9\n');else assert.equal(JSON.parse(result.stdout).failed,0);
 }
}));

test('include completion stays in composition positions and does not reinclude selected providers',()=>fixture({
 'main.aug':'import Services from services\ninclude Services\ninclude Serv\n',
 'services.aug':services,
 'helper.aug':'import Services from services\nread():\n    include Serv\n'
},root=>{
 const workspace=new SemanticWorkspace(root),file=join(root,'main.aug'),source=readFileSync(file,'utf8');
 assert.ok(!workspace.document(file).complete(source.lastIndexOf('Serv')+4).some(choice=>choice.label==='Services'));
 const helper=join(root,'helper.aug'),text=readFileSync(helper,'utf8');assert.deepEqual(workspace.document(helper).complete(text.lastIndexOf('Serv')+4),[]);
 const tests=join(root,'services.aug'),changed=services.replace('include TestServices','include TestSer');
 const choices=workspace.document(tests,{text:changed,version:1}).complete(changed.indexOf('include TestSer')+'include TestSer'.length);
 assert.ok(choices.some(choice=>choice.label==='TestServices'&&choice.kind==='composition'&&!choice.additionalEdits));
}));

test('rejected graphs retain scope errors and link conflicting includes without emitting a verified diagram',()=>fixture({
 'main.aug':'import Services from services\ninclude Services\ninclude Services\n',
 'services.aug':services
},root=>{
 let result=invoke(root,'--json'),report=JSON.parse(result.stdout);assert.equal(result.status,1);assert.equal(report.checked,false);
 const issue=report.diagnostics.find(issue=>/Duplicate binding Clock/.test(issue.message));assert.equal(issue.line,3);assert.equal(issue.file,join(root,'main.aug'));
 assert.equal(issue.related[0].line,2);assert.equal(issue.related[0].file,join(root,'main.aug'));
 result=invoke(root,'--mermaid');assert.equal(result.status,1);assert.equal(result.stdout,'');assert.match(result.stderr,/Duplicate binding/);
 result=invoke(root,'--case','missing','--json');assert.equal(result.status,1);assert.match(result.stderr,/aug test --list/);
 for(const args of [['--json','--mermaid'],['--case'],['--file','main.aug'],['--composition'],['--unknown']])assert.equal(invoke(root,...args).status,2);
}));

test('include completion rejects late and nested wiring while retaining an empty legal root slot',()=>{
 for(const main of ['print(value=1)\ninclude Serv\n','if true:\n    include Serv\n','if true {\n    include Serv\n}\n'])fixture({'main.aug':main,'services.aug':services},root=>{
  const file=join(root,'main.aug'),choices=new SemanticWorkspace(root).document(file).complete(main.indexOf('Serv')+4);assert.deepEqual(choices,[],main);
 });
 fixture({'main.aug':'include \n','services.aug':services},root=>{
  const choices=new SemanticWorkspace(root).document(join(root,'main.aug')).complete(8);assert.ok(choices.some(choice=>choice.label==='Services'));
 });
});

test('duplicate declarations within one included composition retain both actual binding locations',()=>fixture({
 'main.aug':'import Services from services\ninclude Services\n',
 'services.aug':'interface Clock {}\nFixed() implements Clock {}\ncomposition Services {\n    implement Clock with Fixed\n    implement Clock with Fixed\n}\n'
},root=>{
 const result=invoke(root,'--json'),report=JSON.parse(result.stdout);assert.equal(result.status,1);const issue=report.diagnostics.find(issue=>/Duplicate binding Clock/.test(issue.message));
 assert.equal(issue.file,join(root,'services.aug'));assert.equal(issue.line,5);assert.equal(issue.related[0].file,join(root,'services.aug'));assert.equal(issue.related[0].line,4);
}));
