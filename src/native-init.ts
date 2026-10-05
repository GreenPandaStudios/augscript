import {createHash} from 'node:crypto';
import {existsSync,lstatSync,mkdirSync,mkdtempSync,readFileSync,readdirSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {basename,dirname,isAbsolute,join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {c as archive} from 'tar';
import {initPackage,compilerVersion,readPackage} from './package-manager.ts';
import {nativeTarget,type NativeArtifact,type NativeDescriptor} from './native-contracts.ts';
import {bindNativeHeader} from './native-bindings.ts';
import {archiveFileManifestSha256,readRegularNativeFile} from './native-archive.ts';
import {verifyNativeArtifact} from './native-artifacts.ts';
import {withPackageLock} from './package-locking.ts';
import {checkedProjectWithTests} from './refactoring.ts';
import {formatSource,sourceStyle} from './source-style.ts';
import type {SourceStyle} from './formatter.ts';

export interface NativeStarterOptions {
  name:string;repository:string;artifactURL:string;license:string;clang:string;ar:string;
  preferences?:Partial<SourceStyle>;
}
export interface NativeStarterReport {
  directory:string;package:string;compiler:string;artifact:string;archive:string;
  execution:'not-run';publication:'not-run';
}
export class NativeStarterCommittedError extends Error {
  readonly code='NATIVE_INIT_COMMITTED';
  readonly report:NativeStarterReport;
  constructor(report:NativeStarterReport,cause:unknown){
    super('NATIVE_INIT_COMMITTED: Created '+report.directory+', but writer cleanup failed. The checked source and archive are preserved. Inspect the remaining lock before retrying.',{cause});
    this.report=report;
  }
}
const hash=(bytes:string|Buffer)=>createHash('sha256').update(bytes).digest('hex');
const fail=(message:string):never=>{throw new Error('NATIVE_INIT: '+message);};
const regularBytes=(file:string,maximum=1024*1024)=>{
  const chunks:Buffer[]=[];readRegularNativeFile(file,maximum,'unpacked',bytes=>chunks.push(Buffer.from(bytes)));return Buffer.concat(chunks);
};
const https=(value:string,label:string)=>{
  let url:URL;try{url=new URL(value);}catch{fail(label+' must be an HTTPS URL.');}
  if(url!.protocol!=='https:'||url!.username||url!.password||url!.hash)fail(label+' must use HTTPS without credentials or a fragment.');
};
function emptyDestination(root:string):void {
  const status=lstatSync(root,{throwIfNoEntry:false});
  if(status&&(!status.isDirectory()||status.isSymbolicLink()||readdirSync(root).length))
    fail('Select a new or empty real directory: '+root);
}

/** Create a real scalar C starter with explicit maintainer tools and source-owned artifact pins.
 * Initial authoring supports macOS ARM64 only. It builds and checks an archive in isolation;
 * consumers do not build it. Build and check failures preserve the destination; cleanup failures after creation
 * report the preserved project. Cache preparation,
 * execution, repository creation and publication remain separate explicit actions.
 */
export function initNativePackage(destination:string,options:NativeStarterOptions):NativeStarterReport {
  if(process.platform!=='darwin'||process.arch!=='arm64')fail('The C starter currently requires macOS ARM64. Use a reviewed package layout for another maintainer target; no cross-build was started.');
  https(options.repository,'Repository');https(options.artifactURL,'Artifact URL');
  for(const [name,tool] of [['Clang',options.clang],['ar',options.ar]])
    if(!isAbsolute(tool)||!existsSync(tool))fail(name+' requires an explicit absolute executable path. No tool is installed automatically.');
  const license=regularBytes(resolve(options.license));if(!license.length)fail('Supply a nonempty license file for your own library.');
  const style=sourceStyle(options.preferences),root=resolve(destination),parent=dirname(root);
  emptyDestination(root);mkdirSync(parent,{recursive:true});
  let committed:NativeStarterReport|undefined;
  try{return withPackageLock(root+'.aug-native-init.lock',()=>{
    emptyDestination(root);const stage=mkdtempSync(join(parent,'.aug-native-init-'));
    try{
      initPackage(stage,options.name,false,style);
      const target=nativeTarget('aarch64-apple-darwin','14.0'),id='macos-arm64';
      const symbol='aug_'+options.name.split('/').at(-1)!.replace(/[^A-Za-z0-9_]/g,'_')+'_'+hash(options.name).slice(0,8)+'_identity_v1';
      const header='native/include/api.h',source='native/adapter.c';
      const descriptor:NativeDescriptor={format:1,profile:'aug-native-abi-1',resources:[],functions:[{
        module:'api',name:'_identity',symbol,params:[{name:'value',kind:'i64'}],result:{kind:'i64'},
        callingConvention:'C',status:'direct',uses:[],changes:[],thread:'caller',retainsInputs:false,workerSafe:false
      }]};
      mkdirSync(join(stage,'native/include'),{recursive:true});
      writeFileSync(join(stage,header),'#ifndef AUG_NATIVE_STARTER_IDENTITY_H\n#define AUG_NATIVE_STARTER_IDENTITY_H\n#include <stdint.h>\nint64_t '+symbol+'(int64_t value);\n#endif\n');
      writeFileSync(join(stage,source),'#include "include/api.h"\nint64_t '+symbol+'(int64_t value) { return value; }\n');
      const descriptorBytes=JSON.stringify(descriptor,null,2)+'\n';writeFileSync(join(stage,'native.abi.json'),descriptorBytes);
      rmSync(join(stage,'src/arithmetic.aug'));
      writeFileSync(join(stage,'src/export.aug'),'export identity from api\n');
      const api=`extern C _identity(int value) returns int\n\n/** Return the same signed 64-bit value through the native C implementation. */\nidentity(int value):\n    unsafe:\n        return _identity(value)\n\ntest identity:\n    when signed_values:\n        it preserves_zero:\n            assert(identity(value=0) == 0)\n        it preserves_negative:\n            assert(identity(value=-1) == -1)\n        it preserves_positive:\n            assert(identity(value=7) == 7)\n`;
      writeFileSync(join(stage,'src/api.aug'),formatSource(join(stage,'src/api.aug'),api,style));
      writeFileSync(join(stage,'LICENSE'),license);writeFileSync(join(stage,'THIRD_PARTY_NOTICES.md'),license);
      const build=join(stage,'.aug-build/native'),payload=join(build,'payload'),checked=join(build,'checked');mkdirSync(payload,{recursive:true});
      const flags=['-target',target.triple,'-mmacosx-version-min=14.0','-march=armv8-a','-std=c11'];
      bindNativeHeader({header:join(stage,header),contract:join(stage,'native.abi.json'),target:target.triple,clang:options.clang,flags:flags.slice(2),output:checked});
      const invoke=(tool:string,args:string[])=>{
        const result=spawnSync(tool,args,{cwd:stage,encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024,env:{...process.env,ZERO_AR_DATE:'1'}});
        if(result.status!==0)fail('The selected maintainer tool failed: '+tool+'\n'+(result.error?.message??result.stderr).slice(0,8000));
        return result.stdout.trim();
      };
      const compile=[...flags,'-O2','-fno-common','-Wall','-Wextra','-Werror','-c',source,'-o','.aug-build/native/identity.o'];
      invoke(options.clang,compile);invoke(options.ar,['rcs','.aug-build/native/payload/libidentity.a','.aug-build/native/identity.o']);
      const inputNames=[header,source,'native.abi.json','src/api.aug','src/export.aug','main.yaml','LICENSE'];
      const inputs=inputNames.map(file=>({file,sha256:hash(readFileSync(join(stage,file)))}));
      const headerCheck=regularBytes(join(checked,'header-check.json'));
      writeFileSync(join(payload,'header-check.json'),headerCheck);
      const provenance={format:1,target,inputs,sourceDigest:hash(JSON.stringify(inputs)),compiler:JSON.parse(headerCheck.toString()).compiler,
        compile,archive:['rcs','libidentity.a','identity.o'],tools:{clang:options.clang,ar:options.ar},ownership:'author-declared',execution:'not-run',publication:'not-run'};
      writeFileSync(join(payload,'provenance.json'),JSON.stringify(provenance,null,2)+'\n');writeFileSync(join(payload,'THIRD_PARTY_NOTICES.md'),license);
      const members=['libidentity.a','header-check.json','provenance.json','THIRD_PARTY_NOTICES.md'];
      const files=Object.fromEntries(members.map(file=>[file,hash(regularBytes(join(payload,file),64*1024*1024))]));
      writeFileSync(join(payload,'files.json'),JSON.stringify({format:1,files},null,2)+'\n');
      const transport=join(build,id+'.tar.gz');archive({file:transport,cwd:payload,gzip:true,sync:true,portable:true,noMtime:true},[...members,'files.json']);
      const bytes=regularBytes(transport,64*1024*1024),unpacked=[...members,'files.json'].reduce((total,file)=>total+lstatSync(join(payload,file)).size,0);
      const artifact:NativeArtifact={id,target,url:options.artifactURL,sha256:hash(bytes),fileManifest:'files.json',fileManifestSha256:hash(readFileSync(join(payload,'files.json'))),
        maximumDownloadBytes:bytes.length,maximumUnpackedBytes:unpacked+4096,link:{kind:'static',libraries:['libidentity.a']},runtime:{files:[],relocation:'loader-relative'},
        components:[],provenance:'provenance.json',notices:'THIRD_PARTY_NOTICES.md'};
      if(archiveFileManifestSha256(transport,artifact)!==artifact.fileManifestSha256)fail('Produced archive has a mismatched member manifest.');
      verifyNativeArtifact(payload,artifact);
      const manifest=JSON.parse(readFileSync(join(stage,'aug-package.json'),'utf8'));
      manifest.format=2;manifest.native={profile:descriptor.profile,bindings:'native.abi.json',bindingsSha256:hash(descriptorBytes),
        upstream:{repository:options.repository,version:manifest.version,sourceRevision:provenance.sourceDigest},artifacts:[artifact]};
      writeFileSync(join(stage,'aug-package.json'),JSON.stringify(manifest,null,2)+'\n');readPackage(stage);
      const program=checkedProjectWithTests(stage,new Map());
      const failures=program.diagnostics.filter(issue=>issue.severity!=='warning');
      if(failures.length)fail('Generated August bindings or tests failed checking:\n'+failures.map(issue=>issue.code+': '+issue.message).join('\n'));
      writeFileSync(join(stage,'native/build.json'),JSON.stringify({format:1,target,header,source,compile,archive:['rcs','libidentity.a','identity.o'],tools:provenance.tools,compiler:provenance.compiler,inputs},null,2)+'\n');
      const instructions='\n## Native adapter\n\nReview native.abi.json before extending the adapter. Keep physical C declarations in\nnative/include/api.h, implementation in native/adapter.c, and safe public APIs and\ntests together in src/api.aug. Inputs are call-local; workerSafe is false. This\nscalar example owns no handles and establishes no resource-release contract.\n\nRecheck the header with explicit Clang, rebuild and hash the real archive when\nsources change. Never invent artifact or binding pins. Consumers must not run\npackage recipes. Run tests through LLVM and review native provenance before a tag.\n';
      writeFileSync(join(stage,'AGENTS.md'),readFileSync(join(stage,'AGENTS.md'),'utf8')+instructions);
      writeFileSync(join(stage,'README.md'),`# ${options.name}\n\nA signed 64-bit identity function implemented in C and imported as ordinary August source.\n\nThe starter built a real macOS ARM64 archive with a macOS 14 floor. Header and August checks passed; native execution and publication have not run. The build record is native/build.json. Review its explicit tools, descriptor, license and provenance before publishing.\n\nPrepare and test the local archive:\n\n\`\`\`sh\naug package cache-native . --artifact ${id} --archive .aug-build/native/${id}.tar.gz\naug check\naug test --backend llvm\naug spec\naug package check\n\`\`\`\n\nThe first test run can download the pinned August compiler and runtime packs. The native library itself comes from the local archive you just cached. Once those packs are cached, aug test --offline --backend llvm reuses them.\n\nA neighboring application's main.yaml can declare a local package alias:\n\n\`\`\`yaml\npackages:\n  identity: ${JSON.stringify('../'+basename(root))}\n\`\`\`\n\nIts main.aug imports the safe API:\n\n\`\`\`text\nimport identity from identity\nprint(value=identity(value=7))\n\`\`\`\n\nRun that application with aug run --offline. Publish the exact archive at the declared HTTPS artifact URL, commit the checked source and specs, and tag the repository before sharing its URL. No repository, tag or upload has been created. Generated binaries remain under .aug-build and must not be committed.\n\nThis starter supports one scalar C function on macOS ARM64. Rebuilding after edits, additional targets, owned resources, C++ and Rust adapters and hosted artifact production need their reviewed maintainer workflows. See https://greenpandastudios.github.io/augscript/native-packages.\n`);
      rmSync(payload,{recursive:true,force:true});rmSync(checked,{recursive:true,force:true});rmSync(join(build,'identity.o'));
      const created:NativeStarterReport={directory:root,package:options.name,compiler:compilerVersion(),artifact:id,archive:join(root,'.aug-build/native',id+'.tar.gz'),execution:'not-run',publication:'not-run'};
      emptyDestination(root);renameSync(stage,root);committed=created;
      return created;
    }finally{rmSync(stage,{recursive:true,force:true});}
  });}catch(error){if(committed)throw new NativeStarterCommittedError(committed,error);throw error;}
}
