export interface Span {
  file: string;
  start: number;
  end: number;
  line: number;
  column: number;
}

export interface Diagnostic {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
  severity?: 'error' | 'warning';
}

export interface TypeRef {
  /** Compiler-inherited references retain definition identity across module scopes. */
  definitionId?: string;
  name: string;
  args: TypeRef[];
  nullable: boolean;
  optional?: boolean;
  span: Span;
}

export interface Param {
  name: string;
  type: TypeRef;
  ownership: 'managed' | 'own' | 'borrow';
  injected: boolean;
  label?: string;
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
  /** A bodyless source declaration; its checked implementation is transparent delegation. */
  forward?: {target:string;nameSpan:Span;targetSpan:Span;targetId?:string;implementationId?:string;chain?:string[]};
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

export type Expr =
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
      typeArgs: TypeRef[]; span: Span }
  | { kind: 'binary'; op: string; left: Expr; right: Expr; span: Span }
  | { kind: 'unary'; op: string; value: Expr; span: Span }
  | { kind: 'start'; call: Expr; worker?: boolean; span: Span }
  | { kind: 'wait'; tasks: Expr[]; span: Span }
  | { kind: 'resolve'; name: string; typeArgs: TypeRef[]; span: Span };

export type Stmt =
  | {kind:'yield'; value: Expr; span: Span}
  | {kind: 'lock'; value: Expr; name: string; body: Stmt[]; span: Span}
  | { kind: 'serve'; names: string[]; port: Expr; span: Span }
  | { kind: 'freeze'; value: Expr; name: string; span: Span }
  | { kind: 'expr'; expr: Expr; span: Span }
  | { kind: 'assign'; target: Expr; value: Expr; declaredType?: TypeRef; ownership: 'managed' | 'own'; span: Span }
  | { kind: 'return'; value?: Expr; span: Span }
  | { kind: 'throw'; value: Expr; span: Span }
  | { kind: 'if'; test: Expr; then: Stmt[]; otherwise: Stmt[]; span: Span }
  | { kind: 'while'; test: Expr; body: Stmt[]; span: Span }
  | { kind: 'for'; names: string[]; iterable: Expr; body: Stmt[]; span: Span }
  | { kind: 'destructure'; names: string[]; value: Expr; span: Span }
  | { kind: 'match'; value: Expr; cases: { pattern: 'null' | 'some' | 'literal' | 'type' | 'else';
      literal?: Expr; type?: TypeRef; name?: string; body: Stmt[]; span: Span }[]; span: Span }
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

export type TopLevel = ImportDecl | ExportDecl | BindDecl | CompositionDecl | IncludeDecl | ClassDecl | InterfaceDecl | InterceptorDecl | ResourceDecl | MethodDecl | TestDecl | Stmt;
export function isStatement(item: TopLevel): item is Stmt {
  return !['import', 'export', 'bind', 'composition', 'include', 'class', 'interface', 'interceptor', 'resource', 'function', 'test'].includes(item.kind);
}

export interface SourceFile {
  path: string;
  source: string;
  items: TopLevel[];
  builtin?: boolean;
  package?: string;
}

export function typeName(type: TypeRef): string {
  return (type.optional || type.nullable ? 'optional ' : '') + type.name + (type.args.length ? `<${type.args.map(typeName).join(',')}>` : '');
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
