import type { MethodDecl, Span } from './ast.ts';
import { tyName, type Ty } from './types.ts';

export interface EffectEnvironment {
  source(path: string): Ty | undefined;
  interfaces(type: Ty): Ty[];
  native(name: string): string | undefined;
  operation(type: Ty, name: string): boolean;
  report(span: Span, message: string): void;
}

export interface CapabilityEffect {
  source: string;
  operation: string;
  span: Span;
  capability?: Ty;
}

export const capabilityKey = (type: Ty, operation: string): string =>
  `${type.id}<${type.args.map(tyName).join(',')}>.${operation}`;

export interface EffectContract {
  changes: readonly string[];
  uses: ReadonlyMap<string, CapabilityEffect>;
  inferred?: boolean;
  inferredChanges?: boolean;
}

/** Resolves surface effect names once; callers compare capability identities. */
export function effectContract(method: MethodDecl, environment: EffectEnvironment): EffectContract {
  const uses = new Map<string, CapabilityEffect>();
  for (const effect of method.uses ?? []) {
    if (effect.source === 'C') {
      const native = environment.native(effect.operation);
      if (!native) environment.report(effect.span, `No imported extern C function ${effect.operation}`);
      else uses.set(`C:${native}`, effect);
      continue;
    }
    const source = environment.source(effect.source);
    const capabilities = source ? [source, ...environment.interfaces(source)].filter(type =>
      type.def?.node.kind === 'interface' && type.def.node.capability && environment.operation(type, effect.operation)) : [];
    if (!capabilities.length) environment.report(effect.span,
      `${effect.source}.${effect.operation} must name an operation of a capability dependency or capability type`);
    for (const type of capabilities) uses.set(capabilityKey(type, effect.operation), { ...effect, capability: type });
  }
  return { changes: method.changes ?? [], uses };
}

export function coversChange(declared: readonly string[], actual: string): boolean {
  return declared.some(path => path === actual || actual.startsWith(`${path}.`));
}

export function missingEffects(required: EffectContract, allowed: EffectContract): string[] {
  return [...required.uses.keys()].filter(key => !allowed.uses.has(key));
}
