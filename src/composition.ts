import {createHash} from 'node:crypto';
import type {Span} from './ast.ts';
import {checkProject,tyName} from './checker.ts';
import type {Project} from './project.ts';
import {compilerVersion} from './package-manager.ts';
import {semanticGraph,semanticSourcePath} from './symbols.ts';
import {discoverTests,projectForTest,uniqueDiagnostics} from './testing.ts';

/** Inspect the selected application's or same-file case's existing checked composition. */
export function compositionReport(project:Project,caseId?:string) {
  const discovered=caseId ? discoverTests(project) : undefined;
  const unit=caseId ? discovered!.tests.find(test=>test.id===caseId) : undefined;
  if (caseId && !unit) throw new Error(`No test named ${caseId}. Use aug test --list --json to find a case id.`);
  if (!unit && !project.main) throw new Error('Composition inspection needs main.aug or --case with a same-file test id.');
  const checked=checkProject(unit ? projectForTest(project,unit) : project);
  const diagnostics=uniqueDiagnostics([...checked.diagnostics,...(discovered?.diagnostics??[])]);
  const location=(span:Span)=>({file:semanticSourcePath(checked,span.file),line:span.line,column:span.column});
  const scope=unit ? {kind:'test' as const,id:unit.id} : {kind:'application' as const,id:'main.aug'};
  const graph=semanticGraph(checked,true);
  const revision=createHash('sha256').update(JSON.stringify({format:1,revision:graph.revision,scope})).digest('hex');
  const bindings=checked.bindings.map(binding=>({key:binding.key,type:tyName(binding.exposedType),
    target:{id:binding.target.id,name:binding.target.name,...location(binding.target.node.span)},
    lifetime:binding.lifetime,stateful:binding.stateful,requiresScope:binding.requiresScope,
    declaration:location(binding.declaration.span),
    ...(binding.includedBy ? {includedAt:location(binding.includedBy),composition:[...project.definitions.values()].find(def=>
      def.node.kind==='composition'&&def.node.bindings.includes(binding.declaration))?.id} : {})}));
  const dependencies=checked.bindings.flatMap(binding=>{
    const node=binding.target.node;if(node.kind!=='class')return [];
    return node.fields.filter(field=>field.injected).map((field,index)=>({from:binding.key,to:binding.constructorKeys[index],
      input:field.label??field.name,location:location(field.span),resolved:checked.bindings.some(item=>item.key===binding.constructorKeys[index])}));
  });
  return {format:1,compiler:compilerVersion(),revision,scope,coverage:'bindings-of-selected-program',
    checked:!diagnostics.some(issue=>issue.severity!=='warning'),behavioralChecks:'not-run',diagnostics,bindings,dependencies};
}

/** Mermaid uses numeric node identifiers; labels contain only checked language names and types. */
export function compositionDiagram(report:ReturnType<typeof compositionReport>):string {
  if (!report.checked) throw new Error('A rejected composition has no verified dependency diagram.');
  const nodes=new Map(report.bindings.map((binding,index)=>[binding.key,'n'+index]));
  const quote=(value:string)=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  return ['flowchart TD',...report.bindings.map(binding=>`    ${nodes.get(binding.key)}["${quote(binding.key)} — ${quote(binding.target.name)} (${binding.lifetime}${binding.stateful?', mutable state':''})"]`),
    ...report.dependencies.filter(edge=>edge.resolved).map(edge=>`    ${nodes.get(edge.from)} -->|"${quote(edge.input)}"| ${nodes.get(edge.to)}`)].join('\n')+'\n';
}
