/** The same bounded graph traversal serves composition and module checking. */
export function orderGraph<T extends { key: string; dependencies: string[] }>(nodes: readonly T[],
  cycle: (node: T, path: string[]) => void): T[] {
  const byKey = new Map(nodes.map(node => [node.key, node]));
  const state = new Map<string, number>();
  const ordered: T[] = [];
  const visit = (node: T, path: string[]) => {
    if (state.get(node.key) === 2) return;
    if (state.get(node.key) === 1) { cycle(node, [...path.slice(path.indexOf(node.key)), node.key]); return; }
    state.set(node.key, 1);
    for (const key of node.dependencies) { const dependency = byKey.get(key); if (dependency) visit(dependency, [...path, node.key]); }
    state.set(node.key, 2); ordered.push(node);
  };
  nodes.forEach(node => visit(node, []));
  return ordered;
}
