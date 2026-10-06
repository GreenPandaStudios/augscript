import {lowerWorkerMaps,workerMapTemplate} from './worker-mapping.ts';
import type {ErrorMatch} from './error-matches.ts';
import type { BindingPattern, RecordBindingField, ClassDecl, Expr, InterceptorDecl, MatchPattern, MethodDecl, Param, Stmt } from './ast.ts';
import { fieldsOf, initializationOf, isStatement, typeName } from './ast.ts';
import type { BindingInfo, CheckedProject, InterceptorLayer } from './checker.ts';
import {sourceFileIdentity} from './source-location.ts';
import type { Definition } from './project.ts';
import { builtinProperties, collectionOperations, errorNames } from './builtins.ts';
import { interceptorChain, InterceptorInvocation } from './interceptors.ts';
import { NativeSchemas, schemaType } from './schemas.ts';
import type {FunctionValuePlan} from './function-values.ts';
import type { Ty } from './types.ts';
import {resolve} from 'node:path';
import {generateOpenApi, apiExplorer, apiExplorerScript} from './openapi.ts';
import {actionSchema, actionTransport} from './actions.ts';
import {httpPolicyNativeName} from './http-policies.ts';

function cString(value: string): string {
  return '"' + [...value].map(char => char === '"' ? '\\"' : char === '\\' ? '\\\\' :
    char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127 ? '\\' + char.charCodeAt(0).toString(8).padStart(3, '0') : char).join('') + '"';
}

export function generateC(checked: CheckedProject, options: { coverage?: boolean } = {}): string {
  return new CGenerator(lowerWorkerMaps(checked), options).generate();
}

class CGenerator {
  errorCondition(type: import('./ast.ts').TypeRef):string {
    const plan=this.checked.errorMatches.get(type);if(!plan)throw new Error('Missing checked error match');
    const valueTest=(match:ErrorMatch,value:string):string=>match.id==='Error'?'1':
      `(${value}.tag == AUG_OBJECT && ${value}.as.object && !strcmp(${value}.as.object->type_name, ${cString(match.id)})${match.fields.map(field=>' && '+valueTest(field.match,`aug_field(${value}, ${field.index})`)).join('')})`;
    return `aug_error_is(${cString(plan.id)})${plan.fields.map(field=>' && '+valueTest(field.match,`aug_field(aug_error, ${field.index})`)).join('')}`;
  }
  private readonly checked: CheckedProject;
  private readonly names = new Map<string, string>();
  private readonly bindings = new Map<string, number>();
  private readonly classByName = new Map<string, Definition>();
  private readonly functions: string[] = [];
  private readonly constructors: string[] = [];
  private readonly tables: string[] = [];
  private readonly prototypes: string[] = [];
  private readonly externs: string[] = [];
  taskThunk(emitter: BodyEmitter, count: number): string {
    const name = `aug_task_entry_${this.sequence++}`;
    this.prototypes.push(`static AugValue ${name}(AugValue self, AugValue *args, int count);`);
    this.functions.push(emitter.finish(name, true, count)); return name;
  }
  functionValue(expr:Expr) {return this.checked.functionValues.get(expr);}
  callbackTable(expr:Expr,plan:FunctionValuePlan):{table:string;mask:string;names:string;type:string} {
    const name='aug_callback_'+this.sequence++,table=name+'_methods',mask=name+'_owned',names=name+'_fields';
    this.prototypes.push(`static AugValue ${name}(AugValue self, AugValue *args, int count);`);
    if(plan.target){
      const args=plan.order.map(index=>`args[${index}]`).join(', ');
      this.functions.push(`static AugValue ${name}(AugValue self, AugValue *args, int count) { (void)self; (void)args; AugValue ordered[] = {${args||'aug_scalar_null()'}}; return ${this.name(plan.target)}(ordered, count); }`);
    }else{
      const body=new BodyEmitter(this,expr.span.file);body.addParameter('self',0);
      plan.params.forEach((param,index)=>body.addParameter(param.name,index));
      plan.captures.forEach((capture,index)=>body.addCapture(capture.name,index));
      body.emitStatement({kind:'return',value:plan.body!,span:plan.body!.span});
      this.functions.push(body.finish(name,true,plan.params.length));
    }
    this.tables.push(`static const AugMethodEntry ${table}[] = {{${cString(plan.signature.method.name)}, ${name}, NULL}};`);
    this.tables.push(`static const unsigned char ${mask}[] = {${plan.captures.map(()=>0).join(', ')||'0'}};`);
    this.tables.push(`static const char *const ${names}[] = {${plan.captures.map(capture=>cString(capture.name)).join(', ')||'NULL'}};`);
    return {table,mask,names,type:'compiler:callback:'+expr.span.file+':'+expr.span.start};
  }
  markupCall(expr: Expr) {return this.checked.markupCalls.get(expr);}
  actionPlan(expr: Expr) {return this.checked.actions.get(expr);}
  actionSchema(type: Ty) {return actionSchema(this.checked.project,type);}
  private sequence = 0;
  private readonly options: { coverage?: boolean };
  private readonly coverage = new Map<string, { file: string; line: number }>();
  private readonly activeFiles = new Set<string>();
  private readonly schemas: NativeSchemas;
  constructor(checked: CheckedProject, options: { coverage?: boolean }) {
    this.checked = checked;
    this.options = options;
    this.schemas = new NativeSchemas(checked.project, def => this.constructorName(def));
    const activate = (file: string) => {
      if (this.activeFiles.has(file)) return;
      this.activeFiles.add(file);
      for (const item of checked.project.files.get(file)?.items ?? []) if (item.kind === 'import')
        for (const def of checked.project.imports.get(item) ?? []) activate(def.file);
    };
    for (const file of checked.project.files.values()) if (!file.builtin) activate(file.path);
    for (const def of checked.project.definitions.values()) {
      this.names.set(def.id, `aug_${this.sequence++}_${def.name}`);
      if (def.node.kind === 'class') this.classByName.set(def.name, def);
    }
    checked.bindings.forEach((binding, index) => this.bindings.set(binding.key, index));
  }

  private name(def: Definition): string { return this.names.get(def.id)!; }
  private constructorName(def: Definition): string { return `aug_construct_${this.name(def)}`; }
  private initializerName(def: Definition): string { return `aug_initialize_${this.name(def)}`; }
  private methodName(def: Definition, method: string): string { return `${this.name(def)}_${method}`; }

  private bodyName(node: MethodDecl | ClassDecl, name: string): string {
    return interceptorChain(name, this.checked.interceptorPlans.get(node) ?? []).body;
  }

  private declareCallable(node: MethodDecl | ClassDecl, name: string, method: boolean): void {
    const signature = `${method ? 'AugValue self, ' : ''}AugValue *args, int count`;
    this.prototypes.push(`static AugValue ${name}(${signature});`);
    const chain = interceptorChain(name, this.checked.interceptorPlans.get(node) ?? []);
    if (chain.entries.length) {
      this.prototypes.push(`static AugValue ${chain.body}(${signature});`);
      for (const entry of chain.entries.slice(1))
        this.prototypes.push(`static AugValue ${entry.name}(${signature});`);
    }
  }

  generate(): string {
    for (const def of this.checked.project.definitions.values()) {
      if (!this.activeFiles.has(def.file) || workerMapTemplate(this.checked.project,def)) continue;
      if (def.node.kind === 'class' || def.node.kind === 'interceptor') {
        for (const method of def.node.methods) {
          if (def.node.kind === 'interceptor' && method.name === 'around') continue;
          this.declareCallable(method, this.methodName(def, method.name), true);
        }
        for (const entry of this.checked.defaults.get(def.id)?.values() ?? []) {
          const method = entry.method;
          if (!def.node.methods.some(item => item.name === method.name))
            this.declareCallable(method, this.methodName(def, method.name), true);
        }
        if (def.node.kind === 'class') this.declareCallable(def.node, this.constructorName(def), false);
        else this.prototypes.push(`static AugValue ${this.constructorName(def)}(AugValue *args, int count);`);
        if (def.node.kind === 'class' && initializationOf(def.node).length) this.prototypes.push(
          `static AugValue ${this.initializerName(def)}(AugValue self, AugValue *args, int count);`);
      } else if (def.node.kind === 'function') {
        if (def.node.endpoint) this.prototypes.push(`static AugValue ${this.name(def)}_http(AugValue *incoming, int count);`);
        if (def.node.externC) this.externs.push(this.externPrototype(def.node));
        if (!def.node.externC || this.checked.interceptorPlans.get(def.node)?.length)
          this.declareCallable(def.node, this.name(def), false);
      }
    }
    for (const def of this.checked.project.definitions.values()) {
      if (!this.activeFiles.has(def.file) || workerMapTemplate(this.checked.project,def)) continue;
      if (def.node.kind === 'class' || def.node.kind === 'interceptor') this.emitClass(def);
      else if (def.node.kind === 'function') {
        if (def.node.body) this.functions.push(this.emitFunction(def.node, def.file, def));
        else if (def.node.externC && this.checked.interceptorPlans.get(def.node)?.length) {
          const emitter = new BodyEmitter(this, def.file, def);
          def.node.params.forEach((param, index) => emitter.addParameter(param.name, index));
          emitter.emitNativeReturn(def);
          this.functions.push(emitter.finish(this.bodyName(def.node, this.name(def)), false, def.node.params.length));
        }
        this.emitInterceptors(def.node, this.name(def), def.node.params, false);
        if (def.node.endpoint) this.emitEndpoint(def);
      }
    }
    const mainBody = this.emitMainBody();
    const bindingCount = this.checked.bindings.length;
    const bindingArray = `static AugValue aug_bindings[${Math.max(1, bindingCount)}];`;
    const initializeBindings = this.checked.bindings.filter(binding => binding.lifetime === 'shared').map(binding =>
      `  aug_resolve_${this.bindingIndex(binding.key)}(); if (aug_has_error) { aug_report_error(); aug_shutdown(); return 1; }`).join('\n');
    return [
      '#include "aug_runtime.h"',
      '#include <stdio.h>',
      '#include <stdbool.h>',
      '#include <string.h>',
      '#include <stdlib.h>',
      '',
      ...new Set(this.externs),
      bindingArray,
      `static const unsigned char aug_scoped[${Math.max(1, bindingCount)}] = { ${this.checked.bindings.map(binding => binding.lifetime === 'scoped' ? '1' : '0').join(', ') || '0'} };`,
      ...this.checked.bindings.map(binding => `static AugValue aug_resolve_${this.bindingIndex(binding.key)}(void);`),
      ...this.prototypes,
      this.schemas.declarations(),
      '',
      ...this.tables,
      ...this.constructors,
      ...this.functions,
      ...this.checked.bindings.map(binding => this.emitBinding(binding)),
      mainBody,
      `int main(int argc, char **argv) {`,
      `  aug_register_globals(aug_bindings, ${bindingCount});`,
      `  aug_set_cli_args(argc, argv);`,
      ...([...this.activeFiles].some(file => this.checked.project.files.get(file)?.items.some(item => item.kind === 'function' && !!item.endpoint) ||
        this.checked.project.files.get(file)?.items.some(item => item.kind === 'function' && item.externC && item.name.startsWith('_aug_http_'))) ? [this.httpConfiguration()] : []),
      ...[...this.coverage.values()].map(point => `  aug_coverage_register(${cString(point.file)}, ${point.line});`),
      initializeBindings,
      `  AugValue result = aug_main_body(NULL, 0);`,
      `  (void)result;`,
      `  if (aug_has_error) { aug_report_error(); aug_shutdown(); return 1; }`,
      `  int status = aug_test_failed ? 1 : 0;`,
      ...(this.checked.project.testMode ? [
        `  if (aug_test_assertions == 0) { fprintf(stderr, "Test executed no assertions\\n"); status = 1; }`,
      ] : []),
      `  aug_shutdown();`,
      `  return status;`,
      `}`,
      '',
    ].join('\n');
  }

