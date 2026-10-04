#!/usr/bin/env node
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

/** Freeze a release's existing tag before dispatching any producer. */
export function releaseSource(tag, expectedSha, directory=resolve(import.meta.dirname,'..')) {
  assert.match(tag,/^v\d+\.\d+\.\d+$/,'Supply an existing version tag, such as v0.21.0');
  assert.match(expectedSha,/^[0-9a-f]{40}$/,'Supply the reviewed full commit SHA');
  const git=(...args)=>{
    const result=spawnSync('git',args,{cwd:directory,encoding:'utf8'});
    assert.equal(result.status,0,'Cannot read the requested release source: '+result.stderr);
    return result.stdout.trim();
  };
  const sha=git('rev-parse','--verify',`refs/tags/${tag}^{commit}`);
  assert.equal(sha,expectedSha,'Release tag differs from the reviewed commit; no artifacts will be built');
  const version=tag.slice(1);
  const read=file=>JSON.parse(git('show',`${sha}:${file}`));
  for(const file of ['package.json','vscode/package.json',...['cli','stdlib','web','crypto'].map(name=>`packages/${name}/package.json`),...['stdlib','web','crypto'].map(name=>`packages/${name}/aug-package.json`)]) {
    const manifest=read(file);
    assert.equal('v'+manifest.version,tag,'Release manifest version differs: '+file);
    if(manifest.compiler)assert.equal(manifest.compiler,version,'Release compiler version differs: '+file);
    for(const [name,dependency] of Object.entries(manifest.dependencies??{}))
      if(name.startsWith('@greenpandastudios/aug-'))assert.equal(dependency,version,'Release dependency version differs: '+file+': '+name);
  }
  for(const file of ['package-lock.json','vscode/package-lock.json']) {
    const lock=read(file);
    assert.equal(lock.version,version,'Release lock version differs: '+file);
    assert.equal(lock.packages?.['']?.version,version,'Release root lock version differs: '+file);
  }
  assert.equal(read('examples/packages/math/aug-package.json').compiler,version,'Release example compiler version differs');
  return {tag,sha};
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url) {
  try {
    const source=releaseSource(process.argv[2]??'',process.argv[3]??'');
    process.stdout.write(`tag=${source.tag}\nsha=${source.sha}\n`);
  } catch(error) {process.stderr.write(error.message+'\n');process.exitCode=1;}
}
