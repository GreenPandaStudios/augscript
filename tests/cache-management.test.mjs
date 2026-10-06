import {compilerVersion} from '../src/compiler-version.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,readdirSync,existsSync,rmSync,symlinkSync,chmodSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const cli=resolve('bin/aug.mjs');
function fixture(action){const root=mkdtempSync(join(tmpdir(),'aug-cache-tools-')),project=join(root,'project');mkdirSync(project);writeFileSync(join(project,'main.aug'),'print(value="cache")\n');const env={...process.env,AUG_PACKAGE_CACHE:join(root,'sources'),AUG_NATIVE_ARTIFACT_CACHE:join(root,'native'),AUG_COMPILATION_CACHE:join(root,'compilation')};try{return action({root,project,env});}finally{rmSync(root,{recursive:true,force:true});}}
function invoke(f,...args){return spawnSync(process.execPath,[cli,'cache',...args,f.project,'--json'],{encoding:'utf8',timeout:90000,env:f.env});}

test('cache inspection reports separate caches and offline readiness without creating absent directories',()=>fixture(f=>{
 const before=readdirSync(f.root);const result=invoke(f);assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
 assert.equal(report.format,1);assert.equal(report.execution,'not-run');assert.equal(report.offlineReady,false);assert.equal(report.frozenReady,false);
 assert.deepEqual(report.caches.map(cache=>[cache.kind,cache.exists,cache.bytes]),[['sources',false,0],['native',false,0],['compilation',false,0],['installed',false,0]]);
 assert.deepEqual(readdirSync(f.root),before);assert.ok(report.checks.some(check=>check.id==='compiler-pack'));
}));

test('pruning previews verified compiler outputs, protects active entries, and preserves source and native caches',()=>fixture(f=>{
 writeFileSync(join(f.project,'case.aug'),'check() { pass }\ntest check { when cache { it value { assert(condition=true) } } }\n');
 const compiled=spawnSync(process.execPath,[cli,'test',f.project,'--backend','llvm','--json'],{encoding:'utf8',timeout:90000,env:f.env});assert.equal(compiled.status,0,compiled.stderr+compiled.stdout);
 const key=JSON.parse(compiled.stdout).tests[0].compilation.key;assert.ok(key);const entry=join(f.env.AUG_COMPILATION_CACHE,key);
 for(const path of [join(f.env.AUG_PACKAGE_CACHE,'transport'),join(f.env.AUG_NATIVE_ARTIFACT_CACHE,'artifact')]){mkdirSync(path,{recursive:true});writeFileSync(join(path,'keep'),'retained');}
 const preview=invoke(f,'prune');assert.equal(preview.status,0,preview.stderr);assert.equal(JSON.parse(preview.stdout).action,'preview');assert.equal(JSON.parse(preview.stdout).entries[0].status,'would-remove');assert.equal(existsSync(entry),true);
 writeFileSync(join(entry,'unexpected.txt'),'retain');const extra=invoke(f,'prune','--write');assert.equal(extra.status,0,extra.stderr);assert.equal(JSON.parse(extra.stdout).entries[0].status,'retained');assert.equal(readFileSync(join(entry,'unexpected.txt'),'utf8'),'retain');rmSync(join(entry,'unexpected.txt'));
 const binary=join(entry,'files/test-0'),original=readFileSync(binary);writeFileSync(binary,'changed');const damaged=invoke(f,'prune','--write');assert.equal(damaged.status,0,damaged.stderr);assert.equal(JSON.parse(damaged.stdout).entries[0].status,'retained');assert.equal(readFileSync(binary,'utf8'),'changed');writeFileSync(binary,original);
 const lock=entry+'.lock';mkdirSync(lock);writeFileSync(join(lock,'pid'),String(process.pid));
 const busy=invoke(f,'prune','--write');assert.equal(busy.status,0,busy.stderr);assert.equal(JSON.parse(busy.stdout).entries[0].status,'retained');assert.match(JSON.parse(busy.stdout).entries[0].reason,/active/);assert.equal(existsSync(entry),true);rmSync(lock,{recursive:true});
 const unknown=join(f.env.AUG_COMPILATION_CACHE,'unknown');mkdirSync(unknown);writeFileSync(join(unknown,'keep'),'retained');
 const written=invoke(f,'prune','--write');assert.equal(written.status,0,written.stderr);const report=JSON.parse(written.stdout);assert.equal(report.action,'written');assert.ok(report.entries.some(entry=>entry.identity===key&&entry.status==='removed'));assert.equal(existsSync(entry),false);
 assert.equal(readFileSync(join(unknown,'keep'),'utf8'),'retained');assert.equal(readFileSync(join(f.env.AUG_PACKAGE_CACHE,'transport/keep'),'utf8'),'retained');assert.equal(readFileSync(join(f.env.AUG_NATIVE_ARTIFACT_CACHE,'artifact/keep'),'utf8'),'retained');
 const rerun=spawnSync(process.execPath,[cli,'test',f.project,'--backend','llvm','--json'],{encoding:'utf8',timeout:90000,env:f.env});assert.equal(rerun.status,0,rerun.stderr);assert.equal(JSON.parse(rerun.stdout).tests[0].compilation.cache,'miss');assert.equal(JSON.parse(rerun.stdout).passed,1);
}));


