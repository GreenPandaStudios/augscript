import type {Expr} from './ast.ts';

/** The bounded default profile contains data, not calls or ambient names. */
export function literalDefault(expr: Expr): boolean {
  return expr.kind === 'literal' || expr.kind === 'collection' && expr.items.every(literalDefault) ||
    expr.kind === 'unary' && expr.op === '-' && expr.value.kind === 'literal' && typeof expr.value.value === 'number';
}

/** Stable source for defaults in public contracts; numeric spelling preserves int64. */
export function defaultText(expr: Expr): string {
  if (expr.kind === 'literal') return expr.numericText ?? JSON.stringify(expr.value);
  if (expr.kind === 'unary') return expr.op + defaultText(expr.value);
  if (expr.kind === 'collection') {
    const items = expr.items.map(defaultText);
    if (expr.collection === 'List') return '[' + items.join(', ') + ']';
    if (expr.collection === 'Tuple') return '(' + items.join(', ') + (items.length === 1 ? ',' : '') + ')';
    if (expr.collection === 'Map') return '{' + items.filter((_, i) => i % 2 === 0).map((key, i) => key + ': ' + items[i * 2 + 1]).join(', ') + '}';
    return '{' + items.join(', ') + '}';
  }
  return '<invalid default>'; // Incomplete editor documents still receive diagnostics.
}
