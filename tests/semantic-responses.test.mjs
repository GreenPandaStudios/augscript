import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {SemanticWorkspace,contractFacts,describe} from '../src/semantic.ts';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';

function fixture(run){
 const root=mkdtempSync(join(tmpdir(),'aug-query-responses-'));
 try{
  writeFileSync(join(root,'main.aug'),'import calculate from operations\nprint(value=calculate(value=7))\n');
  writeFileSync(join(root,'operations.aug'),'/** Add one to the input. */\ncalculate(int value) returns int { return value + 1 }\n');
  return run(root);
 }finally{rmSync(root,{recursive:true,force:true});}
}

test('explanation results cannot alter compiler locations, contracts or cached queries',()=>fixture(root=>{
 const view=new SemanticWorkspace(root).document(join(root,'operations.aug'),undefined,true);
 const expected=view.describe({name:'calculate',budget:100000});
 const poisoned=view.describe({name:'calculate',budget:100000});
 poisoned.contracts[0].location.line=999;
 poisoned.contracts[0].callables[0].location.start=0;
 poisoned.contracts[0].typeParameters.push('Imaginary');
 poisoned.contracts[0].callables[0].inputs[0].type='string';
 assert.deepEqual(view.describe({name:'calculate',budget:100000}),expected);
 assert.equal(view.definition(view.source.indexOf('calculate')).line,2);
}));

test('import and dependency report locations are detached from compiler state',()=>fixture(root=>{
 const view=new SemanticWorkspace(root).document(join(root,'main.aug'),undefined,true);
 const before=view.describe({budget:100000}),response=view.describe({budget:100000});
 response.imports[0].location.start=999;
 response.imports[0].names[0].location.line=800;
 assert.deepEqual(view.describe({budget:100000}),before);
}));

test('hover text is detached from later hover and graph responses',()=>fixture(root=>{
 const view=new SemanticWorkspace(root).document(join(root,'operations.aug'),undefined,true),offset=view.source.indexOf('calculate');
 const before=view.hover(offset),graph=view.graph(),response=view.hover(offset);
 response.detail='imaginary declaration';
 assert.deepEqual(view.hover(offset),before);
 assert.deepEqual(view.graph(),graph);
}));


test('physical dependency metadata changes invalidate the semantic snapshot without a source edit',()=>fixture(root=>{
 const workspace=new SemanticWorkspace(root),file=join(root,'operations.aug');
 const original=workspace.document(file,undefined,true),before=original.graph();
 writeFileSync(join(root,'package.json'),JSON.stringify({private:true,name:'test-app',version:'0.1.0'}));
 const revised=workspace.document(file,undefined,true).graph();
 assert.notEqual(revised.revision,before.revision);assert.deepEqual(revised.sources,before.sources);
 assert.equal(revised.dependencies.find(item=>item.file==='project/package.json').sha256.length,64);
 assert.equal(before.dependencies.find(item=>item.file==='project/package.json').sha256,null);
 assert.deepEqual(original.graph(),before);
 assert.ok(revised.dependencies.every(item=>!item.file.startsWith('/')));
}));


test('exported contract facts are detached from subsequent public queries',()=>fixture(root=>{
 const checked=checkProject(loadProject(root)),file=join(root,'operations.aug');
 const before=describe(checked,file,{name:'calculate',budget:100000});
 const facts=contractFacts(checked),fact=facts.find(item=>item.name==='calculate');
 fact.location.line=999;fact.typeParameters.push('Imaginary');fact.callables[0].location.start=0;
 assert.deepEqual(describe(checked,file,{name:'calculate',budget:100000}),before);
}));
