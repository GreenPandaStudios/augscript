import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
export function nativeQualificationPins(file,host){
  const manifest=JSON.parse(readFileSync(file));assert.equal(manifest.format,1,'Unknown native qualification pin schema');
  const pins=manifest.targets[host];assert.ok(pins,'Public native library qualification has no reviewed source/artifact pins for '+host+'. Publish and review the platform candidates before release qualification.');
  assert.deepEqual(Object.keys(pins).sort(),['blake3','pytorch','sqlite','zlib']);
  for(const pin of Object.values(pins)){
    assert.match(pin.version,/^\d+\.\d+\.\d+$/);assert.match(pin.commit,/^[0-9a-f]{40}$/);assert.match(pin.sha256,/^[0-9a-f]{64}$/);
  }return pins;
}
