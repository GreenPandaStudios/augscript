import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {writeWikiNotices,rejectBuildOnlyWikiInputs} from '../scripts/wiki-notices.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function fixture(t){
  const root=mkdtempSync(join(tmpdir(),'aug-wiki-notices-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  const put=(path,bytes)=>{mkdirSync(join(root,path,'..'),{recursive:true});writeFileSync(join(root,path),bytes);};
  const license='MIT original copyright and full permission text\n',font=Buffer.from('reviewed font bytes');
  put('LICENSE',license);
  const packages={
    '':{name:'augscript',version:'1.0.0'},
    'node_modules/vitepress':{version:'1.6.4',resolved:'https://registry.npmjs.org/vitepress/-/vitepress-1.6.4.tgz',integrity:'sha512-fixture'},
    'node_modules/optional-host':{version:'1.0.0',optional:true}
  };
  put('package-lock.json',JSON.stringify({packages}));
  put('node_modules/vitepress/package.json',JSON.stringify({name:'vitepress',version:'1.6.4',license:'MIT'}));
  put('node_modules/vitepress/LICENSE',license);
  put('node_modules/vitepress/NOTICE','Original additional attribution\n');
  put('node_modules/vitepress/dist/client/theme-default/fonts/inter.woff2',font);
  put('docs/third-party-licenses/inputs.json',JSON.stringify({schema:1,packages:[]}));
  put('docs/third-party-licenses/notices.json',JSON.stringify({schema:1,packages:[{path:'node_modules/vitepress',name:'vitepress',version:'1.6.4',sourceIntegrity:'sha512-fixture',notices:[{file:'LICENSE',sha256:hash(license)},{file:'NOTICE',sha256:hash('Original additional attribution\n')}]}]}));
  put('docs/public/third-party/Inter-OFL-1.1.txt','Original font license\n');
  put('docs/public/third-party/Inter-provenance.json',JSON.stringify({name:'Inter',version:'4.000',license:'OFL-1.1',licenseSha256:hash('Original font license\n'),fonts:[{file:'inter.woff2',sha256:hash(font)}]}));
  return{root,put,packages,license,out:join(root,'output')};
}
test('wiki and offline input directory retain original notices with deterministic source identities',t=>{
  const f=fixture(t),first=writeWikiNotices(f.root,f.out),second=writeWikiNotices(f.root,f.out);
  assert.deepEqual(first,second);assert.equal(first.packages.length,1);assert.equal(first.omittedOptionalInputs.length,1);
  assert.equal(first.packages[0].notices.length,2);
  for(const notice of first.packages[0].notices)assert.equal(hash(readFileSync(join(f.out,'third-party',notice.file))),notice.sha256);
  const text=readFileSync(join(f.out,'third-party/NOTICE.txt'),'utf8');
  assert.ok(text.includes(f.license));assert.match(text,/Original additional attribution/);assert.match(text,/Not an embedded-code SBOM/);
  assert.equal(readFileSync(join(f.out,'third-party/Inter-OFL-1.1.txt'),'utf8'),'Original font license\n');
  assert.ok(!JSON.stringify(first).includes(f.root));
});
test('missing inputs, unknown notice gaps and lock drift fail before writing an inventory',t=>{
  for(const mode of ['missing','gap','version','path']){
    const f=fixture(t);
    if(mode==='missing')delete f.packages['node_modules/optional-host'].optional;
    if(mode==='gap'){rmSync(join(f.root,'node_modules/vitepress/LICENSE'));rmSync(join(f.root,'node_modules/vitepress/NOTICE'));}
    if(mode==='version')f.put('node_modules/vitepress/package.json',JSON.stringify({name:'vitepress',version:'9.0.0'}));
    if(mode==='path')f.packages['node_modules/../../outside']={version:'1.0.0'};
    f.put('package-lock.json',JSON.stringify({packages:f.packages}));
    assert.throws(()=>writeWikiNotices(f.root,f.out));
    assert.throws(()=>readFileSync(join(f.out,'third-party/manifest.json')));
  }
});
test('reviewed upstream overrides are exact-version and content pinned',t=>{
  const f=fixture(t);rmSync(join(f.root,'node_modules/vitepress/LICENSE'));rmSync(join(f.root,'node_modules/vitepress/NOTICE'));
  const bytes='Original upstream license\n';f.put('docs/third-party-licenses/upstream.txt',bytes);
  const override={name:'vitepress',version:'1.6.4',file:'upstream.txt',sha256:hash(bytes),source:'https://example.test/exact-source/LICENSE',sourceIntegrity:'sha512-fixture'};
  f.put('docs/third-party-licenses/inputs.json',JSON.stringify({packages:[override]}));
  f.put('docs/third-party-licenses/notices.json',JSON.stringify({packages:[]}));
  assert.equal(writeWikiNotices(f.root,f.out).packages[0].notices[0].source,override.source);
  f.put('docs/third-party-licenses/upstream.txt','tampered');assert.throws(()=>writeWikiNotices(f.root,f.out),/Changed reviewed notice/);
  override.version='1.6.3';f.put('docs/third-party-licenses/inputs.json',JSON.stringify({packages:[override]}));
  assert.throws(()=>writeWikiNotices(f.root,f.out),/Review original notice/);
});
test('changed font bytes, duplicate font identities and symlinked notices are rejected',t=>{
  for(const mode of ['font','duplicate','symlink']){
    const f=fixture(t);
    if(mode==='font')f.put('node_modules/vitepress/dist/client/theme-default/fonts/inter.woff2','changed bytes');
    if(mode==='duplicate'){
      const p=JSON.parse(readFileSync(join(f.root,'docs/public/third-party/Inter-provenance.json')));p.fonts.push(p.fonts[0]);
      f.put('docs/public/third-party/Inter-provenance.json',JSON.stringify(p));
    }
    if(mode==='symlink'){rmSync(join(f.root,'node_modules/vitepress/LICENSE'));symlinkSync(join(f.root,'LICENSE'),join(f.root,'node_modules/vitepress/LICENSE'));}
    assert.throws(()=>writeWikiNotices(f.root,f.out));
  }
});
test('site and offline release retain the same notice directory',()=>{
  const config=readFileSync(new URL('../docs/.vitepress/config.mts',import.meta.url),'utf8');
  assert.match(config,/writeWikiNotices\(root, site\.outDir\)/);assert.match(config,/\/licenses/);
  const release=readFileSync(new URL('../scripts/release-artifacts.mjs',import.meta.url),'utf8');
  assert.match(release,/COPYFILE_DISABLE: '1'/);
  assert.match(release,/docs\/\.vitepress\/dist\/third-party\/NOTICE\.txt/);
  assert.match(release,/docs\/\.vitepress\/dist\/third-party\/manifest\.json/);
  assert.match(release,/cpSync\(join\(root, 'docs\/\.vitepress\/dist'\), join\(site, 'augscript'\), \{recursive: true\}\)/);
});

test('altered originals and removal of one attribution cannot hide behind another retained license',t=>{
  for(const mode of ['changed','removed','added','integrity']){
    const f=fixture(t);
    if(mode==='changed')f.put('node_modules/vitepress/LICENSE','license with copyright removed');
    if(mode==='removed')rmSync(join(f.root,'node_modules/vitepress/NOTICE'));
    if(mode==='added')f.put('node_modules/vitepress/COPYING','unreviewed license');
    if(mode==='integrity'){f.packages['node_modules/vitepress'].integrity='sha512-changed';f.put('package-lock.json',JSON.stringify({packages:f.packages}));}
    assert.throws(()=>writeWikiNotices(f.root,f.out),/Changed original notice|Review original notice identities/);
  }
});

test('omitted or additional font files cannot escape the reviewed complete input set',t=>{
  for(const mode of ['omitted','added']){
    const f=fixture(t);
    if(mode==='added')f.put('node_modules/vitepress/dist/client/theme-default/fonts/unreviewed.woff2','additional font');
    if(mode==='omitted'){const path='docs/public/third-party/Inter-provenance.json';const p=JSON.parse(readFileSync(join(f.root,path)));p.fonts[0].file='different.woff2';f.put(path,JSON.stringify(p));}
    assert.throws(()=>writeWikiNotices(f.root,f.out),/complete VitePress font input set/);
  }
});

test('locked optional inputs on supported Linux hosts all have reviewed original or upstream notice identities',()=>{
  const read=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
  const lock=read('package-lock.json'),pins=read('docs/third-party-licenses/notices.json'),overrides=read('docs/third-party-licenses/inputs.json');
  const selected=Object.entries(lock.packages).filter(([path,p])=>path&&p.optional&&p.os?.includes('linux')&&(!p.cpu||p.cpu.some(cpu=>['x64','arm64'].includes(cpu))));
  assert.ok(selected.length>=9);
  for(const [path,entry]of selected){
    const pin=pins.packages.find(p=>p.path===path&&p.version===entry.version);
    const override=overrides.packages.find(p=>'node_modules/'+p.name===path&&p.version===entry.version);
    assert.equal((pin??override)?.sourceIntegrity,entry.integrity,path+' is unreviewed');
    if(!pin?.notices.length){
      const buildOnly=overrides.buildOnly?.find(p=>'node_modules/'+p.name===path&&p.version===entry.version&&p.sourceIntegrity===entry.integrity);
      assert.ok(override||buildOnly,path+' lacks its original/upstream text or an explicit nonredistribution review');
      if(override)assert.equal(hash(readFileSync(new URL('../docs/third-party-licenses/'+override.file,import.meta.url))),override.sha256);
    }
  }
});

test('the explicit native build-only exception cannot enter emitted wiki code',()=>{
  for(const id of ['/root/node_modules/@napi-rs/lzma-linux-x64-gnu/index.js','/root/node_modules/@napi-rs/lzma/index.js'])
    assert.throws(()=>rejectBuildOnlyWikiInputs({chunk:{type:'chunk',modules:{[id]:{}}}}),/appears in wiki output/);
  assert.doesNotThrow(()=>rejectBuildOnlyWikiInputs({chunk:{type:'chunk',modules:{'/root/node_modules/mermaid/dist/index.js':{}}}}));
});
