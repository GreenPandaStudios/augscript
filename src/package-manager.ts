import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { x as extractArchive } from 'tar';
import type { Diagnostic } from './ast.ts';
import { loadConfig } from './config.ts';
import { parse } from './parser.ts';
import { isGitSource, materializeGit, sourceAlias, type GitSource } from './git-packages.ts';
import { agentInstructions } from './project-init.ts';
import { withPackageLock } from './package-locking.ts';
import {withSourceWriter} from './source-transaction.ts';

export interface PackageManifest {
  format: 1; name: string; version: string; compiler: string; source: string;
  dependencies?: Record<string, string>;
}
export interface InstalledPackage {
  path: string; name: string; version: string; source: string; digest: string;
  dependencies: Record<string, string>;
}
export interface PackageLock {
  format: 1; compiler: string; specifications: Record<string, string>;
  roots: Record<string, string>; packages: InstalledPackage[]; npm: unknown;
  git?: GitSource[];
}
export interface PackageScope extends InstalledPackage { directory: string; sourceRoot: string; specifications: Record<string, string> }
export interface ProjectPackages {
  roots: Map<string, PackageScope>; scopes: Map<string, PackageScope>; diagnostics: Diagnostic[];
  specifications: Record<string, string>;
}

export const compilerVersion = (): string => JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
export const packageAlias = (name: string): boolean => /^[a-z][a-z0-9_]*$/.test(name) && name !== 'august';

/** Repository imports declare their dependencies beside the code that uses them. */
export function packageSpecifications(sourceRoot: string, declared: Record<string, string>, overrides = new Map<string, string>()): Record<string, string> {
  const specifications = { ...declared };
  for (const path of sourcePaths(sourceRoot)) {
    const file = parse(path, overrides.get(path) ?? readFileSync(path, 'utf8')).file;
    for (const item of file.items) if (item.kind === 'import' && isGitSource(item.from[0])) specifications[sourceAlias(item.from[0])] = item.from[0];
  }
  return ordered(specifications);
}
const version = /^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/;
const npmName = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/;
const json = (file: string): any => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file: string, data: unknown): void => writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
const inside = (root: string, file: string): boolean => file === root || file.startsWith(root + sep);
const ordered = (values: Record<string, string>): Record<string, string> => Object.fromEntries(Object.entries(values).sort(([a], [b]) => a.localeCompare(b)));
const sameSpecifications = (left: Record<string, string>, right: Record<string, string>): boolean =>
  JSON.stringify(ordered(left)) === JSON.stringify(ordered(right));

function verifyReference(spec: string, target: InstalledPackage): void {
  if (spec.startsWith('npm:') && spec !== `npm:${target.name}@${target.version}`)
    throw new Error(`Package lock resolves ${spec} to incompatible ${target.name}@${target.version}`);
}

function verifyIdentities(packages: Iterable<InstalledPackage>): void {
  const entries = [...packages], paths = new Map(entries.map(entry => [entry.path, entry]));
  const identities = new Map<string, string>();
  for (const entry of entries) {
    const dependencies = Object.entries(entry.dependencies).sort(([a], [b]) => a.localeCompare(b)).map(([alias, path]) => {
      const target = paths.get(path);
      if (!target) throw new Error('Package lock is missing a transitive dependency');
      return [alias, `${target.name}@${target.version}`, target.digest];
    });
    const key = `${entry.name}@${entry.version}`, fingerprint = JSON.stringify([entry.digest, dependencies]);
    if (identities.has(key) && identities.get(key) !== fingerprint)
      throw new Error(`Conflicting contents or dependencies for ${key}; publish a new version for changed source`);
    identities.set(key, fingerprint);
  }
}

export function sourcePaths(root: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.') || ['node_modules', 'dist'].includes(entry.name)) continue;
    const file = join(root, entry.name);
    if (entry.isSymbolicLink()) {
      if (entry.name.endsWith('.aug')) throw new Error(`Package source cannot contain a symbolic link: ${file}`);
      continue;
    }
    if (entry.isDirectory()) result.push(...sourcePaths(file));
    else if (entry.isFile() && entry.name.endsWith('.aug')) result.push(file);
  }
  return result;
}

