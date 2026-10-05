import {constants,openSync,closeSync,readFileSync,writeFileSync,fsyncSync,fchmodSync,renameSync,unlinkSync,lstatSync,realpathSync,mkdirSync,existsSync} from 'node:fs';
import {join,dirname,relative,resolve} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {withPackageLock} from './package-locking.ts';
import {pendingSourceReads as permittedReads} from './source-write-state.ts';
import {assertNoRequestTransaction} from './source-transaction.ts';

export class SourceChangeError extends Error {
  readonly code:string;readonly revision?:string;readonly transaction?:string;
  constructor(code:string,message:string,facts?:{revision:string;transaction:string}){super(code+': '+message);this.code=code;this.revision=facts?.revision;this.transaction=facts?.transaction;}
}
export interface SourceImage {file:string;before:string;after:string;beforeSha256:string;afterSha256:string;mode:number}
interface SourceJournal {format:1;id:string;state:'prepared'|'committed';baseRevision:string;revision:string;files:SourceImage[]}
export interface SourceCheckpoint {phase:'validated'|'candidate-checked'|'prepared'|'written'|'committed';file?:string}
export interface SourceRecovery {status:'clean'|'rolled-back'|'completed';transaction?:string;revision?:string}
const writers=new Set<string>();
const hash=(value:string|Buffer)=>createHash('sha256').update(value).digest('hex');
const failure=(message:string)=>new SourceChangeError('CHANGE_JOURNAL',message);
const isMissing=(error:unknown)=>!!error&&typeof error==='object'&&'code' in error&&error.code==='ENOENT';
const metadata=(root:string)=>join(root,'.aug-changes');
const pending=(root:string)=>join(metadata(root),'pending.json');

export function sourceChangeRoot(root:string):string {
  const path=realpathSync(resolve(root));
  if(!lstatSync(path).isDirectory())throw failure('The project root must be a directory.');
  return path;
}
function localDirectory(path:string,create=false):void {
  try {if(!lstatSync(path).isDirectory()||lstatSync(path).isSymbolicLink())throw failure('Source-change metadata must be a local directory, not a symlink: '+path);}
  catch(error){if(!isMissing(error)||!create)throw error;mkdirSync(path,{mode:0o700});syncDirectory(dirname(path));}
}
function regularFile(path:string):void {
  const stat=lstatSync(path);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.nlink!==1)throw failure('Changes require a regular unlinked source file, not a symlink or hard link: '+path);
}
export function sourceChangePath(root:string,file:string):string {
  if(typeof file!=='string'||file.length>4096||file.includes('\\')||/[\x00-\x1f]/.test(file)||file.startsWith('/')||!file.endsWith('.aug')||
    file.split('/').some(part=>!part||part.startsWith('.')||['node_modules','dist'].includes(part)))throw failure('A source path must name an ordinary root-relative .aug file.');
  const path=resolve(root,file);
  if(relative(root,path).startsWith('..')||realpathSync(dirname(path))!==dirname(path))throw failure('Source parents must stay inside the project without symlinks.');
  regularFile(path);return path;
}
function bytes(path:string,maximum=16*1024*1024):Buffer {
  regularFile(path);
  const fd=openSync(path,constants.O_RDONLY|constants.O_NOFOLLOW);
  try {
    if(lstatSync(path).size>maximum)throw failure('A source-change file exceeds the bounded size limit: '+path);
    const value=readFileSync(fd);if(value.length>maximum)throw failure('A source-change file exceeds the bounded size limit: '+path);return value;
  }finally{closeSync(fd);}
}
function syncDirectory(path:string):void {const fd=openSync(path,constants.O_RDONLY);try{fsyncSync(fd);}finally{closeSync(fd);}}
const stagePath=(path:string,id:string)=>join(dirname(path),'.aug-write-'+id+'-'+Buffer.from(path).toString('hex').slice(-24));
function publish(path:string,value:string,mode:number,id:string):void {
  const stage=stagePath(path,id);
  const fd=openSync(stage,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,mode);
  try {writeFileSync(fd,value,'utf8');fchmodSync(fd,mode);fsyncSync(fd);}finally{closeSync(fd);}
  try {renameSync(stage,path);syncDirectory(dirname(path));}
  finally {if(existsSync(stage))unlinkSync(stage);}
}
function stamp(root:string):string {
  const folder=metadata(root);
  if(!existsSync(folder)){if(lstatExists(folder))throw failure('Source-change metadata is unavailable.');return '';}
  localDirectory(folder);
  if(lstatExists(pending(root)))throw new SourceChangeError('CHANGE_IN_PROGRESS','A checked source transaction is unfinished. Wait for its writer, or run aug change recover . after an interrupted writer.');
  const path=join(folder,'revision');
  return lstatExists(path)?bytes(path,256).toString('utf8'):'';
}
function lstatExists(path:string):boolean {try{lstatSync(path);return true;}catch(error){if(isMissing(error))return false;throw error;}}
/** Readers never accept a mixed disk revision. This guard is read-only and
 * rejects an unfinished journal; only explicit recovery may change source. */