test('cache tools do not follow links, prune unknown members, or accept shared/project-local compiler caches',()=>fixture(f=>{
 const target=join(f.root,'outside');mkdirSync(target);writeFileSync(join(target,'secret'),'keep');
 mkdirSync(f.env.AUG_PACKAGE_CACHE);symlinkSync(target,join(f.env.AUG_PACKAGE_CACHE,'linked'));
 const inspected=invoke(f);assert.equal(inspected.status,0,inspected.stderr);const report=JSON.parse(inspected.stdout),source=report.caches.find(cache=>cache.kind==='sources');
 assert.equal(source.bytes,0);assert.equal(source.complete,false);assert.match(source.issues[0],/not followed/);
 symlinkSync(target,f.env.AUG_COMPILATION_CACHE);const linked=invoke(f,'prune','--write');assert.equal(linked.status,1);assert.match(linked.stderr,/private|links/);assert.equal(readFileSync(join(target,'secret'),'utf8'),'keep');rmSync(f.env.AUG_COMPILATION_CACHE);
 mkdirSync(f.env.AUG_COMPILATION_CACHE,{mode:0o777});chmodSync(f.env.AUG_COMPILATION_CACHE,0o777);assert.equal(invoke(f,'prune','--write').status,1);chmodSync(f.env.AUG_COMPILATION_CACHE,0o700);
 const inside=join(f.project,'cache');mkdirSync(inside,{mode:0o700});const local=invoke({...f,env:{...f.env,AUG_COMPILATION_CACHE:inside}},'prune','--write');assert.equal(local.status,1);assert.match(local.stderr,/outside|project/);
 const key='a'.repeat(64),entry=join(f.env.AUG_COMPILATION_CACHE,key);mkdirSync(entry);writeFileSync(join(entry,'manifest.json'),'not a compiler manifest');writeFileSync(join(entry,'important'),'retain');
 const unknown=invoke(f,'prune','--write');assert.equal(unknown.status,0,unknown.stderr);assert.equal(JSON.parse(unknown.stdout).entries[0].status,'retained');assert.equal(readFileSync(join(entry,'important'),'utf8'),'retain');
}));

test('cache commands reject ambiguous and unsupported options before writing',()=>fixture(f=>{
 for(const options of [['--write'],['--json','--json'],['prune','--write','--write'],['prune','--offline'],['prune','--json','--json']]){const before=readdirSync(f.root),run=invoke(f,...options);assert.equal(run.status,2,run.stderr);assert.match(run.stderr,/Use aug cache/);assert.deepEqual(readdirSync(f.root),before);}
}));

