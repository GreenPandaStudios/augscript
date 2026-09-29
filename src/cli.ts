import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { Diagnostic } from './ast.ts';
import { typeName } from './ast.ts';
import { checkProject } from './checker.ts';
import { generateC } from './codegen.ts';
import { diagnosticHelp } from './help.ts';
import { loadProject } from './project.ts';
import { definitionAt } from './navigation.ts';
import { checkUnitTests, discoverTests, mergeTestAnalysis, uniqueDiagnostics } from './testing.ts';
import { describe, SemanticWorkspace } from './semantic.ts';
import { formatFile } from './formatter.ts';
import { runLanguageServer } from './lsp.ts';
import { benchmark, compileNative, writeCoverage } from './native.ts';
import {generateOpenApi} from './openapi.ts';
import { initPackage, installPackages, preparePackage, packPackage } from './package-manager.ts';

function printDiagnostics(diagnostics: Diagnostic[], json: boolean, root: string): void {
  if (json) {
    process.stdout.write(JSON.stringify(diagnostics.map(issue => ({ ...issue,
      help: diagnosticHelp[issue.code] }))) + '\n');
    return;
  }
  for (const issue of diagnostics) {
    const file = issue.file.startsWith(root) ? issue.file.slice(root.length + 1) : issue.file;
    process.stderr.write(`${file}:${issue.line}:${issue.column}: ${issue.code}: ${issue.message}\n`);
  }
}

function usage(): void {
  process.stdout.write(`AugScript compiler\n\n` +
    `Usage: aug <check|build|run|emit-c|test|openapi|format|bench|explain|context|lsp|symbols|definition|complete|hover|fixes|semantic-tokens> [project directory] [options] [-- args]\n` +
    `Tests: aug test [project directory] [GROUP_NAME] [--group GROUP_NAME] [--list] [--coverage] [--json] [--timeout milliseconds]\n` +
    `Format: aug format [project directory] [--file path] [--write]\n` +
    `Context: aug context [project directory] [--file path] [--name declaration] [--budget characters]\n` +
    `Benchmark: aug bench [project directory] [--iterations 10] [--warmup 2] [--json] [-- args]\n` +
    `Packages: aug package init DIRECTORY --name @owner/name; aug package pack DIRECTORY\n` +
    `Dependencies: aug install [project directory] [--frozen] [--offline]\n` +
    `Entry point: main.aug at the project root.\n`);
}