export function coherentSourceRead<T>(projectRoot:string,read:()=>T):T {
  const root=sourceChangeRoot(projectRoot);
  if(permittedReads.has(root))return read();
  const before=stamp(root),result=read(),after=stamp(root);
  if(before!==after)throw new SourceChangeError('CHANGE_STALE_READ','Source changed during loading. Retry the command against the completed revision.');
  return result;
}
export function withSourceWriter<T>(projectRoot:string,write:()=>T):T {
  const root=sourceChangeRoot(projectRoot);
  if(writers.has(root))throw failure('A source writer cannot be nested.');
  assertNoRequestTransaction(root);
  const lock=join(root,'.aug-change-lock');if(lstatExists(lock))localDirectory(lock);
  try{return withPackageLock(lock,()=>{
    assertNoRequestTransaction(root);writers.add(root);try{return write();}finally{writers.delete(root);}
  });}catch(error){
    if(error instanceof Error&&error.message.startsWith('PACKAGE_LOCK:'))throw new SourceChangeError(error.message.includes('still running')?'CHANGE_WRITER_BUSY':'CHANGE_JOURNAL',
      error.message.includes('still running')?'Another checked source writer is active. Let it finish and retry; recover only after its process stops.':error.message);
    throw error;
  }
}
/** The synchronous writer alone may check its pending postimage. Other readers,
 * including checkpoint observers, continue to see CHANGE_IN_PROGRESS. */
export function checkPendingSource<T>(projectRoot:string,check:()=>T):T {
  const root=sourceChangeRoot(projectRoot);
  if(!writers.has(root))throw failure('Pending source checking requires the exclusive writer.');
  permittedReads.add(root);try{return check();}finally{permittedReads.delete(root);}
}
function readJournal(root:string):SourceJournal {
  localDirectory(metadata(root));
  let journal:SourceJournal;
  try {journal=JSON.parse(bytes(pending(root),64*1024*1024).toString('utf8'));}catch(error){throw failure('Cannot read the recovery journal: '+(error as Error).message);}
  validateJournal(root,journal);
  return journal;
}
function validateJournal(root:string,journal:SourceJournal):void {
  if(!journal||journal.format!==1||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(journal.id)||!['prepared','committed'].includes(journal.state)||
    !/^[a-f0-9]{64}$/.test(journal.baseRevision)||!/^[a-f0-9]{64}$/.test(journal.revision)||!Array.isArray(journal.files)||!journal.files.length||journal.files.length>4096)throw failure('Unsupported or malformed source recovery journal. Preserve it for inspection.');
  const seen=new Set<string>();
  for(const image of journal.files){
    if(!image||typeof image.file!=='string'||seen.has(image.file)||typeof image.before!=='string'||typeof image.after!=='string'||
      Buffer.byteLength(image.before)>16*1024*1024||Buffer.byteLength(image.after)>16*1024*1024||image.beforeSha256!==hash(image.before)||image.afterSha256!==hash(image.after)||
      !Number.isInteger(image.mode)||image.mode<0||image.mode>0o777)throw failure('Malformed source images or digests in the recovery journal.');
    sourceChangePath(root,image.file);seen.add(image.file);
  }
}
function finish(root:string,journal:SourceJournal):void {
  publish(join(metadata(root),'revision'),journal.id+'\n',0o600,randomUUID());
  publish(join(metadata(root),'epoch'),randomUUID(),0o600,randomUUID());
  unlinkSync(pending(root));syncDirectory(metadata(root));
}
function recover(root:string):SourceRecovery {
  if(!lstatExists(metadata(root)))return {status:'clean'};
  localDirectory(metadata(root));
  if(!lstatExists(pending(root)))return {status:'clean'};
  const journal=readJournal(root);
  // Validate every image before changing any: preserve an unrelated editor's
  // text rather than selecting a winner over an uncoordinated source change.
  for(const image of journal.files){const actual=hash(bytes(sourceChangePath(root,image.file)));if(actual!==image.beforeSha256&&actual!==image.afterSha256)
    throw new SourceChangeError('CHANGE_RECOVERY_CONFLICT','Source '+image.file+' matches neither journal image. Preserve both, resolve this external edit, and retry recovery.');}
  for(const image of journal.files){const content=journal.state==='committed'?image.after:image.before,path=sourceChangePath(root,image.file);
    if(hash(bytes(path))!==hash(content))publish(path,content,image.mode,randomUUID());}
  for(const image of journal.files){const stage=stagePath(sourceChangePath(root,image.file),journal.id);if(lstatExists(stage)){regularFile(stage);unlinkSync(stage);syncDirectory(dirname(stage));}}
  finish(root,journal);
  return {status:journal.state==='committed'?'completed':'rolled-back',transaction:journal.id,revision:journal.state==='committed'?journal.revision:journal.baseRevision};
}
export function recoverSourceJournal(projectRoot:string):SourceRecovery {
  const root=sourceChangeRoot(projectRoot);return withSourceWriter(root,()=>recover(root));
}
/** Publish only a prechecked image under the writer lock. Durably record every
 * before/after image before the first rename; committed journals recover forward,
 * prepared journals recover backward. Process death leaves recovery explicit. */
