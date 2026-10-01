import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { loadProject } from '../src/project.ts';
import { checkProject } from '../src/checker.ts';
import { definitionAt } from '../src/navigation.ts';
import { SemanticWorkspace } from '../src/semantic.ts';
const root = resolve(import.meta.dirname, '..'), cli = join(root, 'bin/aug.mjs');
const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 30000,
  env: { ...process.env, AUG_NATIVE_HOME: process.env.AUG_NATIVE_HOME??join(root, '.aug-native') } });
const ok = (...args) => { const result = run(...args); assert.equal(result.status, 0, result.stderr + result.stdout); return result.stdout; };
const setJson = (path, data) => writeFileSync(path, JSON.stringify(data, null, 2));

test('authors create and pack libraries; applications import verified source and retain editor help', () => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'aug-package-')));
  try {
    const library = join(base, 'math'), app = join(base, 'app');
    ok('package', 'init', library, '--name', '@example/aug-math');
    ok('check', library);
    assert.match(ok('test', library), /adds_two_integers/);
    writeFileSync(join(library, 'src/arithmetic.aug'), '/** Add two integers. @param left First integer. @param right Second integer. @return The sum. */\nadd(int left, int right) returns int { return left + right }\n_private() returns int { return 99 }\n');
    const transport = JSON.parse(readFileSync(join(library, 'package.json')));
    transport.scripts = { install: 'node -e "require(\'fs\').writeFileSync(\'INSTALL_RAN\',\'bad\')"' };
    setJson(join(library, 'package.json'), transport);
    const archive = ok('package', 'pack', library).trim(); assert.ok(existsSync(archive));
    assert.ok(!existsSync(join(library, 'INSTALL_RAN')));
    mkdirSync(app);
    writeFileSync(join(app, 'main.yaml'), `packages:\n  math: "${archive}"\n`);
    const main = 'import add from math\nprint(value=add(left=2, right=3))\n';
    writeFileSync(join(app, 'main.aug'), main);
    assert.match(run('check', app).stderr, /aug install/);
    ok('install', app, '--offline');
    ok('install', app, '--frozen', '--offline');
    assert.equal(ok('run', app), '5\n');
    assert.ok(!existsSync(join(app, '.aug-packages/node_modules/math/INSTALL_RAN')));
    const project = loadProject(app), issues = checkProject(project).diagnostics.filter(issue => issue.severity !== 'warning');
    assert.deepEqual(issues, []);
    const current=readFileSync(join(app,'main.aug'),'utf8');
    const target = definitionAt(project, join(app, 'main.aug'), current.indexOf('from') + 1);
    assert.ok(target.file.endsWith('/src/export.aug'));
    const hover = new SemanticWorkspace(app).document(join(app, 'main.aug')).hover(current.indexOf('add from'));
    assert.match(hover.documentation, /Add two integers/);
    const workspace = new SemanticWorkspace(app), unfinished = main + 'import ';
    const suggestions = workspace.document(join(app, 'main.aug'), { text: unfinished, version: 1 }).complete(unfinished.length);
    assert.ok(suggestions.some(item => item.detail === 'import add from math'), JSON.stringify(suggestions));
    assert.ok(!suggestions.some(item => item.detail.includes('.aug-packages')), JSON.stringify(suggestions));
    writeFileSync(join(app, 'main.yaml'), `packages:\n  math: "${archive}"\nmodule_dependencies:\n  - ".: math"\n`);
    ok('check', app);
    writeFileSync(join(app, 'main.yaml'), `packages:\n  math: "${archive}"\nmodule_dependencies:\n  - ".: other"\n`);
    assert.match(run('check', app).stderr, /may not depend on math/);
    writeFileSync(join(app, 'main.yaml'), `packages:\n  math: "${archive}"\n`);
    writeFileSync(join(app, 'main.aug'), 'import _private from math\n');
    assert.match(run('check', app).stderr, /private/);
    writeFileSync(join(app, 'main.aug'), main);
    writeFileSync(join(project.packages.roots.get('math').sourceRoot, 'arithmetic.aug'), 'add(int left, int right) returns int { return 0 }\n');
    assert.match(run('check', app).stderr, /changed/);
    ok('install', app, '--frozen', '--offline');
    assert.equal(ok('run', app), '5\n');
    writeFileSync(join(app, 'math.aug'), 'value() returns int { return 0 }\n');
    assert.match(run('check', app).stderr, /conflicts with a local module/);
  } finally { rmSync(base, { recursive: true, force: true }); }
});

