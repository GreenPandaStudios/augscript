/** Behavioral relations remain explicit until sentence planning. No stage ranks or drops steps. */
type Evidence = { source?: string };
export type ActionVerb = 'set' | 'split' | 'call' | 'construct' | 'evaluate' | 'return' | 'fail' | 'send' | 'freeze' | 'serve' | 'increase' | 'decrease' | 'continue';
export type FlowNode = Evidence & (
  | { kind: 'step'; text: string }
  | { kind: 'action'; verb: ActionVerb; object: string }
  | { kind: 'sequence'; lead: string; items: string[]; infinitive?: string }
  | { kind: 'branch'; condition: string; then: FlowNode[]; otherwise: FlowNode[] }
  | { kind: 'loop'; lead: string; children: FlowNode[]; end: string }
  | { kind: 'choice'; value: string; cases: { condition: string; end?: string; children: FlowNode[] }[] }
  | { kind: 'attempt'; children: FlowNode[]; catches: { error: string; name: string; children: FlowNode[] }[]; always?: FlowNode[] }
  | { kind: 'scope'; lead: string; children: FlowNode[]; end: string }
);

export type SpecNode =
  | { kind: 'section'; title: string; level: number; anchor?: string; source?: string; children: SpecNode[] }
  | { kind: 'paragraph'; text: string }
  | { kind: 'flow'; steps: FlowNode[] };

export const step = (text: string): FlowNode => ({ kind: 'step', text });
export const action = (verb: ActionVerb, object: string): FlowNode => ({kind:'action', verb, object});
export const sequence = (lead: string, items: string[], infinitive?: string): FlowNode => ({ kind: 'sequence', lead, items, infinitive });
export const branch = (condition: string, then: FlowNode[], otherwise: FlowNode[] = []): FlowNode =>
  ({ kind: 'branch', condition, then, otherwise });
export const loop = (lead: string, children: FlowNode[], end: string): FlowNode => ({ kind: 'loop', lead, children, end });
export const choice = (value: string, cases: Extract<FlowNode, {kind:'choice'}>['cases']): FlowNode => ({kind:'choice', value, cases});
export const attempt = (children: FlowNode[], catches: Extract<FlowNode, {kind:'attempt'}>['catches'], always?: FlowNode[]): FlowNode =>
  ({kind:'attempt', children, catches, always});
export const scope = (lead: string, children: FlowNode[], end: string): FlowNode => ({kind:'scope', lead, children, end});
export const paragraph = (text: string): SpecNode => ({ kind: 'paragraph', text });
export const flow = (steps: FlowNode[]): SpecNode => ({ kind: 'flow', steps });
export const section = (title: string, level: number, children: SpecNode[], anchor?: string, source?: string): SpecNode =>
  ({ kind: 'section', title, level, anchor, source, children });

/** Coordination is grammatical only; callers retain the original evaluation order. */
export function coordinate(items: string[], conjunction = 'and'): string {
  return items.length < 2 ? items[0] ?? '' : items.length === 2 ? items.join(` ${conjunction} `) :
    items.slice(0, -1).join(', ') + `, ${conjunction} ` + items.at(-1);
}

const clause = (text: string) => text.charAt(0).toLowerCase() + text.slice(1).replace(/\.$/, '');
const bare = (text: string) => clause(text).replace(/^it /, '');
const visible = (text: string) => text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '');
const words = (text: string) => visible(text).split(/\s+/).filter(Boolean).length;
type Sentence = { text: string; sources: string[]; boundary?: boolean; infinitive?: string };
export interface ProsePlan { paragraphs: string[]; sources: string[] }

