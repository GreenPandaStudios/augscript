import type {MethodDecl,ResourceDecl} from './ast.ts';
import type {CheckedProject} from './checker.ts';
import type {NativeFunction,NativeManifest,NativeResource,NativeTarget} from './native-contracts.ts';

export interface NativeProviderFact {
  provider:string; profile:string; descriptor:string; descriptorSha256:string;
  upstream:NativeManifest['upstream']; supportedTargets:NativeTarget[];
}
export interface NativeFunctionFact extends NativeProviderFact {
  kind:'function'; contract:NativeFunction;
  compilerChecks:readonly string[]; nativeAuthorPromises:readonly string[];
}
export interface NativeResourceFact extends NativeProviderFact {
  kind:'resource'; contract:NativeResource; cleanup:'scope-exit';
}

/** Keep checked binding facts separate from promises made by foreign code. */
export function nativeFact(checked:CheckedProject,node:MethodDecl|ResourceDecl):NativeFunctionFact|NativeResourceFact|undefined {
  const provider=checked.native.providers.get(node),manifest=provider&&checked.native.providerMetadata.get(provider);
  if(!provider||!manifest)return;
  const common:NativeProviderFact={provider,profile:manifest.profile,descriptor:manifest.bindings,descriptorSha256:manifest.bindingsSha256,
    upstream:manifest.upstream,supportedTargets:manifest.artifacts.map(artifact=>artifact.target)};
  if(node.kind==='resource'){
    const contract=checked.native.resources.get(node);
    return contract?{...common,kind:'resource',contract,cleanup:'scope-exit'}:undefined;
  }
  const contract=checked.native.functions.get(node);
  return contract?{...common,kind:'function',contract,
    compilerChecks:['provider identity','descriptor digest','August signature','ownership at August call sites'],
    nativeAuthorPromises:['inputs are not retained','execution stays on the caller thread','C ABI boundary does not unwind into August']}:undefined;
}

/** Resolve only standalone calls. Member dispatch is not claimed as complete. */
export function nativeDependencies(checked:CheckedProject,method:MethodDecl):NativeFunctionFact[] {
  const found=new Map<MethodDecl,NativeFunctionFact>(),seen=new Set<MethodDecl>();
  const visit=(current:MethodDecl)=>{
    if(seen.has(current))return;seen.add(current);
    const fact=nativeFact(checked,current);
    if(fact?.kind==='function'){found.set(current,fact);return;}
    const walk=(value:unknown)=>{
      if(!value||typeof value!=='object')return;
      if(Array.isArray(value)){value.forEach(walk);return;}
      const call=value as {kind?:string;callee?:{kind?:string;name?:string};span?:{file:string}};
      if(call.kind==='call'&&call.callee?.kind==='name'&&call.span){
        const target=checked.project.scopes.get(call.span.file)?.get(call.callee.name!);
        if(target?.node.kind==='function')visit(target.node);
      }
      for(const [key,child] of Object.entries(value))if(!['span','nameSpan','sourceSpan'].includes(key))walk(child);
    };
    walk(current.body);
  };
  visit(method);
  return [...found.values()].sort((a,b)=>(a.provider+'/'+a.contract.symbol).localeCompare(b.provider+'/'+b.contract.symbol,'en'));
}

export function nativeDescription(fact:NativeFunctionFact|NativeResourceFact):string {
  const quote=(text:string)=>'`'+text+'`';
  const targets=fact.supportedTargets.map(target=>target.os+' '+target.arch+(target.minimumOS?' '+target.minimumOS+'+':'')).join(', ');
  const origin=`Native implementation: ${quote(fact.provider)}, ${quote(fact.upstream.version)}. Supported targets: ${targets}.`;
  if(fact.kind==='resource')return `${origin} An owned value releases its opaque handle through ${quote(fact.contract.release)} when its scope ends, including error and return paths.`;
  const contract=fact.contract;
  const loans=contract.params.filter(param=>param.kind==='resource').map(param=>quote(param.name)+(param.ownership==='consume'?' transfers ownership':param.ownership==='borrow'?' lends mutable access for this call':' lends read access for this call'));
  const result=contract.result.kind==='resource'?'The caller owns the returned handle.':contract.result.release?
    `August copies the returned buffer, then calls ${quote(contract.result.release)} to release it.`:'';
  return `${origin} It calls ${quote(contract.symbol)} through the C ABI on the caller thread; a blocking native call blocks that thread. ${loans.length?loans.join('; ')+'. ':''}${result?result+' ':''}`+
    'The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs or unwind across the C boundary; the compiler does not prove those promises.';
}
