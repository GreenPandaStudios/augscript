import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
export function conformanceLedger(root){
 const manifest=JSON.parse(readFileSync(join(root,'conformance/rules.json'))),corpus=JSON.parse(readFileSync(join(root,'conformance/cases.json')));
 assert.equal(manifest.format,1);assert.equal(corpus.format,1);assert.ok(manifest.rules.length);assert.ok(corpus.cases.length);
 const cases=new Set(corpus.cases.map(c=>c.id));assert.equal(cases.size,corpus.cases.length);
 const ids=new Set(),productions=new Set();
 for(const rule of manifest.rules){
  assert.ok(!ids.has(rule.id),'Duplicate conformance rule '+rule.id);ids.add(rule.id);assert.ok(rule.summary&&rule.regressions.length,rule.id+' needs a contract and named evidence');
  assert.ok(existsSync(resolve(root,'docs',rule.reference.split('#')[0])),rule.id+' has no reference page');
  for(const id of rule.cases)assert.ok(cases.has(id),rule.id+' has an unknown acceptance case');
  for(const evidence of rule.regressions){
   const source=readFileSync(join(root,evidence.file),'utf8');
   const names=[...source.matchAll(/^\s*test\((['"])(.*?)\1/gm)].map(match=>match[2]);
   assert.ok(names.includes(evidence.test),rule.id+' has no test named '+evidence.test);
  }
  for(const production of rule.productions){assert.ok(!productions.has(production),'Duplicate grammar coverage '+production);productions.add(production);}
 }
 const grammar=[...readFileSync(join(root,'docs/grammar.md'),'utf8').matchAll(/^(\w+)\s+:=/gm)].map(match=>match[1]);
 assert.deepEqual([...productions].sort(),grammar.sort(),'Every documented grammar production needs exactly one conformance owner');
 const referenced=new Set(manifest.rules.flatMap(rule=>rule.cases));for(const example of corpus.cases)assert.ok(referenced.has(example.id),'Unmapped acceptance case '+example.id);
 return {manifest,corpus};
}
export function conformancePage(root){
 const {manifest}=conformanceLedger(root),lines=['---','generated: true','source: conformance/rules.json','editLink: false','---','','# Tested language contracts','',
  'This ledger connects the documented grammar and language rules to executable evidence. Each link names the guide that explains the contract and the regression that checks it. Independent examples have handwritten expected results; the platform run records which build modes and source styles actually executed. See [language conformance](language-conformance.md) for qualification and limits.','',
  '| Contract | Expected behavior | Evidence |','| --- | --- | --- |'];
 for(const rule of manifest.rules)lines.push(`| [${rule.id}](${rule.reference}) | ${rule.summary} | ${rule.cases.length?'Independent cases: '+rule.cases.join(', ')+'. ':''}${rule.regressions.map(e=>`[${e.test}](../${e.file})`).join('; ')} |`);
 lines.push('','The ledger does not count a reference as a passed test. CI must execute the linked regression suites and the independent corpus on the required platform. Omitted or unavailable GPU hardware remains an explicit boundary.','');return lines.join('\n');
}
