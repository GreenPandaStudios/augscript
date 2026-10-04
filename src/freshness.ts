import {expressionChildren} from './ast.ts';
import type { Expr, Stmt } from './ast.ts';

/** Conservative proof that successful returns preserve constructor freshness. */
export function returnsFresh(body: Stmt[], fields: Set<string>, freshCall: (expr: Expr) => boolean): boolean {
  let valid = true;
  const fresh = (expr: Expr, locals: Map<string, boolean>): boolean => expr.kind === 'name' ?
    locals.get(expr.name) === true : freshCall(expr);
  const escape = (expr: Expr, locals: Map<string, boolean>): void => {
    if (expr.kind === 'recordCopy' || expr.kind === 'interpolation') expressionChildren(expr).forEach(child => escape(child, locals));
    else if (expr.kind === 'start') {escape(expr.call, locals);}
    else if (expr.kind === 'wait') expr.tasks.forEach(task => escape(task, locals));
    else if (expr.kind === 'handle' && expr.call.kind === 'call') expr.call.args.forEach(child => escape(child,locals));
    else if (expr.kind === 'markup') [...expr.attributes.map(attribute => attribute.value), ...expr.children].forEach(child => escape(child, locals));
    else if (expr.kind === 'collection') {
      if (expr.items.some(item => fresh(item, locals))) for (const name of locals.keys()) locals.set(name, false);
      expr.items.forEach(item => escape(item, locals));
    } else if (expr.kind === 'call') {
      const isRead = expr.callee.kind === 'name' && ['next', 'print'].includes(expr.callee.name);
      if (!isRead && expr.args.some(arg => fresh(arg, locals)))
        for (const name of locals.keys()) locals.set(name, false);
      expr.args.forEach(arg => escape(arg, locals));
    } else if (expr.kind === 'binary') { escape(expr.left, locals); escape(expr.right, locals); }
    else if (expr.kind === 'unary') escape(expr.value, locals);
    else if (expr.kind === 'member') escape(expr.object, locals);
  };
  const walk = (statements: Stmt[], locals: Map<string, boolean>): boolean => {
    for (const stmt of statements) {
      if (stmt.kind === 'break' || stmt.kind === 'continue') return false;
      if (stmt.kind === 'return') {
        if (stmt.value) escape(stmt.value, locals);
        if (!stmt.value || !fresh(stmt.value, locals)) valid = false;
        return false;
      }
      if (stmt.kind === 'throw') { escape(stmt.value, locals); return false; }
      if (stmt.kind === 'expr') { escape(stmt.expr, locals); continue; }
      if (stmt.kind === 'freeze') { locals.set(stmt.name, false); continue; }
      if (stmt.kind === 'serve') { escape(stmt.port, locals); continue; }
      if (stmt.kind === 'destructure') {
        escape(stmt.value, locals);
        stmt.names.forEach(name => locals.set(name, false));
        continue;
      }
      if (stmt.kind === 'for') {
        escape(stmt.iterable, locals);
        const inside = new Map(locals);
        stmt.names.forEach(name => inside.set(name, false));
        walk(stmt.body, inside);
        for (const name of locals.keys()) if (inside.get(name) !== true) locals.set(name, false);
        continue;
      }
      if (stmt.kind === 'match') {
        escape(stmt.value, locals);
        const states = stmt.cases.map(() => new Map(locals));
        const continues = stmt.cases.map((clause, index) => walk(clause.body, states[index]));
        if (continues.every(value => !value)) return false;
        for (const name of locals.keys()) locals.set(name, states.every((state, index) => !continues[index] || state.get(name) === true));
        continue;
      }
      if (stmt.kind === 'assign') {
        escape(stmt.value, locals);
        const value = fresh(stmt.value, locals);
        if (stmt.target.kind === 'name' && !fields.has(stmt.target.name)) locals.set(stmt.target.name, value);
        else if (value) for (const name of locals.keys()) locals.set(name, false);
        continue;
      }
      if (stmt.kind === 'if') {
        escape(stmt.test, locals);
        if (stmt.test.kind === 'literal' && typeof stmt.test.value === 'boolean') {
          if (!walk(stmt.test.value ? stmt.then : stmt.otherwise, locals)) return false;
          continue;
        }
        const left = new Map(locals), right = new Map(locals);
        const leftContinues = walk(stmt.then, left), rightContinues = walk(stmt.otherwise, right);
        if (!leftContinues && !rightContinues) return false;
        for (const name of locals.keys()) locals.set(name,
          (!leftContinues || left.get(name) === true) && (!rightContinues || right.get(name) === true));
        continue;
      }
      if (stmt.kind === 'try') {
        if (stmt.always) {
          const cleanup = new Map(locals); walk(stmt.always, cleanup);
          for (const name of locals.keys()) if (!cleanup.get(name)) locals.set(name, false);
        }
        const states = [new Map(locals), ...stmt.catches.map(() => new Map(locals))];
        const continues = [walk(stmt.body, states[0]), ...stmt.catches.map((clause, i) => walk(clause.body, states[i + 1]))];
        if (continues.every(value => !value)) return false;
        for (const name of locals.keys()) locals.set(name,
          states.every((state, index) => !continues[index] || state.get(name) === true));
        continue;
      }
      if (stmt.kind === 'while') {
        if (stmt.test.kind === 'literal' && stmt.test.value === false) continue;
        escape(stmt.test, locals);
        const inside = new Map(locals);
        walk(stmt.body, inside);
        for (const name of locals.keys()) if (inside.get(name) !== true) locals.set(name, false);
        if (stmt.test.kind === 'literal' && stmt.test.value === true) return false;
        continue;
      }
      if(stmt.kind==='yield'){escape(stmt.value,locals);continue;}
      if (!walk(stmt.body, locals)) return false;
    }
    return true;
  };
  if (walk(body, new Map())) valid = false;
  return valid;
}
