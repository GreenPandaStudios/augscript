import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {request as httpsRequest} from 'node:https';
import {connect} from 'node:http2';
const cli = resolve('bin/aug.mjs');
test('configured TLS verifies peers and serves HTTP/1.1, HTTP/2 and HTTP/3 through the same typed pipeline', {timeout:30000}, async () => {
  const root = mkdtempSync(join(tmpdir(),'aug-tls-')); let server;
  try {
    const cert = join(root,'cert.pem'), key = join(root,'key.pem');
    const generated = spawnSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',key,'-out',cert,'-days','1','-subj','/CN=localhost','-addext','subjectAltName=IP:127.0.0.1,DNS:localhost'],{encoding:'utf8'});
    assert.equal(generated.status,0,generated.stderr);
    writeFileSync(join(root,'main.yaml'),'web:\n  host: 127.0.0.1\n  http3: true\n  tls:\n    certificate: cert.pem\n    private_key: key.pem\n    ca: cert.pem\n');
    writeFileSync(join(root,'main.aug'),'import answer and relay from endpoints\nimport HttpClient and WebHttpClient from august.web\nimplement HttpClient with WebHttpClient\nserve answer and relay on port 0\n');
    writeFileSync(join(root,'endpoints.aug'),`import HttpClient from august.web
record Answer(string message)
endpoint GET "/answer" as answer() returns Answer:
    return Answer(message="TLS verified")
endpoint GET "/relay" as relay(HttpRequest request from request, resolve HttpClient client) returns HttpResponse<Bytes> uses client.request unless HttpError with status 502:
    match request.headers.get(name="host"):
        when null:
            throw HttpError()
        when some host:
            return client.request(method="GET", url="https://" + host + "/answer")
`);
    const built=spawnSync(process.execPath,[cli,'build',root],{encoding:'utf8'}); assert.equal(built.status,0,built.stderr);
    server=spawn(join(root,'.aug-build',root.split('/').at(-1)),[],{stdio:['ignore','pipe','pipe']});
    let errors='';server.stderr.on('data',chunk=>{errors=(errors+chunk).slice(-100000)});
    const lines=createInterface({input:server.stdout});
    const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(errors)),10000);server.once('exit',code=>{clearTimeout(timer);reject(Error('Server exited '+code+': '+errors))});lines.on('line',line=>{const match=/port (\d+)/.exec(line);if(match){clearTimeout(timer);resolve(Number(match[1]))}})});
    const ca=readFileSync(cert), base=`https://127.0.0.1:${port}`;
    const request=(path,options={})=>new Promise((resolve,reject)=>{const req=httpsRequest(base+path,options,response=>{let body='';response.setEncoding('utf8');response.on('data',chunk=>body+=chunk);response.on('end',()=>resolve({status:response.statusCode,body,headers:response.headers}));});req.on('error',reject);req.end();});
    await assert.rejects(request('/answer'),/self.signed|certificate/i);
    let result=await request('/answer',{ca}); assert.equal(result.status,200);assert.deepEqual(JSON.parse(result.body),{message:'TLS verified'});
    result=await request('/relay',{ca});assert.equal(result.status,200,result.body+errors);assert.deepEqual(JSON.parse(result.body),{message:'TLS verified'});
    const session=connect(base,{ca});session.on('error',()=>{});
    try {
      result=await new Promise((resolve,reject)=>{const req=session.request({':path':'/answer'});let body='',status;req.on('response',headers=>status=headers[':status']);req.setEncoding('utf8');req.on('data',chunk=>body+=chunk);req.on('end',()=>resolve({body,status}));req.on('error',reject);req.end();});
      assert.equal(session.socket.alpnProtocol,'h2');assert.equal(result.status,200);assert.deepEqual(JSON.parse(result.body),{message:'TLS verified'});
    } finally {session.destroy();}
    const prefix=resolve('.aug-native/prefix'), probe=join(root,'http3-probe');
    const args=['-std=c11','-I'+join(prefix,'include'),resolve('tests/native/http3-client.c'),join(prefix,'lib/libwebsockets.a'),'-L'+join(prefix,'lib'),'-Wl,-rpath,'+join(prefix,'lib'),'-lgnutls','-lnettle','-lhogweed','-lgmp','-lz','-pthread','-o',probe];
    if(process.platform==='darwin')args.unshift('-isysroot','/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk','-D_DARWIN_C_SOURCE','-framework','CoreFoundation','-framework','SystemConfiguration');
    if(process.platform==='linux')args.unshift('-D_GNU_SOURCE');
    const compiled=spawnSync('cc',args,{encoding:'utf8'});assert.equal(compiled.status,0,compiled.stderr);
    const result3=await new Promise((resolve,reject)=>{const child=spawn(probe,[String(port),cert]);let stdout='',stderr='';const timer=setTimeout(()=>{child.kill('SIGKILL');reject(Error('HTTP/3 probe timed out: '+stderr+errors));},10000);child.stdout.on('data',chunk=>stdout+=chunk);child.stderr.on('data',chunk=>stderr+=chunk);child.on('error',reject);child.on('exit',status=>{clearTimeout(timer);resolve({status,stdout,stderr});});});
    assert.equal(result3.status,0,result3.stderr+result3.stdout+errors+' Server signal: '+server.signalCode);assert.deepEqual(JSON.parse(result3.stdout),{message:'TLS verified'});
  } finally {
    if(server&&server.exitCode===null&&server.signalCode===null){server.kill('SIGTERM');await new Promise(resolve=>{const timer=setTimeout(()=>server.kill('SIGKILL'),2000);server.once('exit',()=>{clearTimeout(timer);resolve();});});}
    rmSync(root,{recursive:true,force:true});
  }
});
