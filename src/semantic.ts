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

const genericFacts = (header: GenericHeader) => header.typeParams.map(name => ({ name,
  variance: header.typeVariance?.[name] ?? 'invariant', constraints: (header.typeConstraints?.[name] ?? []).map(typeName) }));

export interface CallableFact {
  native?:NativeFunctionFact; nativeDependencies:NativeFunctionFact[]; nativeCoverage:'resolved-standalone-calls';
  name: string; location: Span; inputs: { label: string; name: string; type: string; ownership: string; injected: boolean; source?:Param['source'] }[];
  result: string; genericParameters: ReturnType<typeof genericFacts>; changes: string[]; capabilities: string[]; inferredEffects: boolean; errors: string[];
  http?: {method:string; path:string; status:number; streaming:boolean; errors:{type:string;status:number}[]};
  policies: {name:string; order:number; options:Record<string,string|number|boolean|string[]>; dependencies:string[]}[];
  interceptors: { name: string; order: number; location: Span; dependencies: string[]; changes: string[]; capabilities: string[];
    errors: string[]; delegates: boolean; mayShortCircuit: boolean }[];
}
export interface ContractFact {
  native?:NativeResourceFact;
  id: string; name: string; kind: string; location: Span; public: boolean; documentation?: string;
  typeParameters: string[]; genericParameters: ReturnType<typeof genericFacts>; interfaces: string[];
  fields: { label: string; storage: string; type: string; mutable: boolean; injected: boolean; ownership: string }[];
  callables: CallableFact[]; calls: { target: string; location: Span }[]; tests: { group: string; name: string; location: Span }[];
}
export function contractFacts(checked: CheckedProject): ContractFact[] {
  const { project } = checked;
  const callable = (method: MethodDecl, constructor?: ClassDecl): CallableFact => {
    const contract = checked.effectContracts.get(method);
    const layers = checked.interceptorPlans.get(constructor ?? method) ?? [];
    const native=nativeFact(checked,method);
    return { name: method.name, location: method.span, genericParameters: genericFacts(method),
      native:native?.kind==='function'?native:undefined,nativeDependencies:nativeDependencies(checked,method),nativeCoverage:'resolved-standalone-calls',
      inputs: method.params.map(param => ({ label: param.label ?? param.name, name: param.name,
        type: typeName(param.type), ownership: param.ownership, injected: param.injected, source:param.source })),
      http:method.endpoint?{method:method.endpoint.method,path:method.endpoint.path,status:method.endpoint.status,
        streaming:!!method.endpoint.streams,errors:method.endpoint.errors.map(error=>({type:typeName(error.type),status:error.status}))}:undefined,
      policies:(checked.httpPolicies.get(method)??[]).map((policy,index)=>({name:policy.name,order:index+1,options:policy.options,
        dependencies:policy.dependencies.map(index=>method.params[index]?.label??method.params[index]?.name??'')})),
      result: `${method.returnOwnership === 'own' ? 'own ' : ''}${tyName(callableResult(checked, method))}`,
      changes: [...(contract?.changes ?? method.changes ?? [])],
      capabilities: [...(contract?.uses.values() ?? [])].map(effect => `${effect.source}.${effect.operation}`).concat(method.externC&&!native ? [`C.${method.name}`] : []),
      inferredEffects: !!contract?.inferred,
      errors: constructor ? [...new Set([...(checked.constructorContracts.get(constructor)?.errors.map(tyName) ?? constructor.validationErrors?.map(typeName) ?? []),
        ...layers.flatMap(layer => layer.errors.map(tyName))])].sort() : callableErrors(checked, method),
      interceptors: layers.map((layer, order) => {
        const effects = checked.effectContracts.get(layer.around);
        return { name: layer.definition.name, order: order + 1, location: layer.definition.node.span,
          dependencies: [...new Set([...(layer.definition.node.kind === 'interceptor' ? layer.definition.node.fields : []), ...layer.around.params].filter(param => param.injected).map(param => typeName(param.type)))],
          changes: [...(effects?.changes ?? layer.around.changes ?? [])],
          capabilities: [...(effects?.uses.values() ?? [])].map(effect => `${effect.source}.${effect.operation}`), errors: layer.errors.map(tyName),
          ...interceptorBehavior(layer.around.body ?? []) };
      }) };
  };
  return [...project.definitions.values()].map(def => {
    const node = def.node, file = project.files.get(def.file)!;
    const methods = node.kind === 'function' ? [node] : 'methods' in node ? node.methods : [];
    const calls: ContractFact['calls'] = [];
    const visit = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach(visit); return; }
      const call = value as { kind?: string; callee?: { kind?: string; name?: string; object?: import('./ast.ts').Expr }; span?: Span };
      if (call.kind === 'call' && call.callee?.kind === 'name' && call.span) {
        const target = project.scopes.get(call.span.file)?.get(call.callee.name!);
        if (target) calls.push({ target: target.id, location: call.span });
      }
      if (call.kind === 'call' && call.callee?.kind === 'member' && call.callee.object && call.span) {
        const target = checked.expressionTypes.get(call.callee.object)?.def;
        if (target) calls.push({ target: target.id, location: call.span });
      }
      for (const [key, child] of Object.entries(value)) if (!['span', 'nameSpan', 'sourceSpan'].includes(key)) visit(child);
    };
    visit(node);
    const native=node.kind==='resource'?nativeFact(checked,node):undefined;
    return { id: def.id, name: def.name, kind: node.kind === 'class' && node.record ? 'record' :
      node.kind === 'interface' && node.capability ? 'capability' : node.kind,
      native:native?.kind==='resource'?native:undefined,
      location: node.span, public: !node.name.startsWith('_'), typeParameters: node.typeParams, genericParameters: genericFacts(node),
      documentation: javadocBefore(file.source, 'annotations' in node ? node.annotations?.[0]?.span.start ?? node.span.start : node.span.start)?.markdown,
      interfaces: node.kind === 'class' ? node.implements.map(typeName) : node.kind === 'interface' ? node.extends.map(typeName) : [],
      fields: 'fields' in node ? fieldsOf(node).map(field => ({ label: field.label ?? field.name, storage: field.name, type: typeName(field.type),
        mutable: !!field.mutable, injected: field.injected, ownership: field.ownership })) : [],
      callables: [...(node.kind === 'class' ? [callable({ kind: 'function', name: node.name, typeParams: node.typeParams,
        typeConstraints: node.typeConstraints, typeVariance: node.typeVariance, params: node.fields,
        returns: syntheticType(node.name, node.span), returnOwnership: 'managed',
        throws: node.validationErrors ?? [], changes: [], uses: [], body: node.constructorBody, externC: false, span: node.span }, node)] : []),
        ...methods.filter(method => node.kind==='function'||!method.name.startsWith('_')).map(method => callable(method))], calls,
      tests: file.items.flatMap(item => item.kind === 'test' && item.type.name === def.name ? item.groups.flatMap(group =>
        group.cases.map(test => ({ group: group.name, name: test.name, location: test.span }))) : []) };
  });
}

