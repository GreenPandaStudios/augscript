import type {
  BindDecl, BindingPattern, ClassDecl, Diagnostic, ExportDecl, Expr, GenericHeader, ImportDecl, IncludeDecl, InterfaceDecl,
  InterceptorAnnotation, InterceptorDecl, MatchPattern, MethodDecl, Param, SourceFile, Span, Stmt, TestDecl, TestGroup, TopLevel, TypeRef,
} from './ast.ts';
import { bindingNames, syntheticType } from './ast.ts';
import { lex, type Token } from './lexer.ts';
import { basename } from 'node:path';

class ParseFailure extends Error {
  readonly diagnostic: Diagnostic;
  constructor(diagnostic: Diagnostic) { super(diagnostic.message); this.diagnostic = diagnostic; }
}

export function parse(file: string, source: string): { file: SourceFile; diagnostics: Diagnostic[] } {
  const scanned = lex(file, source);
  const parser = new Parser(scanned.tokens, basename(file) === 'main.aug', source);
  const items = parser.parseItems();
  return { file: { path: file, source, items }, diagnostics: [...scanned.diagnostics, ...parser.diagnostics] };
}

class Parser {
  private position = 0;
  readonly diagnostics: Diagnostic[] = [];
  private readonly tokens: Token[];
  private readonly isMain: boolean;
  private expressionDepth = 0;
  private readonly lines: string[];
  private readonly blocks: { indentation?: string }[] = [];
  constructor(tokens: Token[], isMain: boolean, source: string) {
    this.tokens = tokens;
    this.isMain = isMain;
    this.lines = source.split('\n');
  }

  private current(offset = 0): Token { return this.tokens[Math.min(this.position + offset, this.tokens.length - 1)]; }
  private at(kind: string): boolean { return this.current().kind === kind; }
  private take(): Token { return this.tokens[this.position++]; }
  private match(kind: string): Token | undefined { return this.at(kind) ? this.take() : undefined; }
  private expect(kind: string): Token {
    if (this.at(kind)) return this.take();
    const token = this.current();
    throw new ParseFailure({ file: token.span.file, line: token.span.line, column: token.span.column,
      message: `Expected ${kind}, found ${token.kind === 'eof' ? 'end of file' : JSON.stringify(token.value)}`,
      code: 'PARSE' });
  }
  private word(value: string): Token {
    if (this.current().value === value) return this.take();
    return this.expect(value);
  }
  private span(start: Span, end: Span = this.tokens[Math.max(0, this.position - 1)].span): Span {
    return { ...start, end: end.end };
  }
  private lineBreak(): boolean {
    const previous = this.tokens[Math.max(0, this.position - 1)];
    return this.current().span.line > previous.endLine;
  }
  private endStatement(): void {
    if (this.match(';') || this.at('}') || this.at('eof') || this.lineBreak()) return;
    this.expect('; or a newline');
  }
  private recover(): void {
    this.expressionDepth = 0;
    while (!this.at('eof') && !this.at(';') && !this.at('}') && !this.lineBreak()) this.take();
    if (this.at(';')) this.take();
  }

  private closeBrace(): void {
    if (!this.at('eof')) { this.expect('}'); this.blocks.pop(); return; }
    const span = this.current().span;
    this.diagnostics.push({ file: span.file, line: span.line, column: span.column,
      code: 'PARSE', message: 'Expected }, found end of file' });
    this.blocks.pop();
  }

  private indentation(token: Token | Span): string {
    const span = 'span' in token ? token.span : token;
    return /^[\t ]*/.exec(this.lines[span.line - 1] ?? '')![0];
  }

  private layoutEnd(colonIndex: number, header: Span): { index: number; indentation: string } {
    const colon = this.tokens[colonIndex];
    const first = this.tokens[colonIndex + 1];
    const base = this.indentation(header);
    const indentation = this.indentation(first);
    const fail = (token: Token, message: string): never => {
      throw new ParseFailure({ ...token.span, code: 'INDENT', message });
    };
    if (first.kind === 'eof' || first.span.line <= colon.endLine)
      fail(first, 'A colon block needs an indented body on the following line');
    if (/[ ]/.test(indentation) && /\t/.test(indentation))
      fail(first, 'Use tabs or spaces for indentation; do not mix them in a block prefix');
    if (!indentation.startsWith(base) || indentation.length <= base.length)
      fail(first, 'Indent the block body beyond its header; use pass for an empty body');
    let depth = 0;
    let previousLine = colon.endLine;
    for (let index = colonIndex + 1; index < this.tokens.length; index++) {
      const token = this.tokens[index];
      if (token.kind === 'eof') return { index, indentation };
      if (token.span.line > previousLine && depth === 0) {
        const prefix = this.indentation(token);
        if (/[ ]/.test(prefix) && /\t/.test(prefix))
          fail(token, 'Use tabs or spaces for indentation; do not mix them in a block prefix');
        if (prefix.length <= base.length) {
          if (prefix !== base && !base.startsWith(prefix))
            fail(token, 'A dedent must match an enclosing block indentation');
          return { index, indentation };
        }
        if (!prefix.startsWith(indentation))
          fail(token, 'A dedent must match an enclosing block indentation');
      }
      if (['(', '[', '{', 'jsx_open'].includes(token.kind)) depth++;
      if ([')', ']', '}', 'jsx_self', 'jsx_close_end'].includes(token.kind)) {
        if (depth === 0) return { index, indentation };
        depth--;
      }
      previousLine = token.endLine;
    }
    return { index: this.tokens.length - 1, indentation };
  }

  private openBlock(header: Span): void {
    if (this.match('{')) { this.blocks.push({}); return; }
    const colonIndex = this.position;
    this.expect(':');
    const layout = this.layoutEnd(colonIndex, header);
    const boundary = this.tokens[layout.index];
    const previous = this.tokens[layout.index - 1];
    this.tokens.splice(layout.index, 0, { kind: '}', value: '',
      span: { ...boundary.span, end: boundary.span.start }, endLine: previous.endLine });
    this.blocks.push({ indentation: layout.indentation });
  }

  private checkBlockIndentation(): void {
    const expected = this.blocks.at(-1)?.indentation;
    if (expected !== undefined && this.indentation(this.current()) !== expected)
      throw new ParseFailure({ ...this.current().span, code: 'INDENT',
        message: 'Unexpected indentation; introduce a nested block with : or braces' });
  }

  private emptyBody(): boolean {
    if (!this.match('pass')) return false;
    this.endStatement();
    return true;
  }

  parseItems(): TopLevel[] {
    const items: TopLevel[] = [];
    while (!this.at('eof')) {
      const before = this.position;
      try { items.push(this.parseItem()); }
      catch (error) {
        if (!(error instanceof ParseFailure)) throw error;
        this.diagnostics.push(error.diagnostic);
        this.recover();
        if (this.position === before && !this.at('eof')) this.take();
      }
    }
    return items;
  }