export function readPackage(directory: string): { manifest: PackageManifest; sourceRoot: string } {
  const manifest = existsSync(join(directory, 'aug-package.json')) ? json(join(directory, 'aug-package.json')) as PackageManifest : {
    format: 1 as const, name: 'aug-' + sourceAlias(realpathSync(directory)), version: '0.0.0', compiler: compilerVersion(),
    source: existsSync(join(directory, 'export.aug')) ? '.' : 'src', dependencies: {}
  };
  if (manifest.format !== 1 || !npmName.test(manifest.name ?? '') || !version.test(manifest.version ?? '') ||
      manifest.compiler !== compilerVersion())
    throw new Error(`Invalid August package or compiler mismatch in ${directory}; expected compiler ${compilerVersion()}`);
  if (typeof manifest.source !== 'string' || !manifest.source || isAbsolute(manifest.source)) throw new Error('Package source must be a relative folder');
  const sourceRoot = realpathSync(resolve(directory, manifest.source));
  if (!inside(realpathSync(directory), sourceRoot)) throw new Error('Package source cannot escape its package directory');
  if (!existsSync(join(sourceRoot, 'export.aug'))) throw new Error(`${manifest.name} requires export.aug in its source folder`);
  for (const [alias, spec] of Object.entries(manifest.dependencies ?? {})) {
    if (!packageAlias(alias) || typeof spec !== 'string') throw new Error(`Invalid package dependency ${alias}`);
    normalizeSpecifier(spec, directory, false);
  }
  const published = existsSync(join(directory, 'package.json')) ? json(join(directory, 'package.json')) : undefined;
  if (published && (published.name !== manifest.name || published.version !== manifest.version)) throw new Error('package.json and aug-package.json names/versions must match');
  const configuration = loadConfig(directory);
  if (configuration.diagnostics.length) throw new Error(`Invalid package configuration in ${directory}: ${configuration.diagnostics.map(issue=>issue.message).join('; ')}`);
  manifest.dependencies = { ...configuration.config.packages, ...manifest.dependencies };
  const declared = manifest.dependencies ?? {};
  for (const alias of Object.keys(declared)) assertAlias(sourceRoot, alias);
  return { manifest, sourceRoot };
}

function assertAlias(root: string, alias: string): void {
  if (!packageAlias(alias)) throw new Error(`Package alias ${alias} must be lowercase and cannot be august or private`);
  if (existsSync(join(root, alias)) || existsSync(join(root, alias + '.aug'))) throw new Error(`Package alias ${alias} conflicts with a local module`);
}

function normalizeSpecifier(spec: string, root: string, requirePath = true): string {
  if (isGitSource(spec)) return spec;
  if (spec.startsWith('npm:')) {
    const match = /^npm:((?:@[^/]+\/)?[^@]+)@(.+)$/.exec(spec);
    if (!match || !npmName.test(match[1]) || !version.test(match[2])) throw new Error(`Use an exact registry version: npm:@owner/package@1.2.3 (${spec})`);
    return spec;
  }
  const path = spec.startsWith('file:') ? spec.slice(5) : spec;
  if (!path.startsWith('.') && !isAbsolute(path)) throw new Error(`Use a local path or npm:name@version: ${spec}`);
  const absolute = resolve(root, path);
  if (!requirePath) return 'file:' + absolute;
  if (!existsSync(absolute)) throw new Error(`Package path does not exist: ${path}`);
  if (!lstatSync(absolute).isDirectory() && !absolute.endsWith('.tgz')) throw new Error('Local packages must be folders or .tgz archives');
  return 'file:' + realpathSync(absolute);
}

function packageDigest(directory: string, sourceRoot: string): string {
  const hash = createHash('sha256');
  for (const file of [join(directory, 'aug-package.json'), join(directory, 'package.json'), ...sourcePaths(sourceRoot)].filter(existsSync).sort()) {
    hash.update(relative(directory, file).replaceAll('\\', '/')); hash.update('\0');
    hash.update(readFileSync(file)); hash.update('\0');
  }
  return hash.digest('hex');
}

