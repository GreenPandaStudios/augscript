import { callableResult, callableErrors } from './contracts.ts';
import { dirname, join, relative, resolve, sep } from 'node:path';
import type { ClassDecl, Expr, InterceptorDecl, MethodDecl, Param, SourceFile, Stmt, TypeRef } from './ast.ts';
import { fieldsOf, typeName } from './ast.ts';
import type { CheckedProject, Ty } from './checker.ts';
import { tyName } from './checker.ts';
import { lex } from './lexer.ts';
import { isPrivateName, type Definition } from './project.ts';
import { javadocBefore, type Javadoc } from './javadoc.ts';
import { languageHelp } from './help.ts';
import { parse } from './parser.ts';
import { builtinFunctions, collectionOperations, errorNames, operationType } from './builtins.ts';
import { callableDocumentation } from './documentation.ts';
import { interceptorBehavior } from './interceptors.ts';
import {httpPolicyNames,httpPolicyOptions,httpPolicyOptionHelp,type HttpPolicyName} from './http-policies.ts';
import {builtinTypes} from './builtins.ts';
import { libraryChild, libraryRelative } from './libraries.ts';
import { importSource, isGitSource, sourceAlias } from './git-packages.ts';
import { snippetBody, snippetCatalog } from './snippets.ts';
import {nativeFact,nativeDependencies,nativeDescription} from './native-facts.ts';
import {pathToFileURL} from 'node:url';

export interface EditorItem {
  label: string;
  kind: 'class' | 'interface' | 'interceptor' | 'function' | 'method' | 'property' |
    'variable' | 'parameter' | 'keyword' | 'type' | 'snippet';
  detail: string;
  documentation?: string;
  signature?: string;
  parameters?: string[];
  parameterDocumentation?: (string | undefined)[];
  insertText?: string;
  replacement?: { start: number; end: number };
  additionalEdits?: { start: number; end: number; text: string }[];
  sortText?: string;
}

export interface EditorToken {
  line: number;
  start: number;
  length: number;
  type: 'keyword' | 'class' | 'interface' | 'decorator' | 'function' | 'method' | 'property' |
    'variable' | 'parameter' | 'typeParameter' | 'type';
  declaration: boolean;
}

export interface EditorHover extends EditorItem {
  start: number;
  end: number;
}

type LocalInfo = { type?: Ty; typeText: string; kind: 'variable' | 'parameter' | 'property';
  documentation?: string };

const builtins: EditorItem[] = [
  ...builtinFunctions.map(operation => {
    const parameters = operation.parameters.map(param => `${param.label}=${param.type}`);
    const signature = `${operation.name}(${parameters.join(', ')})`;
    return { label: operation.name, kind: 'function' as const, signature, parameters,
      detail: `${signature} returns ${operation.returns}` + (operation.errors?.length ? ` unless ${operation.errors.join(' and ')}` : ''),
      documentation: operation.documentation };
  }),
  ...Object.entries(languageHelp).filter(([, help]) => help.category === 'type')
    .map(([label, help]) => ({ label, kind: 'type' as const, detail: help.detail, documentation: help.documentation })),
];

const keywords: EditorItem[] = [
  ...snippetCatalog.map(snippet => ({label:snippet.prefix+' template',kind:'snippet' as const,detail:snippet.description,
    documentation:snippet.description,insertText:snippet.body})),
  {label:'initialize block',kind:'snippet',detail:'Constructor initialization inside a class or record',documentation:languageHelp.initialize.documentation,
    insertText:'initialize:\n    $0'},
  ...Object.entries(languageHelp).filter(([label, help]) => help.category === 'keyword' &&
    !['class', 'function', 'throws', 'bind'].includes(label))
    .map(([label, help]) => ({ label, kind: 'keyword' as const, detail: help.detail,
      documentation: help.documentation })),
  { label: 'try/catch', kind: 'snippet', detail: 'Checked error handler',
    documentation: languageHelp.try.documentation,
    insertText: 'try {\n    $1\n} catch ${2:Error} ${3:error} {\n    $0\n}' },
  { label: 'borrow block', kind: 'snippet', detail: 'Mutable borrow',
    documentation: languageHelp.borrow.documentation,
    insertText: 'borrow ${1:value} {\n    $0\n}' },
  { label: 'interceptor declaration', kind: 'snippet', detail: 'Generic interceptor wrapping any result type',
    documentation: languageHelp.interceptor.documentation,
    insertText: 'interceptor ${1:Audit}<T>() {\n    around() {\n        result = next()\n        $0\n        return result\n    }\n}' },
  { label: 'test suite', kind: 'snippet', detail: 'Same-file class tests with fresh setup per case',
    documentation: languageHelp.test.documentation,
    insertText: 'test ${1:Worker} ${2:worker} {\n    when ${3:ready} {\n        ${2:worker} = ${1:Worker}()\n        it ${4:works} {\n            assert(${5:true})\n        }\n    }\n}' },
  { label: 'test group', kind: 'snippet', detail: 'Group setup and cases',
    documentation: languageHelp.when.documentation,
    insertText: 'when ${1:group} {\n    $0\n    it ${2:works} {\n        assert(${3:true})\n    }\n}' },
  { label: 'test case', kind: 'snippet', detail: 'Named test case', documentation: languageHelp.it.documentation,
    insertText: 'it ${1:works} {\n    assert(${2:true})\n}' },
  {label:'endpoint declaration',kind:'snippet',detail:'Named HTTP endpoint with typed input',documentation:languageHelp.endpoint.documentation,
    insertText:'endpoint ${1:GET} "${2:/users/{id}}" as ${3:getUser}(int id from path) returns ${4:User}:\n    $0'},
  {label:'endpoint test',kind:'snippet',detail:'Exercise the HTTP pipeline beside its declaration',documentation:languageHelp.test.documentation,
    insertText:'test endpoint ${1:getUser} client:\n    when requests:\n        it succeeds:\n            response = client.request(method="GET", path="${2:/users/1}")\n            assert(condition=response.status == 200)\n'},
  {label:'worker scope',kind:'snippet',detail:'Isolated multicore computation',documentation:languageHelp.worker.documentation,
    insertText:'scope:\n    task = start worker ${1:calculate}(${2:values})\n    wait for task as ${3:result}\n    $0'},
  {label:'task scope',kind:'snippet',detail:'Joined child computations',documentation:languageHelp.scope.documentation,
    insertText:'scope:\n    task = start ${1:load}()\n    wait for task as result\n    $0'},
];

function parameterText(param: Param): string {
  return `${param.injected ? 'resolve ' : param.ownership === 'managed' ? '' : `${param.ownership} `}` +
    `${typeName(param.type)} ${param.label ?? param.name}${param.label && param.label !== param.name ? ` to ${param.name}` : ''}` +
    (param.source ? ` from ${param.source.kind}${param.source.name ? ' ' + JSON.stringify(param.source.name) : ''}` : '');
}

