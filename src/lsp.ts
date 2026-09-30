import { fileURLToPath, pathToFileURL } from 'node:url';
import { SemanticWorkspace, type SemanticDocument } from './semantic.ts';
import { diagnosticHelp } from './help.ts';
import { compilerVersion } from './package-manager.ts';

const tokenTypes = ['class', 'interface', 'function', 'method', 'property', 'variable', 'parameter', 'type', 'keyword', 'decorator', 'typeParameter'];
const offsetAt = (source: string, position: { line: number; character: number }) =>
  source.split('\n').slice(0, position.line).reduce((offset, line) => offset + line.length + 1, 0) + position.character;
const positionAt = (source: string, offset: number) => {
  const lines = source.slice(0, offset).split('\n'); return { line: lines.length - 1, character: lines.at(-1)!.length };
};

/** LSP 3.17, full-text synchronization and immutable cached semantic revisions. */
export async function runLanguageServer(root: string): Promise<number> {
  const workspace = new SemanticWorkspace(root);
  const open = new Map<string, { text: string; version: number }>();
  const cancelled = new Set<number | string>();
  const send = (message: unknown) => { const data = Buffer.from(JSON.stringify(message)); process.stdout.write(`Content-Length: ${data.length}\r\n\r\n`); process.stdout.write(data); };
  const document = (uri: string): SemanticDocument => workspace.document(fileURLToPath(uri), open.get(uri));
  const publish = () => {
    for (const [uri, edit] of open) {
      const view = document(uri);
      send({ jsonrpc: '2.0', method: 'textDocument/publishDiagnostics', params: { uri, version: edit.version,
        diagnostics: view.diagnostics.filter(issue => issue.file === fileURLToPath(uri)).map(issue => ({
          range: { start: { line: issue.line - 1, character: issue.column - 1 }, end: { line: issue.line - 1, character: issue.column } },
          message: issue.message, severity: issue.severity === 'warning' ? 2 : 1, code: issue.code, source: 'AugScript',
          data: { help: diagnosticHelp[issue.code] } })) } });
    }
  };
  let publishTimer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => { if (publishTimer) clearTimeout(publishTimer); publishTimer = setTimeout(() => { try { publish(); } catch (error) { process.stderr.write(String(error) + '\n'); } }, 75); };
  let shutdown = false;
  const handle = (message: { id?: number | string; method: string; params?: any }) => {
    const params = message.params ?? {};
    let result: unknown = null;
    if (message.method === '$/cancelRequest') { cancelled.add(params.id); return; }
    if (message.id !== undefined && cancelled.delete(message.id)) { send({ jsonrpc: '2.0', id: message.id, error: { code: -32800, message: 'Request cancelled' } }); return; }
    if (message.method === 'initialize') result = { capabilities: {
      textDocumentSync: { openClose: true, change: 1 }, hoverProvider: true, completionProvider: { triggerCharacters: ['.', '(', '=', ' '] },
      definitionProvider: true, documentFormattingProvider: true, codeActionProvider: true, inlayHintProvider: true,
      semanticTokensProvider: { legend: { tokenTypes, tokenModifiers: ['declaration'] }, full: true },
    }, serverInfo: { name: 'AugScript', version: compilerVersion() } };
    else if (message.method === 'shutdown') shutdown = true;
    else if (message.method === 'exit') { process.exitCode = shutdown ? 0 : 1; process.stdin.destroy(); return; }
    else if (message.method === 'textDocument/didOpen') {
      const doc = params.textDocument; open.set(doc.uri, { text: doc.text, version: doc.version }); workspace.document(fileURLToPath(doc.uri), open.get(doc.uri)); schedule();
    } else if (message.method === 'textDocument/didChange') {
      const doc = params.textDocument, previous = open.get(doc.uri);
      if (!previous || doc.version > previous.version) { open.set(doc.uri, { text: params.contentChanges.at(-1).text, version: doc.version });
        workspace.document(fileURLToPath(doc.uri), open.get(doc.uri)); schedule(); }
    } else if (message.method === 'textDocument/didClose') { open.delete(params.textDocument.uri); workspace.close(fileURLToPath(params.textDocument.uri));
      send({ jsonrpc: '2.0', method: 'textDocument/publishDiagnostics', params: { uri: params.textDocument.uri, diagnostics: [] } }); }
    else if (message.method === 'workspace/didChangeWatchedFiles') schedule();
    else if (message.method === 'aug/stats') result = { ...workspace.stats };
    else if (message.method === 'aug/editor') {
      const uri = params.uri;
      if (params.text !== undefined) {
        const previous = open.get(uri);
        if (!previous || params.version >= previous.version) open.set(uri, { text: params.text, version: params.version });
      }
      const view = document(uri), offset = params.offset ?? 0;
      result = params.command === 'hover' ? view.hover(offset) ?? null : params.command === 'complete' ? view.complete(offset) :
        params.command === 'fixes' ? view.fixes() : params.command === 'semantic-tokens' ? view.tokens() :
          params.command === 'inlay-hints' ? view.inlayHints(params.options?.start, params.options?.end) :
          params.command === 'format' ? view.format() : params.command === 'definition' ? view.definition(offset) ?? null : params.command === 'diagnostics' ? view.diagnostics.map(issue => ({ ...issue, help: diagnosticHelp[issue.code] })) : view.describe(params.options);
    } else if (message.method.startsWith('textDocument/')) {
      const view = document(params.textDocument.uri);
      const offset = params.position ? offsetAt(view.source, params.position) : 0;
      if (message.method === 'textDocument/hover') {
        const hover = view.hover(offset); result = hover ? { contents: { kind: 'markdown', value: `\`\`\`augscript\n${hover.detail}\n\`\`\`\n\n${hover.documentation ?? ''}` } } : null;
      } else if (message.method === 'textDocument/inlayHint') result = view.inlayHints(
        params.range ? offsetAt(view.source, params.range.start) : undefined,
        params.range ? offsetAt(view.source, params.range.end) : undefined).map(hint => ({
          position: positionAt(view.source, hint.offset), label: hint.label, kind: 1,
          paddingLeft: true, tooltip: {kind: 'markdown', value: hint.tooltip},
        }));
      else if (message.method === 'textDocument/completion') result = view.complete(offset).map(item => ({ label: item.label,
        kind: ({ method: 2, function: 3, variable: 6, class: 7, interface: 8, property: 10, keyword: 14, snippet: 15, type: 25 } as Record<string, number>)[item.kind] ?? 6,
        detail: item.detail, documentation: { kind: 'markdown', value: item.documentation ?? '' }, insertText: item.insertText ?? item.label,
        insertTextFormat: item.kind === 'snippet' ? 2 : 1 }));
      else if (message.method === 'textDocument/definition') { const target = view.definition(offset); result = target ? { uri: pathToFileURL(target.file).href,
        range: { start: { line: target.line - 1, character: target.column - 1 }, end: { line: target.line - 1, character: target.column } } } : null; }
      else if (message.method === 'textDocument/formatting') result = [{ range: { start: { line: 0, character: 0 }, end: positionAt(view.source, view.source.length) }, newText: view.format() }];
      else if (message.method === 'textDocument/codeAction') result = view.fixes().map(fix => {
        const changes: Record<string, { range: unknown; newText: string }[]> = {};
        for (const edit of fix.edits) { const source = workspace.document(edit.file).source, uri = pathToFileURL(edit.file).href;
          (changes[uri] ??= []).push({ range: { start: positionAt(source, edit.start), end: positionAt(source, edit.end) }, newText: edit.text }); }
        return { title: fix.title, kind: 'quickfix', edit: { changes } };
      });
      else if (message.method === 'textDocument/semanticTokens/full') {
        let line = 0, column = 0; const data: number[] = [];
        for (const token of view.tokens().sort((a, b) => a.line - b.line || a.start - b.start)) {
          data.push(token.line - line, token.line === line ? token.start - column : token.start, token.length, tokenTypes.indexOf(token.type), token.declaration ? 1 : 0);
          line = token.line; column = token.start;
        }
        result = { data, resultId: view.revision };
      }
    } else if (message.id !== undefined) { send({ jsonrpc: '2.0', id: message.id, error: { code: -32601, message: `Unsupported method ${message.method}` } }); return; }
    if (message.id !== undefined) send({ jsonrpc: '2.0', id: message.id, result });
  };
  let buffer = Buffer.alloc(0);
  await new Promise<void>(resolve => {
    process.stdin.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);
      while (true) {
        const headerEnd = buffer.indexOf('\r\n\r\n'); if (headerEnd < 0) break;
        const length = Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0, headerEnd).toString())?.[1]);
        if (!Number.isSafeInteger(length) || length < 0 || length > 16 * 1024 * 1024) { process.stderr.write('Invalid LSP frame\n'); process.stdin.destroy(); break; }
        if (buffer.length < headerEnd + 4 + length) break;
        const payload = buffer.subarray(headerEnd + 4, headerEnd + 4 + length); buffer = buffer.subarray(headerEnd + 4 + length);
        let message: any;
        try { message = JSON.parse(payload.toString('utf8')); handle(message); }
        catch (error) { if (message?.id !== undefined) send({ jsonrpc: '2.0', id: message.id, error: { code: -32603, message: String(error) } });
          else process.stderr.write(String(error) + '\n'); }
      }
    });
    process.stdin.on('close', resolve); process.stdin.on('end', resolve);
  });
  if (publishTimer) clearTimeout(publishTimer);
  return process.exitCode === 1 ? 1 : 0;
}
