#!/usr/bin/env node
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,mkdtempSync,readFileSync,writeFileSync,readdirSync,rmSync,realpathSync,lstatSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {downloadAndUnzipVSCode,resolveCliArgsFromVSCodeExecutablePath,runTests} from '@vscode/test-electron';
import {baselineArtifact,distributionInputs} from './distribution-baseline.mjs';

const root=resolve(import.meta.dirname,'..'),args=process.argv.slice(2);
assert.ok(args.every((arg,index)=>arg==='--editor'||arg==='--retained-compiler'||args[index-1]==='--editor'),'Use --editor VERSION');
const editor=args.includes('--editor')?args[args.indexOf('--editor')+1]:distributionInputs.editors.at(-1);
assert.ok(distributionInputs.editors.includes(editor),'Choose a qualified editor version');
const retained=args.includes('--retained-compiler'),host=process.platform+'-'+process.arch;
mkdirSync(join(root,'.aug-build'),{recursive:true});
const output=join(root,`.aug-build/editor-qualification-${host}-${editor}${retained?'-retained':''}.json`);
const retainedLogs=join(root,`.aug-build/editor-host-logs-${host}-${editor}${retained?'-retained':''}`);
const report={format:1,host,editor,compilerMode:retained?'retained-release':'candidate',baseline:distributionInputs.baseline.extension,rendering:process.platform==='linux'?'software':'platform-default',passed:false,checks:[]};
let directory,stage='candidate manifest';
try{
  rmSync(retainedLogs,{recursive:true,force:true});
  const manifest=JSON.parse(readFileSync(join(root,'vscode/package.json'))),candidate=join(root,'vscode',`augscript-${manifest.version}.vsix`);
  report.compiler=manifest.augustCompilerVersion;report.extension=manifest.version;
  assert.ok(existsSync(candidate),'Package the extension before editor qualification');
  report.artifactSha256=createHash('sha256').update(readFileSync(candidate)).digest('hex');
  directory=mkdtempSync(join(process.platform==='darwin'?'/tmp':tmpdir(),'aug-editor-'));
  stage='official editor download';
  const executable=process.env.AUG_VSCODE_EXECUTABLE??await downloadAndUnzipVSCode({version:editor,cachePath:join(root,'.aug-build/vscode-test')});
  const [code,...cliArgs]=resolveCliArgsFromVSCodeExecutablePath(executable,{reuseMachineInstall:true});
  const version=spawnSync(code,[...cliArgs,'--version'],{encoding:'utf8'});
  assert.equal(version.status,0,version.stderr);assert.equal(version.stdout.trim().split(/\r?\n/)[0],editor,'The editor executable differs from the qualified version');
  stage='published baseline verification';
  const harness=join(root,'tests/editor-host'),baseline=await baselineArtifact('extension',root);
  for(const mode of ['clean','upgrade']){
    stage=mode+' VSIX installation';
    const profile=join(directory,mode),extensions=join(profile,'extensions'),user=join(profile,'user'),project=join(profile,'app');
    mkdirSync(join(user,'User'),{recursive:true});
    writeFileSync(join(user,'User/settings.json'),JSON.stringify({'augscript.nodePath':process.execPath,'extensions.autoUpdate':false,'update.mode':'none','telemetry.telemetryLevel':'off'}));
    const common=['--user-data-dir',user,'--extensions-dir',extensions],env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const run=more=>{
      const result=spawnSync(code,[...cliArgs,...common,...more],{encoding:'utf8',timeout:120000,env});
      assert.equal(result.status,0,result.stderr+'\n'+result.stdout);return result.stdout;
    };
    if(mode==='upgrade'){
      run(['--install-extension',baseline,'--force']);
      assert.match(run(['--list-extensions','--show-versions']),new RegExp('augscript\\.augscript@'+distributionInputs.baseline.extension.replaceAll('.','\\.')));
    }
    run(['--install-extension',candidate,'--force']);
    assert.ok(run(['--list-extensions','--show-versions']).includes('augscript.augscript@'+manifest.version));
    const installed=readdirSync(extensions).filter(name=>name.startsWith('augscript.augscript-')&&existsSync(join(extensions,name,'package.json')))
      .find(name=>JSON.parse(readFileSync(join(extensions,name,'package.json'))).version===manifest.version);
    assert.ok(installed,'The candidate VSIX is not installed');
    const installedRoot=join(extensions,installed),compiler=join(installedRoot,'compiler/bin/aug.mjs');
    const initialized=spawnSync(process.execPath,[compiler,'init',project],{encoding:'utf8',timeout:30000});assert.equal(initialized.status,0,initialized.stderr);
    stage=mode+' installed extension host';
    const evidenceFile=join(profile,'report.json'),cache=join(profile,'artifacts');
    await runTests({vscodeExecutablePath:executable,extensionDevelopmentPath:harness,extensionTestsPath:join(harness,'suite.cjs'),reuseMachineInstall:true,
      launchArgs:[project,...common,...(process.platform==='linux'?['--disable-gpu']:[]),'--skip-welcome','--skip-release-notes','--disable-workspace-trust'],
      extensionTestsEnv:{AUG_EDITOR_PROJECT:project,AUG_EDITOR_REPORT:evidenceFile,AUG_EDITOR_EXPECTED_VERSION:manifest.version,AUG_EDITOR_EXPECTED_COMPILER:manifest.augustCompilerVersion,
        AUG_EDITOR_RETAINED_COMPILER:retained?'1':undefined,AUG_NATIVE_ARTIFACT_CACHE:cache,AUG_LLVM_HOME:undefined,AUG_RUNTIME_PACK:undefined,ELECTRON_RUN_AS_NODE:undefined}});
    const evidence=JSON.parse(readFileSync(evidenceFile));
    assert.equal(evidence.passed,true);assert.equal(realpathSync(evidence.extensionPath),realpathSync(installedRoot));report.checks.push({mode,...evidence});
  }
  report.passed=true;
}catch(error){report.failedStage=stage;report.failure=error.message;process.exitCode=1;console.error(error.stack??error);}
finally{
  writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  if(directory&&report.passed)rmSync(directory,{recursive:true,force:true});
  else if(directory){
    // Retain bounded text logs from these disposable profiles, not their caches or credentials.
    let bytes=0,files=0;
    const copyLogs=(source,target,depth=0)=>{
      if(depth>12||!existsSync(source))return;
      for(const entry of readdirSync(source,{withFileTypes:true})){
        const from=join(source,entry.name),to=join(target,entry.name);
        if(entry.isDirectory())copyLogs(from,to,depth+1);
        else if(entry.isFile()&&entry.name.endsWith('.log')){
          const size=lstatSync(from).size;
          if(size>2*1024*1024||bytes+size>16*1024*1024||files>=256)continue;
          mkdirSync(target,{recursive:true});copyFileSync(from,to);bytes+=size;files++;
        }
      }
    };
    try{for(const mode of ['clean','upgrade'])copyLogs(join(directory,mode,'user/logs'),join(retainedLogs,mode));}
    catch(error){console.error('Could not retain editor logs: '+error.message);}
    console.error('Failed editor profile retained: '+directory);
  }
}
console.log((report.passed?'Installed VSIX clean-profile and upgrade qualification passed: ':'Editor qualification failed: ')+output);