export interface ModuleFact { file: string; dependencies: string[]; public: { name: string; shape: string }[]; members: number }
export function describe(checked: CheckedProject, fileName: string, options: { name?: string; budget?: number; context?: boolean; baseline?: { architecture?: ModuleFact[] } } = {}) {
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
  constructor(checked: CheckedProject, path: string, revision: string) {
    this.checked = checked; this.path = path;
    this.revision = revision; this.diagnostics = Object.freeze(checked.diagnostics.map(issue => Object.freeze({ ...issue })));
    this.source = checked.project.files.get(path)?.source ?? '';
  }
  hover(offset: number) { return hoverInfo(this.checked, this.path, offset); }
  complete(offset: number) { return completions(this.checked, this.path, offset); }
  tokens() { return semanticTokens(this.checked, this.path); }
  fixes() { return suggestedFixes(this.checked, this.path); }
  /** Non-editable declaration hints. Formatting never adds inferred source clauses. */
  inlayHints(start = 0, end = this.source.length) {
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
      if (clauses.length) hints.push({offset, label: compact,
        tooltip: `\`\`\`augscript\n${complete}\n\`\`\`\n\n` + 'Inferred from the body, implemented interface, and interceptor layers. These hints are not source text. The compiler still checks ownership, interface limits, and escaping errors. See the adjacent .aug.md spec for the full explanation.'});
    }
    for (const [record, contract] of this.checked.constructorContracts) {
      if (record.span.file !== this.path || !contract.inferredErrors || !contract.errors.length || record.headerEnd === undefined) continue;
      let offset = record.headerEnd;
      while (offset > record.span.start && /\s/.test(this.source[offset - 1])) offset--;
      if (offset >= start && offset <= end) hints.push({offset, label:'unless ' + contract.errors.map(tyName).sort().join(' and '),
        tooltip:'Checked errors inferred from record validation. Callers must catch or propagate them. These hints are not saved source.'});
    }
    return hints.sort((left, right) => left.offset - right.offset);
  }
  format() { return formatFile(this.checked.project, this.checked.project.files.get(this.path)!); }
  describe(options?: Parameters<typeof describe>[2]) { return describe(this.checked, this.path, options); }
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
  close(path: string): void { this.overrides.delete(resolve(path)); this.versions.delete(resolve(path)); this.documents.delete(resolve(path)); }
  document(fileName: string, edit?: { text: string; version: number }): SemanticDocument {
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
    const root = basename(path) === 'main.aug';
    const relevant = root ? [...project.files.keys()] : [...closure];
    const key = createHash('sha256').update(JSON.stringify([project.config, relevant.map(file => [file, project.files.get(file)?.source]),
      project.diagnostics.filter(issue => relevant.includes(issue.file) || issue.code === 'PACKAGE')])).digest('hex');
    const cached = this.documents.get(path);
    if (cached?.key === key) { this.stats.cacheHits++; return cached.view; }
    const local: Project = root ? project : { ...project, main: undefined,
      definitions: new Map([...project.definitions].filter(([, def]) => closure.has(def.file))),
      diagnostics: project.diagnostics.filter(issue => closure.has(issue.file) || issue.code === 'CONFIG' || issue.code === 'PACKAGE') };
    const checked = checkProject(local);
    const discovered = discoverTests(local);
    const tests = checkUnitTests(local, discovered.tests.filter(unit => root || closure.has(unit.file)));
    checked.diagnostics = uniqueDiagnostics([...checked.diagnostics, ...discovered.diagnostics, ...tests.flatMap(test => test.checked.diagnostics)]);
    mergeTestAnalysis(checked, tests);
    const view = new SemanticDocument(checked, path, key);
    this.documents.set(path, { key, view }); this.stats.analyses++;
    return view;
  }
  invalidate(): void { this.documents.clear(); }
}
