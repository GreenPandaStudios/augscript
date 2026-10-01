import type {Expr,MethodDecl,TypeRef} from './ast.ts';
import type {CheckedProject} from './checker.ts';
import type {Definition,Project} from './project.ts';
import {containsUnknown} from './types.ts';

/** Expand into a compiler-owned delegate; source ASTs in the parse cache remain untouched. */
export function expandForwarding(project:Project):void {
  const active=new Set<string>(),complete=new Set<string>();
  const report=(definition:Definition,message:string)=>project.diagnostics.push({file:definition.file,line:definition.node.span.line,column:definition.node.span.column,code:'FORWARD',message});
  const type=(reference:TypeRef,file:string):TypeRef=>({...reference,args:reference.args.map(arg=>type(arg,file)),
    definitionId:reference.definitionId??project.scopes.get(file)?.get(reference.name)?.id});
  const expand=(definition:Definition):boolean=>{
    const alias=definition.node;if(alias.kind!=='function'||!alias.forward)return true;
    if(complete.has(definition.id))return !!alias.forward.implementationId;
    if(active.has(definition.id)){report(definition,'Forwarding declarations form a cycle');return false;}
    active.add(definition.id);
    const target=project.scopes.get(definition.file)?.get(alias.forward.target);
    const imported=[...project.imports].some(([item,values])=>item.span.file===definition.file&&!item.everything&&values.some(value=>value.id===target?.id));
    if(!target||!imported||target.name.startsWith('_')||target.node.kind!=='function'){
      report(definition,'Forward targets must be explicitly imported public standalone functions');active.delete(definition.id);complete.add(definition.id);return false;
    }
    if(!expand(target)){report(definition,'The forwarding target did not resolve to a supported implementation');active.delete(definition.id);complete.add(definition.id);return false;}
    const implementation=target.node as MethodDecl;
    if(implementation.typeParams.length||implementation.externC||implementation.endpoint||implementation.annotations?.length||!implementation.body||
      implementation.returnOwnership!=='managed'||implementation.params.some(param=>param.ownership!=='managed'||param.injected||param.source||param.mutable)||
      implementation.uses?.length||implementation.changes?.length){
      report(definition,'Forwarding currently supports concrete managed functions without own, borrow, resolve, uses, changes, endpoints, native linkage, or interceptors');
      active.delete(definition.id);complete.add(definition.id);return false;
    }
    const params=implementation.params.map(param=>({...param,type:type(param.type,target.file)}));
    const call:Extract<Expr,{kind:'call'}>={kind:'call',callee:{kind:'name',name:alias.forward.target,span:alias.forward.targetSpan},
      args:params.map(param=>({kind:'name',name:param.name,span:alias.span})),argLabels:params.map(param=>param.label??param.name),typeArgs:[],span:alias.span};
    const expanded:MethodDecl={...alias,params,returns:type(implementation.returns,target.file),throws:implementation.throws.map(reference=>type(reference,target.file)),
      changes:[],uses:[],declared:implementation.declared??{returns:true,errors:true,changes:false,uses:false},
      body:[{kind:'return',value:call,span:alias.span}],forward:{...alias.forward,targetId:target.id,
        implementationId:implementation.forward?.implementationId??target.id,chain:[target.id,...implementation.forward?.chain??[]]}};
    definition.node=expanded;
    const file=project.files.get(definition.file)!;file.items=file.items.map(item=>item===alias?expanded:item);
    active.delete(definition.id);complete.add(definition.id);return true;
  };
  for(const definition of project.definitions.values())expand(definition);
}

/** Effective contracts are checked after inference. Unsupported facts are never erased. */
export function checkForwardingProfiles(checked:CheckedProject):void {
  for(const definition of checked.project.definitions.values()){
    const node=definition.node;if(node.kind!=='function'||!node.forward?.implementationId)continue;
    const contract=checked.callableContracts.get(node),effects=checked.effectContracts.get(node);
    if(!contract||containsUnknown(contract.result)||contract.errors.some(containsUnknown)||node.params.some(param=>{
      const type=checked.parameterTypes.get(param);return !type||containsUnknown(type);
    })||effects?.uses.size||effects?.changes.length)
      checked.diagnostics.push({file:definition.file,line:node.span.line,column:node.span.column,code:'FORWARD',
        message:'The inherited forwarding interface must be concrete, with empty effective capability and mutation contracts'});
  }
}

export function forwardingProvenance(project:Project,method:MethodDecl) {
  const forward=method.forward;if(!forward)return undefined;
  const immediate=forward.targetId&&project.definitions.get(forward.targetId),implementation=forward.implementationId&&project.definitions.get(forward.implementationId);
  return {inherited:true,immediate:immediate?{id:immediate.id,name:immediate.name,location:immediate.node.span}:undefined,
    implementation:implementation?{id:implementation.id,name:implementation.name,location:implementation.node.span}:undefined,chain:forward.chain??[]};
}
