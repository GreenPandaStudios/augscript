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

export interface RuntimeComponent {libraries:string[];runtimeFiles:string[];metadata:string[]}
export interface RuntimePack {format:1;version:string;target:string;minimumOS:string;layout:RuntimeLayout;identifierSha256:string;files:Record<string,string>;libraries:string[];components:Record<string,RuntimeComponent>;sourceSha256:string}
export interface NativeLinkInput {directory:string;libraries:string[];runtimeFiles:string[];artifactSha256?:string;metadata?:string[]}
export function readRuntimePack(directory:string):RuntimePack {
  if(!existsSync(join(directory,'runtime.json')))throw new Error('LLVM_RUNTIME: A matching prebuilt August runtime is not available. Contributor builds can run node scripts/build-runtime-pack.mjs.');
  const pack=JSON.parse(readFileSync(join(directory,'runtime.json'),'utf8')) as RuntimePack;
  if(pack.identifierSha256!==runtimeIdentifierSha256)throw new Error('LLVM_RUNTIME: Runtime operation identifiers differ from this compiler');
  if(!pack||pack.format!==1||pack.version!==compilerVersion()||pack.target!==nativeHostTarget().triple||pack.minimumOS!=='14.0'||!pack.files||typeof pack.files!=='object'||Array.isArray(pack.files)||!Array.isArray(pack.libraries)||!pack.libraries.length||!/^([0-9a-f]{64})$/.test(pack.sourceSha256)||JSON.stringify(pack.layout)!==JSON.stringify(runtimeLayout))throw new Error('LLVM_RUNTIME: Runtime pack does not match this compiler, layout and target');
  const root=realpathSync(directory);
  for(const [path,expected] of Object.entries(pack.files)){
    nativePath(path);const file=join(root,path);
    if(!/^[0-9a-f]{64}$/.test(expected)||!lstatSync(file).isFile()||!realpathSync(file).startsWith(root+'/'))throw new Error('NATIVE_INTEGRITY: Invalid runtime pack member '+path);
    const actual=createHash('sha256').update(readFileSync(file)).digest('hex');
    if(actual!==expected)throw new Error('NATIVE_INTEGRITY: Runtime pack file changed: '+path);
  }
  for(const path of [...pack.libraries,'platform/libSystem.tbd'])if(!pack.files[nativePath(path)])throw new Error('LLVM_RUNTIME: Runtime manifest does not identify required file '+path);
  if(!pack.components||typeof pack.components!=='object'||Array.isArray(pack.components))throw new Error('LLVM_RUNTIME: Missing component contracts');
  for(const [name,component] of Object.entries(pack.components)){
    if(!/^[a-z][a-z0-9-]*$/.test(name)||!component||!Array.isArray(component.libraries)||!component.libraries.length||!Array.isArray(component.runtimeFiles)||!Array.isArray(component.metadata))throw new Error('LLVM_RUNTIME: Invalid component '+name);
    for(const path of [...component.libraries,...component.runtimeFiles,...component.metadata])if(typeof path!=='string'||!pack.files[nativePath(path)])throw new Error('LLVM_RUNTIME: Missing component file '+name+' '+path);
  }
  return pack;
}

