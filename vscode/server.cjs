const { spawn } = require('node:child_process');

/** One stdio LSP process per project; editor requests share checked revisions. */
class Server {
  constructor(command, report, onClose) {
    this.child = spawn(command.command, command.args, { env:command.env, stdio: ['pipe', 'pipe', 'pipe'] });
    this.pending = new Map(); this.documents = new Map(); this.sequence = 0; this.buffer = Buffer.alloc(0);
    this.child.stdout.on('data', chunk => {
      this.buffer = Buffer.concat([this.buffer, chunk]);
      while (true) {
        const end = this.buffer.indexOf('\r\n\r\n'); if (end < 0) return;
        const length = Number(/Content-Length:\s*(\d+)/i.exec(this.buffer.subarray(0, end).toString())?.[1]);
        if (!Number.isSafeInteger(length) || length < 0 || length > 16 * 1024 * 1024) { this.dispose(); return; }
        if (this.buffer.length < end + 4 + length) return;
        let message;
        try { message = JSON.parse(this.buffer.subarray(end + 4, end + 4 + length).toString('utf8')); }
        catch { this.dispose(); return; }
        this.buffer = this.buffer.subarray(end + 4 + length);
        if (message.method === 'textDocument/publishDiagnostics') report(message.params);
        if (message.id !== undefined) { const pending = this.pending.get(message.id); this.pending.delete(message.id);
          if (pending) { clearTimeout(pending.timer); message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); } }
      }
    });
    let errors = '';
    this.child.stderr.on('data', chunk => { errors = (errors + chunk).slice(-4000); });
    const failed = error => {
      for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.reject(error); } this.pending.clear(); onClose();
    };
    this.child.on('error', failed);
    this.child.on('exit', code => failed(new Error(`AugScript language server exited (${code}): ${errors}`)));
    this.ready = this.request('initialize', { processId: global.process.pid, capabilities: {}, workspaceFolders: [] });
    this.ready.then(() => this.notify('initialized', {})).catch(() => {});
  }
  send(message) { const data = Buffer.from(JSON.stringify(message)); this.child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`); this.child.stdin.write(data); }
  notify(method, params) { this.send({ jsonrpc: '2.0', method, params }); }
  request(method, params) {
    const id = ++this.sequence;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); this.notify('$/cancelRequest', { id }); reject(new Error('AugScript language request timed out')); }, 15000);
      this.pending.set(id, { resolve, reject, timer }); this.send({ jsonrpc: '2.0', id, method, params });
    });
  }
  sync(document) {
    const uri = document.uri.toString(), previous = this.documents.get(uri);
    if (previous === document.version) return;
    this.documents.set(uri, document.version);
    this.ready.then(() => this.notify(previous === undefined ? 'textDocument/didOpen' : 'textDocument/didChange',
      previous === undefined ? { textDocument: { uri, languageId: 'augscript', version: document.version, text: document.getText() } } :
        { textDocument: { uri, version: document.version }, contentChanges: [{ text: document.getText() }] })).catch(() => {});
  }
  async query(document, command, offset, options) {
    this.sync(document); await this.ready;
    return this.request('aug/editor', { uri: document.uri.toString(), text: document.getText(), version: document.version, command, offset, options });
  }
  close(document) { const uri = document.uri.toString(); this.documents.delete(uri); this.ready.then(() => this.notify('textDocument/didClose', { textDocument: { uri } })).catch(() => {}); }
  changed() { this.ready.then(() => this.notify('workspace/didChangeWatchedFiles', { changes: [] })).catch(() => {}); }
  dispose() { this.child.kill(); }
}
module.exports = { Server };
