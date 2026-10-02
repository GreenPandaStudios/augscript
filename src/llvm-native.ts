import {copyFileSync,existsSync,lstatSync,mkdirSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import {basename,dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {generateLLVM,runtimeLayout,type RuntimeLayout} from './llvm.ts';
import {lowerToIR} from './ir.ts';
import type {CheckedProject} from './checker.ts';
import {compilerVersion} from './package-manager.ts';
import {nativePath,nativeHostTarget} from './native-contracts.ts';
import type {LLVMToolchain} from './compiler-packs.ts';
import {runtimeIdentifierSha256} from './runtime-abi.ts';
import {generateOpenApi} from './openapi.ts';
import {llvmPlatform,systemLibc} from './llvm-platform.ts';

export interface RuntimeComponent {libraries:string[];runtimeFiles:string[];metadata:string[]}
export interface RuntimePack {format:1;version:string;target:string;minimumOS?:string;minimumLibc?:string;layout:RuntimeLayout;identifierSha256:string;files:Record<string,string>;libraries:string[];staticCore?:string;components:Record<string,RuntimeComponent>;sourceSha256:string}
export interface NativeLinkInput {directory:string;libraries:string[];runtimeFiles:string[];artifactSha256?:string;metadata?:string[]}
export function readRuntimePack(directory:string):RuntimePack {
  if(!existsSync(join(directory,'runtime.json')))throw new Error('LLVM_RUNTIME: A matching prebuilt August runtime is not available. Contributor builds can run node scripts/build-runtime-pack.mjs.');
  const pack=JSON.parse(readFileSync(join(directory,'runtime.json'),'utf8')) as RuntimePack;
  const platform=llvmPlatform();
  if(pack.identifierSha256!==runtimeIdentifierSha256)throw new Error('LLVM_RUNTIME: Runtime operation identifiers differ from this compiler');
  if(!pack||pack.format!==1||pack.version!==compilerVersion()||pack.target!==platform.target||pack.minimumOS!==platform.minimumOS||pack.minimumLibc!==platform.minimumLibc||!pack.files||typeof pack.files!=='object'||Array.isArray(pack.files)||!Array.isArray(pack.libraries)||!pack.libraries.length||!/^([0-9a-f]{64})$/.test(pack.sourceSha256)||JSON.stringify(pack.layout)!==JSON.stringify(runtimeLayout))throw new Error('LLVM_RUNTIME: Runtime pack does not match this compiler, layout and target');
  const root=realpathSync(directory);
  for(const [path,expected] of Object.entries(pack.files)){
    nativePath(path);const file=join(root,path);
    if(!/^[0-9a-f]{64}$/.test(expected)||!lstatSync(file).isFile()||!realpathSync(file).startsWith(root+'/'))throw new Error('NATIVE_INTEGRITY: Invalid runtime pack member '+path);
    const actual=createHash('sha256').update(readFileSync(file)).digest('hex');
    if(actual!==expected)throw new Error('NATIVE_INTEGRITY: Runtime pack file changed: '+path);
  }
  for(const path of [...pack.libraries,platform.entry?'platform/start.o':'platform/libSystem.tbd'])if(!pack.files[nativePath(path)])throw new Error('LLVM_RUNTIME: Runtime manifest does not identify required file '+path);
  if(pack.staticCore!==undefined&&(typeof pack.staticCore!=='string'||!pack.staticCore.endsWith('.a')||!pack.files[nativePath(pack.staticCore)]))throw new Error('LLVM_RUNTIME: Runtime manifest does not identify its core archive');
  if(!pack.components||typeof pack.components!=='object'||Array.isArray(pack.components))throw new Error('LLVM_RUNTIME: Missing component contracts');
  for(const [name,component] of Object.entries(pack.components)){
    if(!/^[a-z][a-z0-9-]*$/.test(name)||!component||!Array.isArray(component.libraries)||!component.libraries.length||!Array.isArray(component.runtimeFiles)||!Array.isArray(component.metadata))throw new Error('LLVM_RUNTIME: Invalid component '+name);
    for(const path of [...component.libraries,...component.runtimeFiles,...component.metadata])if(typeof path!=='string'||!pack.files[nativePath(path)])throw new Error('LLVM_RUNTIME: Missing component file '+name+' '+path);
  }
  return pack;
}

/** Link target objects with prebuilt runtimes. Application builds never invoke Clang. */
export function compileLLVM(checked:CheckedProject,options:{output?:string;release?:boolean;coverage?:boolean;testIndex?:number;bundle?:string;native?:NativeLinkInput[];toolchain?:LLVMToolchain}={}) {
  const root=checked.project.root,target=nativeHostTarget();
  const config=checked.project.config;
  const release=options.release??config.optimization==='release';
  if(config.libraries.length||config.library_paths.length)throw new Error('LLVM_LINK_INPUT: LLVM builds require native libraries to be declared by a locked August package. Remove main.yaml libraries/library_paths or use the C reference backend for this local toolchain build.');
  const platform=llvmPlatform(target);
  const compilerRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
  const tools=options.toolchain?.tools??process.env.AUG_LLVM_HOME,runtime=resolve(options.toolchain?.runtime??process.env.AUG_RUNTIME_PACK??join(compilerRoot,'.aug-native/llvm/runtime'));
  if(!tools)throw new Error('LLVM_TOOLS: Prepare the compiler-owned tool pack before invoking the LLVM compilation API. The CLI installs it automatically.');
  const llc=join(tools,'bin/llc'),lld=join(tools,'bin/lld'),opt=join(tools,'bin/opt'),dsymutil=join(tools,'bin/dsymutil');
  if(platform.tools.some(tool=>!existsSync(join(tools,'bin',tool))))throw new Error('LLVM_TOOLS: The configured tool pack is missing '+platform.tools.join(', '));
  const pack=readRuntimePack(runtime),ir=lowerToIR(checked,{coverage:options.coverage}),module=generateLLVM(ir,{layout:pack.layout,release,triple:platform.triple});
  const directory=resolve(options.bundle??join(root,'.aug-build',...(options.testIndex===undefined?[]:['tests'])));
  mkdirSync(join(directory,'lib'),{recursive:true});
  const name=options.testIndex===undefined?'program':'test-'+options.testIndex;
  const source=join(directory,name+'.ll'),object=join(directory,name+'.o');
  const outputName=options.testIndex===undefined?options.output??config.output??basename(root):name;
  const output=resolve(directory,outputName);
  const deployment=join(dirname(output),'lib');mkdirSync(deployment,{recursive:true});
  writeFileSync(source,module);writeFileSync(join(directory,name+'.aug-ir.json'),JSON.stringify(ir,null,2)+'\n');
  if(config.openapi.enabled&&options.testIndex===undefined){
    const target=resolve(root,config.openapi.output);mkdirSync(dirname(target),{recursive:true});
    writeFileSync(target,JSON.stringify(generateOpenApi(checked).document,null,2)+'\n');
  }
  const run=(tool:string,args:string[])=>{const result=spawnSync(tool,args,{encoding:'utf8',cwd:root,env:{...process.env,SDKROOT:'/nonexistent',DEVELOPER_DIR:'/nonexistent'}});if(result.status!==0)throw new Error(`LLVM compilation failed with ${basename(tool)}.\n${result.stderr||result.error?.message||result.stdout}\nLLVM IR: ${source}`);return result;};
  const optimized=join(directory,name+'.optimized.ll');
  run(opt,['-passes=verify','-disable-output',source]);
  if(release)run(opt,['-passes=default<O2>','-S',source,'-o',optimized]);
  run(llc,['-filetype=obj',release?'-O=2':'-O=0','-relocation-model=pic',release?optimized:source,'-o',object]);
  const libraries:string[]=[],deployed=new Map<string,string>();
  const deploy=(origin:string,path:string,link:boolean)=>{nativePath(path);const destination=join(deployment,basename(path));
    const digest=createHash('sha256').update(readFileSync(join(origin,path))).digest('hex');
    if(deployed.has(destination)&&deployed.get(destination)!==digest)throw new Error('NATIVE_CONFLICT: Different runtime files have the same deployment name '+basename(path));
    deployed.set(destination,digest);
    copyFileSync(join(origin,path),destination);if(link)libraries.push(destination);
  };
  const metadata=(origin:string,namespace:string,paths:string[])=>{
    for(const path of paths){nativePath(path);const destination=join(dirname(output),'share','august-native',namespace,path);
      mkdirSync(dirname(destination),{recursive:true});copyFileSync(join(origin,path),destination);}
  };
  const staticCore=!ir.components.length&&pack.staticCore!==undefined;
  if(staticCore)libraries.push(join(runtime,pack.staticCore!));
  else for(const library of pack.libraries)deploy(runtime,library,true);
  for(const name of ir.components){
    const component=pack.components[name];if(!component)throw new Error('LLVM_RUNTIME: Compiler pack is missing the '+name+' runtime component. Install a matching complete compiler pack.');
    for(const path of component.libraries)deploy(runtime,path,true);
    for(const path of component.runtimeFiles)deploy(runtime,path,false);
    metadata(runtime,'runtime-'+pack.sourceSha256,component.metadata);
  }
  metadata(runtime,'runtime-'+pack.sourceSha256,[...Object.keys(pack.files).filter(path=>path.startsWith('licenses/')),'runtime.json']);
  for(const input of options.native??[]){for(const library of input.libraries)deploy(input.directory,library,true);for(const file of input.runtimeFiles)if(!input.libraries.includes(file))deploy(input.directory,file,false);
    if(input.metadata?.length){if(!/^[0-9a-f]{64}$/.test(input.artifactSha256??''))throw new Error('NATIVE_INTEGRITY: Deployment metadata requires an artifact identity');metadata(input.directory,input.artifactSha256!,input.metadata);}}
  if(platform.entry){
    const libc=systemLibc(platform),math=join(dirname(libc),'libm.so.6');
    if(staticCore&&!existsSync(math))throw new Error('LLVM_RUNTIME: The qualified GNU/Linux math runtime is absent. Install the operating system libc runtime; no development headers or compiler are required.');
    // Only the existing private checkpoint-hook boundary needs dynamic lookup.
    // August function exports and native runtime entry remain separate profiles.
    const coreExports=staticCore?['--gc-sections','--export-dynamic-symbol=aug_execution_current','--export-dynamic-symbol=aug_task_checkpoint_hook']:[];
    run(lld,['-flavor','gnu','-pie','-z','now','-z','noexecstack','--hash-style=gnu','--eh-frame-hdr',...coreExports,'--dynamic-linker',platform.loader!,'-e','_start','-rpath','$ORIGIN/lib',join(runtime,'platform/start.o'),object,...libraries,libc,...(staticCore?[math]:[]),'-o',output]);
  }
  else run(lld,['-flavor','darwin',...(staticCore?['-dead_strip','-exported_symbol','_aug_execution_current','-exported_symbol','_aug_task_checkpoint_hook']:[]),'-arch','arm64','-platform_version','macos','14.0','14.0','-Z','-fixup_chains','-adhoc_codesign','-e','_main','-rpath','@executable_path/lib',object,...libraries,join(runtime,'platform/libSystem.tbd'),'-o',output]);
  const debugInfo=platform.entry?output:output+'.dSYM';
  if(!platform.entry)run(dsymutil,[output,'-o',debugInfo]);
  const hash=(file:string)=>createHash('sha256').update(readFileSync(file)).digest('hex');
  writeFileSync(output+'.augmap.json',JSON.stringify({format:1,backend:'llvm',version:compilerVersion(),llvm:'23.1.2',mode:release?'release':'development',target:pack.target,minimumOS:pack.minimumOS,minimumLibc:pack.minimumLibc,sourceRevision:ir.sourceRevision,llvmIR:source,llvmIRSha256:hash(source),optimizedIRSha256:release?hash(optimized):undefined,object,objectSha256:hash(object),executableSha256:hash(output),debugInfo,debugInfoSha256:hash(platform.entry?output:join(debugInfo,'Contents/Resources/DWARF',basename(output))),runtime:pack.sourceSha256,compilerArtifact:options.toolchain?.archiveSha256,developmentToolchain:options.toolchain?.developmentOverride??true,nativeArtifacts:options.native?.map(input=>input.artifactSha256),libraries:[...deployed].map(([file,sha256])=>({file:basename(file),sha256})),symbols:ir.functions.map(f=>({name:f.name,sourceName:f.sourceName,location:f.span}))},null,2)+'\n');
  return {output,status:0,error:'',diagnostics:[]};
}
