import {sourceAlias} from './git-packages.ts';
import {existsSync,lstatSync,readdirSync} from 'node:fs';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {inspectDistribution} from './distribution.ts';
import {compilerVersion,readPackageLock} from './package-manager.ts';
import {compilerPackSelection} from './compiler-packs.ts';
import {compilationCacheDirectory} from './test-compilation-cache.ts';

export interface CacheEntry {identity:string;bytes:number;files:number;complete:boolean;selected:boolean}
export interface CacheInventory {
  kind:'sources'|'native'|'compilation'|'installed';directory:string;exists:boolean;
  bytes:number;files:number;complete:boolean;entries:CacheEntry[];issues:string[];pruning:string;
}
function inventory(kind:CacheInventory['kind'],directory:string,selected:Set<string>,pruning:string):CacheInventory {
  const report:CacheInventory={kind,directory,exists:false,bytes:0,files:0,complete:true,entries:[],issues:[],pruning};let visited=0;
  const visit=(path:string,depth:number):{bytes:number;files:number;complete:boolean}=>{
    const count={bytes:0,files:0,complete:true};
    try {
      if(++visited>100000||depth>64)throw new Error('Size scan stopped at its file or nesting limit');
      const status=lstatSync(path);
      if(status.isSymbolicLink()||!status.isFile()&&!status.isDirectory())throw new Error('Linked or special cache path was not followed: '+path);
      if(status.isFile())return {bytes:status.size,files:1,complete:true};
      for(const name of readdirSync(path).sort()) {
        if(visited>100000){count.complete=false;break;}
        const child=visit(join(path,name),depth+1);count.bytes+=child.bytes;count.files+=child.files;count.complete&&=child.complete;
      }
    }catch(error){count.complete=false;if(report.issues.length<20)report.issues.push(error instanceof Error?error.message:String(error));}
    return count;
  };
  try {
    const status=lstatSync(directory);report.exists=true;
    if(!status.isDirectory()||status.isSymbolicLink())throw new Error('Cache root must be a directory without a symbolic link: '+directory);
    for(const name of readdirSync(directory).sort()) {
      if(visited>100000){report.complete=false;break;}
      const item=visit(join(directory,name),1);report.bytes+=item.bytes;report.files+=item.files;report.complete&&=item.complete;
      report.entries.push({identity:name,...item,selected:selected.has(name)});
    }
  }catch(error){
    if((error as NodeJS.ErrnoException).code!=='ENOENT'){report.complete=false;report.issues.push(error instanceof Error?error.message:String(error));}
  }
  return report;
}

/** Inventory current cache bytes and selections. Presence is separate from verified offline readiness. */
export function inspectCaches(directory:string) {
  const project=resolve(directory),distribution=inspectDistribution(project),sourceIdentities=new Set<string>(),transportIdentities=new Set<string>(),nativeIdentities=new Set<string>();
  const sources:{identity:string;package:string;digest:string;path:string}[]=[],repositories:{request:string;commit:string}[]=[],native:{identity:string;kind:string;target:string}[]=[];
  const file=join(project,'aug.lock.json'),omissions:string[]=[];
  if(existsSync(file))try {
    const lock=readPackageLock(file);
    for(const entry of lock.git??[]){repositories.push({request:entry.request,commit:entry.commit});transportIdentities.add(sourceAlias(entry.repository));transportIdentities.add('https-'+sourceAlias(entry.repository)+'-'+sourceAlias(entry.folder));}
    for(const entry of lock.packages){sourceIdentities.add(entry.path.split('/')[0]);sources.push({identity:entry.name+'@'+entry.version,package:entry.name,digest:entry.digest,path:entry.path});}
    for(const entry of Object.values(lock.native?.compilers??{})){nativeIdentities.add(entry.artifactSha256);native.push({identity:entry.artifactSha256,kind:'compiler '+entry.version,target:entry.target});}
    for(const entry of Object.values(lock.native?.targets??{}))for(const item of entry.packages){nativeIdentities.add(item.artifact.sha256);native.push({identity:item.artifact.sha256,kind:item.sourcePackage,target:item.artifact.target.triple});}
  }catch(error){sources.length=0;repositories.length=0;native.length=0;sourceIdentities.clear();transportIdentities.clear();nativeIdentities.clear();omissions.push(error instanceof Error?error.message:String(error));}
  let compilerSelection:{identity:string;target:string}|undefined;
  try{const selected=compilerPackSelection();compilerSelection={identity:selected.pack.archive.sha256,target:selected.target.triple};nativeIdentities.add(compilerSelection.identity);}catch{/* The setup report retains the platform/manifest error. */}
  // Include current source-verified host selections even before their first lock.
  for(const entry of distribution.artifacts)nativeIdentities.add(entry.sha256);
  const caches=[
    inventory('sources',resolve(process.env.AUG_PACKAGE_CACHE??join(homedir(),'.cache/augscript/packages')),transportIdentities,'Retained: repository transport may be needed by other projects or frozen restores.'),
    inventory('native',resolve(process.env.AUG_NATIVE_ARTIFACT_CACHE??join(homedir(),'.cache/augscript/native-artifacts')),nativeIdentities,'Retained: shared compiler/runtime and native artifacts may be locked by other projects.'),
    inventory('compilation',compilationCacheDirectory(),new Set(),'Verified idle test-program entries can be pruned; active entry locks and unknown contents are retained.'),
    inventory('installed',join(project,'.aug-packages'),sourceIdentities,'Retained: accepted source generations and concurrent readers are not removed.')
  ];
  return {format:1 as const,compiler:compilerVersion(),project,execution:'not-run' as const,caches,selections:{status:omissions.length?'unavailable' as const:'available' as const,omissions,sources,repositories,native,compiler:compilerSelection},
    ready:distribution.ready,offlineReady:distribution.offlineReady,frozenReady:distribution.frozenReady,checks:distribution.checks,artifacts:distribution.artifacts,
    sizes:'Regular-file logical bytes; links are not followed. Incomplete scans are lower bounds, not disk allocation or integrity checks.'};
}
