import {randomUUID} from 'node:crypto';
import {pendingSourceReads} from './source-write-state.ts';
import {acquirePackageLock} from './package-locking.ts';
import {closeSync,existsSync,fchmodSync,fsyncSync,lstatSync,mkdirSync,openSync,readFileSync,realpathSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {dirname,join,relative,resolve,sep} from 'node:path';

export interface SourcePermit {readonly token:string}
export class SourceBusy extends Error {
  readonly code='CHANGE_BUSY';
  constructor(message='A checked source change is in progress. Retry when it finishes; use aug change recover after an interrupted writer.') {super(message);}
}
const directory=(root:string)=>join(root,'.aug-changes');
const lockFile=(root:string)=>join(directory(root),'writer.json');
const journalFile=(root:string)=>join(directory(root),'journal.json');
const epochFile=(root:string)=>join(directory(root),'epoch');
const epoch=(root:string)=>existsSync(epochFile(root))?readFileSync(epochFile(root),'utf8'):'';
const owner=(root:string):{pid:number;token:string}|undefined=>{
  if(!existsSync(lockFile(root)))return undefined;
  try{const value=JSON.parse(readFileSync(lockFile(root),'utf8'));if(!Number.isSafeInteger(value.pid)||value.pid<1||typeof value.token!=='string'||!value.token)throw new Error();return value;}
  catch{throw new SourceBusy('Source writer metadata is incomplete or invalid. Retry, or inspect .aug-changes before recovery.');}
};
const alive=(pid:number)=>{if(!Number.isSafeInteger(pid)||pid<1)throw new SourceBusy('Invalid source writer metadata. Inspect .aug-changes before recovery.');
 try{process.kill(pid,0);return true;}catch(error){if((error as NodeJS.ErrnoException).code==='ESRCH')return false;throw error;}};

export function assertNoRequestTransaction(root:string):void {if(owner(root)||existsSync(journalFile(root)))throw new SourceBusy();}
/** Readers reject a live or interrupted transaction. Epoch checks catch a commit during a read. */
export function beginSourceRead(root:string,permit?:SourcePermit):string {
  if(!pendingSourceReads.has(realpathSync(root))&&existsSync(join(directory(root),'pending.json')))throw new SourceBusy('A checked source transaction is unfinished. Run aug change recover after its writer stops.');
  const held=owner(root);
  if(!(permit&&held?.token===permit.token) && (held||existsSync(journalFile(root))))throw new SourceBusy();
  return epoch(root);
}
export function finishSourceRead(root:string,start:string,permit?:SourcePermit):void {
  if(beginSourceRead(root,permit)!==start)throw new SourceBusy('Source changed while it was being read. Retry against the new revision.');
}
function syncDirectory(path:string){const fd=openSync(path,'r');try{fsyncSync(fd);}finally{closeSync(fd);}}
export function atomicSourceWrite(path:string,text:string,mode=0o600):void {
  const temporary=join(dirname(path),`.aug-change-${randomUUID()}.tmp`),fd=openSync(temporary,'wx',mode);
  try{writeFileSync(fd,text,'utf8');fchmodSync(fd,mode);fsyncSync(fd);}catch(error){closeSync(fd);rmSync(temporary,{force:true});throw error;}
  closeSync(fd);
  try{renameSync(temporary,path);syncDirectory(dirname(path));}finally{rmSync(temporary,{force:true});}
}
export function checkedSourcePath(root:string,name:string):string {
  if(!name||name.includes('\\')||name.startsWith('/')||name.split('/').some(part=>!part||part==='.'||part==='..')||!name.endsWith('.aug'))
    throw new Error(`Edit scope needs a root-relative .aug file: ${name}`);
  const realRoot=realpathSync(root),path=resolve(root,name),physical=resolve(realRoot,name);
  let parent=dirname(path);
  while(parent!==resolve(root)){if(lstatSync(parent).isSymbolicLink())throw new Error('Source edit paths cannot pass through symbolic links');parent=dirname(parent);}
  const entry=lstatSync(path);
  if(!entry.isFile()||entry.isSymbolicLink()||entry.nlink!==1||!(entry.mode&0o222))throw new Error('Edit targets must be writable regular source files without symbolic or hard links');
  if(realpathSync(path)!==physical||relative(realRoot,physical).startsWith('..'+sep))throw new Error('Edit path escaped the project');
  return path;
}

function requestWriter(root:string,recovery:boolean):{permit:SourcePermit;release:()=>void} {
  if(existsSync(join(directory(root),'pending.json')))throw new SourceBusy('A mechanical source transaction needs aug change recover before another write.');
  const folder=directory(root);if(existsSync(folder)&&(!lstatSync(folder).isDirectory()||lstatSync(folder).isSymbolicLink()))throw new SourceBusy('Invalid .aug-changes directory');
  mkdirSync(folder,{recursive:true,mode:0o700});
  // Serialize stale-owner removal as well as acquisition. Two recoverers cannot delete
  // a newly acquired writer. Incomplete acquisition metadata fails closed for inspection.
  const gate=join(folder,'acquiring'),permit={token:randomUUID()};let gateFd:number;
  try{gateFd=openSync(gate,'wx',0o600);}catch(error){if((error as NodeJS.ErrnoException).code==='EEXIST')throw new SourceBusy('Writer acquisition is in progress or was interrupted. Inspect .aug-changes/acquiring if it persists.');throw error;}
  try{
    writeFileSync(gateFd,JSON.stringify({pid:process.pid,token:permit.token}));fsyncSync(gateFd);
    const previous=owner(root);
    if(previous){if(alive(previous.pid))throw new SourceBusy();if(!recovery&&existsSync(journalFile(root)))throw new SourceBusy();rmSync(lockFile(root));}
    if(existsSync(journalFile(root))&&!recovery)throw new SourceBusy();
    let fd:number;
    try{fd=openSync(lockFile(root),'wx',0o600);}catch(error){if((error as NodeJS.ErrnoException).code==='EEXIST')throw new SourceBusy();throw error;}
    try{writeFileSync(fd,JSON.stringify({pid:process.pid,token:permit.token}));fsyncSync(fd);}finally{closeSync(fd);}
    syncDirectory(folder);
  }finally{closeSync(gateFd);rmSync(gate);syncDirectory(folder);}
  return {permit,release:()=>{
    // An unfinished journal remains visible even after a caught process error.
    atomicSourceWrite(epochFile(root),randomUUID());
    if(owner(root)?.token===permit.token)rmSync(lockFile(root));
    syncDirectory(folder);
  }};
}
/** Both edit protocols, formatting, and package installation use this same exclusive lock. */
function sourceWriter(projectRoot:string,recovery:boolean):{permit:SourcePermit;release:()=>void} {
  const root=realpathSync(resolve(projectRoot)),lock=join(root,'.aug-change-lock');
  if(existsSync(lock)&&(!lstatSync(lock).isDirectory()||lstatSync(lock).isSymbolicLink()))throw new SourceBusy('Invalid source writer lock.');
  const release=acquirePackageLock(lock)??acquirePackageLock(lock);
  if(!release)throw new SourceBusy();
  try {
    const held=requestWriter(root,recovery);
    return {permit:held.permit,release:()=>{try{held.release();}finally{release();}}};
  }catch(error){release();throw error;}
}
/** Only one cooperating source writer may hold this permit; stale journals require recovery. */
export function withSourceWriter<T>(root:string,action:(permit:SourcePermit)=>T,recovery=false):T {
  const held=sourceWriter(root,recovery);
  try{return action(held.permit);}finally{held.release();}
}
/** Keep readers and other writers excluded until asynchronous verification and publication finish. */
export async function withSourceWriterAsync<T>(root:string,action:(permit:SourcePermit)=>Promise<T>):Promise<T> {
  const held=sourceWriter(root,false);
  try{return await action(held.permit);}finally{held.release();}
}
export interface JournalEntry {file:string;before:string;after:string;mode:number}
export interface SourceJournal {
  format:1;transaction:string;status:'prepared'|'committed';baseRevision:string;candidateRevision:string;
  entries:JournalEntry[];evidence:unknown;
}
export function writeSourceJournal(root:string,journal:SourceJournal):void {
  atomicSourceWrite(journalFile(root),JSON.stringify(journal));
}
export function clearSourceJournal(root:string):void {rmSync(journalFile(root));syncDirectory(directory(root));}
export function recordAcceptedChange(root:string,journal:SourceJournal):void {
  const revisions=join(directory(root),'revisions');
  if(existsSync(revisions)&&(!lstatSync(revisions).isDirectory()||lstatSync(revisions).isSymbolicLink()))throw new SourceBusy('Invalid revision directory.');
  mkdirSync(revisions,{recursive:true,mode:0o700});
  atomicSourceWrite(join(revisions,`${journal.candidateRevision}.json`),JSON.stringify({format:1,baseRevision:journal.baseRevision,
    revision:journal.candidateRevision,evidence:journal.evidence}));
}

/** Recovery never overwrites edits made outside the transaction. Pending changes roll back. */
export function recoverSourceChange(root:string):{status:'nothing to recover'|'rolled back'|'committed';revision?:string} {
  return withSourceWriter(root,()=>{
    if(!existsSync(journalFile(root)))return {status:'nothing to recover'};
    const journal=JSON.parse(readFileSync(journalFile(root),'utf8')) as SourceJournal;
    if(journal.format!==1||!['prepared','committed'].includes(journal.status)||!Array.isArray(journal.entries)||!journal.entries.length||
      !/^[a-f0-9]{64}$/.test(journal.baseRevision)||!/^[a-f0-9]{64}$/.test(journal.candidateRevision)||
      new Set(journal.entries.map(entry=>entry.file)).size!==journal.entries.length)throw new SourceBusy('Unrecognized source journal; recovery stopped');
    const entries=journal.entries.map(entry=>{if(typeof entry.before!=='string'||typeof entry.after!=='string'||!Number.isInteger(entry.mode)||entry.mode<0||entry.mode>0o777)
      throw new SourceBusy('Invalid source journal entry; recovery stopped');return {...entry,path:checkedSourcePath(root,entry.file)};});
    for(const entry of entries){const current=readFileSync(entry.path,'utf8');if(current!==entry.before&&current!==entry.after)
      throw new SourceBusy(`Recovery conflict in ${entry.file}. Keep the journal and reconcile that file before retrying.`);}
    for(const entry of entries)atomicSourceWrite(entry.path,journal.status==='prepared'?entry.before:entry.after,entry.mode);
    if(journal.status==='committed')recordAcceptedChange(root,journal);
    clearSourceJournal(root);
    return {status:journal.status==='prepared'?'rolled back':'committed',revision:journal.status==='prepared'?journal.baseRevision:journal.candidateRevision};
  },true);
}
