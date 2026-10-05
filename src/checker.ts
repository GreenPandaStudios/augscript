import {errorMatch, type ErrorMatch} from './error-matches.ts';
import {choiceMembers} from './choices.ts';
import type {
  BindDecl, BindingPattern, RecordBindingField, ClassDecl, Diagnostic, Expr, GenericHeader, InterfaceDecl, InterceptorAnnotation, InterceptorDecl, MethodDecl, Param, Span,
  Stmt, TypeRef, MatchPattern,
} from './ast.ts';
import { expressionChildren, bindingNames, fieldsOf, initializationOf, syntheticType, typeName } from './ast.ts';
import { isPrivateName, type Definition, type Project } from './project.ts';
import { literalDefault, defaultText } from './parameters.ts';
import { canFallThrough, canRepeatNext } from './continuation.ts';
import { returnsFresh } from './freshness.ts';
import { inferType } from './inference.ts';
import { containsUnknown, sameType, tyName, immutableType, type Ty } from './types.ts';
import { capabilityKey, coversChange, effectContract, type CapabilityEffect, type EffectContract } from './effects.ts';
import { allocationOrigin, overlap, OwnershipFlow, sourceName, unionOrigins, type Origins } from './ownership.ts';
import { builtinType as builtin, builtinTypes, builtinProperties, collectionOperations, errorNames, operationType } from './builtins.ts';
import { orderGraph } from './di.ts';
import { javadocBefore } from './javadoc.ts';
import { callableDocumentation } from './documentation.ts';
import { nativeHttpContracts } from './http-contracts.ts';
import { jsonDataType } from './schemas.ts';
import {htmlTags, htmlVoidTags, htmlAttribute, htmlUrlAttributes} from './html.ts';
import {generateOpenApi} from './openapi.ts';
import {httpPolicyNames,httpPolicyOptions,checkHttpPolicy,type HttpPolicyPlan} from './http-policies.ts';
import {nativeDeclarations, type NativeDeclarations} from './native-declarations.ts';
import {checkWorkers} from './workers.ts';
import type {FunctionValuePlan} from './function-values.ts';
import type {NativeFunction,NativeView} from './native-contracts.ts';
export { tyName, type Ty } from './types.ts';

export interface BindingInfo {
  key: string;
  target: Definition;
  exposedType: Ty;
  dependencies: string[];
  constructorKeys: string[];
  declaration: BindDecl;
  includedBy?: Span;
  lifetime: 'shared' | 'fresh' | 'scoped';
  stateful: boolean;
  requiresScope: boolean;
}

export interface InterfaceMethod {
  method: MethodDecl;
  from: string;
  file: string;
  params: Map<string, Ty>;
}

export interface ResolvedName { name:string; definition:Span; global?:string; property?:boolean }
export interface ResolvedCall { node:MethodDecl | ClassDecl; params:Param[]; dispatch:'direct' | 'interface' }
export interface CheckedProject {
  project: Project;
  diagnostics: Diagnostic[];
  bindings: BindingInfo[];
  expressionTypes: WeakMap<Expr, Ty>;
  functionValues:Map<Expr,FunctionValuePlan>;
  patternTypes:WeakMap<BindingPattern,Ty>;
  patternFields:WeakMap<RecordBindingField,{owner:Definition;field:Param;index:number}>;
  resolvedNames: WeakMap<Expr, ResolvedName>;
  resolvedCalls: WeakMap<Expr, ResolvedCall>;
  resolvedTypes: WeakMap<TypeRef, Ty>;
  errorMatches: WeakMap<TypeRef, ErrorMatch>;
  defaults: Map<string, Map<string, InterfaceMethod>>;
  /** Declaration-time inherited interface requirements, with owner substitutions. */
  interfaceMembers: Map<string, Map<string, InterfaceMethod[]>>;
  callPlans: WeakMap<Expr, CallPlan>;
  interceptorPlans: Map<MethodDecl | ClassDecl, InterceptorLayer[]>;
  effectContracts: Map<MethodDecl, EffectContract>;
  callableContracts: Map<MethodDecl, CallableContract>;
  constructorContracts: Map<ClassDecl, CallableContract>;
  expressionOrigins: WeakMap<Expr, Origins>;
  inferredOwned: WeakSet<Stmt>;
  scopes: Map<string, ScopeFact>;
  markupCalls: WeakMap<Expr, Extract<Expr, {kind:'call'}>>;
  actions: Map<Expr, ActionPlan>;
  httpPolicies: Map<MethodDecl,HttpPolicyPlan[]>;
  native:NativeDeclarations;
}

export interface CallableContract {
  result: Ty;
  errors: Ty[];
  inferredResult: boolean;
  inferredErrors: boolean;
}

export interface ActionPlan {
  endpoint: Definition;
  parameters: {param: Param; type: Ty; source: number | undefined; form: boolean}[];
}

export interface ScopeFact {
  span: Span;
  locals: { name: string; type: Ty; kind: 'parameter' | 'property' | 'variable'; ownership: string;
    moved: boolean; definition?: Span; documentation?: string; ownershipFacts?: { origins: Span[]; owners: {name:string;span?:Span}[]; aliases:{name:string;span?:Span}[]; borrows:{name:string;span:Span}[]; captures:{span:Span;exclusive:boolean}[]; moves:Span[] } }[];
}

export interface InterceptorLayer {
  /** The constructor entry reached by next returns a fresh, unescaped object. */
  constructorResultFresh?: boolean;
  annotation: InterceptorAnnotation;
  definition: Definition;
  around: MethodDecl;
  argumentIndices: (number | undefined)[];
  argumentBindings: (string | undefined)[];
  constructorKeys: string[];
  types: Map<string, Ty>;
  inputTypes: Ty[];
  outputType: Ty;
  /** Resolved for this application, rather than the shared around declaration. */
  effects?: EffectContract;
  errors: Ty[];
  constructorInputIndices: number[];
  argumentInjectionIndices: (number | undefined)[];
}

interface NextContext {
  params: Param[];
  types: Ty[];
  returns: Ty;
  returnOwnership: 'managed' | 'own';
  indices?: (number | undefined)[];
}

export interface CallPlan {
  /** Invalid labels prevent dependent inference and contract guesses until repaired. */
  invalidLabels?: boolean;
  defaults?: (Expr | undefined)[];
  returnOwnership?: 'managed' | 'own';
  sourceIndices: (number | undefined)[];
  bindingKeys: (string | undefined)[];
  injectionSources?: (string | undefined)[];
  ownerships?: (string | undefined)[];
  mutatesReceiver?: boolean;
}

type Local = { type: Ty; declaredType?: Ty; ownership: 'managed' | 'own' | 'borrow'; moved: boolean; origin?: string; definition?: Span; moveSites?: Span[] };
interface Context {
  file: string;
  locals: Map<string, Local>;
  self?: Ty;
  returns: Ty;
  returnOwnership: 'managed' | 'own';
  allowedErrors: Ty[];
  inferredReturns?: Ty[];
  deferredErrors?: Ty[];
  exceptionalFlows?: {type: Ty; flow: OwnershipFlow}[];
  unsafe: boolean;
  borrowed: Set<string>;
  initializing?: boolean;
  types?: Map<string, Ty>;
  next?: NextContext;
  callable?: MethodDecl;
  owner?: Definition;
  effects?: EffectContract;
  composition?: boolean;
  scope?: Span;
  loopDepth?: number;
  loop?: { breaks: Context[]; continues: Context[] };
  locked?: boolean;
  stream?: Ty;
  region?: Span;
  flow: OwnershipFlow;
}

const builtinNames = new Set(Object.keys(builtinTypes));
const errorTy: Ty = { id: 'error', name: '<error>', kind: 'error', args: [], nullable: false };
const nullTy: Ty = { id: 'null', name: 'null', kind: 'null', args: [], nullable: true };
const unresolved = (type: Ty): boolean => type.kind === 'error' || type.args.some(unresolved);

export function checkProject(project: Project): CheckedProject {
  const checker = new Checker(project);
  const checked = checker.check();
  if (!checked.diagnostics.some(d => d.severity !== 'warning')) checked.diagnostics.push(...checkWorkers(checked));
  if (project.config.openapi.enabled && !checked.diagnostics.some(issue => issue.severity !== 'warning'))
    checked.diagnostics.push(...generateOpenApi(checked).diagnostics);
  return checked;
}

class Checker {
  readonly project: Project;
  readonly diagnostics: Diagnostic[];
  readonly expressionTypes = new WeakMap<Expr, Ty>();
  readonly patternTypes=new WeakMap<BindingPattern,Ty>();
  readonly patternFields=new WeakMap<RecordBindingField,{owner:Definition;field:Param;index:number}>();
  readonly resolvedNames = new WeakMap<Expr, ResolvedName>();
  readonly resolvedCalls = new WeakMap<Expr, ResolvedCall>();
  readonly resolvedTypes = new WeakMap<TypeRef, Ty>();
  readonly errorMatches = new WeakMap<TypeRef, ErrorMatch>();
  readonly defaults = new Map<string, Map<string, InterfaceMethod>>();
  readonly interfaceMembers = new Map<string, Map<string, InterfaceMethod[]>>();
  readonly callPlans = new WeakMap<Expr, CallPlan>();
  readonly bindings: BindingInfo[] = [];
  readonly interceptorPlans = new Map<MethodDecl | ClassDecl, InterceptorLayer[]>();
  readonly effectContracts = new Map<MethodDecl, EffectContract>();
  readonly callableContracts = new Map<MethodDecl, CallableContract>();
  readonly constructorContracts = new Map<ClassDecl, CallableContract>();
  private readonly initializers = new Map<ClassDecl, MethodDecl>();
  private readonly inferredChanges = new Map<MethodDecl, Set<string>>();
  private readonly contextualResults = new Set<MethodDecl>();
  readonly functionValues=new Map<Expr,FunctionValuePlan>();
  readonly expressionOrigins = new WeakMap<Expr, Origins>();
  readonly inferredOwned = new WeakSet<Stmt>();
  readonly scopes = new Map<string, ScopeFact>();
  readonly markupCalls = new WeakMap<Expr, Extract<Expr, {kind:'call'}>>();
  readonly actions = new Map<Expr, ActionPlan>();
  readonly httpPolicies = new Map<MethodDecl,HttpPolicyPlan[]>();
  readonly native:NativeDeclarations;
  private readonly bindingByKey = new Map<string, BindingInfo>();
  private readonly constructorFreshness = new Map<ClassDecl, boolean>();
  private readonly constraintStack = new Set<string>();
  private readonly inferredUses = new Map<MethodDecl, Map<string, CapabilityEffect>>();
  private inferring = false;
  private inferenceChanged = false;
  private readonly changingInference = new Set<MethodDecl>();
  constructor(project: Project) { this.project = project; this.native=nativeDeclarations(project); this.diagnostics = [...project.diagnostics,...this.native.diagnostics]; }

  check(): CheckedProject {
    // Make inherited default bodies visible to forward calls during inference.
    this.inferring = true;
    for (const def of this.project.definitions.values()) if (def.node.kind === 'class') {
      const methods = new Map<string, InterfaceMethod>();
      const types = this.paramsFor(def.node.typeParams, def.node, def.file);
      for (const ref of def.node.implements) for (const [name, entries] of this.interfaceMethods(this.resolveType(ref, def.file, types), new Set()))
        if (!def.node.methods.some(method => method.name === name)) {
          const entry = entries.find(entry => entry.method.body);
          if (entry) methods.set(name, entry);
        }
      this.defaults.set(def.id, methods);
    }
    this.inferring = false;
    this.inferImplementationEffects();
    for (const def of this.project.definitions.values())
      if (def.node.kind === 'interceptor') this.checkInterceptorShape(def);
    this.planInterceptors();
    this.constructorFreshness.clear();
    // Layers can add contracts to callers. Recompute after their mappings exist.
    this.inferImplementationEffects(false);
    for (const layers of this.interceptorPlans.values()) for (const layer of layers)
      layer.errors = this.bodyErrors(layer.around, layer.definition.file, layer.types);
    for (const def of this.project.definitions.values()) {
      if (def.node.kind === 'class') this.checkClassShape(def);
      else if (def.node.kind === 'interface') this.checkInterfaceShape(def);
      else if (def.node.kind === 'choice') this.checkChoiceShape(def);
      else if (def.node.kind === 'function') this.checkFunctionSignature(def.node, def.file, new Map());
    }
    this.checkBindings();
    this.checkInterceptorDependencies();
    for (const def of this.project.definitions.values()) {
      if (def.node.kind === 'function' && def.node.body) this.checkFunctionBody(def.node, def.file);
      if (def.node.kind === 'class') {
        const initializer = this.initializers.get(def.node);
        if (initializer) this.checkFunctionBody(initializer, def.file, def, true);
        for (const method of def.node.methods) if (method.body)
          this.checkFunctionBody(method, def.file, def);
      }
      if (def.node.kind === 'interface') {
        for (const method of def.node.methods) if (method.body)
          this.checkFunctionBody(method, def.file, def);
      }
      if (def.node.kind === 'interceptor') {
        for (const method of def.node.methods) if (method.body) {
          const next = method.name === 'around' ? this.nextFor(method, def.file,
            this.paramsFor(def.node.typeParams, def.node, def.file)) : undefined;
          this.checkFunctionBody(method, def.file, def, false, undefined, next);
        }
      }
    }
    for (const layers of this.interceptorPlans.values()) for (const layer of layers) {
      this.checkFunctionBody(layer.around, layer.definition.file, layer.definition, false,
        layer.types, { params: layer.around.params, types: layer.inputTypes,
          returns: layer.outputType, returnOwnership: layer.around.returnOwnership,
          indices: layer.argumentIndices });
    }
    for (const def of this.project.definitions.values()) {
      if (this.project.files.get(def.file)?.builtin) continue;
      const methods = def.node.kind === 'function' ? [def.node] : 'methods' in def.node ? def.node.methods : [];
      for (const method of methods) {
        const source = this.project.files.get(def.file)?.source ?? '';
        const doc = javadocBefore(source, method.annotations?.[0]?.span.start ?? method.span.start);
        const types = new Map([...this.paramsFor(def.node.typeParams, def.node, def.file), ...this.paramsFor(method.typeParams, method, def.file)]);
        const errors = this.effectiveErrors(method, def.file, types);
        for (const tag of doc?.tags ?? []) {
          if (['return', 'returns'].includes(tag.name) && this.returnType(method, def.file, types).name === 'void')
            this.report(method.span, `@${tag.name} requires a value-returning callable`, 'DOC');
          if (['throws', 'exception'].includes(tag.name) && !errors.some(error => tyName(error) === tag.value.split(/\s/)[0]))
            this.report(method.span, `@${tag.name} ${tag.value.split(/\s/)[0]} is absent from ${method.name}'s effective unless contract`, 'DOC');
        }
      }
      if (def.node.kind === 'class' && def.node.record && def.node.validationDeclared === false) {
        const source = this.project.files.get(def.file)?.source ?? '';
        const doc = javadocBefore(source, def.node.span.start);
        const errors = this.effectiveErrors(def.node, def.file, this.paramsFor(def.node.typeParams, def.node, def.file));
        for (const tag of doc?.tags ?? []) if (['throws', 'exception'].includes(tag.name) &&
          !errors.some(error => tyName(error) === tag.value.split(/\s/)[0]))
          this.report(def.node.span, `@${tag.name} ${tag.value.split(/\s/)[0]} is absent from ${def.node.name}'s inferred validation errors`, 'DOC');
      }
    }
    if (this.project.main) {
      const context: Context = { file: this.project.main.path, locals: new Map(),
        returns: builtin('void'), returnOwnership: 'managed', allowedErrors: this.project.testMode ? [builtin('Error')] : [],
        unsafe: false, borrowed: new Set(), flow: new OwnershipFlow() };
      for (const [index, item] of this.project.main.items.entries()) {
        context.composition = !this.project.testMode || index < (this.project.testBodyStart ?? 0);
        if (!['import', 'bind'].includes(item.kind)) {
          if (this.isStatement(item)) {
            this.captureScope(item.span, context);
            this.checkStatement(item, context);
            this.captureScope({ ...item.span, start: item.span.end, end: this.project.main.items[index + 1]?.span.start ?? this.project.main.source.length }, context);
          }
        }
      }
    }
    const served = new Set(this.project.main?.items.flatMap(item => item.kind === 'serve' ? item.names.map(name => this.project.scopes.get(this.project.main!.path)?.get(name)?.id) : []) ?? []);
    for (const [expr, plan] of this.actions) {
      if (!served.has(plan.endpoint.id) && !this.project.testMode && !this.project.library) this.report(expr.span, `Serve endpoint ${plan.endpoint.name} in main.aug before referring to its HTTP action`, 'HTTP');
      if ((plan.endpoint.node as MethodDecl).endpoint?.path === '/__aug/actions.js') this.report(expr.span, '/__aug/actions.js is reserved for HTTP action transport', 'HTTP');
    }
    if(this.actions.size)for(const def of this.project.definitions.values())
      if(served.has(def.id)&&def.node.kind==='function'&&def.node.endpoint?.path==='/__aug/actions.js')
        this.report(def.node.span,'/__aug/actions.js is reserved for HTTP action transport','HTTP');
    for (const [node, layers] of this.interceptorPlans) if (node.kind === 'class') {
      for (const [index, layer] of layers.entries()) layer.constructorResultFresh =
        layers.slice(index + 1).every(inner => this.layerReturnsFresh(inner));
    }
    // Call checking specializes these caches. Public facts need declaration
    // parameters and each interceptor application needs its own bound contract.
    const declarationEffects = new Map<MethodDecl, EffectContract>();
    this.inferring = true; // These already-checked names must not duplicate diagnostics.
    for (const def of this.project.definitions.values()) {
      const methods = def.node.kind === 'function' ? [def.node] : 'methods' in def.node ? def.node.methods : [];
      const ownerTypes = this.paramsFor(def.node.typeParams, def.node, def.file);
      for (const method of methods) {
        const types = new Map([...ownerTypes, ...this.paramsFor(method.typeParams, method, def.file)]);
        declarationEffects.set(method, this.effectiveContract(method, def.file, def, types));
      }
    }
    for (const layers of this.interceptorPlans.values()) for (const layer of layers)
      layer.effects = this.contractFor(layer.around, layer.definition.file, layer.definition, layer.types);
    this.inferring = false;
    this.effectContracts.clear();
    for (const [method, contract] of declarationEffects) this.effectContracts.set(method, contract);
    return { project: this.project, diagnostics: this.diagnostics, bindings: this.bindings,
      expressionTypes: this.expressionTypes, functionValues:this.functionValues, patternTypes:this.patternTypes, patternFields:this.patternFields, resolvedNames:this.resolvedNames, resolvedCalls:this.resolvedCalls, resolvedTypes:this.resolvedTypes, errorMatches:this.errorMatches, defaults: this.defaults, interfaceMembers:this.interfaceMembers, callPlans: this.callPlans,
      interceptorPlans: this.interceptorPlans, effectContracts: this.effectContracts, callableContracts: this.callableContracts, constructorContracts: this.constructorContracts,
      expressionOrigins: this.expressionOrigins, inferredOwned:this.inferredOwned, scopes: this.scopes, markupCalls: this.markupCalls, actions:this.actions, httpPolicies:this.httpPolicies, native:this.native };
  }

  private isStatement(item: { kind: string }): item is Stmt {
    return ['expr', 'assign', 'return', 'throw', 'break', 'continue', 'if', 'while', 'for', 'destructure', 'match', 'try', 'unsafe', 'borrow', 'scope', 'freeze', 'serve', 'lock','yield'].includes(item.kind);
  }

  private report(span: Span, message: string, code = 'TYPE', details: Pick<Diagnostic, 'related' | 'expected' | 'actual'> = {}): void {
    if (this.inferring) return;
    this.diagnostics.push({ file: span.file, line: span.line, column: span.column, message, code, ...details });
  }

  private inputDetails(param: Param, expected: Ty, actual: Ty): Pick<Diagnostic, 'related' | 'expected' | 'actual'> {
    const span = param.labelSpan ?? param.nameSpan ?? param.span;
    return { expected: tyName(expected), actual: tyName(actual),
      related: [{file:span.file,line:span.line,column:span.column,message:`Input ${param.label ?? param.name} is declared here.`}] };
  }

  /** Infer body-derived contracts without changing the cached source AST. */
  private inferImplementationEffects(initialize = true): void {
    const bodies: { method: MethodDecl; definition: Definition; owner?: Definition; initializing?: boolean }[] = [];
    for (const definition of this.project.definitions.values()) {
      const node = definition.node;
      if (node.kind === 'class' && initializationOf(node).length) {
        if (initialize) {
          const initializer: MethodDecl = {kind:'function', name:node.name, typeParams:[], params:[],
            returns:syntheticType('void',node.span), returnOwnership:'managed', throws:node.validationErrors ?? [],
            body:initializationOf(node), externC:false, span:node.span};
          const errors = (node.validationErrors ?? []).map(ref => this.resolveType(ref, definition.file, this.paramsFor(node.typeParams, node, definition.file)));
          const contract: CallableContract = {result:builtin('void'), errors, inferredResult:false,
            inferredErrors:!!node.record && node.validationDeclared === false};
          this.initializers.set(node, initializer);
          this.callableContracts.set(initializer, contract);
          this.constructorContracts.set(node, contract);
        }
        bodies.push({method:this.initializers.get(node)!, definition, owner:definition, initializing:true});
      }
      const methods = node.kind === 'function' ? [node] : 'methods' in node ? node.methods : [];
      const types = this.paramsFor(node.typeParams, node, definition.file);
      for (const method of methods) {
        const eligible = !!method.body && !method.externC && method.name !== 'drop';
        if (initialize) {
          const params = new Map([...types, ...this.paramsFor(method.typeParams, method, definition.file)]);
          this.callableContracts.set(method, {
            result: eligible && method.declared?.returns === false ? errorTy : this.resolveType(method.returns, definition.file, params),
            errors: method.throws.map(ref => this.resolveType(ref, definition.file, params)),
            inferredResult: eligible && method.declared?.returns === false,
            inferredErrors: eligible && method.declared?.errors === false,
          });
          if (eligible && !method.uses?.length) this.inferredUses.set(method, new Map());
          if (eligible && !method.changes?.length) this.inferredChanges.set(method, new Set());
        }
        if (eligible) bodies.push({ method, definition, owner: node.kind === 'function' ? undefined : definition });
      }
    }
    this.inferring = true;
    try {
      for (const { method, owner, initializing } of bodies) if (!initializing && owner?.node.kind === 'class') {
        const types = this.paramsFor(owner.node.typeParams, owner.node, owner.file);
        for (const ref of owner.node.implements) {
          const implemented = this.resolveType(ref, owner.file, types);
          for (const entry of this.interfaceMethods(implemented, new Set()).get(method.name) ?? []) {
            const contractOwner = this.project.definitions.get(entry.from);
            if (initialize && this.callableContracts.get(method)?.inferredResult && !entry.method.body) {
              const interfaceTypes = new Map(entry.params);
              entry.method.typeParams.forEach((name, index) => {
                const own = this.paramsFor(method.typeParams, method, owner.file).get(method.typeParams[index]);
                if (own) interfaceTypes.set(name, own);
              });
              this.callableContracts.get(method)!.result = this.returnType(entry.method, entry.file, interfaceTypes);
              this.contextualResults.add(method);
            }
            if (contractOwner?.node.kind !== 'interface' || !contractOwner.node.capability) continue;
            // Invoking a capability is an effect even for a pure test adapter.
            const contract = this.contractFor(entry.method, entry.file, contractOwner, entry.params);
            for (const [key, effect] of contract.uses) this.inferredUses.get(method)?.set(key, effect);
          }
        }
      }
      // Forward references and recursive calls reach the same deterministic fixed point.
      for (let pass = 0; pass <= bodies.length + 1; pass++) {
        this.constructorFreshness.clear();
        this.inferenceChanged = false;
        this.changingInference.clear();
        for (const { method, definition, owner, initializing } of bodies) {
          const types = this.paramsFor(owner && 'typeParams' in owner.node ? owner.node.typeParams : [], owner?.node, definition.file);
          const next = owner?.node.kind === 'interceptor' && method.name === 'around' ? this.nextFor(method, definition.file, types) : undefined;
          this.checkFunctionBody(method, definition.file, owner, initializing, undefined, next);
        }
        if (!this.inferenceChanged) return;
      }
    } finally { this.inferring = false; }
    for (const method of this.changingInference) this.report(method.span,
      `Contract inference for ${method.name} did not reach a finite contract; declare returns, uses, or unless on recursive generic helpers`, 'INFERENCE');
  }

  private returnType(fn: MethodDecl, file: string, types = new Map<string, Ty>()): Ty {
    const contract = this.callableContracts.get(fn);
    return contract ? this.substitute(contract.result, types) : this.resolveType(fn.returns, file, types);
  }

  private bodyErrors(fn: MethodDecl, file: string, types = new Map<string, Ty>()): Ty[] {
    const contract = this.callableContracts.get(fn);
    return contract ? contract.errors.map(type => this.substitute(type, types)) : fn.throws.map(ref => this.resolveType(ref, file, types));
  }

  private markInference(fn: MethodDecl): void {
    this.inferenceChanged = true;
    this.changingInference.add(fn);
  }

  private inferredReturn(types: Ty[]): Ty {
    const known = types.filter(type => type.kind !== 'error');
    if (!known.length) return types.length ? errorTy : builtin('void');
    let result = known[0];
    for (const type of known.slice(1)) {
      if (unresolved(result) && !unresolved(type)) result = type;
      else if (type.kind === 'null' && result.kind !== 'null') result = {...result, nullable: true, optional: true};
      else if (result.kind === 'null' && type.kind !== 'null') result = {...type, nullable: true, optional: true};
      else if (this.assignable(type, result)) continue;
      else if (this.assignable(result, type)) result = type;
      // Keep the first type; the final checking pass diagnoses incompatible returns.
    }
    return result;
  }

  private checkMemberVisibility(ownerId: string, ownerName: string, name: string,
                                span: Span, context: Context): void {
    if (isPrivateName(name) && context.self?.id !== ownerId)
      this.report(span, `Member ${name} is private to ${ownerName}`, 'PRIVATE');
  }

  private resolveType(ref: TypeRef, file: string, params: Map<string, Ty> = new Map(), validateConstraints = true): Ty {
    const type = this.resolveTypeBase(ref, file, params, validateConstraints);
    if (!ref.immutable) {this.resolvedTypes.set(ref,type); return type;}
    if (!['List', 'Map', 'Set', 'Tuple'].includes(type.name) || !this.immutableData(type))
      this.report(ref.span, 'immutable qualifies collections of data values; behavioral objects retain their explicit ownership contracts', 'IMMUTABLE');
    const result=immutableType(type); this.resolvedTypes.set(ref,result); return result;
  }

  private resolveTypeBase(ref: TypeRef, file: string, params: Map<string, Ty> = new Map(), validateConstraints = true): Ty {
    const param = params.get(ref.name);
    if (param) return { ...param, nullable: ref.nullable || param.nullable, optional: ref.optional || param.optional };
    if (builtinNames.has(ref.name)) {
      if (builtinTypes[ref.name as keyof typeof builtinTypes].arity !== 0) {
        const count = builtinTypes[ref.name as keyof typeof builtinTypes].arity;
        if (ref.name !== 'Tuple' && ref.args.length !== count) this.report(ref.span,
          `${ref.name} expects ${count === 1 ? 'one type argument' : 'two type arguments'}`);
        const args = ref.args.map(arg => this.resolveType(arg, file, params, validateConstraints));
        if (ref.name !== 'Task' && args.some(arg => arg.id === 'builtin:void')) this.report(ref.span,
          'Collections cannot contain void', 'COLLECTION');
        const containsResource=(type:Ty):boolean=>type.kind==='resource'||type.args.some(containsResource);
        if(args.some(containsResource))this.report(ref.span,'Native resources require individual own bindings; managed collections cannot retain them','OWN');
        return { ...builtin(ref.name), args,
          nullable: ref.nullable, optional: ref.optional };
      }
      if (ref.args.length) this.report(ref.span, `${ref.name} does not take type arguments`);
      return { ...builtin(ref.name), nullable: ref.nullable, optional: ref.optional };
    }
    const def = this.project.scopes.get(file)?.get(ref.name);
    if (!def || def.node.kind === 'function' || def.node.kind === 'interceptor' || def.node.kind === 'composition') {
      if (def?.node.kind === 'interceptor') {
        this.report(ref.span, `${ref.name} is an interceptor; apply it with [${ref.name}]`, 'INTERCEPTOR');
        return errorTy;
      }
      this.report(ref.span,ref.name==='let'?'Unknown type let. Inferred bindings use name = value or name to value; remove let unless it names an imported type.':`Unknown type ${ref.name}`,ref.name==='let'?'BINDING':'TYPE');
      return errorTy;
    }
    const expected = def.node.typeParams.length;
    if (ref.args.length !== expected) this.report(ref.span,
      `${ref.name} expects ${expected} type argument${expected === 1 ? '' : 's'}, got ${ref.args.length}`);
    const args = ref.args.map(arg => this.resolveType(arg, file, params, validateConstraints));
    if (validateConstraints) this.checkConstraints(def.node, def.file, new Map(def.node.typeParams.map((name, index) => [name, args[index] ?? errorTy])), ref.span);
    return { id: def.id, name: def.name, kind: def.node.kind, def, args, nullable: ref.nullable, optional: ref.optional };
  }

