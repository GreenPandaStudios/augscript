import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from './compiler-process.mjs';
import {prepareLibraryFixtures} from './library-fixtures.mjs';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {contractFacts,SemanticWorkspace} from '../src/semantic.ts';
const compiler=new URL('../bin/aug.mjs',import.meta.url).pathname;
function project(files,action){const root=mkdtempSync(join(tmpdir(),'aug-retry-policy-'));try{for(const [name,source] of Object.entries(files))writeFileSync(join(root,name),source);prepareLibraryFixtures(root);return action(root);}finally{rmSync(root,{recursive:true,force:true});}}
function run(source,backend){return project({'main.aug':source},root=>spawnSync(process.execPath,[compiler,'run',root,'--backend',backend,'--offline'],{encoding:'utf8',timeout:90000}));}
function clean(result,expected){assert.equal(result.status,0,result.stderr||result.error?.message);assert.equal(result.stdout,expected);}
for(const backend of ['c','llvm'])test('retry policy preserves explicit delay order and stops after the final attempt ('+backend+')',()=>{
 clean(run(`import Duration and RetryPolicy and retryDelay from august.values
try:
    once = RetryPolicy(maxAttempts=1, delays=[])
    print(value=retryDelay(policy=once, failedAttempt=1) == null)
    policy = RetryPolicy(maxAttempts=5, delays=[Duration(milliseconds=0), Duration(milliseconds=1000), Duration(milliseconds=1000), Duration(milliseconds=250)])
    print(value=policy.maxAttempts)
    for attempt in [1, 2, 3, 4, 5]:
        match retryDelay(policy, failedAttempt=attempt):
            when some delay:
                print(value=delay.milliseconds)
            when null:
                print(value="finished")
catch ConversionError failure:
    print(value="unexpected")
`,backend),'true\n5\n0\n1000\n1000\n250\nfinished\n');
});
for(const backend of ['c','llvm'])test('retry policies check complete attempt and duration boundaries without overflow ('+backend+')',()=>{
 const accepted=[];
 for(let attempts=1;attempts<=64;attempts++){
  const delays=Array.from({length:attempts-1},(_,i)=>[0,1,604800000,250,250][i%5]);
  accepted.push({attempts,delays});
 }
 const cases=[
  [-9223372036854775808n,[]],[0,[]],[65,Array(64).fill(0)],[9223372036854775807n,[]],
  [1,[0]],[2,[]],[3,[0]],[2,[0,0]],
  [2,[-9223372036854775808n]],[2,[-1]],[2,[604800001]],[2,[9223372036854775807n]]
 ];
 const source='import Duration and RetryPolicy and retryDelay from august.values\n'+accepted.map(({attempts,delays})=>`try:
    policy = RetryPolicy(maxAttempts=${attempts}, delays=[${delays.map(n=>'Duration(milliseconds='+n+')').join(', ')}])
    attempt = 1
    while attempt <= policy.maxAttempts:
        match retryDelay(policy, failedAttempt=attempt):
            when some delay:
                print(value=delay.milliseconds)
            when null:
                print(value="finished")
        attempt = attempt + 1
catch ConversionError failure:
    print(value="unexpected")
`).join('')+cases.map(([attempts,delays])=>`try:
    RetryPolicy(maxAttempts=${attempts}, delays=[${delays.map(n=>'Duration(milliseconds='+n+')').join(', ')}])
    print(value="accepted invalid policy")
catch ConversionError failure:
    print(value="invalid policy")
`).join('')+`try:
    policy = RetryPolicy(maxAttempts=2, delays=[Duration(milliseconds=1)])
    for attempt in [-9223372036854775808, -1, 0, 3, 9223372036854775807]:
        try:
            retryDelay(policy, failedAttempt=attempt)
            print(value="accepted invalid attempt")
        catch ConversionError failure:
            print(value="invalid attempt")
catch ConversionError failure:
    print(value="unexpected")
`;
 const expected=accepted.flatMap(row=>[...row.delays.map(String),'finished']).concat(cases.map(()=> 'invalid policy'),Array(5).fill('invalid attempt')).join('\n')+'\n';
 clean(run(source,backend),expected);
});