/** Compilation reads only a verified installed snapshot. It never fetches dependencies. */
export function projectPackages(root: string, specifications: Record<string, string>, sourceFolder = root): ProjectPackages {
  const result: ProjectPackages = { roots: new Map(), scopes: new Map(), diagnostics: [], specifications };
  if (!Object.keys(specifications).length) return result;
  try {
    const lock = json(join(root, 'aug.lock.json')) as PackageLock;
    if (lock.format !== 1 || lock.compiler !== compilerVersion() || !sameSpecifications(lock.specifications, specifications))
      throw new Error('Package lock does not match this project/compiler; run aug install');
    const cache = realpathSync(join(root, '.aug-packages'));
    const manifests = new Map<string, PackageManifest>();
    for (const entry of lock.packages) {
      if (isAbsolute(entry.path)) throw new Error('Invalid absolute package lock path');
      const directory = realpathSync(resolve(cache, entry.path));
      if (!inside(cache, directory)) throw new Error('Package lock path escapes the installed snapshot');
      const { manifest, sourceRoot } = readPackage(directory);
      if (manifest.name !== entry.name || manifest.version !== entry.version || manifest.source !== entry.source ||
          packageDigest(directory, sourceRoot) !== entry.digest) throw new Error(`Installed ${entry.name} changed; run aug install`);
      if (result.scopes.has(entry.path)) throw new Error('Duplicate package lock path');
      manifests.set(entry.path, manifest);
      result.scopes.set(entry.path, { ...entry, directory, sourceRoot, specifications: manifest.dependencies ?? {} });
    }
    verifyIdentities(lock.packages);
    for (const scope of result.scopes.values()) {
      const declared = manifests.get(scope.path)!.dependencies ?? {};
      if (!sameSpecifications(Object.fromEntries(Object.keys(declared).map(alias => [alias, ''])),
        Object.fromEntries(Object.keys(scope.dependencies).map(alias => [alias, ''])))) throw new Error('Package lock dependency aliases changed');
      for (const [alias, path] of Object.entries(scope.dependencies)) verifyReference(declared[alias], result.scopes.get(path)!);
    }
    // One package identity has one set of declarations, even when npm installs duplicate copies.
    const canonical = new Map<string, PackageScope>();
    for (const [path, scope] of result.scopes) {
      const identity = `${scope.name}@${scope.version}`;
      if (canonical.has(identity)) result.scopes.set(path, canonical.get(identity)!);
      else canonical.set(identity, scope);
    }
    for (const [alias, path] of Object.entries(lock.roots)) {
      assertAlias(sourceFolder, alias);
      if (!(alias in specifications)) throw new Error('Package lock contains an undeclared root dependency');
      const scope = result.scopes.get(path);
      if (!scope) throw new Error(`Missing package ${alias}`);
      verifyReference(specifications[alias], scope);
      result.roots.set(alias, scope);
    }
    if (Object.keys(specifications).some(alias => !result.roots.has(alias))) throw new Error('Package lock is missing a requested dependency');
    for (const scope of result.scopes.values()) for (const path of Object.values(scope.dependencies))
      if (!result.scopes.has(path)) throw new Error('Package lock is missing a transitive dependency');
  } catch (error) {
    result.roots.clear(); result.scopes.clear();
    result.diagnostics.push({ file: join(root, 'main.yaml'), line: 1, column: 1, code: 'PACKAGE',
      message: `${(error as Error).message}. Install dependencies with aug install ${root}` });
  }
  return result;
}

