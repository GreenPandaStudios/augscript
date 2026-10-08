import {discoverTests,checkUnitTests,mergeTestAnalysis} from '../src/testing.ts';
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
 assert.match(page,/GET.*\/value/);assert.match(page,/sequenceDiagram/);assert.match(page,/alt.*value is positive/);
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
const largeProject={
 'main.aug':'import work from many\nprint(value=work(value=1))\n',
 'many.aug':'work(int value) returns int {\n if value > 0 {\n'+Array.from({length:55},(_,i)=>'  value = step'+i+'(value)\n').join('')+' }\n return value\n}\n'+Array.from({length:55},(_,i)=>'step'+i+'(int value) returns int { return value + 1 }\n').join(''),
};
test('large graphs and sequences split without dropping calls or control flow',()=>project(largeProject,(root,checked)=>{
 const page=diagrams(checked).find(o=>o.path===join(root,'many.aug.diagrams.md')).text;
 assert.match(page,/continued/);assert.ok((page.match(/sequenceDiagram/g)??[]).length<=10,'value-only helpers must not produce separate diagrams');
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
 for(const text of ['Try body','Catch Failure','Always','While value','start asynchronously','isolated heap','Wait for task','(false) is true','Raise checked failure'])assert.ok(output.text.includes(text),text);
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
test('large split Mermaid views all parse with active branch frames',()=>project(largeProject,async(root,checked)=>{await validMermaid(diagrams(checked));}));

test('browser actions evaluate captured inputs but defer the HTTP handler',()=>project({
 'main.aug':'import view and remove from actions\nserve remove on port 0\n',
 'actions.aug':`first() returns int { return 1 }
second() returns int { return 2 }
endpoint DELETE "/{a}/{b}" as remove(int a from path, int b from path) returns int { return a + b }
view() returns Html { return <button onClick={handle remove(b=second(), a=first())}>Delete</button> }
`,
},async(root,checked)=>{
 const page=diagrams(checked).find(o=>o.path===join(root,'actions.aug.diagrams.md'));
 await validMermaid([page]);assert.match(page.text,/defers HTTP call to/);
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
 assert.match(page.text,/Return； required cleanup runs before exit/);assert.match(page.text,/Always: cleanup runs/);
 assert.doesNotMatch(page.text,/break Return/);
}));

test('terminal paths propagate through nested scopes, branches and cleanup without unreachable calls',()=>project({
 'main.aug':'import scopedExit and branched and recovered from exits\nscopedExit()\nbranched(flag=true)\nrecovered()\n',
 'exits.aug':`step() {}
cleanup() {}
scopedExit() { scope { try { return } always { cleanup() } } step() }
branched(bool flag) { if flag { scope { return } } else { return } step() }
recovered() { try { return } always { cleanup() } step() }
`,
},async(root,checked)=>{
 const page=diagrams(checked).find(o=>o.path===join(root,'exits.aug.diagrams.md'));
 await validMermaid([page]);
 for(const name of ['scopedExit','branched','recovered']){
  const section=page.text.split('### '+name+'\n')[1].split(/\n<a id=|\n## Called/)[0];
  assert.doesNotMatch(section,/: step\(/);assert.match(section,/Return/);
  if(name!=='branched')assert.match(section,/: cleanup\(/);
 }
}));
test('constructors describe state and record copies call the checked validating constructor',()=>project({
 'main.aug':'import Box from objects\nbox = Box()\n',
 'objects.aug':`interface Marker {}
Box() implements Marker { int _value = 1 }
Invalid() implements Error {}
record Positive(int value) unless Invalid { initialize { if value < 1 { throw Invalid() } } }
copy(Positive original) returns Positive unless Invalid { return original with(value=0) }
`,
},async(root,checked)=>{
 const page=diagrams(checked).find(o=>o.path===join(root,'objects.aug.diagrams.md'));
 await validMermaid([page]);assert.match(page.text,/Set \\_value to 1/);
 const section=page.text.split('### copy\n')[1].split('## Called contracts')[0];
 assert.doesNotMatch(section,/participant.*Positive constructor/);assert.match(section,/Construct Positive from original with value=0/);
 assert.match(section,/p0-->>p0: Positive result: Positive/);
 assert.ok(section.indexOf('Construct Positive')<section.indexOf('Return'));
}));
test('repeated targets count continuation notes inside the sequence step limit',()=>project({
 'main.aug':'import repeat from calls\nrepeat()\n',
 'calls.aug':'step() {}\nrepeat() {\n'+Array.from({length:50},()=> ' step()\n').join('')+'}\n',
},async(root,checked)=>{
 const page=diagrams(checked).find(o=>o.path===join(root,'calls.aug.diagrams.md'));
 await validMermaid([page]);
 const section=page.text.split('### repeat\n')[1].split('## Called contracts')[0];
 assert.equal((section.match(/: step\(/g)??[]).length,50);
 for(const match of section.matchAll(/\x60\x60\x60mermaid\n([\s\S]*?)\n\x60\x60\x60/g))
  assert.ok((match[1].match(/^    (?:p\d+[-]|Note )/gm)??[]).length<=24);
}));

test('loop exits distinguish escaping failures, infinite continuation and reachable breaks',()=>project({
 'main.aug':'import terminalLoop and infiniteLoop and mixedLoop and nestedBreak and conditionalReturn and caughtFailure from exits\n',
 'exits.aug':`Failure() implements Error {}
step() {}
terminalLoop(bool flag) unless Failure { while true { if flag { return } else { throw Failure() } } step() }
infiniteLoop() { while true { continue } step() }
mixedLoop(bool flag) { while true { if flag { break } else { return } } step() }
nestedBreak() { while true { scope { break } step() } step() }
conditionalReturn(bool flag) { if flag { return } step() }
caughtFailure() { try { throw Failure() } catch Failure error { step() } step() }
`,
},async(root,checked)=>{
 const page=diagrams(checked).find(o=>o.path===join(root,'exits.aug.diagrams.md'));
 await validMermaid([page]);
 const section=name=>page.text.split('### '+name+'\n')[1].split(/\n<a id=|\n## Called/)[0];
 for(const name of ['terminalLoop','infiniteLoop'])assert.doesNotMatch(section(name),/: step\(/);
 for(const name of ['mixedLoop','nestedBreak','conditionalReturn'])assert.equal((section(name).match(/: step\(/g)??[]).length,1,name);
 assert.equal((section('caughtFailure').match(/: step\(/g)??[]).length,2);
}));

test('project overviews retain imported contracts even without an immediate invocation',()=>project({
 'main.aug':'import readValue from data\n',
 'data.aug':'readValue() returns int { return 7 }\n',
},(root,checked)=>{
 const overview=diagrams(checked).find(o=>o.path===join(root,'.aug-spec/diagrams/index.md')).text;
 assert.match(overview,/main\.aug/);assert.match(overview,/data\.aug/);
 const flow=overview.split('## Data flow\n')[1].split('## Open a module')[0];assert.doesNotMatch(flow,/-->/,'an unused import must not look like an executed call');
}));

// Folder summaries retain checked data contracts and expose both incoming and
// outgoing boundaries, while leaf folders remain accessible through their files.
test('folder views summarize inputs/results and stop at the next folder level',()=>project({
 'main.aug':'import load from api\nprint(value=load(id=4))\n',
 'api/export.aug':'export load from handler\n',
 'api/handler.aug':'import lookup from data\nload(int id) returns string { return lookup(id) }\n',
 'api/types.aug':'record Request(int id)\n',
 'data/export.aug':'export lookup from store\n',
 'data/store.aug':'lookup(int id) returns string { return "item" }\n',
 'data/types.aug':'record Item(string name)\n',
 'api/internal/work.aug':'work(int value) returns int { return value }\n',
 'api/internal/other.aug':'record Value(int number)\n',
},async(root,checked)=>{
 const outputs=diagrams(checked);await validMermaid(outputs);
 const overview=outputs.find(output=>output.path===join(root,'.aug-spec/diagrams/index.md')).text;
 const diagram=overview.match(/```mermaid\n([\s\S]*?)\n```/)[1];
 assert.match(diagram,/"api"/);assert.match(diagram,/"data"/);assert.doesNotMatch(diagram,/handler|store|export\.aug/);
 assert.match(diagram,/load\(id\)|lookup\(id\)/);assert.match(diagram,/→ string/);
 const folder=outputs.find(output=>output.path===join(root,'.aug-spec/diagrams/folders/api/index.md')).text;
 assert.match(folder,/handler/);assert.match(folder,/api\/internal/);assert.match(folder,/Startup/);assert.match(folder,/lookup/);
 assert.ok(outputs.some(output=>output.path===join(root,'.aug-spec/diagrams/folders/api/internal/index.md')));
 updateSpecs(checked);assert.deepEqual(updateSpecs(checkProject(loadProject(root)),true).stale,[]);
 rmSync(join(root,'api/internal/other.aug'));updateSpecs(checkProject(loadProject(root)));
 assert.ok(!existsSync(join(root,'.aug-spec/diagrams/folders/api/internal/index.md')));
}));
test('sequences show evaluated argument values and named returned data',()=>project({
 'main.aug':'import load from data\nname = load(id=7)\nprint(value=name)\n',
 'data.aug':'load(int id) returns string { return "item" }\n',
},async(root,checked)=>{
 const output=diagrams(checked).find(item=>item.path===join(root,'main.aug.diagrams.md'));await validMermaid([output]);
 assert.match(output.text,/: load\(id=7\)/);assert.match(output.text,/-->>p0: name: string/);
}));

test('calls on one interface share a service lifeline and preserve inputs and replies',()=>project({
 'main.aug':'import Reader and Fixed from objects\nReader reader = Fixed()\na = reader.read(id=1)\nb = reader.find(name="two")\nReader another = Fixed()\nc = another.read(id=3)\nprint(value=a + b + c)\n',
 'objects.aug':'interface Reader { read(int id) returns int; find(string name) returns int }\nFixed() implements Reader { read(int id) returns int { return id } find(string name) returns int { return 2 } }\n',
},async(root,checked)=>{
 const page=diagrams(checked).find(item=>item.path===join(root,'main.aug.diagrams.md'));await validMermaid([page]);
 const sequence=page.text.split('### Startup\n')[1];
 assert.equal((sequence.match(/participant p\d+ as reader: Reader\n/g)??[]).length,1);
 assert.equal((sequence.match(/participant p\d+ as another: Reader\n/g)??[]).length,1);
 assert.match(sequence,/: read\(id=1\)/);assert.match(sequence,/: find\(name=”two”\)/);
 assert.match(sequence,/-->>p0: a: int/);assert.match(sequence,/-->>p0: b: int/);
 assert.doesNotMatch(sequence,/#\d+;/);
}));
test('dense folder views keep each HTTP entry with its called modules',()=>{
 const source={'main.aug':'import route0 from api\nprint(value=route0(id=1))\n','api/export.aug':'export route0 from handler0\n'};
 for(let i=0;i<4;i++){
  source[`api/handler${i}.aug`]=`import get${i} from store${i}\nendpoint GET "/item${i}" as route${i}(int id from query) returns int { return get${i}(id) }\n`;
  source[`api/store${i}.aug`]=`get${i}(int id) returns int { return id }\n`;
 }
 return project(source,async(root,checked)=>{
  const output=diagrams(checked).find(item=>item.path===join(root,'.aug-spec/diagrams/folders/api/index.md'));await validMermaid([output]);
  for(let i=0;i<4;i++){
   const part=output.text.split(`### handler${i} request flow\n`)[1]?.split('### ')[0];assert.ok(part,`Missing handler ${i}`);
   assert.match(part,/HTTP requests/);assert.match(part,new RegExp(`GET /item${i}\\(id\\)`));assert.match(part,new RegExp(`get${i}\\(id\\) → int`));
  }
 });
});
test('a folder manifest cannot alias generated paths through dot segments',()=>project(files,(root,checked)=>{
 updateSpecs(checked);
 const manifest=join(root,'.aug-spec/manifest.json'),saved=JSON.parse(readFileSync(manifest,'utf8'));
 saved.files.push('.aug-spec/diagrams/folders/api/../api/index.md');writeFileSync(manifest,JSON.stringify(saved));
 assert.throws(()=>updateSpecs(checkProject(loadProject(root))),/Invalid generated specification manifest/);
 assert.ok(existsSync(join(root,'.aug-spec/diagrams/folders/app/index.md')));
}));

test('synthetic worker edges retain the selected function contract rather than the mapper inputs',()=>project({
 'main.aug':'import mapWorkers from august.collections\nimport double from rules\ntry { result = mapWorkers(values=[1,2], concurrency=1, chunkSize=1, transformation=double) } catch Error error { pass }\n',
 'rules.aug':'double(int value) returns int { return value * 2 }\n',
},async(root,checked)=>{
 const output=diagrams(checked).find(item=>item.path===join(root,'.aug-spec/diagrams/index.md'));await validMermaid([output]);
 const row=output.text.split('**[double]')[1]?.split('</details>')[0];
 assert.ok(row);assert.match(row,/value: int/);assert.match(row,/isolated worker transformation/);assert.match(row,/Result: int\./);
 assert.doesNotMatch(row,/concurrency|chunkSize|transformation:/);assert.doesNotMatch(output.text,/double\(values/);
}));
test('record copies expose copied fields and a data result without inventing a service boundary',()=>project({
 'main.aug':'import Row from rules\noriginal = Row(value=1)\ncopied = original with (value=2)\nprint(value=copied.value)\n',
 'rules.aug':'record Row(int value)\n',
},async(root,checked)=>{
 const output=diagrams(checked).find(item=>item.path===join(root,'.aug-spec/diagrams/index.md'));await validMermaid([output]);
 const rows=output.text.split('**[Row]').slice(1);assert.ok(rows.length);
 for(const row of rows){assert.match(row,/value: int/);assert.match(row,/value construction/);assert.match(row,/Result: Row\./);}
 assert.doesNotMatch(output.text,/declared result|flowchart/);
}));


test('long sequence messages wrap without breaking participant or control-flow labels',()=>project({
 'main.aug':'import execute from database\nrows = execute(sql="CREATE TABLE users (name TEXT NOT NULL)", parameters="August")\n',
 'database.aug':'execute(string sql, string parameters) returns int { if sql == "" { return 0 } return 1 }\n',
},async(root,checked)=>{
 const pages=diagrams(checked);await validMermaid(pages);
 const startup=pages.find(page=>page.path===join(root,'main.aug.diagrams.md')).text.split('### Startup\n')[1];
 assert.match(startup,/: execute\(sql=”CREATE TABLE users \(name TEXT NOT NULL\)”,<br\/>parameters=”August”\)/);
 assert.match(startup,/participant p\d+ as database\n/);assert.match(startup,/-->>p0: rows: int/);
 const implementation=pages.find(page=>page.path===join(root,'database.aug.diagrams.md')).text;
 assert.match(implementation,/alt sql equals ””\n/);
}));


test('imported standalone operations share their module lifeline with exact call messages',()=>project({
 'main.aug':'import open and execute from database\nimport close from other\nconnection = open()\nrows = execute(connection)\nclose(connection)\n',
 'database.aug':'open() returns int { return 7 }\nexecute(int connection) returns int { return connection }\n',
 'other.aug':'close(int connection) { pass }\n',
},async(root,checked)=>{
 const pages=diagrams(checked);await validMermaid(pages);
 const startup=pages.find(page=>page.path===join(root,'main.aug.diagrams.md')).text.split('### Startup\n')[1];
 assert.equal((startup.match(/participant p\d+ as database\n/g)??[]).length,1);
 assert.equal((startup.match(/participant p\d+ as other\n/g)??[]).length,1);
 assert.match(startup,/p0->>p1: open\(\)/);assert.match(startup,/p0->>p1: execute\(connection=connection\)/);
 assert.match(startup,/p1-->>p0: connection: int/);assert.match(startup,/p1-->>p0: rows: int/);
 assert.match(startup,/: close\(connection=connection\)/);
}));


test('short-circuit frames contain conditional calls and omit pure comparison noise',()=>project({
 'main.aug':'import check from rules\nprint(value=check(value=3))\n',
 'rules.aug':'flag() returns bool { return true }\ncheck(int value) returns int { if value < 0 or value > 10 { return 0 } if value == 3 and flag() { return 1 } return 2 }\n',
},async(root,checked)=>{
 const page=diagrams(checked).find(item=>item.path===join(root,'rules.aug.diagrams.md'));await validMermaid([page]);
 const sequence=page.text.split('### check\n')[1];
 assert.match(sequence,/alt value is negative or value is greater than 10/);assert.doesNotMatch(sequence,/opt Left is false/);
 assert.match(sequence,/opt \(value == 3\) is true\n\s+p0->>p\d+: flag\(\)/);
}));


test('nested value operations keep concise lifelines, generic results and one evaluation',()=>project({
 'main.aug':'import load from data\ntry { value = load(); print(value) } catch JsonError error { pass }\n',
 'data.aug':'record Value(int count)\nmake() returns Json { return Json(value=Value(count=7)) }\nload() returns int { decoded = make().decode<Value>(); return decoded.count }\n',
},async(root,checked)=>{
 const page=diagrams(checked).find(output=>output.path===join(root,'data.aug.diagrams.md'));await validMermaid([page]);
 const section=page.text.split('### load\n')[1].split('## Called contracts')[0];
 assert.equal((section.match(/: make\(/g)??[]).length,1);
 assert.match(section,/p0->>p0: make result.decode‹Value›\(\)/);
 assert.match(section,/p0-->>p0: decoded: Value/);
 assert.doesNotMatch(section,/participant .*make\(\)/);
}));
test('sequence splits keep each direct call beside its returned data',()=>project({
 'main.aug':'import run from work\nprint(value=run())\n',
 'work.aug':'read(int value) returns int { return value }\nrun() returns int {\n'+Array.from({length:30},(_,i)=>' value'+i+' = read(value='+i+')\n').join('')+' return value29\n}\n',
},async(root,checked)=>{
 const output=diagrams(checked).find(output=>output.path===join(root,'work.aug.diagrams.md'));await validMermaid([output]);
 const section=output.text.split('### run\n')[1];
 for(const match of section.matchAll(/```mermaid\n([\s\S]*?)\n```/g)){
  const lines=match[1].split('\n');
  for(let i=0;i<lines.length;i++)if(/p0->>p0: read\(/.test(lines[i]))assert.match(lines[i+1],/p0-->>p0: value\d+: int/);
  assert.ok((match[1].match(/^    participant /gm)??[]).length<=6);
 }
 assert.match(section,/Sequence 1 of \d+\n/);assert.doesNotMatch(section,/Sequence 1 of \d+ \(continued\)/);
}));


test('class views merge duplicate field dependencies and omit disconnected values',()=>project({
 'main.aug':'import Consumer and Fixed from objects\nconsumer = Consumer(reader=Fixed())\nprint(value=consumer.read())\n',
 'objects.aug':'interface Reader { read() returns int }\nFixed() implements Reader { read() returns int { return 7 } }\nConsumer(Reader reader) implements Reader { read() returns int { return reader.read() } }\nUnused() implements Error {}\n',
},async(root,checked)=>{
 const page=diagrams(checked).find(output=>output.path===join(root,'objects.aug.diagrams.md'));await validMermaid([page]);
 const view=page.text.split('## Class interactions\n')[1].split('## Sequences')[0];
 assert.doesNotMatch(view,/Unused/);assert.match(view,/calls read/);assert.match(view,/holds reader/);
 for(const match of view.matchAll(/```mermaid\n([\s\S]*?)\n```/g)){
  const pairs=[...match[1].matchAll(/(n\d+) -->(?:.*?) (n\d+)/g)].map(edge=>edge[1]+'>'+edge[2]);
  assert.equal(new Set(pairs).size,pairs.length,'one relationship arrow per pair');
 }
}));


test('scalar computation and empty branches keep control frames readable',()=>project({
 'main.aug':`index = 0
state = 1
while index < 4 {
    state = state * 3 + index
    index = index + 1
}
if state > 0 {} else { print(value=state) }
`,
},async(root,checked)=>{
 const page=diagrams(checked).find(output=>output.path===join(root,'main.aug.diagrams.md')).text;
 assert.match(page,/Note over p0: Set index to 0/);
 assert.doesNotMatch(page,/Set index =/);
 assert.match(page,/loop While index ‹ 4\n\s+Note over p0: Set state to state \* 3 \+ index/);
 assert.match(page,/Note over p0: Set index to index \+ 1/);
 assert.match(page,/alt state is positive\n\s+Note over p0: No operations in this branch\n\s+else otherwise/);
 for(const diagram of page.matchAll(/```mermaid\n([\s\S]*?)\n```/g))assert.doesNotMatch(diagram[1],/\n\s*(?:loop|alt|opt) [^\n]+\n\s*(?:end|else)/);
 await validMermaid(diagrams(checked));
}));


test('a calculated assignment names the already evaluated call result',()=>project({
 'values.aug':'increment(int value) returns int { return value + 1 }\n',
 'main.aug':`import increment from values
checksum = 0
checksum = checksum + increment(value=4)
print(value=checksum)
`,
},(root,checked)=>{
 const page=diagrams(checked).find(output=>output.path===join(root,'main.aug.diagrams.md')).text;
 assert.match(page,/increment\(value=4\)/);
 assert.match(page,/Set checksum to checksum \+ increment result/);
 assert.equal((page.match(/: increment\(value=4\)/g)??[]).length,1);
}));


test('repeated generation preserves checked collection order and grouped values',()=>project({
 'main.aug':'import run from probe\nprint(value=run())\n',
 'probe.aug':`get(int value) returns int { return value }
run() returns int {
    size = [get(value=1), get(value=2)].length()
    b = get(value=3) + (get(value=4) * 2)
    c = (get(value=5) + get(value=6)) * 2
    return b + c + size
}
`,
},(root,checked)=>{
 const first=generateSpecs(checked),second=generateSpecs(checked);
 assert.deepEqual(second,first,'Presentation must not mutate the checked tree or reorder evaluations');
 const page=first.find(output=>output.path===join(root,'probe.aug.diagrams.md')).text;
 assert.ok(page.indexOf(': get(value=1)')<page.indexOf(': get(value=2)'));
 assert.match(page,/Set b to get result 3 \+ get result 4 \* 2/);
 assert.match(page,/Set c to \(get result 5 \+ get result 6\) \* 2/);
}));

test('builtin errors and record copies are local values with typed results',()=>project({
 'main.aug':`import Row from rules
original = Row(value=1)
copied = original with(value=2)
try { throw ConversionError() } catch ConversionError error { print(value=copied.value) }
`,
 'rules.aug':'record Row(int value)\n',
},(root,checked)=>{
 const page=diagrams(checked).find(output=>output.path===join(root,'main.aug.diagrams.md')).text;
 assert.doesNotMatch(page,/participant p[1-9].*Row|participant p[1-9].*ConversionError/);
 assert.match(page,/p0-->>p0: copied: Row/);
 assert.match(page,/Construct Row from original with value=2/);
 assert.doesNotMatch(page,/Set copied to copied/);
 assert.match(page,/p0->>p0: ConversionError\(\)/);
}));


test('opening a branch at a split keeps all rendered steps inside the budget',()=>project({
 'main.aug':Array.from({length:24},()=> 'print(value=1)').join('\n')+'\nif true { if true { print(value=2) } }\n',
},async(root,checked)=>{
 const outputs=diagrams(checked),page=outputs.find(output=>output.path===join(root,'main.aug.diagrams.md')).text;
 const chunks=[...page.matchAll(/```mermaid\n(sequenceDiagram[\s\S]*?)\n```/g)];
 assert.equal(chunks.length,2);
 for(const chunk of chunks){
   const steps=chunk[1].split('\n').filter(line=>/Note over|->>|-->>|^-\)/.test(line));
   assert.ok(steps.length<=24,chunk[1]);
   assert.doesNotMatch(chunk[1],/\n\s*(?:loop|alt|opt) [^\n]+\n\s*end/);
 }
 assert.doesNotMatch(chunks[0][1],/alt true/);
 await validMermaid(outputs);
}));

test('a reader can recover checked failures, validation order and returned data without opening source',()=>project({
 'main.aug':'import normalize from policy\ntry { print(value=normalize(value=3).normalized) } catch Error error { pass }\n',
 'policy.aug':`record Receipt(int original, int normalized)
BadInput() implements Error {}
normalize(int value) returns Receipt unless BadInput {
    if value < 0 { throw BadInput() }
    adjusted = double(value)
    return Receipt(original=value, normalized=adjusted)
}
double(int value) returns int { return value * 2 }
`,
},async(root,checked)=>{
 const outputs=generateSpecs(checked),spec=outputs.find(page=>page.path===join(root,'policy.aug.md')).text;
 const operation=spec.split('## `normalize`')[1].split('## `double`')[0],visible=operation.split('<details>')[0];
 assert.match(visible,/Failures can raise .*BadInput/);assert.match(visible,/value.*is at least.*0/);
 assert.ok(visible.indexOf('BadInput')<visible.indexOf('double'),'failure contract and guard precede the calculation');
 assert.match(visible,/original.*value/);assert.match(visible,/normalized.*adjusted/);
 const sequence=outputs.find(page=>page.path===join(root,'policy.aug.diagrams.md')).text.split('### normalize\n')[1].split('### double\n')[0];
 assert.match(sequence,/Failures can raise .*BadInput/);assert.match(sequence,/alt value is negative/);
 assert.ok(sequence.indexOf('Raise checked failure')<sequence.indexOf(': double'));
 assert.match(sequence,/adjusted: int/);assert.match(sequence,/original=value, normalized=adjusted/);
 await validMermaid(outputs.filter(page=>page.kind==='diagram'));
}));

test('grouped boundaries retain separate witnesses for repeated identical calls',()=>project({
 'main.aug':'import touch from service\ntouch(value=7)\ntouch(value=7)\ntouch(value=7)\n',
 'service.aug':'touch(int value) { pass }\n',
},(root,checked)=>{
 const page=diagrams(checked).find(page=>page.path===join(root,'.aug-spec/diagrams/index.md')).text;
 assert.match(page,/1 operation, 3 sites/);
 const evidence=[...page.matchAll(/\[Call site\]\(([^)]*)\)/g)].map(match=>match[1]);
 assert.equal(evidence.length,3);assert.equal(new Set(evidence).size,3);
 assert.match(page,/grouped arrow records calls/);
}));

test('folder aggregation does not turn disconnected methods into one request journey',()=>project({
 'main.aug':'import entry from intake\nentry()\n',
 'intake/export.aug':'export entry from entry\n',
 'intake/entry.aug':'import receive and unrelated from services\nentry() { receive() }\n',
 'services/export.aug':'export receive from operations\nexport unrelated from operations\n',
 'services/operations.aug':'import store from storage\nreceive() { pass }\nunrelated() { store() }\n',
 'storage/export.aug':'export store from values\n',
 'storage/values.aug':'store() { pass }\n',
},(root,checked)=>{
 const pages=diagrams(checked),overview=pages.find(page=>page.path===join(root,'.aug-spec/diagrams/index.md')).text;
 assert.match(overview,/connected arrows need not belong to the same execution path/);
 assert.match(overview,/receive/);assert.match(overview,/unrelated/);assert.match(overview,/store/);
 const entry=pages.find(page=>page.path===join(root,'intake/entry.aug.diagrams.md')).text;
 assert.match(entry,/: receive/);assert.doesNotMatch(entry,/: store/);
 const receive=pages.find(page=>page.path===join(root,'services/operations.aug.diagrams.md')).text.split('### receive\n')[1].split('### unrelated\n')[0];
 assert.doesNotMatch(receive,/: store/);
}));

test('project startup and folder public surfaces are available at their reading levels',()=>project({
 ...files,
 'app/private.aug':'_hidden() returns int { return 0 }\n',
},(root,checked)=>{
 const pages=diagrams(checked),overview=pages.find(page=>page.path===join(root,'.aug-spec/diagrams/index.md')).text;
 assert.match(overview,/Where execution begins/);assert.match(overview,/It prints .*readValue/);
 const folder=pages.find(page=>page.path===join(root,'.aug-spec/diagrams/folders/app/index.md')).text;
 assert.match(folder,/What this folder exposes/);assert.match(folder,/Export the declaration .*readValue/);
 const surface=folder.split('## What this folder exposes')[1].split('## Files in this folder')[0];
 assert.doesNotMatch(surface,/_hidden/);
}));

test('detailed messages and guards retain text beyond the overview label budget',()=>project({
 'main.aug':'import check from rules\ncheck(value=1, label="'+('a meaningful input '.repeat(10))+'FINAL_INPUT")\n',
 'rules.aug':'check(int value, string label) returns string { if '+Array.from({length:12},(_,index)=>'value != '+index).join(' and ')+' { return label } return "" }\n',
},async(root,checked)=>{
 const pages=diagrams(checked);await validMermaid(pages);
 const startup=pages.find(page=>page.path===join(root,'main.aug.diagrams.md')).text;
 assert.match(startup,/FINAL_INPUT/);assert.match(startup,/<br\/>/);
 const implementation=pages.find(page=>page.path===join(root,'rules.aug.diagrams.md')).text;
 assert.match(implementation,/11/);assert.doesNotMatch(implementation.split(String.fromCharCode(96).repeat(3)+'mermaid')[1],/…/);
}));

test('boundary evidence distinguishes HTTP declarations and same-file tests from startup',()=>project({
 'main.aug':'import readValue from api\nprint(value=readValue(value=1))\n',
 'api.aug':'import twice from rules\nendpoint GET "/read" as readValue(int value from query) returns int { return twice(value) }\ntest readValue { when cases { it "doubles" { assert(twice(value=2) == 4) } } }\n',
 'rules.aug':'twice(int value) returns int { return value * 2 }\n',
},(root,checked)=>{
 const discovery=discoverTests(checked.project);assert.deepEqual(discovery.diagnostics,[]);
 const testAnalysis=checkUnitTests(checked.project,discovery.tests);assert.deepEqual(testAnalysis.flatMap(test=>test.checked.diagnostics).filter(issue=>issue.severity!=='warning'),[]);
 mergeTestAnalysis(checked,testAnalysis);
 const pages=diagrams(checked),overview=pages.find(page=>page.path===join(root,'.aug-spec/diagrams/index.md')).text;
 assert.match(overview,/HTTP requests.*Declaration.*api\.aug\.md#symbol-readValue/);
 assert.match(overview,/test readValue.*api\.aug\.md#symbol-test%20readValue/);
 assert.doesNotMatch(overview,/api\.aug\.md#startup/);
}));

test('operation synopsis keeps types, optionality and HTTP input origins with many inputs',()=>project({
 'main.aug':'import submit and Submission from api\nprint(value=submit(form=Submission(message="hello"), browser=null, origin=null, limit=1))\n',
 'api.aug':'record Submission(string message)\nendpoint POST "/submit" as submit(Submission form from form, optional string browser from cookie "browser", optional string origin from header "origin", int limit from query) returns string { return form.message }\n',
},(root,checked)=>{
 const page=diagrams(checked).find(page=>page.path===join(root,'api.aug.diagrams.md')).text.split('### submit\n')[1];
 const synopsis=page.split(String.fromCharCode(96).repeat(3)+'mermaid')[0];
 assert.match(synopsis,/Submission/);assert.match(synopsis,/optional string/);
 assert.match(synopsis,/HTTP cookie.*browser/);assert.match(synopsis,/HTTP header.*origin/);assert.match(synopsis,/HTTP query/);
}));
