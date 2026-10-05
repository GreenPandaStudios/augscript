import { statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import type { ClassDecl, MethodDecl, Param, SourceFile } from './ast.ts';
import { lex, type Token } from './lexer.ts';
import type { Definition, Project } from './project.ts';
import { libraryChild } from './libraries.ts';
import { isGitSource, sourceAlias } from './git-packages.ts';

export interface NavigationTarget {
  name: string;
  file: string;
  line: number;
  column: number;
  kind: 'class' | 'choice' | 'interface' | 'function' | 'composition' | 'interceptor' | 'resource' | 'method' | 'parameter' | 'module';
}

function definitionTarget(def: Definition): NavigationTarget {
  const span = def.node.kind === 'interceptor' ? def.node.nameSpan : def.node.span;
  return { name: def.name, file: def.file, line: span.line,
    column: span.column, kind: def.node.kind };
}

function parameterTarget(project: Project, param: Param): NavigationTarget {
  const source = project.files.get(param.span.file)?.source ?? '';
  const token = lex(param.span.file, source).tokens.filter(token => token.value === param.name &&
    param.span.start <= token.span.start && token.span.end <= param.span.end).at(-1);
  const span = token?.span ?? param.span;
  return { name: param.name, file: span.file, line: span.line, column: span.column, kind: 'parameter' };
}

function directoryExists(path: string): boolean {
  try { return statSync(path).isDirectory(); } catch { return false; }
}

function exportTarget(project: Project, folder: string, name: string,
                      child?: string): NavigationTarget | undefined {
  const file = project.files.get(join(folder, 'export.aug'));
  if (!file) return undefined;
  const declaration = file.items.find(item => item.kind === 'export' && !item.internal &&
    item.name === (child ?? name) && item.folder === !!child);
  return { name, file: file.path, line: declaration?.span.line ?? 1,
    column: declaration?.span.column ?? 1, kind: 'module' };
}

function importPathTarget(project: Project, importer: SourceFile, from: string[],
                          name: string, segment: number): NavigationTarget | undefined {
  if (!from.length) return undefined;
  if (from[0] === 'august' && project.stdlibRoot) {
    let folder = project.stdlibRoot;
    for (let index = 1; index <= segment; index++) folder = libraryChild(project.libraries, folder, from[index]);
    return exportTarget(project, folder, name, segment < from.length - 1 ? from[segment + 1] : undefined);
  }
  const owner = importer.package ? project.packages.scopes.get(importer.package) : undefined;
  const alias = isGitSource(from[0]) ? sourceAlias(from[0]) : from[0];
  const dependency = owner ? project.packages.scopes.get(owner.dependencies[alias]) : project.packages.roots.get(alias);
  if (dependency) {
    const folder = join(dependency.sourceRoot, ...from.slice(1, segment + 1));
    return exportTarget(project, folder, name, segment < from.length - 1 ? from[segment + 1] : undefined);
  }
  if (from.length === 1) {
    const sibling = join(dirname(importer.path), `${from[0]}.aug`);
    if (project.files.has(sibling) && basename(sibling) !== 'export.aug')
      return { name: from[0], file: sibling, line: 1, column: 1, kind: 'module' };
  }
  const siblingFolder = join(dirname(importer.path), from[0]);
  let folder = from.length === 1 && directoryExists(siblingFolder) ?
    siblingFolder : join(owner?.sourceRoot ?? project.sourceRoot, from[0]);
  if (segment === 0 && from.length > 1)
    return exportTarget(project, folder, from[0], from[1]);
  for (let index = 1; index <= segment; index++) folder = join(folder, from[index]);
  return segment === from.length - 1 ? exportTarget(project, folder, name) :
    exportTarget(project, folder, from[segment], from[segment + 1]);
}

function unfinishedModuleTarget(project: Project, file: SourceFile,
                                token: Token, tokens: Token[]): NavigationTarget | undefined {
  const lineTokens = tokens.filter(entry => entry.span.line === token.span.line &&
    entry.kind !== 'eof');
  if (lineTokens[0]?.kind === 'export' && lineTokens[1]?.kind === 'folder' &&
      lineTokens[2]?.kind === 'identifier' &&
      (token === lineTokens[1] || token === lineTokens[2]))
    return exportTarget(project, file.builtin ? libraryChild(project.libraries, dirname(file.path), lineTokens[2].value) : join(dirname(file.path), lineTokens[2].value),
      lineTokens[2].value);
  if (!['import', 'export', 'internal'].includes(lineTokens[0]?.value ?? '') ||
      lineTokens[1]?.kind !== 'identifier') return undefined;
  const fromIndex = lineTokens.findIndex(entry => entry.kind === 'from');
  if (fromIndex < 0) return undefined;
  const pathTokens = lineTokens.slice(fromIndex + 1).filter(entry => entry.kind === 'identifier');
  if (!pathTokens.length) return undefined;
  const segment = token.kind === 'from' ? pathTokens.length - 1 : pathTokens.indexOf(token);
  if (segment < 0) return undefined;
  if (lineTokens[0].kind === 'import')
    return importPathTarget(project, file, pathTokens.map(entry => entry.value),
      lineTokens[1].value, segment);
  const sibling = join(dirname(file.path), `${pathTokens[0].value}.aug`);
  return project.files.has(sibling) ? { name: pathTokens[0].value, file: sibling,
    line: 1, column: 1, kind: 'module' } : undefined;
}

/** Go to a declaration or the source named by an import/export path. */
export function definitionAt(project: Project, fileName: string,
                             offset: number): NavigationTarget | undefined {
  const file = project.files.get(resolve(fileName));
  if (!file) return undefined;
  const tokens = lex(file.path, file.source).tokens;
  const token = tokens.find(entry => entry.kind !== 'eof' &&
    entry.span.start <= offset && offset < entry.span.end);
  if (!token) return undefined;
  for (const node of file.items) {
    const candidates: (MethodDecl | ClassDecl)[] = node.kind === 'class' || node.kind === 'function' ? [node] : [];
    if ('methods' in node) candidates.push(...node.methods);
    for (const target of candidates) for (const tag of target.annotations ?? []) {
      const mapping = tag.mappings.find(entry => entry.span.start <= token.span.start && token.span.end <= entry.span.end);
      if (!mapping) continue;
      const def = project.scopes.get(file.path)?.get(tag.name);
      const around = def?.node.kind === 'interceptor' ? def.node.methods.find(method => method.name === 'around') : undefined;
      const params = target.kind === 'class' ? target.fields : target.params;
      const param = token.span.start >= mapping.sourceSpan.start ? params.find(param => param.name === mapping.source) :
        around?.params.find(param => param.name === mapping.name);
      if (param) return parameterTarget(project, param);
    }
    if (node.kind === 'interceptor' && token.value === 'next') {
      const around = node.methods.find(method => method.name === 'around' &&
        method.span.start <= token.span.start && token.span.end <= method.span.end);
      if (around) return { name: 'around', file: file.path, line: around.span.line,
        column: around.span.column, kind: 'method' };
    }
  }
  const item = file.items.find(entry => entry.span.start <= token.span.start &&
    token.span.end <= entry.span.end && (entry.kind === 'import' || entry.kind === 'export'));
  if (item?.kind === 'import' || (item?.kind === 'export' && !item.folder)) {
    const declarationTokens = tokens.filter(entry => entry.span.start >= item.span.start &&
      entry.span.end <= item.span.end);
    const fromIndex = declarationTokens.findIndex(entry => entry.kind === 'from');
    const sourceTokens = declarationTokens.slice(fromIndex + 1)
      .filter(entry => entry.kind === 'identifier' || entry.kind === 'string');
    const segments = item.kind === 'import' ? item.from : [item.from!];
    const selected = token.kind === 'from' ? segments.length - 1 :
      sourceTokens.findIndex((entry: Token) => entry === token);
    if (fromIndex >= 0 && selected >= 0 && selected < segments.length) {
      if (item.kind === 'import')
        return importPathTarget(project, file, segments, item.names[0] ?? 'everything', selected);
      const sibling = join(dirname(file.path), `${item.from}.aug`);
      return project.files.has(sibling) ? { name: item.from!, file: sibling,
        line: 1, column: 1, kind: 'module' } : undefined;
    }
    if (item.kind === 'export' && token.value === item.name) {
      const sibling = join(dirname(file.path), `${item.from}.aug`);
      const def = project.scopes.get(sibling)?.get(item.name);
      return def ? definitionTarget(def) : undefined;
    }
  }
  if (item?.kind === 'export' && item.folder &&
      (token.kind === 'folder' || token.value === item.name))
    return exportTarget(project, file.builtin ? libraryChild(project.libraries, dirname(file.path), item.name) : join(dirname(file.path), item.name), item.name);
  if (!item) {
    const unfinished = unfinishedModuleTarget(project, file, token, tokens);
    if (unfinished) return unfinished;
  }
  if (token.kind === 'identifier') {
    const def = project.scopes.get(file.path)?.get(token.value);
    if (def) return definitionTarget(def);
  }
  return undefined;
}
