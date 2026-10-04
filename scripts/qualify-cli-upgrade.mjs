#!/usr/bin/env node
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,readdirSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {baselineArtifact,distributionInputs} from './distribution-baseline.mjs';
const args=process.argv.slice(2);assert.ok(args.every(arg=>arg==='--local-compiler'),'Use --local-compiler for an unpublished compiler pack');
const root=resolve(import.meta.dirname,'..'),release=join(root,'dist/release');
mkdirSync(join(root,'.aug-build'),{recursive:true});const directory=mkdtempSync(join(root,'.aug-build/cli-upgrade-'));
const host=process.platform+'-'+process.arch,output=join(root,`.aug-build/cli-upgrade-qualification-${host}.json`);
const evidence={format:1,host,baseline:distributionInputs.baseline.compiler,passed:false,checks:[]};let stage='candidate archives';
try{
const packages=JSON.parse(readFileSync(join(release,'packages.json'))),candidate=packages.find(pkg=>pkg.directory==='cli');assert.ok(candidate);
evidence.candidate=candidate.version;evidence.candidateExpectedSha256=candidate.sha256;
for(const pkg of packages){
  const actual=createHash('sha256').update(readFileSync(join(release,pkg.filename))).digest('hex');
  if(pkg===candidate)evidence.candidateArtifactSha256=actual;
  assert.equal(actual,pkg.sha256,'Candidate npm archive differs from its reviewed hash: '+pkg.filename);
}
stage='published baseline download';
const baseline=await baselineArtifact('cli',root),prefix=join(directory,'prefix'),npmCache=join(directory,'npm-cache'),project=join(directory,'app');
const run=(command,args,env=process.env)=>{const result=spawnSync(command,args,{encoding:'utf8',timeout:240000,env});assert.equal(result.status,0,`${command} ${args.join(' ')}\n${result.stderr}\n${result.stdout}`);return result.stdout;};
const npmEnv={...process.env,npm_config_cache:npmCache};
stage='baseline npm install';
run('npm',['install','--global','--prefix',prefix,'--ignore-scripts','--no-audit','--no-fund',baseline],npmEnv);
const cli=join(prefix,'bin/aug'),cliRoot=join(prefix,'lib/node_modules/@greenpandastudios/aug-cli');assert.ok(existsSync(cli));
const env={...process.env,PATH:'/nonexistent',SDKROOT:'/nonexistent',DEVELOPER_DIR:'/nonexistent',AUG_PACKAGE_CACHE:join(directory,'source-cache'),AUG_NATIVE_ARTIFACT_CACHE:join(directory,'artifact-cache')};
for(const key of ['AUG_GIT','AUG_LLVM_HOME','AUG_RUNTIME_PACK','AUG_NATIVE_HOME'])delete env[key];
const aug=(...args)=>run(process.execPath,[cli,...args],env);
stage='baseline LLVM execution';
assert.equal(aug('--version').trim(),distributionInputs.baseline.compiler);aug('init',project);assert.equal(aug('run',project),'Hello, August!\n');evidence.checks.push('baseline LLVM execution');
const sourceFiles=readdirSync(project).filter(name=>name.endsWith('.aug')||['AGENTS.md','main.yaml'].includes(name)),sources=Object.fromEntries(sourceFiles.map(name=>[name,readFileSync(join(project,name),'utf8')]));
const before=JSON.parse(readFileSync(join(project,'aug.lock.json')));
stage='candidate npm install';
// Install the exact candidate archives, rather than selecting a registry tag.
run('npm',['install','--global','--prefix',prefix,'--ignore-scripts','--no-audit','--no-fund',...packages.map(pkg=>join(release,pkg.filename))],npmEnv);
assert.equal(aug('--version').trim(),candidate.version);assert.ok(existsSync(join(cliRoot,'src/distribution.js')),'Candidate JavaScript did not replace the released compiler');
evidence.checks.push('candidate npm install');stage='candidate compiler preparation';
if(process.argv.includes('--local-compiler')){
  const installed=await import(pathToFileURL(join(cliRoot,'src/compiler-packs.js'))),pins=JSON.parse(readFileSync(join(cliRoot,'native/compiler-packs.json'))),pack=pins.packs.find(pack=>pack.host===process.platform+'-'+process.arch);assert.ok(pack);
  const archive=join(root,'.aug-build',new URL(pack.archive.url).pathname.split('/').at(-1));assert.ok(existsSync(archive),'Exact candidate compiler pack is missing');
  const originalFetch=globalThis.fetch,originalCache=process.env.AUG_NATIVE_ARTIFACT_CACHE,originalHome=process.env.AUG_LLVM_HOME,originalRuntime=process.env.AUG_RUNTIME_PACK;
  process.env.AUG_NATIVE_ARTIFACT_CACHE=env.AUG_NATIVE_ARTIFACT_CACHE;delete process.env.AUG_LLVM_HOME;delete process.env.AUG_RUNTIME_PACK;
  globalThis.fetch=async(input,options)=>String(input)===pack.archive.url?new Response(readFileSync(archive)):originalFetch(input,options);
  try{await installed.prepareLLVMCompiler();}finally{globalThis.fetch=originalFetch;for(const [key,value] of [['AUG_NATIVE_ARTIFACT_CACHE',originalCache],['AUG_LLVM_HOME',originalHome],['AUG_RUNTIME_PACK',originalRuntime]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
}
stage='existing project lock and LLVM execution';
aug('install',project,'--offline');assert.equal(aug('run',project),'Hello, August!\n');
assert.equal(JSON.parse(aug('test',project,'--json')).passed,1);aug('spec',project);aug('spec',project,'--check');
const setup=JSON.parse(aug('doctor',project,'--json'));assert.equal(setup.ready,true);assert.ok(setup.checks.some(check=>check.id==='compiler-pack'&&check.status==='ok'));
for(const [name,source] of Object.entries(sources))assert.equal(readFileSync(join(project,name),'utf8'),source,'An upgrade changed application source');
evidence.checks.push('LLVM execution, tests, specs, doctor and source preservation');stage='frozen offline execution';
const locked=readFileSync(join(project,'aug.lock.json'),'utf8'),after=JSON.parse(locked);assert.equal(after.compiler,candidate.version);
assert.equal(aug('run',project,'--offline','--frozen'),'Hello, August!\n');assert.equal(readFileSync(join(project,'aug.lock.json'),'utf8'),locked);
evidence.checks.push('frozen offline execution');stage='source error recovery';
const original=readFileSync(join(project,'main.aug'),'utf8');writeFileSync(join(project,'main.aug'),original.replace('name="August"','name=42'));
const rejected=spawnSync(process.execPath,[cli,'check',project],{env,encoding:'utf8'});assert.equal(rejected.status,1);assert.match(rejected.stderr,/main\.aug:\d+:\d+:/);assert.match(rejected.stderr,/help:/);assert.match(rejected.stderr,/\^/);writeFileSync(join(project,'main.aug'),original);
const report={format:1,host:process.platform+'-'+process.arch,baseline:distributionInputs.baseline.compiler,candidate:candidate.version,mode:candidate.version===distributionInputs.baseline.compiler?'candidate-reinstall':'version-upgrade',
  baselineArtifactSha256:distributionInputs.baseline.sha256[`greenpandastudios-aug-cli-${distributionInputs.baseline.compiler}.tgz`],candidateArtifactSha256:candidate.sha256,candidateCompilerTransport:process.argv.includes('--local-compiler')?'verified-local-candidate':'public-download',
  sourcePreserved:true,backend:'llvm',nativeToolsOnPath:false,frozenOffline:true,testPassed:true,sourceDiagnostic:true,baselineLockCompiler:before.compiler,candidateLockCompiler:after.compiler};
Object.assign(evidence,report,{passed:true});evidence.checks.push('source diagnostics');
}catch(error){evidence.failedStage=stage;evidence.failure=error.message;process.exitCode=1;console.error(error.stack??error);}
finally{writeFileSync(output,JSON.stringify(evidence,null,2)+'\n');if(evidence.passed)rmSync(directory,{recursive:true,force:true});else console.error('Failed CLI fixture retained: '+directory);}
console.log((evidence.passed?'CLI distribution qualification passed: ':'CLI distribution qualification failed: ')+output);
