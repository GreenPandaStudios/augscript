import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,renameSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
export const distributionInputs=JSON.parse(readFileSync(new URL('./distribution-inputs.json',import.meta.url)));
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
/** Exact public preview bytes; no package code or lifecycle script is executed here. */
export async function baselineArtifact(kind,root){
  const pin=distributionInputs.baseline,name=kind==='cli'?`greenpandastudios-aug-cli-${pin.compiler}.tgz`:`augscript-${pin.extension}.vsix`,expected=pin.sha256[name];
  assert.match(expected,/^[a-f0-9]{64}$/);const directory=resolve(root,'.aug-build/distribution-baseline');mkdirSync(directory,{recursive:true});
  const path=join(directory,name);
  if(!existsSync(path)){
    const response=await fetch(`https://github.com/GreenPandaStudios/augscript/releases/download/${pin.tag}/${name}`,{signal:AbortSignal.timeout(120000)});
    assert.ok(response.ok&&response.body,'Published distribution baseline download failed: '+response.status);
    const chunks=[];let length=0;
    for await(const chunk of response.body){length+=chunk.length;assert.ok(length<=64*1024*1024,'Baseline artifact exceeds 64 MiB');chunks.push(chunk);}
    const bytes=Buffer.concat(chunks);assert.equal(digest(bytes),expected,'Published baseline integrity differs from its reviewed pin');
    const stage=mkdtempSync(join(directory,'.download-'));
    try{writeFileSync(join(stage,'artifact'),bytes);renameSync(join(stage,'artifact'),path);}finally{rmSync(stage,{recursive:true,force:true});}
  }
  assert.equal(digest(readFileSync(path)),expected,'Cached distribution baseline changed');return path;
}
