import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {nativeSourceIdentity} from '../scripts/native-source-identity.mjs';
import {nativeReleaseTargets,prepareNativePackageRelease,verifyNativeReleaseDirectory} from '../scripts/prepare-native-package-release.mjs';

test('native release assembly requires complete exact candidates and unchanged source',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-native-release-'));
  try{
    const json=(path,value)=>writeFileSync(path,JSON.stringify(value));
    mkdirSync(join(root,'native'));mkdirSync(join(root,'src'));mkdirSync(join(root,'inputs'));
    writeFileSync(join(root,'native.abi.json'),'{}');writeFileSync(join(root,'native','adapter.c'),'int api(void) { return 1; }');writeFileSync(join(root,'src','export.aug'),'export api from api');
    const revision='a'.repeat(40),manifest={name:'@greenpandastudios/aug-sample',version:'0.1.3',compiler:'0.21.0',source:'src',native:{profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:'b'.repeat(64),upstream:{version:'1'},artifacts:[]}};
    for(const id of nativeReleaseTargets){const bytes=Buffer.from('candidate '+id),directory=join(root,'inputs',id);mkdirSync(directory);
      const artifact={id,url:`https://github.com/GreenPandaStudios/aug-sample/releases/download/v0.1.3/native-${id}.tar.gz`,sha256:createHash('sha256').update(bytes).digest('hex'),maximumDownloadBytes:bytes.length,target:{arch:id}};
      manifest.native.artifacts.push(artifact);writeFileSync(join(directory,'native-'+id+'.tar.gz'),bytes);
    }
    json(join(root,'aug-package.json'),manifest);json(join(root,'release-candidates.json'),{format:1,version:'0.1.3',runId:123,sourceRevision:revision});
    const identity={...nativeSourceIdentity(root),revision};
    for(const artifact of manifest.native.artifacts)json(join(root,'inputs',artifact.id,'candidate.json'),{source:identity,package:manifest.name,version:manifest.version,artifact});
    const out=join(root,'out');assert.equal(prepareNativePackageRelease(root,join(root,'inputs'),out).files.length,3);
    assert.match(readFileSync(join(out,'SHA256SUMS'),'utf8'),/release\.json/);
    const record=JSON.parse(readFileSync(join(out,'release.json')));
    for(const change of [r=>{r.files=[];},r=>{r.package='other';},r=>{r.version='9.0.0';},r=>{r.files[0].sha256='c'.repeat(64);},r=>{r.files[0].size++;},r=>{r.files[0].target={arch:'other'};},r=>{r.sourceRevision='c'.repeat(40);}]){
      const changed=structuredClone(record);change(changed);json(join(out,'release.json'),changed);
      assert.throws(()=>verifyNativeReleaseDirectory(root,out));
    }
    writeFileSync(join(out,'release.json'),JSON.stringify(record,null,2)+'\n');
    verifyNativeReleaseDirectory(root,out);
    const sums=readFileSync(join(out,'SHA256SUMS'));
    writeFileSync(join(out,'SHA256SUMS'),'unreviewed checksum');assert.throws(()=>verifyNativeReleaseDirectory(root,out),/checksum file/);
    writeFileSync(join(out,'SHA256SUMS'),sums);
    const fresh=join(root,'rejected');
    writeFileSync(join(root,'inputs',nativeReleaseTargets[0],'native-'+nativeReleaseTargets[0]+'.tar.gz'),'modified');
    assert.throws(()=>prepareNativePackageRelease(root,join(root,'inputs'),fresh),/size differs|digest differs/);assert.ok(!existsSync(fresh));
    writeFileSync(join(root,'native','adapter.c'),'changed code');
    assert.throws(()=>prepareNativePackageRelease(root,join(root,'inputs'),fresh),/changed after/);assert.ok(!existsSync(fresh));
  }finally{rmSync(root,{recursive:true,force:true});}
});
