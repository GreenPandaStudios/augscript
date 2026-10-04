import {createHash} from 'node:crypto';
import {chmodSync,closeSync,existsSync,lstatSync,mkdirSync,mkdtempSync,openSync,readFileSync,readSync,readdirSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {join,resolve} from 'node:path';
import {UnpackSync} from 'tar';
import {withPackageLockAsync} from './package-locking.ts';
import {replacePackageText} from './package-storage.ts';
import {nativePath,nativeHostTarget,selectNativeArtifact,type NativeArtifact,type NativeTarget} from './native-contracts.ts';
import {compilerVersion,readPackage,readPackageLock,sourcePaths,projectPackages,type PackageLock} from './package-manager.ts';
import {sourceAlias} from './git-packages.ts';
import type {NativeLinkInput} from './llvm-native.ts';

export interface VerifiedArchive {url:string;sha256:string;maximumDownloadBytes:number;maximumUnpackedBytes:number;fileManifest:string}
export interface NativePackageLock {sourcePackage:string;sourceDigest:string;sourceCommit?:string;contractSha256:string;artifact:NativeArtifact}
export interface LLVMCompilerLock {version:string;llvm:string;host:string;target:string;artifactSha256:string;runtimeSha256:string}
export interface NativeLock {format:1;compilers?:Record<string,LLVMCompilerLock>;targets:Record<string,{target:NativeTarget;packages:NativePackageLock[]}>}
const sha=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
const files=(directory:string,prefix=''):string[]=>readdirSync(join(directory,prefix),{withFileTypes:true}).flatMap(entry=>{
  const name=prefix?prefix+'/'+entry.name:entry.name;
  if(entry.isSymbolicLink())throw new Error('NATIVE_INTEGRITY: Native archives cannot contain symbolic links');
  return entry.isDirectory()?files(directory,name):entry.isFile()?[name]:(()=>{throw new Error('NATIVE_INTEGRITY: Native archives require regular files');})();
});

/** Verify the complete extracted file set. Hashes never authorize arbitrary install scripts. */
export function verifyArtifactFiles(directory:string,archive:VerifiedArchive):Record<string,string> {
  const path=nativePath(archive.fileManifest),manifest=JSON.parse(readFileSync(join(directory,path),'utf8'));
  if(manifest.format!==1||!manifest.files||Array.isArray(manifest.files)||typeof manifest.files!=='object')throw new Error('NATIVE_INTEGRITY: Invalid artifact file manifest');
  const expected=manifest.files as Record<string,string>,actual=files(directory).sort();
  if(JSON.stringify(actual)!==JSON.stringify([...Object.keys(expected),path].sort()))throw new Error('NATIVE_INTEGRITY: Artifact file set differs from its manifest');
  for(const [file,digest] of Object.entries(expected)){
    nativePath(file);if(!/^[0-9a-f]{64}$/.test(digest)||!lstatSync(join(directory,file)).isFile()||sha(readFileSync(join(directory,file)))!==digest)
      throw new Error('NATIVE_INTEGRITY: Artifact file hash mismatch: '+file);
  }
  return expected;
}

/** Bounded HTTPS downloads with checked redirects. No external downloader/toolchain is used. */
export async function downloadVerified(archive:VerifiedArchive):Promise<Buffer> {
  if(!/^[0-9a-f]{64}$/.test(archive.sha256)||!Number.isSafeInteger(archive.maximumDownloadBytes)||archive.maximumDownloadBytes<1)throw new Error('NATIVE_INTEGRITY: Invalid archive digest or size bound');
  let url=new URL(archive.url),response:Response|undefined;
  const signal=AbortSignal.timeout(120000);
  for(let i=0;i<=5;i++){
    if(url.protocol!=='https:'||url.username||url.password||url.hash)throw new Error('NATIVE_INTEGRITY: Artifact downloads and redirects require HTTPS without credentials');
    response=await fetch(url,{redirect:'manual',signal});
    if([301,302,303,307,308].includes(response.status)){
      const location=response.headers.get('location');await response.body?.cancel();if(!location||i===5)throw new Error('NATIVE_DOWNLOAD: Too many or invalid redirects');url=new URL(location,url);continue;
    }break;
  }
  if(!response?.ok||!response.body)throw new Error(`NATIVE_DOWNLOAD: Missing artifact (${response?.status}) at ${archive.url}. Ask the package maintainer to publish the matching artifact. No source build was started.`);
  if(Number(response.headers.get('content-length')??0)>archive.maximumDownloadBytes){await response.body.cancel();throw new Error('NATIVE_INTEGRITY: Artifact exceeds its download limit');}
  const chunks:Buffer[]=[];let length=0;
  for await(const chunk of response.body as any){length+=chunk.length;if(length>archive.maximumDownloadBytes)throw new Error('NATIVE_INTEGRITY: Artifact exceeds its download limit');chunks.push(Buffer.from(chunk));}
  const bytes=Buffer.concat(chunks);if(sha(bytes)!==archive.sha256)throw new Error('NATIVE_INTEGRITY: Downloaded artifact SHA-256 does not match the locked package');return bytes;
}

/** Content-addressed immutable installs; failed extraction never installs an accepted cache. */
export async function ensureVerifiedArchive(archive:VerifiedArchive,options:{offline?:boolean;cache?:string;executables?:string[]}={}):Promise<string> {
  if(!/^[0-9a-f]{64}$/.test(archive.sha256)||!Number.isSafeInteger(archive.maximumUnpackedBytes)||archive.maximumUnpackedBytes<1)throw new Error('NATIVE_INTEGRITY: Invalid archive digest or unpacked size bound');
  nativePath(archive.fileManifest);
  const cache=resolve(options.cache??process.env.AUG_NATIVE_ARTIFACT_CACHE??join(homedir(),'.cache/augscript/native-artifacts'));
  mkdirSync(cache,{recursive:true});const destination=join(cache,archive.sha256);
  return withPackageLockAsync(destination+'.lock',async()=>{
    if(existsSync(destination)){if(lstatSync(destination).isSymbolicLink())throw new Error('NATIVE_INTEGRITY: Artifact cache cannot be a symbolic link');verifyArtifactFiles(destination,archive);return destination;}
    if(options.offline)throw new Error('NATIVE_OFFLINE: Locked native artifact is not cached. Run aug install online once. '+archive.url);
    const stage=mkdtempSync(join(cache,'.install-')),transport=join(stage,'download.tar.gz'),output=join(stage,'files');mkdirSync(output);
    try{
      writeFileSync(transport,await downloadVerified(archive));const seen=new Set<string>();let unpacked=0;
      const extractor=new UnpackSync({cwd:output,strict:true,preserveOwner:false,filter:(path,entry)=>{
        const name=path.replace(/\/$/,'');nativePath(name);
        if(!('type' in entry))throw new Error('NATIVE_INTEGRITY: Expected an archive entry');
        if(!['File','Directory'].includes(entry.type))throw new Error('NATIVE_INTEGRITY: Archive links and special files are forbidden');
        if(seen.has(name))throw new Error('NATIVE_INTEGRITY: Duplicate archive path '+name);seen.add(name);
        unpacked+=entry.size;if(seen.size>20000||unpacked>archive.maximumUnpackedBytes)throw new Error('NATIVE_INTEGRITY: Archive exceeds its unpacked size or file limit');
        return true;
      }});
      // tar's synchronous file convenience API has no error listener. A disk
      // write failure can otherwise become an uncaught stream event instead of
      // the CLI's actionable error and rejected-install cleanup.
      let extractionError:Error|undefined;
      extractor.on('error',(error:Error)=>{extractionError??=error;});
      const input=openSync(transport,'r');
      try{
        let length:number;
        do{
          const buffer=Buffer.allocUnsafe(16*1024*1024);
          length=readSync(input,buffer,0,buffer.length,null);
          if(length)extractor.write(buffer.subarray(0,length));
          if(extractionError)throw extractionError;
        }while(length);
        extractor.end();if(extractionError)throw extractionError;
      }finally{closeSync(input);}
      verifyArtifactFiles(output,archive);
      for(const executable of options.executables??[]){nativePath(executable);if(!lstatSync(join(output,executable)).isFile())throw new Error('NATIVE_INTEGRITY: Missing verified executable '+executable);chmodSync(join(output,executable),0o755);}
      renameSync(output,destination);return destination;
    }finally{rmSync(stage,{recursive:true,force:true});}
  });
}

/** Extend the existing source lock with exact native target selections. */
export async function prepareNativePackages(root:string,options:{offline?:boolean;frozen?:boolean;target?:NativeTarget}={}):Promise<NativeLinkInput[]> {
  const lockFile=join(root,'aug.lock.json'),self=existsSync(join(root,'aug-package.json'))?readPackage(root):undefined;
  if(!existsSync(lockFile)&&!self?.manifest.native)return [];
  return withPackageLockAsync(join(root,'.aug-install.lock'),async()=>{
    const initial=existsSync(lockFile)?readFileSync(lockFile,'utf8'):undefined;
    const lock=initial?readPackageLock(lockFile):{format:1 as const,compiler:compilerVersion(),specifications:{},roots:{},packages:[],npm:{}};
    if(lock.compiler!==compilerVersion())throw new Error('NATIVE_LOCK: Source lock compiler differs; run aug install');
    const inputs=await resolveNativePackages(root,lock,join(root,'.aug-packages'),options);
    if(lock.native&&!options.frozen){
      if((existsSync(lockFile)?readFileSync(lockFile,'utf8'):undefined)!==initial)throw new Error('NATIVE_LOCK: Source lock changed during native installation; retry aug install');
      replacePackageText(lockFile,JSON.stringify(lock,null,2)+'\n');
    }
    return inputs;
  });
}

/** Validate an isolated source candidate before its installer publishes the accepted revision. */
export async function resolveNativePackages(root:string,lock:PackageLock,cache:string,options:{offline?:boolean;frozen?:boolean;target?:NativeTarget}={}):Promise<NativeLinkInput[]> {
    const self=existsSync(join(root,'aug-package.json'))?readPackage(root):undefined;
    const target=options.target??nativeHostTarget(),key=target.triple+'/'+(target.os==='macos'?'macos14':target.libc);
    const verified=projectPackages(root,lock.specifications,self?.sourceRoot??root,{lock,cache});
    if(verified.diagnostics.length)throw new Error(verified.diagnostics.map(d=>d.message).join('\n'));
    const packages=[...new Set(verified.scopes.values())].filter(entry=>entry.native).map(entry=>({sourcePackage:entry.name+'@'+entry.version,sourceDigest:entry.digest,
      sourceCommit:lock.git?.find(g=>entry.path.endsWith('packages/'+sourceAlias(g.request)))?.commit,
      contractSha256:entry.native!.bindingsSha256,artifact:selectNativeArtifact(entry.native!.artifacts,target)}));
    if(self?.manifest.native){const digest=createHash('sha256');
      for(const file of ['aug-package.json','native.abi.json',...sourcePaths(self.sourceRoot).map(path=>path.slice(root.length+1))].sort())digest.update(file+'\0').update(readFileSync(join(root,file))).update('\0');
      packages.push({sourcePackage:self.manifest.name+'@'+self.manifest.version,sourceDigest:digest.digest('hex'),sourceCommit:undefined,contractSha256:self.manifest.native.bindingsSha256,artifact:selectNativeArtifact(self.manifest.native.artifacts,target)});
    }
    if(!packages.length)return [];

    const native=lock.native??{format:1,targets:{}};
    if(native.format!==1)throw new Error('NATIVE_LOCK: Unsupported native lock schema');
    const previous=native.targets[key];
    // Older locks repeated identical canonical identities. Compare complete selections,
    // so conflicting digests or artifacts remain mismatches, and keep frozen bytes intact.
    const selections=(entries:NativePackageLock[]):string=>JSON.stringify([...new Set(entries.map(entry=>JSON.stringify(entry)))].sort());
    if(options.frozen&&(!previous||!Array.isArray(previous.packages)||previous.packages.length>10000||selections(previous.packages)!==selections(packages)))throw new Error('NATIVE_LOCK: Frozen install has no matching native target lock. Run aug install online to record this target.');
    const components=new Map<string,string>();
    for(const p of packages)for(const c of p.artifact.components)if(c.required){const identity=c.id+'@'+c.version;
      if(components.has(c.compatibilityKey)&&components.get(c.compatibilityKey)!==identity)throw new Error('NATIVE_CONFLICT: Incompatible native component '+c.compatibilityKey);components.set(c.compatibilityKey,identity);}
    const inputs:NativeLinkInput[]=[];
    for(const p of packages){const directory=await ensureVerifiedArchive(p.artifact,{offline:options.offline});
      const supplied=verifyArtifactFiles(directory,p.artifact);
      for(const path of [...p.artifact.link.libraries,...p.artifact.runtime.files,p.artifact.provenance,p.artifact.notices,...(p.artifact.runtime.closureManifest?[p.artifact.runtime.closureManifest]:[])])if(!supplied[path])throw new Error('NATIVE_INTEGRITY: Artifact is missing declared file '+path);
      inputs.push({directory,target:p.artifact.target,libraries:p.artifact.link.libraries,runtimeFiles:p.artifact.runtime.files,artifactSha256:p.artifact.sha256,
        metadata:[...Object.keys(supplied).filter(path=>!p.artifact.link.libraries.includes(path)&&!p.artifact.runtime.files.includes(path)),p.artifact.fileManifest]});
    }
    if(!options.frozen){native.targets[key]={target,packages};lock.native=native;}
    return inputs;
}
