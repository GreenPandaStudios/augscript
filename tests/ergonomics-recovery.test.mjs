import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {SemanticWorkspace} from '../src/semantic.ts';

for(const style of ['braces','indent'])test('recovery scaffold preserves the failure until an author supplies a policy ('+style+')',()=>{
  const root=mkdtempSync(join(tmpdir(),'aug-recovery-'));
  try {
    const file=join(root,'main.aug'),source='print(value=read_file(path="note.txt"))\n';
    writeFileSync(file,source);writeFileSync(join(root,'main.yaml'),'block_style: '+style+'\nindentation: tabs\n');
    const workspace=new SemanticWorkspace(root),view=workspace.document(file,{text:source,version:1},true);
    const fix=view.fixes().find(fix=>fix.title==='Scaffold recovery for FileError');
    assert.ok(fix);assert.match(fix.description,/incomplete.*recovery policy/);
    assert.match(fix.edits[0].text,/throw error/);assert.doesNotMatch(fix.edits[0].text,/print\(value=error\)/);
    assert.ok(fix.edits[0].text.includes('\t// Choose recovery'));
    const edit=fix.edits[0],candidate=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
    const checked=workspace.document(file,{text:candidate,version:2},true);
    assert.ok(checked.diagnostics.some(issue=>issue.code==='THROWS'),JSON.stringify(checked.diagnostics));
    assert.ok(!checked.diagnostics.some(issue=>issue.code==='PARSE'),JSON.stringify(checked.diagnostics));
    const completed=workspace.document(file,{text:candidate.replace('throw error','print(value="Unable to read the note")'),version:3},true);
    assert.deepEqual(completed.diagnostics,[]);
  }finally{rmSync(root,{recursive:true,force:true});}
});
