import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync,mkdirSync,symlinkSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const cli=resolve('bin/aug.mjs');
function fixture(source,run){const root=mkdtempSync(join(tmpdir(),'aug-test-inputs-'));try{writeFileSync(join(root,'main.aug'),'');writeFileSync(join(root,'values.aug'),source);return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
const invoke=(root,...args)=>spawnSync(process.execPath,[cli,'test',root,'--suggest-inputs','sign','--file','values.aug',...args],{encoding:'utf8',timeout:60000});
const sign='sign(int value) returns int { if value < 0 { return -1 } if value > 0 { return 1 } return 0 }\n';

test('input suggestions retain exact integer boundaries, revisions and an unfilled assertion',()=>fixture(sign,root=>{
 const before=readFileSync(join(root,'values.aug'),'utf8'),a=invoke(root,'--json');assert.equal(a.status,0,a.stderr);const report=JSON.parse(a.stdout);
 assert.equal(report.format,1);assert.equal(report.generator.id,'scalar-boundaries');assert.equal(report.generator.version,1);
 assert.equal(report.behavioralChecks,'not-run');assert.equal(report.oracle,'author-required');assert.equal(report.selection,'one-input-at-a-time');
 assert.deepEqual(report.rows.map(row=>row.inputs.value),['0','-1','1','-9223372036854775808','9223372036854775807']);
 assert.equal(report.rows.every(row=>row.origin==='type-boundary'),true);assert.equal(report.discardedInputs,0);assert.equal(report.complete,true);
 assert.match(report.source.revision,/^[a-f0-9]{64}$/);assert.equal(report.source.definition,'values.aug:sign');assert.equal(report.source.file,'values.aug');
 assert.match(report.scaffold,/__author_property/);assert.doesNotMatch(report.scaffold,/expected|assert\(condition=true\)/);
 assert.equal(readFileSync(join(root,'values.aug'),'utf8'),before);assert.deepEqual(JSON.parse(invoke(root,'--json').stdout),report);
 writeFileSync(join(root,'values.aug'),sign+'// revised\n');assert.notEqual(JSON.parse(invoke(root,'--json').stdout).source.revision,report.source.revision);
}));

test('author-selected literal rows are checked without accepting code or computing answers',()=>fixture(sign,root=>{
 writeFileSync(join(root,'cases.json'),JSON.stringify({format:1,rows:[{value:'42'},{value:'-7'}]}));
 const selected=invoke(root,'--cases','cases.json','--json');assert.equal(selected.status,0,selected.stderr);const report=JSON.parse(selected.stdout);
 assert.deepEqual(report.rows.slice(-2).map(row=>[row.inputs.value,row.origin]),[['42','author'],['-7','author']]);assert.match(report.authorCases.sha256,/^[a-f0-9]{64}$/);
 for(const rows of [[],[{value:'"bad"'}],[{value:'sign(value=42)'}],[{}],[{value:'1',extra:'0'}],[{value:'9223372036854775808'}]]){
  writeFileSync(join(root,'cases.json'),JSON.stringify({format:1,rows}));const bad=invoke(root,'--cases','cases.json','--json');assert.equal(bad.status,1,bad.stdout+bad.stderr);assert.equal(bad.stdout,'');
 }
}));

test('bounded combinations cover scalar domains and reject limits without partial success',()=>fixture('sign(bool enabled, optional int value, string text, c_int code, float ratio) {}\n',root=>{
 const marginal=invoke(root,'--json');assert.equal(marginal.status,0,marginal.stderr);const report=JSON.parse(marginal.stdout);
 assert.equal(report.inputs[1].type,'optional int');assert.ok(report.rows.some(row=>row.inputs.value==='null'));assert.ok(report.rows.some(row=>row.inputs.text==='"👋"'));
 assert.ok(report.rows.some(row=>row.inputs.code==='c_int(value=-2147483648)'));assert.ok(report.rows.some(row=>row.inputs.code==='c_int(value=2147483647)'));
 assert.equal(invoke(root,'--combinations','--json').status,1);
 assert.equal(invoke(root,'--limit','2','--json').status,1);
 writeFileSync(join(root,'values.aug'),'sign(bool enabled, optional bool ready) {}\n');const full=invoke(root,'--combinations','--json');assert.equal(full.status,0,full.stderr);const all=JSON.parse(full.stdout);
 assert.equal(all.selection,'cartesian');assert.equal(all.rows.length,6);assert.equal(all.complete,true);
 assert.deepEqual(new Set(all.rows.map(row=>row.inputs.enabled+':'+row.inputs.ready)),new Set(['false:null','false:false','false:true','true:null','true:false','true:true']));
}));

test('unsupported contracts and malformed options fail explicitly',()=>{
 for(const source of ['sign<T>(T value) {}\n','interface Logger {}\nsign(resolve Logger logger) {}\n','sign(own List<int> values) {}\n','record Point(int x)\nsign(Point point) {}\n','extern C sign(c_int value) returns c_int\n','sign() {}\n'])fixture(source,root=>{
  const result=invoke(root,'--json');assert.equal(result.status,1,result.stderr+result.stdout);assert.match(result.stderr,/unsupported|at least one|managed|concrete|scalar|native/i);assert.equal(result.stdout,'');
 });
 fixture(sign,root=>{for(const options of [['--run'],['--limit','0'],['--limit','1.5'],['--cases'],['--json','--json'],['--combinations','--combinations'],['--file','values.aug']])assert.equal(invoke(root,...options).status,2,options.join(' '));});
});

for(const backend of ['c','llvm'])test('suggested rows run as ordinary same-file tests with independently supplied acceptance ('+backend+')',()=>fixture(sign,root=>{
 const generated=invoke(root,'--json');assert.equal(generated.status,0,generated.stderr);const report=JSON.parse(generated.stdout);
 // These answers follow the requirement for sign, independently of generated source/spec prose.
 const expected={'0':'0','-1':'-1','1':'1','-9223372036854775808':'-1','9223372036854775807':'1'};
 const rows=report.rows.map(row=>'('+row.inputs.value+', '+expected[row.inputs.value]+')').join(', ');
 const tests='test sign { when boundaries { it signed for (value, expected) in ['+rows+'] { assertEqual(actual=sign(value), expected) } } }\n';
 writeFileSync(join(root,'values.aug'),sign+tests);
 let result=spawnSync(process.execPath,[cli,'test',root,'--backend',backend,'--json'],{encoding:'utf8',timeout:60000});assert.equal(result.status,0,result.stdout+result.stderr);assert.equal(JSON.parse(result.stdout).passed,5);
 writeFileSync(join(root,'values.aug'),sign.replace('return -1','return 0')+tests);
 result=spawnSync(process.execPath,[cli,'test',root,'--backend',backend,'--json'],{encoding:'utf8',timeout:60000});assert.equal(result.status,1,result.stdout+result.stderr);assert.equal(JSON.parse(result.stdout).failed,2);
}));

test('scaffolds avoid input/function and assertion placeholder collisions',()=>fixture('sign(bool sign, bool actual, bool __author_property) returns bool { return sign }\n',root=>{
 const result=invoke(root,'--json');assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
 assert.equal(report.assertionPlaceholder,'__author_propertyInput');assert.equal(report.resultBinding,'actualInput');
 assert.match(report.scaffold,/sign\(sign=inputSign, actual, __author_property\)/);assert.match(report.scaffold,/assert\(condition=__author_propertyInput\)/);
}));

for(const backend of ['c','llvm'])test('one-column typed rows unpack their cell, including a tuple cell ('+backend+')',()=>fixture('first(Tuple<int, string> pair) returns int { return pair[0] }\ntest first { when cells { it typed for (pair) in [((7, "seven"),), ((8, "eight"),)] { assert(condition=first(pair) >= 7) } } }\n',root=>{
 const result=spawnSync(process.execPath,[cli,'test',root,'--backend',backend,'--json'],{encoding:'utf8',timeout:60000});assert.equal(result.status,0,result.stderr+result.stdout);assert.equal(JSON.parse(result.stdout).passed,2);
}));

test('the editor completes boundary rows only at a same-file function case position',async()=>{
 const {SemanticWorkspace}=await import('../src/semantic.ts');
 fixture(sign+'test sign:\n    when values:\n        itbound\n',root=>{
  const file=join(root,'values.aug'),source=readFileSync(file,'utf8'),choices=new SemanticWorkspace(root).document(file).complete(source.indexOf('itbound')+7);
  const choice=choices.find(item=>item.label==='itboundaries');assert.ok(choice,JSON.stringify(choices));assert.equal(choice.kind,'snippet');
  assert.match(choice.insertText,/for \(value\) in/);assert.match(choice.insertText,/9223372036854775807/);assert.match(choice.insertText,/\$\{1:__author_property\}/);assert.doesNotMatch(choice.insertText,/condition=true/);
 });
 fixture(sign+'other():\n    itbound\n',root=>{const file=join(root,'values.aug'),source=readFileSync(file,'utf8');assert.ok(!new SemanticWorkspace(root).document(file).complete(source.indexOf('itbound')+7).some(item=>item.label==='itboundaries'));});
});

test('boundary completion honors all eight source preferences and produces checked author-filled cases',async()=>{
 const {SemanticWorkspace}=await import('../src/semantic.ts');
 for(const block_style of ['indent','braces'])for(const indentation of ['spaces','tabs'])for(const assignment of ['equals','to'])fixture(sign+'test sign:\n    when values:\n        itbound\n',root=>{
  writeFileSync(join(root,'main.yaml'),'block_style: '+block_style+'\nindentation: '+indentation+'\nassignment: '+assignment+'\n');
  const file=join(root,'values.aug');if(indentation==='tabs')writeFileSync(file,readFileSync(file,'utf8').replace(/^(?: {4})+/gm,spaces=>'\t'.repeat(spaces.length/4)));
  const source=readFileSync(file,'utf8'),choice=new SemanticWorkspace(root).document(file).complete(source.indexOf('itbound')+7).find(item=>item.label==='itboundaries');assert.ok(choice);
  const body=choice.insertText.replace(/\$\{1:[^}]+\}/,'actual >= -1 and actual <= 1');
  assert.match(body,assignment==='to'?/actual to sign/:/actual = sign/);
  if(block_style==='braces')assert.match(body,/\] \{/);else assert.match(body,/\]:/);
  const indent=indentation==='tabs'?'\t\t':'        ';
  writeFileSync(file,source.slice(0,source.indexOf(indent+'itbound'))+indent+body.replaceAll('\n','\n'+indent).trimEnd()+'\n');
  const result=spawnSync(process.execPath,[cli,'check',root,'--json'],{encoding:'utf8'});assert.equal(result.status,0,result.stderr+result.stdout+'\n'+readFileSync(file,'utf8'));
 });
});

