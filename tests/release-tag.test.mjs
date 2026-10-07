import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createReleaseTag,requiredQualificationWorkflows} from '../scripts/create-release-tag.mjs';
const commit='a'.repeat(40),other='b'.repeat(40),tag='v1.0.0',repo='repos/GreenPandaStudios/augscript';
function fixture(options={}) {
  const writes=[],reads=[],ref={ref:'refs/tags/'+tag,object:{type:'commit',sha:options.tagCommit??commit}};
  const runs=requiredQualificationWorkflows.map((path,index)=>({id:index+1,path,head_sha:commit,head_branch:'main',event:'push',repository:{full_name:'GreenPandaStudios/augscript'},status:'completed',conclusion:'success',run_attempt:1}));
  const packet={total_count:runs.length,workflow_runs:runs};
  const config={
    git:()=>options.checkout??commit,
    verifyVersion:()=>{if(options.badVersion)throw new Error('Version mismatch');},
    request:(method,path,fields)=>{
      if(method==='POST'){writes.push({path,fields});if(options.race)throw new Error('HTTP 422 concurrent tag');return ref;}
      reads.push(path);
      if(path===repo+'/git/ref/heads/main')return {object:{type:'commit',sha:options.main??commit}};
      if(path.startsWith(repo+'/actions/runs?'))return packet;
      if(path===repo+'/git/matching-refs/tags/'+tag)return options.existing?[ref]:[];
      if(path===repo+'/git/ref/tags/'+tag)return ref;
      throw new Error('Unexpected request '+path);
    },
  };
  return {config,runs,packet,writes,reads};
}
test('tagging requires the exact main source and all three latest qualification runs',()=>{
  const f=fixture(),result=createReleaseTag(tag,commit,f.config);
  assert.equal(result.created,true);assert.equal(result.qualification.length,3);
  assert.deepEqual(f.writes,[{path:repo+'/git/refs',fields:{ref:'refs/tags/'+tag,sha:commit}}]);
  assert.equal(f.reads.at(-1),repo+'/git/ref/tags/'+tag);
});
test('stale source, mismatched versions and incomplete or failed coverage perform no writes',()=>{
  for(const options of [{checkout:other},{main:other},{badVersion:true}]){
    const f=fixture(options);assert.throws(()=>createReleaseTag(tag,commit,f.config));assert.equal(f.writes.length,0);
  }
  for(const mutate of [
    f=>{f.runs[0].status='in_progress';},
    f=>{f.runs[0].conclusion='failure';},
    f=>{f.runs[0].repository.full_name='another/repo';},
    f=>{f.runs[0].head_sha=other;},
    f=>{f.runs[0].event='pull_request';},
    f=>{f.runs[0].head_branch='another-branch';},
    f=>{f.packet.total_count=101;},
    f=>{f.packet.total_count++;},
    f=>{f.runs.push({...f.runs[0],id:20,conclusion:'failure'});f.packet.total_count++;},
  ]){
    const f=fixture();mutate(f);assert.throws(()=>createReleaseTag(tag,commit,f.config));assert.equal(f.writes.length,0);
  }
});
test('same-source retries preserve existing tags; conflicts and concurrent creation never force',()=>{
  const f=fixture({existing:true});assert.equal(createReleaseTag(tag,commit,f.config).created,false);assert.equal(f.writes.length,0);
  const conflict=fixture({existing:true,tagCommit:other});assert.throws(()=>createReleaseTag(tag,commit,conflict.config),/never moved/);assert.equal(conflict.writes.length,0);
  const race=fixture({race:true});assert.throws(()=>createReleaseTag(tag,commit,race.config),/concurrent/);assert.equal(race.writes.length,1);
  assert.equal(Object.hasOwn(race.writes[0].fields,'force'),false);
});
test('tag inputs and workflow use reviewed numeric versions with no interpolated shell input',()=>{
  for(const [name,sha] of [['v1.0.0;echo x',commit],[tag,'main']]){
    const f=fixture();assert.throws(()=>createReleaseTag(name,sha,f.config));assert.equal(f.writes.length,0);assert.equal(f.reads.length,0);
  }
  const yaml=readFileSync(new URL('../.github/workflows/create-release-tag.yml',import.meta.url),'utf8');
  assert.match(yaml,/ref: main/);assert.match(yaml,/persist-credentials: false/);
  assert.match(yaml,/node scripts\/create-release-tag.mjs "\$RELEASE_TAG" "\$RELEASE_COMMIT"/);
  assert.doesNotMatch(yaml,/run:.*\$\{\{ inputs\./);
});

test('a main change during qualification or tag inspection rejects before creation and reuse',()=>{
  for(const existing of [false,true]){
    const f=fixture({existing}),request=f.config.request;let mainReads=0;
    f.config.request=(method,path,fields)=>{if(path===repo+'/git/ref/heads/main'&&++mainReads===2)return {object:{type:'commit',sha:other}};return request(method,path,fields);};
    assert.throws(()=>createReleaseTag(tag,commit,f.config),/moved during verification/);assert.equal(mainReads,2);assert.equal(f.writes.length,0);
  }
});

test('push qualification selects the full soak for main on macOS and both Linux targets',()=>{
  for(const file of ['ci.yml','native-linux.yml']){
    const yaml=readFileSync(new URL('../.github/workflows/'+file,import.meta.url),'utf8');
    assert.match(yaml,/github\.ref == 'refs\/heads\/main'\) && 'soak'/);
  }
});
