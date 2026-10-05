import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from './compiler-process.mjs';
import {prepareLibraryFixtures} from './library-fixtures.mjs';
import {SemanticWorkspace} from '../src/semantic.ts';
import {cCompiler} from '../scripts/native-toolchain.mjs';
const cli=resolve('bin/aug.mjs');
function project(source,run){const root=mkdtempSync(join(tmpdir(),'aug-graphemes-'));try{writeFileSync(join(root,'main.aug'),source);prepareLibraryFixtures(root);return run(root);}finally{rmSync(root,{recursive:true,force:true});}}
const command=(root,backend)=>spawnSync(process.execPath,[cli,'run',root,'--offline','--backend',backend],{encoding:'utf8',timeout:60000});
for(const backend of ['c','llvm'])test('text measurement names distinguish bytes, scalars, UTF-16 units and graphemes ('+backend+')',()=>project(`try:
    text = "é👩‍💻"
    print(value=text.byteLength())
    print(value=text.codePointLength())
    print(value=text.utf16Length())
    print(value=text.graphemeLength())
    parts = text.graphemes()
    print(value=parts.length())
    for part in parts:
        print(value=part)
    print(value=parts.join(separator="") == text)
    print(value="".graphemeLength())
    print(value="".graphemes().length())
catch ConversionError failure:
    print(value="unexpected conversion error")
`,root=>{const result=command(root,backend);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'14\n5\n7\n2\n2\né\n👩‍💻\ntrue\n0\n0\n');}));

