#!/usr/bin/env node
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const option=(name,fallback)=>{const index=process.argv.indexOf(name);return index<0?fallback:process.argv[index+1];};
const buildImage=option('--build-image','augscript/build:local'),runtimeImage=option('--runtime-image','augscript/run:local');
const version=JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version;
const id='aug-docker-'+randomUUID().slice(0,8),created=[],checks=[];
const docker=(args,timeout=300000)=>{
  const result=spawnSync('docker',args,{cwd:root,encoding:'utf8',timeout,maxBuffer:8*1024*1024});
  assert.equal(result.status,0,result.stderr||result.error?.message||result.stdout);return result.stdout.trim();
};
const check=(name,action)=>{const result=action();checks.push({name,passed:true});console.log('PASS '+name);return result;};
try {
  const build=JSON.parse(docker(['image','inspect',buildImage]))[0],runtime=JSON.parse(docker(['image','inspect',runtimeImage]))[0];
  assert.equal(build.Os,'linux');assert.equal(build.Architecture,runtime.Architecture);
  check('released compiler version',()=>assert.equal(docker(['run','--rm',buildImage,'aug','--version']),version));
  check('non-root build with prepared compiler, tests and specs offline',()=>{
    const output=docker(['run','--rm','--network','none','--entrypoint','sh',buildImage,'-ec',
      'test "$(id -u)" != 0; test ! -e /opt/augscript; ! command -v clang; ! command -v gcc; aug init /tmp/hello; aug run /tmp/hello --offline; aug test /tmp/hello --offline; aug spec /tmp/hello; aug spec /tmp/hello --check; aug build /tmp/hello --offline --out /tmp/deploy/program; test -f /tmp/hello/.aug-build/program.ll; test ! -f /tmp/hello/.aug-build/program.c; test -d /tmp/deploy/lib; test -d /tmp/deploy/share']);
    assert.match(output,/Hello, August!/);assert.match(output,/1 passed, 0 failed/);
  });
  check('runtime runs without Node or compiler tools as a non-root user',()=>docker(['run','--rm','--entrypoint','sh',runtimeImage,'-ec',
    'test "$(id -u)" != 0; ! command -v node; ! command -v aug; ! command -v clang; ! command -v gcc; test -w /app; test -f /etc/ssl/certs/ca-certificates.crt']));
  for(const [fixture,expected] of [['smoke','Hello, August!'],['crypto-smoke','ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0'],['web-smoke',null],['package-smoke','August']]) {
    const image=id+'-'+fixture;created.push(image);
    docker(['build',...(process.env.AUG_GITHUB_TOKEN?['--secret','id=github_token,env=AUG_GITHUB_TOKEN']:[]),'--build-arg','AUG_BUILD_IMAGE='+buildImage,'--build-arg','AUG_RUNTIME_IMAGE='+runtimeImage,'-f','docker/Dockerfile.'+fixture,'-t',image,'.'],600000);
    if(expected)check(fixture+' complete deployment bundle',()=>assert.equal(docker(['run','--rm','--network','none',image]),expected));
    else {
      docker(['run','--detach','--name',id,'--publish','127.0.0.1::8080',image]);
      try {
        const address=docker(['port',id,'8080/tcp']);let response;
        for(let attempt=0;attempt<30;attempt++) {
          try {response=await fetch('http://'+address+'/health',{signal:AbortSignal.timeout(1000)});if(response.ok)break;}catch{}
          await new Promise(done=>setTimeout(done,200));
        }
        assert.equal(response?.status,200);assert.equal(await response.text(),'{"status":"ok"}');
        checks.push({name:'typed HTTP from runtime deployment bundle',passed:true});console.log('PASS typed HTTP from runtime deployment bundle');
      } finally {docker(['rm','--force',id]);}
    }
  }
  const output=resolve(option('--report','.aug-build/docker-qualification.json'));mkdirSync(resolve(output,'..'),{recursive:true});
  writeFileSync(output,JSON.stringify({format:1,version,platform:build.Os+'/'+build.Architecture,buildImage:{name:buildImage,id:build.Id},runtimeImage:{name:runtimeImage,id:runtime.Id},checks},null,2)+'\n');
  console.log('Container qualification: '+output);
} finally {
  for(const image of created)spawnSync('docker',['image','rm',image],{stdio:'ignore'});
}
