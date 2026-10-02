const vscode = require('vscode');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { Server } = require('./server.cjs');
const { activateDebugging } = require('./debug.cjs');

const diagnostics = vscode.languages.createDiagnosticCollection('augscript');
const timers = new Map();
const lastFiles = new Map();
const servers = new Map();

function projectRoot(file) {
  const snapshot = file.split(path.sep + '.aug-packages' + path.sep)[0];
  if (snapshot !== file && (fs.existsSync(path.join(snapshot, 'main.aug')) || fs.existsSync(path.join(snapshot, 'aug-package.json')))) return snapshot;
  let folder = path.dirname(file);
  while (true) {
    if (fs.existsSync(path.join(folder, 'main.aug')) || fs.existsSync(path.join(folder, 'aug-package.json'))) return folder;
    const parent = path.dirname(folder);
    if (parent === folder) return vscode.workspace.getWorkspaceFolder(vscode.Uri.file(file))?.uri.fsPath ?? path.dirname(file);
    folder = parent;
  }
}

function compilerPath(context) {
  const configured = vscode.workspace.getConfiguration('augscript').get('compilerPath');
  if (configured) return settingPath(configured);
  const bundled = path.join(context.extensionPath, 'compiler', 'bin', 'aug.mjs');
  if (fs.existsSync(bundled)) return bundled;
  const development = path.resolve(context.extensionPath, '..', 'bin', 'aug.mjs');
  return fs.existsSync(development) ? development : 'aug';
}

function settingPath(value) {
  const folder=vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  return path.resolve(folder?value.replaceAll('${workspaceFolder}',folder):value);
}

function invocation(context, args) {
  const compiler = compilerPath(context);
  const nativeHome = vscode.workspace.getConfiguration('augscript').get('nativeHome');
  const env = nativeHome ? { ...global.process.env, AUG_NATIVE_HOME:settingPath(nativeHome) } : global.process.env;
  if (compiler.endsWith('.mjs')) {
    const node = vscode.workspace.getConfiguration('augscript').get('nodePath') || 'node';
    return { command: node, args: [compiler, ...args], env };
  }
  return { command: compiler, args, env };
}