  private parseItem(): TopLevel {
    if (this.at('[') && this.looksLikeAnnotation()) {
      const annotations = this.parseAnnotations();
      let item: ClassDecl | MethodDecl;
      if (this.at('endpoint')) item = this.parseEndpoint();
      else if (this.looksLikeBareClass()) item = this.parseClass();
      else if (this.at('extern')) { this.take(); this.expect('C'); item = this.parseFunction(true); }
      else if (this.looksLikeBareFunction()) item = this.parseFunction(false);
      else throw new ParseFailure({ ...annotations[0].span, code: 'INTERCEPTOR',
        message: 'Interceptor annotations belong on functions, methods, or class constructors' });
      item.annotations = annotations;
      return item;
    }
    if (this.at('import')) return this.parseImport();
    if (this.at('endpoint')) return this.parseEndpoint();
    if (this.at('export')) return this.parseExport();
    if (this.at('bind') || this.at('implement')) return this.parseBind();
    if (this.at('interface') || this.at('capability')) return this.parseInterface();
    if (this.at('interceptor')) return this.parseInterceptor();
    if (this.at('test')) return this.parseTest();
    if (this.match('fixture')) return { ...this.parseFunction(false), fixture: true };
    if (this.at('record')) return this.parseRecord();
    if (this.current().value === 'error' && this.current(1).kind === 'identifier') return this.parseError();
    if (this.at('include')) return this.parseInclude();
    if (this.match('composition')) {
      const start = this.tokens[this.position - 1].span;
      const name = this.expect('identifier').value;
      this.openBlock(start);
      const bindings: BindDecl[] = [];
      while (!this.at('}') && !this.at('eof')) {
        this.checkBlockIndentation();
        if (!this.at('implement') && !this.at('bind')) this.expect('implement');
        bindings.push(this.parseBind());
      }
      this.closeBrace();
      return { kind: 'composition', name, typeParams: [], bindings, span: this.span(start) };
    }
    if (this.at('extern')) {
      const start=this.take().span; this.expect('C');
      if(this.current().value==='resource'){
        this.take();const name=this.expect('identifier').value;this.endStatement();
        return {kind:'resource',name,typeParams:[],span:this.span(start)};
      }
      return this.parseFunction(true);
    }
    if (this.looksLikeBareClass()) return this.parseClass();
    if (this.looksLikeBareFunction()) return this.parseFunction(false);
    if (this.at('class') || this.at('function')) this.rejectDeclarationKeyword();
    if (this.looksLikeMistypedFunctionKeyword()) this.rejectDeclarationKeyword();
    return this.parseStatement();
  }

  private looksLikeAnnotation(): boolean {
    const saved = this.position;
    try {
      this.parseAnnotations();
      return this.looksLikeBareClass() || this.looksLikeBareFunction() || this.at('extern') || this.at('endpoint');
    } catch (error) {
      if (!(error instanceof ParseFailure)) throw error;
      return false;
    } finally { this.position = saved; }
  }

  private testName(): string {
    if (this.at('string') || /^[A-Za-z_]\w*$/.test(this.current().value)) return this.take().value;
    return this.expect('identifier').value;
  }

  private parseTest(): TestDecl {
    const start = this.take().span;
    const endpointSuite = !!this.match('endpoint');
    const type = this.parseType();
    const functionSuite = !endpointSuite && !this.at('identifier');
    const name = functionSuite ? type.name : this.take().value;
    this.openBlock(start);
    const groups: TestGroup[] = [];
    while (!this.at('}') && !this.at('eof')) {
      this.checkBlockIndentation();
      const groupStart = this.expect('when').span;
      const groupName = this.testName();
      this.openBlock(groupStart);
      const setup: TestGroup['setup'] = [];
      const cases: TestGroup['cases'] = [];
      let seenSetup = false;
      while (!this.at('}') && !this.at('eof')) {
        this.checkBlockIndentation();
        if (this.match('it')) {
          const caseStart = this.tokens[this.position - 1].span;
          const caseName = this.testName();
          let parameters: string[] | undefined, rows: Expr[] | undefined;
          if (this.match('for')) {
            parameters = this.patternNames(); this.expect('in');
            const values = this.parseExpression();
            if (values.kind !== 'collection' || values.collection !== 'List') throw new ParseFailure({ ...values.span,
              code: 'TEST', message: 'Parameterized cases need a list of tuple rows' });
            rows = values.items;
          }
          const body = this.parseBlock(caseStart);
          cases.push({ name: caseName, body, parameters, rows, span: this.span(caseStart) });
        } else {
          if (cases.length) throw new ParseFailure({ ...this.current().span,
            code: 'TEST', message: 'Put group setup before its it cases' });
          if (this.at('implement') || this.at('bind') || this.at('include')) {
            if (seenSetup) throw new ParseFailure({ ...this.current().span,
              code: 'TEST', message: 'Put test bindings before group setup statements' });
            setup.push(this.at('include') ? this.parseInclude() : this.parseBind());
          } else { seenSetup = true; setup.push(this.parseStatement()); }
        }
      }
      this.closeBrace();
      groups.push({ name: groupName, setup, cases, span: this.span(groupStart) });
    }
    this.closeBrace();
    return { kind: 'test', type, name, functionSuite, endpointSuite, groups, span: this.span(start) };
  }

  private parseAnnotations(): InterceptorAnnotation[] {
    const annotations: InterceptorAnnotation[] = [];
    while (this.at('[')) {
      const start = this.take().span;
      const token = this.expect('identifier');
      const typeArgs = this.at('<') ? this.parseCallTypeArgs() : [];
      const mappings: InterceptorAnnotation['mappings'] = [];
      if (this.match('(')) {
        while (!this.at(')') && !this.at('eof')) {
          const name = this.expect('identifier');
          if (!this.match('to')) this.expect('=');
          if (this.current().kind !== 'string' && /^[A-Za-z_]\w*$/.test(this.current().value) && !['true','false','null'].includes(this.current().value)) {
            const source = this.take();
            mappings.push({name:name.value,source:source.value,span:this.span(name.span),sourceSpan:source.span});
          } else {
            const value = this.parseExpression();
            mappings.push({name:name.value,source:'',value,span:this.span(name.span),sourceSpan:value.span});
          }
          if (!this.match(',')) break;
        }
        this.expect(')');
      }
      this.expect(']');
      annotations.push({ name: token.value, nameSpan: token.span, typeArgs, mappings,
        span: this.span(start) });
    }
    return annotations;
  }

