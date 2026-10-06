import test from 'node:test';
import assert from 'node:assert/strict';
import {releaseChannel} from '../scripts/release-channel.mjs';
import {publishPackages} from '../scripts/publish-release.mjs';

test('preview and stable channels follow complete semantic versions',()=>{
  for(const version of ['0.23.0','0.99.9','1.0.0-rc.1','2.4.0-beta'])assert.deepEqual(releaseChannel(version),{prerelease:true,npmTag:'next'});
  for(const version of ['1.0.0','1.0.1','2.0.0'])assert.deepEqual(releaseChannel(version),{prerelease:false,npmTag:'latest'});
  for(const version of [undefined,'','1','1.0','01.0.0','1.0.0+build','1.0.0-rc..1','1.0.0-01','v1.0.0','1.0.0;run'])assert.throws(()=>releaseChannel(version));
});

test('stable and preview uploads select the derived tag and preserve exact retry integrity',async()=>{
  for(const version of ['1.0.0','1.0.0-rc.1','0.23.1']){
    const packages=['stdlib','web','crypto','cli'].map(name=>({name:'@example/'+name,version,file:name+'.tgz',integrity:'sha512-'+name}));
    const published=new Map(),calls=[];
    const run=(command,args)=>{
      calls.push(args);
      if(args[0]==='view')return published.has(args[1])?{status:0,stdout:JSON.stringify(published.get(args[1]))}:{status:1,stdout:JSON.stringify({error:{code:'E404'}})};
      const pkg=packages.find(item=>item.file===args[1]);published.set(pkg.name+'@'+version,pkg.integrity);return {status:0};
    };
    await publishPackages(packages,run,()=>{});
    const uploads=calls.filter(args=>args[0]==='publish');assert.deepEqual(uploads.map(args=>args[1]),packages.map(pkg=>pkg.file));
    assert.ok(uploads.every(args=>args[args.indexOf('--tag')+1]===releaseChannel(version).npmTag&&args.includes('--ignore-scripts')));
    calls.length=0;await publishPackages(packages,run,()=>{});assert.ok(calls.every(args=>args[0]==='view'));
    published.set(packages[0].name+'@'+version,'different');calls.length=0;
    await assert.rejects(()=>publishPackages(packages,run,()=>{}),/differs from the reviewed archive/);assert.ok(calls.every(args=>args[0]==='view'));
  }
});

test('empty and mixed-version publications fail before registry access or writes',async()=>{
 const run=()=>{assert.fail('Registry must not be contacted');};
 await assert.rejects(()=>publishPackages([],run),/No release packages/);
 await assert.rejects(()=>publishPackages([{version:'1.0.0'},{version:'1.0.1'}],run),/one reviewed version/);
 await assert.rejects(()=>publishPackages([{version:'not-a-version'}],run),/semantic version/);
});
