import { basename, dirname, join, relative } from 'node:path';
import type { Diagnostic, Span, Stmt } from './ast.ts';
import type { Project } from './project.ts';
import { orderGraph } from './di.ts';
import { javadocBefore } from './javadoc.ts';
import { callableDocumentation } from './documentation.ts';

export function projectPolicies(project: Project): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const enabled = (name: string) => project.config.lint.includes(name);
  const report = (span: Span, message: string, code: string, warning = false) => diagnostics.push({
    file: span.file, line: span.line, column: span.column, message, code, severity: warning ? 'warning' as const : 'error' as const });
  const modules = new Map<string, { key: string; dependencies: string[]; span: Span }>();
  const module = (path: string) => relative(project.sourceRoot, dirname(path)).replaceAll('\\', '/') || '.';
  const rules = project.config.module_dependencies.map(rule => { const [owner, targets] = rule.split(':');
    return { owner: owner.trim(), targets: targets.split(',').map(target => target.trim()).filter(Boolean) }; });
  const matches = (pattern: string, value: string) => pattern === '*' || pattern.endsWith('/*') ?
    pattern === '*' || value === pattern.slice(0, -2) || value.startsWith(pattern.slice(0, -1)) : pattern === value;
  for (const file of project.files.values()) {
    if (file.builtin || basename(file.path) === 'export.aug') continue;
    const edges = new Set<string>();
    for (const item of file.items) if (item.kind === 'import') {
      const imports = project.imports.get(item) ?? [];
      for (const def of imports) {
        if (def.file !== file.path && !project.files.get(def.file)?.builtin) edges.add(def.file);
        const from = module(file.path), to = project.files.get(def.file)?.package ? item.from.join('/') : module(def.file);
        const rule = rules.find(rule => matches(rule.owner, from));
        if (!file.package && rule && from !== to && !project.files.get(def.file)?.builtin && !rule.targets.some(target => matches(target, to)))
          report(item.span, `${from} may not depend on ${to}; allowed: ${rule.targets.join(', ') || 'none'}`, 'MODULE');
        if (!file.package && project.config.strict_modules && dirname(def.file) === dirname(file.path)) {
          const surface = project.files.get(join(dirname(def.file), 'export.aug'));
          if (!surface?.items.some(entry => entry.kind === 'export' && entry.name === def.name && entry.from === basename(def.file, '.aug')))
            report(item.span, `Strict modules require ${def.name} from ${basename(def.file)} to appear in this folder's export.aug`, 'MODULE');
        }
      }
      if (!file.package && item.everything && enabled('wildcard_imports')) report(item.span, 'Expand everything to explicit named imports to keep dependencies visible', 'LINT', true);
    }
    modules.set(file.path, { key: file.path, dependencies: [...edges], span: file.items[0]?.span ?? { file: file.path, start: 0, end: 0, line: 1, column: 1 } });
    if (file.package) continue;
    const publicNodes = file.items.filter(item => ['class', 'interface', 'interceptor', 'function', 'composition'].includes(item.kind) && 'name' in item && !item.name.startsWith('_'));
    if (enabled('architecture') && edges.size > project.config.max_dependencies)
      report(modules.get(file.path)!.span, `${basename(file.path)} depends on ${edges.size} files; consider a smaller module contract`, 'LINT', true);
    const publicMembers = publicNodes.reduce((count, node) => count + 1 + ('methods' in node ? node.methods.filter(method => !method.name.startsWith('_')).length : 0) +
      ('fields' in node ? node.fields.filter(field => !field.name.startsWith('_')).length : 0), 0);
    if (enabled('public_helpers') && publicMembers > project.config.max_public_symbols)
      report(modules.get(file.path)!.span, `${publicMembers} public declarations and members; prefix implementation helpers with _ or expose a smaller folder surface`, 'LINT', true);
    if (enabled('public_helpers')) for (const node of publicNodes) if (node.kind === 'function') {
      const def = project.scopes.get(file.path)?.get(node.name);
      const imported = [...project.imports.values()].some(imports => imports.some(imported => imported.id === def?.id));
      const exported = project.files.get(join(dirname(file.path), 'export.aug'))?.items.some(item => item.kind === 'export' && item.name === node.name && item.from === basename(file.path, '.aug'));
      const others = file.items.filter(item => item !== node);
      const called = (value: unknown): boolean => !!value && typeof value === 'object' && (Array.isArray(value) ? value.some(called) :
        (value as { kind?: string; name?: string }).kind === 'name' && (value as { name: string }).name === node.name ||
          Object.entries(value).some(([key, child]) => key !== 'span' && called(child)));
      if (!imported && !exported && called(others)) report(node.span, `${node.name} is only used within this file; prefix an implementation helper with _`, 'LINT', true);
    }
  }
  orderGraph([...modules.values()], (node, path) => report(node.span,
    `Import cycle: ${path.map(path => relative(project.root, path)).join(' -> ')}`, 'MODULE'));
  for (const def of project.definitions.values()) {
    if (project.files.get(def.file)?.builtin) continue;
    const source = project.files.get(def.file)!.source;
    const declarations = [def.node, ...('methods' in def.node ? def.node.methods : [])];
    for (const node of declarations) {
      const doc = javadocBefore(source, 'annotations' in node && node.annotations?.length ? node.annotations[0].span.start : node.span.start);
      const effectiveDoc = node.kind === 'function' ? callableDocumentation(project, node, def) : doc;
      const own = !project.files.get(def.file)?.package;
      const publicNode = !def.name.startsWith('_') && !node.name.startsWith('_');
      const required = own && (project.config.spec.require_comments === 'all' || project.config.spec.require_comments === 'public' && publicNode);
      if (required && !effectiveDoc) report(node.span, `Document ${node.name} with Javadoc; main.yaml spec.require_comments is ${project.config.spec.require_comments}`, 'DOC');
      else if (own && publicNode && enabled('public_docs') && !effectiveDoc) report(node.span, `Document public ${node.name}'s contract with Javadoc`, 'DOC', true);
      if (doc) {
        const params = 'params' in node ? node.params : 'fields' in node ? node.fields : [];
        for (const label of doc.parameters.keys()) if (!params.some(param => (param.label ?? param.name) === label))
          report(node.span, `@param ${label} does not name a public input of ${node.name}`, 'DOC');
        for (const tag of doc.tags ?? []) {
          if (['return', 'returns'].includes(tag.name) && !('returns' in node && node.returns.name !== 'void'))
            report(node.span, `@${tag.name} requires a value-returning callable`, 'DOC');
          if (['throws', 'exception'].includes(tag.name)) {
            const name = tag.value.split(/\s/)[0];
            const errors = 'throws' in node ? node.throws : 'validationErrors' in node ? node.validationErrors ?? [] : [];
            if (!('annotations' in node && node.annotations?.length) && !errors.some(error => error.name === name)) report(node.span, `@${tag.name} ${name} is absent from ${node.name}'s unless contract`, 'DOC');
          }
          if (!['param', 'return', 'returns', 'throws', 'exception', 'deprecated', 'see'].includes(tag.name))
            report(node.span, `Unknown documentation tag @${tag.name}`, 'DOC');
        }
      }
      if (!project.files.get(def.file)?.package && 'throws' in node && enabled('broad_errors') && node.throws.some(error => error.name === 'Error'))
        report(node.span, `Prefer specific public errors on ${node.name}; unless Error hides recoverable cases`, 'LINT', true);
      const visit = (body: Stmt[]) => {
        for (const stmt of body) {
          if (stmt.kind === 'try') for (const clause of stmt.catches) {
            const mentions = (value: unknown): boolean => !!value && typeof value === 'object' && (Array.isArray(value) ? value.some(mentions) :
              (value as { kind?: string; name?: string }).kind === 'name' && (value as { name: string }).name === clause.name ||
              Object.entries(value).some(([key, child]) => key !== 'span' && mentions(child)));
            if (enabled('discarded_errors') && !mentions(clause.body)) report(clause.span, `Caught ${clause.name} is discarded; record or deliberately recover from the failure`, 'LINT', true);
            visit(clause.body);
          }
          if ('body' in stmt) visit(stmt.body);
          if (stmt.kind === 'if') { visit(stmt.then); visit(stmt.otherwise); }
          if (stmt.kind === 'match') stmt.cases.forEach(clause => visit(clause.body));
        }
      };
      if ('body' in node) visit(node.body ?? []);
      if ('constructorBody' in node) visit(node.constructorBody ?? []);
    }
  }
  return diagnostics;
}