function signature(method: MethodDecl, callSite = false, additionalErrors: string[] = [], checked?: CheckedProject): string {
  const generic = method.typeParams.length ? `<${method.typeParams.join(', ')}>` : '';
  const params = callSite ? method.params.filter(param => !param.injected)
    .map(param => `${param.label ?? param.name}=${typeName(param.type)}`) : method.params.map(parameterText);
  const errors = checked ? callableErrors(checked, method) : [...new Set([...method.throws.map(typeName), ...additionalErrors])];
  const contract = checked?.effectContracts.get(method);
  const changes = contract?.changes ?? method.changes ?? [];
  const uses = [...(contract?.uses.values() ?? method.uses ?? [])].map(use => `${use.source}.${use.operation}`);
  return (method.endpoint ? `endpoint ${method.endpoint.method} ${JSON.stringify(method.endpoint.path)} as ` : '') + `${method.name}${generic}(${params.join(', ')}) ${method.endpoint?.streams ? 'streams' : 'returns'} ` +
    `${method.returnOwnership === 'own' ? 'own ' : ''}${checked ? tyName(callableResult(checked, method)) : typeName(method.returns)}` +
    (changes.length ? ` changes ${changes.join(' and ')}` : '') +
    (uses.length ? ` uses ${uses.join(' and ')}` : '') +
    (errors.length ? ` unless ${errors.join(', ')}` : '') +
    (method.endpoint && method.endpoint.status !== 200 ? ` with status ${method.endpoint.status}` : '');
}

function declarationDocumentation(checked: CheckedProject, node: MethodDecl | ClassDecl | InterceptorDecl): Javadoc | undefined {
  const first = 'annotations' in node ? node.annotations?.[0]?.span.start : undefined;
  return documentation(checked, node.span.file, first ?? node.span.start) ??
    documentation(checked, node.span.file, node.span.start);
}