function npm(args: string[], cwd: string): string {
  const process = spawnSync('npm', args, { cwd, encoding: 'utf8', timeout: 120000 });
  if (process.error) throw new Error(`Cannot install August packages: ${'code' in process.error && process.error.code === 'ENOENT' ? 'npm is missing from PATH. Install Node.js 24 or newer, which includes npm.' : process.error.message}\nRetry aug run after fixing the package installer.`);
  if (process.status !== 0) throw new Error(`August package installation failed.\n${(process.stderr || process.stdout || `npm exited ${process.status}`).trim()}\nCheck the package versions and paths in main.yaml, your network connection, and npm registry configuration. Retry aug run; use aug install for an explicit installation.`);
  return process.stdout;
}

/** Running an application prepares its declared packages; checking remains read-only. */
export function prepareRunPackages(root: string, offline = false): void {
  const loaded = loadConfig(root);
  if (loaded.diagnostics.length) return; // The checker renders the configuration's source diagnostics.
  const library = isLibrary(root) ? readPackage(root) : undefined;
  const specifications = packageSpecifications(library?.sourceRoot ?? root, library?.manifest.dependencies ?? loaded.config.packages);
  if (!Object.keys(specifications).length) return;
  const lockPath = join(root, 'aug.lock.json');
  let lock: PackageLock | undefined;
  if (existsSync(lockPath)) {
    try { lock = json(lockPath); }
    catch { throw new Error('aug.lock.json is unreadable. Restore it from version control or run aug install to recreate it.'); }
    if (lock?.format !== 1 || !Array.isArray(lock.packages) || !lock.specifications || typeof lock.specifications !== 'object')
      throw new Error('aug.lock.json has an unsupported structure. Run aug install to recreate it.');
  }
  const matching = lock?.compiler === compilerVersion() && sameSpecifications(lock.specifications, specifications);
  if (!matching) {
    process.stderr.write('Installing August packages declared by imports and main.yaml…\n');
    installPackages(root, false, offline); return;
  }
  const snapshot = resolve(root, '.aug-packages');
  const missing = lock!.packages.some(entry => {
    if (typeof entry.path !== 'string' || isAbsolute(entry.path) || !inside(snapshot, resolve(snapshot, entry.path)))
      throw new Error('Package lock contains a path outside its snapshot. Run aug install to recreate it.');
    return !existsSync(resolve(snapshot, entry.path));
  });
  if (missing) {
    process.stderr.write('Restoring August packages from aug.lock.json…\n');
    installPackages(root, true, offline);
  }
  // projectPackages checks contents and integrity before compilation. Changed installed sources are never silently replaced.
}

export function installPackages(root: string, frozen = false, offline = false, update = false): PackageLock {
  return withPackageLock(join(root, '.aug-install.lock'), () => withSourceWriter(root,()=>installLocked(root, frozen, offline, update)));
}
function installLocked(root: string, frozen: boolean, offline: boolean, update: boolean): PackageLock {
  if (frozen && update) throw new Error('--frozen and --update cannot be used together.');
  const loaded = loadConfig(root);
  if (loaded.diagnostics.length) throw new Error(loaded.diagnostics.map(issue => issue.message).join('\n'));
  const library = isLibrary(root) ? readPackage(root) : undefined;
  const specifications = packageSpecifications(library?.sourceRoot ?? root, library?.manifest.dependencies ?? loaded.config.packages);
  for (const alias of Object.keys(specifications)) assertAlias(library?.sourceRoot ?? root, alias);
  const lockPath = join(root, 'aug.lock.json');
  const previous: PackageLock | undefined = existsSync(lockPath) ? json(lockPath) : undefined;
  const same = !update && previous?.compiler === compilerVersion() && sameSpecifications(previous.specifications, specifications);
  if (frozen && !same) throw new Error('Frozen installation requires a matching aug.lock.json');
  return installSourceGraph(root, specifications, frozen, offline, same ? previous : undefined);
}

const isLibrary = (root: string): boolean => existsSync(join(root, 'aug-package.json')) ||
  !existsSync(join(root, 'main.aug')) && (existsSync(join(root, 'export.aug')) || existsSync(join(root, 'src/export.aug')));
