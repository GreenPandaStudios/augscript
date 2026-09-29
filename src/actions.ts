import type {Project} from './project.ts';
import type {Ty} from './types.ts';
import {schemaType} from './schemas.ts';

/** Form transport uses the same checked record shape as the server decoder. */
export function actionSchema(project: Project, type: Ty, seen = new Set<string>()): unknown {
  const result: Record<string,unknown> = {kind:type.name,optional:!!type.optional,nullable:type.nullable};
  if (seen.has(type.id)) return {...result,kind:'json'};
  if (type.def?.node.kind === 'class' && type.def.node.record) {
    const node = type.def.node, types = new Map(node.typeParams.map((name,index) => [name,type.args[index]]));
    result.kind='record'; result.fields=Object.fromEntries(node.fields.map(field => [field.name,actionSchema(project,schemaType(project,field.type,type.def!.file,types),new Set([...seen,type.id]))]));
  }
  return result;
}

/** Only event-to-HTTP transport runs in the browser; application handlers remain August. */
export const actionTransport = `(() => {
  if (globalThis.__augActions) return;
  globalThis.__augActions = true;
  const own = (object,key) => Object.prototype.hasOwnProperty.call(object,key);
  const minInt = -(1n << 63n), maxInt = (1n << 63n)-1n;
  // Captures carry JSON text so JavaScript never rounds a native int64 token.
  function parse(text) {
    let at=0;
    const space=()=>{while(/[ \\t\\r\\n]/.test(text[at]||'!'))at++;};
    function read(depth=0) {
      if(depth>64)throw Error('JSON nesting exceeds 64 levels');space();const start=at, token=text[at++];
      if(token==='"') {
        while(at<text.length) {const next=text[at++];if(next==='"')return JSON.parse(text.slice(start,at));if(next==='\\\\')at++;}
      } else if(token==='[' || token==='{') {
        const object=token==='{', end=object?'}':']', result=object?Object.create(null):[];
        space();if(text[at]===end){at++;return result;}
        while(at<text.length) {
          if(object) {
            space();if(text[at]!=='"')break;const name=read(depth+1);space();
            if(text[at++]!==':'||own(result,name))break;result[name]=read(depth+1);
          } else result.push(read(depth+1));
          space();const next=text[at++];if(next===end)return result;if(next!==',')break;
        }
      } else {
        at=start;
        for(const [word,value] of [['true',true],['false',false],['null',null]])if(text.startsWith(word,at)){at+=word.length;return value;}
        const number=/^-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/.exec(text.slice(at));
        if(number) {
          at+=number[0].length;
          if(!number[2]&&!number[3]){const value=BigInt(number[0]);if(value>=minInt&&value<=maxInt)return value;}
          else if(Number.isFinite(Number(number[0])))return Number(number[0]);
        }
      }
      throw Error('Invalid JSON value');
    }
    const result=read();space();if(at!==text.length)throw Error('Invalid JSON value');return result;
  }
  function json(value,depth=0) {
    if(depth>64)throw Error('JSON nesting exceeds 64 levels');
    if(typeof value==='bigint')return value.toString();
    if(Array.isArray(value))return '['+value.map(item=>json(item,depth+1)).join(',')+']';
    if(value!==null&&typeof value==='object')return '{'+Object.entries(value).map(([name,item])=>JSON.stringify(name)+':'+json(item,depth+1)).join(',')+'}';
    return JSON.stringify(value);
  }
  function scalar(text,schema,label) {
    if (text === 'null' && schema.nullable) return null;
    if (schema.kind === 'string') return text;
    if (schema.kind === 'bool') {if (text === 'true') return true;if (text === 'false') return false;}
    if (schema.kind === 'int' || schema.kind === 'c_int') {if (/^-?(0|[1-9][0-9]*)$/.test(text)) {const value=BigInt(text), min=schema.kind==='c_int'?-(1n<<31n):minInt, max=schema.kind==='c_int'?(1n<<31n)-1n:maxInt;if(value>=min&&value<=max)return value;}}
    if (schema.kind === 'float') {if (/^-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?$/.test(text) && Number.isFinite(Number(text))) return Number(text);}
    if (['List','Set','Tuple','Map','record','Json','json'].includes(schema.kind)) return parse(text);
    throw Error(label + ' has an invalid ' + schema.kind + ' value');
  }
  function formValue(form,schema) {
    const data = new FormData(form), value = Object.create(null), fields = schema.fields;
    for (const [name,item] of data) {
      if (!own(fields,name)) throw Error('Unknown form field ' + name);
      if (own(value,name)) throw Error('Duplicate form field ' + name);
      if (typeof item !== 'string') throw Error('File fields require an upload endpoint');
      if (item === '' && fields[name].optional) continue;
      value[name] = scalar(item,fields[name],name);
    }
    for (const [name,field] of Object.entries(fields)) if (!field.optional && !own(value,name)) throw Error('Missing form field ' + name);
    return value;
  }
  function build(action,form) {
    let path = action.route.path, body;
    const query = new URLSearchParams(), headers = new Headers();
    action.route.parameters.forEach((param,index) => {
      if (!action.present[index] && !param.form) return;
      const value = param.form ? formValue(form,param.schema) : parse(action.values[index]);
      if (param.source === 'path') path = path.replace('{'+param.name+'}',encodeURIComponent(String(value)));
      else if (param.source === 'query') query.append(param.name,String(value));
      else if (param.source === 'header') headers.append(param.name,String(value));
      else if (param.source === 'body') {body=json(value);headers.set('content-type','application/json');}
      else if (param.source === 'form') {const encoded=new URLSearchParams();for(const [name,item] of Object.entries(value)) encoded.append(name,['List','Set','Tuple','Map','record','Json','json'].includes(param.schema.fields[name].kind)?json(item):item===null?'null':String(item));body=encoded;headers.set('content-type','application/x-www-form-urlencoded');}
    });
    const url = new URL(path+(query.size?'?'+query.toString():''),location.origin);
    if(url.origin!==location.origin) throw Error('HTTP actions must use the application origin');
    return {url,options:{method:action.route.method,headers,body,credentials:'same-origin',redirect:'follow'}};
  }
  async function send(event,element,form) {
    event.preventDefault();if(element.dataset.augBusy) return;element.dataset.augBusy='true';
    let output;
    try {
      const request=build(JSON.parse(element.dataset.augAction),form), response=await fetch(request.url,request.options);
      if(!response.ok) {let message='Request failed ('+response.status+')';try {const problem=await response.json();message=problem.detail||problem.title||problem.error||message;}catch {}throw Error(message);}
      if(response.redirected) location.assign(response.url);else location.reload();
    } catch(error) {
      output=document.createElement('p');output.setAttribute('role','alert');output.textContent=error.message||'Request failed';element.after(output);
    } finally {delete element.dataset.augBusy;}
  }
  document.addEventListener('submit',event=>{const form=event.target;if(form.matches('form[data-aug-event="submit"]')) send(event,form,form);});
  document.addEventListener('click',event=>{const button=event.target.closest('button[data-aug-event="click"]');if(button)send(event,button,button.form);});
})();`;
