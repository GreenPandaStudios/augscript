import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import type {CheckedProject} from './checker.ts';
import {loadProject} from './project.ts';
import {readPackage,readPackageLock,compilerVersion} from './package-manager.ts';
import {sourceAlias} from './git-packages.ts';
import {semanticGraph} from './symbols.ts';
import {contractFacts} from './contract-facts.ts';
import {publicContract,contractDifferences} from './public-contracts.ts';
import {generateSpecs} from './spec.ts';
import {renderSpecTree,type SpecNode} from './spec-tree.ts';
import {checkedProjectWithTests} from './refactoring.ts';
import {discoverTests} from './testing.ts';
import {nativeHostTarget,selectNativeArtifact} from './native-contracts.ts';

const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
const compare=(a:string,b:string)=>a<b?-1:a>b?1:0;

/** Explain the accepted source/native graph without installing or updating it. */
export function dependencyReport(directory:string) {
  const root=resolve(directory),project=loadProject(root);
  if(project.packages.diagnostics.length)throw new Error(project.packages.diagnostics.map(issue=>issue.message).join('\n'));
  const lockPath=join(root,'aug.lock.json'),lock=existsSync(lockPath)?readPackageLock(lockPath):undefined;
  const identities=new Map([...project.packages.scopes].map(([path,scope])=>[path,scope.name+'@'+scope.version]));
  const packages=[...project.packages.scopes.values()].map(scope=>({
    id:identities.get(scope.path)!,name:scope.name,version:scope.version,digest:scope.digest,
    compiler:readPackage(scope.directory).manifest.compiler,
    dependencies:Object.fromEntries(Object.entries(scope.dependencies).map(([alias,path])=>[alias,identities.get(path)])),
    source:lock?.git?.find(source=>scope.path.endsWith('/packages/'+sourceAlias(source.request))||scope.path==='packages/'+sourceAlias(source.request)),
    native:Object.entries(lock?.native?.targets??{}).flatMap(([target,value])=>value.packages.filter(entry=>entry.sourcePackage===scope.name+'@'+scope.version&&entry.sourceDigest===scope.digest).map(entry=>({target,...entry})))
  })).sort((a,b)=>compare(a.id,b.id));
  const imports=[...project.imports].flatMap(([declaration,definitions])=>{
    const file=project.files.get(declaration.span.file)!;
    const owner=file.package?identities.get(file.package)!:'application';
    return [...new Set(definitions.map(def=>project.files.get(def.file)?.package).filter((id):id is string=>!!id))].map(id=>({
      owner,file:file.package?relative(project.packages.scopes.get(file.package)!.sourceRoot,file.path).replaceAll('\\','/'):relative(root,file.path).replaceAll('\\','/'),
      line:declaration.span.line,module:declaration.from.join('.'),names:definitions.filter(def=>project.files.get(def.file)?.package===id).map(def=>def.name).sort(compare),package:identities.get(id)!
    }));
  }).sort((a,b)=>compare(a.owner,b.owner)||compare(a.file,b.file)||a.line-b.line||compare(a.package,b.package));
  return {format:1,compiler:compilerVersion(),revision:lock?hash(readFileSync(lockPath,'utf8')):null,
    roots:Object.fromEntries([...project.packages.roots].map(([alias,scope])=>[alias,identities.get(scope.path)])),packages,imports,
    compilerArtifacts:lock?.native?.compilers??{},diagnostics:project.diagnostics,coverage:{source:'verified-installed-snapshot',imports:project.diagnostics.length?'incomplete':'resolved',native:'locked-selections',execution:'not-run'}};
}

