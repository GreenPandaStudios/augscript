export interface Span {
  file: string;
  start: number;
  end: number;
  line: number;
  column: number;
}

/** A related checked source location, such as an input declaration or earlier argument. */
export interface RelatedDiagnostic {
  file: string;
  line: number;
  column: number;
  message: string;
}

export interface Diagnostic {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
  severity?: 'error' | 'warning';
  related?: readonly RelatedDiagnostic[];
  expected?: string;
  actual?: string;
}

export interface TypeRef {
  name: string;
  args: TypeRef[];
  nullable: boolean;
  optional?: boolean;
  immutable?: boolean;
  span: Span;
}

export interface Param {
  name: string;
  type: TypeRef;
  ownership: 'managed' | 'own' | 'borrow';
  injected: boolean;
  /** Pure literal data evaluated afresh when the caller omits this input. */
  defaultValue?: Expr;
  label?: string;
  nameSpan?: Span;
  labelSpan?: Span;
  mutable?: boolean;
  span: Span;
  source?: {kind: 'path' | 'query' | 'header' | 'body' | 'cookie' | 'form' | 'request'; name?: string};
}

export interface GenericHeader {
  typeParams: string[];
  typeConstraints?: Record<string, TypeRef[]>;
  typeVariance?: Record<string, 'in' | 'out'>;
}

/** An opaque foreign object. Only a descriptor-checked native call can acquire it. */
export interface ResourceDecl extends GenericHeader {
  kind: 'resource'; name: string; typeParams: []; span: Span;
}

export interface InterceptorAnnotation {
  name: string;
  typeArgs: TypeRef[];
  mappings: { name: string; source: string; value?: Expr; span: Span; sourceSpan: Span }[];
  nameSpan: Span;
  span: Span;
}

export interface MethodDecl extends GenericHeader {
  kind: 'function';
  name: string;
  typeParams: string[];
  params: Param[];
  returns: TypeRef;
  returnOwnership: 'managed' | 'own';
  throws: TypeRef[];
  body?: Stmt[];
  externC: boolean;
  valueAbi?: boolean;
  nativePure?: boolean;
  endpoint?: {method: string; path: string; status: number; errors: {type: TypeRef; status: number}[]; streams?: boolean};
  annotations?: InterceptorAnnotation[];
  changes?: string[];
  uses?: { source: string; operation: string; span: Span }[];
  /** Clauses written by the author; inferred contracts live in CheckedProject. */
  declared?: { returns: boolean; errors: boolean; changes: boolean; uses: boolean };
  headerEnd?: number;
  fixture?: boolean;
  span: Span;
}

export interface ClassDecl extends GenericHeader {
  kind: 'class';
  record?: boolean;
  errorShorthand?: boolean;
  validationErrors?: TypeRef[];
  validationDeclared?: boolean;
  headerEnd?: number;
  name: string;
  typeParams: string[];
  fields: Param[];
  stateFields?: (Param & { initializer: Expr })[];
  constructorBody?: Stmt[];
  implements: TypeRef[];
  methods: MethodDecl[];
  annotations?: InterceptorAnnotation[];
  span: Span;
}

export interface InterceptorDecl extends GenericHeader {
  kind: 'interceptor';
  name: string;
  typeParams: string[];
  fields: Param[];
  methods: MethodDecl[];
  nameSpan: Span;
  span: Span;
}

/** A closed union of explicitly named, concrete immutable records. */
export interface ChoiceDecl extends GenericHeader {
  kind: 'choice'; name: string; typeParams: []; alternatives: TypeRef[]; span: Span;
}

export interface InterfaceDecl extends GenericHeader {
  kind: 'interface';
  name: string;
  typeParams: string[];
  extends: TypeRef[];
  methods: MethodDecl[];
  span: Span;
  capability?: boolean;
}

export interface ImportDecl {
  kind: 'import';
  names: string[];
  everything: boolean;
  from: string[];
  span: Span;
}

export interface ExportDecl {
  kind: 'export';
  /** An explicit sibling contract excluded from outward folder imports. */
  internal?: boolean;
  name: string;
  from?: string;
  folder: boolean;
  span: Span;
}