  private parseInterceptor(): InterceptorDecl {
    const start = this.take().span;
    const name = this.expect('identifier');
    const { typeParams, typeConstraints, typeVariance } = this.parseTypeParams();
    const fields = this.at('(') ? this.parseParams(true) : [];
    this.openBlock(start);
    const methods: MethodDecl[] = [];
    while (!this.at('}') && !this.at('eof')) {
      this.checkBlockIndentation();
      if (!this.emptyBody()) methods.push(this.parseFunction(false));
    }
    this.closeBrace();
    return { kind: 'interceptor', name: name.value, nameSpan: name.span, typeParams, typeConstraints, typeVariance,
      fields, methods, span: this.span(start) };
  }

  private rejectDeclarationKeyword(): never {
    const token = this.current();
    throw new ParseFailure({ file: token.span.file, line: token.span.line,
      column: token.span.column, code: 'PARSE',
      message: `Remove ${token.value}; declarations start with their name` });
  }

  private looksLikeMistypedFunctionKeyword(): boolean {
    return this.at('identifier') && this.current(1).kind === 'identifier' &&
      ['(', '<'].includes(this.current(2).kind);
  }

  private looksLikeBareFunction(): boolean {
    if (!this.at('identifier') && !['start', 'wait', 'missing'].includes(this.current().kind)) return false;
    const saved = this.position;
    try {
      this.take();
      this.parseTypeParams();
      this.parseParams();
      return ['returns', 'unless', 'throws', 'changes', 'uses', '{', ':'].includes(this.current().kind) ||
        (!this.isMain && (this.at(';') || this.at('}') || this.at('eof') || this.lineBreak()));
    } catch (error) {
      if (!(error instanceof ParseFailure)) throw error;
      return false;
    } finally {
      this.position = saved;
    }
  }

  private looksLikeBareClass(): boolean {
    if (!this.at('identifier')) return false;
    const saved = this.position;
    const start = this.current().span;
    try {
      this.take();
      this.parseTypeParams();
      if (this.at('(')) this.parseParams(true);
      if(this.match('unless')){
        this.parseType();while(this.match('and')||this.match(','))this.parseType();
      }
      if (this.match('=>')) {
        return true;
      }
      return this.at('implements');
    } catch (error) {
      if (!(error instanceof ParseFailure)) throw error;
      return false;
    } finally {
      this.position = saved;
    }
  }

  private parseImport(): ImportDecl {
    const start = this.take().span;
    const everything = !!this.match('everything');
    const names = everything ? [] : [this.expect('identifier').value];
    while (!everything && this.match('and')) names.push(this.expect('identifier').value);
    this.expect('from');
    const from = [this.at('string') ? this.take().value : this.expect('identifier').value];
    if (!/^(?:https:\/\/|git\+(?:https|file):\/\/)/.test(from[0]) && this.tokens[this.position - 1].kind === 'string')
      throw new ParseFailure({ ...start, code:'IMPORT', message:'A quoted import source must be a public repository URL' });
    while (this.match('.')) from.push(this.expect('identifier').value);
    this.endStatement();
    return { kind: 'import', names, everything, from, span: this.span(start) };
  }

  private parseExport(): ExportDecl {
    const start = this.take().span;
    if (this.match('folder')) {
      const name = this.expect('identifier').value;
      this.endStatement();
      return { kind: 'export', name, folder: true, span: this.span(start) };
    }
    const name = this.expect('identifier').value;
    this.expect('from');
    const from = this.expect('identifier').value;
    this.endStatement();
    return { kind: 'export', name, from, folder: false, span: this.span(start) };
  }

  private parseInclude(): IncludeDecl {
    const start = this.take().span;
    const name = this.expect('identifier').value; this.endStatement();
    return { kind: 'include', name, span: this.span(start) };
  }

  private parseBind(): BindDecl {
    const keyword = this.take();
    const start = keyword.span;
    if (keyword.kind === 'bind') this.diagnostics.push({...start, code: 'SYNTAX',
      message: 'Use implement Key with Implementation instead of bind Key to Implementation'});
    const key = this.expect('identifier').value;
    const keyTypeArgs = this.at('<') ? this.parseCallTypeArgs() : [];
    this.expect(keyword.kind === 'implement' ? 'with' : 'to');
    const target = this.parseType();
    const lifetime = ['shared', 'fresh', 'scoped'].includes(this.current().kind) ? this.take().kind as BindDecl['lifetime'] : undefined;
    const sharedMutation = !!this.match('mutable');
    this.endStatement();
    return { kind: 'bind', key, keyTypeArgs, target, lifetime, sharedMutation, span: this.span(start) };
  }

  private parseRecord(): ClassDecl {
    const start = this.take().span;
    const name = this.expect('identifier').value;
    const header = this.parseTypeParams();
    const fields = this.parseParams(true);
    const validationErrors: TypeRef[] = [];
    const validationDeclared = !!this.match('unless');
    if (validationDeclared) {
      validationErrors.push(this.parseType());
      while (this.match('and') || this.match(',')) validationErrors.push(this.parseType());
    }
    const headerEnd = this.current().span.start;
    let constructorBody = this.match('=>') ? this.parseBlock(start) : undefined;
    let hasBody = !!constructorBody;
    if (!constructorBody && (this.at('{') || this.at(':'))) {
      hasBody = true;
      this.openBlock(start);
      while (!this.at('}') && !this.at('eof')) {
        this.checkBlockIndentation();
        if (this.emptyBody()) continue;
        const initializer = this.expect('initialize');
        if (constructorBody) throw new ParseFailure({...initializer.span, code: 'PARSE', message: 'A record has at most one initialize block'});
        constructorBody = this.parseBlock(initializer.span);
      }
      this.closeBrace();
    }
    if (!hasBody) this.endStatement();
    return { kind: 'class', record: true, name, ...header, fields, constructorBody,
      validationErrors, validationDeclared, headerEnd, implements: [], methods: [], span: this.span(start) };
  }

