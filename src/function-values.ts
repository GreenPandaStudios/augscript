import type {Expr,Param} from './ast.ts';
import type {InterfaceMethod} from './checker.ts';
import type {Definition} from './project.ts';
import type {Ty} from './types.ts';

/** A pure callable adapted to one existing, concrete August interface. */
export interface FunctionValuePlan {
  type:Ty;signature:InterfaceMethod;params:Param[];inputs:Ty[];result:Ty;
  target?:Definition;order:number[];body?:Expr;
  captures:{name:string;expression:Expr;type:Ty}[];
}
