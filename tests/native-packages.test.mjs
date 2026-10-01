import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, realpathSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import {createHash} from 'node:crypto';
import {readPackage, compilerVersion,installPackages,projectPackages} from '../src/package-manager.ts';
import {prepareNativePackages} from '../src/native-artifacts.ts';
import {nativeTarget, selectNativeArtifact} from '../src/native-contracts.ts';
import {loadProject} from '../src/project.ts';
import {checkProject} from '../src/checker.ts';
import {formatFile} from '../src/formatter.ts';
import {contractFacts,describe} from '../src/semantic.ts';
import {hoverInfo} from '../src/editor.ts';
import {generateSpecs,updateSpecs} from '../src/spec.ts';

const descriptor = {format:1, profile:'aug-native-abi-1', resources:[], functions:[]};
const target = {triple:'aarch64-apple-darwin', os:'macos', arch:'arm64', minimumOS:'14.0', cpuBaseline:'armv8-a', libc:'libSystem'};
const artifact = {id:'macos-arm64', target, url:'https://github.com/example/library/releases/download/v1/native.tar.gz', sha256:'a'.repeat(64), maximumDownloadBytes:4096, maximumUnpackedBytes:8192,
  link:{kind:'dynamic', libraries:['lib/libexample.1.dylib']}, runtime:{files:['lib/libexample.1.dylib'], relocation:'loader-relative'}, components:[{id:'example',version:'1.0.0',compatibilityKey:'example',linkage:'dynamic',required:true}], fileManifest:'files.json', provenance:'provenance.json', notices:'THIRD_PARTY_NOTICES.md'};

function fixture(run) {
  const root=realpathSync(mkdtempSync(join(tmpdir(),'aug-native-package-')));
  mkdirSync(join(root,'src'));
  writeFileSync(join(root,'src/export.aug'),'');
  const bytes=JSON.stringify(descriptor)+'\n';
  writeFileSync(join(root,'native.abi.json'),bytes);
  const manifest={format:2,name:'@example/native',version:'1.0.0',compiler:compilerVersion(),source:'src',dependencies:{},native:{profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:createHash('sha256').update(bytes).digest('hex'),upstream:{repository:'https://github.com/example/library',version:'1.0.0',sourceRevision:'b'.repeat(40)},artifacts:[artifact]}};
  const save=()=>writeFileSync(join(root,'aug-package.json'),JSON.stringify(manifest));
  save();
  try { return run(root,manifest,save); } finally {rmSync(root,{recursive:true,force:true});}
}

test('format 2 retains a verified native contract alongside ordinary August source',()=>fixture(root=>{
  const {manifest,sourceRoot}=readPackage(root);
  assert.equal(manifest.native.profile,'aug-native-abi-1');
  assert.equal(sourceRoot,realpathSync(join(root,'src')));
}));

test('native descriptor copies regenerate, check drift and protect local edits',()=>fixture((root,manifest,save)=>{
  const checked=()=>checkProject(loadProject(root));
  const path=join(root,'.aug-spec/packages/@example/native/1.0.0/native.abi.json');
  updateSpecs(checked());updateSpecs(checked());
  assert.deepEqual(updateSpecs(checked(),true).stale,[]);
  const changed=JSON.stringify(descriptor,null,2)+'\n';
  writeFileSync(join(root,'native.abi.json'),changed);
  manifest.native.bindingsSha256=createHash('sha256').update(changed).digest('hex');save();
  assert.ok(updateSpecs(checked(),true).stale.some(p=>p.endsWith('/native.abi.json')));
  updateSpecs(checked());assert.equal(readFileSync(path,'utf8'),changed);
  const without=()=>{const result=checked();result.native.providerDescriptors.clear();return result;};
  writeFileSync(path,'{"handwritten":true}\n');
  assert.throws(()=>updateSpecs(checked()),/edited native descriptor/);
  assert.throws(()=>updateSpecs(without()),/edited native descriptor/);
  assert.equal(readFileSync(path,'utf8'),'{"handwritten":true}\n');
  writeFileSync(path,changed);updateSpecs(without());assert.equal(existsSync(path),false);
  assert.deepEqual(updateSpecs(without(),true).stale,[]);
}));

test('foreign declarations cannot be silently changed after their contract was pinned',()=>fixture(root=>{
  writeFileSync(join(root,'native.abi.json'),JSON.stringify({...descriptor,profile:'other'}));
  assert.throws(()=>readPackage(root),/NATIVE_INTEGRITY.*binding/i);
}));

