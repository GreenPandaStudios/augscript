import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {prepareRunPackages} from '../src/package-manager.ts';
import {spawnSync} from './compiler-process.mjs';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {parse} from '../src/parser.ts';
import {formatFile} from '../src/formatter.ts';
import {SemanticWorkspace,contractFacts} from '../src/semantic.ts';
import {packageSurface,compareCheckedPackageInterfaces} from '../src/package-inspection.ts';
import {generateSpecs} from '../src/spec.ts';

function fixture(files,run){const root=mkdtempSync(join(tmpdir(),'aug-internal-'));try{for(const [name,text] of Object.entries(files)){mkdirSync(dirname(join(root,name)),{recursive:true});writeFileSync(join(root,name),text);}return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
const files={
 'main.yaml':'strict_modules: true\n',
 'main.aug':'import greet from service\nprint(value=greet(name="Ada"))\n',
 'service/export.aug':'export greet from greeting\ninternal phrase from words\n',
 'service/greeting.aug':'import phrase from words\ngreet(string name) returns string { return phrase(name) }\n',
 'service/words.aug':'phrase(string name) returns string { return $"Hello, {name}!" }\n'
};
for(const backend of ['c','llvm'])test('strict sibling collaboration remains internal ('+backend+')',()=>fixture(files,root=>{
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 const result=spawnSync(process.execPath,['bin/aug.mjs','run',root,'--backend',backend,'--offline'],{encoding:'utf8',timeout:30000});
 assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'Hello, Ada!\n');
}));


test('an outward signature cannot expose a folder-internal type',()=>fixture({
 'main.aug':'', 'service/export.aug':'export reveal from api\ninternal Secret from model\n',
 'service/model.aug':'record Secret(int value)\n',
 'service/api.aug':'import Secret from model\nreveal(Secret value) returns Secret { return value }\n'
},root=>{
 const diagnostics=checkProject(loadProject(root)).diagnostics;
 assert.ok(diagnostics.some(issue=>issue.code==='MODULE_SURFACE'&&/reveal.*Secret|Secret.*reveal/.test(issue.message)),JSON.stringify(diagnostics));
}));


for(const consumer of ['consumer.aug','service/child/consumer.aug','other/consumer.aug'])test('internal entries reject outward import from '+consumer,()=>fixture({...files,[consumer]:'import phrase from service\n'},root=>{
 const issues=checkProject(loadProject(root)).diagnostics;
 assert.ok(issues.some(issue=>issue.code==='IMPORT'&&/does not export phrase/.test(issue.message)),JSON.stringify(issues));
}));

test('wildcards retain only outward entries and no reexport bypass',()=>fixture({...files,
 'consumer.aug':'import everything from service\n',
 'other/export.aug':'export phrase from consumer\n',
 'other/consumer.aug':'import phrase from service\n'
},root=>{
 const project=loadProject(root),imports=[...project.imports].find(([item])=>item.span.file===join(root,'consumer.aug'))[1];
 assert.deepEqual(imports.map(item=>item.name),['greet']);
 assert.ok(project.diagnostics.some(issue=>issue.code==='EXPORT'&&/does not define/.test(issue.message)));
}));

for(const [name,source,code] of [
 ['duplicate surfaces','export greet from greeting\ninternal greet from greeting\n','EXPORT'],
 ['missing sibling','internal Absent from nowhere\n','EXPORT'],
 ['imported alias','internal phrase from greeting\n','EXPORT'],
 ['private name','internal _secret from words\n','PRIVATE'],
 ['private module','internal phrase from _words\n','PRIVATE'],
 ['ordinary module','internal phrase from words\n','EXPORT']
])test('internal entries diagnose '+name,()=>fixture({...files,
 'service/words.aug':files['service/words.aug']+'_secret() { return 1 }\n',
 'service/_words.aug':files['service/words.aug'],
 [name==='ordinary module'?'service/wrong.aug':'service/export.aug']:source
},root=>assert.ok(checkProject(loadProject(root)).diagnostics.some(issue=>issue.code===code))));

for(const [name,api,model,entries] of [
 ['inferred result','reveal() { return Secret(value=7) }','record Secret(int value)','internal Secret from model'],
 ['inferred checked error','reveal() { throw HiddenError() }','error HiddenError()','internal HiddenError from model'],
 ['generic result','reveal() { return [Secret(value=7)] }','record Secret(int value)','internal Secret from model'],
 ['injected constructor','Public(resolve Secret repo) implements Visible { read() { return repo.value } }','record Secret(int value)','internal Secret from model'],
 ['private constructor storage','Public(Secret repo to _repo) implements Visible { read() { return _repo.value } }','record Secret(int value)','internal Secret from model'],
 ['generic bound','reveal<T implements Secret>(T value) returns T { return value }','interface Secret {}','internal Secret from model'],
 ['inherited interface','interface Visible extends Secret {}','interface Secret {}','internal Secret from model'],
 ['choice alternative','choice Public from Secret and VisibleAlternative\nrecord VisibleAlternative(int value)','record Secret(int value)','internal Secret from model']
])test('outward contract rejects '+name,()=>fixture({
 'main.aug':'',
 'service/export.aug':(api.startsWith('Public(')||api.startsWith('choice')?'export Public from api':api.startsWith('interface')?'export Visible from api':'export reveal from api')+'\n'+(api.startsWith('choice')?'export VisibleAlternative from api\n':'')+(api.startsWith('Public(')?'export Visible from api\n':'')+entries+'\n',
 'service/model.aug':model+'\n',
 'service/api.aug':'import '+(model.startsWith('error')?'HiddenError':'Secret')+' from model\n'+(api.startsWith('Public(')?'interface Visible { read() returns int }\n':'')+api+'\n'
},root=>{
 const issues=checkProject(loadProject(root)).diagnostics;
 assert.ok(issues.some(issue=>issue.code==='MODULE_SURFACE'),JSON.stringify(issues));
 assert.ok(!issues.some(issue=>issue.code==='PARSE'),JSON.stringify(issues));
}));

test('private initialized storage does not expose an internal construction type',()=>fixture({
 'main.aug':'', 'service/export.aug':'export Public from api\nexport Visible from api\ninternal Secret from model\n',
 'service/model.aug':'record Secret(int value)\n',
 'service/api.aug':'import Secret from model\ninterface Visible { read() returns int }\nPublic() implements Visible { Secret _secret = Secret(value=7); read() returns int { return _secret.value } }\n'
},root=>assert.deepEqual(checkProject(loadProject(root)).diagnostics,[])));

test('internal remains an ordinary function name and internal entries preserve both block styles',()=>fixture({...files,
 'service/words.aug':files['service/words.aug']+'internal(int value) { return value }\n'
},root=>{
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 for(const block_style of ['braces','indent']) {
  const file=checked.project.files.get(join(root,'service/export.aug'));
  const formatted=formatFile({...checked.project,config:{...checked.project.config,block_style}},file);
  assert.match(formatted,/internal phrase from words/);assert.deepEqual(parse(file.path,formatted).diagnostics,[]);
 }
}));


const services={
 'main.yaml':'strict_modules: true\n',
 'main.aug':'import Greeter and Services from service\ninclude Services\nresolve Greeter to greeter\nprint(value=greeter.message())\n',
 'service/export.aug':'export Greeter from greeting\nexport Services from providers\ninternal Service from greeting\ninternal Repository from repository\ninternal MemoryRepository from repository\n',
 'service/repository.aug':'interface Repository { read() returns string }\nMemoryRepository() implements Repository { read() { return "Hello, Ada!" } }\n',
 'service/greeting.aug':'import Repository from repository\ninterface Greeter { message() returns string }\nService(resolve Repository repo to _repo) implements Greeter { message() { return _repo.read() } }\n',
 'service/providers.aug':'import Greeter and Service from greeting\nimport Repository and MemoryRepository from repository\ncomposition Services { implement Repository with MemoryRepository; implement Greeter with Service }\n'
};
for(const backend of ['c','llvm'])test('an exported composition supplies hidden implementations ('+backend+')',()=>fixture(services,root=>{
 assert.deepEqual(checkProject(loadProject(root)).diagnostics,[]);
 const result=spawnSync(process.execPath,['bin/aug.mjs','run',root,'--backend',backend,'--offline'],{encoding:'utf8',timeout:30000});
 assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'Hello, Ada!\n');
}));


