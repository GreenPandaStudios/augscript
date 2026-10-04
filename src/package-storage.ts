import {existsSync,mkdtempSync,readFileSync,renameSync,rmSync,statSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';

/** Publish one complete text file. Private staging preserves the destination's permissions. */
export function replacePackageText(path:string,text:string,mode?:number):void {
  const permissions=mode??(existsSync(path)?statSync(path).mode&0o777:0o644);
  const stage=mkdtempSync(join(dirname(path),'.aug-write-'));
  try {
    const file=join(stage,'content');writeFileSync(file,text,{flag:'wx',mode:permissions});renameSync(file,path);
  }finally{rmSync(stage,{recursive:true,force:true});}
}
export const installedText=(path:string):string|undefined=>existsSync(path)?readFileSync(path,'utf8'):undefined;