  private externPrototype(method: MethodDecl): string {
    if (method.valueAbi) return `extern AugValue ${method.name}(${method.params.length ? method.params.map(() => 'AugValue').join(', ') : 'void'});`;
    const toC = (name: string) => name === 'string' ? 'const char *' :
      name === 'int' ? 'int64_t' : name === 'c_int' ? 'int' : name === 'float' ? 'double' : name === 'bool' ? 'bool' : 'void';
    return `#line ${method.span.line} ${cString(method.span.file)}\nextern ${toC(method.returns.name)} ${method.name}(${method.params.length ?
      method.params.map(param => toC(param.type.name)).join(', ') : 'void'});`;
  }

  private emitClass(def: Definition): void {
    const cls = def.node as ClassDecl | InterceptorDecl;
    const methods = cls.methods.filter(method => cls.kind !== 'interceptor' || method.name !== 'around');
    for (const entry of this.checked.defaults.get(def.id)?.values() ?? []) {
      const method = entry.method;
      if (!methods.some(own => own.name === method.name)) methods.push(method);
    }
    const tableName = `${this.name(def)}_methods`;
    const ownTableName = `${this.name(def)}_owned_fields`;
    this.tables.push(`static const AugMethodEntry ${tableName}[] = {`);
    for (const method of methods) this.tables.push(
      `  {${cString(method.name)}, ${this.methodName(def, method.name)}},`);
    this.tables.push('};');
    this.tables.push(`static const char *const ${this.name(def)}_field_names[] = {${fieldsOf(cls).map(field => cString(field.name)).join(', ') || 'NULL'}};`);
    this.tables.push(`static const unsigned char ${ownTableName}[] = { ${fieldsOf(cls).map(field =>
      field.ownership === 'own' ? '1' : '0').join(', ') || '0'} };`);
    this.constructors.push([
      `static AugValue ${cls.kind === 'class' ? this.bodyName(cls, this.constructorName(def)) : this.constructorName(def)}(AugValue *args, int count) {`,
      `  if (count != ${cls.fields.length}) { fprintf(stderr, "${cls.name} constructor argument mismatch\\n"); return aug_scalar_null(); }`,
      `  AugValue roots[${cls.fields.length + 1}] = {0};`,
      `  AugFrame frame; aug_frame_enter(&frame, roots, ${cls.fields.length + 1});`,
      ...cls.fields.map((_, index) => `  roots[${index}] = args[${index}];`),
      `  roots[${cls.fields.length}] = aug_new_object(${cString(def.id)}, ${fieldsOf(cls).length}, ${ownTableName}, ${tableName}, ${methods.length});`,
      ...cls.fields.map((_, index) => `  aug_set_field(roots[${cls.fields.length}], ${index}, roots[${index}]);`),
      ...(cls.kind === 'class' && cls.record ? [`  roots[${cls.fields.length}].as.object->kind = AUG_RECORD_KIND;`] : []),
      `  AugValue value = roots[${cls.fields.length}];`,
      `  value.as.object->field_names = ${this.name(def)}_field_names;`,
      ...(cls.kind === 'class' && initializationOf(cls).length ? [`  ${this.initializerName(def)}(value, NULL, 0);`] : []),
      `  if (aug_has_error) { aug_drop_partial(value); value = aug_scalar_null(); }`,
      ...(cls.kind === 'class' && cls.record ? ['  if (!aug_has_error) aug_freeze(value);'] : []),
      `  aug_frame_leave(&frame);`,
      `  return value;`,
      `}`,
    ].join('\n'));
    if (cls.kind === 'class' && initializationOf(cls).length) {
      const initializer = new BodyEmitter(this, def.file, def, cls);
      initializer.addParameter('self', 0);
      for (const statement of initializationOf(cls)) initializer.emitStatement(statement);
      this.functions.push(initializer.finish(this.initializerName(def), true, 0));
    }
    for (const method of methods) {
      this.functions.push(this.emitFunction(method, method.span.file, def, cls));
      this.emitInterceptors(method, this.methodName(def, method.name), method.params, true);
    }
    if (cls.kind === 'class') this.emitInterceptors(cls, this.constructorName(def), cls.fields, false);
  }

  private emitInterceptors(node: MethodDecl | ClassDecl, name: string, params: Param[], method: boolean): void {
    for (const { layer, name: entry, next } of interceptorChain(name, this.checked.interceptorPlans.get(node) ?? []).entries) {
      const owner = layer.definition.node as InterceptorDecl;
      const emitter = new BodyEmitter(this, layer.definition.file, layer.definition, owner);
      emitter.initializeInterceptor(layer, params, next, method);
      for (const stmt of layer.around.body ?? []) emitter.emitStatement(stmt);
      this.functions.push(emitter.finish(entry, method, params.length));
    }
  }

  private emitBinding(binding: BindingInfo): string {
    const index = this.bindings.get(binding.key)!;
    const count = binding.constructorKeys.length;
    return [
      `static AugValue aug_resolve_${index}(void) {`,
      ...(binding.lifetime !== 'fresh' ? [`  if (aug_binding_get(${index}).tag != AUG_NULL) return aug_binding_get(${index});`] : []),
      `  AugValue roots[${count + 1}] = {0}; AugFrame frame; aug_frame_enter(&frame, roots, ${count + 1});`,
      ...binding.constructorKeys.flatMap((key, input) => [`  roots[${input}] = aug_resolve_${this.bindings.get(key)!}();`,
        `  if (aug_has_error) goto done;`]),
      `  roots[${count}] = ${this.constructorName(binding.target)}(roots, ${count});`,
      ...(binding.lifetime !== 'fresh' ? [`  if (!aug_has_error) aug_binding_set(${index}, roots[${count}]);`] : []),
      `done:; AugValue result = roots[${count}]; aug_frame_leave(&frame); return result;`,
      `}`,
    ].join('\n');
  }

  private emitEndpoint(def: Definition): void {
    const fn = def.node as MethodDecl, endpoint = fn.endpoint!, count = fn.params.length;
    const policies=this.checked.httpPolicies.get(fn)??[];
    const policyTable=`${this.name(def)}_policies`;
    this.tables.push(`static const AugHttpPolicy ${policyTable}[] = {`);
    for(const policy of policies) {
      const option=policy.options;
      this.tables.push(`  {${httpPolicyNativeName(policy.name)}, ${cString(String(option.permission??''))}, ${Number(option.requests??option.milliseconds??0)}, ${Number(option.seconds??0)}, ${option.credentials?'true':'false'}, ${cString((option.origins as string[]??[]).join('\n'))}, ${cString((option.headers as string[]??[]).map(header=>header.toLowerCase()).join(', '))}},`);
    }
    if(!policies.length)this.tables.push('  {0},');this.tables.push('};');
    const statements = fn.params.map((param, index) => {
      if (param.injected) {
        const type = schemaType(this.checked.project, param.type, def.file);
        const key = type.name + (type.args.length ? `<${type.args.map(arg => arg.name).join(',')}>` : '');
        return `  roots[${index}] = aug_resolve_${this.bindingIndex(key)}(); if (aug_has_error) goto failed;`;
      }
      const schema = param.source?.kind === 'request' ? 'NULL' : '&' + this.schema(schemaType(this.checked.project, param.type, def.file));
      return `  roots[${index}] = aug_http_bind(roots[${count + 1}], ${cString(param.source!.kind)}, ${cString(param.source!.name ?? param.name)}, ${schema}); if (aug_has_error) goto failed;`;
    });
    this.functions.push([
      `static AugValue ${this.name(def)}_http(AugValue *incoming, int count) {`,
      `  (void)count; AugValue roots[${count + 2}] = {0}; AugFrame frame; aug_frame_enter(&frame, roots, ${count + 2});`,
      `  roots[${count + 1}] = incoming[0]; size_t scope_depth = aug_scope_depth(); aug_scope_enter(aug_scoped);`,
      ...statements.filter((_,index)=>fn.params[index].injected),
      ...policies.map((policy,index)=>`  aug_http_policy(&${policyTable}[${index}], roots[${count+1}], ${policy.dependencies[0]===undefined?'aug_scalar_null()':`roots[${policy.dependencies[0]}]`}, ${policy.dependencies[1]===undefined?'aug_scalar_null()':`roots[${policy.dependencies[1]}]`}); if (aug_has_error) goto failed;`),
      ...statements.filter((_,index)=>!fn.params[index].injected),
      `  roots[${count}] = ${this.name(def)}(roots, ${count}); if (aug_has_error) goto failed;`,
      `  roots[${count}] = aug_http_response(roots[${count}], ${endpoint.status}); goto finished;`,
      'failed:',
      `  { int status = aug_http_error_status();`,
      ...endpoint.errors.map(error => `    if (aug_error_is(${cString(this.definition(def.file,error.type.name)?.id??error.type.name)})) status = ${error.status};`),
      '    if (status == 500) aug_report_error(); aug_take_error();',
      `    roots[${count}] = aug_http_problem(status); }`,
      'finished:',
      `  roots[${count}] = aug_http_finish(roots[${count}]);`,
      '  aug_scope_restore(scope_depth);',
      `  AugValue result = roots[${count}]; aug_frame_leave(&frame); return result;`,
      '}',
    ].join('\n'));
  }

