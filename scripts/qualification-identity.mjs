import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import os from 'node:os';
export function qualificationIdentity(root=resolve(import.meta.dirname,'..')){
  const digest=createHash('sha256');
  for(const folder of ['src','runtime','benchmarks','gyms','scripts','native','tests','.github']){
    const files=[];
    const walk=(directory,prefix='')=>{
      for(const entry of readdirSync(directory,{withFileTypes:true})){
        if(entry.name.startsWith('.aug-')||['node_modules','dist','target','.git'].includes(entry.name))continue;
        const path=prefix+entry.name;
        assert.ok(!entry.isSymbolicLink(),'Canonical qualification inputs must not be symbolic links: '+folder+'/'+path);
        if(entry.isDirectory())walk(join(directory,entry.name),path+'/');
        else if(entry.isFile()&&/\.(ts|mjs|c|h|aug|json|yaml|yml|tbd|S)$/.test(path))files.push(path);
      }
    };
    walk(join(root,folder));
    for(const path of files.sort())digest.update(folder+'/'+path+'\0').update(readFileSync(join(root,folder,path)));
  }
  for(const path of ['package.json','package-lock.json','tsconfig.json'])digest.update(path+'\0').update(readFileSync(join(root,path)));
  return {compiler:JSON.parse(readFileSync(join(root,'package.json'))).version,sourceSha256:digest.digest('hex'),
    platform:process.platform,architecture:process.arch,os:os.release(),cpu:os.cpus()[0]?.model,node:process.version};
}

/** Capture the source that will be compiled, before any preparation or build. */
export function captureQualificationInputs(root, paths) {
  const identity=qualificationIdentity(root);
  const sources=Object.freeze(Object.fromEntries(Object.entries(paths).map(([name,path])=>[name,readFileSync(join(root,path),'utf8')])));
  const verify=()=>assert.equal(qualificationIdentity(root).sourceSha256,identity.sourceSha256,'Sources changed during preparation, compilation, or measurement');
  verify();
  return {identity,sources,verify};
}