test('selects only a compatible prebuilt target and reports the OS requirement',()=>{
  assert.equal(selectNativeArtifact([artifact],nativeTarget('aarch64-apple-darwin','14.0')).id,'macos-arm64');
  assert.throws(()=>selectNativeArtifact([artifact],nativeTarget('aarch64-apple-darwin','13.6')),/requires macOS 14.0/);
  assert.throws(()=>selectNativeArtifact([artifact],nativeTarget('x86_64-unknown-linux-gnu')),/No compatible prebuilt artifact/);
});

test('rejects ambiguous artifacts, traversal, unbounded downloads, and executable install recipes',()=>fixture((root,manifest,save)=>{
  const check=(mutate,pattern)=>{const original=structuredClone(manifest.native); mutate();save();assert.throws(()=>readPackage(root),pattern);manifest.native=original;};
  check(()=>manifest.native.artifacts.push(structuredClone(artifact)),/duplicate|ambiguous/i);
  check(()=>manifest.native.artifacts[0].link.libraries=['../escape.dylib'],/relative artifact path/i);
  check(()=>manifest.native.artifacts[0].maximumDownloadBytes=0,/positive|download/i);
  check(()=>manifest.native.installScript='curl | sh',/unsupported.*installScript/i);
  check(()=>manifest.native.artifacts[0].url='http://insecure.example/native.tgz',/HTTPS/i);
}));

test('a changed native selection cannot bypass the verified source manifest',()=>fixture(root=>{
  const app=join(root,'consumer');mkdirSync(app);
  writeFileSync(join(app,'main.yaml'),'packages:\n  library: ".."\n');writeFileSync(join(app,'main.aug'),'');
  installPackages(app,false,true);
  const file=join(app,'aug.lock.json'),lock=JSON.parse(readFileSync(file));
  lock.packages[0].native.artifacts[0].url='https://example.invalid/replaced-native.tar.gz';
  writeFileSync(file,JSON.stringify(lock));
  const result=projectPackages(app,lock.specifications);
  assert.equal(result.scopes.size,0);
  assert.match(result.diagnostics[0].message,/Native metadata.*differs.*verified source manifest/);
}));

test('different native providers cannot export the same physical symbols',()=>fixture((root,manifest,save)=>{
  const contract={...descriptor,resources:[{module:'bindings',name:'Handle',release:'same_release_v1'}],functions:[{
    module:'api',name:'value',symbol:'same_value_v1',params:[],result:{kind:'i64'},callingConvention:'C',status:'direct',uses:[],changes:[],thread:'caller',retainsInputs:false
  }]};
  const bytes=JSON.stringify(contract);writeFileSync(join(root,'native.abi.json'),bytes);
  manifest.native.bindingsSha256=createHash('sha256').update(bytes).digest('hex');save();
  writeFileSync(join(root,'src/bindings.aug'),'extern C resource Handle\n');
  writeFileSync(join(root,'src/api.aug'),'extern C value() returns int\n');
  writeFileSync(join(root,'src/export.aug'),'export value from api\n');
  const other=join(root,'other');mkdirSync(join(other,'src'),{recursive:true});
  writeFileSync(join(other,'aug-package.json'),JSON.stringify({...manifest,name:'@example/other'}));
  writeFileSync(join(other,'native.abi.json'),bytes);
  for(const file of ['bindings.aug','api.aug','export.aug'])writeFileSync(join(other,'src',file),readFileSync(join(root,'src',file)));
  const app=join(root,'consumer');mkdirSync(app);
  writeFileSync(join(app,'main.yaml'),'packages:\n  first: ".."\n  second: "../other"\n');
  writeFileSync(join(app,'main.aug'),'import value from first\n');installPackages(app,false,true);
  const errors=checkProject(loadProject(app)).diagnostics;
  assert.ok(errors.some(d=>/same_value_v1.*ambiguous providers/.test(d.message)),JSON.stringify(errors));
  assert.ok(errors.some(d=>/same_release_v1.*ambiguous providers/.test(d.message)),JSON.stringify(errors));
}));