/** The public package boundary is export.aug, not every non-private declaration. */
export function packageSurface(checked:CheckedProject) {
  const root=checked.project.sourceRoot,facts=new Map(contractFacts(checked).map(fact=>[fact.id,fact]));
  const exports:{name:string;fact:NonNullable<ReturnType<typeof facts.get>>}[]=[],visited=new Set<string>();
  const walk=(folder:string,prefix='')=>{
    if(visited.has(folder))throw new Error('PACKAGE_EXPORT: Repeated public folder');visited.add(folder);
    const file=checked.project.files.get(join(folder,'export.aug'));if(!file)throw new Error('PACKAGE_EXPORT: Missing public export file');
    for(const item of file.items)if(item.kind==='export'&&!item.internal) {
      if(item.folder)walk(join(folder,item.name),prefix+item.name+'.');
      else {
        const def=checked.project.scopes.get(join(folder,item.from+'.aug'))?.get(item.name),fact=def&&facts.get(def.id);
        if(!fact)throw new Error('PACKAGE_EXPORT: Unresolved public declaration '+item.name);
        exports.push({name:prefix+item.name,fact});
      }
    }
  };
  walk(root);return exports.sort((a,b)=>compare(a.name,b.name));
}

/** Static author readiness. Running tests and publishing remain explicit actions. */
export function packageReadiness(directory:string) {
  const root=resolve(directory),{manifest}=readPackage(root),checked=checkedProjectWithTests(root,new Map()),errors=checked.diagnostics.filter(issue=>issue.severity!=='warning');
  const checks:{id:string;status:'ok'|'error'|'warning';message:string;recovery?:string}[]=[
    {id:'compiler',status:'ok',message:`Requires ${manifest.compiler}; checking with ${compilerVersion()}`},
    {id:'source',status:errors.length?'error':'ok',message:errors.length?errors.map(issue=>`${relative(root,issue.file)}:${issue.line}: ${issue.message}`).join('\n'):'Production and same-file tests check.'}
  ];
  const surface=errors.length?[]:packageSurface(checked);
  const undocumented=surface.filter(item=>!item.fact.documentation?.trim()).map(item=>item.name);
  checks.push({id:'exports',status:surface.length?'ok':'error',message:surface.length?`${surface.length} public exports`:'No checked public exports',recovery:surface.length?undefined:'Choose public declarations in export.aug.'});
  checks.push({id:'documentation',status:undocumented.length?'error':'ok',message:undocumented.length?'Missing public documentation: '+undocumented.join(', '):'Public declarations have documentation.',recovery:undocumented.length?'Add Javadoc above the exported declarations, then run aug spec.':undefined});
  const license=['LICENSE','LICENSE.md','LICENSE.txt'].find(file=>existsSync(join(root,file))&&readFileSync(join(root,file),'utf8').trim());
  checks.push({id:'license',status:license?'ok':'error',message:license?'License file: '+license:'No license file',recovery:license?undefined:'Choose a license and add LICENSE before publishing.'});
  const cases=discoverTests(checked.project).tests.length;
  checks.push({id:'tests',status:cases?'ok':'error',message:`${cases} checked test cases; behavioral tests have not run.`,recovery:cases?'Run aug test before publishing.':'Add independent same-file tests, then run aug test.'});
  if(manifest.native) {
    checks.push({id:'native-contract',status:'ok',message:'Native descriptor and declared artifact metadata validate; downloaded bytes and runtime cleanup are not qualified by this report.'});
    try {const target=nativeHostTarget(),artifact=selectNativeArtifact(manifest.native.artifacts,target);checks.push({id:'native-host',status:'ok',message:`Declared artifact ${artifact.id} for ${target.triple}`});}
    catch(error){checks.push({id:'native-host',status:'warning',message:(error as Error).message,recovery:'Qualify on a declared supported host before publishing.'});}
    if(!existsSync(join(root,'THIRD_PARTY_NOTICES.md')))checks.push({id:'notices',status:'error',message:'Missing THIRD_PARTY_NOTICES.md',recovery:'Include notices for the native artifact closure.'});
  }
  return {format:1,name:manifest.name,version:manifest.version,ready:checks.every(check=>check.status!=='error'),checks,
    evidence:{compiler:errors.length?'rejected':'accepted',behavior:'not-run',artifacts:'metadata-only',publication:'not-run'}};
}

