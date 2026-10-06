import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstatSync,readFileSync} from 'node:fs';
import {join} from 'node:path';

/** Explicit maintainer transport for an unpublished compiler. All source pins remain authoritative. */
export function compilerCandidateArchive(root,archive,args){
  assert.ok(args.length===0||(args.length===1&&args[0]==='--local-compiler'),'Use only --local-compiler to qualify an unpublished compiler archive');
  if(!args.length)return undefined;
  const filename=new URL(archive.url).pathname.split('/').at(-1);
  assert.ok(filename&&/^[a-zA-Z0-9_.-]+\.tar\.gz$/.test(filename),'Candidate compiler URL has no archive filename');
  return join(root,'.aug-build',filename);
}

/** Verify the transport even on a warm cache; then use the ordinary archive verifier. */
export async function withLocalCompilerArchive(archive,file,work){
  const stat=lstatSync(file);
  assert.ok(stat.isFile()&&!stat.isSymbolicLink(),'Candidate compiler archive must be a regular file');
  assert.ok(Number.isSafeInteger(archive.maximumDownloadBytes)&&archive.maximumDownloadBytes>0&&stat.size>0&&stat.size<=archive.maximumDownloadBytes,'Candidate compiler archive exceeds its download bound');
  const bytes=readFileSync(file);
  assert.ok(bytes.length>0&&bytes.length<=archive.maximumDownloadBytes,'Candidate compiler archive exceeds its download bound');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),archive.sha256,'Candidate compiler archive differs from its source-owned SHA-256');
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async input=>{
    const url=input instanceof Request?input.url:String(input);
    assert.equal(url,archive.url,'Local compiler qualification requested an unexpected download');
    return new Response(bytes,{headers:{'Content-Length':String(bytes.length)}});
  };
  try{return await work();}finally{globalThis.fetch=originalFetch;}
}
