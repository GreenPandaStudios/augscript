import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {mergeCompilerPacks,releaseHosts} from '../scripts/merge-compiler-packs.mjs';

function fixture(t){
  const root=mkdtempSync(join(tmpdir(),'aug-platform-release-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  writeFileSync(join(root,'package.json'),JSON.stringify({version:'0.21.0'}));
  const input=join(root,'inputs');mkdirSync(input);
  for(const host of releaseHosts){
    const directory=join(input,host);mkdirSync(directory);
    const bytes=Buffer.from('independent archive '+host),filename='aug-llvm-'+(host==='darwin-arm64'?'macos-arm64':host)+'.tar.gz';
    writeFileSync(join(directory,filename),bytes);
    const pack={host,target:{'darwin-arm64':'aarch64-apple-darwin','linux-arm64':'aarch64-unknown-linux-gnu','linux-x64':'x86_64-unknown-linux-gnu'}[host],
      ...(host==='darwin-arm64'?{minimumOS:'14.0'}:{minimumLibc:'2.36'}),archive:{url:'https://github.com/GreenPandaStudios/augscript/releases/download/v0.21.0/'+filename,
      sha256:createHash('sha256').update(bytes).digest('hex'),maximumDownloadBytes:bytes.length,maximumUnpackedBytes:1000,fileManifest:'files.json'}};
    writeFileSync(join(directory,'compiler-pack-'+host+'.json'),JSON.stringify({format:1,compiler:'0.21.0',llvm:'23.1.2',packs:[pack]}));
  }return {root,input};
}

test('release assembly publishes one exact compiler pin and archive for every required host',t=>{
  const {root,input}=fixture(t),result=mergeCompilerPacks(input,root);
  assert.deepEqual(result.packs.map(pack=>pack.host),releaseHosts);
  for(const pack of result.packs)assert.ok(existsSync(join(root,'.aug-build',new URL(pack.archive.url).pathname.split('/').at(-1))));
  assert.deepEqual(JSON.parse(readFileSync(join(root,'native/compiler-packs.json'))),result);
});

test('missing, stale, duplicated or modified platform inputs cannot replace accepted release pins',t=>{
  for(const failure of ['missing','stale','duplicate','hash','floor','url']){
    const {root,input}=fixture(t),directory=join(input,'linux-arm64'),file=join(directory,'compiler-pack-linux-arm64.json');
    mkdirSync(join(root,'native'));writeFileSync(join(root,'native/compiler-packs.json'),'accepted pins');
    const manifest=JSON.parse(readFileSync(file));
    if(failure==='missing')rmSync(directory,{recursive:true});
    else if(failure==='duplicate'){const duplicate=join(input,'duplicate');mkdirSync(duplicate);writeFileSync(join(duplicate,'compiler-pack-linux-arm64.json'),readFileSync(file));}
    else if(failure==='hash')writeFileSync(join(directory,'aug-llvm-linux-arm64.tar.gz'),'changed');
    else{
      if(failure==='stale')manifest.compiler='0.20.1';
      if(failure==='floor')manifest.packs[0].minimumLibc='2.35';
      if(failure==='url')manifest.packs[0].archive.url=manifest.packs[0].archive.url.replace('v0.21.0','v0.20.1');
      writeFileSync(file,JSON.stringify(manifest));
    }
    assert.throws(()=>mergeCompilerPacks(input,root),undefined,failure);
    assert.equal(readFileSync(join(root,'native/compiler-packs.json'),'utf8'),'accepted pins');
    assert.ok(!existsSync(join(root,'.aug-build')),'Rejected input must not copy archives');
  }
});