export interface BindDecl {
  kind: 'bind';
  key: string;
  keyTypeArgs: TypeRef[];
  target: TypeRef;
  lifetime?: 'shared' | 'fresh' | 'scoped';
  sharedMutation?: boolean;
  span: Span;
}

export interface CompositionDecl extends GenericHeader {
  kind: 'composition'; name: string; bindings: BindDecl[]; span: Span;
}
export interface IncludeDecl { kind: 'include'; name: string; span: Span }

export interface MatchPattern {
  pattern:'null'|'some'|'literal'|'type'|'else';
  literal?:Expr;type?:TypeRef;name?:string;span:Span;
}

export type Expr =
  | {kind:'lambda';params:Param[];body:Expr;span:Span}
  | {kind:'comprehension';projection:Expr;pattern:BindingPattern;iterable:Expr;condition?:Expr;span:Span}
  | {kind:'matchValue';value:Expr;cases:(MatchPattern & {result:Expr})[];span:Span}
  | {kind: 'recordCopy'; base: Expr; fields: {name: string; value: Expr; span: Span}[]; span: Span}
  | {kind: 'interpolation'; parts: ({text: string; span: Span} | {value: Expr; span: Span})[]; span: Span}
  | {kind: 'handle'; call: Expr; span: Span}
  | {kind: 'formInput'; span: Span}
  | {kind: 'markup'; tag: string; attributes: {name: string; value: Expr; span: Span}[]; children: Expr[]; span: Span}
  | {kind: 'markupText'; text: string; span: Span}
  | { kind: 'literal'; value: string | number | boolean | null; numericType?: 'int' | 'float'; numericText?: string; span: Span }
  | { kind: 'collection'; collection: 'List' | 'Tuple' | 'Set' | 'Map' | 'empty';
      items: Expr[]; span: Span }
  | { kind: 'name'; name: string; span: Span }
  | { kind: 'member'; object: Expr; name: string; span: Span }
  | { kind: 'call'; callee: Expr; args: Expr[]; argLabels: (string | undefined)[];
      typeArgs: TypeRef[]; indexed?: boolean; argLabelSpans?: (Span | undefined)[]; span: Span }
  | { kind: 'binary'; op: string; left: Expr; right: Expr; span: Span }
  | { kind: 'unary'; op: string; value: Expr; span: Span }
  | { kind: 'start'; call: Expr; worker?: boolean; span: Span }
  | { kind: 'wait'; tasks: Expr[]; span: Span }
  | { kind: 'resolve'; name: string; typeArgs: TypeRef[]; span: Span };

/** A read-only binding of a value, tuple cell, or named immutable-record field. */
export type BindingPattern =
  | {kind:'nameBinding';name:string;span:Span}
  | {kind:'tupleBinding';items:BindingPattern[];span:Span}
  | {kind:'recordBinding';fields:RecordBindingField[];span:Span};
export interface RecordBindingField {name:string;pattern:BindingPattern;nameSpan:Span;span:Span}
export function bindingSelections(pattern:BindingPattern,path:(string|number)[]=[]):{name:string;path:(string|number)[];span:Span}[] {
  return pattern.kind==='nameBinding'?[{name:pattern.name,path,span:pattern.span}]:pattern.kind==='tupleBinding'?
    pattern.items.flatMap((item,index)=>bindingSelections(item,[...path,index])):pattern.fields.flatMap(field=>bindingSelections(field.pattern,[...path,field.name]));
}
export function bindingNames(pattern:BindingPattern):string[] { return bindingSelections(pattern).map(binding=>binding.name); }

