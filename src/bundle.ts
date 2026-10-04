import {createHash} from 'node:crypto';
import {chmodSync,closeSync,copyFileSync,existsSync,lstatSync,mkdirSync,mkdtempSync,openSync,readFileSync,readSync,readdirSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {basename,dirname,join,resolve} from 'node:path';
import type {CheckedProject} from './checker.ts';
import type {LLVMToolchain} from './compiler-packs.ts';
import {compileLLVM,type NativeLinkInput} from './llvm-native.ts';
import {compilerVersion} from './compiler-version.ts';
import {nativePath} from './native-contracts.ts';
import {withPackageLock} from './package-locking.ts';

interface BundleFile {path:string;sha256:string;bytes:number;executable:boolean}
interface BundleManifest {format:1;compiler:string;target:string;mode:'release'|'development';executable:string;sourceRevision:string;
  runtime:string;compilerArtifact?:string;developmentToolchain:boolean;nativeArtifacts:string[];minimumOS?:string;minimumLibc?:string;files:BundleFile[]}
const failure=(message:string):never=>{throw new Error('BUNDLE_INTEGRITY: '+message);};
function digest(path:string):string {
  const hash=createHash('sha256'),fd=openSync(path,'r'),buffer=Buffer.allocUnsafe(1024*1024);
  try {let count:number;while((count=readSync(fd,buffer,0,buffer.length,null))>0)hash.update(buffer.subarray(0,count));}
  finally {closeSync(fd);}
  return hash.digest('hex');
}
function files(root:string):string[] {
  if(lstatSync(root).isSymbolicLink()||!lstatSync(root).isDirectory())failure('Expected a regular bundle directory.');
  const result:string[]=[],pending=[{path:'',depth:0}];let bytes=0,entries=0;
  while(pending.length) {
    const {path,depth}=pending.pop()!;if(depth>32)failure('Bundle directory nesting exceeds 32.');
    for(const entry of readdirSync(join(root,path),{withFileTypes:true})) {
      const name=path?path+'/'+entry.name:entry.name;
      if(entry.isDirectory())pending.push({path:name,depth:depth+1});
      else if(entry.isFile()) {result.push(name);bytes+=lstatSync(join(root,name)).size;}
      else failure('Links and special files are forbidden: '+name);
      if(++entries>20000||bytes>16*1024*1024*1024)failure('Bundle exceeds its file or byte limit.');
    }
  }
  return result.sort();
}
function path(value:unknown):string {
  if(typeof value!=='string')return failure('Expected a relative file path.');
  try {nativePath(value);}catch {return failure('Unsafe bundle path: '+value);}
  return value;
}
/** Check a complete deployment closure without loading native code or needing its source. */
export function verifyBundle(directory:string) {
  const root=resolve(directory),manifestPath=join(root,'bundle.json');
  const actual=files(root);if(!actual.includes('bundle.json'))failure('Missing bundle.json.');
  if(lstatSync(manifestPath).size>4*1024*1024)failure('Bundle manifest exceeds 4 MiB.');
  let manifest:BundleManifest;
  try {manifest=JSON.parse(readFileSync(manifestPath,'utf8'));}catch {return failure('bundle.json is not valid JSON.');}
  if(!manifest||manifest.format!==1||!/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(manifest.compiler)||
    !['aarch64-apple-darwin','aarch64-unknown-linux-gnu','x86_64-unknown-linux-gnu'].includes(manifest.target)||
    !['release','development'].includes(manifest.mode)||!Array.isArray(manifest.files)||!manifest.files.length||manifest.files.length>20000||manifest.files.some(file=>!file||typeof file!=='object')||
    !/^[0-9a-f]{64}$/.test(manifest.sourceRevision)||!/^[0-9a-f]{64}$/.test(manifest.runtime)||
    !Array.isArray(manifest.nativeArtifacts)||manifest.nativeArtifacts.some(id=>!/^[0-9a-f]{64}$/.test(id))||
    [manifest.minimumOS,manifest.minimumLibc].some(value=>value!==undefined&&(typeof value!=='string'||!/^\d+\.\d+(?:\.\d+)?$/.test(value)))||
    typeof manifest.developmentToolchain!=='boolean'||manifest.compilerArtifact!==undefined&&!/^[0-9a-f]{64}$/.test(manifest.compilerArtifact))failure('Invalid format or producer identity.');
  const executable=path(manifest.executable),names=manifest.files.map(file=>path(file.path));
  if(names.includes('bundle.json')||new Set(names).size!==names.length||JSON.stringify(actual)!==JSON.stringify([...names,'bundle.json'].sort()))failure('File set differs from the manifest.');
  if(!names.includes(executable))failure('Executable is absent from the manifest.');
  for(const file of manifest.files) {
    const full=join(root,file.path),stat=lstatSync(full);
    if(!Number.isSafeInteger(file.bytes)||file.bytes<0||typeof file.executable!=='boolean'||!/^[0-9a-f]{64}$/.test(file.sha256)||
      stat.size!==file.bytes||digest(full)!==file.sha256)failure('File bytes differ: '+file.path);
    if(file.executable!==((stat.mode&0o111)!==0))failure('Executable permission differs: '+file.path);
    if(file.path===executable&&!file.executable)failure('Application is not executable.');
  }
  return {format:1,directory:root,verified:true,target:manifest.target,compiler:manifest.compiler,executable:manifest.executable,files:manifest.files.length,
    trust:'Hashes verify the recorded bytes, not the publisher identity or application behavior.'};
}

/** Assemble existing LLVM deployment outputs, then publish one completed directory. */
export function buildBundle(checked:CheckedProject,directory:string,options:{native:NativeLinkInput[];toolchain:LLVMToolchain;onPhase?:(phase:string)=>void}) {
  const destination=resolve(directory);
  if(existsSync(destination))throw new Error('BUNDLE_OUTPUT: Destination already exists: '+destination+'. Choose a new directory.');
  if(checked.project.config.web.tls.certificate||checked.project.config.web.tls.private_key||checked.project.config.web.tls.ca)
    throw new Error('BUNDLE_CONFIG: TLS paths are embedded by this compiler. A relocatable bundle requires a separate runtime certificate configuration; it is not available yet.');
  mkdirSync(dirname(destination),{recursive:true});
  return withPackageLock(destination+'.lock',()=>{
    if(existsSync(destination))throw new Error('BUNDLE_OUTPUT: Destination already exists: '+destination);
    const stage=mkdtempSync(join(dirname(destination),'.aug-bundle-'));
    try {
      const compiled=compileLLVM(checked,{...options,bundle:join(stage,'build'),output:'app',release:true});
      const metadata=JSON.parse(readFileSync(compiled.output+'.augmap.json','utf8'));
      const deployed=join(stage,'package');mkdirSync(deployed);
      for(const name of files(dirname(compiled.output)).filter(file=>file==='app'||file.startsWith('lib/')||file.startsWith('share/'))) {
        const target=join(deployed,name);mkdirSync(dirname(target),{recursive:true});copyFileSync(join(dirname(compiled.output),name),target);
        chmodSync(target,name==='app'?0o755:0o644);
      }
      const entries=files(deployed).map(name=>({path:name,sha256:digest(join(deployed,name)),bytes:lstatSync(join(deployed,name)).size,executable:name==='app'}));
      const manifest:BundleManifest={format:1,compiler:compilerVersion(),target:metadata.target,mode:metadata.mode,executable:basename(compiled.output),sourceRevision:metadata.sourceRevision,
        runtime:metadata.runtime,compilerArtifact:metadata.compilerArtifact,developmentToolchain:metadata.developmentToolchain,nativeArtifacts:metadata.nativeArtifacts??[],minimumOS:metadata.minimumOS,minimumLibc:metadata.minimumLibc,files:entries};
      writeFileSync(join(deployed,'bundle.json'),JSON.stringify(manifest,null,2)+'\n');
      options.onPhase?.('bundle verification');verifyBundle(deployed);
      if(existsSync(destination))throw new Error('BUNDLE_OUTPUT: Destination appeared during compilation; no existing bundle was replaced.');
      renameSync(deployed,destination);
      return verifyBundle(destination);
    }finally {rmSync(stage,{recursive:true,force:true});}
  });
}
