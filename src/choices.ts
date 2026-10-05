import type {Definition,Project} from './project.ts';
import type {Ty} from './types.ts';

/** Resolved alternatives share the ordinary record representation. Invalid
 * declarations return no members rather than inventing an open union. */
export function choiceMembers(project:Project,type:Ty):Ty[]|undefined {
  const node=type.def?.node;if(node?.kind!=='choice'||type.args.length||node.alternatives.length<2)return;
  const members:Ty[]=[],seen=new Set<string>();
  for(const ref of node.alternatives){
    const def:Definition|undefined=project.scopes.get(type.def!.file)?.get(ref.name);
    if(ref.nullable||ref.optional||ref.immutable||ref.args.length||def?.node.kind!=='class'||!def.node.record||def.node.typeParams.length||seen.has(def.id))return;
    seen.add(def.id);members.push({id:def.id,name:def.name,kind:'class',args:[],nullable:false,frozen:true,def});
  }
  return members;
}