  private paramsFor(names: string[], header?: GenericHeader, file?: string): Map<string, Ty> {
    const scope = header && 'span' in header ? `${file}:${(header as GenericHeader & { span: Span }).span.start}` : 'inference';
    const params = new Map(names.map(name => [name, { id: `param:${scope}:${name}`, name, kind: 'param',
      args: [], nullable: false } as Ty]));
    if (header && file) this.addBounds(params, header, file);
    return params;
  }

  private addBounds(params: Map<string, Ty>, header: GenericHeader, file: string): void {
    for (const name of header.typeParams) {
      const type = params.get(name);
      if (type?.kind === 'param') {
        const bounds=(header.typeConstraints?.[name] ?? []).map(ref => {
          const bound=this.resolveType(ref,file,params,false);
          if(bound.kind==='choice'&&(bound.nullable||bound.optional))this.report(ref.span,'Use a non-null choice bound and optional T for nullable inputs','CHOICE');
          return bound;
        });
        params.set(name,{...type,bounds});
      }
    }
  }

  private checkConstraints(header: GenericHeader, file: string, types: Map<string, Ty>, span: Span): void {
    const key = `${file}:${header.typeParams.map(name => tyName(types.get(name) ?? errorTy)).join(',')}:${JSON.stringify(header.typeConstraints ?? {})}`;
    if (this.constraintStack.has(key)) return;
    this.constraintStack.add(key);
    for (const name of header.typeParams) for (const ref of header.typeConstraints?.[name] ?? []) {
      const constraint = this.resolveType(ref, file, types);
      if (constraint.kind !== 'interface' && constraint.kind !== 'choice') this.report(ref.span,
        `Constraint ${typeName(ref)} must be an interface or choice`, 'GENERIC');
      const actual = types.get(name);
      if (actual && !this.assignable(actual, constraint)) this.report(span,
        `Type argument ${name}=${tyName(actual)} must implement ${tyName(constraint)}`, 'GENERIC');
    }
    this.constraintStack.delete(key);
  }

  private checkVariance(header: GenericHeader & { kind: string; span: Span }, file: string): void {
    const variance = header.typeVariance ?? {};
    if (header.kind !== 'interface') {
      if (Object.keys(variance).length) this.report(header.span, 'Only interfaces may declare in/out variance', 'GENERIC');
      return;
    }
    const visit = (ref: TypeRef, position: number) => {
      const mode = variance[ref.name];
      if (mode === 'out' && position <= 0 || mode === 'in' && position >= 0)
        this.report(ref.span, `${mode} type parameter ${ref.name} occurs in an incompatible ${position === 0 ? 'invariant' : position < 0 ? 'input' : 'output'} position`, 'GENERIC');
      const def = this.project.scopes.get(file)?.get(ref.name);
      ref.args.forEach((arg, index) => {
        const nested = ref.name === 'Tuple' ? 'out' : def && 'typeVariance' in def.node ? def.node.typeVariance?.[def.node.typeParams[index]] : undefined;
        visit(arg, nested === 'out' ? position : nested === 'in' ? -position : 0);
      });
    };
    const iface = header as InterfaceDecl;
    iface.extends.forEach(ref => visit(ref, 1));
    iface.methods.forEach(method => {
      method.params.forEach(param => visit(param.type, -1));
      const result = this.callableContracts.get(method)?.result;
      const reference = (type: Ty): TypeRef => ({name: type.name, args: type.args.map(reference), nullable: type.nullable, optional: type.optional, span: method.span});
      visit(result ? reference(result) : method.returns, 1);
      (this.callableContracts.get(method)?.errors.map(reference) ?? method.throws).forEach(ref => visit(ref, 1));
    });
  }

  private checkDefault(param: Param, file: string, types: Map<string, Ty>, restricted = false): void {
    if (!param.defaultValue) return;
    if (restricted || param.injected || param.ownership !== 'managed') {
      this.report(param.span, 'Defaults require an ordinary managed input; native and HTTP inputs keep their explicit contracts', 'DEFAULT');
      return;
    }
    if (!literalDefault(param.defaultValue)) {
      this.report(param.defaultValue.span, 'A default is literal data, including collections; compute other values at the call', 'DEFAULT');
      return;
    }
    const expected = this.resolveType(param.type, file, types);
    const context: Context = {file, locals: new Map(), returns: builtin('void'), returnOwnership: 'managed',
      allowedErrors: [], unsafe: false, borrowed: new Set(), types, flow: new OwnershipFlow()};
    const actual = this.checkExpression(param.defaultValue, context, expected);
    if (!this.assignable(actual, expected)) this.report(param.defaultValue.span,
      `Default for ${param.label ?? param.name} expects ${tyName(expected)}, got ${tyName(actual)}`, 'DEFAULT');
  }