/** Small deterministic microplanner. A clause may join only other clauses in its own scope. */
export function planFlow(nodes: FlowNode[]): ProsePlan {
  const sentence = (text: string, sources: string[] = [], boundary = false): Sentence => ({text, sources, boundary});
  const plan = (children: FlowNode[]): Sentence[] => children.flatMap((node,index)=>realize(node,index<children.length-1));
  const compact = (children: FlowNode[]): Sentence | undefined => {
    if (!children.length) return sentence('Do nothing.');
    if (children.length > 3 || children.some(child => !['step','action','sequence'].includes(child.kind))) return;
    const sentences = plan(children);
    if (sentences.some(item => item.boundary || words(item.text) > 42) || words(sentences.map(item=>item.text).join(' ')) > 55) return;
    return {...sentence(sentences.map(item=>item.text).join(' '), sentences.flatMap(item=>item.sources)),
      infinitive:sentences.every(item=>item.infinitive)?sentences.map(item=>item.infinitive).join(', then '):undefined};
  };
  const exits=(children:FlowNode[]):boolean=>{
    const last=children.at(-1);
    if(!last)return false;
    return last.kind==='action'?(last.verb==='return'||last.verb==='fail'):
      last.kind==='branch'?exits(last.then)&&exits(last.otherwise):
      last.kind==='scope'?exits(last.children):
      last.kind==='attempt'?exits(last.children)&&last.catches.every(handler=>exits(handler.children)):false;
  };
  const under = (lead: string, children: FlowNode[], end: string): Sentence[] => {
    const continuation = /(?: and| always)$/.test(lead);
    const join = continuation ? ' ' : ', ';
    const small = compact(children);
    if (small) {
      // One guard governs a coordinated sequence, never an adjacent outer statement.
      const items = plan(children);
      return [sentence(`${lead}${join}${items.length ? items.map((item,index)=>
        (index ? 'then ' : '') + (continuation && !index ? bare(item.text) : clause(item.text))).join('; ') : continuation?'does nothing':'it does nothing'}.`, small.sources)];
    }
    return [sentence(`${lead}${join}${continuation?'follows':'it follows'} these steps.`, [], true), ...plan(children),
      ...(exits(children)?[]:[sentence(end, [], true)])];
  };
  const realize = (node: FlowNode, hasNext: boolean): Sentence[] => {
    let result: Sentence[];
    switch (node.kind) {
      case 'step': result = [sentence(node.text)]; break;
      case 'action': {
        const verbs:Record<ActionVerb,string>={set:'sets',split:'splits',call:'calls',construct:'constructs',evaluate:'evaluates',return:'returns',fail:'fails',send:'sends',freeze:'freezes',serve:'serves',increase:'increases',decrease:'decreases',continue:'continues'};
        const object=node.object?' '+node.object:'';
        result = [{...sentence(`It ${verbs[node.verb]}${object}.`),infinitive:node.verb+object}]; break;
      }
      case 'sequence': result = [{...sentence(`${node.lead}: ${coordinate(node.items)}.`),
        infinitive:node.infinitive?node.infinitive+': '+coordinate(node.items):undefined}]; break;
      case 'branch': result = [
        ...under('If ' + node.condition, node.then, 'This ends that branch.'),
        ...(node.otherwise.length ? under('Otherwise', node.otherwise, 'This ends the alternative branch.') : []),
      ]; break;
      case 'loop': result = under(node.lead, node.children, node.end); break;
      case 'choice': {
        result = [sentence(`Select the first matching case for ${node.value}.`, [], true)];
        for (const alternative of node.cases) result.push(...under(alternative.condition, alternative.children, alternative.end??'This ends that case.'));
        // This explicit boundary prevents a following action inheriting the final case's guard.
        if(hasNext)result.push(sentence('After the match, execution continues unless the selected case returned or failed.', [], true));
        break;
      }
      case 'attempt': {
        const small = compact(node.children);
        result = small?.infinitive||!node.children.length ? [sentence(node.children.length?'It tries to '+small!.infinitive+'.':'This attempt has no operation.', small?.sources??[], true)] :
          [sentence('It tries the following steps.', [], true), ...plan(node.children)];
        for (const handler of node.catches) result.push(...under(`If this attempt raises ${handler.error}, it catches it as ${handler.name} and`, handler.children, 'This ends that recovery path.'));
        if (node.always !== undefined) result.push(...under('Before leaving this attempt, it always', node.always, 'This ends the cleanup.'));
        if (hasNext&&(!small || node.catches.some(handler=>!compact(handler.children))))
          result.push(sentence('After the attempt, execution continues unless it returned or failed.', [], true));
        break;
      }
      case 'scope': result = [...under(node.lead, node.children, 'This ends the block.'), sentence(node.end, [], true)]; break;
    }
    if (node.source) result[0].sources.unshift(node.source);
    return result;
  };
  const sentences = plan(nodes), paragraphs: string[] = [];
  let current = '';
  for (const item of sentences) {
    if (current && (item.boundary || words(current + ' ' + item.text) > 85)) { paragraphs.push(current); current = ''; }
    current += (current ? ' ' : '') + item.text;
  }
  if (current) paragraphs.push(current);
  const sources=sentences.flatMap(item=>item.sources);
  const evidence=(node:FlowNode):string[]=>{
    const children=node.kind==='branch'?[...node.then,...node.otherwise]:node.kind==='choice'?node.cases.flatMap(item=>item.children):
      node.kind==='attempt'?[...node.children,...node.catches.flatMap(item=>item.children),...(node.always??[])]:
      node.kind==='loop'||node.kind==='scope'?node.children:[];
    return [...(node.source?[node.source]:[]),...children.flatMap(evidence)];
  };
  if(JSON.stringify(sources)!==JSON.stringify(nodes.flatMap(evidence)))throw new Error('Specification planning lost or reordered source facts');
  return { paragraphs, sources };
}

function renderChildren(children:SpecNode[]):string {
  const blocks:string[]=[];
  let current='';
  const flush=()=>{if(current)blocks.push(current);current='';};
  const add=(text:string)=>{
    if(!text.trim())return;
    // Author Markdown keeps its structure; generated contracts and small bodies form connected prose.
    if(text.includes('\n')) {flush();blocks.push(text.trim());return;}
    if(current&&words(current+' '+text)>85)flush();
    current+=(current?' ':'')+text.trim();
  };
  for(const child of children) {
    if(child.kind==='paragraph')add(child.text);
    else if(child.kind==='flow') {
      const paragraphs=planFlow(child.steps).paragraphs;
      if(paragraphs.length)add(paragraphs[0]);
      for(const text of paragraphs.slice(1)) {flush();add(text);}
    }else {flush();blocks.push(renderNode(child));}
  }
  flush();return blocks.join('\n\n');
}

function renderNode(node: SpecNode): string {
  switch (node.kind) {
    case 'paragraph': return node.text.trim();
    case 'flow': return planFlow(node.steps).paragraphs.join('\n\n');
    case 'section': {
      const heading = `${node.anchor ? `<a id="${node.anchor}"></a>\n` : ''}${'#'.repeat(node.level)} ${node.title}${node.source ? ' · ' + node.source : ''}`;
      const body = renderChildren(node.children);
      return heading + (body ? '\n\n' + body : '');
    }
  }
}

/** Lay out planned prose with one blank line between paragraphs. */
export function renderSpecTree(root: SpecNode): string { return renderNode(root).trimEnd() + '\n'; }
