import {accessSync,constants,existsSync,readFileSync,statSync,lstatSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {homedir} from 'node:os';
import {compilerVersion,readPackageLock} from './package-manager.ts';
import type {PackageLock} from './package-manager.ts';
import {compilerPackSelection,compilerPackIdentity,compilerLockMatches,CompilerToolAccessError} from './compiler-packs.ts';
import {verifyArtifactFiles,verifyNativeArtifact,nativePackageSelections,nativeSelectionIdentity,nativeTargetKey,validateNativeComponents,NativeArtifactContractError} from './native-artifacts.ts';
import type {LLVMCompilerLock} from './native-artifacts.ts';
import {nativeHostTarget} from './native-contracts.ts';
import type {NativeTarget} from './native-contracts.ts';
import {llvmPlatform,systemLibc} from './llvm-platform.ts';
import {loadProject} from './project.ts';
import {checkProject} from './checker.ts';

export interface DistributionCheck {id:string;status:'ok'|'warning'|'error';message:string;recovery?:string}
export interface DistributionArtifact {
  package:string;id:string;sha256:string;target:NativeTarget;url:string;directory:string;
  libraries:string[];runtimeFiles:string[];status:'missing'|'verified'|'invalid';message:string;recovery?:string;
}
export interface DistributionReport {
  format:1;compiler:string;host:string;project:string;ready:boolean;offlineReady:boolean;frozenReady:boolean;
  checks:DistributionCheck[];artifacts:DistributionArtifact[];backend:'llvm';execution:'not-run';
}
const message=(error:unknown):string=>error instanceof Error?error.message:String(error);
function writable(path:string):void {
  let ancestor=path;
  while(!existsSync(ancestor)&&dirname(ancestor)!==ancestor)ancestor=dirname(ancestor);
  if(!statSync(ancestor).isDirectory())throw new Error('Expected a directory: '+ancestor);
  accessSync(ancestor,constants.W_OK|constants.X_OK);
}
const damagedCache=(directory:string,command:string)=>'Stop active builds before removing the damaged cache entry '+JSON.stringify(directory)+'. Then '+command+' online to restore verified bytes.';


/** Diagnose source, locked selections and cached bytes without downloads, execution or writes. */
export function inspectDistribution(directory:string):DistributionReport {
  const root=resolve(directory),checks:DistributionCheck[]=[],artifacts:DistributionArtifact[]=[],compiler=compilerVersion(),host=process.platform+'-'+process.arch;
  let compilerCached=false,compilerLocked=false,nativeLocked=false,projectChecked=false,compilerSelection:LLVMCompilerLock|undefined;
  checks.push({id:'node',status:Number(process.versions.node.split('.')[0])>=24?'ok':'error',message:'Node.js '+process.versions.node,
    ...(Number(process.versions.node.split('.')[0])<24?{recovery:'Install Node.js 24 or newer, then retry aug doctor.'}:{})});
  const cache=resolve(process.env.AUG_NATIVE_ARTIFACT_CACHE??join(homedir(),'.cache/augscript/native-artifacts'));
  for(const [id,path] of [['project-write',root],['source-cache-write',join(root,'.aug-packages')],['cache-write',cache]]){
    try{writable(path);checks.push({id,status:'ok',message:'Writable: '+path});}
    catch(error){checks.push({id,status:'error',message:message(error),recovery:id==='cache-write'?'Set AUG_NATIVE_ARTIFACT_CACHE to a directory you own.':'Choose a project directory and installed source cache you can write.'});}
  }
  const overrides=!!(process.env.AUG_LLVM_HOME||process.env.AUG_RUNTIME_PACK);
  if(overrides)checks.push({id:'toolchain-override',status:'warning',message:'Contributor toolchain overrides are active; this report checks the ordinary pinned consumer pack.',recovery:'Unset AUG_LLVM_HOME and AUG_RUNTIME_PACK to use the verified consumer pack. Overrides cannot satisfy frozen builds.'});
  try{
    const selected=compilerPackSelection(),{manifest,pack}=selected,path=join(cache,pack.archive.sha256),platform=llvmPlatform();
    checks.push({id:'platform',status:'ok',message:host+'; target '+pack.target});
    if(platform.libc){systemLibc(platform);checks.push({id:'runtime-loader',status:'ok',message:'Qualified system libc and executable loader are present.'});}
    if(!existsSync(path))checks.push({id:'compiler-pack',status:'warning',message:'The pinned LLVM/runtime pack is not cached: '+pack.archive.sha256,recovery:'Run aug run online once. No separate native compiler or SDK is required.'});
    else{
      try{
        if(lstatSync(path).isSymbolicLink())throw new Error('Artifact cache cannot be a symbolic link.');
        verifyArtifactFiles(path,pack.archive);
        try{compilerSelection=compilerPackIdentity(path,selected);compilerCached=true;}
        catch(error){checks.push({id:'compiler-pack-contract',status:'error',message:message(error),recovery:error instanceof CompilerToolAccessError?damagedCache(path,'run aug run'):'Install an August release with a matching published compiler/runtime contract. The cached bytes passed integrity; deleting and downloading the same pinned archive will not fix this release mismatch.'});}
        if(compilerCached)checks.push({id:'compiler-pack',status:'ok',message:'Verified cached LLVM '+manifest.llvm+' and matching runtime.'});
      }catch(error){checks.push({id:'compiler-pack',status:'error',message:message(error),recovery:damagedCache(path,'run aug run')});}
    }
  }catch(error){checks.push({id:'platform',status:'error',message:message(error),recovery:'Use a listed supported host and matching August release. No source build or tool installation was started.'});}
  try{
    const project=loadProject(root),checked=checkProject(project),issues=checked.diagnostics.filter(issue=>issue.severity!=='warning');projectChecked=!issues.length;
    checks.push({id:'project',status:issues.length?'error':'ok',message:issues.length?issues.map(issue=>`${issue.file}:${issue.line}:${issue.column}: ${issue.code}: ${issue.message}`).join('\n'):'Project source and installed package contracts check.',
      ...(issues.length?{recovery:'Run aug check for source locations. Run aug install when dependencies or their compiler requirements changed.'}:{})});
    if(!project.packages.diagnostics.length){
      const lockPath=join(root,'aug.lock.json'),lock:PackageLock=existsSync(lockPath)?readPackageLock(lockPath):{format:1,compiler,specifications:{},roots:{},packages:[],npm:{}};
      if(lock.compiler!==compiler)throw new Error('Project lock belongs to another compiler. Run aug install.');
      const selections=nativePackageSelections(root,lock,join(root,'.aug-packages')),target=nativeHostTarget(),key=nativeTargetKey(target);
      validateNativeComponents(selections);
      const previous=lock.native?.targets[key];nativeLocked=selections.length===0;
      if(selections.length){
        if(!previous)checks.push({id:'native-lock',status:'warning',message:'The selected native dependencies have no accepted lock for '+key+'.',recovery:'Run aug install online to record this host before a frozen build.'});
        else if(!Array.isArray(previous.packages)||previous.packages.length>10000||nativeSelectionIdentity(previous.packages)!==nativeSelectionIdentity(selections))checks.push({id:'native-lock',status:'error',message:'Locked native selections differ from the verified source manifests.',recovery:'Run aug install to verify and record the current host selection.'});
        else {nativeLocked=true;checks.push({id:'native-lock',status:'ok',message:'Native locks match the source digests, descriptor hashes and host artifacts.'});}
      }
      for(const selection of selections){
        const artifact=selection.artifact,path=join(cache,artifact.sha256),entry:DistributionArtifact={package:selection.sourcePackage,id:artifact.id,sha256:artifact.sha256,target:artifact.target,url:artifact.url,directory:path,libraries:artifact.link.libraries,runtimeFiles:artifact.runtime.files,status:'missing',message:'Selected native bytes are not cached.',recovery:'Run aug install online once to obtain '+artifact.id+'.'};
        if(existsSync(path))try{verifyNativeArtifact(path,artifact);entry.status='verified';entry.message='Verified every extracted file and declared link/runtime file.';delete entry.recovery;}
        catch(error){entry.status='invalid';entry.message=message(error);entry.recovery=error instanceof NativeArtifactContractError?'Ask the package maintainer for a corrected release: the pinned archive lacks a file required by its manifest. Select that release and run aug install. Downloading the same hash will not fix the contract.':damagedCache(path,'run aug install');}
        artifacts.push(entry);checks.push({id:'native-artifact:'+selection.sourcePackage,status:entry.status==='verified'?'ok':entry.status==='missing'?'warning':'error',message:selection.sourcePackage+' / '+artifact.id+' / '+artifact.target.triple+': '+entry.message,recovery:entry.recovery});
      }
      compilerLocked=!!compilerSelection&&compilerLockMatches(compilerSelection,lock.native?.compilers?.[host]);
      checks.push({id:'compiler-lock',status:compilerLocked?'ok':'warning',message:compilerLocked?'Compiler/runtime lock matches the verified host pack.':'A frozen build has no verified matching compiler/runtime selection.',recovery:compilerLocked?undefined:'Run aug run online on this host to verify and record its compiler/runtime selection.'});
    }
  }catch(error){checks.push({id:'dependencies',status:'error',message:message(error),recovery:'Run aug install for missing or changed dependencies. If this host is unsupported, use a listed supported artifact. Then retry aug doctor.'});}
  const ready=checks.every(check=>check.status!=='error'),offlineReady=ready&&projectChecked&&compilerCached&&artifacts.every(entry=>entry.status==='verified');
  return {format:1,compiler,host,project:root,ready,offlineReady,frozenReady:offlineReady&&nativeLocked&&compilerLocked&&!overrides,checks,artifacts,backend:'llvm',execution:'not-run'};
}
