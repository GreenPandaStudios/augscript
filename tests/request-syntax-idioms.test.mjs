import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {requestSyntaxIdioms as syntaxIdioms} from '../src/syntax-idioms.ts';
import {analyzeChangeProject} from '../src/change-context.ts';
for(const idiom of syntaxIdioms().items)test(`agent syntax idiom ${idiom.id} is compiler checked`,t=>{
 const root=mkdtempSync(join(tmpdir(),'aug-idiom-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 for(const [file,source]of Object.entries(idiom.files))writeFileSync(join(root,file),source);
 assert.deepEqual(analyzeChangeProject(root).diagnostics,[]);
});
