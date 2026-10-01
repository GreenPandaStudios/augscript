#!/usr/bin/env node
/* Cold consumer qualification: installed JavaScript, real GitHub source and
   native artifacts. --local-compiler substitutes only unpublished compiler
   transport; library downloads always use their public release URLs. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {release as osRelease} from 'node:os';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const root=resolve(import.meta.dirname,'..');
const localCompiler=process.argv.includes('--local-compiler');
const release=join(root,'dist/release');
const packages=JSON.parse(readFileSync(join(release,'packages.json')));
const cliPackage=packages.find(p=>p.directory==='cli');
assert.ok(cliPackage,'Build npm archives before consumer qualification.');
const archive=join(release,cliPackage.filename);
assert.equal(createHash('sha256').update(readFileSync(archive)).digest('hex'),cliPackage.sha256);
const directory=mkdtempSync(join(root,'.aug-build/native-consumers-'));
writeFileSync(join(directory,'package.json'),JSON.stringify({name:'aug-native-consumer-qualification',private:true,type:'module'})+'\n');
const run=(command,args,options={})=>{
  const result=spawnSync(command,args,{cwd:directory,encoding:'utf8',timeout:240000,...options});
  assert.equal(result.status,0,`${command} ${args.join(' ')}\n${result.error?.message??''}\n${result.stderr}\n${result.stdout}`);
  return result.stdout;
};
// Install the same release's standard library archives before npm publication.
// npm still resolves production third-party dependencies from an empty cache.
run('npm',['install','--ignore-scripts','--no-audit','--no-fund',...packages.map(p=>join(release,p.filename))],
  {env:{...process.env,npm_config_cache:join(directory,'npm-cache')}});
const cliRoot=join(directory,'node_modules/@greenpandastudios/aug-cli');
const cli=join(cliRoot,'bin/aug.mjs');
assert.ok(existsSync(join(cliRoot,'src/git-http.js')),'Installed compiler must contain JavaScript GitHub transport.');
const env={...process.env,PATH:'/nonexistent',SDKROOT:'/nonexistent',DEVELOPER_DIR:'/nonexistent',
  AUG_PACKAGE_CACHE:join(directory,'source-cache'),AUG_NATIVE_ARTIFACT_CACHE:join(directory,'artifact-cache')};
for(const key of ['AUG_GIT','AUG_LLVM_HOME','AUG_RUNTIME_PACK','AUG_NATIVE_HOME'])delete env[key];
const aug=(...args)=>run(process.execPath,[cli,...args],{env});
assert.equal(aug('--version').trim(),cliPackage.version);
const tools=JSON.parse(readFileSync(join(cliRoot,'native/compiler-packs.json')));
if(localCompiler){
  // Populate the fresh cache using the installed verifier. No compiler override
  // is available to the child CLI, which must validate the pinned archive.
  const installed=await import(pathToFileURL(join(cliRoot,'src/compiler-packs.js')));
  const originalFetch=globalThis.fetch,originalCache=process.env.AUG_NATIVE_ARTIFACT_CACHE;
  const originalHome=process.env.AUG_LLVM_HOME,originalRuntime=process.env.AUG_RUNTIME_PACK;
  process.env.AUG_NATIVE_ARTIFACT_CACHE=env.AUG_NATIVE_ARTIFACT_CACHE;
  delete process.env.AUG_LLVM_HOME;delete process.env.AUG_RUNTIME_PACK;
  globalThis.fetch=async(input,options)=>String(input)===tools.packs[0].archive.url
    ?new Response(readFileSync(join(root,'.aug-build/aug-llvm-macos-arm64.tar.gz'))):originalFetch(input,options);
  try{await installed.prepareLLVMCompiler();}
  finally{
    globalThis.fetch=originalFetch;
    for(const [key,value] of [['AUG_NATIVE_ARTIFACT_CACHE',originalCache],['AUG_LLVM_HOME',originalHome],['AUG_RUNTIME_PACK',originalRuntime]]){
      if(value===undefined)delete process.env[key];else process.env[key]=value;
    }
  }
}
const cases=[
  {name:'pytorch',commit:'d4d137a9ad03a5c234d2c6e143321e62051be7a4',sha256:'653ec32caa109930ede229ffa5e483018b5e41bea8e95d8115aee3c6df1c7f80',expected:'5\n7\n9\n21\n',source:`import Tensor and TensorError and tensor and add and sum and values from REPOSITORY
try:
    own Tensor left = tensor(values=[1.0, 2.0, 3.0])
    own Tensor right = tensor(values=[4.0, 5.0, 6.0])
    own Tensor result = add(left, right)
    List<float> output = values(tensor=result)
    for item in output:
        print(value=item)
    print(value=sum(tensor=result))
catch TensorError error:
    print(value=error.message)
`},
  {name:'sqlite',version:'0.1.2',commit:'9065377d9adf991be89952adaea5217688169b9e',sha256:'c79b70da65fefd610d9741d8f989d2909dacbb4a34238eb1a20de9494c422e03',expected:'August\n',source:`import Database and SqliteError and openMemory and execute and queryScalar from REPOSITORY
try:
    own Database database = openMemory()
    borrow database:
        execute(database, sql="CREATE TABLE users (name TEXT NOT NULL)", parameters=[])
        execute(database, sql="INSERT INTO users (name) VALUES (?)", parameters=["August"])
    print(value=queryScalar(database, sql="SELECT name FROM users", parameters=[]))
catch SqliteError error:
    print(value=error.message)
`},
  {name:'zlib',commit:'e503658a401f354926f1c064c8cd9c879f4f856a',sha256:'95a3bd643d09d98605bc25eccc7f53b06fc8e79f305db67012995111110e5389',expected:'The world runs on language\n',source:`import CompressionError and compress and decompress from REPOSITORY
try:
    Bytes input = "The world runs on language".bytes()
    Bytes compressed = compress(input)
    Bytes restored = decompress(input=compressed, maximumOutput=4096)
    print(value=restored.text())
catch CompressionError error:
    print(value=error.message)
catch ConversionError error:
    print(value="Invalid UTF-8")
`},
  {name:'blake3',commit:'4b741b97e04f7f507d9b7a8c3a4b05dde92978ce',sha256:'0b754540be9cc091e8ccd0d64fae9960f6ac72b89b84bfaaa016eb36237e07a4',expected:'6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85\n',source:`import HashError and hash from REPOSITORY
try:
    Bytes input = "abc".bytes()
    print(value=hash(input))
catch HashError error:
    print(value=error.message)
`}
];
const outcomes=[];
for(const fixture of cases){
  const project=join(directory,fixture.name);mkdirSync(project);
  const repository=`https://github.com/GreenPandaStudios/aug-${fixture.name}#v${fixture.version??'0.1.1'}`;
  writeFileSync(join(project,'main.aug'),fixture.source.replace('REPOSITORY',JSON.stringify(repository)));
  assert.equal(aug('run',project),fixture.expected);
  const lock=JSON.parse(readFileSync(join(project,'aug.lock.json')));
  assert.equal(lock.git[0].commit,fixture.commit);
  const native=Object.values(lock.native.targets)[0].packages[0];
  assert.equal(native.sourceCommit,fixture.commit);assert.equal(native.artifact.sha256,fixture.sha256);
  assert.equal(lock.native.compiler.artifactSha256,tools.packs[0].archive.sha256);
  aug('spec',project);aug('spec',project);aug('spec',project,'--check');
  const saved=readFileSync(join(project,'aug.lock.json'),'utf8');
  assert.equal(aug('run',project,'--offline','--frozen'),fixture.expected);
  assert.equal(readFileSync(join(project,'aug.lock.json'),'utf8'),saved);
  const map=JSON.parse(readFileSync(join(project,'.aug-build',fixture.name+'.augmap.json')));
  assert.equal(map.backend,'llvm');assert.equal(map.developmentToolchain,false);
  assert.ok(map.nativeArtifacts.includes(fixture.sha256));
  assert.ok(existsSync(join(project,'.aug-build/program.ll')));
  assert.ok(!existsSync(join(project,'.aug-build/program.c')));
  const relocated=join(directory,'relocated-'+fixture.name);mkdirSync(relocated);
  cpSync(join(project,'.aug-build',fixture.name),join(relocated,'program'));
  for(const path of ['lib','share'])cpSync(join(project,'.aug-build',path),join(relocated,path),{recursive:true});
  assert.equal(run(join(relocated,'program'),[],{cwd:relocated,env}),fixture.expected);
  // The same public package also works through the existing named alias flow.
  const aliasProject=join(directory,fixture.name+'-alias');mkdirSync(aliasProject);
  writeFileSync(join(aliasProject,'main.aug'),fixture.source.replace('REPOSITORY',fixture.name));
  aug('add',repository,'--as',fixture.name,'--project',aliasProject);
  assert.equal(aug('run',aliasProject),fixture.expected);
  outcomes.push({package:fixture.name,repository,commit:fixture.commit,artifactSha256:fixture.sha256,
    stdout:fixture.expected,urlImport:true,namedAlias:true,frozenOffline:true,relocatedBundle:true,repeatedSpec:true,backend:'llvm'});
  console.log(`${fixture.name}: public download, URL import, named alias, LLVM execution, frozen/offline pass`);
}
const gallery=[];
for(const fixture of cases){
  const project=join(directory,'gallery-'+fixture.name);
  cpSync(join(root,'examples/native-'+fixture.name),project,{recursive:true,filter:path=>!path.split('/').some(part=>['.aug-build','.aug-packages','node_modules'].includes(part))});
  aug('install',project);aug('check',project);aug('spec',project);aug('spec',project,'--check');
  const expected=fixture.name==='pytorch'?'21\n':fixture.expected;
  assert.equal(aug('run',project),expected);
  const result=JSON.parse(aug('test',project,'--json','--offline','--frozen'));
  assert.equal(result.failed,0);assert.equal(result.passed,1);
  gallery.push({package:fixture.name,run:true,test:true,spec:true,backend:'llvm'});
  console.log(`${fixture.name}: complete wiki project runs and its independent same-file case passes`);
}
// Independent ownership cases use the real adapter's test counters. These
// unsafe probes are qualification instrumentation, not a proposed public API.
const cleanup=join(directory,'pytorch-cleanup');mkdirSync(cleanup);
writeFileSync(join(cleanup,'operations.aug'),`import Tensor and TensorError and tensor and sum from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.1"
extern C aug_probe_live_tensors_v1() returns int
extern C aug_probe_live_buffers_v1() returns int
interface _Container:
    pass
_Failing(own Tensor value) unless TensorError implements _Container:
    initialize:
        throw TensorError(code=99, message="constructor cleanup")
_earlyReturn(own Tensor value) returns float:
    return sum(tensor=value)
_consume(own Tensor value):
    pass
_fail() unless FileError:
    throw FileError()
verify():
    pass
test verify:
    when cleanup:
        it releases_fields_after_a_failed_constructor:
            int before = 0
            unsafe:
                before = aug_probe_live_tensors_v1()
            bool caught = false
            try:
                own Tensor value = tensor(values=[1.0])
                _Failing(value)
            catch TensorError error:
                caught = error.code == 99
            assert(caught)
            unsafe:
                assert(aug_probe_live_tensors_v1() == before)
        it releases_an_owned_input_before_returning:
            int before = 0
            unsafe:
                before = aug_probe_live_tensors_v1()
            own Tensor value = tensor(values=[7.0])
            assert(_earlyReturn(value) == 7.0)
            unsafe:
                assert(aug_probe_live_tensors_v1() == before)
                assert(aug_probe_live_buffers_v1() == 0)
        it releases_owned_inputs_when_cancelled_before_entry:
            int before = 0
            unsafe:
                before = aug_probe_live_tensors_v1()
            try:
                scope:
                    own Tensor value = tensor(values=[1.0])
                    failing = start _fail()
                    consuming = start _consume(value)
                    wait for failing
            catch FileError error:
                pass
            unsafe:
                assert(aug_probe_live_tensors_v1() == before)
`);
writeFileSync(join(cleanup,'main.aug'),'');
aug('install',cleanup);
for(const args of [[],['--offline','--frozen']]){
  const result=JSON.parse(aug('test',cleanup,'--json',...args));
  assert.equal(result.failed,0);assert.equal(result.passed,3);
}
console.log('pytorch: real counters prove failed-constructor and early-return cleanup');
const taskProject=join(directory,'pytorch-tasks');mkdirSync(taskProject);
writeFileSync(join(taskProject,'operations.aug'),`import Tensor and TensorError and tensor and sum from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.1"
calculate(float first) returns float unless TensorError:
    own Tensor value = tensor(values=[first, 2.0])
    return sum(tensor=value)
`);
writeFileSync(join(taskProject,'main.aug'),`import calculate from operations
import TensorError from "https://github.com/GreenPandaStudios/aug-pytorch#v0.1.1"
try:
    scope:
        first = start calculate(first=1.0)
        second = start calculate(first=3.0)
        wait for first and second to a and b
        print(value=a)
        print(value=b)
catch TensorError error:
    print(value=error.message)
`);
assert.equal(aug('run',taskProject),'3\n5\n');
assert.equal(aug('run',taskProject,'--offline','--frozen'),'3\n5\n');
console.log('pytorch: LLVM tasks call the real library and preserve grouped wait order');
const report={format:1,compiler:cliPackage.version,host:process.platform+'-'+process.arch,
  installation:'npm-archive-in-node_modules',nativeToolsOnPath:false,sourceCache:'fresh',artifactCache:'fresh',
  libraryTransport:'public-release-assets',compilerTransport:localCompiler?'local-release-asset':'public-release-asset',
  osRelease:osRelease(),minimumOSQualification:process.platform==='darwin'&&Number(osRelease().split('.')[0])===23,
  realResourceCounters:{failedConstructor:true,earlyReturn:true,cancelledBeforeEntry:true,liveBuffers:0},nativeTasks:true,directory,outcomes,gallery};
writeFileSync(join(root,'.aug-build/native-consumer-qualification.json'),JSON.stringify(report,null,2)+'\n');
console.log('Consumer qualification report: '+join(root,'.aug-build/native-consumer-qualification.json'));
