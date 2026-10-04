import {contextPacket} from './context.ts';
import {planRename} from './refactoring.ts';
import {semanticGraph,semanticSourcePath,semanticConfiguration,occurrencesAt,type SemanticGraph} from './symbols.ts';
import { defaultText } from './parameters.ts';
import { createHash } from 'node:crypto';
import { basename, resolve } from 'node:path';
import type { ClassDecl, Diagnostic, GenericHeader, ImportDecl, MethodDecl, Param, Span } from './ast.ts';
import { fieldsOf, syntheticType, typeName } from './ast.ts';
import { checkProject, tyName, type CheckedProject } from './checker.ts';
import { completions, hoverInfo, semanticTokens } from './editor.ts';
import { suggestedFixes } from './fixes.ts';
import { definitionAt } from './navigation.ts';
import { loadProject, type Definition, type Project } from './project.ts';
import { parse } from './parser.ts';
import { lex } from './lexer.ts';
import { javadocBefore } from './javadoc.ts';
import { checkUnitTests, discoverTests, mergeTestAnalysis, uniqueDiagnostics } from './testing.ts';
import { formatFile } from './formatter.ts';
import { interceptorBehavior } from './interceptors.ts';
import { callableResult, callableErrors } from './contracts.ts';
import {nativeFact,nativeDependencies,type NativeFunctionFact,type NativeResourceFact} from './native-facts.ts';

export {contractFacts,type CallableFact,type ContractFact} from './contract-facts.ts';
import {contractFacts,type ContractFact} from './contract-facts.ts';

export interface ModuleFact { file: string; dependencies: string[]; public: { name: string; shape: string }[]; members: number }
export function describe(checked: CheckedProject, fileName: string, options: { name?: string; budget?: number; context?: boolean; baseline?: { architecture?: ModuleFact[] } } = {}) {
  if(options.context)return contextPacket(checked,fileName,options);
  const path = resolve(fileName), file = checked.project.files.get(path);
  if (!file) throw new Error(`Unknown source file ${path}`);
  const facts = contractFacts(checked);
  const budget = Math.max(512, Math.min(options.budget ?? 12000, 100000));
  const selected: ContractFact[] = [];
  const queue = facts.filter(fact => fact.location.file === path && (options.name ? fact.name === options.name : fact.public));
  if (options.name && !queue.length) {
    const def = checked.project.scopes.get(path)?.get(options.name); const fact = facts.find(fact => fact.id === def?.id);
    if (fact) queue.push(fact); else throw new Error(`No declaration named ${options.name} in ${path}`);
  }
  const allImports = file.items.filter((item): item is ImportDecl => item.kind === 'import').map(item => ({ module: item.from.join('.'), location: item.span,
    names: (checked.project.imports.get(item) ?? []).map(def => ({ name: def.name, id: def.id, location: def.node.span })) }));
  if (options.context) for (const item of allImports) for (const name of item.names) { const fact = facts.find(fact => fact.id === name.id); if (fact) queue.push(fact); }
    const seen = new Set<string>();
  const imports: typeof allImports = [], bindings: { key: string; target: string; lifetime: string; stateful: boolean; dependencies: string[]; location: Span }[] = [];
  const snippets: { id: string; source: string }[] = [];
  const architecture: ModuleFact[] = [], changes: { file: string; addedDependencies: string[]; removedDependencies: string[]; addedPublic: string[]; removedPublic: string[]; changedPublic: string[]; memberGrowth: number }[] = [];
  let truncated = false;
  const result = () => ({ file: path, completeness: checked.diagnostics.some(issue => issue.severity !== 'warning') ? 'partial' : 'checked',
    budget, truncated, imports, contracts: selected, bindings, snippets, architecture, changes });
  const append = <T>(array: T[], value: T) => {
    array.push(value);
    if (JSON.stringify(result()).length > budget) { array.pop(); truncated = true; return false; } return true;
  };
  allImports.forEach(item => append(imports, item));
  for (let index = 0; index < queue.length; index++) {
    const fact = queue[index]; if (seen.has(fact.id)) continue; seen.add(fact.id);
    if (!append(selected, fact)) continue;
    if (options.context) for (const call of fact.calls) { const next = facts.find(fact => fact.id === call.target); if (next) queue.push(next); }
  }
  checked.bindings.forEach(binding => append(bindings, { key: binding.key, target: binding.target.id, lifetime: binding.lifetime,
    stateful: binding.stateful, dependencies: binding.dependencies, location: binding.declaration.span }));
  for (const source of checked.project.files.values()) if (!source.builtin && (source.path === path || selected.some(fact => fact.location.file === source.path))) {
    const publicFacts = facts.filter(fact => fact.public && fact.location.file === source.path);
    const module: ModuleFact = { file: source.path, dependencies: [...new Set(source.items.flatMap(item => item.kind === 'import' ?
      (checked.project.imports.get(item) ?? []).map(def => def.file) : []))].sort(),
      public: publicFacts.map(fact => ({ name: fact.name, shape: createHash('sha256').update(JSON.stringify({ kind: fact.kind,
        native:fact.native,generics: fact.genericParameters, fields: fact.fields.filter(field => !field.storage.startsWith('_')),
        interfaces: fact.interfaces, callables: fact.callables.map(({ location, interceptors, inputs, ...contract }) => ({ ...contract,
          inputs: inputs.map(({ name, ...input }) => input),
          interceptors: interceptors.map(({ location, ...layer }) => layer) })) })).digest('hex') })),
      members: publicFacts.reduce((count, fact) => count + 1 + fact.callables.length + fact.fields.filter(field => !field.storage.startsWith('_')).length, 0) };
    append(architecture, module);
    const previous = options.baseline?.architecture?.find(before => before.file === module.file);
    if (previous) {
      const delta = { file: module.file, addedDependencies: module.dependencies.filter(file => !previous.dependencies.includes(file)),
        removedDependencies: previous.dependencies.filter(file => !module.dependencies.includes(file)), addedPublic: module.public.filter(symbol => !previous.public.some(before => before.name === symbol.name)).map(symbol => symbol.name),
        removedPublic: previous.public.filter(symbol => !module.public.some(after => after.name === symbol.name)).map(symbol => symbol.name),
        changedPublic: module.public.filter(symbol => previous.public.some(before => before.name === symbol.name && before.shape !== symbol.shape)).map(symbol => symbol.name), memberGrowth: module.members - previous.members };
      if (delta.addedDependencies.length || delta.removedDependencies.length || delta.addedPublic.length || delta.removedPublic.length || delta.changedPublic.length || delta.memberGrowth) append(changes, delta);
    }
  }
  if (options.context) for (const fact of selected) {
    const source = checked.project.files.get(fact.location.file)!.source.slice(fact.location.start, fact.location.end);
    append(snippets, { id: fact.id, source });
  }
  return result();
}