export async function main(argv: string[]): Promise<number> {
  const command = argv[0];
  if (command === '--version' || command === 'version') {
    process.stdout.write(JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version + '\n');
    return 0;
  }
  if (!command || command === '--help' || command === 'help') { usage(); return 0; }
  if (command === 'install' || command === 'package') {
    try {
      const root = resolve((command === 'install' ? argv[1] : argv[2]) && !(command === 'install' ? argv[1] : argv[2]).startsWith('--')
        ? (command === 'install' ? argv[1] : argv[2]) : process.cwd());
      if (command === 'install') {
        const lock = installPackages(root, argv.includes('--frozen'), argv.includes('--offline'));
        process.stdout.write(`Installed ${lock.packages.length} August package(s); aug.lock.json is current.\n`);
      } else if (argv[1] === 'init') {
        const name = argv[argv.indexOf('--name') + 1];
        if (!argv.includes('--name') || !name) throw new Error('Use aug package init DIRECTORY --name @owner/name');
        initPackage(root, name); process.stdout.write(`Created August library ${name} in ${root}\n`);
      } else if (argv[1] === 'pack') {
        preparePackage(root);
        const project = loadProject(root), checked = checkProject(project);
        const tests = checkUnitTests(project, discoverTests(project).tests);
        const diagnostics = uniqueDiagnostics([...checked.diagnostics, ...tests.flatMap(test => test.checked.diagnostics)]);
        if (diagnostics.some(issue => issue.severity !== 'warning')) { printDiagnostics(diagnostics, argv.includes('--json'), root); return 1; }
        process.stdout.write(packPackage(root) + '\n');
      } else throw new Error('Use aug package init or aug package pack');
      return 0;
    } catch (error) { process.stderr.write((error as Error).message + '\n'); return 1; }
  }
  if (command === 'lsp') return runLanguageServer(resolve(argv[1] ?? process.cwd()));
  if (!['check', 'build', 'run', 'emit-c', 'test', 'openapi', 'format', 'bench', 'explain', 'context', 'symbols', 'definition',
    'complete', 'hover', 'fixes', 'semantic-tokens'].includes(command)) {
    process.stderr.write(`Unknown command ${command}\n`); usage(); return 2;
  }
  const separator = argv.indexOf('--');
  const options = separator >= 0 ? argv.slice(1, separator) : argv.slice(1);
  const programArgs = separator >= 0 ? argv.slice(separator + 1) : [];
  const json = options.includes('--json');
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
  try {
    const overrides = stdinFile ? new Map([[resolve(stdinFile), readFileSync(0, 'utf8')]]) : undefined;
    if (['complete', 'hover', 'fixes', 'semantic-tokens'].includes(command)) {
      if (!sourceFile) throw new Error(`${command} requires --file`);
      const workspace = new SemanticWorkspace(root);
      const document = workspace.document(sourceFile, overrides?.has(resolve(sourceFile)) ? { text: overrides.get(resolve(sourceFile))!, version: 1 } : undefined);
      const offset = Number(offsetText);
      if (['complete', 'hover'].includes(command) && (offsetText === undefined || !Number.isInteger(offset) || offset < 0))
        throw new Error(`${command} requires a nonnegative --offset`);
      const result = command === 'complete' ? document.complete(offset) : command === 'hover' ? document.hover(offset) ?? null :
        command === 'fixes' ? document.fixes() : document.tokens();
      process.stdout.write(JSON.stringify(result) + '\n'); return 0;
    }
    const project = loadProject(root, overrides);
    if (project.library && ['build', 'run', 'bench', 'openapi'].includes(command))
      throw new Error('This is an August library; use check, test, or package pack. Import its exports from an application with main.aug to run it.');
    if (command === 'format') {
      const files = (sourceFile ? [project.files.get(resolve(sourceFile))].filter(file => !!file) : [...project.files.values()])
        .filter(file => !file.builtin && !file.package);
      if (!files.length) throw new Error('No source files to format');
      const formatted = files.map(file => ({ file: file.path, text: formatFile(project, file) }));
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
      for (const [index, { unit, checked: testChecked }] of checks.entries()) {
        const native = compileNative(root, generateC(testChecked, { coverage }), { testIndex: index, checked: testChecked });
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
    const checked = checkProject(project);
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
      const baseline = baselinePath ? JSON.parse(readFileSync(baselinePath, 'utf8')) : undefined;
      const result = describe(checked, sourceFile ?? join(root, 'main.aug'), { name: symbolName, budget, context: command === 'context', baseline });
      process.stdout.write(JSON.stringify(result, null, json ? undefined : 2) + '\n'); return 0;
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
    printDiagnostics(checked.diagnostics, json && command === 'check', root);
    if (checked.diagnostics.some(issue => issue.severity !== 'warning')) return 1;
    if (command === 'check') {
      if (!json) process.stdout.write('AugScript check passed\n');
      return 0;
    }
    const generated = generateC(checked);
    if (command === 'emit-c') { process.stdout.write(generated); return 0; }
    if (command === 'bench' && (!Number.isInteger(iterations) || iterations < 1 || iterations > 1000 ||
      !Number.isInteger(warmup) || warmup < 0 || warmup > 100 || !Number.isInteger(timeout) || timeout < 1))
      throw new Error('bench requires iterations 1–1000, warmup 0–100, and a positive timeout');
    const native = compileNative(root, generated, { output: outputOption, release: command === 'bench' ? true : undefined, checked });
    const output = native.output;
    if (native.status !== 0) {
      if (native.diagnostics.length) printDiagnostics(native.diagnostics, json, root);
      else process.stderr.write(native.error + '\n'); return native.status;
    }
    if (command === 'build') {
      process.stdout.write(json ? JSON.stringify({ output, sourceMap: output + '.augmap.json' }) + '\n' : `${output}\n`);
      return 0;
    }
    if (command === 'bench') {
      const report = benchmark(output, root, iterations, warmup, programArgs, timeout);
      process.stdout.write(json ? JSON.stringify(report) + '\n' : `Median ${report.median.toFixed(3)}ms; p95 ${report.p95.toFixed(3)}ms (${iterations} native runs, including process startup)\n`);
      return 0;
    }
    const run = spawnSync(output, programArgs, { stdio: 'inherit', cwd: root });
    if (run.error) throw run.error;
    return run.status ?? 1;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}
