import type {Diagnostic, Expr, InterceptorAnnotation, MethodDecl, Param} from './ast.ts';

export const httpPolicyNames = ['RequireLogin','RequirePermission','LogRequest','RateLimit','Timeout','Cors','Compress'] as const;
export type HttpPolicyName = typeof httpPolicyNames[number];
export function httpPolicyNativeName(name: HttpPolicyName): string {
  return 'AUG_HTTP_POLICY_' + name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}
export const httpPolicyOptions:Record<HttpPolicyName,Record<string,string>>={
  RequireLogin:{authentication:'dependency:Authentication.authenticate'},
  RequirePermission:{authentication:'dependency:Authentication.authenticate',authorization:'dependency:Authorization.authorize',permission:'string'},
  LogRequest:{logger:'dependency:RequestLogger.complete'},
  RateLimit:{requests:'int',seconds:'int'}, Timeout:{milliseconds:'int'},
  Cors:{origins:'strings',headers:'optional strings',credentials:'optional bool'}, Compress:{},
};
export const httpPolicyOptionHelp:Record<string,string>={
  authentication:'Map an explicit resolve Authentication input. The compiler infers input.authenticate. Missing identity returns 401 before wire decoding.',
  authorization:'Map an explicit resolve Authorization input. The compiler infers input.authorize. Denied permission returns 403.',
  permission:'Literal nonempty permission checked by the authorization adapter.',
  logger:'Map an explicit resolve RequestLogger input. The compiler infers input.complete. The logger runs after completion or disconnect; put LogRequest first to observe rejected requests.',
  requests:'Literal request count per trusted transport peer and endpoint, from 1 to 1000000. Excess returns 429.',
  seconds:'Literal fixed-window duration, from 1 to 86400 seconds.',
  milliseconds:'Literal deadline from 1 to 3600000 milliseconds, covering handler, child tasks and response transport. Before output it returns 504; after output it closes the stream.',
  origins:'Literal list of exact HTTP(S) origins. "*" is allowed only without credentials. A disallowed supplied Origin returns 403.',
  headers:'Optional literal list of permitted CORS request header names. Preflight checks every requested header.',
  credentials:'Optional literal boolean enabling credentialed CORS. Default false; wildcard origins cannot enable it.',
};
export interface HttpPolicyPlan {
  name: HttpPolicyName;
  annotation: InterceptorAnnotation;
  options: Record<string,string | number | boolean | string[]>;
  dependencies: number[];
}

/** Policy configuration is literal; service dependencies are explicit endpoint inputs. */
export function checkHttpPolicy(annotation: InterceptorAnnotation, fn: MethodDecl, diagnostics: Diagnostic[], canonical: (param:Param, type:string)=>boolean): HttpPolicyPlan {
  const name=annotation.name as HttpPolicyName, options:HttpPolicyPlan['options']={}, dependencies:number[]=[];
  const report=(message:string)=>diagnostics.push({...annotation.span,code:'HTTP',message});
  const specs=httpPolicyOptions;
  const seen=new Set<string>();
  for(const entry of annotation.mappings) {
    if(seen.has(entry.name)){report(`Duplicate ${name} option ${entry.name}`);continue;}seen.add(entry.name);
    const spec=specs[name][entry.name];if(!spec){report(`${name} has no option ${entry.name}`);continue;}
    if(spec.startsWith('dependency:')) {
      const [type,operation]=spec.slice(11).split('.'),index=fn.params.findIndex(param=>param.name===entry.source);
      const param=fn.params[index];
      if(entry.value||!param?.injected||param.type.name!==type||param.type.nullable||param.type.optional)report(`${name}.${entry.name} maps an explicit resolve ${type} endpoint parameter`);
      else if(!canonical(param,type))report(`${name}.${entry.name} requires the august.web ${type} capability`);
      else {dependencies[Object.keys(specs[name]).filter(key=>specs[name][key].startsWith('dependency:')).indexOf(entry.name)]=index;if(fn.uses?.length&&!fn.uses.some(effect=>effect.source===param.name&&effect.operation===operation))report(`Declare uses ${param.name}.${operation} for ${name}`);}
      continue;
    }
    const value=entry.value, wanted=spec.replace(/^optional /,'');
    const literal=(value:Expr|undefined):value is Extract<Expr,{kind:'literal'}>=>value?.kind==='literal';
    if(wanted==='strings'&&value?.kind==='collection'&&value.collection==='List'&&value.items.every(item=>literal(item)&&typeof item.value==='string'))
      options[entry.name]=value.items.map(item=>(item as Extract<Expr,{kind:'literal'}>).value as string);
    else if(literal(value)&&(wanted==='string'&&typeof value.value==='string'||wanted==='bool'&&typeof value.value==='boolean'||wanted==='int'&&typeof value.value==='number'&&value.numericType!=='float'&&Number.isSafeInteger(value.value)))options[entry.name]=value.value as string|number|boolean;
    else report(`${name}.${entry.name} requires a literal ${wanted}`);
  }
  for(const [option,spec] of Object.entries(specs[name]))if(!spec.startsWith('optional ')&&!seen.has(option))report(`${name} requires ${option}`);
  if(annotation.typeArgs.length)report(`${name} does not take type arguments`);
  if(name==='RateLimit'&&(!Number.isInteger(options.requests)||Number(options.requests)<1||Number(options.requests)>1000000||!Number.isInteger(options.seconds)||Number(options.seconds)<1||Number(options.seconds)>86400))report('RateLimit requests must be 1..1000000 and seconds 1..86400');
  if(name==='Timeout'&&(!Number.isInteger(options.milliseconds)||Number(options.milliseconds)<1||Number(options.milliseconds)>3600000))report('Timeout milliseconds must be 1..3600000');
  if(name==='RequirePermission'&&(!options.permission||/[\x00-\x1f]/.test(String(options.permission))))report('RequirePermission needs a nonempty permission without controls');
  if(name==='Cors') {
    const origins=options.origins as string[]|undefined;
    if(!origins?.length||origins.some(origin=>{if(origin==='*')return !!options.credentials;try{const url=new URL(origin);return !['https:','http:'].includes(url.protocol)||url.origin!==origin;}catch{return true;}}))report('Cors origins are exact HTTP(S) origins; wildcard cannot use credentials');
    if((options.headers as string[]|undefined)?.some(header=>! /^[!#$%&'*+.^_`|~0-9a-z-]+$/i.test(header)))report('Cors headers contain HTTP field names');
  }
  return {name,annotation,options,dependencies};
}
