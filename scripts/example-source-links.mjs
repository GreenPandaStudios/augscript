import {createHash} from 'node:crypto';
import {dirname,relative,resolve} from 'node:path';
import {formatFileWithSourceMap} from '../src/formatter.ts';
import {parse} from '../src/parser.ts';
const hash=text=>createHash('sha256').update(text).digest('hex');
const url=path=>path.replaceAll('\\','/').split('/').map(encodeURIComponent).join('/');
const safeAnchor=id=>id.replace(/[^A-Za-z0-9_.-]/g,char=>'-'+char.codePointAt(0).toString(16)+'-');

/** Preserve source line identities while each wiki view uses the real formatter. */
export function planExampleNavigation(artifacts,docs,sources) {
  const texts=new Map(),references=new Map();
  for(const artifact of artifacts.filter(output=>output.path.endsWith('.aug.md')||output.kind==='diagram')){
    const page=docs.get(artifact.path);let paragraph=0;
    let text=artifact.text.replace(/^<!--[^\n]*-->\n\n# [^\n]+\n\n/,'')
      .replace(/^<!-- August spec revision: [^\n]*-->\n\n/gm,'')
      .replace(/^<details>\n<summary>Checked interface<\/summary>\n([\s\S]*?)\n<\/details>$/gm,(_,body)=>'::: details Checked interface\n'+body+'\n:::')
      .replace(/<a id="([^"]+)"><\/a>\n+(#{2,6} [^\n]+)/g,(_,id,heading)=>heading+' {#'+safeAnchor(id)+'}');
    text=text.split('\n').map(line=>{
      const local=[];
      const rewritten=line.replace(/\]\(([^\n)]+)\)/g,(original,href)=>{
        if(/^(?:https?:|mailto:|#)/.test(href))return original;
        const [path,anchor]=href.split('#'),target=resolve(dirname(artifact.path),decodeURIComponent(path)),destination=docs.get(target)??sources.get(target);
        if(!destination)throw new Error('Unmapped specification link: '+href+' in '+artifact.path);
        if(sources.has(target)) {
          const range=/^L([1-9][0-9]*)(?:-L([1-9][0-9]*))?$/.exec(anchor??'');
          if(!range)throw new Error('Missing source range: '+href);
          const first=Number(range[1]),last=Number(range[2]??range[1]);if(last<first)throw new Error('Reversed source range: '+href);
          const id='source-'+anchor;local.push({target,id,sourceFirst:first,sourceLast:last});
          return ']('+url(relative(dirname(page),destination))+'#'+id+')';
        }
        return ']('+url(relative(dirname(page),destination))+(anchor?'#'+safeAnchor(decodeURIComponent(anchor)):'')+')';
      });
      if(!local.length)return rewritten;
      const heading=/^#{2,6} .+ \{#([A-Za-z0-9_.-]+)\}$/.exec(rewritten),id=heading?.[1]??'specification-paragraph-'+(++paragraph);
      for(const ref of local){const list=references.get(ref.target)??[];list.push({...ref,page,paragraph:id});references.set(ref.target,list);}
      return heading?rewritten:'::: spec-paragraph '+id+'\n'+rewritten+'\n:::';
    }).join('\n');
    texts.set(artifact.path,artifact.kind==='diagram'?text:text.replace(/^(#{2,5}) /gm,'$1# '));
  }
  return {texts,references};
}

/** Navigation ranges cover the source lines that contributed to each paragraph. */
export function exampleSourceViews(project,file,sourceText,refs,page) {
  const parsed=parse(file.path,sourceText);if(parsed.diagnostics.length)throw new Error('Cannot map invalid example source');
  return ['indent','braces'].map(style=>{
    const view=formatFileWithSourceMap({...project,config:{...project.config,block_style:style,indentation:'spaces'}},parsed.file),links=new Map();
    for(const ref of refs??[]){
      const contained=view.mappings.filter(mapping=>mapping.source.line>=ref.sourceFirst&&mapping.source.endLine<=ref.sourceLast);
      const covering=view.mappings.filter(mapping=>mapping.source.line<=ref.sourceFirst&&mapping.source.endLine>=ref.sourceLast)
        .sort((a,b)=>(a.source.end-a.source.start)-(b.source.end-b.source.start));
      const selected=contained.length?contained:covering.slice(0,1);
      if(!selected.length)throw new Error('No formatted source for '+ref.id+' in '+file.path);
      const first=Math.min(...selected.map(mapping=>mapping.formatted.line)),last=Math.max(...selected.map(mapping=>mapping.formatted.endLine));
      const backlink=(ref.page===page?'':url(relative(dirname(page),ref.page)))+'#'+ref.paragraph;
      const previous=links.get(ref.id);
      if(previous){if(!previous.backlinks.includes(backlink))previous.backlinks.push(backlink);}
      else links.set(ref.id,{id:ref.id,first,last,backlinks:[backlink]});
    }
    const metadata={format:1,style,sourceSha256:hash(sourceText),formattedSha256:hash(view.text.trimEnd()),links:[...links.values()]};
    return {text:view.text,metadata,encoded:Buffer.from(JSON.stringify(metadata)).toString('base64url')};
  });
}
