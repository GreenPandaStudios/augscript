import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {analyzeChangeProject} from '../src/change-context.ts';
import {GENERATOR_VERSION,prepareBoundedEvidence,runBoundedEvidence,replayBoundedEvidence} from '../src/bounded-evidence.ts';

const source=`calculate(bool cached, bool dryRun) returns int {
    if cached { return 7 }
    if dryRun { return 0 }
    return 3
}
test calculate {
    when "independent acceptance" {
        it "replay and dry run" for (cached, dryRun) in [(false, false)] {
            value = calculate(cached=cached, dryRun=dryRun)
            if cached { assert(condition=value == 7) }
            else if dryRun { assert(condition=value == 0) }
            else { assert(condition=value == 3) }
        }
    }
}
`;
function fixture(t){const root=mkdtempSync(join(tmpdir(),'aug-evidence-'));t.after(()=>rmSync(root,{recursive:true,force:true}));writeFileSync(join(root,'main.aug'),'pass\n');writeFileSync(join(root,'work.aug'),source);return root;}
const request=()=>({version:GENERATOR_VERSION,file:'work.aug',group:'independent acceptance',case:'replay and dry run',limit:4,
 domains:[{parameter:'cached',values:[false,true]},{parameter:'dryRun',values:[false,true]}],requirements:['R1'],provenance:{source:'Independent four-case receipt requirement',independence:'independent fixture'}});
test('bounded enumeration records concrete vectors, exclusions, ordinary replay cases and finite native outcomes',t=>{
 const root=fixture(t),checked=analyzeChangeProject(root),record=runBoundedEvidence(checked,request());
 assert.equal(record.behavior.status,'passed finite checks');assert.equal(record.vectors.length,4);assert.equal(record.behavior.universalProof,false);
 assert.equal(record.enumerated,4);assert.equal(record.replayCases.length,4);assert.match(record.replayCases[0].source,/it .* for .* in \[/);
 const replay=replayBoundedEvidence(checked,record);assert.deepEqual(replay.vectors,record.vectors);assert.equal(replay.behavior.status,record.behavior.status);
 const excluded=request();excluded.exclude=[{indices:[0,0],reason:'Outside this focused replay grid.'}];assert.equal(prepareBoundedEvidence(checked,excluded).record.discarded.length,1);
});
test('interaction vectors detect independent behavior mutations without source repairs or hidden feedback',t=>{
 const root=fixture(t);for(const mutation of [source.replace('if cached { return 7 }','if dryRun { return 0 }\n    if cached { return 7 }'),source.replace('return 3','return 4')]){
  writeFileSync(join(root,'work.aug'),mutation);const checked=analyzeChangeProject(root);assert.deepEqual(checked.diagnostics,[]);
  const record=runBoundedEvidence(checked,request());assert.equal(record.behavior.status,'failed');assert(record.behavior.outcomes.some(outcome=>!outcome.passed));
 }
});
test('invalid, empty, excessive and fully discarded domains cannot pass silently',t=>{
 const root=fixture(t),checked=analyzeChangeProject(root);
 for(const change of [r=>r.domains[0].values=[],r=>r.domains[0].values=['wrong type'],r=>r.limit=3,
  r=>r.exclude=[[0,0],[0,1],[1,0],[1,1]].map(indices=>({indices,reason:'Excluded'})),r=>r.exclude=[{indices:[2,0],reason:'bad'}]]){
  const value=request();change(value);assert.throws(()=>prepareBoundedEvidence(checked,value),error=>error.code==='EVIDENCE');
 }
 const record=runBoundedEvidence(checked,request());writeFileSync(join(root,'main.yaml'),'block_style: braces\n');assert.throws(()=>replayBoundedEvidence(analyzeChangeProject(root),record),/recorded.*revision/);
});
