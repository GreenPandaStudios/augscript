import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from './compiler-process.mjs';
import {prepareLibraryFixtures} from './library-fixtures.mjs';
import {cCompiler} from '../scripts/native-toolchain.mjs';
import {SemanticWorkspace} from '../src/semantic.ts';
const compiler=new URL('../bin/aug.mjs',import.meta.url).pathname;
function project(source,action){const root=mkdtempSync(join(tmpdir(),'aug-domain-values-'));try{writeFileSync(join(root,'main.aug'),source);prepareLibraryFixtures(root);return action(root);}finally{rmSync(root,{recursive:true,force:true});}}
function run(source,backend){return project(source,root=>spawnSync(process.execPath,[compiler,'run',root,'--backend',backend,'--offline'],{encoding:'utf8',timeout:90000}));}
const quote=JSON.stringify;
for(const backend of ['c','llvm'])test('calendar construction and parsing agree with the independent UTC calendar ('+backend+')',()=>{
 const rows=[];for(const year of [0,1,4,100,400,1582,1900,2000,2100,2024,9999,10000])for(const month of [0,1,2,3,4,5,6,7,8,9,10,11,12,13])for(const day of [0,1,28,29,30,31,32]){
  const date=new Date(0);date.setUTCFullYear(year,month-1,day);date.setUTCHours(0,0,0,0);const valid=year>=1&&year<=9999&&date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day;
  const text=String(year).padStart(4,'0')+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0');rows.push({year,month,day,text,expected:valid?text:'invalid'});
 }
 const source='import CivilDate and parseCivilDate and formatCivilDate from august.values\nfor (year, month, day, text) in ['+rows.map(r=>`(${r.year}, ${r.month}, ${r.day}, ${quote(r.text)})`).join(', ')+']:\n    try:\n        print(value=formatCivilDate(value=CivilDate(year, month, day)))\n    catch ConversionError failure:\n        print(value="invalid")\n    try:\n        print(value=formatCivilDate(value=parseCivilDate(text)))\n    catch ConversionError failure:\n        print(value="invalid")\n';
 const actual=run(source,backend);assert.equal(actual.status,0,actual.stderr);assert.equal(actual.stdout,rows.flatMap(r=>[r.expected,r.expected]).join('\n')+'\n');
});
for(const backend of ['c','llvm'])test('duration spelling and arithmetic retain exact int64 bounds ('+backend+')',()=>{
 const min=-(1n<<63n),max=(1n<<63n)-1n,values=[min,min+1n,-1001n,-1000n,-999n,-1n,0n,1n,999n,1000n,1001n,max-1n,max];
 const formats=values.map(n=>{const abs=n<0n?-n:n;return(n<0n?'-':'')+'PT'+abs/1000n+'.'+String(abs%1000n).padStart(3,'0')+'S';});
 const invalid=['','PT','PTS','PT.S','PT.1S','PT1.S','PT1.0000S','P1M','PT1M','PT1e3S','+PT1S','pt1s','PT1S ',' PT1S','PT١S','PT00000000000000000S','PT9223372036854775.808S','-PT9223372036854775.809S'];
 const source='import Duration and parseDuration and formatDuration and durationFromSeconds and addDurations from august.values\nfor value in ['+values.join(', ')+']:\n    try:\n        formatted = formatDuration(value=Duration(milliseconds=value))\n        print(value=formatted)\n        print(value=parseDuration(text=formatted).milliseconds)\n    catch ConversionError failure:\n        print(value="unexpected")\nfor text in ['+invalid.map(quote).join(', ')+']:\n    try:\n        parseDuration(text)\n        print(value="accepted")\n    catch ConversionError failure:\n        print(value="invalid")\ntry { print(value=parseDuration(text="-PT0.001S").milliseconds); print(value=parseDuration(text="PT001.25S").milliseconds) } catch ConversionError failure { print(value="unexpected") }\ntry { durationFromSeconds(seconds=9223372036854776) } catch ArithmeticError failure { print(value="overflow") }\ntry { durationFromSeconds(seconds=-9223372036854776) } catch ArithmeticError failure { print(value="overflow") }\ntry { addDurations(left=Duration(milliseconds=9223372036854775807), right=Duration(milliseconds=1)) } catch ArithmeticError failure { print(value="overflow") }\n';
 const actual=run(source,backend);assert.equal(actual.status,0,actual.stderr);assert.equal(actual.stdout,values.flatMap((n,i)=>[formats[i],String(n)]).concat(invalid.map(()=> 'invalid'),['-1','1250','overflow','overflow','overflow']).join('\n')+'\n');
});
function validateTexts(type,parse,format,accepted,rejected,backend){
 const entries=[...accepted.map(text=>[text,text]),...rejected.map(text=>[text,'invalid'])];
 const source=`import ${type} and ${parse} and ${format} from august.values\nimport parse from json\nfor encoded in [${entries.map(([text])=>quote(JSON.stringify(text))).join(', ')}]:\n    try:\n        text = parse(input=encoded).string()\n        try:\n            print(value=${format}(value=${type}(text)))\n        catch ConversionError failure:\n            print(value="invalid")\n        try:\n            print(value=${format}(value=${parse}(text)))\n        catch ConversionError failure:\n            print(value="invalid")\n    catch JsonError failure:\n        print(value="unexpected JSON failure")\n`;
 const actual=run(source,backend);assert.equal(actual.status,0,actual.stderr);assert.equal(actual.stdout,entries.flatMap(([,expected])=>[expected,expected]).join('\n')+'\n');
}
for(const backend of ['c','llvm'])test('URL profiles preserve RFC component examples and reject unsupported authorities ('+backend+')',()=>{
 const label='a'.repeat(63),host=[label,label,label,'a'.repeat(61)].join('.');assert.equal(host.length,253);
 const accepted=['http://a/b/c/d;p?q','HTTPS://Example.com:443/a%2Fb?x=?','https://example.com?','http://1a:1','http://a:65535','http://a:00001/','http://'+host,'http://a/%00%ff','http://a/!$&\'()*+,;=:@-._~/?/??','http://a/'+ 'b'.repeat(8192-9)];
 const rejected=['','http://','https://','http://a:0','http://a:65536','http://a:000001','http://a:','http://a:b','http://a:1:2','http://user@host/','http://127.0.0.1','http://[::1]/','http://a#fragment','http://a/%','http://a/%1','http://a/%gg','http://a/a b','http://a/é','http://a/\u0000','http://-a','http://a-','http://a_b','http://a..b','http://a.','http://'+ 'a'.repeat(64),'http://'+host+'a','ftp://a','//a/path','http://a/'+ 'b'.repeat(8193-9)];
 validateTexts('HttpUrl','parseHttpUrl','formatHttpUrl',accepted,rejected,backend);
});
for(const backend of ['c','llvm'])test('portable paths and tokens enforce each documented bound ('+backend+')',()=>{
 validateTexts('PortableRelativePath','parsePortableRelativePath','formatPortableRelativePath',['docs/reference.md','.git/config','a-b_c.txt','com0','nulled.txt','x'.repeat(255),Array(64).fill('x').join('/'),['a'.repeat(255),'b'.repeat(255),'c'.repeat(255),'d'.repeat(254),'a'].join('/')],['','/a','a/','a//b','.','..','a/../b','a.','NUL.txt','com1/readme','cOn.a','LPT9.txt','a\\b','a b','a~b','é','a'.repeat(256),Array(65).fill('x').join('/'),'a/\0', ['a'.repeat(255),'b'.repeat(255),'c'.repeat(255),'d'.repeat(254),'aa'].join('/')],backend);
 validateTexts('TokenId','parseTokenId','formatTokenId',['A_1-~.','x'.repeat(128)],['','x'.repeat(129),'a b','a/b','é','a\0'],backend);
});
for(const backend of ['c','llvm'])test('bounded text preserves NUL and canonical spelling and validates byte bounds ('+backend+')',()=>{
 const source=`import BoundedText and parseBoundedText and formatBoundedText from august.values
import parse from json
try:
    print(value=formatBoundedText(value=parseBoundedText(text="é", minBytes=2, maxBytes=2)))
    print(value=formatBoundedText(value=BoundedText(text="é", minBytes=3, maxBytes=3)))
    text = parse(input=${quote(JSON.stringify("a\0b"))}).string()
    print(value=BoundedText(text, minBytes=3, maxBytes=3).text.bytes().hex())
    print(value=BoundedText(text="", minBytes=0, maxBytes=0) == BoundedText(text="", minBytes=0, maxBytes=1))
catch Error failure:
    print(value="unexpected")
for (text, minBytes, maxBytes) in [("é", 0, 1), ("", -1, 1), ("", 1, 0), ("", 0, 1048577)]:
    try:
        BoundedText(text, minBytes, maxBytes)
        print(value="accepted")
    catch ConversionError failure:
        print(value="invalid")
`;
 const actual=run(source,backend);assert.equal(actual.status,0,actual.stderr);assert.equal(actual.stdout,'é\né\n610062\nfalse\ninvalid\ninvalid\ninvalid\ninvalid\n');
});