export type Stmt =
  | {kind:'yield'; value: Expr; span: Span}
  | {kind: 'lock'; value: Expr; name: string; body: Stmt[]; span: Span}
  | { kind: 'serve'; names: string[]; port: Expr; span: Span }
  | { kind: 'freeze'; value: Expr; name: string; span: Span }
  | { kind: 'expr'; expr: Expr; span: Span }
  | { kind: 'assign'; target: Expr; value: Expr; declaredType?: TypeRef; ownership: 'managed' | 'own'; span: Span }
  | { kind: 'break'; span: Span }
  | { kind: 'continue'; span: Span }
  | { kind: 'return'; value?: Expr; span: Span }
  | { kind: 'throw'; value: Expr; span: Span }
  | { kind: 'if'; test: Expr; then: Stmt[]; otherwise: Stmt[]; span: Span }
  | { kind: 'while'; test: Expr; body: Stmt[]; span: Span }
  | { kind: 'for'; names: string[]; pattern?:BindingPattern; iterable: Expr; body: Stmt[]; span: Span }
  | { kind: 'destructure'; names: string[]; pattern?:BindingPattern; value: Expr; span: Span }
  | { kind: 'match'; value: Expr; cases: (MatchPattern & {body:Stmt[]})[]; span: Span }
  | { kind: 'try'; body: Stmt[]; catches: { type: TypeRef; name: string; body: Stmt[]; span: Span }[]; always?: Stmt[]; span: Span }
  | { kind: 'unsafe'; body: Stmt[]; span: Span }
  | { kind: 'borrow'; name: string; body: Stmt[]; span: Span }
  | { kind: 'scope'; body: Stmt[]; span: Span };

export interface TestCase { name: string; body: Stmt[]; span: Span; parameters?: string[]; rows?: Expr[] }
export interface TestGroup { name: string; setup: (BindDecl | IncludeDecl | Stmt)[]; cases: TestCase[]; span: Span }
export interface TestDecl {
  kind: 'test'; type: TypeRef; name: string; groups: TestGroup[]; span: Span;
  functionSuite?: boolean;
  endpointSuite?: boolean;
}

export type TopLevel = ImportDecl | ExportDecl | BindDecl | CompositionDecl | IncludeDecl | ClassDecl | InterfaceDecl | ChoiceDecl | InterceptorDecl | ResourceDecl | MethodDecl | TestDecl | Stmt;
export function isStatement(item: TopLevel): item is Stmt {
  return !['import', 'export', 'bind', 'composition', 'include', 'class', 'interface', 'choice', 'interceptor', 'resource', 'function', 'test'].includes(item.kind);
}

export interface SourceFile {
  path: string;
  source: string;
  items: TopLevel[];
  builtin?: boolean;
  package?: string;
}

export function typeName(type: TypeRef): string {
  return (type.optional || type.nullable ? 'optional ' : '') + (type.immutable ? 'immutable ' : '') + type.name + (type.args.length ? `<${type.args.map(typeName).join(',')}>` : '');
}

export function syntheticType(name: string, span: Span): TypeRef {
  return { name, args: [], nullable: false, span };
}

/** Stored fields include constructor inputs and internal, purely initialized state. */
export function fieldsOf(node: ClassDecl | InterceptorDecl): Param[] {
  return [...node.fields, ...(node.kind === 'class' ? node.stateFields ?? [] : [])];
}

export function initializationOf(node: ClassDecl): Stmt[] {
  return [...(node.stateFields ?? []).map(field => ({ kind: 'assign' as const,
    target: { kind: 'name' as const, name: field.name, span: field.span }, value: field.initializer,
    ownership: field.ownership === 'own' ? 'own' as const : 'managed' as const, span: field.span })),
    ...(node.constructorBody ?? [])];
}

/** Direct expression children, shared by conservative analyses as syntax grows. */
export function expressionChildren(expr: Expr): Expr[] {
  switch (expr.kind) {
    case 'lambda': return [expr.body];
    case 'comprehension': return [expr.iterable,...(expr.condition?[expr.condition]:[]),expr.projection];
    case 'matchValue': return [expr.value,...expr.cases.flatMap(clause=>[...(clause.literal?[clause.literal]:[]),clause.result])];
    case 'recordCopy': return [expr.base, ...expr.fields.map(field => field.value)];
    case 'interpolation': return expr.parts.flatMap(part => 'value' in part ? [part.value] : []);
    case 'markup': return [...expr.attributes.map(attribute => attribute.value), ...expr.children];
    case 'collection': return expr.items;
    case 'call': return [expr.callee, ...expr.args];
    case 'binary': return [expr.left, expr.right];
    case 'unary': return [expr.value];
    case 'member': return [expr.object];
    case 'handle': case 'start': return [expr.call];
    case 'wait': return expr.tasks;
    default: return [];
  }
}