  private checkFunctionSignature(fn: MethodDecl, file: string, inheritedParams: Map<string, Ty>): void {
    const params = new Map(inheritedParams);
    for (const [key, value] of this.paramsFor(fn.typeParams, fn, file)) {
      if (params.has(key)) this.report(fn.span, `Duplicate type parameter ${key}`);
      params.set(key, value);
    }
    this.addBounds(params, fn, file);
    this.checkVariance(fn, file);
    const names = new Set<string>();
    for (const param of fn.params) {
      if (names.has(param.name)) this.report(param.span, `Duplicate parameter ${param.name}`);
      names.add(param.name);
      if (param.name === 'next') this.report(param.span, 'next is reserved for interceptor continuations', 'NEXT');
      if (param.injected && param.ownership !== 'managed') this.report(param.span,
        'A resolve parameter cannot also be own or borrow', 'DI');
      this.resolveType(param.type, file, params);
      this.checkDefault(param, file, params, !!fn.endpoint || fn.externC);
    }
    this.returnType(fn, file, params);
    if(this.returnType(fn,file,params).kind==='resource'&&fn.returnOwnership!=='own')
      this.report(fn.span,'A native resource return must declare returns own','OWN');
    if (fn.endpoint) {
      const endpoint = fn.endpoint;
      if (!/^[A-Z]+$/.test(endpoint.method)) this.report(fn.span, 'Endpoint methods use uppercase HTTP method names', 'HTTP');
      if (!endpoint.path.startsWith('/') || /[?#\r\n]/.test(endpoint.path)) this.report(fn.span, 'Endpoint paths start with / and contain no query, fragment, or control characters', 'HTTP');
      if (!Number.isInteger(endpoint.status) || endpoint.status < 100 || endpoint.status > 599) this.report(fn.span, 'HTTP statuses must be integers from 100 to 599', 'HTTP');
      if (!fn.body || fn.typeParams.length) this.report(fn.span, 'Endpoints need a concrete body and parameter types', 'HTTP');
      const body = fn.params.filter(param => param.source?.kind === 'body' || param.source?.kind === 'form');
      if (body.length > 1) this.report(fn.span, 'An endpoint has one body consumer', 'HTTP');
      for (const param of fn.params) {
        if (param.injected && param.source || !param.injected && !param.source) this.report(param.span, 'Endpoint inputs declare from path/query/header/body/cookie/form/request; dependencies use resolve', 'HTTP');
        if (param.ownership !== 'managed') this.report(param.span, 'HTTP-bound inputs provide read-only access', 'HTTP');
        const type = this.resolveType(param.type, file, params);
        if (param.source?.kind === 'path' && !endpoint.path.includes('{' + (param.source.name ?? param.name) + '}')) this.report(param.span, 'Path input must match a placeholder in the endpoint path', 'HTTP');
        if (param.source && ['path', 'query', 'header', 'cookie'].includes(param.source.kind) && !['int', 'float', 'bool', 'string'].includes(type.name)) this.report(param.span, 'Scalar HTTP inputs use int, float, bool, or string', 'HTTP');
        if (param.source && ['body', 'form'].includes(param.source.kind) && !jsonDataType(this.project, type)) this.report(param.span, 'Decoded HTTP bodies use JSON data records or collections', 'HTTP');
        if (param.source?.kind === 'request' && type.name !== 'HttpRequest') this.report(param.span, 'from request provides HttpRequest', 'HTTP');
      }
      const result = this.returnType(fn, file, params);
      if(endpoint.streams) {
        if(!['ServerEvent','Bytes','Html'].includes(result.name)||result.optional||result.nullable) this.report(fn.span,'An endpoint streams ServerEvent<T>, Bytes, or Html','HTTP');
        if(result.name==='ServerEvent'&&!jsonDataType(this.project,result.args[0]))this.report(fn.span,'ServerEvent data uses a concrete JSON data type','HTTP');
      } else if (!jsonDataType(this.project, result) && !['void', 'HttpResponse', 'Html', 'Bytes'].includes(result.name)) this.report(fn.span, `${tyName(result)} cannot be serialized as an HTTP response`, 'HTTP');
      for(const error of endpoint.errors)if(error.type.args.length)this.report(error.type.span,'Generic errors need an explicit non-generic HTTP error mapping; catch and convert the failure in the endpoint body','HTTP');
      for (const error of endpoint.errors) if (!Number.isInteger(error.status) || error.status < 400 || error.status > 599) this.report(error.type.span, 'Mapped error statuses must be from 400 to 599', 'HTTP');
    }
    for (const changed of fn.changes ?? []) {
      const root = changed.split('.')[0];
      const param = fn.params.find(param => param.name === root);
      if (root !== 'self' && !param) this.report(fn.span, `changes ${changed} must name self or a parameter`, 'EFFECT');
      if (param && param.ownership !== 'borrow' && param.ownership !== 'own')
        this.report(param.span, `Mutable input ${root} must use borrow or own`, 'EFFECT');
    }
    for (const thrown of fn.throws) {
      const type = this.resolveType(thrown, file, params);
      if (!this.implementsError(type)) this.report(thrown.span,
        `Thrown type ${typeName(thrown)} must implement Error`);
    }
    if (fn.externC) {
      const native=this.native.functions.get(fn);
      if(native)this.checkNativeSignature(fn,file,native);
      else {
      if (fn.nativePure && (fn.uses?.length || fn.changes?.length)) this.report(fn.span, 'A pure native declaration cannot declare effects', 'FFI');
      if (fn.params.some(param => param.injected)) this.report(fn.span,
        'extern C declarations cannot use resolve parameters', 'FFI');
      if (fn.typeParams.length || fn.throws.length && !fn.valueAbi) this.report(fn.span,
        'extern C functions cannot be generic or declare unless errors', 'FFI');
      if (fn.returnOwnership === 'own' || fn.params.some(param => param.ownership !== 'managed'))
        this.report(fn.span, 'extern C functions cannot transfer AugScript ownership', 'FFI');
      for (const type of fn.valueAbi ? [] : [...fn.params.map(p => p.type), fn.returns]) {
        if (!['int', 'c_int', 'float', 'bool', 'string', 'void'].includes(type.name) || type.args.length || type.nullable)
          this.report(type.span, `Type ${typeName(type)} is not supported at the C FFI boundary`, 'FFI');
      }
      }
    }
    if (fn.name === 'drop' && (fn.params.length || fn.throws.length || fn.returns.name !== 'void' || fn.uses?.length))
      this.report(fn.span, 'drop must take no inputs, return void, and perform only local cleanup; external effects require an explicit method', 'EFFECT');
  }

  private checkNativeSignature(fn:MethodDecl,file:string,binding:NativeFunction):void {
    const check=(type:Ty,view:NativeView,span:Span)=>{
      const name=view.kind==='i64'?'int':view.kind==='i32'?'c_int':view.kind==='f64'?'float':view.kind==='utf8'?'string':view.kind==='bytes'?'Bytes':view.kind;
      const valid=view.kind==='resource'?type.kind==='resource'&&this.native.resources.get(type.def!.node as import('./ast.ts').ResourceDecl)?.module+'.'+type.name===view.resource&&this.native.providers.get(type.def!.node as import('./ast.ts').ResourceDecl)===this.native.providers.get(fn):
        view.kind==='f64-list'||view.kind==='utf8-list'?type.name==='List'&&type.args.length===1&&type.args[0].name===(view.kind==='f64-list'?'float':'string'):type.name===name;
      if(!valid||type.nullable||type.optional)this.report(span,`Native contract expects ${view.resource??view.kind}, got ${tyName(type)}`,'NATIVE_ABI');
    };
    if(fn.body||fn.typeParams.length||fn.params.some(p=>p.injected)||fn.annotations?.length)this.report(fn.span,'Native ABI declarations have concrete inputs, no body, no resolve parameters, and no interceptors','NATIVE_ABI');
    if(fn.params.length!==binding.params.length)this.report(fn.span,'Native parameter count differs from the binding descriptor','NATIVE_ABI');
    fn.params.forEach((p,i)=>{const view=binding.params[i];if(!view)return;
      if(p.name!==view.name)this.report(p.span,'Native parameter label differs from the binding descriptor: '+view.name,'NATIVE_ABI');
      check(this.resolveType(p.type,file),view,p.span);
      const ownership=view.kind==='resource'?view.ownership==='consume'?'own':view.ownership==='borrow'?'borrow':'managed':'managed';
      if(p.ownership!==ownership)this.report(p.span,'Native parameter ownership differs from its binding descriptor','NATIVE_ABI');
    });
    check(this.returnType(fn,file),binding.result,fn.returns.span);
    if((binding.result.kind==='resource')!==(fn.returnOwnership==='own'))this.report(fn.span,'Native result ownership differs from its binding descriptor','NATIVE_ABI');
    const errors=fn.throws.map(t=>this.resolveType(t,file));
    if(errors.length!==(binding.error?1:0)||binding.error&&errors[0]?.def?.id!==this.native.errors.get(fn)?.id)this.report(fn.span,'Native checked errors differ from the binding descriptor','NATIVE_ABI');
    if(binding.error){
      const error=errors[0]?.def?.node;
      if(error?.kind!=='class'||error.typeParams.length||error.fields.length!==2||error.fields[0].name!=='code'||error.fields[0].type.name!=='int'||error.fields[1].name!=='message'||error.fields[1].type.name!=='string'||error.fields.some(p=>p.injected||p.ownership!=='managed'||p.type.nullable||p.type.optional||p.type.args.length)||initializationOf(error).length||error.annotations?.length)
        this.report(fn.span,'Native status errors require an Error class with int code and string message inputs and no constructor work','NATIVE_ABI');
    }
    const uses=(fn.uses??[]).map(u=>u.source+'.'+u.operation).sort(),changes=[...(fn.changes??[])].sort();
    if(JSON.stringify(uses)!==JSON.stringify([...binding.uses].sort())||JSON.stringify(changes)!==JSON.stringify([...binding.changes].sort()))this.report(fn.span,'Native effects or mutation differ from the binding descriptor','NATIVE_ABI');
  }

  private checkInterceptorShape(def: Definition): void {
    const node = def.node as InterceptorDecl;
    const types = this.paramsFor(node.typeParams, node, def.file);
    this.checkVariance(node, def.file);
    if (new Set(node.typeParams).size !== node.typeParams.length)
      this.report(node.span, 'Duplicate interceptor type parameter', 'INTERCEPTOR');
    const names = new Set<string>();
    for (const field of node.fields) {
      if (names.has(field.name)) this.report(field.span, `Duplicate field ${field.name}`);
      names.add(field.name);
      this.resolveType(field.type, def.file, types);
      if (!field.injected) this.report(field.span,
        `Interceptor constructor parameter ${field.name} must be marked resolve`, 'INTERCEPTOR');
      if (field.ownership !== 'managed') this.report(field.span,
        'Interceptor dependencies use managed resolve parameters', 'DI');
    }
    for (const method of node.methods) {
      if (names.has(method.name)) this.report(method.span, `Duplicate interceptor member ${method.name}`);
      names.add(method.name);
      this.checkFunctionSignature(method, def.file, types);
      if (method.name === 'around') {
        if (!method.body) this.report(method.span, 'around requires an implementation', 'INTERCEPTOR');
        if (method.typeParams.length) this.report(method.span,
          'Declare generic parameters on the interceptor, rather than around', 'INTERCEPTOR');
        if (method.annotations?.length) this.report(method.span,
          'Apply interceptor layers to the target declaration; around cannot be annotated', 'INTERCEPTOR');
        if (this.returnType(method, def.file, types).name !== 'void' && canFallThrough(method.body ?? [])) this.report(method.span,
          'around must return its result or throw on every execution path', 'INTERCEPTOR');
        if (canRepeatNext(method.body ?? [])) this.report(method.span,
          'next may be called at most once on each execution path; a loop or catch path can call it again', 'NEXT');
      }
    }
    if (!node.methods.some(method => method.name === 'around')) this.report(node.span,
      `${node.name} must define around(...)`, 'INTERCEPTOR');
  }

  private nextFor(method: MethodDecl, file: string, types: Map<string, Ty>): NextContext {
    const result = this.returnType(method, file, types);
    return { params: method.params, types: method.params.map(param => this.resolveType(param.type, file, types)),
      returns: result.kind === 'error' && method.declared?.returns === false ?
        {id: 'continuation:' + file + ':' + method.span.start, name: '<target result>', kind: 'param', args: [], nullable: false} : result,
      returnOwnership: method.returnOwnership };
  }

  private inferInterceptorType(ref: TypeRef, actual: Ty, names: string[], types: Map<string, Ty>, file: string): void {
    inferType(ref, actual, names, types, message => this.report(ref.span, message, 'GENERIC'), (name, value) => {
      const expected = this.project.scopes.get(file)?.get(name);
      return expected?.node.kind === 'interface' ? this.interfaceView(value, expected.id) : value;
    });
  }

  private interfaceView(type: Ty, id: string, seen = new Set<string>()): Ty | undefined {
    if (type.id === id) return type;
    if (!type.def || seen.has(type.id)) return undefined;
    seen.add(type.id);
    const node = type.def.node;
    if (node.kind !== 'class' && node.kind !== 'interface') return undefined;
    const types = new Map(node.typeParams.map((name, index) => [name, type.args[index] ?? errorTy]));
    for (const ref of node.kind === 'class' ? node.implements : node.extends) {
      const found = this.interfaceView(this.resolveType(ref, type.def.file, types), id, seen);
      if (found) return found;
    }
    return undefined;
  }

  /** The native policy ABI accepts the published capability shape across source-package identities. */
  private nativeWebCapability(type: Ty, name: string): boolean {
    const canonical = nativeHttpContracts.get(name);
    const shape = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(shape);
      if (!value || typeof value !== 'object') return value;
      return Object.fromEntries(Object.entries(value).filter(([key]) => !['span','nameSpan','labelSpan','argLabelSpans','headerEnd'].includes(key)).map(([key,child]) => [key,shape(child)]));
    };
    if (!canonical || !type.def || JSON.stringify(shape(type.def.node)) !== JSON.stringify(shape(canonical))) return false;
    if (name === 'RequestLogger') return true;
    const principal = this.project.scopes.get(type.def.file)?.get('Principal');
    const expected = nativeHttpContracts.get('Principal');
    return !!principal && !!expected && JSON.stringify(shape(principal.node)) === JSON.stringify(shape(expected));
  }

  private planInterceptors(): void {
    const plan = (node: MethodDecl | ClassDecl, file: string, ownerTypes: Map<string, Ty>,
                  inputs: Param[], output: Ty, ownership: 'managed' | 'own') => {
      const layers: InterceptorLayer[] = [];
      this.interceptorPlans.set(node, layers);
      let seenCustom=false;
      for (const annotation of node.annotations ?? []) {
        if(httpPolicyNames.includes(annotation.name as typeof httpPolicyNames[number])) {
          if(node.kind!=='function'||!node.endpoint)this.report(annotation.span,`${annotation.name} is an HTTP endpoint policy`,'HTTP');
          else {
            if(seenCustom)this.report(annotation.span,'Put HTTP policies before custom parameter interceptors so guards run before decoding','HTTP');
            const policies=this.httpPolicies.get(node)??[];
            if(['Cors','Compress'].includes(annotation.name)&&policies.some(policy=>policy.name===annotation.name))
              this.report(annotation.span,`${annotation.name} may appear only once on an endpoint`,'HTTP');
            policies.push(checkHttpPolicy(annotation,node,this.diagnostics,(param,name)=>
              this.nativeWebCapability(this.resolveType(param.type,file,ownerTypes), name)));
            this.httpPolicies.set(node,policies);
          }
          continue;
        }
        seenCustom=true;
        const definition = this.project.scopes.get(file)?.get(annotation.name);
        if (!definition) {
          this.report(annotation.nameSpan, `Unknown interceptor ${annotation.name}`, 'NAME'); continue;
        }
        if (definition.node.kind !== 'interceptor') {
          this.report(annotation.nameSpan, `${annotation.name} must be declared with interceptor`, 'INTERCEPTOR');
          continue;
        }
        const interceptor = definition.node;
        const around = interceptor.methods.find(method => method.name === 'around');
        if (!around) continue;
        if (node.kind === 'function' && !node.body && !node.externC) {
          this.report(annotation.span, 'An interceptor requires an executable function or method body', 'INTERCEPTOR');
          continue;
        }
        const mapping = new Map<string, string>();
        for (const entry of annotation.mappings) {
          if(entry.value)this.report(entry.span,'Custom interceptor mappings name a target parameter; literal options belong to built-in HTTP policies','INTERCEPTOR');
          if (mapping.has(entry.name)) this.report(entry.span, `Duplicate mapping ${entry.name}`, 'INTERCEPTOR');
          const param = around.params.find(param => param.name === entry.name);
          if (!param) this.report(entry.span,
            `${interceptor.name}.around has no parameter ${entry.name}`, 'INTERCEPTOR');
          else if (param.injected) this.report(entry.span,
            `${entry.name} is resolved from DI and cannot be mapped`, 'INTERCEPTOR');
          if (!inputs.some(param => param.name === entry.source)) this.report(entry.sourceSpan,
            `${node.name} has no parameter ${entry.source}`, 'INTERCEPTOR');
          mapping.set(entry.name, entry.source);
        }
        const types = new Map<string, Ty>();
        if (annotation.typeArgs.length && annotation.typeArgs.length !== interceptor.typeParams.length)
          this.report(annotation.span, `${interceptor.name} expects ${interceptor.typeParams.length} type arguments`, 'INTERCEPTOR');
        interceptor.typeParams.forEach((name, index) => {
          if (annotation.typeArgs[index]) types.set(name, this.resolveType(annotation.typeArgs[index], file, ownerTypes));
        });
        const inferredNames = interceptor.typeParams.filter((_, index) => !annotation.typeArgs[index]);
        const inferredOutput = this.callableContracts.get(around);
        if (inferredOutput?.inferredResult) {
          types.set('<target result>', output);
          if (inferredOutput.result.name !== '<target result>') {
            const reference = (type: Ty): TypeRef => ({name:type.name, args:type.args.map(reference), nullable:type.nullable, optional:type.optional, span:around.span});
            this.inferInterceptorType(reference(inferredOutput.result), output, inferredNames, types, definition.file);
          }
        } else this.inferInterceptorType(around.returns, output, inferredNames, types, definition.file);
        const argumentIndices = around.params.map(param => param.injected ? undefined :
          inputs.findIndex(input => input.name === (mapping.get(param.name) ?? param.name)));
        const inputTypes = argumentIndices.map((index, i) => index !== undefined && index >= 0 ?
          this.resolveType(inputs[index].type, file, ownerTypes) : errorTy);
        around.params.forEach((param, index) => {
          if (!param.injected) this.inferInterceptorType(param.type, inputTypes[index], inferredNames, types, definition.file);
        });
        for (const name of interceptor.typeParams) if (!types.has(name)) {
          this.report(annotation.span,
            `Cannot infer interceptor type ${name}; supply explicit type arguments on ${interceptor.name}`, 'INTERCEPTOR');
          types.set(name, errorTy);
        }
        this.checkConstraints(interceptor, definition.file, types, annotation.span);
        const selected = new Map<number, Param>();
        const argumentBindings = around.params.map((param, i) => {
          const expected = this.resolveType(param.type, definition.file, types);
          if (param.injected) {
            inputTypes[i] = expected;
            return this.bindingKeyForType(expected);
          }
          const index = argumentIndices[i]!;
          if (index < 0) this.report(annotation.span,
            `${interceptor.name}.around needs parameter ${param.name}; map it to a parameter of ${node.name}`, 'INTERCEPTOR');
          else {
            if (!this.assignable(inputTypes[i], expected)) this.report(annotation.span,
              `Mapping ${inputs[index].name} to ${param.name} expects ${tyName(expected)}, got ${tyName(inputTypes[i])}`, 'INTERCEPTOR');
            if (param.ownership !== inputs[index].ownership) this.report(annotation.span,
              `Parameter ${param.name} must use ${inputs[index].ownership} ownership to match ${inputs[index].name}`, 'OWN');
            const previous = selected.get(index);
            if (previous && (param.ownership !== 'managed' || previous.ownership !== 'managed'))
              this.report(annotation.span, `Cannot map owned or borrowed parameter ${inputs[index].name} more than once`, 'OWN');
            selected.set(index, param);
          }
          return undefined;
        });
        const result = this.returnType(around, definition.file, types);
        if (!this.assignable(result, output)) this.report(annotation.span,
          `${interceptor.name}.around returns ${tyName(result)}; ${node.name} requires ${tyName(output)}`, 'INTERCEPTOR');
        if (around.returnOwnership !== ownership) this.report(annotation.span,
          `Interceptor ${interceptor.name} must preserve ${ownership} return ownership`, 'OWN');
        const constructorKeys = interceptor.fields.map(field =>
          this.bindingKeyForType(this.resolveType(field.type, definition.file, types)));
        const injectedIndex = (ref: TypeRef): number => {
          const required = this.resolveType(ref, definition.file, types);
          const index = inputs.findIndex(input => input.injected &&
            this.assignable(this.resolveType(input.type, file, ownerTypes), required));
          if (index < 0) this.report(annotation.span,
            `${node.name} must declare a resolve ${tyName(required)} parameter required by interceptor ${interceptor.name}`, 'DI');
          return index;
        };
        const constructorInputIndices = interceptor.fields.map(field => injectedIndex(field.type));
        const argumentInjectionIndices = around.params.map(param => param.injected ? injectedIndex(param.type) : undefined);
        layers.push({ annotation, definition, around, argumentIndices, argumentBindings, constructorKeys,
          types, inputTypes, outputType: output, constructorInputIndices, argumentInjectionIndices,
          errors: this.bodyErrors(around, definition.file, types) });
      }
    };
    for (const def of this.project.definitions.values()) {
      const node = def.node;
      const types = this.paramsFor(node.typeParams, node, def.file);
      if (node.kind === 'class') plan(node, def.file, types, node.fields,
        { id: def.id, name: def.name, kind: 'class', def, args: [...types.values()], nullable: false }, 'managed');
      if (node.kind === 'function') plan(node, def.file, types, node.params,
        this.returnType(node, def.file, types), node.returnOwnership);
      if ('methods' in node) for (const method of node.methods) {
        if (node.kind === 'interceptor' && method.name === 'around') continue;
        const methodTypes = new Map([...types, ...this.paramsFor(method.typeParams, method, def.file)]);
        plan(method, def.file, methodTypes, method.params,
          this.returnType(method, def.file, methodTypes), method.returnOwnership);
      }
    }
  }

  private substitute(type: Ty, types: Map<string, Ty>): Ty {
    if (type.kind === 'param' && types.has(type.name)) {
      const value = types.get(type.name)!;
      return { ...value, nullable: type.nullable || value.nullable };
    }
    return { ...type, args: type.args.map(arg => this.substitute(arg, types)) };
  }

  private effectiveErrors(node: MethodDecl | ClassDecl, file: string, types: Map<string, Ty>): Ty[] {
    return [
      ...(node.kind === 'function' ? this.bodyErrors(node, file, types) : (this.constructorContracts.get(node)?.errors.map(type => this.substitute(type, types)) ?? (node.validationErrors ?? []).map(ref => this.resolveType(ref, file, types)))),
      ...(this.interceptorPlans.get(node) ?? []).flatMap(layer => this.bodyErrors(layer.around, layer.definition.file,
        new Map([...layer.types].map(([name, type]) => [name, this.substitute(type, types)])))),
    ];
  }

  private checkInterceptorDependencies(): void {
    for (const [node, layers] of this.interceptorPlans) {
      if (node.kind === 'class') for (const layer of layers) {
        const effects = this.contractFor(layer.around, layer.definition.file, layer.definition, layer.types);
        if (effects.uses.size || effects.changes.some(path => path !== 'self' && !path.startsWith('self.')))
          this.report(layer.annotation.span, 'Constructor interceptors must be pure; move external work to an explicit startup method', 'EFFECT');
      }
      if (node.kind === 'function' && node.name === 'drop' && layers.length) {
        const owner = [...this.project.definitions.values()].find(def => 'methods' in def.node && def.node.methods.includes(node));
        const types = new Map([...(owner && 'typeParams' in owner.node ? this.paramsFor(owner.node.typeParams, owner.node, owner.file) : []),
          ...this.paramsFor(node.typeParams, node, node.span.file)]);
        if (this.effectiveContract(node, node.span.file, owner, types).uses.size || this.effectiveErrors(node, node.span.file, types).length)
          this.report(node.span, 'drop interceptor layers must perform only local cleanup and cannot add effects or errors', 'EFFECT');
      }
    }
  }

  private checkChoiceShape(def:Definition):void {
    if(def.node.kind!=='choice')return;
    if(def.node.alternatives.length<2)this.report(def.node.span,'A choice needs at least two distinct immutable records','CHOICE');
    const seen=new Set<string>();
    for(const ref of def.node.alternatives){
      const type=this.resolveType(ref,def.file);
      if(ref.nullable||ref.optional||ref.immutable||ref.args.length||type.def?.node.kind!=='class'||!type.def.node.record||type.def.node.typeParams.length)
        this.report(ref.span,'Choice alternatives must be concrete non-generic immutable records','CHOICE');
      if(seen.has(type.id))this.report(ref.span,'Repeated choice alternative '+type.name+'; select distinct records','CHOICE');
      seen.add(type.id);
    }
  }

  private checkClassShape(def: Definition): void {
    const cls = def.node as ClassDecl;
    for(const ref of cls.implements)if(this.project.scopes.get(def.file)?.get(ref.name)?.node.kind==='choice')
      this.report(ref.span,'A choice cannot be implemented; construct one of its declared record alternatives','CHOICE');
    if (!cls.record && cls.implements.length === 0) this.report(cls.span,
      `${cls.name} must implement at least one interface`, 'INTERFACE');
    const params = this.paramsFor(cls.typeParams, cls, def.file);
    for(const error of cls.validationErrors??[]){
      const type=this.resolveType(error,def.file,params);
      if(!this.implementsError(type))this.report(error.span,`Thrown type ${typeName(error)} must implement Error`);
    }
    this.checkVariance(cls, def.file);
    const names = new Set<string>();
    for (const field of fieldsOf(cls)) {
      this.checkDefault(field, def.file, params);
      if (names.has(field.name)) this.report(field.span, `Duplicate field ${field.name}`);
      names.add(field.name);
      this.resolveType(field.type, def.file, params);
      if(this.resolveType(field.type,def.file,params).kind==='resource'&&field.ownership!=='own')
        this.report(field.span,'Native resource fields require own ownership','OWN');
      if (cls.record && (field.mutable || field.injected || field.ownership !== 'managed'))
        this.report(field.span, 'Record fields are immutable data; dependencies and ownership belong in behavioral classes', 'RECORD');
      if (cls.record && !this.immutableData(this.resolveType(field.type, def.file, params)))
        this.report(field.span, 'Record fields must contain primitives, tuples, or other immutable records', 'RECORD');
      if (field.injected && field.ownership !== 'managed') this.report(field.span,
        'A resolve parameter cannot also be own or borrow', 'DI');
      if (field.ownership === 'borrow') this.report(field.span,
        'A mutable borrow cannot be stored in a process-managed class field', 'BORROW');
    }
    for (const method of cls.methods) {
      if (names.has(method.name)) this.report(method.span, `Method ${method.name} conflicts with a field`);
      names.add(method.name);
      this.checkFunctionSignature(method, def.file, params);
    }
    const inherited = new Map<string, InterfaceMethod[]>();
    for (const ifaceRef of cls.implements) {
      const iface = this.resolveType(ifaceRef, def.file, params);
      if (iface.kind !== 'interface') {
        this.report(ifaceRef.span, `${iface.name} is not an interface`);
        continue;
      }
      for (const [name, methods] of this.interfaceMethods(iface, new Set())) {
        inherited.set(name, [...(inherited.get(name) ?? []), ...methods]);
      }
    }
    const defaults = new Map<string, InterfaceMethod>();
    for (const [name, methods] of inherited) {
      const own = cls.methods.find(method => method.name === name);
      const reference = methods[0];
      if (own) {
        if (!this.sameSignature(own, def.file, params, reference)) this.report(own.span,
          `Method ${name} does not match the interface signature`);
      } else {
        const concrete = methods.filter(entry => !!entry.method.body);
        const unique = new Map(concrete.map(entry => [entry.from, entry.method]));
        if (unique.size > 1) this.report(cls.span,
          `Conflicting default implementations of ${name}; ${cls.name} must override it`, 'INTERFACE');
        else if (concrete[0]) defaults.set(name, concrete[0]);
        else this.report(cls.span, `${cls.name} must implement ${name}`, 'INTERFACE');
      }
    }
    this.defaults.set(def.id, defaults);
  }

  private checkInterfaceShape(def: Definition): void {
    if(def.node.kind==='interface')for(const ref of def.node.extends)if(this.project.scopes.get(def.file)?.get(ref.name)?.node.kind==='choice')
      this.report(ref.span,'An interface cannot inherit a closed choice','CHOICE');
    const iface = def.node as InterfaceDecl;
    const params = this.paramsFor(iface.typeParams, iface, def.file);
    this.checkVariance(iface, def.file);
    const names = new Set<string>();
    for (const method of iface.methods) {
      if (names.has(method.name)) this.report(method.span, `Duplicate interface method ${method.name}`);
      names.add(method.name);
      this.checkFunctionSignature(method, def.file, params);
    }
    for (const parent of iface.extends) {
      const type = this.resolveType(parent, def.file, params);
      if (type.kind !== 'interface') this.report(parent.span,
        `${parent.name} is not an interface`);
      else for(const [name,entries] of this.interfaceMethods(type,new Set())) {
        const own=iface.methods.find(method=>method.name===name);
        if(own)for(const inherited of entries)if(!this.sameSignature(own,def.file,params,inherited))
          this.report(own.span,`Interface override ${name} does not preserve its inherited input, result and effect contract`,'INTERFACE');
      }
    }
    this.interfaceMembers.set(def.id,this.interfaceMethods({ id: def.id, name: def.name, kind: 'interface', def,
      args: [...params.values()], nullable: false }, new Set()));
  }

  private interfaceMethods(type: Ty, visiting: Set<string>, retainOverrides=false): Map<string, InterfaceMethod[]> {
    const result = new Map<string, InterfaceMethod[]>();
    if (type.id === 'builtin:Error') return result;
    if (!type.def || type.def.node.kind !== 'interface') return result;
    if (visiting.has(type.id)) {
      this.report(type.def.node.span, `Interface inheritance cycle involving ${type.name}`, 'INTERFACE');
      return result;
    }
    visiting.add(type.id);
    const iface = type.def.node;
    const mapping = new Map(iface.typeParams.map((name, index) => [name, type.args[index] ?? errorTy]));
    for (const parent of iface.extends) {
      const parentType = this.resolveType(parent, type.def.file, mapping);
      for (const [name, entries] of this.interfaceMethods(parentType, visiting, retainOverrides))
        result.set(name, [...(result.get(name) ?? []), ...entries]);
    }
    for (const method of iface.methods) result.set(method.name,
      [{ method, from: type.def.id, file: type.def.file, params: mapping }, ...(retainOverrides ? result.get(method.name) ?? [] : [])]);
    visiting.delete(type.id);
    return result;
  }

  private sameSignature(left: MethodDecl, leftFile: string, leftOwnerParams: Map<string, Ty>,
                        right: InterfaceMethod): boolean {
    const method = right.method;
    if (left.params.length !== method.params.length ||
        left.typeParams.length !== method.typeParams.length) return false;
    const leftParams = new Map(leftOwnerParams);
    const rightParams = new Map(right.params);
    for (let i = 0; i < left.typeParams.length; i++) {
      const placeholder: Ty = { id: `method-param:${i}`, name: `$${i}`, kind: 'param',
        args: [], nullable: false };
      leftParams.set(left.typeParams[i], placeholder);
      rightParams.set(method.typeParams[i], placeholder);
    }
    const equalRef = (a: TypeRef, b: TypeRef) => this.sameType(
      this.resolveType(a, leftFile, leftParams), this.resolveType(b, right.file, rightParams));
    const constraintsEqual = left.typeParams.every((name, index) => {
      const a = left.typeConstraints?.[name] ?? [];
      const b = method.typeConstraints?.[method.typeParams[index]] ?? [];
      return a.length === b.length && a.every((ref, i) => equalRef(ref, b[i]));
    });
    const leftOwner = [...this.project.definitions.values()].find(def => 'methods' in def.node && def.node.methods.includes(left));
    const rightOwner = this.project.definitions.get(right.from);
    const leftEffects = this.effectiveContract(left, leftFile, leftOwner, leftParams);
    const rightEffects = this.effectiveContract(method, right.file, rightOwner, rightParams);
    const effectsFit = leftEffects.changes.every(change => coversChange(rightEffects.changes, change)) &&
      [...leftEffects.uses.keys()].every(key => rightEffects.uses.has(key));
    return constraintsEqual && effectsFit && left.params.every((param, i) => param.name === method.params[i].name &&
      param.injected === method.params[i].injected &&
      (param.defaultValue && literalDefault(param.defaultValue) ? defaultText(param.defaultValue) : undefined) ===
        (method.params[i].defaultValue && literalDefault(method.params[i].defaultValue!) ? defaultText(method.params[i].defaultValue!) : undefined) &&
      param.ownership === method.params[i].ownership &&
      equalRef(param.type, method.params[i].type)) &&
      this.sameType(this.returnType(left, leftFile, leftParams), this.returnType(method, right.file, rightParams)) &&
      left.returnOwnership === method.returnOwnership &&
      this.effectiveErrors(left, leftFile, leftParams).every(thrown =>
        this.effectiveErrors(method, right.file, rightParams).some(allowed => this.assignable(thrown, allowed)));
  }

  private sameType(left: Ty, right: Ty): boolean {
    return sameType(left, right);
  }

  private implementsError(type: Ty): boolean {
    if (type.id === 'builtin:Error') return true;
    if (errorNames.some(name => type.id === `builtin:${name}`)) return true;
    if (type.kind === 'error') return true;
    if (type.kind === 'param') return !!type.bounds?.some(bound => this.implementsError(bound));
    return (type.kind === 'class' || type.kind === 'interface') &&
      this.implementsInterface(type, builtin('Error'));
  }

  private implementsInterface(classType: Ty, iface: Ty, seen = new Set<string>()): boolean {
    if (classType.id === iface.id) return this.compatibleArguments(classType, iface);
    if (seen.has(classType.id)) return false;
    seen.add(classType.id);
    const def = classType.def;
    if (!def) return false;
    const refs = def.node.kind === 'class' ? def.node.implements :
      def.node.kind === 'interface' ? def.node.extends : [];
    const names = def.node.kind === 'class' || def.node.kind === 'interface' ? def.node.typeParams : [];
    const params = new Map(names.map((name, index) => [name, classType.args[index] ?? errorTy]));
    return refs.some(ref => {
      const candidate = this.resolveType(ref, def.file, params);
      return this.implementsInterface(candidate, iface, seen);
    });
  }

  private assignable(source: Ty, target: Ty): boolean {
    if (source.kind === 'error' || target.kind === 'error') return true;
    if (target.immutable && source.kind !== 'null' && !source.frozen) return false;
    if (source.kind === 'null') return target.nullable || !!target.optional;
    if ((source.nullable || source.optional) && !target.nullable && !target.optional) return false;
    if (target.id === 'builtin:Data') return this.immutableData({...source, nullable:false, optional:false});
    if (source.id === target.id) return this.compatibleArguments(source, target);
    if (source.kind === 'param' && source.bounds?.some(bound => this.assignable(bound, target))) return true;
    if(target.kind==='choice'){
      const members=choiceMembers(this.project,target);if(!members)return false;
      const sources=source.kind==='choice'?choiceMembers(this.project,source):[source];
      return !!sources&&sources.every(item=>members.some(member=>this.assignable(item,member)));
    }
    if(source.kind==='choice'){const members=choiceMembers(this.project,source);return !!members&&members.every(member=>this.assignable(member,target));}
    if (source.id === 'builtin:c_int' && ['builtin:int', 'builtin:float'].includes(target.id)) return true;
    if (source.id === 'builtin:int' && target.id === 'builtin:float') return true;
    if (target.id === 'builtin:Error' && this.implementsError(source)) return true;
    return target.kind === 'interface' && this.implementsInterface(source, target);
  }

  private compatibleArguments(source: Ty, target: Ty): boolean {
    return source.args.length === target.args.length && source.args.every((arg, index) => {
      const mode = source.id === 'builtin:Tuple' ? 'out' : source.def?.node.kind === 'interface' ?
        source.def.node.typeVariance?.[source.def.node.typeParams[index]] : undefined;
      return mode === 'out' ? this.assignable(arg, target.args[index]) :
        mode === 'in' ? this.assignable(target.args[index], arg) : this.sameType(target.immutable && source.frozen ? immutableType(arg) : arg, target.args[index]);
    });
  }

  private checkBindings(): void {
    const main = this.project.main;
    if (!main) return;
    let seenStatement = false;
    const declarations: {declaration:BindDecl;includedBy?:Span}[] = [];
    for (const item of main.items) {
      if (item.kind === 'import') continue;
      if (item.kind === 'include') {
        if (seenStatement) this.report(item.span, 'Composition includes must precede executable statements', 'DI');
        const def = this.project.scopes.get(main.path)?.get(item.name);
        if (def?.node.kind !== 'composition') this.report(item.span, `${item.name} must be an explicitly imported composition`, 'DI');
        else declarations.push(...def.node.bindings.map(declaration=>({declaration,includedBy:item.span})));
        continue;
      }
      if (item.kind !== 'bind') { seenStatement = true; continue; }
      if (seenStatement) this.report(item.span, 'Bindings must precede executable statements', 'DI');
      declarations.push({declaration:item});
    }
    for (const {declaration:item,includedBy} of declarations) {
      const key = this.bindingKey(item.key, item.keyTypeArgs);
      const previous = this.bindingByKey.get(key);
      if (previous) {
        const sameInclude=includedBy&&previous.includedBy&&includedBy.file===previous.includedBy.file&&includedBy.start===previous.includedBy.start;
        const first=sameInclude ? previous.declaration.span : previous.includedBy ?? previous.declaration.span;
        this.report(sameInclude ? item.span : includedBy ?? item.span, `Duplicate binding ${key}`, 'DI', {related:[{file:first.file,line:first.line,column:first.column,message:`Binding ${key} was first selected here.`}]}); continue;
      }
      const targetType = this.resolveType(item.target, item.span.file);
      const target = targetType.def;
      if (!target || target.node.kind !== 'class') {
        this.report(item.span, `Binding target ${item.target.name} must be a class`, 'DI');
        continue;
      }
      const interfaceDef = this.project.scopes.get(item.span.file)?.get(item.key);
      if(target.node.validationErrors?.length)this.report(item.span,
        `${target.name} has a checked constructor failure; construct it explicitly and catch or propagate the error instead of binding it`, 'DI');
      let exposedType = targetType;
      if (interfaceDef?.node.kind === 'interface') {
        exposedType = this.resolveType({ name: item.key, args: item.keyTypeArgs,
          nullable: false, span: item.span }, item.span.file);
        if (!this.assignable(targetType, exposedType)) this.report(item.span,
          `${target.name} does not implement ${key}`, 'DI');
      } else if (interfaceDef?.node.kind === 'class') this.report(item.span,
        `Binding key ${item.key} is a class; use an interface name or a new lowercase key`, 'DI');
      else if (item.keyTypeArgs.length) this.report(item.span,
        `Named binding ${item.key} cannot take type arguments`, 'DI');
      const stateful = fieldsOf(target.node as ClassDecl).some(field => field.mutable || field.ownership === 'own' || field.type.name === 'Shared') ||
        target.node.methods.some(method => this.effectiveContract(method, target.file, target, new Map(target.node.typeParams.map((name, index) => [name, targetType.args[index] ?? errorTy]))).changes.some(path => path === 'self' || path.startsWith('self.')));
      const info: BindingInfo = { key, target, exposedType, stateful, lifetime: item.lifetime ?? (stateful ? 'fresh' : 'shared'),
        dependencies: [], constructorKeys: [], declaration: item, includedBy, requiresScope: item.lifetime === 'scoped' };
      this.bindings.push(info);
      this.bindingByKey.set(key, info);
    }
    for (const info of this.bindings) {
      const cls = info.target.node as ClassDecl;
      const target = this.resolveType(info.declaration.target, info.declaration.span.file);
      const types = new Map(cls.typeParams.map((name, i) => [name, target.args[i] ?? errorTy]));
      for (const field of cls.fields) {
        if (!field.injected) {
          this.report(info.declaration.span,
            `${cls.name} cannot be bound because ${field.name} needs a constructor argument`, 'DI');
          continue;
        }
        const fieldType = this.resolveType(field.type, info.target.file, types);
        const key = this.bindingKeyForType(fieldType);
        info.constructorKeys.push(key);
        const dep = this.bindingByKey.get(key);
        if (!dep) this.report(field.span,
          `No binding for ${field.type.name}, required by ${cls.name}`, 'DI');
        else {
          if (!this.assignable(dep.exposedType, fieldType)) this.report(field.span,
            `Binding ${key} has incompatible provenance for ${cls.name}.${field.name}`, 'DI');
          info.dependencies.push(dep.key);
        }
      }
      // Layer dependencies are checked against, and forwarded from, these same
      // constructor inputs. There are no additional hidden global lookups.
      for (const error of this.effectiveErrors(cls, info.target.file, types)) this.report(info.declaration.span,
        `DI construction of ${cls.name} can throw ${tyName(error)}; catch that error inside its interceptor`, 'THROWS');
    }
    for (let pass = 0; pass < this.bindings.length; pass++) for (const info of this.bindings) {
      info.stateful ||= info.dependencies.some(key => this.bindingByKey.get(key)?.stateful);
      info.requiresScope ||= info.dependencies.some(key => this.bindingByKey.get(key)?.requiresScope);
      if (!info.declaration.lifetime && info.stateful) info.lifetime = 'fresh';
    }
    for (const info of this.bindings) {
      if (info.stateful && info.lifetime !== 'fresh' && !info.declaration.sharedMutation)
        this.report(info.declaration.span, `${info.key} retains mutable state; write ${info.lifetime} mutable to choose shared state explicitly`, 'DI');
      if (info.lifetime === 'shared' && info.requiresScope)
        this.report(info.declaration.span, `Shared ${info.key} cannot retain a scoped dependency`, 'DI');
      if (info.stateful && info.lifetime === 'shared' && info.declaration.sharedMutation && this.project.config.lint.includes('architecture'))
        this.diagnostics.push({ ...info.declaration.span, code: 'LINT', severity: 'warning',
          message: `${info.key} shares mutable state across the process; review this module boundary when its contract grows` });
    }
    const ordered: BindingInfo[] = [];
    ordered.push(...orderGraph(this.bindings, (info, chain) => this.report(info.declaration.span,
      `Dependency cycle: ${chain.join(' -> ')}`, 'DI')));
    this.bindings.splice(0, this.bindings.length, ...ordered);
  }

  private checkFunctionBody(fn: MethodDecl, file: string, owner?: Definition,
                            initializing = false, suppliedTypes?: Map<string, Ty>, next?: NextContext): void {
    const params = suppliedTypes ? new Map(suppliedTypes) :
      this.paramsFor(owner && 'typeParams' in owner.node ? owner.node.typeParams : [], owner?.node, file);
    for (const [name, ty] of this.paramsFor(fn.typeParams, fn, file)) params.set(name, ty);
    this.addBounds(params, fn, file);
    const context: Context = { file, locals: new Map(), returns: this.returnType(fn, file, params),
      returnOwnership: fn.returnOwnership,
      allowedErrors: this.bodyErrors(fn, file, params),
      inferredReturns: this.inferring && this.callableContracts.get(fn)?.inferredResult && !this.contextualResults.has(fn) ? [] : undefined,
      unsafe: false, borrowed: new Set(), initializing, types: params, next, callable: fn, owner,
      flow: new OwnershipFlow() };
    if(fn.endpoint?.streams){context.stream=context.returns;context.returns=builtin('void');}
    if (owner) {
      context.self = { id: owner.id, name: owner.name,
        kind: owner.node.kind === 'class' ? 'class' : owner.node.kind === 'interceptor' ? 'interceptor' : 'interface', def: owner,
        args: [...params.values()].slice(0, owner.node.typeParams.length), nullable: false };
      context.locals.set('self', { type: context.self, ownership: this.contractFor(fn, file, owner, params).changes.some(path => path === 'self' || path.startsWith('self.')) || initializing ? 'borrow' : 'managed', moved: false });
      if (owner.node.kind === 'class' || owner.node.kind === 'interceptor') {
        for (const field of fieldsOf(owner.node)) context.locals.set(field.name,
          { type: { ...this.resolveType(field.type, file, params), readonly: !field.mutable }, ownership: field.ownership,
            moved: false, origin: 'field', definition: field.span });
      }
    }
    for (const param of fn.params) context.locals.set(param.name,
      { type: { ...this.resolveType(param.type, file, params), readonly: param.ownership === 'managed' }, ownership: param.ownership, moved: false, definition: param.span });
    context.locals.forEach(local => { local.declaredType ??= local.type; });
    for (const [name, local] of context.locals) {
      const field = owner && 'fields' in owner.node ? fieldsOf(owner.node).find(field => field.name === name) : undefined;
      const origins: Origins = field && this.isReference(local.type) ? new Set([`inside:${owner!.id}`]) : field ? new Set() : name === 'self' ? new Set([`self:${owner?.id}`]) :
        this.isReference(local.type) ? new Set([`input:${file}:${fn.span.start}:${name}`]) : new Set();
      context.flow.declare(name, origins, !!local.type.readonly, {
        parent: field ? 'self' : undefined,
        external: field ? `self.${name}` : name === 'self' ? 'self' : local.ownership === 'own' ? undefined : name,
        borrowedInput: local.ownership === 'borrow' && name !== 'self',
      });
    }
    if (owner && 'fields' in owner.node) context.flow.object(context.flow.origins('self'), fieldsOf(owner.node).map(field => ({
      name: field.name, origins: context.flow.origins(field.name), mutable: !!field.mutable || field.ownership === 'own',
    })));
    for (const [name, local] of context.locals) if (local.ownership === 'borrow' && !initializing) {
      context.flow.borrow(name, fn.span, (span, message) => this.report(span, message, 'BORROW'), true);
      context.borrowed.add(name);
    }
    context.effects = this.contractFor(fn, file, owner, params);
    if ((fn.changes ?? []).some(path => path.startsWith('self')) && !owner)
      this.report(fn.span, 'A free function has no self to change', 'EFFECT');
    for (const policy of this.httpPolicies.get(fn) ?? []) {
      const operations = Object.values(httpPolicyOptions[policy.name]).filter(spec => spec.startsWith('dependency:'));
      policy.dependencies.forEach((index, order) => {
        const param = fn.params[index];
        if (!param || !operations[order]) return;
        const type = this.resolveType(param.type, file, params);
        const operation = operations[order].split('.')[1];
        this.requireUse(capabilityKey(type, operation), `${tyName(type)}.${operation}`, policy.annotation.span,
          context, {source: tyName(type), operation, span: policy.annotation.span, capability: type});
      });
    }
    this.checkStatements(fn.body ?? [], context, fn.span);
    if (context.inferredReturns) {
      const contract = this.callableContracts.get(fn)!;
      const result = this.inferredReturn(context.inferredReturns);
      if (!sameType(result, contract.result)) { contract.result = result; this.markInference(fn); }
    }
    if (!this.inferring && unresolved(this.returnType(fn, file, params)))
      this.report(fn.span, `Cannot infer ${fn.name}'s return type; add returns T to anchor recursive or ambiguous results`, 'INFERENCE');
    if (fn.body && context.returns.id !== 'builtin:void' &&
      !(owner?.node.kind === 'interceptor' && fn.name === 'around') && canFallThrough(fn.body))
      this.report(fn.span, `${fn.name} must return a value or throw on every path`, 'TYPE');
  }

  private cloneContext(context: Context): Context {
    return { ...context, locals: new Map([...context.locals].map(([key, value]) => [key, { ...value }])),
      borrowed: new Set(context.borrowed), flow: context.flow.clone() };
  }

  private mergeMoved(target: Context, branches: Context[]): void {
    target.flow.join(branches.map(branch => branch.flow));
    for (const [name, local] of target.locals) {
      if (branches.some(branch => branch.locals.get(name)?.moved)) {
        local.moved = true;
        local.moveSites=[...(local.moveSites ?? []),...branches.flatMap(branch=>branch.locals.get(name)?.moveSites ?? [])]
          .filter((site,index,sites)=>sites.findIndex(other=>other.file===site.file&&other.start===site.start)===index);
      }
      if (branches.some(branch => branch.locals.get(name)?.type.nullable))
        local.type = local.declaredType ?? { ...local.type, nullable: true };
    }
  }

  private contractFor(fn: MethodDecl, file: string, owner?: Definition, supplied = new Map<string, Ty>()): EffectContract {
    const types = new Map(supplied);
    for (const [name, value] of this.paramsFor(fn.typeParams, fn, file)) if (!types.has(name)) types.set(name, value);
    const sources = new Map(fn.params.map(param => [param.name, this.resolveType(param.type, file, types)]));
    if (owner && 'typeParams' in owner.node) {
      const self: Ty = { id: owner.id, name: owner.name, def: owner,
        kind: owner.node.kind === 'class' ? 'class' : owner.node.kind === 'interceptor' ? 'interceptor' : 'interface',
        args: owner.node.typeParams.map(name => types.get(name) ?? this.paramsFor([name]).get(name)!), nullable: false };
      sources.set('self', self);
      if ('fields' in owner.node) for (const field of fieldsOf(owner.node))
        if (!sources.has(field.name)) sources.set(field.name, this.resolveType(field.type, owner.file, types));
    }
    const result = effectContract(fn, {
      source: path => {
        const parts = path.split('.');
        let source = sources.get(parts[0]);
        const def = this.project.scopes.get(file)?.get(parts[0]);
        if (!source && def && def.node.kind !== 'function' && def.node.kind !== 'interceptor' && def.node.kind !== 'composition')
          source = { id: def.id, name: def.name, def, kind: def.node.kind, args: def.node.typeParams.map(name => types.get(name) ?? errorTy), nullable: false };
        for (const name of parts.slice(1)) {
          const node = source?.def?.node;
          const field = node && 'fields' in node ? fieldsOf(node).find(field => field.name === name) : undefined;
          source = field && source?.def ? this.resolveType(field.type, source.def.file,
            new Map(source.def.node.typeParams.map((param, index) => [param, source!.args[index] ?? errorTy]))) : undefined;
        }
        return source;
      },
      interfaces: type => {
        const output: Ty[] = [];
        const seen = new Set<string>();
        const visit = (value: Ty) => {
          const key = `${value.id}:${tyName(value)}`;
          if (seen.has(key)) return;
          seen.add(key);
          for (const bound of value.bounds ?? []) { output.push(bound); visit(bound); }
          const node = value.def?.node;
          const refs = node?.kind === 'class' ? node.implements : node?.kind === 'interface' ? node.extends : [];
          const substitutions = new Map((node?.typeParams ?? []).map((name, index) => [name, value.args[index] ?? errorTy]));
          for (const ref of refs) {
            const resolved = this.resolveType(ref, value.def!.file, substitutions);
            output.push(resolved); visit(resolved);
          }
        };
        visit(type); return output;
      },
      operation: (type, name) => this.interfaceMethods(type, new Set()).has(name),
      native: name => {
        const def = this.project.scopes.get(file)?.get(name);
        return def?.node.kind === 'function' && def.node.externC ? def.id : undefined;
      },
      report: (span, message) => this.report(span, message, 'EFFECT'),
    });
    const inferred = this.inferredUses.get(fn);
    const inferredChanges = this.inferredChanges.get(fn);
    const changes = inferredChanges ? [...inferredChanges].sort() : result.changes;
    if (!inferred) { const contract = {...result, changes, inferredChanges: !!inferredChanges}; this.effectContracts.set(fn, contract); return contract; }
    const uses = new Map(result.uses);
    for (const [key, effect] of inferred) {
      const capability = effect.capability && this.substitute(effect.capability, types);
      uses.set(capability ? capabilityKey(capability, effect.operation) : key,
        { ...effect, capability, source: capability ? tyName(capability) : effect.source });
    }
    const contract = { ...result, changes, uses, inferred: true, inferredChanges: !!inferredChanges };
    this.effectContracts.set(fn, contract);
    return contract;
  }

  private requireUse(key: string, display: string, span: Span, context: Context, effect?: CapabilityEffect): void {
    if (context.locked) this.report(span, `Release the lock before ${display}; I/O and capability calls cannot hold a lock`, 'CONCURRENCY');
    if (!context.callable) return;
    const inferred = this.inferring && this.inferredUses.get(context.callable);
    if (inferred) {
      if (!inferred.has(key)) {
        const separator = display.lastIndexOf('.');
        inferred.set(key, effect ?? { source: display.slice(0, separator), operation: display.slice(separator + 1), span });
        this.inferenceChanged = true;
        this.changingInference.add(context.callable);
      }
      return;
    }
    if (!context.effects?.uses.has(key)) this.report(span,
      `${context.callable.name} is pure for ${display}; declare uses ${display}`, 'EFFECT');
  }

  private effectiveContract(fn: MethodDecl, file: string, owner?: Definition, types = new Map<string, Ty>()): EffectContract {
    const base = this.contractFor(fn, file, owner, types);
    const uses = new Map(base.uses);
    const changes = [...base.changes];
    for (const layer of this.interceptorPlans.get(fn) ?? []) {
      const layerTypes = new Map([...layer.types].map(([name, type]) => [name, this.substitute(type, types)]));
      const contract = this.contractFor(layer.around, layer.definition.file, layer.definition, layerTypes);
      for (const [key, effect] of contract.uses) uses.set(key, effect);
      for (const changed of contract.changes) {
        const [root, ...path] = changed.split('.');
        if (root === 'self') continue;
        const index = layer.around.params.findIndex(param => param.name === root);
        const target = layer.argumentIndices[index];
        if (target !== undefined && fn.params[target]) changes.push([fn.params[target].name, ...path].join('.'));
      }
    }
    const result = { changes: [...new Set(changes)], uses, inferred: base.inferred, inferredChanges: base.inferredChanges };
    this.effectContracts.set(fn, result);
    return result;
  }

  private intrinsicEffect(operation: 'print' | 'read_file' | 'write_file' | 'arguments', span: Span, context: Context): void {
    if (context.locked) this.report(span, `Release the lock before ${operation}`, 'CONCURRENCY');
    if (!context.callable) return;
    const capability = operation === 'print' ? 'Console' : operation === 'read_file' ? 'FileReader' :
      operation === 'write_file' ? 'FileWriter' : 'Arguments';
    const method = operation === 'print' || operation === 'write_file' ? 'write' : 'read';
    if (!this.project.files.get(context.file)?.builtin) this.report(span,
      `Use a resolve ${capability} dependency and its ${method} operation outside main or test code`, 'EFFECT');
    this.requireUse(`august/io/contracts.aug:${capability}<>.${method}`, `${capability}.${method}`, span, context);
  }

  private requireChange(object: Expr, span: Span, context: Context): void {
    if (!context.callable) return;
    const root = this.rootName(object);
    if (!root) return;
    const tracked = context.flow.external(root);
    const origin = tracked?.split('.')[0] ?? this.aliasRoot(root, context.locals);
    const local = context.locals.get(origin);
    const path = tracked ?? (origin === 'self' ? 'self' : local?.origin === 'field' ? `self.${origin}` : origin);
    if (context.initializing && path.startsWith('self')) return;
    const input = context.callable.params.find(param => param.name === origin);
    if (path.startsWith('self') || input && input.ownership !== 'own') {
      const inferred = this.inferring && this.inferredChanges.get(context.callable);
      const change = path.startsWith('self') ? 'self' : origin;
      if (inferred) {
        if (!inferred.has(change)) { inferred.add(change); this.markInference(context.callable); }
      } else if (!coversChange(context.effects?.changes ?? [], path)) this.report(span,
        `${context.callable.name} must declare changes ${change}`, 'EFFECT');
    }
  }

  private immutableData(type: Ty, seen = new Set<string>()): boolean {
    if (['builtin:int', 'builtin:c_int', 'builtin:float', 'builtin:string', 'builtin:bool', 'null', 'builtin:Data'].includes(type.id)) return true;
    if (type.kind === 'param') return !!type.bounds?.some(bound => bound.id === 'builtin:Data' || bound.kind === 'choice' && this.immutableData(bound, seen));
    if (['builtin:Tuple', 'builtin:List', 'builtin:Set', 'builtin:Map'].includes(type.id)) return type.args.every(arg => this.immutableData(arg, seen));
    if (['builtin:Bytes', 'builtin:Json', 'builtin:RsaPrivateKey', 'builtin:RsaPublicKey'].includes(type.id)) return true;
    const node = type.def?.node;
    if(node?.kind==='choice'){if(seen.has(type.id))return true;seen.add(type.id);const members=choiceMembers(this.project,type);return !!members&&members.every(member=>this.immutableData(member,seen));}
    if (node?.kind !== 'class' || !node.record) return false;
    if (seen.has(type.id)) return true;
    seen.add(type.id);
    const types = new Map(node.typeParams.map((name, index) => [name, type.args[index] ?? errorTy]));
    return node.fields.every(field => this.immutableData(this.resolveType(field.type, type.def!.file, types), seen));
  }

  /** Literal containers may be frozen in place only when none of their children retain mutable aliases. */
  private immutableInput(expr: Expr, type = this.expressionTypes.get(expr) ?? errorTy): boolean {
    if (type.frozen || !['List', 'Set', 'Map', 'Tuple'].includes(type.name)) return true;
    if (expr.kind === 'collection') return expr.items.every(item => this.immutableInput(item));
    if (expr.kind === 'call' && expr.callee.kind === 'name' && ['List', 'Set', 'Map', 'Tuple'].includes(expr.callee.name))
      return expr.args.every(item => this.immutableInput(item));
    const mutableChildren = (type: Ty): boolean => !type.frozen &&
      (['List', 'Set', 'Map'].includes(type.name) || type.name === 'Tuple' && type.args.some(mutableChildren));
    return !mutableChildren(type);
  }

  private bindPatternName(name:string,type:Ty,origins:Origins,context:Context,span:Span,source?:string):void {
    if(name==='next'){this.report(span,'next is reserved for interceptor continuations','NEXT');return;}
    if(context.locals.has(name)){this.report(span,`Pattern variable ${name} already exists`,'PATTERN');return;}
    const item={...type,readonly:true};
    context.locals.set(name,{type:item,declaredType:item,ownership:'managed',moved:false,definition:span});
    context.flow.declare(name,origins,true,{source,external:context.flow.externalOrigin(origins)});
  }

  private bindPattern(pattern:BindingPattern,type:Ty,origins:Origins,context:Context,source?:string):void {
    this.patternTypes.set(pattern,type);
    if(pattern.kind==='nameBinding'){
      this.bindPatternName(pattern.name,type,origins,context,pattern.span,source);return;
    }
    if(type.nullable||type.optional)this.report(pattern.span,'Narrow optional values with a null check or some case before destructuring','PATTERN');
    if(pattern.kind==='tupleBinding'){
      if(type.id!=='builtin:Tuple'||type.args.length!==pattern.items.length)this.report(pattern.span,`Pattern needs a Tuple with ${pattern.items.length} positions`,'PATTERN');
      pattern.items.forEach((item,index)=>this.bindPattern(item,type.id==='builtin:Tuple'?type.args[index]??errorTy:errorTy,context.flow.field(origins,String(index)),context,source));return;
    }
    const node=type.def?.node;
    if(node?.kind!=='class'||!node.record){this.report(pattern.span,'A named field pattern needs an immutable record','PATTERN');return;}
    const types=new Map(node.typeParams.map((name,index)=>[name,type.args[index]??errorTy])),seen=new Set<string>();
    for(const entry of pattern.fields){
      if(seen.has(entry.name))this.report(entry.nameSpan,`Repeated record field ${entry.name}`,'PATTERN');seen.add(entry.name);
      const index=node.fields.findIndex(field=>field.name===entry.name),field=node.fields[index];
      if(!field){this.report(entry.nameSpan,`${type.name} has no record field ${entry.name}`,'PATTERN');continue;}
      this.checkMemberVisibility(type.id,type.name,field.name,entry.nameSpan,context);
      this.patternFields.set(entry,{owner:type.def!,field,index});
      this.bindPattern(entry.pattern,this.resolveType(field.type,type.def!.file,types),context.flow.field(origins,field.name),context,source);
    }
  }

  private patternLocals(names: string[], type: Ty, origins: Origins, context: Context, span: Span, source?: string, tuplePattern = false): void {
    const types = names.length === 1 && !tuplePattern ? [type] : type.id === 'builtin:Tuple' ? type.args : [];
    if (types.length !== names.length) this.report(span, `Pattern needs a Tuple with ${names.length} positions`, 'PATTERN');
    for (const [index, name] of names.entries())
      this.bindPatternName(name,types[index]??errorTy,names.length===1&&!tuplePattern?origins:context.flow.field(origins,String(index)),context,span,source);
  }

  private captureScope(span: Span, context: Context): void {
    const source = this.project.files.get(context.file)?.source ?? '';
    const parameters = context.callable?.params ?? [];
    const fields = context.owner && 'fields' in context.owner.node ? fieldsOf(context.owner.node) : [];
    const doc = context.callable ? callableDocumentation(this.project, context.callable, context.owner) : undefined;
    const fieldDoc = context.owner ? javadocBefore(source, context.owner.node.span.start) : undefined;
    this.scopes.set(`${span.file}:${span.start}:${span.end}`, { span, locals: [...context.locals].map(([name, local]) => {
      const param = parameters.find(param => param.name === name);
      const field = local.origin === 'field' ? fields.find(field => field.name === name) : undefined;
      const trace=context.flow.describe(name);
      const references=(names:string[])=>names.map(name=>({name,span:context.locals.get(name)?.definition}));
      const origins=trace.origins.flatMap(origin=>{
        const match=/^new:(.*):(\d+)$/.exec(origin),file=match&&this.project.files.get(match[1]);
        if(!file||!match)return [];
        const start=Number(match[2]),before=file.source.slice(0,start).split('\n');
        return [{file:file.path,start,end:start,line:before.length,column:before.at(-1)!.length+1}];
      });
      return { name, type: local.type, moved: local.moved, ownership: local.ownership, definition: local.definition,
        ownershipFacts:{origins,owners:references([name,...trace.aliases].filter(other=>context.locals.get(other)?.ownership==='own')),
          aliases:references(trace.aliases),borrows:trace.borrows,captures:trace.captures,moves:local.moveSites ?? []},
        kind: field ? 'property' : param || name === 'self' ? 'parameter' : 'variable',
        documentation: doc?.parameters.get(param?.label ?? name) ?? fieldDoc?.parameters.get(field?.label ?? name) };
    }) });
  }

  private checkStatements(body: Stmt[], context: Context, fallback?: Span, joinsTasks = false): void {
    const names = new Set(context.locals.keys());
    const breakStart = context.loop?.breaks.length ?? 0, continueStart = context.loop?.continues.length ?? 0;
    const previous = context.region;
    const region = (body as Stmt[] & { span?: Span }).span ?? fallback ?? previous;
    if (region) { context.region = region; this.captureScope({ ...region, end: body[0]?.span.start ?? region.end }, context); }
    let reachable = true, dead:Context|undefined;
    body.forEach((stmt, index) => {
      // Check unreachable source for editor facts and diagnostics, but do not let
      // its moves or waits change a reachable exit's ownership/error state.
      const current = reachable ? context : dead!;
      this.captureScope(stmt.span, current);
      this.checkStatement(stmt, current);
      if (region) this.captureScope({ ...stmt.span, start: stmt.span.end, end: body[index + 1]?.span.start ?? region.end }, current);
      if (reachable && !canFallThrough([stmt])) {
        reachable = false; dead = this.cloneContext(context); dead.exceptionalFlows = [];
        if (context.loop) dead.loop = {breaks:[],continues:[]};
      }
    });
    if (!joinsTasks) for (const [name, local] of context.locals) if (!names.has(name) && local.ownership === 'own' && !local.moved &&
        context.flow.hasTaskCapture(context.flow.origins(name)))
      this.report(local.definition ?? fallback!, `Owned ${name} is still borrowed by a task; wait before leaving this block or declare it directly in the task's scope block`, 'CONCURRENCY');
    for (const exit of [...(context.loop?.breaks.slice(breakStart) ?? []), ...(context.loop?.continues.slice(continueStart) ?? [])]) {
      for (const name of exit.locals.keys()) if (!names.has(name)) exit.locals.delete(name);
      exit.flow.forgetLocals(names);
    }
    for(const name of context.locals.keys())if(!names.has(name))context.locals.delete(name);
    context.flow.forgetLocals(names);
    context.region = previous;
  }

  private unwindLoopExits(context:Context,breakStart:number,continueStart:number):void {
    for(const exit of [...(context.loop?.breaks.slice(breakStart)??[]),...(context.loop?.continues.slice(continueStart)??[])]) {
      exit.flow.restoreLexical(context.flow);exit.borrowed=new Set(context.borrowed);
      exit.locked=context.locked;exit.scope=context.scope;exit.region=context.region;
      exit.unsafe=context.unsafe;exit.loopDepth=context.loopDepth;
    }
  }

  private matchBranches<T extends MatchPattern>(expression:Expr,value:Ty,cases:T[],context:Context,span:Span):{clause:T;inside:Context}[] {
    // A choice bound supplies the closed record domain, not a concrete T.
    // Narrowed branches retain their record identity; they cannot assign back to T.
    const bound=value.kind==='param'?value.bounds?.find(type=>type.kind==='choice'&&choiceMembers(this.project,type)):undefined;
    if(bound)value={...bound,nullable:value.nullable||bound.nullable,optional:value.optional||bound.optional};
    const seen=new Set<string>(),types=new Set<string>(),numbers:Extract<Expr,{kind:'literal'}>[]=[];
    const branches=cases.map(clause=>{
      const inside=this.cloneContext(context),literal=clause.literal;
      const key=clause.pattern==='literal'&&literal?.kind==='literal'?
        typeof literal.value==='number'&&literal.numericType!=='float'?'int:'+BigInt(literal.numericText??String(literal.value)).toString():JSON.stringify(literal.value):
        clause.pattern==='type'?typeName(clause.type!):clause.pattern;
      const repeatedNumber=literal?.kind==='literal'&&typeof literal.value==='number'&&numbers.some(previous=>previous.numericType!=='float'&&literal.numericType!=='float'?
        BigInt(previous.numericText??String(previous.value))===BigInt(literal.numericText??String(literal.value)):previous.value===literal.value);
      if(literal?.kind==='literal'&&typeof literal.value==='number')numbers.push(literal);
      if(seen.has(key)||repeatedNumber||seen.has('else')||seen.has('some')&&clause.pattern!=='null')this.report(clause.span,'Unreachable or repeated match case','MATCH');
      seen.add(key);let narrowed=value;
      if(clause.pattern==='null'||clause.pattern==='some'){
        if(!value.nullable&&!value.optional)this.report(clause.span,'null/some patterns require a nullable or optional value','MATCH');
        narrowed=clause.pattern==='some'?{...value,nullable:false,optional:false}:nullTy;
      }else if(clause.pattern==='literal'){
        const actual=this.checkExpression(clause.literal!,context);if(!this.assignable(actual,value))this.report(clause.span,'Match literal has an incompatible type','MATCH');
      }else if(clause.pattern==='type'){
        narrowed=this.resolveType(clause.type!,context.file,context.types);
        if(types.has(narrowed.id))this.report(clause.span,'Unreachable or repeated resolved type case','MATCH');types.add(narrowed.id);
        if(narrowed.kind!=='class'||narrowed.args.length||!this.assignable(narrowed,{...value,nullable:true}))this.report(clause.span,'Type patterns require a concrete non-generic class compatible with the matched value','MATCH');
      }
      if(expression.kind==='name'&&clause.pattern==='some'){const local=inside.locals.get(expression.name);if(local)local.type=narrowed;}
      if(clause.name)this.patternLocals([clause.name],narrowed,this.placesOf(expression,context),inside,clause.span,sourceName(expression));
      return {clause,inside};
    });
    const alternatives=choiceMembers(this.project,value);
    const closed=!!alternatives&&alternatives.every(type=>types.has(type.id))&&(!value.nullable&&!value.optional||seen.has('null'));
    const exhaustive=closed||seen.has('else')||(value.nullable||value.optional)&&seen.has('null')&&seen.has('some')||
      !value.nullable&&!value.optional&&value.id==='builtin:bool'&&seen.has('true')&&seen.has('false');
    if(!exhaustive)this.report(span,alternatives?'Match is incomplete; cover '+alternatives.filter(type=>!types.has(type.id)).map(type=>type.name).concat((value.nullable||value.optional)&&!seen.has('null')?['null']:[]).join(' and ')+', or add else':'Match is incomplete; cover both booleans, null and some, or add else','MATCH');
    return branches;
  }

  /** Share snapshot item typing and loop reentry analysis between loops and list selection. */
  private checkIteration(stmt:{iterable:Expr;pattern?:BindingPattern;names:string[];span:Span},context:Context,
    body:(inside:Context)=>void,reenters=true):void {
      const iterable = this.checkExpression(stmt.iterable, context);
      if (!['builtin:List', 'builtin:Set', 'builtin:Map', 'builtin:Tuple'].includes(iterable.id))
        this.report(stmt.iterable.span, 'for needs a List, Set, Map, or Tuple', 'ITERATION');
      const type = iterable.id === 'builtin:Map' ? { ...builtin('Tuple'), args: iterable.args } :
        iterable.id === 'builtin:Tuple' ? iterable.args[0] ?? errorTy : iterable.args[0] ?? errorTy;
      if (iterable.id === 'builtin:Tuple' && iterable.args.some(arg => !this.sameType(arg, type)))
        this.report(stmt.iterable.span, 'Iterated tuple positions must have the same type; destructure heterogeneous tuples', 'ITERATION');
      const inside = this.cloneContext(context);
      inside.loopDepth = (context.loopDepth ?? 0) + 1;
      inside.loop = {breaks:[], continues:[]};
      if(stmt.pattern)this.bindPattern(stmt.pattern,type,context.flow.field(this.placesOf(stmt.iterable,context)),inside,sourceName(stmt.iterable));
      else this.patternLocals(stmt.names, type, context.flow.field(this.placesOf(stmt.iterable, context)), inside, stmt.span, sourceName(stmt.iterable));
      if(stmt.pattern)this.captureScope(stmt.pattern.span,inside);
      let previous = '';
      for (let count = 0; count <= context.locals.size * 3 + 3; count++) {
        body(inside);
        const signature = JSON.stringify([...inside.locals].map(([name, local]) => [name, local.moved])) + inside.flow.signature();
        const reentries = [...(reenters ? [inside] : []), ...inside.loop!.continues];
        if (signature === previous || !reentries.length) break;
        previous = signature; this.mergeMoved(inside, reentries);
      }
      this.mergeMoved(context, [this.cloneContext(context), inside, ...inside.loop!.breaks]);
  }

  private checkStatement(stmt: Stmt, context: Context): void {
    if (stmt.kind === 'break' || stmt.kind === 'continue') {
      if (!context.loop) this.report(stmt.span, `${stmt.kind} requires an enclosing for or while loop`, 'LOOP');
      else context.loop[stmt.kind === 'break' ? 'breaks' : 'continues'].push(this.cloneContext(context));
      return;
    }
    if (stmt.kind === 'lock') {
      const breakStart=context.loop?.breaks.length??0,continueStart=context.loop?.continues.length??0;
      if (context.locked) this.report(stmt.span, 'Nested locks require a single combined shared value to avoid lock-order deadlocks', 'CONCURRENCY');
      const type = this.checkExpression(stmt.value, context);
      if (type.id !== 'builtin:Shared') this.report(stmt.value.span, 'lock requires Shared<T>', 'CONCURRENCY');
      const external = type.readonly || !!context.flow.external(this.rootName(stmt.value) ?? '');
      if (context.callable && external && !context.effects?.uses.size && !context.effects?.changes.length) this.report(stmt.span, 'A callable that locks external shared state declares its capability operation or changes contract', 'EFFECT');
      const inside = this.cloneContext(context); inside.locked = true;
      const origins = allocationOrigin(stmt.span); inside.flow.region(origins);
      inside.locals.set(stmt.name, {type: {...(type.args[0] ?? errorTy), readonly: false}, ownership: 'borrow', moved: false, definition: stmt.span});
      inside.flow.declare(stmt.name, origins, false); inside.flow.borrow(stmt.name, stmt.span, (span, message) => this.report(span, message, 'BORROW'), true);
      inside.borrowed.add(stmt.name); this.checkStatements(stmt.body, inside, stmt.span);
      this.unwindLoopExits(context,breakStart,continueStart); this.mergeMoved(context, [inside]); return;
    }
    if (stmt.kind === 'serve') {
      if (context.callable || context.file !== this.project.main?.path) this.report(stmt.span, 'Select served endpoints in main.aug', 'HTTP');
      if (this.checkExpression(stmt.port, context).id !== 'builtin:int') this.report(stmt.port.span, 'The listening port is an int', 'HTTP');
      if (stmt.port.kind === 'literal' && typeof stmt.port.value === 'number' && (stmt.port.value < 0 || stmt.port.value > 65535)) this.report(stmt.port.span, 'Ports range from 0 to 65535; 0 selects an available port', 'HTTP');
      const routes = new Set<string>();
      for (const name of stmt.names) {
        const def = this.project.scopes.get(context.file)?.get(name);
        if (def?.node.kind !== 'function' || !def.node.endpoint) { this.report(stmt.span, `${name} must be an explicitly imported endpoint`, 'HTTP'); continue; }
        const route = def.node.endpoint.method + ' ' + def.node.endpoint.path.replace(/\{[^}]+\}/g, '{}');
        if (routes.has(route)) this.report(stmt.span, `Conflicting HTTP route ${route}`, 'HTTP'); routes.add(route);
        for (const param of def.node.params.filter(param => param.injected)) {
          const type = this.resolveType(param.type, def.file);
          const key = this.bindingKeyForType(type);
          const binding = this.bindingByKey.get(key);
          if (!binding || !this.assignable(binding.exposedType, type)) this.report(param.span, `Served endpoint ${name} requires a binding for ${key}`, 'DI');
        }
      }
      return;
    }
    if (stmt.kind === 'freeze') {
      const type = this.checkExpression(stmt.value, context);
      if (!this.immutableData(type)) this.report(stmt.span, 'Freeze immutable data records and collections; behavioral objects retain explicit mutation contracts', 'FREEZE');
      const origins = this.placesOf(stmt.value, context);
      if (context.locals.has(stmt.name)) this.report(stmt.span, `Variable ${stmt.name} already exists`, 'NAME');
      const root = sourceName(stmt.value);
      if (context.flow.externalOrigin(origins) || root && context.flow.external(root) && context.locals.get(root)?.ownership !== 'own')
        this.report(stmt.span, 'Freezing an external input requires own ownership of every reachable reference', 'OWN');
      context.flow.freeze(origins, stmt.span, (span, message) => this.report(span, message, 'BORROW'));
      for (const [name, local] of context.locals) if (context.flow.frozen(context.flow.origins(name))) {
        local.type = immutableType(local.type); local.ownership = 'managed';
      }
      context.locals.set(stmt.name, {type: immutableType(type), ownership: 'managed', moved: false, definition: stmt.span});
      context.flow.declare(stmt.name, origins, true);
      return;
    }
    if (stmt.kind === 'expr') { this.checkExpression(stmt.expr, context); return; }
    if (stmt.kind === 'scope') {
      const inside = this.cloneContext(context); inside.scope = stmt.span; inside.loopDepth = 0;
      const exceptionStart = context.exceptionalFlows?.length ?? 0;
      const breakStart = context.loop?.breaks.length ?? 0, continueStart = context.loop?.continues.length ?? 0;
      const scope = `tasks:${stmt.span.file}:${stmt.span.start}`;
      inside.flow.region(new Set([scope, ...this.bindings.filter(binding => binding.lifetime === 'scoped').map(binding =>
        `scope:${stmt.span.file}:${stmt.span.start}:${binding.key}`)]));
      this.checkStatements(stmt.body, inside, stmt.span, true);
      const errors = inside.flow.pendingTaskErrors(scope);
      inside.flow.joinTasks(scope);
      for (const error of errors) this.checkAllowedError(error, stmt.span, {...context, flow: inside.flow});
      for (const failure of context.exceptionalFlows?.slice(exceptionStart) ?? []) failure.flow.joinTasks(scope);
      for (const exit of [...(context.loop?.breaks.slice(breakStart) ?? []), ...(context.loop?.continues.slice(continueStart) ?? [])]) {
        const errors = exit.flow.pendingTaskErrors(scope); exit.flow.joinTasks(scope);
        for (const error of errors) this.checkAllowedError(error, stmt.span, {...context, flow:exit.flow});
      }
      this.unwindLoopExits(context,breakStart,continueStart);
      this.mergeMoved(context, [inside]);
      return;
    }
    if (stmt.kind === 'destructure') {
      const type = this.checkExpression(stmt.value, context);
      if(stmt.pattern){this.bindPattern(stmt.pattern,type,this.placesOf(stmt.value,context),context,sourceName(stmt.value));return;}
      if (type.id !== 'builtin:Tuple' || type.args.length !== stmt.names.length)
        this.report(stmt.span, `Destructuring needs a Tuple with ${stmt.names.length} positions`, 'PATTERN');
      this.patternLocals(stmt.names, type, this.placesOf(stmt.value, context), context, stmt.span, sourceName(stmt.value), true);
      return;
    }
    if (stmt.kind === 'for') {
      this.checkIteration(stmt,context,inside=>this.checkStatements(stmt.body,inside,stmt.span),canFallThrough(stmt.body));return;
    }
    if (stmt.kind === 'match') {
      const value=this.checkExpression(stmt.value,context),branches:Context[]=[];
      for(const {clause,inside} of this.matchBranches(stmt.value,value,stmt.cases,context,stmt.span)){
        this.checkStatements(clause.body,inside,clause.span);
        if(canFallThrough(clause.body))branches.push(inside);
      }
      this.mergeMoved(context,branches);return;
    }
    if (stmt.kind === 'assign') {
      if(stmt.target.kind==='name'&&!stmt.declaredType) {
        const local=context.locals.get(stmt.target.name);
        if(local?.definition)this.resolvedNames.set(stmt.target,{name:stmt.target.name,definition:local.definition,property:local.origin==='field'});
      }
      if (stmt.target.kind === 'name' && stmt.target.name === 'next')
        this.report(stmt.target.span, 'next is reserved for interceptor continuations', 'NEXT');
      const expected = stmt.declaredType ? this.resolveType(stmt.declaredType, context.file, context.types) :
        stmt.target.kind === 'name' ? context.locals.get(stmt.target.name)?.declaredType ?? context.locals.get(stmt.target.name)?.type : undefined;
      const value = this.checkExpression(stmt.value, context, expected);
      const ownership = stmt.ownership === 'own' || stmt.target.kind === 'name' && !context.locals.has(stmt.target.name) &&
        stmt.value.kind === 'call' && this.ownershipOf(stmt.value,context) === 'own' ? 'own' : 'managed';
      if (ownership === 'own' && stmt.ownership !== 'own') this.inferredOwned.add(stmt);

      if(value.kind==='resource'&&stmt.target.kind==='name'&&ownership!=='own'&&context.locals.get(stmt.target.name)?.origin!=='field')this.report(stmt.span,'Native resources must be held by own bindings','OWN');
      const source = stmt.value.kind === 'name' ? context.locals.get(stmt.value.name) : undefined;
      const origins = this.placesOf(stmt.value, context);
      const ownedSource = this.ownershipOf(stmt.value, context) === 'own';
      if (ownedSource && ownership !== 'own' && stmt.target.kind === 'name' && !context.locals.has(stmt.target.name))
        this.report(stmt.value.span, 'An owned object cannot be copied into a managed variable', 'OWN');
      if (stmt.target.kind === 'name') {
        const existing = context.locals.get(stmt.target.name);
        if (stmt.declaredType) {
          if (existing) this.report(stmt.target.span, `Variable ${stmt.target.name} already exists`);
          const target = expected!;
          if (!this.assignable(value, target)) this.report(stmt.value.span,
            `Cannot assign ${tyName(value)} to ${tyName(target)}`);
          if (ownership === 'own') {
            if (stmt.value.kind === 'member') this.report(stmt.value.span, 'Moving an owned field requires an explicit take operation', 'OWN');
            if (!['own', 'fresh'].includes(this.ownershipOf(stmt.value, context)))
              this.report(stmt.value.span,
                'own value must come from a new object or another owned value', 'OWN');
            if (source?.origin === 'field') this.report(stmt.value.span,
              'Moving an owned field requires an explicit take operation', 'OWN');
            if (source?.ownership === 'own' && stmt.value.kind === 'name') {
              this.moveOwnedLocal(stmt.value.name, stmt.value.span, context);
            }
          } else if (source?.ownership === 'own') this.report(stmt.value.span,
            `Copying owned value ${stmt.value.kind === 'name' ? stmt.value.name : ''} is forbidden`, 'OWN');
          context.locals.set(stmt.target.name, { type: { ...target, readonly: value.readonly, frozen: value.frozen }, declaredType: target, ownership,
            moved: false, origin: stmt.value.kind === 'name' ? stmt.value.name : undefined, definition: stmt.target.span });
          context.flow.declare(stmt.target.name, origins, !!value.readonly, { source: sourceName(stmt.value) });
        } else if (existing) {
          if (existing.ownership === 'own' && existing.origin !== 'field') this.report(stmt.target.span,
            `Reassigning owned value ${stmt.target.name} is not supported; use a new scope`, 'OWN');
          if (source?.ownership === 'own' && !(existing.origin === 'field' && existing.ownership === 'own')) this.report(stmt.value.span,
            'Cannot copy an owned value into a managed variable', 'OWN');
          if (existing.origin === 'field' && existing.ownership !== 'own' &&
              !context.initializing && !context.borrowed.has('self') && context.locals.get('self')?.ownership !== 'borrow')
            this.report(stmt.target.span, `Mutating field ${stmt.target.name} requires borrow self`, 'BORROW');
          if (existing.origin === 'field' && context.flow.hasTaskCapture(unionOrigins(context.flow.origins('self'), context.flow.origins(stmt.target.name))))
            this.report(stmt.target.span, `Cannot mutate ${stmt.target.name} while a task uses it; wait for the task first`, 'CONCURRENCY');
          if (existing.origin === 'field' && !context.initializing) {
            const name = stmt.target.name;
            const storage = context.owner && 'fields' in context.owner.node ? fieldsOf(context.owner.node).find(field => field.name === name) : undefined;
            if (!storage?.mutable) this.report(stmt.target.span, `Field ${name} is read-only; declare mutable storage`, 'MUTABILITY');
            if (storage?.mutable && this.isReference(value) && value.readonly)
              this.report(stmt.value.span, 'Read-only references cannot become mutable storage', 'MUTABILITY');
            context.flow.escape(origins, stmt.value.span, (span, message) => this.report(span, message, 'BORROW'));
            this.requireChange(stmt.target, stmt.span, context);
          }
          if (existing.origin === 'field' && context.initializing && context.owner?.node.kind === 'class' && context.owner.node.record)
            this.report(stmt.span, 'Record validation cannot replace fields; transform inputs in a separate factory', 'RECORD');
          const declared = existing.declaredType ?? existing.type;
          if (!this.assignable(value, declared)) this.report(stmt.value.span,
            `Cannot assign ${tyName(value)} to ${tyName(declared)}`);
          if (existing.origin !== 'field') existing.type = { ...declared, nullable: value.nullable, optional: value.optional, readonly: value.readonly, frozen: value.frozen };
          context.flow.rebind(stmt.target.name, origins, !!value.readonly, stmt.span,
            (span, message) => this.report(span, message, 'BORROW'), sourceName(stmt.value));
          existing.moved = false; existing.moveSites = undefined;
          if(existing.origin==='field'&&existing.ownership==='own'){
            if(source?.ownership==='own'&&stmt.value.kind==='name')this.moveOwnedLocal(stmt.value.name,stmt.value.span,context);
            else if(!['own','fresh'].includes(this.ownershipOf(stmt.value,context)))this.report(stmt.value.span,'An owned field requires a new object or another owned value','OWN');
          }
        } else {
          if (source?.ownership === 'own') this.report(stmt.value.span,
            'Cannot copy an owned value into a managed variable', 'OWN');
          context.locals.set(stmt.target.name,
            { type: value, declaredType: value, ownership, moved: false,
              origin: stmt.value.kind === 'name' ? stmt.value.name : undefined, definition: stmt.target.span });
          context.flow.declare(stmt.target.name, origins, !!value.readonly, { source: sourceName(stmt.value) });
        }
      } else if (stmt.target.kind === 'member') {
        const object = this.checkExpression(stmt.target.object, context);
        if (context.flow.hasTaskCapture(this.placesOf(stmt.target.object, context)))
          this.report(stmt.target.span, 'Cannot mutate a value while a task uses it; wait for the task first', 'CONCURRENCY');
        const target = this.memberType(object, stmt.target.name, stmt.target.span, context);
        if (!this.assignable(value, target)) this.report(stmt.value.span,
          `Cannot assign ${tyName(value)} to ${tyName(target)}`);
        const root = this.rootName(stmt.target.object);
        if (context.initializing && context.owner?.node.kind === 'class' && context.owner.node.record)
          this.report(stmt.span, 'Record validation cannot replace fields; transform inputs in a separate factory', 'RECORD');
        if (root && !(context.initializing && root === 'self') &&
            !context.borrowed.has(root) && !['own', 'borrow'].includes(context.locals.get(root)?.ownership ?? 'managed'))
          this.report(stmt.target.span, `Mutating ${root} requires borrow ${root}`, 'BORROW');
        const node = object.def?.node;
        const fieldName = stmt.target.name;
        const field = node?.kind === 'class' || node?.kind === 'interceptor' ? fieldsOf(node).find(item => item.name === fieldName) : undefined;
        if(value.kind==='resource'&&field?.ownership!=='own')this.report(stmt.span,'Native resources must be held by own fields','OWN');
        if (!(context.initializing && root === 'self') && !field?.mutable)
          this.report(stmt.target.span, `Field ${fieldName} is read-only; declare mutable storage`, 'MUTABILITY');
        if (object.readonly && !(context.initializing && root === 'self'))
          this.report(stmt.target.span, 'A read-only input cannot provide mutable access', 'MUTABILITY');
        if (field?.mutable && this.isReference(value) && value.readonly)
          this.report(stmt.value.span, 'Read-only references cannot become mutable storage', 'MUTABILITY');
        context.flow.escape(origins, stmt.value.span, (span, message) => this.report(span, message, 'BORROW'));
        this.requireChange(stmt.target.object, stmt.span, context);
        if (field?.ownership === 'own') {
          if (source?.ownership === 'own' && stmt.value.kind === 'name')
            this.moveOwnedLocal(stmt.value.name, stmt.value.span, context);
          else if (!['own', 'fresh'].includes(this.ownershipOf(stmt.value, context))) this.report(stmt.value.span,
            'An owned field requires a new object or another owned value', 'OWN');
        } else if (source?.ownership === 'own') this.report(stmt.value.span,
          'Cannot copy an owned value into a managed field', 'OWN');
      } else this.report(stmt.target.span, 'Assignment target must be a variable or field');
      return;
    }
    if(stmt.kind==='yield') {
      if(!context.stream)this.report(stmt.span,'yield belongs in a streaming endpoint','HTTP');
      if(context.locked)this.report(stmt.span,'Release the lock before yielding a stream item','CONCURRENCY');
      const type=this.checkExpression(stmt.value,context,context.stream);
      if(context.stream&&!this.assignable(type,context.stream))this.report(stmt.span,`Expected stream item ${tyName(context.stream)}, got ${tyName(type)}`,'TYPE');
      this.checkAllowedError(builtin('HttpError'),stmt.span,context);return;
    }
    if (stmt.kind === 'return') {
      const type = stmt.value ? this.checkExpression(stmt.value, context, context.returns.kind === 'error' ? undefined : context.returns) : builtin('void');
      context.inferredReturns?.push(type);
      const declaredErrors = context.callable ? this.bodyErrors(context.callable, context.file, context.types) : [];
      for (const error of context.flow.pendingTaskErrors())
        this.checkAllowedError(error, stmt.span, {...context, allowedErrors: declaredErrors, exceptionalFlows: undefined});
      if (!this.assignable(type, context.returns)) this.report(stmt.span,
        `Expected return ${tyName(context.returns)}, got ${tyName(type)}`);
      const ownership = stmt.value ? this.ownershipOf(stmt.value, context) : 'managed';
      if (stmt.value && this.isReference(type)) context.flow.escape(this.placesOf(stmt.value, context), stmt.span,
        (span, message) => this.report(span, message, 'BORROW'), true,
        this.immutableData(type) && (!!type.frozen || type.def?.node.kind === 'class' && !!type.def.node.record || ['Bytes', 'Json', 'RsaPrivateKey', 'RsaPublicKey'].includes(type.name)));
      if (stmt.value?.kind === 'member' && ownership === 'own') this.report(stmt.span,
        'Moving an owned field requires an explicit take operation', 'OWN');
      if (context.returnOwnership === 'own' && !['own', 'fresh'].includes(ownership))
        this.report(stmt.span, 'Owned return requires a new or owned value', 'OWN');
      if (context.returnOwnership === 'managed' && ownership === 'own')
        this.report(stmt.span, 'Cannot return an owned value as managed', 'OWN');
      if (stmt.value?.kind === 'name') {
        const local = context.locals.get(stmt.value.name);
        if (local?.origin === 'field' && local.ownership === 'own') this.report(stmt.span,
          'Moving an owned field requires an explicit take operation', 'OWN');
        if (context.returnOwnership === 'own' && local?.ownership === 'own') {
          this.moveOwnedLocal(stmt.value.name, stmt.span, context);
        }
      }
      return;
    }
    if (stmt.kind === 'throw') {
      const type = this.checkExpression(stmt.value, context);
      if (!this.implementsError(type)) this.report(stmt.value.span,
        `Cannot throw ${tyName(type)} because it does not implement Error`);
      this.checkAllowedError(type, stmt.span, context);
      if (stmt.value.kind === 'name') this.moveOwnedLocal(stmt.value.name, stmt.value.span, context);
      return;
    }
    if (stmt.kind === 'if' || stmt.kind === 'while') {
      const test = this.checkExpression(stmt.test, context);
      if (!this.assignable(test, builtin('bool'))) this.report(stmt.test.span,
        `Condition must be bool, got ${tyName(test)}`);
      const bodyContext = this.cloneContext(context);
      if (stmt.kind === 'while') {
        bodyContext.loopDepth = (context.loopDepth ?? 0) + 1;
        bodyContext.loop = {breaks:[], continues:[]};
      }
      this.narrow(stmt.test, true, bodyContext);
      this.checkStatements(stmt.kind === 'if' ? stmt.then : stmt.body, bodyContext, stmt.span);
      if (stmt.kind === 'if') {
        const elseContext = this.cloneContext(context);
        this.narrow(stmt.test, false, elseContext);
        this.checkStatements(stmt.otherwise, elseContext, stmt.span);
        this.mergeMoved(context, [
          ...(canFallThrough(stmt.then) ? [bodyContext] : []),
          ...(canFallThrough(stmt.otherwise) ? [elseContext] : []),
        ]);
        if (!canFallThrough(stmt.then)) this.narrow(stmt.test, false, context);
        if (stmt.otherwise.length && !canFallThrough(stmt.otherwise)) this.narrow(stmt.test, true, context);
      } else {
        if (canFallThrough(stmt.body) || bodyContext.loop!.continues.length) {
          this.mergeMoved(bodyContext, [...(canFallThrough(stmt.body) ? [bodyContext] : []), ...bodyContext.loop!.continues]);
          let previous = '';
          let iterations = 0;
          const limit = context.locals.size * 3 + 3;
          while (iterations++ < limit) {
            this.mergeMoved(context, [bodyContext]);
            const state = context.flow.signature() + JSON.stringify([...context.locals].map(([name, local]) => [name, local.moved, local.type.nullable]));
            if (state === previous) break;
            previous = state;
            const iteration = this.cloneContext(context);
            iteration.loopDepth = (context.loopDepth ?? 0) + 1;
            iteration.loop = bodyContext.loop;
            this.narrow(stmt.test, true, iteration);
            this.checkExpression(stmt.test, iteration);
            this.checkStatements(stmt.body, iteration, stmt.span);
            this.mergeMoved(bodyContext, [iteration]);
          }
        }
        this.mergeMoved(context, [bodyContext, ...bodyContext.loop!.breaks]);
      }
      return;
    }
    if (stmt.kind === 'try') {
      const breakStart = context.loop?.breaks.length ?? 0, continueStart = context.loop?.continues.length ?? 0;
      const catches = stmt.catches.map(entry => this.resolveType(entry.type, context.file, context.types));
      const inside = this.cloneContext(context);
      inside.allowedErrors = [...inside.allowedErrors, ...catches];
      inside.exceptionalFlows = [];
      this.checkStatements(stmt.body, inside, stmt.span);
      const branches = [inside];
      for (let i = 0; i < stmt.catches.length; i++) {
        const clause = stmt.catches[i];
        if (!this.implementsError(catches[i])) this.report(clause.type.span,
          `Catch type ${clause.type.name} must implement Error`);
        const match = errorMatch(catches[i], type=>this.implementsError(type));
        if(typeof match==='string')this.report(clause.type.span,match,'ERROR_MATCH');
        else this.errorMatches.set(clause.type,match);
        const catchContext = this.cloneContext(context);
        const failures = inside.exceptionalFlows.filter(failure => this.assignable(failure.type, catches[i]));
        if (failures.length) catchContext.flow.join(failures.map(failure => failure.flow));
        catchContext.locals.set(clause.name, { type: catches[i], ownership: 'managed', moved: false, definition:clause.span });
        catchContext.flow.declare(clause.name, allocationOrigin(clause.span), false);
        this.checkStatements(clause.body, catchContext, clause.span);
        branches.push(catchContext);
      }
      context.exceptionalFlows?.push(...inside.exceptionalFlows.filter(failure => !catches.some(type => this.assignable(failure.type, type))));
      this.mergeMoved(context, branches);
      if (stmt.always) {
        const cleanup = this.cloneContext(context); cleanup.loop = undefined;
        this.checkStatements(stmt.always, cleanup, stmt.span);
        for (const exit of [...(context.loop?.breaks.slice(breakStart) ?? []), ...(context.loop?.continues.slice(continueStart) ?? [])]) {
          const prior = exit.loop; exit.loop = undefined;
          this.checkStatements(stmt.always, exit, stmt.span); exit.loop = prior;
        }
        const exits = (body: Stmt[]): boolean => body.some(statement => statement.kind === 'return' || statement.kind === 'serve' ||
          ('body' in statement && exits(statement.body)) || statement.kind === 'if' && (exits(statement.then) || exits(statement.otherwise)));
        const starts = (value: unknown): boolean => !!value && typeof value === 'object' &&
          (Array.isArray(value) ? value.some(starts) : (value as {kind?:string}).kind === 'start' || Object.entries(value).some(([key, child]) => key !== 'span' && starts(child)));
        if (exits(stmt.always) || starts(stmt.always)) this.report(stmt.span, 'always cleanup cannot return, start tasks, or start a server', 'CONCURRENCY');
        this.mergeMoved(context, [cleanup]);
      }
      return;
    }
    if (stmt.kind === 'unsafe') {
      const inside = this.cloneContext(context); inside.unsafe = true;
      this.checkStatements(stmt.body, inside, stmt.span);
      this.mergeMoved(context, [inside]);
      return;
    }
    if (stmt.kind === 'borrow') {
      const breakStart=context.loop?.breaks.length??0,continueStart=context.loop?.continues.length??0;
      const local = context.locals.get(stmt.name);
      if (!local) this.report(stmt.span, `Cannot borrow unknown variable ${stmt.name}`, 'BORROW');
      if (local?.type.readonly) this.report(stmt.span, `Cannot borrow read-only ${stmt.name} for mutation`, 'MUTABILITY');
      const inside = this.cloneContext(context);
      inside.flow.borrow(stmt.name, stmt.span, (span, message) => this.report(span, message, 'BORROW'));
      inside.borrowed.add(stmt.name);
      this.checkStatements(stmt.body, inside, stmt.span);
      this.unwindLoopExits(context,breakStart,continueStart);
      this.mergeMoved(context, [inside]);
    }
  }

