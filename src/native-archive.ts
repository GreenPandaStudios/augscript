import {createHash} from 'node:crypto';
import {closeSync,constants,fstatSync,openSync,readSync,writeSync} from 'node:fs';
import {Header,Pax} from 'tar';
import {Unzip} from 'minizlib';
import {nativePath} from './native-contracts.ts';
import type {VerifiedArchive} from './native-artifacts.ts';

/** Consume one bounded regular-file descriptor without following its final path component. */
export function readRegularNativeFile(file:string,maximumBytes:number,limit:'download'|'unpacked',consume:(bytes:Buffer)=>void):number {
  const fail=()=>{throw new Error('NATIVE_INTEGRITY: Expected a regular file within its '+(limit==='unpacked'?'unpacked size':'download')+' limit');};
  if(!Number.isSafeInteger(maximumBytes)||maximumBytes<0)fail();
  const input=openSync(file,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
  try {
    const stat=fstatSync(input);if(!stat.isFile()||stat.size>maximumBytes)fail();
    const buffer=Buffer.allocUnsafe(1024*1024);let total=0;
    for(let length;(length=readSync(input,buffer,0,buffer.length,null));){total+=length;if(total>maximumBytes)fail();consume(buffer.subarray(0,length));}
    return total;
  }finally{closeSync(input);}
}

/** The same physical entry policy applies to authentication and extraction. */
export function nativeArchiveEntry(path:string,type:string,size:number):string {
  const name=path.replace(/\/$/,'');nativePath(name);
  if(!['File','Directory'].includes(type))throw new Error('NATIVE_INTEGRITY: Archive links and special files are forbidden');
  if(!Number.isSafeInteger(size)||size<0)throw new Error('NATIVE_INTEGRITY: Invalid archive entry size');
  return name;
}

/** Authenticate tar/gzip bytes with separate member, extension-metadata and header limits. */
export function archiveFileManifestSha256(file:string,archive:VerifiedArchive):string {
  if(!/^[0-9a-f]{64}$/.test(archive.sha256)||!Number.isSafeInteger(archive.maximumDownloadBytes)||archive.maximumDownloadBytes<1||
    !Number.isSafeInteger(archive.maximumUnpackedBytes)||archive.maximumUnpackedBytes<1)
    throw new Error('NATIVE_INTEGRITY: Invalid archive digest or size bound');
  const manifest=nativePath(archive.fileManifest),digest=createHash('sha256'),member=createHash('sha256'),seen=new Set<string>();
  const metadataTypes=['ExtendedHeader','OldExtendedHeader','GlobalExtendedHeader','NextFileHasLongPath','OldGnuLongPath','NextFileHasLongLinkpath'];
  // Package producers and cache verification count extracted file bytes.
  // Tar extensions are not extracted files; bound their aggregate separately.
  const maximumMetadata=1024*1024,maximumRaw=archive.maximumUnpackedBytes+maximumMetadata+20000*1024+10240;
  if(!Number.isSafeInteger(maximumRaw))throw new Error('NATIVE_INTEGRITY: Invalid archive size bound');
  const headerBytes=Buffer.alloc(512);let filled=0,remaining=0,padding=0,unpacked=0,metadataBytes=0,count=0,raw=0,nulls=0,eof=false,found=false;
  let type='',isManifest=false,metadata:Buffer[]=[],local:Pax|undefined,global:Pax|undefined;
  const finishBody=()=>{
    if(!metadataTypes.includes(type))return;
    const text=Buffer.concat(metadata).toString('utf8');metadata=[];
    if(['ExtendedHeader','OldExtendedHeader'].includes(type))local=Pax.parse(text,local);
    else if(type==='GlobalExtendedHeader')global=Pax.parse(text,global,true);
    else {local??=new Pax({});if(type==='NextFileHasLongLinkpath')local.linkpath=text.split('\0')[0];else local.path=text.split('\0')[0];}
  };
  const consume=(bytes:Buffer)=>{
    raw+=bytes.length;if(raw>maximumRaw)throw new Error('NATIVE_INTEGRITY: Archive exceeds its unpacked size or file limit');
    let offset=0;
    while(offset<bytes.length){
      if(eof){if(bytes.subarray(offset).some(byte=>byte!==0))throw new Error('NATIVE_INTEGRITY: Data follows the archive terminator');return;}
      if(remaining){
        const length=Math.min(remaining,bytes.length-offset),chunk=bytes.subarray(offset,offset+length);
        if(isManifest)member.update(chunk);if(metadataTypes.includes(type))metadata.push(Buffer.from(chunk));
        offset+=length;remaining-=length;if(!remaining)finishBody();continue;
      }
      if(padding){const length=Math.min(padding,bytes.length-offset);padding-=length;offset+=length;continue;}
      const length=Math.min(512-filled,bytes.length-offset);bytes.copy(headerBytes,filled,offset,offset+length);filled+=length;offset+=length;
      if(filled<512)continue;filled=0;
      const header=new Header(headerBytes,0,local,global);
      if(header.nullBlock){if(++nulls===2)eof=true;continue;}nulls=0;
      if(!header.cksumValid||!header.path)throw new Error('NATIVE_INTEGRITY: Invalid archive header');
      type=header.type;const size=header.size??0,meta=metadataTypes.includes(type);
      if(!Number.isSafeInteger(size)||size<0)throw new Error('NATIVE_INTEGRITY: Invalid archive entry size');
      if(++count>20000)throw new Error('NATIVE_INTEGRITY: Archive exceeds its unpacked size or file limit');
      isManifest=false;
      if(meta){metadataBytes+=size;if(size>maximumMetadata||metadataBytes>maximumMetadata)throw new Error('NATIVE_INTEGRITY: Archive metadata exceeds its size limit');}
      else {
        unpacked+=size;if(unpacked>archive.maximumUnpackedBytes)throw new Error('NATIVE_INTEGRITY: Archive exceeds its unpacked size or file limit');
        const name=nativeArchiveEntry(header.path,['OldFile','ContiguousFile'].includes(type)?'File':type,size);
        if(header.linkpath)throw new Error('NATIVE_INTEGRITY: Archive links and special files are forbidden');
        if(seen.has(name))throw new Error('NATIVE_INTEGRITY: Duplicate archive path '+name);seen.add(name);local=undefined;
        if(name===manifest){if(type==='Directory'||size<1||size>16*1024*1024)throw new Error('NATIVE_INTEGRITY: Artifact member manifest must be a bounded regular file');found=true;isManifest=true;}
      }
      remaining=size;padding=(512-size%512)%512;if(!remaining)finishBody();
    }
  };
  let unzip:Unzip|undefined,first=true,complete=false,failure:Error|undefined;
  try {
    // Hash and decompress the same descriptor stream. Parsing a second open
    // could accept replacement bytes after authenticating the original path.
    readRegularNativeFile(file,archive.maximumDownloadBytes,'download',bytes=>{
      digest.update(bytes);
      if(first){first=false;if(bytes[0]===0x1f&&bytes[1]===0x8b){unzip=new Unzip({});unzip.on('error',(error:unknown)=>{failure??=error instanceof Error?error:new Error(String(error));});unzip.on('data',consume);unzip.on('end',()=>{complete=true;});}}
      // minizlib expands a write before emitting its output. Small compressed
      // feeds bound that temporary allocation before the header limits run.
      if(unzip){for(let offset=0;offset<bytes.length;offset+=4096){unzip.write(bytes.subarray(offset,offset+4096));if(failure)throw failure;}}
      else consume(bytes);if(failure)throw failure;
    });
    if(unzip){unzip.end();if(failure)throw failure;}else complete=true;
    if(digest.digest('hex')!==archive.sha256)throw new Error('NATIVE_INTEGRITY: Cached archive SHA-256 does not match the locked package');
    if(!complete||!eof||!found||remaining||padding||filled)throw new Error('NATIVE_INTEGRITY: Archive is incomplete or missing its member manifest');
    return member.digest('hex');
  }finally{unzip?.destroy();}
}

/** Stage an author's archive with a bounded copy before authenticating those private bytes. */
export function stageLocalArchive(file:string,destination:string,maximumBytes:number):void {
  const output=openSync(destination,'wx',0o600);
  try{readRegularNativeFile(file,maximumBytes,'download',bytes=>{
    for(let offset=0;offset<bytes.length;){const written=writeSync(output,bytes,offset,bytes.length-offset);if(written<1)throw new Error('NATIVE_INTEGRITY: Local archive copy made no progress');offset+=written;}
  });}finally{closeSync(output);}
}
