import type { BindingPattern, ClassDecl, MatchPattern, Expr, GenericHeader, InterceptorAnnotation, MethodDecl, Param, SourceFile, Span, Stmt, TopLevel } from './ast.ts';
import { typeName } from './ast.ts';
import { lex } from './lexer.ts';
import { parse } from './parser.ts';
import { importSource } from './git-packages.ts';
import type { Config } from './config.ts';

export type SourceStyle = Pick<Config, 'block_style' | 'indentation' | 'assignment'>;
type FormattingProject = {config: SourceStyle};
export interface FormattedSourceMapping {
  role:string;source:{start:number;end:number;line:number;endLine:number};formatted:{line:number;endLine:number};
}


/** Canonical syntax comes from the parsed program; comments stay with their lexical owner. */
export function formatFile(project: FormattingProject, file: SourceFile): string {
  return printFile(project, file, false).text;
}

/** Upgrade rejected legacy spellings without accepting them during compilation. */
export function migrateFile(project: FormattingProject, file: SourceFile): string {
  return printFile(project, file, true).text;
}

/** Format the checked syntax and retain declaration/statement positions in the displayed source. */
export function formatFileWithSourceMap(project:FormattingProject,file:SourceFile):{text:string;mappings:FormattedSourceMapping[]} {
  return printFile(project,file,false,true);
}

