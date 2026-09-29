import type { TypeRef } from './ast.ts';
import { sameType, tyName, type Ty } from './types.ts';

/** One unification operation for callable and interceptor type arguments. */
export function inferType(ref: TypeRef, actual: Ty, names: readonly string[], types: Map<string, Ty>,
  conflict: (message: string) => void, view: (name: string, actual: Ty) => Ty | undefined = (_, actual) => actual): void {
  if (names.includes(ref.name) && !ref.args.length) {
    const candidate = ref.nullable ? { ...actual, nullable: false } : actual;
    const previous = types.get(ref.name);
    if (!previous) types.set(ref.name, candidate);
    else if (!sameType(previous, candidate))
      conflict(`Conflicting inference for ${ref.name}: ${tyName(previous)} and ${tyName(candidate)}; supply compatible values or explicit type arguments`);
    return;
  }
  const resolved = view(ref.name, actual);
  if (resolved && ref.name === resolved.name && ref.args.length === resolved.args.length)
    ref.args.forEach((arg, index) => inferType(arg, resolved.args[index], names, types, conflict, view));
}
