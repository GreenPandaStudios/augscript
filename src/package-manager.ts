import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { Diagnostic } from './ast.ts';
import { loadConfig } from './config.ts';

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
}
export interface PackageScope extends InstalledPackage { directory: string; sourceRoot: string }
export interface ProjectPackages {
  roots: Map<string, PackageScope>; scopes: Map<string, PackageScope>; diagnostics: Diagnostic[];
}

export const compilerVersion = (): string => JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
export const packageAlias = (name: string): boolean => /^[a-z][a-z0-9_]*$/.test(name) && name !== 'august';
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
    if (entry.isSymbolicLink()) throw new Error(`Package source cannot contain a symlink: ${file}`);
    if (entry.isDirectory()) result.push(...sourcePaths(file));
    else if (entry.isFile() && entry.name.endsWith('.aug')) result.push(file);
  }
  return result;
}

export function readPackage(directory: string): { manifest: PackageManifest; sourceRoot: string } {
  const manifest = json(join(directory, 'aug-package.json')) as PackageManifest;
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
  const published = json(join(directory, 'package.json'));
  if (published.name !== manifest.name || published.version !== manifest.version) throw new Error('package.json and aug-package.json names/versions must match');
  const declared = manifest.dependencies ?? {}, actual = published.dependencies ?? {};
  if (Object.keys(actual).length !== Object.keys(declared).length || Object.entries(declared).some(([alias, spec]) => actual[alias] !== spec))
    throw new Error('package.json dependencies must match the August dependency aliases; aug package pack synchronizes them');
  for (const alias of Object.keys(declared)) assertAlias(sourceRoot, alias);
  return { manifest, sourceRoot };
}

function assertAlias(root: string, alias: string): void {
  if (!packageAlias(alias)) throw new Error(`Package alias ${alias} must be lowercase and cannot be august or private`);
  if (existsSync(join(root, alias)) || existsSync(join(root, alias + '.aug'))) throw new Error(`Package alias ${alias} conflicts with a local module`);
}

function normalizeSpecifier(spec: string, root: string, requirePath = true): string {
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
  for (const file of [join(directory, 'aug-package.json'), join(directory, 'package.json'), ...sourcePaths(sourceRoot)].sort()) {
    hash.update(relative(directory, file).replaceAll('\\', '/')); hash.update('\0');
    hash.update(readFileSync(file)); hash.update('\0');
  }
  return hash.digest('hex');
}

/** Compilation reads only a verified installed snapshot. It never fetches dependencies. */
export function projectPackages(root: string, specifications: Record<string, string>, sourceFolder = root): ProjectPackages {
  const result: ProjectPackages = { roots: new Map(), scopes: new Map(), diagnostics: [] };
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
      result.scopes.set(entry.path, { ...entry, directory, sourceRoot });
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
  if (process.error || process.status !== 0) throw new Error(process.error?.message ?? process.stderr ?? 'npm failed');
  return process.stdout;
}

