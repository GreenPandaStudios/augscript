import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {performance} from 'node:perf_hooks';
const root=mkdtempSync(join(tmpdir(),'aug-cache-timing-')),project=join(root,'project');mkdirSync(project);
try{
 writeFileSync(join(project,'main.aug'),'');
 writeFileSync(join(project,'main.yaml'),'optimization: release\n');
 writeFileSync(join(project,'numbers.aug'),`calculate(int value) { int index = 0; int sum = 0; while index < 1000 { sum = sum + value; index = index + 1 } return sum }
test calculate { when independent { it checks for (input, expected) in [${Array.from({length:16},(_,i)=>`(${i}, ${i*1000})`).join(', ')}] { assert(calculate(value=input) == expected) } } }
`);
 const cli=resolve('bin/aug.mjs'),env={...process.env,AUG_COMPILATION_CACHE:join(root,'cache')};
 const run=(args)=>{const start=performance.now(),result=spawnSync(process.execPath,[cli,'test',project,'--backend','llvm','--json',...args],{encoding:'utf8',env});if(result.status!==0)throw new Error(result.stderr+result.stdout);const report=JSON.parse(result.stdout);if(report.passed!==16||report.failed!==0)throw new Error('All sixteen independent rows must pass');return {milliseconds:performance.now()-start,passed:report.passed,cache:report.tests.map(item=>item.compilation.cache)};};
 const cold=run([]),warm=[],rebuild=[];if(cold.cache.some(value=>value!=='miss'))throw new Error('This benchmark requires a qualified compiler tool pack and reusable test profile');
 for(let round=0;round<3;round++){rebuild.push(run(['--rebuild']));warm.push(run([]));}
 console.log(JSON.stringify({host:process.platform+'-'+process.arch,compiler:JSON.parse(readFileSync('package.json','utf8')).version,backend:'llvm',mode:'release',cases:16,toolchain:process.env.AUG_LLVM_HOME?'verified contributor tool-pack override':'compiler-owned pack',cold,rebuild,warm},null,2));
}finally{rmSync(root,{recursive:true,force:true});}
