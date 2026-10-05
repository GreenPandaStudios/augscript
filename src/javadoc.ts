/** Documentation attached to an AugScript declaration. */
export interface Javadoc {
  markdown: string;
  parameters: Map<string, string>;
  tags?: { name: string; value: string }[];
}

function inline(text: string): string {
  return text
    .replace(/\{@code\s+([^}]+)\}/g, (_, value: string) => `\`${value.trim()}\``)
    .replace(/\{@link\s+([^}\s]+)(?:\s+([^}]+))?\}/g,
      (_, target: string, label?: string) => `\`${(label ?? target).trim()}\``);
}

function format(lines: string[]): string {
  return inline(lines.join('\n').trim()).replace(/\n{3,}/g, '\n\n');
}

function precedingBlock(source: string, offset: number): {start: number; raw: string} | undefined {
  let before = source.slice(0, offset);
  // Extern C declarations start their recorded span at the name after the prefix.
  before = before.replace(/\b(?:extern\s+C(?:\s+value)?(?:\s+pure)?|fixture)\s*$/, '');
  const end = before.lastIndexOf('*/');
  if (end < 0 || before.slice(end + 2).trim()) return undefined;
  const start = before.lastIndexOf('/**', end);
  if (start < 0 || before.slice(start + 3, end).includes('*/')) return undefined;
  return {start: start + 3, raw: before.slice(start + 3, end)};
}

/** Exact input-label tokens in the attached Javadoc, for checked source edits. */
export function javadocParameterSpans(source: string, offset: number): {name: string; start: number; end: number}[] {
  const block = precedingBlock(source, offset);
  if (!block) return [];
  let text = '', cursor = block.start;
  const positions: number[] = [];
  for (const raw of block.raw.split('\n')) {
    const prefix = /^\s*\* ?/.exec(raw)?.[0].length ?? 0;
    const line = raw.slice(prefix).trimEnd();
    for (let index = 0; index < line.length; index++) {text += line[index]; positions.push(cursor + prefix + index);}
    text += '\n'; positions.push(cursor + raw.length); cursor += raw.length + 1;
  }
  return [...text.matchAll(/(?:^|\s)@param\b\s*([A-Za-z_][A-Za-z0-9_]*)/g)].map(match => {
    const index = match.index! + match[0].length - match[1].length;
    return {name: match[1], start: positions[index], end: positions[index + match[1].length - 1] + 1};
  });
}

/** Read the closest immediately preceding Javadoc block, if there is one. */
export function javadocBefore(source: string, offset: number): Javadoc | undefined {
  const block = precedingBlock(source, offset);
  if (!block) return undefined;
  const lines = block.raw.split(/\r?\n/).map(line => line.replace(/^\s*\* ?/, '').trimEnd())
    .flatMap(line => line.split(/\s+(?=@(?:param|returns?|throws|exception|deprecated|see)\b)/));
  const description: string[] = [];
  const tags: { name: string; value: string[] }[] = [];
  let current: { name: string; value: string[] } | undefined;
  for (const line of lines) {
    const tag = /^@([A-Za-z]+)\b\s*(.*)$/.exec(line);
    if (tag) {
      current = { name: tag[1], value: [tag[2]] };
      tags.push(current);
    } else if (current) current.value.push(line);
    else description.push(line);
  }
  const sections = [format(description)];
  const parameters = new Map<string, string>();
  const throws: string[] = [];
  for (const tag of tags) {
    const value = format(tag.value);
    if (tag.name === 'param') {
      const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*([\s\S]*)$/.exec(value);
      if (match) parameters.set(match[1], match[2].trim());
    } else if (tag.name === 'return' || tag.name === 'returns') {
      sections.push(`**Returns** ${value}`);
    } else if (tag.name === 'throws' || tag.name === 'exception') {
      const match = /^(\S+)\s*([\s\S]*)$/.exec(value);
      if (match) throws.push(`- \`${match[1]}\`${match[2] ? `: ${match[2].trim()}` : ''}`);
    } else if (tag.name === 'deprecated') sections.push(`**Deprecated:** ${value}`);
    else if (tag.name === 'see') sections.push(`**See also:** ${value}`);
  }
  if (parameters.size) sections.push('**Parameters**\n' +
    [...parameters].map(([name, value]) => `- \`${name}\`${value ? `: ${value}` : ''}`).join('\n'));
  if (throws.length) sections.push('**Throws**\n' + throws.join('\n'));
  const markdown = sections.filter(Boolean).join('\n\n');
  return markdown ? { markdown, parameters, tags: tags.map(tag => ({ name: tag.name, value: format(tag.value) })) } : undefined;
}
