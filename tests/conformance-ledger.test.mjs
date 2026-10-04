import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {conformanceLedger} from '../scripts/conformance-ledger.mjs';
import {validateCorpus,compilerIdentity} from '../scripts/check-language-conformance.mjs';
const root=resolve('.');
function ledger(callback){
 const directory=mkdtempSync(join(tmpdir(),'aug-ledger-')),manifest=JSON.parse(readFileSync('conformance/rules.json'));
 try{
  const paths=['conformance/rules.json','conformance/cases.json','docs/grammar.md',...manifest.rules.map(r=>'docs/'+r.reference.split('#')[0]),...manifest.rules.flatMap(r=>r.regressions.map(e=>e.file))];
  for(const path of new Set(paths)){mkdirSync(dirname(join(directory,path)),{recursive:true});cpSync(join(root,path),join(directory,path));}
  callback(directory,manifest);
 }finally{rmSync(directory,{recursive:true,force:true});}
}
test('conformance ledger covers every grammar production with existing named regressions',()=>{
 const {manifest,corpus}=conformanceLedger(root);assert.ok(manifest.rules.length>100);validateCorpus(corpus);
 assert.match(compilerIdentity(root),/^[a-f0-9]{64}$/);
});
test('conformance ledger rejects renamed regressions, omitted grammar and missing reference pages',()=>ledger((directory,manifest)=>{
 const check=(change,expected)=>{const candidate=structuredClone(manifest);change(candidate);writeFileSync(join(directory,'conformance/rules.json'),JSON.stringify(candidate));assert.throws(()=>conformanceLedger(directory),expected);};
 check(c=>c.rules[0].regressions[0].test='no such test',/no test named/);
 check(c=>c.rules[0].productions=[],/Every documented grammar/);
 check(c=>c.rules[0].reference='no-such-guide.md',/no reference page/);
 check(c=>c.rules[0].cases=['not-in-corpus'],/unknown acceptance/);
}));
test('independent conformance oracles reject empty domains, conflicting expectations and unsafe paths',()=>{
 const original=JSON.parse(readFileSync('conformance/cases.json'));
 const check=change=>{const c=structuredClone(original);change(c);assert.throws(()=>validateCorpus(c));};
 check(c=>c.cases=[]);check(c=>c.cases.push(c.cases[0]));
 check(c=>c.cases[0].diagnostic='TYPE');check(c=>delete c.cases[0].stdout);
 check(c=>c.cases[0].files['../escape.aug']='print(value=1)');
 check(c=>c.mutations[0].before='not in original');
 check(c=>c.mutations[0].after=c.mutations[0].before);
});