  serveRoutes(file: string, names: string[]): string {
    const name = `aug_routes_${this.tables.length}`;
    const config = this.checked.project.config.openapi;
    if (config.enabled) {
      const assets = [JSON.stringify(generateOpenApi(this.checked).document),apiExplorer(config.path,config.docs + '/client.js'),apiExplorerScript];
      ['application/json','text/html; charset=utf-8','application/javascript; charset=utf-8'].forEach((type,index) => {
        const fn = `${name}_docs_${index}`;
        this.tables.push(`static AugValue ${fn}(AugValue *args, int count) { (void)args; (void)count; AugValue roots[3] = {0}; AugFrame frame; aug_frame_enter(&frame, roots, 3);` +
          ` roots[0] = aug_bytes(${cString(assets[index])}, ${Buffer.byteLength(assets[index])}, AUG_BYTES_KIND); roots[1] = aug_headers_new(); roots[2] = aug_string(${cString(type)});` +
          ` roots[1] = aug_headers_with(roots[1], aug_string("content-type"), roots[2]); roots[0] = aug_http_response_full(roots[0], aug_int(200), roots[1]); AugValue result = roots[0]; aug_frame_leave(&frame); return result; }`);
      });
    }
    if (this.checked.actions.size) this.tables.push(`static AugValue ${name}_actions(AugValue *args, int count) { (void)args; (void)count; AugValue roots[2] = {0}; AugFrame frame; aug_frame_enter(&frame, roots, 2); roots[0] = aug_bytes(${cString(actionTransport)}, ${Buffer.byteLength(actionTransport)}, AUG_BYTES_KIND); roots[1] = aug_headers_new(); roots[1] = aug_headers_with(roots[1], aug_string("content-type"), aug_string("application/javascript; charset=utf-8")); roots[0] = aug_http_response_full(roots[0], aug_int(200), roots[1]); AugValue result = roots[0]; aug_frame_leave(&frame); return result; }`);
    this.tables.push(`static const AugRoute ${name}[] = {`);
    for (const symbol of names) {
      const def = this.definition(file, symbol)!;
      const endpoint = (def.node as MethodDecl).endpoint!;
      const item=(def.node as MethodDecl).returns.name;
      this.tables.push(`  {${cString(endpoint.method)}, ${cString(endpoint.path)}, ${this.name(def)}_http, ${endpoint.streams ? item === 'ServerEvent' ? 1 : item === 'Bytes' ? 2 : 3 : 0}, ${endpoint.status}, ${this.name(def)}_policies, ${(this.checked.httpPolicies.get(def.node as MethodDecl)??[]).length}},`);
    }
    if (config.enabled) [config.path,config.docs,config.docs + '/client.js'].forEach((path,index) => this.tables.push(`  {"GET", ${cString(path)}, ${name}_docs_${index}},`));
    if (this.checked.actions.size) this.tables.push(`  {"GET", "/__aug/actions.js", ${name}_actions},`);
    this.tables.push('};'); return name;
  }

  serveRouteCount(count: number): number {return count + (this.checked.project.config.openapi.enabled ? 3 : 0) + (this.checked.actions.size ? 1 : 0);}
  testEndpoint() {return this.checked.project.testEndpoint!;}
  private httpConfiguration(): string {
    const config = this.checked.project.config.web, root = this.checked.project.root;
    const path = (value: string) => cString(value ? resolve(root,value) : '');
    return `  aug_http_configure(${cString(config.host)}, ${path(config.tls.certificate)}, ${path(config.tls.private_key)}, ${path(config.tls.ca)}, ${config.body_limit}, ${config.response_limit}, ${config.http3 ? 'true' : 'false'}, ${config.headers_timeout}, ${config.request_timeout}, ${config.drain_timeout}, ${config.max_requests});`;
  }

  private emitMainBody(): string {
    const emitter = new BodyEmitter(this, this.checked.project.main?.path ?? '', undefined, undefined);
    const items = this.checked.project.main?.items ?? [];
    for (let index = 0; index <= items.length; index++) {
      if (this.checked.project.testBodyStart === index) emitter.beginTestCase();
      const item = items[index];
      if (item && isStatement(item))
        emitter.emitStatement(item as Stmt);
    }
    return emitter.finish('aug_main_body', false, 0);
  }

  private emitFunction(method: MethodDecl, file: string, def: Definition,
                       owner?: ClassDecl | InterceptorDecl): string {
    const emitter = new BodyEmitter(this, file, def, owner);
    if (owner) emitter.addParameter('self', 0);
    method.params.forEach((param, index) => emitter.addParameter(param.name, index, param.ownership === 'own'));
    for (const stmt of method.body ?? []) emitter.emitStatement(stmt);
    return emitter.finish(this.bodyName(method, owner ? this.methodName(def, method.name) : this.name(def)),
      !!owner, method.params.length);
  }

  definition(file: string, name: string): Definition | undefined {
    return this.checked.project.scopes.get(file)?.get(name);
  }
  bindingIndex(name: string): number { return this.bindings.get(name) ?? -1; }
  coveragePoint(stmt: Stmt): boolean {
    if (!this.options.coverage || this.checked.project.files.get(stmt.span.file)?.builtin) return false;
    this.coverage.set(`${stmt.span.file}:${stmt.span.line}`, { file: stmt.span.file, line: stmt.span.line });
    return true;
  }
  patternFieldIndex(field:RecordBindingField):number { return this.checked.patternFields.get(field)!.index; }
  sourceFileIdentity(file:string):string {return sourceFileIdentity(this.checked.project,file);}
  expressionType(expr: Expr) { return this.checked.expressionTypes.get(expr); }
  schema(type: Ty): string { return this.schemas.request(type); }
  expressionSource(expr: Expr): string {
    return this.checked.project.files.get(expr.span.file)?.source.slice(expr.span.start, expr.span.end) ?? 'condition';
  }
  callPlan(expr: Expr) { return this.checked.callPlans.get(expr); }
  ownsBinding(stmt:Stmt):boolean {return stmt.kind==='assign'&&(stmt.ownership==='own'||this.checked.inferredOwned.has(stmt));}
  cName(def: Definition): string { return this.name(def); }
  cConstructor(def: Definition): string { return this.constructorName(def); }
  cMethod(def: Definition, method: string): string { return this.methodName(def, method); }
  hasInterceptors(node: MethodDecl): boolean { return !!this.checked.interceptorPlans.get(node)?.length; }
}

interface LoopExit {label:string; owned:Set<number>; depth:string; locks:string}
class BodyEmitter {
  private readonly generator: CGenerator;
  private readonly file: string;
  private readonly def?: Definition;
  private readonly lines: string[] = [];
  private locals = new Map<string, number>();
  private readonly owned = new Set<number>();
  private readonly classFields = new Map<string, number>();
  private readonly ownedClassFields = new Set<string>();
  private readonly scalarSlots = new Set<number>();
  private slots = 1;
  private labelCounter = 0;
  private loop?: {breaking:LoopExit; continuing:LoopExit};
  private errorTarget = 'aug_cleanup';
  private returnTarget = 'aug_cleanup';
  private continuation?: InterceptorInvocation;
  private constructionNext = false;
  private readonly constructorResults = new Set<number>();
  constructor(generator: CGenerator, file: string, def?: Definition, owner?: ClassDecl | InterceptorDecl) {
    this.generator = generator;
    this.file = file;
    this.def = def;
    if (owner) fieldsOf(owner).forEach((field, index) => {
      this.classFields.set(field.name, index);
      if(field.ownership==='own')this.ownedClassFields.add(field.name);
    });
  }

  addParameter(name: string, index: number, owned = false): void {
    const slot = this.newSlot();
    this.locals.set(name, slot);
    this.lines.push(`roots[${slot}] = ${name === 'self' ? 'self' : `args[${index}]`};`);
    if (owned) this.owned.add(slot);
  }

  addCapture(name:string,index:number):void {
    const slot=this.newSlot();this.locals.set(name,slot);this.line(`${this.slot(slot)} = aug_field(self, ${index});`);
  }

  initializeInterceptor(layer: InterceptorLayer, params: Param[], name: string, method: boolean): void {
    this.constructionNext = layer.constructorResultFresh === true;
    const receiver = method ? this.newSlot() : undefined;
    if (receiver !== undefined) this.line(`${this.slot(receiver)} = self;`);
    const original = params.map((param, index) => {
      const slot = this.newSlot();
      this.line(`${this.slot(slot)} = args[${index}];`);
      if (param.ownership === 'own') this.owned.add(slot);
      return slot;
    });
    this.continuation = new InterceptorInvocation(layer, params, original, name, receiver);
    const array = this.label('interceptor_dependencies');
    const dependencies = this.continuation.dependencies();
    this.line(`AugValue ${array}[] = { ${dependencies.map(slot =>
      slot === undefined ? 'aug_scalar_null()' : this.slot(slot)).join(', ') || 'aug_scalar_null()'} };`);
    const self = this.newSlot();
    this.locals.set('self', self);
    this.line(`${this.slot(self)} = ${this.generator.cConstructor(layer.definition)}(${array}, ${dependencies.length});`);
    this.line(`if (aug_has_error) goto ${this.errorTarget};`);
    for (const input of this.continuation.inputs()) {
      if (input.reuseOwnedSlot) {
        this.locals.set(input.name, input.slot!);
        continue;
      }
      const slot = this.newSlot();
      this.locals.set(input.name, slot);
      this.line(`${this.slot(slot)} = ${input.slot === undefined ? 'aug_scalar_null()' : this.slot(input.slot)};`);
    }
  }