  private rootName(expr: Expr): string | undefined {
    return expr.kind === 'name' ? expr.name : expr.kind === 'member' ? this.rootName(expr.object) : undefined;
  }

  private narrow(expr: Expr, truth: boolean, context: Context): void {
    if (expr.kind === 'unary' && expr.op === '!') { this.narrow(expr.value, !truth, context); return; }
    if (expr.kind !== 'binary') return;
    if (expr.op === '&&' && truth || expr.op === '||' && !truth) {
      this.narrow(expr.left, truth, context); this.narrow(expr.right, truth, context); return;
    }
    if (expr.op !== '==' && expr.op !== '!=') return;
    const name = expr.left.kind === 'name' && expr.right.kind === 'literal' && expr.right.value === null ? expr.left.name :
      expr.right.kind === 'name' && expr.left.kind === 'literal' && expr.left.value === null ? expr.right.name : undefined;
    if (name && (expr.op === '!=' ? truth : !truth)) {
      const local = context.locals.get(name);
      if (local && local.origin !== 'field') local.type = { ...local.type, nullable: false, optional:false };
    }
  }

  private aliasRoot(name: string, locals: Map<string, Local>): string {
    const seen = new Set<string>();
    while (locals.get(name)?.origin && !seen.has(name)) {
      seen.add(name);
      name = locals.get(name)!.origin!;
    }
    return name;
  }