test('cache inventory keeps exact accepted source identities and lock bytes during inspection and pruning',()=>fixture(f=>{
 const library=join(f.root,'library');mkdirSync(library);writeFileSync(join(library,'aug-package.json'),JSON.stringify({format:1,name:'@example/cache-library',version:'1.0.0',compiler:compilerVersion(),source:'.'}));writeFileSync(join(library,'export.aug'),'export answer from api\n');writeFileSync(join(library,'api.aug'),'answer() { return 42 }\n');
 writeFileSync(join(f.project,'main.yaml'),'packages:\n  answers: "../library"\n');writeFileSync(join(f.project,'main.aug'),'import answer from answers\nprint(value=answer())\n');
 const installed=spawnSync(process.execPath,[cli,'install',f.project,'--offline'],{encoding:'utf8',env:f.env});assert.equal(installed.status,0,installed.stderr);
 const path=join(f.project,'aug.lock.json'),before=readFileSync(path,'utf8'),lock=JSON.parse(before),result=invoke(f);assert.equal(result.status,0,result.stderr);const report=JSON.parse(result.stdout);
 assert.deepEqual(report.selections.sources,[{identity:'@example/cache-library@1.0.0',package:'@example/cache-library',digest:lock.packages[0].digest,path:lock.packages[0].path}]);assert.equal(report.caches.find(cache=>cache.kind==='installed').entries[0].selected,true);assert.equal(report.selections.compiler.identity.length,64);assert.equal(readFileSync(path,'utf8'),before);
 assert.equal(invoke(f,'prune','--write').status,0);assert.equal(readFileSync(path,'utf8'),before);assert.equal(readFileSync(join(f.project,'.aug-packages',lock.packages[0].path,'api.aug'),'utf8'),'answer() { return 42 }\n');
}));

test('an invalid accepted lock still returns cache sizes and failed readiness with unavailable selections',()=>fixture(f=>{
 mkdirSync(f.env.AUG_PACKAGE_CACHE);writeFileSync(join(f.env.AUG_PACKAGE_CACHE,'cached'),'three');writeFileSync(join(f.project,'aug.lock.json'),JSON.stringify({format:2}));
 const result=invoke(f);assert.equal(result.status,1);const report=JSON.parse(result.stdout);assert.equal(report.ready,false);assert.equal(report.offlineReady,false);assert.equal(report.selections.status,'unavailable');assert.equal(report.caches[0].bytes,5);assert.match(report.selections.omissions[0],/PACKAGE_LOCK/);assert.ok(report.checks.some(check=>check.id==='dependencies'&&check.status==='error'));
}));

test('real locked repository transports are marked selected without fetching or changing the cache',()=>fixture(f=>{
 const git=process.env.AUG_GIT??'git',library=join(f.root,'repository');mkdirSync(library);
 for(const [name,value] of [['aug-package.json',JSON.stringify({format:1,name:'@example/cache-git',version:'1.0.0',compiler:compilerVersion(),source:'.'})],['export.aug','export answer from api\n'],['api.aug','answer() { return 42 }\n']])writeFileSync(join(library,name),value);
 for(const args of [['init'],['add','.'],['-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-m','Library'],['tag','v1.0.0']]){const result=spawnSync(git,['-c','core.hooksPath=/dev/null',...args],{cwd:library,encoding:'utf8'});assert.equal(result.status,0,result.stderr);}
 const request='git+file://'+library+'#v1.0.0';writeFileSync(join(f.project,'main.yaml'),'packages:\n  answers: '+JSON.stringify(request)+'\n');writeFileSync(join(f.project,'main.aug'),'import answer from answers\nprint(value=answer())\n');f.env.AUG_GIT=git;
 const installed=spawnSync(process.execPath,[cli,'install',f.project],{encoding:'utf8',env:f.env});assert.equal(installed.status,0,installed.stderr);const lock=JSON.parse(readFileSync(join(f.project,'aug.lock.json'))),before=readdirSync(f.env.AUG_PACKAGE_CACHE);
 const inspected=invoke(f);assert.equal(inspected.status,0,inspected.stderr);const report=JSON.parse(inspected.stdout),entries=report.caches.find(cache=>cache.kind==='sources').entries;assert.equal(entries.filter(entry=>entry.selected).length,1);assert.match(entries.find(entry=>entry.selected).identity,/^url_/);assert.deepEqual(report.selections.repositories,[{request,commit:lock.git[0].commit}]);assert.deepEqual(readdirSync(f.env.AUG_PACKAGE_CACHE),before);
}));
