import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {planChangeRenameSymbol,applyChangePlan} from '../src/checked-changes.ts';
import {checkedProjectWithTests,applySourceEdits} from '../src/refactoring.ts';
import {semanticGraph} from '../src/symbols.ts';
import {SemanticWorkspace} from '../src/semantic.ts';
const source='/** Compute from quantity. @param quantity Original input. */\ncompute(int quantity):\n    chosen = quantity + 1\n    later = chosen + 2\n    return later\n\n_other(int quantity):\n    text = "compute quantity chosen"\n    return quantity\n';
function fixture(run){const root=mkdtempSync(join(tmpdir(),'aug-rename-identity-'));try{
 writeFileSync(join(root,'math.aug'),source);writeFileSync(join(root,'main.aug'),'import compute from math\nquantity=7\nprint(value=compute(quantity))\n');return run(root);
}finally{rmSync(root,{recursive:true,force:true});}}
function checked(root,overrides=new Map()){return semanticGraph(checkedProjectWithTests(root,overrides),true);}
function overlay(root,plan){return new Map(plan.scope.map(file=>[join(root,file),applySourceEdits(readFileSync(join(root,file),'utf8'),plan.edits.filter(edit=>edit.file===file))]));}
for(const [symbol,name] of [['compute','calculate'],['compute.quantity','amount']])test('saved '+symbol+' rename maps exact changed identities through a checked candidate',()=>fixture(root=>{
 const before=checked(root),plan=planChangeRenameSymbol(root,'math.aug',symbol,name),after=checked(root,overlay(root,plan));
 assert.ok(Array.isArray(plan.identityMap));assert.ok(plan.identityMap.some(pair=>pair.before===plan.symbol));
 const mapping=new Map(plan.identityMap.map(pair=>[pair.before,pair.after]));assert.equal(mapping.size,plan.identityMap.length);
 assert.deepEqual(plan.identityMap.map(pair=>pair.before),[...mapping.keys()].sort());
 for(const original of before.symbols){const next=after.symbols.find(item=>item.id===(mapping.get(original.id)??original.id));assert.ok(next,original.id);
  assert.equal(next.name,original.id===plan.symbol?name:original.name);assert.equal(next.kind,original.kind);
 }
 assert.ok(plan.identityMap.some(pair=>pair.before.startsWith('local:math.aug:')));
 assert.ok(!mapping.has('math.aug:_other'));assert.equal(readFileSync(join(root,'math.aug'),'utf8'),source);
 const receipt=applyChangePlan(root,plan);assert.deepEqual(receipt.identityMap,plan.identityMap);
}));
test('local rename maps its declaration and later coordinate-derived identities',()=>fixture(root=>{
 const view=new SemanticWorkspace(root).document(join(root,'math.aug'),undefined,true),plan=view.rename(source.indexOf('chosen ='),'selected');
 assert.ok(plan.identityMap.some(pair=>pair.before===plan.symbol&&pair.after.endsWith(':selected')));
 const after=checked(root,new Map([[join(root,'math.aug'),applySourceEdits(source,plan.edits.filter(edit=>edit.file===join(root,'math.aug')))]]));
 const mapping=new Map(plan.identityMap.map(pair=>[pair.before,pair.after]));
 for(const symbol of view.graph().symbols)assert.ok(after.symbols.some(item=>item.id===(mapping.get(symbol.id)??symbol.id)),symbol.id);
 assert.equal(plan.publicDelta.length,0);
}));
test('forged correspondence cannot authorize source publication',()=>fixture(root=>{
 for(const alter of [packet=>packet.identityMap=[],packet=>packet.identityMap[0].after='invented',packet=>packet.identityMap.push(packet.identityMap[0])]){
  const packet=structuredClone(planChangeRenameSymbol(root,'math.aug','compute','calculate'));assert.ok(packet.identityMap?.length);alter(packet);
  assert.throws(()=>applyChangePlan(root,packet),/plan|scope|candidate|delta/i);assert.equal(readFileSync(join(root,'math.aug'),'utf8'),source);
 }
}));
test('embedding identity replies are detached and collisions produce no mapping',()=>fixture(root=>{
 const view=new SemanticWorkspace(root).document(join(root,'math.aug'),undefined,true),offset=source.indexOf('quantity):'),before=view.rename(offset,'amount');
 const damaged=view.rename(offset,'amount');assert.ok(damaged.identityMap?.length);damaged.identityMap[0].after='invented';damaged.identityMap.length=0;
 assert.deepEqual(view.rename(offset,'amount'),before);
 assert.throws(()=>view.rename(offset,'chosen'),/collision|binding|identity/);
 assert.equal(readFileSync(join(root,'math.aug'),'utf8'),source);
}));