  private ownershipOf(expr: Expr, context: Context): 'managed' | 'own' | 'fresh' {
    if(this.functionValues.has(expr))return 'fresh';
    if (expr.kind === 'name') return context.locals.get(expr.name)?.ownership === 'own' ? 'own' : 'managed';
    if (expr.kind === 'collection' || expr.kind === 'comprehension' || expr.kind === 'recordCopy') return 'fresh';
    if (expr.kind === 'member') {
      const type = this.expressionTypes.get(expr.object);
      const node = type?.def?.node;
      if (node && 'fields' in node && fieldsOf(node).find(field => field.name === expr.name)?.ownership === 'own') return 'own';
    }
    if (expr.kind !== 'call') return 'managed';
    if (expr.callee.kind === 'name') {
      if (['List', 'Map', 'Set', 'Tuple', 'Shared'].includes(expr.callee.name)) return 'fresh';
      if (expr.callee.name === 'next' && context.next)
        return context.next.returnOwnership === 'own' ? 'own' : 'managed';
      const def = this.project.scopes.get(context.file)?.get(expr.callee.name);
      if (def?.node.kind === 'class') return this.constructorIsFresh(def.node) ? 'fresh' : 'managed';
      if (def?.node.kind === 'function' && def.node.returnOwnership === 'own') return 'own';
      if (def?.node.kind === 'function' && this.functionIsFresh(def.node, def.file)) return 'fresh';
    }
    if (expr.callee.kind === 'member') {
      const receiver = this.expressionTypes.get(expr.callee.object);
      const methodName = expr.callee.name;
      const node = receiver?.def?.node;
      const method = node?.kind === 'class' || node?.kind === 'interceptor' ?
        node.methods.find(item => item.name === methodName) ??
          this.defaults.get(receiver!.def!.id)?.get(methodName)?.method :
        node?.kind === 'interface' ?
          this.interfaceMethods(receiver!, new Set()).get(methodName)?.[0]?.method : undefined;
      if (method?.returnOwnership === 'own') return 'own';
      if (method && this.functionIsFresh(method, method.span.file, node && 'fields' in node ? new Set(fieldsOf(node).map(field => field.name)) : new Set())) return 'fresh';
    }
    return 'managed';
  }

  private functionIsFresh(fn: MethodDecl, file: string, fields = new Set<string>(), seen = new Set<MethodDecl>()): boolean {
    if (!fn.body || seen.has(fn)) return false;
    seen.add(fn);
    const bodyFresh = returnsFresh(fn.body, fields, expr => {
      if (expr.kind === 'collection' || expr.kind === 'comprehension' || this.functionValues.has(expr)) return true;
      if (expr.kind !== 'call' || expr.callee.kind !== 'name') return false;
      if (['List', 'Set', 'Map', 'Tuple', 'arguments'].includes(expr.callee.name)) return true;
      const def = this.project.scopes.get(file)?.get(expr.callee.name);
      return def?.node.kind === 'class' ? this.constructorIsFresh(def.node) :
        def?.node.kind === 'function' ? def.node.returnOwnership === 'own' || this.functionIsFresh(def.node, def.file, new Set(), seen) : false;
    },!!(fn.returns.immutable||this.callableContracts.get(fn)?.result.immutable));
    return bodyFresh && (this.interceptorPlans.get(fn) ?? []).every(layer => returnsFresh(layer.around.body ?? [],
      new Set(layer.definition.node.kind === 'interceptor' ? layer.definition.node.fields.map(field => field.name) : []),
      expr => expr.kind === 'call' && expr.callee.kind === 'name' && expr.callee.name === 'next'));
  }

  private isReference(type: Ty): boolean {
    return !['builtin:int', 'builtin:c_int', 'builtin:float', 'builtin:bool', 'builtin:string', 'builtin:void', 'null', 'error'].includes(type.id);
  }

  /** An ABI resource output is a newly owned wrapper. The adapter owns any
   * native references it needs and cannot retain an August input wrapper. */
  private independentNativeResource(fn: MethodDecl, seen = new Set<MethodDecl>()): boolean {
    if (seen.has(fn) || (this.interceptorPlans.get(fn) ?? []).length) return false;
    const contract = this.native.functions.get(fn);
    if (contract) return contract.result.kind === 'resource';
    if (!fn.body) return false;
    seen.add(fn);
    return returnsFresh(fn.body, new Set(), expr => {
      if (expr.kind !== 'call' || expr.callee.kind !== 'name') return false;
      const def = this.project.scopes.get(fn.span.file)?.get(expr.callee.name);
      return def?.node.kind === 'function' && this.independentNativeResource(def.node, new Set(seen));
    });
  }

  private placesOf(expr: Expr, context: Context): Origins {
    if (!this.isReference(this.expressionTypes.get(expr) ?? errorTy)) return new Set();
    const callback=this.functionValues.get(expr);
    if(callback){const origins=allocationOrigin(expr.span);context.flow.object(origins,callback.captures.map(capture=>({name:capture.name,origins:this.placesOf(capture.expression,context),mutable:false})));return origins;}
    if (expr.kind === 'name') return context.flow.origins(expr.name);
    if(expr.kind==='matchValue')return unionOrigins(...expr.cases.map(clause=>this.expressionOrigins.get(clause.result)??new Set<string>()));
    if (expr.kind === 'binary' && expr.op === 'otherwise')
      return new Set([...this.placesOf(expr.left, context), ...this.placesOf(expr.right, context)]);
    if (expr.kind === 'start') {
      const origins = allocationOrigin(expr.span);
      context.flow.object(origins, [{name:'scope', origins:new Set([`tasks:${context.scope?.file}:${context.scope?.start}`]), mutable:false},
        {name:'captures', origins:this.placesOf(expr.call, context), mutable:false}]);
      return origins;
    }
    if (expr.kind === 'resolve') return this.bindingOrigins(this.bindingKey(expr.name, expr.typeArgs), context, expr.span);
    if (expr.kind === 'member') return context.flow.field(this.placesOf(expr.object, context), expr.name);
    if (expr.kind === 'recordCopy') {
      const origins = allocationOrigin(expr.span), base = this.placesOf(expr.base, context), node = this.expressionTypes.get(expr.base)?.def?.node;
      if (node?.kind === 'class') context.flow.object(origins, node.fields.map(field => {
        const replacement = expr.fields.find(item => item.name === (field.label ?? field.name));
        return {name:field.name, origins:replacement ? this.placesOf(replacement.value, context) : context.flow.field(base, field.name), mutable:false};
      }));
      return origins;
    }
    if(expr.kind==='comprehension'){
      const origins=allocationOrigin(expr.span);
      context.flow.object(origins,[{name:'items',origins:this.expressionOrigins.get(expr.projection)??new Set(),mutable:true}]);
      return origins;
    }
    if (expr.kind === 'collection') {
      const origins = allocationOrigin(expr.span);
      context.flow.object(origins, expr.items.map((item, index) => ({ name: String(index), origins: this.placesOf(item, context), mutable: expr.collection !== 'Tuple' })));
      return origins;
    }
    if (expr.kind === 'call') {
      const def = expr.callee.kind === 'name' ? this.project.scopes.get(context.file)?.get(expr.callee.name) : undefined;
      if (def?.node.kind === 'function' && this.independentNativeResource(def.node)) {
        const origins = allocationOrigin(expr.span); context.flow.object(origins, []); return origins;
      }
      if (def?.node.kind === 'class') {
        const plan = this.callPlans.get(expr);
        const fields = def.node.fields.map((field, index) => {
          const source = plan?.sourceIndices[index];
          let origins: Origins = new Set();
          if (source !== undefined) origins = this.placesOf(expr.args[source], context);
          const local = plan?.injectionSources?.[index];
          const key = plan?.bindingKeys[index];
          if (source === undefined) origins = local ? context.flow.origins(local.startsWith('self.') ? local.slice(5) : local) :
            key ? this.bindingOrigins(key, context, expr.span) : new Set();
          return { name: field.name, origins, mutable: !!field.mutable || field.ownership === 'own' };
        });
        const origins = allocationOrigin(expr.span);
        context.flow.object(origins, fields);
        return origins;
      }
      if (expr.callee.kind === 'member') {
        const receiver = this.expressionTypes.get(expr.callee.object);
        const method = expr.callee.name;
        if (['builtin:List', 'builtin:Tuple', 'builtin:Map'].includes(receiver?.id ?? '') &&
          (method === 'get' || receiver?.id === 'builtin:List' && method === 'at')) {
          const index = expr.args[0]?.kind === 'literal' && typeof expr.args[0].value === 'number' ? String(expr.args[0].value) : undefined;
          return context.flow.field(this.placesOf(expr.callee.object, context), receiver?.id === 'builtin:Tuple' ? index : undefined);
        }
      }
      const plan = this.callPlans.get(expr);
      const injected = (plan?.bindingKeys ?? []).map((key, index) => {
        const local = plan?.injectionSources?.[index];
        return local ? context.flow.origins(local.startsWith('self.') ? local.slice(5) : local) :
          key ? this.bindingOrigins(key, context, expr.span) : new Set<string>();
      });
      const related = [...expr.args.map(arg => this.placesOf(arg, context)), ...injected,
        ...(expr.callee.kind === 'member' ? [this.placesOf(expr.callee.object, context)] : [])];
      const fresh = ['own', 'fresh'].includes(this.ownershipOf(expr, context));
      if (fresh) {
        const origins = allocationOrigin(expr.span);
        const result=this.expressionTypes.get(expr);
        // A fresh collection of scalar values cannot retain its source containers.
        // Nested reference elements keep their conservative captures and lifetime checks.
        const captures=result&&['builtin:List','builtin:Set','builtin:Map','builtin:Tuple'].includes(result.id)&&result.args.every(item=>!this.isReference(item))?[]:related;
        context.flow.object(origins, captures.map((origins, index) => ({ name: `capture:${index}`, origins, mutable: true })));
        return origins;
      }
      return unionOrigins(...related);
    }
    return new Set();
  }

