import {spawnSync as nativeSpawnSync} from 'node:child_process';
import {basename} from 'node:path';

/** Run the same source fixtures through a chosen migration backend. Explicit
 * backend selections (including C-emission assertions) remain authoritative. */
export function spawnSync(command,args,options){
  const backend=process.env.AUG_TEST_BACKEND??'c';
  if(backend&&args?.[0]&&basename(args[0])==='aug.mjs'&&['run','build','test','bench'].includes(args[1])&&!args.includes('--backend')){
    const separator=args.indexOf('--'),at=separator<0?args.length:separator;
    args=[...args.slice(0,at),'--backend',backend,...args.slice(at)];
  }
  return nativeSpawnSync(command,args,options);
}
