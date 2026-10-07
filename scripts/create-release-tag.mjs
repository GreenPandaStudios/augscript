#!/usr/bin/env node
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {verifyReleaseVersions} from './release-source.mjs';

const repository='GreenPandaStudios/augscript';
export const requiredQualificationWorkflows=[
  '.github/workflows/ci.yml',
  '.github/workflows/native-linux.yml',
  '.github/workflows/editor-qualification.yml',
];
function command(name,args,directory) {
  const result=spawnSync(name,args,{cwd:directory,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.error?.message||name+' failed');
  return result.stdout.trim();
}
function githubRequest(method,path,fields={}) {
  const args=['api','--method',method,path];
  for(const [name,value] of Object.entries(fields))args.push('-f',name+'='+value);
  return JSON.parse(command('gh',args));
}

/** Create an immutable lightweight version tag only after exact-source qualification. */
export function createReleaseTag(tag,commit,{
  directory=resolve(import.meta.dirname,'..'),
  git=(...args)=>command('git',args,directory),
  verifyVersion=()=>{command(process.execPath,['scripts/version.mjs','--check','--tag',tag],directory);verifyReleaseVersions(tag,commit,directory);},
  request=githubRequest,
}={}) {
  assert.match(tag,/^v\d+\.\d+\.\d+$/,'Use a numeric full compiler version tag');
  assert.match(commit,/^[0-9a-f]{40}$/,'Supply the reviewed full commit SHA');
  assert.equal(git('rev-parse','HEAD'),commit,'Checkout differs from the reviewed source');
  verifyVersion();
  const main=request('GET','repos/'+repository+'/git/ref/heads/main');
  assert.equal(main.object?.type,'commit','Main must identify a commit');
  assert.equal(main.object?.sha,commit,'Main moved; qualify and review its new source before tagging');
  const packet=request('GET','repos/'+repository+'/actions/runs?head_sha='+commit+'&event=push&per_page=100');
  assert.ok(Number.isSafeInteger(packet.total_count)&&packet.total_count<=100,'Qualification coverage is truncated');
  assert.ok(Array.isArray(packet.workflow_runs)&&packet.workflow_runs.length===packet.total_count,'Incomplete qualification response');
  const qualification=[];
  for(const path of requiredQualificationWorkflows) {
    const runs=packet.workflow_runs.filter(run=>run.path===path&&run.head_sha===commit&&run.event==='push'&&run.head_branch==='main'&&run.repository?.full_name===repository).sort((a,b)=>b.id-a.id);
    assert.ok(runs.length,'Missing qualification workflow: '+path);
    const run=runs[0];
    assert.ok(Number.isSafeInteger(run.id)&&run.id>0,'Invalid qualification run identity');
    assert.equal(run.status,'completed','Qualification is still running: '+path);
    assert.equal(run.conclusion,'success','Qualification failed: '+path);
    qualification.push({path,id:run.id,attempt:run.run_attempt});
  }
  // Never force or move a tag. A concurrent creation causes POST to fail closed.
  const refs=request('GET','repos/'+repository+'/git/matching-refs/tags/'+tag);
  assert.ok(Array.isArray(refs),'Invalid tag response');
  const existing=refs.filter(ref=>ref.ref==='refs/tags/'+tag);
  assert.ok(existing.length<=1,'Ambiguous tag identity');
  const finalMain=request('GET','repos/'+repository+'/git/ref/heads/main');
  assert.equal(finalMain.object?.type,'commit');
  assert.equal(finalMain.object?.sha,commit,'Main moved during verification; no tag will be created or accepted');
  let created=false,ref=existing[0];
  if(!ref){ref=request('POST','repos/'+repository+'/git/refs',{ref:'refs/tags/'+tag,sha:commit});created=true;}
  assert.equal(ref.ref,'refs/tags/'+tag,'Tag response differs');
  assert.equal(ref.object?.type,'commit','Existing annotated tag requires manual identity review');
  assert.equal(ref.object?.sha,commit,'Existing tag differs from the reviewed source; tags are never moved');
  const accepted=request('GET','repos/'+repository+'/git/ref/tags/'+tag);
  assert.equal(accepted.object?.type,'commit');assert.equal(accepted.object?.sha,commit,'Tag verification failed');
  return {tag,commit,created,qualification};
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url) {
  try{process.stdout.write(JSON.stringify(createReleaseTag(process.argv[2]??'',process.argv[3]??''),null,2)+'\n');}
  catch(error){process.stderr.write(error.message+'\n');process.exitCode=1;}
}
