import {createHash} from 'node:crypto';
import {cpSync,existsSync,lstatSync,mkdirSync,mkdtempSync,readFileSync,readdirSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {gitReference,sourceAlias,type GitSource} from './git-packages.ts';
import {withPackageLockAsync} from './package-locking.ts';

const selected=(name:string)=>!name.split('/').some(part=>part.startsWith('.'))&&(name.endsWith('.aug')||['aug-package.json','package.json','main.yaml','README.md','LICENSE','native.abi.json','THIRD_PARTY_NOTICES.md'].includes(name));
async function bytes(url:string,maximum:number):Promise<Buffer>{
  const address=new URL(url);if(address.protocol!=='https:'||!['api.github.com','raw.githubusercontent.com'].includes(address.hostname)||address.username||address.password)throw new Error('Invalid source transport URL');
  const headers:Record<string,string>={Accept:'application/vnd.github+json','User-Agent':'August-source-packages'};
  // Only the API receives an explicitly supplied token. Raw downloads and
  // redirects cannot carry it, and it never enters package metadata or logs.
  if(address.hostname==='api.github.com'&&process.env.AUG_GITHUB_TOKEN)headers.Authorization='Bearer '+process.env.AUG_GITHUB_TOKEN;
  const response=await fetch(address,{redirect:'error',signal:AbortSignal.timeout(60000),headers});
  if(!response.ok||!response.body)throw new Error(`Cannot read public GitHub source (${response.status}). Check the repository/revision. For API rate limits, retry later or supply AUG_GITHUB_TOKEN for authenticated public reads.`);
  if(Number(response.headers.get('content-length')??0)>maximum)throw new Error('GitHub source response exceeds its size limit');
  const chunks:Buffer[]=[];let length=0;for await(const chunk of response.body as any){length+=chunk.length;if(length>maximum)throw new Error('GitHub source response exceeds its size limit');chunks.push(Buffer.from(chunk));}return Buffer.concat(chunks);
}

/** Public GitHub snapshots use HTTPS objects, so consumers do not need Git or an SDK. */
export async function materializeGitHub(request:string,destination:string,offline:boolean,locked?:GitSource):Promise<GitSource>{
  const reference=gitReference(request),url=new URL(reference.repository),parts=url.pathname.split('/').filter(Boolean),owner=parts[0],repo=parts[1]?.replace(/\.git$/,'');
  if(url.hostname!=='github.com'||parts.length!==2||!owner||!repo)throw new Error('GitHub transport requires an owner/repository URL');
  if(locked&&(locked.repository!==reference.repository||locked.folder!==reference.folder||locked.revision!==reference.revision||!/^[0-9a-f]{40}$/.test(locked.commit)))throw new Error('Invalid locked GitHub source identity');
  const cache=resolve(process.env.AUG_PACKAGE_CACHE??join(homedir(),'.cache/augscript/packages'));
  const base=join(cache,'https-'+sourceAlias(reference.repository)+'-'+sourceAlias(reference.folder));mkdirSync(base,{recursive:true});
  return withPackageLockAsync(base+'.lock',async()=>{
    let commit=locked?.commit;
    const revisionCache=join(base,'revision-'+sourceAlias(reference.revision)+'.json');
    if(!commit&&offline&&existsSync(revisionCache))commit=JSON.parse(readFileSync(revisionCache,'utf8')).commit;
    if(!commit){
      if(offline)throw new Error('GitHub revision is not cached. Run aug install online once: '+request);
      const value=JSON.parse((await bytes(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(reference.revision)}`,4*1024*1024)).toString());
      commit=value.sha;if(!/^[0-9a-f]{40}$/.test(commit!))throw new Error('GitHub did not resolve an exact commit');
    }
    if(!/^[0-9a-f]{40}$/.test(commit!))throw new Error('Invalid cached GitHub revision');
    const snapshot=join(base,commit!),metadata=join(base,commit!+'.json');
    if(!existsSync(snapshot)||!existsSync(metadata)){
      if(offline)throw new Error('Locked GitHub source is not cached: '+commit);
      // An interrupted installation may leave either half of the cache entry.
      // The exclusive writer discards that incomplete entry before retrying.
      rmSync(snapshot,{recursive:true,force:true});rmSync(metadata,{force:true});
      const tree=JSON.parse((await bytes(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${commit}?recursive=1`,16*1024*1024)).toString());
      if(tree.truncated||!Array.isArray(tree.tree))throw new Error('GitHub source tree coverage is incomplete; installation stopped');
      const prefix=reference.folder?reference.folder+'/':'';
      const entries=tree.tree.filter((e:any)=>e.type==='blob'&&typeof e.path==='string'&&e.path.startsWith(prefix)&&selected(e.path.slice(prefix.length)));
      if(!entries.length||entries.length>10000)throw new Error('GitHub package has no source files or exceeds its file limit');
      const stage=mkdtempSync(join(base,'.snapshot-'));let total=0;const digests:Record<string,string>={};
      try{
        // Bounded concurrency avoids one network round trip per source file.
        for(let i=0;i<entries.length;i+=8){const batch=await Promise.allSettled(entries.slice(i,i+8).map(async(entry:any)=>{
          const name=entry.path.slice(prefix.length);
          if(!['100644','100755'].includes(entry.mode)||name.includes('\\')||name.split('/').some((p:string)=>!p||p==='.'||p==='..'||p.startsWith('.'))||!/^[0-9a-f]{40}$/.test(entry.sha))throw new Error('GitHub package source must be regular files inside its folder: '+name);
          const content=await bytes(`https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${commit}/${entry.path.split('/').map(encodeURIComponent).join('/')}`,32*1024*1024);
          total+=content.length;if(total>32*1024*1024)throw new Error('GitHub source package exceeds 32 MiB');
          const actual=createHash('sha1').update('blob '+content.length+'\0').update(content).digest('hex');if(actual!==entry.sha)throw new Error('GitHub source blob identity differs from the resolved tree');
          digests[name]=createHash('sha256').update(content).digest('hex');mkdirSync(dirname(join(stage,name)),{recursive:true});writeFileSync(join(stage,name),content);
        }));const rejected=batch.find(r=>r.status==='rejected');if(rejected?.status==='rejected')throw rejected.reason;}
        renameSync(stage,snapshot);writeFileSync(metadata,JSON.stringify({format:1,commit,files:digests}));
      }finally{rmSync(stage,{recursive:true,force:true});}
    }
    const facts=JSON.parse(readFileSync(metadata,'utf8'));if(facts.format!==1||facts.commit!==commit||!facts.files)throw new Error('Invalid cached GitHub source metadata');
    const list=(folder:string,prefix=''):string[]=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>{
      if(entry.isSymbolicLink())throw new Error('Cached GitHub source cannot contain symbolic links');
      const path=prefix+entry.name;return entry.isDirectory()?list(join(folder,entry.name),path+'/'):entry.isFile()?[path]:(()=>{throw new Error('Cached GitHub source requires regular files');})();
    });
    if(lstatSync(snapshot).isSymbolicLink()||JSON.stringify(list(snapshot).sort())!==JSON.stringify(Object.keys(facts.files).sort()))throw new Error('Cached GitHub source file set differs from the resolved snapshot');
    for(const [name,digest] of Object.entries(facts.files)){
      if(name.includes('\\')||name.split('/').some(p=>!p||p==='.'||p==='..'||p.startsWith('.')))throw new Error('Cached source path escapes its snapshot');
      if(createHash('sha256').update(readFileSync(join(snapshot,name))).digest('hex')!==digest)throw new Error('Cached GitHub source changed: '+name);
    }
    cpSync(snapshot,destination,{recursive:true});writeFileSync(revisionCache,JSON.stringify({commit}));return {...reference,commit:commit!};
  });
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)&&process.argv[2]==='--materialize'){
  try{const input=JSON.parse(process.argv[3]);const result=await materializeGitHub(input.request,input.destination,input.offline,input.locked);process.stdout.write(JSON.stringify(result));}
  catch(error){process.stderr.write((error instanceof Error?error.message:String(error))+'\n');process.exitCode=1;}
}
