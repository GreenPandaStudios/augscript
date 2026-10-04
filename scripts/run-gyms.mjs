#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {dirname,join,relative,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {generatorVersion,generateGyms,negativeContracts} from '../gyms/corpus.mjs';
import {qualificationIdentity} from './qualification-identity.mjs';
const root=resolve(import.meta.dirname,'..');
const option=(name,fallback)=>{const at=process.argv.indexOf(name);return at<0?fallback:process.argv[at+1];};
const seed=Number(option('--seed','877966')),vectors=Number(option('--vectors','256'));
const backend=option('--backend','llvm');assert.ok(['llvm','c'].includes(backend));
const profile=option('--profile','core');assert.ok(['core','full'].includes(profile));
const fixtures=generateGyms(seed,vectors),output=resolve(option('--output',join(root,'.aug-build/gyms/results.json')));
const home=join(root,'.aug-build/gyms/replays',String(seed)+'-'+vectors),cli=join(root,'bin/aug.mjs');
mkdirSync(dirname(output),{recursive:true});
const report={format:1,generatorVersion,recordedAt:new Date().toISOString(),...qualificationIdentity(root),backend,profile,seed,
  vectorsPerGenerator:vectors,evidence:'finite generated cases, rejected contracts and mutation detection; no universal proof',
  fixtures,negativeContracts,cases:[],contracts:[],mutations:[],circuits:[],status:'running'};
const save=()=>writeFileSync(output,JSON.stringify(report,null,2)+'\n');
const write=(directory,files,mode)=>{rmSync(directory,{recursive:true,force:true});mkdirSync(directory,{recursive:true});for(const [name,source]of Object.entries(files)){const path=join(directory,name);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,source);}
  writeFileSync(join(directory,'main.yaml'),'optimization: '+mode+'\nbackend: '+backend+'\n');};
const execute=(args,env={})=>spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:600000,maxBuffer:8*1024*1024,env:{...process.env,...env}});
save();
try{
  for(const fixture of fixtures)for(const mode of ['debug','release']){
    const directory=join(home,fixture.id,mode);write(directory,fixture.files,mode);
    writeFileSync(join(directory,'expected.txt'),fixture.expected);
    const environment=fixture.drops===undefined?{}:{AUG_TRACE_DROPS:'1'};
    const drops=result=>(result.stderr.match(/drop: (?:[^\n]+:)?Resource\b/g)??[]).length;
    const start=performance.now(),result=execute([cli,'run',directory,'--backend',backend],environment);
    const passed=result.status===0&&result.stdout===fixture.expected&&(fixture.drops===undefined||drops(result)===fixture.drops);
    report.cases.push({id:fixture.id,mode,vectors:fixture.vectors,source:relative(root,directory),status:passed?'passed':'failed',
      elapsedMs:performance.now()-start,exitStatus:result.status,stderr:result.stderr,actual:result.stdout,expected:fixture.expected,
      expectedDrops:fixture.drops,actualDrops:fixture.drops===undefined?undefined:drops(result)});
    save();assert.ok(passed,fixture.id+'/'+mode+': '+(result.stderr||'output differs; see '+directory));
    const mutated=directory+'-mutant';write(mutated,fixture.mutant.files,mode);
    const broken=execute([cli,'run',mutated,'--backend',backend],environment);
    assert.ok(!broken.error&&!broken.signal&&broken.status===0,'A bounded behavioral mutant must still compile and run safely; '+(broken.stderr||broken.error?.message));
    const detected=broken.status!==0||broken.stdout!==fixture.expected||(fixture.drops!==undefined&&drops(broken)!==fixture.drops);
    report.mutations.push({id:fixture.id,mode,reason:fixture.mutant.reason,status:detected?'detected':'survived',
      exitStatus:broken.status,stderr:broken.stderr,actual:broken.stdout,source:relative(root,mutated)});
    save();assert.ok(detected,fixture.id+'/'+mode+': deliberate fault survived the independent oracle');
    console.log(fixture.id+'/'+mode+': '+fixture.vectors+' vectors; mutation detected');
  }
  for(const contract of negativeContracts){
    const directory=join(home,'rejected',contract.id);write(directory,contract.files,'debug');
    const result=execute([cli,'check',directory,'--json']);
    assert.ok(!result.error&&!result.signal,'Contract check failed by infrastructure error');
    const diagnostics=JSON.parse(result.stdout).map(issue=>({...issue,file:relative(root,issue.file)})),errors=diagnostics.filter(issue=>issue.severity!=='warning');
    const rejected=result.status!==0&&errors.some(issue=>new RegExp(contract.pattern,'i').test(issue.message));
    report.contracts.push({id:contract.id,status:rejected?'rejected':'failed',diagnostics,source:relative(root,directory)});
    save();assert.ok(rejected,contract.id+': forbidden operation was not rejected for the required reason');
  }
  if(profile==='full'){
    if(backend==='llvm')assert.ok(process.env.AUG_LLVM_HOME,'Full LLVM gyms require a matching maintainer tool pack');
    const circuits=[
      ['source-mutations',['--test','tests/robustness.test.mjs']],
      ['ownership-concurrency',['--test','tests/language-conformance.test.mjs','tests/concurrency.test.mjs','tests/runtime-optimization.test.mjs']],
      ['native-boundaries',['--test','tests/llvm-native-boundaries.test.mjs']],
      ['package-integrity',['--test','tests/native-packages.test.mjs','tests/native-bindings.test.mjs','tests/native-artifacts.test.mjs','tests/native-source-identity.test.mjs']],
      ['http-boundaries',['--test','tests/http-head-runtime.test.mjs','tests/web-policies.test.mjs','tests/web-streams.test.mjs','tests/web-tls.test.mjs']],
      ['sanitizers',['scripts/sanitize-core.mjs','--backend',backend]],
    ];
    for(const [id,args]of circuits){
      const tested=args[0]==='--test'?['--test','--test-reporter=tap',...args.slice(1)]:args;
      const start=performance.now(),result=execute(tested,{AUG_TEST_BACKEND:backend}),passed=result.status===0;
      const log=join(home,id+'.log');writeFileSync(log,result.stdout+'\n'+result.stderr);
      const totals=Object.fromEntries([...result.stdout.matchAll(/^# (tests|pass|fail|skipped) (\d+)$/gm)].map(match=>[match[1],Number(match[2])]));
      report.circuits.push({id,status:passed?'passed':'failed',command:['node',...tested],elapsedMs:performance.now()-start,log:relative(root,log),totals});
      save();assert.ok(passed,id+': '+(result.error?.message||'see '+log));
    }
  }
  assert.equal(qualificationIdentity(root).sourceSha256,report.sourceSha256,'Compiler or exercise sources changed during qualification; rerun against one revision');
  report.status='passed';
}catch(error){report.status='failed';report.failure=error.message;process.exitCode=1;console.error(error.message);}
save();console.log('Gym report: '+output);