function runCompiler(context, args, input) {
  return new Promise((resolve, reject) => {
    const command = invocation(context, args);
    const process = spawn(command.command, command.args, { env:command.env, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    process.stdout.setEncoding('utf8');
    process.stderr.setEncoding('utf8');
    process.stdout.on('data', chunk => { stdout += chunk; });
    process.stderr.on('data', chunk => { stderr += chunk; });
    process.on('error', reject);
    process.on('close', code => resolve({ code, stdout, stderr }));
    process.stdin.end(input ?? '');
  });
}

function server(context, root) {
  if (!servers.has(root)) {
    const connection = new Server(invocation(context, ['lsp', root]), message => {
      const document = vscode.workspace.textDocuments.find(document => document.uri.toString() === message.uri);
      if (document && message.version !== undefined && document.version !== message.version) return;
      diagnostics.set(vscode.Uri.parse(message.uri), message.diagnostics.map(issue => {
        const range = new vscode.Range(issue.range.start.line, issue.range.start.character, issue.range.end.line, issue.range.end.character);
        const diagnostic = new vscode.Diagnostic(range, issue.message, issue.severity === 2 ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error);
        diagnostic.code = issue.code; diagnostic.source = 'AugScript';
        if (issue.data?.help) diagnostic.relatedInformation = [new vscode.DiagnosticRelatedInformation(new vscode.Location(vscode.Uri.parse(message.uri), range), issue.data.help)];
        return diagnostic;
      }));
    }, () => { if (servers.get(root) === connection) servers.delete(root); });
    servers.set(root, connection);
    for (const document of vscode.workspace.textDocuments) if (document.languageId === 'augscript' && projectRoot(document.uri.fsPath) === root) connection.sync(document);
  }
  return servers.get(root);
}

async function refresh(context, document) {
  if (document.languageId !== 'augscript' || document.uri.scheme !== 'file') return;
  const root = projectRoot(document.uri.fsPath);
  if (!root) return;
  try {
    const version = document.version;
    const issues = await editorData(context, document, 'diagnostics');
    if (document.version !== version) return;
    const grouped = new Map();
    for (const issue of issues) {
      const file = path.resolve(issue.file);
      const range = new vscode.Range(Math.max(0, issue.line - 1), Math.max(0, issue.column - 1),
        Math.max(0, issue.line - 1), Math.max(0, issue.column));
      const diagnostic = new vscode.Diagnostic(range, issue.message, issue.severity === 'warning' ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error);
      diagnostic.code = issue.code;
      diagnostic.source = 'AugScript';
      diagnostic.codeDescription = { href: vscode.Uri.file(path.join(context.extensionPath,
        'compiler', 'docs', 'diagnostics.md')) };
      if (issue.help) diagnostic.relatedInformation = [new vscode.DiagnosticRelatedInformation(
        new vscode.Location(vscode.Uri.file(file), range), issue.help)];
      if (!grouped.has(file)) grouped.set(file, []);
      grouped.get(file).push(diagnostic);
    }
    for (const old of lastFiles.get(document.uri.toString()) ?? []) if (!grouped.has(old))
      diagnostics.set(vscode.Uri.file(old), []);
    for (const [file, list] of grouped) diagnostics.set(vscode.Uri.file(file), list);
    lastFiles.set(document.uri.toString(), new Set(grouped.keys()));
  } catch (error) {
    vscode.window.showErrorMessage(`AugScript compiler: ${error.message}`);
  }
}

function scheduleRefresh(context, document) {
  const key = document.uri.toString();
  clearTimeout(timers.get(key));
  timers.set(key, setTimeout(() => {
    timers.delete(key);
    refresh(context, document);
  }, 250));
}

async function definition(context, document, position) {
  const root = projectRoot(document.uri.fsPath);
  if (!root) return undefined;
  const found = await editorData(context, document, 'definition', document.offsetAt(position));
  if (!found) return undefined;
  return new vscode.Location(vscode.Uri.file(found.file),
    new vscode.Position(Math.max(0, found.line - 1), Math.max(0, found.column - 1)));
}

async function editorData(context, document, command, offset, options) {
  if (document.uri.scheme !== 'file') return [];
  const root = projectRoot(document.uri.fsPath);
  if (!root) return [];
  return server(context, root).query(document, command, offset, options);
}

const completionKinds = {
  class: vscode.CompletionItemKind.Class,
  interface: vscode.CompletionItemKind.Interface,
  interceptor: vscode.CompletionItemKind.Class,
  function: vscode.CompletionItemKind.Function,
  method: vscode.CompletionItemKind.Method,
  property: vscode.CompletionItemKind.Property,
  variable: vscode.CompletionItemKind.Variable,
  parameter: vscode.CompletionItemKind.Variable,
  keyword: vscode.CompletionItemKind.Keyword,
  type: vscode.CompletionItemKind.TypeParameter,
  snippet: vscode.CompletionItemKind.Snippet,
};

async function complete(context, document, position) {
  try {
    const data = await editorData(context, document, 'complete', document.offsetAt(position));
    return data.map(entry => {
      const item = new vscode.CompletionItem(entry.label,
        completionKinds[entry.kind] ?? vscode.CompletionItemKind.Text);
      item.detail = entry.detail;
      if (entry.documentation) item.documentation = new vscode.MarkdownString(entry.documentation);
      if (entry.insertText) item.insertText = new vscode.SnippetString(entry.insertText);
      if (entry.replacement) item.range = new vscode.Range(document.positionAt(entry.replacement.start), document.positionAt(entry.replacement.end));
      item.sortText = entry.sortText;
      if (entry.additionalEdits) item.additionalTextEdits = entry.additionalEdits.map(edit =>
        vscode.TextEdit.replace(new vscode.Range(document.positionAt(edit.start), document.positionAt(edit.end)), edit.text));
      if (['function', 'method', 'class'].includes(entry.kind)) item.command = { command: 'editor.action.triggerParameterHints', title: 'Show labeled inputs' };
      return item;
    });
  } catch { return []; }
}

async function hover(context, document, position) {
  try {
    const entry = await editorData(context, document, 'hover', document.offsetAt(position));
    if (!entry) return undefined;
    const markdown = new vscode.MarkdownString();
    markdown.appendCodeblock(entry.detail, 'augscript');
    if (entry.documentation) markdown.appendMarkdown(`\n${entry.documentation}`);
    return new vscode.Hover(markdown,
      new vscode.Range(document.positionAt(entry.start), document.positionAt(entry.end)));
  } catch { return undefined; }
}

async function codeActions(context, document, actionContext) {
  try {
    const fixes = await editorData(context, document, 'fixes');
    if (!Array.isArray(fixes)) return [];
    const actions = [];
    for (const fix of fixes) {
      const diagnostic = actionContext.diagnostics.find(issue =>
        issue.code === fix.issue.code && issue.message === fix.issue.message &&
        issue.range.start.line === fix.issue.line - 1 &&
        issue.range.start.character === fix.issue.column - 1);
      if (!diagnostic && fix.title !== 'Expand to named imports') continue;
      const action = new vscode.CodeAction(fix.title, diagnostic ? vscode.CodeActionKind.QuickFix : vscode.CodeActionKind.RefactorRewrite);
      action.diagnostics = diagnostic ? [diagnostic] : [];
      action.isPreferred = !!fix.preferred;
      action.edit = new vscode.WorkspaceEdit();
      for (const edit of fix.edits) {
        const target = path.resolve(edit.file) === document.uri.fsPath ? document : await vscode.workspace.openTextDocument(edit.file);
        action.edit.replace(target.uri,
          new vscode.Range(target.positionAt(edit.start), target.positionAt(edit.end)), edit.text);
      }
      actions.push(action);
    }
    for (const issue of actionContext.diagnostics) {
      if (issue.source !== 'AugScript') continue;
      if (issue.code === 'PACKAGE') {
        const install = new vscode.CodeAction('Install project source packages', vscode.CodeActionKind.QuickFix);
        install.diagnostics = [issue];
        install.command = {title:install.title,command:'augscript.installPackages'};
        actions.push(install);
      }
      const action = new vscode.CodeAction(`Explain ${issue.code} error`, vscode.CodeActionKind.QuickFix);
      action.diagnostics = [issue];
      action.command = { title: action.title, command: 'augscript.explainDiagnostic',
        arguments: [issue.message, issue.relatedInformation?.[0]?.message] };
      actions.push(action);
    }
    return actions;
  } catch { return []; }
}

async function openGuide(context, file) {
  const uri = vscode.Uri.file(path.join(context.extensionPath, 'compiler', 'docs', file));
  try { await vscode.commands.executeCommand('markdown.showPreview', uri); }
  catch { await vscode.window.showTextDocument(uri); }
}

async function showContext(context, includeSource) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'augscript') return;
  try {
    const data = await editorData(context, editor.document, 'describe', 0, { context: includeSource, budget: 24000 });
    const document = await vscode.workspace.openTextDocument({ language: 'json', content: JSON.stringify(data, null, 2) });
    await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.Beside, preview: true });
  } catch (error) { vscode.window.showErrorMessage(error.message); }
}