test('editor, context, package projection and specs distinguish internal entries',()=>fixture({...files,
 'export.aug':'export folder service\n',
 'consumer.aug':'import greet from service\nread() { return greet(name="Ada") }\n',
 'service/words.aug':files['service/words.aug']+'unlisted() { return 1 }\n'
},root=>{
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 assert.deepEqual(packageSurface(checked).map(entry=>entry.name),['service.greet']);
 const phrase=contractFacts(checked).find(item=>item.name==='phrase');assert.equal(phrase.visibility.folder,'internal');
 assert.equal(phrase.visibility.file,'public');
 const workspace=new SemanticWorkspace(root),local=workspace.document(join(root,'service/greeting.aug'),undefined,true),outside=workspace.document(join(root,'consumer.aug'),undefined,true);
 assert.ok(local.complete(local.source.indexOf('phrase')).some(item=>item.label==='phrase'));
 assert.ok(!local.complete(local.source.indexOf('phrase')).some(item=>item.label==='unlisted'));
 assert.ok(!outside.complete(outside.source.indexOf('greet')).some(item=>item.label==='phrase'));
 const surface=workspace.document(join(root,'service/export.aug'),undefined,true);
 assert.match(surface.hover(surface.source.indexOf('phrase')).detail,/Internal folder contract/);
 assert.match(surface.hover(surface.source.indexOf('internal')).documentation,/sibling-only/);
 assert.equal(surface.definition(surface.source.lastIndexOf('from')).file,join(root,'service/words.aug'));
 assert.ok(surface.tokens().some(item=>item.type==='keyword'&&item.start===0&&item.line===1));
 assert.ok(surface.graph().relationships.some(item=>item.kind==='internal'&&item.to==='service/words.aug:phrase'));
 const spec=generateSpecs(checked).find(item=>item.path===join(root,'service/export.aug.md'));
 assert.match(spec.text,/Make available only inside this folder.*phrase/);
}));


