import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {cpSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const data=resolve('native/unicode/18.0.0'),generator=resolve('scripts/generate-graphemes.mjs');
const run=(file,args=[])=>spawnSync(process.execPath,[file,...args],{encoding:'utf8',timeout:30000});
test('committed Unicode generation is deterministic and verifies every pinned input and output',()=>{
 const result=run(generator,['--check']);assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/18\.0\.0.*verified/);
 const manifest=JSON.parse(readFileSync(join(data,'inputs.json'),'utf8'));
 for(const [name,pin] of Object.entries(manifest.sources))assert.equal(createHash('sha256').update(readFileSync(join(data,name))).digest('hex'),pin.sha256,name);
});
test('generated properties match every official assignment and default across all Unicode code points',()=>{
 const expected=new Uint8Array(0x110000),actual=new Uint8Array(expected.length),names=['Other','CR','LF','Control','Extend','Regional_Indicator','Prepend','SpacingMark','L','V','T','LV','LVT','ZWJ'];
 const rows=name=>readFileSync(join(data,name),'utf8').split(/\r?\n/).map(line=>line.split('#')[0].trim()).filter(Boolean).map(line=>line.split(';').map(field=>field.trim()));
 const fill=(rows,bits)=>{for(const row of rows){const [first,last]=row[0].split('..').map(point=>parseInt(point,16));for(let point=first;point<=(last??first);point++)expected[point]|=bits(row);}};
 fill(rows('GraphemeBreakProperty.txt'),row=>names.indexOf(row[1]));fill(rows('emoji-data.txt').filter(row=>row[1]==='Extended_Pictographic'),()=>16);fill(rows('DerivedCoreProperties.txt').filter(row=>row[1]==='InCB'),row=>({None:0,Consonant:32,Extend:64,Linker:96})[row[2]]);
 let previous=-1;
 for(const match of readFileSync('runtime/aug_grapheme_data.h','utf8').matchAll(/^  \{(0x[0-9a-f]+), (0x[0-9a-f]+), (\d+)\},$/gm)){const first=Number(match[1]),last=Number(match[2]),bits=Number(match[3]);assert.ok(first>previous&&last>=first&&last<actual.length);actual.fill(bits,first,last+1);previous=last;}
 assert.deepEqual(actual,expected);
});
test('maintainer generation rejects stale bytes, versions, unknown or overlapping properties, and edited output',()=>{
 for(const failure of ['integrity','version','unknown','overlap','output']){
  const root=mkdtempSync(join(tmpdir(),'aug-unicode-generation-'));try{
   for(const directory of ['native/unicode','scripts','runtime','src'])mkdirSync(join(root,directory),{recursive:true});cpSync(data,join(root,'native/unicode/18.0.0'),{recursive:true});cpSync(generator,join(root,'scripts/generate-graphemes.mjs'));
   for(const file of ['runtime/aug_grapheme_data.h','runtime/UNICODE-LICENSE.txt','src/unicode-version.ts'])cpSync(resolve(file),join(root,file));
   const directory=join(root,'native/unicode/18.0.0'),file=join(directory,'GraphemeBreakProperty.txt'),manifestPath=join(directory,'inputs.json'),manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
   if(failure==='output')writeFileSync(join(root,'runtime/aug_grapheme_data.h'),'changed output');
   else{let text=readFileSync(file,'utf8');if(failure==='version')text=text.replace('GraphemeBreakProperty-18.0.0','GraphemeBreakProperty-17.0.0');else if(failure==='unknown')text+='\n0041 ; Unexpected\n';else if(failure==='overlap')text+='\n0600 ; Prepend\n';else text+='\n# changed bytes\n';writeFileSync(file,text);if(failure!=='integrity'){manifest.sources['GraphemeBreakProperty.txt'].sha256=createHash('sha256').update(readFileSync(file)).digest('hex');writeFileSync(manifestPath,JSON.stringify(manifest));}}
   const result=run(join(root,'scripts/generate-graphemes.mjs'),['--check']);assert.equal(result.status,1,failure);assert.match(result.stderr,{integrity:/integrity failed/,version:/version mismatch/,unknown:/Unknown grapheme property/,overlap:/Overlapping Unicode property/,output:/output is stale/}[failure]);
  }finally{rmSync(root,{recursive:true,force:true});}
 }
});
