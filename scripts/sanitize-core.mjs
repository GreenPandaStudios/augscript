import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {nativeHome} from './native-home.mjs';
import {cCompiler} from './native-toolchain.mjs';

const backendIndex=process.argv.indexOf('--backend'),backend=backendIndex<0?'c':process.argv[backendIndex+1];
assert.ok(['c','llvm'].includes(backend),'--backend must be c or llvm');
if(backend==='llvm')assert.ok(process.env.AUG_LLVM_HOME,'LLVM sanitizer qualification needs the maintainer LLVM tool pack.');

const fixtures = [
  {
    name:'stored pure callbacks under collection pressure',
    files:{
      'main.aug':`import Predicate from august.collections
import Limit and make from callbacks
retained = make(limit=Limit(values=[1, 2, 3]))
index = 0
while index < 20000:
    Predicate<int> discarded = (int value) => value > index
    index = index + 1
print(value=retained.accepts(value=2))
`,
      'callbacks.aug':`import Predicate from august.collections
record Limit(List<int> values)
make(Limit limit) returns Predicate<int>:
    return (int value) => limit.values.length() > value
`
    },expected:'true\n'
  },
  {
    name:'owned loop exits and task joins',
    files:{
      'main.aug':`import read from values
count = 0
for item in [1, 2, 3, 4]:
    scope:
        own List<int> values = [item]
        task = start read(values=[item])
        try:
            count = count + 1
            if item == 2:
                continue
            if item == 4:
                break
        always:
            own List<string> cleanup = ["done"]
print(value=count)
`,
      'values.aug':`read(List<int> values):
    return values.length()
`
    },
    expected:'4\n'
  },
  {
    name:'managed text under collection pressure',
    files:{'main.aug':`List<string> retained = ["keep"]
int index = 0
while index < 20000:
    string item = "August " + "text"
    borrow retained:
        retained.append(value=item)
    index = index + 1
try:
    print(value=retained.get(index=0))
    print(value=retained.get(index=20000))
catch IndexError failure:
    print(value="incorrect collection length")
`},expected:'keep\nAugust text\n'
  },
  {
    name: 'Map/Set stress',
    files: { 'main.aug': `Map<int,int> entries = {}
Set<int> unique = {}
int index = 0
while index < 5000:
    borrow entries:
        entries.set(key=index, value=index * 3)
    borrow unique:
        unique.add(value=index)
    index = index + 1
index = 0
while index < 2500:
    borrow entries:
        entries.take(key=index)
    index = index + 1
print(value=entries.length())
print(value=unique.length())
` },
    expected: '2500\n5000\n',
  },
  {
    name:'interpolation and bounded text conversions',
    files:{'main.aug':`try:
    text = ""
    index = 0
    while index < 200:
        text = text + $"{index % 7}é"
        index = index + 1
    print(value=text.codePointLength())
    print(value=text.replace(search="é", replacement="🌍").codePointLength())
    print(value=["", "ab", ""].join(separator=":"))
    print(value="-9223372036854775808".parseInteger())
    print(value="1.25e2".parseFloat())
catch ConversionError error:
    print(value="unexpected conversion")
try:
    print(value="1e309".parseFloat())
catch ConversionError error:
    print(value="overflow")
`},expected:'400\n400\n:ab:\n-9223372036854775808\n125\noverflow\n'
  },
  {
    name: 'task start/wait',
    files: {
      'operations.aug': `read(List<int> values) returns int:
    return values.length()
`,
      'main.aug': `import read from operations
items = [1]
scope:
    pending = start read(values=items)
    print(value=wait for pending)
`,
    },
    expected: '1\n',
  },
  {
    name: 'owned Shared transfer to child',
    files: {
      'operations.aug': `consume(own Shared<List<int>> state):
    pass
`,
      'main.aug': `import consume from operations
scope:
    own Shared<List<int>> state = Shared(value=[1])
    pending = start consume(state=state)
    wait for pending
print(value="done")
`,
    },
    expected: 'done\n',
  },
];

