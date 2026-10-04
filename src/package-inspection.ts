import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import type {CheckedProject,Ty} from './checker.ts';
import {tyName,immutableType} from './types.ts';
import type {TypeRef} from './ast.ts';
import {schemaType} from './schemas.ts';
import {loadProject} from './project.ts';
import {readPackage,readPackageLock,compilerVersion} from './package-manager.ts';
import {sourceAlias} from './git-packages.ts';
import {contractFacts} from './contract-facts.ts';
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
    for(const item of file.items)if(item.kind==='export') {
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

/** Compare two already installed local package revisions; this never fetches. */
export function packageInterfaceDiff(beforeDirectory:string,afterDirectory:string) {
  const beforeRoot=resolve(beforeDirectory),afterRoot=resolve(afterDirectory);
  const before=checkedProjectWithTests(beforeRoot,new Map()),after=checkedProjectWithTests(afterRoot,new Map());
  const errors=[...before.diagnostics,...after.diagnostics].filter(issue=>issue.severity!=='warning');
  if(errors.length)throw new Error('PACKAGE_DIFF: Both package revisions must check. '+errors.map(issue=>issue.message).join('; '));
  const normalize=(value:unknown):unknown=>{
    if(Array.isArray(value))return value.map(normalize);
    if(!value||typeof value!=='object')return value;
    return Object.fromEntries(Object.entries(value).filter(([key])=>!['id','location','documentation','calls','tests','inferredEffects'].includes(key)).map(([key,child])=>[key,normalize(child)]));
  };
  const surface=(checked:CheckedProject)=>{
    const facts=new Map(contractFacts(checked).map(fact=>[fact.id,fact]));
    return new Map(packageSurface(checked).map(item=>{
      const entries=item.fact.kind==='interface'||item.fact.kind==='capability' ? [...(checked.interfaceMembers.get(item.fact.id)?.values()??[])].flat().filter(entry=>entry.from!==item.fact.id) : [...(checked.defaults.get(item.fact.id)?.values()??[])];
      const inherited=entries.filter(entry=>!entry.method.name.startsWith('_')).map(entry=>{
        const original=facts.get(entry.from)?.callables.find(method=>method.name===entry.method.name);
        if(!original)throw new Error('PACKAGE_DIFF: Missing inherited method contract '+entry.method.name);
        const ownerParams=new Map(entry.params); for(const name of entry.method.typeParams)ownerParams.delete(name);
        const substitute=(type:Ty):Ty=>type.kind==='param'&&ownerParams.has(type.name)?{...ownerParams.get(type.name)!,nullable:type.nullable||ownerParams.get(type.name)!.nullable,optional:type.optional||ownerParams.get(type.name)!.optional}: {...type,args:type.args.map(substitute)};
        const inputType=(ref:TypeRef):Ty=>{const base=schemaType(checked.project,ref,entry.file,ownerParams);
          const type=ownerParams.has(ref.name)?base:{...base,args:ref.args.map(inputType)};return ref.immutable?immutableType(type):type;};
        const contract=checked.callableContracts.get(entry.method);
        return {...original,inputs:original.inputs.map((input,index)=>({...input,type:tyName(inputType(entry.method.params[index].type))})),
          result:(entry.method.returnOwnership==='own'?'own ':'')+tyName(substitute(contract?.result??checked.resolvedTypes.get(entry.method.returns)!)),
          errors:contract?.errors.map(error=>tyName(substitute(error)))??original.errors};
      });
      const projection={...item.fact,fields:item.fact.fields.filter(field=>!field.storage.startsWith('_')).map(({storage,...field})=>({...field,name:storage})),
        callables:[...item.fact.callables,...inherited].map(method=>({...method,inputs:method.inputs.map(({name,...input})=>input)}))};
      return [item.name,normalize(projection)];
    }));
  };
  const left=surface(before),right=surface(after);
  const changes=[...new Set([...left.keys(),...right.keys()])].sort(compare).flatMap(name=>JSON.stringify(left.get(name))===JSON.stringify(right.get(name))?[]:[{name,before:left.get(name)??null,after:right.get(name)??null}]);
  return {format:1,before:readPackage(beforeRoot).manifest.version,after:readPackage(afterRoot).manifest.version,changes,
    native:{before:readPackage(beforeRoot).manifest.native??null,after:readPackage(afterRoot).manifest.native??null},evidence:'checked-public-contracts'};
}
