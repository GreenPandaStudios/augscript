import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {releaseSource} from '../scripts/release-source.mjs';

test('release source binds a version tag to a reviewed commit and every package',t=>{
  const root=mkdtempSync(join(tmpdir(),'aug-release-source-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  const git=(...args)=>{
    const result=spawnSync('git',args,{cwd:root,encoding:'utf8',env:{...process.env,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null'}});
    assert.equal(result.status,0,result.stderr);return result.stdout.trim();
  };
  git('init');git('config','user.name','Release test');git('config','user.email','release@example.invalid');
  const files=['package.json','vscode/package.json',...['cli','stdlib','web','crypto'].map(name=>`packages/${name}/package.json`),...['stdlib','web','crypto'].map(name=>`packages/${name}/aug-package.json`)];
  const write=(file,data)=>{mkdirSync(dirname(join(root,file)),{recursive:true});writeFileSync(join(root,file),JSON.stringify(data));};
  for(const file of files)write(file,{version:'0.21.0'});
  for(const file of ['package-lock.json','vscode/package-lock.json'])write(file,{version:'0.21.0',packages:{'':{version:'0.21.0'}}});
  write('examples/packages/math/aug-package.json',{version:'1.0.0',compiler:'0.21.0'});
  git('add','.');git('commit','-m','Independent release fixture');
  const original=git('rev-parse','HEAD');git('tag','-a','v0.21.0','-m','Reviewed release');
  assert.deepEqual(releaseSource('v0.21.0',original,root),{tag:'v0.21.0',sha:original});
  writeFileSync(join(root,'packages/web/package.json'),JSON.stringify({version:'0.21.1'}));
  git('add','.');git('commit','-m','A different package');const changed=git('rev-parse','HEAD');
  assert.throws(()=>releaseSource('v0.21.0',changed,root),/differs from the reviewed commit/);
  git('tag','-f','v0.21.0',changed);
  assert.throws(()=>releaseSource('v0.21.0',original,root),/differs from the reviewed commit/);
  assert.throws(()=>releaseSource('v0.21.0',changed,root),/manifest version differs: packages\/web/);
  const rejected=[
    ['packages/web/aug-package.json',{version:'0.21.1'},/manifest version differs/],
    ['packages/stdlib/aug-package.json',{version:'0.21.0',compiler:'0.20.1'},/compiler version differs/],
    ['packages/cli/package.json',{version:'0.21.0',dependencies:{'@greenpandastudios/aug-stdlib':'0.20.1'}},/dependency version differs/],
    ['package-lock.json',{version:'0.20.1',packages:{'':{version:'0.21.0'}}},/lock version differs/],
    ['vscode/package-lock.json',{version:'0.21.0',packages:{'':{version:'0.20.1'}}},/root lock version differs/],
    ['examples/packages/math/aug-package.json',{version:'1.0.0',compiler:'0.20.1'},/example compiler version differs/],
  ];
  for(const [file,data,diagnostic] of rejected) {
    git('restore','--source',original,'.');write(file,data);
    git('add','.');git('commit','-m','Independent invalid release source');
    const invalid=git('rev-parse','HEAD');git('tag','-f','v0.21.0',invalid);
    assert.throws(()=>releaseSource('v0.21.0',invalid,root),diagnostic);
  }
  for(const tag of ['main','--delete','v0.21.0\nsha=bad','v0.21.0;echo bad'])assert.throws(()=>releaseSource(tag,original,root),/existing numeric version tag/);
  assert.throws(()=>releaseSource('v0.21.0','short',root),/full commit SHA/);
});

test('stable tags verify complete source contracts and reject unsupported RC extension versions',t=>{
  for(const version of ['1.0.0']){
    const root=mkdtempSync(join(tmpdir(),'aug-release-channel-source-'));
    t.after(()=>rmSync(root,{recursive:true,force:true}));
    const git=(...args)=>{
      const result=spawnSync('git',args,{cwd:root,encoding:'utf8',env:{...process.env,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null'}});
      assert.equal(result.status,0,result.stderr);return result.stdout.trim();
    };
    git('init');git('config','user.name','Release test');git('config','user.email','release@example.invalid');
    const manifests=['package.json','vscode/package.json',...['cli','stdlib','web','crypto'].map(name=>`packages/${name}/package.json`),...['stdlib','web','crypto'].map(name=>`packages/${name}/aug-package.json`)];
    for(const file of [...manifests,'package-lock.json','vscode/package-lock.json','examples/packages/math/aug-package.json']){
      mkdirSync(dirname(join(root,file)),{recursive:true});
      writeFileSync(join(root,file),JSON.stringify({version,compiler:version,dependencies:{'@greenpandastudios/aug-stdlib':version},packages:{'':{version}}}));
    }
    git('add','.');git('commit','-m','Independent stable candidate');const sha=git('rev-parse','HEAD'),tag='v'+version;git('tag',tag);
    assert.deepEqual(releaseSource(tag,sha,root),{tag,sha});
    assert.throws(()=>releaseSource('v1.0.0-rc.1',sha,root),/do not support RC suffixes/);
    assert.throws(()=>releaseSource(tag,'b'.repeat(40),root),/reviewed commit/);
  }
});
