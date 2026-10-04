import {accessSync,constants,existsSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {compilerVersion,readPackageLock,type PackageLock} from './package-manager.ts';
import {ensureVerifiedArchive,type VerifiedArchive,type LLVMCompilerLock} from './native-artifacts.ts';
import {nativeHostTarget} from './native-contracts.ts';
import {withPackageLockAsync} from './package-locking.ts';
import {replacePackageText} from './package-storage.ts';
import {readRuntimePack} from './llvm-native.ts';
import {llvmPlatform} from './llvm-platform.ts';

export interface LLVMToolchain {tools:string;runtime:string;archiveSha256?:string;developmentOverride:boolean}
/** The CLI owns installation. Packages cannot choose or execute a compiler driver. */
export async function prepareLLVMCompiler(offline=false,project?:{root:string;frozen?:boolean}):Promise<LLVMToolchain>{
  const compilerRoot=resolve(fileURLToPath(new URL('..',import.meta.url)));
  const platform=llvmPlatform();
  if(process.env.AUG_LLVM_HOME){
    const tools=resolve(process.env.AUG_LLVM_HOME),runtime=resolve(process.env.AUG_RUNTIME_PACK??join(compilerRoot,'.aug-native/llvm/runtime'));
    const version=spawnSync(join(tools,'bin/llc'),['--version'],{encoding:'utf8'});
    if(version.status!==0||!version.stdout.includes('LLVM version 23.1.2'))throw new Error('LLVM_TOOLS: Contributor override requires LLVM 23.1.2');
    readRuntimePack(runtime);
    if(project?.frozen)throw new Error('LLVM_LOCK: A frozen build requires the pinned compiler pack. Remove contributor toolchain overrides.');
    return {tools,runtime,developmentOverride:true};
  }
  const {manifest,pack,host,target}=compilerPackSelection(platform);
  const prepare=async():Promise<LLVMToolchain>=>{
    const lockFile=project?join(project.root,'aug.lock.json'):undefined,initial=lockFile&&existsSync(lockFile)?readFileSync(lockFile,'utf8'):undefined;
    const lock:PackageLock=initial?readPackageLock(lockFile!):{format:1,compiler:compilerVersion(),specifications:{},roots:{},packages:[],npm:{}};
    if(lock.compiler!==compilerVersion())throw new Error('LLVM_LOCK: Project lock belongs to another compiler. Run aug install.');
    const previous=lock.native?.compilers?.[host];
    if(project?.frozen&&(!previous||previous.artifactSha256!==pack.archive.sha256))throw new Error('LLVM_LOCK: Frozen build has no matching compiler artifact for '+host+'. Run aug build --backend llvm online once on this host.');
    const directory=await ensureVerifiedArchive(pack.archive,{offline,executables:platform.tools.map(tool=>'bin/'+tool)});
    const selection=compilerPackIdentity(directory,{manifest,pack,host,target});
    if(project?.frozen&&!compilerLockMatches(selection,previous))throw new Error('LLVM_LOCK: Frozen compiler/runtime identity changed for '+host);
    if(lockFile&&!project?.frozen){
      lock.native??={format:1,targets:{}};lock.native.compilers??={};lock.native.compilers[host]=selection;
      if((existsSync(lockFile)?readFileSync(lockFile,'utf8'):undefined)!==initial)throw new Error('LLVM_LOCK: Source lock changed during compiler installation; retry');
      replacePackageText(lockFile,JSON.stringify(lock,null,2)+'\n');
    }
    return {tools:directory,runtime:join(directory,'runtime'),archiveSha256:pack.archive.sha256,developmentOverride:false};
  };
  return project?withPackageLockAsync(join(project.root,'.aug-install.lock'),prepare):prepare();
}

/** Read the installed compiler's qualified host selection without preparing a cache. */
export function compilerPackSelection(platform=llvmPlatform()){
  const file=join(resolve(fileURLToPath(new URL('..',import.meta.url))),'native/compiler-packs.json');
  if(!existsSync(file))throw new Error('LLVM_TOOLS: This compiler has no published LLVM tool manifest. Install the matching LLVM preview release.');
  const manifest=JSON.parse(readFileSync(file,'utf8')) as {format:1;compiler:string;llvm:string;packs:{host:string;target:string;minimumOS?:string;minimumLibc?:string;archive:VerifiedArchive}[]};
  if(manifest.format!==1||manifest.compiler!==compilerVersion()||manifest.llvm!=='23.1.2'||!Array.isArray(manifest.packs))throw new Error('LLVM_TOOLS: Invalid compiler-owned LLVM manifest');
  const host=process.platform+'-'+process.arch,target=nativeHostTarget(),pack=manifest.packs.find(p=>p.host===host&&p.target===target.triple);
  if(!pack)throw new Error('NATIVE_TARGET: No compiler pack is published for '+platform.host+'. Available compiler packs: '+manifest.packs.map(p=>p.host).join(', '));
  if(pack.minimumOS!==platform.minimumOS||pack.minimumLibc!==platform.minimumLibc)throw new Error('LLVM_TOOLS: Compiler manifest has a different platform baseline');
  return {manifest,pack,host,target};
}

/** Compare the closed lock schema by field, independent of JSON key order. */
export function compilerLockMatches(expected:LLVMCompilerLock,actual:unknown):boolean {
  if(!actual||typeof actual!=='object'||Array.isArray(actual))return false;
  const fields=['version','llvm','host','target','artifactSha256','runtimeSha256'] as const;
  return Object.keys(actual).length===fields.length&&fields.every(key=>(actual as LLVMCompilerLock)[key]===expected[key]);
}

export class CompilerToolAccessError extends Error {}

/** Read the host/runtime contract after the caller has verified the archive's complete file set. */
export function compilerPackIdentity(directory:string,selection:ReturnType<typeof compilerPackSelection>):LLVMCompilerLock {
  const {manifest,pack,host,target}=selection,identity=JSON.parse(readFileSync(join(directory,'compiler-pack.json'),'utf8'));
  if(identity.format!==1||identity.compiler!==manifest.compiler||identity.llvm!==manifest.llvm||identity.host!==host||identity.target!==target.triple)
    throw new Error('LLVM_TOOLS: Verified archive has a different compiler/host/target identity');
  const runtime=readRuntimePack(join(directory,'runtime'));
  if(identity.runtime!==runtime.sourceSha256)throw new Error('LLVM_TOOLS: Compiler pack runtime identity differs from its runtime manifest');
  for(const tool of llvmPlatform().tools){
    const path=join(directory,'bin',tool);
    if(!existsSync(path))throw new Error('LLVM_TOOLS: Compiler archive has no required tool '+path);
    try{accessSync(path,constants.X_OK);}
    catch(error){throw new CompilerToolAccessError('LLVM_TOOLS: Cached tool is not executable: '+path,{cause:error});}
  }
  return {version:manifest.compiler,llvm:manifest.llvm,host,target:target.triple,artifactSha256:pack.archive.sha256,runtimeSha256:runtime.sourceSha256};
}
