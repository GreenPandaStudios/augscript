import {createHash} from 'node:crypto';
import {existsSync} from 'node:fs';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {loadProject} from './project.ts';
import type {CheckedProject} from './checker.ts';
import {checkedProjectWithTests} from './refactoring.ts';
import {semanticGraph,semanticSourcePath} from './symbols.ts';
import {compareCheckedPackageInterfaces} from './package-inspection.ts';
import {withPackageUpdatePreview,type PackageLock,type PackageScope} from './package-manager.ts';
import {sourceAlias} from './git-packages.ts';
import {nativePackageSelections,validateNativeComponents,verifyNativeArtifact,type NativePackageLock} from './native-artifacts.ts';
import {nativeHostTarget} from './native-contracts.ts';

const key=(path:string)=>path.replace(/^snapshots\/[a-f0-9]{64}\//,'');
const issues=(checked:CheckedProject)=>checked.diagnostics.map(issue=>({...issue,file:semanticSourcePath(checked,issue.file)}));
const checked=(directory:string,lock:PackageLock,cache:string)=>checkedProjectWithTests(directory,new Map(),loadProject(directory,new Map(),undefined,{lock,cache,specifications:lock.specifications}));
const source=(scope:PackageScope,lock:PackageLock)=>({name:scope.name,version:scope.version,digest:scope.digest,
  source:lock.git?.find(entry=>key(scope.path)==='packages/'+sourceAlias(entry.request))??null,native:scope.native??null});

/** Check a dependency as its own package, even when an application's old call no longer checks. */
function packageChecked(scope:PackageScope,lock:PackageLock,cache:string) {
  const paths=new Set<string>(),entries=new Map(lock.packages.map(entry=>[entry.path,entry]));
  const visit=(path:string)=>{if(paths.has(path))return;paths.add(path);for(const child of Object.values(entries.get(path)!.dependencies))visit(child);};
  Object.values(scope.dependencies).forEach(visit);
  const packageLock={...lock,specifications:scope.specifications,roots:scope.dependencies,packages:lock.packages.filter(entry=>paths.has(entry.path))};
  return checked(scope.directory,packageLock,cache);
}

function packageRoutes(checked:CheckedProject) {
  const routes=new Map<PackageScope,string>(),queue=[...checked.project.packages.roots].sort(([a],[b])=>a.localeCompare(b,'en')).map(([alias,scope])=>({scope,route:alias}));
  while(queue.length){const {scope,route}=queue.shift()!;if(routes.has(scope))continue;routes.set(scope,route);
    for(const [alias,path] of Object.entries(scope.dependencies).sort(([a],[b])=>a.localeCompare(b,'en')))queue.push({scope:checked.project.packages.scopes.get(path)!,route:route+'.'+alias});}
  for(const scope of new Set(checked.project.packages.scopes.values()))if(!routes.has(scope))routes.set(scope,key(scope.path));
  return new Map([...routes].map(([scope,route])=>[route,scope]));
}
function packagePairs(before:CheckedProject,after:CheckedProject) {
  const left=packageRoutes(before),right=packageRoutes(after),pairs:{key:string;before?:PackageScope;after?:PackageScope}[]=[];
  for(const route of [...left.keys()].filter(route=>right.has(route)).sort()){pairs.push({key:route,before:left.get(route),after:right.get(route)});left.delete(route);right.delete(route);}
  for(const [route,scope] of [...left]){
    const old=[...left.values()].filter(entry=>entry.name===scope.name),next=[...right].filter(([,entry])=>entry.name===scope.name);
    if(old.length===1&&next.length===1){pairs.push({key:'package/'+scope.name,before:scope,after:next[0][1]});left.delete(route);right.delete(next[0][0]);}
  }
  return [...pairs,...[...left].map(([key,before])=>({key,before,after:undefined})),...[...right].map(([key,after])=>({key,before:undefined,after}))].sort((a,b)=>a.key.localeCompare(b.key,'en'));
}

function nativePreview(root:string,beforeLock:PackageLock,afterLock:PackageLock,afterCache:string) {
  let before:NativePackageLock[]=[],after:NativePackageLock[]=[],beforeError:string|undefined;
  const artifacts:{sha256:string;id:string;sourcePackages:string[];status:'missing'|'verified'|'invalid';maximumDownloadBytes:number;maximumUnpackedBytes:number;error?:string}[]=[];
  try {
    const target=nativeHostTarget();
    try{before=nativePackageSelections(root,beforeLock,join(root,'.aug-packages'),target);}catch(error){beforeError=(error as Error).message;}
    after=nativePackageSelections(root,afterLock,afterCache,target);validateNativeComponents(after);
    const byHash=new Map<string,typeof artifacts[number]>();
    for(const selection of after){
      const artifact=selection.artifact,previous=byHash.get(artifact.sha256);
      const entry:typeof artifacts[number]=previous??{sha256:artifact.sha256,id:artifact.id,sourcePackages:[selection.sourcePackage],status:'missing',maximumDownloadBytes:artifact.maximumDownloadBytes,maximumUnpackedBytes:artifact.maximumUnpackedBytes};
      const path=join(resolve(process.env.AUG_NATIVE_ARTIFACT_CACHE??join(homedir(),'.cache/augscript/native-artifacts')),artifact.sha256);
      if(existsSync(path))try{verifyNativeArtifact(path,artifact);if(entry.status!=='invalid')entry.status='verified';}catch(error){entry.status='invalid';entry.error=(error as Error).message;}
      if(previous){entry.sourcePackages.push(selection.sourcePackage);entry.maximumDownloadBytes=Math.max(entry.maximumDownloadBytes,artifact.maximumDownloadBytes);entry.maximumUnpackedBytes=Math.max(entry.maximumUnpackedBytes,artifact.maximumUnpackedBytes);}
      else {artifacts.push(entry);byHash.set(artifact.sha256,entry);}
    }
    const downloadMaximumBytes=artifacts.filter(entry=>entry.status==='missing').reduce((sum,entry)=>sum+entry.maximumDownloadBytes,0);
    if(!Number.isSafeInteger(downloadMaximumBytes))throw new Error('NATIVE_SIZE: Combined declared download bounds exceed the exact integer range.');
    return {status:artifacts.some(entry=>entry.status==='invalid')?'rejected':'selected',target,before,after,artifacts,beforeSelection:beforeError?'unavailable':'selected',beforeError,
      changed:JSON.stringify(before)!==JSON.stringify(after),downloadMaximumBytes,
      sizeEvidence:'declared-upper-bounds',artifactEvidence:'metadata-only',execution:'not-run'};
  }catch(error){return {status:'rejected',before,after,artifacts,error:(error as Error).message,
    downloadMaximumBytes:null,sizeEvidence:'unavailable',artifactEvidence:'metadata-only',execution:'not-run'};}
}

/** Resolve and check proposed revisions without replacing source snapshots or the accepted lock. */
export function dependencyUpdatePreview(directory:string,offline=false) {
  const root=resolve(directory);
  return withPackageUpdatePreview(root,offline,({lock,cache,previous})=>{
    const before=checked(root,previous,join(root,'.aug-packages'));
    if(before.project.packages.diagnostics.length)throw new Error('UPDATE_BASE: The accepted dependency snapshot does not verify. Run aug install before previewing updates.');
    const after=checked(root,lock,cache);
    const packages=packagePairs(before,after).map(({key:id,before:old,after:next})=>{
      const oldProject=old?packageChecked(old,previous,join(root,'.aug-packages')):undefined,nextProject=next?packageChecked(next,lock,cache):undefined;
      const diagnostics=[...(oldProject?issues(oldProject):[]),...(nextProject?issues(nextProject):[])],errors=diagnostics.filter(issue=>issue.severity!=='warning');
      const contracts=errors.length?{status:'unavailable',diagnostics}:{status:'checked',...compareCheckedPackageInterfaces(oldProject,nextProject)};
      return {key:id,before:old?source(old,previous):null,after:next?source(next,lock):null,contracts};
    });
    const application=(checked:CheckedProject,selection:PackageLock)=>({checked:!checked.diagnostics.some(issue=>issue.severity!=='warning'),revision:{source:semanticGraph(checked,true).revision,dependencies:createHash('sha256').update(JSON.stringify(selection)).digest('hex')},diagnostics:issues(checked)});
    const native=nativePreview(root,previous,lock,cache),applicationBefore=application(before,previous),applicationAfter=application(after,lock);
    return {format:1,compiler:lock.compiler,acceptedWrites:false,roots:{before:previous.roots,after:lock.roots},packages,native,
      application:{before:applicationBefore,after:applicationAfter},ready:applicationAfter.checked&&packages.every(item=>item.contracts.status==='checked')&&native.status==='selected',
      coverage:{source:'verified-isolated-snapshot',contracts:packages.every(item=>item.contracts.status==='checked')?'checked-public-packages':'incomplete',callers:'project-only',externalCallers:'outside-project'},
      behavioralEvidence:'not-run',sourceResolution:offline?'offline':'online',temporarySourceAndTransportCacheWrites:true};
  });
}
