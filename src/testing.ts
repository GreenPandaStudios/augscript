import { relative } from 'node:path';
import type { Diagnostic, Expr, Stmt, TestCase, TestDecl, TestGroup, TopLevel } from './ast.ts';
import { typeName } from './ast.ts';
import { checkProject, type CheckedProject } from './checker.ts';
import type { Definition, Project } from './project.ts';

export interface UnitTest {
  id: string;
  file: string;
  suite: TestDecl;
  group: TestGroup;
  test: TestCase;
  row?: Expr;
  rowIndex?: number;
}

export function discoverTests(project: Project): { tests: UnitTest[]; diagnostics: Diagnostic[] } {
  const tests: UnitTest[] = [];
  const diagnostics: Diagnostic[] = [];
  const report = (node: { span: TestDecl['span'] }, message: string) => diagnostics.push({
    file: node.span.file, line: node.span.line, column: node.span.column, code: 'TEST', message });
  for (const file of project.files.values()) {
    if (file.builtin || file.package) continue;
    const suites = new Set<string>();
    for (const suite of file.items) {
      if (suite.kind !== 'test') continue;
      const subject = project.scopes.get(file.path)?.get(suite.type.name);
      if (subject?.node.kind !== (suite.functionSuite || suite.endpointSuite ? 'function' : 'class') || subject.file !== file.path)
        report(suite, 'A test must name its class, function, or endpoint declared in the same file');
      if (suite.endpointSuite && (subject?.node.kind !== 'function' || !subject.node.endpoint))
        report(suite, 'test endpoint requires an endpoint declared in the same file');
      if (subject?.node.kind === 'class' && suite.type.args.length !== subject.node.typeParams.length)
        report(suite, `${suite.type.name} tests need ${subject.node.typeParams.length} type arguments`);
      if (suite.name === 'next') report(suite, 'next is reserved for interceptor continuations');
      const suiteType = typeName(suite.type);
      if (suites.has(suiteType)) report(suite, `Duplicate test suite for ${suiteType}`);
      suites.add(suiteType);
      if (!suite.groups.length) report(suite, 'A test suite needs at least one when group');
      const groups = new Set<string>();
      for (const group of suite.groups) {
        if (!group.name.trim()) report(group, 'A test group needs a nonempty name');
        if (groups.has(group.name)) report(group, `Duplicate test group ${group.name}`);
        groups.add(group.name);
        const checkSetup = (value: unknown): void => {
          if (!value || typeof value !== 'object') return;
          if (Array.isArray(value)) { value.forEach(checkSetup); return; }
          const node = value as Stmt;
          if (node.kind === 'return') report(node, 'Test setup cannot return before its case runs');
          for (const [key, child] of Object.entries(value)) if (key !== 'span') checkSetup(child);
        };
        checkSetup(group.setup);
        if (!group.cases.length) report(group, `Group ${group.name} needs at least one it case`);
        const cases = new Set<string>();
        for (const test of group.cases) {
          if (!test.name.trim()) report(test, 'A test case needs a nonempty name');
          if (cases.has(test.name)) report(test, `Duplicate test case ${test.name}`);
          cases.add(test.name);
          const id = `${relative(project.root, file.path)}:${encodeURIComponent(suiteType)}:${encodeURIComponent(group.name)}:${encodeURIComponent(test.name)}`;
          if (test.rows) {
            if (!test.rows.length) report(test, 'Parameterized cases need at least one row');
            test.rows.forEach((row, rowIndex) => {
              if (row.kind !== 'collection' || row.collection !== 'Tuple' || row.items.length !== test.parameters?.length)
                report(test, 'Each parameter row must be a tuple matching the declared names');
              tests.push({ id: `${id}:${rowIndex + 1}`, file: file.path, suite, group, test, row, rowIndex });
            });
          } else tests.push({ id, file: file.path, suite, group, test });
        }
      }
    }
  }
  return { tests, diagnostics };
}

