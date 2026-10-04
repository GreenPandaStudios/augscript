/** Behavioral relations remain explicit until sentence planning. No stage ranks or drops steps. */
type Evidence = { source?: string };
export type ActionVerb = 'set' | 'store' | 'split' | 'call' | 'construct' | 'evaluate' | 'return' | 'fail' | 'send' | 'freeze' | 'serve' | 'increase' | 'decrease' | 'continue' | 'leave';
export type FlowNode = Evidence & (
  | { kind: 'step'; text: string }
  | { kind: 'action'; verb: ActionVerb; object: string }
  | { kind: 'sequence'; lead: string; items: string[]; infinitive?: string }
  | { kind: 'branch'; condition: string; then: FlowNode[]; otherwise: FlowNode[]; requirement?: string }
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
const sentencesIn = (text:string) => (text.replace(/(`+)[\s\S]*?\1/g,'').match(/[.!?](?:\s|$)/g)??[]).length;
type Sentence = { text: string; sources: string[]; boundary?: boolean; infinitive?: string };
export interface ProsePlan { paragraphs: string[]; sources: string[] }

/** Small deterministic microplanner. A clause may join only other clauses in its own scope. */
export function planFlow(nodes: FlowNode[]): ProsePlan {
  const sentence = (text: string, sources: string[] = [], boundary = false): Sentence => ({text, sources, boundary});
  const plan = (children: FlowNode[]): Sentence[] => {
    const result:Sentence[]=[];
    let transition='';
    const append=(items:Sentence[])=>{
      if(transition&&items.length)items[0].text=transition+', '+clause(items[0].text)+'.';
      transition='';result.push(...items);
    };
    for(let index=0;index<children.length;index++) {
      const node=children[index];
      const setting=node.kind==='action'&&node.verb==='set'?node.object.match(/^(`[^`]+`) to (.+)$/):undefined;
      if(setting) {
        const settings=[node];
        while(index+1<children.length) {
          const next=children[index+1], match=next.kind==='action'&&next.verb==='set'?next.object.match(/^(`[^`]+`) to (.+)$/):undefined;
          if(!match||match[2]!==setting[2])break;
          settings.push(next);index++;
        }
        if(settings.length>1) {
          append([sentence('It sets '+coordinate(settings.map(item=>(item as Extract<FlowNode,{kind:'action'}>).object.match(/^(`[^`]+`)/)![1]))+
            ' separately, each to '+setting[2]+'.',settings.flatMap(item=>item.source?[item.source]:[]))]);
          continue;
        }
      }
      // Adjacent validation guards have one outcome. Explain the checks together,
      // retaining every guard and failure in the evidence ledger.
      if(node.kind==='branch'&&node.requirement&&!node.otherwise.length) {
        const guards=[node];
        while(index+1<children.length) {
          const next=children[index+1];
          if(next.kind!=='branch'||!next.requirement||next.otherwise.length||next.then[0]?.kind!=='action'||node.then[0]?.kind!=='action'||
            next.then[0].object!==node.then[0].object||words(guards.map(guard=>guard.requirement).join(' ')+next.requirement)>65)break;
          guards.push(next);index++;
        }
        const failure=node.then[0] as Extract<FlowNode,{kind:'action'}>;
        append([sentence('It checks that '+coordinate(guards.map(guard=>guard.requirement!))+'. It raises '+failure.object.replace(/^with /,'')+' at the first failed check.',
          guards.flatMap(guard=>[...(guard.source?[guard.source]:[]),...plan(guard.then).flatMap(item=>item.sources)]))]);
      }else {
        append(realize(node,index<children.length-1));
        if(node.kind==='loop')transition='After the loop';
        if(node.kind==='branch'&&(!compact(node.then)&&!exits(node.then)||node.otherwise.length&&!compact(node.otherwise)&&!exits(node.otherwise)))transition='After that conditional work';
      }
    }
    return result;
  };
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
    const continuation = /(?: and| always| it)$/.test(lead);
    const join = continuation ? ' ' : ', ';
    const small = compact(children);
    if (small) {
      // One guard governs a coordinated sequence, never an adjacent outer statement.
      const items = plan(children);
      return [sentence(`${lead}${join}${items.length ? items.map((item,index)=>
        (index ? 'then ' : '') + (continuation && !index ? bare(item.text) : clause(item.text))).join('; ') : continuation?'does nothing':'it does nothing'}.`, small.sources)];
    }
    const items=plan(children);
    if(!items.length)return [sentence(`${lead}${join}it does nothing.`)];
    items[0].text=lead+join+(continuation?bare(items[0].text):clause(items[0].text))+'.';
    // The paragraph itself expresses the scope. Only loops and resource scopes
    // need an exit contract; avoid narrating the edges of the syntax tree.
    return items;
  };
  const realize = (node: FlowNode, hasNext: boolean): Sentence[] => {
    let result: Sentence[];
    switch (node.kind) {
      case 'step': result = [sentence(node.text)]; break;
      case 'action': {
        const verbs:Record<ActionVerb,string>={set:'sets',store:'stores',split:'splits',call:'calls',construct:'creates',evaluate:'evaluates',return:'returns',fail:'raises',send:'sends',freeze:'freezes',serve:'serves',increase:'increases',decrease:'decreases',continue:'continues',leave:'leaves'};
        const object=node.object?' '+node.object:'';
        const realized=node.verb==='fail'?`It raises ${node.object.replace(/^with /,'')}.`:`It ${verbs[node.verb]}${object}.`;
        result = [{...sentence(realized),infinitive:node.verb==='fail'?'raise '+node.object.replace(/^with /,''):node.verb+object}]; break;
      }
      case 'sequence': result = [{...sentence(`${node.lead}: ${coordinate(node.items)}.`),
        infinitive:node.infinitive?node.infinitive+': '+coordinate(node.items):undefined}]; break;
      case 'branch': {
        const yes=node.then[0],no=node.otherwise[0];
        if(node.then.length===1&&node.otherwise.length===1&&yes.kind==='action'&&no.kind==='action'&&yes.verb==='return'&&no.verb==='return')
          result=[sentence(`It returns ${yes.object} if ${node.condition}, or ${no.object} otherwise.`,[...(yes.source?[yes.source]:[]),...(no.source?[no.source]:[])])];
        else result=[...under('If '+node.condition,node.then,''),...(node.otherwise.length?under('Otherwise',node.otherwise,''):[])];
        break;
      }
      case 'loop': result = under(node.lead, node.children, node.end); break;
      case 'choice': {
        result = node.cases.length>2||node.cases.some(item=>item.condition.includes(' satisfies '))?
          [sentence('It handles '+node.value+' with the first matching case.')]:[];
        for (const alternative of node.cases) result.push(...under(alternative.condition, alternative.children, alternative.end??'This ends that case.'));
        break;
      }
      case 'attempt': {
        const small = compact(node.children);
        result = small?.infinitive||!node.children.length ? [sentence(node.children.length?'It tries to '+small!.infinitive+'.':'This attempt has no operation.', small?.sources??[], true)] :
          plan(node.children);
        for (const handler of node.catches) {
          const used=plan(handler.children).some(item=>visible(item.text).includes(visible(handler.name)));
          result.push(...under(`If this work raises ${handler.error}${used?' as '+handler.name:''}, it`,handler.children,''));
        }
        if (node.always !== undefined) result.push(...under('Whether it succeeds or fails, it always', node.always, ''));
        break;
      }
      case 'scope': result = [...under(node.lead, node.children, ''), ...(node.end?[sentence(node.end)]:[])]; break;
    }
    if (node.source) result[0].sources.unshift(node.source);
    return result;
  };
  const sentences = plan(nodes), paragraphs: string[] = [];
  let current = '';
  for (const item of sentences) {
    if (current && (item.boundary || words(current + ' ' + item.text) > 110 || sentencesIn(current+' '+item.text)>4)) { paragraphs.push(current); current = ''; }
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
    if(current&&(words(current+' '+text)>110||sentencesIn(current+' '+text)>4))flush();
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
