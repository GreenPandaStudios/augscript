import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync} from 'node:fs';
import {dirname,join,relative} from 'node:path';
import {tmpdir} from 'node:os';
import {prepareLibraryFixtures} from './library-fixtures.mjs';
import {loadProject as rawLoadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {generateSpecs,updateSpecs} from '../src/spec.ts';
import {parse} from '../src/parser.ts';
import {formatFile} from '../src/formatter.ts';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('');globalThis.window=dom.window;globalThis.document=dom.window.document;
const {default:mermaid}=await import('mermaid');
mermaid.initialize({startOnLoad:false,securityLevel:'strict'});
async function validMermaid(outputs){
 for(const output of outputs)for(const match of output.text.matchAll(/```mermaid\n([\s\S]*?)\n```/g))
   await assert.doesNotReject(()=>mermaid.parse(match[1]),output.path+'\n'+match[1]);
}
const loadProject=root=>{prepareLibraryFixtures(root);return rawLoadProject(root);};
const files={
 'main.aug':'import readValue from app\nprint(value=readValue(value=4))\n',
 'app/export.aug':'export readValue from api\n',
 'app/api.aug':`import compute from service
endpoint GET "/value" as readValue(int value from query) returns int {
    if value > 0 { return compute(value) }
    return 0
}
`,
 'app/service.aug':`compute(int value) returns int { return twice(value=increment(value)) }
increment(int value) returns int { return value + 1 }
twice(int value) returns int { return value * 2 }
`,
};
function project(source,run){
 const root=mkdtempSync(join(tmpdir(),'aug-diagrams-'));
 try{for(const [path,text] of Object.entries(source)){mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),text);}
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[]);
 const result=run(root,checked);
 if(result&&typeof result.then==='function')return result.finally(()=>rmSync(root,{recursive:true,force:true}));
 rmSync(root,{recursive:true,force:true});return result;
 }catch(error){rmSync(root,{recursive:true,force:true});throw error;}
}
const diagrams=checked=>generateSpecs(checked).filter(output=>output.kind==='diagram');
test('spec generates linked project, class/call and ordered API sequences from resolved code',()=>project({
 ...files,
 'app/types.aug':`interface Reader { read() returns int }
Fixed() implements Reader { read() returns int { return 7 } }
Consumer(Reader reader) implements Reader { read() returns int { return reader.read() } }
`,
},async(root,checked)=>{
 const outputs=diagrams(checked);
 await validMermaid(outputs);
 assert.ok(outputs.some(output=>output.path===join(root,'.aug-spec/diagrams/index.md')));
 const page=outputs.find(output=>output.path===join(root,'app/api.aug.diagrams.md')).text;
 assert.match(page,/GET.*\/value/);assert.match(page,/sequenceDiagram/);assert.match(page,/alt.*value #62; 0/);
 const calls=outputs.find(output=>output.path===join(root,'app/service.aug.diagrams.md')).text;
 const sequence=calls.slice(calls.indexOf('### compute'),calls.indexOf('### increment'));
 assert.ok(sequence.indexOf(': increment')<sequence.indexOf(': twice'),'arguments evaluate before their enclosing call');
 const types=outputs.find(output=>output.path===join(root,'app/types.aug.diagrams.md')).text;
 assert.match(types,/implements/);assert.match(types,/interface dispatch/);
 assert.match(generateSpecs(checked).find(o=>o.path===join(root,'app/api.aug.md')).text,/api\.aug\.diagrams\.md/);
}));
test('diagrams are portable, deterministic and unchanged by formatter block style',()=>{
 const render=source=>project(source,(root,checked)=>diagrams(checked).map(o=>({path:relative(root,o.path),text:o.text})));
 assert.deepEqual(render(files),render(Object.fromEntries(Object.entries(files).reverse())));
 project(files,(root,checked)=>{
   const baseline=diagrams(checked).map(o=>o.text.replace(/#L\d+/g,'#L'));
   for(const file of checked.project.files.values())if(!file.builtin&&!file.package){
     const parsed=parse(file.path,file.source).file;
     writeFileSync(file.path,formatFile({...checked.project,config:{...checked.project.config,block_style:'indent'}},parsed));
   }
   const updated=checkProject(loadProject(root));assert.deepEqual(updated.diagnostics.filter(d=>d.severity!=='warning'),[]);
   assert.deepEqual(diagrams(updated).map(o=>o.text.replace(/#L\d+/g,'#L')),baseline);
 });
});
test('large graphs and sequences split without dropping calls or control flow',()=>project({
 'main.aug':'import work from many\nprint(value=work(value=1))\n',
 'many.aug':'work(int value) returns int {\n if value > 0 {\n'+Array.from({length:55},(_,i)=>'  value = step'+i+'(value)\n').join('')+' }\n return value\n}\n'+Array.from({length:55},(_,i)=>'step'+i+'(int value) returns int { return value + 1 }\n').join(''),
},(root,checked)=>{
 const page=diagrams(checked).find(o=>o.path===join(root,'many.aug.diagrams.md')).text;
 assert.match(page,/continued/);assert.ok((page.match(/sequenceDiagram/g)??[]).length>55);
 for(let i=0;i<55;i++)assert.ok(page.includes(': step'+i+'('),'missing step '+i);
 for(const diagram of page.matchAll(/```mermaid\n([\s\S]*?)\n```/g)){
   if(diagram[1].startsWith('flowchart'))assert.ok((diagram[1].match(/^    n\d+\[/gm)??[]).length<=18);
   else assert.ok((diagram[1].match(/^    participant /gm)??[]).length<=12);
 }
}));
test('diagram drift, deletion and handwritten-file protection use the spec transaction',()=>project(files,(root,checked)=>{
 updateSpecs(checked);
 const file=join(root,'app/api.aug.diagrams.md');assert.ok(existsSync(file));
 writeFileSync(file,readFileSync(file,'utf8')+'changed\n');
 assert.ok(updateSpecs(checkProject(loadProject(root)),true).stale.includes('app/api.aug.diagrams.md'));
 writeFileSync(file,'Handwritten diagram notes');
 assert.throws(()=>updateSpecs(checkProject(loadProject(root))),/handwritten/);
 assert.equal(readFileSync(file,'utf8'),'Handwritten diagram notes');
}));

test('sequences retain recovery, cleanup, worker waits and short circuit',()=>project({
 'main.aug':`import run and Failure from work
try { run() } catch ConcurrencyError error { print(value="busy") } catch Failure error { print(value="failed") }
`,
 'work.aug':`Failure() implements Error {}
increment(int value) returns int { return value + 1 }
mayFail(bool fail) returns int unless Failure {
    if fail { throw Failure() }
    return 1
}
run() unless ConcurrencyError and Failure {
    try {
        value = mayFail(fail=false)
        while value < 2 { value = increment(value) }
    } catch Failure error { increment(value=0) }
    always { increment(value=0) }
    scope {
        task = start worker increment(value=1)
        result = wait for task
        increment(value=result)
    }
    if false and mayFail(fail=false) == 1 { increment(value=0) }
}
`,
},async(root,checked)=>{
 const output=diagrams(checked).find(output=>output.path===join(root,'work.aug.diagrams.md'));
 await validMermaid([output]);
 for(const text of ['Try body','Catch Failure','Always','While value','start asynchronously','isolated heap','Wait for task','Left is true','Raise checked failure'])assert.ok(output.text.includes(text),text);
}));
test('native boundaries and forwarding never invent implementation bodies',()=>project({
 'main.aug':'import delegated from relay\nprint(value=delegated(value=1))\n',
 'relay.aug':'import increment from calls\nforward delegated to increment\n',
 'calls.aug':'increment(int value) returns int { return value + 1 }\nextern C nativeCount(c_int value) returns c_int\n',
},async(root,checked)=>{
 const outputs=diagrams(checked);await validMermaid(outputs);
 assert.match(outputs.find(o=>o.path===join(root,'relay.aug.diagrams.md')).text,/forward increment/);
 assert.match(outputs.find(o=>o.path===join(root,'calls.aug.diagrams.md')).text,/Native implementation/);
}));
test('removed modules remove their generated diagrams; rejected code never generates views',()=>project(files,(root,checked)=>{
 updateSpecs(checked);
 rmSync(join(root,'app/service.aug'));
 writeFileSync(join(root,'app/api.aug'),'endpoint GET "/value" as readValue(int value from query) returns int { return value }\n');
 updateSpecs(checkProject(loadProject(root)));
 assert.equal(existsSync(join(root,'app/service.aug.diagrams.md')),false);
 writeFileSync(join(root,'app/api.aug'),'broken syntax !!');
 assert.throws(()=>generateSpecs(checkProject(loadProject(root))),/Fix compiler errors/);
}));
test('large split Mermaid views all parse with active branch frames',()=>project({
 'main.aug':'import work from many\nprint(value=work(value=1))\n',
 'many.aug':'work(int value) returns int {\n if value > 0 {\n'+Array.from({length:55},(_,i)=>'  value = step'+i+'(value)\n').join('')+' }\n return value\n}\n'+Array.from({length:55},(_,i)=>'step'+i+'(int value) returns int { return value + 1 }\n').join(''),
},async(root,checked)=>{await validMermaid(diagrams(checked));}));

test('browser actions evaluate captured inputs but defer the HTTP handler',()=>project({
 'main.aug':'import view and remove from actions\nserve remove on port 0\n',
 'actions.aug':`first() returns int { return 1 }
second() returns int { return 2 }
endpoint DELETE "/{a}/{b}" as remove(int a from path, int b from path) returns int { return a + b }
view() returns Html { return <button onClick={handle remove(b=second(), a=first())}>Delete</button> }
`,
},async(root,checked)=>{
 const page=diagrams(checked).find(o=>o.path===join(root,'actions.aug.diagrams.md'));
 await validMermaid([page]);
 const view=page.text.split('### view\n')[1].split('## Called contracts')[0];
 assert.ok(view.indexOf(': second(')<view.indexOf(': first('));
 assert.match(view,/Create browser action for DELETE/);assert.doesNotMatch(view,/: remove\(/);
}));
test('constructor interception, early exits and cleanup remain explicit',()=>project({
 'main.aug':'import Box from objects\nbox = Box()\n',
 'objects.aug':`interface Marker {}
interceptor Delegate<T>() { around() returns T { return next() } }
[Delegate]
Box() implements Marker { initialize { try { return } always { cleanup() } } }
cleanup() {}
`,
},async(root,checked)=>{
 const page=diagrams(checked).find(o=>o.path===join(root,'objects.aug.diagrams.md'));
 await validMermaid([page]);assert.match(page.text,/Constructor layers: Delegate/);
 assert.match(page.text,/Return#59; required cleanup runs before exit/);assert.match(page.text,/Always: cleanup runs/);
 assert.doesNotMatch(page.text,/break Return/);
}));
