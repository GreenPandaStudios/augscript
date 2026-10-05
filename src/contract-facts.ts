import {defaultText} from './parameters.ts';
import type {ClassDecl,GenericHeader,MethodDecl,Param,Span} from './ast.ts';
import {fieldsOf,syntheticType,typeName} from './ast.ts';
import {tyName,type CheckedProject} from './checker.ts';
import {javadocBefore} from './javadoc.ts';
import {interceptorBehavior} from './interceptors.ts';
import {callableResult,callableErrors} from './contracts.ts';
import {nativeFact,nativeDependencies,type NativeFunctionFact,type NativeResourceFact} from './native-facts.ts';

const genericFacts = (header: GenericHeader) => header.typeParams.map(name => ({ name,
  variance: header.typeVariance?.[name] ?? 'invariant', constraints: (header.typeConstraints?.[name] ?? []).map(typeName) }));

export interface CallableFact {
  native?:NativeFunctionFact; nativeDependencies:NativeFunctionFact[]; nativeCoverage:'resolved-standalone-calls';
  name: string; location: Span; inputs: { label: string; name: string; type: string; ownership: string; injected: boolean; default?: string; source?:Param['source'] }[];
  result: string; genericParameters: ReturnType<typeof genericFacts>; changes: string[]; capabilities: string[]; inferredEffects: boolean; errors: string[];
  http?: {method:string; path:string; status:number; streaming:boolean; errors:{type:string;status:number}[]};
  policies: {name:string; order:number; options:Record<string,string|number|boolean|string[]>; dependencies:string[]}[];
  interceptors: { name: string; order: number; location: Span; dependencies: string[]; changes: string[]; capabilities: string[];
    errors: string[]; delegates: boolean; mayShortCircuit: boolean }[];
}
export interface ContractFact {
  native?:NativeResourceFact;
  id: string; name: string; kind: string; location: Span; public: boolean; documentation?: string;
  typeParameters: string[]; genericParameters: ReturnType<typeof genericFacts>; interfaces: string[];
  fields: { label: string; storage: string; type: string; mutable: boolean; injected: boolean; ownership: string }[];
  callables: CallableFact[]; calls: { target: string; location: Span }[];
  functionValues: {target:string;location:Span;kind:'reference'|'call'}[]; tests: { group: string; name: string; location: Span }[];
}
export function contractFacts(checked: CheckedProject): ContractFact[] {
  const { project } = checked;
  const callable = (method: MethodDecl, constructor?: ClassDecl): CallableFact => {
    const contract = checked.effectContracts.get(method);
    const layers = checked.interceptorPlans.get(constructor ?? method) ?? [];
    const native=nativeFact(checked,method);
    return { name: method.name, location: method.span, genericParameters: genericFacts(method),
      native:native?.kind==='function'?native:undefined,nativeDependencies:nativeDependencies(checked,method),nativeCoverage:'resolved-standalone-calls',
      inputs: method.params.map(param => ({ label: param.label ?? param.name, name: param.name,
        type: typeName(param.type), ownership: param.ownership, injected: param.injected, default:param.defaultValue ? defaultText(param.defaultValue) : undefined, source:param.source })),
      http:method.endpoint?{method:method.endpoint.method,path:method.endpoint.path,status:method.endpoint.status,
        streaming:!!method.endpoint.streams,errors:method.endpoint.errors.map(error=>({type:typeName(error.type),status:error.status}))}:undefined,
      policies:(checked.httpPolicies.get(method)??[]).map((policy,index)=>({name:policy.name,order:index+1,options:policy.options,
        dependencies:policy.dependencies.map(index=>method.params[index]?.label??method.params[index]?.name??'')})),
      result: `${method.returnOwnership === 'own' ? 'own ' : ''}${tyName(callableResult(checked, method))}`,
      changes: [...(contract?.changes ?? method.changes ?? [])],
      capabilities: [...(contract?.uses.values() ?? [])].map(effect => `${effect.source}.${effect.operation}`).concat(method.externC&&!native ? [`C.${method.name}`] : []),
      inferredEffects: !!contract?.inferred,
      errors: constructor ? [...new Set([...(checked.constructorContracts.get(constructor)?.errors.map(tyName) ?? constructor.validationErrors?.map(typeName) ?? []),
        ...layers.flatMap(layer => layer.errors.map(tyName))])].sort() : callableErrors(checked, method),
      interceptors: layers.map((layer, order) => {
        const effects = layer.effects;
        return { name: layer.definition.name, order: order + 1, location: layer.definition.node.span,
          dependencies: [...new Set([...(layer.definition.node.kind === 'interceptor' ? layer.definition.node.fields : []), ...layer.around.params].filter(param => param.injected).map(param => typeName(param.type)))],
          changes: [...(effects?.changes ?? layer.around.changes ?? [])],
          capabilities: [...(effects?.uses.values() ?? [])].map(effect => `${effect.source}.${effect.operation}`), errors: layer.errors.map(tyName),
          ...interceptorBehavior(layer.around.body ?? []) };
      }) };
  };
  return [...project.definitions.values()].map(def => {
    const node = def.node, file = project.files.get(def.file)!;
    const methods = node.kind === 'function' ? [node] : 'methods' in node ? node.methods : [];
    const calls: ContractFact['calls'] = [], functionValues:ContractFact['functionValues']=[];
    const visit = (value: unknown, deferred=false) => {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach(child=>visit(child,deferred)); return; }
      const copy = value as import('./ast.ts').Expr;
      if(copy.kind==='lambda')deferred=true;
      const reference=checked.functionValues.get(copy)?.target;
      if(reference)functionValues.push({target:reference.id,location:copy.span,kind:'reference'});
      const callFact=(target:string,location:Span)=>deferred?functionValues.push({target,location,kind:'call'}):calls.push({target,location});
      if (copy.kind === 'recordCopy') {const target=checked.expressionTypes.get(copy.base)?.def; if(target)callFact(target.id,copy.span);}
      const call = value as { kind?: string; callee?: { kind?: string; name?: string; object?: import('./ast.ts').Expr }; span?: Span };
      if (call.kind === 'call' && call.callee?.kind === 'name' && call.span) {
        const target = project.scopes.get(call.span.file)?.get(call.callee.name!);
        if (target) callFact(target.id,call.span);
      }
      if (call.kind === 'call' && call.callee?.kind === 'member' && call.callee.object && call.span) {
        const target = checked.expressionTypes.get(call.callee.object)?.def;
        if (target) callFact(target.id,call.span);
      }
      for (const [key, child] of Object.entries(value)) if (!['span', 'nameSpan', 'sourceSpan'].includes(key)) visit(child,deferred);
    };
    visit(node);
    const native=node.kind==='resource'?nativeFact(checked,node):undefined;
    return { id: def.id, name: def.name, kind: node.kind === 'class' && node.record ? 'record' :
      node.kind === 'interface' && node.capability ? 'capability' : node.kind,
      native:native?.kind==='resource'?native:undefined,
      location: node.span, public: !node.name.startsWith('_'), typeParameters: node.typeParams, genericParameters: genericFacts(node),
      documentation: javadocBefore(file.source, 'annotations' in node ? node.annotations?.[0]?.span.start ?? node.span.start : node.span.start)?.markdown,
      interfaces: node.kind === 'class' ? node.implements.map(typeName) : node.kind === 'interface' ? node.extends.map(typeName) : [],
      fields: 'fields' in node ? fieldsOf(node).map(field => ({ label: field.label ?? field.name, storage: field.name, type: typeName(field.type),
        mutable: !!field.mutable, injected: field.injected, ownership: field.ownership })) : [],
      callables: [...(node.kind === 'class' ? [callable({ kind: 'function', name: node.name, typeParams: node.typeParams,
        typeConstraints: node.typeConstraints, typeVariance: node.typeVariance, params: node.fields,
        returns: syntheticType(node.name, node.span), returnOwnership: 'managed',
        throws: node.validationErrors ?? [], changes: [], uses: [], body: node.constructorBody, externC: false, span: node.span }, node)] : []),
        ...methods.filter(method => node.kind==='function'||!method.name.startsWith('_')).map(method => callable(method))], calls, functionValues,
      tests: file.items.flatMap(item => item.kind === 'test' && item.type.name === def.name ? item.groups.flatMap(group =>
        group.cases.map(test => ({ group: group.name, name: test.name, location: test.span }))) : []) };
  });
}