/** Immutable document revision; compiler internals never escape through editor queries. */
export class SemanticDocument {
  readonly revision: string; readonly diagnostics: readonly Diagnostic[];
  readonly source: string;
  private checked: CheckedProject;
  readonly path: string;
  private graphValue?:SemanticGraph;
  private wholeProject:boolean;
  private checkedFiles:ReadonlySet<string>;
  private configuration:ReturnType<typeof semanticConfiguration>;
  constructor(checked: CheckedProject, path: string, revision: string, wholeProject=false, checkedFiles=new Set(checked.project.files.keys()), configuration=semanticConfiguration(checked.project.root)) {
    this.checked = checked; this.path = path; this.wholeProject=wholeProject; this.checkedFiles=checkedFiles; this.configuration=configuration;
    this.revision = revision; this.diagnostics = Object.freeze(checked.diagnostics.map(issue => Object.freeze({ ...issue,
      ...(issue.related ? {related:Object.freeze(issue.related.map(location=>Object.freeze({...location})))} : {}) })));
    this.source = checked.project.files.get(path)?.source ?? '';
  }
  graph() { return structuredClone(this.graphValue??=semanticGraph(this.checked,this.wholeProject,this.checkedFiles,this.configuration)); }
  references(offset:number,includeDeclaration=true) {
    return structuredClone(occurrencesAt(this.graphValue??=semanticGraph(this.checked,this.wholeProject,this.checkedFiles,this.configuration),semanticSourcePath(this.checked,this.path),offset,includeDeclaration));
  }
  rename(offset:number,name:string) {return planRename(this.checked,this.graph(),this.path,offset,name);}
  referenceTarget(file:string) {return [...this.checked.project.files.keys()].find(path=>semanticSourcePath(this.checked,path)===file);}
  hover(offset: number) { return hoverInfo(this.checked, this.path, offset); }
  complete(offset: number) { return completions(this.checked, this.path, offset); }
  tokens() { return semanticTokens(this.checked, this.path); }
  fixes() { return suggestedFixes(this.checked, this.path); }
  /** Non-editable declaration hints. Formatting never adds inferred source clauses. */
  inlayHints(start = 0, end = this.source.length, options:{detail?:'compact'|'full'} = {}) {
    const hints: { offset: number; label: string; tooltip: string }[] = [];
    for (const [method, contract] of this.checked.callableContracts) {
      if (method.span.file !== this.path || !method.body || method.headerEnd === undefined) continue;
      let offset = method.headerEnd;
      while (offset > method.span.start && /\s/.test(this.source[offset - 1])) offset--;
      if (offset < start || offset > end) continue;
      const clauses: string[] = [];
      if (contract.inferredResult && contract.result.kind !== 'error' && contract.result.name !== 'void')
        clauses.push(contract.result.name === '<target result>' ? 'returns the target result' : `returns ${tyName(contract.result)}`);
      const effects = this.checked.effectContracts.get(method);
      if (effects?.inferredChanges && effects.changes.length) clauses.push(`changes ${effects.changes.join(' and ')}`);
      const uses = [...(effects?.uses.values() ?? [])].map(effect => `${effect.source}.${effect.operation}`).sort();
      if (effects?.inferred && uses.length) clauses.push(`uses ${[...new Set(uses)].join(' and ')}`);
      const errors = callableErrors(this.checked, method);
      if (contract.inferredErrors && errors.length) clauses.push(`unless ${errors.join(' and ')}`);
      const complete = clauses.join(' ');
      const compact = complete.length > 120 ? clauses.map(clause =>
        clause.startsWith('uses ') && clause.length > 50 ? `uses ${new Set(uses).size} operations` :
        clause.startsWith('unless ') && clause.length > 50 ? `unless ${errors.length} errors` : clause).join(' ') : complete;
      if (clauses.length) hints.push({offset, label: options.detail==='full'?complete:compact.length<=120?compact:`inferred contract (${clauses.length} clauses)`,
        tooltip: `\`\`\`augscript\n${complete}\n\`\`\`\n\n` + 'Inferred from the body, implemented interface, and interceptor layers. These hints are not source text. The compiler still checks ownership, interface limits, and escaping errors. See the adjacent .aug.md spec for the full explanation.'});
    }
    for (const [record, contract] of this.checked.constructorContracts) {
      if (record.span.file !== this.path || !contract.inferredErrors || !contract.errors.length || record.headerEnd === undefined) continue;
      let offset = record.headerEnd;
      while (offset > record.span.start && /\s/.test(this.source[offset - 1])) offset--;
      const complete='unless ' + contract.errors.map(tyName).sort().join(' and ');
      if (offset >= start && offset <= end) hints.push({offset, label:options.detail==='full'||complete.length<=120?complete:`unless ${contract.errors.length} errors`,
        tooltip:`\`\`\`augscript\n${complete}\n\`\`\`\n\n`+'Checked errors inferred from record validation. Callers must catch or propagate them. These hints are not saved source.'});
    }
    const visit=(value:unknown):void=>{
      if(!value||typeof value!=='object')return;
      if(Array.isArray(value)){value.forEach(visit);return;}
      const stmt=value as import('./ast.ts').Stmt;
      if(stmt.kind==='assign'&&stmt.target.kind==='name'&&this.checked.inferredOwned.has(stmt)) {
        const offset=stmt.target.span.end;
        if(start<=offset&&offset<=end)hints.push({offset,label:options.detail==='full'||tyName(this.checked.expressionTypes.get(stmt.value)!).length<=110?': own '+tyName(this.checked.expressionTypes.get(stmt.value)!):': own result',
          tooltip:`\`\`\`augscript\nown ${tyName(this.checked.expressionTypes.get(stmt.value)!)}\n\`\`\`\n\n`+'Ownership is required by the checked call result. This local is dropped at the end of its block unless moved into an own input or return. The hint is not saved source; copying an existing owned alias still requires an explicit transfer.'});
      }
      for(const [key,child] of Object.entries(value))if(key!=='span')visit(child);
    };
    visit(this.checked.project.files.get(this.path)?.items);
    return hints.sort((left, right) => left.offset - right.offset);
  }
  format() { return formatFile(this.checked.project, this.checked.project.files.get(this.path)!); }
  describe(options?: Parameters<typeof describe>[2]) { return options?.context?contextPacket(this.checked,this.path,options,this.graph()):describe(this.checked, this.path, options); }
  definition(offset: number) {
    const source = this.checked.project.files.get(this.path)?.source ?? '';
    const token = lex(this.path, source).tokens.find(token => token.span.start <= offset && offset < token.span.end);
    const scopes = [...this.checked.scopes.values()].filter(scope => scope.span.file === this.path && scope.span.start <= offset && offset <= scope.span.end)
      .sort((left, right) => left.span.end - left.span.start - (right.span.end - right.span.start));
    const local = scopes[0]?.locals.find(local => local.name === token?.value);
    if (local?.definition) {
      const tokens = lex(this.path, source).tokens;
      const target = tokens.filter(token => local.definition!.start <= token.span.start && token.span.end <= local.definition!.end && token.value === local.name).at(-1)?.span ?? local.definition;
      return { name: local.name, file: target.file, line: target.line, column: target.column, kind: local.kind };
    }
    return definitionAt(this.checked.project, this.path, offset);
  }
}