export function publishSourceChange(projectRoot:string,images:SourceImage[],baseRevision:string,revision:string,
  verify:()=>void,checkpoint?:(event:SourceCheckpoint)=>void):{transaction:string} {
  const root=sourceChangeRoot(projectRoot);
  if(!writers.has(root))throw failure('Source publication requires the exclusive writer.');
  stamp(root);localDirectory(metadata(root),true);
  const journal:SourceJournal={format:1,id:randomUUID(),state:'prepared',baseRevision,revision,files:images};
  validateJournal(root,journal);
  if(Buffer.byteLength(JSON.stringify({...journal,state:'committed'})+'\n')>64*1024*1024)throw failure('Source transaction exceeds the 64 MiB recovery limit.');
  for(const image of images){const path=sourceChangePath(root,image.file);if(hash(bytes(path))!==image.beforeSha256)throw new SourceChangeError('CHANGE_STALE','Source changed before publication: '+image.file);}
  publish(pending(root),JSON.stringify(journal)+'\n',0o600,randomUUID());
  let committed=false;
  try {
    checkpoint?.({phase:'prepared'});
    for(const image of images){const path=sourceChangePath(root,image.file);if(hash(bytes(path))!==image.beforeSha256)throw new SourceChangeError('CHANGE_STALE','Source changed during publication: '+image.file);
      publish(path,image.after,image.mode,journal.id);checkpoint?.({phase:'written',file:image.file});}
    checkPendingSource(root,verify);
    journal.state='committed';publish(pending(root),JSON.stringify(journal)+'\n',0o600,randomUUID());committed=true;
    checkpoint?.({phase:'committed'});finish(root,journal);return {transaction:journal.id};
  }catch(error){
    // Publication may have renamed the commit record before a directory sync
    // failed. Its visible committed state still needs forward recovery; never
    // report that accepted candidate as a rejected change.
    if(!committed){try{committed=readJournal(root).state==='committed';}catch{/* Preserve the original failure and attempt conservative rollback. */}}
    if(committed)throw new SourceChangeError('CHANGE_COMMITTED_RECOVERY_REQUIRED','The checked change committed, but journal cleanup was interrupted. Run aug change recover .: '+(error as Error).message,{revision,transaction:journal.id});
    try{recover(root);}catch(recovery){throw new SourceChangeError('CHANGE_RECOVERY_REQUIRED',(error as Error).message+'; recovery also failed: '+(recovery as Error).message);}
    throw error;
  }
}
export function sourceImage(projectRoot:string,file:string,after:string):SourceImage {
  if(typeof after!=='string'||Buffer.byteLength(after)>16*1024*1024||Buffer.from(after).toString('utf8')!==after)throw failure('A source postimage must be valid UTF-8 within the 16 MiB source limit.');
  const root=sourceChangeRoot(projectRoot),path=sourceChangePath(root,file),value=bytes(path),before=value.toString('utf8');
  if(!Buffer.from(before).equals(value))throw failure('Source must be valid UTF-8 before a checked edit: '+file);
  return {file,before,after,beforeSha256:hash(value),afterSha256:hash(after),mode:lstatSync(path).mode&0o777};
}