const selectedSource = (file: string): boolean => file.endsWith('.aug') || ['aug-package.json', 'package.json', 'main.yaml', 'README.md', 'LICENSE'].includes(file);
function copySource(origin: string, destination: string): void {
  let bytes = 0, count = 0;
  const copy = (folder: string) => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || ['node_modules', 'dist'].includes(entry.name)) continue;
      const file = join(folder, entry.name), name = relative(origin, file);
      if (entry.isDirectory()) copy(file);
      else if (selectedSource(name)) {
        if (!entry.isFile()) throw new Error('Package source must contain regular files: ' + name);
        const data = readFileSync(file); bytes += data.length;
        if (++count > 10000 || bytes > 32 * 1024 * 1024) throw new Error('Source package exceeds 10,000 files or 32 MiB.');
        mkdirSync(dirname(join(destination, name)), { recursive: true }); writeFileSync(join(destination, name), data);
      }
    }
  };
  copy(origin);
}
function unpackSource(archive: string, destination: string): void {
  let bytes = 0, count = 0;
  const paths = new Set<string>();
  extractArchive({ file: archive, cwd: destination, strip: 1, sync: true, strict: true, filter: (path, entry) => {
    if (!('type' in entry)) throw new Error('Expected an archive entry.');
    const parts = path.split('/');
    if (isAbsolute(path) || path.includes('\\') || parts.some(part => part === '..')) throw new Error('Package archive contains a path outside its folder.');
    const name = parts.slice(1).join('/');
    if (entry.type === 'Directory') return false;
    if (!selectedSource(name)) return false;
    if (entry.type !== 'File' || !name || parts[0] !== 'package' || parts.slice(1).some(part => !part || part.startsWith('.')))
      throw new Error('Package archive source must be regular files inside package/.');
    if (paths.has(name)) throw new Error('Package archive repeats a source file: ' + name);
    paths.add(name); bytes += entry.size;
    if (++count > 10000 || bytes > 32 * 1024 * 1024) throw new Error('Source package exceeds 10,000 files or 32 MiB.');
    return true;
  } });
}

