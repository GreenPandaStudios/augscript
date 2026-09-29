import type { Expr, MethodDecl, Param, Stmt } from './ast.ts';
import type { InterceptorLayer } from './checker.ts';

/** Lower the checked written order to named entry points. */
export function interceptorChain(name: string, layers: readonly InterceptorLayer[]) {
  return { body: layers.length ? name + '_body' : name,
    entries: layers.map((layer, index) => ({ layer, name: index ? name + '_layer_' + index : name,
      next: index + 1 === layers.length ? name + '_body' : name + '_layer_' + (index + 1) })) };
}

export interface LayerInput { name: string; slot?: number; reuseOwnedSlot: boolean }
export interface OwnedTransfer { original: number; replacement: number }

/** Conservative delegation facts from syntax, never from comments or text matching. */
export function interceptorBehavior(body: readonly Stmt[]) {
  const contains = (value: unknown, predicate: (node: Record<string, unknown>) => boolean): boolean => {
    if (!value || typeof value !== 'object') return false;
    if (Array.isArray(value)) return value.some(child => contains(child, predicate));
    const node = value as Record<string, unknown>;
    return predicate(node) || Object.entries(node).some(([key, child]) => key !== 'span' && contains(child, predicate));
  };
  const isNext = (value: unknown) => {
    const node = value as Expr | undefined;
    return node?.kind === 'call' && node.callee.kind === 'name' && node.callee.name === 'next';
  };
  const mayFail = (value: unknown) => contains(value, node => node.kind === 'call' || node.kind === 'binary' && node.op === '/');
  const expression = (stmt: Stmt) => stmt.kind === 'return' ? stmt.value : stmt.kind === 'expr' ? stmt.expr : stmt.kind === 'assign' ? stmt.value : undefined;
  const direct = body.findIndex(stmt => isNext(expression(stmt)));
  const priorMayExit = direct < 0 || body.slice(0, direct).some(stmt =>
    !(stmt.kind === 'assign' && stmt.target.kind === 'name' && !mayFail(stmt.value) ||
      stmt.kind === 'expr' && stmt.expr.kind === 'literal'));
  const call = direct < 0 ? undefined : expression(body[direct]);
  return { delegates: contains(body, isNext), mayShortCircuit: priorMayExit ||
    call?.kind === 'call' && call.args.some(mayFail) || direct < 0 };
}

/**
 * Owns target-to-around mapping, hidden dependency forwarding, and next transfer
 * layout. The native emitter only allocates slots and emits runtime operations.
 */
export class InterceptorInvocation {
  private readonly layer: InterceptorLayer;
  private readonly params: readonly Param[];
  private readonly original: readonly number[];
  readonly target: string;
  readonly receiver?: number;

  constructor(layer: InterceptorLayer, params: readonly Param[], original: readonly number[], target: string, receiver?: number) {
    this.layer = layer; this.params = params; this.original = original; this.target = target; this.receiver = receiver;
  }

  dependencies(): (number | undefined)[] {
    return this.layer.constructorInputIndices.map(index => index >= 0 ? this.original[index] : undefined);
  }

  inputs(): LayerInput[] {
    return this.layer.around.params.map((param, index) => {
      const target = this.layer.argumentIndices[index];
      const source = target ?? this.layer.argumentInjectionIndices[index];
      return { name: param.name, slot: source !== undefined && source >= 0 ? this.original[source] : undefined,
        reuseOwnedSlot: param.ownership === 'own' && target !== undefined };
    });
  }

  forward(sourceIndices: readonly (number | undefined)[], values: readonly number[]): { args: number[]; transfers: OwnedTransfer[] } {
    const args = [...this.original];
    sourceIndices.forEach((source, index) => {
      const target = this.layer.argumentIndices[index];
      if (source !== undefined && target !== undefined) args[target] = values[source];
    });
    const transfers = this.params.flatMap((param, index) => param.ownership === 'own' ?
      [{ original: this.original[index], replacement: args[index] }] : []);
    return { args, transfers };
  }

  get around(): MethodDecl { return this.layer.around; }
}