  private bindingOrigins(key: string, context: Context, span: Span, seen = new Set<string>()): Origins {
    const binding = this.bindingByKey.get(key);
    const origins = new Set([binding?.lifetime === 'fresh' ? `fresh:${span.file}:${span.start}:${key}` :
      binding?.lifetime === 'scoped' ? `scope:${context.scope?.file}:${context.scope?.start}:${key}` : `binding:${key}`]);
    if (binding && !seen.has(key)) {
      seen.add(key);
      context.flow.object(origins, binding.constructorKeys.map((dependency, index) => ({ name: (binding.target.node as ClassDecl).fields[index].name,
        origins: this.bindingOrigins(dependency, context, span, seen), mutable: binding.stateful })));
    }
    return origins;
  }

  private constructorIsFresh(node: ClassDecl, visiting = new Set<ClassDecl>()): boolean {
    const cached = this.constructorFreshness.get(node);
    if (cached !== undefined) return cached;
    if (visiting.has(node)) return false;
    visiting.add(node);
    const result = (this.interceptorPlans.get(node) ?? []).every(layer => this.layerReturnsFresh(layer, visiting));
    visiting.delete(node);
    this.constructorFreshness.set(node, result);
    return result;
  }

  private layerReturnsFresh(layer: InterceptorLayer, visiting = new Set<ClassDecl>()): boolean {
    const interceptor = layer.definition.node as InterceptorDecl;
    return returnsFresh(layer.around.body ?? [], new Set(interceptor.fields.map(field => field.name)), expr => {
      if (expr.kind !== 'call' || expr.callee.kind !== 'name') return false;
      if (expr.callee.name === 'next') return true;
      const def = this.project.scopes.get(layer.definition.file)?.get(expr.callee.name);
      return def?.node.kind === 'class' && this.constructorIsFresh(def.node, visiting);
    });
  }

  private checkAllowedError(type: Ty, span: Span, context: Context): void {
    if (context.deferredErrors) { context.deferredErrors.push(type); return; }
    context.exceptionalFlows?.push({type, flow: context.flow.clone()});
    if (!context.allowedErrors.some(allowed => this.assignable(type, allowed))) {
      const contract = context.callable && this.inferring && this.callableContracts.get(context.callable);
      if (contract && contract.inferredErrors && type.kind !== 'error') {
        if (!contract.errors.some(error => sameType(error, type))) { contract.errors.push(type); this.markInference(context.callable!); }
      } else this.report(span, `Unhandled ${tyName(type)}; catch it or declare unless ${tyName(type)}`, 'THROWS');
    }
  }

  private checkCollection(expr: Extract<Expr, { kind: 'collection' }>, context: Context, expected?: Ty): Ty {
    const name = expr.collection === 'empty' ? expected?.name === 'Set' ? 'Set' : 'Map' : expr.collection;
    const target = expected?.id === `builtin:${name}` ? expected : undefined;
    const types = expr.items.map((item, index) => {
      const wanted = target?.args[name === 'Tuple' ? index : name === 'Map' ? index % 2 : 0];
      const actual = this.checkExpression(item, context, wanted);
      if (this.ownershipOf(item, context) === 'own') this.report(item.span,
        `${name} cannot copy an owned value`, 'OWN');
      if (this.isReference(actual)) this.checkBorrowEscape(item, context, false);
      if (actual.id === 'builtin:void') this.report(item.span, 'Collections cannot contain void', 'COLLECTION');
      return actual;
    });
    if (name === 'Tuple') {
      if (target && target.args.length !== types.length) this.report(expr.span,
        `Tuple needs ${target.args.length} items, got ${types.length}`, 'COLLECTION');
      types.forEach((actual, index) => {
        if (target?.args[index] && !this.assignable(actual, target.args[index])) this.report(expr.items[index].span,
          `Tuple item ${index} expects ${tyName(target.args[index])}, got ${tyName(actual)}`, 'COLLECTION');
      });
      return { ...builtin(name), args: target?.args ?? types };
    }
    const infer = (indices: number[], part: string, wanted?: Ty): Ty => {
      let element = wanted;
      for (const index of indices) {
        const actual = types[index];
        if (!element) element = actual;
        else if (!wanted) {
          if (actual.kind === 'null') element = { ...element, nullable: true };
          else if (element.kind === 'null') element = { ...actual, nullable: true };
          else if (['builtin:int', 'builtin:float'].includes(element.id) &&
            ['builtin:int', 'builtin:float'].includes(actual.id)) element = {
              ...builtin(element.id === 'builtin:float' || actual.id === 'builtin:float' ? 'float' : 'int'),
              nullable: element.nullable || actual.nullable };
          else if (this.assignable(element, actual)) element = actual;
        }
      }
      if (!element || element.kind === 'null') {
        this.report(expr.span, `${name} ${part} need a type; use a typed declaration such as ${name === 'Map' ? 'Map<int, string>' : `${name}<int>`}`, 'COLLECTION');
        return errorTy;
      }
      for (const index of indices) if (!this.assignable(types[index], element)) this.report(expr.items[index].span,
        `${name} ${part} expect ${tyName(element)}, got ${tyName(types[index])}`, 'COLLECTION');
      return element;
    };
    const indices = types.map((_, index) => index);
    const args = name === 'Map' ? [infer(indices.filter(index => index % 2 === 0), 'keys', target?.args[0]),
      infer(indices.filter(index => index % 2 === 1), 'values', target?.args[1])] :
      [infer(indices, 'items', target?.args[0])];
    return { ...builtin(name), args };
  }

  /** Data is a shape bound, not proof that erased storage is immutable. A
   * capture must preserve that proof through tuple/record/generic children. */
  private immutableCapture(type:Ty):boolean {
    if (!this.immutableData(type)) return false;
    // Record construction deep-freezes every field, including erased/generic
    // data. That existing storage guarantee is stronger than its source types.
    if (type.frozen || type.kind==='choice' || type.def?.node.kind === 'class' && type.def.node.record) return true;
    if (type.kind === 'param') return !!type.bounds?.some(bound=>bound.kind==='choice'&&this.immutableCapture(bound));
    if (type.id === 'builtin:Data') return false;
    if (['builtin:List','builtin:Set','builtin:Map'].includes(type.id)) return false;
    return type.args.every(arg=>this.immutableCapture(arg));
  }

  /** Adapt a pure callable to an existing single-method interface. Generic call
   * inputs may supply a partial interface; its method settles the remaining
   * arguments before an executable plan can be retained. */
  private checkFunctionValue(expr:Expr, context:Context, expected?:Ty, target?:Definition):Ty {
    this.functionValues.delete(expr);
    const reject = (message:string) => this.report(expr.span, message, 'CALLBACK');
    if (expected?.kind !== 'interface') {
      reject('A function value needs a single-method interface; declare its type or pass it to a typed input');
      return errorTy;
    }
    const methods = this.interfaceMethods(expected, new Set(), true);
    if (methods.size !== 1) {
      reject(`${tyName(expected)} must have exactly one public abstract method for a function value`);
      return errorTy;
    }
    const signatures = [...methods.values()][0], signature = signatures[0], method = signature.method, params = method.params;
    if (signatures.some(entry => !this.sameSignature(method,signature.file,signature.params,entry) ||
        !this.sameSignature(entry.method,entry.file,entry.params,signature))) {
      reject('Every inherited callback signature must have the same resolved labels, types, result and pure contract');
      return errorTy;
    }
    let inputs = params.map(param => this.resolveType(param.type, signature.file, signature.params));
    let result = this.returnType(method, signature.file, signature.params);
    const unsupported = (fn:MethodDecl) => fn.typeParams.length || fn.externC || fn.endpoint || fn.annotations?.length ||
      fn.returnOwnership !== 'managed' || fn.params.some(param => param.injected || param.ownership !== 'managed' || param.defaultValue || param.source);
    if (signatures.some(entry => entry.method.name.startsWith('_') || entry.method.body || unsupported(entry.method) ||
        this.effectiveContract(entry.method,entry.file,undefined,entry.params).uses.size ||
        this.effectiveContract(entry.method,entry.file,undefined,entry.params).changes.length ||
        this.effectiveErrors(entry.method,entry.file,entry.params).length)) {
      reject('Function values require one abstract pure data method with managed inputs/result, no checked failures, defaults, injection or native contracts');
      return errorTy;
    }
    const inferred = new Map<string,Ty>();
    const settle = (template:Ty, actual:Ty):void => {
      if (template.kind === 'param') {
        const value = template.optional || template.nullable ? {...actual, optional:false, nullable:false} : actual;
        const previous = inferred.get(template.id);
        if (previous && !this.sameType(previous, value)) reject(`Conflicting callback type inference: ${tyName(previous)} and ${tyName(value)}`);
        else inferred.set(template.id, value);
      } else if (template.id === actual.id && template.args.length === actual.args.length) {
        template.args.forEach((arg,index) => settle(arg,actual.args[index]));
      }
    };
    const concrete = (type:Ty):Ty => {
      const value = type.kind === 'param' ? inferred.get(type.id) : undefined;
      return value ? {...value, optional:type.optional || value.optional, nullable:type.nullable || value.nullable} :
        {...type,args:type.args.map(concrete)};
    };
    const plan:FunctionValuePlan = {type:expected, signature, params, inputs, result, target, order:[], captures:[]};
    if (target) {
      const fn = target.node as MethodDecl, contract = this.effectiveContract(fn,target.file);
      if (unsupported(fn) || contract.uses.size || contract.changes.length || this.effectiveErrors(fn,target.file,new Map()).length) {
        reject(`${target.name} cannot become a pure callback: remove unsupported errors, effects, ownership, defaults, injection, annotations or generic/native contracts`);
        return errorTy;
      }
      const positions = fn.params.map(param => params.findIndex(input => (input.label ?? input.name) === (param.label ?? param.name)));
      if (fn.params.length !== params.length || positions.some(position => position < 0)) {
        reject(`${target.name} must match ${tyName(expected)}.${method.name}'s public input labels/types and result`);
        return errorTy;
      }
      const actualInputs = fn.params.map(param => this.resolveType(param.type,target.file));
      actualInputs.forEach((type,index) => settle(inputs[positions[index]],type));
      const actualResult = this.returnType(fn,target.file);
      settle(result,actualResult); inputs = inputs.map(concrete); result = concrete(result);
      if (actualInputs.some((type,index) => !this.sameType(type,inputs[positions[index]])) || !this.assignable(actualResult,result))
        reject(`${target.name} must match ${tyName(expected)}.${method.name}'s public input labels/types and result`);
      plan.order = positions;
    } else if (expr.kind === 'lambda') {
      if (expr.params.length !== params.length || expr.params.some((param,index) => param.name !== (params[index].label ?? params[index].name) ||
          param.injected || param.ownership !== 'managed' || param.defaultValue)) {
        reject(`Closure inputs must match ${tyName(expected)}.${method.name}'s labels/types, with managed inputs and no defaults or injection`);
        return errorTy;
      }
      const actualInputs = expr.params.map(param => this.resolveType(param.type,context.file,context.types));
      actualInputs.forEach((type,index) => settle(inputs[index],type)); inputs = inputs.map(concrete);
      if (actualInputs.some((type,index) => !this.sameType(type,inputs[index])))
        reject(`Closure inputs must match ${tyName(expected)}.${method.name}'s labels/types`);
      const callable:MethodDecl = {kind:'function',name:'callback',typeParams:[],params:expr.params,returns:method.returns,
        returnOwnership:'managed',throws:[],externC:false,span:expr.span};
      const inside = this.cloneContext(context);
      inside.callable = callable; inside.owner = undefined; inside.self = undefined;
      // The callback's runtime receiver is its capture object, never the
      // enclosing behavior receiver. Read a permitted field into a local first.
      inside.locals.delete('self');
      inside.effects = {uses:new Map(),changes:[]}; inside.allowedErrors = [];
      inside.inferredReturns = undefined; inside.deferredErrors = undefined; inside.exceptionalFlows = undefined;
      inside.scope = undefined; inside.loop = undefined; inside.loopDepth = 0; inside.next = undefined;
      inside.stream = undefined; inside.initializing = false; inside.unsafe = false; inside.locked = false; inside.borrowed = new Set();
      inside.returns = concrete(result); inside.returnOwnership = 'managed';
      for (const [index,param] of expr.params.entries()) {
        inside.locals.set(param.name,{type:{...inputs[index],readonly:true},ownership:'managed',moved:false,definition:param.nameSpan ?? param.span});
        inside.flow.declare(param.name,this.isReference(inputs[index]) ? allocationOrigin(param.span) : new Set(),true);
      }
      this.captureScope(expr.body.span,inside);
      const wanted = concrete(result);
      const actual = this.checkExpression(expr.body,inside,containsUnknown(wanted) ? undefined : wanted);
      settle(result,actual); result = concrete(result);
      if (!this.assignable(actual,result)) reject(`Callback result expects ${tyName(result)}, got ${tyName(actual)}`);
      if (this.ownershipOf(expr.body,inside) === 'own' || actual.kind === 'resource') reject('A pure callback cannot transfer an owned result');
      const names = new Set(expr.params.map(param => param.name));
      const visit = (body:Expr):void => {
        const resolved = this.resolvedNames.get(body);
        if (body.kind === 'name' && resolved && !resolved.global && !names.has(body.name) && !plan.captures.some(capture => capture.name === body.name)) {
          const local = context.locals.get(body.name);
          if (local && local.definition?.start === resolved.definition.start && local.definition.file === resolved.definition.file) {
            if (local.ownership !== 'managed' || !this.immutableCapture(local.type))
              reject(`Capture ${body.name} as immutable managed data; mutable/owned references and borrowed inputs cannot escape into callbacks`);
            this.checkBorrowEscape(body,context);
            plan.captures.push({name:body.name,expression:body,type:local.type});
          }
        }
        expressionChildren(body).forEach(visit);
      };
      visit(expr.body); plan.params = expr.params; plan.body = expr.body;
    }
    plan.type = {...concrete(expected),nullable:false,optional:false,readonly:true}; plan.inputs = inputs; plan.result = result;
    if (containsUnknown(plan.type) || inputs.some(type => containsUnknown(type) || !this.immutableData(type)) ||
        containsUnknown(result) || result.name !== 'void' && !this.immutableData(result)) {
      reject('A callback needs concrete managed data inputs and result; use explicit type arguments when its result cannot determine them');
      return errorTy;
    }
    this.functionValues.set(expr,plan);
    return plan.type;
  }

  private checkExpression(expr: Expr, context: Context, expected?: Ty): Ty {
    let type = errorTy;
    if(expr.kind==='lambda'){
      type=this.checkFunctionValue(expr,context,expected);
    }else if(expr.kind==='comprehension'){
      const names=new Set(context.locals.keys()),wanted=expected?.id==='builtin:List'?expected.args[0]:undefined;
      let element=errorTy;
      this.checkIteration({iterable:expr.iterable,pattern:expr.pattern,names:bindingNames(expr.pattern),span:expr.span},context,inside=>{
        // The iterable is evaluated before these local names exist. Editor scopes
        // follow evaluation rather than source order: the projection is written first.
        if(expr.condition){
          this.captureScope(expr.condition.span,inside);
          const condition=this.checkExpression(expr.condition,inside);
          if(!this.assignable(condition,builtin('bool')))this.report(expr.condition.span,`Condition must be bool, got ${tyName(condition)}`);
        }
        const selected=this.cloneContext(inside);if(expr.condition)this.narrow(expr.condition,true,selected);
        this.captureScope(expr.projection.span,selected);
        element=this.checkExpression(expr.projection,selected,wanted);
        if(wanted&&!this.assignable(element,wanted))this.report(expr.projection.span,`List item expects ${tyName(wanted)}, got ${tyName(element)}`,'COLLECTION');
        if(element.id==='builtin:void')this.report(expr.projection.span,'List cannot contain void','COLLECTION');
        if(element.kind==='resource'||this.ownershipOf(expr.projection,selected)==='own')this.report(expr.projection.span,'List cannot copy an owned value','OWN');
        if(this.isReference(element))this.checkBorrowEscape(expr.projection,selected,false);
        this.mergeMoved(inside,expr.condition?[this.cloneContext(inside),selected]:[selected]);
      });
      context.flow.forgetLocals(names);
      const input=this.expressionTypes.get(expr.iterable);
      if(input?.nullable||input?.optional)this.report(expr.iterable.span,'Narrow an optional collection before list selection','ITERATION');
      type={...builtin('List'),args:[wanted?{...wanted,readonly:element.readonly,frozen:element.frozen}:element]};
    }else if(expr.kind==='matchValue'){
      const input=this.checkExpression(expr.value,context),names=new Set(context.locals.keys());
      const branches=this.matchBranches(expr.value,input,expr.cases,context,expr.span),types:Ty[]=[];
      for(const {clause,inside} of branches){
        this.captureScope(clause.result.span,inside);
        const actual=this.checkExpression(clause.result,inside,expected);types.push(actual);
        if(actual.id==='builtin:void')this.report(clause.result.span,'A match expression needs a value in every case; this expression returns void','MATCH');
        const resultOrigins=this.placesOf(clause.result,inside);
        const ownedAlias=this.isReference(actual)&&[...inside.locals].some(([name,local])=>local.ownership==='own'&&overlap(resultOrigins,inside.flow.reachable(inside.flow.origins(name))));
        if(actual.kind==='resource'||this.ownershipOf(clause.result,inside)==='own'||ownedAlias)this.report(clause.result.span,'A match expression does not transfer ownership; use a statement match for owned values','OWN');
        inside.flow.forgetLocals(names);for(const name of inside.locals.keys())if(!names.has(name))inside.locals.delete(name);
      }
      type=expected&&expected.kind!=='error'&&types.every(actual=>this.assignable(actual,expected))?expected:this.inferredReturn(types);
      for(const [index,actual] of types.entries())if(actual.kind!=='error'&&!this.assignable(actual,type))this.report(expr.cases[index].result.span,`Match result cases need compatible values, got ${tyName(type)} and ${tyName(actual)}`,'MATCH');
      type={...type,readonly:types.some(actual=>actual.readonly),frozen:types.filter(actual=>actual.kind!=='null').every(actual=>actual.frozen)};
      this.mergeMoved(context,branches.map(branch=>branch.inside));
    }else if (expr.kind === 'recordCopy') {
      const base = this.checkExpression(expr.base, context), node = base.def?.node;
      if (node?.kind !== 'class' || !node.record || base.nullable || base.optional) {
        this.report(expr.span, 'with creates a new non-null record; narrow optional values before updating them', 'RECORD');
        expr.fields.forEach(field => this.checkExpression(field.value, context));
      } else {
        const types = new Map(node.typeParams.map((name, index) => [name, base.args[index] ?? errorTy]));
        const seen = new Set<string>();
        for (const field of expr.fields) {
          const input = node.fields.find(input => (input.label ?? input.name) === field.name);
          if (!input) {this.report(field.span, `${node.name} has no input ${field.name}`, 'RECORD'); this.checkExpression(field.value, context); continue;}
          this.checkMemberVisibility(base.id, base.name, input.name, field.span, context);
          if (seen.has(field.name)) this.report(field.span, `Duplicate replacement ${field.name}`, 'RECORD');
          seen.add(field.name);
          const expected = this.resolveType(input.type, base.def!.file, types), actual = this.checkExpression(field.value, context, expected);
          if (!this.assignable(actual, expected)) this.report(field.value.span, `Replacement ${field.name} expects ${tyName(expected)}, got ${tyName(actual)}`, 'RECORD');
          if (this.ownershipOf(field.value, context) === 'own' || !this.immutableInput(field.value, actual))
            this.report(field.value.span, 'Record replacements are immutable data; freeze mutable aliases first', 'RECORD');
        }
        for (const error of this.effectiveErrors(node, base.def!.file, types)) this.checkAllowedError(error, expr.span, context);
        type = {...base, readonly:true, frozen:true};
      }
    } else if (expr.kind === 'interpolation') {
      for (const part of expr.parts) {
        if ('text' in part) {
          if (part.text.includes('\0') || !part.text.isWellFormed())
            this.report(part.span, 'Strings are valid Unicode without NUL; use an unsafe byte adapter for binary data', 'TEXT');
          continue;
        }
        const item = this.checkExpression(part.value, context);
        if (!['int', 'c_int', 'float', 'bool', 'string', 'null'].includes(item.name))
          this.report(part.span, 'String interpolation accepts scalar values; format structured data explicitly', 'INTERPOLATION');
      }
      type = builtin('string');
    } else if (expr.kind === 'markupText') type = builtin('Html');
    else if (expr.kind === 'markup') {
      if (expr.tag && /^[A-Z]/.test(expr.tag)) {
        const args = expr.attributes.map(attribute => attribute.value), labels = expr.attributes.map(attribute => attribute.name);
        const definition = this.project.scopes.get(context.file)?.get(expr.tag);
        if (definition?.node.kind === 'function' && definition.node.params.some(param => param.name === 'children')) {
          labels.push('children'); args.push({kind:'collection', collection:'List', items:expr.children.map(child => ({kind:'markup', tag:'', attributes:[], children:[child], span:child.span})), span:expr.span});
        } else if (expr.children.length) this.report(expr.span, `${expr.tag} needs a List<Html> children parameter to accept children`, 'HTML');
        const call: Extract<Expr, {kind:'call'}> = {kind:'call', callee:{kind:'name', name:expr.tag, span:expr.span}, args, argLabels:labels, typeArgs:[], span:expr.span};
        this.markupCalls.set(expr, call); type = this.checkExpression(call, context);
        if (type.id !== 'builtin:Html') this.report(expr.span, `Server component ${expr.tag} returns Html`, 'HTML');
      } else {
        if (expr.tag && !htmlTags.has(expr.tag)) this.report(expr.span, `Unknown or executable HTML element ${expr.tag}; use a server component or an endpoint action`, 'HTML');
        if (htmlVoidTags.has(expr.tag) && expr.children.length) this.report(expr.span, `<${expr.tag}> cannot have children`, 'HTML');
        const names = new Set<string>();
        for (const attribute of expr.attributes) {
          if (names.has(attribute.name)) this.report(attribute.span, `Duplicate HTML attribute ${attribute.name}`, 'HTML'); names.add(attribute.name);
          const wanted = htmlAttribute(expr.tag, attribute.name), actual = this.checkExpression(attribute.value, context);
          if (!wanted) this.report(attribute.span, `<${expr.tag}> has no supported attribute ${attribute.name}`, 'HTML');
          else if (actual.name !== wanted && !(wanted === 'string' && actual.name === 'int')) this.report(attribute.value.span, `${attribute.name} expects ${wanted}`, 'HTML');
          if (htmlUrlAttributes.has(attribute.name)) {
            if (attribute.value.kind !== 'literal') this.checkAllowedError(builtin('HttpError'), attribute.span, context);
            else if (typeof attribute.value.value === 'string' && /^\s*(javascript|data|vbscript):/i.test(attribute.value.value)) this.report(attribute.value.span, 'Executable URL schemes are not HTML links', 'HTML');
          }
        }
        for (const child of expr.children) {
          const actual = this.checkExpression(child, context);
          if (!['Html', 'string', 'int', 'float', 'bool', 'null'].includes(actual.name) && !(actual.name === 'List' && actual.args[0]?.name === 'Html')) this.report(child.span, 'HTML children are Html, escaped text, numbers, or List<Html>', 'HTML');
        }
        type = builtin('Html');
      }
    } else if (expr.kind === 'handle') {
      type = this.checkHandle(expr, context);
    } else if (expr.kind === 'formInput') {
      this.report(expr.span, 'input from form belongs inside a handle endpoint(...) action', 'HTTP');
    } else if (expr.kind === 'start') {
      if (expr.worker) this.checkAllowedError(builtin('ConcurrencyError'), expr.span, context);
      if (context.locked) this.report(expr.span, 'Release the lock before starting a task', 'CONCURRENCY');
      if (!context.scope) this.report(expr.span, 'Start a task inside a scope block, which joins every child before leaving', 'CONCURRENCY');
      if (expr.call.kind !== 'call') this.report(expr.call.span, 'start requires a labeled function or method call', 'CONCURRENCY');
      const errors: Ty[] = [];
      const result = this.checkExpression(expr.call, {...context, deferredErrors: errors}, expected?.id === 'builtin:Task' ? expected.args[0] : undefined);
      type = {...builtin('Task'), args: [result]};
      if (expr.call.kind === 'call' && context.scope) {
        const plan = this.callPlans.get(expr.call), task = [...allocationOrigin(expr.span)][0], scope = `tasks:${context.scope.file}:${context.scope.start}`;
        if (plan?.returnOwnership === 'own') this.report(expr.call.span,
          'A task cannot return an owned value. Return immutable data, or create and release the owned resource inside the task.', 'CONCURRENCY');
        context.flow.registerTask(task, scope, errors);
        const captureOrigins = (origins: Origins, actual: Ty, exclusive: boolean, span: Span) => {
          if (expr.worker || !this.isReference(actual)) return;
          const shareable = actual.frozen || actual.name === 'Shared' ||
            actual.def?.node.kind === 'class' && actual.def.node.record ||
            ['Bytes', 'Json', 'Html', 'Headers', 'RsaPublicKey', 'RsaPrivateKey'].includes(actual.name);
          context.flow.captureTask(task, scope, origins, shareable ? false : exclusive, !!context.loopDepth, span,
            (at, message) => this.report(at, message, 'CONCURRENCY'));
        };
        const capture = (argument: Expr, exclusive: boolean) =>
          captureOrigins(this.placesOf(argument, context), this.expressionTypes.get(argument) ?? errorTy, exclusive, argument.span);
        expr.call.args.forEach((argument, index) => capture(argument, ['own', 'borrow'].includes(plan?.ownerships?.[plan.sourceIndices.indexOf(index)] ?? '')));
        if (expr.call.callee.kind === 'member') capture(expr.call.callee.object, !!plan?.mutatesReceiver);
        plan?.bindingKeys.forEach((key, index) => {
          const source = plan.injectionSources?.[index];
          if (!key && !source) return;
          const name = source?.startsWith('self.') ? source.slice(5) : source;
          const actual = name ? context.locals.get(name)?.type : key ? this.bindingByKey.get(key)?.exposedType : undefined;
          const origins = name ? context.flow.origins(name) : key ? this.bindingOrigins(key, context, expr.call.span) : new Set<string>();
          captureOrigins(origins, actual ?? errorTy, false, expr.call.span);
        });
      }
    } else if (expr.kind === 'wait') {
      if (context.locked) this.report(expr.span, 'Release the lock before waiting for a task', 'CONCURRENCY');
      const values = expr.tasks.map(task => this.checkExpression(task, context));
      const errors = expr.tasks.flatMap((task, index) => {
        const value = values[index], tracked = context.flow.taskErrors(this.placesOf(task, context));
        return tracked ?? (value.id === 'builtin:Task' || value.id === 'builtin:List' && value.args[0]?.id === 'builtin:Task' ? [builtin('Error')] : []);
      });
      expr.tasks.forEach((task, index) => context.flow.waitTasks(this.placesOf(task, context), values[index].id === 'builtin:List'));
      for (const error of errors) this.checkAllowedError(error, expr.span, context);
      const result = (value: Ty, index: number): Ty => {
        if (value.id === 'builtin:Task') return value.args[0];
        this.report(expr.tasks[index].span, 'wait for requires a Task or a List<Task<T>>', 'CONCURRENCY'); return errorTy;
      };
      type = values.length === 1 && values[0].id === 'builtin:List' ? {...builtin('List'), args: [result(values[0].args[0], 0)]} :
        values.length === 1 ? result(values[0], 0) : {...builtin('Tuple'), args: values.map(result)};
    } else if (expr.kind === 'literal') {
      if (expr.numericType === 'int' && expr.numericText && (BigInt(expr.numericText) < -(1n << 63n) || BigInt(expr.numericText) >= 1n << 63n))
        this.report(expr.span, 'int literal is outside the signed 64-bit range', 'NUMBER');
      if (typeof expr.value === 'number' && !Number.isFinite(expr.value)) this.report(expr.span, 'Numeric literals must be finite', 'NUMBER');
      if (typeof expr.value === 'string' && (expr.value.includes('\0') || !expr.value.isWellFormed()))
        this.report(expr.span, 'Strings are valid Unicode without NUL; use an unsafe byte adapter for binary data', 'TEXT');
      type = expr.value === null ? nullTy : typeof expr.value === 'string' ? builtin('string') :
        typeof expr.value === 'boolean' ? builtin('bool') :
        builtin(expr.numericType ?? (Number.isInteger(expr.value) ? 'int' : 'float'));
    } else if (expr.kind === 'collection') {
      type = this.checkCollection(expr, context, expected);
    } else if (expr.kind === 'name') {
      const local = context.locals.get(expr.name);
      if (local) {
        if(local.definition)this.resolvedNames.set(expr,{name:expr.name,definition:local.definition,property:local.origin==='field'});
        if (local.moved) this.report(expr.span, `Cannot use moved value ${expr.name}`, 'OWN');
        context.flow.read(expr.name, expr.span, (span, message) => this.report(span, message, 'BORROW'));
        type = local.type;
      } else {
        const def = this.project.scopes.get(context.file)?.get(expr.name);
        if(def)this.resolvedNames.set(expr,{name:def.name,definition:def.node.span,global:def.id});
        if (def?.node.kind === 'class' || def?.node.kind === 'interface')
          type = { id: def.id, name: def.name, kind: def.node.kind, def, args: [], nullable: false };
        else if (def?.node.kind === 'function') type = this.checkFunctionValue(expr,context,expected,def);
        else if (errorNames.includes(expr.name)) type = builtin(expr.name);
        else if (['sourceLocation', 'print', 'arguments', 'List', 'Map', 'Set', 'Tuple', 'assert', 'assertEqual', 'read_file', 'write_file', 'c_int', 'int'].includes(expr.name)) type = builtin('void');
        else if (expr.name === 'next') this.report(expr.span,
          'next is only callable inside an interceptor around body', 'NEXT');
        else if (def?.node.kind === 'interceptor') this.report(expr.span,
          `${expr.name} is an interceptor; apply it with [${expr.name}]`, 'INTERCEPTOR');
        else this.report(expr.span, `Unknown name ${expr.name}`, 'NAME');
      }
    } else if (expr.kind === 'resolve') {
      if (context.callable || context.composition === false) this.report(expr.span,
        'Declare resolve dependencies in the callable header; body lookups belong only in main or test setup', 'DI');
      const key = this.bindingKey(expr.name, expr.typeArgs);
      const binding = this.bindingByKey.get(key);
      if (isPrivateName(expr.name) && context.file !== this.project.main?.path)
        this.report(expr.span, `Binding ${key} is private to main.aug`, 'PRIVATE');
      const definition = this.project.scopes.get(context.file)?.get(expr.name);
      const declared = definition?.node.kind === 'interface' ? this.resolveType({ name: expr.name, args: expr.typeArgs, nullable: false, span: expr.span }, context.file, context.types) : undefined;
      if (!binding) {
        if (declared && context.callable) type = declared;
        else this.report(expr.span, `No binding named ${key}`, 'DI');
      }
      else {
        if (binding.requiresScope && !context.scope) this.report(expr.span, `Resolve ${key} inside a scope block`, 'DI');
        if (declared && !this.assignable(binding.exposedType, declared)) this.report(expr.span,
          `Binding ${key} has incompatible provenance for the imported ${expr.name} contract`, 'DI');
        type = binding.exposedType;
      }
    } else if (expr.kind === 'member') {
      const object = this.checkExpression(expr.object, context);
      type = this.memberType(object, expr.name, expr.span, context);
    } else if (expr.kind === 'unary') {
      const value = this.checkExpression(expr.value, context);
      if (expr.op === '!' && value.id !== 'builtin:bool') this.report(expr.span,
        '! requires bool');
      if (expr.op === '-' && !['builtin:int', 'builtin:c_int', 'builtin:float'].includes(value.id)) this.report(expr.span,
        '- requires a number');
      type = expr.op === '!' ? builtin('bool') : value;
    } else if (expr.kind === 'binary') {
      const left = this.checkExpression(expr.left, context);
      const rightContext = ['&&', '||', 'otherwise'].includes(expr.op) ? this.cloneContext(context) : context;
      if (expr.op === '&&' || expr.op === '||') this.narrow(expr.left, expr.op === '&&', rightContext);
      const right = this.checkExpression(expr.right, rightContext);
      const numeric = ['builtin:int', 'builtin:c_int', 'builtin:float'];
      const bothNumeric = numeric.includes(left.id) && numeric.includes(right.id);
      if (['/', '%'].includes(expr.op) && !(expr.right.kind === 'literal' && typeof expr.right.value === 'number' && expr.right.value !== 0))
        this.checkAllowedError(builtin('ArithmeticError'), expr.span, context);
      if (expr.op === 'otherwise') {
        const present = {...left, nullable: false, optional: false};
        if (left.kind === 'null') type = right;
        else if (this.assignable(right, present)) type = {...present, nullable: !!right.nullable, optional: !!right.optional};
        else if (this.assignable(present, right)) type = right;
        else this.report(expr.span, `otherwise needs compatible values, got ${tyName(left)} and ${tyName(right)}`, 'TYPE');
        if (this.ownershipOf(expr.left, context) === 'own' || this.ownershipOf(expr.right, rightContext) === 'own')
          this.report(expr.span, 'Use an explicit match to choose an owned value; otherwise does not transfer ownership', 'OWN');
        this.mergeMoved(context, [this.cloneContext(context), rightContext]);
      } else if (expr.op === '&&' || expr.op === '||') {
        if (left.id !== 'builtin:bool' || right.id !== 'builtin:bool')
          this.report(expr.span, `${expr.op} requires bool operands`);
        type = builtin('bool');
      } else if (expr.op === '==' || expr.op === '!=') {
        if (!bothNumeric && !this.assignable(left, right) && !this.assignable(right, left))
          this.report(expr.span, `Cannot compare ${tyName(left)} and ${tyName(right)}`);
        type = builtin('bool');
      } else if (['<', '>', '<=', '>='].includes(expr.op)) {
        if (!bothNumeric) this.report(expr.span, `${expr.op} requires numeric operands`);
        type = builtin('bool');
      }
      else if (expr.op === '+' && left.id === 'builtin:string' && right.id === 'builtin:string')
        type = builtin('string');
      else if (expr.op === '%') {
        if (!bothNumeric || left.name === 'float' || right.name === 'float') this.report(expr.span, '% remainder requires integer operands', 'TYPE');
        type = builtin('int');
      }
      else if (bothNumeric)
        type = left.id === 'builtin:float' || right.id === 'builtin:float' ? builtin('float') : builtin('int');
      else this.report(expr.span, `Operator ${expr.op} does not accept ${tyName(left)} and ${tyName(right)}`);
    } else if (expr.kind === 'call') {
      type = this.checkCall(expr, context);
      const plan=this.callPlans.get(expr);
      if(plan)plan.returnOwnership=this.ownershipOf(expr,context)==='own'?'own':'managed';
    }
    if (expr.kind === 'collection' && expected?.immutable) {
      if (!this.immutableData(type) || !this.immutableInput(expr, type))
        this.report(expr.span, 'Freeze aliased mutable values before creating an immutable collection', 'IMMUTABLE');
      type = immutableType(type);
      context.flow.freeze(this.placesOf(expr, context), expr.span, (span, message) => this.report(span, message, 'BORROW'));
    }
    this.expressionTypes.set(expr, type);
    this.expressionOrigins.set(expr, this.placesOf(expr, context));
    return type;
  }

