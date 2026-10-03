import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {prepareLibraryFixtures} from './library-fixtures.mjs';

function run(main, operations='') {
  const root=mkdtempSync(join(tmpdir(),'aug-ingestion-values-'));
  try {
    const lines=main.trimEnd().split('\n'),header=lines.filter(line=>/^(import |implement )/.test(line)),body=lines.filter(line=>!/^(import |implement )/.test(line));
    main=header.join('\n')+'\ntry:\n'+body.map(line=>'    '+line).join('\n')+'\ncatch Error error:\n    print(value=\"unhandled-test-error\")\n';
    writeFileSync(join(root,'main.aug'),main);if(operations)writeFileSync(join(root,'checks.aug'),operations);
    prepareLibraryFixtures(root);
    const result=spawnSync(process.execPath,[resolve('bin/aug.mjs'),'run',root,'--backend',process.env.AUG_TEST_BACKEND??'llvm'],{encoding:'utf8',timeout:60000});
    assert.equal(result.status,0,result.stderr);return result.stdout.replace(/\n$/, '').split('\n');
  } finally {rmSync(root,{recursive:true,force:true});}
}
const quoted=JSON.stringify;
test('protocol helpers match independent byte, bigint, UTF16, and float32 oracles',()=>{
  const bytes=Buffer.from(Array.from({length:256},(_,n)=>n));
  let source='import Crypto and GnuTlsCrypto from crypto\nimplement Crypto with GnuTlsCrypto\nresolve Crypto to crypto\ndata = crypto.decodeBase64url(input='+quoted(bytes.toString('base64url'))+')\n';
  const expected=[];
  for(const [start,end] of [[0,0],[0,256],[16,32],[255,256],[256,256]]){source+=`print(value=data.slice(start=${start}, end=${end}).hex())\n`;expected.push(bytes.subarray(start,end).toString('hex'));}
  source+='print(value=crypto.sha256(input=data).hex())\n';expected.push(createHash('sha256').update(bytes).digest('hex'));
  for(const text of ['abc','👋','e\u0301','a👋b','\u0000','\ufeff \u2003👋\u3000']){source+=`text = crypto.decodeBase64url(input=${quoted(Buffer.from(text).toString('base64url'))}).text()\nprint(value=text.utf16Length())\nprint(value=text.trim().utf16Length())\n`;expected.push(String(text.length),String(text.trim().length));}
  for(const [left,right] of [['0','0000'],['340282366920938463463374607431768211455','340282366920938463463374607431768211456'],['9'.repeat(200),'1'+'0'.repeat(200)],['00042','41']]){
    source+=`print(value=${quoted(left)}.compareDecimal(other=${quoted(right)}))\n`;expected.push(String(BigInt(left)<BigInt(right)?-1:BigInt(left)>BigInt(right)?1:0));
  }
  source+='number = 0.1\nprint(value=number.float32() == 0.10000000149011612)\nprint(value=number.isFinite())\n';expected.push('true','true');
  source+='import rejectionChecks from checks\nrejectionChecks()\n';
  const checks=`rejectionChecks():
    for endpoints in [(-1,0), (2,1), (0,4)]:
        rejected = false
        try:
            bytes = "abc".bytes().slice(start=endpoints.get(index=0), end=endpoints.get(index=1))
        catch IndexError error:
            rejected = true
        if not rejected:
            throw FileError()
    rejected = false
    try:
        order = "12x".compareDecimal(other="4")
    catch ConversionError error:
        rejected = true
    if not rejected:
        throw FileError()
    large = 10000000000000000000000000000000000000000000000000000000000000000.0
    rejected = false
    try:
        value = large.float32()
    catch ConversionError error:
        rejected = true
    if not rejected:
        throw FileError()
`;
  assert.deepEqual(run(source,checks),expected);
});

test('compatibility JSON preserves strict parsing and wire field presence',()=>{
  const samples=['{"a":1,"a":2}','{"a":9223372036854775808}','{"extra":'+'['.repeat(70)+'0'+']'.repeat(70)+'}', '{"a":null}', '{}'];
  let source='import parse and parseCompatible from json\n';
  for(const input of samples)source+=`value = parseCompatible(input=${quoted(input)})\nprint(value=value.has(name="a"))\n`;
  source+=`value = parseCompatible(input="{\\\"a\\\":1,\\\"a\\\":2}")\nprint(value=value.require(name="a").integer())\nimport strictChecks from checks\nstrictChecks()\n`;
  const checks=`import parse and parseCompatible from json
strictChecks():
    for input in ["{\\\"a\\\":1,\\\"a\\\":2}", "{\\\"a\\\":9223372036854775808}"]:
        rejected = false
        try:
            data = parse(input)
        catch JsonError error:
            rejected = true
        if not rejected:
            throw FileError()
    rejected = false
    try:
        data = parseCompatible(input="{bad")
    catch JsonError error:
        rejected = true
    if not rejected:
        throw FileError()
`;
  assert.deepEqual(run(source,checks),['true','true','false','true','false','2']);
});

test('native Ed25519 JWT validation rejects wrong trust, signatures, times, and subject claims',()=>{
  const {publicKey,privateKey}=generateKeyPairSync('ed25519');
  const pem=publicKey.export({type:'spki',format:'pem'});
  function token(claims,header={alg:'EdDSA',typ:'JWT'}){const data=Buffer.from(JSON.stringify(header)).toString('base64url')+'.'+Buffer.from(JSON.stringify(claims)).toString('base64url');return data+'.'+sign(null,Buffer.from(data),privateKey).toString('base64url');}
  const base={iss:'gateway',aud:'ingestion',sub:'synthetic-account',iat:1000,exp:1060};
  const samples=[
    [token(base),true], [token({...base,aud:['other','ingestion']}),true],
    [token({...base,iss:'other'}),false],[token({...base,aud:'other'}),false],
    [token({...base,sub:'\u2003\ufeff'}),false],[token({...base,sub:'👋'.repeat(257)}),false],
    [token({...base,exp:1001}),false],[token({...base,iat:1002}),false],
    [token({...base,exp:1061}),false],[token({...base,iat:940,exp:1005}),false],
    [token({...base,exp:1e50}),false],[token({...base,iat:1.5}),false],
    [token(base,{alg:'RS256',typ:'JWT'}),false],[token(base,{alg:'EdDSA',typ:'other'}),false],
    [token(base,{alg:'EdDSA',typ:'JWT',crit:['unrecognized']}),false],
    ['a.b.c',false],['',false],
  ];
  const valid=token(base);samples.push([valid.slice(0,valid.lastIndexOf('.')+1)+Buffer.alloc(64).toString('base64url'),false]);
  let source='import verifyIdentityToken and Crypto and GnuTlsCrypto from crypto\nimport verified from checks\nimplement Crypto with GnuTlsCrypto\n';
  for(const [value,expected] of samples)source+=`print(value=verified(token=${quoted(value)}, publicKey=${quoted(pem)}) == ${expected})\n`;
  const checks=`import verifyIdentityToken and JwtError and Crypto and Ed25519IdentityVerifier from crypto
verified(string token, string publicKey, resolve Crypto crypto) returns bool:
    try:
        verifier = Ed25519IdentityVerifier(publicKey, issuer="gateway", audience="ingestion", tokenType="JWT", maximumAge=60)
        claims = verifier.verify(token, now=1001)
        return true
    catch JwtError error:
        return false
`;
  assert.deepEqual(run(source,checks),samples.map(()=> 'true'));
});
