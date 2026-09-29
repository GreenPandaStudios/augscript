import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {buildExamplePages, examples, withExampleProject} from '../scripts/example-docs.mjs';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {formatFile} from '../src/formatter.ts';
import {checkUnitTests, discoverTests} from '../src/testing.ts';

const root=resolve('.');
const sources=directory=>readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
  if(entry.name.startsWith('.')||['node_modules','dist'].includes(entry.name))return [];
  const file=join(directory,entry.name);
  return entry.isDirectory()?sources(file):entry.name.endsWith('.aug')?[file]:[];
});
let generated;
const pages=()=>generated??=buildExamplePages();
const withoutFences=markdown=>markdown.replace(/(`{3,})[^\n]*\n[\s\S]*?\n\1/g,'');

test('the wiki gallery contains every example and measured August source, with actual specs and two formatted views',()=>{
  const outputs=pages();
  const files=[...sources(join(root,'examples')),...sources(join(root,'benchmarks'))];
  for(const file of files) {
    const name=relative(root,file), expected=readFileSync(file+'.md','utf8');
    assert.equal(outputs.get(name+'.md'),expected,name+': adjacent spec drift');
    const views=[...outputs].filter(([path,text])=>path.startsWith('docs/examples/')&&text.includes('source: '+JSON.stringify(name)+'\n'));
    assert.equal(views.length,1,name+': must have exactly one wiki source page');
    const text=views[0][1];
    assert.match(text,/```aug \[Indentation\]/);
    assert.match(text,/```aug \[Braces\]/);
    assert.match(text,/## Compiled specification/);
    assert.match(text,/This document is compiled from checked code/);
  }
});

test('every displayed source style checks as a complete application, including same-file tests and the package consumer',()=>{
  for(const example of examples)withExampleProject(example,({project,directory})=>{
    const owned=[...project.files.values()].filter(file=>!file.builtin&&!file.package);
    for(const style of ['indent','braces']) {
      const overrides=new Map(owned.map(file=>[file.path,formatFile({...project,config:{...project.config,block_style:style,indentation:'spaces'}},file)]));
      const variant=loadProject(directory,overrides), result=checkProject(variant), discovery=discoverTests(variant);
      const tests=checkUnitTests(variant,discovery.tests);
      const errors=[...result.diagnostics,...discovery.diagnostics,...tests.flatMap(test=>test.checked.diagnostics)].filter(issue=>issue.severity!=='warning');
      assert.deepEqual(errors,[],example.path+' / '+style);
    }
  });
});

test('wiki dependency links stay inside the generated gallery and resolve source and declaration anchors',()=>{
  const outputs=pages();
  for(const [path,raw] of outputs) {
    if(!path.startsWith('docs/examples/')||!path.endsWith('.md'))continue;
    const text=withoutFences(raw);
    for(const [,href] of text.matchAll(/\]\(([^\n)]+)\)/g)) {
      if(/^(?:https?:|mailto:)/.test(href))continue;
      const [file,fragment]=href.split('#'), target=relative(root,resolve(root,dirname(path),decodeURIComponent(file)));
      assert.ok(outputs.has(target)||existsSync(join(root,target)),path+': missing '+href);
      if(target.startsWith('docs/examples/')&&fragment) {
        const body=outputs.get(target);
        assert.ok(body.includes('{#'+decodeURIComponent(fragment)+'}'),path+': missing anchor '+href);
      }
      if(path.includes('/dependencies/'))assert.ok(!href.includes('github.com'),path+': dependency must be readable in the wiki');
    }
  }
});

test('example generation is deterministic and keeps project sources and package locks untouched',()=>{
  const before=sources(join(root,'examples')).map(file=>[file,readFileSync(file,'utf8')]);
  const lock=join(root,'examples/packages/app/aug.lock.json'), hadLock=existsSync(lock);
  const fresh=buildExamplePages();
  assert.deepEqual([...fresh.keys()],[...pages().keys()]);
  for(const [path,text] of fresh)assert.equal(text,pages().get(path),path+': generation must be deterministic');
  for(const [file,text] of before)assert.equal(readFileSync(file,'utf8'),text);
  assert.equal(existsSync(lock),hadLock);
  for(const [,text] of pages())assert.ok(!text.includes('aug-wiki-example-'),'temporary host paths must not appear in documentation');
});
