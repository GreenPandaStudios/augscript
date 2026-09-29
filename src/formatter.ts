import type { ClassDecl, Expr, GenericHeader, InterceptorAnnotation, MethodDecl, Param, SourceFile, Span, Stmt, TopLevel } from './ast.ts';
import { typeName } from './ast.ts';
import { lex } from './lexer.ts';
import { parse } from './parser.ts';
import type { Project } from './project.ts';

/** Canonical syntax comes from the parsed program; comments stay with their lexical owner. */
export function formatFile(project: Project, file: SourceFile): string {
  const parsed = parse(file.path, file.source);
  if (parsed.diagnostics.length) throw new Error('Fix syntax errors before formatting this file');
  const printer = new Printer(project, file);
  const result = printer.print();
  const verified = parse(file.path, result);
  if (verified.diagnostics.length) {
    const issue = verified.diagnostics[0];
    throw new Error(`Formatter produced invalid syntax at ${file.path}:${issue.line}:${issue.column}: ${issue.message}`);
  }
  const shape = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.filter(item => !(item?.kind === 'expr' && item.expr.kind === 'literal' && item.expr.value === null)).map(shape);
    if (!value || typeof value !== 'object') return value;
    const node = value as Record<string, unknown>;
    if (node.kind === 'import' && node.everything) {
      const resolved = project.imports.get(node as unknown as import('./ast.ts').ImportDecl);
      // Match by original source position when this function reparsed the source.
      const original = file.items.find(item => item.kind === 'import' && item.span.start === (node.span as Span)?.start);
      const names = resolved ?? (original?.kind === 'import' ? project.imports.get(original) : undefined);
      if (names?.length) return shape({ ...node, names: names.map(def => def.name), everything: false });
    }
    return Object.fromEntries(Object.entries(node).filter(([key, value]) => !['span', 'nameSpan', 'sourceSpan'].includes(key) && value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, shape(value)]));
  };
  if (JSON.stringify(shape(parsed.file.items)) !== JSON.stringify(shape(verified.file.items)))
    throw new Error('Formatter would change the parsed program; the file has been left unchanged');
  return result;
}
class Printer {
  private comments: ReturnType<typeof lex>['tokens'];
  private lines: string[] = [];
  private level = 0;
  private step: string;
  private indent: boolean;
  private assign: string;
  private project: Project;
  private file: SourceFile;
  constructor(project: Project, file: SourceFile) {
    this.project = project; this.file = file;
    this.comments = lex(file.path, file.source, true).tokens.filter(token => token.kind === 'comment');
    this.step = project.config.indentation === 'tabs' ? '\t' : '    ';
    this.indent = project.config.block_style === 'indent';
    this.assign = project.config.assignment === 'to' ? 'to' : '=';
  }
  private line(text = '') { this.lines.push(text ? this.step.repeat(this.level) + text : ''); }
  private before(offset: number, parentColumn?: number) {
    while (this.comments[0]?.span.start < offset) {
      if (parentColumn !== undefined && this.comments[0].span.column <= parentColumn) break;
      const comment = this.comments.shift()!.value;
      for (const line of comment.split(/\r?\n/)) this.line(line.trimStart());
    }
  }
  private inline(offset: number): string {
    const comments: string[] = [];
    while (this.comments[0]?.span.start < offset) {
      let comment = this.comments.shift()!.value;
      if (comment.startsWith('//') || comment.startsWith('#')) comment = `/* ${comment.replace(/^(\/\/|#)\s*/, '').replaceAll('*/', '* /')} */`;
      comments.push(comment);
    }
    return comments.length ? comments.join(' ') + ' ' : '';
  }
  private block(header: string, body: () => void, span?: Span) {
    this.line(header + (this.indent ? ':' : ' {')); this.level++;
    const count = this.lines.length;
    body();
    const empty = this.lines.length === count;
    if (span) this.before(span.end, this.file.source[span.end - 1] === '}' ? undefined : span.column);
    if (empty) this.line('pass');
    this.level--; if (!this.indent) this.line('}');
  }
  private generics(node: GenericHeader) {
    return node.typeParams.length ? '<' + node.typeParams.map(name =>
      `${node.typeVariance?.[name] ? node.typeVariance[name] + ' ' : ''}${name}` +
      (node.typeConstraints?.[name]?.length ? ` implements ${node.typeConstraints[name].map(typeName).join(' and ')}` : '')).join(', ') + '>' : '';
  }
  private param(param: Param, field = false) {
    const label = field ? param.label ?? param.name : param.name;
    return this.inline(param.span.start) + `${param.injected ? 'resolve ' : ''}${param.mutable ? 'mutable ' : ''}` +
      `${param.ownership === 'managed' ? '' : param.ownership + ' '}${typeName(param.type)} ${label}` +
      (label !== param.name ? ` to ${param.name}` : '') + (param.source ? ` from ${param.source.kind}${param.source.name ? ' ' + JSON.stringify(param.source.name) : ''}` : '') + this.inline(param.span.end);
  }
  private annotations(tags: InterceptorAnnotation[] = []) {
    for (const tag of tags) {
      this.before(tag.span.start);
      this.line(`[${tag.name}${tag.typeArgs.length ? '<' + tag.typeArgs.map(typeName).join(', ') + '>' : ''}` +
        (tag.mappings.length ? '(' + tag.mappings.map(mapping => `${mapping.name}=${mapping.value ? this.expression(mapping.value) : mapping.source}`).join(', ') + ')' : '') + ']');
    }
  }
  private method(method: MethodDecl) {
    this.before(method.annotations?.[0]?.span.start ?? method.span.start); this.annotations(method.annotations);
    const header = `${method.endpoint ? `endpoint ${method.endpoint.method} ${JSON.stringify(method.endpoint.path)} as ` : ''}${method.fixture ? 'fixture ' : ''}${method.externC ? 'extern C ' + (method.valueAbi ? 'value ' : '') + (method.nativePure ? 'pure ' : '') : ''}${method.name}${this.generics(method)}` +
      `(${method.params.map(param => this.param(param)).join(', ')})` +
      (method.returns.name !== 'void' ? ` ${method.endpoint?.streams ? 'streams' : 'returns'} ${method.returnOwnership === 'own' ? 'own ' : ''}${typeName(method.returns)}` : '') +
      (method.endpoint && method.endpoint.status !== 200 ? ` with status ${method.endpoint.status}` : '') +
      (method.changes?.length ? ` changes ${method.changes.join(' and ')}` : '') +
      (method.uses?.length ? ` uses ${method.uses.map(use => `${use.source}.${use.operation}`).join(' and ')}` : '') +
      (method.throws.length ? ` unless ${method.throws.map(type => typeName(type) + (method.endpoint?.errors.find(error => typeName(error.type) === typeName(type)) ? ' with status ' + method.endpoint.errors.find(error => typeName(error.type) === typeName(type))!.status : '')).join(' and ')}` : '');
    if (method.body) this.block(header, () => method.body!.forEach(stmt => this.statement(stmt)), method.span);
    else { this.line(header); this.before(method.span.end); }
  }
  private expression(expr: Expr, precedence = 0): string {
    const comment = this.inline(expr.span.start);
    let value: string;
    if (expr.kind === 'markupText') value = expr.text;
    else if (expr.kind === 'markup') value = '<' + expr.tag + expr.attributes.map(attribute => ' ' + attribute.name + '={' + this.expression(attribute.value) + '}').join('') +
      (expr.children.length || !expr.tag ? '>' + expr.children.map(child => child.kind === 'markup' || child.kind === 'markupText' ? this.expression(child) : '{' + this.expression(child) + '}').join('') + '</' + expr.tag + '>' : ' />');
    else if (expr.kind === 'literal') value = expr.missing ? 'missing' : expr.numericText ?? JSON.stringify(expr.value);
    else if (expr.kind === 'name') value = expr.name;
    else if (expr.kind === 'handle') value = `handle ${this.expression(expr.call, 8)}`;
    else if (expr.kind === 'formInput') value = 'input from form';
    else if (expr.kind === 'start') value = `start ${this.expression(expr.call, 8)}`;
    else if (expr.kind === 'wait') value = `wait for ${expr.tasks.map(task => this.expression(task, 8)).join(' and ')}`;
    else if (expr.kind === 'resolve') value = `resolve ${expr.name}` + (expr.typeArgs.length ? '<' + expr.typeArgs.map(typeName).join(', ') + '>' : '');
    else if (expr.kind === 'member') value = `${this.expression(expr.object, 8)}.${expr.name}`;
    else if (expr.kind === 'call') value = this.expression(expr.callee, 8) + (expr.typeArgs.length ? '<' + expr.typeArgs.map(typeName).join(', ') + '>' : '') +
      '(' + expr.args.map((arg, index) => (expr.argLabels[index] ? expr.argLabels[index] + '=' : '') + this.expression(arg)).join(', ') + this.inline(expr.span.end) + ')';
    else if (expr.kind === 'collection') {
      const open = expr.collection === 'List' ? '[' : expr.collection === 'Tuple' ? '(' : '{';
      const close = open === '[' ? ']' : open === '(' ? ')' : '}';
      const values = expr.collection === 'Map' ? expr.items.filter((_, index) => index % 2 === 0).map((item, index) =>
        `${this.expression(item)}: ${this.expression(expr.items[index * 2 + 1])}`) : expr.items.map(item => this.expression(item));
      value = open + values.join(', ') + (expr.collection === 'Tuple' && values.length === 1 ? ',' : '') + this.inline(expr.span.end) + close;
    } else if (expr.kind === 'unary') value = expr.op + this.expression(expr.value, 7);
    else {
      const powers: Record<string, number> = { '||': 1, '&&': 2, '==': 3, '!=': 3, '<': 4, '>': 4, '<=': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '/': 6 };
      const power = powers[expr.op]; value = `${this.expression(expr.left, power)} ${expr.op} ${this.expression(expr.right, power + 1)}`;
      if (power < precedence) value = '(' + value + ')';
    }
    return comment + value;
  }
  private statement(stmt: Stmt) {
    this.before(stmt.span.start);
    if (stmt.kind === 'serve') this.line(`serve ${stmt.names.join(' and ')} on port ${this.expression(stmt.port)}`);
    else if (stmt.kind === 'lock') this.block(`lock ${this.expression(stmt.value)} as ${stmt.name}`, () => stmt.body.forEach(child => this.statement(child)), stmt.span);
    else if (stmt.kind === 'freeze') this.line(`freeze ${this.expression(stmt.value)} as ${stmt.name}`);
    else if (stmt.kind === 'expr') this.line(stmt.expr.kind === 'literal' && stmt.expr.value === null && !stmt.expr.missing ? 'pass' : this.expression(stmt.expr));
    else if (stmt.kind === 'yield') this.line('yield ' + this.expression(stmt.value));
    else if (stmt.kind === 'assign') this.line(stmt.value.kind === 'resolve' && !stmt.declaredType && stmt.target.kind === 'name' ?
      `${this.expression(stmt.value)} to ${stmt.target.name}` : `${stmt.ownership === 'own' ? 'own ' : ''}` +
      `${stmt.declaredType ? typeName(stmt.declaredType) + ' ' : ''}${this.expression(stmt.target)} ${this.assign} ${this.expression(stmt.value)}`);
    else if (stmt.kind === 'destructure') this.line(`(${stmt.names.join(', ')}) ${this.assign} ${this.expression(stmt.value)}`);
    else if (stmt.kind === 'return') this.line('return' + (stmt.value ? ' ' + this.expression(stmt.value) : ''));
    else if (stmt.kind === 'throw') this.line('throw ' + this.expression(stmt.value));
    else if (stmt.kind === 'if') {
      this.block('if ' + this.expression(stmt.test), () => stmt.then.forEach(child => this.statement(child)));
      if (stmt.otherwise.length) this.block('else', () => stmt.otherwise.forEach(child => this.statement(child)));
    } else if (stmt.kind === 'while') this.block('while ' + this.expression(stmt.test), () => stmt.body.forEach(child => this.statement(child)), stmt.span);
    else if (stmt.kind === 'for') this.block(`for ${stmt.names.length === 1 ? stmt.names[0] : '(' + stmt.names.join(', ') + ')'} in ${this.expression(stmt.iterable)}`,
      () => stmt.body.forEach(child => this.statement(child)), stmt.span);
    else if (stmt.kind === 'match') this.block('match ' + this.expression(stmt.value), () => stmt.cases.forEach(clause => {
      const pattern = clause.pattern === 'else' ? 'else' : 'when ' + (clause.pattern === 'some' ? 'some ' + clause.name :
        clause.pattern === 'literal' ? this.expression(clause.literal!) : clause.pattern === 'type' ? typeName(clause.type!) + ' ' + clause.name : clause.pattern);
      this.block(pattern, () => clause.body.forEach(child => this.statement(child)), clause.span);
    }), stmt.span);
    else if (stmt.kind === 'try') {
      this.block('try', () => stmt.body.forEach(child => this.statement(child)));
      stmt.catches.forEach(clause => this.block(`catch ${typeName(clause.type)} ${clause.name}`, () => clause.body.forEach(child => this.statement(child)), clause.span));
      if (stmt.always) this.block('always', () => stmt.always!.forEach(child => this.statement(child)), stmt.span);
    } else this.block(stmt.kind + (stmt.kind === 'borrow' ? ' ' + stmt.name : ''), () => stmt.body.forEach(child => this.statement(child)), stmt.span);
  }
  private item(item: TopLevel) {
    this.before('annotations' in item ? item.annotations?.[0]?.span.start ?? item.span.start : item.span.start);
    if (item.kind === 'import') {
      const names = item.everything ? (this.project.imports.get(item) ?? []).map(def => def.name) : item.names;
      this.line(`import ${names.join(' and ') || 'everything'} from ${item.from.join('.')}`);
    } else if (item.kind === 'export') this.line('export ' + (item.folder ? 'folder ' + item.name : `${item.name} from ${item.from}`));
    else if (item.kind === 'include') this.line('include ' + item.name);
    else if (item.kind === 'bind') this.line(`implement ${item.key}${item.keyTypeArgs.length ? '<' + item.keyTypeArgs.map(typeName).join(', ') + '>' : ''} with ${typeName(item.target)}` +
      (item.lifetime ? ' ' + item.lifetime : '') + (item.sharedMutation ? ' mutable' : ''));
    else if (item.kind === 'composition') this.block('composition ' + item.name, () => item.bindings.forEach(binding => this.item(binding)), item.span);
    else if (item.kind === 'function') this.method(item);
    else if (item.kind === 'class') {
      this.annotations(item.annotations);
      const header = `${item.record ? 'record ' : ''}${item.name}${this.generics(item)}(${item.fields.map(field => this.param(field, true)).join(', ')})`;
      if (item.record) {
        const errors = item.validationErrors?.length ? ` unless ${item.validationErrors.map(typeName).join(' and ')}` : '';
        if (item.constructorBody) this.block(header + errors + ' =>', () => item.constructorBody!.forEach(stmt => this.statement(stmt)), item.span);
        else this.line(header + errors);
      } else {
        if (item.constructorBody) this.block(header + ' =>', () => item.constructorBody!.forEach(stmt => this.statement(stmt)));
        this.block((item.constructorBody ? '' : header + ' ') + 'implements ' + item.implements.map(typeName).join(', '), () => {
          for (const field of item.stateFields ?? []) this.line(`${field.mutable ? 'mutable ' : ''}${typeName(field.type)} ${field.name} = ${this.expression(field.initializer)}`);
          item.methods.forEach(method => this.method(method));
        }, item.span);
      }
    } else if (item.kind === 'interface') this.block(`${item.capability ? 'capability' : 'interface'} ${item.name}${this.generics(item)}` +
      (item.extends.length ? ' extends ' + item.extends.map(typeName).join(', ') : ''), () => item.methods.forEach(method => this.method(method)), item.span);
    else if (item.kind === 'interceptor') this.block(`interceptor ${item.name}${this.generics(item)}(${item.fields.map(field => this.param(field, true)).join(', ')})`,
      () => item.methods.forEach(method => this.method(method)), item.span);
    else if (item.kind === 'test') this.block(`test ${item.endpointSuite ? 'endpoint ' : ''}${typeName(item.type)}${item.functionSuite ? '' : ' ' + item.name}`, () => item.groups.forEach(group =>
      this.block('when ' + JSON.stringify(group.name), () => {
        group.setup.forEach(entry => this.item(entry));
        group.cases.forEach(test => this.block('it ' + JSON.stringify(test.name) + (test.parameters ? ` for (${test.parameters.join(', ')}) in [` +
          test.rows!.map(row => this.expression(row)).join(', ') + ']' : ''), () => test.body.forEach(stmt => this.statement(stmt)), test.span));
      }, group.span)), item.span);
    else this.statement(item);
  }
  print(): string {
    for (const item of this.file.items) this.item(item);
    this.before(Infinity);
    return this.lines.join('\n').trimEnd() + '\n';
  }
}
