import {fieldsOf} from './ast.ts';
import type {Ty} from './types.ts';
import {tyName} from './types.ts';
import {errorNames} from './builtins.ts';

/** A checked test of stored error values. Generic declaration names alone are
 * insufficient: every field carrying a type parameter must satisfy its test.
 * This refines the stored read-only values, not an erased instantiation tag. */
export interface ErrorMatch {id:string;fields:{index:number;match:ErrorMatch}[]}
export function errorMatch(type:Ty,isError:(type:Ty)=>boolean,depth=0):ErrorMatch|string {
  if(depth>128)return 'Generic error catches support at most 128 nested stored causes. Catch Error or use a non-generic domain error.';
  const unsupported=()=>`Cannot catch ${tyName(type)} safely: generic catches need a short error declaration with every type parameter stored directly in non-null, read-only managed fields, and concrete Error arguments. Catch Error or use a non-generic domain error.`;
  if(type.kind==='param'||type.nullable||type.optional)return unsupported();
  if(!type.args.length)return {id:type.id.startsWith('builtin:')?type.name:type.id,fields:[]};
  const node=type.def?.node;
  if(node?.kind!=='class'||!node.errorShorthand||node.typeParams.length!==type.args.length)return unsupported();
  const fields=fieldsOf(node),tests:ErrorMatch['fields']=[];
  for(const [argumentIndex,name] of node.typeParams.entries()){
    const argument=type.args[argumentIndex];
    if(!isError(argument)||(argument.kind!=='class'&&argument.id!=='builtin:Error'&&!errorNames.some(error=>argument.id==='builtin:'+error)))return unsupported();
    const match=errorMatch(argument,isError,depth+1);if(typeof match==='string')return match;
    let witnessed=false;
    const mentions=(ref:typeof fields[number]['type']):boolean=>ref.name===name||ref.args.some(mentions);
    for(const [index,field] of fields.entries())if(mentions(field.type)){
      if(field.type.name!==name||field.type.args.length||field.type.nullable||field.type.optional||field.mutable||field.injected||field.ownership!=='managed')return unsupported();
      tests.push({index,match});witnessed=true;
    }
    if(!witnessed)return unsupported();
  }
  return {id:type.id,fields:tests};
}
