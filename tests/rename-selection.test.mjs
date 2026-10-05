import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from './compiler-process.mjs';
const changes=new URL('../src/checked-changes.ts',import.meta.url).href;
const before='compute(int value) returns int { return value + 1 }\ndecoyyy(int value) returns int { return value + 2 }\n';
const edited='decoyyy(int value) returns int { return value + 2 }\ncompute(int value) returns int { return value + 1 }\n';
// Each load scans imports, then reads the parsed source. Inject after either
// captured source read; the child assertion confirms the move really occurred.
for(const capture of [2,4])
for(const [selection,name,expected] of [['compute','calculate','math.aug:compute'],['compute.value','amount','math.aug:compute/input/value']])
 test('name-based '+selection+' rename never selects a different declaration after source read '+capture,()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-rename-selection-'));
  try{
   writeFileSync(join(root,'main.aug'),'');writeFileSync(join(root,'math.aug'),before);
   const script=`import fs from 'node:fs';import {syncBuiltinESMExports} from 'node:module';import {join} from 'node:path';import {planChangeRenameSymbol} from ${JSON.stringify(changes)};
const [root,selection,name,edited,capture]=process.argv.slice(1),target=join(fs.realpathSync(root),'math.aug'),original=fs.readFileSync;let moved=false,reads=0;
fs.readFileSync=function(file,...args){const result=original.call(this,file,...args);if(String(file)===target&&++reads===Number(capture)&&!moved){moved=true;fs.writeFileSync(target,edited);}return result;};syncBuiltinESMExports();
try {const plan=planChangeRenameSymbol(root,'math.aug',selection,name);console.log(JSON.stringify({status:'planned',symbol:plan.symbol,moved}));}
catch(error){console.log(JSON.stringify({status:'rejected',code:error.code,message:error.message,moved}));}
finally{fs.readFileSync=original;syncBuiltinESMExports();}
`;
   const result=spawnSync(process.execPath,['--input-type=module','-e',script,root,selection,name,edited,String(capture)],{encoding:'utf8',timeout:20000});
   assert.equal(result.status,0,result.stderr||result.error?.message);const report=JSON.parse(result.stdout);assert.equal(report.moved,true,'The external source edit must occur during planning');
   if(report.status==='rejected')assert.equal(report.code,'CHANGE_STALE',report.message);
   else assert.equal(report.symbol,expected,'The compiler must use the requested resolved declaration, not its former offset');
   assert.equal(readFileSync(join(root,'math.aug'),'utf8'),edited,'Planning must leave the external edit untouched');
  }finally{rmSync(root,{recursive:true,force:true});}
 });
