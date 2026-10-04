import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,realpathSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {installPackages,compilerVersion} from '../src/package-manager.ts';
import {checkProject} from '../src/checker.ts';
import {loadProject} from '../src/project.ts';
import {compileLLVM} from '../src/llvm-native.ts';
import {nativeHostTarget} from '../src/native-contracts.ts';

const mac=process.platform==='darwin';
const enabled=!!process.env.AUG_LLVM_HOME&&(mac&&process.arch==='arm64'||process.platform==='linux'&&['x64','arm64'].includes(process.arch));
function run(source){
  const root=realpathSync(mkdtempSync(join(tmpdir(),'aug-native-boundary-')));
  try{
    const library=join(root,'library'),app=join(root,'app');mkdirSync(join(library,'src'),{recursive:true});mkdirSync(app);
    const descriptor={format:1,profile:'aug-native-abi-1',resources:[],functions:[
      {module:'api',name:'_bounded',symbol:'boundary_bounded_v1',params:[{name:'value',kind:'i64',minimum:0,maximum:100}],result:{kind:'i64'},callingConvention:'C',status:'direct',uses:[],changes:[],thread:'caller',retainsInputs:false},
      {module:'api',name:'_fail',symbol:'boundary_fail_v1',params:[],result:{kind:'i64'},error:'contracts.Failure',callingConvention:'C',status:'i32',uses:[],changes:[],thread:'caller',retainsInputs:false}
    ]};
    const bytes=JSON.stringify(descriptor);writeFileSync(join(library,'native.abi.json'),bytes);
    // This local ABI test supplies its compiled adapter directly, never downloads it.
    const filename=mac?'libboundary.dylib':'libboundary.so';
    const artifact={id:process.platform+'-'+process.arch,target:nativeHostTarget(),url:'https://example.invalid/boundary.tar.gz',sha256:'b'.repeat(64),maximumDownloadBytes:1,maximumUnpackedBytes:1,link:{kind:'dynamic',libraries:[filename]},runtime:{files:[filename],relocation:'loader-relative'},components:[],fileManifest:'files.json',provenance:'provenance.json',notices:'THIRD_PARTY_NOTICES.md'};
    writeFileSync(join(library,'aug-package.json'),JSON.stringify({format:2,name:'@test/native-boundary',version:'1.0.0',compiler:compilerVersion(),source:'src',dependencies:{},native:{profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:createHash('sha256').update(bytes).digest('hex'),upstream:{repository:'https://github.com/example/boundary',version:'1.0.0',sourceRevision:'a'.repeat(40)},artifacts:[artifact]}}));
    writeFileSync(join(library,'src/contracts.aug'),'Failure(int code, string message) implements Error:\n    explain() returns string:\n        return message\n');
    writeFileSync(join(library,'src/api.aug'),'import Failure from contracts\nextern C _bounded(int value) returns int\nextern C _fail() returns int unless Failure\nbounded(int value) returns int:\n    unsafe:\n        return _bounded(value)\nfail() returns int:\n    unsafe:\n        return _fail()\n');
    writeFileSync(join(library,'src/export.aug'),'export Failure from contracts\nexport bounded from api\nexport fail from api\n');
    writeFileSync(join(app,'main.yaml'),'packages:\n  boundary: "../library"\n');writeFileSync(join(app,'main.aug'),source);
    installPackages(app,false,true);
    const checked=checkProject(loadProject(app));assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[]);
    const adapter=join(root,'adapter.c');writeFileSync(adapter,'#include '+JSON.stringify(resolve(import.meta.dirname,'../native/aug-native-abi-1.h'))+'\n#include <string.h>\nint64_t boundary_bounded_v1(int64_t value){return value+1;}\nint32_t boundary_fail_v1(int64_t *out,aug_native_error_v1 *error){*out=0;error->code=37;error->message_length=6;memcpy(error->message,"failed",6);return 1;}\n');
    const cc=mac?'/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang':'clang';
    const flags=mac?['-isysroot',process.env.AUG_TEST_MACOS_SDK??'/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk','-dynamiclib','-mmacosx-version-min=14.0','-Wl,-install_name,@rpath/'+filename]:['-shared','-fPIC','-Wl,-soname,'+filename];
    const native=spawnSync(cc,[...flags,adapter,'-o',join(root,filename)],{encoding:'utf8'});
    assert.equal(native.status,0,native.stderr);
    const compiled=compileLLVM(checked,{release:true,native:[{directory:root,libraries:[filename],runtimeFiles:[]}]});
    return spawnSync(compiled.output,[],{encoding:'utf8',env:{...process.env,PATH:'/nonexistent',SDKROOT:'/nonexistent',DEVELOPER_DIR:'/nonexistent'}});
  }finally{rmSync(root,{recursive:true,force:true});}
}

test('native failure uses its resolved August error constructor and methods',{skip:!enabled},()=>{
  const result=run('import Failure and bounded and fail from boundary\nprint(value=bounded(value=7))\ntry:\n    fail()\ncatch Failure error:\n    print(value=error.code)\n    print(value=error.explain())\n');
  assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'8\n37\nfailed\n');
});
test('direct native calls reject bounded input instead of returning null',{skip:!enabled},()=>{
  const result=run('import bounded from boundary\nprint(value=bounded(value=101))\nprint(value="continued")\n');
  assert.equal(result.status,1,result.stderr);assert.match(result.stderr,/NativeContractError/);assert.equal(result.stdout,'');
});
