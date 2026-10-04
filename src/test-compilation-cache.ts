import {createHash,randomUUID} from 'node:crypto';
import {existsSync,lstatSync,mkdirSync,readFileSync,readdirSync,realpathSync,renameSync,rmSync,statSync,writeFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {dirname,isAbsolute,join,relative,resolve} from 'node:path';

export interface CompilationEvidence {cache:'hit'|'miss'|'refresh'|'disabled';key?:string;reason?:string}
interface Artifact {path:string;size:number;sha256:string}
interface Manifest {format:1;key:string;files:Artifact[]}
interface CacheRequest {
  project:string;directory:string;roots:string[];required:string[];
  inputs:()=>unknown;rebuild?:boolean;disabledReason?:string;
}
const digest=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
const maximumBytes=128*1024*1024,maximumFiles=4096;
const metadataHashes=new Map<string,{stamp:string;sha256:string}>();
/** Fingerprint system linker inputs; a changed inode or timestamp requires new bytes. */
export function compilationInputHash(file:string):string {
  const status=statSync(file,{bigint:true});
  const stamp=[status.dev,status.ino,status.size,status.mtimeNs,status.ctimeNs].join(':');
  const previous=metadataHashes.get(file);if(previous?.stamp===stamp)return previous.sha256;
  const sha256=digest(readFileSync(file));metadataHashes.set(file,{stamp,sha256});return sha256;
}
function privateDirectory(path:string) {
  const status=lstatSync(path);
  if(!status.isDirectory()||status.isSymbolicLink()||(process.getuid&&status.uid!==process.getuid())||(status.mode&0o022))
    throw new Error('Compilation cache requires a private, owned directory without links');
}
function within(root:string,path:string):boolean {
  const name=relative(root,path);return !name||!isAbsolute(name)&&name!=='..'&&!name.startsWith('..'+(process.platform==='win32'?'\\':'/'));
}
function cacheRoot(project:string):string {
  const configured=resolve(process.env.AUG_COMPILATION_CACHE??join(homedir(),'.cache/augscript/compilation-v1'));
  if(within(realpathSync(project),configured))throw new Error('Compilation cache must be outside the project');
  mkdirSync(configured,{recursive:true,mode:0o700});privateDirectory(configured);
  const root=realpathSync(configured);
  if(within(realpathSync(project),root))throw new Error('Compilation cache must be outside the project');
  return root;
}
function allowed(path:string,roots:string[]):boolean {
  return /^[A-Za-z0-9._/-]+$/.test(path)&&!path.split('/').some(part=>!part||part==='.'||part==='..')&&
    roots.some(root=>path===root||path.startsWith(root+'/'));
}
function readRegular(root:string,path:string):Buffer {
  const file=join(root,path);let parent=dirname(file);
  while(parent!==root){privateDirectory(parent);const next=dirname(parent);if(next===parent)throw new Error('Invalid cache parent');parent=next;}
  const status=lstatSync(file);
  if(!status.isFile()||status.isSymbolicLink()||(process.getuid&&status.uid!==process.getuid())||(status.mode&0o022)||status.size>maximumBytes)
    throw new Error('Invalid compilation cache file');
  return readFileSync(file);
}
function readEntry(entry:string,key:string,request:CacheRequest):Map<string,Buffer> {
  privateDirectory(entry);const manifestBytes=readRegular(entry,'manifest.json');
  if(manifestBytes.length>1024*1024)throw new Error('Compilation cache manifest is too large');
  const manifest=JSON.parse(manifestBytes.toString('utf8')) as Manifest;
  if(!manifest||Object.keys(manifest).sort().join(',')!=='files,format,key'||manifest.format!==1||manifest.key!==key||
    !Array.isArray(manifest.files)||!manifest.files.length||manifest.files.length>maximumFiles)throw new Error('Invalid compilation cache manifest');
  privateDirectory(join(entry,'files'));const buffers=new Map<string,Buffer>();let total=0;
  for(const item of manifest.files){
    if(!item||Object.keys(item).sort().join(',')!=='path,sha256,size'||typeof item.path!=='string'||!allowed(item.path,request.roots)||
      buffers.has(item.path)||!Number.isSafeInteger(item.size)||item.size<0||typeof item.sha256!=='string'||!/^[a-f0-9]{64}$/.test(item.sha256))throw new Error('Invalid compilation cache artifact');
    total+=item.size;if(total>maximumBytes)throw new Error('Compilation cache entry is too large');
    // Restore these exact bytes, rather than hashing one read and later copying another.
    const bytes=readRegular(join(entry,'files'),item.path);
    if(bytes.length!==item.size||digest(bytes)!==item.sha256)throw new Error('Compilation cache artifact changed');
    buffers.set(item.path,bytes);
  }
  if(request.required.some(path=>!buffers.has(path)))throw new Error('Compilation cache entry is incomplete');
  return buffers;
}
function restore(directory:string,files:Map<string,Buffer>,executable:string) {
  for(const [path,bytes] of files){
    const output=join(directory,path),temporary=output+'.cache-'+randomUUID();mkdirSync(dirname(output),{recursive:true});
    try{writeFileSync(temporary,bytes,{flag:'wx',mode:path===executable?0o755:0o644});renameSync(temporary,output);}
    finally{rmSync(temporary,{force:true});}
  }
}
function collect(directory:string,roots:string[]):Map<string,Buffer> {
  const files=new Map<string,Buffer>();let total=0;
  const visit=(path:string)=>{
    const status=lstatSync(join(directory,path));if(status.isSymbolicLink())throw new Error('Linked compilation output cannot be cached');
    if(status.isDirectory()){for(const name of readdirSync(join(directory,path)).sort())visit(path+'/'+name);return;}
    if(!status.isFile()||status.size>maximumBytes||!allowed(path,roots))throw new Error('Invalid compilation output');
    const bytes=readFileSync(join(directory,path));total+=bytes.length;
    if(total>maximumBytes||files.size>=maximumFiles)throw new Error('Compilation cache entry is too large');
    files.set(path,bytes);
  };
  for(const root of roots)visit(root);return files;
}
function saveEntry(root:string,entry:string,key:string,request:CacheRequest) {
  privateDirectory(root);const files=collect(request.directory,request.roots);
  if(request.required.some(path=>!files.has(path)))throw new Error('Compilation output is incomplete');
  const staging=join(root,'.staging-'+randomUUID());mkdirSync(staging,{mode:0o700});
  try{
    const manifest:Manifest={format:1,key,files:[]};
    for(const [path,bytes] of files){
      const file=join(staging,'files',path);mkdirSync(dirname(file),{recursive:true,mode:0o700});
      writeFileSync(file,bytes,{flag:'wx',mode:0o600});manifest.files.push({path,size:bytes.length,sha256:digest(bytes)});
    }
    writeFileSync(join(staging,'manifest.json'),JSON.stringify(manifest)+'\n',{flag:'wx',mode:0o600});
    if(existsSync(entry)){
      try{readEntry(entry,key,request);return;}catch{privateDirectory(entry);rmSync(entry,{recursive:true});}
    }
    try{renameSync(staging,entry);}catch(error){if(!existsSync(entry))throw error;}
  }finally{rmSync(staging,{recursive:true,force:true});}
}
/** Cache compiler output only. Callers must always execute the restored native program. */
export function reuseTestCompilation(request:CacheRequest):{evidence:CompilationEvidence;save:()=>void} {
  if(request.disabledReason)return {evidence:{cache:'disabled',reason:request.disabledReason},save:()=>{}};
  try{
    const root=cacheRoot(request.project),key=digest(JSON.stringify({format:1,inputs:request.inputs()})),entry=join(root,key);
    const evidence:CompilationEvidence={cache:request.rebuild?'refresh':'miss',key};
    if(!request.rebuild&&existsSync(entry)){
      try{const files=readEntry(entry,key,request);restore(request.directory,files,request.required[0]);evidence.cache='hit';}
      catch{evidence.reason='Compilation cache entry was incomplete or changed; compiling again';}
    }
    return {evidence,save:()=>{if(evidence.cache==='hit')return;try{saveEntry(root,entry,key,request);}catch{evidence.reason='Compilation succeeded; the optional compilation cache could not be written';}}};
  }catch{return {evidence:{cache:'disabled',reason:'Optional compilation cache is unavailable or unsafe; compiling normally'},save:()=>{}};}
}