function printFile(project: FormattingProject, file: SourceFile, migrate: boolean, mappings=false): {text:string;mappings:FormattedSourceMapping[]} {
  const parsed = parse(file.path, file.source);
  if (parsed.diagnostics.some(issue => !migrate || issue.code !== 'SYNTAX')) throw new Error('Fix syntax errors before formatting this file');
  if(migrate) {
    const inspect=(value:unknown):void=>{
      if(!value||typeof value!=='object')return;
      if(Array.isArray(value)){value.forEach(inspect);return;}
      const node=value as {kind?:string;cases?:{pattern:string}[];span?:Span};
      if(node.kind==='match'&&node.cases!.filter(clause=>clause.pattern==='null').length>1&&/\bwhen\s+missing\b/.test(file.source.slice(node.span!.start,node.span!.end)))
        throw new Error('Merge the old missing and null cases into one null case before migrating; optional values now have two states');
      for(const [key,child] of Object.entries(value))if(key!=='span')inspect(child);
    };
    inspect(parsed.file.items);
  }
  const printer = new Printer(project, file, mappings);
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
    return Object.fromEntries(Object.entries(node).filter(([key, value]) => !['span', 'nameSpan', 'labelSpan', 'argLabelSpans', 'sourceSpan', 'headerEnd'].includes(key) && value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, shape(value)]));
  };
  if (JSON.stringify(shape(parsed.file.items)) !== JSON.stringify(shape(verified.file.items)))
    throw new Error('Formatter would change the parsed program; the file has been left unchanged');
  return {text:result,mappings:printer.mappings};
}
class Printer {
  readonly mappings:FormattedSourceMapping[]=[];
  private mapped=false;
  private sourceTokens:ReturnType<typeof lex>['tokens']=[];
  private remember(span:Span,role:string,line:number) {
    if(!this.mapped)return;
    let low=0,high=this.sourceTokens.length;
    while(low<high){const middle=(low+high)>>>1;if(this.sourceTokens[middle].span.end<=span.end)low=middle+1;else high=middle;}
    const last=this.sourceTokens[low-1];
    const endLine=last&&last.span.start>=span.start?last.endLine:span.line;
    this.mappings.push({role,source:{start:span.start,end:span.end,line:span.line,endLine},formatted:{line,endLine:this.lines.length}});
  }
  private comments: ReturnType<typeof lex>['tokens'];
  private lines: string[] = [];
  private level = 0;
  private step: string;
  private indent: boolean;
  private assign: string;
  private file: SourceFile;
  constructor(project: FormattingProject, file: SourceFile, mappings=false) {
    this.mapped=mappings;
    this.file = file;
    const tokens=lex(file.path,file.source,true).tokens;
    this.comments = tokens.filter(token => token.kind === 'comment');
    if(mappings)this.sourceTokens=tokens.filter(token=>token.kind!=='comment'&&token.kind!=='eof');
    this.step = project.config.indentation === 'tabs' ? '\t' : '    ';
    this.indent = project.config.block_style === 'indent';
    this.assign = project.config.assignment === 'to' ? 'to' : '=';
  }
  private line(text = '') {
    this.lines.push(...text.split('\n').map(line => line ? this.step.repeat(this.level) + line : ''));
  }
  private delimited(open: string, values: string[], close: string, trailing = ''): string {
    const flat = open + values.join(', ') + trailing + close;
    if (!values.length || (!flat.includes('\n') && flat.length <= 80 - this.level * 4)) return flat;
    return open + '\n' + values.map(value => this.step + value.replaceAll('\n', '\n' + this.step)).join(',\n') + trailing + '\n' + close;
  }
  private before(offset: number, parentColumn?: number) {
    while (this.comments[0]?.span.start < offset) {
      if (parentColumn !== undefined && this.comments[0].span.column <= parentColumn) break;
      const comment = this.comments.shift()!.value;
      for (const line of comment.split(/\r?\n/)) this.line(line.trimStart());
    }
  }
  private inline(offset: number, parentColumn?:number): string {
    const comments: string[] = [];
    while (this.comments[0]?.span.start < offset) {
      if(parentColumn!==undefined&&this.comments[0].span.column<=parentColumn)break;
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
  private mappedBlock(header:string,body:()=>void,span:Span,role:string) {
    this.before(span.start);
    const line=this.lines.length+1;
    this.block(header,body,span);
    this.remember(span,role,line);
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
      (label !== param.name ? ` to ${param.name}` : '') + (param.source ? ` from ${param.source.kind}${param.source.name ? ' ' + JSON.stringify(param.source.name) : ''}` : '') + (param.defaultValue ? ` ${this.assign} ${this.expression(param.defaultValue)}` : '') + this.inline(param.span.end);
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
    const line=this.lines.length+1;
    const header = `${method.endpoint ? `endpoint ${method.endpoint.method} ${JSON.stringify(method.endpoint.path)} as ` : ''}${method.fixture ? 'fixture ' : ''}${method.externC ? 'extern C ' + (method.valueAbi ? 'value ' : '') + (method.nativePure ? 'pure ' : '') : ''}${method.name}${this.generics(method)}` +
      `(${method.params.map(param => this.param(param)).join(', ')})` +
      (method.returns.name !== 'void' || method.declared?.returns ? ` ${method.endpoint?.streams ? 'streams' : 'returns'} ${method.returnOwnership === 'own' ? 'own ' : ''}${typeName(method.returns)}` : '') +
      (method.endpoint && method.endpoint.status !== 200 ? ` with status ${method.endpoint.status}` : '') +
      (method.changes?.length ? ` changes ${method.changes.join(' and ')}` : '') +
      (method.uses?.length ? ` uses ${method.uses.map(use => `${use.source}.${use.operation}`).join(' and ')}` : '') +
      (method.throws.length ? ` unless ${method.throws.map(type => typeName(type) + (method.endpoint?.errors.find(error => typeName(error.type) === typeName(type)) ? ' with status ' + method.endpoint.errors.find(error => typeName(error.type) === typeName(type))!.status : '')).join(' and ')}` : '');
    if (method.body) this.block(header, () => method.body!.forEach(stmt => this.statement(stmt)), method.span);
    else { this.line(header); this.before(method.span.end); }
    this.remember(method.span,'function',line);
  }
  private bindingPattern(pattern:BindingPattern):string {
    const comment=this.inline(pattern.span.start);
    if(pattern.kind==='nameBinding')return comment+pattern.name;
    if(pattern.kind==='tupleBinding'){
      const items=pattern.items.map(item=>this.bindingPattern(item));
      return comment+this.delimited('(',items,')',(items.length===1?',':'')+this.inline(pattern.span.end));
    }
    const fields=pattern.fields.map(field=>{
      const prefix=this.inline(field.nameSpan.start);
      return prefix+field.name+(field.pattern.kind==='nameBinding'&&field.pattern.name===field.name?'':': '+this.bindingPattern(field.pattern));
    });
    return comment+this.delimited('{',fields,'}',this.inline(pattern.span.end));
  }
  private matchPattern(clause:MatchPattern):string {
    return clause.pattern === 'else' ? 'else' : 'when ' + (clause.pattern === 'type' ? typeName(clause.type!) + ' ' + clause.name :
      clause.pattern === 'some' ? 'some ' + clause.name : clause.pattern === 'null' ? 'null' : this.expression(clause.literal!));
  }
  private expression(expr: Expr, precedence = 0): string {
    const comment = this.inline(expr.span.start);
    let value: string;
    if (expr.kind === 'matchValue') {
      const input = this.expression(expr.value,1), lineEnd = this.file.source.indexOf('\n',expr.value.span.end);
      const headerComment = this.inline(Math.min(lineEnd<0?this.file.source.length:lineEnd,expr.cases[0]?.span.start??expr.span.end));
      const block = this.indent ? ':' : ' {', close = this.indent ? '' : '\n' + this.step + '}';
      const cases = expr.cases.map(clause => {
        const head = this.inline(clause.span.start) + this.matchPattern(clause);
        const text = this.expression(clause.result), trailing = this.inline(clause.span.end, this.file.source[clause.span.end - 1] === '}' ? undefined : clause.span.column);
        const result = (text + (trailing ? ' ' + trailing.trimEnd() : '')).replaceAll('\n', '\n' + this.step.repeat(2));
        return this.step + head + block + '\n' + this.step.repeat(2) + result + close;
      });
      value = 'match ' + input + (headerComment ? ' ' + headerComment.trimEnd() : '') + block + '\n' + cases.join('\n') + (this.indent ? '' : '\n}');
      if (precedence) value = '(' + value + ')';
    }
    else if (expr.kind === 'recordCopy') value = this.expression(expr.base, 8) + ' with ' +
      this.delimited('(', expr.fields.map(field => field.name + '=' + this.expression(field.value)), ')');
    else if (expr.kind === 'interpolation') value = '$"' + expr.parts.map(part =>
      'text' in part
        ? JSON.stringify(part.text).slice(1, -1).replaceAll('{', '{{').replaceAll('}', '}}')
        : '{' + this.expression(part.value) + '}').join('') + '"';
    else if (expr.kind === 'markupText') value = expr.text;
    else if (expr.kind === 'markup') value = '<' + expr.tag + expr.attributes.map(attribute => ' ' + attribute.name + '={' + this.expression(attribute.value) + '}').join('') +
      (expr.children.length || !expr.tag ? '>' + expr.children.map(child => child.kind === 'markup' || child.kind === 'markupText' ? this.expression(child) : '{' + this.expression(child) + '}').join('') + '</' + expr.tag + '>' : ' />');
    else if (expr.kind === 'literal') value = expr.numericText ?? JSON.stringify(expr.value);
    else if (expr.kind === 'name') value = expr.name;
    else if (expr.kind === 'handle') value = `handle ${this.expression(expr.call, 8)}`;
    else if (expr.kind === 'formInput') value = 'input from form';
    else if (expr.kind === 'start') value = `start ${expr.worker ? 'worker ' : ''}${this.expression(expr.call, 8)}`;
    else if (expr.kind === 'wait') value = `wait for ${expr.tasks.map(task => this.expression(task, 8)).join(' and ')}`;
    else if (expr.kind === 'resolve') value = `resolve ${expr.name}` + (expr.typeArgs.length ? '<' + expr.typeArgs.map(typeName).join(', ') + '>' : '');
    else if (expr.kind === 'member') value = `${this.expression(expr.object, 8)}.${expr.name}`;
    else if (expr.kind === 'call' && expr.indexed && expr.callee.kind === 'member')
      value = `${this.expression(expr.callee.object, 8)}[${this.expression(expr.args[0])}]`;
    else if (expr.kind === 'call') {
      const open = this.expression(expr.callee, 8) + (expr.typeArgs.length ? '<' + expr.typeArgs.map(typeName).join(', ') + '>' : '') + '(';
      const values = expr.args.map((arg, index) => (expr.argLabels[index] ? expr.argLabels[index] + '=' : '') + this.expression(arg));
      value = this.delimited(open, values, ')', this.inline(expr.span.end));
    }
    else if (expr.kind === 'collection') {
      const open = expr.collection === 'List' ? '[' : expr.collection === 'Tuple' ? '(' : '{';
      const close = open === '[' ? ']' : open === '(' ? ')' : '}';
      const values = expr.collection === 'Map' ? expr.items.filter((_, index) => index % 2 === 0).map((item, index) =>
        `${this.expression(item)}: ${this.expression(expr.items[index * 2 + 1])}`) : expr.items.map(item => this.expression(item));
      value = this.delimited(open, values, close, (expr.collection === 'Tuple' && values.length === 1 ? ',' : '') + this.inline(expr.span.end));
    } else if (expr.kind === 'unary') {
      const power = expr.op === '!' ? 2.5 : 7;
      value = (expr.op === '!' ? 'not ' : expr.op) + this.expression(expr.value, power);
      if (power < precedence) value = '(' + value + ')';
    }
    else {
      const powers: Record<string, number> = { 'otherwise': 0.5, '||': 1, '&&': 2, '==': 3, '!=': 3, '<': 4, '>': 4, '<=': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 };
      const power = powers[expr.op]; value = `${this.expression(expr.left, power)} ${expr.op === '&&' ? 'and' : expr.op === '||' ? 'or' : expr.op} ${this.expression(expr.right, power + 1)}`;
      if (power < precedence) value = '(' + value + ')';
    }
    return comment + value;
  }
  private statement(stmt: Stmt) {
    this.before(stmt.span.start);
    const line=this.lines.length+1;
    if (stmt.kind === 'serve') this.line(`serve ${stmt.names.join(' and ')} on port ${this.expression(stmt.port)}`);
    else if (stmt.kind === 'lock') this.block(`lock ${this.expression(stmt.value)} as ${stmt.name}`, () => stmt.body.forEach(child => this.statement(child)), stmt.span);
    else if (stmt.kind === 'freeze') this.line(`freeze ${this.expression(stmt.value)} as ${stmt.name}`);
    else if (stmt.kind === 'expr') this.line(stmt.expr.kind === 'literal' && stmt.expr.value === null ? 'pass' : this.expression(stmt.expr));
    else if (stmt.kind === 'yield') this.line('yield ' + this.expression(stmt.value));
    else if (stmt.kind === 'assign') this.line(stmt.value.kind === 'resolve' && !stmt.declaredType && stmt.target.kind === 'name' ?
      `${this.expression(stmt.value)} to ${stmt.target.name}` : `${stmt.ownership === 'own' ? 'own ' : ''}` +
      `${stmt.declaredType ? typeName(stmt.declaredType) + ' ' : ''}${this.expression(stmt.target)} ${this.assign} ${this.expression(stmt.value)}`);
    else if (stmt.kind === 'destructure') this.line(`${stmt.pattern?this.bindingPattern(stmt.pattern):'('+stmt.names.join(', ')+')'} ${this.assign} ${this.expression(stmt.value)}`);
    else if (stmt.kind === 'return') this.line('return' + (stmt.value ? ' ' + this.expression(stmt.value) : ''));
    else if (stmt.kind === 'break' || stmt.kind === 'continue') this.line(stmt.kind);
    else if (stmt.kind === 'throw') this.line('throw ' + this.expression(stmt.value));
    else if (stmt.kind === 'if') {
      this.block('if ' + this.expression(stmt.test), () => stmt.then.forEach(child => this.statement(child)));
      if (stmt.otherwise.length) this.block('else', () => stmt.otherwise.forEach(child => this.statement(child)));
    } else if (stmt.kind === 'while') this.block('while ' + this.expression(stmt.test), () => stmt.body.forEach(child => this.statement(child)), stmt.span);
    else if (stmt.kind === 'for') this.block(`for ${stmt.pattern?this.bindingPattern(stmt.pattern):stmt.names.length === 1 ? stmt.names[0] : '(' + stmt.names.join(', ') + ')'} in ${this.expression(stmt.iterable)}`,
      () => stmt.body.forEach(child => this.statement(child)), stmt.span);
    else if (stmt.kind === 'match') this.block('match ' + this.expression(stmt.value,1), () => stmt.cases.forEach(clause => {
      const pattern = this.matchPattern(clause);
      this.mappedBlock(pattern, () => clause.body.forEach(child => this.statement(child)), clause.span,'match-case');
    }), stmt.span);
    else if (stmt.kind === 'try') {
      this.block('try', () => stmt.body.forEach(child => this.statement(child)));
      stmt.catches.forEach(clause => this.mappedBlock(`catch ${typeName(clause.type)} ${clause.name}`, () => clause.body.forEach(child => this.statement(child)), clause.span,'catch'));
      if (stmt.always) this.block('always', () => stmt.always!.forEach(child => this.statement(child)), stmt.span);
    } else this.block(stmt.kind + (stmt.kind === 'borrow' ? ' ' + stmt.name : ''), () => stmt.body.forEach(child => this.statement(child)), stmt.span);
    this.remember(stmt.span,stmt.kind,line);
  }
  private item(item: TopLevel) {
    this.before('annotations' in item ? item.annotations?.[0]?.span.start ?? item.span.start : item.span.start);
    const line=this.lines.length+1;
    if (item.kind === 'import') {
      this.line(`import ${item.everything ? 'everything' : item.names.join(' and ')} from ${importSource(item.from)}`);
    } else if (item.kind === 'export') this.line('export ' + (item.folder ? 'folder ' + item.name : `${item.name} from ${item.from}`));
    else if (item.kind === 'include') this.line('include ' + item.name);
    else if (item.kind === 'bind') this.line(`implement ${item.key}${item.keyTypeArgs.length ? '<' + item.keyTypeArgs.map(typeName).join(', ') + '>' : ''} with ${typeName(item.target)}` +
      (item.lifetime ? ' ' + item.lifetime : '') + (item.sharedMutation ? ' mutable' : ''));
    else if (item.kind === 'composition') this.block('composition ' + item.name, () => item.bindings.forEach(binding => this.item(binding)), item.span);
    else if (item.kind === 'resource') this.line('extern C resource '+item.name);
    else if (item.kind === 'function') this.method(item);
    else if (item.kind === 'class') {
      this.annotations(item.annotations);
      const header = `${item.record ? 'record ' : item.errorShorthand ? 'error ' : ''}${item.name}${this.generics(item)}(${item.fields.map(field => this.param(field, true)).join(', ')})`;
      const errors = item.validationErrors?.length ? ` unless ${item.validationErrors.map(typeName).join(' and ')}` : '';
      if (item.errorShorthand) this.line(header);
      else if (item.record) {
        if (item.constructorBody) this.block(header + errors, () => this.initializer(item), item.span);
        else this.line(header + errors);
      } else {
        this.block(header + errors + ' implements ' + item.implements.map(typeName).join(', '), () => {
          for (const field of item.stateFields ?? []) { this.before(field.span.start); this.line(`${field.mutable ? 'mutable ' : ''}${typeName(field.type)} ${field.name} ${this.assign} ${this.expression(field.initializer)}`); }
          if (item.constructorBody) this.initializer(item);
          item.methods.forEach(method => this.method(method));
        }, item.span);
      }
    } else if (item.kind === 'interface') this.block(`${item.capability ? 'capability' : 'interface'} ${item.name}${this.generics(item)}` +
      (item.extends.length ? ' extends ' + item.extends.map(typeName).join(', ') : ''), () => item.methods.forEach(method => this.method(method)), item.span);
    else if (item.kind === 'interceptor') this.block(`interceptor ${item.name}${this.generics(item)}(${item.fields.map(field => this.param(field, true)).join(', ')})`,
      () => item.methods.forEach(method => this.method(method)), item.span);
    else if (item.kind === 'test') this.block(`test ${item.endpointSuite ? 'endpoint ' : ''}${typeName(item.type)}${item.functionSuite ? '' : ' ' + item.name}`, () => item.groups.forEach(group =>
      this.mappedBlock('when ' + JSON.stringify(group.name), () => {
        group.setup.forEach(entry => this.item(entry));
        group.cases.forEach(test => this.mappedBlock('it ' + JSON.stringify(test.name) + (test.parameters ? ` for (${test.parameters.join(', ')}) in [` +
          test.rows!.map(row => this.expression(row)).join(', ') + ']' : ''), () => test.body.forEach(stmt => this.statement(stmt)), test.span,'test-case'));
      }, group.span,'test-group')), item.span);
    else this.statement(item);
    if(['import','export','include','bind','composition','resource','class','interface','interceptor','test'].includes(item.kind))this.remember(item.span,item.kind,line);
  }
  print(): string {
    for (const item of this.file.items) this.item(item);
    this.before(Infinity);
    return this.lines.join('\n').trimEnd() + '\n';
  }
  private initializer(item: ClassDecl): void {
    const span = (item.constructorBody as Stmt[] & {span?: Span}).span;
    if (span) this.before(span.start);
    this.block('initialize', () => item.constructorBody!.forEach(stmt => this.statement(stmt)), span);
  }
}