function interceptorDescription(checked: CheckedProject, node: MethodDecl | ClassDecl): string {
  const layers = checked.interceptorPlans.get(node) ?? [];
  const policies=node.kind==='function'?checked.httpPolicies.get(node)??[]:[];
  const policyText=policies.length ? '**HTTP policies before decoding**\n\n'+policies.map((policy,index)=>
    `${index+1}. \`${policy.name}\` ${JSON.stringify(policy.options)}; dependencies: ${policy.dependencies.map(index=>node.kind==='function'?node.params[index].name:'').join(', ')||'none'}.`).join('\n') : '';
  const layerText=layers.length ? `Interceptor chain: ${layers.map(layer => `\`${layer.annotation.name}\``).join(' → ')}. ` +
    'Calls enter in that order; results unwind in reverse.\n\n' + layers.map((layer, index) => {
      const fields = layer.definition.node.kind === 'interceptor' ? layer.definition.node.fields : [];
      const dependencies = [...new Set([...fields, ...layer.around.params].filter(param => param.injected).map(param => typeName(param.type)))];
      const effects = checked.effectContracts.get(layer.around);
      const uses = [...(effects?.uses.values() ?? [])].map(use => `${use.source}.${use.operation}`);
      const behavior = interceptorBehavior(layer.around.body ?? []);
      return `Layer ${index + 1} ${layer.definition.name}: dependencies ${dependencies.join(', ') || 'none'}; ` +
        `changes ${effects?.changes.join(', ') || 'nothing'}; uses ${uses.join(', ') || 'nothing'}; ` +
        `errors ${layer.errors.map(tyName).join(', ') || 'none'}. ${behavior.mayShortCircuit ? 'May short circuit; inspect its definition.' : 'Delegates directly.'}`;
    }).join('\n\n') : '';
  return [policyText,layerText].filter(Boolean).join('\n\n');
}

function documentation(checked: CheckedProject, file: string, offset: number): Javadoc | undefined {
  return javadocBefore(checked.project.files.get(file)?.source ?? '', offset);
}

function interfaceMethodDocumentation(checked: CheckedProject, file: string,
                                      interfaces: TypeRef[], name: string,
                                      visited = new Set<string>()): Javadoc | undefined {
  for (const reference of interfaces) {
    const def = checked.project.scopes.get(file)?.get(reference.name);
    if (!def || def.node.kind !== 'interface' || visited.has(def.id)) continue;
    visited.add(def.id);
    const method = def.node.methods.find(entry => entry.name === name);
    const doc = method && declarationDocumentation(checked, method);
    if (doc) return doc;
    const inherited = interfaceMethodDocumentation(checked, def.file, def.node.extends, name, visited);
    if (inherited) return inherited;
  }
  return undefined;
}

function methodDocumentation(checked: CheckedProject, method: MethodDecl,
                             owner?: Definition): Javadoc | undefined {
  return callableDocumentation(checked.project, method, owner);
}

function methodItem(checked: CheckedProject, method: MethodDecl,
                    kind: 'method' | 'function', owner?: Definition): EditorItem {
  const errors = (checked.interceptorPlans.get(method) ?? []).flatMap(layer => layer.errors.map(tyName));
  const label = signature(method, false, errors, checked);
  const injected = method.params.filter(param => param.injected);
  const doc = methodDocumentation(checked, method, owner);
  const injectionHelp = injected.length ? `Injected from bindings: ${injected.map(parameterText).join(', ')}.` : '';
  const contract = checked.effectContracts.get(method);
  const effects = contract ? `${contract.inferred ? 'Inferred capabilities; effective' : 'Effective'} contract: changes ${contract.changes.join(', ') || 'nothing'}; capabilities ` +
    `${[...contract.uses.values()].map(effect => `${effect.source}.${effect.operation}`).join(', ') || 'none'}.` : '';
  const native=nativeDependencies(checked,method).map(fact=>nativeDescription(fact,
    '[`native.abi.json`]('+pathToFileURL(checked.native.providerDescriptors.get(fact.provider)!).href+')')).join('\n\n');
  return { label: method.name, kind, detail: label, signature: signature(method, true, errors, checked),
    documentation: [doc?.markdown, isPrivateName(method.name) ? 'Private to its declaring type.' : '',
      injectionHelp, effects, native, interceptorDescription(checked, method), 'Call arguments require labels; their order does not matter.']
      .filter(Boolean).join('\n\n'),
    parameters: method.params.filter(param => !param.injected)
      .map(param => `${param.label ?? param.name}=${typeName(param.type)}`),
    parameterDocumentation: method.params.filter(param => !param.injected)
      .map(param => doc?.parameters.get(param.label ?? param.name)) };
}

function definitionItem(checked: CheckedProject, def: Definition): EditorItem {
  const node = def.node;
  if(node.kind==='resource'){
    const native=nativeFact(checked,node);
    return {label:def.name,kind:'type',detail:'extern C resource '+def.name,
      documentation:native?nativeDescription(native,'[`native.abi.json`]('+pathToFileURL(checked.native.providerDescriptors.get(native.provider)!).href+')'):'Opaque native resource. Its package must declare a release identity.'};
  }
  if (node.kind === 'function') return methodItem(checked, node, 'function');
  if (node.kind === 'interface') return { label: def.name, kind: 'interface',
    detail: `interface ${def.name}${node.typeParams.length ? `<${node.typeParams.join(', ')}>` : ''}`,
    documentation: documentation(checked, def.file, node.span.start)?.markdown };
  if (node.kind === 'interceptor') {
    const around = node.methods.find(method => method.name === 'around');
    const params = around?.params.filter(param => !param.injected) ?? [];
    const doc = around && methodDocumentation(checked, around, def);
    return { label: def.name, kind: 'interceptor',
      detail: `interceptor ${node.name}${node.typeParams.length ? `<${node.typeParams.join(', ')}>` : ''}` +
        `(${node.fields.map(parameterText).join(', ')})` + (around ? `\n${signature(around, false, [], checked)}` : ''),
      signature: `${node.name}(${params.map(param => `${param.name}=targetLabel`).join(', ')})`,
      parameters: params.map(param => `${param.name}=targetLabel`),
      parameterDocumentation: params.map(param => [doc?.parameters.get(param.name),
        `Map a target parameter of type ${typeName(param.type)} to ${param.name}. Same-name mappings are automatic.`]
        .filter(Boolean).join('\n\n')),
      documentation: [declarationDocumentation(checked, node)?.markdown, doc?.markdown,
        'Apply with `[Name]` or `[Name(interceptorLabel=targetLabel)]`. A fresh instance is created for each invocation. ' +
        'Generic types are inferred from the target. Constructor parameters come from DI. ' +
        'The around body can call next at most once per execution path.'].filter(Boolean).join('\n\n') };
  }
  if (node.kind === 'composition') return { label: def.name, kind: 'function', detail: `composition ${def.name}`,
    documentation: node.bindings.map(binding => `implement ${binding.key} with ${typeName(binding.target)}`).join('\n') };
  const params = node.fields.map(parameterText);
  const label = `${def.name}${node.typeParams.length ? `<${node.typeParams.join(', ')}>` : ''}(${params.join(', ')})`;
  const doc = declarationDocumentation(checked, node);
  const explicit = node.fields.filter(field => !field.injected);
  const callSignature = `${def.name}${node.typeParams.length ? `<${node.typeParams.join(', ')}>` : ''}` +
    `(${explicit.map(field => `${field.label ?? field.name}=${typeName(field.type)}`).join(', ')})`;
  const errors = [...new Set([...(checked.constructorContracts.get(node)?.errors.map(tyName)??node.validationErrors?.map(typeName)??[]),
    ...(checked.interceptorPlans.get(node) ?? []).flatMap(layer => layer.errors.map(tyName))])];
  return { label: def.name, kind: 'class', detail: `${node.record?'record ':''}${label}` +
      (errors.length ? ` unless ${errors.join(' and ')}` : '') +
      (node.implements.length?` implements ${node.implements.map(typeName).join(', ')}`:''),
    signature: callSignature + (errors.length ? ` unless ${errors.join(', ')}` : ''), parameters: explicit.map(field => `${field.label ?? field.name}=${typeName(field.type)}`),
    documentation: [doc?.markdown,
      node.fields.some(field => field.injected) ? `Injected from bindings: ${node.fields.filter(field => field.injected).map(parameterText).join(', ')}.` : '',
      interceptorDescription(checked, node),
      'Constructor arguments require labels; their order does not matter.'].filter(Boolean).join('\n\n'),
    parameterDocumentation: explicit.map(field => doc?.parameters.get(field.label ?? field.name)) };
}

function typeFromRef(checked: CheckedProject, file: string, ref: TypeRef): Ty {
  const def = checked.project.scopes.get(file)?.get(ref.name);
  return { id: def?.id ?? `builtin:${ref.name}`, name: ref.name,
    kind: def?.node.kind === 'class' || def?.node.kind === 'interface' || def?.node.kind === 'interceptor' || def?.node.kind==='resource' ? def.node.kind : 'builtin',
    args: ref.args.map(arg => typeFromRef(checked, file, arg)), nullable: ref.nullable, def };
}

function collectLocals(checked: CheckedProject, file: SourceFile, offset: number): Map<string, LocalInfo> {
  const scope = [...checked.scopes.values()].filter(scope => scope.span.file === file.path &&
    scope.span.start <= offset && offset <= scope.span.end).sort((left, right) =>
      left.span.end - left.span.start - (right.span.end - right.span.start) || right.span.start - left.span.start)[0];
  return new Map(scope?.locals.map(local => [local.name, { type: local.type, typeText: tyName(local.type),
    kind: local.kind, documentation: [local.documentation, local.moved ? 'This owned value has moved.' : '',
      local.type.readonly ? 'Read-only access.' : ''].filter(Boolean).join('\n\n') }]) ?? []);
}

function memberItems(checked: CheckedProject, file: string, receiver: Ty | undefined,
                     insideClass: boolean, seen = new Set<string>()): EditorItem[] {
  if (!receiver) return [];
  if (collectionOperations[receiver.name] && receiver.id.startsWith('builtin:')) return collectionOperations[receiver.name].map(operation => {
    const parameters = operation.parameters.map(param => `${param.label}=${tyName(operationType(param.type, receiver))}`);
    const signature = `${operation.name}(${parameters.join(', ')})`;
    return { label: operation.name, kind: 'method' as const, parameters, signature,
      detail: `${signature} returns ${operation.returns === 'position' ? 'the selected tuple position' : tyName(operationType(operation.returns, receiver))}` +
        (operation.changes ? ' changes self; requires borrow' : '') + (operation.errors?.length ? ` unless ${operation.errors.join(' and ')}` : ''),
      documentation: operation.documentation };
  });
  const def = receiver.def;
  if (!def || seen.has(def.id)) return [];
  seen.add(def.id);
  const node = def.node;
  if (node.kind === 'class' || node.kind === 'interceptor') {
    const methods = [...node.methods.filter(method => insideClass || !isPrivateName(method.name))
      .map(method => methodItem(checked, method, 'method', def))];
    for (const entry of checked.defaults.get(def.id)?.values() ?? [])
      if ((insideClass || !isPrivateName(entry.method.name)) &&
          !methods.some(item => item.label === entry.method.name))
        methods.push(methodItem(checked, entry.method, 'method'));
    for (const field of fieldsOf(node)) if (insideClass || !isPrivateName(field.name))
      methods.push({ label: field.name,
        kind: 'property', detail: `${typeName(field.type)} ${field.name}` +
          (isPrivateName(field.name) ? ' (private)' : ''),
        documentation: declarationDocumentation(checked, node)?.parameters.get(field.name) });
    return methods;
  }
  if (node.kind === 'interface') {
    const methods = node.methods.filter(method => insideClass || !isPrivateName(method.name))
      .map(method => methodItem(checked, method, 'method', def));
    for (const parent of node.extends) {
      const type = typeFromRef(checked, def.file, parent);
      for (const item of memberItems(checked, file, type, false, seen))
        if (!methods.some(existing => existing.label === item.label)) methods.push(item);
    }
    return methods;
  }
  return [];
}

function unique(items: EditorItem[]): EditorItem[] {
  return [...new Map(items.map(item => [item.label, item])).values()];
}

function nextItem(checked: CheckedProject, file: SourceFile, offset: number): EditorItem | undefined {
  const owner = file.items.find((item): item is InterceptorDecl => item.kind === 'interceptor' &&
    item.span.start <= offset && offset <= item.span.end);
  const around = owner?.methods.find(method => method.name === 'around' &&
    method.span.start <= offset && offset <= method.span.end);
  if (!around) return undefined;
  const params = around.params.filter(param => !param.injected);
  const doc = methodDocumentation(checked, around);
  return { label: 'next', kind: 'function',
    detail: `next(${params.map(param => `${param.name}=${typeName(param.type)}`).join(', ')}) returns ` +
      `${around.returnOwnership === 'own' ? 'own ' : ''}${typeName(around.returns)} (overrides optional)`,
    signature: `next(${params.map(param => `${param.name}=${typeName(param.type)}`).join(', ')}) returns ${typeName(around.returns)}`,
    parameters: params.map(param => `${param.name}=${typeName(param.type)}`),
    parameterDocumentation: params.map(param => [doc?.parameters.get(param.name),
      'Optional override of the mapped target argument. Omit to forward the original value.'].filter(Boolean).join('\n\n')),
    documentation: languageHelp.next.documentation };
}

function annotationTarget(file: SourceFile, open: number): MethodDecl | ClassDecl | undefined {
  for (const node of file.items) {
    const candidates = node.kind === 'class' || node.kind === 'function' ? [node] : [];
    if ('methods' in node) candidates.push(...node.methods);
    const target = candidates.find(candidate => candidate.annotations?.some(tag => tag.span.start === open));
    if (target) return target;
  }
  // An unfinished mapping can prevent the annotation from parsing. The target
  // header that follows it still provides useful labels while the user edits.
  const close = file.source.indexOf(']', open);
  if (close < 0) return undefined;
  return parse(file.path.replace(/main\.aug$/, 'editor.aug'), file.source.slice(close + 1)).file.items
    .find((node): node is MethodDecl | ClassDecl => node.kind === 'function' || node.kind === 'class');
}

export function importItems(checked: CheckedProject, file: SourceFile): EditorItem[] {
  const project = checked.project;
  const items: EditorItem[] = [];
  const currentFolder = dirname(file.path);
  const owner = file.package ? project.packages.scopes.get(file.package) : undefined;
  const aliases = owner ? new Map(Object.entries(owner.dependencies).map(([alias, path]) =>
    [alias, project.packages.scopes.get(path)!])) : project.packages.roots;
  for (const sibling of project.files.values()) {
    if (dirname(sibling.path) !== currentFolder || sibling.path === file.path ||
        sibling.path.endsWith(`${sep}export.aug`) ||
        isPrivateName(sibling.path.slice(currentFolder.length + 1, -4))) continue;
    const from = sibling.path.slice(currentFolder.length + 1, -4);
    for (const item of sibling.items) {
      if (item.kind !== 'class' && item.kind !== 'interface' && item.kind !== 'function' && item.kind !== 'interceptor') continue;
      if (isPrivateName(item.name)) continue;
      items.push({ label: item.name, kind: 'snippet',
        detail: `import ${item.name} from ${from}`, insertText: `${item.name} from ${from}`,
        signature: definitionItem(checked, project.scopes.get(sibling.path)!.get(item.name)!).signature,
        parameters: definitionItem(checked, project.scopes.get(sibling.path)!.get(item.name)!).parameters,
        documentation: item.kind === 'interface' ? documentation(checked, sibling.path, item.span.start)?.markdown :
          declarationDocumentation(checked, item)?.markdown });
    }
  }
  for (const exportFile of project.files.values()) {
    if (!exportFile.path.endsWith(`${sep}export.aug`)) continue;
    if (owner && !exportFile.package && !exportFile.builtin) continue;
    const folder = dirname(exportFile.path);
    if (folder === currentFolder) continue;
    const standard = exportFile.builtin && project.stdlibRoot;
    const scope = exportFile.package ? project.packages.scopes.get(exportFile.package) : undefined;
    const root = scope?.sourceRoot ?? project.sourceRoot;
    const prefixes = standard ? [['august']] : scope && scope !== owner ?
      [...aliases].filter(([, target]) => target === scope).map(([alias]) => [alias]) : [[]];
    if (!prefixes.length) continue;
    const relativeFolder = standard ? libraryRelative(project.libraries, folder) : relative(root, folder);
    if (relativeFolder.startsWith('..')) continue;
    const segments = relativeFolder.split(sep).filter(Boolean);
    if (segments.some(isPrivateName)) continue;
    let exposed = true;
    for (let index = scope && scope !== owner ? 0 : 1; index < segments.length; index++) {
      let parentFolder = standard || root;
      for (const segment of segments.slice(0, index)) parentFolder = standard ?
        libraryChild(project.libraries, parentFolder, segment) : join(parentFolder, segment);
      const parent = join(parentFolder, 'export.aug');
      if (!project.files.get(parent)?.items.some(item => item.kind === 'export' &&
          item.folder && item.name === segments[index])) { exposed = false; break; }
    }
    if (!exposed) continue;
    for (const prefix of prefixes) for (const item of exportFile.items) {
      const specification = (owner?.specifications ?? project.packages.specifications)[prefix[0]];
      const from = isGitSource(specification ?? '') && prefix[0] === sourceAlias(specification) ? importSource([specification, ...segments]) : [...prefix, ...segments].join('.');
      if (!from) continue;
      if (item.kind !== 'export' || item.folder) continue;
      if (isPrivateName(item.name) || (item.from && isPrivateName(item.from))) continue;
      const exported = project.scopes.get(join(folder, `${item.from}.aug`))?.get(item.name);
      items.push({ label: item.name, kind: 'snippet',
        detail: `import ${item.name} from ${from}`, insertText: `${item.name} from ${from}`,
        signature: exported && definitionItem(checked, exported).signature,
        parameters: exported && definitionItem(checked, exported).parameters,
        documentation: exported && definitionItem(checked, exported).documentation });
    }
  }
  return items;
}

function rawCompletions(checked: CheckedProject, fileName: string, offset: number): EditorItem[] {
  const file = checked.project.files.get(resolve(fileName));
  if (!file) return [];
  const prefix = file.source.slice(0, offset);
  const line = prefix.slice(prefix.lastIndexOf('\n') + 1);
  const imports = importItems(checked, file);
  if (/^\s*import\s+[A-Za-z_0-9]*$/.test(line)) return imports;
  const joined = /^\s*import\s+(.+?)\s+and\s+[A-Za-z_0-9]*$/.exec(line);
  if (joined) {
    const used = new Set(joined[1].split(/\s+and\s+/));
    return unique(imports.filter(item => !used.has(item.label)).map(item => ({ ...item, kind: 'snippet', insertText: item.label })));
  }
  const from = /^\s*import\s+(.+?)\s+from\s+([A-Za-z_0-9.]*|"[^"\n]*"?(?:\.[A-Za-z_0-9.]*)?)$/.exec(line);
  if (from) return unique(imports.filter(item => from[1] === 'everything' || item.label === from[1].split(/\s+and\s+/)[0]).map(item => {
    const path = item.detail.slice(item.detail.lastIndexOf(' from ') + 6);
    return { label: path, kind: 'snippet' as const, detail: item.detail,
      insertText: path, documentation: item.documentation,
      replacement: { start: offset - from[2].length, end: offset } };
  }));
  const annotation = /(?<=^|\n)[ \t]*\[\s*([A-Za-z_][A-Za-z0-9_]*|)(?:<[^\[\]()]*>)?(?:\(([^\n()]*))?$/.exec(prefix);
  if (annotation) {
    const definitions = [...(checked.project.scopes.get(file.path)?.values() ?? [])]
      .filter(def => def.node.kind === 'interceptor');
    if (annotation[2] === undefined) return [...definitions.map(def => definitionItem(checked, def)), ...httpPolicyNames.map(label=>({label,kind:'interceptor' as const,detail:languageHelp[label]?.detail??label,documentation:languageHelp[label]?.documentation}))];
    const def = definitions.find(def => def.name === annotation[1]);
    const around = def?.node.kind === 'interceptor' ? def.node.methods.find(method => method.name === 'around') : undefined;
    const part = annotation[2].split(',').at(-1) ?? '';
    if(httpPolicyNames.includes(annotation[1] as HttpPolicyName)) {
      const specs=httpPolicyOptions[annotation[1] as HttpPolicyName];
      const selected=/^\s*(\w+)\s*(?:=|to\b)\s*(.*)$/.exec(part);
      if(selected) {
        if(!specs[selected[1]]?.startsWith('dependency:'))return [];
        const target=annotationTarget(file,prefix.indexOf('[',annotation.index));
        const required=specs[selected[1]].slice(11).split('.')[0];
        return (target?.kind==='function'?target.params:[]).filter(param=>param.injected&&param.type.name===required)
          .map(param=>({label:param.name,kind:'parameter',detail:parameterText(param),documentation:httpPolicyOptionHelp[selected[1]]}));
      }
      const used=new Set([...annotation[2].matchAll(/\b(\w+)\s*(?:=|to\b)/g)].map(match=>match[1]));
      return Object.entries(specs).filter(([name])=>!used.has(name)).map(([name,type])=>({
        label:name,kind:'snippet',detail:`${annotation[1]}.${name}: ${type}`,insertText:`${name}=`,documentation:httpPolicyOptionHelp[name],
      }));
    }
    if (/(?:=|\bto\b)\s*[A-Za-z_0-9]*$/.test(part)) {
      const target = annotationTarget(file, prefix.indexOf('[', annotation.index));
      const params = target?.kind === 'class' ? target.fields : target?.params ?? [];
      return params.map(param => ({ label: param.name, kind: 'parameter', detail: parameterText(param),
        documentation: `Supply target argument ${param.name} to the selected interceptor parameter.` }));
    }
    const used = new Set([...annotation[2].matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\s*(?:=|to\b)/g)].map(match => match[1]));
    const doc = around && methodDocumentation(checked, around, def);
    return (around?.params ?? []).filter(param => !param.injected && !used.has(param.name)).map(param => ({
      label: param.name, kind: 'snippet', detail: `map ${parameterText(param)} to a target label`,
      insertText: `${param.name}=`, documentation: doc?.parameters.get(param.name) }));
  }
  const locals = collectLocals(checked, file, offset);
  const next = nextItem(checked, file, offset);
  const call = /(?:^|[^A-Za-z0-9_])([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?)(?:<[^()]*>)?\(([^()]*)$/.exec(prefix);
  if (call && /^\s*[A-Za-z_0-9]*$/.test(call[2].split(',').at(-1) ?? '')) {
    const parts = call[1].split('.');
    const entry = parts.length === 2 ? memberItems(checked, file.path,
      locals.get(parts[0])?.type, false).find(item => item.label === parts[1]) :
      [...(checked.project.scopes.get(file.path)?.values() ?? [])]
        .map(def => definitionItem(checked, def)).find(item => item.label === parts[0]) ??
      (next?.label === parts[0] ? next : builtins.find(item => item.label === parts[0]));
    if (entry?.parameters?.length) {
      const used = new Set([...call[2].matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\s*(?:=|to\b)/g)]
        .map(match => match[1]));
      const labels = entry.parameters.map((parameter, index) => ({ parameter, index,
        name: parameter.split('=')[0] })).filter(item => !used.has(item.name));
      if (labels.length) return labels.map(({ parameter, index, name }) => ({
        label: name, kind: 'snippet' as const, detail: `argument ${parameter}`,
        insertText: `${name}=`, documentation: entry.parameterDocumentation?.[index] }));
    }
  }
  const member = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*[A-Za-z_0-9]*(?:<[^()]*>)?$/.exec(prefix);
  if (member) {
    const local = locals.get(member[1]);
    const receiver = local?.type;
    const owner = file.items.find(item => (item.kind === 'class' || item.kind === 'interface' || item.kind === 'interceptor') &&
      item.span.start <= offset && offset <= item.span.end);
    const insideClass = !!owner && receiver?.def?.node === owner;
    return unique(memberItems(checked, file.path, receiver, insideClass));
  }
  if (/\bresolve\s+[A-Za-z_0-9]*$/.test(prefix)) return checked.bindings
    .filter(binding => file.path === checked.project.main?.path || !isPrivateName(binding.declaration.key))
    .map(binding => ({
    label: binding.key, kind: 'variable', detail: `binding ${binding.key}: ${tyName(binding.exposedType)}`,
    documentation: binding.exposedType.def && definitionItem(checked, binding.exposedType.def).documentation }));
  const definitions = [...(checked.project.scopes.get(file.path)?.values() ?? [])]
    .map(def => definitionItem(checked, def));
  const localItems: EditorItem[] = [...locals].map(([label, local]) => ({
    label, kind: local.kind, detail: `${local.typeText} ${label}`,
    documentation: local.documentation }));
  const inTest = file.items.some(item => item.kind === 'test' && item.span.start <= offset && offset <= item.span.end);
  const all = unique([...definitions, ...localItems, ...(next ? [next] : []),
    ...builtins.filter(item => item.label !== 'assert' || inTest), ...keywords]);
  if (/\bresolve\s+[A-Za-z_][A-Za-z_0-9]*(?:<[^>]*>)?\s+to\s+[A-Za-z_0-9]*$/.test(prefix))
    return localItems;
  if (/\b(?:implement|bind)\s+[A-Za-z_][A-Za-z_0-9]*(?:<[^>]*>)?\s+(?:with|to)\s+[A-Za-z_0-9]*$/.test(prefix))
    return all.filter(item => item.kind === 'class');
  if (/\b(?:implements|extends)\s+[A-Za-z_0-9]*$/.test(prefix))
    return all.filter(item => item.kind === 'interface');
  if (/\b(?:returns|unless|catch)\s+[A-Za-z_0-9]*$/.test(prefix))
    return all.filter(item => ['class', 'interface', 'type'].includes(item.kind));
  const visible = new Set(all.map(item => item.label));
  const importsEnd = file.items.filter(item => item.kind === 'import').at(-1)?.span.end ?? 0;
  const insertion = importsEnd ? file.source.indexOf('\n', importsEnd) : 0;
  return [...all, ...imports.filter(item => !visible.has(item.label)).map(item => ({ ...item,
    kind: item.signature ? 'function' as const : 'type' as const,
    insertText: item.label, sortText: '2-' + item.label,
    additionalEdits: [{ start: insertion < 0 ? file.source.length : insertion, end: insertion < 0 ? file.source.length : insertion,
      text: `${importsEnd ? '\n' : ''}${item.detail}${importsEnd ? '' : '\n'}` }] }))];
}

/** Fill labeled calls, keep dependency imports visible, and replace only the token being completed. */
export function completions(checked: CheckedProject, fileName: string, offset: number): EditorItem[] {
  const file = checked.project.files.get(resolve(fileName));
  if (!file) return [];
  const prefix = file.source.slice(0, offset), line = prefix.slice(prefix.lastIndexOf('\n') + 1);
  const typeContext = /\b(?:import|export|implement|implements|extends|returns|unless|catch|resolve)\b[^\n]*$/.test(line);
  const token = /[A-Za-z_][A-Za-z0-9_]*$/.exec(prefix);
  const start = token ? offset - token[0].length : offset;
  const end = offset + (/^[A-Za-z0-9_]*/.exec(file.source.slice(offset))?.[0].length ?? 0);
  const escape = (text: string) => text.replace(/[\\$}]/g, '\\$&');
  const argument = (parameter: string, index: number) => {
    const [name, type] = parameter.split('=');
    const value = type === 'string' ? '""' : type === 'bool' ? 'false' : ['int', 'float', 'c_int'].includes(type) ? '0' : name;
    return `${name}=\${${index + 1}:${escape(value)}}`;
  };
  return rawCompletions(checked, fileName, offset).map(item => {
    const callable = !typeContext && ['function', 'method', 'class'].includes(item.kind) && item.signature &&
      !/^\s*\(/.test(file.source.slice(offset));
    let insertText = callable ? `${item.label}(${(item.parameters ?? []).map(argument).join(', ')})$0` : item.insertText;
    const template = snippetCatalog.find(snippet => item.label === snippet.prefix + ' template');
    if (template) insertText = snippetBody(template.body, checked.project.config.block_style, checked.project.config.indentation === 'tabs');
    if (item.kind === 'snippet' && insertText && checked.project.config.block_style === 'indent' && insertText.includes('{\n'))
      insertText = insertText.replace(/^(\s*)\} catch /gm, '$1catch ').replace(/ \{\n/g, ':\n').replace(/^[ \t]*\}\n?/gm, '').trimEnd();
    let additionalEdits = item.additionalEdits;
    if (additionalEdits?.some(edit => edit.start >= start && edit.start <= end)) {
      insertText = additionalEdits.map(edit => escape(edit.text)).join('') + (insertText ?? item.label);
      additionalEdits = undefined;
    }
    return { ...item, insertText, additionalEdits, replacement: item.replacement ?? { start, end },
      sortText: item.sortText ?? (['variable', 'parameter', 'property'].includes(item.kind) ? '0-' : '1-') + item.label };
  });
}

/** Resolve exactly the token under the cursor, including syntax outside completion contexts. */
export function hoverInfo(checked: CheckedProject, fileName: string,
                          offset: number): EditorHover | undefined {
  const file = checked.project.files.get(resolve(fileName));
  if (!file || offset < 0 || offset > file.source.length) return undefined;
  const open = file.source.lastIndexOf('/**', offset);
  const close = open < 0 ? -1 : file.source.indexOf('*/', open + 3);
  if (open >= 0 && (close < 0 || offset < close + 2)) {
    const tags = /@[A-Za-z]+/g;
    for (const match of file.source.slice(open, close < 0 ? undefined : close + 2).matchAll(tags)) {
      const start = open + (match.index ?? 0);
      const help = languageHelp[match[0]];
      if (help && start <= offset && offset < start + match[0].length)
        return { label: match[0], kind: 'keyword', detail: help.detail,
          documentation: help.documentation, start, end: start + match[0].length };
    }
  }
  const hoverTokens = lex(file.path, file.source).tokens;
  const token = hoverTokens.find(entry =>
    entry.kind !== 'eof' && entry.span.start <= offset && offset < entry.span.end);
  if (!token) return undefined;
  const { start, end } = token.span;
  if (['import', 'everything', 'and', 'from'].includes(token.kind)) {
    const declaration = file.items.find(item => item.kind === 'import' && item.span.start <= start && end <= item.span.end);
    if (declaration?.kind === 'import') {
      const imports = checked.project.imports.get(declaration) ?? [];
      const help = languageHelp[token.value];
      return { label: token.value, kind: 'keyword', detail: help.detail,
        documentation: [help.documentation, imports.length ? '**Resolved imports**\n' +
          imports.map(def => `- \`${def.name}\` from \`${relative(checked.project.root, def.file)}\``).join('\n') : 'No declarations resolved yet.'].join('\n\n'),
        start, end };
    }
  }
  if (['[', ']', '{', '}', '(', ')', ':', ','].includes(token.kind)) {
    let literal: Extract<Expr, { kind: 'collection' }> | undefined;
    const find = (value: unknown): void => {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach(find); return; }
      const expr = value as Expr;
      if (expr.kind === 'collection' && expr.span.start <= start && end <= expr.span.end &&
        (!literal || expr.span.end - expr.span.start < literal.span.end - literal.span.start)) literal = expr;
      for (const [key, child] of Object.entries(value)) if (key !== 'span') find(child);
    };
    find(file.items);
    if (literal) {
      const type = checked.expressionTypes.get(literal);
      if (type) return { label: token.value, kind: 'type', detail: `${tyName(type)} literal`,
        documentation: languageHelp[type.name]?.documentation, start, end };
    }
  }
  if (token.value === 'next') {
    const next = nextItem(checked, file, start);
    if (next) return { ...next, start, end };
  }
  for (const node of file.items) {
    const candidates = node.kind === 'class' || node.kind === 'function' ? [node] : [];
    if ('methods' in node) candidates.push(...node.methods);
    for (const candidate of candidates) for (const tag of candidate.annotations ?? []) {
      if (start < tag.span.start || end > tag.span.end) continue;
      const def = checked.project.scopes.get(file.path)?.get(tag.name);
      const around = def?.node.kind === 'interceptor' ? def.node.methods.find(method => method.name === 'around') : undefined;
      const params = candidate.kind === 'class' ? candidate.fields : candidate.params;
      const mapping = tag.mappings.find(entry => entry.span.start <= start && end <= entry.span.end);
      if(httpPolicyNames.includes(tag.name as HttpPolicyName)) {
        if(start===tag.nameSpan.start)return {label:tag.name,kind:'interceptor',detail:languageHelp[tag.name].detail,documentation:languageHelp[tag.name].documentation,start,end};
        if(mapping&&start<mapping.sourceSpan.start)return {label:mapping.name,kind:'property',detail:`${tag.name}.${mapping.name}`,documentation:httpPolicyOptionHelp[mapping.name],start,end};
      }
      if (mapping) {
        const source = mapping.sourceSpan.start <= start;
        const param = source ? params.find(param => param.name === mapping.source) :
          around?.params.find(param => param.name === mapping.name);
        if (param) return { label: token.value, kind: 'parameter',
          detail: `${parameterText(param)} — ${mapping.source} → ${tag.name}.${mapping.name}`,
          documentation: source ? declarationDocumentation(checked, candidate)?.parameters.get(param.name) :
            around && methodDocumentation(checked, around, def)?.parameters.get(param.name), start, end };
      }
      if (def && start === tag.nameSpan.start) {
        const item = definitionItem(checked, def);
        const layer = checked.interceptorPlans.get(candidate)?.find(layer => layer.annotation === tag);
        return { ...item, documentation: [item.documentation,
          layer?.types.size ? `Inferred types: ${[...layer.types].map(([name, type]) => `\`${name} = ${tyName(type)}\``).join(', ')}.` : '',
          `Wraps ${candidate.kind === 'class' ? 'construction of' : 'calls to'} \`${candidate.name}\`.`]
          .filter(Boolean).join('\n\n'), start, end };
      }
    }
  }
  if (token.kind === 'number' || token.kind === 'string') {
    const type = token.kind === 'string' ? 'string' : token.value.includes('.') ? 'float' : 'int';
    return { label: token.value, kind: 'type', detail: `${type} literal`,
      documentation: languageHelp[type].documentation, start, end };
  }
  const entryOwner = token.value === 'around' ? file.items.find((item): item is InterceptorDecl =>
    item.kind === 'interceptor' && item.span.start <= start && end <= item.span.end) : undefined;
  const around = entryOwner?.methods.find(method => method.name === 'around' && method.span.start === start);
  if (around) {
    const item = methodItem(checked, around, 'method');
    return { ...item, documentation: [item.documentation, languageHelp.around.documentation].filter(Boolean).join('\n\n'), start, end };
  }
  const workerKeyword = token.value === 'worker' && hoverTokens[hoverTokens.indexOf(token) - 1]?.kind === 'start' && ['identifier', 'start', 'wait'].includes(hoverTokens[hoverTokens.indexOf(token) + 1]?.kind);
  const help = token.value === 'worker' && !workerKeyword ? undefined : languageHelp[token.value];
  if (help) return { label: token.value,
    kind: help.category === 'type' ? 'type' : help.category === 'function' ? 'function' : 'keyword',
    detail: help.detail, documentation: help.documentation, start, end };
  if (token.kind !== 'identifier') return undefined;
  const local = collectLocals(checked, file, start).get(token.value);
  let item: EditorItem | undefined = local ? { label: token.value, kind: local.kind,
    detail: `${local.typeText} ${token.value}` + (local.kind === 'property' && isPrivateName(token.value) ? ' (private)' : ''),
    documentation: local.documentation } : undefined;
  item ??= completions(checked, file.path, end).find(entry => entry.label === token.value);
  if (!item) {
    const def = checked.project.scopes.get(file.path)?.get(token.value);
    if (def) item = definitionItem(checked, def);
  }
  if (!item) {
    const owner = file.items.find(entry => (entry.kind === 'class' || entry.kind === 'interface' || entry.kind === 'interceptor') &&
      entry.span.start <= start && end <= entry.span.end);
    if (owner?.kind === 'class' || owner?.kind === 'interface' || owner?.kind === 'interceptor') {
      const method = owner.methods.find(entry => entry.name === token.value &&
        entry.span.start === start);
      if (method) {
        const def = [...checked.project.definitions.values()].find(entry => entry.node === owner);
        item = methodItem(checked, method, 'method', def);
      }
      if (!item && (owner.kind === 'class' || owner.kind === 'interceptor')) {
        const field = fieldsOf(owner).find(entry => entry.name === token.value &&
          entry.span.start <= start && end <= entry.span.end);
        if (field) item = { label: field.name, kind: 'property',
          detail: `${typeName(field.type)} ${field.name}` +
            (isPrivateName(field.name) ? ' (private)' : ''),
          documentation: declarationDocumentation(checked, owner)?.parameters.get(field.name) };
      }
    }
  }
  if (!item) {
    const exported = file.items.find(entry => entry.kind === 'export' && !entry.folder &&
      entry.name === token.value && entry.span.start <= start && end <= entry.span.end);
    if (exported?.kind === 'export' && exported.from) {
      const def = checked.project.scopes.get(join(dirname(file.path), `${exported.from}.aug`))
        ?.get(exported.name);
      if (def) item = definitionItem(checked, def);
    }
  }
  if (!item) {
    const binding = checked.bindings.find(entry => entry.key === token.value);
    if (binding) item = { label: token.value, kind: 'variable',
      detail: `binding ${binding.key}: ${tyName(binding.exposedType)}`,
      documentation: definitionItem(checked, binding.target).documentation };
  }
  if (!item && token.value === 'self') {
    const owner = file.items.find(entry => (entry.kind === 'class' || entry.kind === 'interface' || entry.kind === 'interceptor') &&
      entry.span.start <= start && end <= entry.span.end);
    if (owner?.kind === 'class' || owner?.kind === 'interface' || owner?.kind === 'interceptor')
      item = { label: 'self', kind: 'parameter', detail: `self: ${owner.name}`,
        documentation: 'The current instance. Class header fields are available inside its methods.' };
  }
  if (!item) {
    const owner = file.items.find(entry => (entry.kind === 'class' || entry.kind === 'interface' ||
      entry.kind === 'function' || entry.kind === 'interceptor') && entry.span.start <= start && end <= entry.span.end);
    const typeParams = owner?.kind === 'class' || owner?.kind === 'interface' ||
      owner?.kind === 'function' || owner?.kind === 'interceptor' ? owner.typeParams : [];
    const method = owner && 'methods' in owner ? owner.methods.find(entry =>
      entry.span.start <= start && end <= entry.span.end) : undefined;
    if ([...typeParams, ...(method?.typeParams ?? [])].includes(token.value))
      item = { label: token.value, kind: 'type', detail: `type parameter ${token.value}`,
        documentation: 'A generic type placeholder supplied by the caller. It is checked before C generation.' };
  }
  return item ? { ...item, start, end } : undefined;
}

