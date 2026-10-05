import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,renameSync,readdirSync,existsSync,symlinkSync,chmodSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const cli=resolve('bin/aug.mjs');

test('a deployment bundle relocates its runtime closure and verifies bytes without the source project',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-bundle-'));
 try {
  const project=join(root,'app'),output=join(root,'deploy');mkdirSync(project);
  writeFileSync(join(project,'main.aug'),'import parse from json\nimport Crypto and GnuTlsCrypto from cryptography\nimplement Crypto with GnuTlsCrypto\nresolve Crypto to crypto\ntry { print(value=parse(input="{\\"value\\":7}").require(name="value").integer()) } catch JsonError error { print(value="unexpected JSON error") }\ntry { print(value=crypto.sha256(input="abc".bytes()).hex()) } catch CryptoError error { print(value="unexpected hash error") }\n');
  writeFileSync(join(project,'cryptography.aug'),readFileSync(resolve('src/stdlib/crypto/contracts.aug'),'utf8'));
  writeFileSync(join(project,'main.yaml'),'packages:\n  json: '+JSON.stringify(resolve('src/stdlib/json'))+'\n');
  const build=spawnSync(process.execPath,[cli,'bundle',project,'--out',output,'--offline','--json'],{encoding:'utf8'});
  assert.equal(build.status,0,build.stderr);const report=JSON.parse(build.stdout);
  assert.equal(report.directory,output);
  const manifest=JSON.parse(readFileSync(join(output,'bundle.json'),'utf8'));
  assert.equal(manifest.format,1);assert.equal(manifest.mode,'release');
  assert.ok(manifest.files.some(file=>file.path.startsWith('lib/')));assert.ok(manifest.files.some(file=>file.path.startsWith('share/august-native/')));
  assert.ok(!readFileSync(join(output,'bundle.json'),'utf8').includes(project));
  assert.ok(!readdirSync(output).some(file=>/\.ll$|\.o$|\.augmap\.json$/.test(file)));
  const before=readFileSync(join(output,'bundle.json'),'utf8');
  const collision=spawnSync(process.execPath,[cli,'bundle',project,'--out',output,'--offline'],{encoding:'utf8'});
  assert.equal(collision.status,1);assert.match(collision.stderr,/already exists/);assert.equal(readFileSync(join(output,'bundle.json'),'utf8'),before);
  const moved=join(root,'moved');renameSync(output,moved);rmSync(project,{recursive:true,force:true});
  const verify=()=>spawnSync(process.execPath,[cli,'bundle','verify',moved,'--json'],{encoding:'utf8'});
  const verified=verify();assert.equal(verified.status,0,verified.stderr);assert.equal(JSON.parse(verified.stdout).verified,true);
  const run=spawnSync(join(moved,manifest.executable),[],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);assert.equal(run.stdout,'7\nba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad\n');
  const notice=manifest.files.find(file=>file.path.startsWith('share/')).path;chmodSync(join(moved,notice),0o755);
  assert.match(verify().stderr,/Executable permission differs/);chmodSync(join(moved,notice),0o644);
  writeFileSync(join(moved,'unexpected'),'extra');assert.equal(verify().status,1);rmSync(join(moved,'unexpected'));
  symlinkSync(join(moved,manifest.executable),join(moved,'linked'));assert.equal(verify().status,1);rmSync(join(moved,'linked'));
  writeFileSync(join(moved,manifest.executable),'damaged');assert.equal(verify().status,1);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('bundle validation rejects extra files, links and traversal manifests without executing',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-bundle-rejected-'));
 try {
  writeFileSync(join(root,'bundle.json'),JSON.stringify({format:1,compiler:'0.23.0',target:'aarch64-apple-darwin',mode:'release',sourceRevision:'0'.repeat(64),runtime:'0'.repeat(64),developmentToolchain:false,nativeArtifacts:[],executable:'../outside',files:[{path:'../outside',sha256:'0'.repeat(64),bytes:1}]}));
  const run=spawnSync(process.execPath,[cli,'bundle','verify',root,'--json'],{encoding:'utf8'});
  assert.equal(run.status,1);assert.match(run.stderr,/BUNDLE_INTEGRITY: Unsafe bundle path/);
  assert.deepEqual(readdirSync(root),['bundle.json']);
 }finally{rmSync(root,{recursive:true,force:true});}
});


test('bundle verification bounds all directory entries and reports malformed manifests',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-bundle-bounds-'));
 try {
  writeFileSync(join(root,'bundle.json'),'{');
  const verify=()=>spawnSync(process.execPath,[cli,'bundle','verify',root],{encoding:'utf8'});
  assert.match(verify().stderr,/BUNDLE_INTEGRITY: bundle.json is not valid JSON/);
  for(let parent=0;parent<201;parent++) {
   const directory=join(root,String(parent));mkdirSync(directory);
   for(let child=0;child<100;child++)mkdirSync(join(directory,String(child)));
  }
  assert.match(verify().stderr,/BUNDLE_INTEGRITY: Bundle exceeds its file or byte limit/);
 }finally{rmSync(root,{recursive:true,force:true});}
});

test('failed compilation and embedded TLS configuration publish no deployment directory',()=>{
 const root=mkdtempSync(join(tmpdir(),'aug-bundle-failure-'));
 try {
  const project=join(root,'project'),output=join(root,'deploy');mkdirSync(project);
  const build=()=>spawnSync(process.execPath,[cli,'bundle',project,'--out',output,'--offline'],{encoding:'utf8'});
  writeFileSync(join(project,'main.aug'),'unknown()\n');assert.equal(build().status,1);assert.ok(!existsSync(output));
  writeFileSync(join(project,'main.aug'),'print(value="ready")\n');
  writeFileSync(join(project,'main.yaml'),'web:\n  tls:\n    certificate: certificate.pem\n    private_key: private.pem\n');
  writeFileSync(join(project,'certificate.pem'),'');writeFileSync(join(project,'private.pem'),'');
  const tls=build();assert.equal(tls.status,1);assert.match(tls.stderr,/BUNDLE_CONFIG: TLS paths are embedded/);
  assert.ok(!existsSync(output));assert.ok(!existsSync(output+'.lock'));assert.ok(!readdirSync(root).some(file=>file.startsWith('.aug-bundle-')));
 }finally{rmSync(root,{recursive:true,force:true});}
});