const yamlHelp = {
  backend: 'LLVM is the default on qualified hosts. August downloads its verified compiler/runtime pack. Choose c only for the temporary C reference workflow; checked native ABI packages require LLVM.',
  spec: 'Deterministic specifications are generated beside source files during successful builds. aug spec regenerates them; aug spec --check checks for drift.',
  'spec.require_comments': 'Require Javadoc on none (default), public declarations, or all declarations. Existing interface documentation can be inherited. Missing required comments are compiler errors.',
  assignment: 'Canonical assignments: `equals` or `to`. Both forms are accepted by the language.',
  block_style: 'Formatter block style: `braces` or `indent`. A colon starts an indented block.',
  indentation: 'Formatter indentation: `spaces` (four) or `tabs`. Mixed prefixes are compiler errors.',
  lint: 'List optional warnings: wildcard_imports, public_helpers, public_docs, broad_errors, discarded_errors, architecture.',
  strict_modules: 'When true, sibling imports must be listed in the folder export.aug.',
  module_dependencies: 'List allowed module edges, for example "domain: contracts, shared". Import cycles are always rejected.',
  packages: 'Map import aliases to a public repository URL, local folder, archive, or exact npm version. Run aug install and commit aug.lock.json.',
  max_public_symbols: 'Positive public-surface threshold used by the public_helpers warning. Default 12.',
  max_dependencies: 'Positive import fan-out threshold used by the architecture warning. Default 8.',
  output: 'Name of the executable built under `.aug-build`. An absolute path is also accepted.',
  optimization: 'Choose `debug` for `-O0` (the default) or `release` for `-O2`.',
  libraries: 'C reference backend only: libraries passed to its linker with -l. LLVM native dependencies belong in package manifests.',
  library_paths: 'C reference backend only: linker search paths relative to the project root. LLVM uses locked package artifacts.',
  web: 'Native HTTP transport configuration. Defaults to the loopback interface with bounded bodies and responses.',
  'web.host': 'Listening interface. Default `127.0.0.1`; choose an explicit address to expose a service.',
  'web.body_limit': 'Maximum buffered request body, from 1 to 67108864 bytes. Default 1048576. Excess returns 413.',
  'web.response_limit': 'Maximum buffered response or endpoint-test stream collection. Default 4194304 bytes.',
  'web.http3': 'Enable HTTP/3 over QUIC. Default false. Requires a TLS certificate and private key.',
  'web.tls': 'TLS certificate configuration. Paths are relative to the project root.',
  'web.tls.certificate': 'PEM certificate chain. Must be paired with private_key.',
  'web.tls.private_key': 'PEM private key for the listening service.',
  'web.tls.ca': 'Optional trusted CA file for outbound HTTPS. Peer verification is always enabled.',
  openapi: 'Generate and serve OpenAPI 3.2.1 for selected endpoints, with Javadoc descriptions and an API explorer.',
  'openapi.enabled': 'Enable OpenAPI generation and serving. Default false. Undocumentable contracts are compiler errors.',
  'openapi.title': 'API title. Default August API.',
  'openapi.version': 'API version. Default 0.1.0.',
  'openapi.path': 'Schema route. Default /openapi.json. Must differ from the docs route.',
  'openapi.docs': 'API explorer route. Default /docs.',
  'openapi.output': 'Generated JSON path relative to the project. Default .aug-build/openapi.json.',
};

