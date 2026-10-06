import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from './compiler-process.mjs';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {lowerToIR} from '../src/ir.ts';
import {generateSpecs} from '../src/spec.ts';
const cli=resolve('bin/aug.mjs');
function fixture(main,functions,run){const root=mkdtempSync(join(tmpdir(),'aug-worker-map-'));try{writeFileSync(join(root,'main.aug'),main);writeFileSync(join(root,'rules.aug'),functions);return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
const double='double(int value) returns int:\n    return value * 2\n';
const mapping='import mapWorkers from august.collections\nimport double from rules\ntry:\n    result = mapWorkers(values=[1, 2, 3, 4, 5], concurrency=2, chunkSize=2, transformation=double)\n    for value in result:\n        print(value)\ncatch Error error:\n    print(value="unexpected failure")\n';
for(const backend of ['c','llvm'])test(`bounded worker mapping executes partial chunks in order (${backend})`,()=>fixture(mapping,double,root=>{
  const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
  const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000,env:{...process.env,AUG_WORKERS:'1'}});
  assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'2\n4\n6\n8\n10\n');
}));

for(const backend of ['c','llvm'])test(`mapping bounds are validated for empty input and preserve source values (${backend})`,()=>fixture(`import mapWorkers from august.collections
import double from rules
List<int> empty = []
try:
    print(value=mapWorkers(values=empty, concurrency=1, chunkSize=65536, transformation=double).length())
    values = [2, 4]
    result = mapWorkers(transformation=double, chunkSize=1, values=values, concurrency=1)
    borrow result:
        result.append(value=99)
    print(value=values.length())
    print(value=result.length())
    mapWorkers(values=empty, concurrency=0, chunkSize=1, transformation=double)
catch ConversionError error:
    print(value="invalid concurrency")
catch Error error:
    print(value="unexpected")
try:
    mapWorkers(values=empty, concurrency=65, chunkSize=1, transformation=double)
catch ConversionError error:
    print(value="large concurrency")
catch Error error:
    print(value="unexpected")
try:
    mapWorkers(values=empty, concurrency=1, chunkSize=0, transformation=double)
catch ConversionError error:
    print(value="invalid chunk")
catch Error error:
    print(value="unexpected")
try:
    mapWorkers(values=empty, concurrency=1, chunkSize=65537, transformation=double)
catch ConversionError error:
    print(value="large chunk")
catch Error error:
    print(value="unexpected")
`,double,root=>{
  const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000,env:{...process.env,AUG_WORKERS:'1'}});
  assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'0\n2\n3\ninvalid concurrency\nlarge concurrency\ninvalid chunk\nlarge chunk\n');
}));

const negatives=[
 ['closures',double,'(int value) => value * 2','WORKER_MAP'],
 ['stored callbacks','import Transformation from august.collections\n'+double,'stored','WORKER_MAP','Transformation<int,int> stored = double\n'],
 ['behavior objects','import Transformation from august.collections\nDouble() implements Transformation<int,int>:\n    apply(int value):\n        return value * 2\n','Double()','WORKER_MAP'],
 ['checked failures','double(int value) returns int unless FileError:\n    throw FileError()\n','double','CALLBACK'],
 ['owned inputs','double(own int value) returns int:\n    return value\n','double','CALLBACK'],
 ['injected inputs','interface Number:\n    get() returns int\ndouble(resolve Number number, int value) returns int:\n    return value\n','double','CALLBACK'],
 ['effects','import Console from august.io\ndouble(resolve Console console, int value) returns int:\n    console.write(value)\n    return value\n','double','CALLBACK'],
 ['reachable cooperative starts','helper(int value) returns int:\n    return value\ndouble(int value) returns int:\n    scope:\n        task = start helper(value)\n        return wait for task\n','double','WORKER'],
 ['transitive task starts','helper(int value) returns int:\n    scope:\n        task = start leaf(value)\n        return wait for task\nleaf(int value) returns int:\n    return value\ndouble(int value) returns int:\n    return helper(value)\n','double','WORKER'],
 ['unqualified native calls','extern C value pure probe(int value) returns int\ndouble(int value) returns int:\n    unsafe:\n        return probe(value)\n','double','WORKER'],
 ['generic transformations','double<T implements optional Data>(T value) returns T:\n    return value\n','double','CALLBACK']
];
for(const [name,functions,transformation,code,setup=''] of negatives)test(`worker mapping rejects ${name}`,()=>fixture('import mapWorkers from august.collections\nimport everything from rules\n'+setup+`try:\n    mapWorkers(values=[1,2], concurrency=2, chunkSize=1, transformation=${transformation})\ncatch Error error:\n    pass\n`,functions,root=>{
  const diagnostics=checkProject(loadProject(root)).diagnostics;
  assert.ok(diagnostics.some(issue=>issue.code===code),JSON.stringify(diagnostics));
}));

