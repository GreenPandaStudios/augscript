import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline';
import {runInNewContext} from 'node:vm';
const cli=resolve('bin/aug.mjs');
for (const backend of ['c','llvm']) test(`HTTP action captures evaluate labeled expressions once in written order (${backend})`, {skip:backend==='llvm'&&!process.env.AUG_LLVM_HOME},()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-action-order-'));
  try {
    writeFileSync(join(root,'main.aug'),`import view and remove from actions
import Console and SystemConsole from august.io
implement Console with SystemConsole
serve remove on port 0
`);
    writeFileSync(join(root,'actions.aug'),`import Console and SystemConsole from august.io
first(resolve Console console) returns int:
    console.write(value="first")
    return 1
second(resolve Console console) returns int:
    console.write(value="second")
    return 2
endpoint DELETE "/{a}/{b}" as remove(int a from path, int b from path) returns int:
    return a + b
view(resolve Console console) returns Html:
    return <button onClick={handle remove(b=second(), a=first())}>Delete</button>
test view:
    when capture_order:
        implement Console with SystemConsole
        it evaluates_once_in_written_order:
            view()
            assert(condition=true)
`);
    const result=spawnSync(process.execPath,[cli,'test',root,'--backend',backend],{encoding:'utf8',timeout:30000});
    assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/second\nfirst\n/);
    assert.equal(result.stdout.match(/^second$/gm)?.length,1);assert.equal(result.stdout.match(/^first$/gm)?.length,1);
  } finally {rmSync(root,{recursive:true,force:true});}
});
test('typed server actions describe HTTP calls without running their handlers', {timeout:30000}, async()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-actions-'));let server;
  try {
    writeFileSync(join(root,'main.aug'),'import page and remove and update and formUpdate from endpoints\nimport Console and SystemConsole from august.io\nimplement Console with SystemConsole\nserve page and remove and update and formUpdate on port 0\n');
    writeFileSync(join(root,'endpoints.aug'),`import Console from august.io
record Detail(int id)
record Update(string title, optional int priority, optional List<int> values, optional Detail detail, optional c_int limit, optional Json metadata)
endpoint DELETE "/items/{id}" as remove(int id from path, resolve Console console) returns string uses console.write:
    console.write(value="removed")
    return "removed"
endpoint PATCH "/items/{id}" as update(int id from path, Update input from body) returns Update:
    return input
endpoint POST "/form-items" as formUpdate(Update input from form) returns Update:
    return input
endpoint GET "/" as page() returns Html unless HttpError with status 500:
    return <main><button onClick={handle remove(id=7)}>Delete</button><form onSubmit={handle update(id=7, input from form)}><input name="title" required /><input name="priority" type="number" /><button>Save</button></form><button onClick={handle remove(id=9007199254740993)}>Delete wide ID</button><button onClick={handle update(id=7, input=Update(title="Wide", priority=9007199254740993))}>Update wide value</button><form onSubmit={handle formUpdate(input from form)}><button>Complex form</button></form></main>
`);
    let result=spawnSync(process.execPath,[cli,'build',root],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
    server=spawn(join(root,'.aug-build',root.split('/').at(-1)),[],{stdio:['ignore','pipe','pipe']});let errors='',output='';server.stderr.on('data',chunk=>errors+=chunk);server.stdout.on('data',chunk=>output+=chunk);
    const lines=createInterface({input:server.stdout});const port=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(errors)),10000);server.once('exit',()=>{clearTimeout(timer);reject(Error(errors));});lines.on('line',line=>{const m=/port (\d+)/.exec(line);if(m){clearTimeout(timer);resolve(Number(m[1]));}});});
    const base=`http://127.0.0.1:${port}`;let response=await fetch(base);assert.equal(response.status,200);const html=await response.text();assert.match(html,/data-aug-action=/);assert.match(html,/\/__aug\/actions\.js/);assert.doesNotMatch(output,/removed/);
    const descriptors=[...html.matchAll(/data-aug-action="([^"]+)"/g)].map(match=>JSON.parse(match[1].replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&')));
    assert.equal(descriptors[0].route.method,'DELETE');assert.equal(descriptors[0].route.path,'/items/{id}');assert.deepEqual(descriptors[0].values,['7']);
    assert.equal(descriptors[1].route.method,'PATCH');assert.equal(descriptors[1].route.parameters[1].form,true);assert.equal(descriptors[1].route.parameters[1].schema.fields.title.kind,'string');
    response=await fetch(base+'/__aug/actions.js');assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/javascript/);const transport=await response.text();assert.match(transport,/FormData/);
    const listeners=new Map();let sent;
    runInNewContext(transport, {URL, URLSearchParams, Headers, FormData: function(form){return form.fields;},
      location:{origin:base,reload(){}}, document:{addEventListener(name,handler){listeners.set(name,handler);}},
      fetch(url,options){sent={url:String(url),options};return Promise.resolve({ok:true,redirected:false});},
    });
    for (const [index,path,body] of [[2,'/items/9007199254740993',undefined],[3,'/items/7','{"title":"Wide","priority":9007199254740993,"values":null,"detail":null,"limit":null,"metadata":null}']]) {
      const element={dataset:{augAction:JSON.stringify(descriptors[index])}};
      listeners.get('click')({preventDefault(){},target:{closest(){return element;}}});
      assert.equal(sent.url,base+path,'captured int64 path remains exact');
      assert.equal(sent.options.body,body,'captured int64 body remains exact');
    }
    const form={dataset:{augAction:JSON.stringify(descriptors[4])},matches(){return true;},fields:[['title','Complex'],['priority','9007199254740993'],['values','[9007199254740993]'],['detail','{"id":9007199254740993}'],['limit','7'],['metadata','"Ada"']]};
    listeners.get('submit')({preventDefault(){},target:form});
    assert.equal(sent.url,base+'/form-items');
    assert.equal(sent.options.body.get('values'),'[9007199254740993]');
    assert.equal(sent.options.body.get('detail'),'{"id":9007199254740993}');
    assert.equal(sent.options.body.get('metadata'),'"Ada"');
    response=await fetch(sent.url,sent.options);assert.equal(response.status,200);
    assert.equal(await response.text(),'{"title":"Complex","priority":9007199254740993,"values":[9007199254740993],"detail":{"id":9007199254740993},"limit":7,"metadata":"Ada"}');
    response=await fetch(base+'/items/7',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({title:'Updated',priority:3})});assert.deepEqual(await response.json(),{title:'Updated',priority:3,values:null,detail:null,limit:null,metadata:null});
    response=await fetch(base+'/items/7',{method:'DELETE'});assert.equal(await response.json(),'removed');
    server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));server=undefined;
    writeFileSync(join(root,'endpoints.aug'),'endpoint GET "/" as page() returns Html unless HttpError with status 500:\n    return <button onClick="bad()">Bad</button>\n');
    result=spawnSync(process.execPath,[cli,'check',root],{encoding:'utf8'});assert.notEqual(result.status,0);assert.match(result.stderr,/HttpAction/);
  } finally {if(server&&server.exitCode===null){server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));}rmSync(root,{recursive:true,force:true});}
});