test('policy fields require deep immutable delay data and cannot be mutated through surviving aliases',()=>{
 for(const source of [
  'delays = [Duration(milliseconds=1)]\ntry { RetryPolicy(maxAttempts=2, delays) } catch ConversionError failure { pass }\n',
  'try { policy = RetryPolicy(maxAttempts=2, delays=[Duration(milliseconds=1)]); delays = policy.delays; borrow delays { delays.append(value=Duration(milliseconds=2)) } } catch ConversionError failure { pass }\n',
  'delays = [Duration(milliseconds=1)]\nfreeze delays as saved\ntry { policy = RetryPolicy(maxAttempts=2, delays=saved); borrow delays { delays.append(value=Duration(milliseconds=2)) } } catch ConversionError failure { pass }\n'
 ])project({'main.aug':'import Duration and RetryPolicy from august.values\n'+source},root=>{
  const result=spawnSync(process.execPath,[compiler,'check',root,'--json'],{encoding:'utf8'});
  assert.equal(result.status,1,result.stderr||result.stdout);assert.match(result.stdout,/immutable|freez|read.only/i);
 });
});
for(const backend of ['c','llvm'])test('copying and JSON decoding recheck policy invariants and preserve original delays ('+backend+')',()=>{
 const invalid=[{maxAttempts:0,delays:[]},{maxAttempts:2,delays:[]},{maxAttempts:2,delays:[{milliseconds:-1}]},{maxAttempts:2,delays:[{milliseconds:604800001}]}];
 const shape=[{}, {maxAttempts:2,delays:null},{maxAttempts:2,delays:[{milliseconds:'1'}]},{maxAttempts:1,delays:[],extra:true}];
 const quoted=JSON.stringify;
 clean(run(`import Duration and RetryPolicy and retryDelay from august.values
import parse from json
try:
    delays = [Duration(milliseconds=10), Duration(milliseconds=20)]
    freeze delays as saved
    original = RetryPolicy(maxAttempts=3, delays=saved)
    copy = original with (maxAttempts=2, delays=[Duration(milliseconds=0)])
    for delay in original.delays:
        print(value=delay.milliseconds)
    print(value=copy.maxAttempts)
    match retryDelay(policy=copy, failedAttempt=1):
        when some delay:
            print(value=delay.milliseconds)
        when null:
            print(value="unexpected end")
    try:
        discarded = original with (maxAttempts=2)
        print(value="accepted mismatched copy")
    catch ConversionError failure:
        print(value="copy count rejected")
    try:
        discarded = copy with (delays=[Duration(milliseconds=-1)])
        print(value="accepted invalid copy")
    catch ConversionError failure:
        print(value="copy delay rejected")
    input = parse(input=${quoted('{"maxAttempts":3,"delays":[{"milliseconds":0},{"milliseconds":604800000}]}')})
    decoded = parse(input=input.stringify()).decode<RetryPolicy>()
    for delay in decoded.delays:
        print(value=delay.milliseconds)
    print(value=retryDelay(policy=decoded, failedAttempt=3) == null)
    once = parse(input=${quoted('{"maxAttempts":1,"delays":[]}')}).decode<RetryPolicy>()
    print(value=retryDelay(policy=once, failedAttempt=1) == null)
    for text in [${invalid.map(value=>quoted(JSON.stringify(value))).join(', ')}]:
        try:
            parse(input=text).decode<RetryPolicy>()
            print(value="accepted invalid decoded policy")
        catch ConversionError failure:
            print(value="domain rejected")
    for text in [${shape.map(value=>quoted(JSON.stringify(value))).join(', ')}]:
        try:
            parse(input=text).decode<RetryPolicy>()
            print(value="accepted invalid shape")
        catch JsonError failure:
            print(value="shape rejected")
catch Error failure:
    print(value="unexpected")
`,backend),'10\n20\n2\n0\ncopy count rejected\ncopy delay rejected\n0\n604800000\ntrue\ntrue\n'+Array(4).fill('domain rejected\n').join('')+Array(4).fill('shape rejected\n').join(''));
});
for(const backend of ['c','llvm'])test('workers receive and return copied retry data and preserve checked validation failures ('+backend+')',()=>project({
 'operations.aug':`import Duration and RetryPolicy and retryDelay from august.values
copy(RetryPolicy policy):
    match retryDelay(policy, failedAttempt=2):
        when some delay:
            return policy with (maxAttempts=2, delays=[delay])
        when null:
            return policy
reject(RetryPolicy policy):
    return policy with (maxAttempts=0)
`,
 'main.aug':`import Duration and RetryPolicy and retryDelay from august.values
import copy and reject from operations
try:
    original = RetryPolicy(maxAttempts=3, delays=[Duration(milliseconds=10), Duration(milliseconds=20)])
    copied = original
    scope:
        pending = start worker copy(policy=original)
        copied = wait for pending
    print(value=copied.maxAttempts)
    match retryDelay(policy=copied, failedAttempt=1):
        when some delay:
            print(value=delay.milliseconds)
        when null:
            print(value="unexpected end")
    for delay in original.delays:
        print(value=delay.milliseconds)
    try:
        scope:
            bad = start worker reject(policy=original)
            wait for bad
    catch ConversionError failure:
        print(value="worker validation rejected")
catch Error failure:
    print(value="unexpected")
`
},root=>clean(spawnSync(process.execPath,[compiler,'run',root,'--backend',backend,'--offline'],{encoding:'utf8',timeout:90000}),'2\n20\n10\n20\nworker validation rejected\n')));
test('semantic context and editor help expose the complete pure retry contract',()=>project({
 'main.aug':'import Duration and RetryPolicy and retryDelay from august.values\ntry { policy = RetryPolicy(maxAttempts=2, delays=[Duration(milliseconds=10)]); retryDelay(policy, failedAttempt=1) } catch ConversionError failure { pass }\n'
},root=>{
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 const facts=contractFacts(checked),policy=facts.find(fact=>fact.name==='RetryPolicy'),lookup=facts.find(fact=>fact.name==='retryDelay');
 assert.ok(policy);assert.ok(lookup);assert.equal(policy.kind,'record');
 assert.equal(policy.fields.find(field=>field.label==='delays').type,'immutable List<Duration>');
 for(const callable of [policy.callables[0],lookup.callables[0]]){
  assert.deepEqual(callable.errors,['ConversionError']);assert.deepEqual(callable.capabilities,[]);assert.deepEqual(callable.changes,[]);
 }
 assert.equal(lookup.callables[0].result,'optional Duration');
 const file=join(root,'main.aug'),view=new SemanticWorkspace(root).document(file,undefined,true);
 const hover=view.hover(view.source.indexOf('RetryPolicy(maxAttempts='));assert.match(hover.documentation,/604800000/);assert.match(hover.documentation,/ConversionError/);assert.match(hover.documentation,/64/);
 writeFileSync(file,'import RetryPolicy from august.values\npolicy = RetryPolicy(maxAttempts=1, delays=[])\n');
 const rejected=spawnSync(process.execPath,[compiler,'check',root,'--json'],{encoding:'utf8'});assert.equal(rejected.status,1);assert.match(rejected.stdout,/ConversionError/);
}));