for(const backend of ['c','llvm'])test('record replacement and JSON decoding recheck domain invariants ('+backend+')',()=>{
 const source=`import CivilDate and formatCivilDate and HttpUrl and PortableRelativePath and joinPortablePaths from august.values
import parse from json
try:
    date = CivilDate(year=2000, month=2, day=29)
    try:
        discarded = date with (year=1900)
    catch ConversionError failure:
        print(value="copy rejected")
    print(value=formatCivilDate(value=date))
    decoded = parse(input=${quote('{"year":2000,"month":2,"day":29}')}).decode<CivilDate>()
    print(value=formatCivilDate(value=decoded))
    try:
        parse(input=${quote('{"year":1900,"month":2,"day":29}')}).decode<CivilDate>()
    catch ConversionError failure:
        print(value="decoded date rejected")
    try:
        url = HttpUrl(text="https://example.com")
        discarded = url with (text="file:///tmp/secret")
    catch ConversionError failure:
        print(value="url copy rejected")
    print(value=joinPortablePaths(left=PortableRelativePath(text="docs"), right=PortableRelativePath(text="api/time.md")).text)
catch JsonError failure:
    print(value="unexpected JSON error")
catch ConversionError failure:
    print(value="unexpected domain error")
`;
 const actual=run(source,backend);assert.equal(actual.status,0,actual.stderr);assert.equal(actual.stdout,'copy rejected\n2000-02-29\n2000-02-29\ndecoded date rejected\nurl copy rejected\ndocs/api/time.md\n');
});
for(const backend of ['c','llvm'])test('joined paths and bounded text respect the complete allocation caps ('+backend+')',()=>{
 const path='a'.repeat(255)+'/'+ 'b'.repeat(255)+'/'+ 'c'.repeat(255)+'/'+ 'd'.repeat(254)+'/a';assert.equal(path.length,1024);
 const source=`import PortableRelativePath and joinPortablePaths and BoundedText from august.values
try:
    text = "x"
    index = 0
    while index < 20:
        text = text + text
        index = index + 1
    print(value=BoundedText(text, minBytes=1048576, maxBytes=1048576).text.byteLength())
    try:
        BoundedText(text=text + "x", minBytes=0, maxBytes=1048576)
    catch ConversionError failure:
        print(value="text limit")
    left = PortableRelativePath(text=${quote(path)})
    try:
        joinPortablePaths(left, right=PortableRelativePath(text="b"))
    catch ConversionError failure:
        print(value="joined byte limit")
    try:
        joinPortablePaths(left=PortableRelativePath(text=${quote(Array(64).fill('a').join('/'))}), right=PortableRelativePath(text="b"))
    catch ConversionError failure:
        print(value="joined segment limit")
catch ConversionError failure:
    print(value="unexpected")
`;
 const actual=run(source,backend);assert.equal(actual.status,0,actual.stderr);assert.equal(actual.stdout,'1048576\ntext limit\njoined byte limit\njoined segment limit\n');
});
for(const backend of ['c','llvm'])test('domain text constructors reject malformed UTF-8 received through native argv ('+backend+')',()=>project(`import BoundedText from august.values
for text in arguments():
    try:
        BoundedText(text, minBytes=0, maxBytes=100)
        print(value="accepted invalid bytes")
    catch ConversionError failure:
        print(value="invalid utf8")
`,root=>{
 const built=spawnSync(process.execPath,[compiler,'build',root,'--backend',backend,'--offline'],{encoding:'utf8',timeout:90000});assert.equal(built.status,0,built.stderr);
 const binary=built.stdout.trim(),driver=join(root,'driver.c'),launcher=join(root,'driver');
 writeFileSync(driver,'#include <unistd.h>\n#include <stdio.h>\nint main(int argc,char **argv){if(argc!=2)return 2;char bad[]={0x61,(char)0xed,(char)0xa0,(char)0x80,0};char *args[]={argv[1],bad,NULL};execv(argv[1],args);perror("execv");return 1;}\n');
 const sdk=process.platform==='darwin'?spawnSync('xcrun',['--show-sdk-path'],{encoding:'utf8'}):undefined;
 if(sdk)assert.equal(sdk.status,0,sdk.stderr);
 const compiled=spawnSync(cCompiler(),[...(sdk?['-isysroot',sdk.stdout.trim()]:[]),'-std=c11',driver,'-o',launcher],{encoding:'utf8',timeout:60000});assert.equal(compiled.status,0,compiled.stderr);
 const actual=spawnSync(launcher,[binary],{encoding:'utf8',timeout:10000});assert.equal(actual.status,0,actual.stderr);assert.equal(actual.stdout,'invalid utf8\n');
}));

