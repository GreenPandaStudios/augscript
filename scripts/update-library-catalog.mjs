#!/usr/bin/env node
// Maintainer-only metadata refresh. It does not download libraries or run package recipes.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {parse} from '../src/parser.ts';
import {validateNativeManifest} from '../src/native-contracts.ts';
const inputs = JSON.parse(readFileSync(new URL('../native/library-catalog-inputs.json',import.meta.url),'utf8'));
if(inputs.format!==1||!Array.isArray(inputs.packages)||inputs.packages.length!==6)throw new Error('Review the six catalog source selections');
const ids=new Set();for(const {id,version,ref} of inputs.packages){if(!/^[a-z][a-z0-9]*$/.test(id)||ids.has(id)||!/^\d+\.\d+\.\d+$/.test(version)||!(/^[a-f0-9]{40}$/.test(ref)||ref==='v'+version))throw new Error('Invalid catalog selection: '+id);ids.add(id);}
const hash = text => createHash('sha256').update(text).digest('hex');
const read = async url => {
  const response = await fetch(url,{headers:{'User-Agent':'August-library-catalog'},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`Cannot read ${url}: HTTP ${response.status}`);
  return response.text();
};
const packages = await Promise.all(inputs.packages.map(async({id,version,ref})=>{
  const repository = `https://github.com/GreenPandaStudios/aug-${id}`,tag = ref.startsWith('v')?ref:undefined;
  const commit = JSON.parse(await read(`https://api.github.com/repos/GreenPandaStudios/aug-${id}/commits/${ref}`)).sha;
  if(!/^[0-9a-f]{40}$/.test(commit)||(!tag&&commit!==ref))throw new Error('Missing commit for '+ref);
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
console.log('Refreshed six native package snapshots from exact public references. Review licenses, contracts, tests and artifact availability before committing.');