for(const [name,functions,values] of [
 ['behavior inputs','interface Item:\n    read() returns int\nThing() implements Item:\n    read() returns int:\n        return 1\nread(Item value) returns int:\n    return value.read()\n','[Thing()]'],
 ['behavior results','interface Item:\n    read() returns int\nThing() implements Item:\n    read() returns int:\n        return 1\nread(int value) returns Item:\n    return Thing()\n','[1]'],
 ['task results','read(int value) returns Task<int>:\n    Task<int> task = null\n    return task\n','[1]']
])test(`worker mapping rejects ${name}`,()=>fixture(`import mapWorkers from august.collections
import everything from rules
try:
    mapWorkers(values=${values}, concurrency=2, chunkSize=1, transformation=read)
catch Error error:
    pass
`,functions,root=>assert.ok(checkProject(loadProject(root)).diagnostics.some(issue=>issue.severity!=='warning'))));

for(const backend of ['c','llvm'])test(`mapping copies nested records and aliases and can run inside a one-thread worker (${backend})`,()=>fixture(`import execute and Row from rules
try:
    scope:
        job = start worker execute(values=[Row(values=[2,3])])
        print(value=wait for job)
catch Error error:
    print(value="unexpected")
`,`import mapWorkers from august.collections
record Row(immutable List<int> values)
size(Row value) returns int:
    return value.values.length()
execute(List<Row> values) returns int unless ConversionError and ConcurrencyError and IndexError:
    result = mapWorkers(values, concurrency=1, chunkSize=1, transformation=size)
    return result.get(index=0)
`,root=>{
 const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000,env:{...process.env,AUG_WORKERS:'1'}});
 assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'2\n');
}));

test('static mapping facts, worker IR and source AST retain the resolved transformation',()=>fixture(mapping,double,root=>{
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 const before=JSON.stringify([...checked.project.files].map(([file,source])=>[file,source.items]));
 const ir=lowerToIR(checked),workers=ir.functions.flatMap(fn=>fn.blocks.flatMap(block=>block.instructions.filter(item=>item.op==='start'&&item.worker)));
 assert.equal(workers.length,1);assert.equal(workers[0].args.length,1);assert.ok(!workers[0].receiver);
 assert.equal(JSON.stringify([...checked.project.files].map(([file,source])=>[file,source.items])),before);
 assert.equal([...checked.workerMaps.values()][0].transformation.id,'rules.aug:double');
}));

