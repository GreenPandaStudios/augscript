import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync,symlinkSync,chmodSync,statSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from './compiler-process.mjs';
import {planChangeRename,planChangeRenameSymbol,applyChangePlan,recoverSourceChanges} from '../src/checked-changes.ts';
import {coherentSourceRead,sourceImage,publishSourceChange,withSourceWriter} from '../src/source-transactions.ts';
import {checkedProjectWithTests} from '../src/refactoring.ts';

const cli=resolve('bin/aug.mjs');
const files={
    'main.aug':'import double from math\nquantity=4\nprint(value=double(quantity))\n',
    'math/export.aug':'export double from numbers\n',
    'math/numbers.aug':'double(int quantity):\n    // quantity stays in this comment.\n    text="quantity"\n    return quantity * 2\n\ntest double:\n    when numbers:\n        it "keeps the calculation":\n            assertEqual(actual=double(quantity=3), expected=6)\n',
    'other.aug':'double(int quantity):\n    return quantity\n',
    'main.yaml':'block_style: indent\n'
};
function fixture(run) {
    const root=mkdtempSync(join(tmpdir(),'aug-changes-'));
    try {
        for(const [name,source] of Object.entries(files)){mkdirSync(dirname(join(root,name)),{recursive:true});writeFileSync(join(root,name),source);}
        const value=run(root);if(value&&typeof value.then==='function')return value.finally(()=>rmSync(root,{recursive:true,force:true}));
        rmSync(root,{recursive:true,force:true});return value;
    }catch(error){rmSync(root,{recursive:true,force:true});throw error;}
}
const plan=root=>planChangeRename(root,'math/numbers.aug',files['math/numbers.aug'].indexOf('quantity'),'amount');
const snapshot=root=>Object.fromEntries(Object.keys(files).map(file=>[file,readFileSync(join(root,file),'utf8')]));
const command=(root,args)=>spawnSync(process.execPath,[cli,'change',...args,root],{encoding:'utf8'});

test('a saved rename plan is relative, checked, reviewable and behavior evidence stays separate',()=>fixture(root=>{
    const before=snapshot(root),proposed=plan(root);
    assert.equal(proposed.format,1);assert.equal(proposed.operation,'rename');
    assert.match(proposed.baseRevision,/^[a-f0-9]{64}$/);
    assert.ok(proposed.edits.every(edit=>!edit.file.startsWith('/')));
    assert.ok(proposed.edits.some(edit=>edit.file==='main.aug'&&edit.text==='amount=quantity'));
    assert.ok(proposed.publicDelta.length>0);
    assert.equal(proposed.behavioralEvidence,'not-run');
    assert.deepEqual(snapshot(root),before);
    const accepted=applyChangePlan(root,proposed);
    assert.equal(accepted.status,'committed');assert.equal(accepted.behavioralEvidence,'not-run');
    assert.notEqual(accepted.revision,proposed.baseRevision);
    assert.match(readFileSync(join(root,'math/numbers.aug'),'utf8'),/double\(int amount\)/);
    assert.match(readFileSync(join(root,'math/numbers.aug'),'utf8'),/comment/);
    assert.match(readFileSync(join(root,'math/numbers.aug'),'utf8'),/text="quantity"/);
    assert.equal(readFileSync(join(root,'other.aug'),'utf8'),files['other.aug']);
    assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
    for(const backend of ['c','llvm']) {
        const run=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8'});
        assert.equal(run.status,0,run.stderr);assert.equal(run.stdout,'8\n');
        const tests=spawnSync(process.execPath,[cli,'test',root,'--backend',backend,'--json'],{encoding:'utf8'});
        assert.equal(tests.status,0,tests.stderr);assert.equal(JSON.parse(tests.stdout).passed,1);
    }
}));