const yamlSelector = { scheme: 'file', pattern: '**/main.yaml' };

function yamlPath(document, lineNumber, indentation) {
  const parents=[];
  for(let line=0;line<lineNumber;line++) {
    const text=document.lineAt(line).text, entry=/^(\s*)([a-z_][a-z_0-9]*):\s*(?:#.*)?$/.exec(text);
    if(!text.trim()||text.trim().startsWith('#'))continue;
    const depth=text.length-text.trimStart().length;
    while(parents.length&&parents.at(-1).depth>=depth)parents.pop();
    if(entry)parents.push({name:entry[2],depth});
  }
  return parents.filter(parent=>parent.depth<indentation).map(parent=>parent.name).join('.');
}

function yamlHover(document, position) {
  if (!projectRoot(document.uri.fsPath)) return undefined;
  const line = document.lineAt(position.line).text;
  const match = /^\s*([a-z_]+)\s*:/.exec(line);
  if (!match) return undefined;
  const parent=yamlPath(document,position.line,line.length-line.trimStart().length);
  const key=parent ? `${parent}.${match[1]}` : match[1];
  if (!yamlHelp[key]) return undefined;
  const start = line.indexOf(match[1]);
  if (start <= position.character && position.character < start + match[1].length)
    return new vscode.Hover(new vscode.MarkdownString(yamlHelp[key]),
      new vscode.Range(position.line, start, position.line, start + match[1].length));
  if (match[1] === 'optimization') {
    const value = /\b(debug|release)\b/.exec(line.slice(match[0].length));
    if (value) {
      const valueStart = match[0].length + (value.index ?? 0);
      if (valueStart <= position.character && position.character < valueStart + value[1].length)
        return new vscode.Hover(new vscode.MarkdownString(value[1] === 'debug' ?
          'Compile with `-O0` for faster builds and straightforward debugging.' :
          'Compile with `-O2` for optimized native output.'),
        new vscode.Range(position.line, valueStart, position.line, valueStart + value[1].length));
    }
  }
  return undefined;
}

function yamlCompletions(document, position) {
  if (!projectRoot(document.uri.fsPath)) return [];
  const prefix = document.lineAt(position.line).text.slice(0, position.character);
  if(/^\s*require_comments:\s*\w*$/.test(prefix))return ['none','public','all'].map(value=>new vscode.CompletionItem(value,vscode.CompletionItemKind.Value));
  if (/^\s*optimization:\s*\w*$/.test(prefix)) return ['debug', 'release'].map(value => {
    const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
    item.documentation = new vscode.MarkdownString(value === 'debug' ?
      'Compile with `-O0` for faster builds.' : 'Compile with `-O2` for optimized output.');
    return item;
  });
  if (!/^\s*[A-Za-z_]*$/.test(prefix)) return [];
  const parent=yamlPath(document,position.line,prefix.length-prefix.trimStart().length);
  return Object.entries(yamlHelp).filter(([key])=>key.slice(0,key.lastIndexOf('.')<0?0:key.lastIndexOf('.'))===parent).map(([path, help]) => {
    const key=path.split('.').at(-1);
    const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Property);
    item.insertText = new vscode.SnippetString(
      ['libraries', 'library_paths', 'lint', 'module_dependencies'].includes(key) ? `${key}:\n  - $0` : ['web','web.tls','openapi','spec'].includes(path) ? `${key}:\n  $0` : `${key}: $0`);
    item.documentation = new vscode.MarkdownString(help);
    return item;
  });
}

