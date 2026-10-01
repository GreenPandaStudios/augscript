import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { addPackage, initPackage, installPackages, prepareRunPackages, readPackage } from '../src/package-manager.ts';
import { gitReference } from '../src/git-packages.ts';
import { initProject } from '../src/project-init.ts';
import { loadProject } from '../src/project.ts';
import { checkProject } from '../src/checker.ts';
import { formatFile } from '../src/formatter.ts';
import { generateOpenApi } from '../src/openapi.ts';

function fixture(action) {
  const root = mkdtempSync(join(tmpdir(), 'aug-ecosystem-'));
  const cache = process.env.AUG_PACKAGE_CACHE;
  process.env.AUG_PACKAGE_CACHE = join(root, 'cache');
  try { return action(root); } finally {
    if (cache === undefined) delete process.env.AUG_PACKAGE_CACHE; else process.env.AUG_PACKAGE_CACHE = cache;
    rmSync(root, { recursive: true, force: true });
  }
}
const git = (cwd, ...args) => {
  const result = spawnSync(process.env.AUG_GIT ?? 'git', ['-c', 'user.name=August test', '-c', 'user.email=test@example.invalid', ...args], { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); return result.stdout.trim();
};
const checked = root => { const result = checkProject(loadProject(root)); assert.deepEqual(result.diagnostics, []); return result; };

test('a plain Git library imports directly, locks its revision, restores offline, and updates explicitly', () => fixture(root => {
  const library = join(root, 'library'), app = join(root, 'app'); mkdirSync(library); mkdirSync(app);
  writeFileSync(join(library, 'export.aug'), 'export answer from values\n');
  writeFileSync(join(library, 'values.aug'), 'answer() { return 42 }\n_private() { return 0 }\n');
  writeFileSync(join(library, 'package.json'), JSON.stringify({ scripts: { prepare: 'touch MUST_NOT_RUN' } }));
  git(library, 'init'); git(library, 'add', '.'); git(library, 'commit', '-m', 'First answer');
  const request = 'git+' + pathToFileURL(library).href;
  writeFileSync(join(app, 'main.aug'), `import answer from "${request}"\nprint(value=answer())\n`);
  prepareRunPackages(app);
  const first = JSON.parse(readFileSync(join(app, 'aug.lock.json')));
  assert.equal(first.git[0].commit, git(library, 'rev-parse', 'HEAD'));
  assert.equal(existsSync(join(library, 'MUST_NOT_RUN')), false);
  const project = checked(app).project;
  assert.match(formatFile(project, project.main), /from "git\+file:/);
  writeFileSync(join(library, 'values.aug'), 'answer() { return 43 }\n');
  git(library, 'add', '.'); git(library, 'commit', '-m', 'New answer');
  rmSync(join(app, '.aug-packages'), { recursive: true });
  prepareRunPackages(app, true); checked(app);
  assert.equal(JSON.parse(readFileSync(join(app, 'aug.lock.json'))).git[0].commit, first.git[0].commit);
  installPackages(app, false, false, true);
  const next = JSON.parse(readFileSync(join(app, 'aug.lock.json')));
  assert.notEqual(next.git[0].commit, first.git[0].commit); checked(app);
  writeFileSync(join(app, 'main.aug'), `import _private from "${request}"\n`);
  assert.ok(checkProject(loadProject(app)).diagnostics.some(issue => issue.code === 'PRIVATE'));
}));

test('Git dependencies are discovered transitively without npm metadata', () => fixture(root => {
  const leaf = join(root, 'leaf'), library = join(root, 'library'), app = join(root, 'app');
  for (const folder of [leaf, library, app]) mkdirSync(folder);
  writeFileSync(join(leaf, 'export.aug'), 'export answer from values\n');
  writeFileSync(join(leaf, 'values.aug'), 'answer() { return 42 }\n');
  git(leaf, 'init'); git(leaf, 'add', '.'); git(leaf, 'commit', '-m', 'Leaf');
  writeFileSync(join(library, 'export.aug'), 'export read from reader\n');
  writeFileSync(join(library, 'reader.aug'), `import answer from "git+${pathToFileURL(leaf).href}"\nread() { return answer() }\n`);
  git(library, 'init'); git(library, 'add', '.'); git(library, 'commit', '-m', 'Reader');
  writeFileSync(join(app, 'main.aug'), `import read from "git+${pathToFileURL(library).href}"\nprint(value=read())\n`);
  prepareRunPackages(app); assert.equal(installPackages(app, true, true).packages.length, 2); checked(app);
}));

test('repository URL validation rejects credentials, traversal, and options', () => {
  assert.deepEqual(gitReference('https://github.com/owner/repo/tree/v1.2.3/parsing'), {
    request: 'https://github.com/owner/repo/tree/v1.2.3/parsing', repository: 'https://github.com/owner/repo.git', revision: 'v1.2.3', folder: 'parsing'
  });
  for (const url of ['https://user:secret@github.com/o/r', 'https://github.com/o/r#--upload-pack=x', 'https://github.com/o/r/%2E%2E/private'])
    assert.throws(() => gitReference(url));
});

test('both application starters create agent instructions; the weather API has a checked OpenAPI shape', () => fixture(root => {
  for (const template of ['hello', 'weather']) {
    const app = join(root, template); initProject(app, template);
    assert.match(readFileSync(join(app, 'AGENTS.md'), 'utf8'), /adjacent .aug.md specification/);
    const result = checked(app);
    if (template === 'weather') {
      const api = generateOpenApi(result).document;
      assert.ok(api.paths['/weatherforecast'].get);
      assert.match(JSON.stringify(api), /temperatureC/);
      assert.match(readFileSync(join(app, 'forecasts.aug'), 'utf8'), /test endpoint weatherForecast/);
    }
    assert.throws(() => initProject(app, template), /not empty/);
  }
}));

test('a short alias works in applications and libraries without mandatory npm metadata', () => fixture(root => {
  const math = join(root, 'math'), app = join(root, 'app'), facade = join(root, 'facade');
  initPackage(math, 'math'); initPackage(facade, 'facade'); mkdirSync(app);
  assert.equal(existsSync(join(math, 'package.json')), false);
  writeFileSync(join(app, 'main.aug'), 'import add from math\nprint(value=add(left=2,right=3))\n');
  addPackage(app, math, 'math', true); checked(app);
  addPackage(facade, math, 'math', true);
  writeFileSync(join(facade, 'src/arithmetic.aug'), 'import add from math\ntriple(int value) { return add(left=value,right=add(left=value,right=value)) }\n');
  writeFileSync(join(facade, 'src/export.aug'), 'export triple from arithmetic\n');
  checked(facade);
  writeFileSync(join(facade,'main.yaml'), 'unknown_option: true\n');
  assert.throws(()=>readPackage(facade), /Invalid package configuration.*unknown_option/s);
  const before = readFileSync(join(app,'main.yaml'),'utf8');
  assert.throws(() => addPackage(app, join(root,'missing'), 'missing', true), /does not exist/);
  assert.equal(readFileSync(join(app,'main.yaml'),'utf8'), before);
}));

test('Git source symlinks are rejected and a failed install preserves the previous snapshot', () => fixture(root => {
  const library = join(root, 'library'), app = join(root, 'app'); mkdirSync(library); mkdirSync(app);
  writeFileSync(join(library, 'export.aug'), 'export answer from values\n');
  writeFileSync(join(library, 'values.aug'), 'answer() { return 42 }\n');
  git(library,'init'); git(library,'add','.'); git(library,'commit','-m','Source');
  const request = 'git+' + pathToFileURL(library).href;
  writeFileSync(join(app,'main.aug'), `import answer from "${request}"\nprint(value=answer())\n`);
  prepareRunPackages(app); const before = readFileSync(join(app,'aug.lock.json'),'utf8');
  rmSync(join(library,'values.aug'));
  // An index entry with symlink mode is enough; no host symlink or checkout is needed.
  const blob = git(library,'hash-object','-w','export.aug');
  git(library,'update-index','--cacheinfo',`120000,${blob},values.aug`); git(library,'commit','-m','Invalid source');
  assert.throws(() => installPackages(app,false,false,true), /regular files/);
  assert.equal(readFileSync(join(app,'aug.lock.json'),'utf8'),before); checked(app);
}));

test('the weather starter serves typed JSON, OpenAPI, and method rejection over a native socket', {timeout:30000}, async () => {
  const root = mkdtempSync(join(tmpdir(),'aug-weather-socket-')); let server;
  try {
    const app = join(root,'weather'); initProject(app,'weather');
    writeFileSync(join(app,'main.aug'), readFileSync(join(app,'main.aug'),'utf8').replace('8787','0'));
    const cli = resolve(import.meta.dirname,'../bin/aug.mjs');
    const built = spawnSync(process.execPath,[cli,'build',app],{encoding:'utf8'}); assert.equal(built.status,0,built.stderr);
    server = spawn(built.stdout.trim(),[],{stdio:['ignore','pipe','pipe']});
    const lines = createInterface({input:server.stdout}); let errors=''; server.stderr.on('data',data=>errors+=data);
    const port = await new Promise((accept,reject) => {
      const timer=setTimeout(()=>reject(new Error(errors || 'Weather server did not start')),10000);
      server.once('exit',code=>{clearTimeout(timer);reject(new Error('Weather server exited '+code+': '+errors));});
      lines.on('line',line=>{const match=/port (\d+)/.exec(line);if(match){clearTimeout(timer);accept(Number(match[1]));}});
    });
    const base = `http://127.0.0.1:${port}`;
    const response=await fetch(base+'/weatherforecast'); assert.equal(response.status,200);
    const forecasts=await response.json(); assert.equal(forecasts.length,5);
    assert.deepEqual(forecasts[0],{date:'2026-01-01',temperatureC:0,temperatureF:32,summary:'Freezing'});
    const schema=await (await fetch(base+'/openapi.json')).json(); assert.ok(schema.paths['/weatherforecast'].get);
    assert.equal((await fetch(base+'/weatherforecast',{method:'POST'})).status,405);
  } finally {
    if(server && server.exitCode===null) { server.kill('SIGTERM'); await new Promise(accept=>server.once('exit',accept)); }
    rmSync(root,{recursive:true,force:true});
  }
});