export function installPackages(root: string, frozen = false, offline = false): PackageLock {
  const loaded = loadConfig(root);
  if (loaded.diagnostics.length) throw new Error(loaded.diagnostics.map(issue => issue.message).join('\n'));
  const library = existsSync(join(root, 'aug-package.json')) ? json(join(root, 'aug-package.json')) as PackageManifest : undefined;
  if (library) preparePackage(root);
  const specifications = ordered(library?.dependencies ?? loaded.config.packages);
  for (const alias of Object.keys(specifications)) assertAlias(library ? resolve(root, library.source) : root, alias);
  const lockPath = join(root, 'aug.lock.json');
  const previous: PackageLock | undefined = existsSync(lockPath) ? json(lockPath) : undefined;
  const same = previous?.compiler === compilerVersion() && sameSpecifications(previous.specifications, specifications);
  if (frozen && !same) throw new Error('Frozen installation requires a matching aug.lock.json');
  const stage = realpathSync(mkdtempSync(join(root, '.aug-install-')));
  try {
    const dependencies = Object.fromEntries(Object.entries(specifications).map(([alias, spec]) => {
      const normalized = normalizeSpecifier(spec, root);
      return [alias, normalized.startsWith('file:') ? 'file:' + relative(stage, normalized.slice(5)).replaceAll('\\', '/') : normalized];
    }));
    writeJson(join(stage, 'package.json'), { name: 'august-project-dependencies', version: '0.0.0', private: true, dependencies });
    if (same && previous?.npm) writeJson(join(stage, 'package-lock.json'), previous.npm);
    npm([frozen ? 'ci' : 'install', '--ignore-scripts', '--install-links', '--bin-links=false', '--no-audit', '--no-fund',
      ...(offline ? ['--offline'] : [])], stage);
    const packages = new Map<string, InstalledPackage>();
    const visit = (directory: string): string => {
      const actual = realpathSync(directory);
      if (!inside(stage, actual)) throw new Error('Package installer did not create a self-contained snapshot');
      const path = relative(stage, actual).replaceAll('\\', '/');
      if (packages.has(path)) return path;
      const { manifest, sourceRoot } = readPackage(actual);
      const entry: InstalledPackage = { path, name: manifest.name, version: manifest.version, source: manifest.source,
        digest: packageDigest(actual, sourceRoot), dependencies: {} };
      packages.set(path, entry);
      for (const alias of Object.keys(manifest.dependencies ?? {})) {
        let owner = actual;
        while (inside(stage, owner) && !existsSync(join(owner, 'node_modules', alias, 'aug-package.json'))) owner = dirname(owner);
        if (!inside(stage, owner)) throw new Error(`${manifest.name} is missing dependency ${alias}`);
        entry.dependencies[alias] = visit(join(owner, 'node_modules', alias));
        verifyReference(manifest.dependencies![alias], packages.get(entry.dependencies[alias])!);
      }
      return path;
    };
    const roots = Object.fromEntries(Object.keys(specifications).map(alias => [alias, visit(join(stage, 'node_modules', alias))]));
    const lock: PackageLock = { format: 1, compiler: compilerVersion(), specifications, roots,
      packages: [...packages.values()].sort((a, b) => a.path.localeCompare(b.path)), npm: json(join(stage, 'package-lock.json')) };
    verifyIdentities(lock.packages);
    for (const [alias, path] of Object.entries(roots)) verifyReference(specifications[alias], packages.get(path)!);
    if (frozen && JSON.stringify(lock.packages) !== JSON.stringify(previous!.packages)) throw new Error('Frozen package contents changed; update the lock explicitly with aug install');
    const cache = join(root, '.aug-packages'), backup = join(root, '.aug-packages-old');
    if (existsSync(backup)) throw new Error('Previous package install backup exists; inspect .aug-packages-old before installing');
    if (existsSync(cache)) renameSync(cache, backup);
    try { renameSync(stage, cache); writeJson(lockPath + '.tmp', lock); renameSync(lockPath + '.tmp', lockPath); }
    catch (error) { rmSync(cache, { recursive: true, force: true }); if (existsSync(backup)) renameSync(backup, cache); throw error; }
    rmSync(backup, { recursive: true, force: true });
    return lock;
  } finally { rmSync(stage, { recursive: true, force: true }); }
}

export function initPackage(directory: string, name: string): void {
  if (!npmName.test(name)) throw new Error('Package name must be an npm name, for example @owner/aug-math');
  if (existsSync(directory) && readdirSync(directory).length) throw new Error('Package init requires a new or empty directory');
  mkdirSync(join(directory, 'src'), { recursive: true });
  const manifest: PackageManifest = { format: 1, name, version: '0.1.0', compiler: compilerVersion(), source: 'src', dependencies: {} };
  writeJson(join(directory, 'aug-package.json'), manifest);
  writeJson(join(directory, 'package.json'), { name, version: manifest.version, description: 'An August source library',
    files: ['src', 'aug-package.json', 'README.md', 'LICENSE'], exports: { './aug-package.json': './aug-package.json' }, dependencies: {} });
  writeFileSync(join(directory, 'src/export.aug'), 'export add from arithmetic\n');
  writeFileSync(join(directory, 'src/arithmetic.aug'), '/** Add two integers. @param left First value. @param right Second value. @return Their sum. */\nadd(int left, int right) returns int {\n    return left + right\n}\n\ntest add {\n    when addition {\n        it adds_two_integers {\n            assert(add(left=2, right=3) == 5)\n        }\n    }\n}\n');
  writeFileSync(join(directory, 'README.md'), `# ${name}\n\nAugust ${compilerVersion()} source library. Public exports live in src/export.aug.\n`);
  writeFileSync(join(directory, '.gitignore'), '.aug-build/\n.aug-packages/\n.aug-install-*/\nnode_modules/\n*.tgz\n');
}

/** Synchronize transport metadata; August's manifest owns dependency aliases. */
export function preparePackage(root: string): void {
  const manifest = json(join(root, 'aug-package.json')) as PackageManifest;
  const transport = json(join(root, 'package.json'));
  transport.name = manifest.name; transport.version = manifest.version;
  transport.dependencies = manifest.dependencies ?? {};
  writeJson(join(root, 'package.json'), transport);
  readPackage(root);
}

export function packPackage(root: string): string {
  const destination = join(root, '.aug-build/packages'); mkdirSync(destination, { recursive: true });
  const result = JSON.parse(npm(['pack', '--ignore-scripts', '--json', '--pack-destination', destination], root))[0];
  if (!result?.filename) throw new Error('npm pack returned no archive');
  return join(destination, basename(result.filename));
}