for (const fixture of fixtures) {
  const root = mkdtempSync(join(tmpdir(), 'aug-sanitize-core-'));
  try {
    for (const [name, source] of Object.entries(fixture.files)) writeFileSync(join(root, name), source);
    const build = spawnSync(process.execPath, [resolve('bin/aug.mjs'), 'build', root,'--backend',backend], {
      encoding: 'utf8', timeout: 60000,
    });
    assert.equal(build.status, 0, `${fixture.name}: ${build.stderr || build.stdout || build.error?.message}`);

    const output = join(root, '.aug-build', basename(root));
    const metadata = JSON.parse(readFileSync(output + '.augmap.json', 'utf8'));
    const sanitized = join(root, '.aug-build', 'sanitized');
    let args,compiler;
    if(backend==='llvm'){
      assert.equal(metadata.backend,'llvm');
      const tools=process.env.AUG_LLVM_HOME;
      const prepared=join(root,'.aug-build/sanitizer-input.ll'),instrumented=join(root,'.aug-build/sanitized.ll'),object=join(root,'.aug-build/sanitized.o');
      // LLVM's ASan pass only instruments functions with sanitize_address.
      // Keep this qualification attribute out of ordinary application builds.
      const source=readFileSync(metadata.llvmIR,'utf8').replace(/^(define .+?) (!dbg !\d+ \{)$/gm,'$1 sanitize_address $2');
      assert.ok(source.includes('sanitize_address'),'Sanitizer input omitted function attributes');
      writeFileSync(prepared,source);
      for(const [tool,flags] of [['opt',['-passes=asan','-S',prepared,'-o',instrumented]],['llc',['-filetype=obj','-O=1','-relocation-model=pic',instrumented,'-o',object]]]){
        const result=spawnSync(join(tools,'bin',tool),flags,{encoding:'utf8',timeout:60000});assert.equal(result.status,0,fixture.name+': '+result.stderr);
      }
      assert.match(readFileSync(instrumented,'utf8'),/call void @__asan_report_(?:load|store)\d+\(/,'ASan must insert real memory checks in the August program');
      const repository=resolve(import.meta.dirname,'..'),native=nativeHome(repository),runtime=join(repository,'runtime');
      compiler=process.env.AUG_SANITIZER_CC??cCompiler();
      args=['-O1','-g','-std=c11','-D_POSIX_C_SOURCE=200809L','-pthread','-I'+runtime,'-I'+join(native,'sources/minicoro'),'-I'+join(native,'sources/yyjson/src'),object,
        ...['aug_runtime.c','aug_values.c','aug_tasks.c','aug_json.c','aug_time.c','aug_ir.c'].map(name=>join(runtime,name)),join(native,'sources/yyjson/src/yyjson.c'),
        ...(process.platform==='darwin'?['-isysroot',process.env.AUG_TEST_MACOS_SDK??'/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk']:['-lm']),'-o',sanitized];
    }else{args=[...metadata.arguments];compiler=metadata.compiler;}
    const optimization = args.findIndex(arg => arg === '-O0' || arg === '-O2');
    if (optimization >= 0) args[optimization] = '-O1';
    const outputFlag = args.indexOf('-o');
    assert.ok(outputFlag >= 0, `${fixture.name}: native compiler arguments include an output path`);
    args[outputFlag + 1] = sanitized;
    args.unshift('-fsanitize=address,undefined', '-fno-omit-frame-pointer');
    const compile = spawnSync(compiler, args, { encoding: 'utf8', timeout: 60000 });
    assert.equal(compile.status, 0, `${fixture.name}: ${compile.stderr || compile.stdout || compile.error?.message}`);

    const run = spawnSync(sanitized, [], {
      encoding: 'utf8', timeout: 60000,
      env: { ...process.env, ASAN_OPTIONS: 'detect_leaks=0:halt_on_error=1', UBSAN_OPTIONS: 'halt_on_error=1' },
    });
    assert.equal(run.status, 0, `${fixture.name}: ${run.stderr || run.error?.message}`);
    assert.equal(run.stdout, fixture.expected, `${fixture.name}: output`);
    if(backend==='llvm'&&fixture===fixtures[0]){
      const negative=join(root,'.aug-build/negative.ll'),negativeIR=join(root,'.aug-build/negative-instrumented.ll'),negativeObject=join(root,'.aug-build/negative.o');
      const source=readFileSync(join(root,'.aug-build/sanitizer-input.ll'),'utf8');
      const probe='\ndefine void @aug_sanitizer_negative_control(i64 %index) sanitize_address {\nentry:\n  %buffer = alloca [1 x i8], align 1\n  %outside = getelementptr [1 x i8], ptr %buffer, i64 0, i64 %index\n  store volatile i8 7, ptr %outside, align 1\n  ret void\n}\n';
      writeFileSync(negative,source.replace(/(define i32 @main\([^\n]+\nentry:\n)/,'$1  call void @aug_sanitizer_negative_control(i64 1)\n')+probe);
      for(const [tool,flags] of [['opt',['-passes=asan','-S',negative,'-o',negativeIR]],['llc',['-filetype=obj','-O=1','-relocation-model=pic',negativeIR,'-o',negativeObject]]]){
        const result=spawnSync(join(process.env.AUG_LLVM_HOME,'bin',tool),flags,{encoding:'utf8',timeout:60000});assert.equal(result.status,0,result.stderr);
      }
      const negativeArgs=args.map(arg=>arg===join(root,'.aug-build/sanitized.o')?negativeObject:arg===sanitized?sanitized+'-negative':arg);
      const compile=spawnSync(compiler,negativeArgs,{encoding:'utf8',timeout:60000});assert.equal(compile.status,0,compile.stderr);
      const failed=spawnSync(sanitized+'-negative',[],{encoding:'utf8',timeout:60000,env:{...process.env,ASAN_OPTIONS:'detect_leaks=0:halt_on_error=1'}});
      assert.notEqual(failed.status,0,'ASan negative control must reject an actual LLVM stack overflow');
      assert.match(failed.stderr,/AddressSanitizer: stack-buffer-overflow/,'ASan negative control must report the deliberate memory violation');
    }
    process.stdout.write(`${fixture.name} (${backend}) passed AddressSanitizer; runtime C passed UBSan.\n`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
