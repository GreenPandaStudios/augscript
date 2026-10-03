import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {containerReleaseSource} from '../scripts/container-release.mjs';

function fixture(t,{draft=false,integrity='sha512-released',dockerVersion='0.23.0'}={}) {
  const root=mkdtempSync(join(tmpdir(),'aug-container-source-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  mkdirSync(join(root,'docker'));writeFileSync(join(root,'package.json'),JSON.stringify({version:'0.23.0'}));
  for(const name of ['build','run'])writeFileSync(join(root,'docker/Dockerfile.'+name),'ARG AUG_VERSION='+dockerVersion+'\n');
  const replies=[{tag_name:'v0.23.0',draft,assets:[{name:'packages.json',browser_download_url:'https://example.test/packages.json'}]},[{directory:'cli',name:'@greenpandastudios/aug-cli',version:'0.23.0',integrity:'sha512-released'}],{version:'0.23.0',dist:{integrity}}];
  let requests=0;const fetcher=async()=>({status:200,json:async()=>replies[requests++]});
  return {root,fetcher,requests:()=>requests};
}
test('container inputs require the public CLI archive to match the npm package',async t=>{
  const f=fixture(t),result=await containerReleaseSource(f.root,f.fetcher);
  assert.equal(result.version,'0.23.0');assert.equal(result.compilerIntegrity,'sha512-released');assert.equal(f.requests(),3);
});
test('container preparation rejects version drift before downloading',async t=>{
  const f=fixture(t,{dockerVersion:'0.22.0'});await assert.rejects(containerReleaseSource(f.root,f.fetcher),/version drift/);assert.equal(f.requests(),0);
});
test('container preparation refuses draft compiler artifacts',async t=>{
  const f=fixture(t,{draft:true});await assert.rejects(containerReleaseSource(f.root,f.fetcher),/still a draft/);assert.equal(f.requests(),1);
});
test('container preparation refuses registry/release disagreement',async t=>{
  const f=fixture(t,{integrity:'sha512-different'});await assert.rejects(containerReleaseSource(f.root,f.fetcher),/differs from the public/);
});

test('pre-release PRs can defer image builds when the compiler is not published',async t=>{
  const f=fixture(t),missing=async()=>({status:404});
  await assert.rejects(containerReleaseSource(f.root,missing),/Publish the compiler/);
  assert.deepEqual(await containerReleaseSource(f.root,missing,{allowUnpublished:true}),{version:'0.23.0',available:'false'});
});
