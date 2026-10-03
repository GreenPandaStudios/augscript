import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync,existsSync,cpSync,readdirSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {spawnSync,spawn} from 'node:child_process';
import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {connect} from 'node:net';
const root=resolve(import.meta.dirname),version='0.23.0';
const hash=value=>createHash('sha256').update(value).digest('hex');
const report={format:1,started:new Date().toISOString(),compiler:version,host:process.platform+'-'+process.arch,compilerTransport:'public-release',packageTransport:'public-repository-and-release',installation:'public-npm',sourceCache:'initially-empty',artifactCache:'initially-empty',checks:[],passed:false,runnerSha256:hash(readFileSync(import.meta.filename))};
const command=(name,args,options={})=>{const result=spawnSync(name,args,{cwd:root,encoding:'utf8',timeout:240000,maxBuffer:5000000,...options});assert.equal(result.status,0,result.stderr||result.error?.message||result.stdout);return result.stdout;};
const cli=join(root,'node_modules/@greenpandastudios/aug-cli/bin/aug.mjs');
const env={...process.env,PATH:'/nonexistent',SDKROOT:'/nonexistent',DEVELOPER_DIR:'/nonexistent',AUG_WORKERS:'2',AUG_PACKAGE_CACHE:join(root,'source-cache'),AUG_NATIVE_ARTIFACT_CACHE:join(root,'artifact-cache')};
for(const key of ['AUG_GIT','AUG_LLVM_HOME','AUG_RUNTIME_PACK','AUG_NATIVE_HOME','AUG_LLVM_NATIVE_HOME','AUG_GITHUB_TOKEN','GH_TOKEN','GITHUB_TOKEN'])delete env[key];
const aug=(...args)=>command(process.execPath,[cli,...args],{env});
function verified(name,details={}){report.checks.push({name,passed:true,...details});console.log(name+': passed');}
function relocated(project){const build=join(root,project,'.aug-build');const output=join(root,'relocated-'+project);mkdirSync(output,{recursive:true});cpSync(join(build,project),join(output,'program'));for(const dir of ['lib','share'])if(existsSync(join(build,dir)))cpSync(join(build,dir),join(output,dir),{recursive:true});return join(output,'program');}
const configuration=process.env.AUG_POSTGRES_TEST_CONFIGURATION;assert.ok(configuration,'Supply a disposable database configuration');
try{
 assert.equal(process.platform,'linux');assert.equal(process.arch,'arm64');
 for(const path of [env.AUG_PACKAGE_CACHE,env.AUG_NATIVE_ARTIFACT_CACHE,join(root,'node_modules')])assert.ok(!existsSync(path),'Cold installation must start empty: '+path);
 for(const tool of ['clang','gcc','git','llvm-config'])assert.notEqual(spawnSync('sh',['-c','command -v '+tool]).status,0,'No native tools may be installed');
 for(const path of ['/usr/include','/usr/local/include'])assert.ok(!existsSync(path));
 report.node=process.version;report.glibc=process.report.getReport().header.glibcVersionRuntime;
 writeFileSync(join(root,'package.json'),JSON.stringify({name:'aug-public-release-qualification',private:true})+'\n');
 command('npm',['install','--ignore-scripts','--no-audit','--no-fund','@greenpandastudios/aug-cli@'+version],{env:{...process.env,npm_config_cache:join(root,'npm-cache')}});
 assert.equal(aug('--version').trim(),version);
 report.packages=Object.fromEntries(['cli','stdlib'].map(name=>[name,JSON.parse(readFileSync(join(root,'node_modules/@greenpandastudios/aug-'+name+'/package.json'))).version]));
 for(const [name,installed] of Object.entries(report.packages))assert.equal(installed,version,name+' must use the reviewed release');
 const installedLock=JSON.parse(readFileSync(join(root,'package-lock.json')));
 report.npmIntegrity=Object.fromEntries(['cli','stdlib'].map(name=>{const entry=installedLock.packages['node_modules/@greenpandastudios/aug-'+name];assert.match(entry.integrity,/^sha512-/);assert.match(entry.resolved,/^https:\/\/registry\.npmjs\.org\//);return[name,entry.integrity];}));
 verified('public npm installation without development tools');
 const starter=join(root,'starter');aug('init',starter);assert.equal(aug('run',starter),'Hello, August!\n');assert.equal(JSON.parse(aug('test',starter,'--json')).passed,1);
 const map=JSON.parse(readFileSync(join(starter,'.aug-build/starter.augmap.json')));assert.equal(map.backend,'llvm');assert.equal(map.developmentToolchain,false);report.runtimeSourceSha256=map.runtime;report.compilerPack=JSON.parse(readFileSync(join(starter,'aug.lock.json'))).native.compilers['linux-arm64'];
 verified('public LLVM/runtime download and ordinary starter');
 const wanted='PostgreSQL native worker passed\nPostgreSQL worker cancellation passed\nPostgreSQL transaction recovery passed\nPostgreSQL deadline and reconnect passed\nPostgreSQL load and cleanup passed\n';
 const db=join(root,'tests');aug('install',db);aug('build',db);const started=performance.now();assert.equal(command(join(db,'.aug-build/tests'),[configuration],{env}),wanted);assert.ok(performance.now()-started<3000);
 const lockPath=join(db,'aug.lock.json'),lock=readFileSync(lockPath,'utf8');report.databaseLock=JSON.parse(lock);aug('build',db,'--offline','--frozen');assert.equal(command(join(db,'.aug-build/tests'),[configuration],{env}),wanted);assert.equal(readFileSync(lockPath,'utf8'),lock);
 assert.equal(command(relocated('tests'),[configuration],{env}),wanted);
 verified('public PostgreSQL imports, workers, bytea, SQLSTATE, transactions, bounds, cancellation, load, zero native resources, offline lock and relocation');
 const values=join(root,'values');mkdirSync(values);
 writeFileSync(join(values,'main.yaml'),'packages:\n  crypto: "https://github.com/GreenPandaStudios/augscript/src/stdlib/crypto#v0.23.0"\n  json: "https://github.com/GreenPandaStudios/augscript/src/stdlib/json#v0.23.0"\n');
 const {publicKey,privateKey}=generateKeyPairSync('ed25519');const pem=publicKey.export({type:'spki',format:'pem'});
 const payload=Buffer.from(JSON.stringify({iss:'gateway',aud:'ingestion',sub:'synthetic-account',iat:1000,exp:1060})).toString('base64url'),header=Buffer.from(JSON.stringify({alg:'EdDSA',typ:'JWT'})).toString('base64url'),data=header+'.'+payload,token=data+'.'+sign(null,Buffer.from(data),privateKey).toString('base64url');
 writeFileSync(join(values,'main.aug'),`import Crypto and GnuTlsCrypto and verifyIdentityToken from crypto
import parseCompatible and parse from json
implement Crypto with GnuTlsCrypto
resolve Crypto to crypto
try:
    claims = verifyIdentityToken(token=${JSON.stringify(token)}, publicKey=${JSON.stringify(pem)}, issuer="gateway", audience="ingestion", tokenType="JWT", now=1001, maximumAge=60)
    print(value=claims.require(name="sub").string())
    duplicate = parseCompatible(input="{\\\"a\\\":1,\\\"a\\\":2}")
    print(value=duplicate.require(name="a").integer())
    deep = parseCompatible(input=${JSON.stringify('{"extra":'+'['.repeat(70)+'0'+']'.repeat(70)+'}')})
    print(value=deep.has(name="extra"))
    large = parseCompatible(input="{\\\"extra\\\":9223372036854775808}")
    print(value=large.has(name="extra"))
    print(value="abc".bytes().slice(start=0, end=2).hex())
    print(value="👋".utf16Length())
    print(value="340282366920938463463374607431768211455".compareDecimal(other="340282366920938463463374607431768211456"))
    print(value=crypto.sha256(input="abc".bytes()).hex())
catch Error error:
    exit(status=1)
`);
 const expected='synthetic-account\n2\ntrue\ntrue\n6162\n2\n-1\n'+hash(Buffer.from('abc'))+'\n';assert.equal(aug('run',values),expected);assert.equal(aug('run',values,'--frozen','--offline'),expected);verified('public Ed25519, compatible JSON and protocol helpers');
 const headers=join(root,'headers');mkdirSync(headers);
 writeFileSync(join(headers,'main.yaml'),'packages:\n  web: "https://github.com/GreenPandaStudios/augscript/src/stdlib/web#v0.23.0"\nweb:\n  body_limit: 16\n  headers_timeout: 100\n  request_timeout: 250\n  drain_timeout: 100\n');
 writeFileSync(join(headers,'main.aug'),'import upload from routes\nserve upload on port 0\n');
 writeFileSync(join(headers,'routes.aug'),`endpoint POST "/upload" as upload(HttpRequest request from request) returns HttpResponse<int>:
    match request.headers.get(name="authorization"):
        when null:
            return HttpResponse(body=0, status=401)
        when some token:
            if token != "valid":
                return HttpResponse(body=0, status=401)
    return HttpResponse(body=request.body.length())
`);
 aug('install',headers);aug('build',headers);
 const headerServer=spawn(join(headers,'.aug-build/headers'),[],{env,stdio:['ignore','pipe','pipe']});let headerOutput='',headerErrors='';headerServer.stdout.on('data',chunk=>headerOutput+=chunk);headerServer.stderr.on('data',chunk=>headerErrors+=chunk);
 try{
  const deadline=performance.now()+5000;while(!/port (\d+)/.test(headerOutput)&&performance.now()<deadline){assert.equal(headerServer.exitCode,null,headerErrors);await delay(5);}assert.match(headerOutput,/port (\d+)/);const port=Number(/port (\d+)/.exec(headerOutput)[1]);
  async function probe(fields,body='',onContinue){const socket=connect(port,'127.0.0.1');let raw='',sent=false;socket.on('error',()=>{});socket.on('data',chunk=>{raw+=chunk.toString('latin1');if(onContinue!==undefined&&!sent&&raw.includes('100 Continue')){sent=true;socket.write(onContinue);}});await new Promise(resolve=>socket.once('connect',resolve));socket.write('POST /upload HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n'+fields+'\r\n'+body);const deadline=performance.now()+1200;while(!/HTTP\/1\.1 [2-5]\d\d[\s\S]*\r\n\r\n[\s\S]+/.test(raw)&&!socket.destroyed&&performance.now()<deadline)await delay(5);socket.destroy();return{raw,status:Number(/HTTP\/1\.1 ([2-5]\d\d)/.exec(raw)?.[1]??0),continued:raw.includes('100 Continue')};}
  for(const fields of ['Content-Length: 4\r\n','Content-Length: 4\r\nExpect: 100-continue\r\n','Content-Length: 1000000\r\n']){const r=await probe(fields);assert.equal(r.status,401,r.raw);assert.equal(r.continued,false);}
  const accepted=await probe('Authorization: valid\r\nContent-Length: 4\r\nExpect: 100-continue\r\n','', 'test');assert.equal(accepted.status,200,accepted.raw);assert.equal(accepted.continued,true);assert.match(accepted.raw,/\r\n\r\n4$/);
  const stalled=await probe('Authorization: valid\r\nContent-Length: 4\r\n','t');assert.equal(stalled.status,408,stalled.raw);
  const tooLarge=await probe('Authorization: valid\r\nContent-Length: 17\r\nExpect: 100-continue\r\n');assert.equal(tooLarge.status,413,tooLarge.raw);assert.equal(tooLarge.continued,false);
  verified('public native header authentication, Expect reception, body limit and absolute request timeout');
 }finally{if(headerServer.exitCode===null&&headerServer.signalCode===null){headerServer.kill('SIGTERM');await new Promise(resolve=>headerServer.once('exit',resolve));}assert.equal(headerServer.exitCode,0,headerErrors);}
 const http=join(root,'http-tests');aug('install',http);aug('build',http);
 const server=spawn(join(http,'.aug-build/http-tests'),[],{env,stdio:['ignore','pipe','pipe']});let output='',errors='';server.stdout.on('data',chunk=>output+=chunk);server.stderr.on('data',chunk=>errors+=chunk);
 try{
  const deadline=performance.now()+5000;while(!/port (\d+)/.test(output)&&performance.now()<deadline){assert.equal(server.exitCode,null,errors||output);await delay(5);}assert.match(output,/port (\d+)/);const port=Number(/port (\d+)/.exec(output)[1]);
  const pending=fetch('http://127.0.0.1:'+port+'/slow',{method:'POST',body:configuration,signal:AbortSignal.timeout(10000)}).then(async r=>r.text(),()=>{});
  let admitted=false;for(let i=0;i<100&&!admitted;i++){const r=await fetch('http://127.0.0.1:'+port+'/observe',{method:'POST',body:configuration,signal:AbortSignal.timeout(3000)});assert.equal(r.status,200);admitted=(await r.text())==='true';if(!admitted)await delay(5);}assert.ok(admitted,'The real database must confirm an active query before shutdown');
  const began=performance.now();const response=await fetch('http://127.0.0.1:'+port+'/stop',{method:'POST',signal:AbortSignal.timeout(3000)});assert.equal(response.status,200);await response.text();while(server.exitCode===null&&performance.now()-began<2000)await delay(5);assert.equal(server.exitCode,0,errors||output);assert.match(output,/database HTTP drained/);await pending;verified('public HTTP drain cancels and joins a database-confirmed active native worker');
 }finally{if(server.exitCode===null&&server.signalCode===null){server.kill('SIGKILL');await new Promise(resolve=>server.once('exit',resolve));}}
 report.sources=Object.fromEntries(['tests','http-tests','values','headers'].flatMap(folder=>readdirSync(join(root,folder)).filter(file=>file.endsWith('.aug')||file==='main.yaml').map(file=>[folder+'/'+file,hash(readFileSync(join(root,folder,file)))])));
 report.passed=true;
}finally{report.finished=new Date().toISOString();writeFileSync(join(root,'public-023-qualification.json'),JSON.stringify(report,null,2)+'\n');}
