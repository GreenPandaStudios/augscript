import {expressionChildren} from './ast.ts';
import type { Expr, Stmt } from './ast.ts';

// Counts are capped at two: the analysis only needs to distinguish zero, one,
// and a repeated invocation. Exits are kept separate from fallthrough so that
// mutually exclusive returns may each invoke next once.
interface Flow { normal: number | undefined; exited: number; thrown: number | undefined; breaking?: number; continuing?: number }
const add = (left: number, right: number) => Math.min(2, left + right);
const maximum = (...values: (number | undefined)[]): number | undefined => {
  const present = values.filter((value): value is number => value !== undefined);
  return present.length ? Math.max(...present) : undefined;
};

function calls(expr: Expr): number {
  if(expr.kind==='comprehension')return add(calls(expr.iterable),calls(expr.projection)+(expr.condition?calls(expr.condition):0)>0?2:0);
  if(expr.kind==='matchValue')return add(calls(expr.value),Math.max(0,...expr.cases.map(clause=>calls(clause.result))));
  if (expr.kind === 'handle' && expr.call.kind === 'call') return Math.min(2,expr.call.args.reduce((sum,arg) => sum + calls(arg),0));
  if (expr.kind === 'markup') return Math.min(2, [...expr.attributes.map(attribute => attribute.value), ...expr.children].reduce((sum, child) => sum + calls(child), 0));
  if (expr.kind === 'start') return calls(expr.call);
  if (expr.kind === 'wait') return Math.min(2, expr.tasks.reduce((sum, task) => sum + calls(task), 0));
  if (expr.kind === 'collection') return Math.min(2, expr.items.reduce((count, item) => count + calls(item), 0));
  if (expr.kind === 'call') return Math.min(2,
    (expr.callee.kind === 'name' && expr.callee.name === 'next' ? 1 : calls(expr.callee)) +
    expr.args.reduce((count, arg) => count + calls(arg), 0));
  if (expr.kind === 'member') return calls(expr.object);
  if (expr.kind === 'binary') {
    if (expr.left.kind === 'literal' && ((expr.op === '&&' && expr.left.value === false) ||
      (expr.op === '||' && expr.left.value === true))) return calls(expr.left);
    return add(calls(expr.left), calls(expr.right));
  }
  if (expr.kind === 'unary') return calls(expr.value);
  return Math.min(2, expressionChildren(expr).reduce((sum, child) => sum + calls(child), 0));
}

function block(body: Stmt[], initial = 0): Flow {
  let flow: Flow = { normal: initial, exited: 0, thrown: undefined };
  for (const stmt of body) {
    if (flow.normal === undefined) break;
    const inside = statement(stmt, flow.normal);
    flow = { normal: inside.normal, exited: Math.max(flow.exited, inside.exited),
      thrown: maximum(flow.thrown, inside.thrown), breaking:maximum(flow.breaking,inside.breaking), continuing:maximum(flow.continuing,inside.continuing) };
  }
  return flow;
}

