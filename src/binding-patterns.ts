import {resolve} from 'node:path';
import type {RecordBindingField} from './ast.ts';
import type {CheckedProject} from './checker.ts';

/** Find a checked record-property read in a binding pattern, including renamed fields. */
export function recordBindingFieldAt(checked:CheckedProject,fileName:string,offset:number) {
  let found:RecordBindingField|undefined;
  const visit=(value:unknown):void=>{
    if(found||!value||typeof value!=='object')return;
    if(Array.isArray(value)){value.forEach(visit);return;}
    const field=value as RecordBindingField;
    if(checked.patternFields.has(field)&&field.nameSpan.start<=offset&&offset<field.nameSpan.end){found=field;return;}
    for(const [key,child] of Object.entries(value))if(key!=='span'&&key!=='nameSpan')visit(child);
  };
  visit(checked.project.files.get(resolve(fileName))?.items);
  if(found)return {...checked.patternFields.get(found)!,type:checked.patternTypes.get(found.pattern)!,shorthand:found.pattern.kind==='nameBinding'&&found.pattern.name===found.name};
}

/** Navigate the property label to its declaration; the bound name keeps its local identity. */
export function recordBindingDefinition(checked:CheckedProject,fileName:string,offset:number) {
  const selection=recordBindingFieldAt(checked,fileName,offset);if(!selection)return;
  const span=selection.field.nameSpan??selection.field.span;
  return {name:selection.field.name,file:span.file,line:span.line,column:span.column,kind:'parameter' as const};
}