/** Each case is a small program with its own composition root and fresh process. */
export function projectForTest(project: Project, unit: UnitTest): Project {
  const diagnostics = [...project.diagnostics];
  let declared = false;
  const typed = (stmt: Stmt): Stmt => {
    if (!unit.suite.endpointSuite && stmt.kind === 'assign' && stmt.target.kind === 'name' && stmt.target.name === unit.suite.name && !declared) {
      declared = true;
      if (stmt.declaredType && typeName(stmt.declaredType) !== typeName(unit.suite.type)) diagnostics.push({
        file: unit.file, line: stmt.span.line, column: stmt.span.column, code: 'TEST',
        message: `Test subject ${unit.suite.name} must use its header type ${typeName(unit.suite.type)}` });
      return { ...stmt, declaredType: unit.suite.type };
    }
    if (stmt.kind === 'if') return { ...stmt, then: stmt.then.map(typed), otherwise: stmt.otherwise.map(typed) };
    if (stmt.kind === 'try') return { ...stmt, body: stmt.body.map(typed),
      catches: stmt.catches.map(clause => ({ ...clause, body: clause.body.map(typed) })), always:stmt.always?.map(typed) };
    if (stmt.kind === 'while' || stmt.kind === 'for' || stmt.kind === 'scope' || stmt.kind === 'unsafe' || stmt.kind === 'borrow' || stmt.kind === 'lock') return { ...stmt, body: stmt.body.map(typed) };
    if (stmt.kind === 'match') return { ...stmt, cases: stmt.cases.map(clause => ({ ...clause, body: clause.body.map(typed) })) };
    return stmt;
  };
  const row: Stmt[] = unit.row && unit.test.parameters ? [{ kind: 'destructure', names: unit.test.parameters, value: unit.row, span: unit.test.span }] : [];
  const client: Stmt[] = unit.suite.endpointSuite ? [{kind:'assign', target:{kind:'name',name:unit.suite.name,span:unit.suite.span},
    value:{kind:'call',callee:{kind:'name',name:'HttpTestClient',span:unit.suite.span},args:[],argLabels:[],typeArgs:[],span:unit.suite.span},
    ownership:'managed',span:unit.suite.span}] : [];
  const firstStatement=unit.group.setup.findIndex(item=>item.kind!=='bind'&&item.kind!=='include');
  const bindingCount=firstStatement<0?unit.group.setup.length:firstStatement;
  const items: TopLevel[] = [...unit.group.setup.slice(0,bindingCount), ...client,
    ...unit.group.setup.slice(bindingCount).map(item => item.kind === 'bind' || item.kind === 'include' ? item : typed(item)), ...row, ...unit.test.body.map(typed)];
  if (!declared && !unit.suite.functionSuite && !unit.suite.endpointSuite) diagnostics.push({ file: unit.file, line: unit.test.span.line, column: unit.test.span.column,
    code: 'TEST', message: `Initialize ${unit.suite.name} in group setup or this it case` });
  const definitions = new Map<string, Definition>();
  const include = (def: Definition) => {
    if (definitions.has(def.id)) return;
    definitions.set(def.id, def);
    visit(def.node, def.file);
  };
  // Traverse declarations and expressions, including type references and tags.
  // Scopes retain explicit imports, so this cannot make an undeclared dependency visible.
  const visit = (value: unknown, file: string): void => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(item => visit(item, file)); return; }
    const record = value as Record<string, unknown>;
    if (typeof record.name === 'string') {
      const def = project.scopes.get(file)?.get(record.name);
      if (def) include(def);
    }
    if (record.kind === 'bind' && typeof record.key === 'string') {
      const def = project.scopes.get(file)?.get(record.key);
      if (def) include(def);
    }
    for (const [key, item] of Object.entries(record)) if (key !== 'span' && key !== 'nameSpan' && key !== 'sourceSpan') visit(item, file);
  };
  visit(unit.suite.type, unit.file);
  visit(items, unit.file);
  const main = { path: unit.file, source: project.files.get(unit.file)!.source, items };
  return { ...project, main, definitions, diagnostics, testMode: true, testBodyStart: unit.group.setup.length + client.length,
    testEndpoint: unit.suite.endpointSuite ? {file:unit.file,name:unit.suite.type.name} : undefined };
}

export function checkUnitTests(project: Project, tests: UnitTest[]): { unit: UnitTest; checked: CheckedProject }[] {
  return tests.map(unit => ({ unit, checked: checkProject(projectForTest(project, unit)) }));
}

export function uniqueDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
  return [...new Map(diagnostics.map(issue => [
    `${issue.file}:${issue.line}:${issue.column}:${issue.code}:${issue.message}`, issue])).values()];
}

export function mergeTestAnalysis(checked: CheckedProject, tests: { checked: CheckedProject }[]): void {
  for (const entry of tests) {
    for (const [key, scope] of entry.checked.scopes) checked.scopes.set(key, scope);
    const visit = (value: unknown): void => {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach(visit); return; }
      const expr = value as Expr;
      const type = entry.checked.expressionTypes.get(expr);
      if (type) checked.expressionTypes.set(expr, type);
      const plan = entry.checked.callPlans.get(expr);
      if (plan) checked.callPlans.set(expr, plan);
      for (const [key, child] of Object.entries(value)) if (key !== 'span') visit(child);
    };
    visit(entry.checked.project.main?.items);
  }
}