test('public domain values retain nominal types, checked errors and useful editor help',()=>project('import CivilDate and HttpUrl from august.values\ntry { date = CivilDate(year=2000, month=2, day=29); url = HttpUrl(text="https://example.com") } catch ConversionError failure { pass }\n',root=>{
 const file=join(root,'main.aug'),text=readFileSync(file,'utf8'),workspace=new SemanticWorkspace(root),view=workspace.document(file,undefined,true);
 const hover=view.hover(text.indexOf('HttpUrl(text='));assert.match(hover.documentation,/8192/);assert.match(hover.documentation,/ConversionError/);assert.match(hover.documentation,/DNS/);
 const rejected=spawnSync(process.execPath,[compiler,'check',root,'--json'],{encoding:'utf8'});assert.equal(rejected.status,0,rejected.stdout);
 const invalid='import CivilDate from august.values\ndate = CivilDate(year=2000, month=2, day=29)\n';writeFileSync(file,invalid);
 const failure=spawnSync(process.execPath,[compiler,'check',root,'--json'],{encoding:'utf8'});assert.equal(failure.status,1);assert.match(failure.stdout,/ConversionError/);
 writeFileSync(join(root,'operations.aug'),'import CivilDate from august.values\naccept(CivilDate value):\n    return value.year\n');
 writeFileSync(file,'import HttpUrl from august.values\nimport accept from operations\ntry { accept(value=HttpUrl(text="https://example.com")) } catch ConversionError failure { pass }\n');
 const nominal=spawnSync(process.execPath,[compiler,'check',root,'--json'],{encoding:'utf8'});assert.equal(nominal.status,1);assert.match(nominal.stdout,/CivilDate/);assert.match(nominal.stdout,/HttpUrl/);
}));

test('generated domain constructor signatures include their inferred checked errors',()=>{
 const docs=readFileSync(new URL('../docs/api/values.md',import.meta.url),'utf8');
 for(const name of ['CivilDate','TokenId','HttpUrl','PortableRelativePath','BoundedText'])assert.match(docs,new RegExp('record '+name+'\\([^`]*?\\) unless ConversionError'));
 assert.match(docs,/record Duration\(int milliseconds\)\n/);
});


test('generated class signatures preserve error shorthand and legal interface lists',()=>{
 const errors=readFileSync(new URL('../docs/api/errors.md',import.meta.url),'utf8');
 const signature=errors.match(/```text\n(error ContextError[^`]+)\n```/)?.[1];
 assert.ok(signature,'generic error remains an error declaration');
 assert.equal(signature.replace(/\s+/g,' '),'error ContextError<E implements Error>( string operation, E cause, Tuple<string,int,int> location )');
 const io=readFileSync(new URL('../docs/api/io.md',import.meta.url),'utf8');
 assert.match(io,/LocalFiles\(\) implements FileReader, FileWriter/);
});