test('boundary completion keeps author assertions unresolved around setup locals and existing case names',async()=>{
 const {SemanticWorkspace}=await import('../src/semantic.ts');
 fixture(sign+'test sign:\n    when values:\n        value = 1\n        actual = 99\n        __author_property = true\n        it boundaries:\n            assert(condition=true)\n        itbound\n',root=>{
  const file=join(root,'values.aug'),source=readFileSync(file,'utf8'),choice=new SemanticWorkspace(root).document(file).complete(source.indexOf('itbound')+7).find(item=>item.label==='itboundaries');assert.ok(choice);
  assert.match(choice.insertText,/it boundariesInput/);assert.match(choice.insertText,/for \(inputValue\)/);assert.match(choice.insertText,/actualInput = sign\(value=inputValue\)/);assert.match(choice.insertText,/\$\{1:__author_propertyInput\}/);
  const body=choice.insertText.replace(/\$\{1:([^}]+)\}/,'$1');writeFileSync(file,source.slice(0,source.indexOf('itbound'))+body.replaceAll('\n','\n        ').trimEnd()+'\n');
  const checked=spawnSync(process.execPath,[cli,'check',root,'--json'],{encoding:'utf8'});assert.equal(checked.status,1,checked.stderr+checked.stdout);const issues=JSON.parse(checked.stdout);
  assert.ok(issues.some(issue=>issue.code==='NAME'&&/Unknown name __author_propertyInput/.test(issue.message)),JSON.stringify(issues));
  assert.ok(issues.every(issue=>['NAME','TEST'].includes(issue.code)),JSON.stringify(issues));
  writeFileSync(file,readFileSync(file,'utf8').replace('condition=__author_propertyInput','condition=actualInput >= -1 and actualInput <= 1'));
  const repaired=spawnSync(process.execPath,[cli,'check',root,'--json'],{encoding:'utf8'});assert.equal(repaired.status,0,repaired.stderr+repaired.stdout);
 });
});

