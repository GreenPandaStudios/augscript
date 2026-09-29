/** The checked program becomes an explanation tree before Markdown is laid out. */
export type FlowNode =
  | { kind: 'step'; text: string }
  | { kind: 'block'; lead: string; children: FlowNode[] }
  | { kind: 'sequence'; lead: string; items: string[] };

export type SpecNode =
  | { kind: 'section'; title: string; level: number; anchor?: string; source?: string; children: SpecNode[] }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[]; ordered?: boolean }
  | { kind: 'flow'; steps: FlowNode[] };

export const step = (text: string): FlowNode => ({ kind: 'step', text });
export const block = (lead: string, children: FlowNode[]): FlowNode => ({ kind: 'block', lead, children });
export const sequence = (lead: string, items: string[]): FlowNode => ({ kind: 'sequence', lead, items });
export const paragraph = (text: string): SpecNode => ({ kind: 'paragraph', text });
export const list = (items: string[], ordered = false): SpecNode => ({ kind: 'list', items, ordered });
export const flow = (steps: FlowNode[]): SpecNode => ({ kind: 'flow', steps });
export const section = (title: string, level: number, children: SpecNode[], anchor?: string, source?: string): SpecNode =>
  ({ kind: 'section', title, level, anchor, source, children });

function renderFlow(nodes: FlowNode[], depth = 0): string {
  return nodes.map(node => {
    const lead = `${'  '.repeat(depth)}- `;
    if (node.kind === 'step') return lead + node.text;
    if (node.kind === 'sequence') return lead + node.lead + ':\n' + node.items.map((item,index) =>
      `${'  '.repeat(depth+1)}${index+1}. ${item}`).join('\n');
    return lead + node.lead + ':' + (node.children.length ? '\n' + renderFlow(node.children, depth + 1) : '');
  }).join('\n');
}

function renderNode(node: SpecNode): string {
  switch (node.kind) {
    case 'paragraph': return node.text.trim();
    case 'list': return node.items.map((item, index) => `${node.ordered ? `${index + 1}.` : '-'} ${item}`).join('\n');
    case 'flow': return renderFlow(node.steps);
    case 'section': {
      const heading = `${node.anchor ? `<a id="${node.anchor}"></a>\n` : ''}${'#'.repeat(node.level)} ${node.title}${node.source ? ' · ' + node.source : ''}`;
      const body = node.children.map(renderNode).filter(Boolean).join('\n\n');
      return heading + (body ? '\n\n' + body : '');
    }
  }
}

/** Use one blank line between semantic blocks and none inside a step list. */
export function renderSpecTree(root: SpecNode): string {
  return renderNode(root).trimEnd() + '\n';
}
