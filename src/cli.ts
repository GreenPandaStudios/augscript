import {buildBundle,verifyBundle} from './bundle.ts';
import {BuildProgress} from './progress.ts';
import {hasRequiredContext} from './context.ts';
import {dependencyReport,packageReadiness,packageInterfaceDiff} from './package-inspection.ts';
import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { Diagnostic } from './ast.ts';
import { typeName } from './ast.ts';
import { checkProject } from './checker.ts';
import { generateC } from './codegen.ts';
import {generateLLVM} from './llvm.ts';
import {lowerToIR,BackendUnsupported} from './ir.ts';
import {IRVerificationError} from './ir-verify.ts';
import {compileLLVM} from './llvm-native.ts';
import {prepareNativePackages} from './native-artifacts.ts';
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
  for (const issue of diagnostics) {
    const file = relative(root, issue.file) || issue.file;
    process.stderr.write(`${file}:${issue.line}:${issue.column}: ${issue.code}: ${issue.message}\n`);
    try {
      if (!sources.has(issue.file)) sources.set(issue.file, readFileSync(issue.file, 'utf8').split(/\r?\n/));
      const line = sources.get(issue.file)?.[issue.line - 1];
      if (line !== undefined) {
        const column = Math.max(0, Math.min(line.length, issue.column - 1));
        const start = Math.max(0, column - 70), end = Math.min(line.length, start + 150);
        const text = (start ? '…' : '') + line.slice(start, end).replace(/\t/g, '    ') + (end < line.length ? '…' : '');
        const padding = (start ? 1 : 0) + line.slice(start, column).replace(/\t/g, '    ').length;
        process.stderr.write(`  ${issue.line} | ${text}\n  ${' '.repeat(String(issue.line).length)} | ${' '.repeat(padding)}^\n`);
      }
    } catch { /* Source may have been removed; the location and help remain useful. */ }
    if (diagnosticHelp[issue.code]) process.stderr.write(`  help: ${diagnosticHelp[issue.code]}\n`);
  }
}