function statement(stmt: Stmt, initial: number): Flow {
  if (stmt.kind === 'break' || stmt.kind === 'continue') return {normal:undefined, exited:0, thrown:undefined, [stmt.kind === 'break' ? 'breaking' : 'continuing']:initial};
  if (stmt.kind === 'serve') return {normal: add(initial, calls(stmt.port)), exited: 0, thrown: initial};
  if (stmt.kind === 'unsafe' || stmt.kind === 'borrow' || stmt.kind === 'scope' || stmt.kind === 'lock') return block(stmt.body, initial);
  if (stmt.kind === 'for') {
    const count = add(initial, calls(stmt.iterable));
    const body = block(stmt.body, count);
    const reentry = maximum(body.normal, body.continuing);
    const repeated = reentry !== undefined && reentry > count;
    return { normal: maximum(count, body.breaking, repeated ? 2 : body.normal), exited: body.exited,
      thrown: maximum(count, body.thrown, repeated ? 2 : undefined) };
  }
  if (stmt.kind === 'match') {
    const count = add(initial, calls(stmt.value));
    const cases = stmt.cases.map(clause => block(clause.body, count));
    return { normal: maximum(...cases.map(flow => flow.normal)), exited: Math.max(0, ...cases.map(flow => flow.exited)),
      thrown: maximum(count, ...cases.map(flow => flow.thrown)), breaking:maximum(...cases.map(flow=>flow.breaking)), continuing:maximum(...cases.map(flow=>flow.continuing)) };
  }
  if (stmt.kind === 'if') {
    const count = add(initial, calls(stmt.test));
    if (stmt.test.kind === 'literal' && typeof stmt.test.value === 'boolean')
      return block(stmt.test.value ? stmt.then : stmt.otherwise, count);
    const left = block(stmt.then, count);
    const right = block(stmt.otherwise, count);
    return { normal: maximum(left.normal, right.normal), exited: Math.max(left.exited, right.exited),
      thrown: maximum(count, left.thrown, right.thrown), breaking:maximum(left.breaking,right.breaking), continuing:maximum(left.continuing,right.continuing) };
  }
  if (stmt.kind === 'while') {
    const test = calls(stmt.test);
    const count = add(initial, test);
    if (stmt.test.kind === 'literal' && stmt.test.value === false)
      return { normal: count, exited: 0, thrown: undefined };
    const body = block(stmt.body, count);
    // A fallthrough edge feeds the condition again. If either the condition or
    // body invokes next, an arbitrary second iteration can repeat the call.
    const reentry = maximum(body.normal, body.continuing);
    const repeated = reentry !== undefined && (test > 0 || reentry > initial);
    return { normal: maximum(body.breaking, stmt.test.kind === 'literal' && stmt.test.value === true ? undefined : maximum(count, repeated ? 2 : body.normal)),
      exited: body.exited, thrown: maximum(count, body.thrown, repeated ? 2 : undefined) };
  }
  if (stmt.kind === 'try') {
    const inside = block(stmt.body, initial);
    const catches = inside.thrown === undefined ? [] :
      stmt.catches.map(clause => block(clause.body, inside.thrown));
    const flow = { normal: maximum(inside.normal, ...catches.map(flow => flow.normal)),
      exited: Math.max(inside.exited, ...catches.map(flow => flow.exited)),
      thrown: maximum(inside.thrown, ...catches.map(flow => flow.thrown)), breaking:maximum(inside.breaking,...catches.map(flow=>flow.breaking)), continuing:maximum(inside.continuing,...catches.map(flow=>flow.continuing)) };
    if (!stmt.always) return flow;
    const breaking = flow.breaking === undefined ? undefined : block(stmt.always, flow.breaking);
    const continuing = flow.continuing === undefined ? undefined : block(stmt.always, flow.continuing);
    const normal = flow.normal === undefined ? undefined : block(stmt.always, flow.normal);
    const exited = block(stmt.always, flow.exited);
    const thrown = flow.thrown === undefined ? undefined : block(stmt.always, flow.thrown);
    return {normal:normal?.normal, exited:Math.max(normal?.exited ?? 0, exited.normal ?? 0, exited.exited),
      thrown:maximum(normal?.thrown, exited.thrown, thrown?.normal, thrown?.thrown, breaking?.thrown, continuing?.thrown), breaking:breaking?.normal, continuing:continuing?.normal};
  }
  const count = add(initial, stmt.kind === 'assign' ? add(calls(stmt.value), calls(stmt.target)) :
    stmt.kind === 'return' ? stmt.value ? calls(stmt.value) : 0 :
      calls(stmt.kind === 'expr' ? stmt.expr : stmt.value));
  return { normal: stmt.kind === 'return' || stmt.kind === 'throw' ? undefined : count,
    exited: stmt.kind === 'return' ? count : 0,
    // Calls can fail after next has run. Catch paths therefore inherit the
    // consumed continuation, including failures during a return expression.
    thrown: count };
}

export function canRepeatNext(body: Stmt[]): boolean {
  const flow = block(body);
  return maximum(flow.normal, flow.exited, flow.thrown, flow.breaking, flow.continuing) === 2;
}

export function canFallThrough(body: Stmt[]): boolean { return block(body).normal !== undefined; }