/** Compare generated explanation trees, removing source coordinates and the separate interface disclosure. */
function publicExplanations(checked:CheckedProject) {
  const surface=packageSurface(checked),files=[...new Set(surface.map(entry=>entry.fact.location.file))].map(path=>checked.project.files.get(path)!);
  const declarations=new Map(generateSpecs(checked,{files,declarations:true}).flatMap(output=>output.declarations??[]).map(entry=>[entry.id,entry.tree]));
  const prose=(node:SpecNode):SpecNode[]=>{
    if(node.kind==='details')return [];
    if(node.kind==='section')return [{kind:'section',title:node.title,level:node.level,children:node.children.flatMap(prose)}];
    if(node.kind==='flow')return [{kind:'flow',steps:node.steps}];
    return [node];
  };
  return new Map(surface.map(entry=>{
    const tree=declarations.get(entry.fact.id);if(!tree)throw new Error('PACKAGE_DIFF: Missing checked explanation '+entry.name);
    return [entry.name,{text:prose(tree).map(node=>renderSpecTree(node)).join('\n'),
      source:{file:relative(checked.project.sourceRoot,entry.fact.location.file).replaceAll('\\','/'),line:entry.fact.location.line,column:entry.fact.location.column}}];
  }));
}

/** Compare two already installed local package revisions; this never fetches. */
export function packageInterfaceDiff(beforeDirectory:string,afterDirectory:string) {
  const beforeRoot=resolve(beforeDirectory),afterRoot=resolve(afterDirectory);
  const before=checkedProjectWithTests(beforeRoot,new Map()),after=checkedProjectWithTests(afterRoot,new Map());
  return compareCheckedPackageInterfaces(before,after);
}

/** Reuse the same checked public review for staged dependencies, including additions and removals. */
export function compareCheckedPackageInterfaces(before?:CheckedProject,after?:CheckedProject) {
  const errors=[...(before?.diagnostics??[]),...(after?.diagnostics??[])].filter(issue=>issue.severity!=='warning');
  if(errors.length)throw new Error('PACKAGE_DIFF: Both package revisions must check. '+errors.map(issue=>issue.message).join('; '));
  const surface=(checked:CheckedProject)=>{
    const facts=new Map(contractFacts(checked).map(fact=>[fact.id,fact]));
    return new Map(packageSurface(checked).map(item=>[item.name,publicContract(checked,item.fact,facts)]));
  };
  const left=before?surface(before):new Map(),right=after?surface(after):new Map();
  const changes=[...new Set([...left.keys(),...right.keys()])].sort(compare).flatMap(name=>JSON.stringify(left.get(name))===JSON.stringify(right.get(name))?[]:[{name,before:left.get(name)??null,after:right.get(name)??null,differences:contractDifferences(left.get(name),right.get(name))}]);
  const leftProse=before?publicExplanations(before):new Map(),rightProse=after?publicExplanations(after):new Map();
  const specChanges=[...new Set([...leftProse.keys(),...rightProse.keys()])].sort(compare).flatMap(name=>leftProse.get(name)?.text===rightProse.get(name)?.text?[]:
    [{name,before:leftProse.get(name)?.text??null,after:rightProse.get(name)?.text??null,source:{before:leftProse.get(name)?.source??null,after:rightProse.get(name)?.source??null}}]);
  return {format:1,revisions:{before:before?semanticGraph(before,true).revision:null,after:after?semanticGraph(after,true).revision:null},specChanges,before:before?.project.library?.version??null,after:after?.project.library?.version??null,changes,
    native:{before:before?.project.library?.native??null,after:after?.project.library?.native??null},evidence:'checked-public-contracts',behavioralEvidence:'not-run'};
}
