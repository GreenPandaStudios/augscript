#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import {pathToFileURL} from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const artifacts = join(root, 'dist/release');
const packages = JSON.parse(readFileSync(join(artifacts, 'packages.json'), 'utf8'));
const directory = mkdtempSync(join(tmpdir(), 'aug-installed-'));
const npmCache = join(directory, 'npm-cache');
const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, { cwd: directory, encoding: 'utf8', ...options,
    env: { ...(options.env ?? process.env), ...(command === 'npm' ? { npm_config_cache: npmCache } : {}) } });
  assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${result.stderr}\n${result.stdout}`);
  return result.stdout;
};
try {
  for (const pkg of packages) assert.equal(createHash('sha256').update(readFileSync(join(artifacts, pkg.filename))).digest('hex'), pkg.sha256);
  // A first install must fetch production dependencies from an empty npm cache.
  // The later global install proves those same archives work offline afterward.
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', ...packages.map(pkg => join(artifacts, pkg.filename))]);
  const cliRoot = join(directory, 'node_modules/@greenpandastudios/aug-cli');
  const cli = join(cliRoot, 'bin/aug.mjs');
  // Reference-backend bootstrap tests remain independent of release pack
  // publication. Cold/default LLVM is checked by qualify-native-consumers.mjs.
  const aug = (...args) => {
    if(['run','build','test','bench'].includes(args[0])&&!args.includes('--suggest-inputs')){
      const separator=args.indexOf('--'),at=separator<0?args.length:separator;
      args=[...args.slice(0,at),'--backend','c',...args.slice(at)];
    }
    return run(process.execPath,[cli,...args],{
      env:{...process.env,AUG_NATIVE_HOME:process.env.AUG_NATIVE_HOME??join(root,'.aug-native')}
    });
  };
  assert.match(readFileSync(join(cliRoot,'native/aug-native-abi-1.h'),'utf8'),/aug_native_error_v1/);
  assert.equal(aug('--version').trim(), packages.find(pkg => pkg.directory === 'cli').version);
  const choices=join(directory,'match-values');mkdirSync(choices);
  writeFileSync(join(choices,'main.aug'),'import greet from values\nprint(value=greet(name="Ada"))\n');
  writeFileSync(join(choices,'values.aug'),'greet(optional string name):\n    return match name:\n        when null:\n            "Guest"\n        when some person:\n            $"Hello, {person}!"\n');
  assert.equal(aug('run',choices),'Hello, Ada!\n');
  const {loadProject}=await import(pathToFileURL(join(cliRoot,'src/project.js')));
  const {checkProject}=await import(pathToFileURL(join(cliRoot,'src/checker.js')));
  const {contractFacts,describe}=await import(pathToFileURL(join(cliRoot,'src/semantic.js')));
  const checked=checkProject(loadProject(choices)),file=join(choices,'values.aug');
  const before=describe(checked,file,{name:'greet',budget:100000});
  const fact=contractFacts(checked).find(item=>item.name==='greet');
  fact.location.line=999;fact.typeParameters.push('Imaginary');
  assert.deepEqual(describe(checked,file,{name:'greet',budget:100000}),before);
  aug('spec',choices);assert.match(readFileSync(join(choices,'values.aug.md'),'utf8'),/choice based on `name`/);
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)
    assert.equal(run(process.execPath,[cli,'run',choices,'--backend','llvm']),'Hello, Ada!\n');
  const renames=join(directory,'checked-renames');mkdirSync(renames);
  writeFileSync(join(renames,'main.aug'),'import greet from greeter\nprint(value=greet(name="Ada"))\n');
  writeFileSync(join(renames,'greeter.aug'),'greet(string name):\n    return $"Hello, {name}!"\n');
  const renamePlan=JSON.parse(aug('change','plan-rename',renames,'--file','greeter.aug','--symbol','greet.name','--name','person','--out','rename.json','--json'));
  assert.ok(renamePlan.edits.every(edit=>!edit.file.startsWith('/')));assert.equal(renamePlan.behavioralEvidence,'not-run');
  const renamed=JSON.parse(aug('change','apply',renames,'--plan','rename.json','--json'));assert.equal(renamed.status,'committed');assert.deepEqual(renamed.identityMap,renamePlan.identityMap);assert.ok(renamed.identityMap.some(pair=>pair.before===renamePlan.symbol));
  assert.equal(aug('run',renames),'Hello, Ada!\n');
  assert.equal(JSON.parse(aug('change','recover',renames,'--json')).status,'clean');
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)
    assert.equal(run(process.execPath,[cli,'run',renames,'--backend','llvm']),'Hello, Ada!\n');
  writeFileSync(join(renames,'replacement.aug.txt'),'greet(string person):\n    return $"Welcome, {person}!"\n');
  const bodyPlan=JSON.parse(aug('change','plan-replace-body',renames,'--file','greeter.aug','--symbol','greet','--source','replacement.aug.txt','--out','body.json','--json'));
  assert.equal(Object.hasOwn(bodyPlan,'identityMap'),false);assert.equal(bodyPlan.operation,'replace-body');assert.deepEqual(bodyPlan.publicDelta,[]);assert.equal(bodyPlan.behavioralEvidence,'not-run');
  const bodyApplied=JSON.parse(aug('change','apply',renames,'--plan','body.json','--json'));assert.equal(bodyApplied.operation,'replace-body');
  assert.equal(aug('run',renames),'Welcome, Ada!\n');
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)
    assert.equal(run(process.execPath,[cli,'run',renames,'--backend','llvm']),'Welcome, Ada!\n');
  const patterns=join(directory,'binding-patterns');mkdirSync(patterns);
  writeFileSync(join(patterns,'main.aug'),'import Person from people\nperson = Person(name="Ada", ratings=(7, 9))\n{name: displayName, ratings: (first, second)} = person\nprint(value=displayName)\nprint(value=first + second)\n');
  writeFileSync(join(patterns,'people.aug'),'record Person(string name, Tuple<int, int> ratings)\n');
  assert.equal(aug('run',patterns),'Ada\n16\n');
  aug('spec',patterns);assert.match(readFileSync(join(patterns,'main.aug.md'),'utf8'),/displayName/);
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)
    assert.equal(run(process.execPath,[cli,'run',patterns,'--backend','llvm']),'Ada\n16\n');
  const collections=join(directory,'collection-functions');mkdirSync(collections);
  writeFileSync(join(collections,'main.aug'),'import sortIntegers from august.collections\ntry:\n    for value in sortIntegers(values=[7, -1, 0]):\n        print(value=value)\ncatch IndexError error:\n    print(value="unexpected")\nprint(value="é".compare(other="z"))\n');
  assert.equal(aug('run',collections),'-1\n0\n7\n1\n');
  aug('spec',collections);assert.match(readFileSync(join(collections,'main.aug.md'),'utf8'),/sortIntegers/);
  const selection=join(directory,'comprehension-consumer');mkdirSync(selection);
  writeFileSync(join(selection,'main.aug'),'selected = [value * 2 for value in [-1, 2, 3] if value > 0]\nfor value in selected:\n    print(value=value)\n');
  assert.equal(aug('run',selection),'4\n6\n');
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)assert.equal(run(process.execPath,[cli,'run',selection,'--backend','llvm']),'4\n6\n');
  aug('spec',selection);assert.match(readFileSync(join(selection,'main.aug.md'),'utf8'),/new list.*snapshot/);
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)
    assert.equal(run(process.execPath,[cli,'run',collections,'--backend','llvm']),'-1\n0\n7\n1\n');
  const closedChoices=join(directory,'choice-consumer');mkdirSync(closedChoices);
  writeFileSync(join(closedChoices,'main.aug'),'import Left and choose from alternatives\nprint(value=choose(value=Left(value=7)))\n');
  writeFileSync(join(closedChoices,'alternatives.aug'),'choice Side from Left and Right\nrecord Left(int value)\nrecord Right(string text)\nchoose(Side value):\n    return match value { when Left left { $"{left.value}" } when Right right { right.text } }\n');
  assert.equal(aug('run',closedChoices),'7\n');
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)assert.equal(run(process.execPath,[cli,'run',closedChoices,'--backend','llvm']),'7\n');
  aug('spec',closedChoices);assert.match(readFileSync(join(closedChoices,'alternatives.aug.md'),'utf8'),/closed record choice/);
  const contextualErrors=join(directory,'error-context');mkdirSync(contextualErrors);
  writeFileSync(join(contextualErrors,'main.aug'),'import fail and Problem from operation\nimport ContextError from august.errors\ntry { fail() } catch ContextError<Problem> error { print(value=error.operation); print(value=error.cause.code); print(value=error.location[0]) }\n');
  writeFileSync(join(contextualErrors,'operation.aug'),'import errorContext from august.errors\nerror Problem(int code)\nfail():\n    throw errorContext(cause=Problem(code=42), operation="compute", location=sourceLocation())\n');
  assert.equal(aug('run',contextualErrors),'compute\n42\noperation.aug\n');
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)assert.equal(run(process.execPath,[cli,'run',contextualErrors,'--backend','llvm']),'compute\n42\noperation.aug\n');
  aug('spec',contextualErrors);
  const measuredText=join(directory,'grapheme-consumer');mkdirSync(measuredText);
  writeFileSync(join(measuredText,'main.aug'),'try:\n    text = "é👩‍💻"\n    print(value=text.byteLength())\n    print(value=text.graphemeLength())\n    print(value=text.graphemes().join(separator="") == text)\ncatch ConversionError failure:\n    print(value="unexpected")\n');
  assert.equal(aug('run',measuredText),'14\n2\ntrue\n');
  assert.match(readFileSync(join(cliRoot,'runtime/UNICODE-LICENSE.txt'),'utf8'),/UNICODE LICENSE V3/);
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK){
    assert.equal(run(process.execPath,[cli,'run',measuredText,'--backend','llvm']),'14\n2\ntrue\n');
    const pack=JSON.parse(readFileSync(join(process.env.AUG_RUNTIME_PACK,'runtime.json'),'utf8'));
    assert.equal(readFileSync(join(measuredText,'.aug-build/share/august-native','runtime-'+pack.sourceSha256,'licenses/Unicode.txt'),'utf8'),readFileSync(join(cliRoot,'runtime/UNICODE-LICENSE.txt'),'utf8'));
  }

  const domainValues=join(directory,'domain-value-consumer');mkdirSync(domainValues);
  const domainFixture=JSON.parse(readFileSync(join(root,'conformance/cases.json'),'utf8')).cases.find(item=>item.id==='domain-values');
  writeFileSync(join(domainValues,'main.aug'),domainFixture.files['main.aug']);
  assert.equal(aug('run',domainValues),domainFixture.stdout);
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)assert.equal(run(process.execPath,[cli,'run',domainValues,'--backend','llvm']),domainFixture.stdout);
  aug('spec',domainValues);
  const retryPolicy=join(directory,'retry-policy-consumer');mkdirSync(retryPolicy);
  writeFileSync(join(retryPolicy,'main.aug'),'import Duration and RetryPolicy and retryDelay from august.values\ntry:\n    policy = RetryPolicy(maxAttempts=2, delays=[Duration(milliseconds=100)])\n    match retryDelay(policy, failedAttempt=1):\n        when some delay:\n            print(value=delay.milliseconds)\n        when null:\n            print(value="unexpected")\n    print(value=retryDelay(policy, failedAttempt=2) == null)\ncatch ConversionError failure:\n    print(value="unexpected")\n');
  assert.equal(aug('run',retryPolicy),'100\ntrue\n');
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)assert.equal(run(process.execPath,[cli,'run',retryPolicy,'--backend','llvm']),'100\ntrue\n');
  aug('spec',retryPolicy);
  const internalModules=join(directory,'internal-module-consumer');mkdirSync(internalModules);
  const internalFixture=JSON.parse(readFileSync(join(root,'conformance/cases.json'),'utf8')).cases.find(item=>item.id==='internal-composition');
  for(const [name,text] of Object.entries(internalFixture.files)){const target=join(internalModules,name);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,text);}
  writeFileSync(join(internalModules,'main.yaml'),'strict_modules: true\n');
  assert.equal(aug('run',internalModules),internalFixture.stdout);
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)assert.equal(run(process.execPath,[cli,'run',internalModules,'--backend','llvm']),internalFixture.stdout);
  aug('spec',internalModules);assert.match(readFileSync(join(internalModules,'service/export.aug.md'),'utf8'),/Make available only inside this folder/);

  const contractErrors=join(directory,'interface-diagnostics');mkdirSync(contractErrors);
  writeFileSync(join(contractErrors,'main.aug'),'');
  writeFileSync(join(contractErrors,'values.aug'),'import Console from august.io\ninterface Quiet { write() }\nLoud(resolve Console console) implements Quiet { write() { console.write(value="hello") } }\n');
  const rejected=spawnSync(process.execPath,[cli,'check',contractErrors,'--json'],{cwd:directory,encoding:'utf8'});
  assert.equal(rejected.status,1,rejected.stderr);
  const violation=JSON.parse(rejected.stdout).find(issue=>/interface signature/.test(issue.message));
  assert.equal(violation.expected,'uses none');assert.equal(violation.actual,'uses Console.write (inferred)');
  assert.equal(violation.related[0].line,2);assert.equal(violation.related[1].line,3);

  const callbacks=join(directory,'callback-consumer');mkdirSync(callbacks);
  writeFileSync(join(callbacks,'main.aug'),'import transform from august.collections\nfor value in transform(values=[2, 3], transformation=(int value) => value * 2):\n    print(value=value)\n');
  assert.equal(aug('run',callbacks),'4\n6\n');
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK)assert.equal(run(process.execPath,[cli,'run',callbacks,'--backend','llvm']),'4\n6\n');
  aug('spec',callbacks);assert.match(readFileSync(join(callbacks,'main.aug.md'),'utf8'),/pure callback/);
  const verifySpecs = folder => {
    for(const entry of readdirSync(folder,{withFileTypes:true})) {
      const file=join(folder,entry.name);
      if(entry.isDirectory())verifySpecs(file);
      else if(entry.name.endsWith('.aug.md'))for(const match of readFileSync(file,'utf8').matchAll(/\]\(([^)]+)\)/g)) {
        if(/^[a-z]+:/i.test(match[1]))continue;
        const [href,anchor]=match[1].split('#'),target=resolve(dirname(file),decodeURIComponent(href));
        assert.ok(existsSync(target),`Broken installed spec link ${match[1]} in ${file}`);
        if(target.endsWith('.aug.md')&&anchor)assert.ok(readFileSync(target,'utf8').includes(`id="${decodeURIComponent(anchor)}"`),`Broken installed spec anchor ${match[1]} in ${file}`);
      }
    }
  };
  for(const name of ['stdlib','web','crypto'])verifySpecs(join(directory,`node_modules/@greenpandastudios/aug-${name}/august`));
  assert.match(aug('--help'), /Usage: aug/);
  const cacheEnv={...process.env,AUG_PACKAGE_CACHE:join(directory,'source-cache'),AUG_NATIVE_ARTIFACT_CACHE:join(directory,'native-cache'),AUG_COMPILATION_CACHE:join(directory,'empty-compilation-cache')};
  const emptyCacheProject=join(directory,'cache-project');mkdirSync(emptyCacheProject);writeFileSync(join(emptyCacheProject,'main.aug'),'print(value=42)\n');
  const cacheReport=JSON.parse(run(process.execPath,[cli,'cache',emptyCacheProject,'--json'],{env:cacheEnv}));
  assert.equal(cacheReport.execution,'not-run');assert.equal(cacheReport.caches.length,4);assert.equal(cacheReport.offlineReady,false);assert.ok(!existsSync(cacheEnv.AUG_COMPILATION_CACHE));
  assert.equal(JSON.parse(run(process.execPath,[cli,'cache','prune',emptyCacheProject,'--write','--json'],{env:cacheEnv})).bytes,0);
  const starter = join(directory, 'starter');
  aug('init', starter);
  assert.ok(existsSync(join(starter,'AGENTS.md')));
  const weather = join(directory,'weather'); aug('init',weather,'--template','weather');
  aug('check',weather); assert.equal(JSON.parse(aug('test',weather,'--json')).passed,2);
  aug('check', starter);
  assert.equal(JSON.parse(aug('test', starter, '--json')).passed, 1);
  assert.equal(aug('run', starter), 'Hello, August!\n');
  const catalog=JSON.parse(aug('libraries','compression','--json'));
  assert.equal(catalog.entries[0].id,'zlib');
  assert.match(catalog.entries[0].source.request,/aug-zlib#v0.1.5/);
  const scratchFile=join(directory,'scratch.aug');writeFileSync(scratchFile,'print(value=42)\n');
  const scratchReport=JSON.parse(aug('scratch',scratchFile,'--json'));
  assert.equal(scratchReport.checked,true);assert.equal(scratchReport.executed,false);assert.equal(scratchReport.prepared,false);
  assert.equal(aug('scratch',scratchFile,'--run','--backend','c','--offline'),'42\n');
  assert.equal(readFileSync(scratchFile,'utf8'),'print(value=42)\n');
  const styled=join(directory,'styled');
  aug('init',styled,'--block-style','braces','--indentation','tabs','--assignment','to');
  assert.match(readFileSync(join(styled,'greeting.aug'),'utf8'),/greet\(string name\) \{\n\treturn/);
  assert.equal(aug('run',styled),'Hello, August!\n');
  const context=JSON.parse(aug('context',styled,'--file',join(styled,'greeting.aug'),'--name','greet','--mode','review','--budget','100000'));
  assert.equal(context.schema,3);assert.equal(context.status,'ready');assert.equal(context.query.mode,'review');
  assert.ok(context.tests.some(item=>item.source.includes('test greet')));assert.equal(context.evidence.behavior,'not-run');
  assert.ok(context.dependencies.some(item=>item.file==='project/package.json'));
  const compareBefore=join(directory,'compare-before'),compareAfter=join(directory,'compare-after');
  for(const [path,result] of [[compareBefore,7],[compareAfter,8]]){mkdirSync(path);writeFileSync(join(path,'main.aug'),'import answer from model\nprint(value=answer())\n');writeFileSync(join(path,'model.aug'),`answer() returns int { return ${result} }\n`);}
  const comparison=JSON.parse(aug('compare',compareBefore,compareAfter,'--json'));
  assert.equal(comparison.status,'compared');assert.equal(comparison.evidence.behavior,'not-run');
  assert.deepEqual(comparison.changes[0].categories,['source']);assert.deepEqual(comparison.changes[0].contractDifferences,[]);
  assert.ok(comparison.changes[0].impact.after.some(consumer=>consumer.symbol==='module:main.aug'));
  const ranges=join(directory,'ranges');mkdirSync(ranges);
  writeFileSync(join(ranges,'main.aug'),'import range and RangeError from august.collections\ntry { print(value=range(end=3, limit=3).length()) } catch RangeError error { exit(status=1) }\n');
  assert.equal(aug('run',ranges),'3\n');
  writeFileSync(join(ranges,'main.aug'),'import checkedAdd and parseDecimal and formatDecimal from august.math\ntry { print(value=checkedAdd(left=20, right=22)); print(value=formatDecimal(value=parseDecimal(text="12.50"))) } catch Error error { exit(status=1) }\n');
  assert.equal(aug('run',ranges),'42\n12.50\n');
  // Installed JavaScript must include every setup helper and prepare a genuinely empty source cache.
  const freshNative = join(directory, 'first-use-native');
  mkdirSync(join(freshNative, 'downloads'), { recursive: true });
  const pinned = JSON.parse(readFileSync(join(cliRoot, 'scripts/native-dependencies.lock.json')));
  const jsonDependency = pinned.dependencies.find(item => item.name === 'yyjson');
  cpSync(join(process.env.AUG_NATIVE_HOME ?? join(root, '.aug-native'), 'downloads', jsonDependency.archive), join(freshNative, 'downloads', jsonDependency.archive));
  const jsonProject = join(directory, 'first-use-json'); mkdirSync(jsonProject);
  writeFileSync(join(jsonProject, 'main.aug'), 'import parse from json\ntry:\n    value = parse(input="null")\n    print(value="parsed")\ncatch JsonError error:\n    exit(status=1)\n');
  writeFileSync(join(jsonProject, 'main.yaml'), `packages:\n  json: ${JSON.stringify(join(root,'src/stdlib/json'))}\n`);
  aug('install', jsonProject);
  assert.equal(run(process.execPath, [cli, 'run', jsonProject, '--backend', 'c', '--offline'], { env: { ...process.env, AUG_NATIVE_HOME: freshNative } }), 'parsed\n');
  assert.ok(existsSync(join(freshNative, 'sources/yyjson/src/yyjson.c')));
  assert.ok(!existsSync(join(freshNative, 'sources/gnutls')));
  aug('spec', starter);
  assert.ok(existsSync(join(starter, 'greeting.aug.md')));
  const refused = spawnSync(process.execPath, [cli, 'init', starter], { cwd: directory, encoding: 'utf8' });
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /not empty/);
  assert.ok(existsSync(join(directory, 'node_modules/.bin/aug-cli')));
  const project = join(directory, 'hello');
  mkdirSync(project);
  const main = `import Console and SystemConsole from august.io\nimplement Console with SystemConsole\nresolve Console to console\nconsole.write(value="installed August works")\n`;
  writeFileSync(join(project, 'main.aug'), main);
  aug('check', project);
  aug('spec',project);aug('spec',project,'--check');
  assert.ok(existsSync(join(project,'main.aug.md')));
  assert.equal(aug('run', project), 'installed August works\n');
  const composition=JSON.parse(aug('graph',project,'--composition','--json'));
  assert.equal(composition.checked,true);assert.equal(composition.behavioralChecks,'not-run');
  assert.deepEqual(composition.bindings.map(binding=>[binding.key,binding.target.name,binding.lifetime]),[['Console','SystemConsole','shared']]);
  assert.match(aug('graph',project,'--composition','--mermaid'),/SystemConsole/);
  const library = join(directory, 'my-math');
  aug('package', 'init', library, '--name', '@example/aug-math', '--assignment', 'to', '--indentation', 'tabs');
  aug('check', library);
  const maintainerWorkflow=JSON.parse(aug('package','workflow',library,'--json'));
  assert.equal(maintainerWorkflow.backend,'llvm');assert.match(maintainerWorkflow.workflow,/aug package release/);
  assert.equal(maintainerWorkflow.publication,'not-run');
  const inputRows=JSON.parse(aug('test',library,'--suggest-inputs','add','--file','src/arithmetic.aug','--json'));
  assert.equal(inputRows.oracle,'author-required');assert.equal(inputRows.behavioralChecks,'not-run');assert.equal(inputRows.rows.length,9);
  assert.ok(inputRows.rows.some(row=>row.inputs.left==='9223372036854775807'));
  const libraryTests = JSON.parse(aug('test', library, '--json'));
  assert.equal(libraryTests.passed, 1);
  assert.equal(libraryTests.tests[0].compilation.cache,'disabled');
  assert.equal(JSON.parse(aug('test',library,'--rebuild','--json')).passed,1);
  assert.match(readFileSync(join(cliRoot,'src/test-compilation-cache.js'),'utf8'),/reuseTestCompilation/);
  if(process.env.AUG_LLVM_HOME&&process.env.AUG_RUNTIME_PACK){
    const cachedTests=(...options)=>JSON.parse(run(process.execPath,[cli,'test',library,'--backend','llvm','--json',...options],
      {env:{...process.env,AUG_COMPILATION_CACHE:join(directory,'compilation-cache')}}));
    const first=cachedTests(),second=cachedTests(),refresh=cachedTests('--rebuild');
    assert.equal(first.passed,1);assert.equal(second.passed,1);assert.equal(refresh.passed,1);
    assert.equal(first.tests[0].compilation.cache,'miss');assert.equal(second.tests[0].compilation.cache,'hit');assert.equal(refresh.tests[0].compilation.cache,'refresh');
  }
  const caseIds=JSON.parse(aug('test',library,'--list','--json')).map(item=>item.id);
  assert.deepEqual(caseIds,['src/arithmetic.aug:add:addition:adds_two_integers']);
  writeFileSync(join(library,'requirements.json'),JSON.stringify({format:1,requirements:[{id:'sum',description:'Two plus three equals five.',tests:caseIds}]}));
  const acceptance=JSON.parse(aug('verify',library,'--requirements','requirements.json','--backend','c','--json'));
  assert.equal(acceptance.status,'passed');assert.equal(acceptance.compiler.status,'accepted');assert.equal(acceptance.behavior.passed,1);assert.equal(acceptance.generalProof,'not-established');
  assert.equal(acceptance.review.sources[0].file,'src/arithmetic.aug');
  const authoredManifest=join(library,'aug-package.json');
  const authored=JSON.parse(readFileSync(authoredManifest,'utf8'));authored.compiler='~'+authored.compiler;writeFileSync(authoredManifest,JSON.stringify(authored));
  aug('check',library);
  const archive = aug('package', 'pack', library).trim();
  writeFileSync(join(library,'LICENSE'),'MIT\n');
  aug('install',library,'--offline');
  const git=process.env.AUG_GIT??'git';
  run(git,['-c','core.hooksPath=/dev/null','init'],{cwd:library});
  run(git,['-c','core.hooksPath=/dev/null','add','.'],{cwd:library});
  run(git,['-c','core.hooksPath=/dev/null','-c','user.name=Installed fixture','-c','user.email=fixture@example.invalid','commit','-m','Library'],{cwd:library});
  run(git,['-c','core.hooksPath=/dev/null','tag','v0.1.0'],{cwd:library});
  const release=JSON.parse(aug('package','release',library,'--tag','v0.1.0','--json'));
  assert.equal(release.ready,true);assert.equal(release.source.tag,'v0.1.0');
  assert.equal(release.evidence.behavior,'not-run');assert.equal(release.contracts[0].name,'add');
  assert.equal(JSON.parse(readFileSync(join(library,'package.json'),'utf8')).files.includes('main.yaml'),true);
  const consumer = join(directory, 'my-app'); mkdirSync(consumer);
  writeFileSync(join(consumer, 'main.yaml'), `packages:\n  math: "${archive}"\n`);
  writeFileSync(join(consumer, 'main.aug'), 'import add from math\nprint(value=add(left=20, right=22))\n');
  assert.equal(aug('run', consumer, '--offline'), '42\n');
  aug('install', consumer, '--frozen', '--offline');
  const acceptedConsumer=readFileSync(join(consumer,'aug.lock.json'),'utf8');
  const preview=JSON.parse(aug('update',consumer,'--preview','--offline','--json'));
  assert.equal(preview.ready,true);assert.equal(preview.acceptedWrites,false);assert.equal(preview.behavioralEvidence,'not-run');
  assert.deepEqual(preview.packages[0].contracts.changes,[]);
  assert.equal(readFileSync(join(consumer,'aug.lock.json'),'utf8'),acceptedConsumer);

  const globalPrefix = join(directory, 'global');
  run('npm', ['install', '--global', '--prefix', globalPrefix, '--offline', '--ignore-scripts', '--no-audit', '--no-fund',
    ...packages.map(pkg => join(artifacts, pkg.filename))]);
  const globalAug = join(globalPrefix, 'bin/aug');
  assert.equal(run(globalAug, ['--version']).trim(), packages.find(pkg => pkg.directory === 'cli').version);
  assert.equal(run(globalAug, ['run', project, '--backend', 'c'], {env: {...process.env, AUG_NATIVE_HOME: process.env.AUG_NATIVE_HOME ?? join(root, '.aug-native')}}),
    'installed August works\n');
  const editorMain = main + 'import Crypto from crypto\nimport HttpClient from web\n';
  writeFileSync(join(project,'main.yaml'), `packages:\n  crypto: ${JSON.stringify(join(directory,'node_modules/@greenpandastudios/aug-crypto'))}\n  web: ${JSON.stringify(join(directory,'node_modules/@greenpandastudios/aug-web'))}\n`);
  aug('install', project);
  writeFileSync(join(project, 'main.aug'), editorMain);
  aug('check', project);
  const definition = JSON.parse(aug('definition', project, '--file', join(project, 'main.aug'), '--offset', String(editorMain.indexOf('from crypto') + 2)));
  assert.ok(definition.file.endsWith('/august/crypto/export.aug'), JSON.stringify(definition));
  writeFileSync(join(project, 'main.aug'), editorMain + 'import ');
  const items = JSON.parse(aug('complete', project, '--file', join(project, 'main.aug'), '--offset', String(editorMain.length + 7)));
  assert.ok(items.some(item => item.detail === 'import GnuTlsCrypto from crypto'), JSON.stringify(items));
  writeFileSync(join(project, 'main.aug'), editorMain);
  aug('install', join(cliRoot, 'examples/oidc-login'));
  aug('check', join(cliRoot, 'examples/oidc-login'));
  const emitted = aug('emit-c', join(cliRoot, 'examples/oidc-login'));
  assert.match(emitted, /aug_http_configure/);
  if (process.argv.includes('--native')) {
    const proof = join(directory, 'oidc-login');
    cpSync(join(cliRoot, 'examples/oidc-login'), proof, {recursive: true});
    aug('install', proof);
    aug('build', proof);
    const tests = JSON.parse(aug('test', proof, '--group', 'signed_identity_claims', '--json'));
    assert.equal(tests.failed, 0);
    assert.ok(tests.passed >= 11);
    process.stdout.write(`Installed native web/crypto: OIDC application builds; ${tests.passed} signed identity tests pass.\n`);
  }
  const nativePath = run(process.execPath, ['--input-type=module', '-e',
    `import {nativeHome} from ${JSON.stringify(join(cliRoot, 'scripts/native-home.mjs'))}; console.log(nativeHome(${JSON.stringify(cliRoot)}));`],
    { env: Object.fromEntries(Object.entries(process.env).filter(([name]) => name !== 'AUG_NATIVE_HOME')) }).trim();
  assert.ok(!nativePath.startsWith(directory));
  assert.match(nativePath, /\.cache\/augscript\/native\//);
  const lock = JSON.parse(readFileSync(join(project,'aug.lock.json'),'utf8'));
  const scope = lock.packages.find(entry => entry.name === '@greenpandastudios/aug-crypto');
  const manifestFile = join(project,'.aug-packages',scope.path,'aug-package.json');
  writeFileSync(manifestFile, JSON.stringify({ ...JSON.parse(readFileSync(manifestFile, 'utf8')), compiler: '0.0.0' }));
  const mismatch = spawnSync(process.execPath, [cli, 'check', project], { cwd: directory, encoding: 'utf8' });
  assert.notEqual(mismatch.status, 0);
  assert.match(mismatch.stderr, /compiler mismatch/);
  process.stdout.write('Installed package smoke tests passed: compiler, native execution, split libraries, navigation, completion, OIDC emission, cache and version compatibility.\n');
} finally { rmSync(directory, { recursive: true, force: true }); }