  private parseClass(): ClassDecl {
    const start = this.current().span;
    const name = this.expect('identifier').value;
    const { typeParams, typeConstraints, typeVariance } = this.parseTypeParams();
    const fields = this.at('(') ? this.parseParams(true) : [];
    const validationErrors:TypeRef[]=[];
    const validationDeclared=!!this.match('unless');
    if(validationDeclared){validationErrors.push(this.parseType());while(this.match('and')||this.match(','))validationErrors.push(this.parseType());}
    let constructorBody = this.match('=>') ? this.parseBlock(start) : undefined;
    const implemented: TypeRef[] = [];
    if (!this.at('implements')) throw new ParseFailure({ ...start, code: 'PARSE',
      message: `${name} has a constructor body; add implements Interface after that body to declare a class` });
    this.expect('implements');
    implemented.push(this.parseType());
    while (this.match(',')) implemented.push(this.parseType());
    const headerEnd = this.current().span.start;
    this.openBlock(start);
    const methods: MethodDecl[] = [];
    const stateFields: NonNullable<ClassDecl['stateFields']> = [];
    while (!this.at('}') && !this.at('eof')) {
      this.checkBlockIndentation();
      if (this.emptyBody()) continue;
      if (this.match('initialize')) {
        const initializer = this.tokens[this.position - 1];
        if (constructorBody) throw new ParseFailure({...initializer.span, code: 'PARSE', message: 'A class has at most one initialize block'});
        if (methods.length) throw new ParseFailure({...initializer.span, code: 'PARSE', message: 'Put initialize before the class methods'});
        constructorBody = this.parseBlock(initializer.span);
        continue;
      }
      if (this.at('function') || this.at('class')) this.rejectDeclarationKeyword();
      if (this.at('mutable') || !this.looksLikeBareFunction() && !this.at('[')) {
        const fieldStart = this.current().span;
        const mutable = !!this.match('mutable');
        const type = this.parseType();
        const name = this.expect('identifier').value;
        if (!this.match('=') && !this.match('to')) this.expect('= or to');
        const initializer = this.parseExpression();
        this.endStatement();
        stateFields.push({ name, type, ownership: 'managed', injected: false, mutable,
          initializer, span: this.span(fieldStart) });
      } else methods.push(this.parseFunction(false));
    }
    this.closeBrace();
    return { kind: 'class', name, typeParams, typeConstraints, typeVariance, fields, stateFields, constructorBody,
      validationErrors,validationDeclared,implements: implemented, methods, headerEnd, span: this.span(start) };
  }

  private parseInterface(): InterfaceDecl {
    const keyword = this.take();
    const start = keyword.span;
    const name = this.expect('identifier').value;
    const { typeParams, typeConstraints, typeVariance } = this.parseTypeParams();
    const parents: TypeRef[] = [];
    if (this.match('extends')) {
      parents.push(this.parseType());
      while (this.match(',')) parents.push(this.parseType());
    }
    this.openBlock(start);
    const methods: MethodDecl[] = [];
    while (!this.at('}') && !this.at('eof')) {
      this.checkBlockIndentation();
      if (!this.emptyBody()) methods.push(this.parseFunction(false));
    }
    this.closeBrace();
    return { kind: 'interface', name, capability: keyword.kind === 'capability', typeParams, typeConstraints, typeVariance, extends: parents, methods, span: this.span(start) };
  }

  private parseError(): ClassDecl {
    const start = this.take().span, name = this.expect('identifier').value;
    const generics = this.parseTypeParams(), fields = this.parseParams(true);
    if (fields.some(field => field.injected || field.mutable || field.ownership !== 'managed'))
      throw new ParseFailure({...start, code:'TYPE', message:'An error declaration contains read-only data; use a full Error implementation for other behavior'});
    this.endStatement();
    return {kind:'class', errorShorthand:true, name, ...generics, fields, methods:[], implements:[syntheticType('Error', start)], span:this.span(start)};
  }

  private parseEndpoint(): MethodDecl {
    const start = this.expect('endpoint').span;
    const method = this.expect('identifier').value;
    const path = this.expect('string').value; this.expect('as');
    const node = this.parseFunction(false, {method, path, status: 200, errors: []});
    node.span = this.span(start); return node;
  }

  private parseFunction(externC: boolean, endpoint?: MethodDecl['endpoint']): MethodDecl {
    const valueAbi = externC && this.at('identifier') && this.current().value === 'value' ? (this.take(), true) : undefined;
    const nativePure = valueAbi && this.match('pure') ? true : undefined;
    const annotations = this.at('[') ? this.parseAnnotations() : undefined;
    if (this.at('function') || this.looksLikeMistypedFunctionKeyword())
      this.rejectDeclarationKeyword();
    const start = this.current().span;
    const name = ['start', 'wait', 'missing'].includes(this.current().kind) ? this.take().value : this.expect('identifier').value;
    const { typeParams, typeConstraints, typeVariance } = this.parseTypeParams();
    const params = this.parseParams(false, !!endpoint);
    if (this.at('=>')) throw new ParseFailure({ ...start, code: 'PARSE',
      message: `${name} has a constructor body; add implements Interface after that body to declare a class` });
    let returns = syntheticType('void', start);
    let returnOwnership: 'managed' | 'own' = 'managed';
    const throws: TypeRef[] = [];
    const changes: string[] = [];
    const uses: NonNullable<MethodDecl['uses']> = [];
    const clauses = new Set<string>();
    while (['returns', 'streams', 'unless', 'throws', 'changes', 'uses', ...(endpoint ? ['with'] : [])].includes(this.current().kind)) {
      const clause = this.take();
      if (clause.kind === 'with') {
        this.word('status'); endpoint!.status = Number(this.expect('number').value); continue;
      }
      if (clause.kind === 'throws') throw new ParseFailure({ ...clause.span,
        code: 'PARSE', message: 'Use unless instead of throws in error contracts' });
      if (clauses.has(clause.kind)) throw new ParseFailure({ ...clause.span,
        code: 'PARSE', message: `Duplicate ${clause.kind} clause` });
      clauses.add(clause.kind);
      if (clause.kind === 'returns' || clause.kind === 'streams') {
        if (clause.kind === 'streams' && !endpoint || clauses.has('streams') && clauses.has('returns')) throw new ParseFailure({...clause.span,code:'HTTP',message:'An endpoint declares either returns T or streams T'});
        if (clause.kind === 'streams') endpoint!.streams = true;
        if (this.match('own')) returnOwnership = 'own';
        returns = this.parseType();
      } else if (clause.kind === 'unless') {
        do {
          const type = this.parseType(); throws.push(type);
          if (endpoint && this.match('with')) { this.word('status'); endpoint.errors.push({type, status: Number(this.expect('number').value)}); }
        } while (this.match(',') || this.match('and'));
      } else {
        do {
          const effectStart = this.current().span;
          const path = [(this.match('C') ?? this.expect('identifier')).value];
          while (this.match('.')) path.push(this.expect('identifier').value);
          if (clause.kind === 'changes') changes.push(path.join('.'));
          else {
            if (path.length < 2) throw new ParseFailure({ ...effectStart, code: 'EFFECT',
              message: 'Name a capability operation, for example uses files.write' });
            uses.push({ source: path.slice(0, -1).join('.'), operation: path.at(-1)!, span: this.span(effectStart) });
          }
        } while (this.match(',') || this.match('and'));
      }
    }
    const headerEnd = this.current().span.start;
    const body = this.at('{') || this.at(':') ? this.parseBlock(start) : (this.endStatement(), undefined);
    if (externC && body) {
      throw new ParseFailure({ file: start.file, line: start.line, column: start.column,
        message: 'extern C functions cannot have a body', code: 'PARSE' });
    }
    return { kind: 'function', name, typeParams, typeConstraints, typeVariance, params, returns, returnOwnership,
      throws, changes, uses, body, externC, valueAbi, nativePure, endpoint, annotations,
      declared: { returns: clauses.has('returns') || clauses.has('streams'), errors: clauses.has('unless'),
        changes: clauses.has('changes'), uses: clauses.has('uses') }, headerEnd, span: this.span(start) };
  }