test('source, config, dependency and new caller staleness reject before any accepted writes',()=>{
    for(const [name,change] of [
        ['source',root=>writeFileSync(join(root,'other.aug'),files['other.aug']+'\n')],
        ['config',root=>writeFileSync(join(root,'main.yaml'),files['main.yaml']+'# revision\n')],
        ['dependency',root=>writeFileSync(join(root,'aug.lock.json'),'{}')],
        ['caller',root=>writeFileSync(join(root,'new.aug'),'import double from math\nread():\n    return double(quantity=9)\n')]
    ]) fixture(root=>{const proposed=plan(root);change(root);const before=snapshot(root);assert.throws(()=>applyChangePlan(root,proposed),/STALE|revision|check/i,name);assert.deepEqual(snapshot(root),before);assert.equal(existsSync(join(root,'.aug-changes/pending.json')),false);});
});

test('editing plan operations, scope, edits or expected public deltas cannot bypass rechecking',()=>fixture(root=>{
    const proposed=plan(root),before=snapshot(root);
    for(const alteration of [
        {...proposed,edits:[]},
        {...proposed,scope:['main.aug']},
        {...proposed,publicDelta:[]},
        {...proposed,operation:'replace-body'},
        {...proposed,file:'../outside.aug'},
        {...proposed,offset:-1},
        {...proposed,checked:false}
    ]) assert.throws(()=>applyChangePlan(root,alteration),/CHANGE|plan|scope|delta|operation/i);
    assert.deepEqual(snapshot(root),before);
}));

test('failed writes restore the source while readers reject an unfinished revision',()=>fixture(root=>{
    const proposed=plan(root),before=snapshot(root);let sawReader=false;
    assert.throws(()=>applyChangePlan(root,proposed,{checkpoint(event){if(event.phase==='written'){
        assert.throws(()=>checkedProjectWithTests(root,new Map()),/CHANGE_IN_PROGRESS/);sawReader=true;throw new Error('injected process failure');
    }}}),/injected process failure/);
    assert.equal(sawReader,true);assert.deepEqual(snapshot(root),before);
    assert.equal(recoverSourceChanges(root).status,'clean');
    assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
}));

test('a coherent source reader detects a complete concurrent commit instead of mixing revisions',()=>fixture(root=>{
    const proposed=plan(root);
    assert.throws(()=>coherentSourceRead(root,()=>{applyChangePlan(root,proposed);return snapshot(root);}),/CHANGE_STALE_READ/);
    assert.doesNotThrow(()=>coherentSourceRead(root,()=>snapshot(root)));
}));

test('source edits retain modes and reject symlinked metadata, source parents and forged journals',()=>fixture(root=>{
    chmodSync(join(root,'math/numbers.aug'),0o640);
    applyChangePlan(root,plan(root));assert.equal(statSync(join(root,'math/numbers.aug')).mode&0o777,0o640);
    const bad=mkdtempSync(join(tmpdir(),'aug-foreign-change-'));
    try {
        fixture(project=>{symlinkSync(bad,join(project,'.aug-changes'),'dir');assert.throws(()=>applyChangePlan(project,plan(project)),/symlink|regular|metadata|CHANGE/i);});
        fixture(project=>{const source=join(project,'math/numbers.aug');rmSync(source);writeFileSync(join(bad,'numbers.aug'),files['math/numbers.aug']);symlinkSync(join(bad,'numbers.aug'),source);assert.throws(()=>applyChangePlan(project,plan(project)),/symlink|regular|CHANGE/i);});
        fixture(project=>{mkdirSync(join(project,'.aug-changes'));writeFileSync(join(project,'.aug-changes/pending.json'),JSON.stringify({format:1,files:[{file:'../outside.aug'}]}));assert.throws(()=>recoverSourceChanges(project),/CHANGE|journal/i);assert.equal(existsSync(join(project,'.aug-changes/pending.json')),true);});
    } finally {rmSync(bad,{recursive:true,force:true});}
}));