export function semanticTokens(checked: CheckedProject, fileName: string): EditorToken[] {
  const file = checked.project.files.get(resolve(fileName));
  if (!file) return [];
  const tokens = lex(file.path, file.source).tokens;
  const scope = checked.project.scopes.get(file.path);
  const parameters = new Set<string>();
  const fields = new Set<string>();
  const variables = new Set<string>();
  const typeParameters = new Set<string>();
  const declarationNames = new Map<number, 'class' | 'decorator' | 'function' | 'method'>();
  function markFunction(method: MethodDecl, type: 'function' | 'method'): void {
    const first = tokens.findIndex(token => token.span.start >= method.span.start && token.span.end <= method.span.end && token.value === method.name && token.kind === 'identifier');
    const name = tokens[first];
    if (name?.kind === 'identifier') declarationNames.set(name.span.start, type);
  }
  function visitStatements(statements: Stmt[]): void {
    for (const stmt of statements) {
      if (stmt.kind === 'assign' && stmt.target.kind === 'name') variables.add(stmt.target.name);
      if (stmt.kind === 'destructure' || stmt.kind === 'for') stmt.names.forEach(name => variables.add(name));
      if (stmt.kind === 'if') { visitStatements(stmt.then); visitStatements(stmt.otherwise); }
      else if (stmt.kind === 'while' || stmt.kind === 'for' || stmt.kind === 'scope' || stmt.kind === 'unsafe' || stmt.kind === 'borrow' || stmt.kind === 'lock') {
        if(stmt.kind==='lock')variables.add(stmt.name);
        visitStatements(stmt.body);
      }
      else if(stmt.kind==='freeze')variables.add(stmt.name);
      else if (stmt.kind === 'try') {
        visitStatements(stmt.body);
        for (const clause of stmt.catches) { parameters.add(clause.name); visitStatements(clause.body); }
        visitStatements(stmt.always??[]);
      }
      else if (stmt.kind === 'match') for (const clause of stmt.cases) { if (clause.name) variables.add(clause.name); visitStatements(clause.body); }
    }
  }
  for (const item of file.items) {
    if (item.kind === 'class' || item.kind === 'interface' || item.kind === 'interceptor') {
      if (item.kind === 'class') declarationNames.set(item.span.start, 'class');
      if (item.kind === 'interceptor') declarationNames.set(item.nameSpan.start, 'decorator');
      item.typeParams.forEach(name => typeParameters.add(name));
      if (item.kind === 'class' || item.kind === 'interceptor') fieldsOf(item).forEach(field => fields.add(field.name));
      if (item.kind === 'class') visitStatements(item.constructorBody ?? []);
      for (const method of item.methods) {
        markFunction(method, 'method');
        method.typeParams.forEach(name => typeParameters.add(name));
        method.params.forEach(param => parameters.add(param.name));
        visitStatements(method.body ?? []);
      }
    } else if (item.kind === 'function') {
      markFunction(item, 'function');
      item.typeParams.forEach(name => typeParameters.add(name));
      item.params.forEach(param => parameters.add(param.name));
      visitStatements(item.body ?? []);
    } else if (item.kind === 'test') {
      variables.add(item.name);
      for (const group of item.groups) {
        visitStatements(group.setup.filter((entry): entry is Stmt => entry.kind !== 'bind' && entry.kind !== 'include'));
        group.cases.forEach(test => visitStatements(test.body));
      }
    } else if (['expr', 'assign', 'destructure', 'return', 'throw', 'if', 'while', 'for', 'scope', 'match', 'try', 'unsafe', 'borrow', 'lock', 'freeze', 'yield'].includes(item.kind))
      visitStatements([item as Stmt]);
  }
  const result: EditorToken[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.kind !== 'identifier') continue;
    const previous = tokens[i - 1]?.kind;
    const next = tokens[i + 1]?.kind;
    let type: EditorToken['type'] | undefined;
    if (token.value === 'worker' && previous === 'start' && ['identifier', 'start', 'wait'].includes(next)) type = 'keyword';
    else if (previous === '.') type = next === '(' || next === '<' ? 'method' : 'property';
    else if (previous === 'interface' || previous === 'capability') type = 'interface';
    else if (previous === 'record') type = 'class';
    else if (declarationNames.has(token.span.start)) type = declarationNames.get(token.span.start);
    else if (typeParameters.has(token.value)) type = 'typeParameter';
    else if (parameters.has(token.value)) type = 'parameter';
    else if (fields.has(token.value)) type = 'property';
    else if (variables.has(token.value)) type = 'variable';
    else if (builtinFunctions.some(operation => operation.name === token.value) && next === '(' || token.value === 'next') type = 'function';
    else if(httpPolicyNames.includes(token.value as typeof httpPolicyNames[number]))type='decorator';
    else if (token.value in builtinTypes && !['int','c_int','float','bool','string','void','Error','Data'].includes(token.value)) type = 'class';
    else if (token.value === 'Error') type = 'interface';
    else if (['int', 'c_int', 'float', 'bool', 'string', 'void'].includes(token.value)) type = 'type';
    else {
      const def = scope?.get(token.value);
      if (def) type = def.node.kind === 'resource' ? 'type' : def.node.kind === 'interceptor' ? 'decorator' : def.node.kind === 'composition' ? 'function' : def.node.kind;
    }
    if (type) result.push({ line: token.span.line - 1, start: token.span.column - 1,
      length: token.span.end - token.span.start, type,
      declaration: declarationNames.has(token.span.start) || previous === 'interface' });
  }
  return result;
}