  private parseTypeParams(): GenericHeader {
    if (!this.match('<')) return { typeParams: [] };
    const typeParams: string[] = [];
    const typeConstraints: Record<string, TypeRef[]> = {};
    const typeVariance: Record<string, 'in' | 'out'> = {};
    do {
      const variance = this.match('in')?.kind ?? this.match('out')?.kind;
      const name = this.expect('identifier').value;
      typeParams.push(name);
      if (variance) typeVariance[name] = variance as 'in' | 'out';
    if (this.match('implements')) {
        typeConstraints[name] = [this.parseType()];
        while (this.match('and')) typeConstraints[name].push(this.parseType());
      }
    } while (this.match(','));
    this.expect('>');
    return { typeParams, typeConstraints, typeVariance };
  }

  private parseParams(fields = false, endpoint = false): Param[] {
    this.expect('(');
    const params: Param[] = [];
    while (!this.at(')') && !this.at('eof')) {
      const start = this.current().span;
      const injected = !!this.match('resolve');
      const mutable = !!this.match('mutable');
      const ownership = this.match('own') ? 'own' : this.match('borrow') ? 'borrow' : 'managed';
      const type = this.parseType();
      const labelToken = /^[A-Za-z_]\w*$/.test(this.current().value) ? this.take() : this.expect('identifier');
      const label = labelToken.value;
      const nameToken = fields && this.at('to') && this.current(1).kind === 'identifier'
        ? (this.take(), this.expect('identifier')) : labelToken;
      const name = nameToken.value;
      let source: Param['source'];
      if (endpoint && this.match('from')) {
        const kind = this.expect('identifier').value as NonNullable<Param['source']>['kind'];
        if (!['path', 'query', 'header', 'body', 'cookie', 'form', 'request'].includes(kind)) this.expect('path, query, header, body, cookie, form, or request');
        source = {kind, name: this.at('string') ? this.take().value : undefined};
      }
      const defaultValue = this.match('=') || this.match('to') ? this.parseExpression() : undefined;
      if (mutable && !fields) throw new ParseFailure({ ...start, code: 'MUTABILITY',
        message: 'mutable declares class storage; use borrow for a mutable function input' });
      params.push({ name, nameSpan:nameToken.span, labelSpan:labelToken.span, label: fields ? label.replace(/^_/, '') : label, mutable, type, ownership, injected, source, defaultValue, span: this.span(start) });
      if (!this.match(',')) break;
    }
    this.expect(')');
    return params;
  }

  private parseType(): TypeRef {
    const start = this.current().span;
    const optional = this.match('optional') ? true : undefined;
    const immutable = this.match('immutable') ? true : undefined;
    const name = this.expect('identifier').value;
    const args: TypeRef[] = [];
    if (this.match('<')) {
      args.push(this.parseType());
      while (this.match(',')) args.push(this.parseType());
      this.expect('>');
    }
    const legacy = this.match('?');
    if(legacy)this.diagnostics.push({...legacy.span,code:'SYNTAX',message:'Use optional Type instead of Type?; omitted values are null'});
    const nullable = !!optional || !!legacy;
    return { name, args, nullable, immutable, optional:nullable || undefined, span: this.span(start) };
  }

  private parseBlock(header: Span): Stmt[] {
    this.openBlock(header);
    const body: Stmt[] = [];
    while (!this.at('}') && !this.at('eof')) {
      const before = this.position;
      try { this.checkBlockIndentation(); body.push(this.parseStatement()); }
      catch (error) {
        if (!(error instanceof ParseFailure)) throw error;
        this.diagnostics.push(error.diagnostic);
        this.recover();
        if (this.position === before && !this.at('eof')) this.take();
      }
    }
    this.closeBrace();
    return Object.assign(body, { span: this.span(header) });
  }

  private parseCondition():Expr {
    const test=this.parseExpression();
    if(this.at('=')||this.at('to'))throw new ParseFailure({...this.current().span,code:'CONDITION',
      message:'A condition compares values with ==. Assignment with = or to is a separate statement.'});
    return test;
  }

