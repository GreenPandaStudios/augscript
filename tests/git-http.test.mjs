import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {test} from 'node:test';
import {materializeGitHub} from '../src/git-http.ts';

test('optional GitHub authentication stays on the API and out of package snapshots',async()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-github-auth-'));
  const originalFetch=globalThis.fetch,previousCache=process.env.AUG_PACKAGE_CACHE,previousToken=process.env.AUG_GITHUB_TOKEN;
  const token='test-token-that-must-not-be-persisted',commit='a'.repeat(40),content=Buffer.from('export greet from greeting\n');
  const sha=createHash('sha1').update('blob '+content.length+'\0').update(content).digest('hex');
  process.env.AUG_PACKAGE_CACHE=join(root,'cache');process.env.AUG_GITHUB_TOKEN=token;
  let api=0,raw=0;
  globalThis.fetch=async(address,options)=>{
    assert.equal(options.redirect,'error');
    if(address.hostname==='api.github.com'){
      api++;assert.equal(options.headers.Authorization,'Bearer '+token);
      return Response.json(address.pathname.includes('/commits/')?{sha:commit}:{tree:[{path:'export.aug',type:'blob',mode:'100644',sha}],truncated:false});
    }
    raw++;assert.equal(address.hostname,'raw.githubusercontent.com');assert.equal(options.headers.Authorization,undefined);
    return new Response(content);
  };
  try{
    const identity=await materializeGitHub('https://github.com/Example/library#v1',join(root,'package'),false);
    assert.equal(identity.commit,commit);assert.equal(api,2);assert.equal(raw,1);
    assert.equal(readFileSync(join(root,'package/export.aug'),'utf8'),content.toString());
    assert.ok(!JSON.stringify(identity).includes(token));
    // Offline replay has no network or authentication dependency.
    globalThis.fetch=()=>{throw new Error('Unexpected offline download');};
    assert.deepEqual(await materializeGitHub(identity.request,join(root,'offline'),true,identity),identity);
  }finally{
    globalThis.fetch=originalFetch;
    for(const [key,value]of [['AUG_PACKAGE_CACHE',previousCache],['AUG_GITHUB_TOKEN',previousToken]])if(value===undefined)delete process.env[key];else process.env[key]=value;
    rmSync(root,{recursive:true,force:true});
  }
});
