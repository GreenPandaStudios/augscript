import assert from 'node:assert/strict';

/** Derive distribution channels from the complete reviewed package version. */
export function releaseChannel(version) {
  const match=/^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(version??'');
  assert.ok(match,'Release channel requires a complete semantic version without build metadata');
  for(const part of match[4]?.split('.')??[])assert.ok(!/^[0-9]+$/.test(part)||part==='0'||!part.startsWith('0'),'Prerelease identifiers must not have leading zeros');
  const prerelease=match[1]==='0'||match[4]!==undefined;
  return {prerelease,npmTag:prerelease?'next':'latest'};
}
