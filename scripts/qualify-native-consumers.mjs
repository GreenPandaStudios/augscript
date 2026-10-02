#!/usr/bin/env node
/* Cold consumer qualification: installed JavaScript, real GitHub source and
   native artifacts. --local-compiler substitutes only unpublished compiler
   transport; library downloads always use their public release URLs. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {release as osRelease} from 'node:os';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {nativeQualificationPins} from './native-qualification-pins.mjs';

const root=resolve(import.meta.dirname,'..');
const localCompiler=process.argv.includes('--local-compiler');
const discardBuilds=process.argv.includes('--discard-builds');
const retireDeployment=project=>{if(discardBuilds)for(const path of ['lib','share'])rmSync(join(project,'.aug-build',path),{recursive:true,force:true});};
const candidateArgument=process.argv.indexOf('--candidate-libraries');
const candidateRoot=candidateArgument<0?undefined:resolve(process.argv[candidateArgument+1]??'');
assert.ok(!candidateRoot||localCompiler,'Local library candidates require --local-compiler; they are not public-download qualification.');
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
const compilerPack=tools.packs.find(pack=>pack.host===process.platform+'-'+process.arch);
assert.ok(compilerPack,'No compiler pack exists for this qualification host.');
if(localCompiler){
  // Populate the fresh cache using the installed verifier. No compiler override
  // is available to the child CLI, which must validate the pinned archive.
  const installed=await import(pathToFileURL(join(cliRoot,'src/compiler-packs.js')));
  const originalFetch=globalThis.fetch,originalCache=process.env.AUG_NATIVE_ARTIFACT_CACHE;
  const originalHome=process.env.AUG_LLVM_HOME,originalRuntime=process.env.AUG_RUNTIME_PACK;
  process.env.AUG_NATIVE_ARTIFACT_CACHE=env.AUG_NATIVE_ARTIFACT_CACHE;
  delete process.env.AUG_LLVM_HOME;delete process.env.AUG_RUNTIME_PACK;
  globalThis.fetch=async(input,options)=>String(input)===compilerPack.archive.url
    ?new Response(readFileSync(join(root,'.aug-build',new URL(compilerPack.archive.url).pathname.split('/').at(-1)))):originalFetch(input,options);
  try{await installed.prepareLLVMCompiler();}
  finally{
    globalThis.fetch=originalFetch;
    for(const [key,value] of [['AUG_NATIVE_ARTIFACT_CACHE',originalCache],['AUG_LLVM_HOME',originalHome],['AUG_RUNTIME_PACK',originalRuntime]]){
      if(value===undefined)delete process.env[key];else process.env[key]=value;
    }
  }
}
const cases=[
  {name:'pytorch',expected:'5\n7\n9\n21\n',source:`import Tensor and TensorError and tensor and add and sum and values from REPOSITORY
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
  {name:'sqlite',expected:'August\n',source:`import Database and SqliteError and openMemory and execute and queryScalar from REPOSITORY
try:
    own Database database = openMemory()
    borrow database:
        execute(database, sql="CREATE TABLE users (name TEXT NOT NULL)", parameters=[])
        execute(database, sql="INSERT INTO users (name) VALUES (?)", parameters=["August"])
    print(value=queryScalar(database, sql="SELECT name FROM users", parameters=[]))
catch SqliteError error:
    print(value=error.message)
`},
  {name:'zlib',expected:'The world runs on language\n',source:`import CompressionError and compress and decompress from REPOSITORY
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
  {name:'blake3',expected:'6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85\n',source:`import HashError and hash from REPOSITORY
try:
    Bytes input = "abc".bytes()
    print(value=hash(input))
catch HashError error:
    print(value=error.message)
`}
];
if(!candidateRoot){
  const pins=nativeQualificationPins(join(root,'native/library-qualification.json'),process.platform+'-'+process.arch);
  for(const fixture of cases)Object.assign(fixture,pins[fixture.name]);
}
if(candidateRoot){
  const installed=await import(pathToFileURL(join(cliRoot,'src/native-artifacts.js')));
  const originalFetch=globalThis.fetch;
  for(const fixture of cases){
    fixture.sourceDirectory=join(candidateRoot,'aug-'+fixture.name);
    const manifest=JSON.parse(readFileSync(join(fixture.sourceDirectory,'aug-package.json')));
    const artifact=manifest.native.artifacts.find(artifact=>artifact.target.os===(process.platform==='darwin'?'macos':process.platform)&&artifact.target.arch===process.arch);
    assert.ok(artifact,'No library candidate exists for '+fixture.name+' on this host.');
    fixture.sha256=artifact.sha256;fixture.commit=undefined;
    const candidate=process.platform==='darwin'?join(fixture.sourceDirectory,'.aug-build/native/native-macos-arm64.tar.gz'):join(fixture.sourceDirectory,'.aug-build/native-linux-'+process.arch,'native-linux-'+process.arch+'.tar.gz');
    globalThis.fetch=async(input,options)=>String(input)===artifact.url?new Response(readFileSync(candidate)):originalFetch(input,options);
    try{await installed.ensureVerifiedArchive(artifact,{cache:env.AUG_NATIVE_ARTIFACT_CACHE});}finally{globalThis.fetch=originalFetch;}
  }
}
const prepareCandidateProject=project=>{
  if(!candidateRoot)return;
  const used=new Set();
  const visit=directory=>{for(const entry of readdirSync(directory,{withFileTypes:true})){
    const path=join(directory,entry.name);if(entry.isDirectory()&&!entry.name.startsWith('.'))visit(path);
    else if(entry.name.endsWith('.aug'))writeFileSync(path,readFileSync(path,'utf8').replace(/"https:\/\/github.com\/GreenPandaStudios\/aug-(pytorch|sqlite|zlib|blake3)#v[^"\n]+"/g,(_,name)=>{used.add(name);return name;}));
  }};visit(project);
  writeFileSync(join(project,'main.yaml'),'packages:\n'+cases.filter(fixture=>used.has(fixture.name)).map(fixture=>'  '+fixture.name+': '+JSON.stringify(fixture.sourceDirectory)).join('\n')+'\n');
};
const pytorchRepository=candidateRoot?'pytorch':JSON.stringify('https://github.com/GreenPandaStudios/aug-pytorch#v'+cases.find(fixture=>fixture.name==='pytorch').version);
const outcomes=[];
for(const fixture of cases){
  const project=join(directory,fixture.name);mkdirSync(project);
  const repository=`https://github.com/GreenPandaStudios/aug-${fixture.name}#v${fixture.version??'0.1.1'}`;
  writeFileSync(join(project,'main.aug'),fixture.source.replace('REPOSITORY',JSON.stringify(repository)));
  prepareCandidateProject(project);
  assert.equal(aug('run',project),fixture.expected);
  const lock=JSON.parse(readFileSync(join(project,'aug.lock.json')));
  if(!candidateRoot)assert.equal(lock.git[0].commit,fixture.commit);
  const native=Object.values(lock.native.targets)[0].packages[0];
  assert.equal(native.sourceCommit,fixture.commit);assert.equal(native.artifact.sha256,fixture.sha256);
  const host=process.platform+'-'+process.arch;
  assert.equal(lock.native.compilers[host].artifactSha256,compilerPack.archive.sha256);
  if(fixture.name==='zlib'){
    // One checkout records independent compilers for each qualified host.
    const otherHost=host==='linux-x64'?'linux-arm64':'linux-x64';
    const other={...lock.native.compilers[host],host:otherHost,target:otherHost==='linux-arm64'?'aarch64-unknown-linux-gnu':'x86_64-unknown-linux-gnu',artifactSha256:'1'.repeat(64)};
    lock.native.compilers[otherHost]=other;
    writeFileSync(join(project,'aug.lock.json'),JSON.stringify(lock,null,2)+'\n');
    assert.equal(aug('run',project),fixture.expected);
    assert.deepEqual(JSON.parse(readFileSync(join(project,'aug.lock.json'))).native.compilers[otherHost],other);
    const rejected=JSON.parse(readFileSync(join(project,'aug.lock.json')));
    delete rejected.native.compilers[host];
    writeFileSync(join(project,'aug.lock.json'),JSON.stringify(rejected,null,2)+'\n');
    const failed=spawnSync(process.execPath,[cli,'run',project,'--offline','--frozen'],{env,encoding:'utf8',timeout:30000});
    assert.notEqual(failed.status,0);assert.match(failed.stderr,/LLVM_LOCK.*matching compiler artifact/);
    assert.equal(JSON.parse(readFileSync(join(project,'aug.lock.json'))).native.compilers[host],undefined);
    writeFileSync(join(project,'aug.lock.json'),JSON.stringify(lock,null,2)+'\n');
  }
  aug('spec',project);aug('spec',project);aug('spec',project,'--check');
  const saved=readFileSync(join(project,'aug.lock.json'),'utf8');
  assert.equal(aug('run',project,'--offline','--frozen'),fixture.expected);
  assert.equal(readFileSync(join(project,'aug.lock.json'),'utf8'),saved);
  const map=JSON.parse(readFileSync(join(project,'.aug-build',fixture.name+'.augmap.json')));
  assert.equal(map.backend,'llvm');assert.equal(map.developmentToolchain,false);
  assert.equal(map.llvm,'23.1.2');assert.match(map.debugInfoSha256,/^[0-9a-f]{64}$/);
  assert.ok(existsSync(map.debugInfo));
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
  aug('add',fixture.sourceDirectory??repository,'--as',fixture.name,'--project',aliasProject);
  assert.equal(aug('run',aliasProject),fixture.expected);
  outcomes.push({package:fixture.name,repository:candidateRoot?fixture.sourceDirectory:repository,commit:fixture.commit,artifactSha256:fixture.sha256,
    stdout:fixture.expected,urlImport:!candidateRoot,namedAlias:true,frozenOffline:true,relocatedBundle:true,repeatedSpec:true,backend:'llvm'});
  console.log(`${fixture.name}: ${candidateRoot?'verified local candidate':'public download, URL import'}, named alias, LLVM execution, frozen/offline pass`);
  retireDeployment(project);retireDeployment(aliasProject);
  if(discardBuilds)rmSync(relocated,{recursive:true,force:true});
}
const gallery=[];
for(const fixture of cases){
  const project=join(directory,'gallery-'+fixture.name);
  cpSync(join(root,'examples/native-'+fixture.name),project,{recursive:true,filter:path=>!path.split('/').some(part=>['.aug-build','.aug-packages','node_modules'].includes(part))});
  if(!candidateRoot)for(const name of readdirSync(project).filter(name=>name.endsWith('.aug'))){
    const path=join(project,name);writeFileSync(path,readFileSync(path,'utf8').replace(/^(import [^\n]+ from )"https:\/\/github.com\/GreenPandaStudios\/aug-(pytorch|sqlite|zlib|blake3)#v[^"\n]+"/gm,(_,prefix,library)=>prefix+JSON.stringify('https://github.com/GreenPandaStudios/aug-'+library+'#v'+cases.find(fixture=>fixture.name===library).version)));
  }
  prepareCandidateProject(project);
  aug('install',project);aug('check',project);aug('spec',project);aug('spec',project,'--check');
  const expected=fixture.name==='pytorch'?'21\n':fixture.expected;
  assert.equal(aug('run',project),expected);
  const result=JSON.parse(aug('test',project,'--json','--offline','--frozen'));
  assert.equal(result.failed,0);assert.equal(result.passed,1);
  gallery.push({package:fixture.name,run:true,test:true,spec:true,backend:'llvm'});
  console.log(`${fixture.name}: complete wiki project runs and its independent same-file case passes`);
  retireDeployment(project);
}
// Independent ownership cases use the real adapter's test counters. These
// unsafe probes are qualification instrumentation, not a proposed public API.
const cleanup=join(directory,'pytorch-cleanup');mkdirSync(cleanup);
writeFileSync(join(cleanup,'operations.aug'),`import Tensor and TensorError and tensor and sum from ${pytorchRepository}
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
interceptor _Reject<T>():
    around() returns T unless TensorError:
        T completed = next()
        throw TensorError(code=98, message="interceptor cleanup")
[_Reject]
_Intercepted(own Tensor value) unless TensorError implements _Container:
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
        it releases_a_completed_constructor_after_interception_fails:
            int before = 0
            unsafe:
                before = aug_probe_live_tensors_v1()
            bool caught = false
            try:
                own Tensor value = tensor(values=[1.0])
                _Intercepted(value)
            catch TensorError error:
                caught = error.code == 98
            assert(caught)
            unsafe:
                assert(aug_probe_live_tensors_v1() == before)
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
prepareCandidateProject(cleanup);
if(candidateRoot)writeFileSync(join(cleanup,'main.yaml'),'packages:\n  pytorch: '+JSON.stringify(join(candidateRoot,'aug-pytorch'))+'\n');
aug('install',cleanup);
for(const args of [[],['--offline','--frozen']]){
  const result=JSON.parse(aug('test',cleanup,'--json',...args));
  assert.equal(result.failed,0);assert.equal(result.passed,4);
}
console.log('pytorch: real counters prove failed-constructor and early-return cleanup');
retireDeployment(cleanup);
const taskProject=join(directory,'pytorch-tasks');mkdirSync(taskProject);
writeFileSync(join(taskProject,'operations.aug'),`import Tensor and TensorError and tensor and sum from ${pytorchRepository}
calculate(float first) returns float unless TensorError:
    own Tensor value = tensor(values=[first, 2.0])
    return sum(tensor=value)
`);
writeFileSync(join(taskProject,'main.aug'),`import calculate from operations
import TensorError from ${pytorchRepository}
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
prepareCandidateProject(taskProject);
if(candidateRoot)writeFileSync(join(taskProject,'main.yaml'),'packages:\n  pytorch: '+JSON.stringify(join(candidateRoot,'aug-pytorch'))+'\n');
assert.equal(aug('run',taskProject),'3\n5\n');
assert.equal(aug('run',taskProject,'--offline','--frozen'),'3\n5\n');
console.log('pytorch: LLVM tasks call the real library and preserve grouped wait order');
retireDeployment(taskProject);
const standard=join(directory,'standard-runtime');mkdirSync(standard);
writeFileSync(join(standard,'main.yaml'),'backend: llvm\n');
writeFileSync(join(standard,'main.aug'),`import Crypto and GnuTlsCrypto from "https://github.com/GreenPandaStudios/augscript/src/stdlib/crypto#v0.20.1"
import Clock and SystemClock from "https://github.com/GreenPandaStudios/augscript/src/stdlib/time#v0.20.1"
import parse from "https://github.com/GreenPandaStudios/augscript/src/stdlib/json#v0.20.1"
implement Crypto with GnuTlsCrypto
implement Clock with SystemClock
resolve Crypto to crypto
resolve Clock to clock
try:
    print(value=crypto.sha256(input="abc".bytes()).base64url())
    print(value=clock.now() > 1700000000)
    print(value=parse(input="42").integer())
catch CryptoError error:
    print(value="crypto failed")
catch TimeError error:
    print(value="clock failed")
catch JsonError error:
    print(value="json failed")
`);
writeFileSync(join(standard,'endpoints.aug'),`record Greeting(string name)
endpoint POST "/form" as submit(Greeting input from form) returns Greeting:
    return input
test endpoint submit client:
    when form_binding:
        it calls_llvm_factory:
            response = client.request(method="POST", path="/form", headers=Headers().with(name="content-type", value="application/x-www-form-urlencoded"), body="name=Ada".bytes())
            assert(condition=response.status == 200)
            assert(condition=response.body.text() == "{\\"name\\":\\"Ada\\"}")
`);
const standardOutput='ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0\ntrue\n42\n';
assert.equal(aug('run',standard),standardOutput);
assert.equal(aug('run',standard,'--offline','--frozen'),standardOutput);
const standardCases=JSON.parse(aug('test',standard,'--json','--offline','--frozen'));
assert.equal(standardCases.failed,0);assert.equal(standardCases.passed,1);
const relocatedStandard=join(directory,'relocated-standard');mkdirSync(relocatedStandard);
cpSync(join(standard,'.aug-build/standard-runtime'),join(relocatedStandard,'program'));
for(const path of ['lib','share'])cpSync(join(standard,'.aug-build',path),join(relocatedStandard,path),{recursive:true});
assert.equal(run(join(relocatedStandard,'program'),[],{cwd:relocatedStandard,env}),standardOutput);
const notices=join(relocatedStandard,'share/august-native');
assert.ok(existsSync(notices),'Runtime components must retain redistribution metadata.');
console.log('JSON, clock, crypto and HTTP form callbacks pass without a native toolchain');
const report={format:1,compiler:cliPackage.version,host:process.platform+'-'+process.arch,
  installation:'npm-archive-in-node_modules',nativeToolsOnPath:false,sourceCache:'fresh',artifactCache:'fresh',
  libraryTransport:candidateRoot?'local-candidates':'public-release-assets',compilerTransport:localCompiler?'local-release-asset':'public-release-asset',
  osRelease:osRelease(),glibcVersion:process.platform==='linux'?process.report.getReport().header.glibcVersionRuntime:undefined,
  discardedDeploymentCopies:discardBuilds,minimumOSQualification:process.platform==='darwin'&&Number(osRelease().split('.')[0])===23,
  minimumLibcQualification:process.platform==='linux'&&process.report.getReport().header.glibcVersionRuntime==='2.36',
  realResourceCounters:{failedConstructor:true,earlyReturn:true,cancelledBeforeEntry:true,liveBuffers:0},nativeTasks:true,standardRuntime:{json:true,clock:true,crypto:true,httpForms:true,relocation:true},directory,outcomes,gallery};
writeFileSync(join(root,'.aug-build/native-consumer-qualification.json'),JSON.stringify(report,null,2)+'\n');
console.log('Consumer qualification report: '+join(root,'.aug-build/native-consumer-qualification.json'));
