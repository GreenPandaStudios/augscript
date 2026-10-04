#!/usr/bin/env node
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';

/** Container recipes consume a published compiler; they do not build a new compiler. */
export async function containerReleaseSource(root=resolve(import.meta.dirname,'..'),fetcher=fetch,{allowUnpublished=false}={}) {
  const version=JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version;
  assert.match(version,/^\d+\.\d+\.\d+$/,'Container images require a numbered compiler release');
  for(const file of ['docker/Dockerfile.build','docker/Dockerfile.run'])
    assert.equal(/^ARG AUG_VERSION=(.+)$/m.exec(readFileSync(join(root,file),'utf8'))?.[1],version,'Container compiler version drift: '+file);
  const json=async url=>{const response=await fetcher(url,{signal:AbortSignal.timeout(60000),headers:new URL(url).hostname==='api.github.com'&&process.env.AUG_GITHUB_TOKEN?{Authorization:'Bearer '+process.env.AUG_GITHUB_TOKEN}:{}});if(response.status===404&&allowUnpublished)return null;assert.equal(response.status,200,'Publish the compiler release and npm packages before publishing container images: '+url);return response.json();};
  const release=await json('https://api.github.com/repos/GreenPandaStudios/augscript/releases/tags/v'+version);
  if(!release)return {version,available:'false'};
  assert.equal(release.tag_name,'v'+version);assert.equal(release.draft,false,'Container compiler release is still a draft');
  const packagesAsset=release.assets.find(asset=>asset.name==='packages.json');assert.ok(packagesAsset,'Compiler release has no package metadata');
  const packages=await json(packagesAsset.browser_download_url),cli=packages.find(pkg=>pkg.directory==='cli');
  assert.equal(cli?.name,'@greenpandastudios/aug-cli');assert.equal(cli.version,version);
  const npm=await json('https://registry.npmjs.org/@greenpandastudios%2faug-cli/'+version);
  if(!npm)return {version,available:'false'};
  assert.equal(npm.version,version);assert.equal(npm.dist.integrity,cli.integrity,'Registry CLI differs from the public compiler release');
  return {version,available:'true',build:'ghcr.io/greenpandastudios/aug-build',runtime:'ghcr.io/greenpandastudios/aug-runtime',compilerIntegrity:cli.integrity};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  try {for(const [name,value] of Object.entries(await containerReleaseSource(undefined,undefined,{allowUnpublished:process.argv.includes('--allow-unpublished')})))process.stdout.write(name+'='+value+'\n');}
  catch(error){process.stderr.write(error.message+'\n');process.exitCode=1;}
}