  private parseStatement(): Stmt {
    const start = this.current().span;
    if(this.match('yield')) {const value=this.parseExpression();this.endStatement();return {kind:'yield',value,span:this.span(start)};}
    if (this.match('serve')) {
      const names = [this.expect('identifier').value];
      while (this.match('and') || this.match(',')) names.push(this.expect('identifier').value);
      this.word('on'); this.word('port'); const port = this.parseExpression(); this.endStatement();
      return {kind: 'serve', names, port, span: this.span(start)};
    }
    if (this.match('freeze')) {
      const value = this.parseExpression(); this.expect('as');
      const name = this.expect('identifier').value; this.endStatement();
      return {kind: 'freeze', value, name, span: this.span(start)};
    }
    if (this.at('wait')) {
      const saved = this.position;
      const value = this.parseUnary();
      if (this.match('to') || this.match('as')) {
        const selected = [this.expect('identifier')];
        while (this.match('and') || this.match(',')) selected.push(this.expect('identifier'));
        const names=selected.map(token=>token.value);
        const pattern:BindingPattern={kind:'tupleBinding',items:selected.map(token=>({kind:'nameBinding',name:token.value,span:token.span})),span:{...selected[0].span,end:selected.at(-1)!.span.end}};
        this.endStatement();
        return names.length === 1 ? {kind: 'assign', target: {kind: 'name', name: names[0], span: start}, value, ownership: 'managed', span: this.span(start)} :
          {kind: 'destructure', names, pattern, value, span: this.span(start)};
      }
      this.position = saved;
    }
    if (this.looksLikeBareFunction()) {
      const saved = this.position;
      this.take(); this.parseTypeParams(); const params = this.parseParams();
      const declaration = params.length > 0 || ['returns', 'unless', 'changes', 'uses', '{', ':'].includes(this.current().kind);
      this.position = saved;
      if (declaration) throw new ParseFailure({ ...start, code: 'PARSE',
        message: 'A nested declaration needs a class header with implements Interface; functions cannot contain declarations' });
    }
    if (this.emptyBody()) return { kind: 'expr', expr: { kind: 'literal', value: null, span: start }, span: this.span(start) };
    if (this.at('break') || this.at('continue')) {
      const kind = this.take().kind as 'break' | 'continue'; this.endStatement();
      return {kind, span:this.span(start)};
    }
    if (this.match('return')) {
      const value = this.at(';') || this.at('}') || this.at('eof') || this.lineBreak() ? undefined : this.parseExpression();
      this.endStatement();
      return { kind: 'return', value, span: this.span(start) };
    }
    if (this.match('throw')) {
      const value = this.parseExpression(); this.endStatement();
      return { kind: 'throw', value, span: this.span(start) };
    }
    if (this.match('for')) {
      const selected=this.parseBindingPattern(),names=bindingNames(selected);
      const pattern=selected.kind==='nameBinding'||selected.kind==='tupleBinding'&&selected.items.length>1&&selected.items.every(item=>item.kind==='nameBinding')?undefined:selected;
      this.expect('in');
      const iterable = this.parseExpression();
      return { kind: 'for', names, pattern, iterable, body: this.parseBlock(start), span: this.span(start) };
    }
    if (this.match('match')) {
      const value = this.parseExpression();
      this.openBlock(start);
      const cases: Extract<Stmt, { kind: 'match' }>['cases'] = [];
      while (!this.at('}') && !this.at('eof')) {
        this.checkBlockIndentation();
        const clause=this.parseMatchPattern();
        const body=this.parseBlock(clause.span);
        cases.push({...clause,body,span:this.span(clause.span)});
      }
      this.closeBrace();
      return { kind: 'match', value, cases, span: this.span(start) };
    }
    if (this.match('if')) {
      const test = this.parseCondition();
      const then = this.parseBlock(start);
      const elseToken = this.match('else');
      const otherwise = elseToken ? (this.at('if') ? [this.parseStatement()] : this.parseBlock(elseToken.span)) : [];
      return { kind: 'if', test, then, otherwise, span: this.span(start) };
    }
    if (this.match('while')) {
      const test = this.parseCondition();
      return { kind: 'while', test, body: this.parseBlock(start), span: this.span(start) };
    }
    if (this.match('try')) {
      const body = this.parseBlock(start);
      const catches: { type: TypeRef; name: string; body: Stmt[]; span: Span }[] = [];
      while (this.match('catch')) {
        const catchStart = this.tokens[this.position - 1].span;
        const type = this.parseType();
        const name = this.expect('identifier').value;
        catches.push({ type, name, body: this.parseBlock(catchStart), span: this.span(catchStart) });
      }
      const always = this.match('always') ? this.parseBlock(start) : undefined;
      if (catches.length === 0 && !always) this.expect('catch');
      return { kind: 'try', body, catches, always, span: this.span(start) };
    }
    if (this.match('unsafe')) return { kind: 'unsafe', body: this.parseBlock(start), span: this.span(start) };
    if (this.match('scope')) return { kind: 'scope', body: this.parseBlock(start), span: this.span(start) };
    if (this.match('lock')) {
      const value = this.parseExpression(); this.expect('as'); const name = this.expect('identifier').value;
      return {kind: 'lock', value, name, body: this.parseBlock(start), span: this.span(start)};
    }
    if (this.match('borrow')) {
      const name = this.expect('identifier').value;
      return { kind: 'borrow', name, body: this.parseBlock(start), span: this.span(start) };
    }
    if (this.at('resolve')) {
      const saved = this.position;
      const value = this.parseUnary(true);
      if (value.kind === 'resolve' && this.match('to')) {
        const name = this.expect('identifier');
        this.endStatement();
        return { kind: 'assign', target: { kind: 'name', name: name.value, span: name.span },
          value, ownership: 'managed', span: this.span(start) };
      }
      this.position = saved;
    }
    const ownership = this.match('own') ? 'own' : 'managed';
    const saved = this.position;
    if (this.at('identifier') || this.at('optional') || this.at('immutable')) {
      try {
        const declaredType = this.parseType();
        if (this.at('identifier') && ['=', 'to'].includes(this.current(1).kind)) {
          const nameToken = this.take(); this.take();
          const value = this.parseExpression(); this.endStatement();
          return { kind: 'assign', target: { kind: 'name', name: nameToken.value, span: nameToken.span },
            value, declaredType, ownership, span: this.span(start) };
        }
      } catch (error) {
        if (!(error instanceof ParseFailure)) throw error;
      }
      this.position = saved;
    }
    if (ownership === 'own') {
      const token = this.current();
      throw new ParseFailure({ file: token.span.file, line: token.span.line, column: token.span.column,
        message: 'own requires a typed variable declaration', code: 'PARSE' });
    }
    if(this.at('(')||this.at('{')){
      const saved=this.position;let pattern:BindingPattern|undefined;
      try{pattern=this.parseBindingPattern();}catch(error){if(!(error instanceof ParseFailure))throw error;}
      if(pattern&&pattern.kind!=='nameBinding'&&(this.match('=')||this.match('to'))){
        const value=this.parseExpression();this.endStatement();
        return {kind:'destructure',names:bindingNames(pattern),pattern,value,span:this.span(start)};
      }
      this.position=saved;
    }
    const target = this.parseExpression();
    if (this.match('=') || this.match('to')) {
      const value = this.parseExpression(); this.endStatement();
      if (target.kind === 'collection' && target.collection === 'Tuple' && target.items.every(item => item.kind === 'name'))
        return { kind: 'destructure', names: target.items.map(item => (item as Extract<Expr, { kind: 'name' }>).name), value, span: this.span(start) };
      if(target.kind==='collection')throw new ParseFailure({...target.span,code:'PATTERN',message:'A binding pattern contains names, tuple positions, or named record fields'});
      return { kind: 'assign', target, value, ownership, span: this.span(start) };
    }
    this.endStatement();
    return { kind: 'expr', expr: target, span: this.span(start) };
  }

  private parseBindingPattern():BindingPattern {
    const start=this.current().span;
    if(this.match('identifier'))return {kind:'nameBinding',name:this.tokens[this.position-1].value,span:start};
    if(this.match('(')){
      const items:BindingPattern[]=[];let comma=false;
      if(!this.at(')'))do{items.push(this.parseBindingPattern());comma=!!this.match(',');}while(comma&&!this.at(')')&&!this.at('eof'));
      this.expect(')');if(items.length===1&&!comma)return items[0];
      return {kind:'tupleBinding',items,span:this.span(start)};
    }
    if(this.match('{')){
      const fields:Extract<BindingPattern,{kind:'recordBinding'}>['fields']=[];
      if(!this.at('}'))do{
        const token=this.expect('identifier'),pattern=this.match(':')?this.parseBindingPattern():{kind:'nameBinding' as const,name:token.value,span:token.span};
        fields.push({name:token.value,pattern,nameSpan:token.span,span:this.span(token.span)});
      }while(this.match(',')&&!this.at('}')&&!this.at('eof'));
      this.expect('}');return {kind:'recordBinding',fields,span:this.span(start)};
    }
    throw new ParseFailure({...start,code:'PATTERN',message:'A binding pattern contains names, tuple positions, or named record fields'});
  }

