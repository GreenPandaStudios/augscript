import {coherentSourceRead} from './source-transactions.ts';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import type {
  ClassDecl, ChoiceDecl, CompositionDecl, Diagnostic, ExportDecl, ImportDecl, InterfaceDecl, InterceptorDecl, MethodDecl,
  SourceFile, TopLevel, ResourceDecl,
} from './ast.ts';
import { parse } from './parser.ts';
import { loadConfig, type Config } from './config.ts';
import { projectPolicies } from './policies.ts';
import { builtinFunctions, builtinTypes } from './builtins.ts';
import { libraryChild, libraryRelative, standardLibraries, type StandardLibraries } from './libraries.ts';
import { packageSpecifications, projectPackages, readPackage, sourcePaths, type ProjectPackages, type PackageManifest, type PackageLock } from './package-manager.ts';
import { isGitSource, sourceAlias } from './git-packages.ts';

export type DefinitionNode = ClassDecl | InterfaceDecl | ChoiceDecl | InterceptorDecl | MethodDecl | CompositionDecl | ResourceDecl;
export interface Definition {
  id: string;
  name: string;
  file: string;
  node: DefinitionNode;
}

export interface Project {
  root: string;
  files: Map<string, SourceFile>;
  definitions: Map<string, Definition>;
  scopes: Map<string, Map<string, Definition>>;
  imports: Map<ImportDecl, Definition[]>;
  diagnostics: Diagnostic[];
  main: SourceFile | undefined;
  testMode?: boolean;
  testBodyStart?: number;
  testEndpoint?: {file: string; name: string};
  stdlibRoot?: string;
  libraries: StandardLibraries;
  packages: ProjectPackages;
  library?: PackageManifest;
  sourceRoot: string;
  config: Config;
}

export function isPrivateName(name: string): boolean { return name.startsWith('_'); }

function diagnostic(file: string, line: number, column: number, message: string, code: string): Diagnostic {
  return { file, line, column, message, code };
}

function sourceFiles(root: string): string[] {
  const output: string[] = [];
  function walk(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && entry.name.endsWith('.aug')) output.push(path);
    }
  }
  walk(root);
  return output.sort();
}