test('local libraries support transitive aliases, frozen content checks, and compiler compatibility', () => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'aug-package-')));
  try {
    const core = join(base, 'core'), facade = join(base, 'facade'), app = join(base, 'app');
    ok('package', 'init', core, '--name', 'aug-core');
    ok('package', 'init', facade, '--name', 'aug-facade');
    const manifest = JSON.parse(readFileSync(join(facade, 'aug-package.json')));
    manifest.dependencies = { core: 'file:../core' }; setJson(join(facade, 'aug-package.json'), manifest);
    writeFileSync(join(facade, 'src/arithmetic.aug'), 'import add from core\ntriple(int value) returns int { return add(left=value, right=add(left=value, right=value)) }\n');
    writeFileSync(join(facade, 'src/export.aug'), 'export triple from arithmetic\n');
    ok('install', facade, '--offline'); ok('check', facade); ok('package', 'pack', facade);
    mkdirSync(app); writeFileSync(join(app, 'main.yaml'), 'packages:\n  math: "../facade"\n');
    writeFileSync(join(app, 'main.aug'), 'import triple from math\nprint(value=triple(value=7))\n');
    ok('install', app, '--offline'); assert.equal(ok('run', app), '21\n');
    writeFileSync(join(app, 'main.aug'), 'import add from core\n');
    assert.match(run('check', app).stderr, /does not exist/);
    writeFileSync(join(core, 'src/arithmetic.aug'), 'add(int left, int right) returns int { return left + right + 1 }\n');
    assert.notEqual(run('install', app, '--frozen', '--offline').status, 0);
    const incompatible = JSON.parse(readFileSync(join(core, 'aug-package.json')));
    incompatible.compiler = '0.0.0'; setJson(join(core, 'aug-package.json'), incompatible);
    assert.match(run('package', 'pack', core).stderr, /compiler mismatch/);
  } finally { rmSync(base, { recursive: true, force: true }); }
});

test('exact npm aliases use the registry transport and frozen offline installs reuse integrity-checked archives', async () => {
  const base = realpathSync(mkdtempSync(join(tmpdir(), 'aug-registry-')));
  let registry;
  try {
    const library = join(base, 'math'), app = join(base, 'app'), name = '@august-registry-test/aug-math';
    ok('package', 'init', library, '--name', name);
    const archive = readFileSync(ok('package', 'pack', library).trim());
    const transport = JSON.parse(readFileSync(join(library, 'package.json')));
    let port, fetched = 0;
    registry = createServer((request, response) => {
      fetched++;
      const path = decodeURIComponent(request.url.split('?')[0]);
      if (path === '/archive.tgz') { response.writeHead(200, { 'content-type': 'application/octet-stream' }); response.end(archive); }
      else if (path === '/' + name) {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ name, 'dist-tags': { latest: '0.1.0' }, versions: { '0.1.0': { ...transport,
          dist: { tarball: `http://127.0.0.1:${port}/archive.tgz`, shasum: createHash('sha1').update(archive).digest('hex'),
            integrity: 'sha512-' + createHash('sha512').update(archive).digest('base64') } } } }));
      } else { response.writeHead(404); response.end('{}'); }
    });
    await new Promise(resolve => registry.listen(0, '127.0.0.1', resolve)); port = registry.address().port;
    mkdirSync(app); writeFileSync(join(app, 'main.yaml'), `packages:\n  math: "npm:${name}@0.1.0"\n`);
    writeFileSync(join(app, 'main.aug'), 'import add from math\nprint(value=add(left=2, right=3))\n');
    const userConfig = join(base, 'npmrc'); writeFileSync(userConfig, '');
    const install = (...args) => new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [cli, 'install', app, ...args], { env: { ...process.env,
        npm_config_registry: `http://127.0.0.1:${port}`, npm_config_userconfig: userConfig, npm_config_cache: join(base, 'cache') },
        stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '', stderr = ''; child.stdout.on('data', chunk => { stdout += chunk; }); child.stderr.on('data', chunk => { stderr += chunk; });
      child.once('error', reject); child.once('close', code => code === 0 ? resolve(stdout) : reject(new Error(stderr + stdout)));
    });
    await install(); assert.ok(fetched >= 2);
    const before = fetched; await install('--frozen', '--offline'); assert.equal(fetched, before);
    assert.equal(ok('run', app), '5\n'); assert.equal(fetched, before);
    const lock = JSON.parse(readFileSync(join(app, 'aug.lock.json')));
    assert.equal(lock.packages[0].name, name); assert.equal(lock.packages[0].version, '0.1.0');
    assert.ok(JSON.stringify(lock.npm).includes('sha512-'));
    writeFileSync(join(app, 'main.yaml'), `packages:\n  math: "npm:${name}@^0.1.0"\n`);
    await assert.rejects(install(), /exact registry version/);
  } finally {
    if (registry) await new Promise(resolve => registry.close(resolve));
    rmSync(base, { recursive: true, force: true });
  }
});
