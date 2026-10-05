import {initNativePackage} from './native-init.ts';
import {BodyEditError,sourceUnitLimit} from './body-edits.ts';
import {SourceChangeError} from './source-transactions.ts';
import {projectComparison} from './project-comparison.ts';
import {planChangeRename,planChangeRenameSymbol,planChangeReplaceBody,applyChangePlan,recoverSourceChanges, type ChangePlan } from './checked-changes.ts';
import {recordBindingDefinition} from './binding-patterns.ts';
import {pruneTestCompilations} from './test-compilation-cache.ts';
import {inspectCaches} from './cache-management.ts';
import {verifyAcceptance,verificationSummary} from './verification.ts';
import {semanticGraph,semanticConfiguration} from './symbols.ts';
import {suggestTestInputs,parseAuthorInputCases} from './test-inputs.ts';
import {createHash} from 'node:crypto';
import {compositionReport,compositionDiagram} from './composition.ts';
import {withScratch} from './scratch.ts';
import {buildBundle,verifyBundle} from './bundle.ts';
import {BuildProgress} from './progress.ts';
import {libraryCatalog} from './library-catalog.ts';
import {hasRequiredContext,contextModes,type ContextMode} from './context.ts';
import {dependencyUpdatePreview} from './package-updates.ts';
import {dependencyReport,packageReadiness,packageInterfaceDiff} from './package-inspection.ts';
import { existsSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { Diagnostic } from './ast.ts';
import { typeName } from './ast.ts';
import { checkProject } from './checker.ts';
import { generateC } from './codegen.ts';
import {generateLLVM} from './llvm.ts';
import {lowerToIR,BackendUnsupported} from './ir.ts';
import {IRVerificationError} from './ir-verify.ts';
import {compileLLVM} from './llvm-native.ts';
import {prepareNativePackages,cacheLocalNativeArtifact} from './native-artifacts.ts';
import {prepareLLVMCompiler} from './compiler-packs.ts';
import {bindNativeHeader} from './native-bindings.ts';
import {inspectDistribution} from './distribution.ts';
import { diagnosticHelp } from './help.ts';
import { loadProject } from './project.ts';
import { definitionAt } from './navigation.ts';
import { checkUnitTests, discoverTests, mergeTestAnalysis, uniqueDiagnostics } from './testing.ts';
import { describe, SemanticWorkspace } from './semantic.ts';
import { formatFile, migrateFile } from './formatter.ts';
import { updateSpecs } from './spec.ts';
import { updateSpecHints } from './spec-hints.ts';
import { runLanguageServer } from './lsp.ts';
import { benchmark, compileNative, writeCoverage } from './native.ts';
import {generateOpenApi} from './openapi.ts';
import { addPackageWithNative, initPackage, installPackagesWithNative, preparePackage, packPackage, prepareRunPackagesWithNative, suggestedPackageAlias } from './package-manager.ts';
import { initProject } from './project-init.ts';
import {packageRelease,packageWorkflow,writePackageWorkflow} from './package-publishing.ts';
import {sourceStyle} from './source-style.ts';
import type {SourceStyle} from './formatter.ts';
import { prepareNativeDependencies } from '../scripts/native-setup.mjs';

function failureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof Error && 'code' in error && ['EACCES', 'EPERM', 'EROFS'].includes(String(error.code)))
    return `${message}\nAugust needs a writable project and native cache. Check the folder permissions, or set AUG_NATIVE_ARTIFACT_CACHE to a directory you own. Run aug doctor to check setup.`;
  if (error instanceof Error && 'code' in error && error.code === 'ENOSPC')
    return `${message}\nThere is not enough disk space to compile or prepare dependencies. Free space and retry aug run.`;
  return message;
}

function printDiagnostics(diagnostics: Diagnostic[], json: boolean, root: string): void {
  if (json) {
    process.stdout.write(JSON.stringify(diagnostics.map(issue => ({ ...issue,
      help: diagnosticHelp[issue.code] }))) + '\n');
    return;
  }
  const sources = new Map<string, string[]>();
  const excerpt = (location: {file:string;line:number;column:number}) => {
    try {
      if (!sources.has(location.file)) sources.set(location.file, readFileSync(location.file, 'utf8').split(/\r?\n/));
      const line = sources.get(location.file)?.[location.line - 1];
      if (line !== undefined) {
        const column = Math.max(0, Math.min(line.length, location.column - 1));
        const start = Math.max(0, column - 70), end = Math.min(line.length, start + 150);
        const text = (start ? '…' : '') + line.slice(start, end).replace(/\t/g, '    ') + (end < line.length ? '…' : '');
        const padding = (start ? 1 : 0) + line.slice(start, column).replace(/\t/g, '    ').length;
        process.stderr.write(`  ${location.line} | ${text}\n  ${' '.repeat(String(location.line).length)} | ${' '.repeat(padding)}^\n`);
      }
    } catch { /* A removed source still has its location and explanation. */ }
  };
  for (const issue of diagnostics) {
    const file = relative(root, issue.file) || issue.file;
    process.stderr.write(`${file}:${issue.line}:${issue.column}: ${issue.code}: ${issue.message}\n`);
    excerpt(issue);
    if (issue.code === 'CALL' && issue.expected && !issue.related?.length) process.stderr.write(`  caller input labels: ${issue.expected}\n`);
    for (const location of issue.related ?? []) {
      process.stderr.write(`  related: ${relative(root,location.file) || location.file}:${location.line}:${location.column}: ${location.message}\n`);
      excerpt(location);
    }
    if (diagnosticHelp[issue.code]) process.stderr.write(`  help: ${diagnosticHelp[issue.code]}\n`);
  }
}

function usage(): void {
  process.stdout.write(`AugScript compiler\n\n` +
    `Usage: aug <init|doctor|cache|scratch|check|build|bundle|run|emit-c|emit-llvm|emit-ir|test|verify|openapi|format|migrate|spec|bench|explain|context|compare|lsp|symbols|definition|references|graph|complete|hover|fixes|semantic-tokens> [project directory] [options] [-- args]\n` +
    `Scratch: aug scratch FILE [--prepare] [--run] [--offline] [--backend c|llvm] [--json] [-- args] — check a temporary entry module; --run executes it\n` +
    `Find libraries: aug libraries [QUERY] [--json] — search the bundled task catalog without downloads\n` +
    `Inspect dependencies: aug dependencies [PROJECT] [--json]; aug update [PROJECT] --preview [--offline] [--json]\n` +
    `Native C starter: aug package init DIRECTORY --native c --name @owner/name --repository URL --artifact-url URL --license FILE --clang PATH --ar PATH\n` +
    `Local native archives: aug package cache-native [DIRECTORY] --artifact ID --archive FILE [--json]\n` +
    `Package maintainers: aug package workflow [DIRECTORY] [--write] [--json]; aug package release [DIRECTORY] --tag vVERSION [--json]\n` +
    `Compare local projects: aug compare BEFORE AFTER [--json] — checked contracts, source changes and known consumers; no execution\n` +
    `Package readiness/diff: aug package check DIRECTORY [--json]; aug package diff BEFORE AFTER [--json]\n` +
    `New application: aug init DIRECTORY [--template hello|weather] [--block-style indent|braces] [--indentation spaces|tabs] [--assignment equals|to]\n` +
    `Caches: aug cache [PROJECT] [--json]; aug cache prune [PROJECT] [--write] [--json] — inspect caches or clear idle verified test output\n` +
    `Diagnose setup: aug doctor [project directory] [--json] — check without downloading or writing files\n` +
    `Run: aug run [project directory] [--offline] [--progress] [-- args] — prepare dependencies, compile, and start\n` +
    `Deployment: aug bundle PROJECT --out DIRECTORY [--offline] [--frozen]; aug bundle verify DIRECTORY [--json]\n` +
    `Backend: LLVM is the default on macOS 14+ ARM64 and GNU/Linux x64/ARM64 with glibc 2.36+. August installs its compiler pack; no separate native toolchain is needed. --backend c selects the migration reference.\n` +
    `Tests: aug test [project directory] [GROUP_NAME] [--group GROUP_NAME] [--list] [--coverage] [--rebuild] [--json] [--timeout milliseconds]\n` +
    `Acceptance: aug verify [PROJECT] --requirements FILE [--backend c|llvm] [--timeout MS] [--offline] [--frozen] [--json] — check source and run author-selected cases\n` +
    `Test inputs: aug test [PROJECT] --suggest-inputs FUNCTION --file FILE [--cases JSON_FILE] [--combinations] [--limit N] [--json] — propose checked inputs; author supplies assertions\n` +
    `Format: aug format [project directory] [--file path] [--write]\n` +
    `Specifications: aug spec [project directory] [--check] [--json]\n` +
    `Migration: aug migrate [project directory] [--file path] [--write]\n` +
    `Context: aug context [project directory] [--file path] [--name declaration] [--budget characters] [--mode implementation|interface-change|review] [--require-complete]\n` +
    `Composition: aug graph [PROJECT] --composition [--case TEST_ID] [--json|--mermaid] — inspect existing application or test wiring\n` +
    `References: aug references [project directory] --file path --offset character; aug graph [project directory] --file path\n` +
    `Checked edits: aug change plan-rename [PROJECT] --file FILE (--symbol FUNCTION[.INPUT]|--offset N) --name NAME [--out PLAN] [--json]; aug change apply [PROJECT] --plan PLAN; aug change recover [PROJECT]\n` +
    `Body edits: aug change plan-replace-body [PROJECT] --file FILE --symbol FUNCTION --source SOURCE_UNIT [--out PLAN] [--json]\n` +
    `Benchmark: aug bench [project directory] [--iterations 10] [--warmup 2] [--json] [-- args]\n` +
    `Packages: aug package init DIRECTORY [--name @owner/name] [source style options]; aug package pack DIRECTORY\n` +
    `Dependencies: aug add URL [--as NAME] [--project DIRECTORY]; aug install [project directory] [--frozen|--update] [--offline]\n` +
    `Native maintainers: aug bind header HEADER --contract native.abi.json --target TRIPLE --output DIRECTORY --clang PATH [-- CLANG_FLAGS]\n` +
    `Entry point: main.aug at the project root.\n`);
}