test('public CLI emits a plan, accepts it once and gives actionable stale and recovery diagnostics',()=>fixture(root=>{
    const output=join(root,'rename.json');
    const proposed=command(root,['plan-rename','--file','math/numbers.aug','--offset',String(files['math/numbers.aug'].indexOf('quantity')),'--name','amount','--out',output]);
    assert.equal(proposed.status,0,proposed.stderr);assert.ok(existsSync(output));
    const accepted=command(root,['apply','--plan',output,'--json']);assert.equal(accepted.status,0,accepted.stderr);assert.equal(JSON.parse(accepted.stdout).status,'committed');
    const repeated=command(root,['apply','--plan',output]);assert.notEqual(repeated.status,0);assert.match(repeated.stderr,/STALE|revision/i);
    const recovery=command(root,['recover','--json']);assert.equal(recovery.status,0,recovery.stderr);assert.equal(JSON.parse(recovery.stdout).status,'clean');
}));

const changesModule=new URL('../src/checked-changes.ts',import.meta.url).href;
const crash=(root,phase)=>{
    const input=join(root,'crash-plan.json');writeFileSync(input,JSON.stringify(plan(root)));
    const script=`import {readFileSync} from 'node:fs';import {applyChangePlan} from ${JSON.stringify(changesModule)};
    const [root,input,phase]=process.argv.slice(1);applyChangePlan(root,JSON.parse(readFileSync(input,'utf8')),{checkpoint(event){if(event.phase===phase)process.kill(process.pid,'SIGKILL');}});`;
    const result=spawnSync(process.execPath,['--input-type=module','-e',script,root,input,phase],{encoding:'utf8',timeout:20000});
    assert.equal(result.signal,'SIGKILL',result.stdout+result.stderr);
};

test('process death recovers prepared multi-file changes backward and committed changes forward',()=>{
    for(const phase of ['prepared','written','committed'])fixture(root=>{
        const before=snapshot(root);crash(root,phase);
        assert.equal(existsSync(join(root,'.aug-changes/pending.json')),true);
        assert.throws(()=>checkedProjectWithTests(root,new Map()),/CHANGE_IN_PROGRESS/);
        const report=recoverSourceChanges(root);
        assert.equal(report.status,phase==='committed'?'completed':'rolled-back');
        assert.equal(existsSync(join(root,'.aug-changes/pending.json')),false);
        if(phase==='committed')assert.match(readFileSync(join(root,'math/numbers.aug'),'utf8'),/double\(int amount\)/);
        else assert.deepEqual(snapshot(root),before);
        assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
        assert.equal(recoverSourceChanges(root).status,'clean');
    });
});

test('recovery preserves all source on an external conflict and succeeds after deliberate reconciliation',()=>fixture(root=>{
    const before=snapshot(root);crash(root,'written');
    writeFileSync(join(root,'math/numbers.aug'),files['math/numbers.aug']+'// unrelated editor change\n');
    const conflicted=snapshot(root);
    assert.throws(()=>recoverSourceChanges(root),/CHANGE_RECOVERY_CONFLICT/);
    assert.deepEqual(snapshot(root),conflicted);
    assert.equal(existsSync(join(root,'.aug-changes/pending.json')),true);
    writeFileSync(join(root,'math/numbers.aug'),files['math/numbers.aug']);
    assert.equal(recoverSourceChanges(root).status,'rolled-back');assert.deepEqual(snapshot(root),before);
}));

test('a metadata or out-of-scope edit during publication rejects the candidate and preserves that external edit',()=>fixture(root=>{
    const proposed=plan(root),before=snapshot(root);let changed=false;
    assert.throws(()=>applyChangePlan(root,proposed,{checkpoint(event){if(event.phase==='written'&&!changed){changed=true;writeFileSync(join(root,'main.yaml'),files['main.yaml']+'# external configuration revision\n');}}}),/CHANGE_STALE/);
    const after=snapshot(root);assert.equal(after['main.yaml'],files['main.yaml']+'# external configuration revision\n');
    for(const file of Object.keys(files).filter(file=>file!=='main.yaml'))assert.equal(after[file],before[file]);
    assert.equal(recoverSourceChanges(root).status,'clean');
}));