  emitNativeReturn(def: Definition): void {
    const fn = def.node as MethodDecl;
    this.emitExternCall(def, fn.params.map(param => this.locals.get(param.name)!), 0);
    this.line('goto aug_cleanup;');
  }

  private emitNext(expr: Extract<Expr, { kind: 'call' }>): number {
    const next = this.continuation!;
    const values = expr.args.map(arg => this.emitExpr(arg));
    const plan = this.generator.callPlan(expr)!;
    const { args, transfers } = next.forward(plan.sourceIndices, values);
    const array = this.label('next_args');
    this.line(`AugValue ${array}[] = { ${args.map(slot => this.slot(slot)).join(', ') || 'aug_scalar_null()'} };`);
    for (const { original, replacement } of transfers) {
      if (replacement !== original)
        this.line(`if (${this.slot(original)}.tag != AUG_NULL) aug_drop(${this.slot(original)});`);
      this.line(`${this.slot(original)} = aug_scalar_null();`);
      if (this.owned.has(replacement) && replacement !== original)
        this.line(`${this.slot(replacement)} = aug_scalar_null();`);
    }
    const slot = this.newSlot();
    this.line(`${this.slot(slot)} = ${next.target}(${next.receiver === undefined ? '' :
      `${this.slot(next.receiver)}, `}${array}, ${args.length});`);
    if (this.constructionNext) this.constructorResults.add(slot);
    this.line(`if (aug_has_error) goto ${this.errorTarget};`);
    return slot;
  }

  private newSlot(): number { return this.slots++; }
  private slot(index: number): string { return `roots[${index}]`; }
  private line(text: string): void { this.lines.push(text); }
  private label(prefix: string): string { return `${prefix}_${this.labelCounter++}`; }
  private memberIndex(expr: Expr, name: string): number {
    const type = this.generator.expressionType(expr);
    if (type?.kind === 'builtin') return builtinProperties[type.name]?.findIndex(field => field.name === name) ?? -1;
    const node = type?.def?.node;
    return node?.kind === 'class' || node?.kind === 'interceptor' ? fieldsOf(node).findIndex(field => field.name === name) : -1;
  }

  private isScalar(type: Ty | undefined): boolean {
    return !!type && type.kind === 'builtin' && ['int', 'c_int', 'float', 'bool'].includes(type.name);
  }

  private emitExpr(expr: Expr): number {
    const firstNewSlot = this.slots;
    const slot = this.emitValueExpr(expr);
    // Scalar temporaries never contain a GC pointer. Keeping them outside the
    // escaped root array lets the C optimizer keep arithmetic in registers.
    if (slot >= firstNewSlot && this.isScalar(this.generator.expressionType(expr))) this.scalarSlots.add(slot);
    return slot;
  }

  private bindPattern(pattern:BindingPattern,value:number):void {
    if(pattern.kind==='nameBinding'){this.locals.set(pattern.name,value);return;}
    if(pattern.kind==='tupleBinding')for(const [index,item] of pattern.items.entries()){
      const slot=this.newSlot();this.line(`${this.slot(slot)} = aug_tuple_get(${this.slot(value)}, ${index});`);this.bindPattern(item,slot);
    }else for(const entry of pattern.fields){
      const slot=this.newSlot();this.line(`${this.slot(slot)} = aug_field(${this.slot(value)}, ${this.generator.patternFieldIndex(entry)});`);this.bindPattern(entry.pattern,slot);
    }
  }

  private matchCondition(clause:MatchPattern,value:number,literal:number|undefined):string {
    const type = clause.type ? this.generator.definition(this.file, clause.type.name) : undefined;
    return clause.pattern === 'else' ? '1' : clause.pattern === 'null' ? `${this.slot(value)}.tag == AUG_NULL` :
      clause.pattern === 'some' ? `${this.slot(value)}.tag != AUG_NULL` : clause.pattern === 'type' ?
        `${this.slot(value)}.tag == AUG_OBJECT && !strcmp(${this.slot(value)}.as.object->type_name, ${cString(type?.id ?? clause.type!.name)})` :
        `aug_truthy(aug_binary("==", ${this.slot(value)}, ${this.slot(literal!)}))`;
  }

