import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {nativeSourceIdentity,verifyNativeCandidate} from '../scripts/native-source-identity.mjs';
function fixture(t){
  const root=mkdtempSync(join(tmpdir(),'aug-native-source-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  for(const path of ['native/include','native/src','src'])mkdirSync(join(root,path),{recursive:true});
  const manifest={name:'@example/aug-fixture',version:'0.1.0',compiler:'0.21.0',source:'src',native:{profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:'a'.repeat(64),upstream:{version:'1.0'},artifacts:[]}};
  writeFileSync(join(root,'aug-package.json'),JSON.stringify(manifest));writeFileSync(join(root,'native.abi.json'),'descriptor');
  for(const path of ['native/include/fixture.h','native/src/adapter.c','native/build.mjs','src/api.aug'])writeFileSync(join(root,path),'source '+path);
  return {root,manifest};
}
test('measured native source identity survives adding artifact pins but rejects code, ABI, recipe and input-set drift',t=>{
  for(const changed of ['native/include/fixture.h','native/src/adapter.c','native/build.mjs','native.abi.json','src/api.aug','new-file','package-contract']){
    const {root,manifest}=fixture(t),source=nativeSourceIdentity(root),candidate={package:manifest.name,version:manifest.version,source};
    manifest.native.artifacts.push({sha256:'b'.repeat(64)});writeFileSync(join(root,'aug-package.json'),JSON.stringify(manifest));
    assert.equal(verifyNativeCandidate(candidate,root).filesSha256,source.filesSha256);
    if(changed==='package-contract'){manifest.compiler='0.20.1';writeFileSync(join(root,'aug-package.json'),JSON.stringify(manifest));}
    else writeFileSync(join(root,changed==='new-file'?'native/include/new.h':changed),'changed');
    assert.throws(()=>verifyNativeCandidate(candidate,root),/changed/,changed);
  }
});
