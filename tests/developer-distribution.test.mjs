import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,readdirSync,rmSync,existsSync,copyFileSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const cli=resolve(import.meta.dirname,'../bin/aug.mjs');
test('doctor explains installed prerequisites without downloading or changing a project',()=>{
  const directory=mkdtempSync(join(tmpdir(),'aug-doctor-'));
  try{
    const project=join(directory,'app'),cache=join(directory,'uncached');mkdirSync(project);
    writeFileSync(join(project,'main.aug'),'print(value="Hello")\n');
    const env={...process.env,AUG_NATIVE_ARTIFACT_CACHE:cache};delete env.AUG_LLVM_HOME;delete env.AUG_RUNTIME_PACK;
    const result=spawnSync(process.execPath,[cli,'doctor',project,'--json'],{env,encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
    assert.equal(report.format,1);assert.equal(report.ready,true);
    assert.ok(report.checks.some(check=>check.id==='node'&&check.status==='ok'));
    assert.ok(report.checks.some(check=>check.id==='compiler-pack'&&check.status==='warning'&&/aug run/.test(check.recovery)));
    assert.deepEqual(readdirSync(project),['main.aug']);assert.equal(existsSync(cache),false);
    writeFileSync(join(project,'main.aug'),'print(value=missing)\n');
    const broken=spawnSync(process.execPath,[cli,'doctor',project,'--json'],{env,encoding:'utf8'});
    assert.equal(broken.status,1);const failed=JSON.parse(broken.stdout);
    assert.equal(failed.ready,false);assert.ok(failed.checks.some(check=>check.id==='project'&&check.status==='error'&&/aug check/.test(check.recovery)));
    assert.deepEqual(readdirSync(project),['main.aug']);assert.equal(existsSync(cache),false);
    writeFileSync(cache,'This is a file, not a cache directory.');
    const blocked=spawnSync(process.execPath,[cli,'doctor',project,'--json'],{env,encoding:'utf8'});
    assert.equal(blocked.status,1);assert.ok(JSON.parse(blocked.stdout).checks.some(check=>check.id==='cache-write'&&check.status==='error'&&/directory you own/.test(check.recovery)));
    assert.equal(readFileSync(cache,'utf8'),'This is a file, not a cache directory.');
  }finally{rmSync(directory,{recursive:true,force:true});}
});


test('a missing editor runtime fails promptly with actionable settings guidance',()=>{
  const server=resolve(import.meta.dirname,'../vscode/server.cjs');
  const script=`const {Server}=require(${JSON.stringify(server)});let client;try{client=new Server({command:'/august-test-missing-node',args:[]},()=>{},()=>{});await client.ready;process.exitCode=2;}catch(error){console.log(error.message);}finally{client?.dispose();}`;
  const result=spawnSync(process.execPath,['--input-type=commonjs','-e',`(async()=>{${script}})().catch(error=>{console.error(error);process.exitCode=1;});`],{encoding:'utf8',timeout:5000});
  assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/nodePath/);assert.doesNotMatch(result.stderr,/Unhandled 'error'/);
});


test('a missing configured compiler file names the setting that repairs it',()=>{
  const server=resolve(import.meta.dirname,'../vscode/server.cjs');
  const script=`const {Server}=require(${JSON.stringify(server)});let client;try{client=new Server({command:process.execPath,args:['/august-test-missing-compiler.mjs','lsp',process.cwd()]},()=>{},()=>{});await client.ready;process.exitCode=2;}catch(error){console.log(error.message);}finally{client?.dispose();}`;
  const result=spawnSync(process.execPath,['--input-type=commonjs','-e',`(async()=>{${script}})().catch(error=>{console.error(error);process.exitCode=1;});`],{encoding:'utf8',timeout:5000});
  assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/augscript.compilerPath/);assert.match(result.stdout,/missing-compiler/);
});


test('rejected distribution candidates retain identity and failure evidence before downloads',()=>{
  for(const kind of ['cli','editor']){
    const directory=mkdtempSync(join(tmpdir(),'aug-distribution-rejected-'));
    try{
      mkdirSync(join(directory,'scripts'));mkdirSync(join(directory,'dist/release'),{recursive:true});mkdirSync(join(directory,'vscode'));
      for(const file of ['distribution-baseline.mjs','distribution-inputs.json',kind==='cli'?'qualify-cli-upgrade.mjs':'qualify-editor.mjs'])copyFileSync(resolve(import.meta.dirname,'../scripts',file),join(directory,'scripts',file));
      const bytes=Buffer.from('Rejected candidate bytes'),actual=createHash('sha256').update(bytes).digest('hex');
      let script,expected;
      if(kind==='cli'){
        writeFileSync(join(directory,'dist/release/bad.tgz'),bytes);
        writeFileSync(join(directory,'dist/release/packages.json'),JSON.stringify([{directory:'cli',version:'0.23.0',filename:'bad.tgz',sha256:'0'.repeat(64)}]));
        script='qualify-cli-upgrade.mjs';expected=`cli-upgrade-qualification-${process.platform}-${process.arch}.json`;
      }else{
        symlinkSync(resolve(import.meta.dirname,'../node_modules'),join(directory,'node_modules'),'dir');
        writeFileSync(join(directory,'vscode/package.json'),JSON.stringify({version:'0.23.1',augustCompilerVersion:'0.23.0'}));
        writeFileSync(join(directory,'vscode/augscript-0.23.1.vsix'),bytes);
        const editor=JSON.parse(readFileSync(join(directory,'scripts/distribution-inputs.json'))).editors.at(-1);
        script='qualify-editor.mjs';expected=`editor-qualification-${process.platform}-${process.arch}-${editor}.json`;
      }
      const result=spawnSync(process.execPath,[join(directory,'scripts',script)],{encoding:'utf8',timeout:10000,env:{...process.env,AUG_VSCODE_EXECUTABLE:'/august-test-missing-editor'}});
      assert.equal(result.status,1,result.stderr);
      const report=JSON.parse(readFileSync(join(directory,'.aug-build',expected)));
      assert.equal(report.passed,false);assert.equal(report.candidateArtifactSha256??report.artifactSha256,actual);
      assert.ok(report.failedStage);assert.ok(report.failure);assert.deepEqual(report.checks,[]);
      assert.equal(existsSync(join(directory,'.aug-build/distribution-baseline')),false,'Rejected candidates must not download a baseline');
    }finally{rmSync(directory,{recursive:true,force:true});}
  }
});
