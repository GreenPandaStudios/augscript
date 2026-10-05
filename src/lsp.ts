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
  const document = (uri: string,wholeProject=false): SemanticDocument => workspace.document(fileURLToPath(uri), open.get(uri),wholeProject);
  const publish = () => {
    for (const [uri, edit] of open) {
      const view = document(uri);
      send({ jsonrpc: '2.0', method: 'textDocument/publishDiagnostics', params: { uri, version: edit.version,
        diagnostics: view.diagnostics.filter(issue => issue.file === fileURLToPath(uri)).map(issue => ({
          range: { start: { line: issue.line - 1, character: issue.column - 1 }, end: { line: issue.line - 1, character: issue.column } },
          message: issue.message + (issue.code === 'CALL' && issue.expected ? `\nCaller input labels: ${issue.expected}.` : ''), severity: issue.severity === 'warning' ? 2 : 1, code: issue.code, source: 'AugScript',
          ...(issue.related?.length ? {relatedInformation:issue.related.map(location=>({
            location:{uri:pathToFileURL(location.file).href,range:{start:{line:location.line-1,character:location.column-1},end:{line:location.line-1,character:location.column}}},
            message:location.message}))} : {}),
          data: { help: diagnosticHelp[issue.code], expected:issue.expected, actual:issue.actual, rule:issue.rule } })) } });
    }
  };
  let publishTimer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => { if (publishTimer) clearTimeout(publishTimer); publishTimer = setTimeout(() => { try { publish(); } catch (error) { process.stderr.write(String(error) + '\n'); } }, 75); };
  let shutdown = false;
  let versionedEdits = false, annotatedEdits = false;
  let hintDetail:'compact'|'full'='compact';
  const handle = (message: { id?: number | string; method: string; params?: any }) => {
    const params = message.params ?? {};
    let result: unknown = null;
    if (message.method === '$/cancelRequest') { cancelled.add(params.id); return; }
    if (message.id !== undefined && cancelled.delete(message.id)) { send({ jsonrpc: '2.0', id: message.id, error: { code: -32800, message: 'Request cancelled' } }); return; }
    if (message.method === 'initialize') {
      hintDetail=params.initializationOptions?.inferredContractHintDetail==='full'?'full':'compact';
      versionedEdits = !!params.capabilities?.workspace?.workspaceEdit?.documentChanges;
      annotatedEdits = versionedEdits && !!params.capabilities?.workspace?.workspaceEdit?.changeAnnotationSupport;
      result = { capabilities: {
      textDocumentSync: { openClose: true, change: 1 }, hoverProvider: true, completionProvider: { triggerCharacters: ['.', '(', '=', ' '] },
      definitionProvider: true, referencesProvider:true, renameProvider:{prepareProvider:true}, documentFormattingProvider: true, codeActionProvider: true, inlayHintProvider: true,
      semanticTokensProvider: { legend: { tokenTypes, tokenModifiers: ['declaration'] }, full: true },
    }, serverInfo: { name: 'AugScript', version: compilerVersion() } };
    }
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
    else if (message.method === 'workspace/didChangeConfiguration') hintDetail=params.settings?.augscript?.inferredContractHintDetail==='full'?'full':'compact';
    else if (message.method === 'aug/stats') result = { ...workspace.stats };
    else if (message.method === 'aug/editor') {
      const uri = params.uri;
      if (params.text !== undefined) {
        const previous = open.get(uri);
        if (!previous || params.version >= previous.version) open.set(uri, { text: params.text, version: params.version });
      }
      const view = document(uri,['references','graph','rename'].includes(params.command)||params.options?.context===true), offset = params.offset ?? 0;
      result = params.command === 'hover' ? view.hover(offset) ?? null : params.command === 'complete' ? view.complete(offset) :
        params.command === 'rename' ? view.rename(offset,params.options?.name) : params.command === 'references' ? view.references(offset,params.options?.includeDeclaration!==false).map(item=>({...item,file:view.referenceTarget(item.file)})) : params.command === 'graph' ? view.graph() : params.command === 'fixes' ? view.fixes() : params.command === 'semantic-tokens' ? view.tokens() :
          params.command === 'inlay-hints' ? view.inlayHints(params.options?.start, params.options?.end,params.options) :
          params.command === 'format' ? view.format() : params.command === 'definition' ? view.definition(offset) ?? null : params.command === 'diagnostics' ? view.diagnostics.map(issue => ({ ...issue, help: diagnosticHelp[issue.code] })) : view.describe(params.options);
    } else if (message.method.startsWith('textDocument/')) {
      const view = document(params.textDocument.uri,['textDocument/references','textDocument/rename','textDocument/prepareRename'].includes(message.method));
      const offset = params.position ? offsetAt(view.source, params.position) : 0;
      if (message.method === 'textDocument/hover') {
        const hover = view.hover(offset); result = hover ? { contents: { kind: 'markdown', value: `\`\`\`augscript\n${hover.detail}\n\`\`\`\n\n${hover.documentation ?? ''}` } } : null;
      } else if (message.method === 'textDocument/inlayHint') result = view.inlayHints(
        params.range ? offsetAt(view.source, params.range.start) : undefined,
        params.range ? offsetAt(view.source, params.range.end) : undefined,{detail:hintDetail}).map(hint => ({
          position: positionAt(view.source, hint.offset), label: hint.label, kind: 1,
          paddingLeft: true, tooltip: {kind: 'markdown', value: hint.tooltip},
        }));
      else if (message.method === 'textDocument/completion') result = view.complete(offset).map(item => ({ label: item.label,
        kind: ({ method: 2, function: 3, variable: 6, class: 7, interface: 8, composition: 9, property: 10, keyword: 14, snippet: 15, type: 25 } as Record<string, number>)[item.kind] ?? 6,
        detail: item.detail, documentation: { kind: 'markdown', value: item.documentation ?? '' }, insertText: item.insertText ?? item.label,
        insertTextFormat: item.insertText ? 2 : 1, sortText: item.sortText,
        textEdit: item.replacement ? { range: {start:positionAt(view.source,item.replacement.start),end:positionAt(view.source,item.replacement.end)}, newText:item.insertText ?? item.label } : undefined,
        additionalTextEdits: item.additionalEdits?.map(edit => ({range:{start:positionAt(view.source,edit.start),end:positionAt(view.source,edit.end)},newText:edit.text})) }));
      else if (message.method === 'textDocument/prepareRename') {
        const graph=view.graph(),references=view.references(offset),selected=references.find(item=>view.referenceTarget(item.file)===view.path&&item.start<=offset&&offset<item.end);
        const symbol=selected&&graph.symbols.find(item=>item.id===selected.symbol);
        result=symbol?.editable?{range:{start:positionAt(view.source,selected!.start),end:positionAt(view.source,selected!.end)},placeholder:symbol.name}:null;
      }
      else if (message.method === 'textDocument/rename') {
        const plan=view.rename(offset,params.newName),grouped=new Map<string,{range:unknown;newText:string}[]>();
        for(const edit of plan.edits) {
          const uri=pathToFileURL(edit.file).href,source=workspace.document(edit.file).source;
          const edits=grouped.get(uri)??[];edits.push({range:{start:positionAt(source,edit.start),end:positionAt(source,edit.end)},newText:edit.text});grouped.set(uri,edits);
        }
        result=versionedEdits?{documentChanges:[...grouped].map(([uri,edits])=>({textDocument:{uri,version:open.get(uri)?.version??null},edits}))}:{changes:Object.fromEntries(grouped)};
      }
      else if (message.method === 'textDocument/references') result=view.references(offset,params.context?.includeDeclaration!==false).flatMap(item=>{
        const file=view.referenceTarget(item.file);return file?[{uri:pathToFileURL(file).href,range:{start:{line:item.line-1,character:item.column-1},end:{line:item.line-1,character:item.column-1+item.end-item.start}}}]:[];
      });
      else if (message.method === 'textDocument/definition') { const target = view.definition(offset); result = target ? { uri: pathToFileURL(target.file).href,
        range: { start: { line: target.line - 1, character: target.column - 1 }, end: { line: target.line - 1, character: target.column } } } : null; }
      else if (message.method === 'textDocument/formatting') result = [{ range: { start: { line: 0, character: 0 }, end: positionAt(view.source, view.source.length) }, newText: view.format() }];
      else if (message.method === 'textDocument/codeAction') result = view.fixes().filter(fix =>
        !params.range || fix.issue.line - 1 >= params.range.start.line && fix.issue.line - 1 <= params.range.end.line).map(fix => {
        const changes: Record<string, { range: unknown; newText: string }[]> = {};
        for (const edit of fix.edits) { const source = workspace.document(edit.file).source, uri = pathToFileURL(edit.file).href;
          (changes[uri] ??= []).push({ range: { start: positionAt(source, edit.start), end: positionAt(source, edit.end) }, newText: edit.text }); }
        const documentChanges = Object.entries(changes).map(([uri, edits]) => ({
          textDocument:{uri, version:open.get(uri)?.version ?? null},
          edits:edits.map(edit => annotatedEdits ? {...edit, annotationId:'consequence'} : edit),
        }));
        const edit = versionedEdits ? {documentChanges,
          changeAnnotations:annotatedEdits ? {consequence:{label:fix.title, description:fix.description, needsConfirmation:true}} : undefined} : {changes};
        return { title: fix.title, kind: 'quickfix', isPreferred: fix.preferred, diagnostics: [{ code:fix.issue.code, message:fix.issue.message,
          range:{start:{line:fix.issue.line-1,character:fix.issue.column-1},end:{line:fix.issue.line-1,character:fix.issue.column}} }], edit };
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
      buffer = Buffer.concat([buffer, typeof chunk === 'string' ? Buffer.from(chunk) : chunk]);
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
