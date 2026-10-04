import {accessSync,constants,existsSync,readFileSync,statSync,lstatSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {homedir} from 'node:os';
import {compilerVersion} from './package-manager.ts';
import {compilerPackSelection} from './compiler-packs.ts';
import {verifyArtifactFiles} from './native-artifacts.ts';
import {readRuntimePack} from './llvm-native.ts';
import {loadProject} from './project.ts';
import {checkProject} from './checker.ts';

export interface DistributionCheck {id:string;status:'ok'|'warning'|'error';message:string;recovery?:string}
export interface DistributionReport {format:1;compiler:string;host:string;project:string;ready:boolean;checks:DistributionCheck[]}
const message=(error:unknown):string=>error instanceof Error?error.message:String(error);
function writable(path:string):void {
  let ancestor=path;
  while(!existsSync(ancestor)&&dirname(ancestor)!==ancestor)ancestor=dirname(ancestor);
  if(!statSync(ancestor).isDirectory())throw new Error('Expected a directory: '+ancestor);
  accessSync(ancestor,constants.W_OK|constants.X_OK);
}

/** Diagnose installed prerequisites and source without downloads, locks or source writes. */
export function inspectDistribution(root:string):DistributionReport {
  const checks:DistributionCheck[]=[],compiler=compilerVersion(),host=process.platform+'-'+process.arch;
  checks.push({id:'node',status:Number(process.versions.node.split('.')[0])>=24?'ok':'error',message:'Node.js '+process.versions.node,
    ...(Number(process.versions.node.split('.')[0])<24?{recovery:'Install Node.js 24 or newer, then retry aug doctor.'}:{})});
  const cache=resolve(process.env.AUG_NATIVE_ARTIFACT_CACHE??join(homedir(),'.cache/augscript/native-artifacts'));
  for(const [id,path] of [['project-write',root],['cache-write',cache]]){
    try{writable(path);checks.push({id,status:'ok',message:'Writable: '+path});}
    catch(error){checks.push({id,status:'error',message:message(error),recovery:id==='cache-write'?'Set AUG_NATIVE_ARTIFACT_CACHE to a directory you own.':'Choose a project directory you can write.'});}
  }
  try{
    const {manifest,pack}=compilerPackSelection();
    checks.push({id:'platform',status:'ok',message:host+'; target '+pack.target});
    if(process.env.AUG_LLVM_HOME||process.env.AUG_RUNTIME_PACK)checks.push({id:'toolchain-override',status:'warning',message:'Contributor toolchain overrides are active.',recovery:'Unset AUG_LLVM_HOME and AUG_RUNTIME_PACK to use the verified consumer pack.'});
    const directory=join(cache,pack.archive.sha256);
    if(!existsSync(directory))checks.push({id:'compiler-pack',status:'warning',message:'The pinned LLVM/runtime pack is not cached.',recovery:'Run aug run online once. No separate native compiler or SDK is required.'});
    else{
      if(lstatSync(directory).isSymbolicLink())throw new Error('Artifact cache cannot be a symbolic link.');
      verifyArtifactFiles(directory,pack.archive);
      const identity=JSON.parse(readFileSync(join(directory,'compiler-pack.json'),'utf8')),runtime=readRuntimePack(join(directory,'runtime'));
      if(identity.format!==1||identity.compiler!==compiler||identity.llvm!==manifest.llvm||identity.host!==host||identity.target!==pack.target||identity.runtime!==runtime.sourceSha256)throw new Error('Cached compiler/runtime identity differs from the installed compiler.');
      checks.push({id:'compiler-pack',status:'ok',message:'Verified cached LLVM '+manifest.llvm+' and matching runtime.'});
    }
  }catch(error){checks.push({id:'compiler-pack',status:'error',message:message(error),recovery:'Use a supported platform and matching August release. Remove a corrupted compiler cache only when no build is using it, then run aug run online.'});}
  try{
    const checked=checkProject(loadProject(root)),issues=checked.diagnostics.filter(issue=>issue.severity!=='warning');
    checks.push({id:'project',status:issues.length?'error':'ok',message:issues.length?issues.map(issue=>`${issue.code}: ${issue.message}`).join('\n'):'Project source and installed package contracts check.',
      ...(issues.length?{recovery:'Run aug check for source locations. Run aug install when dependencies or their compiler requirements changed.'}:{})});
  }catch(error){checks.push({id:'project',status:'error',message:message(error),recovery:'Choose a folder containing main.aug or aug-package.json. Run aug install for missing packages, then aug check.'});}
  return {format:1,compiler,host,project:root,ready:checks.every(check=>check.status!=='error'),checks};
}
