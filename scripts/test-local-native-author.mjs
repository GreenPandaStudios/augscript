import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {c as archive} from 'tar';

/** Installed-CLI author/consumer gate. The explicit maintainer tools build a real C archive. */
export async function testLocalNativeAuthor({directory,cliRoot,cli,run}) {
  if(!process.env.AUG_LLVM_HOME||!process.env.AUG_RUNTIME_PACK){process.stdout.write('Local native author LLVM qualification requires the selected contributor compiler/runtime.\n');return;}
  const {nativeHostTarget}=await import(pathToFileURL(join(cliRoot,'src/native-contracts.js'))),target=nativeHostTarget();
  const compiler=JSON.parse(readFileSync(join(cliRoot,'package.json'))).version;
  const clang=process.env.AUG_BIND_CLANG??(process.platform==='darwin'?'/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang':'clang');
  const ar=process.env.AUG_BIND_AR??(process.platform==='darwin'?'/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/ar':'ar');
  const root=join(directory,'native-author'),library=join(root,'library'),payload=join(root,'payload'),app=join(root,'consumer'),cache=join(root,'cache');
  for(const path of [join(library,'src'),payload,app])mkdirSync(path,{recursive:true});
  const header=join(root,'identity.h'),source=join(root,'identity.c');
  writeFileSync(header,'#include <stdint.h>\nint64_t aug_installed_identity_v1(int64_t value);\n');
  writeFileSync(source,'#include "identity.h"\nint64_t aug_installed_identity_v1(int64_t value) { return value; }\n');
  const descriptor={format:1,profile:'aug-native-abi-1',resources:[],functions:[{module:'api',name:'_identity',symbol:'aug_installed_identity_v1',params:[{name:'value',kind:'i64'}],result:{kind:'i64'},callingConvention:'C',status:'direct',uses:[],changes:[],thread:'caller',retainsInputs:false,workerSafe:false}]};
  const descriptorBytes=JSON.stringify(descriptor);writeFileSync(join(library,'native.abi.json'),descriptorBytes);
  run(process.execPath,[cli,'bind','header',header,'--contract',join(library,'native.abi.json'),'--target',target.triple,'--clang',clang,'--output',join(root,'checked')]);
  const version=run(clang,['--version']),object=join(root,'identity.o');
  const compile=['-target',target.triple,...(target.os==='macos'?['-mmacosx-version-min=14.0']:[]),'-O2','-c',source,'-o',object];
  run(clang,compile);run(ar,['rcs',join(payload,'libidentity.a'),object]);
  writeFileSync(join(payload,'header-check.json'),readFileSync(join(root,'checked/header-check.json')));
  writeFileSync(join(payload,'provenance.json'),JSON.stringify({compiler:version,target,compile,source:'Installed scalar ABI fixture; actual C implementation'}));
  writeFileSync(join(payload,'notices.md'),'MIT: installed native identity fixture.\n');
  const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),members=['libidentity.a','header-check.json','provenance.json','notices.md'];
  writeFileSync(join(payload,'files.json'),JSON.stringify({format:1,files:Object.fromEntries(members.map(name=>[name,sha(readFileSync(join(payload,name)))]))}));
  const transport=join(root,'identity.tar.gz');archive({file:transport,cwd:payload,gzip:true,sync:true},[...members,'files.json']);
  const bytes=readFileSync(transport),artifact={id:'host',target,url:'https://example.invalid/unpublished-identity.tar.gz',sha256:sha(bytes),maximumDownloadBytes:bytes.length,maximumUnpackedBytes:1024*1024,link:{kind:'static',libraries:['libidentity.a']},runtime:{files:[],relocation:'loader-relative'},components:[],fileManifest:'files.json',fileManifestSha256:sha(readFileSync(join(payload,'files.json'))),provenance:'provenance.json',notices:'notices.md'};
  writeFileSync(join(library,'aug-package.json'),JSON.stringify({format:2,name:'@example/identity',version:'1.0.0',compiler,source:'src',dependencies:{},native:{profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:sha(descriptorBytes),upstream:{repository:'https://example.invalid/identity',version:'1.0.0',sourceRevision:sha(readFileSync(source))},artifacts:[artifact]}}));
  writeFileSync(join(library,'src/api.aug'),'extern C _identity(int value) returns int\nidentity(int value):\n    unsafe:\n        return _identity(value)\n');
  writeFileSync(join(library,'src/export.aug'),'export identity from api\n');
  const env={...process.env,AUG_NATIVE_ARTIFACT_CACHE:cache};
  const report=JSON.parse(run(process.execPath,[cli,'package','cache-native',library,'--artifact','host','--archive',transport,'--json'],{env:{...env,PATH:'/no-native-tools'}}));
  assert.equal(report.status,'verified');assert.equal(report.artifact.sha256,artifact.sha256);assert.equal(report.execution,'not-run');
  writeFileSync(join(app,'main.yaml'),'packages:\n  identity: "../library"\n');
  writeFileSync(join(app,'main.aug'),'import identity from identity\nfor value in [-9223372036854775808, -1, 0, 1, 9223372036854775807]:\n    print(value=identity(value))\n');
  run(process.execPath,[cli,'install',app,'--offline'],{env});
  assert.equal(run(process.execPath,[cli,'run',app,'--backend','llvm','--offline'],{env}),'-9223372036854775808\n-1\n0\n1\n9223372036854775807\n');
  const locked=JSON.parse(readFileSync(join(app,'aug.lock.json')));assert.ok(Object.values(locked.native.targets).some(entry=>entry.packages.some(item=>item.artifact.sha256===artifact.sha256&&item.artifact.fileManifestSha256===artifact.fileManifestSha256)));
  const cached=join(cache,artifact.sha256);writeFileSync(join(cached,'libidentity.a'),'replacement');
  const manifest=JSON.parse(readFileSync(join(cached,'files.json')));manifest.files['libidentity.a']=sha('replacement');writeFileSync(join(cached,'files.json'),JSON.stringify(manifest));
  const rejected=spawnSync(process.execPath,[cli,'doctor',app,'--json'],{env,encoding:'utf8'});assert.equal(rejected.status,1,rejected.stderr);
  assert.ok(JSON.parse(rejected.stdout).artifacts.some(item=>item.status==='invalid'&&/declared identity/.test(item.message)));
  if(process.env.AUG_TEST_PUBLIC_NATIVE_AUTHOR==='1'){
    const publicApp=join(root,'public-zlib');mkdirSync(publicApp);
    writeFileSync(join(publicApp,'main.aug'),'import CompressionError and compress and decompress from "https://github.com/GreenPandaStudios/aug-zlib#v0.1.5"\ntry:\n    Bytes input = "The world runs on language".bytes()\n    Bytes compressed = compress(input)\n    Bytes restored = decompress(input=compressed, maximumOutput=4096)\n    print(value=restored.text())\ncatch CompressionError error:\n    print(value=error.message)\ncatch ConversionError error:\n    print(value="Invalid UTF-8")\n');
    const consumerEnv={...env,PATH:'/no-native-tools',SDKROOT:'/no-sdk',DEVELOPER_DIR:'/no-sdk',AUG_PACKAGE_CACHE:join(root,'public-sources')};
    delete consumerEnv.AUG_GIT;
    run(process.execPath,[cli,'install',publicApp],{env:consumerEnv});
    assert.equal(run(process.execPath,[cli,'run',publicApp,'--backend','llvm','--offline'],{env:consumerEnv}),'The world runs on language\n');
    const locked=JSON.parse(readFileSync(join(publicApp,'aug.lock.json')));assert.ok(locked.git.some(entry=>entry.request==='https://github.com/GreenPandaStudios/aug-zlib#v0.1.5'&&/^[a-f0-9]{40}$/.test(entry.commit)));
    process.stdout.write('Installed public zlib repository import, authenticated archive and offline LLVM execution passed.\n');
  }
  if(target.os==='macos'&&target.arch==='arm64'){
    const starter=join(root,'native-starter'),starterLicense=join(root,'starter-license');writeFileSync(starterLicense,'Author-supplied installed starter license.\n');
    run(process.execPath,[cli,'package','init',starter,'--native','c','--name','@example/starter','--repository','https://example.invalid/starter','--artifact-url','https://example.invalid/starter-v0.1.0.tar.gz','--license',starterLicense,'--clang',clang,'--ar',ar]);
    run(process.execPath,[cli,'package','cache-native',starter,'--artifact','macos-arm64','--archive',join(starter,'.aug-build/native/macos-arm64.tar.gz')],{env:{...env,PATH:'/no-native-tools'}});
    run(process.execPath,[cli,'test',starter,'--offline','--backend','llvm'],{env:{...env,PATH:'/no-native-tools',SDKROOT:'/missing-sdk',DEVELOPER_DIR:'/missing-native-tools'}});
    const starterApp=join(root,'starter-app');mkdirSync(starterApp);writeFileSync(join(starterApp,'main.yaml'),'packages:\n  identity: "../native-starter"\n');
    writeFileSync(join(starterApp,'main.aug'),'import identity from identity\nprint(value=identity(value=-9223372036854775808))\nprint(value=identity(value=7))\nprint(value=identity(value=9223372036854775807))\n');
    assert.equal(run(process.execPath,[cli,'run',starterApp,'--offline','--backend','llvm'],{env:{...env,PATH:'/no-native-tools',SDKROOT:'/missing-sdk',DEVELOPER_DIR:'/missing-native-tools'}}),'-9223372036854775808\n7\n9223372036854775807\n');
    assert.match(readFileSync(join(starter,'AGENTS.md'),'utf8'),/Start in src\/export\.aug/);
    process.stdout.write('Installed C native starter, same-file tests and ordinary offline LLVM imports passed.\n');
  }
  process.stdout.write('Installed native author archive and offline LLVM consumer passed; paired cache tampering rejected.\n');
}