test('a repository package exposes its service and composition without its internal repository',()=>fixture({},root=>{
 const library=join(root,'library'),app=join(root,'app');mkdirSync(library);mkdirSync(app);
 for(const [name,text] of Object.entries(services))if(name.startsWith('service/'))writeFileSync(join(library,name.slice('service/'.length)),text);
 const git=(...args)=>{const result=spawnSync(process.env.AUG_GIT??'git',['-c','user.name=August test','-c','user.email=test@example.invalid',...args],{cwd:library,encoding:'utf8'});assert.equal(result.status,0,result.stderr);};
 git('init');git('add','.');git('commit','-m','Internal services');
 const request='git+'+pathToFileURL(library).href;
 writeFileSync(join(app,'main.aug'),`import Greeter and Services from "${request}"\ninclude Services\nresolve Greeter to greeter\nprint(value=greeter.message())\n`);
 const cache=process.env.AUG_PACKAGE_CACHE;process.env.AUG_PACKAGE_CACHE=join(root,'cache');
 try {
  prepareRunPackages(app);assert.deepEqual(checkProject(loadProject(app)).diagnostics,[]);
  for(const backend of ['c','llvm']) {
   const result=spawnSync(process.execPath,['bin/aug.mjs','run',app,'--backend',backend,'--offline'],{encoding:'utf8',timeout:30000});
   assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'Hello, Ada!\n');
  }
  writeFileSync(join(app,'main.aug'),`import Repository from "${request}"\n`);
  assert.ok(checkProject(loadProject(app)).diagnostics.some(issue=>issue.code==='IMPORT'&&/does not export Repository/.test(issue.message)));
 }finally{if(cache===undefined)delete process.env.AUG_PACKAGE_CACHE;else process.env.AUG_PACKAGE_CACHE=cache;}
}));


