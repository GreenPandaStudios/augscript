import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {nativeQualificationPins} from '../scripts/native-qualification-pins.mjs';
test('public qualification selects reviewed source and artifact identities per host and rejects an unqualified platform',t=>{
  const root=mkdtempSync(join(tmpdir(),'aug-qualified-targets-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  const file=join(root,'pins.json'),targets={};
  for(const [host,digest,commit] of [['darwin-arm64','a','1'],['linux-x64','b','2'],['linux-arm64','c','3']])targets[host]=Object.fromEntries(['pytorch','sqlite','zlib','blake3'].map(name=>[name,{version:host==='darwin-arm64'?'0.1.1':'0.1.3',commit:commit.repeat(40),sha256:digest.repeat(64)}]));
  writeFileSync(file,JSON.stringify({format:1,targets}));
  assert.equal(nativeQualificationPins(file,'linux-x64').pytorch.sha256,'b'.repeat(64));
  assert.equal(nativeQualificationPins(file,'linux-arm64').sqlite.commit,'3'.repeat(40));
  assert.equal(nativeQualificationPins(file,'darwin-arm64').zlib.version,'0.1.1');
  assert.throws(()=>nativeQualificationPins(file,'win32-x64'),/no reviewed/);
  delete targets['linux-arm64'].blake3;writeFileSync(file,JSON.stringify({format:1,targets}));
  assert.throws(()=>nativeQualificationPins(file,'linux-arm64'));
});
