/* VS Code adapter for the compiler's native test discovery and runner. */
const path = require('node:path');

function activateTesting(vscode, context, projectRoot, runCompiler) {
  const controller = vscode.tests.createTestController('augscript.tests', 'AugScript');
  const metadata = new Map();
  const pending = new Map();
  context.subscriptions.push(controller, { dispose() {
    for (const timer of pending.values()) clearTimeout(timer);
  } });

  async function refreshRoot(root) {
    if (!root) return;
    const result = await runCompiler(context, ['test', root, '--list', '--json']);
    let listed;
    try { listed = JSON.parse(result.stdout); } catch { listed = []; }
    if (result.code !== 0) {
      if (/No tests found/.test(result.stderr)) { controller.items.delete(root); return; }
      const item = controller.items.get(root) ?? controller.createTestItem(root, path.basename(root));
      item.error = result.stderr || listed.map(issue => `${issue.file}:${issue.line}: ${issue.message}`).join('\n');
      controller.items.add(item);
      return;
    }
    for (const [id, entry] of metadata) if (entry.root === root) metadata.delete(id);
    const project = controller.createTestItem(root, path.basename(root));
    const suites = new Map();
    const groups = new Map();
    for (const test of listed) {
      const uri = vscode.Uri.file(test.file);
      const suiteId = `${root}:${test.file}:${test.type}`;
      let suite = suites.get(suiteId);
      if (!suite) {
        suite = controller.createTestItem(suiteId, test.type, uri);
        suite.description = path.relative(root, test.file);
        suites.set(suiteId, suite);
        project.children.add(suite);
      }
      const groupId = `${suiteId}:${test.group}`;
      let group = groups.get(groupId);
      if (!group) {
        group = controller.createTestItem(groupId, test.group, uri);
        groups.set(groupId, group);
        suite.children.add(group);
      }
      const item = controller.createTestItem(`${root}:${test.id}`, test.row === undefined ? test.name : `${test.name} [${test.row + 1}]`, uri);
      item.range = new vscode.Range(Math.max(0, test.line - 1), 0, Math.max(0, test.line - 1), 0);
      metadata.set(item.id, { root, testId: test.id });
      group.children.add(item);
    }
    controller.items.add(project);
  }

  async function refreshWorkspace() {
    const files = await vscode.workspace.findFiles('**/*.aug', '**/{node_modules,.aug-build,compiler}/**');
    const roots = new Set(files.map(uri => projectRoot(uri.fsPath)).filter(Boolean));
    controller.items.forEach(item => { if (!roots.has(item.id)) controller.items.delete(item.id); });
    for (const root of roots) await refreshRoot(root);
  }
  controller.resolveHandler = () => refreshWorkspace();
  controller.refreshHandler = () => refreshWorkspace();
  context.subscriptions.push(vscode.commands.registerCommand('augscript.refreshTests', refreshWorkspace));

  function schedule(uri) {
    if (!uri.fsPath.endsWith('.aug')) return;
    const root = projectRoot(uri.fsPath);
    if (!root) return;
    clearTimeout(pending.get(root));
    pending.set(root, setTimeout(() => {
      pending.delete(root);
      refreshRoot(root).catch(error => {
        const item = controller.items.get(root);
        if (item) item.error = error.message;
      });
    }, 300));
  }
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(document => schedule(document.uri)));
  context.subscriptions.push(vscode.workspace.onDidCreateFiles(event => event.files.forEach(schedule)));
  context.subscriptions.push(vscode.workspace.onDidDeleteFiles(event => event.files.forEach(schedule)));

  const details = new WeakMap();
  const execute = coverage => async (request, token) => {
    await vscode.workspace.saveAll(false);
    const run = controller.createTestRun(request);
    const selected = new Map();
    const excluded = new Set((request.exclude ?? []).map(item => item.id));
    const collect = item => {
      if (excluded.has(item.id)) return;
      if (metadata.has(item.id)) selected.set(item.id, item);
      else item.children.forEach(collect);
    };
    if (request.include) request.include.forEach(collect);
    else controller.items.forEach(collect);
    selected.forEach(item => run.enqueued(item));
    const coveredFiles = new Map();
    try {
      for (const item of selected.values()) {
        if (token.isCancellationRequested) { run.skipped(item); continue; }
        run.started(item);
        const entry = metadata.get(item.id);
        const start = Date.now();
        try {
          const result = await runCompiler(context, ['test', entry.root, '--case', entry.testId, '--json', ...(coverage ? ['--coverage'] : [])]);
          const data = JSON.parse(result.stdout);
          if (coverage && data.coverage && vscode.FileCoverage && run.addCoverage) for (const file of data.coverage.files) {
            const lines = coveredFiles.get(file.file) ?? new Map();
            for (const line of file.lines) lines.set(line.line, (lines.get(line.line) ?? 0) + line.count);
            coveredFiles.set(file.file, lines);
          }
          const test = data.tests?.[0];
          if (!test) {
            const message = result.stderr || (Array.isArray(data) ?
              data.map(issue => `${issue.file}:${issue.line}: ${issue.message}`).join('\n') : result.stdout);
            run.errored(item, new vscode.TestMessage(message || 'Test could not be compiled.'));
            continue;
          }
          if (test.stdout || test.stderr) run.appendOutput((test.stdout + test.stderr).replace(/\r?\n/g, '\r\n'), undefined, item);
          if (test.passed) run.passed(item, Date.now() - start);
          else {
            const message = new vscode.TestMessage(test.stderr || 'Test failed.');
            const location = /^(.*\.aug):(\d+): assertion failed:/m.exec(test.stderr);
            if (location) message.location = new vscode.Location(vscode.Uri.file(location[1]),
              new vscode.Position(Math.max(0, Number(location[2]) - 1), 0));
            run.failed(item, message, Date.now() - start);
          }
        } catch (error) { run.errored(item, new vscode.TestMessage(error.message)); }
      }
    } finally {
      for (const [file, counts] of coveredFiles) {
        const lines = [...counts].sort(([left], [right]) => left - right).map(([line, count]) => ({ line, count }));
        const report = new vscode.FileCoverage(vscode.Uri.file(file), { covered: lines.filter(line => line.count > 0).length, total: lines.length });
        details.set(report, lines); run.addCoverage(report);
      }
      run.end();
    }
  };
  controller.createRunProfile('Native tests', vscode.TestRunProfileKind.Run, execute(false), true);
  if (vscode.TestRunProfileKind.Coverage !== undefined) {
    const profile = controller.createRunProfile('Native coverage', vscode.TestRunProfileKind.Coverage, execute(true), true);
    profile.loadDetailedCoverage = async (_run, file) => (details.get(file) ?? []).map(line =>
      new vscode.StatementCoverage(line.count, new vscode.Position(line.line - 1, 0)));
  }
  refreshWorkspace().catch(() => { /* Discovery can be retried from Test Explorer. */ });
}

module.exports = { activateTesting };