export async function main(argv: string[]): Promise<number> {
  if(argv[0]==='pack')return main(['package','pack',...argv.slice(1)]);
  const command = argv[0];
  if(command==='bundle'&&argv[1]==='verify') {
    const args=argv.slice(2),paths=args.filter(arg=>!arg.startsWith('-'));
    if(paths.length!==1||args.some(arg=>arg.startsWith('-')&&arg!=='--json')){process.stderr.write('Use aug bundle verify DIRECTORY [--json]\n');return 2;}
    try {const report=verifyBundle(paths[0]);process.stdout.write(args.includes('--json')?JSON.stringify(report)+'\n':`Verified ${report.files} files for ${report.target}; executable ${report.executable}.\n${report.trust}\n`);return 0;}
    catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='cache') {
    const pruning=argv[1]==='prune';let path:string|undefined;const seen=new Set<string>();
    for(const arg of argv.slice(pruning?2:1)) {
      if(['--json',...(pruning?['--write']:[])].includes(arg)&&!seen.has(arg))seen.add(arg);
      else if(!arg.startsWith('-')&&!path)path=arg;
      else {process.stderr.write('Use aug cache [PROJECT] [--json]; aug cache prune [PROJECT] [--write] [--json]\n');return 2;}
    }
    try {
      if(pruning){
        const report=pruneTestCompilations(resolve(path??process.cwd()),seen.has('--write'));
        if(seen.has('--json'))process.stdout.write(JSON.stringify(report)+'\n');
        else {for(const entry of report.entries)process.stdout.write(`${entry.identity}: ${entry.status}${entry.reason?' — '+entry.reason:''}\n`);process.stdout.write(`${report.bytes} bytes ${report.action==='preview'?'can be reclaimed; add --write to prune':'reclaimed'}.\n${report.retained}\n`);}
        return 0;
      }
      const report=inspectCaches(path??process.cwd());
      if(seen.has('--json'))process.stdout.write(JSON.stringify(report)+'\n');
      else {
        for(const cache of report.caches){process.stdout.write(`${cache.kind}: ${cache.bytes} bytes in ${cache.files} files${cache.complete?'':' (incomplete)'}; ${cache.directory}\n${cache.pruning}\n`);for(const issue of cache.issues)process.stdout.write('  '+issue+'\n');}
        for(const omission of report.selections.omissions)process.stdout.write('Accepted lock selections unavailable: '+omission+'\n');
        for(const source of report.selections.sources)process.stdout.write(`Locked source: ${source.identity} ${source.digest}\n`);
        for(const entry of report.selections.repositories)process.stdout.write(`Locked repository: ${entry.request} ${entry.commit}\n`);
        if(report.selections.compiler)process.stdout.write(`Selected compiler: ${report.selections.compiler.target} ${report.selections.compiler.identity}\n`);
        for(const entry of report.selections.native)process.stdout.write(`Locked native: ${entry.kind} ${entry.target} ${entry.identity}\n`);
        process.stdout.write(`Offline inputs: ${report.offlineReady?'ready':'not ready'}; frozen inputs: ${report.frozenReady?'ready':'not ready'}.\n${report.sizes}\n`);
        for(const check of report.checks.filter(check=>check.status!=='ok'))process.stdout.write(`${check.id}: ${check.message}${check.recovery?' '+check.recovery:''}\n`);
      }
      return report.ready?0:1;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='change') {
    const operation=argv[1],values=new Map<string,string>(),flags=new Set<string>();let path:string|undefined;
    for(let index=2;index<argv.length;index++) {
      const arg=argv[index];
      if(['--file','--offset','--symbol','--name','--source','--out','--plan'].includes(arg)) {
        if(values.has(arg)||!argv[index+1]||argv[index+1].startsWith('--')){process.stderr.write(arg+' needs one value.\n');return 2;}
        values.set(arg,argv[++index]);
      }else if(arg==='--json') {
        if(flags.has(arg)){process.stderr.write('Duplicate change option: '+arg+'\n');return 2;}flags.add(arg);
      }else if(arg.startsWith('-')||path){process.stderr.write('Use aug change plan-rename|plan-replace-body|apply|recover [PROJECT] with the operation options.\n');return 2;}
      else path=arg;
    }
    const allowed=operation==='plan-rename'?['--file','--offset','--symbol','--name','--out']:operation==='plan-replace-body'?['--file','--symbol','--source','--out']:operation==='apply'?['--plan']:operation==='recover'?[]:undefined;
    if(!allowed||[...values.keys()].some(key=>!allowed.includes(key))||operation==='plan-rename'&&(!values.has('--file')||values.has('--offset')===values.has('--symbol')||!values.has('--name'))||operation==='plan-replace-body'&&(!values.has('--file')||!values.has('--symbol')||!values.has('--source'))||operation==='apply'&&!values.has('--plan')) {
      process.stderr.write('Use aug change plan-rename [PROJECT] --file FILE (--symbol FUNCTION[.INPUT]|--offset N) --name NAME [--out PLAN] [--json]\nOr aug change plan-replace-body [PROJECT] --file FILE --symbol FUNCTION --source SOURCE_UNIT [--out PLAN] [--json]\nOr aug change apply [PROJECT] --plan PLAN [--json]\nOr aug change recover [PROJECT] [--json]\n');return 2;
    }
    const root=resolve(path??process.cwd());
    try {
      if(operation==='plan-rename'||operation==='plan-replace-body') {
        let sourceUnit:string|undefined;
        if(operation==='plan-replace-body') {
          const sourcePath=resolve(root,values.get('--source')!),stat=statSync(sourcePath);
          if(!stat.isFile()||stat.size>sourceUnitLimit)throw new SourceChangeError('CHANGE_SOURCE_UNIT','Supply a UTF-8 source file of at most 1 MiB.');
          const bytes=readFileSync(sourcePath);
          if(bytes.length>sourceUnitLimit)throw new SourceChangeError('CHANGE_SOURCE_UNIT','Source unit exceeds 1 MiB.');
          try{sourceUnit=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);}catch{throw new SourceChangeError('CHANGE_SOURCE_UNIT','Source unit must contain valid UTF-8 text.');}
        }
        if(values.has('--offset')&&!/^\d+$/.test(values.get('--offset')!))throw new Error('CHANGE_PLAN: --offset must be a nonnegative source offset.');
        const plan=operation==='plan-replace-body'?planChangeReplaceBody(root,values.get('--file')!,values.get('--symbol')!,sourceUnit!):values.has('--symbol')?planChangeRenameSymbol(root,values.get('--file')!,values.get('--symbol')!,values.get('--name')!):
          planChangeRename(root,values.get('--file')!,Number(values.get('--offset')),values.get('--name')!);
        if(values.has('--out')) {
          const output=resolve(root,values.get('--out')!);
          if(output.endsWith('.aug')||['main.yaml','aug-package.json','aug.lock.json'].includes(output.slice(output.lastIndexOf('/')+1)))throw new Error('CHANGE_PLAN: Save the plan as a separate JSON review file.');
          writeFileSync(output,JSON.stringify(plan,null,2)+'\n',{flag:'wx',mode:0o600});
        }
        if(flags.has('--json'))process.stdout.write(JSON.stringify(plan)+'\n');
        else {process.stdout.write(plan.operation==='rename'?`Checked rename plan ${plan.symbol} to ${plan.name}; revision ${plan.baseRevision}.\n`:`Checked body replacement for ${plan.symbol}; revision ${plan.baseRevision}.\n`);
          for(const file of plan.scope)process.stdout.write(`${file}: ${plan.edits.filter(edit=>edit.file===file).length} resolved edits.\n`);
          process.stdout.write(`${plan.publicDelta.length} public contract deltas. Independent behavioral checks were not run. Review the JSON plan before applying it.\n`);}
      }else if(operation==='apply') {
        const input=resolve(root,values.get('--plan')!);
        if(statSync(input).size>16*1024*1024)throw new Error('CHANGE_PLAN: Plan exceeds the 16 MiB exchange limit.');
        const report=applyChangePlan(root,JSON.parse(readFileSync(input,'utf8')));
        process.stdout.write(flags.has('--json')?JSON.stringify(report)+'\n':`Committed checked ${report.operation} ${report.transaction}; revision ${report.revision}. Regenerate specs, run independent tests and review the changes.\n`);
      }else {
        const report=recoverSourceChanges(root);
        process.stdout.write(flags.has('--json')?JSON.stringify(report)+'\n':`Source transaction recovery: ${report.status}.\n`);
      }
      return 0;
    }catch(error){
      if(flags.has('--json')) {
        const fault=error as {code?:string;revision?:string;baseRevision?:string;transaction?:string;operation?:ChangePlan['operation'];identityMap?:{before:string;after:string}[];diagnostics?:unknown[]},committed=fault.code==='CHANGE_COMMITTED_RECOVERY_REQUIRED';
        process.stdout.write(JSON.stringify({status:committed?'committed':'rejected',code:fault.code??'CHANGE',error:failureMessage(error),
          ...(committed?{checked:true,recovery:'required',revision:fault.revision,baseRevision:fault.baseRevision,transaction:fault.transaction,operation:fault.operation,...(fault.identityMap?{identityMap:fault.identityMap}:{})}:{}),
          ...(error instanceof BodyEditError?{stage:error.stage,baseRevision:error.baseRevision,candidateRevision:error.candidateRevision,sourceUnits:error.sourceUnits,rejectedBase:error.rejectedBase,rejectedCandidate:error.rejectedCandidate}:{}),
          diagnostics:fault.diagnostics??[],behavioralEvidence:'not-run'})+'\n');
      }
      else process.stderr.write(failureMessage(error)+'\n');return 1;
    }
  }
  if(command==='verify') {
    let path:string|undefined;const values=new Map<string,string>(),seen=new Set<string>();
    for(let index=1;index<argv.length;index++) {
      const arg=argv[index];
      if(['--requirements','--backend','--timeout'].includes(arg)) {
        if(seen.has(arg)||!argv[index+1]||argv[index+1].startsWith('-')){process.stderr.write(arg+' needs one value.\n');return 2;}
        seen.add(arg);values.set(arg,argv[++index]);
      }else if(['--json','--offline','--frozen'].includes(arg)) {
        if(seen.has(arg)){process.stderr.write('Duplicate verification option: '+arg+'\n');return 2;}seen.add(arg);
      }else if(arg.startsWith('-')||path!==undefined){process.stderr.write('Use aug verify [PROJECT] --requirements FILE [--backend c|llvm] [--timeout MS] [--offline] [--frozen] [--json]\n');return 2;}
      else path=arg;
    }
    const backend=values.get('--backend'),timeout=values.has('--timeout')?Number(values.get('--timeout')):10000;
    if(!values.has('--requirements')||backend!==undefined&&!['c','llvm'].includes(backend)||!Number.isInteger(timeout)||timeout<1||timeout>3600000) {
      process.stderr.write('Verification requires --requirements; --backend is c or llvm; --timeout is 1–3600000 milliseconds per native case.\n');return 2;
    }
    try {
      const report=await verifyAcceptance(path??process.cwd(),{requirements:values.get('--requirements')!,backend:backend as 'c'|'llvm'|undefined,
        timeout,offline:seen.has('--offline'),frozen:seen.has('--frozen')});
      process.stdout.write(seen.has('--json')?JSON.stringify(report)+'\n':verificationSummary(report));return report.status==='passed'?0:1;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='test'&&argv.includes('--suggest-inputs')) {
    let path:string|undefined;const values=new Map<string,string>(),seen=new Set<string>();
    for(let index=1;index<argv.length;index++) {
      const arg=argv[index];
      if(['--suggest-inputs','--file','--cases','--limit'].includes(arg)) {
        if(seen.has(arg)||!argv[index+1]||argv[index+1].startsWith('-')){process.stderr.write(arg+' needs one value.\n');return 2;}
        seen.add(arg);values.set(arg,argv[++index]);
      }else if(['--json','--combinations'].includes(arg)) {
        if(seen.has(arg)){process.stderr.write('Duplicate input option: '+arg+'\n');return 2;}seen.add(arg);
      }else if(arg.startsWith('-')||path){process.stderr.write('Use aug test [PROJECT] --suggest-inputs FUNCTION --file FILE [--cases JSON_FILE] [--combinations] [--limit N] [--json]\n');return 2;}
      else path=arg;
    }
    const limit=values.has('--limit')?Number(values.get('--limit')):64;
    if(!values.has('--file')||!Number.isInteger(limit)||limit<1||limit>4096){process.stderr.write('Input suggestions require --file; --limit must be an integer from 1 to 4096.\n');return 2;}
    const root=resolve(path??process.cwd());
    try {
      const project=loadProject(root),requested=resolve(root,values.get('--file')!),file=project.library?realpathSync(requested):requested,name=values.get('--suggest-inputs')!;
      const definition=project.scopes.get(file)?.get(name);
      if(!definition||definition.file!==file||project.files.get(file)?.builtin||project.files.get(file)?.package)throw new Error('TEST_INPUTS: Name an ordinary function declared in the selected project file.');
      const casesPath=values.has('--cases')?resolve(root,values.get('--cases')!):undefined;
      if(casesPath&&statSync(casesPath).size>1024*1024)throw new Error('TEST_INPUTS: Author cases exceed the 1 MiB limit.');
      const author=casesPath?readFileSync(casesPath,'utf8'):undefined;
      const report=suggestTestInputs(checkProject(project),definition,{limit,combinations:seen.has('--combinations'),
        ...(author!==undefined?{authorCases:parseAuthorInputCases(author),authorDigest:createHash('sha256').update(author).digest('hex')}:{})});
      if(seen.has('--json'))process.stdout.write(JSON.stringify(report)+'\n');
      else process.stdout.write(report.scaffold+'\n'+report.rows.length+' checked input rows; no tests ran. Replace '+report.assertionPlaceholder+' with an independent assertion inside a new, empty same-file test group.\n');
      return 0;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='graph'&&argv.includes('--composition')) {
    let path:string|undefined,caseId:string|undefined;const seen=new Set<string>();
    for(let index=1;index<argv.length;index++) {
      const arg=argv[index];
      if(arg==='--case') {if(seen.has(arg)||!argv[index+1]||argv[index+1].startsWith('-')){process.stderr.write('--case needs one same-file test id.\n');return 2;}seen.add(arg);caseId=argv[++index];}
      else if(['--composition','--json','--mermaid'].includes(arg)){if(seen.has(arg)){process.stderr.write('Duplicate graph option: '+arg+'\n');return 2;}seen.add(arg);}
      else if(arg.startsWith('-')||path){process.stderr.write('Use aug graph [PROJECT] --composition [--case TEST_ID] [--json|--mermaid]\n');return 2;}
      else path=arg;
    }
    if(seen.has('--json')&&seen.has('--mermaid')){process.stderr.write('Choose --json or --mermaid.\n');return 2;}
    const root=resolve(path??process.cwd());
    try {
      const report=compositionReport(loadProject(root),caseId);
      if(seen.has('--json'))process.stdout.write(JSON.stringify(report)+'\n');
      else if(!report.checked)printDiagnostics(report.diagnostics,false,root);
      else if(seen.has('--mermaid'))process.stdout.write(compositionDiagram(report));
      else {process.stdout.write(`Checked ${report.scope.kind} composition ${report.scope.id}; behavioral tests not run.\n`);
        for(const binding of report.bindings)process.stdout.write(`${binding.key} with ${binding.target.name}: ${binding.lifetime}${binding.stateful?', mutable state':''}${binding.requiresScope?', requires scope':''}\n`);
        for(const edge of report.dependencies)process.stdout.write(`${edge.from} requires ${edge.to} through ${edge.input} (${edge.location.file}:${edge.location.line}).\n`);}
      return report.checked?0:1;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='scratch') {
    if(argv.length===2&&argv[1]==='--help'){usage();return 0;}
    const boundary=argv.indexOf('--'),args=argv.slice(1,boundary<0?undefined:boundary),programArgs=boundary<0?[]:argv.slice(boundary+1);
    let file:string|undefined,backend:string|undefined;const seen=new Set<string>();
    for(let index=0;index<args.length;index++) {
      const value=args[index];
      if(value==='--backend') {
        if(seen.has(value)||!['c','llvm'].includes(args[index+1])){process.stderr.write('--backend needs c or llvm exactly once.\n');return 2;}
        seen.add(value);backend=args[++index];
      }else if(['--run','--prepare','--offline','--json'].includes(value)) {
        if(seen.has(value)){process.stderr.write('Duplicate scratch option: '+value+'\n');return 2;}seen.add(value);
      }else if(value.startsWith('-')||file){process.stderr.write('Use aug scratch FILE [--prepare] [--run] [--offline] [--backend c|llvm] [--json] [-- args]\n');return 2;}
      else file=value;
    }
    if(!file||seen.has('--run')&&seen.has('--json')||!seen.has('--run')&&programArgs.length){process.stderr.write('Scratch needs one file. --json is check-only; program arguments require --run.\n');return 2;}
    try {
      return await withScratch(file,{prepare:seen.has('--prepare')||seen.has('--run'),offline:seen.has('--offline')},async(root,report)=>{
        if(seen.has('--json'))process.stdout.write(JSON.stringify({...report,diagnostics:report.diagnostics.map(issue=>({...issue,help:diagnosticHelp[issue.code]}))})+'\n');
        else {printDiagnostics(report.diagnostics,false,dirname(report.source.file));if(report.recovery)process.stderr.write(report.recovery+'\n');}
        if(!report.checked)return 1;
        if(!seen.has('--run')) {if(!seen.has('--json'))process.stdout.write('Scratch check passed: '+report.source.file+'\n');return 0;}
        return main(['run',root,...(backend?['--backend',backend]:[]),...(seen.has('--offline')?['--offline']:[]),'--',...programArgs]);
      });
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='libraries') {
    const args=argv.slice(1);
    if(args.some(arg=>arg.startsWith('-')&&arg!=='--json')){process.stderr.write('Use aug libraries [QUERY] [--json]\n');return 2;}
    try {
      const report=libraryCatalog(args.filter(arg=>arg!=='--json').join(' '));
      if(args.includes('--json'))process.stdout.write(JSON.stringify(report)+'\n');
      else {
        process.stdout.write(`August ${report.compiler} library catalog; source metadata, no downloads.\n`);
        if(!report.entries.length)process.stdout.write('No catalog entries match this task. Try sql, compression, json, crypto or tensors.\n');
        for(const entry of report.entries) {
          process.stdout.write(`\n${entry.title} (${entry.id}) — ${entry.summary}\n`);
          process.stdout.write(entry.compilerRequirement ? `${entry.compilerCompatible ? 'Compiler requirement: ' : 'Incompatible compiler; requires '}${entry.compilerRequirement}\n` : `No declared compiler constraint; source reference tested with ${entry.testedCompiler}.\n`);
          if(entry.install)process.stdout.write(entry.install+'\n');
          process.stdout.write(entry.example+'\n'+entry.requirements+'\n'+entry.ownership+'\n');
          for(const artifact of entry.artifacts)process.stdout.write(`Host: ${artifact.target.triple}; ${artifact.target.minimumOS ? 'OS '+artifact.target.minimumOS+'+' : artifact.target.libc+' '+artifact.target.minimumLibc+'+'}\n`);
          process.stdout.write(`License: ${entry.license.summary}\n${entry.license.url}\nTests: ${entry.tests.summary}\n${entry.tests.url}\n`);
        }
      }
      return 0;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='update') {
    const args=argv.slice(1),paths=args.filter(arg=>!arg.startsWith('-'));
    if(!args.includes('--preview')||paths.length>1||args.some(arg=>arg.startsWith('-')&&!['--preview','--offline','--json'].includes(arg))){process.stderr.write('Use aug update [PROJECT] --preview [--offline] [--json]. Accept an update separately with aug install --update.\n');return 2;}
    try{
      const report=dependencyUpdatePreview(paths[0]??process.cwd(),args.includes('--offline'));
      if(args.includes('--json'))process.stdout.write(JSON.stringify(report)+'\n');
      else {
        for(const item of report.packages){
          process.stdout.write((item.before?.name??item.after?.name)+': '+(item.before?.version??'(new)')+' -> '+(item.after?.version??'(removed)')+'\n');
          if(item.before?.source||item.after?.source)process.stdout.write('  commit '+(item.before?.source?.commit??'(none)')+' -> '+(item.after?.source?.commit??'(none)')+'\n');
          if(item.contracts.status==='checked'&&'changes' in item.contracts){
            for(const change of item.contracts.changes)process.stdout.write('  public '+change.name+': '+change.differences.map(value=>value.path).join(', ')+'\n');
            for(const change of item.contracts.specChanges)process.stdout.write('  explanation changed: '+change.name+'\n');
          }else process.stdout.write('  Public contract checking failed; inspect --json.\n');
        }
        for(const issue of report.application.after.diagnostics)process.stdout.write(`${issue.file}:${issue.line}:${issue.column}: ${issue.message}\n`);
        if('error' in report.native)process.stdout.write(report.native.error+'\n');
        for(const artifact of report.native.artifacts)process.stdout.write('  native '+artifact.id+': '+artifact.status+(artifact.error?' '+artifact.error:'')+'\n');
        if(report.native.downloadMaximumBytes!==null)process.stdout.write('Missing native downloads: at most '+report.native.downloadMaximumBytes+' bytes (declared bounds, not measured sizes).\n');
        process.stdout.write('No update was accepted. No native artifacts or package scripts ran. Independent behavioral checks were not run. Use --json for complete contracts, explanations and target/artifact changes.\n');
      }
      return report.ready?0:1;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='dependencies') {
    const args=argv.slice(1),paths=args.filter(arg=>!arg.startsWith('-'));
    if(paths.length>1||args.some(arg=>arg.startsWith('-')&&arg!=='--json')){process.stderr.write('Use aug dependencies [PROJECT] [--json]\n');return 2;}
    try {
      const report=dependencyReport(paths[0]??process.cwd());
      if(args.includes('--json'))process.stdout.write(JSON.stringify(report)+'\n');
      else {
        process.stdout.write(`August ${report.compiler}; dependency revision ${report.revision??'none'}\n`);
        for(const [alias,id] of Object.entries(report.roots))process.stdout.write(`${alias}: ${id}\n`);
        for(const item of report.packages) {
          process.stdout.write(`${item.id} [${item.digest}]${item.source?' commit '+item.source.commit:''}\n`);
          for(const [alias,id] of Object.entries(item.dependencies))process.stdout.write(`  ${alias}: ${id}\n`);
          for(const artifact of item.native)process.stdout.write(`  native ${artifact.target}: ${artifact.artifact.id} [${artifact.artifact.sha256}]\n`);
          for(const usage of report.imports.filter(usage=>usage.package===item.id))process.stdout.write(`  imported by ${usage.owner} ${usage.file}:${usage.line}: ${usage.names.join(', ')}\n`);
        }
        process.stdout.write('Installed source bytes verified. Native selections come from the lock; no artifacts were downloaded or executed.\n');
      }
      return 0;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='package'&&argv[1]==='cache-native') {
    const args=argv.slice(2),values=new Map<string,string>(),seen=new Set<string>();let path:string|undefined;
    const usage='Use aug package cache-native [DIRECTORY] --artifact ID --archive FILE [--json]\n';
    for(let index=0;index<args.length;index++) {
      const arg=args[index];
      if(['--artifact','--archive'].includes(arg)) {
        if(seen.has(arg)||!args[index+1]||args[index+1].startsWith('-')){process.stderr.write(usage);return 2;}
        seen.add(arg);values.set(arg,args[++index]);
      }else if(arg==='--json'&&!seen.has(arg))seen.add(arg);
      else if(arg.startsWith('-')||path){process.stderr.write(usage);return 2;}
      else path=arg;
    }
    if(!values.has('--artifact')||!values.has('--archive')){process.stderr.write(usage);return 2;}
    try {
      const report=await cacheLocalNativeArtifact(path??process.cwd(),values.get('--artifact')!,values.get('--archive')!);
      process.stdout.write(seen.has('--json')?JSON.stringify(report)+'\n':`Verified local artifact ${report.artifact.id} for ${report.package} (${report.files} member files). No native code or package scripts ran; nothing was published.\n`);
      return 0;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='package'&&argv[1]==='workflow') {
    const args=argv.slice(2),paths=args.filter(arg=>!arg.startsWith('-'));
    if(paths.length>1||args.some(arg=>arg.startsWith('-')&&!['--json','--write'].includes(arg))){process.stderr.write('Use aug package workflow [DIRECTORY] [--write] [--json]\n');return 2;}
    try {
      const root=paths[0]??process.cwd(),report=packageWorkflow(root);
      const destination=args.includes('--write')?writePackageWorkflow(root,report.workflow):undefined;
      process.stdout.write(args.includes('--json')?JSON.stringify({...report,...(destination?{destination}:{})})+'\n':destination?'Created '+destination+'; review and commit the workflow.\n':report.workflow);
      return 0;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='package'&&argv[1]==='release') {
    const args=argv.slice(2),paths:string[]=[];let tag:string|undefined;
    for(let index=0;index<args.length;index++) {
      if(args[index]==='--tag'&&!tag&&args[index+1]&&!args[index+1].startsWith('-'))tag=args[++index];
      else if(args[index]==='--json')continue;
      else if(!args[index].startsWith('-'))paths.push(args[index]);
      else {process.stderr.write('Use aug package release [DIRECTORY] --tag vVERSION [--json]\n');return 2;}
    }
    if(!tag||paths.length>1){process.stderr.write('Use aug package release [DIRECTORY] --tag vVERSION [--json]\n');return 2;}
    try {
      const report=packageRelease(paths[0]??process.cwd(),tag);
      if(args.includes('--json'))process.stdout.write(JSON.stringify(report)+'\n');
      else {
        process.stdout.write(report.name+'@'+report.version+' / '+report.source.tag+' / '+report.source.commit+'\n');
        for(const check of report.checks)process.stdout.write(check.status+': '+check.message+'\n'+(check.recovery?'  '+check.recovery+'\n':''));
        process.stdout.write('This report checks source/contracts and cached host artifacts. Independent tests, other platforms and publication remain separate.\n');
      }
      return report.ready?0:1;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='compare') {
    const args=argv.slice(1),paths=args.filter(arg=>!arg.startsWith('-'));
    if(args.length===1&&args[0]==='--help'){process.stdout.write('Use aug compare BEFORE AFTER [--json] — compare two local, installed projects without execution or writes.\n');return 0;}
    if(paths.length!==2||args.some(arg=>arg.startsWith('-')&&arg!=='--json')||args.filter(arg=>arg==='--json').length>1) {
      process.stderr.write('Use aug compare BEFORE AFTER [--json]\n');return 2;
    }
    try {
      const report=projectComparison(paths[0],paths[1]);
      if(args.includes('--json'))process.stdout.write(JSON.stringify(report)+'\n');
      else {
        process.stdout.write(`Checked projects: ${report.before.revision} -> ${report.after.revision}\n`);
        for(const change of report.changes)process.stdout.write(`${change.id}: ${change.kind}, ${change.categories.join(', ')}; ${change.impact.after.length} known consumer sites after the change\n`);
        for(const side of ['before','after'] as const)for(const issue of report[side].diagnostics)process.stderr.write(`${side} ${issue.file}:${issue.line}:${issue.column}: ${issue.code}: ${issue.message}\n`);
        process.stdout.write(`${report.sourceChanges.length} changed source files; ${report.configurationChanges.length} configuration changes; ${report.dependencyChanges.length} dependency metadata changes.\n`);
        process.stdout.write('Behavior was not tested. Dynamic, native and external boundaries remain in --json.\n');
      }
      return report.status==='compared'?0:1;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='package'&&(argv[1]==='check'||argv[1]==='diff')) {
    const operation=argv[1],args=argv.slice(2),paths=args.filter(arg=>!arg.startsWith('-'));
    if(args.some(arg=>arg.startsWith('-')&&arg!=='--json')||paths.length>(operation==='diff'?2:1)||operation==='diff'&&paths.length!==2){process.stderr.write('Use aug package check [DIRECTORY] [--json] or aug package diff BEFORE AFTER [--json]\n');return 2;}
    try {
      if(operation==='check') {
        const report=packageReadiness(paths[0]??process.cwd());
        if(args.includes('--json'))process.stdout.write(JSON.stringify(report)+'\n');
        else for(const check of report.checks)process.stdout.write(`${check.status}: ${check.message}\n${check.recovery?'  '+check.recovery+'\n':''}`);
        return report.ready?0:1;
      }
      const report=packageInterfaceDiff(paths[0],paths[1]);
      if(args.includes('--json'))process.stdout.write(JSON.stringify(report)+'\n');
      else {
        process.stdout.write(`Public contracts: ${report.before} -> ${report.after}\n`);
        for(const change of report.changes){
          process.stdout.write(change.name+':\n');
          const value=(item:unknown)=>{const text=JSON.stringify(item);return text.length<=160?text:text.slice(0,160)+'…';};
          for(const difference of change.differences.slice(0,12))process.stdout.write('  '+difference.path+': '+value(difference.before)+' -> '+value(difference.after)+'\n');
          if(change.differences.length>12)process.stdout.write('  '+(change.differences.length-12)+' further contract changes; use --json for the complete review.\n');
        }
        if(JSON.stringify(report.native.before)!==JSON.stringify(report.native.after))process.stdout.write('Native requirements changed; inspect --json for the complete target and artifact delta.\n');
        if(!report.changes.length)process.stdout.write('No public declaration changes.\n');
        for(const change of report.specChanges)process.stdout.write('Explanation: '+change.name+'\nBefore:\n'+(change.before??'(not exported)\n')+'After:\n'+(change.after??'(not exported)\n'));
        process.stdout.write('Both revisions check. Independent behavioral checks were not run.\n');
      }
      return 0;
    }catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if(command==='doctor'){
    const arguments_=argv.slice(1),paths=arguments_.filter(arg=>!arg.startsWith('-'));
    if(paths.length>1||arguments_.some(arg=>arg.startsWith('-')&&arg!=='--json')){process.stderr.write('Use aug doctor [project directory] [--json]\n');return 2;}
    const report=inspectDistribution(resolve(paths[0]??process.cwd()));
    if(arguments_.includes('--json'))process.stdout.write(JSON.stringify(report)+'\n');
    else{
      process.stdout.write(`August ${report.compiler} on ${report.host}\n`);
      for(const check of report.checks)process.stdout.write(`${check.status}: ${check.message}\n${check.recovery?'  '+check.recovery+'\n':''}`);
      for(const artifact of report.artifacts){
        const target=artifact.target,requirements=[target.minimumOS?'macOS '+target.minimumOS+'+':target.libc+' '+(target.minimumLibc??'')+'+',target.cxxRuntime].filter(Boolean);
        process.stdout.write('  Native requirements: '+requirements.join('; ')+'; runtime files: '+(artifact.runtimeFiles.join(', ')||'none')+'\n');
      }
      process.stdout.write(report.ready?'Setup checks passed.\n':'Resolve the errors above, then retry aug doctor.\n');
      process.stdout.write('LLVM offline inputs: '+(report.offlineReady?'ready':'not ready')+'. Frozen inputs: '+(report.frozenReady?'ready':'not ready')+'. Application execution was not tested.\n');
    }
    return report.ready?0:1;
  }
  if (command === '--version' || command === 'version') {
    process.stdout.write(JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version + '\n');
    return 0;
  }
  if (!command || command === '--help' || command === 'help') { usage(); return 0; }
  if(command==='bind'){
    const boundary=argv.indexOf('--'),arguments_=boundary<0?argv:argv.slice(0,boundary),values:Record<string,string>={};
    if(arguments_[1]!=='header'||!arguments_[2]||arguments_[2].startsWith('--')){process.stderr.write('Use aug bind header HEADER --contract FILE --target TRIPLE --output DIRECTORY --clang PATH\n');return 2;}
    for(let index=3;index<arguments_.length;index++){
      const flag=arguments_[index];if(!['--contract','--target','--output','--clang'].includes(flag)||values[flag]!==undefined||!arguments_[index+1]||arguments_[index+1].startsWith('--')){process.stderr.write('Invalid or duplicate native binding option: '+flag+'\n');return 2;}
      values[flag]=arguments_[++index];
    }
    if(['--contract','--target','--output','--clang'].some(flag=>!values[flag])){process.stderr.write('Native header validation requires --contract, --target, --output and --clang. No tool is installed automatically.\n');return 2;}
    try{bindNativeHeader({header:arguments_[2],contract:values['--contract'],target:values['--target'],output:values['--output'],clang:values['--clang'],flags:boundary<0?[]:argv.slice(boundary+1)});process.stdout.write('Checked native declarations written to '+resolve(values['--output'])+'\n');return 0;}
    catch(error){process.stderr.write(failureMessage(error)+'\n');return 1;}
  }
  if (command === 'add') {
    const aliasIndex = argv.indexOf('--as'), projectIndex = argv.indexOf('--project');
    if (!argv[1] || argv[1].startsWith('--') || aliasIndex >= 0 && !argv[aliasIndex + 1]) {
      process.stderr.write('Use aug add URL [--as NAME] [--project DIRECTORY] [--offline]\n'); return 2;
    }
    for (let index = 2; index < argv.length; index++) {
      if (['--as', '--project'].includes(argv[index])) { if (!argv[++index] || argv[index].startsWith('--')) return 2; }
      else if (argv[index] !== '--offline') { process.stderr.write('Unknown add option: ' + argv[index] + '\n'); return 2; }
    }
    try {
      const root = resolve(projectIndex < 0 ? process.cwd() : argv[projectIndex + 1]);
      const explicitAlias = aliasIndex < 0 ? undefined : argv[aliasIndex + 1];
      const lock = await addPackageWithNative(root, argv[1], explicitAlias, argv.includes('--offline'));
      const alias = explicitAlias ?? suggestedPackageAlias(root, argv[1]);
      process.stdout.write(`Added ${alias}; installed ${lock.packages.length} source package(s).\nImport public names with: import NAME from ${alias}\n`); return 0;
    } catch (error) { process.stderr.write(failureMessage(error) + '\n'); return 1; }
  }
  if (command === 'init' || command === 'package' && argv[1] === 'init') {
    const library = command === 'package', pathIndex = library ? 2 : 1;
    const usage = library ? 'Use aug package init DIRECTORY [--name @owner/name]' : 'Use aug init DIRECTORY [--template hello|weather]';
    const sourceOptions = ' [--block-style indent|braces] [--indentation spaces|tabs] [--assignment equals|to]';
    let style: SourceStyle, template: 'hello'|'weather' = 'hello', name: string | undefined;
    const nativeValues = new Map<string,string>();
    try {
      if (!argv[pathIndex] || argv[pathIndex].startsWith('-')) throw new Error('Missing project directory.');
      const values = new Map<string,string>(), nativeFlags = ['--native','--repository','--artifact-url','--license','--clang','--ar'], allowed = ['--block-style','--indentation','--assignment',library ? '--name' : '--template',...(library?nativeFlags:[])];
      for (let index = pathIndex + 1; index < argv.length; index += 2) {
        const option = argv[index], value = argv[index+1];
        if (!allowed.includes(option)) throw new Error('Unknown init option: ' + option);
        if (values.has(option)) throw new Error('Duplicate init option: ' + option);
        if (!value || value.startsWith('-')) throw new Error('Missing value for ' + option);
        values.set(option,value);
      }
      style = sourceStyle(Object.fromEntries([...values].filter(([key])=>['--block-style','--indentation','--assignment'].includes(key))
        .map(([key,value])=>[key.slice(2).replace('-','_'),value])));
      const requested = values.get('--template') ?? 'hello';
      if (!['hello','weather'].includes(requested)) throw new Error('Unknown template: ' + requested);
      template = requested as 'hello'|'weather'; name = values.get('--name');
      for(const flag of nativeFlags)if(values.has(flag))nativeValues.set(flag,values.get(flag)!);
      if(nativeValues.size){
        if(nativeValues.get('--native')!=='c')throw new Error('Use --native c for the initial native starter.');
        for(const flag of ['--name',...nativeFlags])if(!values.has(flag))throw new Error('Native initialization requires '+flag+'. It builds only with explicitly selected maintainer tools.');
      }
    } catch (error) { process.stderr.write(failureMessage(error) + '\n' + usage + sourceOptions + '\n'); return 2; }
    try {
      const root = resolve(argv[pathIndex]);
      if (library) {
        name ??= root.split(/[\\/]/).at(-1)!;
        if(nativeValues.size){
          const report=initNativePackage(root,{name,repository:nativeValues.get('--repository')!,artifactURL:nativeValues.get('--artifact-url')!,license:nativeValues.get('--license')!,clang:nativeValues.get('--clang')!,ar:nativeValues.get('--ar')!,preferences:style});
          process.stdout.write('Built native artifact '+report.artifact+' at '+report.archive+'\nNative execution and publication have not run. See the generated README for local caching and LLVM tests.\n');
        }else initPackage(root,name,!!name && argv.includes('--name'),style);
        process.stdout.write(`Created August library ${name} in ${root}\n`);
      } else {
        initProject(root,template,style);
        process.stdout.write(`Created August application in ${root}\nNext: cd ${argv[pathIndex]}\n      aug run\n`);
      }
      return 0;
    } catch (error) { process.stderr.write(failureMessage(error) + '\n'); return 1; }
  }
  if (command === 'install' || command === 'package') {
    try {
      const root = resolve((command === 'install' ? argv[1] : argv[2]) && !(command === 'install' ? argv[1] : argv[2]).startsWith('--')
        ? (command === 'install' ? argv[1] : argv[2]) : process.cwd());
      if (command === 'install') {
        const lock = await installPackagesWithNative(root, argv.includes('--frozen'), argv.includes('--offline'), argv.includes('--update'));
        process.stdout.write(`Installed ${lock.packages.length} August package(s); aug.lock.json is current.\n`);
      } else if (argv[1] === 'pack') {
        await prepareRunPackagesWithNative(root);
        preparePackage(root);
        const project = loadProject(root), checked = checkProject(project);
        const tests = checkUnitTests(project, discoverTests(project).tests);
        const diagnostics = uniqueDiagnostics([...checked.diagnostics, ...tests.flatMap(test => test.checked.diagnostics)]);
        if (diagnostics.some(issue => issue.severity !== 'warning')) { printDiagnostics(diagnostics, argv.includes('--json'), root); return 1; }
        mergeTestAnalysis(checked,tests);
        updateSpecs(checked);
        process.stdout.write(packPackage(root) + '\n');
      } else throw new Error('Use aug package init or aug package pack');
      return 0;
    } catch (error) { process.stderr.write(failureMessage(error) + '\n'); return 1; }
  }
  if (command === 'lsp') return runLanguageServer(resolve(argv[1] ?? process.cwd()));
  if (!['check', 'build', 'bundle', 'run', 'emit-c', 'emit-llvm', 'emit-ir', 'test', 'openapi', 'format', 'migrate', 'spec', 'bench', 'explain', 'context', 'symbols', 'definition',
    'complete', 'hover', 'fixes', 'semantic-tokens', 'references', 'graph'].includes(command)) {
    process.stderr.write(`Unknown command ${command}\n`); usage(); return 2;
  }
  const separator = argv.indexOf('--');
  const options = separator >= 0 ? argv.slice(1, separator) : argv.slice(1);
  const programArgs = separator >= 0 ? argv.slice(separator + 1) : [];
  if (options.includes('--help')) { usage(); return 0; }
  const valueOptions = new Set(['--mode','--expected-revision','--backend','--out', '--stdin-file', '--file', '--name', '--offset', '--budget', '--baseline', '--group', '--case', '--timeout', '--iterations', '--warmup']);
  const booleanOptions = new Set(['--json', '--coverage', '--list', '--write', '--check', '--offline', '--frozen', '--require-complete', '--progress','--rebuild']);
  for (let index = 0; index < options.length; index++) {
    const option = options[index];
    if (valueOptions.has(option)) {
      if (!options[index + 1] || options[index + 1].startsWith('--')) { process.stderr.write(`${option} needs a value. See aug ${command} --help.\n`); return 2; }
      index++;
    } else if (option.startsWith('-') && !booleanOptions.has(option)) {
      process.stderr.write(`Unknown option ${option}. See aug ${command} --help. To pass an option to your program, put it after --.\n`); return 2;
    }
  }
  if(options.includes('--require-complete')&&command!=='context')throw new Error('--require-complete is only valid for aug context');
  if(options.includes('--rebuild')&&(command!=='test'||options.filter(arg=>arg==='--rebuild').length!==1)) {
    process.stderr.write('--rebuild is valid once for aug test.\n');return 2;
  }
  const json = options.includes('--json');
  const backendIndex=options.indexOf('--backend');let backend=backendIndex<0?'llvm':options[backendIndex+1];
  if(!['c','llvm'].includes(backend)){process.stderr.write('--backend must be c or llvm\n');return 2;}
  const outIndex = options.indexOf('--out');
  const outputOption = outIndex >= 0 ? options[outIndex + 1] : undefined;
  const stdinIndex = options.indexOf('--stdin-file');
  const stdinFile = stdinIndex >= 0 ? options[stdinIndex + 1] : undefined;
  const fileIndex = options.indexOf('--file');
  const sourceFile = fileIndex >= 0 ? options[fileIndex + 1] : undefined;
  const nameIndex = options.indexOf('--name');
  const symbolName = nameIndex >= 0 ? options[nameIndex + 1] : undefined;
  const offsetIndex = options.indexOf('--offset');
  const offsetText = offsetIndex >= 0 ? options[offsetIndex + 1] : undefined;
  const modeIndex=options.indexOf('--mode'),contextMode=modeIndex<0?undefined:options[modeIndex+1];
  if(contextMode!==undefined&&(command!=='context'||options.filter(arg=>arg==='--mode').length!==1||!contextModes.includes(contextMode as ContextMode))) {process.stderr.write('--mode is valid once for aug context: implementation, interface-change or review.\n');return 2;}
  const budgetIndex = options.indexOf('--budget');
  const budget = budgetIndex >= 0 ? Number(options[budgetIndex + 1]) : undefined;
  const baselineIndex = options.indexOf('--baseline');
  const baselinePath = baselineIndex >= 0 ? options[baselineIndex + 1] : undefined;
  const groupIndex = options.indexOf('--group');
  const groupOption = groupIndex >= 0 ? options[groupIndex + 1] : undefined;
  const caseIndices = options.flatMap((option, index) => option === '--case' ? [index] : []);
  const caseNames = caseIndices.map(index => options[index + 1]);
  const revisionIndex=options.indexOf('--expected-revision'),expectedRevision=revisionIndex<0?undefined:options[revisionIndex+1];
  if(expectedRevision!==undefined&&(command!=='test'||!/^[a-f0-9]{64}$/.test(expectedRevision)||options.filter(arg=>arg==='--expected-revision').length!==1)) {
    process.stderr.write('--expected-revision accepts one SHA-256 source revision for aug test.\n');return 2;
  }
  const timeoutIndex = options.indexOf('--timeout');
  const timeout = timeoutIndex >= 0 ? Number(options[timeoutIndex + 1]) : 10000;
  const iterationsIndex = options.indexOf('--iterations'), warmupIndex = options.indexOf('--warmup');
  const iterations = iterationsIndex >= 0 ? Number(options[iterationsIndex + 1]) : 10;
  const warmup = warmupIndex >= 0 ? Number(options[warmupIndex + 1]) : 2;
  const positionals = options.filter((arg, i) => !arg.startsWith('--') &&
    (backendIndex < 0 || i !== backendIndex + 1) &&
    (outIndex < 0 || i !== outIndex + 1) &&
    (stdinIndex < 0 || i !== stdinIndex + 1) &&
    (fileIndex < 0 || i !== fileIndex + 1) &&
    (nameIndex < 0 || i !== nameIndex + 1) &&
    (offsetIndex < 0 || i !== offsetIndex + 1) &&
    (modeIndex < 0 || i !== modeIndex + 1) &&
    (budgetIndex < 0 || i !== budgetIndex + 1) &&
    (baselineIndex < 0 || i !== baselineIndex + 1) &&
    (groupIndex < 0 || i !== groupIndex + 1) &&
    !caseIndices.some(index => i === index + 1) &&
    (revisionIndex < 0 || i !== revisionIndex + 1) &&
    (timeoutIndex < 0 || i !== timeoutIndex + 1) &&
    (iterationsIndex < 0 || i !== iterationsIndex + 1) && (warmupIndex < 0 || i !== warmupIndex + 1));
  const firstIsDirectory = positionals[0] && existsSync(positionals[0]) && statSync(positionals[0]).isDirectory();
  const projectArg = command === 'test' ? firstIsDirectory ? positionals[0] : undefined : positionals[0];
  const group = groupOption ?? (command === 'test' ? positionals[firstIsDirectory ? 1 : 0] : undefined);
  const root = resolve(projectArg ?? process.cwd());
  const buildCommand=['run','build','bundle','bench'].includes(command);
  if(options.includes('--progress')&&!buildCommand){process.stderr.write('--progress applies to run, build, bundle and bench.\n');return 2;}
  const progress=new BuildProgress(buildCommand&&(options.includes('--progress')||!!process.stderr.isTTY&&!json));
  try {
    if(command==='bundle') {
      if(!outputOption)throw new Error('BUNDLE_OPTIONS: Use aug bundle PROJECT --out DIRECTORY.');
      if(existsSync(resolve(outputOption)))throw new Error('BUNDLE_OUTPUT: Destination already exists: '+resolve(outputOption)+'. Choose a new directory.');
    }
    if(buildCommand)progress.start('source resolution');
    const overrides = stdinFile ? new Map([[resolve(stdinFile), readFileSync(0, 'utf8')]]) : undefined;
    if (['complete', 'hover', 'fixes', 'semantic-tokens', 'references', 'graph'].includes(command)) {
      if (!sourceFile) throw new Error(`${command} requires --file`);
      const workspace = new SemanticWorkspace(root);
      const document = workspace.document(sourceFile, overrides?.has(resolve(sourceFile)) ? { text: overrides.get(resolve(sourceFile))!, version: 1 } : undefined,['references','graph'].includes(command));
      const offset = Number(offsetText);
      if (['complete', 'hover', 'references'].includes(command) && (offsetText === undefined || !Number.isInteger(offset) || offset < 0))
        throw new Error(`${command} requires a nonnegative --offset`);
      const result = command === 'complete' ? document.complete(offset) : command === 'hover' ? document.hover(offset) ?? null :
        command === 'references' ? {revision:document.graph().revision,coverage:document.graph().coverage,occurrences:document.references(offset)} : command === 'graph' ? document.graph() : command === 'fixes' ? document.fixes() : document.tokens();
      process.stdout.write(JSON.stringify(result) + '\n'); return 0;
    }
    if (!existsSync(root) || !statSync(root).isDirectory())
      throw new Error(`Project directory does not exist: ${root}\nUse aug init DIRECTORY to create a project, or run aug run from the folder containing main.aug.`);
    if (command === 'run'||command==='bundle') await prepareRunPackagesWithNative(root, options.includes('--offline'), options.includes('--frozen'),()=>progress.start('native artifacts'));
    const configurationAtLoad=command==='test'?semanticConfiguration(root):undefined;
    const project = loadProject(root, overrides);
    if(buildCommand)progress.start('checking');
    if(backendIndex<0)backend=project.config.backend??'llvm';
    if (project.library && ['build', 'bundle', 'run', 'bench', 'openapi'].includes(command))
      throw new Error('This is an August library; use check, test, or package pack. Import its exports from an application with main.aug to run it.');
    if (command === 'format' || command === 'migrate') {
      const files = (sourceFile ? [project.files.get(resolve(sourceFile))].filter(file => !!file) : [...project.files.values()])
        .filter(file => !file.builtin && !file.package);
      if (!files.length) throw new Error('No source files to format');
      const formatted = files.map(file => ({ file: file.path, text: (command==='migrate'?migrateFile:formatFile)(project, file) }));
      if (options.includes('--write')) formatted.forEach(file => writeFileSync(file.file, file.text));
      else process.stdout.write(json ? JSON.stringify(formatted) + '\n' : formatted.map(file => file.text).join('\n'));
      return 0;
    }
    const discovered = discoverTests(project);
    if (command === 'test') {
      if (groupIndex >= 0 && (!groupOption || groupOption.startsWith('--'))) throw new Error('--group needs a group name');
      if (!Number.isInteger(timeout) || timeout < 1) throw new Error('--timeout needs a positive number of milliseconds');
      if (caseNames.some(name => !name || name.startsWith('--'))) throw new Error('--case needs a test id from --list');
      const selected = discovered.tests.filter(unit => (group === undefined || unit.group.name === group) &&
        (!caseNames.length || caseNames.includes(unit.id)));
      const missingCase = caseNames.find(name => !discovered.tests.some(unit => unit.id === name));
      if (missingCase) throw new Error(`No test named ${missingCase}`);
      const checks = checkUnitTests(project, selected);
      const diagnostics = uniqueDiagnostics([...project.diagnostics, ...discovered.diagnostics,
        ...checks.flatMap(entry => entry.checked.diagnostics)]);
      if (diagnostics.some(issue => issue.severity !== 'warning')) { printDiagnostics(diagnostics, json, root); return 1; }
      if (!selected.length) throw new Error(group ? `No test group named ${group}` : 'No tests found in this project');
      if (options.includes('--list')) {
        process.stdout.write(json ? JSON.stringify(selected.map(unit => ({ id: unit.id, type: typeName(unit.suite.type), group: unit.group.name,
          name: unit.test.name, row: unit.rowIndex, file: unit.file, line: unit.test.span.line }))) + '\n' :
          selected.map(unit => unit.id).join('\n') + '\n');
        return 0;
      }
      const sourceRevision=semanticGraph(checks[0].checked,true,undefined,configurationAtLoad).revision;
      if(expectedRevision!==undefined&&(sourceRevision!==expectedRevision||JSON.stringify(semanticConfiguration(root))!==JSON.stringify(configurationAtLoad))) {
        const error='TEST_REVISION: Loaded source/configuration differs from the expected revision. Review and rerun; no native cases ran.';
        process.stdout.write(json?JSON.stringify({sourceRevision,expectedRevision,passed:0,failed:0,tests:[],error})+'\n':error+'\n');return 1;
      }
      const results: { id: string; group: string; name: string; passed: boolean; stdout: string; stderr: string }[] = [];
      const coverage = options.includes('--coverage'), reports: string[] = [];
      const nativeInputs=backend==='llvm'?await prepareNativePackages(root,{offline:options.includes('--offline'),frozen:options.includes('--frozen')}):undefined;
      const toolchain=backend==='llvm'?await prepareLLVMCompiler(options.includes('--offline'),{root,frozen:options.includes('--frozen')}):undefined;
      for (const [index, { unit, checked: testChecked }] of checks.entries()) {
        let native;
        if(backend==='llvm')native=compileLLVM(testChecked,{testIndex:index,coverage,native:nativeInputs,toolchain,rebuild:options.includes('--rebuild')});
        else{const generated = generateC(testChecked, { coverage });
          await prepareNativeDependencies(generated, { offline: options.includes('--offline') });
          native = compileNative(root, generated, { testIndex: index, checked: testChecked });}
        const report = join(root, '.aug-build', 'tests', `coverage-${index}.tsv`); reports.push(report);
        if (coverage) rmSync(report, { force: true });
        const run = native.status === 0 ? spawnSync(native.output, [], { encoding: 'utf8', cwd: root, timeout,
          killSignal: 'SIGKILL', env: { ...process.env, AUG_COVERAGE_FILE: coverage ? report : '' } }) : undefined;
        const result = { id: unit.id, group: unit.group.name, name: unit.test.name,
          passed: native.status === 0 && run?.status === 0,
          compilation:'compilation' in native?native.compilation:{cache:'disabled',reason:'The C reference backend compiles every case'},
          stdout: run?.stdout ?? '', stderr: native.error || (run?.error && 'code' in run.error && run.error.code === 'ETIMEDOUT' ?
            `Test exceeded ${timeout}ms\n${run.stderr ?? ''}` : run?.error?.message || run?.stderr || '') };
        results.push(result);
        if (!json) {
          process.stdout.write(`[${result.passed ? 'PASS' : 'FAIL'}] ${relative(root, unit.file)} › ${typeName(unit.suite.type)} › ${unit.group.name} › ${unit.test.name}\n`);
          if (result.stdout) process.stdout.write(result.stdout);
          if (result.stderr) process.stderr.write(result.stderr);
        }
      }
      const passed = results.filter(result => result.passed).length;
      const failed = results.length - passed;
      const report = coverage ? writeCoverage(root, reports) : undefined;
      process.stdout.write(json ? JSON.stringify({ passed, failed, tests: results, coverage: report, sourceRevision, execution:{backend,compilerPackSha256:toolchain?.archiveSha256,developmentOverride:toolchain?.developmentOverride??false} }) + '\n' :
        `${passed} passed, ${failed} failed\n` + (report ? `Coverage: ${report.covered}/${report.executable} statement lines (${report.percent.toFixed(1)}%); ${report.path}\n` : ''));
      return failed ? 1 : 0;
    }
    let checked = checkProject(project);
    const testChecks = checkUnitTests(project, discovered.tests);
    checked.diagnostics = uniqueDiagnostics([...checked.diagnostics, ...discovered.diagnostics,
      ...testChecks.flatMap(entry => entry.checked.diagnostics)]);
    mergeTestAnalysis(checked, testChecks);
    if (command === 'openapi') {
      const result = generateOpenApi(checked);
      const diagnostics = uniqueDiagnostics([...checked.diagnostics,...result.diagnostics]);
      if (diagnostics.some(issue => issue.severity !== 'warning')) {printDiagnostics(diagnostics,false,root); return 1;}
      process.stdout.write(JSON.stringify(result.document,null,2) + '\n'); return 0;
    }
    if (command === 'explain' || command === 'context') {
      if (budget !== undefined && (!Number.isInteger(budget) || budget < 512 || budget > 100000)) throw new Error('--budget must be an integer from 512 to 100000');
      if(command==='context'&&baselinePath)throw new Error('--baseline compares aug explain reports; context packets are revision-bearing snapshots.');
      const baseline = baselinePath ? JSON.parse(readFileSync(baselinePath, 'utf8')) : undefined;
      const result = describe(checked, sourceFile ?? join(root, 'main.aug'), { name: symbolName, budget, mode:contextMode as ContextMode,context: command === 'context', baseline });
      process.stdout.write(JSON.stringify(result, null, command==='context'||json ? undefined : 2) + '\n');
      return command==='context'&&'schema' in result&&(result.status==='budget-insufficient'||options.includes('--require-complete')&&!hasRequiredContext(result))?1:0;
    }
    if (command === 'definition') {
      if (!sourceFile || (!symbolName && offsetText === undefined))
        throw new Error('definition requires --file and --offset or --name');
      const offset = Number(offsetText);
      if (offsetText !== undefined && (!Number.isInteger(offset) || offset < 0))
        throw new Error('definition requires a nonnegative --offset');
      let found;
      if (offsetText !== undefined) found = recordBindingDefinition(checked,sourceFile,offset)??definitionAt(project, sourceFile, offset);
      else {
        const def = project.scopes.get(resolve(sourceFile))?.get(symbolName!);
        found = def && { name: def.name, file: def.file, line: def.node.span.line,
          column: def.node.span.column, kind: def.node.kind };
      }
      process.stdout.write(JSON.stringify(found ?? null) + '\n');
      return found ? 0 : 1;
    }
    if (command === 'symbols') {
      const symbols = [...project.definitions.values()].map(def => ({ name: def.name,
        file: def.file, line: def.node.span.line, column: def.node.span.column,
        kind: def.node.kind }));
      process.stdout.write(JSON.stringify(symbols) + '\n');
      return checked.diagnostics.some(issue => issue.severity !== 'warning') ? 1 : 0;
    }
    const hasErrors=checked.diagnostics.some(issue => issue.severity !== 'warning');
    printDiagnostics(checked.diagnostics, json && (command === 'check' || command === 'spec' && hasErrors), root);
    if (hasErrors) {progress.fail();return 1;}
    if (command === 'check') {
      if (!json) process.stdout.write('AugScript check passed\n');
      return 0;
    }
    if(command==='spec') {
      const result=updateSpecs(checked,options.includes('--check'));
      process.stdout.write(json?JSON.stringify(result)+'\n':result.stale.length?'Stale specifications:\n'+result.stale.map(file=>'  '+file).join('\n')+'\n':`${result.files} specification artifact(s) ${options.includes('--check')?'are current':'generated'}.\n`);
      return result.stale.length?1:0;
    }
    if(['build','bundle','run','bench'].includes(command)&&!options.includes('--frozen')) {
      checked=updateSpecHints(checked);
      if(checked.diagnostics.some(issue=>issue.severity!=='warning')) {printDiagnostics(checked.diagnostics,json,root);progress.fail();return 1;}
    }
    if(command==='emit-llvm'){process.stdout.write(generateLLVM(lowerToIR(checked)));return 0;}
    if(command==='emit-ir'){process.stdout.write(JSON.stringify(lowerToIR(checked),null,2)+'\n');return 0;}
    if((backend==='c'||command==='emit-c')&&checked.native.resources.size+checked.native.functions.size)
      throw new Error('NATIVE_BACKEND: Checked native packages require --backend llvm. The C reference backend cannot lower this native ABI.');
    if(command==='emit-c'){process.stdout.write(generateC(checked));return 0;}
    if (command === 'bench' && (!Number.isInteger(iterations) || iterations < 1 || iterations > 1000 ||
      !Number.isInteger(warmup) || warmup < 0 || warmup > 100 || !Number.isInteger(timeout) || timeout < 1))
      throw new Error('bench requires iterations 1–1000, warmup 0–100, and a positive timeout');
    if(command==='bundle') {
      if(backend!=='llvm'||!outputOption)throw new Error('BUNDLE_OPTIONS: Use aug bundle PROJECT --out DIRECTORY with the LLVM backend.');
      progress.start('native artifacts');
      const inputs=await prepareNativePackages(root,{offline:options.includes('--offline'),frozen:options.includes('--frozen')});
      progress.start('compiler pack');
      const toolchain=await prepareLLVMCompiler(options.includes('--offline'),{root,frozen:options.includes('--frozen')});
      if(!options.includes('--frozen')) {progress.start('specifications');updateSpecs(checked);}
      const report=buildBundle(checked,outputOption,{native:inputs,toolchain,onPhase:phase=>progress.start(phase)});
      progress.complete();
      process.stdout.write(json?JSON.stringify(report)+'\n':`Deployment bundle: ${report.directory}\nRun ${report.executable} with its adjacent lib and share folders.\n`);return 0;
    }
    let native;
    if(backend==='llvm'){
      progress.start('native artifacts');
      const inputs=await prepareNativePackages(root,{offline:options.includes('--offline'),frozen:options.includes('--frozen')});
      progress.start('compiler pack');
      const toolchain=await prepareLLVMCompiler(options.includes('--offline'),{root,frozen:options.includes('--frozen')});
      native=compileLLVM(checked,{output:outputOption,release:command==='bench'||project.config.optimization==='release',native:inputs,toolchain,onPhase:phase=>progress.start(phase)});
    }else{
      progress.start('lowering');
      const generated=generateC(checked);
      progress.start('runtime components');
      await prepareNativeDependencies(generated, { offline: options.includes('--offline') });
      progress.start('native compilation');
      native = compileNative(root, generated, { output: outputOption, release: command === 'bench' ? true : undefined, checked });
    }
    const output = native.output;
    if (native.status !== 0) {
      progress.fail();
      if (native.diagnostics.length) printDiagnostics(native.diagnostics, json, root);
      else process.stderr.write(native.error + '\n'); return native.status;
    }
    progress.start('specifications');
    if(!options.includes('--frozen'))updateSpecs(checked);
    progress.complete();
    if (command === 'build') {
      process.stdout.write(json ? JSON.stringify({ output, sourceMap: output + '.augmap.json' }) + '\n' : `${output}\n`);
      return 0;
    }
    if (command === 'bench') {
      progress.start('execution');
      const report = benchmark(output, root, iterations, warmup, programArgs, timeout);
      progress.complete();
      process.stdout.write(json ? JSON.stringify(report) + '\n' : `Median ${report.median.toFixed(3)}ms; p95 ${report.p95.toFixed(3)}ms (${iterations} native runs, including process startup)\n`);
      return 0;
    }
    progress.start('execution');
    const run = spawnSync(output, programArgs, { stdio: 'inherit', cwd: root });
    if (run.error) throw new Error(`Cannot start the compiled program ${output}: ${run.error.message}.\nCheck executable permissions and the native shared-library paths.`);
    if (run.signal) process.stderr.write(`Program stopped by ${run.signal}. Check the runtime message above; aug run compiled and started ${output}.\n`);
    else if (run.status !== 0) process.stderr.write(`Program exited with status ${run.status}.\n`);
    if(run.status===0)progress.complete();else progress.fail();
    return run.status ?? 1;
  } catch (error) {
    progress.fail();
    if(error instanceof BackendUnsupported||error instanceof IRVerificationError){printDiagnostics([{...error.span,code:error.code,message:error.message}],json,root);return 1;}
    process.stderr.write(failureMessage(error) + '\n');
    return error instanceof Error && 'exitCode' in error && typeof error.exitCode === 'number' ? error.exitCode : 1;
  }
}
