import {createHash} from 'node:crypto';
const hash=text=>createHash('sha256').update(text).digest('hex');

/** Only compiler-generated, content-matched code navigation metadata becomes HTML. */
export function readSourceNavigation(raw,source) {
  const matches=[...(raw??'').matchAll(/(?:^|\s)aug-source=([A-Za-z0-9_-]+)(?=\s|$)/g)];
  if(!matches.length)return null;
  if(matches.length!==1||matches[0][1].length>512000)throw new Error('Invalid example source navigation metadata');
  const bytes=Buffer.from(matches[0][1],'base64url');if(bytes.toString('base64url')!==matches[0][1])throw new Error('Invalid example navigation encoding');
  const value=JSON.parse(bytes.toString('utf8')),count=source.trimEnd().split('\n').length;
  if(!value||Object.keys(value).sort().join(',')!=='format,formattedSha256,links,sourceSha256,style'||value.format!==1||
    !['indent','braces'].includes(value.style)||typeof value.sourceSha256!=='string'||!/^[a-f0-9]{64}$/.test(value.sourceSha256)||value.formattedSha256!==hash(source.trimEnd())||
    !Array.isArray(value.links)||value.links.length>10000)throw new Error('Example source navigation differs from its formatted source');
  const ids=new Set();
  for(const link of value.links){
    if(!link||Object.keys(link).sort().join(',')!=='backlinks,first,id,last'||typeof link.id!=='string'||!/^source-L[1-9][0-9]*(?:-L[1-9][0-9]*)?$/.test(link.id)||ids.has(link.id)||
      !Number.isSafeInteger(link.first)||!Number.isSafeInteger(link.last)||link.first<1||link.last<link.first||link.last>count||
      !Array.isArray(link.backlinks)||!link.backlinks.length||link.backlinks.length>10000||new Set(link.backlinks).size!==link.backlinks.length||
      link.backlinks.some(backlink=>typeof backlink!=='string'||backlink.startsWith('/')||!/^(?:[A-Za-z0-9_./%-]+\.md)?#[A-Za-z0-9_.-]+$/.test(backlink)))throw new Error('Invalid example source navigation range');
    const range=/^source-L([1-9][0-9]*)(?:-L([1-9][0-9]*))?$/.exec(link.id);
    const first=Number(range[1]),last=Number(range[2]??range[1]);
    if(!Number.isSafeInteger(first)||!Number.isSafeInteger(last)||last<first)throw new Error('Invalid example original source range');
    ids.add(link.id);
  }
  return value;
}
const metadata=context=>context.meta.augustSourceNavigation??=
  {value:readSourceNavigation(context.options.meta?.__raw,context.source)};
export const sourceNavigationTransformer={
  name:'august:source-navigation',
  line(node,line) {
    const value=metadata(this).value;if(!value)return;
    node.properties['data-aug-line']=String(line);
  },
  code() {
    const value=metadata(this).value;if(!value)return;
    this.lines.forEach((node,index)=>{const line=index+1;
    const links=value.links.filter(link=>link.first===line);
    for(const link of links)node.children.unshift({type:'element',tagName:'span',properties:{id:link.id+(value.style==='braces'?'-braces':''),'aria-hidden':'true','data-aug-source-id':link.id},children:[]});
    const destinations=[...new Set(links.sort((a,b)=>(a.last-a.first)-(b.last-b.first)).flatMap(link=>link.backlinks))].map(href=>href.replace(/\.md(?=#)/,'.html'));
    destinations.sort((a,b)=>Number(!a.startsWith('#'))-Number(!b.startsWith('#')));
    if(destinations.length===1)node.children.unshift({type:'element',tagName:'a',properties:{class:'aug-spec-backlink',href:destinations[0],'aria-label':'Read the explanation for this code',title:'Read the explanation for this code'},children:[]});
    else if(destinations.length>1)node.children.unshift({type:'element',tagName:'details',properties:{class:'aug-spec-backlinks vp-copy-ignore'},children:[
      {type:'element',tagName:'summary',properties:{'aria-label':'Read the '+destinations.length+' explanations for this code',title:'Read explanations for this code'},children:[]},
      {type:'element',tagName:'div',properties:{class:'aug-spec-backlink-list'},children:destinations.map((href,index)=>({type:'element',tagName:'a',properties:{href,'aria-label':'Read explanation '+(index+1)},children:[{type:'text',value:'Explanation '+(index+1)}]}))}
    ]});
    });
  },
  pre(node) {
    const value=metadata(this).value;if(!value)return;
    node.properties['data-aug-source-style']=value.style;
    node.properties['data-aug-source-revision']=value.sourceSha256;
    node.properties['data-aug-source-links']=JSON.stringify(value.links);
  }
};
