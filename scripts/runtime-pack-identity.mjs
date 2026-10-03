// Shared identity of the inputs used to build the compiler-owned runtime.
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
export const coreSources=['aug_runtime.c','aug_values.c','aug_tasks.c','aug_json.c','aug_time.c','aug_ir.c'];
export function runtimeRecipeFiles(platform=process.platform,architecture=process.arch){
  return ['scripts/runtime-components.mjs','scripts/build-runtime-pack.mjs','scripts/runtime-pack-identity.mjs',
    'scripts/bootstrap-native.mjs','scripts/native-dependencies.lock.json','scripts/native-home.mjs',
    'scripts/native-toolchain.mjs','scripts/native-setup.mjs','scripts/prepare-linux-runtimes.mjs','src/runtime-adapters.ts','src/runtime-abi.ts',
    'src/http-policies.ts','src/llvm-platform.ts','src/native-contracts.ts',
    ...(platform==='darwin'?['native/platform/macos-arm64/libSystem.tbd']:
      ['native/platform/linux-'+architecture+'/start.S','native/linux-runtimes.lock.json']),
    'package.json','LICENSE'];
}
export function runtimeSourceIdentity(root,output,files){
  const digest=createHash('sha256');
  const add=(name,path)=>digest.update(name+'\0').update(readFileSync(path));
  for(const file of readdirSync(join(root,'runtime')).filter(file=>/\.[ch]$/.test(file)).sort())add('runtime/'+file,join(root,'runtime',file));
  for(const file of ['minicoro.h','LICENSE'])add('minicoro/'+file,join(root,'.aug-native/sources/minicoro',file));
  for(const file of ['src/yyjson.c','src/yyjson.h','LICENSE'])add('yyjson/'+file,join(root,'.aug-native/sources/yyjson',file));
  for(const file of runtimeRecipeFiles())add(file,join(root,file));
  const coreNotices=new Set(['licenses/August.txt','licenses/minicoro.txt','licenses/yyjson.txt']);
  // August inputs come from the current checkout above. Never substitute the
  // old pack's corresponding sources when deciding whether that pack is stale.
  for(const file of files.filter(file=>(file.startsWith('sources/')||file.startsWith('licenses/'))&&!file.startsWith('sources/august/')&&!coreNotices.has(file)).sort())add(file,join(output,file));
  return digest.digest('hex');
}