test('a type named internal keeps its identity in endpoint parameter hints',()=>fixture({
 'main.aug':'', 'model.aug':'record internal(int value)\nendpoint POST "/x" as create(internal payload from body) returns int { return payload.value }\n'
},root=>{
 const view=new SemanticWorkspace(root).document(join(root,'model.aug'),undefined,true);assert.deepEqual(view.diagnostics,[]);
 const offset=view.source.indexOf('internal payload'),column=offset-view.source.lastIndexOf('\n',offset)-1;
 assert.ok(view.tokens().some(item=>item.line===1&&item.start===column&&item.type==='class'));
 assert.doesNotMatch(view.hover(offset).detail,/sibling-only|Internal folder/);
}));


test('fallback coloring leaves contextual internal classification to checked tokens',()=>{
 const grammar=JSON.parse(readFileSync('vscode/syntaxes/augscript.tmLanguage.json','utf8'));
 const keywordPatterns=grammar.repository.keywords.patterns.filter(item=>item.match);
 assert.ok(keywordPatterns.every(item=>!new RegExp(item.match).test('internal')));
});

for(const sibling of ['body','query','request','path','header','cookie','form'])test('legal wire-spelled sibling '+sibling+' retains internal declaration color',()=>fixture({
 'main.aug':'', 'service/export.aug':`internal Repository from ${sibling}\n`,
 ['service/'+sibling+'.aug']:'interface Repository {}\n'
},root=>{
 const view=new SemanticWorkspace(root).document(join(root,'service/export.aug'),undefined,true);assert.deepEqual(view.diagnostics,[]);
 assert.ok(view.tokens().some(item=>item.type==='keyword'&&item.start===0&&item.line===0));
}));

test('changing an export to internal is reported as a public removal',()=>fixture({...files,
 'export.aug':'export folder service\n',
 'service/export.aug':'export greet from greeting\nexport phrase from words\n'
},root=>{
 const before=checkProject(loadProject(root));assert.deepEqual(before.diagnostics,[]);
 writeFileSync(join(root,'service/export.aug'),files['service/export.aug']);
 const after=checkProject(loadProject(root));assert.deepEqual(after.diagnostics,[]);
 const report=compareCheckedPackageInterfaces(before,after),removal=report.changes.find(item=>item.name==='service.phrase');
 assert.ok(removal.before);assert.equal(removal.after,null);assert.equal(report.behavioralEvidence,'not-run');
}));

test('same-spelled exported types retain their distinct resolved visibility',()=>fixture({
 'main.aug':'', 'service/export.aug':'export reveal from api\ninternal Hidden from model\n',
 'service/model.aug':'record Hidden(int secret)\n',
 'other/export.aug':'export Hidden from model\n', 'other/model.aug':'record Hidden(int publicValue)\n',
 'service/api.aug':'import Hidden from other\nreveal() returns Hidden { return Hidden(publicValue=7) }\n'
},root=>assert.deepEqual(checkProject(loadProject(root)).diagnostics,[])));


test('outward results cannot expose a type behind an unexported nested folder',()=>fixture({
 'main.aug':'', 'service/export.aug':'export reveal from api\ninternal hidden from words\n',
 'service/words.aug':'hidden() { return 1 }\n',
 'service/api.aug':'import Value from app\nreveal() returns Value { return Value(number=7) }\n',
 'service/app/export.aug':'export Value from model\n', 'service/app/model.aug':'record Value(int number)\n'
},root=>{
 const issues=checkProject(loadProject(root)).diagnostics;
 assert.ok(issues.some(issue=>issue.code==='MODULE_SURFACE'&&/Value/.test(issue.message)),JSON.stringify(issues));
}));


test('an explicitly exposed nested type remains usable in the outward signature',()=>fixture({
 'main.aug':'', 'service/export.aug':'export reveal from api\nexport folder app\ninternal hidden from words\n',
 'service/words.aug':'hidden() { return 1 }\n',
 'service/api.aug':'import Value from app\nreveal() returns Value { return Value(number=7) }\n',
 'service/app/export.aug':'export Value from model\n', 'service/app/model.aug':'record Value(int number)\n'
},root=>assert.deepEqual(checkProject(loadProject(root)).diagnostics,[])));
