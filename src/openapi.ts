import { callableResult } from './contracts.ts';
import {createHash} from 'node:crypto';
import type {Diagnostic, Expr, MethodDecl, Span, Stmt} from './ast.ts';
import type {CheckedProject} from './checker.ts';
import type {Definition} from './project.ts';
import type {Ty} from './types.ts';
import {schemaType} from './schemas.ts';
import {callableDocumentation} from './documentation.ts';

type Schema = Record<string, unknown>;
interface Variant {status: number; type: Ty}
const primitive = (name: string): Ty => ({id:'builtin:' + name, name, kind:'builtin', args:[], nullable:false});
const problem: Schema = {type:'object', required:['type','title','status'], properties:{type:{type:'string', format:'uri-reference'}, title:{type:'string'}, status:{type:'integer', minimum:400, maximum:599}}};
function nodes(value: unknown, visit: (node: Record<string, unknown>) => void): void {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {value.forEach(child => nodes(child, visit)); return;}
  visit(value as Record<string, unknown>);
  for (const [key, child] of Object.entries(value)) if (!['span','type'].includes(key)) nodes(child, visit);
}

/** Build a contract from served declarations and checked returns; untyped wire values fail the enabled build. */
export function generateOpenApi(checked: CheckedProject) {
  const project = checked.project, config = project.config.openapi;
  const diagnostics: Diagnostic[] = [], schemas: Record<string, Schema> = {}, paths: Record<string, Record<string, unknown>> = {};
  const seenTypes = new Map<string,string>();
  const report = (span: Span, message: string) => diagnostics.push({...span, code:'OPENAPI', message});
  const schema = (type: Ty, span: Span): Schema => {
    const base = {...type, optional:false, nullable:false};
    let result: Schema;
    if (['int','c_int'].includes(base.name)) result = {type:'integer', format:base.name === 'int' ? 'int64' : 'int32'};
    else if (base.name === 'float') result = {type:'number', format:'double'};
    else if (['string','bool','Html','Bytes'].includes(base.name)) result = {type:base.name === 'bool' ? 'boolean' : 'string'};
    else if (['List','Set'].includes(base.name)) result = {type:'array', items:schema(base.args[0], span), ...(base.name === 'Set' ? {uniqueItems:true} : {})};
    else if (base.name === 'Tuple') result = {type:'array', prefixItems:base.args.map(item => schema(item, span)), minItems:base.args.length, maxItems:base.args.length};
    else if (base.name === 'Map' && base.args[0]?.name === 'string') result = {type:'object', additionalProperties:schema(base.args[1], span)};
    else if (base.def?.node.kind === 'class' && base.def.node.record) {
      const identity = (type: Ty): unknown => [type.id, type.nullable, !!type.optional, type.args.map(identity)];
      const key = JSON.stringify(identity(base));
      let name = seenTypes.get(key);
      if (!name) {
        name = base.name + '_' + createHash('sha256').update(key).digest('hex').slice(0,8);
        seenTypes.set(key,name); schemas[name] = {};
        const record = base.def.node, params = new Map(record.typeParams.map((param,index) => [param,base.args[index]]));
        const properties: Record<string, Schema> = {}, required: string[] = [];
        for (const field of record.fields) {
          if (field.name.startsWith('_')) report(field.span, 'Private fields cannot appear in public JSON contracts');
          const type = schemaType(project, field.type, base.def.file, params);
          properties[field.name] = schema(type, field.span);
          if (!type.optional) required.push(field.name);
        }
        schemas[name] = {type:'object', properties, required, additionalProperties:false};
      }
      result = {$ref:'#/components/schemas/' + name};
    } else {report(span, `${base.name} has no complete OpenAPI schema; expose a concrete data record`); result = {};}
    if (type.nullable) result = typeof result.type === 'string' ? {...result, type:[result.type,'null']} : {anyOf:[result,{type:'null'}]};
    return result;
  };
  const variants = (fn: MethodDecl, visiting = new Set<MethodDecl>()): Variant[] => {
    if (visiting.has(fn)) {report(fn.span, 'Recursive response helpers need a concrete response contract'); return [];}
    visiting = new Set([...visiting,fn]); const result: Variant[] = [];
    nodes(fn.body, node => {
      if (node.kind !== 'return') return;
      const expr = node.value as Expr | undefined;
      if (!expr) {result.push({status:fn.endpoint?.status ?? 200, type:primitive('void')}); return;}
      const type = checked.expressionTypes.get(expr) ?? callableResult(checked, fn);
      if (expr.kind === 'call' && expr.callee.kind === 'name' && type.name === 'HttpResponse') {
        if (expr.callee.name !== 'HttpResponse') {
          const def = project.scopes.get(fn.span.file)?.get(expr.callee.name);
          if (def?.node.kind === 'function') {result.push(...variants(def.node,visiting)); return;}
        } else {
          const plan = checked.callPlans.get(expr), source = plan?.sourceIndices[0], statusIndex = plan?.sourceIndices[1];
          let status = 200;
          if (statusIndex !== undefined) {
            const value = expr.args[statusIndex];
            if (value.kind !== 'literal' || typeof value.value !== 'number') {report(value.span, 'OpenAPI response statuses must be explicit constants'); return;}
            status = value.value;
          }
          const body = source === undefined ? undefined : expr.args[source];
          let bodyType = body ? checked.expressionTypes.get(body) ?? type.args[0] : primitive('void');
          if (body?.kind === 'call' && body.callee.kind === 'name' && body.callee.name === 'Json') {
            const index = checked.callPlans.get(body)?.sourceIndices[0];
            if (index !== undefined) bodyType = checked.expressionTypes.get(body.args[index]) ?? bodyType;
          }
          result.push({status, type:bodyType}); return;
        }
      }
      if (type.name === 'HttpResponse') {report(expr.span, 'A dynamic HttpResponse needs explicit, discoverable response variants'); return;}
      if (type.name === 'Json' && expr.kind === 'call' && expr.callee.kind === 'name' && expr.callee.name === 'Json') {
        const index = checked.callPlans.get(expr)?.sourceIndices[0];
        if (index !== undefined) {result.push({status:fn.endpoint?.status ?? 200, type:checked.expressionTypes.get(expr.args[index]) ?? type}); return;}
      }
      result.push({status:fn.endpoint?.status ?? 200, type});
    });
    if (!result.length && callableResult(checked, fn).name !== 'HttpResponse') result.push({status:fn.endpoint?.status ?? 200, type:callableResult(checked, fn)});
    return result;
  };
  const served = new Map<string,Definition>();
  nodes(project.main?.items, node => {if (node.kind === 'serve') for (const name of node.names as string[]) {
    const def = project.scopes.get(project.main!.path)?.get(name); if (def?.node.kind === 'function' && def.node.endpoint) served.set(def.id,def);
  }});
  for (const def of served.values()) {
    const fn = def.node as MethodDecl, endpoint = fn.endpoint!, doc = callableDocumentation(project,fn);
    if ([config.path, config.docs, config.docs + '/client.js'].includes(endpoint.path)) report(fn.span, 'Endpoint path conflicts with configured OpenAPI routes');
    const responses: Record<string,{description:string; content?:Record<string,{schema?:Schema;itemSchema?:Schema}>}> = {};
    const response = (status: number, media: string, value: Schema) => {
      const result = responses[status] ??= {description:status < 400 ? 'Successful response' : 'Error response', content:{}};
      const current = result.content![media];
      if (!current) result.content![media] = {schema:value};
      else if (JSON.stringify(current.schema) !== JSON.stringify(value)) current.schema = {oneOf:[current.schema,value]};
    };
    if(endpoint.streams) {
      const item=callableResult(checked, fn),sse=item.name==='ServerEvent';
      const itemSchema=sse?{type:'object',required:['data'],properties:{data:{type:'string',contentMediaType:'application/json',contentSchema:schema(item.args[0],fn.span)},id:{type:'string'},event:{type:'string'},retry:{type:'integer',minimum:0}}}:schema(item,fn.span);
      responses[endpoint.status]={description:'Streaming response',content:{[sse?'text/event-stream':item.name==='Html'?'text/html':'application/octet-stream']:{itemSchema}}};
    }
    for (const variant of endpoint.streams ? [] : variants(fn)) {
      if (variant.type.name === 'void' || [204,304].includes(variant.status)) responses[variant.status] = {description:'Response with no body'};
      else response(variant.status, variant.type.name === 'Html' ? 'text/html' : variant.type.name === 'Bytes' ? 'application/octet-stream' : 'application/json', schema(variant.type,fn.span));
    }
    const parameters: unknown[] = []; let requestBody: unknown;
    const bodies = fn.params.filter(param => ['body','form'].includes(param.source?.kind ?? ''));
    for (const param of fn.params) {
      if (!param.source || ['body','form','request'].includes(param.source.kind)) continue;
      const type = schemaType(project,param.type,def.file);
      parameters.push({name:param.source.name ?? param.name, in:param.source.kind, required:param.source.kind === 'path' || !type.optional,
        schema:schema(type,param.span), ...(doc?.parameters.get(param.name) ? {description:doc.parameters.get(param.name)} : {})});
    }
    if (bodies.length) {
      const param = bodies[0], type = schemaType(project,param.type,def.file);
      requestBody = {required:!type.optional, content:{[param.source!.kind === 'form' ? 'application/x-www-form-urlencoded' : 'application/json']:{schema:schema(type,param.span)}}};
    } else if (fn.params.some(param => param.source?.kind === 'request')) {
      nodes(fn.body, node => {
        const call = node as unknown as Expr;
        if (call.kind === 'call' && call.callee.kind === 'member' && call.callee.name === 'form' && call.typeArgs[0])
          requestBody = {required:true, content:{'application/x-www-form-urlencoded':{schema:schema(schemaType(project,call.typeArgs[0],def.file),call.span)}}};
      });
    }
    const errors = new Set([500, ...endpoint.errors.map(error => error.status), ...fn.throws.map(error => endpoint.errors.find(mapped => mapped.type.name === error.name)?.status ?? 500)]);
    const policies=checked.httpPolicies.get(fn)??[];
    for(const policy of policies)for(const status of policy.name==='RequireLogin'?[401]:policy.name==='RequirePermission'?[401,403]:policy.name==='RateLimit'?[429]:policy.name==='Timeout'?[504]:policy.name==='Cors'?[400,403]:[])errors.add(status);
    if (parameters.length || bodies.length) errors.add(400);
    if (requestBody) {errors.add(413); errors.add(415); if (bodies.some(param => param.source?.kind === 'body')) errors.add(422);}
    for (const status of errors) response(status,'application/problem+json',problem);
    (paths[endpoint.path] ??= {})[endpoint.method.toLowerCase()] = {operationId:def.name, ...(doc ? {description:doc.markdown} : {}), parameters, ...(requestBody ? {requestBody} : {}), responses,
      ...(policies.length?{'x-august-policies':policies.map(policy=>({name:policy.name,...policy.options,dependencies:policy.dependencies.map(index=>fn.params[index].name)}))}:{})};
  }
  const document = {openapi:'3.2.1', jsonSchemaDialect:'https://json-schema.org/draft/2020-12/schema', info:{title:config.title, version:config.version}, paths, components:{schemas}};
  return {document, diagnostics};
}