function activeCall(source, offset) {
  const text = source.slice(0, offset);
  const opens = [];
  let quote = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === '\\') i++;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === '(') opens.push(i);
    else if (char === ')') opens.pop();
  }
  const open = opens.at(-1);
  if (open === undefined) return undefined;
  const name = /([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?)(?:<[^<>]*>)?\s*$/.exec(text.slice(0, open))?.[1];
  if (!name) return undefined;
  let parameter = 0;
  let depth = 0;
  quote = '';
  for (let i = open + 1; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === '\\') i++;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === ',' && depth === 0) parameter++;
  }
  const label = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?:=|to\b)/.exec(text.slice(open + 1).split(',').at(-1) ?? '')?.[1];
  return { name: name.split('.').at(-1), open, parameter, label };
}

async function signatureHelp(context, document, position) {
  const call = activeCall(document.getText(), document.offsetAt(position));
  if (!call) return undefined;
  try {
    const entries = await editorData(context, document, 'complete', call.open);
    const entry = entries.find(item => item.label === call.name && item.signature);
    if (!entry) return undefined;
    const signature = new vscode.SignatureInformation(entry.signature,
      entry.documentation ? new vscode.MarkdownString(entry.documentation) : undefined);
    signature.parameters = (entry.parameters ?? []).map((label, index) =>
      new vscode.ParameterInformation(label, entry.parameterDocumentation?.[index] ?
        new vscode.MarkdownString(entry.parameterDocumentation[index]) : undefined));
    const help = new vscode.SignatureHelp();
    help.signatures = [signature];
    help.activeSignature = 0;
    const labeled = call.label ? signature.parameters.findIndex(parameter =>
      parameter.label.startsWith(`${call.label}=`)) : -1;
    help.activeParameter = labeled >= 0 ? labeled :
      Math.min(call.parameter, Math.max(0, signature.parameters.length - 1));
    return help;
  } catch { return undefined; }
}

const semanticTypes = ['class', 'interface', 'function', 'method', 'property',
  'variable', 'parameter', 'typeParameter', 'type', 'decorator'];
const semanticLegend = new vscode.SemanticTokensLegend(semanticTypes, ['declaration']);

