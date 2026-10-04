import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {initProject} from '../src/project-init.ts';
import {initPackage} from '../src/package-manager.ts';
import {loadProject} from '../src/project.ts';
import {checkedProjectWithTests} from '../src/refactoring.ts';
import {formatFile} from '../src/formatter.ts';
import {completions} from '../src/editor.ts';
import {suggestedFixes} from '../src/fixes.ts';
import {snippetBody} from '../src/snippets.ts';
import {parse} from '../src/parser.ts';
const styles = ['braces','indent'].flatMap(block_style => ['spaces','tabs'].flatMap(indentation =>
  ['equals','to'].map(assignment => ({block_style,indentation,assignment}))));
const expand = text => text.replace(/\$\{\d+:([^}]+)\}/g, '$1').replace(/\$\d+/g, '').replace(/\\([\\$}])/g, '$1');
const temporary = action => {const root=mkdtempSync(join(tmpdir(),'aug-style-'));try{return action(root);}finally{rmSync(root,{recursive:true,force:true});}};
const apply = (source, edits) => [...edits].sort((a,b)=>b.start-a.start).reduce((text,edit)=>text.slice(0,edit.start)+edit.text+text.slice(edit.end),source);

test('application and library starters honor every source preference and check their same-file tests',()=>temporary(root=>{
  for(const [index,style] of styles.entries()) for(const template of ['hello','weather','library']) {
    const app=join(root,`${index}-${template}`);
    if(template==='library')initPackage(app,'calculator',false,style);else initProject(app,template,style);
    const project=loadProject(app),checked=checkedProjectWithTests(app,new Map(),project);
    assert.deepEqual(checked.diagnostics,[],JSON.stringify({template,style}));
    assert.deepEqual(Object.fromEntries(Object.keys(style).map(key=>[key,project.config[key]])),style);
    for(const file of project.files.values())if(!file.builtin&&!file.package)assert.equal(formatFile(project,file),file.source);
    const file=readFileSync(join(app,template==='library'?'src/arithmetic.aug':template==='hello'?'greeting.aug':'forecasts.aug'),'utf8');
    assert.match(file,style.block_style==='indent'?/\):\n/:/\) \{\n/);
    assert.match(file,style.indentation==='tabs'?/^\t\S/m:/^ {4}\S/m);
    if(template==='weather') {
      assert.match(file,style.assignment==='to'?/response to client.request/:/response = client.request/);
      assert.match(file,/method="GET"/); // Input labels stay labels, not assignments.
    }
  }
}));

test('every editor template follows block, assignment and indentation preferences',()=>temporary(root=>{
  writeFileSync(join(root,'main.aug'),'');
  for(const style of styles) {
    writeFileSync(join(root,'main.yaml'),Object.entries(style).map(([key,value])=>`${key}: ${value}`).join('\n')+'\n');
    const checked=checkedProjectWithTests(root,new Map());
    const templates=completions(checked,join(root,'main.aug'),0).filter(item=>item.kind==='snippet');
    for(const item of templates) {
      const body=item.insertText.replace('$0','pass');
      if(body.includes('\n    '))assert.equal(style.indentation,'spaces',item.label);
      if(style.block_style==='indent')assert.doesNotMatch(body,/ \{\n/,item.label);
      if(style.assignment==='to')assert.doesNotMatch(body,/^\s*(?:\w+|\$\{\d+:\w+\}) = /m,item.label);
      // Endpoint path tab stops can contain braces and are checked separately by editor fixtures.
      if(['generic template','method template','stream template','test template','interceptor template','worker scope','task scope','borrow block'].includes(item.label))assert.deepEqual(parse('template.aug',expand(body)+'\n').diagnostics,[],item.label+': '+body);
    }
  }
  const source='// note = unchanged\nmessage = "a = b"\nresult = send(message = "a = b")\n/** comment\n * value = untouched\n */';
  assert.equal(snippetBody(source,'indent',false,'to'),'// note = unchanged\nmessage to "a = b"\nresult to send(message = "a = b")\n/** comment\n * value = untouched\n */');
}));

test('declaration fixes format the candidate using project preferences and preserve comments',()=>temporary(root=>{
  for(const style of styles)for(const kind of ['method','interceptor','default','state']) {
    // The source deliberately starts in the other block style.
    const source=kind==='state'?'// Keep this explanation.\ninterface Worker { run(); }\nQuiet() implements Worker { mutable int _count to 0; }\n':kind==='default'?'// Keep this explanation.\ninterface Worker { run(string text = "a = b"); }\nQuiet() implements Worker { }\n':kind==='method'?'// Keep this explanation.\ninterface Worker { run(); }\nQuiet() implements Worker { }\n':
      '// Keep this explanation.\ninterceptor Audit<T>() { }\n';
    const file=join(root,'work.aug');writeFileSync(file,source);writeFileSync(join(root,'main.aug'),'');
    writeFileSync(join(root,'main.yaml'),Object.entries(style).map(([key,value])=>`${key}: ${value}`).join('\n')+'\n');
    const checked=checkedProjectWithTests(root,new Map()),title=kind!=='interceptor'?'Implement run in Quiet':'Add an around implementation';
    const fix=suggestedFixes(checked,file).find(fix=>fix.title===title);assert.ok(fix,title);
    const result=apply(source,fix.edits);writeFileSync(file,result);
    const candidate=checkedProjectWithTests(root,new Map());assert.deepEqual(candidate.diagnostics,[]);
    assert.equal(formatFile(candidate.project,candidate.project.files.get(file)),result);
    assert.match(result,/Keep this explanation/);
    if(kind==='state')assert.match(result,style.assignment==='to'?/mutable int _count to 0/:/mutable int _count = 0/);
    if(kind==='interceptor')assert.doesNotMatch(result,/returns T/); // The body establishes its result.
  }
}));

test('init rejects invalid source options before it creates a directory',()=>temporary(root=>{
  for(const command of [['init'],['package','init']])for(const args of [['--block-style','curly'],['--indentation'],['--assignment','to','--assignment','equals'],['--unknown','yes']]) {
    const path=join(root,'candidate'),result=spawnSync(process.execPath,['bin/aug.mjs',...command,path,...args],{encoding:'utf8'});
    assert.equal(result.status,2,result.stderr);assert.equal(existsSync(path),false);
    assert.match(result.stderr,/Use aug|Invalid|Unknown|Missing|Duplicate/);
  }
  const path=join(root,'valid'),result=spawnSync(process.execPath,['bin/aug.mjs','init',path,'--block-style','braces','--assignment','to','--indentation','tabs'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);assert.equal(loadProject(path).config.assignment,'to');
}));