  private emitValueExpr(expr: Expr): number {
    const callback=this.generator.functionValue(expr);
    if(callback){
      const table=this.generator.callbackTable(expr,callback),captures=callback.captures.map(capture=>this.emitExpr(capture.expression)),slot=this.newSlot();
      this.line(`${this.slot(slot)} = aug_new_object(${cString(table.type)}, ${captures.length}, ${table.mask}, ${table.table}, 1);`);
      this.line(`${this.slot(slot)}.as.object->field_names = ${table.names};`);
      captures.forEach((value,index)=>this.line(`aug_set_field(${this.slot(slot)}, ${index}, ${this.slot(value)});`));return slot;
    }
    if(expr.kind==='comprehension'){
      const value=this.emitExpr(expr.iterable),snapshot=this.newSlot(),result=this.newSlot();
      this.line(`${this.slot(snapshot)} = aug_iter_snapshot(${this.slot(value)});`);
      this.line(`${this.slot(result)} = aug_list_new(NULL, 0);`);
      const index=this.label('aug_index'),names=new Map(this.locals);
      this.line(`for (size_t ${index} = 0; ${index} < ${this.slot(snapshot)}.as.object->field_count; ${index}++) {`);
      this.line('if (aug_execution->fiber || aug_task_checkpoint_hook) aug_task_checkpoint();');
      this.line(`if (aug_cancelled) goto ${this.returnTarget};`);
      const item=this.newSlot();this.line(`${this.slot(item)} = ${this.slot(snapshot)}.as.object->fields[${index}];`);
      this.bindPattern(expr.pattern,item);
      if(expr.condition){const condition=this.emitExpr(expr.condition);this.line(`if (aug_truthy(${this.slot(condition)})) {`);}
      const projected=this.emitExpr(expr.projection);this.line(`aug_list_append(${this.slot(result)}, ${this.slot(projected)});`);
      if(expr.condition)this.line('}');this.line('}');this.locals=names;return result;
    }
    if (expr.kind === 'matchValue') {
      const value = this.emitExpr(expr.value), slot = this.newSlot();
      const literals = expr.cases.map(clause => clause.literal ? this.emitExpr(clause.literal) : undefined);
      for (const [index, clause] of expr.cases.entries()) {
        const condition = this.matchCondition(clause,value,literals[index]);
        this.line(`${index ? 'else ' : ''}if (${condition}) {`);
        const names = new Map(this.locals);if (clause.name) this.locals.set(clause.name, value);
        const result = this.emitExpr(clause.result);this.line(`${this.slot(slot)} = ${this.slot(result)};`);
        this.locals = names;this.line('}');
      }
      return slot;
    }
    if (expr.kind === 'recordCopy') {
      const base = this.emitExpr(expr.base), def = this.generator.expressionType(expr.base)!.def!;
      const node = def.node as ClassDecl;
      const replacements = new Map(expr.fields.map(field => [field.name, this.emitExpr(field.value)]));
      const args = node.fields.map((field, index) => {
        const replacement = replacements.get(field.label ?? field.name); if (replacement !== undefined) return replacement;
        const value = this.newSlot(); this.line(`${this.slot(value)} = aug_field(${this.slot(base)}, ${index});`); return value;
      });
      const slot = this.newSlot(), array = this.label('record_args');
      this.line(`AugValue ${array}[] = {${args.map(arg => this.slot(arg)).join(', ') || 'aug_scalar_null()'}};`);
      this.line(`${this.slot(slot)} = ${this.generator.cConstructor(def)}(${array}, ${args.length});`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`); return slot;
    }
    if (expr.kind === 'interpolation') {
      const slot = this.newSlot(); this.line(`${this.slot(slot)} = aug_string("");`);
      for (const part of expr.parts) {
        const value = this.emitExpr('text' in part ? {kind:'literal', value:part.text, span:part.span} : part.value), text = this.newSlot();
        this.line(`${this.slot(text)} = aug_text(${this.slot(value)});`);
        this.line(`${this.slot(slot)} = aug_binary("+", ${this.slot(slot)}, ${this.slot(text)});`);
      }
      return slot;
    }
    if (expr.kind === 'handle' && expr.call.kind === 'call') {
      const plan = this.generator.actionPlan(expr)!, endpoint = (plan.endpoint.node as MethodDecl).endpoint!;
      const metadata = {method:endpoint.method,path:endpoint.path,parameters:plan.parameters.map(({param,type,form}) => ({name:param.source?.name ?? param.name,source:param.source?.kind,form,schema:this.generator.actionSchema(type)}))};
      const values = expr.call.args.map(argument => argument.kind === 'formInput' ? undefined : this.emitExpr(argument));
      const args = plan.parameters.map(parameter => parameter.form || parameter.source === undefined ? undefined : values[parameter.source]);
      const array = this.label('action_values'), slot = this.newSlot();
      this.line(`AugValue ${array}[] = {${args.map(arg => arg === undefined ? 'aug_null()' : this.slot(arg)).join(', ') || 'aug_scalar_null()'}};`);
      this.line(`${this.slot(slot)} = aug_http_action(${cString(JSON.stringify(metadata))}, ${array}, ${args.length});`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`); return slot;
    }
    if (expr.kind === 'markupText') {
      const slot = this.newSlot(); this.line(`${this.slot(slot)} = aug_string(${cString(expr.text)});`); return slot;
    }
    if (expr.kind === 'markup') {
      const component = this.generator.markupCall(expr); if (component) return this.emitExpr(component);
      const names = expr.attributes.map(attribute => this.emitExpr({kind:'literal', value:attribute.name, span:attribute.span}));
      const attrs = expr.attributes.map(attribute => this.emitExpr(attribute.value)), children = expr.children.map(child => this.emitExpr(child));
      const array = this.label('html_attributes'), body = this.label('html_children'), slot = this.newSlot();
      this.line(`AugValue ${array}[] = {${expr.attributes.flatMap((_, index) => [this.slot(names[index]), this.slot(attrs[index])]).join(', ') || 'aug_scalar_null()'}};`);
      this.line(`AugValue ${body}[] = {${children.map(child => this.slot(child)).join(', ') || 'aug_scalar_null()'}};`);
      this.line(`${this.slot(slot)} = aug_html_element(${cString(expr.tag)}, ${array}, ${attrs.length}, ${body}, ${children.length});`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`); return slot;
    }
    if (expr.kind === 'start' && expr.call.kind === 'call') {
      const call = expr.call;
      const {receiver, args} = this.emitArguments(call);
      const thunk = new BodyEmitter(this.generator, this.file, this.def);
      thunk.addParameter('self', 0);
      args.forEach((_, index) => thunk.addParameter(`argument_${index}`, index));
      const result = thunk.emitInvoke(call, receiver === undefined ? undefined : thunk.locals.get('self'),
        args.map((_, index) => thunk.locals.get(`argument_${index}`)!));
      thunk.line(`${thunk.slot(0)} = ${thunk.slot(result)};`);
      const name = this.generator.taskThunk(thunk, args.length), array = this.label('task_args'), slot = this.newSlot();
      this.line(`AugValue ${array}[] = {${args.map(arg => this.slot(arg)).join(', ') || 'aug_scalar_null()'}};`);
      const captures=this.label('task_owned');
      this.line(`const unsigned char ${captures}[] = {${args.map((_,i)=>this.generator.callPlan(call)?.ownerships?.[i]==='own'?'1':'0').join(', ')||'0'}};`);
      this.line(`${this.slot(slot)} = ${expr.worker ? 'aug_task_start_worker' : 'aug_task_start_owned'}(${name}, ${receiver === undefined ? 'aug_scalar_null()' : this.slot(receiver)}, ${array}, ${args.length}, ${captures});`);
      this.clearMovedArgs(call, (this.generator.callPlan(call)?.ownerships ?? []).map(ownership => ({ownership:ownership ?? 'managed'})));
      this.line(`if (aug_has_error) goto ${this.errorTarget};`); return slot;
    }
    if (expr.kind === 'wait') {
      const values = expr.tasks.map(task => this.emitExpr(task)), slot = this.newSlot(), array = this.label('wait_tasks');
      this.line(`AugValue ${array}[] = {${values.map(value => this.slot(value)).join(', ')}};`);
      this.line(`${this.slot(slot)} = aug_task_wait(${array}, ${values.length});`);
      this.line(`if (aug_cancelled) goto ${this.returnTarget};`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`); return slot;
    }
    if (expr.kind === 'name') {
      const local = this.locals.get(expr.name);
      if (local !== undefined) return local;
      const field = this.classFields.get(expr.name);
      if (field !== undefined) {
        const slot = this.newSlot();
        this.line(`${this.slot(slot)} = aug_field(${this.slot(this.locals.get('self')!)}, ${field});`);
        return slot;
      }
      const slot = this.newSlot();
      this.line(`${this.slot(slot)} = aug_scalar_null();`);
      return slot;
    }
    if (expr.kind === 'literal') {
      const slot = this.newSlot();
      const value = expr.value === null ? 'aug_scalar_null()' : typeof expr.value === 'string' ?
        `aug_string(${cString(expr.value)})` : typeof expr.value === 'boolean' ?
        `aug_scalar_bool(${expr.value})` : expr.numericType !== 'float' && Number.isInteger(expr.value) ?
        `aug_scalar_int(${expr.numericText === '-9223372036854775808' ? 'INT64_MIN' : `INT64_C(${expr.numericText ?? expr.value})`})` : `aug_scalar_float(${expr.value})`;
      this.line(`${this.slot(slot)} = ${value};`);
      return slot;
    }
    if (expr.kind === 'collection') {
      const args = expr.items.map(item => this.emitExpr(item));
      const slot = this.newSlot();
      const name = this.generator.expressionType(expr)?.name ?? expr.collection;
      if (name === 'Map') {
        this.line(`${this.slot(slot)} = aug_map_new();`);
        for (let index = 0; index < args.length; index += 2)
          this.line(`aug_map_set(${this.slot(slot)}, ${this.slot(args[index])}, ${this.slot(args[index + 1])});`);
      } else {
        const array = this.label('items');
        this.line(`AugValue ${array}[] = { ${args.map(index => this.slot(index)).join(', ') || 'aug_scalar_null()'} };`);
        this.line(`${this.slot(slot)} = aug_${name.toLowerCase()}_new(${array}, ${args.length});`);
      }
      if (this.generator.expressionType(expr)?.immutable) this.line(`aug_freeze(${this.slot(slot)});`);
      return slot;
    }
    if (expr.kind === 'resolve') {
      const slot = this.newSlot();
      const key = expr.name + (expr.typeArgs.length ? `<${expr.typeArgs.map(typeName).join(',')}>` : '');
      this.line(`${this.slot(slot)} = aug_resolve_${this.generator.bindingIndex(key)}();`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`);
      return slot;
    }
    if (expr.kind === 'member') {
      const object = this.emitExpr(expr.object);
      const slot = this.newSlot();
      if (this.generator.expressionType(expr.object)?.id === 'builtin:HttpRequest' && expr.name === 'body') {
        this.line(`${this.slot(slot)} = aug_http_body(${this.slot(object)});`); this.line(`if (aug_has_error) goto ${this.errorTarget};`);
      } else this.line(`${this.slot(slot)} = aug_field(${this.slot(object)}, ${this.memberIndex(expr.object, expr.name)});`);
      return slot;
    }
    if (expr.kind === 'unary') {
      const value = this.emitExpr(expr.value);
      const slot = this.newSlot();
      const type = this.generator.expressionType(expr.value);
      const scalar = type && this.isScalar(type) && !type.nullable && !type.optional;
      const operand = this.slot(value);
      const fast = scalar && expr.op === '!' && type.name === 'bool' ? `aug_scalar_bool(!${operand}.as.boolean)` :
        scalar && expr.op === '-' && ['int', 'c_int'].includes(type.name) ? `aug_scalar_int(aug_signed_bits(UINT64_C(0) - (uint64_t)${operand}.as.integer))` :
        scalar && expr.op === '-' && type.name === 'float' ? `(${operand}.tag == AUG_FLOAT ? aug_scalar_float(-${operand}.as.floating) : aug_unary("-", ${operand}))` : undefined;
      this.line(`${this.slot(slot)} = ${fast ?? `aug_unary(${cString(expr.op)}, ${operand})`};`);
      return slot;
    }
    if (expr.kind === 'binary') {
      const left = this.emitExpr(expr.left);
      if (expr.op === 'otherwise') {
        const slot = this.newSlot();
        this.line(`${this.slot(slot)} = ${this.slot(left)};`);
        this.line(`if (${this.slot(left)}.tag == AUG_NULL) {`);
        const right = this.emitExpr(expr.right);
        this.line(`${this.slot(slot)} = ${this.slot(right)};`);
        this.line('}');
        return slot;
      }
      if (expr.op === '&&' || expr.op === '||') {
        const slot = this.newSlot();
        this.line(`${this.slot(slot)} = aug_scalar_bool(${this.slot(left)}.as.boolean);`);
        this.line(`if (${expr.op === '||' ? '!' : ''}${this.slot(slot)}.as.boolean) {`);
        const right = this.emitExpr(expr.right);
        this.line(`${this.slot(slot)} = aug_scalar_bool(${this.slot(right)}.as.boolean);`);
        this.line('}');
        return slot;
      }
      const right = this.emitExpr(expr.right);
      const slot = this.newSlot();
      this.line(`${this.slot(slot)} = ${this.scalarBinary(expr, left, right) ?? `aug_binary(${cString(expr.op)}, ${this.slot(left)}, ${this.slot(right)})`};`);
      if (expr.op === '/') this.line(`if (aug_has_error) goto ${this.errorTarget};`);
      return slot;
    }
    if (expr.kind !== 'call') throw new Error(`Cannot emit ${expr.kind}`);
    if (expr.callee.kind === 'name' && expr.callee.name === 'next') return this.emitNext(expr);
    const {receiver, args} = this.emitArguments(expr);
    return this.emitInvoke(expr, receiver, args);
  }

  private scalarBinary(expr: Extract<Expr, {kind: 'binary'}>, left: number, right: number): string | undefined {
    const a = this.generator.expressionType(expr.left), b = this.generator.expressionType(expr.right);
    if (!a || !b || !this.isScalar(a) || !this.isScalar(b) || a.nullable || b.nullable || a.optional || b.optional) return;
    if (a.name === 'bool' && b.name === 'bool' && ['==', '!='].includes(expr.op))
      return `aug_scalar_bool(${this.slot(left)}.as.boolean ${expr.op} ${this.slot(right)}.as.boolean)`;
    const numeric = (type: Ty) => ['int', 'c_int', 'float'].includes(type.name);
    if (!numeric(a) || !numeric(b)) return;
    const integer = a.name !== 'float' && b.name !== 'float';
    const operand = (slot: number, type: Ty) => `${integer || type.name === 'float' ? '' : '(double)'}${this.slot(slot)}.as.${type.name === 'float' ? 'floating' : 'integer'}`;
    const x = operand(left, a), y = operand(right, b);
    let fast: string | undefined;
    if (['==', '!=', '<', '>', '<=', '>='].includes(expr.op)) fast = `aug_scalar_bool(${x} ${expr.op} ${y})`;
    else if (expr.op === '/') fast = `aug_scalar_${integer ? 'int' : 'float'}_divide(${x}, ${y})`;
    else if (['+', '-', '*'].includes(expr.op)) fast = integer ?
      `aug_scalar_int(aug_signed_bits((uint64_t)${x} ${expr.op} (uint64_t)${y}))` : `aug_scalar_float(${x} ${expr.op} ${y})`;
    if (!fast || integer) return fast;
    // Widening can leave an INT-tagged value in a statically float position.
    // Use the existing numeric semantics until its representation is FLOAT.
    const guards = [{type:a, slot:left}, {type:b, slot:right}].flatMap(({type, slot}) =>
      type.name === 'float' ? [`${this.slot(slot)}.tag == AUG_FLOAT`] : []);
    return `(${guards.join(' && ')} ? ${fast} : aug_binary(${cString(expr.op)}, ${this.slot(left)}, ${this.slot(right)}))`;
  }

  private emitArguments(expr: Extract<Expr, {kind: 'call'}>): {receiver?: number; args: number[]} {
    const receiver = expr.callee.kind === 'member' ? this.emitExpr(expr.callee.object) : undefined;
    const sourceArgs = expr.args.map(arg => this.emitExpr(arg));
    const plan = this.generator.callPlan(expr);
    const args = plan ? plan.sourceIndices.map((source, index) => {
      if (source !== undefined) return sourceArgs[source];
      if (plan.defaults?.[index]) return this.emitExpr(plan.defaults[index]!);
      const dependency = plan.injectionSources?.[index];
      if (dependency) {
        const slot = this.newSlot();
        if (dependency.startsWith('self.')) this.line(`${this.slot(slot)} = aug_field(${this.slot(this.locals.get('self')!)}, ${this.classFields.get(dependency.slice(5))});`);
        else this.line(`${this.slot(slot)} = ${this.slot(this.locals.get(dependency)!)};`);
        return slot;
      }
      const slot = this.newSlot();
      this.line(`${this.slot(slot)} = ${plan.bindingKeys[index] ? `aug_resolve_${this.generator.bindingIndex(plan.bindingKeys[index]!)}()` : 'aug_null()'};`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`);
      return slot;
    }) : sourceArgs;
    return {receiver, args};
  }

  private emitInvoke(expr: Extract<Expr, {kind: 'call'}>, receiver: number | undefined, args: number[]): number {
    const slot = this.newSlot();
    let array: string | undefined;
    const argumentArray = (): string => {
      if (array) return array;
      array = this.label('args');
      this.line(`AugValue ${array}[] = { ${args.map(index => this.slot(index)).join(', ') || 'aug_scalar_null()'} };`);
      return array;
    };
    if (expr.callee.kind === 'name' && expr.callee.name === 'sourceLocation') {
      const path=this.emitExpr({kind:'literal',value:this.generator.sourceFileIdentity(expr.span.file),span:expr.span});
      const values=this.label('location');
      this.line(`AugValue ${values}[] = { ${this.slot(path)}, aug_scalar_int(INT64_C(${expr.span.line})), aug_scalar_int(INT64_C(${expr.span.column})) };`);
      this.line(`${this.slot(slot)} = aug_tuple_new(${values}, 3);`);return slot;
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'exit') {
      this.line(`int aug_exit_code_${slot} = (int)aug_cint(${this.slot(args[0])});`);
      this.line(`aug_cancelled = true; aug_shutdown(); exit(aug_exit_code_${slot} >= 0 && aug_exit_code_${slot} <= 255 ? aug_exit_code_${slot} : 1);`);
      return slot;
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'Json') {
      this.line(`${this.slot(slot)} = aug_json_wrap(${this.slot(args[0])});`); return slot;
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'HttpTestClient') {
      const endpoint = this.generator.testEndpoint();
      const routes = this.generator.serveRoutes(endpoint.file, [endpoint.name]);
      this.line(`${this.slot(slot)} = aug_http_test_client(${routes}, ${this.generator.serveRouteCount(1)});`); return slot;
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'Shared') {
      this.line(`${this.slot(slot)} = aug_shared_new(${this.slot(args[0])});`);
      if (expr.args[0]?.kind === 'name') {const source = this.locals.get(expr.args[0].name); if (source !== undefined && this.owned.has(source)) this.line(`${this.slot(source)} = aug_scalar_null();`);}
      return slot;
    }
    if(expr.callee.kind==='name'&&expr.callee.name==='ServerEvent') {
      this.line(`${this.slot(slot)} = aug_http_event(${args.map(arg=>this.slot(arg)).join(', ')});`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`);return slot;
    }
    if (expr.callee.kind === 'name' && ['Headers', 'HttpResponse'].includes(expr.callee.name)) {
      this.line(`${this.slot(slot)} = ${expr.callee.name === 'Headers' ? 'aug_headers_new()' : `aug_http_response_full(${this.slot(args[0])}, ${this.slot(args[1])}, ${this.slot(args[2])})`};`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`); return slot;
    }
    if (expr.callee.kind === 'name' && ['c_int', 'int'].includes(expr.callee.name)) {
      this.line(`${this.slot(slot)} = ${expr.callee.name === 'c_int' ? `aug_to_c_int(${this.slot(args[0])})` : this.slot(args[0])};`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`);
      return slot;
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'print') {
      if (args[0] !== undefined) this.line(`aug_print(${this.slot(args[0])});`);
      this.line(`${this.slot(slot)} = aug_scalar_null();`);
      return slot;
    }
    if(expr.callee.kind==='name'&&expr.callee.name==='assertEqual') {
      this.line(`aug_assert_equal(${this.slot(args[0])}, ${this.slot(args[1])}, ${cString("assertEqual(actual, expected)")}, ${cString(expr.span.file)}, ${expr.span.line});`);
      this.line(`${this.slot(slot)} = aug_scalar_null();`);this.line(`if (aug_has_error) goto ${this.errorTarget};`);return slot;
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'assert') {
      this.line(`aug_assert(${this.slot(args[0])}, ${cString(this.generator.expressionSource(expr.args[0]))}, ${cString(expr.span.file)}, ${expr.span.line});`);
      this.line(`${this.slot(slot)} = aug_scalar_null();`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`);
      return slot;
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'arguments') {
      this.line(`${this.slot(slot)} = aug_arguments();`);
      return slot;
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'read_file') {
      this.line(`${this.slot(slot)} = aug_read_file(${this.slot(args[0])});`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`);
      return slot;
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'write_file') {
      this.line(`${this.slot(slot)} = aug_write_file(${this.slot(args[0])}, ${this.slot(args[1])});`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`);
      return slot;
    }
    if (expr.callee.kind === 'name' && ['List', 'Set', 'Tuple'].includes(expr.callee.name)) {
      this.line(`${this.slot(slot)} = aug_${expr.callee.name.toLowerCase()}_new(${argumentArray()}, ${args.length});`);
      return slot;
    }
    if (expr.callee.kind === 'name' && expr.callee.name === 'Map') {
      this.line(`${this.slot(slot)} = aug_map_new();`);
      return slot;
    }
    if (expr.callee.kind === 'name' && errorNames.includes(expr.callee.name)) {
      this.line(`${this.slot(slot)} = aug_new_object(${cString(expr.callee.name)}, 0, NULL, NULL, 0);`);
      return slot;
    }
    if (expr.callee.kind === 'name') {
      const def = this.generator.definition(this.file, expr.callee.name);
      if (def?.node.kind === 'class') {
        this.line(`${this.slot(slot)} = ${this.generator.cConstructor(def)}(${argumentArray()}, ${args.length});`);
        this.clearMovedArgs(expr, def.node.fields);
      } else if (def?.node.kind === 'function') {
        if (def.node.externC && !this.generator.hasInterceptors(def.node)) this.emitExternCall(def, args, slot);
        else this.line(`${this.slot(slot)} = ${this.generator.cName(def)}(${argumentArray()}, ${args.length});`);
        this.clearMovedArgs(expr, def.node.params);
      }
    } else if (expr.callee.kind === 'member') {
      const methodName = expr.callee.name;
      const type = this.generator.expressionType(expr.callee.object);
      const operation = type && collectionOperations[type.name]?.find(operation => operation.name === methodName);
      if (operation) {
        if (type!.name === 'Json' && methodName === 'decode' || type!.name === 'HttpRequest' && methodName === 'form') {
          this.line(`${this.slot(slot)} = ${methodName === 'form' ? 'aug_httprequest_form' : 'aug_json_decode'}(${this.slot(receiver!)}, &${this.generator.schema(this.generator.expressionType(expr)!)});`);
          this.line(`if (aug_has_error) goto ${this.errorTarget};`);
          return slot;
        }
        const values = [this.slot(receiver!), ...args.map((index, position) => operation.parameters[position]?.type === 'int' ? `aug_cint(${this.slot(index)})` : this.slot(index))];
        const call = `aug_${type!.name.toLowerCase()}_${operation.native}(${values.join(', ')})`;
        if (operation.returns === 'void') { this.line(`${call};`); this.line(`${this.slot(slot)} = aug_scalar_null();`); }
        else this.line(`${this.slot(slot)} = ${operation.returns === 'bool' ? `aug_scalar_bool(${call})` : operation.returns === 'int' ? `aug_scalar_int(${call})` : call};`);
      } else {
        this.line(`${this.slot(slot)} = aug_call_method(${this.slot(receiver!)}, ${cString(methodName)}, ${argumentArray()}, ${args.length});`);
        const node = type?.def?.node;
        const method = node?.kind === 'class' || node?.kind === 'interface' || node?.kind === 'interceptor' ?
          node.methods.find(item => item.name === methodName) : undefined;
        if (method) this.clearMovedArgs(expr, method.params);
      }
    }
    this.line(`if (aug_has_error) goto ${this.errorTarget};`);
    return slot;
  }

  private clearMovedArgs(call: Extract<Expr, { kind: 'call' }>, params: { ownership: string }[]): void {
    const plan = this.generator.callPlan(call);
    params.forEach((param, index) => {
      const source = plan ? plan.sourceIndices[index] : index;
      if (source === undefined || param.ownership !== 'own' ||
        call.args[source]?.kind !== 'name') return;
      const name = (call.args[source] as Extract<Expr, { kind: 'name' }>).name;
      const slot = this.locals.get(name);
      if (slot !== undefined && this.owned.has(slot)) this.line(`${this.slot(slot)} = aug_scalar_null();`);
    });
  }

  private emitExternCall(def: Definition, args: number[], output: number): void {
    const fn = def.node as MethodDecl;
    if (fn.valueAbi) {
      this.line(`${this.slot(output)} = ${fn.name}(${args.map(index => this.slot(index)).join(', ')});`);
      return;
    }
    const values = args.map((index, i) => {
      const type = fn.params[i]?.type.name;
      return type === 'string' ? `aug_cstring(${this.slot(index)})` :
        type === 'int' ? `aug_cint(${this.slot(index)})` : type === 'c_int' ? `(int)aug_cint(${this.slot(index)})` :
        type === 'float' ? `aug_cfloat(${this.slot(index)})` :
        type === 'bool' ? `aug_truthy(${this.slot(index)})` : this.slot(index);
    });
    const call = `${fn.name}(${values.join(', ')})`;
    const convert = fn.returns.name === 'void' ? `${call}; ${this.slot(output)} = aug_scalar_null()` :
      fn.returns.name === 'string' ? `aug_string(${call})` :
      ['int', 'c_int'].includes(fn.returns.name) ? `aug_scalar_int(${call})` :
      fn.returns.name === 'float' ? `aug_scalar_float(${call})` : `aug_scalar_bool(${call})`;
    this.line(fn.returns.name === 'void' ? `${convert};` : `${this.slot(output)} = ${convert};`);
  }

  beginTestCase(): void { this.line('aug_test_assertions = 0;'); }

  emitStatement(stmt: Stmt): void {
    if (stmt.kind === 'lock') {
      const value = this.emitExpr(stmt.value), slot = this.newSlot();
      const names = new Map(this.locals); this.locals.set(stmt.name, slot);
      this.line(`${this.slot(slot)} = aug_shared_lock(${this.slot(value)});`);
      this.line(`if (aug_cancelled) goto ${this.returnTarget};`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`);
      this.emitScoped(stmt.body); this.line('aug_lock_leave();'); this.locals = names; return;
    }
    this.line(`#line ${stmt.span.line} ${cString(stmt.span.file)}`);
    if (this.generator.coveragePoint(stmt)) this.line(`aug_cover(${cString(stmt.span.file)}, ${stmt.span.line});`);
    if (stmt.kind === 'serve') {
      const port = this.emitExpr(stmt.port), routes = this.generator.serveRoutes(this.file, stmt.names);
      this.line(`aug_http_serve(${routes}, ${this.generator.serveRouteCount(stmt.names.length)}, aug_cint(${this.slot(port)}));`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`); return;
    }
    if (stmt.kind === 'freeze') {
      const value = this.emitExpr(stmt.value); this.line(`aug_freeze(${this.slot(value)});`);
      const slot = this.newSlot(); this.locals.set(stmt.name, slot); this.line(`${this.slot(slot)} = ${this.slot(value)};`);
      if (stmt.value.kind === 'name') { const source = this.locals.get(stmt.value.name); if (source !== undefined) this.owned.delete(source); }
      return;
    }
    if (stmt.kind === 'expr') { this.emitExpr(stmt.expr); return; }
    if (stmt.kind === 'destructure') {
      const value = this.emitExpr(stmt.value);
      if(stmt.pattern){this.bindPattern(stmt.pattern,value);return;}
      for (const [index, name] of stmt.names.entries()) {
        const slot = this.newSlot(); this.locals.set(name, slot);
        this.line(`${this.slot(slot)} = aug_tuple_get(${this.slot(value)}, ${index});`);
      }
      return;
    }
    if (stmt.kind === 'break' || stmt.kind === 'continue') {
      this.loopExit(this.loop![stmt.kind === 'break' ? 'breaking' : 'continuing']); return;
    }
    if (stmt.kind === 'for') {
      const value = this.emitExpr(stmt.iterable);
      const snapshot = this.newSlot();
      const iterableType = this.generator.expressionType(stmt.iterable);
      const flatMap = !stmt.pattern && stmt.names.length === 2 && iterableType?.kind === 'builtin' && iterableType.name === 'Map';
      this.line(`${this.slot(snapshot)} = ${flatMap ? 'aug_map_entries_snapshot' : 'aug_iter_snapshot'}(${this.slot(value)});`);
      const index = this.label('aug_index'), done = this.label('aug_loop_done'), next = this.label('aug_loop_next');
      const outerLoop = this.loop; this.loop = this.loopTargets(done, next);
      const names = new Map(this.locals);
      const slots = (stmt.pattern?[]:stmt.names).map(name => { const slot = this.newSlot(); this.locals.set(name, slot); return slot; });
      if (flatMap) slots.forEach((slot, index) => {
        if (this.isScalar(this.generator.expressionType(stmt.iterable)?.args[index])) this.scalarSlots.add(slot);
      });
      this.line(`for (size_t ${index} = 0; ${index} < ${this.slot(snapshot)}.as.object->field_count${flatMap ? ' / 2' : ''}; ${index}++) {`);
      this.line('if (aug_execution->fiber || aug_task_checkpoint_hook) aug_task_checkpoint();');
      this.line(`if (aug_cancelled) goto ${this.returnTarget};`);
      if (flatMap) slots.forEach((slot, position) => this.line(`${this.slot(slot)} = ${this.slot(snapshot)}.as.object->fields[${index} * 2 + ${position}];`));
      else {
        const item = this.newSlot(); this.line(`${this.slot(item)} = ${this.slot(snapshot)}.as.object->fields[${index}];`);
        if(stmt.pattern)this.bindPattern(stmt.pattern,item);
        else slots.forEach((slot, position) => this.line(`${this.slot(slot)} = ${slots.length === 1 ? this.slot(item) : `aug_tuple_get(${this.slot(item)}, ${position})`};`));
      }
      this.emitScoped(stmt.body);
      this.line(`${next}:;`); this.line('}'); this.line(`${done}:;`);
      this.loop = outerLoop; this.locals = names;
      return;
    }
    if (stmt.kind === 'match') {
      const value = this.emitExpr(stmt.value);
      const literals = stmt.cases.map(clause => clause.literal ? this.emitExpr(clause.literal) : undefined);
      for (const [index, clause] of stmt.cases.entries()) {
        const condition = this.matchCondition(clause,value,literals[index]);
        this.line(`${index ? 'else ' : ''}if (${condition}) {`);
        const names = new Map(this.locals);
        if (clause.name) this.locals.set(clause.name, value);
        this.emitScoped(clause.body);
        this.locals = names;
        this.line('}');
      }
      return;
    }
    if (stmt.kind === 'assign') {
      const value = this.emitExpr(stmt.value);
      const sourceSlot = stmt.value.kind === 'name' ? this.locals.get(stmt.value.name) : undefined;
      if (stmt.target.kind === 'name') {
        const existing = this.locals.get(stmt.target.name);
        if (existing !== undefined) this.line(`${this.slot(existing)} = ${this.slot(value)};`);
        else if (this.classFields.has(stmt.target.name)) this.line(
          `aug_set_field(${this.slot(this.locals.get('self')!)}, ${this.classFields.get(stmt.target.name)}, ${this.slot(value)});`);
        else {
          const target = this.newSlot();
          this.locals.set(stmt.target.name, target);
          this.line(`${this.slot(target)} = ${this.slot(value)};`);
          if (this.isScalar(this.generator.expressionType(stmt.value)) && (!stmt.declaredType || ['int', 'c_int', 'float', 'bool'].includes(stmt.declaredType.name)))
            this.scalarSlots.add(target);
          if (this.generator.ownsBinding(stmt)) this.owned.add(target);
        }
      } else if (stmt.target.kind === 'member') {
        const object = this.emitExpr(stmt.target.object);
        this.line(`aug_set_field(${this.slot(object)}, ${this.memberIndex(stmt.target.object, stmt.target.name)}, ${this.slot(value)});`);
      }
      let targetOwns = this.generator.ownsBinding(stmt);
      if(stmt.target.kind==='name'&&!this.locals.has(stmt.target.name))targetOwns ||= this.ownedClassFields.has(stmt.target.name);
      if (stmt.target.kind === 'member') {
        const memberName = stmt.target.name;
        const node = this.generator.expressionType(stmt.target.object)?.def?.node;
        targetOwns ||= (node?.kind === 'class' || node?.kind === 'interceptor') && !!fieldsOf(node).find(field =>
          field.name === memberName && field.ownership === 'own');
      }
      if (sourceSlot !== undefined && this.owned.has(sourceSlot) && targetOwns)
        this.line(`${this.slot(sourceSlot)} = aug_scalar_null();`);
      return;
    }
    if(stmt.kind==='yield') {
      const value=this.emitExpr(stmt.value);this.line(`aug_http_yield(${this.slot(value)});`);
      this.line(`if (aug_has_error || aug_cancelled) goto ${this.errorTarget};`);return;
    }
    if (stmt.kind === 'return') {
      const value = stmt.value ? this.emitExpr(stmt.value) : undefined;
      this.line(`${this.slot(0)} = ${value === undefined ? 'aug_scalar_null()' : this.slot(value)};`);
      if (value !== undefined && this.owned.has(value)) this.line(`${this.slot(value)} = aug_scalar_null();`);
      this.line(`goto ${this.returnTarget};`);
      return;
    }
    if (stmt.kind === 'throw') {
      const value = this.emitExpr(stmt.value);
      this.line(`aug_throw(${this.slot(value)});`);
      if (this.owned.has(value)) this.line(`${this.slot(value)} = aug_scalar_null();`);
      this.line(`goto ${this.errorTarget};`);
      return;
    }
    if (stmt.kind === 'if') {
      const condition = this.emitExpr(stmt.test);
      this.line(`if (${this.slot(condition)}.as.boolean) {`);
      this.emitScoped(stmt.then);
      this.line('} else {');
      this.emitScoped(stmt.otherwise);
      this.line('}');
      return;
    }
    if (stmt.kind === 'while') {
      const done = this.label('aug_loop_done'), next = this.label('aug_loop_next'), outerLoop = this.loop;
      this.loop = this.loopTargets(done, next);
      this.line('while (1) {');
      this.line('if (aug_execution->fiber || aug_task_checkpoint_hook) aug_task_checkpoint();');
      this.line(`if (aug_cancelled) goto ${this.returnTarget};`);
      const condition = this.emitExpr(stmt.test);
      this.line(`if (!${this.slot(condition)}.as.boolean) break;`);
      this.emitScoped(stmt.body);
      this.line(`${next}:;`); this.line('}'); this.line(`${done}:;`);
      this.loop = outerLoop; return;
    }
    if (stmt.kind === 'scope') {
      this.line('aug_scope_enter(aug_scoped);');
      this.line('{'); this.emitScoped(stmt.body, true); this.line('}');
      this.line('aug_scope_leave();');
      this.line(`if (aug_cancelled) goto ${this.returnTarget};`);
      this.line(`if (aug_has_error) goto ${this.errorTarget};`);
      return;
    }
    if (stmt.kind === 'unsafe' || stmt.kind === 'borrow') {
      this.line('{');
      this.emitScoped(stmt.body);
      this.line('}');
      return;
    }
    if (stmt.kind === 'try') {
      if (stmt.always) {this.emitTryAlways(stmt); return;}
      const catchLabel = this.label('aug_catch');
      const afterLabel = this.label('aug_after_catch');
      const outerTarget = this.errorTarget;
      const ownedBefore = new Set(this.owned);
      const scopeDepth = this.label('aug_catch_depth');
      const lockDepth = this.label('aug_catch_locks');
      this.line(`size_t ${scopeDepth} = aug_scope_depth();`);
      this.line(`size_t ${lockDepth} = aug_lock_depth();`);
      this.errorTarget = catchLabel;
      this.line('{');
      this.emitScoped(stmt.body);
      this.line('}');
      this.errorTarget = outerTarget;
      this.line(`goto ${afterLabel};`);
      this.line(`${catchLabel}:;`);
      this.line(`aug_scope_restore(${scopeDepth});`);
      this.line(`aug_lock_restore(${lockDepth});`);
      this.line(`if (aug_cancelled) goto ${this.returnTarget};`);
      for (const slot of this.owned) if (!ownedBefore.has(slot))
        this.line(`if (${this.slot(slot)}.tag != AUG_NULL) { aug_drop(${this.slot(slot)}); ${this.slot(slot)} = aug_scalar_null(); }`);
      for (const clause of stmt.catches) {
        this.line(`if (${this.generator.errorCondition(clause.type)}) {`);
        const slot = this.newSlot();
        const prior = this.locals.get(clause.name);
        this.locals.set(clause.name, slot);
        this.line(`${this.slot(slot)} = aug_take_error();`);
        this.emitScoped(clause.body);
        if (prior === undefined) this.locals.delete(clause.name);
        else this.locals.set(clause.name, prior);
        this.line(`goto ${afterLabel};`);
        this.line('}');
      }
      this.line(`goto ${outerTarget};`);
      this.line(`${afterLabel}:;`);
    }
  }

  private loopTargets(breaking:string, continuing:string): {breaking:LoopExit; continuing:LoopExit} {
    const depth=this.label('aug_loop_depth'), locks=this.label('aug_loop_locks'), owned=new Set(this.owned);
    this.line(`size_t ${depth} = aug_scope_depth(); size_t ${locks} = aug_lock_depth();`);
    return {breaking:{label:breaking,owned,depth,locks}, continuing:{label:continuing,owned,depth,locks}};
  }
  private loopExit(target:LoopExit):void {
    this.line(`aug_lock_restore(${target.locks});`);
    this.line(`aug_scope_join_to(${target.depth});`);
    for(const slot of this.owned) if(!target.owned.has(slot))
      this.line(`aug_drop(${this.slot(slot)}); ${this.slot(slot)} = aug_scalar_null();`);
    this.line(`aug_scope_restore(${target.depth});`);
    this.line(`if (aug_cancelled) goto ${this.returnTarget};`);
    this.line(`if (aug_has_error) goto ${this.errorTarget};`);
    this.line(`goto ${target.label};`);
  }

  private emitTryAlways(stmt: Extract<Stmt, {kind: 'try'}>): void {
    const outerError = this.errorTarget, outerReturn = this.returnTarget, outerLoop = this.loop;
    const ownedBefore = new Set(this.owned);
    const caught = this.label('aug_final_catch'), failed = this.label('aug_final_error'), returned = this.label('aug_final_return');
    const cleanup = this.label('aug_always'), done = this.label('aug_always_done'), after = this.label('aug_always_after');
    const reason = this.label('aug_exit_reason'), depth = this.label('aug_final_depth'), cancellation = this.label('aug_final_cancel');
    const locks = this.label('aug_final_locks');
    const pending = this.newSlot();
    this.line(`int ${reason} = 0; size_t ${depth} = aug_scope_depth(); bool ${cancellation} = false;`);
    this.line(`size_t ${locks} = aug_lock_depth();`);
    const breaking = this.label('aug_final_break'), continuing = this.label('aug_final_continue');
    if (outerLoop) this.loop = {breaking:{label:breaking,owned:ownedBefore,depth,locks}, continuing:{label:continuing,owned:ownedBefore,depth,locks}};
    this.errorTarget = caught; this.returnTarget = returned; this.emitScoped(stmt.body);
    this.line(`goto ${cleanup};`); this.line(`${caught}:;`);
    this.line(`aug_lock_restore(${locks});`);
    this.line(`aug_scope_restore(${depth}); if (aug_cancelled) goto ${failed};`);
    for (const slot of this.owned) if (!ownedBefore.has(slot))
      this.line(`aug_drop(${this.slot(slot)}); ${this.slot(slot)} = aug_scalar_null();`);
    this.errorTarget = failed;
    for (const clause of stmt.catches) {
      this.line(`if (${this.generator.errorCondition(clause.type)}) {`);
      const names = new Map(this.locals), slot = this.newSlot(); this.locals.set(clause.name, slot);
      this.line(`${this.slot(slot)} = aug_take_error();`); this.emitScoped(clause.body); this.locals = names;
      this.line(`goto ${cleanup};`); this.line('}');
    }
    this.line(`goto ${failed};`); this.line(`${returned}: ${reason} = 1; goto ${cleanup};`);
    if (outerLoop) {this.line(`${breaking}: ${reason} = 3; goto ${cleanup};`); this.line(`${continuing}: ${reason} = 4; goto ${cleanup};`);}
    this.line(`${failed}: ${reason} = 2;`); this.line(`${cleanup}:;`);
    this.line(`aug_lock_restore(${locks});`);
    this.line(`aug_scope_restore(${depth});`);
    for (const slot of this.owned) if (!ownedBefore.has(slot))
      this.line(`aug_drop(${this.slot(slot)}); ${this.slot(slot)} = aug_scalar_null();`);
    this.line(`${this.slot(pending)} = aug_has_error ? aug_take_error() : aug_scalar_null();`);
    this.line(`${cancellation} = aug_cancelled; aug_cancelled = false;`);
    this.loop = undefined; this.errorTarget = done; this.returnTarget = done; this.emitScoped(stmt.always!);
    this.line(`${done}:; aug_cancelled = ${cancellation};`);
    this.line(`if (!aug_has_error && ${this.slot(pending)}.tag != AUG_NULL) aug_throw(${this.slot(pending)});`);
    this.line(`if (aug_cancelled || ${reason} == 1) goto ${outerReturn};`);
    this.line(`if (aug_has_error || ${reason} == 2) goto ${outerError};`);
    this.errorTarget = outerError; this.returnTarget = outerReturn; this.loop = outerLoop;
    if (outerLoop) {
      this.line(`if (${reason} == 3) {`); this.loopExit(outerLoop.breaking); this.line('}');
      this.line(`if (${reason} == 4) {`); this.loopExit(outerLoop.continuing); this.line('}');
    }
    this.line(`goto ${after}; ${after}:;`);
    this.errorTarget = outerError; this.returnTarget = outerReturn;
  }

  private emitScoped(body: Stmt[], joinBeforeDrop = false): void {
    const names = new Set(this.locals.keys());
    const owned = new Set(this.owned);
    for (const stmt of body) this.emitStatement(stmt);
    const endingOwned = [...this.owned].filter(slot => !owned.has(slot));
    if (joinBeforeDrop && endingOwned.length) this.line('aug_scope_join_to(aug_scope_depth() - 1);');
    for (const slot of endingOwned) {
      this.line(`aug_drop(${this.slot(slot)}); ${this.slot(slot)} = aug_scalar_null();`);
    }
    if (endingOwned.length) {
      this.line(`if (aug_has_error) goto ${this.errorTarget};`);
      this.line(`if (aug_cancelled) goto ${this.returnTarget};`);
    }
    for (const name of this.locals.keys()) if (!names.has(name)) this.locals.delete(name);
  }

  finish(name: string, method: boolean, paramCount: number): string {
    const body = this.lines.map(line => `  ${line}`).join('\n')
      // Match complete C strings first so source text and #line paths are never
      // interpreted as generated identifiers or slot references.
      .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\broots\[(\d+)\]|\baug_has_error\b|\baug_cancelled\b/g, (token, index) => {
        if (index !== undefined) return this.scalarSlots.has(Number(index)) ? `scalar_${index}` : token;
        if (token === 'aug_has_error') return 'aug_execution->has_error';
        if (token === 'aug_cancelled') return 'aug_execution->cancelled';
        return token;
      });
    const ownedCleanup = [...this.owned].map(slot =>
      `  if (${this.slot(slot)}.tag != AUG_NULL) { aug_drop(${this.slot(slot)}); ${this.slot(slot)} = aug_scalar_null(); }`).join('\n');
    return [
      `static AugValue ${name}(${method ? 'AugValue self, ' : ''}AugValue *args, int count) {`,
      `  (void)args; (void)count;`,
      ...(body.includes('aug_execution->') ? [`  AugExecution *aug_execution = aug_execution_current();`] : []),
      ...[...this.scalarSlots].map(slot => `  AugValue scalar_${slot} = {0};`),
      `  AugValue roots[${Math.max(1, this.slots)}] = {0};`,
      `  AugFrame frame; aug_frame_enter(&frame, roots, ${Math.max(1, this.slots)});`,
      `  size_t aug_scope_base = aug_scope_depth();`,
      `  size_t aug_lock_base = aug_lock_depth();`,
      `  ${this.slot(0)} = aug_scalar_null();`,
      body,
      `aug_cleanup:;`,
      `  aug_lock_restore(aug_lock_base);`,
      `  aug_scope_join_to(aug_scope_base);`,
      ownedCleanup,
      ...[...this.constructorResults].map(slot => `  aug_constructor_result_cleanup(${this.slot(slot)}, ${this.slot(0)});`),
      `  aug_scope_restore(aug_scope_base);`,
      `  AugValue result = ${this.slot(0)};`,
      `  aug_frame_leave(&frame);`,
      `  return result;`,
      `}`,
    ].join('\n');
  }
}