async function semanticTokens(context, document) {
  const builder = new vscode.SemanticTokensBuilder(semanticLegend);
  try {
    const tokens = await editorData(context, document, 'semantic-tokens');
    for (const token of tokens) {
      const index = semanticTypes.indexOf(token.type);
      if (index >= 0) builder.push(token.line, token.start, token.length, index,
        token.declaration ? 1 : 0);
    }
  } catch { /* Grammar highlighting still works if the compiler is unavailable. */ }
  return builder.build();
}

async function inlayHints(context, document, range, token) {
  if (!vscode.workspace.getConfiguration('augscript', document.uri).get('inferredContractHints', true)) return [];
  try {
    const hints = await editorData(context, document, 'inlay-hints', 0,
      {start: document.offsetAt(range.start), end: document.offsetAt(range.end)});
    if (token.isCancellationRequested) return [];
    return hints.map(item => {
      const hint = new vscode.InlayHint(document.positionAt(item.offset), item.label, vscode.InlayHintKind.Type);
      hint.paddingLeft = true;
      hint.tooltip = new vscode.MarkdownString(item.tooltip);
      return hint;
    });
  } catch { return []; }
}

async function executeProject(context, command) {
  const document = vscode.window.activeTextEditor?.document;
  const root = document && projectRoot(document.uri.fsPath);
  if (!root) { vscode.window.showErrorMessage('Open an AugScript file inside a project with main.aug.'); return; }
  await document.save();
  const invocationInfo = invocation(context, [command, root]);
  const task = new vscode.Task({ type: 'augscript', task: command }, vscode.TaskScope.Workspace,
    `AugScript: ${command}`, 'AugScript',
    new vscode.ProcessExecution(invocationInfo.command, invocationInfo.args, {env:invocationInfo.env}));
  task.presentationOptions = { reveal: vscode.TaskRevealKind.Always, panel: vscode.TaskPanelKind.Dedicated };
  await vscode.tasks.executeTask(task);
}

