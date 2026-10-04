#!/usr/bin/env node
// Maintainer-only metadata refresh. It does not download libraries or run package recipes.
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {parse} from '../src/parser.ts';
import {validateNativeManifest} from '../src/native-contracts.ts';
const versions = {blake3:'0.1.5',gpu:'0.1.1',postgres:'0.1.0',pytorch:'0.1.6',sqlite:'0.1.5',zlib:'0.1.5'};
const hash = text => createHash('sha256').update(text).digest('hex');
const read = async url => {
  const response = await fetch(url,{headers:{'User-Agent':'August-library-catalog'},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`Cannot read ${url}: HTTP ${response.status}`);
  return response.text();
};
const packages = await Promise.all(Object.entries(versions).map(async([id,version])=>{
  const repository = `https://github.com/GreenPandaStudios/aug-${id}`,tag = 'v'+version;
  const commit = JSON.parse(await read(`https://api.github.com/repos/GreenPandaStudios/aug-${id}/commits/${tag}`)).sha;
  if(!/^[0-9a-f]{40}$/.test(commit))throw new Error('Missing commit for '+tag);
  const raw = `https://raw.githubusercontent.com/GreenPandaStudios/aug-${id}/${commit}/`;
  const [manifestText,descriptorText,exportsText,notices] = await Promise.all(
    ['aug-package.json','native.abi.json','src/export.aug','THIRD_PARTY_NOTICES.md'].map(path=>read(raw+path)));
  const manifest = JSON.parse(manifestText),descriptor = JSON.parse(descriptorText);
  validateNativeManifest(manifest.native);
  if(manifest.version!==version||manifest.native.bindingsSha256!==hash(descriptorText))throw new Error('Manifest/binding mismatch: '+id);
  const parsed = parse('export.aug',exportsText);
  if(parsed.diagnostics.length||parsed.file.items.some(item=>item.kind!=='export'||item.folder))throw new Error('Review changed exports: '+id);
  return {id,repository,tag,commit,manifest,resources:descriptor.resources.map(resource=>resource.name),
    exports:parsed.file.items.map(item=>item.name),notices,
    evidence:{manifestSha256:hash(manifestText),descriptorSha256:hash(descriptorText),exportsSha256:hash(exportsText),noticesSha256:hash(notices)}};
}));
writeFileSync(new URL('../native/library-catalog.json',import.meta.url),JSON.stringify({format:1,packages},null,2)+'\n');
console.log('Refreshed six tagged native package snapshots. Review licenses, contracts, tests and artifact availability before committing.');