/** Git libraries use the same checked source graph as registry libraries. No remote program is executed. */
function installSourceGraph(root: string, specifications: Record<string, string>, frozen: boolean, offline: boolean, previous?: PackageLock): PackageLock {
  const stage = realpathSync(mkdtempSync(join(root, '.aug-install-')));
  const packages = new Map<string, InstalledPackage>(), visited = new Map<string, string>();
  const gitSources = new Map<string, GitSource>();
  const registry: Record<string, unknown> = {};
  const locked = new Map((previous?.git ?? []).map(source => [source.request, source]));
  const visit = (spec: string, owner: string): string => {
    const normalized = normalizeSpecifier(spec, owner);
    if (visited.has(normalized)) return visited.get(normalized)!;
    if (visited.size >= 1000) throw new Error('Package graph exceeds 1,000 source packages.');
    const identity = normalized.startsWith('file:') ? 'file:' + relative(root, normalized.slice(5)).replaceAll('\\', '/') : normalized;
    const path = 'packages/' + sourceAlias(identity), directory = join(stage, path);
    visited.set(normalized, path); mkdirSync(directory, { recursive: true });
    let origin = directory;
    let source: GitSource | undefined;
    if (isGitSource(normalized)) {
      source = materializeGit(normalized, directory, offline, locked.get(normalized));
      gitSources.set(normalized, source);
    } else if (normalized.startsWith('file:') && lstatSync(normalized.slice(5)).isDirectory()) {
      origin = normalized.slice(5);
      copySource(origin, directory);
    } else {
      const transport = join(stage, 'transport', sourceAlias(normalized)); mkdirSync(transport, { recursive: true });
      const request = normalized.startsWith('npm:') ? normalized.slice(4) : normalized.slice(5);
      const packed = JSON.parse(npm(['pack', request, '--ignore-scripts', '--json', '--pack-destination', transport,
        ...(offline ? ['--offline'] : [])], transport))[0];
      if (!packed?.filename || !/^sha512-[A-Za-z0-9+/=]+$/.test(packed.integrity ?? '')) throw new Error('Package archive is missing its SHA-512 integrity.');
      registry[normalized] = { integrity: packed.integrity, name: packed.name, version: packed.version };
      const archive = join(transport, basename(packed.filename));
      const actual = 'sha512-' + createHash('sha512').update(readFileSync(archive)).digest('base64');
      if (actual !== packed.integrity) throw new Error('Package archive integrity mismatch.');
      if (frozen && JSON.stringify((previous?.npm as Record<string, unknown>)?.[normalized]) !== JSON.stringify(registry[normalized]))
        throw new Error('Frozen package archive changed. Publish a new version instead of replacing an archive.');
      unpackSource(archive, directory);
    }
    if (!existsSync(join(directory, 'aug-package.json'))) {
      const folder = existsSync(join(directory, 'export.aug')) ? '.' : 'src';
      const published = existsSync(join(directory, 'package.json')) ? json(join(directory, 'package.json')) : undefined;
      writeJson(join(directory, 'aug-package.json'), { format: 1,
        name: published?.name ?? '@git/' + sourceAlias(source ? source.repository + '/' + source.folder : identity),
        version: published?.version ?? (source ? '0.0.0-git.' + source.commit : '0.0.0'),
        compiler: compilerVersion(), source: folder, dependencies: published?.dependencies ?? {} });
    }
    const manifest = json(join(directory, 'aug-package.json')) as PackageManifest;
    // A Git folder owns its August manifest. npm metadata and lifecycle scripts have no role here.
    const dependencies = packageSpecifications(resolve(directory, manifest.source), { ...loadConfig(directory).config.packages, ...manifest.dependencies });
    manifest.dependencies = dependencies; writeJson(join(directory, 'aug-package.json'), manifest);
    writeJson(join(directory, 'package.json'), { name: manifest.name, version: manifest.version, private: true, dependencies });
    const { sourceRoot } = readPackage(directory);
    const entry: InstalledPackage = { path, name: manifest.name, version: manifest.version, source: manifest.source,
      digest: packageDigest(directory, sourceRoot), dependencies: {} };
    packages.set(path, entry);
    for (const [alias, request] of Object.entries(dependencies)) {
      entry.dependencies[alias] = visit(request, origin);
      verifyReference(request, packages.get(entry.dependencies[alias])!);
    }
    return path;
  };
  try {
    const roots = Object.fromEntries(Object.entries(specifications).map(([alias, request]) => [alias, visit(request, root)]));
    verifyIdentities(packages.values());
    const lock: PackageLock = { format: 1, compiler: compilerVersion(), specifications, roots, npm: registry,
      git: [...gitSources.values()].sort((a, b) => a.request.localeCompare(b.request)),
      packages: [...packages.values()].sort((a, b) => a.path.localeCompare(b.path)) };
    if (frozen && JSON.stringify(lock.packages) !== JSON.stringify(previous?.packages))
      throw new Error('Frozen package contents changed; use aug install --update to choose new revisions.');
    rmSync(join(stage, 'transport'), { recursive: true, force: true });
    const cache = join(root, '.aug-packages'), backup = join(root, '.aug-packages-old');
    if (existsSync(backup)) throw new Error('Previous package install backup exists; inspect .aug-packages-old before installing.');
    if (existsSync(cache)) renameSync(cache, backup);
    try { renameSync(stage, cache); writeJson(join(root, 'aug.lock.json.tmp'), lock); renameSync(join(root, 'aug.lock.json.tmp'), join(root, 'aug.lock.json')); }
    catch (error) { rmSync(cache, { recursive: true, force: true }); if (existsSync(backup)) renameSync(backup, cache); throw error; }
    rmSync(backup, { recursive: true, force: true });
    return lock;
  } finally { rmSync(stage, { recursive: true, force: true }); }
}

