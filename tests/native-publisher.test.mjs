import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chmodSync,mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {delimiter,join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {nativeSourceIdentity} from '../scripts/native-source-identity.mjs';
import {nativeReleaseTargets,prepareNativePackageRelease} from '../scripts/prepare-native-package-release.mjs';

test('publisher finds draft releases, preserves immutable source and rejects conflicting retry bytes',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-native-publisher-'));
  const json=(path,value)=>writeFileSync(path,JSON.stringify(value));
  try{
    for(const folder of ['native','src','inputs','tools','remote'])mkdirSync(join(root,folder));
    writeFileSync(join(root,'native.abi.json'),'{}');writeFileSync(join(root,'src/export.aug'),'');
    const revision='a'.repeat(40),repository='GreenPandaStudios/aug-sample';
    const manifest={name:'@greenpandastudios/aug-sample',version:'0.1.3',compiler:'0.21.0',source:'src',native:{profile:'aug-native-abi-1',bindings:'native.abi.json',bindingsSha256:'b'.repeat(64),upstream:{version:'1'},artifacts:[]}};
    for(const id of nativeReleaseTargets){
      const bytes=Buffer.from(id),directory=join(root,'inputs',id);mkdirSync(directory);
      manifest.native.artifacts.push({id,url:`https://github.com/${repository}/releases/download/v0.1.3/native-${id}.tar.gz`,sha256:createHash('sha256').update(bytes).digest('hex'),maximumDownloadBytes:bytes.length,target:{arch:id}});
      writeFileSync(join(directory,'native-'+id+'.tar.gz'),bytes);
    }
    json(join(root,'aug-package.json'),manifest);json(join(root,'release-candidates.json'),{format:1,version:'0.1.3',runId:123,sourceRevision:revision});
    const identity={...nativeSourceIdentity(root),revision};
    for(const artifact of manifest.native.artifacts)json(join(root,'inputs',artifact.id,'candidate.json'),{source:identity,package:manifest.name,version:manifest.version,artifact});
    const output=join(root,'output');prepareNativePackageRelease(root,join(root,'inputs'),output);
    const state=join(root,'state.json');json(state,{release:null,events:[]});
    const stub=(name,code)=>{const path=join(root,'tools',name);writeFileSync(path,'#!'+process.execPath+'\n'+code);chmodSync(path,0o755);};
    stub('git',`console.log(process.argv.at(-1)==='HEAD'&&process.env.AUG_TEST_STALE?'${'b'.repeat(40)}':'${revision}');`);
    stub('gh',`import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';import {basename,join} from 'node:path';
const file=process.env.AUG_TEST_RELEASE_STATE,state=JSON.parse(readFileSync(file)),args=process.argv.slice(2);state.events.push(args);
const option=name=>args[args.indexOf(name)+1];const reply=value=>console.log(JSON.stringify(value));
if(args[0]==='api'&&args[1].includes('/actions/runs/'))reply({conclusion:'success',status:'completed',head_sha:'${revision}',path:'.github/workflows/candidate.yml',repository:{full_name:'${repository}'}});
else if(args[0]==='api'&&args[1].includes('/releases?')){if(state.hidden>0){state.hidden--;reply([]);}else reply(state.release?[state.release]:[]);}
else if(args[0]==='api')throw Error('Draft lookup must use the authenticated release collection');
else if(args[1]==='create'){state.release={tag_name:'v0.1.3',draft:true,assets:[]};state.hidden=1;}
else if(args[1]==='upload')for(const path of args.slice(3,args.indexOf('--repo'))){const name=basename(path);copyFileSync(path,join(process.env.AUG_TEST_REMOTE,name));state.release.assets.push({name});}
else if(args[1]==='download')copyFileSync(join(process.env.AUG_TEST_REMOTE,option('--pattern')),join(option('--dir'),option('--pattern')));
else if(args[1]==='edit')state.release.draft=false;
else throw Error('Unexpected GitHub command');writeFileSync(file,JSON.stringify(state));`);
    const env={...process.env,PATH:join(root,'tools')+delimiter+(process.env.PATH??''),GITHUB_REPOSITORY:repository,GITHUB_REF_NAME:'main',AUG_RELEASE_TAG:'v0.1.3',AUG_TEST_RELEASE_STATE:state,AUG_TEST_REMOTE:join(root,'remote')};
    const publish=extra=>spawnSync(process.execPath,[resolve('scripts/publish-native-package-release.mjs'),output],{cwd:root,env:{...env,...extra},encoding:'utf8',timeout:30000});
    const stale=publish({AUG_TEST_STALE:'1'});assert.notEqual(stale.status,0);assert.match(stale.stderr,/immutable release tag/);assert.equal(JSON.parse(readFileSync(state)).events.length,0);
    const first=publish();assert.equal(first.status,0,first.stderr);let observed=JSON.parse(readFileSync(state));assert.equal(observed.release.draft,false);assert.equal(observed.release.assets.length,5);
    const retry=publish();assert.equal(retry.status,0,retry.stderr);observed=JSON.parse(readFileSync(state));assert.equal(observed.events.filter(args=>args[1]==='create').length,1);assert.equal(observed.events.filter(args=>args[1]==='upload').length,1);
    writeFileSync(join(root,'remote','native-linux-arm64.tar.gz'),'different published bytes');
    const conflict=publish();assert.notEqual(conflict.status,0);assert.match(conflict.stderr,/must not be overwritten/);
    assert.equal(JSON.parse(readFileSync(state)).events.filter(args=>args[1]==='upload').length,1);
  }finally{rmSync(root,{recursive:true,force:true});}
});
