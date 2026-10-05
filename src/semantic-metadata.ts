import {createHash} from 'node:crypto';
import {existsSync,lstatSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import type {Project} from './project.ts';

export interface DependencyMetadata {file:string;sha256:string|null}
/** Physical metadata belongs to a checked revision even when source interfaces
 * are unchanged. These digests identify inputs; they do not inspect foreign code. */
export function semanticDependencyMetadata(project:Project):DependencyMetadata[] {
  const identities=new Map<string,string|null>();
  const selections=[{directory:project.root,identity:'project',bindings:project.library?.native?.bindings},
    ...[...project.packages.scopes.values()].map(scope=>({directory:scope.directory,identity:`package/${scope.name}@${scope.version}`,bindings:scope.native?.bindings}))];
  for(const selection of selections)for(const file of new Set(['main.yaml','aug-package.json','package.json','native.abi.json','aug.lock.json','THIRD_PARTY_NOTICES.md',...(selection.bindings?[selection.bindings]:[])])) {
    const path=join(selection.directory,file),key=selection.identity+'/'+file;let value:string|null=null;
    if(existsSync(path)) {
      const stat=lstatSync(path);
      if(!stat.isFile()||stat.isSymbolicLink()||stat.size>16*1024*1024)throw new Error('SEMANTIC_METADATA: Dependency metadata must be bounded regular files: '+key);
      const bytes=readFileSync(path);
      if(bytes.length>16*1024*1024)throw new Error('SEMANTIC_METADATA: Dependency metadata exceeds 16 MiB: '+key);
      value=createHash('sha256').update(bytes).digest('hex');
    }
    if(identities.has(key)&&identities.get(key)!==value)throw new Error('SEMANTIC_METADATA: Dependency identity has conflicting physical metadata: '+key);
    identities.set(key,value);
  }
  return [...identities].map(([file,sha256])=>({file,sha256})).sort((a,b)=>a.file<b.file?-1:a.file>b.file?1:0);
}