export function initPackage(directory: string, name: string, npmMetadata = false): void {
  if (!npmName.test(name)) throw new Error('Package name must be an npm name, for example @owner/aug-math');
  if (existsSync(directory) && readdirSync(directory).length) throw new Error('Package init requires a new or empty directory');
  mkdirSync(join(directory, 'src'), { recursive: true });
  writeFileSync(join(directory, 'AGENTS.md'), agentInstructions);
  const manifest: PackageManifest = { format: 1, name, version: '0.1.0', compiler: compilerVersion(), source: 'src', dependencies: {} };
  writeJson(join(directory, 'aug-package.json'), manifest);
  if (npmMetadata) writeJson(join(directory, 'package.json'), { name, version: manifest.version, description: 'An August source library',
    files: ['src', '.aug-spec', 'aug-package.json', 'README.md', 'LICENSE'], exports: { './aug-package.json': './aug-package.json' }, dependencies: {} });
  writeFileSync(join(directory, 'src/export.aug'), 'export add from arithmetic\n');
  writeFileSync(join(directory, 'src/arithmetic.aug'), '/** Add two integers. @param left First value. @param right Second value. @return Their sum. */\nadd(int left, int right) returns int {\n    return left + right\n}\n\ntest add {\n    when addition {\n        it adds_two_integers {\n            assert(add(left=2, right=3) == 5)\n        }\n    }\n}\n');
  writeFileSync(join(directory, 'README.md'), `# ${name}\n\nAugust ${compilerVersion()} source library. Public exports live in src/export.aug.\n`);
  writeFileSync(join(directory, '.gitignore'), '.aug-build/\n.aug-changes/\n.aug-packages/\n.aug-install-*/\nnode_modules/\n*.tgz\n');
}

/** Synchronize transport metadata; August's manifest owns dependency aliases. */
export function preparePackage(root: string): void {
  const manifest = json(join(root, 'aug-package.json')) as PackageManifest;
  const transport = existsSync(join(root, 'package.json')) ? json(join(root, 'package.json')) : {};
  transport.name = manifest.name; transport.version = manifest.version;
  transport.dependencies = manifest.dependencies ?? {};
  transport.files = [...new Set([...(Array.isArray(transport.files)?transport.files:['README.md','LICENSE']),manifest.source,'.aug-spec','aug-package.json'])];
  writeJson(join(root, 'package.json'), transport);
  readPackage(root);
}

export function packPackage(root: string): string {
  const destination = join(root, '.aug-build/packages'); mkdirSync(destination, { recursive: true });
  const result = JSON.parse(npm(['pack', '--ignore-scripts', '--json', '--pack-destination', destination], root))[0];
  if (!result?.filename) throw new Error('npm pack returned no archive');
  return join(destination, basename(result.filename));
}

/** Give a source package a short import name and install its verified dependency graph. */
export function addPackage(root: string, request: string, alias: string, offline = false): PackageLock {
  const loaded = loadConfig(root);
  if (loaded.diagnostics.length) throw new Error(loaded.diagnostics.map(issue => issue.message).join('\n'));
  assertAlias(isLibrary(root) ? readPackage(root).sourceRoot : root, alias); normalizeSpecifier(request, root);
  const path = join(root, 'main.yaml'), existed = existsSync(path), before = existed ? readFileSync(path, 'utf8') : '';
  const dependencies = { ...loaded.config.packages, [alias]: request };
  const block = 'packages:\n' + Object.entries(ordered(dependencies)).map(([name, value]) => '  ' + name + ': ' + JSON.stringify(value)).join('\n') + '\n';
  const expression = /^packages:[^\n]*(?:\n|$)(?:[ \t][^\n]*(?:\n|$)|\n)*/m;
  const after = expression.test(before) ? before.replace(expression, block) : before.trimEnd() + (before.trim() ? '\n\n' : '') + block;
  withSourceWriter(root,()=>{if((existsSync(path)?readFileSync(path,'utf8'):'')!==before)throw new Error('Configuration changed before adding this package. Retry.');writeFileSync(path, after);});
  try { return installPackages(root, false, offline); }
  catch (error) { withSourceWriter(root,()=>{if(readFileSync(path,'utf8')!==after)throw new Error('Configuration changed after adding the package; its external edit was preserved.');if(existed)writeFileSync(path,before);else rmSync(path,{force:true});});throw error; }
}