export function loadProject(projectRoot: string, overrides: Map<string, string> = new Map(),
  cache?: Map<string, ReturnType<typeof parse>>, packageCandidate?:{lock:PackageLock;cache:string;specifications?:Record<string,string>}): Project {
  return coherentSourceRead(projectRoot,()=>loadProjectRevision(projectRoot,overrides,cache,packageCandidate));
}
function loadProjectRevision(projectRoot:string,overrides:Map<string,string>,cache?:Map<string,ReturnType<typeof parse>>,
  packageCandidate?:{lock:PackageLock;cache:string;specifications?:Record<string,string>}):Project {
  const root = resolve(projectRoot);
  const files = new Map<string, SourceFile>();
  const definitions = new Map<string, Definition>();
  const scopes = new Map<string, Map<string, Definition>>();
  const imports = new Map<ImportDecl, Definition[]>();
  const { config, diagnostics } = loadConfig(root);
  let library: PackageManifest | undefined;
  let sourceRoot = root;
  if (existsSync(join(root, 'aug-package.json')) || !existsSync(join(root,'main.aug')) && (existsSync(join(root,'export.aug')) || existsSync(join(root,'src/export.aug')))) {
    try { const loaded = readPackage(root); library = loaded.manifest; sourceRoot = loaded.sourceRoot; }
    catch (error) { diagnostics.push(diagnostic(join(root, 'aug-package.json'), 1, 1, (error as Error).message, 'PACKAGE')); }
  }
  const packages = projectPackages(root, packageCandidate?.specifications??packageSpecifications(sourceRoot, library?.dependencies ?? config.packages, overrides), sourceRoot, packageCandidate);
  diagnostics.push(...packages.diagnostics);
  const read = (path: string) => {
    const source = overrides.get(path) ?? readFileSync(path, 'utf8');
    const cached = cache?.get(path);
    if (cached?.file.source === source) return cached;
    const parsed = parse(path, source); cache?.set(path, parsed); return parsed;
  };
  for (const path of new Set([...sourceFiles(sourceRoot), ...[...overrides.keys()].filter(path => path.startsWith(sourceRoot + '/') || path.startsWith(sourceRoot + '\\'))].filter(path => path.endsWith('.aug')))) {
    const parsed = read(path);
    files.set(path, parsed.file);
    diagnostics.push(...parsed.diagnostics);
  }
  for (const scope of new Set(packages.scopes.values())) for (const path of sourcePaths(scope.sourceRoot)) {
    const parsed = read(path);
    // Cached parse objects can be shared across project revisions.
    files.set(path, { ...parsed.file, package: scope.path });
    diagnostics.push(...parsed.diagnostics);
  }
  const libraries = standardLibraries();
  const stdlibRoot = libraries.root;
  const libraryFiles = new Set([join(stdlibRoot, 'export.aug'), ...['io','collections','math'].flatMap(module=>sourceFiles(join(stdlibRoot,module)))]);
  for (const path of libraryFiles) {
    const parsed = read(path);
    parsed.file.builtin = true;
    files.set(path, parsed.file);
    diagnostics.push(...parsed.diagnostics);
  }
  const main = files.get(join(root, 'main.aug'));
  if (!main && !library) diagnostics.push(diagnostic(join(root, 'main.aug'), 1, 1,
    'Project requires main.aug at its root', 'PROJECT'));

  for (const file of files.values()) {
    const local = new Map<string, Definition>();
    const isExport = basename(file.path) === 'export.aug';
    for (const item of file.items) {
      if (isExport && item.kind !== 'export') {
        diagnostics.push(diagnostic(file.path, item.span.line, item.span.column,
          'export.aug may contain only export declarations', 'EXPORT'));
      }
      if (!isExport && item.kind === 'export') {
        diagnostics.push(diagnostic(file.path, item.span.line, item.span.column,
          'export declarations belong in export.aug', 'EXPORT'));
      }
      if (file === main && ['class', 'interface', 'choice', 'function', 'interceptor', 'test', 'composition', 'resource'].includes(item.kind)) {
        diagnostics.push(diagnostic(file.path, item.span.line, item.span.column,
          'Define classes, interfaces, choices, functions, and interceptors outside main.aug', 'MAIN'));
      }
      if (file !== main && ['bind', 'include', 'expr', 'assign', 'return', 'throw', 'break', 'continue', 'if', 'while', 'for', 'destructure', 'match', 'scope', 'freeze', 'serve', 'lock',
        'try', 'unsafe', 'borrow'].includes(item.kind)) {
        diagnostics.push(diagnostic(file.path, item.span.line, item.span.column,
          'Executable statements and bindings belong in main.aug', 'MAIN'));
      }
      if (item.kind === 'class' || item.kind === 'interface' || item.kind === 'choice' || item.kind === 'function' || item.kind === 'interceptor' || item.kind === 'composition' || item.kind === 'resource') {
        if (item.name in builtinTypes || builtinFunctions.some(operation => operation.name === item.name) || item.name === 'next') {
          diagnostics.push(diagnostic(file.path, item.span.line, item.span.column,
            `${item.name} is a reserved built-in name`, 'NAME'));
          continue;
        }
        if (local.has(item.name)) {
          diagnostics.push(diagnostic(file.path, item.span.line, item.span.column,
            `Duplicate declaration ${item.name}`, 'NAME'));
          continue;
        }
        const packageScope = file.package ? packages.scopes.get(file.package) : undefined;
        const identity = packageScope ? `package/${packageScope.name}@${packageScope.version}/${relative(packageScope.sourceRoot, file.path)}` :
          library && !file.builtin ? `package/${library.name}@${library.version}/${relative(sourceRoot, file.path)}` : relative(root, file.path);
        const def: Definition = { id: `${file.builtin ? 'august/' + libraryRelative(libraries, file.path) : identity}:${item.name}`,
          name: item.name, file: file.path, node: item };
        local.set(item.name, def);
        definitions.set(def.id, def);
      }
    }
    scopes.set(file.path, local);
  }

  // Importing a sibling exposes its declarations, never its imported dependencies.
  const declaredScopes = new Map([...scopes].map(([file, scope]) => [file, new Map(scope)]));

  const exportCache = new Map<string, Map<string, Definition>>();
  function folderExports(folder: string, visiting: Set<string> = new Set()): Map<string, Definition> {
    if (exportCache.has(folder)) return exportCache.get(folder)!;
    const result = new Map<string, Definition>();
    const exportFile = files.get(join(folder, 'export.aug'));
    if (!exportFile) return result;
    if (visiting.has(folder)) return result;
    visiting.add(folder);
    for (const item of exportFile.items) {
      if (item.kind !== 'export' || item.folder) continue;
      if (isPrivateName(item.name)) {
        diagnostics.push(diagnostic(exportFile.path, item.span.line, item.span.column,
          `Cannot export private name ${item.name}`, 'PRIVATE'));
        continue;
      }
      if (item.from && isPrivateName(item.from)) {
        diagnostics.push(diagnostic(exportFile.path, item.span.line, item.span.column,
          `Cannot export from private module ${item.from}`, 'PRIVATE'));
        continue;
      }
      const sibling = files.get(join(folder, `${item.from}.aug`));
      if (!sibling || basename(sibling.path) === 'export.aug') {
        diagnostics.push(diagnostic(exportFile.path, item.span.line, item.span.column,
          `Cannot export ${item.name}: sibling file ${item.from}.aug was not found`, 'EXPORT'));
        continue;
      }
      const def = declaredScopes.get(sibling.path)?.get(item.name);
      if (!def) {
        diagnostics.push(diagnostic(exportFile.path, item.span.line, item.span.column,
          `Cannot export ${item.name}: ${item.from}.aug does not define it`, 'EXPORT'));
      } else if (result.has(item.name)) {
        diagnostics.push(diagnostic(exportFile.path, item.span.line, item.span.column,
          `Duplicate export ${item.name}`, 'EXPORT'));
      } else result.set(item.name, def);
    }
    exportCache.set(folder, result);
    visiting.delete(folder);
    return result;
  }

  function exposedChild(folder: string, child: string): boolean {
    const file = files.get(join(folder, 'export.aug'));
    return !!file?.items.some((item): item is ExportDecl =>
      item.kind === 'export' && item.folder && item.name === child);
  }

  for (const file of files.values()) {
    if (basename(file.path) !== 'export.aug') continue;
    for (const item of file.items) {
      if (item.kind !== 'export' || !item.folder) continue;
      if (isPrivateName(item.name)) {
        diagnostics.push(diagnostic(file.path, item.span.line, item.span.column,
          `Cannot export private folder ${item.name}`, 'PRIVATE'));
        continue;
      }
      const path = file.builtin ? libraryChild(libraries, dirname(file.path), item.name) : join(dirname(file.path), item.name);
      if (!statExistsDirectory(path)) diagnostics.push(diagnostic(file.path, item.span.line,
        item.span.column, `Cannot export folder ${item.name}: it does not exist`, 'EXPORT'));
      else if (!files.has(join(path, 'export.aug'))) diagnostics.push(diagnostic(file.path,
        item.span.line, item.span.column,
        `Cannot export folder ${item.name}: it has no export.aug`, 'EXPORT'));
    }
    folderExports(dirname(file.path));
  }

  for (const file of files.values()) {
    if (basename(file.path) === 'export.aug') continue;
    const scope = scopes.get(file.path)!;
    for (const item of file.items) {
      if (item.kind !== 'import') continue;
      const resolved = resolveImports(item, file.path);
      imports.set(item, [...resolved.values()]);
      for (const [name, def] of resolved) {
        if (scope.has(name)) diagnostics.push(diagnostic(file.path, item.span.line,
          item.span.column, `Imported name ${name} conflicts with another name`, 'IMPORT'));
        else scope.set(name, def);
      }
    }
  }

  function resolveImports(item: ImportDecl, importer: string): Map<string, Definition> {
    const source = item.from.join('.');
    const result = new Map<string, Definition>();
    const select = (available: Map<string, Definition>, missing: string) => {
      const names = item.everything ? [...available.keys()].filter(name => !isPrivateName(name)) : item.names;
      for (const name of names) {
        if (isPrivateName(name)) diagnostics.push(diagnostic(importer, item.span.line, item.span.column,
          `Cannot import private name ${name}`, 'PRIVATE'));
        else if (result.has(name)) diagnostics.push(diagnostic(importer, item.span.line, item.span.column,
          `Duplicate imported name ${name}`, 'IMPORT'));
        else if (available.has(name)) result.set(name, available.get(name)!);
        else diagnostics.push(diagnostic(importer, item.span.line, item.span.column,
          `${source} ${missing} ${name}`, 'IMPORT'));
      }
      return result;
    };
    const privateModule = item.from.slice(isGitSource(item.from[0]) ? 1 : 0).find(isPrivateName);
    if (privateModule) {
      diagnostics.push(diagnostic(importer, item.span.line, item.span.column,
        `Cannot import from private module ${privateModule}`, 'PRIVATE'));
      return result;
    }
    if (item.from[0] === 'august') {
      let folder = stdlibRoot;
      for (const child of item.from.slice(1)) {
        if (!exposedChild(folder, child)) {
          diagnostics.push(diagnostic(importer, item.span.line, item.span.column,
            `Standard module august does not export ${child}`, 'IMPORT'));
          return result;
        }
        folder = libraryChild(libraries, folder, child);
      }
      return select(folderExports(folder), 'does not export');
    }
    const owner = files.get(importer)?.package;
    const ownerScope = owner ? packages.scopes.get(owner) : undefined;
    const alias = isGitSource(item.from[0]) ? sourceAlias(item.from[0]) : item.from[0];
    const dependency = ownerScope ? packages.scopes.get(ownerScope.dependencies[alias]) : packages.roots.get(alias);
    if (dependency) {
      let folder = dependency.sourceRoot;
      for (const child of item.from.slice(1)) {
        if (!exposedChild(folder, child)) {
          diagnostics.push(diagnostic(importer, item.span.line, item.span.column,
            `Package ${item.from[0]} does not export folder ${child}`, 'IMPORT'));
          return result;
        }
        folder = join(folder, child);
      }
      return select(folderExports(folder), 'does not export');
    }
    if (item.from.length === 1) {
      const sibling = join(dirname(importer), `${item.from[0]}.aug`);
      if (files.has(sibling) && basename(sibling) !== 'export.aug') {
        return select(declaredScopes.get(sibling) ?? new Map(), 'does not define');
      }
    }
    let folder: string;
    if (item.from.length === 1 && statExistsDirectory(join(dirname(importer), item.from[0]))) {
      folder = join(dirname(importer), item.from[0]);
    } else {
      folder = join(ownerScope?.sourceRoot ?? sourceRoot, item.from[0]);
      if (!statExistsDirectory(folder)) {
        diagnostics.push(diagnostic(importer, item.span.line, item.span.column,
          `Import folder ${source} does not exist`, 'IMPORT'));
        return result;
      }
      for (const child of item.from.slice(1)) {
        if (!exposedChild(folder, child)) {
          diagnostics.push(diagnostic(importer, item.span.line, item.span.column,
            `Folder ${relative(root, folder)} does not export child folder ${child}`, 'IMPORT'));
          return result;
        }
        folder = join(folder, child);
      }
    }
    return select(folderExports(folder), 'does not export');
  }

  const project = { root, sourceRoot, library, packages, files, definitions, scopes, imports, diagnostics, main, stdlibRoot, libraries, config };
  diagnostics.push(...projectPolicies(project));
  return project;
}

function statExistsDirectory(path: string): boolean {
  try { return statSync(path).isDirectory(); } catch { return false; }
}

export function declarations(file: SourceFile): DefinitionNode[] {
  return file.items.filter((item): item is DefinitionNode =>
    item.kind === 'class' || item.kind === 'interface' || item.kind === 'choice' || item.kind === 'function' || item.kind === 'interceptor' || item.kind === 'composition');
}

export function statements(file: SourceFile): TopLevel[] {
  return file.items.filter(item => !['import', 'export', 'class', 'interface', 'choice', 'function', 'interceptor', 'composition', 'test'].includes(item.kind));
}
