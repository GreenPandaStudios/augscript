import {dirname,relative,resolve} from 'node:path';
import {isStatement,type Span,type TestDecl} from './ast.ts';
import {renderSpecTree,type FlowNode,type SpecNode} from './spec-tree.ts';

/** Shared title identity for test explanations and boundary links. */
export const readingTestTitle=(suite:TestDecl)=>'test '+suite.type.name+(suite.name===suite.type.name?'':' '+suite.name);

/** Internal reading views share the prose tree rather than reconstructing behavior. */
export function readingSections(tree:SpecNode|undefined):Extract<SpecNode,{kind:'section'}>[] {
  if(!tree)return [];
  return tree.kind==='section'||tree.kind==='details'
    ?[...(tree.kind==='section'?[tree]:[]),...tree.children.flatMap(readingSections)]:[];
}

/** Rebase links when an explanation is displayed at a coarser reading level. */
export function rebaseReading(text:string,from:string,to:string):string {
  return text.replace(/\[([^\]]*)\]\(([^)]+)\)/g,(whole,label,target:string)=>{
    if(/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(target))return whole;
    const at=target.indexOf('#'),path=at<0?target:target.slice(0,at),fragment=at<0?'':target.slice(at);
    const destination=resolve(dirname(from),decodeURIComponent(path||from.split(/[\\/]/).at(-1)!));
    const link=relative(dirname(to),destination).replaceAll('\\','/').split('/').map(encodeURIComponent).join('/');
    return '['+label+']('+link+fragment+')';
  });
}

export function readingExcerpt(tree:SpecNode|undefined,titles:string[],from:string,to:string):string {
  return readingSections(tree).filter(section=>titles.includes(section.title)).map(section=>
    rebaseReading(renderSpecTree({...section,level:3}),from,to)).join('\n');
}

/** Exact source identities join decisions in prose and sequence frames. */
export function readingFacts(tree:SpecNode|undefined):ReadonlyMap<string,FlowNode> {
  const facts=new Map<string,FlowNode>();
  const walk=(nodes:FlowNode[])=>{for(const node of nodes){
    if(node.source)facts.set(node.source,node);
    switch(node.kind){
      case 'branch':walk(node.then);walk(node.otherwise);break;
      case 'loop':case 'scope':walk(node.children);break;
      case 'choice':node.cases.forEach(clause=>walk(clause.children));break;
      case 'attempt':walk(node.children);node.catches.forEach(handler=>walk(handler.children));if(node.always)walk(node.always);break;
    }
  }};
  const visit=(node:SpecNode)=>{if(node.kind==='flow')walk(node.steps);else if(node.kind==='section'||node.kind==='details')node.children.forEach(visit);};
  if(tree)visit(tree);return facts;
}

export const readingFact=(facts:ReadonlyMap<string,FlowNode>,span:Span)=>facts.get(span.file+':'+span.start+':'+span.end);
export const readingLabel=(text:string)=>text.replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replaceAll(String.fromCharCode(96),'');

/** Fail generation if an executable statement has no retained prose evidence. */
export function verifyReadingCoverage(tree:SpecNode,file:import('./ast.ts').SourceFile):void {
  const facts=readingFacts(tree),missing:Span[]=[];
  const visit=(body:import('./ast.ts').Stmt[])=>{for(const statement of body){
    if(!readingFact(facts,statement.span))missing.push(statement.span);
    switch(statement.kind){
      case 'if':visit(statement.then);visit(statement.otherwise);break;
      case 'while':case 'for':case 'scope':case 'unsafe':case 'borrow':case 'lock':visit(statement.body);break;
      case 'match':statement.cases.forEach(clause=>visit(clause.body));break;
      case 'try':visit(statement.body);statement.catches.forEach(handler=>visit(handler.body));if(statement.always)visit(statement.always);break;
    }
  }};
  for(const item of file.items){
    if(isStatement(item))visit([item]);
    else if(item.kind==='function'&&item.body&&!item.forward)visit(item.body);
    else if(item.kind==='class'||item.kind==='interface'||item.kind==='interceptor'){
      if(item.kind==='class'&&item.constructorBody)visit(item.constructorBody);
      item.methods.forEach(method=>{if(method.body)visit(method.body);});
    }else if(item.kind==='test')for(const group of item.groups){
      visit(group.setup.filter(isStatement));group.cases.forEach(test=>visit(test.body));
    }
  }
  if(missing.length)throw new Error('Specification omitted statement evidence at '+missing.map(span=>span.file+':'+span.line).join(', '));
}