test('an interruption after the durable commit point reports acceptance and retains forward recovery',()=>fixture(root=>{
    assert.throws(()=>applyChangePlan(root,plan(root),{checkpoint(event){if(event.phase==='committed')throw new Error('cleanup interrupted');}}),/CHANGE_COMMITTED_RECOVERY_REQUIRED/);
    assert.match(readFileSync(join(root,'math/numbers.aug'),'utf8'),/double\(int amount\)/);
    assert.equal(recoverSourceChanges(root).status,'completed');
    assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
}));

function running(args){
    const child=spawn(process.execPath,args,{timeout:20000});let stdout='',stderr='';
    child.stdout.on('data',data=>stdout+=data);child.stderr.on('data',data=>stderr+=data);
    return {child,done:new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',(status,signal)=>resolve({status,signal,stdout,stderr}));})};
}
async function waitFile(path){const end=Date.now()+10000;while(!existsSync(path)){if(Date.now()>end)throw new Error('writer never reached its gate');await new Promise(resolve=>setTimeout(resolve,20));}}

test('competing processes serialize source writers and reject the stale loser; read-only tools block pending images',()=>fixture(async root=>{
    const input=join(root,'shared-plan.json'),ready=join(root,'writer-ready');writeFileSync(input,JSON.stringify(plan(root)));
    const script=`import {readFileSync,writeFileSync} from 'node:fs';import {applyChangePlan} from ${JSON.stringify(changesModule)};
      const [root,input,ready]=process.argv.slice(1);applyChangePlan(root,JSON.parse(readFileSync(input,'utf8')),{checkpoint(event){if(event.phase==='prepared'){writeFileSync(ready,'ready');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,1000);}}});`;
    const winner=running(['--input-type=module','-e',script,root,input,ready]);
    try {
        await waitFile(ready);
        const read=spawnSync(process.execPath,[cli,'check',root],{encoding:'utf8',timeout:10000});assert.notEqual(read.status,0);assert.match(read.stderr,/CHANGE_IN_PROGRESS/);
        const loser=running([cli,'change','apply',root,'--plan',input,'--json']);
        const [accepted,rejected]=await Promise.all([winner.done,loser.done]);
        assert.equal(accepted.status,0,accepted.stderr);assert.equal(rejected.status,1,rejected.stderr);
        assert.equal(JSON.parse(rejected.stdout).code,'CHANGE_STALE');
        assert.equal(existsSync(join(root,'.aug-change-lock')),false);
        assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
    }finally{if(winner.child.exitCode===null)winner.child.kill();}
}));

test('reviewed candidate and original preimages reject changes in the check-to-publication windows',()=>{
    for(const [phase,file,text] of [
        ['validated','main.yaml',files['main.yaml']+'optimization: release\n'],
        ['validated','other.aug',files['other.aug']+'// outside the edit scope\n'],
        ['candidate-checked','math/numbers.aug',files['math/numbers.aug']+'// new edit must survive\n']
    ])fixture(root=>{
        const proposed=plan(root);let changed=false;
        assert.throws(()=>applyChangePlan(root,proposed,{checkpoint(event){if(event.phase===phase&&!changed){changed=true;writeFileSync(join(root,file),text);}}}),/CHANGE_STALE/);
        assert.equal(changed,true);assert.equal(readFileSync(join(root,file),'utf8'),text);
        assert.equal(existsSync(join(root,'.aug-changes/pending.json')),false);
        for(const other of Object.keys(files).filter(other=>other!==file))assert.equal(readFileSync(join(root,other),'utf8'),files[other]);
    });
});

test('recovery bounds and path restrictions reject before creating an unfinished journal',()=>fixture(root=>{
    const before=snapshot(root),image=sourceImage(root,'main.aug',files['main.aug']+'\n');
    assert.throws(()=>sourceImage(root,'main.aug','a'.repeat(16*1024*1024+1)),/limit|bounded|postimage/i);
    assert.throws(()=>withSourceWriter(root,()=>publishSourceChange(root,Array(4097).fill(image),'a'.repeat(64),'b'.repeat(64),()=>{})),/CHANGE_JOURNAL/);
    assert.throws(()=>withSourceWriter(root,()=>publishSourceChange(root,[{...image,after:'a'.repeat(16*1024*1024+1)}],'a'.repeat(64),'b'.repeat(64),()=>{})),/CHANGE_JOURNAL/);
    assert.throws(()=>withSourceWriter(root,()=>publishSourceChange(root,[image,image],'a'.repeat(64),'b'.repeat(64),()=>{})),/CHANGE_JOURNAL/);
    assert.equal(existsSync(join(root,'.aug-changes/pending.json')),false);assert.deepEqual(snapshot(root),before);
    const external=mkdtempSync(join(tmpdir(),'aug-external-lock-'));
    try {symlinkSync(external,join(root,'.aug-change-lock'),'dir');assert.throws(()=>withSourceWriter(root,()=>{}),/symlink/);assert.deepEqual(snapshot(root),before);}
    finally {rmSync(external,{recursive:true,force:true});}
}));

test('named selectors resolve functions and public labels through the same checked occurrence planner',()=>fixture(root=>{
    const selected=planChangeRenameSymbol(root,'math/numbers.aug','double.quantity','amount');assert.deepEqual(selected,plan(root));
    const renameFunction=planChangeRenameSymbol(root,'math/numbers.aug','double','twice');assert.ok(renameFunction.edits.some(edit=>edit.file==='math/export.aug'));
    assert.throws(()=>planChangeRenameSymbol(root,'math/numbers.aug','double.missing','amount'),/public input label/);
    assert.throws(()=>planChangeRenameSymbol(root,'math/numbers.aug','double.quantity.extra','amount'),/Select FUNCTION/);
}));

test('an installed package main.yaml change is a stale dependency even with unchanged August and accepted lock bytes',()=>fixture(root=>{
    const library=join(root,'.library');mkdirSync(join(library,'src'),{recursive:true});
    writeFileSync(join(library,'aug-package.json'),JSON.stringify({format:1,name:'@fixture/data',version:'0.1.0',compiler:'0.23.0',source:'src'}));
    writeFileSync(join(library,'src/export.aug'),'export Value from data\n');writeFileSync(join(library,'src/data.aug'),'record Value(int amount)\n');
    writeFileSync(join(root,'main.yaml'),files['main.yaml']+'packages:\n    data: ./.library\n');
    const install=spawnSync(process.execPath,[cli,'install',root],{encoding:'utf8'});assert.equal(install.status,0,install.stderr);
    const proposed=plan(root),lock=readFileSync(join(root,'aug.lock.json'),'utf8'),entry=JSON.parse(lock).packages[0];
    const installed=join(root,'.aug-packages',entry.path,'main.yaml');writeFileSync(installed,'# physical metadata changed\n');
    const before=snapshot(root);assert.throws(()=>applyChangePlan(root,proposed),/CHANGE_STALE/);assert.deepEqual(snapshot(root),before);
    assert.equal(readFileSync(join(root,'aug.lock.json'),'utf8'),lock);
    assert.ok(proposed.dependencyMetadata.some(item=>item.file==='package/@fixture/data@0.1.0/main.yaml'));
}));

test('public application and library starters ignore revision state, recovery journals, locks and staged files',()=>{
    for(const library of [false,true]){
        const container=mkdtempSync(join(tmpdir(),'aug-change-starter-')),root=join(container,'project');
        try {
            const init=spawnSync(process.execPath,[cli,...(library?['package','init']:['init']),root],{encoding:'utf8'});assert.equal(init.status,0,init.stderr);
            const file=library?'src/arithmetic.aug':'greeting.aug',symbol=library?'add.left':'greet.name';
            const selected=planChangeRenameSymbol(root,file,symbol,'input');applyChangePlan(root,selected);
            const git=process.env.AUG_GIT??'git';assert.equal(spawnSync(git,['init',root],{encoding:'utf8'}).status,0);
            for(const path of ['.aug-changes/revision','.aug-changes/pending.json','.aug-change-lock/owner-test','.aug-write-staged']){
                const ignored=spawnSync(git,['-C',root,'check-ignore',path],{encoding:'utf8'});assert.equal(ignored.status,0,path+': '+ignored.stderr);
            }
            const status=spawnSync(git,['-C',root,'status','--porcelain'],{encoding:'utf8'});assert.equal(status.status,0,status.stderr);assert.doesNotMatch(status.stdout,/aug-changes|aug-change-lock|aug-write/);
        }finally{rmSync(container,{recursive:true,force:true});}
    }
});

test('JSON errors distinguish a committed revision requiring cleanup from rejection',()=>fixture(root=>{
    const input=join(root,'commit-plan.json');writeFileSync(input,JSON.stringify(plan(root)));
    const script=`import fs from 'node:fs';import {syncBuiltinESMExports} from 'node:module';
      const rename=fs.renameSync;let failed=false;fs.renameSync=(from,to)=>{const commit=String(to).endsWith('/pending.json')&&fs.readFileSync(from,'utf8').includes('"state":"committed"');rename(from,to);if(commit&&!failed){failed=true;throw new Error('post-commit sync failure');}};syncBuiltinESMExports();
      const {main}=await import(${JSON.stringify(new URL('../src/cli.ts',import.meta.url).href)});process.exitCode=await main(['change','apply',process.argv[1],'--plan',process.argv[2],'--json']);`;
    const result=spawnSync(process.execPath,['--input-type=module','-e',script,root,input],{encoding:'utf8',timeout:20000});
    assert.equal(result.status,1,result.stderr);const report=JSON.parse(result.stdout);
    assert.equal(report.status,'committed');assert.equal(report.checked,true);assert.equal(report.recovery,'required');assert.match(report.revision,/^[a-f0-9]{64}$/);
    assert.equal(report.behavioralEvidence,'not-run');assert.equal(recoverSourceChanges(root).status,'completed');
    assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
}));


test('publication reserves the longer committed journal state before any source write',()=>fixture(root=>{
    const images=[sourceImage(root,'main.aug',''),sourceImage(root,'other.aug','')];
    const journal={format:1,id:'00000000-0000-0000-0000-000000000000',state:'prepared',baseRevision:'a'.repeat(64),revision:'b'.repeat(64),files:images};
    const limit=64*1024*1024,overhead=Buffer.byteLength(JSON.stringify(journal)+'\n'),first=16*1024*1024;
    const remaining=limit-overhead-first*2;
    images[0].after='"'.repeat(first);images[1].after='"'.repeat(Math.floor(remaining/2))+(remaining%2?'a':'');
    for(const image of images){assert.ok(Buffer.byteLength(image.after)<=16*1024*1024);image.afterSha256=createHash('sha256').update(image.after).digest('hex');}
    assert.equal(Buffer.byteLength(JSON.stringify(journal)+'\n'),limit);
    assert.equal(Buffer.byteLength(JSON.stringify({...journal,state:'committed'})+'\n'),limit+1);
    const before=snapshot(root);
    assert.throws(()=>withSourceWriter(root,()=>publishSourceChange(root,images,journal.baseRevision,journal.revision,()=>{})),/64 MiB recovery limit/);
    assert.deepEqual(snapshot(root),before);assert.equal(existsSync(join(root,'.aug-changes/pending.json')),false);
}));

test('input rename changes only its attached Javadoc label tokens',()=>fixture(root=>{
    const file='math/numbers.aug',source='/** quantity in prose. @param quantity The quantity.\n * @returns The quantity.\n */\n'+files[file];
    writeFileSync(join(root,file),source);
    const proposed=planChangeRenameSymbol(root,file,'double.quantity','amount');
    assert.ok(proposed.edits.some(edit=>edit.file===file&&source.slice(edit.start,edit.end)==='quantity'&&edit.start<source.indexOf('double(')));
    applyChangePlan(root,proposed);
    const after=readFileSync(join(root,file),'utf8');
    assert.match(after,/quantity in prose\. @param amount The quantity\./);
    assert.match(after,/@returns The quantity\./);assert.match(after,/text="quantity"/);
    assert.deepEqual(checkedProjectWithTests(root,new Map()).diagnostics,[]);
}));
