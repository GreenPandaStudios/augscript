// Shared identity of the inputs used to build the compiler-owned runtime.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
export const coreSources=['aug_runtime.c','aug_values.c','aug_tasks.c','aug_json.c','aug_time.c','aug_ir.c'];
export function runtimeSourceIdentity(root,output,files){
  const digest=createHash('sha256');
  const add=(name,path)=>digest.update(name+'\0').update(readFileSync(path));
  for(const file of ['aug_runtime.h','aug_ir.h',...coreSources])add(file,join(root,'runtime',file));
  for(const file of ['minicoro.h','LICENSE'])add('minicoro/'+file,join(root,'.aug-native/sources/minicoro',file));
  for(const file of ['src/yyjson.c','src/yyjson.h','LICENSE'])add('yyjson/'+file,join(root,'.aug-native/sources/yyjson',file));
  for(const file of ['scripts/runtime-components.mjs','scripts/build-runtime-pack.mjs','scripts/runtime-pack-identity.mjs','src/runtime-adapters.ts'])add(file,join(root,file));
  const coreNotices=new Set(['licenses/August.txt','licenses/minicoro.txt','licenses/yyjson.txt']);
  for(const file of files.filter(file=>(file.startsWith('sources/')||file.startsWith('licenses/'))&&!coreNotices.has(file)).sort())add(file,join(output,file));
  return digest.digest('hex');
}