test('public keyword input labels use legal local bindings in row scaffolds',()=>{
 for(const label of ['when','from','it','true','null','return','to'])fixture('sign(int '+label+') {}\n',root=>{
  const result=invoke(root,'--json');assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout),local='input'+label[0].toUpperCase()+label.slice(1);
  assert.match(report.scaffold,new RegExp('for \\('+local+'\\)'));assert.ok(report.scaffold.includes('sign('+label+'='+local+')'));
 });
});

test('completion distinguishes a setup call from a local shadowing its target',async()=>{
 const {SemanticWorkspace}=await import('../src/semantic.ts');
 for(const [setup,offered] of [['sample = sign(value=2)',true],['sign = 2',false]])fixture(sign+'test sign:\n    when values:\n        '+setup+'\n        itbound\n',root=>{
  const file=join(root,'values.aug'),source=readFileSync(file,'utf8'),choices=new SemanticWorkspace(root).document(file).complete(source.indexOf('itbound')+7);assert.equal(choices.some(choice=>choice.label==='itboundaries'),offered);
 });
});

// Library source roots are canonical paths even when the project is reached through a symlink.
test('library input suggestions resolve project-relative files through linked project paths',()=>fixture('',root=>{
 const library=join(root,'library'),linked=join(root,'linked');mkdirSync(join(library,'src'),{recursive:true});
 writeFileSync(join(library,'aug-package.json'),JSON.stringify({format:1,name:'@test/inputs',version:'0.1.0',compiler:JSON.parse(readFileSync('package.json','utf8')).version,source:'src',dependencies:{}}));
 writeFileSync(join(library,'src/export.aug'),'export sign from values\n');writeFileSync(join(library,'src/values.aug'),sign);symlinkSync(library,linked,'dir');
 const result=spawnSync(process.execPath,[cli,'test',linked,'--suggest-inputs','sign','--file','src/values.aug','--json'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).rows.length,5);assert.equal(JSON.parse(result.stdout).source.file,'src/values.aug');
}));
