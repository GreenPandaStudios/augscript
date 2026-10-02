import {existsSync,readFileSync,renameSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {compilerVersion,type PackageLock} from './package-manager.ts';
import {ensureVerifiedArchive,type VerifiedArchive,type LLVMCompilerLock} from './native-artifacts.ts';
import {nativeHostTarget} from './native-contracts.ts';
import {withPackageLockAsync} from './package-locking.ts';
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
  const file=join(compilerRoot,'native/compiler-packs.json');
  if(!existsSync(file))throw new Error('LLVM_TOOLS: This compiler has no published LLVM tool manifest. Install the matching LLVM preview release.');
  const manifest=JSON.parse(readFileSync(file,'utf8')) as {format:1;compiler:string;llvm:string;packs:{host:string;target:string;minimumOS?:string;minimumLibc?:string;archive:VerifiedArchive}[]};
  if(manifest.format!==1||manifest.compiler!==compilerVersion()||manifest.llvm!=='23.1.2'||!Array.isArray(manifest.packs))throw new Error('LLVM_TOOLS: Invalid compiler-owned LLVM manifest');
  const host=process.platform+'-'+process.arch,target=nativeHostTarget(),pack=manifest.packs.find(p=>p.host===host&&p.target===target.triple);
  if(!pack)throw new Error('NATIVE_TARGET: No compiler pack is published for '+platform.host+'. Available compiler packs: '+manifest.packs.map(p=>p.host).join(', '));
  if(pack.minimumOS!==platform.minimumOS||pack.minimumLibc!==platform.minimumLibc)throw new Error('LLVM_TOOLS: Compiler manifest has a different platform baseline');
  const prepare=async():Promise<LLVMToolchain>=>{
    const lockFile=project?join(project.root,'aug.lock.json'):undefined,initial=lockFile&&existsSync(lockFile)?readFileSync(lockFile,'utf8'):undefined;
    const lock:PackageLock=initial?JSON.parse(initial):{format:1,compiler:compilerVersion(),specifications:{},roots:{},packages:[],npm:{}};
    if(lock.compiler!==compilerVersion())throw new Error('LLVM_LOCK: Project lock belongs to another compiler. Run aug install.');
    if(project?.frozen&&(!lock.native?.compiler||lock.native.compiler.artifactSha256!==pack.archive.sha256))throw new Error('LLVM_LOCK: Frozen build has no matching compiler artifact. Run aug build --backend llvm online once.');
    const directory=await ensureVerifiedArchive(pack.archive,{offline,executables:platform.tools.map(tool=>'bin/'+tool)});
    const identity=JSON.parse(readFileSync(join(directory,'compiler-pack.json'),'utf8'));
    if(identity.format!==1||identity.compiler!==manifest.compiler||identity.llvm!==manifest.llvm||identity.host!==host||identity.target!==target.triple)throw new Error('LLVM_TOOLS: Verified archive has a different compiler/host/target identity');
    const runtime=readRuntimePack(join(directory,'runtime'));
    if(identity.runtime!==runtime.sourceSha256)throw new Error('LLVM_TOOLS: Compiler pack runtime identity differs from its runtime manifest');
    const selection:LLVMCompilerLock={version:manifest.compiler,llvm:manifest.llvm,host,target:target.triple,artifactSha256:pack.archive.sha256,runtimeSha256:runtime.sourceSha256};
    if(project?.frozen&&JSON.stringify(lock.native?.compiler)!==JSON.stringify(selection))throw new Error('LLVM_LOCK: Frozen compiler/runtime identity changed');
    if(lockFile&&!project?.frozen){
      lock.native??={format:1,targets:{}};lock.native.compiler=selection;
      if((existsSync(lockFile)?readFileSync(lockFile,'utf8'):undefined)!==initial)throw new Error('LLVM_LOCK: Source lock changed during compiler installation; retry');
      writeFileSync(lockFile+'.llvm.tmp',JSON.stringify(lock,null,2)+'\n');renameSync(lockFile+'.llvm.tmp',lockFile);
    }
    return {tools:directory,runtime:join(directory,'runtime'),archiveSha256:pack.archive.sha256,developmentOverride:false};
  };
  return project?withPackageLockAsync(join(project.root,'.aug-install.lock'),prepare):prepare();
}