function officialVectors(){
 const lines=readFileSync('native/unicode/18.0.0/GraphemeBreakTest.txt','utf8').split(/\r?\n/),vectors=[];
 for(const line of lines){const tokens=line.split('#')[0].trim().split(/\s+/);if(tokens[0]!=='÷')continue;const parts=[];let part='';for(const token of tokens){if(token==='÷'){if(part)parts.push(part);part='';}else if(token!=='×')part+=String.fromCodePoint(parseInt(token,16));}assert.equal(part,'','final boundary');vectors.push(parts);}
 assert.equal(vectors.length,853);return vectors;
}
function checkVectors(vectors,backend,release=false){
 const texts=vectors.map(parts=>parts.join('')),source=`import parse from json
try:
    for encoded in [${texts.map(text=>JSON.stringify(JSON.stringify(text))).join(', ')}]:
        text = parse(input=encoded).string()
        parts = text.graphemes()
        print(value=text.graphemeLength())
        print(value=parts.length())
        for part in parts:
            print(value=part.bytes().base64url())
        print(value=parts.join(separator="") == text)
catch JsonError failure:
    print(value="unexpected JSON error")
catch ConversionError failure:
    print(value="unexpected UTF-8 error")
`;
 const expected=vectors.flatMap(parts=>[String(parts.length),String(parts.length),...parts.map(part=>Buffer.from(part).toString('base64url')),'true']).join('\n')+'\n';
 project(source,root=>{if(release)writeFileSync(join(root,'main.yaml'),readFileSync(join(root,'main.yaml'),'utf8')+'optimization: release\n');const result=command(root,backend);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,expected,backend+(release?' release':' debug'));});
}
for(const backend of ['c','llvm'])test('every official Unicode 18 boundary, cluster count and original byte sequence is preserved ('+backend+')',()=>checkVectors(officialVectors(),backend));
test('optimized C segmentation preserves every official boundary',()=>checkVectors(officialVectors(),'c',true));
for(const backend of ['c','llvm'])test('empty, NUL, canonical spelling, long contexts and Unicode 18 Indic linking retain exact spans ('+backend+')',()=>{
 const woman='👩',joiner='\u200d',regionalA='\u{1f1e6}',regionalB='\u{1f1e7}',regionalC='\u{1f1e8}';
 checkVectors([[],['\0','a','\r\n','b','\0'],['é'],['e\u0301'],['\u094d\u0915'],['\u094d'+'\u093c'.repeat(12000)+'\u0915'],['a'+'\u0308'.repeat(20000),'b'],[woman+(joiner+woman).repeat(10000)],[regionalA+'\u0308',regionalB+regionalC],['\u{1fc00}'+joiner+'\u{1fc01}'],['\ud7ff','\ue000','\u{10ffff}']],backend);
});
for(const backend of ['c','llvm'])test('worker cluster copies survive worker destruction and managed collection ('+backend+')',()=>project(`import splitText from operation
try:
    scope:
        pending = start worker splitText(input="é👩‍💻")
        parts = wait for pending
        index = 0
        while index < 5000:
            discarded = "text".graphemes()
            index = index + 1
        print(value=parts.length())
        print(value=parts.join(separator=""))
catch ConversionError failure:
    print(value="unexpected conversion error")
catch ConcurrencyError failure:
    print(value="unexpected concurrency error")
`,root=>{writeFileSync(join(root,'operation.aug'),'splitText(string input):\n    return input.graphemes()\n');const result=command(root,backend);assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'2\né👩‍💻\n');}));
test('grapheme calls require checked failure handling and the returned list grants reading',()=>{
 for(const source of ['value = "a".graphemeLength()\n','value = "a".graphemes()\n','try:\n    parts = "a".graphemes()\n    borrow parts:\n        parts.append(value="b")\ncatch ConversionError failure:\n    pass\n'])project(source,root=>{const result=spawnSync(process.execPath,[cli,'check',root,'--json'],{encoding:'utf8'});assert.equal(result.status,1);const issues=JSON.parse(result.stdout);assert.ok(issues.some(issue=>['BORROW','MUTABILITY','ERROR','UNLESS','THROWS'].includes(issue.code)),result.stdout);});
});
test('invalid UTF-8 raises ConversionError before either grapheme operation reports success (ASan/UBSan)',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-grapheme-native-'));try{
  const source=join(root,'probe.c'),binary=join(root,'probe');writeFileSync(source,`#include "aug_runtime.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>
static const unsigned char bad[][6]={{0xc0,0x80},{0xed,0xa0,0x80},{0xf4,0x90,0x80,0x80},{0x80},{0xc2},{0xe2,0x82},{0xf0,0x9f,0x92},{0x61,0xe2,0x28,0xa1},{0xf5,0x80,0x80,0x80}};
static const size_t lengths[]={2,3,4,1,1,2,3,4,4};
int main(void){AugValue roots[2]={aug_null(),aug_null()};AugFrame frame;aug_frame_enter(&frame,roots,2);
 for(size_t i=0;i<sizeof(lengths)/sizeof(lengths[0]);i++){
  roots[0]=aug_string_n(bad[i],lengths[i]);
  assert(aug_string_grapheme_length(roots[0])==0&&aug_has_error&&!strcmp(aug_error.as.object->type_name,"ConversionError"));
  aug_has_error=false;aug_error=aug_null();
  roots[1]=aug_string_graphemes(roots[0]);assert(roots[1].tag==AUG_NULL&&aug_has_error&&!strcmp(aug_error.as.object->type_name,"ConversionError"));
  aug_has_error=false;aug_error=aug_null();
 }
 const unsigned char valid[]={0xed,0x9f,0xbf,0xee,0x80,0x80,0xf4,0x8f,0xbf,0xbf,0};
 roots[0]=aug_string_n(valid,sizeof(valid));assert(aug_string_grapheme_length(roots[0])==4&&!aug_has_error);
 roots[1]=aug_string_graphemes(roots[0]);assert(aug_list_length(roots[1])==4);aug_collect();assert(aug_list_length(roots[1])==4);
 aug_frame_leave(&frame);aug_shutdown();puts("ok");}
`);
  const sdk='/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk',args=[...(process.platform==='darwin'?['-isysroot',sdk]:[]),'-std=c11','-D_POSIX_C_SOURCE=200809L','-O1','-g','-fsanitize=address,undefined','-fno-omit-frame-pointer','-I'+resolve('runtime'),source,resolve('runtime/aug_values.c'),resolve('runtime/aug_runtime.c'),'-pthread',...(process.platform==='linux'?['-lm']:[]),'-o',binary];
  const built=spawnSync(cCompiler(),args,{encoding:'utf8',timeout:60000});assert.equal(built.status,0,built.stderr);
  const result=spawnSync(binary,[],{encoding:'utf8',timeout:30000});assert.equal(result.status,0,result.stderr);assert.equal(result.stdout,'ok\n');
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('editor completion and hover explain the concrete Unicode version, units and checked failures',()=>project('text = "August"\ntry { parts = text.graphemes() } catch ConversionError failure { pass }\n',root=>{
 const path=join(root,'main.aug'),source=readFileSync(path,'utf8'),workspace=new SemanticWorkspace(root),view=workspace.document(path,undefined,true);
 const help=view.hover(source.indexOf('graphemes()'));assert.match(help.detail,/List<string>/);assert.match(help.detail,/ConversionError/);assert.match(help.documentation,/18\.0\.0/);assert.match(help.documentation,/original byte/);
 const unfinished='text = "August"\ntext.gra',items=workspace.document(path,{text:unfinished,version:1},true).complete(unfinished.length);
 assert.ok(items.some(item=>item.label==='graphemes'));assert.ok(items.some(item=>item.label==='graphemeLength'));
}));