// Compiler integration uses a real ABI package. The foreign implementation only
// instruments the execution boundary; its result is the same pure value * 2.
import {mkdirSync,readFileSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {installPackages,compilerVersion} from '../src/package-manager.ts';
import {nativeHostTarget} from '../src/native-contracts.ts';
import {compileLLVM} from '../src/llvm-native.ts';
import {compileNative} from '../src/native.ts';
import {generateC} from '../src/codegen.ts';
import {contractFacts} from '../src/contract-facts.ts';
import {updateSpecs} from '../src/spec.ts';
import {semanticGraph} from '../src/symbols.ts';
const mac=process.platform==='darwin';
const probeSource=`#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <time.h>
#include <stdatomic.h>
extern uint8_t aug_native_cancelled_v1(void);
static pthread_mutex_t mutex=PTHREAD_MUTEX_INITIALIZER;
static pthread_t first,parent;
static int onParent;
__attribute__((constructor)) static void remember_parent(void){parent=pthread_self();}
static int active,peak,calls,released,wave,finished,distinct,order[64],ordered;
int64_t _probe(int64_t value){
  const char *option=getenv("AUG_MAP_BARRIER");int barrier=option?atoi(option):1;
  pthread_mutex_lock(&mutex);
  if(!calls)first=pthread_self();else if(!pthread_equal(first,pthread_self()))distinct=1;
  if(pthread_equal(parent,pthread_self()))onParent++;
  calls++;active++;if(active>peak)peak=active;
  int ownWave=wave;
  if(active==barrier){wave++;finished=0;}
  pthread_mutex_unlock(&mutex);
  // Cancellation is cooperative across this ABI boundary, including admission
  // failure before a second job reaches the barrier. Never abandon native work.
  for(;;){
    pthread_mutex_lock(&mutex);int ready=wave>ownWave;
    int reverse=(barrier==2 && value%2 && finished==0);
    pthread_mutex_unlock(&mutex);
    if((ready&&!reverse)||aug_native_cancelled_v1())break;
    struct timespec pause={0,1000000};nanosleep(&pause,NULL);
  }
  pthread_mutex_lock(&mutex);active--;released++;finished++;
  if(ordered<64)order[ordered++]=(int)value;
  pthread_mutex_unlock(&mutex);
  return value*2;
}
__attribute__((destructor)) static void report(void){
  fprintf(stderr,"mapping-probe calls=%d peak=%d released=%d active=%d distinct=%d parent=%d order=",calls,peak,released,active,distinct,onParent);
  for(int i=0;i<ordered;i++)fprintf(stderr,"%s%d",i?",":"",order[i]);fputc('\\n',stderr);
}
`;
function instrumented(main,run,{workerSafe=true}={}){
 const root=realpathSync(mkdtempSync(join(tmpdir(),'aug-map-native-')));
 try{
  const library=join(root,'library'),app=join(root,'app');mkdirSync(join(library,'src'),{recursive:true});mkdirSync(app);
  const descriptor={format:1,profile:'aug-native-abi-1',resources:[],functions:[{module:'api',name:'_probe',symbol:'_probe',params:[{name:'value',kind:'i64'}],result:{kind:'i64'},callingConvention:'C',status:'direct',uses:[],changes:[],thread:'caller',retainsInputs:false,workerSafe}]};
  const bytes=JSON.stringify(descriptor);writeFileSync(join(library,'native.abi.json'),bytes);
  const archive=mac?'libmapping.dylib':'libmapping.so',artifact={id:process.platform+'-'+process.arch,target:nativeHostTarget(),url:'https://example.invalid/mapping.tar.gz',sha256:'b'.repeat(64),maximumDownloadBytes:1,maximumUnpackedBytes:1,link:{kind:'dynamic',libraries:[archive]},runtime:{files:[archive],relocation:'loader-relative'},components:[],fileManifest:'files.json',provenance:'provenance.json',notices:'THIRD_PARTY_NOTICES.md'};
  writeFileSync(join(library,'aug-package.json'),JSON.stringify({format:2,name:'@test/native-mapping',version:'1.0.0',compiler:compilerVersion(),source:'src',dependencies:{},native:{profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:createHash('sha256').update(bytes).digest('hex'),upstream:{repository:'https://github.com/example/mapping',version:'1.0.0',sourceRevision:'a'.repeat(40)},artifacts:[artifact]}}));
  writeFileSync(join(library,'src/api.aug'),'extern C _probe(int value) returns int\nprobe(int value) returns int:\n    unsafe:\n        return _probe(value)\n');writeFileSync(join(library,'src/export.aug'),'export probe from api\n');
  writeFileSync(join(app,'main.yaml'),'packages:\n  instrument: "../library"\n');writeFileSync(join(app,'main.aug'),main);
  writeFileSync(join(app,'rules.aug'),`import mapWorkers from august.collections
import probe from instrument
interface Disposable:
    drop()
Resource() implements Disposable:
    drop():
        pass
calculate(int value) returns int:
    own Resource resource = Resource()
    return probe(value)
execute() returns List<int> unless ConversionError and ConcurrencyError and IndexError:
    return mapWorkers(values=[1,2,3,4,5,6], concurrency=2, chunkSize=1, transformation=calculate)
fail() unless FileError:
    throw FileError()
`);
  installPackages(app,false,true);const checked=checkProject(loadProject(app));
  return run(root,app,checked,archive);
 }finally{rmSync(root,{recursive:true,force:true});}
}
function compileInstrumented(root,app,checked,archive,backend){
 assert.deepEqual(checked.diagnostics,[]);
 const cc=mac?'/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang':'clang';
 const sdk=mac?['-isysroot',process.env.AUG_TEST_MACOS_SDK??'/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk']:[];
 writeFileSync(join(root,'probe.c'),probeSource);
 const flags=mac?['-dynamiclib','-mmacosx-version-min=14.0','-undefined','dynamic_lookup','-Wl,-install_name,@rpath/'+archive]:['-shared','-fPIC','-Wl,-soname,'+archive];
 const build=spawnSync(cc,[...sdk,...flags,'-std=c11','-D_POSIX_C_SOURCE=200809L','-pthread',join(root,'probe.c'),'-o',join(root,archive)],{encoding:'utf8'});assert.equal(build.status,0,build.stderr);
 if(backend==='llvm')return compileLLVM(checked,{release:true,native:[{directory:root,libraries:[archive],runtimeFiles:[archive]}]}).output;
 const compiled=compileNative(app,generateC(checked),{checked,release:true,config:{...checked.project.config,library_paths:[root],libraries:['mapping']}});assert.equal(compiled.status,0,compiled.error);return compiled.output;
}
for(const backend of ['c','llvm'])test(`mapping uses distinct OS threads, bounded waves, reversed completions and owner cleanup (${backend})`,()=>instrumented('import execute from rules\ntry:\n    for value in execute():\n        print(value)\ncatch Error error:\n    print(value="unexpected")\n',(root,app,checked,archive)=>{
 const output=compileInstrumented(root,app,checked,archive,backend),result=spawnSync(output,[],{encoding:'utf8',timeout:15000,env:{...process.env,DYLD_LIBRARY_PATH:root,LD_LIBRARY_PATH:root,AUG_WORKERS:'4',AUG_MAP_BARRIER:'2',AUG_TRACE_DROPS:'1'}});
 assert.equal(result.status,0,result.stderr||result.error?.message);assert.equal(result.stdout,'2\n4\n6\n8\n10\n12\n');
 assert.match(result.stderr,/calls=6 peak=2 released=6 active=0 distinct=1 parent=0 order=2,1,4,3,6,5/);
 assert.equal((result.stderr.match(/drop: (?:rules\.aug:)?Resource\n/g)??[]).length,6,result.stderr);
}));
for(const backend of ['c','llvm'])test(`admission failure cancels and joins the partial wave without returning partial data (${backend})`,()=>instrumented('import execute from rules\ntry:\n    execute()\n    print(value="unexpected result")\ncatch ConcurrencyError error:\n    print(value="capacity")\ncatch Error error:\n    print(value="unexpected error")\n',(root,app,checked,archive)=>{
 const output=compileInstrumented(root,app,checked,archive,backend),result=spawnSync(output,[],{encoding:'utf8',timeout:15000,env:{...process.env,DYLD_LIBRARY_PATH:root,LD_LIBRARY_PATH:root,AUG_WORKERS:'2',AUG_WORKER_PENDING:'1',AUG_MAP_BARRIER:'2',AUG_TRACE_DROPS:'1'}});
 assert.equal(result.status,0,result.stderr||result.error?.message);assert.equal(result.stdout,'capacity\n');
 const match=/calls=(\d+) peak=(\d+) released=(\d+) active=0/.exec(result.stderr);assert.ok(match,result.stderr);assert.ok(Number(match[1])<=1);assert.equal(match[1],match[3]);assert.equal((result.stderr.match(/drop: (?:rules\.aug:)?Resource\n/g)??[]).length,Number(match[1]));
}));
for(const backend of ['c','llvm'])test(`parent failure stops later waves and joins worker cleanup (${backend})`,()=>instrumented('import execute and fail from rules\ntry:\n    scope:\n        mapped = start execute()\n        failed = start fail()\n        wait for mapped\ncatch FileError error:\n    print(value="parent failure")\ncatch Error error:\n    print(value="unexpected error")\n',(root,app,checked,archive)=>{
 const output=compileInstrumented(root,app,checked,archive,backend),result=spawnSync(output,[],{encoding:'utf8',timeout:15000,env:{...process.env,DYLD_LIBRARY_PATH:root,LD_LIBRARY_PATH:root,AUG_WORKERS:'2',AUG_MAP_BARRIER:'2',AUG_TRACE_DROPS:'1'}});
 assert.equal(result.status,0,result.stderr||result.error?.message);assert.equal(result.stdout,'parent failure\n');
 const match=/calls=(\d+) peak=(\d+) released=(\d+) active=0/.exec(result.stderr);assert.ok(match,result.stderr);assert.ok(Number(match[1])<=2,result.stderr);assert.equal(match[1],match[3]);assert.equal((result.stderr.match(/drop: (?:rules\.aug:)?Resource\n/g)??[]).length,Number(match[1]));
}));
test('mapping rejects an ABI package without its workerSafe assertion before linking',()=>instrumented('import execute from rules\ntry:\n    execute()\ncatch Error error:\n    pass\n',(_root,_app,checked)=>assert.ok(checked.diagnostics.some(issue=>issue.code==='WORKER'&&issue.message.includes('workerSafe'))),{workerSafe:false}));

test('context and generated explanations expose the actual named worker target',()=>fixture('import run from rules\ntry:\n    run()\ncatch Error error:\n    pass\n','import mapWorkers from august.collections\n'+double+'run() returns List<int> unless ConversionError and ConcurrencyError and IndexError:\n    return mapWorkers(values=[1,2], concurrency=2, chunkSize=1, transformation=double)\n',root=>{
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 const facts=contractFacts(checked),mapping=facts.find(fact=>fact.name==='run').workerMappings;assert.equal(mapping[0].target,'rules.aug:double');assert.equal(mapping[0].scheduling,'bounded-waves');
 const graph=semanticGraph(checked);assert.ok(graph.reverseCallers['rules.aug:double'].some(edge=>edge.kind==='callback-call'));
 updateSpecs(checked,false);
 assert.match(readFileSync(join(root,'rules.aug.md'),'utf8'),/isolated worker heaps.*input order/);
 assert.match(readFileSync(join(root,'rules.aug.diagrams.md'),'utf8'),/Bounded chunk wave/);
}));

for(const backend of ['c','llvm'])test(`concurrency one still runs native transformations away from the main thread (${backend})`,()=>instrumented('import mapWorkers from august.collections\nimport calculate from rules\ntry:\n    for value in mapWorkers(values=[1,2,3], concurrency=1, chunkSize=2, transformation=calculate):\n        print(value)\ncatch Error error:\n    print(value="unexpected")\n',(root,app,checked,archive)=>{
 const output=compileInstrumented(root,app,checked,archive,backend),result=spawnSync(output,[],{encoding:'utf8',timeout:15000,env:{...process.env,DYLD_LIBRARY_PATH:root,LD_LIBRARY_PATH:root,AUG_WORKERS:'4',AUG_MAP_BARRIER:'1'}});
 assert.equal(result.status,0,result.stderr||result.error?.message);assert.equal(result.stdout,'2\n4\n6\n');assert.match(result.stderr,/calls=3 peak=1 released=3 active=0 distinct=\d parent=0 order=1,2,3/);
}));
for(const backend of ['c','llvm'])test(`mapping snapshots copied alias graphs before source changes (${backend})`,()=>fixture(`import sizes from rules
values = [1,2]
try:
    scope:
        job = start worker sizes(values=[values,values])
        borrow values:
            values.append(value=3)
        result = wait for job
        for value in result:
            print(value)
    print(value=values.length())
catch Error error:
    print(value="unexpected")
`,`import mapWorkers from august.collections
size(List<int> value) returns int:
    return value.length()
sizes(List<List<int>> values) returns List<int> unless ConversionError and ConcurrencyError and IndexError:
    return mapWorkers(values, concurrency=1, chunkSize=2, transformation=size)
`,root=>{
 const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000,env:{...process.env,AUG_WORKERS:'1'}});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'2\n2\n3\n');
}));
for(const backend of ['c','llvm'])test(`copied-input admission bounds still apply to mapping (${backend})`,()=>fixture(mapping.replace('catch Error error:', 'catch ConcurrencyError error:').replace('unexpected failure','copy capacity')+'catch Error error:\n    print(value="unexpected failure")\n',double,root=>{
 const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000,env:{...process.env,AUG_WORKERS:'1',AUG_WORKER_INPUT_BYTES:'1'}});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'copy capacity\n');
}));
for(const backend of ['c','llvm'])test(`element limit rejects before copying or starting jobs (${backend})`,()=>fixture(`import mapWorkers from august.collections
import double from rules
List<int> values = []
while values.length() < 1048577:
    borrow values:
        values.append(value=0)
try:
    mapWorkers(values, concurrency=1, chunkSize=1, transformation=double)
catch ConversionError error:
    print(value="too many values")
catch Error error:
    print(value="unexpected")
`,double,root=>{
 const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000,env:{...process.env,AUG_WORKERS:'1',AUG_WORKER_INPUT_BYTES:'1'}});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'too many values\n');
}));
for(const backend of ['c','llvm'])test(`same-file mapping tests use their own checked native program (${backend})`,()=>fixture('print(value="inactive application")\n','import mapWorkers from august.collections\n'+double+`test double:
    when workers:
        it maps_values:
            result = mapWorkers(values=[2,3], concurrency=1, chunkSize=1, transformation=double)
            assert(result.get(index=0) == 4)
            assert(result.get(index=1) == 6)
`,root=>{
 const result=spawnSync(process.execPath,[cli,'test',root,'--backend',backend],{encoding:'utf8',timeout:60000});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/1 passed, 0 failed/);assert.doesNotMatch(result.stdout,/inactive application/);
}));
test('an unused mapping import emits no unspecialized worker entry',()=>fixture('import mapWorkers from august.collections\n',double,root=>{
 const checked=checkProject(loadProject(root));assert.deepEqual(checked.diagnostics,[]);
 assert.ok(!lowerToIR(checked).functions.flatMap(fn=>fn.blocks.flatMap(block=>block.instructions)).some(item=>item.op==='start'&&item.worker));
 assert.doesNotMatch(generateC(checked),/aug_task_start_worker\(/);
}));

for(const backend of ['c','llvm'])test(`specialization retains immutable collection contracts (${backend})`,()=>fixture('import mapWorkers from august.collections\nimport length from rules\nimmutable List<int> values = [1,2]\ntry:\n    for value in mapWorkers(values=[values], concurrency=1, chunkSize=1, transformation=length):\n        print(value)\ncatch Error error:\n    print(value="unexpected")\n','length(immutable List<int> value) returns int:\n    return value.length()\n',root=>{
 const result=spawnSync(process.execPath,[cli,'run',root,'--backend',backend],{encoding:'utf8',timeout:60000});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'2\n');
}));
test('caught nested mapping is still a reachable scheduling operation and cannot be a transformation',()=>fixture('import mapWorkers from august.collections\nimport nested from rules\ntry:\n    mapWorkers(values=[1], concurrency=1, chunkSize=1, transformation=nested)\ncatch Error error:\n    pass\n','import mapWorkers from august.collections\nleaf(int value) returns int:\n    return value\nnested(int value) returns int:\n    try:\n        result = mapWorkers(values=[value], concurrency=1, chunkSize=1, transformation=leaf)\n        return result.get(index=0)\n    catch Error error:\n        return 0\n',root=>{
 const diagnostics=checkProject(loadProject(root)).diagnostics;assert.ok(diagnostics.some(issue=>issue.code==='WORKER'&&issue.message.includes('another worker mapping')),JSON.stringify(diagnostics));
}));

test('the compiled library template explains static data-only worker transfer',()=>{
 const checked=checkProject(loadProject(resolve('src/stdlib/collections')));
 const outputs=generateSpecs(checked,{files:[...checked.project.files.values()].filter(file=>file.path.startsWith(checked.project.root+'/'))});
 const output=outputs.find(item=>item.path.endsWith('/workers.aug.md'));
 const diagram=outputs.find(item=>item.path.endsWith('/workers.aug.diagrams.md'));
 assert.match(diagram.text,/only chunk data crosses/);assert.match(diagram.text,/Direct call with value(?:;|#59;) target selected at compile time/);
 assert.doesNotMatch(diagram.text,/_mapWorkerChunk\(values, transformation\)|apply\(value\) · interface dispatch/);
 assert.match(output.text,/compile-time selected transformation/);assert.match(output.text,/only chunk data crosses/);
 assert.doesNotMatch(output.text,/transformation.*with copies of its inputs on a separate heap/);
});
