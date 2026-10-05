import {basename,dirname,join,relative} from 'node:path';
import type {Diagnostic,GenericHeader,MethodDecl,Span,TypeRef} from './ast.ts';
import type {CheckedProject} from './checker.ts';
import type {Definition,Project} from './project.ts';
import type {Ty} from './types.ts';
import {schemaType} from './schemas.ts';
import {callableResult} from './contracts.ts';

/** The one folder contract: outward exports and deliberate sibling-only entries. */
export function folderSurface(project:Project,folder:string) {
  const external:Definition[]=[],internal:Definition[]=[];
  for(const item of project.files.get(join(folder,'export.aug'))?.items??[])if(item.kind==='export'&&!item.folder&&item.from) {
    const file=join(folder,item.from+'.aug'),def=project.scopes.get(file)?.get(item.name);
    if(def?.file===file)(item.internal?internal:external).push(def);
  }
  return {external,internal};
}

export function declarationVisibility(project:Project,def:Definition) {
  const surface=folderSurface(project,dirname(def.file));
  return {file:def.name.startsWith('_')?'private' as const:'public' as const,
    folder:surface.internal.some(item=>item.id===def.id)?'internal' as const:surface.external.some(item=>item.id===def.id)?'exported' as const:'unlisted' as const};
}

/** Opted-in outward signatures use accessible types; implementation bodies and
 * private state are not public construction or invocation contracts. */
export function moduleSurfaceDiagnostics(checked:CheckedProject):Diagnostic[] {
  const project=checked.project,diagnostics:Diagnostic[]=[],surfaces=new Map<string,ReturnType<typeof folderSurface>>();
  const surface=(folder:string)=>{let found=surfaces.get(folder);if(!found){found=folderSurface(project,folder);surfaces.set(folder,found);}return found;};
  const accessible=(def:Definition)=>{
    if(!surface(dirname(def.file)).external.some(item=>item.id===def.id))return false;
    const source=project.files.get(def.file),packageScope=source?.package?project.packages.scopes.get(source.package):undefined;
    const root=packageScope?.sourceRoot??(source?.builtin?project.stdlibRoot:project.sourceRoot);
    if(!root)return false;
    const packageBoundary=!!(packageScope||source?.builtin||project.library);
    let folder=dirname(def.file);
    while(folder!==root) {
      const parent=dirname(folder);if(parent===folder||relative(root,parent).startsWith('..'))return false;
      if((parent!==root||packageBoundary)&&!project.files.get(join(parent,'export.aug'))?.items.some(item=>item.kind==='export'&&!item.internal&&item.folder&&item.name===relative(parent,folder)))return false;
      folder=parent;
    }
    return true;
  };
  const parameters=(header:GenericHeader,base=new Map<string,Ty>())=>new Map([...base,...header.typeParams.map((name):[string,Ty]=>[name,{id:'parameter:'+name,name,kind:'param',args:[],nullable:false}])]);
  for(const file of project.files.values())if(basename(file.path)==='export.aug') {
    const folder=dirname(file.path),contract=surface(folder);if(!contract.internal.length)continue;
    for(const owner of contract.external) {
      const node=owner.node,seen=new Set<string>(),ownerParams=parameters(node);
      const check=(value:Ty|undefined,span:Span,role:string):void=>{
        if(!value)return;
        if(value.def&&!accessible(value.def)) {
          const key=role+'\0'+value.def.id;
          if(!seen.has(key)) {seen.add(key);diagnostics.push({file:span.file,line:span.line,column:span.column,code:'MODULE_SURFACE',
            message:`Exported ${owner.name} exposes inaccessible ${value.def.name} in its ${role}; export that type or use an exported interface/data type`,
            related:[{file:value.def.file,line:value.def.node.span.line,column:value.def.node.span.column,message:'This type is not available through its outward folder/package contract.'}]});}
        }
        value.args.forEach(arg=>check(arg,span,role));
      };
      const ref=(value:TypeRef,role:string,params=ownerParams)=>check(schemaType(project,value,value.span.file,params),value.span,role);
      const constraints=(header:GenericHeader,params:Map<string,Ty>)=>Object.values(header.typeConstraints??{}).flat().forEach(value=>ref(value,'generic constraint',params));
      const method=(method:MethodDecl,base=ownerParams)=>{
        if(method.name.startsWith('_'))return;const params=parameters(method,base);
        const substitute=(value:Ty):Ty=>value.kind==='param'&&params.has(value.name)?params.get(value.name)!:{...value,args:value.args.map(substitute)};
        method.params.forEach(param=>ref(param.type,'input '+(param.label??param.name),params));
        check(substitute(callableResult(checked,method)),method.returns.span,'result of '+method.name);
        const errors=checked.callableContracts.get(method)?.errors??method.throws.map(value=>schemaType(project,value,value.span.file,params));
        errors.forEach(value=>check(substitute(value),method.span,'checked errors of '+method.name));
        for(const effect of checked.effectContracts.get(method)?.uses.values()??[])check(effect.capability,method.span,'capabilities of '+method.name);
        for(const layer of checked.interceptorPlans.get(method)??[])layer.errors.forEach(value=>check(value,method.span,'checked errors of '+method.name));
        method.endpoint?.errors.forEach(error=>ref(error.type,'HTTP error mapping',params));constraints(method,params);
      };
      constraints(node,ownerParams);
      if(node.kind==='function')method(node);
      if('methods' in node)node.methods.forEach(item=>method(item));
      if(node.kind==='class'||node.kind==='interceptor') {
        node.fields.forEach(field=>ref(field.type,'construction input '+(field.label??field.name)));
        if(node.kind==='class') {
          node.stateFields?.filter(field=>!field.name.startsWith('_')).forEach(field=>ref(field.type,'public field '+field.name));
          node.implements.forEach(value=>ref(value,'implemented interface'));
          checked.constructorContracts.get(node)?.errors.forEach(value=>check(value,node.span,'construction errors'));
          for(const layer of checked.interceptorPlans.get(node)??[])layer.errors.forEach(value=>check(value,node.span,'construction errors'));
        }
      }
      if(node.kind==='interface')node.extends.forEach(value=>ref(value,'inherited interface'));
      if(node.kind==='choice')node.alternatives.forEach(value=>ref(value,'choice alternative'));
      const inherited=node.kind==='interface'?checked.interfaceMembers.get(owner.id):checked.defaults.get(owner.id);
      if(inherited)for(const entries of inherited.values())for(const entry of Array.isArray(entries)?entries:[entries])method(entry.method,entry.params);
    }
  }
  return diagnostics;
}
