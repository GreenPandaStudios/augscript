import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {generateSpecs,updateSpecs} from '../src/spec.ts';
import {specHint} from '../src/spec-hints.ts';
import {action,flow,planFlow,renderSpecTree,section} from '../src/spec-tree.ts';
const source=`/** Calculate the total charge. */
charge(int price = 7, int quantity = 3, optional string note = null, bool enabled = true):
    if not enabled:
        return 0
    total = price * quantity
    if note == null:
        return total
    return total + 1
`;
function fixture(body){const root=mkdtempSync(join(tmpdir(),'aug-spec-view-'));try{
 writeFileSync(join(root,'main.aug'),'import charge from prices\nprint(value=charge())\n');
 writeFileSync(join(root,'prices.aug'),source);return body(root);
}finally{rmSync(root,{recursive:true,force:true});}}
test('the spec makes complete input contracts visible beside behavior',()=>fixture(root=>{
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 const text=generateSpecs(checked).find(output=>output.path===join(root,'prices.aug.md')).text;
 assert.match(text,/<details>\n<summary>Checked interface<\/summary>/);
 const details=text.match(/<details>[\s\S]*?<\/details>/)[0];
 assert.match(details,/charge\(int price = 7, int quantity = 3, optional string note = null, bool enabled = true\) returns int/);
 assert.match(details,/when omitted/);
 const visible=text.replace(/<details>[\s\S]*?<\/details>/g,'');
 assert.match(visible,/Calculate the total charge/);assert.match(visible,/price.*integer.*when omitted, `7`/);assert.match(visible,/quantity.*integer.*when omitted, `3`/);
 assert.match(visible,/note.*optional string.*when omitted, null/);assert.match(visible,/enabled.*boolean.*when omitted, `true`/);assert.match(visible,/If not \(`enabled`\)/);
 assert.match(visible,/`price` times `quantity`/);assert.match(visible,/`note` is null/);
}));
test('every behavior paragraph links to its source span and carries the source digest after pointers',()=>fixture(root=>{
 const checked=checkProject(loadProject(root)),file=checked.project.files.get(join(root,'prices.aug'));
 const expected=createHash('sha256').update(specHint(file).text).digest('hex');
 const text=generateSpecs(checked).find(output=>output.path===join(root,'prices.aug.md')).text;
 assert.match(text,new RegExp('source-sha256='+expected));
 const paragraphs=text.replace(/<details>[\s\S]*?<\/details>/g,'').split('\n\n').filter(part=>/It (?:returns|sets)|If /.test(part));
 assert.ok(paragraphs.length>=1);for(const paragraph of paragraphs)assert.match(paragraph,/\[source\]\(prices\.aug#L\d+(?:-L\d+)?\)/);
 updateSpecs(checked);assert.deepEqual(updateSpecs(checkProject(loadProject(root)),true).stale,[]);
 const old=readFileSync(join(root,'prices.aug'),'utf8');writeFileSync(join(root,'prices.aug'),old.replace('total + 1','total + 2'));
 const drift=updateSpecs(checkProject(loadProject(root)),true);assert.ok(drift.stale.includes('prices.aug.md'));
}));
test('sentence planning assigns every source fact to exactly one ordered paragraph',()=>{
 const nodes=Array.from({length:12},(_,i)=>({...action('call','`operation'+i+'`'),source:'fact-'+i}));
 const plan=planFlow(nodes);assert.deepEqual(plan.paragraphSources.flat(),nodes.map(node=>node.source));
 assert.equal(plan.paragraphSources.length,plan.paragraphs.length);
 const links=Object.fromEntries(nodes.map((node,i)=>[node.source,{path:'code.aug',line:i+1,endLine:i+1}]));
 const text=renderSpecTree(section('Example',1,[flow(nodes,links)]));
 assert.equal((text.match(/\[source\]/g)??[]).length,plan.paragraphs.length);
 assert.match(text,/code\.aug#L1-L4/);assert.match(text,/code\.aug#L9-L12/);
});

test('concise optional inputs retain the actual omitted default',()=>fixture(root=>{
 writeFileSync(join(root,'prices.aug'),'charge(optional string note = "August") { return note }\n');
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 const text=generateSpecs(checked).find(output=>output.path===join(root,'prices.aug.md')).text;
 const visible=text.replace(/<details>[\s\S]*?<\/details>/g,'');
 assert.doesNotMatch(visible,/Omitted optional inputs.*null/);assert.match(text,/when omitted, `"August"`/);
}));

test('indentation links stop at the last source token before the next declaration',()=>fixture(root=>{
 writeFileSync(join(root,'main.aug'),'import charge from prices\ntry { charge() } catch ArithmeticError error { pass }\n');
 writeFileSync(join(root,'prices.aug'),'charge(int x = 1):\n    if x < 0:\n        throw ArithmeticError()\n\n/** Unrelated operation. */\nother():\n    return 7\n');
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 const text=generateSpecs(checked).find(output=>output.path===join(root,'prices.aug.md')).text;
 const guard=text.split('## `other`')[0];assert.match(guard,/\[source\]\(prices\.aug#L3-L4\)/);assert.doesNotMatch(guard,/#L3-L7/);
}));
test('empty match cases keep a controlling source link in every behavioral paragraph',()=>fixture(root=>{
 writeFileSync(join(root,'prices.aug'),'charge(int x = 1) { match x { when 0 {} when 1 {} when 2 {} when 3 {} when 4 {} when 5 {} else {} } }\n');
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 const text=generateSpecs(checked).find(output=>output.path===join(root,'prices.aug.md')).text.replace(/<details>[\s\S]*?<\/details>/g,'');
 const paragraphs=text.split('\n\n').filter(part=>/If `x`|Otherwise/.test(part));assert.ok(paragraphs.length>1);
 for(const paragraph of paragraphs)assert.match(paragraph,/\[source\]\(prices\.aug#L2\)/);
}));

test('multiple explanatory nodes from one statement retain paragraph navigation',()=>fixture(root=>{
 writeFileSync(join(root,'prices.aug'),'charge() { freeze ['+JSON.stringify(Array(115).fill('word').join(' '))+'] as frozen }\n');
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 const text=generateSpecs(checked).find(output=>output.path===join(root,'prices.aug.md')).text;
 assert.match(text,/The immutable value is shared without copying it\. \[source\]\(prices\.aug#L2\)/);
}));