export function apiExplorer(specPath: string, clientPath: string): string {
  const attr = (value: string) => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
  return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>August API</title><body style="font:16px system-ui;max-width:1000px;margin:40px auto;padding:20px"><h1>August API</h1><p>Contracts generated from served August endpoints.</p><main id="api" data-spec="' + attr(specPath) + '">Loading API…</main><script src="' + attr(clientPath) + '" defer></script></body></html>';
}
export const apiExplorerScript = `const root=document.getElementById('api');
const text=(tag,value)=>{const node=document.createElement(tag);node.textContent=value;return node};
fetch(root.dataset.spec).then(r=>r.json()).then(spec=>{root.textContent='';document.title=spec.info.title;for(const [path,methods] of Object.entries(spec.paths))for(const [method,op] of Object.entries(methods)){
const block=document.createElement('section');block.style.cssText='border:1px solid #ccd;padding:20px;border-radius:12px;margin:16px 0';block.append(text('h2',method.toUpperCase()+' '+path),text('p',op.description||op.operationId));
const form=document.createElement('form');const inputs=[];for(const p of op.parameters||[]){const label=text('label',p.in+' '+p.name+' ');const input=document.createElement('input');input.required=p.required;label.append(input);form.append(label);inputs.push([p,input]);}
let body;if(op.requestBody){body=document.createElement('textarea');body.placeholder='Request body';body.rows=5;body.style.display='block';form.append(body);}
const button=text('button','Send request');button.type='submit';const output=text('pre','');output.style.whiteSpace='pre-wrap';form.append(button);block.append(form,output);root.append(block);
form.addEventListener('submit',async event=>{event.preventDefault();let target=path;const query=new URLSearchParams(),headers={};for(const [p,input]of inputs){if(p.in==='path')target=target.replace('{'+p.name+'}',encodeURIComponent(input.value));else if(p.in==='query'&&input.value)query.append(p.name,input.value);else if(p.in==='header'&&input.value)headers[p.name]=input.value;}
const media=op.requestBody&&Object.keys(op.requestBody.content)[0];if(media)headers['content-type']=media;button.disabled=true;try{const r=await fetch(target+(query.size?'?'+query:''),{method:method.toUpperCase(),headers,body:body?body.value:undefined});output.textContent=r.status+' '+r.statusText+'\\n'+await r.text();}catch(error){output.textContent=String(error);}finally{button.disabled=false;}});
}}).catch(error=>root.textContent=String(error));`;
