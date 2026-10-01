import {resolve} from 'node:path';
import type {Diagnostic, MethodDecl, ResourceDecl, Span} from './ast.ts';
import type {Project,Definition} from './project.ts';
import {readNativeDescriptor, type NativeFunction, type NativeResource, type NativeManifest} from './native-contracts.ts';

export interface NativeDeclarations {
  functions:Map<MethodDecl,NativeFunction>; resources:Map<ResourceDecl,NativeResource>;
  providers:Map<MethodDecl|ResourceDecl,string>; diagnostics:Diagnostic[];
  providerMetadata:Map<string,NativeManifest>;
  errors:Map<MethodDecl,Definition>;
}

/** Resolve descriptors against exact source declarations, never unqualified spellings. */
export function nativeDeclarations(project:Project):NativeDeclarations {
  const result:NativeDeclarations={functions:new Map(),resources:new Map(),providers:new Map(),providerMetadata:new Map(),errors:new Map(),diagnostics:[]};
  const issue=(span:Span,message:string)=>result.diagnostics.push({...span,code:'NATIVE_ABI',message});
  const sources:{directory:string;sourceRoot:string;native:NativeManifest;identity:string}[]=[];
  const symbols=new Map<string,string>();
  if(project.library?.native)sources.push({directory:project.root,sourceRoot:project.sourceRoot,native:project.library.native,identity:project.library.name+'@'+project.library.version});
  for(const scope of project.packages.scopes.values()){
    // readPackage already verified the descriptor hash; retain that source identity.
    const native=scope.native;
    if(native)sources.push({directory:scope.directory,sourceRoot:scope.sourceRoot,native,identity:scope.name+'@'+scope.version});
  }
  for(const source of sources){
    result.providerMetadata.set(source.identity,source.native);
    let descriptor;
    try{descriptor=readNativeDescriptor(source.directory,source.native);}
    catch(error){issue({file:resolve(source.directory,source.native.bindings),start:0,end:0,line:1,column:1},error instanceof Error?error.message:String(error));continue;}
    for(const name of [...descriptor.resources.map(r=>r.release),...descriptor.functions.flatMap(f=>[f.symbol,...(f.result.release?[f.result.release]:[])])]){
      const provider=symbols.get(name);
      if(provider&&provider!==source.identity)issue({file:resolve(source.directory,source.native.bindings),start:0,end:0,line:1,column:1},`Native symbol ${name} has ambiguous providers ${provider} and ${source.identity}`);
      else symbols.set(name,source.identity);
    }
    for(const resource of descriptor.resources){
      const file=resolve(source.sourceRoot,resource.module+'.aug');
      const def=project.scopes.get(file)?.get(resource.name);
      if(!def||def.file!==file||def.node.kind!=='resource'){
        issue({file,start:0,end:0,line:1,column:1},'Native descriptor has no matching resource declaration '+resource.module+'.'+resource.name);continue;
      }
      result.resources.set(def.node,resource);result.providers.set(def.node,source.identity);
    }
    for(const fn of descriptor.functions){
      const file=resolve(source.sourceRoot,fn.module+'.aug');
      const def=project.scopes.get(file)?.get(fn.name);
      if(!def||def.file!==file||def.node.kind!=='function'||!def.node.externC||def.node.valueAbi){
        issue({file,start:0,end:0,line:1,column:1},'Native descriptor has no matching extern C declaration '+fn.module+'.'+fn.name);continue;
      }
      result.functions.set(def.node,fn);result.providers.set(def.node,source.identity);
      if(fn.error){const dot=fn.error.lastIndexOf('.'),errorFile=resolve(source.sourceRoot,fn.error.slice(0,dot)+'.aug');
        const error=project.scopes.get(errorFile)?.get(fn.error.slice(dot+1));
        if(!error||error.file!==errorFile||error.node.kind!=='class')issue(def.node.span,'Native descriptor has no matching checked error declaration '+fn.error);
        else result.errors.set(def.node,error);
      }
    }
  }
  for(const def of project.definitions.values())if(def.node.kind==='resource'&&!result.resources.has(def.node))
    issue(def.node.span,'extern C resource requires a release identity in its package native.abi.json');
  return result;
}