  private memberType(receiver: Ty, name: string, span: Span, context: Context): Ty {
    if (receiver.kind === 'error') return errorTy;
    if (receiver.kind === 'param') {
      const bound = receiver.bounds?.find(type => this.interfaceMethods(type, new Set()).has(name));
      if (bound) return this.memberType(bound, name, span, context);
    }
    if (receiver.nullable) this.report(span, `Cannot access ${name} on nullable ${tyName(receiver)}`);
    if (receiver.optional && !receiver.nullable) this.report(span, `Match null and some before accessing ${name} on ${tyName(receiver)}`);
    const property = receiver.kind === 'builtin' && builtinProperties[receiver.name]?.find(property => property.name === name);
    if (property) {
      for (const error of property.errors ?? []) this.checkAllowedError(builtin(error), span, context);
      return {...operationType(property.type, receiver), readonly: true};
    }
    const def = receiver.def;
    if (def?.node.kind === 'class' || def?.node.kind === 'interceptor') {
      const field = fieldsOf(def.node).find(param => param.name === name);
      if (field) {
        this.checkMemberVisibility(def.id, def.name, name, span, context);
        return { ...this.resolveType(field.type, def.file,
          new Map(def.node.typeParams.map((param, i) => [param, receiver.args[i] ?? errorTy]))), readonly: receiver.readonly || !field.mutable,
          frozen: receiver.frozen || def.node.kind === 'class' && !!def.node.record };
      }
      const method = def.node.methods.find(item => item.name === name) ??
        this.defaults.get(def.id)?.get(name)?.method;
      if (method) {
        this.checkMemberVisibility(def.id, def.name, name, span, context);
        return this.returnType(method, def.file,
          new Map(def.node.typeParams.map((param, i) => [param, receiver.args[i] ?? errorTy])));
      }
    }
    if (def?.node.kind === 'interface') {
      const entry = this.interfaceMethods(receiver, new Set()).get(name)?.[0];
      if (entry) {
        this.checkMemberVisibility(entry.from, def.name, name, span, context);
        return this.returnType(entry.method, entry.file, entry.params);
      }
    }
    this.report(span, receiver.kind==='choice'?`Match the choice ${receiver.name} before reading an alternative's member ${name}`:`${tyName(receiver)} has no member ${name}`,receiver.kind==='choice'?'CHOICE':'TYPE');
    return errorTy;
  }

  private planCall(expr: Extract<Expr, { kind: 'call' }>, params: Param[] | string[],
                   display: string, declaration?: Span): CallPlan {
    const names = params.map(param => typeof param === 'string' ? param : param.label ?? param.name);
    const injected = params.map(param => typeof param !== 'string' && param.injected);
    const accepted = names.filter((_, index) => !injected[index]).join(', ') || '(none)';
    const related = declaration ? [{file:declaration.file,line:declaration.line,column:declaration.column,
      message:`Caller input labels: ${accepted}.`}] : undefined;
    const plan: CallPlan = { defaults: params.map(param => typeof param === 'string' ? undefined : param.defaultValue), sourceIndices: names.map(() => undefined),
      bindingKeys: names.map(() => undefined), ownerships:params.map(param => typeof param === 'string' ? undefined : param.ownership) };
    let invalidLabel = false;
    for (let source = 0; source < expr.args.length; source++) {
      const argument = expr.args[source];
      const label = expr.indexed ? names[0] : expr.argLabels[source] ?? (argument.kind === 'name' ? argument.name : undefined);
      const details = {related,expected:accepted,actual:label ?? '(unlabeled)'};
      if (!label) {
        this.report(argument.span, `${display} arguments require labels`, 'CALL', details);
        invalidLabel = true;
        continue;
      }
      const index = names.indexOf(label);
      if (index < 0) {
        this.report(argument.span, `${display} has no parameter ${label}`, 'CALL', details);
        invalidLabel = true;
      } else if (injected[index]) {
        this.report(argument.span, `${label} is resolved from DI and cannot be passed`, 'CALL', details);
        invalidLabel = true;
      } else if (plan.sourceIndices[index] !== undefined) {
        const first = expr.args[plan.sourceIndices[index]!].span;
        this.report(argument.span, `Duplicate argument ${label}`, 'CALL', {
          related:[{file:first.file,line:first.line,column:first.column,message:`Input ${label} was first passed here.`}]});
        invalidLabel = true;
      } else plan.sourceIndices[index] = source;
    }
    // A malformed label must be repaired before the compiler can judge omitted inputs.
    if (!invalidLabel) for (let index = 0; index < names.length; index++) {
      const param = params[index];
      if (injected[index] || typeof param !== 'string' && (param.type.optional || param.defaultValue) || plan.sourceIndices[index] !== undefined) continue;
      const span = typeof param === 'string' ? undefined : param.labelSpan ?? param.nameSpan ?? param.span;
      // Built-in operations may carry a synthetic parameter at the call location.
      const location = span && !(span.file === expr.span.file && span.start === expr.span.start && span.end === expr.span.end) ?
        [{file:span.file,line:span.line,column:span.column,message:`Required input ${names[index]} is declared here.`}] : undefined;
      this.report(expr.span, `Missing argument ${names[index]} for ${display}`, 'CALL', {related:location});
    }
    if (invalidLabel) plan.invalidLabels = true;
    this.callPlans.set(expr, plan);
    return plan;
  }

  private planInjections(expr: Extract<Expr, { kind: 'call' }>, params: Param[],
                         file: string, types: Map<string, Ty>, plan: CallPlan, context: Context): void {
    params.forEach((param, index) => {
      if (!param.injected) return;
      const type = this.resolveType(param.type, file, types);
      const key = this.bindingKeyForType(type);
      if (context.callable) {
        const candidates: { name: string; type: Ty }[] = [];
        for (const input of context.callable.params.filter(param => param.injected))
          candidates.push({ name: input.name, type: this.resolveType(input.type, context.file, context.types) });
        if (context.owner && 'fields' in context.owner.node) for (const field of context.owner.node.fields.filter(field => field.injected))
          candidates.push({ name: `self.${field.name}`, type: this.resolveType(field.type, context.owner.file, context.types) });
        const matches = candidates.filter(candidate => this.assignable(candidate.type, type));
        if (matches.length !== 1) this.report(expr.span, matches.length ?
          `Ambiguous header dependencies for ${tyName(type)}; pass an ordinary labeled input` :
          `Declare a resolve ${tyName(type)} dependency in ${context.callable.name}'s header`, 'DI');
        plan.injectionSources ??= params.map(() => undefined);
        plan.injectionSources[index] = matches[0]?.name;
        return;
      }
      const binding = this.bindingByKey.get(key);
      if (!binding) this.report(expr.span, `No binding for ${key}, required by ${param.name}`, 'DI');
      else if (binding.requiresScope && !context.scope) this.report(expr.span, `Resolve ${key} inside a scope block`, 'DI');
      else if (!this.assignable(binding.exposedType, type)) this.report(expr.span,
        `Binding ${key} cannot provide ${tyName(type)}`, 'DI');
      plan.bindingKeys[index] = key;
    });
  }

  private bindingKeyForType(type: Ty): string {
    return type.name + (type.args.length ? `<${type.args.map(arg => this.bindingKeyForType(arg)).join(',')}>` : '');
  }

  private argumentExpectations(expr: Extract<Expr, { kind: 'call' }>, context: Context,
                               receiver?: Ty): (Ty | undefined)[] {
    let params: Param[] | undefined;
    let file = context.file;
    let types = new Map(context.types);
    const uninferred = new Set<string>(), templates = new Map<string,Ty>();
    if (expr.indexed && receiver) return [receiver.id === 'builtin:Map' ? receiver.args[0] : builtin('int')];
    if (expr.callee.kind === 'name') {
      const name = expr.callee.name;
      if (['List', 'Set', 'Tuple'].includes(name)) return expr.args.map((_, index) => {
        const ref = expr.typeArgs[name === 'Tuple' ? index : 0];
        return ref ? this.resolveType(ref, context.file, context.types) : undefined;
      });
      const def = this.project.scopes.get(file)?.get(name);
      if (def?.node.kind === 'class' || def?.node.kind === 'function') {
        params = def.node.kind === 'class' ? def.node.fields : def.node.params;
        types = this.paramsFor(def.node.typeParams,def.node,def.file);
        for (const [name,type] of types) templates.set(name,type);
        def.node.typeParams.forEach((name, index) => {
          if (expr.typeArgs[index]) types.set(name, this.resolveType(expr.typeArgs[index], context.file, context.types));
          else { uninferred.add(name); types.delete(name); }
        });
        file = def.file;
      } else if (name === 'next' && context.next) return expr.argLabels.map(label =>
        context.next!.types[context.next!.params.findIndex(param => param.name === label)]);
    } else if (expr.callee.kind === 'member' && receiver) {
      const methodName = expr.callee.name;
      if (['builtin:List', 'builtin:Set', 'builtin:Map'].includes(receiver.id)) return expr.argLabels.map(label =>
        receiver.name === 'List' && label === 'value' || receiver.name === 'Set' && label === 'value' ? receiver.args[0] :
          receiver.name === 'Map' ? receiver.args[label === 'key' ? 0 : 1] : undefined);
      const def = receiver.def;
      if (def && 'methods' in def.node) {
        const entry = def.node.kind === 'interface' ? this.interfaceMethods(receiver, new Set()).get(methodName)?.[0] :
          this.defaults.get(def.id)?.get(methodName);
        const method = def.node.methods.find(method => method.name === methodName) ?? entry?.method;
        if (method) {
          params = method.params;
          file = method.span.file;
          types = entry ? new Map(entry.params) : new Map(def.node.typeParams.map((name, index) => [name, receiver.args[index] ?? errorTy]));
          for (const [name,type] of this.paramsFor(method.typeParams,method,file)) templates.set(name,type);
          method.typeParams.forEach((name, index) => {
            if (expr.typeArgs[index]) types.set(name, this.resolveType(expr.typeArgs[index], context.file, context.types));
            else { uninferred.add(name); types.delete(name); }
          });
        }
      }
    }
    // Infer from known siblings before supplying context to empty literals. This
    // does not evaluate an expression, move a value, or apply its effects.
    for (let index = 0; index < expr.args.length; index++) {
      const label = expr.argLabels[index] ?? (expr.args[index].kind === 'name' ? (expr.args[index] as Extract<Expr, {kind: 'name'}>).name : undefined);
      const param = params?.find(param => (param.label ?? param.name) === label);
      const actual = this.previewType(expr.args[index], context);
      if (param && actual) this.inferCallType(param.type, actual, [...uninferred], types);
    }
    for (const name of [...uninferred]) if (types.has(name)) uninferred.delete(name);
    return expr.argLabels.map((given, index) => {
      const label = given ?? (expr.args[index].kind === 'name' ? (expr.args[index] as Extract<Expr, {kind: 'name'}>).name : undefined);
      const param = params?.find(param => (param.label ?? param.name) === label);
      const needsInference = (ref: TypeRef): boolean => uninferred.has(ref.name) || ref.args.some(needsInference);
      if (param && needsInference(param.type)) {
        const partial = this.resolveType(param.type,file,new Map([...templates,...types]));
        return partial.kind === 'interface' ? partial : undefined;
      }
      return param ? this.resolveType(param.type, file, types) : undefined;
    });
  }

  private previewType(expr: Expr, context: Context): Ty | undefined {
    if (expr.kind === 'name') return context.locals.get(expr.name)?.type ?? this.expressionTypes.get(expr);
    if (expr.kind === 'literal') return expr.value === null ? undefined :
      builtin(typeof expr.value === 'string' ? 'string' : typeof expr.value === 'boolean' ? 'bool' : expr.numericType ?? 'int');
    if (expr.kind === 'collection' && expr.items.length) {
      const items = expr.items.map(item => this.previewType(item, context));
      if (items.some(item => !item)) return undefined;
      const name = expr.collection === 'empty' ? 'Map' : expr.collection;
      const args = name === 'Tuple' ? items as Ty[] : name === 'Map' ? [items[0]!, items[1]!] : [items[0]!];
      return { ...builtin(name), args };
    }
    if (expr.kind === 'call' && expr.callee.kind === 'name') {
      const def = this.project.scopes.get(context.file)?.get(expr.callee.name);
      if (def?.node.kind === 'class' && expr.typeArgs.length === def.node.typeParams.length)
        return { id: def.id, name: def.name, kind: 'class', def, nullable: false,
          args: expr.typeArgs.map(ref => this.resolveType(ref, context.file, context.types)) };
    }
    return this.expressionTypes.get(expr);
  }

  private inferCallType(ref: TypeRef, actual: Ty, names: string[], types: Map<string, Ty>): void {
    inferType(ref, actual, names, types, message => this.report(ref.span, message, 'GENERIC'), (name, value) => {
      const expected = this.project.scopes.get(ref.span.file)?.get(name);
      return expected?.node.kind === 'interface' ? this.interfaceView(value, expected.id) : value;
    });
  }

  private requireMutation(expr: Expr, object: Expr, context: Context, display: string): void {
    if (context.flow.hasTaskCapture(this.placesOf(object, context)))
      this.report(expr.span, `Cannot mutate ${display} while a task uses it; wait for the task first`, 'CONCURRENCY');
    if (this.expressionTypes.get(object)?.readonly) this.report(expr.span,
      `${display} cannot mutate a read-only input or field`, 'MUTABILITY');
    this.requireChange(object, expr.span, context);
    const root = this.rootName(object);
    if ((!root && !['own', 'fresh'].includes(this.ownershipOf(object, context))) || (root && !context.borrowed.has(root) && !context.flow.activeGrant(root) &&
      !['own', 'borrow'].includes(context.locals.get(root)?.ownership ?? 'managed')))
      this.report(expr.span, `${display} requires borrow${root ? ` ${root}` : ' of its receiver'}`, 'BORROW');
  }

  private checkHandle(expr: Extract<Expr, {kind:'handle'}>, context: Context): Ty {
    const call = expr.call;
    const endpoint = call.kind === 'call' && call.callee.kind === 'name' ? this.project.scopes.get(context.file)?.get(call.callee.name) : undefined;
    if (!endpoint || endpoint.node.kind !== 'function' || !endpoint.node.endpoint || call.kind !== 'call') {
      this.report(expr.span, 'handle requires an explicitly imported, named endpoint call', 'HTTP'); return builtin('HttpAction');
    }
    if (call.typeArgs.length) this.report(call.span, 'HTTP actions use concrete endpoint types', 'HTTP');
    const params = endpoint.node.params.filter(param => !param.injected && !['request','cookie'].includes(param.source?.kind ?? ''));
    const sources = new Map<string, number>();
    call.args.forEach((argument, index) => {
      const label = call.argLabels[index] ?? (argument.kind === 'name' ? argument.name : argument.kind === 'formInput' ? params.find(param => ['body','form'].includes(param.source?.kind ?? ''))?.name : undefined);
      if (!label || !params.some(param => param.name === label)) this.report(argument.span, `HTTP action ${endpoint.name} has no input ${label ?? '(unlabeled)'}`, 'HTTP');
      else if (sources.has(label)) this.report(argument.span, `Duplicate HTTP action input ${label}`, 'HTTP');
      else sources.set(label,index);
    });
    const parameters = params.map(param => {
      const type = this.resolveType(param.type, endpoint.file), source = sources.get(param.name), argument = source === undefined ? undefined : call.args[source];
      const form = argument?.kind === 'formInput';
      if (!argument && !type.optional) this.report(call.span, `Missing HTTP action input ${param.name}`, 'HTTP');
      if (form) {
        if (!['body','form'].includes(param.source?.kind ?? '') || type.def?.node.kind !== 'class' || !type.def.node.record)
          this.report(argument.span, 'input from form supplies one typed record body or form input', 'HTTP');
        if (!['POST','PATCH','PUT','DELETE'].includes(endpoint.node.kind === 'function' ? endpoint.node.endpoint!.method : ''))
          this.report(argument.span, 'Form input requires a POST, PATCH, PUT, or DELETE endpoint', 'HTTP');
      } else if (argument) {
        const actual = this.checkExpression(argument, context, type);
        if (!this.assignable(actual,type)) this.report(argument.span, `HTTP action ${param.name} expects ${tyName(type)}, got ${tyName(actual)}`, 'TYPE');
        if (!this.immutableInput(argument, actual)) this.report(argument.span, 'Freeze mutable collection inputs before capturing an HTTP action', 'HTTP');
      }
      return {param,type,source,form};
    });
    this.actions.set(expr,{endpoint,parameters});
    this.checkAllowedError(builtin('HttpError'), expr.span, context);
    return builtin('HttpAction');
  }

