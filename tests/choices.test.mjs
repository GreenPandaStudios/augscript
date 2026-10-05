import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from './compiler-process.mjs';
import {SemanticWorkspace} from '../src/semantic.ts';
import {publicContract} from '../src/public-contracts.ts';
import {contractFacts} from '../src/contract-facts.ts';
import {checkProject} from '../src/checker.ts';
import {loadProject} from '../src/project.ts';

const model=`/** A delivery finishes with one of these two immutable records. */
choice Delivery from Delivered and Failed
record Delivered(string receipt)
record Failed(string reason)
describe(Delivery delivery):
    return match delivery {
        when Delivered delivered { delivered.receipt }
        when Failed failed { failed.reason }
    }
`;
function fixture(files,run){const root=mkdtempSync(join(tmpdir(),'aug-choices-'));try{for(const [name,text] of Object.entries(files)){mkdirSync(dirname(join(root,name)),{recursive:true});writeFileSync(join(root,name),text);}return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
const command=(root,args)=>spawnSync(process.execPath,['bin/aug.mjs',...args,root,'--offline'],{encoding:'utf8',timeout:30000});
const project=main=>({'main.aug':main,'model.aug':model});

for(const backend of ['c','llvm'])test('closed record choices retain exact payloads and exhaustive result matches ('+backend+')',()=>fixture(project(`import Delivery and Delivered and Failed and describe from model
Delivery sent = Delivered(receipt="receipt-42")
Delivery rejected = Failed(reason="not available")
print(value=describe(delivery=sent))
print(value=describe(delivery=rejected))
`),root=>{const result=command(root,['run','--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'receipt-42\nnot available\n');}));

for(const backend of ['c','llvm'])test('choice records remain data in collections, nested records, callbacks and copied workers ('+backend+')',()=>fixture({...project(`import Delivery and Delivered and Failed and describe and Envelope and unchanged from model
import transform and Transformation from august.collections
List<Delivery> deliveries = [Delivered(receipt="r"), Failed(reason="f")]
Transformation<Delivery, string> render = (Delivery value) => describe(delivery=value)
texts = transform(values=deliveries, transformation=render)
print(value=texts.join(separator=","))
try {
Envelope envelope = Envelope(delivery=deliveries[0])
scope {
    task = start worker unchanged(delivery=envelope.delivery)
    copied = wait for task
    print(value=describe(delivery=copied))
}
} catch IndexError error { print(value="unexpected index error") } catch ConcurrencyError error { print(value="unexpected worker error") }
`),'model.aug':model+'record Envelope(Delivery delivery)\nunchanged(Delivery delivery) returns Delivery:\n    return delivery\n'},root=>{const result=command(root,['run','--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'r,f\nr\n');}));

for(const backend of ['c','llvm'])test('optional choices require null plus every record or a general some case ('+backend+')',()=>fixture({...project(`import render and Delivered and Failed from model
print(value=render(delivery=null))
print(value=render(delivery=Delivered(receipt="r")))
print(value=render(delivery=Failed(reason="f")))
`),'model.aug':model+`render(optional Delivery delivery):
    return match delivery {
        when null { "missing" }
        when Delivered sent { sent.receipt }
        when Failed rejected { rejected.reason }
    }
`},root=>{const result=command(root,['run','--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'missing\nr\nf\n');}));

test('invalid alternatives and incomplete choices fail with checked source diagnostics',()=>{
    for(const [source,pattern] of [
        ['choice Delivery from Delivered\nrecord Delivered()\n',/at least two/i],
        ['choice Delivery from Delivered and Delivered\nrecord Delivered()\n',/distinct|repeated/i],
        ['choice Delivery from Delivered and int\nrecord Delivered()\n',/concrete.*record/i],
        ['choice Delivery from Delivered and optional Failed\nrecord Delivered()\nrecord Failed()\n',/concrete.*record/i],
        ['choice Delivery from Delivered and Box<int>\nrecord Delivered()\nrecord Box<T implements Data>(T value)\n',/non-generic.*record|concrete.*record/i],
        [model.replace('        when Failed failed { failed.reason }\n',''),/incomplete.*Failed|Failed.*incomplete/i],
        [model+'Other() implements Delivery:\n    pass\n',/choice.*cannot.*implement|implement.*choice/i],
        [model+'interface Open extends Delivery:\n    pass\n',/choice.*cannot.*inherit|inherit.*choice/i],
        [model+'read(Delivery delivery):\n    return delivery.receipt\n',/match.*choice|choice.*match/i],
        [model+'erase<T implements optional Delivery>(T item) returns Data:\n    return item\n',/non-null choice bound/i],
        [model+'make():\n    return Delivery()\n',/choice.*constructor|construct.*alternative/i],
        [model+'read(Json value):\n    return value.decode<Delivery>()\n',/JSON|concrete data/i],
        [model+'renderOptional<T implements optional Delivery>(T item):\n    return match item { when Delivered sent { sent.receipt } when Failed rejected { rejected.reason } }\n',/non-null choice bound/i],
    ])fixture({'main.aug':'','model.aug':source},root=>{const result=command(root,['check']);assert.notEqual(result.status,0,source);assert.match(result.stderr,pattern);});
});

test('choice is contextual and formatting, hover, contracts and specs expose the finite alternatives',()=>fixture(project('import choice from other\nprint(value=choice(value=4))\n'),root=>{
    writeFileSync(join(root,'other.aug'),'choice(int value):\n    return value\n');
    const result=command(root,['check']);assert.equal(result.status,0,result.stderr);
    const view=new SemanticWorkspace(root).document(join(root,'model.aug'),undefined,true);
    assert.deepEqual(view.diagnostics,[]);
    const hover=view.hover(model.indexOf('Delivery'));assert.match(JSON.stringify(hover),/choice Delivery from Delivered and Failed/);
    const selected=view.graph().symbols.find(symbol=>symbol.name==='Delivery');assert.equal(selected.kind,'choice');
    const checked=checkProject(loadProject(root)),facts=contractFacts(checked),fact=facts.find(fact=>fact.name==='Delivery');
    const contract=publicContract(checked,fact);assert.equal(contract.kind,'choice');assert.equal(contract.alternativeTypes.length,2);
    assert.ok(contract.alternativeTypes.every(type=>type.id.includes('model.aug:')));
    const spec=command(root,['spec']);assert.equal(spec.status,0,spec.stderr);assert.match(readFileSync(join(root,'model.aug.md'),'utf8'),/Delivered.*Failed/);
    for(const block_style of ['indent','braces'])for(const indentation of ['spaces','tabs'])for(const assignment of ['equals','to']){
        writeFileSync(join(root,'main.yaml'),`block_style: ${block_style}\nindentation: ${indentation}\nassignment: ${assignment}\n`);
        const formatted=command(root,['format']);assert.equal(formatted.status,0,formatted.stderr);
        const checked=command(root,['check']);assert.equal(checked.status,0,checked.stderr);
    }
}));


for(const backend of ['c','llvm'])test('choice bounds retain constructor validation, exact errors, captures and same-file cases ('+backend+')',()=>fixture({
    'main.aug':`import Delivery and Delivered and Failed and through and validate and render from model
Delivery snapshot = Delivered(receipt="kept")
import Predicate from august.collections
Predicate<int> captured = (int value) => render(delivery=snapshot) == "kept"
snapshot = Failed(reason="changed")
print(value=captured.accepts(value=1))
print(value=through<Delivered>(delivery=Delivered(receipt="bound")))
try { validate(receipt="") } catch InvalidReceipt failure { print(value="rejected") }
`,
    'model.aug':model+`error InvalidReceipt()
record ValidReceipt(string receipt) unless InvalidReceipt:
    initialize:
        if receipt == "":
            throw InvalidReceipt()
choice CheckedDelivery from ValidReceipt and Failed
validate(string receipt) returns CheckedDelivery:
    return ValidReceipt(receipt)
through<T implements Delivery>(T delivery):
    return describe(delivery)
render(Delivery delivery):
    return describe(delivery)
test describe:
    when messages:
        it retains_payload:
            assertEqual(actual=describe(delivery=Delivered(receipt="test")), expected="test")
`,
},root=>{
    // The checked error is an ordinary explicit import; the choice does not grant visibility.
    writeFileSync(join(root,'main.aug'),readFileSync(join(root,'main.aug'),'utf8').replace('import Delivery and','import InvalidReceipt and Delivery and'));
    const run=command(root,['run','--backend',backend]);assert.equal(run.status,0,run.stderr);assert.equal(run.stdout,'true\nbound\nrejected\n');
    const cases=command(root,['test','--backend',backend,'--json']);assert.equal(cases.status,0,cases.stderr);assert.equal(JSON.parse(cases.stdout).passed,1);
}));

test('membership, exhaustiveness and public contracts retain nominal identities across folders',()=>fixture({
    'main.aug':'import describe from model\nimport makeForeign from foreign\nprint(value=describe(delivery=makeForeign()))\n',
    'model.aug':model,
    'foreign/export.aug':'export makeForeign from data\n',
    'foreign/data.aug':'record Delivered(string receipt)\nrecord Failed(string reason)\nchoice ForeignDelivery from Delivered and Failed\nmakeForeign() returns ForeignDelivery:\n    return Delivered(receipt="foreign")\n'
},root=>{
    const result=command(root,['check']);assert.notEqual(result.status,0);assert.match(result.stderr,/Delivery|ForeignDelivery/);
    writeFileSync(join(root,'main.aug'),'');
    const checked=checkProject(loadProject(root)),facts=contractFacts(checked),local=facts.find(fact=>fact.name==='Delivery'),foreign=facts.find(fact=>fact.name==='ForeignDelivery');
    assert.deepEqual(checked.diagnostics,[]);
    const a=publicContract(checked,local),b=publicContract(checked,foreign);
    assert.notDeepEqual(a.alternativeTypes,b.alternativeTypes);
    assert.ok(a.alternativeTypes.every(type=>type.id.startsWith('model.aug:')));
    assert.ok(b.alternativeTypes.every(type=>type.id.startsWith('foreign/data.aug:')));
    const view=new SemanticWorkspace(root).document(join(root,'model.aug'),undefined,true),report=view.describe({name:'Delivery',context:true,budget:100000});
    assert.ok(report.contracts.some(fact=>fact.name==='Delivered'));assert.ok(report.contracts.some(fact=>fact.name==='Failed'));
    assert.equal(report.coverage.mandatory,'complete');
    const colors=view.tokens();assert.ok(colors.some(token=>token.line===1&&token.type==='keyword'));assert.ok(colors.some(token=>token.line===1&&token.type==='type'));
    const renamed=model.replace('choice Delivery from Delivered and Failed','choice Delivery from Delivered and Failed and Delayed')+'record Delayed(int seconds)\n';
    writeFileSync(join(root,'model.aug'),renamed);
    const incomplete=command(root,['check']);assert.notEqual(incomplete.status,0);assert.match(incomplete.stderr,/incomplete.*Delayed/);
}));


test('contextual choice names retain typed bindings and ordinary function help; nearby types complete',()=>fixture({
    'main.aug':'import choice from data\nchoice result = choice(amount=7)\nprint(value=result.amount)\n',
    'data.aug':'record choice(int amount)\n',
    'model.aug':model,
    'other.aug':'choice(int value):\n    return value\n',
},root=>{
    const result=command(root,['check']);assert.equal(result.status,0,result.stderr);
    const workspace=new SemanticWorkspace(root),functions=workspace.document(join(root,'other.aug'),undefined,true);
    assert.equal(functions.hover(0).kind,'function');assert.match(functions.hover(0).detail,/choice\(int value\)/);
    writeFileSync(join(root,'main.aug'),'import choice from other\nprint(value=choice(value=4))\n');
    const calls=new SemanticWorkspace(root).document(join(root,'main.aug'),undefined,true);
    assert.equal(calls.hover('import choice from other\nprint(value=choice(value=4))\n'.indexOf('choice(value=')).kind,'function');
    writeFileSync(join(root,'main.aug'),'import ');
    const imports=new SemanticWorkspace(root).document(join(root,'main.aug'),undefined,true).complete(7);
    assert.ok(imports.some(item=>item.label==='Delivery'&&item.detail==='import Delivery from model'));
}));

for(const backend of ['c','llvm'])test('choice-bounded generics keep immutable fields, capture snapshots and exhaustive matches ('+backend+')',()=>fixture({
    'main.aug':`import Delivery and Delivered and Failed and Box and render and capture and optionalRender from model
captured = capture(item=Delivered(receipt="kept"))
print(value=captured.accepts(value=1))
print(value=render(item=Box(value=Delivered(receipt="boxed"))))
print(value=render(item=Box(value=Failed(reason="failed"))))
print(value=optionalRender<Delivery>(item=null))
`,
    'model.aug':model+`import Predicate from august.collections
record Box<T implements Delivery>(T value)
render<T implements Delivery>(Box<T> item):
    return match item.value:
        when Delivered sent:
            sent.receipt
        when Failed rejected:
            rejected.reason
capture<T implements Delivery>(T item) returns Predicate<int>:
    return (int value) => item == item
optionalRender<T implements Delivery>(optional T item):
    return match item:
        when null:
            "absent"
        when Delivered sent:
            sent.receipt
        when Failed rejected:
            rejected.reason
`,
},root=>{const result=command(root,['run','--backend',backend]);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'true\nboxed\nfailed\nabsent\n');}));