test('opaque resources have checked acquisition, labeled loans, errors and ownership',()=>fixture((root,manifest,save)=>{
  const contract={...descriptor,resources:[{module:'bindings',name:'Tensor',release:'example_tensor_release_v1'}],functions:[{
    module:'api',name:'_tensor',symbol:'example_tensor_new_v1',params:[{name:'values',kind:'f64-list'}],result:{kind:'resource',resource:'bindings.Tensor'},error:'contracts.TensorError',callingConvention:'C',status:'i32',uses:[],changes:[],thread:'caller',retainsInputs:false
  },{module:'api',name:'_sum',symbol:'example_tensor_sum_v1',params:[{name:'tensor',kind:'resource',resource:'bindings.Tensor',ownership:'read'}],result:{kind:'f64'},error:'contracts.TensorError',callingConvention:'C',status:'i32',uses:[],changes:[],thread:'caller',retainsInputs:false}]};
  const bytes=JSON.stringify(contract)+'\n';writeFileSync(join(root,'native.abi.json'),bytes);
  manifest.native.bindingsSha256=createHash('sha256').update(bytes).digest('hex');save();
  writeFileSync(join(root,'src/bindings.aug'),'extern C resource Tensor\n');
  writeFileSync(join(root,'src/contracts.aug'),'TensorError(int code, string message) implements Error:\n    pass\n');
  writeFileSync(join(root,'src/api.aug'),'import Tensor from bindings\nimport TensorError from contracts\nextern C _tensor(List<float> values) returns own Tensor unless TensorError\nextern C _sum(Tensor tensor) returns float unless TensorError\ntensor(List<float> values) returns own Tensor:\n    unsafe:\n        return _tensor(values)\nsum(Tensor tensor):\n    unsafe:\n        return _sum(tensor)\n');
  writeFileSync(join(root,'src/export.aug'),'export Tensor from bindings\nexport TensorError from contracts\nexport tensor and sum from api\n'.replace('export tensor and sum from api','export tensor from api\nexport sum from api'));
  const checked=checkProject(loadProject(root));
  assert.deepEqual(checked.diagnostics.filter(d=>d.severity!=='warning'),[]);
  assert.equal(checked.native.functions.size,2);
  const facts=contractFacts(checked),acquire=facts.find(fact=>fact.name==='_tensor').callables[0];
  assert.deepEqual(acquire.capabilities,[],'descriptor-backed bindings must not invent a C capability');
  assert.equal(acquire.native.provider,'@example/native@1.0.0');
  assert.equal(acquire.native.contract.symbol,'example_tensor_new_v1');
  assert.equal(acquire.native.descriptorSha256,manifest.native.bindingsSha256);
  assert.equal(acquire.native.supportedTargets[0].minimumOS,'14.0');
  assert.ok(acquire.native.nativeAuthorPromises.includes('inputs are not retained'));
  assert.equal(facts.find(fact=>fact.name==='sum').callables[0].nativeDependencies[0].contract.params[0].ownership,'read');
  const context=describe(checked,join(root,'src/api.aug'),{name:'sum',context:true,budget:100000});
  assert.ok(context.contracts.some(fact=>fact.name==='_sum'&&fact.callables[0].native));
  const api=checked.project.files.get(join(root,'src/api.aug'));
  const hover=hoverInfo(checked,api.path,api.source.lastIndexOf('sum(Tensor')+1);
  assert.match(hover.documentation,/@example\/native@1\.0\.0/);
  assert.match(hover.documentation,/caller thread.*blocking native call/);
  assert.match(hover.documentation,/does not prove those promises/);
  assert.match(hover.documentation,/\[`native\.abi\.json`\]\(file:\/\//);
  const specs=generateSpecs(checked);
  assert.match(specs.find(spec=>spec.path===join(root,'src/bindings.aug.md')).text,/example_tensor_release_v1/);
  assert.match(specs.find(spec=>spec.path===join(root,'src/api.aug.md')).text,/example_tensor_sum_v1.*lends read access/);
  const copiedContract=specs.find(spec=>spec.path===join(root,'.aug-spec/packages/@example/native/1.0.0/native.abi.json'));
  assert.equal(copiedContract.text,bytes);
  assert.match(specs.find(spec=>spec.path===join(root,'src/api.aug.md')).text,/\[.*native\.abi\.json.*\]\(.*1\.0\.0\/native\.abi\.json\)/);
  assert.deepEqual(generateSpecs(checked),specs,'native specifications remain deterministic');
  assert.equal(formatFile(checked.project,checked.project.files.get(join(root,'src/bindings.aug'))),'extern C resource Tensor\n');
  writeFileSync(join(root,'src/api.aug'),readFileSync(join(root,'src/api.aug'),'utf8').replace('returns own Tensor unless','returns Tensor unless'));
  const rejected=checkProject(loadProject(root)).diagnostics;
  assert.ok(rejected.some(d=>d.code==='OWN'&&/returns own/.test(d.message)),JSON.stringify(rejected));
  assert.ok(rejected.some(d=>d.code==='NATIVE_ABI'&&/ownership/.test(d.message)),JSON.stringify(rejected));
}));