/** Link target objects with prebuilt runtimes. Application builds never invoke Clang. */
export function compileLLVM(checked:CheckedProject,options:{output?:string;release?:boolean;testIndex?:number;bundle?:string;native?:NativeLinkInput[];toolchain?:LLVMToolchain}={}) {
  const root=checked.project.root,target=nativeHostTarget();
  if(target.triple!=='aarch64-apple-darwin'||Number(target.minimumOS?.split('.')[0])<14)throw new Error('NATIVE_TARGET: LLVM preview currently requires macOS 14+ ARM64');
  const compilerRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
  const tools=options.toolchain?.tools??process.env.AUG_LLVM_HOME,runtime=resolve(options.toolchain?.runtime??process.env.AUG_RUNTIME_PACK??join(compilerRoot,'.aug-native/llvm/runtime'));
  if(!tools)throw new Error('LLVM_TOOLS: Prepare the compiler-owned tool pack before invoking the LLVM compilation API. The CLI installs it automatically.');
  const llc=join(tools,'bin/llc'),lld=join(tools,'bin/lld'),opt=join(tools,'bin/opt');
  if(!existsSync(llc)||!existsSync(lld)||!existsSync(opt))throw new Error('LLVM_TOOLS: The configured tool pack is missing llc, opt or lld');
  const pack=readRuntimePack(runtime),ir=lowerToIR(checked),module=generateLLVM(ir,{layout:pack.layout});
  const directory=resolve(options.bundle??join(root,'.aug-build',...(options.testIndex===undefined?[]:['tests'])));
  mkdirSync(join(directory,'lib'),{recursive:true});
  const name=options.testIndex===undefined?'program':'test-'+options.testIndex;
  const source=join(directory,name+'.ll'),object=join(directory,name+'.o'),output=options.output?resolve(directory,options.output):join(directory,options.testIndex===undefined?basename(root):name);
  const deployment=join(dirname(output),'lib');mkdirSync(deployment,{recursive:true});
  writeFileSync(source,module);writeFileSync(join(directory,name+'.aug-ir.json'),JSON.stringify(ir,null,2)+'\n');
  const run=(tool:string,args:string[])=>{const result=spawnSync(tool,args,{encoding:'utf8',cwd:root,env:{...process.env,SDKROOT:'/nonexistent',DEVELOPER_DIR:'/nonexistent'}});if(result.status!==0)throw new Error(`LLVM compilation failed with ${basename(tool)}.\n${result.stderr||result.error?.message||result.stdout}\nLLVM IR: ${source}`);return result;};
  const optimized=join(directory,name+'.optimized.ll');
  run(opt,['-passes=verify','-disable-output',source]);
  if(options.release)run(opt,['-passes=default<O2>','-S',source,'-o',optimized]);
  run(llc,['-filetype=obj',options.release?'-O=2':'-O=0','-relocation-model=pic',options.release?optimized:source,'-o',object]);
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
  for(const library of pack.libraries)deploy(runtime,library,true);
  for(const name of ir.components){
    const component=pack.components[name];if(!component)throw new Error('LLVM_RUNTIME: Compiler pack is missing the '+name+' runtime component. Install a matching complete compiler pack.');
    for(const path of component.libraries)deploy(runtime,path,true);
    for(const path of component.runtimeFiles)deploy(runtime,path,false);
    metadata(runtime,'runtime-'+pack.sourceSha256,component.metadata);
  }
  metadata(runtime,'runtime-'+pack.sourceSha256,[...Object.keys(pack.files).filter(path=>path.startsWith('licenses/')),'runtime.json']);
  for(const input of options.native??[]){for(const library of input.libraries)deploy(input.directory,library,true);for(const file of input.runtimeFiles)if(!input.libraries.includes(file))deploy(input.directory,file,false);
    if(input.metadata?.length){if(!/^[0-9a-f]{64}$/.test(input.artifactSha256??''))throw new Error('NATIVE_INTEGRITY: Deployment metadata requires an artifact identity');metadata(input.directory,input.artifactSha256!,input.metadata);}}
  run(lld,['-flavor','darwin','-arch','arm64','-platform_version','macos','14.0','14.0','-Z','-fixup_chains','-adhoc_codesign','-e','_main','-rpath','@executable_path/lib',object,...libraries,join(runtime,'platform/libSystem.tbd'),'-o',output]);
  writeFileSync(output+'.augmap.json',JSON.stringify({format:1,backend:'llvm',version:compilerVersion(),target:pack.target,sourceRevision:ir.sourceRevision,llvmIR:source,object,runtime:pack.sourceSha256,compilerArtifact:options.toolchain?.archiveSha256,developmentToolchain:options.toolchain?.developmentOverride??true,nativeArtifacts:options.native?.map(input=>input.artifactSha256),libraries:[...deployed].map(([file,sha256])=>({file:basename(file),sha256})),symbols:ir.functions.map(f=>({name:f.name,location:f.span}))},null,2)+'\n');
  return {output,status:0,error:'',diagnostics:[]};
}