function activate(context) {
  activateDebugging(vscode, context, projectRoot, runCompiler);
  require('./testing.cjs').activateTesting(vscode, context, projectRoot, runCompiler);
  context.subscriptions.push(diagnostics);
  context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event=>{
    if(!['augscript.compilerPath','augscript.nodePath','augscript.nativeHome'].some(key=>event.affectsConfiguration(key)))return;
    for(const connection of servers.values())connection.dispose();servers.clear();
    for(const document of vscode.workspace.textDocuments)scheduleRefresh(context,document);
  }));
  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => scheduleRefresh(context, doc)));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => scheduleRefresh(context, event.document)));
  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(doc => scheduleRefresh(context, doc)));
  context.subscriptions.push(vscode.workspace.onDidCloseTextDocument(doc => {
    clearTimeout(timers.get(doc.uri.toString()));
    timers.delete(doc.uri.toString());
    servers.get(projectRoot(doc.uri.fsPath))?.close(doc);
  }));
  context.subscriptions.push(vscode.languages.registerDefinitionProvider('augscript', {
    provideDefinition: (document, position) => definition(context, document, position),
  }));
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider('augscript', {
    provideCompletionItems: (document, position) => complete(context, document, position),
  }, '.', '[', '(', ',', '='));
  context.subscriptions.push(vscode.languages.registerHoverProvider('augscript', {
    provideHover: (document, position) => hover(context, document, position),
  }));
  const hintChanges = new vscode.EventEmitter();
  context.subscriptions.push(hintChanges,
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('augscript.inferredContractHints')) hintChanges.fire();
    }),
    vscode.languages.registerInlayHintsProvider('augscript', {
      onDidChangeInlayHints: hintChanges.event,
      provideInlayHints: (document, range, token) => inlayHints(context, document, range, token),
    }));
  context.subscriptions.push(vscode.languages.registerCodeActionsProvider('augscript', {
    provideCodeActions: (document, range, actionContext) =>
      codeActions(context, document, actionContext),
  }, { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.RefactorRewrite] }));
  context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('augscript', {
    provideDocumentFormattingEdits: async document => [vscode.TextEdit.replace(new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length)),
      await editorData(context, document, 'format'))],
  }));
  const watcher = vscode.workspace.createFileSystemWatcher('**/{*.aug,main.yaml,aug.lock.json,aug-package.json}');
  const changed = () => { for (const connection of servers.values()) connection.changed(); hintChanges.fire(); };
  context.subscriptions.push(watcher, watcher.onDidCreate(changed), watcher.onDidChange(changed), watcher.onDidDelete(changed));
  context.subscriptions.push(vscode.languages.registerHoverProvider(yamlSelector, {
    provideHover: yamlHover,
  }));
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(yamlSelector, {
    provideCompletionItems: yamlCompletions,
  }, ':'));
  context.subscriptions.push(vscode.languages.registerSignatureHelpProvider('augscript', {
    provideSignatureHelp: (document, position) => signatureHelp(context, document, position),
  }, '(', ','));
  context.subscriptions.push(vscode.languages.registerDocumentSemanticTokensProvider('augscript', {
    provideDocumentSemanticTokens: document => semanticTokens(context, document),
  }, semanticLegend));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.build', () => executeProject(context, 'build')));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.spec', () => executeProject(context, 'spec')));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.openSpec', async () => {
    const editor=vscode.window.activeTextEditor;
    if(!editor||editor.document.languageId!=='augscript')return;
    const root=projectRoot(editor.document.uri.fsPath);
    if(!root)return;
    if(editor.document.isDirty){vscode.window.showInformationMessage('Save the source file before generating its specification.');return;}
    try {
      const result=await runCompiler(context,['spec',root]);
      if(result.code!==0)throw new Error(result.stderr||result.stdout||'Specification generation failed.');
      await vscode.commands.executeCommand('markdown.showPreview',vscode.Uri.file(editor.document.uri.fsPath+'.md'));
    }catch(error){vscode.window.showErrorMessage(error.message);}
  }));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.migrate', async () => {
    const document=vscode.window.activeTextEditor?.document;
    if(!document||document.languageId!=='augscript')return;
    const root=projectRoot(document.uri.fsPath);
    const dirty=vscode.workspace.textDocuments.find(doc=>doc.languageId==='augscript'&&projectRoot(doc.uri.fsPath)===root&&doc.isDirty);
    if(dirty){vscode.window.showInformationMessage('Save the project sources before migrating their syntax.');return;}
    try {
      const result=await runCompiler(context,['migrate',root,'--write']);
      if(result.code!==0)throw new Error(result.stderr||result.stdout||'Syntax migration failed.');
      vscode.window.showInformationMessage(result.stdout.trim()||'Project syntax is current.');
    }catch(error){vscode.window.showErrorMessage(error.message);}
  }));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.installPackages', () => executeProject(context, 'install')));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.run', () => executeProject(context, 'run')));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.test', () => executeProject(context, 'test')));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.explain', () => showContext(context, false)));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.context', () => showContext(context, true)));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.openWelcome', () =>
    vscode.commands.executeCommand('markdown.showPreview',
      vscode.Uri.file(path.join(context.extensionPath, 'media', 'welcome.md')))));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.enableIcons', async () => {
    const target = vscode.workspace.workspaceFolders?.length
      ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;
    await vscode.workspace.getConfiguration('workbench').update('iconTheme', 'augscript-icons', target);
  }));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.openTestingGuide', () =>
    openGuide(context, 'testing.md')));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.openGuide', () =>
    openGuide(context, 'reference.md')));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.openDiagnostics', () =>
    openGuide(context, 'diagnostics.md')));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.openToolingGuide', () =>
    openGuide(context, 'tooling.md')));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.openWebGuide', () =>
    openGuide(context, 'web.md')));
  context.subscriptions.push(vscode.commands.registerCommand('augscript.explainDiagnostic',
    async (message, help) => {
      const choice = await vscode.window.showInformationMessage(
        `${message}${help ? ` — ${help}` : ''}`, 'Open diagnostics guide');
      if (choice) await openGuide(context, 'diagnostics.md');
    }));
  for (const document of vscode.workspace.textDocuments) scheduleRefresh(context, document);
}

function deactivate() {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  for (const connection of servers.values()) connection.dispose(); servers.clear();
}

module.exports = { activate, deactivate };
