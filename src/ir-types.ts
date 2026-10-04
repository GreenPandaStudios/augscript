import type {IrType} from './ir.ts';

/** These cells can never retain a managed pointer after checked execution. */
export function isIRScalar(type:IrType):boolean {
  return !type.nullable&&!type.optional&&!type.args.length&&
    ['int','c_int','float','bool'].includes(type.name)&&type.id==='builtin:'+type.name;
}
