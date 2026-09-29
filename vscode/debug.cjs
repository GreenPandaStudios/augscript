const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function findAdapter(vscode) {
  const configured = vscode.workspace.getConfiguration('augscript').get('lldbDapPath', '');
  if (configured) return configured;
  for (const name of ['lldb-dap', 'lldb-vscode']) {
    for (const directory of (process.env.PATH ?? '').split(path.delimiter)) {
      const candidate = path.join(directory, name + (process.platform === 'win32' ? '.exe' : ''));
      if (fs.existsSync(candidate)) return candidate;
    }
    if (process.platform === 'darwin') {
      const result = spawnSync('xcrun', ['--find', name], { encoding: 'utf8' });
      if (result.status === 0) return result.stdout.trim();
    }
  }
}

function activateDebugging(vscode, context, projectRoot, runCompiler) {
  context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('augscript', {
    provideDebugConfigurations() { return [{ name: 'Debug AugScript', type: 'augscript', request: 'launch' }]; },
    async resolveDebugConfiguration(folder, config) {
      const root = config.project ?? (vscode.window.activeTextEditor ? projectRoot(vscode.window.activeTextEditor.document.uri.fsPath) : folder?.uri.fsPath);
      if (!root) { vscode.window.showErrorMessage('Open an AugScript project to debug.'); return; }
      const adapter = findAdapter(vscode);
      if (!adapter) {
        vscode.window.showErrorMessage('Install LLVM lldb-dap and set augscript.lldbDapPath, or use AugScript: Debug in LLDB Terminal.'); return;
      }
      await vscode.workspace.saveAll(false);
      const result = await runCompiler(context, ['build', root, '--json']);
      if (result.code !== 0) { vscode.window.showErrorMessage(result.stderr || result.stdout); return; }
      const build = JSON.parse(result.stdout);
      return { ...config, type: 'augscript', request: 'launch', name: config.name ?? 'Debug AugScript',
        program: build.output, cwd: root, args: config.args ?? [], stopOnEntry: config.stopOnEntry ?? false,
        augAdapter: adapter, console: config.console ?? 'integratedTerminal' };
    },
  }));
  context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('augscript', {
    createDebugAdapterDescriptor(session) { return new vscode.DebugAdapterExecutable(session.configuration.augAdapter, []); },
  }));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.debugTerminal', async () => {
    const editor = vscode.window.activeTextEditor;
    const root = editor && projectRoot(editor.document.uri.fsPath);
    if (!root) return;
    await vscode.workspace.saveAll(false);
    const result = await runCompiler(context, ['build', root, '--json']);
    if (result.code !== 0) { vscode.window.showErrorMessage(result.stderr || result.stdout); return; }
    const output = JSON.parse(result.stdout).output;
    const terminal = vscode.window.createTerminal({ name: 'AugScript LLDB', cwd: root, shellPath: 'lldb', shellArgs: [output] });
    terminal.show();
  }));
}
module.exports = { activateDebugging };