  private parseMatchPattern():MatchPattern {
    const start=this.current().span;
    let pattern:MatchPattern['pattern'],literal:Expr|undefined,type:TypeRef|undefined,name:string|undefined;
    if(this.match('else'))pattern='else';
    else {
      this.expect('when');
      if(this.match('missing')||this.match('null'))pattern='null';
      else if(this.match('some')){pattern='some';name=this.expect('identifier').value;}
      else if(this.at('identifier')){pattern='type';type=this.parseType();name=this.expect('identifier').value;}
      else {pattern='literal';literal=this.parseUnary();if(literal.kind!=='literal')throw new ParseFailure({...literal.span,code:'MATCH',message:'A match pattern needs a scalar literal, null, some name, or Type name'});}
    }
    return {pattern,literal,type,name,span:this.span(start)};
  }

  private parseMatchValue(start:Span):Expr {
    const value=this.parseExpression();this.openBlock(start);
    const cases:Extract<Expr,{kind:'matchValue'}>['cases']=[];
    while(!this.at('}')&&!this.at('eof')){
      this.checkBlockIndentation();const clause=this.parseMatchPattern();this.openBlock(clause.span);this.checkBlockIndentation();
      if(['}','return','throw','if','for','while','pass','own','break','continue','scope','try','unsafe','borrow','lock'].includes(this.current().kind))
        throw new ParseFailure({...this.current().span,code:'MATCH',message:'Each match expression case needs one result expression; use a statement match for operations'});
      const result=this.parseExpression();this.endStatement();
      if(!this.at('}'))throw new ParseFailure({...this.current().span,code:'MATCH',message:'Each match expression case needs one result expression; use a statement match for operations'});
      this.closeBrace();cases.push({...clause,result,span:this.span(clause.span)});
    }
    this.closeBrace();return {kind:'matchValue',value,cases,span:this.span(start)};
  }

  private patternNames(): string[] {
    if (!this.match('(')) return [this.expect('identifier').value];
    const names = [this.expect('identifier').value];
    while (this.match(',')) names.push(this.expect('identifier').value);
    this.expect(')');
    return names;
  }

  private parseExpression(min = 0): Expr {
    let left = this.parseUnary();
    const precedence: Record<string, number> = { 'otherwise': 0.5, 'or': 1, 'and': 2, '||': 1, '&&': 2, '==': 3, '!=': 3,
      '<': 4, '>': 4, '<=': 4, '>=': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 };
    while ((this.expressionDepth > 0 || !this.lineBreak()) && (precedence[this.current().kind] ?? 0) > min) {
      const op = this.take().kind;
      const right = this.parseExpression(precedence[op]);
      left = { kind: 'binary', op: op === 'and' ? '&&' : op === 'or' ? '||' : op, left, right, span: this.span(left.span, right.span) };
    }
    return left;
  }

  private parseUnary(allowResolve = false): Expr {
    if (this.match('not')) {
      const start = this.tokens[this.position - 1].span;
      const value = this.parseExpression(2);
      return {kind: 'unary', op: '!', value, span: this.span(start, value.span)};
    }
    if (this.match('handle')) {
      const start = this.tokens[this.position - 1].span;
      return {kind:'handle', call:this.parseUnary(), span:this.span(start)};
    }
    if (this.at('start') && this.current(1).span.line === this.current().endLine && ['identifier','start','wait'].includes(this.current(1).kind) && this.match('start')) {
      const start = this.tokens[this.position - 1].span;
      const worker = this.current().value === 'worker' && ['identifier', 'start', 'wait'].includes(this.current(1).kind) && !!this.take();
      const call = this.parseUnary();
      return {kind: 'start', call, worker: worker || undefined, span: this.span(start)};
    }
    if (this.at('wait') && this.current(1).kind === 'for' && this.match('wait')) {
      const start = this.tokens[this.position - 1].span; this.expect('for');
      const tasks = [this.parseUnary()];
      while (this.match('and')) tasks.push(this.parseUnary());
      return {kind: 'wait', tasks, span: this.span(start)};
    }
    if (this.at('!') || this.at('-')) {
      const token = this.take();
      const value = this.parseUnary();
      if (token.kind === '-' && value.kind === 'literal' && typeof value.value === 'number')
        return { ...value, value: -value.value, numericText: value.numericText ? value.numericText.startsWith('-') ? value.numericText.slice(1) : `-${value.numericText}` : undefined,
          span: this.span(token.span, value.span) };
      return { kind: 'unary', op: token.kind, value, span: this.span(token.span, value.span) };
    }
    if (this.match('resolve')) {
      const start = this.tokens[this.position - 1].span;
      if (!allowResolve) this.diagnostics.push({...start, code: 'SYNTAX', message: 'Use resolve Key to name as a statement instead of an assignment or expression'});
      const name = this.expect('identifier');
      const typeArgs = this.at('<') ? this.parseCallTypeArgs() : [];
      return { kind: 'resolve', name: name.value, typeArgs, span: this.span(start) };
    }
    let expr = this.parsePrimary();
    while (true) {
      if (this.expressionDepth === 0 && this.lineBreak()) break;
      if (this.match('with')) {
        this.expect('('); this.expressionDepth++;
        const fields: Extract<Expr, {kind:'recordCopy'}>['fields'] = [];
        while (!this.at(')') && !this.at('eof')) {
          const field = this.expect('identifier');
          const value = this.match('=') || this.match('to') ? this.parseExpression() : {kind:'name' as const, name:field.value, span:field.span};
          fields.push({name:field.value, value, span:this.span(field.span)});
          if (!this.match(',')) break;
        }
        this.expect(')'); this.expressionDepth--;
        expr = {kind:'recordCopy', base:expr, fields, span:this.span(expr.span)}; continue;
      }
      if (this.match('[')) {
        const bracket = this.tokens[this.position - 1].span;
        this.expressionDepth++;
        const index = this.parseExpression();
        this.expect(']'); this.expressionDepth--;
        expr = {kind: 'call', callee: {kind: 'member', object: expr, name: 'get', span: this.span(expr.span, bracket)},
          args: [index], argLabels: [undefined], typeArgs: [], indexed: true, span: this.span(expr.span)};
        continue;
      }
      if (this.match('.')) {
        const name = /^[A-Za-z_]\w*$/.test(this.current().value) ? this.take() : this.expect('identifier');
        expr = { kind: 'member', object: expr, name: name.value, span: this.span(expr.span, name.span) };
        continue;
      }
      const typeArgs = this.looksLikeGenericCall() ? this.parseCallTypeArgs() : [];
      if (this.match('(')) {
        this.expressionDepth++;
        const args: Expr[] = [];
        const argLabels: (string | undefined)[] = [];
        const argLabelSpans: (Span | undefined)[] = [];
        const argument = () => {
          let label: string | undefined, labelSpan:Span | undefined;
          if (/^[A-Za-z_]\w*$/.test(this.current().value) && ['=', 'to'].includes(this.current(1).kind)) {
            const token=this.take(); label=token.value; labelSpan=token.span;
            this.take();
          }
          argLabels.push(label); argLabelSpans.push(labelSpan);
          args.push(this.parseExpression());
        };
        if (!this.at(')')) {
          argument();
          while (this.match(',') && !this.at(')')) argument();
        }
        const end = this.expect(')').span;
        this.expressionDepth--;
        expr = { kind: 'call', callee: expr, args, argLabels, argLabelSpans, typeArgs,
          span: this.span(expr.span, end) };
        continue;
      }
      break;
    }
    return expr;
  }

