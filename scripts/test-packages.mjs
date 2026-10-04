#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
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
    if(['run','build','test','bench'].includes(args[0])){
      const separator=args.indexOf('--'),at=separator<0?args.length:separator;
      args=[...args.slice(0,at),'--backend','c',...args.slice(at)];
    }
    return run(process.execPath,[cli,...args],{
      env:{...process.env,AUG_NATIVE_HOME:process.env.AUG_NATIVE_HOME??join(root,'.aug-native')}
    });
  };
  assert.match(readFileSync(join(cliRoot,'native/aug-native-abi-1.h'),'utf8'),/aug_native_error_v1/);
  assert.equal(aug('--version').trim(), packages.find(pkg => pkg.directory === 'cli').version);
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
  const libraryTests = JSON.parse(aug('test', library, '--json'));
  assert.equal(libraryTests.passed, 1);
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