function usage(): void {
  process.stdout.write(`AugScript compiler\n\n` +
    `Usage: aug <init|doctor|check|build|bundle|run|emit-c|emit-llvm|emit-ir|test|openapi|format|migrate|spec|bench|explain|context|lsp|symbols|definition|references|graph|complete|hover|fixes|semantic-tokens> [project directory] [options] [-- args]\n` +
    `Inspect dependencies: aug dependencies [PROJECT] [--json]\n` +
    `Package readiness/diff: aug package check DIRECTORY [--json]; aug package diff BEFORE AFTER [--json]\n` +
    `New application: aug init DIRECTORY [--template hello|weather]\n` +
    `Diagnose setup: aug doctor [project directory] [--json] — check without downloading or writing files\n` +
    `Run: aug run [project directory] [--offline] [--progress] [-- args] — prepare dependencies, compile, and start\n` +
    `Deployment: aug bundle PROJECT --out DIRECTORY [--offline] [--frozen]; aug bundle verify DIRECTORY [--json]\n` +
    `Backend: LLVM is the default on macOS 14+ ARM64 and GNU/Linux x64/ARM64 with glibc 2.36+. August installs its compiler pack; no separate native toolchain is needed. --backend c selects the migration reference.\n` +
    `Tests: aug test [project directory] [GROUP_NAME] [--group GROUP_NAME] [--list] [--coverage] [--json] [--timeout milliseconds]\n` +
    `Format: aug format [project directory] [--file path] [--write]\n` +
    `Specifications: aug spec [project directory] [--check] [--json]\n` +
    `Migration: aug migrate [project directory] [--file path] [--write]\n` +
    `Context: aug context [project directory] [--file path] [--name declaration] [--budget characters] [--require-complete]\n` +
    `References: aug references [project directory] --file path --offset character; aug graph [project directory] --file path\n` +
    `Benchmark: aug bench [project directory] [--iterations 10] [--warmup 2] [--json] [-- args]\n` +
    `Packages: aug package init DIRECTORY --name @owner/name; aug package pack DIRECTORY\n` +
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
        for(const change of report.changes)process.stdout.write(`${change.name}:\n${JSON.stringify({before:change.before,after:change.after},null,2)}\n`);
        if(JSON.stringify(report.native.before)!==JSON.stringify(report.native.after))process.stdout.write('Native requirements changed; inspect --json for the complete target and artifact delta.\n');
        if(!report.changes.length)process.stdout.write('No public declaration changes.\n');
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
      process.stdout.write(report.ready?'Prerequisites checked. Uncached artifacts still require an online first run.\n':'Resolve the errors above, then retry aug doctor.\n');
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
  if (command === 'init') {
    const template = argv.length === 2 ? 'hello' : argv[2] === '--template' && argv.length === 4 ? argv[3] : undefined;
    if (!argv[1] || argv[1].startsWith('--') || !['hello', 'weather'].includes(template ?? '')) {
      process.stderr.write('Use aug init DIRECTORY [--template hello|weather]\n'); return 2;
    }
    try {
      const root = initProject(argv[1], template as 'hello' | 'weather');
      process.stdout.write(`Created August application in ${root}\nNext: cd ${argv[1]}\n      aug run\n`);
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
      } else if (argv[1] === 'init') {
        const name = argv.includes('--name') ? argv[argv.indexOf('--name') + 1] : root.split(/[\\/]/).at(-1)!;
        if (!name) throw new Error('Use aug package init DIRECTORY [--name @owner/name]');
        initPackage(root, name, argv.includes('--name')); process.stdout.write(`Created August library ${name} in ${root}\n`);
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
  const valueOptions = new Set(['--backend','--out', '--stdin-file', '--file', '--name', '--offset', '--budget', '--baseline', '--group', '--case', '--timeout', '--iterations', '--warmup']);
  const booleanOptions = new Set(['--json', '--coverage', '--list', '--write', '--check', '--offline', '--frozen', '--require-complete', '--progress']);
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
  const budgetIndex = options.indexOf('--budget');
  const budget = budgetIndex >= 0 ? Number(options[budgetIndex + 1]) : undefined;
  const baselineIndex = options.indexOf('--baseline');
  const baselinePath = baselineIndex >= 0 ? options[baselineIndex + 1] : undefined;
  const groupIndex = options.indexOf('--group');
  const groupOption = groupIndex >= 0 ? options[groupIndex + 1] : undefined;
  const caseIndices = options.flatMap((option, index) => option === '--case' ? [index] : []);
  const caseNames = caseIndices.map(index => options[index + 1]);
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
    (budgetIndex < 0 || i !== budgetIndex + 1) &&
    (baselineIndex < 0 || i !== baselineIndex + 1) &&
    (groupIndex < 0 || i !== groupIndex + 1) &&
    !caseIndices.some(index => i === index + 1) &&
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
      const results: { id: string; group: string; name: string; passed: boolean; stdout: string; stderr: string }[] = [];
      const coverage = options.includes('--coverage'), reports: string[] = [];
      const nativeInputs=backend==='llvm'?await prepareNativePackages(root,{offline:options.includes('--offline'),frozen:options.includes('--frozen')}):undefined;
      const toolchain=backend==='llvm'?await prepareLLVMCompiler(options.includes('--offline'),{root,frozen:options.includes('--frozen')}):undefined;
      for (const [index, { unit, checked: testChecked }] of checks.entries()) {
        let native;
        if(backend==='llvm')native=compileLLVM(testChecked,{testIndex:index,coverage,native:nativeInputs,toolchain});
        else{const generated = generateC(testChecked, { coverage });
          await prepareNativeDependencies(generated, { offline: options.includes('--offline') });
          native = compileNative(root, generated, { testIndex: index, checked: testChecked });}
        const report = join(root, '.aug-build', 'tests', `coverage-${index}.tsv`); reports.push(report);
        if (coverage) rmSync(report, { force: true });
        const run = native.status === 0 ? spawnSync(native.output, [], { encoding: 'utf8', cwd: root, timeout,
          killSignal: 'SIGKILL', env: { ...process.env, AUG_COVERAGE_FILE: coverage ? report : '' } }) : undefined;
        const result = { id: unit.id, group: unit.group.name, name: unit.test.name,
          passed: native.status === 0 && run?.status === 0,
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
      process.stdout.write(json ? JSON.stringify({ passed, failed, tests: results, coverage: report }) + '\n' :
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
      const result = describe(checked, sourceFile ?? join(root, 'main.aug'), { name: symbolName, budget, context: command === 'context', baseline });
      process.stdout.write(JSON.stringify(result, null, command==='context'||json ? undefined : 2) + '\n');
      return command==='context'&&options.includes('--require-complete')&&('schema' in result&&!hasRequiredContext(result))?1:0;
    }
    if (command === 'definition') {
      if (!sourceFile || (!symbolName && offsetText === undefined))
        throw new Error('definition requires --file and --offset or --name');
      const offset = Number(offsetText);
      if (offsetText !== undefined && (!Number.isInteger(offset) || offset < 0))
        throw new Error('definition requires a nonnegative --offset');
      let found;
      if (offsetText !== undefined) found = definitionAt(project, sourceFile, offset);
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