  private looksLikeGenericCall(): boolean {
    if (!this.at('<')) return false;
    let depth = 0;
    for (let i = this.position; i < this.tokens.length; i++) {
      const kind = this.tokens[i].kind;
      if (kind === '<') depth++;
      if (kind === '>') {
        depth--;
        if (depth === 0) return this.tokens[i + 1]?.kind === '(';
      }
      if (kind === ';' || kind === 'eof') break;
    }
    return false;
  }

  private parseCallTypeArgs(): TypeRef[] {
    this.expect('<');
    const args = [this.parseType()];
    while (this.match(',')) args.push(this.parseType());
    this.expect('>');
    return args;
  }

  private parsePrimary(): Expr {
    const token = this.current();
    if (token.value === 'input' && this.current(1).kind === 'from' && this.current(2).value === 'form') {
      this.take(); this.take(); this.take(); return {kind:'formInput', span:this.span(token.span)};
    }
    if(this.match('match'))return this.parseMatchValue(token.span);
    if (this.match('interpolation_start')) {
      const parts: Extract<Expr, {kind:'interpolation'}>['parts'] = [];
      this.expressionDepth++;
      while (!this.at('interpolation_end') && !this.at('eof')) {
        if (this.at('interpolation_text')) {const text = this.take(); parts.push({text:text.value, span:text.span});}
        else {const start=this.expect('{').span, value=this.parseExpression(); this.expect('}'); parts.push({value,span:this.span(start)});}
      }
      this.expect('interpolation_end'); this.expressionDepth--;
      return {kind:'interpolation', parts, span:this.span(token.span)};
    }
    if (this.at('jsx_open')) return this.parseMarkup();
    if (['start', 'wait'].includes(token.kind) || token.kind === 'missing' && this.current(1).kind === '(') {
      this.take(); return {kind:'name', name:token.value, span:token.span};
    }
    if (this.match('number')) return { kind: 'literal', value: Number(token.value),
      numericType: token.value.includes('.') ? 'float' : 'int', numericText: token.value, span: token.span };
    if (this.match('string')) return { kind: 'literal', value: token.value, span: token.span };
    if (this.match('true')) return { kind: 'literal', value: true, span: token.span };
    if (this.match('false')) return { kind: 'literal', value: false, span: token.span };
    if (this.match('null')) return { kind: 'literal', value: null, span: token.span };
    if (this.match('missing')) return { kind: 'literal', value: null, span: token.span };
    if (this.match('identifier')) return { kind: 'name', name: token.value, span: token.span };
    if (this.at('[') || this.at('{') || this.at('(')) {
      const opening = this.take();
      const closing = opening.kind === '[' ? ']' : opening.kind === '{' ? '}' : ')';
      this.expressionDepth++;
      const items: Expr[] = [];
      let collection: Extract<Expr, { kind: 'collection' }>['collection'] =
        opening.kind === '[' ? 'List' : opening.kind === '{' ? 'empty' : 'Tuple';
      let comma = false;
      if (!this.at(closing)) {
        do {
          items.push(this.parseExpression());
          if (opening.kind === '[' && items.length === 1 && this.match('for')) {
            const pattern=this.parseBindingPattern();this.expect('in');
            const iterable=this.parseExpression(),condition=this.match('if')?this.parseExpression():undefined;
            this.expect(']');this.expressionDepth--;
            return {kind:'comprehension',projection:items[0],pattern,iterable,condition,span:this.span(opening.span)};
          }
          if (opening.kind === '{') {
            const pair = !!this.match(':');
            const nextKind = pair ? 'Map' : 'Set';
            if (collection !== 'empty' && collection !== nextKind) throw new ParseFailure({ ...this.current().span,
              code: 'COLLECTION', message: 'A literal cannot mix set items and map entries' });
            collection = nextKind;
            if (pair) items.push(this.parseExpression());
          }
          comma = !!this.match(',');
        } while (comma && !this.at(closing) && !this.at('eof'));
      }
      this.expect(closing);
      this.expressionDepth--;
      if (opening.kind === '(' && items.length === 1 && !comma) return items[0];
      return { kind: 'collection', collection, items, span: this.span(opening.span) };
    }
    throw new ParseFailure({ file: token.span.file, line: token.span.line, column: token.span.column,
      message: `Expected expression, found ${JSON.stringify(token.value)}`, code: 'PARSE' });
  }

  private parseMarkup(): Expr {
    const start = this.expect('jsx_open').span;
    const tag = this.match('jsx_name')?.value ?? '';
    const attributes: Extract<Expr, {kind:'markup'}>['attributes'] = [], children: Expr[] = [];
    while (!this.at('jsx_end') && !this.at('jsx_self') && !this.at('eof')) {
      const name = this.expect('jsx_name'); let value: Expr = {kind:'literal', value:true, span:name.span};
      if (this.match('=')) {
        if (this.match('{')) {this.expressionDepth++; value = this.parseExpression(); this.expect('}'); this.expressionDepth--;}
        else {const text = this.expect('string'); value = {kind:'literal', value:text.value, span:text.span};}
      }
      attributes.push({name:name.value, value, span:name.span});
    }
    if (this.match('jsx_self')) return {kind:'markup', tag, attributes, children, span:this.span(start)};
    this.expect('jsx_end');
    while (!this.at('jsx_close') && !this.at('eof')) {
      if (this.at('jsx_open')) children.push(this.parseMarkup());
      else if (this.match('{')) {this.expressionDepth++; children.push(this.parseExpression()); this.expect('}'); this.expressionDepth--;}
      else {const text = this.expect('jsx_text'); const value = text.value.includes('\n') ? text.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean).join(' ') : text.value;
        if (value) children.push({kind:'markupText', text:value, span:text.span});}
    }
    this.expect('jsx_close'); const closing = this.match('jsx_name')?.value ?? '';
    if (closing !== tag) throw new ParseFailure({...start, code:'HTML', message:`Close <${tag}> with </${tag}>`});
    this.expect('jsx_close_end'); return {kind:'markup', tag, attributes, children, span:this.span(start)};
  }
}