  private checkCall(expr: Extract<Expr, { kind: 'call' }>, context: Context): Ty {
    const immediate = context.deferredErrors ? {...context, deferredErrors: undefined} : context;
    let receiverType = expr.callee.kind === 'member' ? this.checkExpression(expr.callee.object, immediate) : undefined;
    if (receiverType?.kind === 'error') return errorTy;
    if (receiverType?.kind === 'param' && expr.callee.kind === 'member') {
      const name = expr.callee.name;
      receiverType = receiverType.bounds?.find(type => this.interfaceMethods(type, new Set()).has(name)) ?? receiverType;
    }
    if (receiverType?.nullable || receiverType?.optional) this.report(expr.callee.span, `Narrow ${tyName(receiverType)} before calling a method`);
    if (expr.indexed && !['builtin:List', 'builtin:Map', 'builtin:Tuple'].includes(receiverType?.id ?? ''))
      this.report(expr.span, 'Indexing reads a List, Map, or Tuple; use an explicit text or byte operation for other values', 'COLLECTION');
    const expectations = this.argumentExpectations(expr, context, receiverType);
    const requiresContext = (arg:Expr):boolean => {
      if (arg.kind === 'lambda' || arg.kind === 'name' && !context.locals.has(arg.name) &&
          this.project.scopes.get(context.file)?.get(arg.name)?.node.kind === 'function') return true;
      if (arg.kind === 'comprehension') return requiresContext(arg.projection);
      return arg.kind === 'collection' && (!arg.items.length || arg.items.some(requiresContext));
    };
    const deferred = new Set(expr.args.flatMap((arg, index) => !expectations[index] && requiresContext(arg) ? [index] : []));
    const argTypes = expr.args.map((arg, index) => deferred.has(index) ? errorTy : this.checkExpression(arg, immediate, expectations[index]));
    const inferredExpectations = this.argumentExpectations(expr, context, receiverType);
    for (const index of deferred) argTypes[index] = this.checkExpression(expr.args[index], immediate, inferredExpectations[index]);
    if (expr.callee.kind === 'name' && expr.callee.name === 'next')
      return this.checkNext(expr, argTypes, context);
    if (expr.callee.kind === 'name' && expr.callee.name === 'sourceLocation') {
      this.planCall(expr,[],'sourceLocation');
      if(expr.args.length||expr.typeArgs.length)this.report(expr.span,'sourceLocation takes no inputs or type arguments','LOCATION');
      return {...builtin('Tuple'),args:[builtin('string'),builtin('int'),builtin('int')],frozen:true,readonly:true};
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'exit') {
      if (context.callable || context.file !== this.project.main?.path || context.locked) this.report(expr.span, 'exit belongs in main outside a lock', 'EFFECT');
      const plan = this.planCall(expr, ['status'], 'exit'), index = plan.sourceIndices[0];
      if (plan.invalidLabels) return errorTy;
      if (index !== undefined && argTypes[index].name !== 'int') this.report(expr.span, 'exit status is an int', 'TYPE');
      return builtin('void');
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'Json') {
      const plan = this.planCall(expr, ['value'], 'Json'), index = plan.sourceIndices[0];
      if (plan.invalidLabels) return errorTy;
      if (expr.typeArgs.length) this.report(expr.span, 'Json infers its data type', 'JSON');
      if (index !== undefined) {
        const value = argTypes[index];
        if (!jsonDataType(this.project, value)) this.report(expr.args[index].span, `${tyName(value)} is not JSON data`, 'JSON');
        if (!this.immutableInput(expr.args[index], value)) this.report(expr.args[index].span, 'Freeze collection values before wrapping them as immutable JSON', 'JSON');
      }
      return {...builtin('Json'), readonly: true, frozen: true};
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'HttpTestClient') {
      this.planCall(expr, [], 'HttpTestClient');
      if (!this.project.testEndpoint || expr.args.length || expr.typeArgs.length) this.report(expr.span, 'HttpTestClient is supplied by test endpoint declarations', 'TEST');
      return {...builtin('HttpTestClient'),readonly:true,frozen:true};
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'Shared') {
      const plan = this.planCall(expr, ['value'], 'Shared'), index = plan.sourceIndices[0];
      if (plan.invalidLabels) return errorTy;
      plan.ownerships = ['own'];
      const result = index === undefined ? errorTy : argTypes[index];
      if (index !== undefined && !['fresh', 'own'].includes(this.ownershipOf(expr.args[index], context))) this.report(expr.args[index].span, 'Shared takes a fresh value or an owned value; existing mutable aliases cannot survive the transfer', 'OWN');
      if (expr.typeArgs.length > 1 || expr.typeArgs[0] && !this.assignable(result, this.resolveType(expr.typeArgs[0], context.file, context.types))) this.report(expr.span, 'Shared type argument must match its value', 'TYPE');
      if (index !== undefined && expr.args[index].kind === 'name') {
        this.moveOwnedLocal((expr.args[index] as Extract<Expr, {kind:'name'}>).name, expr.args[index].span, context);
      }
      return {...builtin('Shared'), args: [result]};
    }
    if(expr.callee.kind==='name'&&expr.callee.name==='ServerEvent') {
      const params:Param[]=['data','id','event','retry'].map((name,index)=>({name,type:{name:index===0?'T':index===3?'int':'string',args:[],nullable:false,optional:index>0,span:expr.span},injected:false,ownership:'managed',span:expr.span}));
      const plan=this.planCall(expr,params,'ServerEvent'), data=plan.sourceIndices[0], result=expr.typeArgs[0]?this.resolveType(expr.typeArgs[0],context.file,context.types):data===undefined?errorTy:argTypes[data];
      if (plan.invalidLabels) return errorTy;
      if(expr.typeArgs.length>1||!jsonDataType(this.project,result))this.report(expr.span,'ServerEvent<T> needs JSON data','HTTP');
      if(data!==undefined&&!this.immutableInput(expr.args[data],argTypes[data]))this.report(expr.args[data].span,'Freeze collection data before creating a ServerEvent','HTTP');
      params.forEach((param,index)=>{const source=plan.sourceIndices[index];if(source!==undefined&&!this.assignable(argTypes[source],index===0?result:{...builtin(param.type.name),optional:true}))this.report(expr.args[source].span,`Invalid ${param.name} for ServerEvent`,'HTTP');});
      this.checkAllowedError(builtin('HttpError'),expr.span,context);return {...builtin('ServerEvent'),args:[result]};
    }
    if (expr.callee.kind === 'name' && ['HttpResponse', 'Headers'].includes(expr.callee.name)) {
      const name = expr.callee.name;
      const params: Param[] = (name === 'Headers' ? [] : ['body', 'status', 'headers']).map((label, index) => ({name: label,
        type: {name: index === 0 ? 'T' : index === 1 ? 'int' : 'Headers', args: [], nullable: false, optional: index > 0, span: expr.span},
        injected: false, ownership: 'managed', span: expr.span}));
      const plan = this.planCall(expr, params, name);
      if (plan.invalidLabels) return errorTy;
      const body = plan.sourceIndices[0];
      const result = name === 'Headers' ? builtin(name) : {...builtin(name), args: [expr.typeArgs[0] ? this.resolveType(expr.typeArgs[0], context.file, context.types) : body === undefined ? errorTy : argTypes[body]]};
      if (name === 'Headers' && expr.typeArgs.length || name === 'HttpResponse' && expr.typeArgs.length > 1) this.report(expr.span, `${name} has invalid type arguments`, 'HTTP');
      params.forEach((param, index) => {const source = plan.sourceIndices[index];
        if (source !== undefined && !this.assignable(argTypes[source], index === 0 ? result.args[0] : builtin(param.type.name))) this.report(expr.args[source].span, `Invalid ${param.name} for ${name}`, 'HTTP');
      });
      if (name === 'HttpResponse' && plan.sourceIndices[1] !== undefined) {
        const status = expr.args[plan.sourceIndices[1]!];
        if (status.kind === 'literal' && typeof status.value === 'number') {
          if (!Number.isInteger(status.value) || status.value < 200 || status.value > 599)
            this.report(status.span, 'HTTP response status must range from 200 to 599', 'HTTP');
        } else this.checkAllowedError(builtin('HttpError'), status.span, context);
      }
      return result;
    }
    if (expr.callee.kind === 'name' && ['c_int', 'int'].includes(expr.callee.name)) {
      const name = expr.callee.name;
      const plan = this.planCall(expr, ['value'], name);
      if (plan.invalidLabels) return errorTy;
      const input = plan.sourceIndices[0];
      const expected = builtin(name === 'c_int' ? 'int' : 'c_int');
      if (expr.typeArgs.length || input !== undefined && !this.assignable(argTypes[input], expected))
        this.report(expr.span, `${name} requires a labeled ${tyName(expected)} value`, 'FFI');
      if (name === 'c_int') this.checkAllowedError(builtin('ConversionError'), expr.span, context);
      return builtin(name);
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'print') {
      this.intrinsicEffect('print', expr.span, context);
      this.planCall(expr, ['value'], 'print');
      return builtin('void');
    }
    if(expr.callee.kind==='name'&&expr.callee.name==='assertEqual') {
      if(!this.project.testMode)this.report(expr.span,'assertEqual belongs inside a test case or its setup','TEST');
      const plan=this.planCall(expr,['actual','expected'],'assertEqual'),actual=plan.sourceIndices[0],expected=plan.sourceIndices[1];
      if (plan.invalidLabels) return errorTy;
      if(expr.typeArgs.length)this.report(expr.span,'assertEqual infers its input types; omit type arguments','TEST');
      if(actual!==undefined&&expected!==undefined) {
        const left=argTypes[actual],right=argTypes[expected],numeric=(type:Ty)=>['builtin:int','builtin:c_int','builtin:float'].includes(type.id);
        if(!(numeric(left)&&numeric(right))&&!this.assignable(left,right)&&!this.assignable(right,left))
          this.report(expr.span,`assertEqual cannot compare actual ${tyName(left)} with expected ${tyName(right)}`,'TEST');
      }
      return builtin('void');
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'assert') {
      if (!this.project.testMode) this.report(expr.span, 'assert belongs inside a test case or its setup', 'TEST');
      if (expr.typeArgs.length || expr.args.length !== 1 ||
        expr.argLabels.some(label => label !== undefined && label !== 'condition'))
        this.report(expr.span, 'Use assert(condition) or assert(condition=condition)', 'TEST');
      if (argTypes[0]?.id !== 'builtin:bool') this.report(expr.span, 'assert requires a bool condition', 'TEST');
      return builtin('void');
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'arguments') {
      this.intrinsicEffect('arguments', expr.span, context);
      this.planCall(expr, [], 'arguments');
      return { ...builtin('List'), args: [builtin('string')] };
    }
    if (expr.callee.kind === 'name' && ['read_file', 'write_file'].includes(expr.callee.name)) {
      this.intrinsicEffect(expr.callee.name as 'read_file' | 'write_file', expr.span, context);
      const names = expr.callee.name === 'read_file' ? ['path'] : ['path', 'content'];
      const plan = this.planCall(expr, names, expr.callee.name);
      if (plan.invalidLabels) return errorTy;
      for (const index of plan.sourceIndices) if (index !== undefined &&
        argTypes[index].id !== 'builtin:string') this.report(expr.args[index].span,
        `${expr.callee.name} requires string arguments`);
      this.checkAllowedError(builtin('FileError'), expr.span, context);
      return builtin(names.length === 1 ? 'string' : 'void');
    }
    if (expr.callee.kind === 'name' && ['List', 'Set', 'Tuple'].includes(expr.callee.name)) {
      const name = expr.callee.name;
      if (expr.argLabels.some(label => label !== undefined)) this.report(expr.span,
        `${name} elements do not use argument labels`);
      if (name === 'Tuple') {
        if (expr.typeArgs.length !== argTypes.length) this.report(expr.span,
          'Tuple constructor type arguments must match its items; prefer a tuple literal', 'COLLECTION');
        argTypes.forEach((actual, index) => {
          const wanted = expectations[index];
          if (wanted && !this.assignable(actual, wanted)) this.report(expr.args[index].span,
            `Expected ${tyName(wanted)}, got ${tyName(actual)}`);
          if (this.ownershipOf(expr.args[index], context) === 'own') this.report(expr.args[index].span,
            'Tuple cannot copy an owned value', 'OWN');
        });
        return { ...builtin(name), args: expectations.map(type => type ?? errorTy) };
      }
      if (expr.typeArgs.length !== 1) this.report(expr.span,
        `${name} constructor requires one type argument, such as ${name}<int>()`);
      const element = expr.typeArgs[0] ? this.resolveType(expr.typeArgs[0], context.file, context.types) : errorTy;
      for (let i = 0; i < argTypes.length; i++) {
        const argument = expr.args[i];
        if (!this.assignable(argTypes[i], element)) this.report(expr.args[i].span,
          `Expected ${tyName(element)}, got ${tyName(argTypes[i])}`);
        if (this.ownershipOf(argument, context) === 'own')
          this.report(argument.span, `${name} cannot copy an owned value`, 'OWN');
      }
      return { ...builtin(name), args: [element] };
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'Map') {
      if (this.planCall(expr, [], 'Map').invalidLabels) return errorTy;
      if (expr.typeArgs.length !== 2) this.report(expr.span,
        'Map constructor requires two type arguments, such as Map<string,int>()');
      if (argTypes.length) this.report(expr.span, 'Map constructor takes no values');
      return { ...builtin('Map'), args: expr.typeArgs.map(arg => this.resolveType(arg, context.file, context.types)) };
    }
    if (expr.callee.kind === 'name' && errorNames.includes(expr.callee.name)) {
      if (this.planCall(expr, [], expr.callee.name).invalidLabels) return errorTy;
      if (argTypes.length || expr.typeArgs.length) this.report(expr.span, `${expr.callee.name} constructor takes no arguments`);
      return builtin(expr.callee.name);
    }
    if (expr.callee.kind === 'member' && receiverType?.id.startsWith('builtin:') && collectionOperations[receiverType.name]) {
      const receiver = receiverType;
      const operation = collectionOperations[receiver.name].find(operation => operation.name === (expr.callee as Extract<Expr, { kind: 'member' }>).name);
      if (!operation) { this.report(expr.callee.span, `${receiver.name} has no method ${expr.callee.name}`); return errorTy; }
      if (receiver.name === 'List' && operation.name === 'join' && (receiver.args[0]?.id !== 'builtin:string' || receiver.args[0]?.nullable || receiver.args[0]?.optional))
        this.report(expr.span, 'join requires List<string>; format other values explicitly', 'COLLECTION');
      const decoding = receiver.name === 'Json' && operation.name === 'decode' || receiver.name === 'HttpRequest' && operation.name === 'form';
      if (expr.typeArgs.length && !decoding) this.report(expr.span, 'Collection methods inherit their receiver type arguments', 'GENERIC');
      const plan = this.planCall(expr, operation.parameters.map(param => ({name:param.label,type:{name:param.type.replace(/^optional /,''),args:[],nullable:false,optional:param.type.startsWith('optional '),span:expr.span},injected:false,ownership:'managed' as const,span:expr.span})), `${receiver.name}.${operation.name}`);
      if (plan.invalidLabels) return errorTy;
      operation.parameters.forEach((param, index) => {
        const source = plan.sourceIndices[index];
        const expected = operationType(param.type, receiver);
        if (source !== undefined && !this.assignable(argTypes[source], expected))
          this.report(expr.args[source].span, `Expected ${tyName(expected)}, got ${tyName(argTypes[source])}`);
      });
      if (operation.changes) {
        this.requireMutation(expr, expr.callee.object, context, `${receiver.name}.${operation.name}`);
        for (const arg of expr.args) {
          if (this.ownershipOf(arg, context) === 'own') this.report(arg.span, `${receiver.name} cannot copy an owned value`, 'OWN');
          this.checkBorrowEscape(arg, context);
        }
      }
      for (const error of operation.errors ?? []) this.checkAllowedError(builtin(error), expr.span, context);
      let position: number | undefined;
      if (operation.returns === 'position') {
        const index = plan.sourceIndices[0];
        const argument = index === undefined ? undefined : expr.args[index];
        if (argument?.kind !== 'literal' || argument.numericType === 'float' || typeof argument.value !== 'number' || !Number.isInteger(argument.value)) {
          this.report(expr.span, 'Tuple.get requires a constant int index so its result type is known', 'COLLECTION'); return errorTy;
        }
        position = argument.value;
        if (position < 0 || position >= receiver.args.length) { this.report(argument.span, 'Tuple index out of range', 'COLLECTION'); return errorTy; }
      }
      const result = decoding ? expr.typeArgs[0] ? this.resolveType(expr.typeArgs[0], context.file, context.types) : errorTy : operationType(operation.returns, receiver, position);
      if (decoding) {
        if (expr.typeArgs.length !== 1) this.report(expr.span, `${receiver.name}.${operation.name} needs one concrete data type`, 'JSON');
        else if (!jsonDataType(this.project, result)) this.report(expr.span, `${tyName(result)} is not JSON data; use a record or data collection`, 'JSON');
        if (result.def?.node.kind === 'class') for (const error of this.effectiveErrors(result.def.node, result.def.file, new Map(result.def.node.typeParams.map((name, index) => [name, result.args[index] ?? errorTy]))))
          this.checkAllowedError(error, expr.span, context);
      }
      return this.isReference(result) ? (result.frozen || decoding || receiver.name === 'Json' || receiver.frozen && ['get', 'at'].includes(operation.name)
        ? immutableType(result) : { ...result, readonly: true }) : result;
    }
    let fn: MethodDecl | undefined;
    let fnFile = context.file;
    let ownerParams = new Map<string, Ty>();
    if (expr.callee.kind === 'name') {
      const def = this.project.scopes.get(context.file)?.get(expr.callee.name);
      if (def?.node.kind === 'class') {
        const cls = def.node;
        this.resolvedCalls.set(expr,{node:cls,params:cls.fields,dispatch:'direct'});
        this.resolvedNames.set(expr.callee,{name:def.name,definition:def.node.span,global:def.id});
        const plan = this.planCall(expr, cls.fields, cls.name, cls.span);
        if (plan.invalidLabels) return errorTy;
        const inferred = new Map<string, Ty>();
        for (let i = 0; i < cls.typeParams.length; i++) {
          if (expr.typeArgs[i]) inferred.set(cls.typeParams[i],
            this.resolveType(expr.typeArgs[i], context.file, context.types));
        }
        if (expr.typeArgs.length && expr.typeArgs.length !== cls.typeParams.length)
          this.report(expr.span, `${cls.name} expects ${cls.typeParams.length} type arguments`);
        for (let i = 0; i < cls.fields.length; i++) {
          const field = cls.fields[i];
          const source = plan.sourceIndices[i];
          if (source !== undefined) this.inferCallType(field.type, argTypes[source],
            cls.typeParams.filter((_, index) => !expr.typeArgs[index]), inferred);
        }
        for (const name of cls.typeParams) if (!inferred.has(name)) {
          this.report(expr.span, `Cannot infer ${cls.name} type argument ${name}; supply explicit type arguments`, 'GENERIC');
          inferred.set(name, errorTy);
        }
        this.checkConstraints(cls, def.file, inferred, expr.span);
        if (cls.record) for (const field of cls.fields)
          if (!this.immutableData(this.resolveType(field.type, def.file, inferred)))
            this.report(expr.span, 'Record construction requires deeply immutable field values', 'RECORD');
        if (cls.record) cls.fields.forEach((field, index) => {
          const source = plan.sourceIndices[index]; if (source === undefined) return;
          const actual = argTypes[source], argument = expr.args[source];
          if (!this.immutableInput(argument, actual))
            this.report(argument.span, 'Freeze a mutable collection before storing it in a record', 'RECORD');
        });
        this.planInjections(expr, cls.fields, def.file, inferred, plan, context);
        context.flow.assertDistinct(expr.args.map((argument, index) => ({ origins: this.placesOf(argument, context), span: argument.span,
          exclusive: cls.fields[plan.sourceIndices.indexOf(index)]?.ownership === 'own' })),
          (span, message) => this.report(span, message, 'BORROW'));
        for (let i = 0; i < cls.fields.length; i++) {
          const source = plan.sourceIndices[i];
          if (source === undefined) continue;
          const expected = this.resolveType(cls.fields[i].type, def.file, inferred);
          if (!this.assignable(argTypes[source], expected)) this.report(expr.args[source].span,
            `Expected ${tyName(expected)}, got ${tyName(argTypes[source])} for input ${cls.fields[i].label ?? cls.fields[i].name}`, 'TYPE', this.inputDetails(cls.fields[i], expected, argTypes[source]));
          if (this.isReference(argTypes[source])) {
            this.checkBorrowEscape(expr.args[source], context, false);
            if (cls.fields[i].mutable && argTypes[source].readonly)
              this.report(expr.args[source].span, 'Read-only references cannot become mutable constructor storage', 'MUTABILITY');
          }
          this.checkArgumentOwnership(expr.args[source], cls.fields[i], context);
        }
        for (const error of this.effectiveErrors(cls, def.file, inferred)) this.checkAllowedError(error, expr.span, context);
        return { id: def.id, name: cls.name, kind: 'class', def,
          args: cls.typeParams.map(name => inferred.get(name) ?? errorTy), nullable: false };
      }
      if(def?.node.kind==='choice'){this.report(expr.callee.span,'A choice has no constructor; construct an alternative record','CHOICE');return errorTy;}
      if (def?.node.kind === 'function') {
        fn = def.node; fnFile = def.file;
        if(fn.endpoint?.streams)this.report(expr.span,'Streaming endpoints are invoked through HTTP; extract an ordinary helper for reusable work','HTTP');
        if (!fn.body && !fn.externC) this.report(expr.callee.span,
          `${fn.name} has no body and cannot be called`, 'CALL');
      }
      if (def?.node.kind === 'interceptor') {
        this.report(expr.callee.span, `${def.name} is an interceptor; apply it with [${def.name}]`, 'INTERCEPTOR');
        return errorTy;
      }
    } else if (expr.callee.kind === 'member') {
      const receiver = receiverType!;
      const methodName = expr.callee.name;
      const def = receiver.def;
      if (def?.node.kind === 'class' || def?.node.kind === 'interceptor') {
        if (def.node.kind === 'interceptor' && methodName === 'around') {
          this.report(expr.callee.span, 'around is invoked through an interceptor annotation', 'INTERCEPTOR');
          return errorTy;
        }
        fn = def.node.methods.find(item => item.name === methodName);
        ownerParams = new Map(def.node.typeParams.map((name, index) => [name, receiver.args[index] ?? errorTy]));
        if (!fn) {
          const defaultMethod = this.defaults.get(def.id)?.get(methodName);
          fn = defaultMethod?.method;
          if (defaultMethod) ownerParams = new Map(defaultMethod.params);
        }
        fnFile = fn?.span.file ?? def.file;
        if (fn) this.checkMemberVisibility(def.id, def.name, methodName,
          expr.callee.span, context);
      } else if (def?.node.kind === 'interface') {
        const entry = this.interfaceMethods(receiver, new Set()).get(methodName)?.[0];
        fn = entry?.method;
        fnFile = entry?.file ?? def.file;
        ownerParams = new Map(entry?.params);
        if (entry) this.checkMemberVisibility(entry.from, def.name, methodName,
          expr.callee.span, context);
      }
      if (!fn) this.report(expr.callee.span,
        `${tyName(receiver)} has no method ${methodName}`);
    }
    if (!fn) {
      if (expr.callee.kind === 'name') {
        const name = expr.callee.name;
        if (!this.project.scopes.get(context.file)?.has(name) && !context.locals.has(name))
          this.report(expr.callee.span, `Unknown name ${name}`, 'NAME');
        else this.report(expr.callee.span, 'Expression is not callable');
      }
      return errorTy;
    }
    this.resolvedCalls.set(expr,{node:fn,params:fn.params,dispatch:receiverType?.kind==='interface'?'interface':'direct'});
    if(expr.callee.kind==='name') {
      const def=this.project.scopes.get(context.file)?.get(expr.callee.name);
      if(def)this.resolvedNames.set(expr.callee,{name:def.name,definition:def.node.span,global:def.id});
    }
    if (fn.externC && !context.unsafe) this.report(expr.span,
      `Call to extern C function ${fn.name} requires unsafe { ... }`, 'FFI');
    if (fn.externC && !fn.nativePure && !this.native.functions.has(fn) && !(fn.valueAbi && fn.uses?.length)) {
      const native = this.project.scopes.get(fnFile)?.get(fn.name);
      this.requireUse(`C:${native?.id ?? fn.name}`, `C.${fn.name}`, expr.span, context);
    }
    const plan = this.planCall(expr, fn.params, fn.name, fn.span);
    if (plan.invalidLabels) return errorTy;
    if (expr.typeArgs.length && expr.typeArgs.length !== fn.typeParams.length)
      this.report(expr.span, `${fn.name} expects ${fn.typeParams.length} type arguments`);
    const params = new Map(ownerParams);
    for (let i = 0; i < fn.typeParams.length; i++) {
      if (expr.typeArgs[i]) params.set(fn.typeParams[i], this.resolveType(expr.typeArgs[i], context.file, context.types));
    }
    for (let i = 0; i < fn.params.length; i++) {
      const source = plan.sourceIndices[i];
      if (source === undefined) continue;
      const param = fn.params[i];
      const argument = expr.args[source];
      this.inferCallType(param.type, argTypes[source], fn.typeParams.filter((_, index) => !expr.typeArgs[index]), params);
      const expected = this.resolveType(param.type, fnFile, params);
      if (!this.assignable(argTypes[source], expected)) this.report(argument.span,
        `Expected ${tyName(expected)}, got ${tyName(argTypes[source])} for input ${param.label ?? param.name}`, 'TYPE', this.inputDetails(param, expected, argTypes[source]));
      this.checkArgumentOwnership(argument, param, context);
      if (fn.typeConstraints?.[param.type.name]?.some(bound => bound.name === 'Data') && !this.immutableInput(argument, argTypes[source]))
        this.report(argument.span, 'Freeze collection values before passing them as immutable Data', 'FREEZE');
    }
    for (const name of fn.typeParams) if (!params.has(name)) {
      this.report(expr.span, `Cannot infer ${fn.name} type argument ${name}; supply explicit type arguments`, 'GENERIC');
      params.set(name, errorTy);
    }
    this.checkConstraints(fn, fnFile, params, expr.span);
    const owner = expr.callee.kind === 'member' ? [...this.project.definitions.values()].find(def =>
      'methods' in def.node && def.node.methods.includes(fn!)) : undefined;
    const contract = this.effectiveContract(fn, fnFile, owner, params);
    plan.mutatesReceiver = contract.changes.some(change => change === 'self' || change.startsWith('self.'));
    for (const [key, effect] of contract.uses) this.requireUse(key,
      `${effect.source}.${effect.operation}`, expr.span, context, effect);
    for (const changed of contract.changes) {
      const root = changed.split('.')[0];
      if (root === 'self' && expr.callee.kind === 'member') this.requireMutation(expr, expr.callee.object, context, `${fn.name} changes self`);
      else {
        const index = fn.params.findIndex(param => param.name === root);
        const source = plan.sourceIndices[index];
        if (source !== undefined) this.requireMutation(expr, expr.args[source], context, `${fn.name} changes ${root}`);
      }
    }
    this.planInjections(expr, fn.params, fnFile, params, plan, context);
    context.flow.assertDistinct([
      ...fn.params.flatMap((param, index) => {
        const source = plan.sourceIndices[index];
        return source === undefined ? [] : [{ origins: this.placesOf(expr.args[source], context),
          exclusive: param.ownership !== 'managed', span: expr.args[source].span }];
      }),
      ...fn.params.flatMap((param, index) => {
        if (!param.injected) return [];
        const source = plan.injectionSources?.[index];
        const key = plan.bindingKeys[index];
        const name = source?.startsWith('self.') ? source.slice(5) : source;
        const origins = name ? context.flow.origins(name) : key ? this.bindingOrigins(key, context, expr.span) : new Set<string>();
        return [{origins, exclusive: false, span: expr.span}];
      }),
      ...(expr.callee.kind === 'member' ? [{ origins: this.placesOf(expr.callee.object, context),
        exclusive: contract.changes.some(path => path === 'self' || path.startsWith('self.')), span: expr.callee.span }] : []),
    ], (span, message) => this.report(span, message, 'BORROW'));
    for (const thrown of this.effectiveErrors(fn, fnFile, params)) this.checkAllowedError(thrown, expr.span, context);
    const result = this.returnType(fn, fnFile, params);
    return this.isReference(result) && fn.returnOwnership !== 'own' && !this.functionIsFresh(fn, fnFile,
      owner && 'fields' in owner.node ? new Set(fieldsOf(owner.node).map(field => field.name)) : new Set()) ?
      { ...result, readonly: true } : result;
  }

  private checkNext(expr: Extract<Expr, { kind: 'call' }>, argTypes: Ty[], context: Context): Ty {
    const next = context.next;
    if (!next) {
      this.report(expr.callee.span, 'next is only available inside an interceptor around body', 'NEXT');
      return errorTy;
    }
    if (expr.typeArgs.length) this.report(expr.span, 'next inherits the target type arguments', 'NEXT');
    const plan: CallPlan = { sourceIndices: next.params.map(() => undefined),
      bindingKeys: next.params.map(() => undefined) };
    const targets = new Set<number>();
    expr.args.forEach((arg, source) => {
      const label = expr.argLabels[source];
      const index = next.params.findIndex(param => param.name === label);
      if (!label) this.report(arg.span, 'next overrides require argument labels', 'NEXT');
      else if (index < 0 || next.params[index].injected) this.report(arg.span,
        `next has no mapped parameter ${label}`, 'NEXT');
      else if (plan.sourceIndices[index] !== undefined) this.report(arg.span,
        `Duplicate next override ${label}`, 'NEXT');
      else {
        const target = next.indices?.[index] ?? index;
        if (targets.has(target)) this.report(arg.span, 'Multiple next overrides map to the same target parameter', 'NEXT');
        targets.add(target);
        plan.sourceIndices[index] = source;
        if (!this.assignable(argTypes[source], next.types[index])) this.report(arg.span,
          `next override ${label} expects ${tyName(next.types[index])}, got ${tyName(argTypes[source])}`, 'INTERCEPTOR');
        const param = next.params[index];
        if (param.ownership === 'own') this.checkArgumentOwnership(arg, param, context);
        else if (arg.kind === 'name' && context.locals.get(arg.name)?.ownership === 'own' && param.ownership !== 'borrow')
          this.report(arg.span, `Cannot copy owned value ${arg.name} to next`, 'OWN');
        if (param.ownership === 'borrow' && arg.kind === 'name' &&
          !context.borrowed.has(arg.name) && !['own', 'borrow'].includes(context.locals.get(arg.name)?.ownership ?? 'managed'))
          this.report(arg.span, `Passing ${arg.name} to next requires borrow`, 'BORROW');
      }
    });
    next.params.forEach((param, index) => {
      if (param.ownership !== 'own') return;
      const local = context.locals.get(param.name);
      if (plan.sourceIndices[index] === undefined && local?.moved)
        this.report(expr.span, `next cannot forward moved parameter ${param.name}`, 'OWN');
      if (local) this.moveOwnedLocal(param.name, expr.span, context);
    });
    this.callPlans.set(expr, plan);
    return next.returns;
  }

  private checkArgumentOwnership(argument: Expr, param: Param, context: Context): void {
    if (param.ownership === 'own') {
      if (argument.kind === 'name') {
        const local = context.locals.get(argument.name);
        if (local?.ownership === 'own') {
          if (local.moved) this.report(argument.span, `Cannot move ${argument.name} twice`, 'OWN');
          this.moveOwnedLocal(argument.name, argument.span, context);
        }
        else this.report(argument.span, 'Owned field requires an owned argument', 'OWN');
      } else if (!['own', 'fresh'].includes(this.ownershipOf(argument, context))) this.report(argument.span,
        'Owned field requires a new object or owned argument', 'OWN');
    } else if (this.ownershipOf(argument, context) === 'own' && param.ownership !== 'borrow' && this.expressionTypes.get(argument)?.kind!=='resource')
      this.report(argument.span, 'Cannot copy an owned value into managed storage', 'OWN');
    if (param.ownership === 'borrow') {
      if (context.flow.hasTaskCapture(this.placesOf(argument, context)))
        this.report(argument.span, 'Cannot pass mutable access while a task uses the value; wait for the task first', 'CONCURRENCY');
      if (this.expressionTypes.get(argument)?.readonly) this.report(argument.span, 'Cannot borrow a read-only argument', 'BORROW');
      const name = sourceName(argument);
      if (name && !context.flow.activeGrant(name) && !['own', 'borrow'].includes(context.locals.get(name)?.ownership ?? 'managed'))
        this.report(argument.span, `Passing ${name} to borrow parameter requires borrow`, 'BORROW');
      if (!name && !['own', 'fresh'].includes(this.ownershipOf(argument, context)))
        this.report(argument.span, 'A borrow argument needs mutable access to its origin', 'BORROW');
    }
  }

  private checkBorrowEscape(expr: Expr, context: Context, scoped = true): void {
    context.flow.escape(this.placesOf(expr, context), expr.span, (span, message) => this.report(span, message, 'BORROW'), scoped);
  }

  private moveOwnedLocal(name: string, span: Span, context: Context): void {
    const local = context.locals.get(name);
    if (local?.ownership !== 'own') return;
    context.flow.assertMove(name, span, (at, message) => this.report(at, message, 'BORROW'));
    local.moved = true; local.moveSites=[span];
  }

  private bindingKey(name: string, args: TypeRef[]): string {
    return name + (args.length ? `<${args.map(typeName).join(',')}>` : '');
  }
}
