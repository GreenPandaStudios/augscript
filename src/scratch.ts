import {createHash} from 'node:crypto';
import {mkdtempSync,readFileSync,realpathSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {checkProject} from './checker.ts';
import {loadProject} from './project.ts';
import {compilerVersion,prepareRunPackagesWithNative} from './package-manager.ts';
import {uniqueDiagnostics} from './testing.ts';

/** Check a standalone entry fragment in a temporary ordinary project; execution is an explicit caller action. */
export async function withScratch<T>(file:string,options:{prepare?:boolean;offline?:boolean},
  consume:(root:string,report:ReturnType<typeof scratchReport>)=>Promise<T>):Promise<T> {
  const path=resolve(file),bytes=readFileSync(path),source=bytes.toString('utf8');
  const root=realpathSync(mkdtempSync(join(tmpdir(),'aug-scratch-'))),main=join(root,'main.aug');
  try {
    writeFileSync(main,source);
    if(options.prepare)await prepareRunPackagesWithNative(root,!!options.offline);
    const checked=checkProject(loadProject(root));
    const diagnostics=uniqueDiagnostics(checked.diagnostics).map(issue=>({...issue,file:issue.file===main?path:issue.file}));
    return await consume(root,scratchReport(path,bytes,diagnostics,!!options.prepare));
  }finally{rmSync(root,{recursive:true,force:true});}
}
function scratchReport(file:string,bytes:Buffer,diagnostics:ReturnType<typeof uniqueDiagnostics>,prepared:boolean) {
  return {format:1,compiler:compilerVersion(),source:{file,sha256:createHash('sha256').update(bytes).digest('hex')},
    checked:!diagnostics.some(issue=>issue.severity!=='warning'),executed:false,prepared,diagnostics,
    ...(diagnostics.some(issue=>issue.code==='PACKAGE'&&issue.message.includes('aug install')) ?
      {recovery:'Retry aug scratch FILE --prepare to resolve repository imports without running the program.'}: {})};
}