export class SemanticWorkspace {
  private overrides = new Map<string, string>();
  private versions = new Map<string, number>();
  private parsed = new Map<string, ReturnType<typeof parse>>();
  private documents = new Map<string, { key: string; view: SemanticDocument }>();
  readonly stats = { analyses: 0, cacheHits: 0 };
  readonly root: string;
  constructor(root: string) { this.root = root; }
  close(path: string): void { this.overrides.delete(resolve(path)); this.versions.delete(resolve(path)); this.documents.delete(resolve(path)+':project'); this.documents.delete(resolve(path)+':closure'); }
  document(fileName: string, edit?: { text: string; version: number }, wholeProject=false): SemanticDocument {
    const path = resolve(fileName);
    if (edit && edit.version >= (this.versions.get(path) ?? -1)) { this.overrides.set(path, edit.text); this.versions.set(path, edit.version); }
    const project = loadProject(this.root, this.overrides, this.parsed);
    const closure = new Set<string>();
    const include = (file: string) => {
      if (closure.has(file)) return; closure.add(file);
      for (const item of project.files.get(file)?.items ?? []) if (item.kind === 'import')
        for (const def of project.imports.get(item) ?? []) include(def.file);
    };
    include(path);
    const root = wholeProject || basename(path) === 'main.aug';
    const cachePath=path+(root?':project':':closure');
    const relevant = root ? [...project.files.keys()] : [...closure];
    const configuration=semanticConfiguration(this.root);
    const key = createHash('sha256').update(JSON.stringify([project.config, configuration, root, relevant.map(file => [file, project.files.get(file)?.source]),
      project.diagnostics.filter(issue => relevant.includes(issue.file) || issue.code === 'PACKAGE')])).digest('hex');
    const cached = this.documents.get(cachePath);
    if (cached?.key === key) { this.stats.cacheHits++; return cached.view; }
    const local: Project = root ? project : { ...project, main: undefined,
      definitions: new Map([...project.definitions].filter(([, def]) => closure.has(def.file))),
      diagnostics: project.diagnostics.filter(issue => closure.has(issue.file) || issue.code === 'CONFIG' || issue.code === 'PACKAGE') };
    const checked = checkProject(local);
    const discovered = discoverTests(local);
    const tests = checkUnitTests(local, discovered.tests.filter(unit => root || closure.has(unit.file)));
    checked.diagnostics = uniqueDiagnostics([...checked.diagnostics, ...discovered.diagnostics, ...tests.flatMap(test => test.checked.diagnostics)]);
    mergeTestAnalysis(checked, tests);
    const view = new SemanticDocument(checked, path, key, root, new Set(relevant),configuration);
    this.documents.set(cachePath, { key, view }); this.stats.analyses++;
    return view;
  }
  invalidate(): void { this.documents.clear(); }
}
