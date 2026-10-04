const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vscode=require('vscode');
const {spawnSync}=require('node:child_process');

async function eventually(check,label){
  const deadline=Date.now()+20000;
  while(Date.now()<deadline){const result=await check();if(result)return result;await new Promise(resolve=>setTimeout(resolve,100));}
  throw new Error('Editor did not produce '+label+' before the deadline');
}
exports.run=async()=>{
  const root=process.env.AUG_EDITOR_PROJECT,extension=vscode.extensions.getExtension('augscript.augscript');assert.ok(extension,'The installed extension is missing');
  assert.equal(extension.packageJSON.version,process.env.AUG_EDITOR_EXPECTED_VERSION);assert.equal(extension.packageJSON.augustCompilerVersion,process.env.AUG_EDITOR_EXPECTED_COMPILER);
  await extension.activate();const main=vscode.Uri.file(path.join(root,'main.aug')),greeting=vscode.Uri.file(path.join(root,'greeting.aug'));
  const document=await vscode.workspace.openTextDocument(main);assert.equal(document.languageId,'augscript');await vscode.window.showTextDocument(document);
  const source=document.getText(),position=offset=>document.positionAt(offset);
  const completions=await eventually(async()=>{
    const result=await vscode.commands.executeCommand('vscode.executeCompletionItemProvider',main,position(source.indexOf('greeter.greet')+'greeter.gree'.length));
    return result?.items.find(item=>item.label==='greet');
  },'a labeled method completion');assert.match(completions.insertText.value,/name=/);
  const definition=await vscode.commands.executeCommand('vscode.executeDefinitionProvider',main,position(source.indexOf('from')+1));
  assert.ok(definition.some(item=>(item.uri??item.targetUri).fsPath===greeting.fsPath),'Import navigation did not reach greeting.aug');
  const declaration=await vscode.workspace.openTextDocument(greeting),signature=declaration.getText().indexOf('greet(string');
  const hovers=await vscode.commands.executeCommand('vscode.executeHoverProvider',greeting,declaration.positionAt(signature+1));
  assert.match(hovers.map(hover=>hover.contents.map(content=>content.value??content).join(' ')).join(' '),/Return a greeting/);
  const hints=await vscode.commands.executeCommand('vscode.executeInlayHintProvider',greeting,new vscode.Range(declaration.positionAt(0),declaration.positionAt(declaration.getText().length)));
  assert.ok(hints.some(hint=>JSON.stringify(hint.label).includes('returns string')),'Inferred contract hints are missing');
  const edit=new vscode.WorkspaceEdit();edit.replace(main,new vscode.Range(position(0),position(source.length)),source.replace('name="August"','naem="August"'));assert.equal(await vscode.workspace.applyEdit(edit),true);
  const errors=await eventually(()=>vscode.languages.getDiagnostics(main).filter(issue=>issue.severity===vscode.DiagnosticSeverity.Error).length&&vscode.languages.getDiagnostics(main),'a source diagnostic');
  assert.ok(errors.some(issue=>issue.source==='AugScript'&&issue.range.start.line===4));
  const fixes=await vscode.commands.executeCommand('vscode.executeCodeActionProvider',main,new vscode.Range(document.positionAt(0),document.positionAt(document.getText().length)),vscode.CodeActionKind.QuickFix.value);
  const fix=fixes.find(action=>action.edit&&/name/.test(action.title));assert.ok(fix,'No labeled-input repair was offered');assert.equal(await vscode.workspace.applyEdit(fix.edit),true);
  assert.ok(document.getText().includes('name="August"'));await document.save();
  await eventually(()=>vscode.languages.getDiagnostics(main).every(issue=>issue.severity!==vscode.DiagnosticSeverity.Error),'cleared source diagnostics');
  const configuration=vscode.workspace.getConfiguration('augscript'),configured=configuration.get('nodePath'),compiler=path.join(extension.extensionPath,'compiler/bin/aug.mjs');
  const probe=spawnSync(configured,[compiler,'doctor',root,'--json'],{encoding:'utf8',timeout:30000});
  const hasDoctor=probe.status!==2;
  if(!hasDoctor)assert.ok(process.env.AUG_EDITOR_RETAINED_COMPILER,'The full candidate compiler must provide doctor');
  const setup=await vscode.commands.executeCommand('augscript.doctor');
  if(!hasDoctor)assert.equal(setup,undefined);
  else{
    assert.equal(setup.ready,true);assert.ok(setup.checks.some(check=>check.id==='compiler-pack'&&check.status==='warning'));
    const node=configuration.get('nodePath');
    await configuration.update('nodePath','/august-test-missing-node',vscode.ConfigurationTarget.Global);
    assert.equal(await vscode.commands.executeCommand('augscript.doctor'),undefined);
    await configuration.update('nodePath',node,vscode.ConfigurationTarget.Global);
    assert.equal((await vscode.commands.executeCommand('augscript.doctor')).ready,true);
    const priorCompiler=configuration.get('compilerPath');
    await configuration.update('compilerPath','/august-test-missing-compiler.mjs',vscode.ConfigurationTarget.Global);
    assert.equal(await vscode.commands.executeCommand('augscript.doctor'),undefined);
    await configuration.update('compilerPath',priorCompiler,vscode.ConfigurationTarget.Global);
    assert.equal((await vscode.commands.executeCommand('augscript.doctor')).ready,true);
    await eventually(async()=>{
      const result=await vscode.commands.executeCommand('vscode.executeCompletionItemProvider',main,position(source.indexOf('greeter.greet')+'greeter.gree'.length));
      return result?.items.some(item=>item.label==='greet');
    },'language-server completion after repairing setup');
  }
  const tree=await vscode.commands.executeCommand('augscript.refreshTests');
  const flatten=items=>items.flatMap(item=>[item,...flatten(item.children)]),items=flatten(tree);
  assert.ok(items.some(item=>item.label==='greets_a_person'&&item.file===greeting.fsPath&&Number.isInteger(item.line)),'Test Explorer did not contain the discovered case');
  assert.ok(items.every(item=>!item.error),'Test Explorer reported a discovery error');
  const messy=new vscode.WorkspaceEdit();messy.replace(main,new vscode.Range(document.positionAt(0),document.positionAt(document.getText().length)),source.replace('name="August"','name = "August"'));assert.equal(await vscode.workspace.applyEdit(messy),true);
  const formatting=await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider',main,{tabSize:4,insertSpaces:true});assert.ok(formatting.length>0);
  const formatted=new vscode.WorkspaceEdit();formatted.set(main,formatting);assert.equal(await vscode.workspace.applyEdit(formatted),true);
  assert.ok(document.getText().includes('name="August"'));assert.notEqual(document.getText(),source.replace('name="August"','name = "August"'));await document.save();
  assert.ok(extension.packageJSON.contributes.breakpoints.some(item=>item.language==='augscript'));
  fs.writeFileSync(process.env.AUG_EDITOR_REPORT,JSON.stringify({passed:true,extensionPath:extension.extensionPath,language:true,completion:true,hover:true,navigation:true,unsavedDiagnostics:true,quickFix:true,inlayHints:true,testDiscovery:true,formatting:true,setupReport:hasDoctor,setupRecovery:hasDoctor})+'\n');
};
