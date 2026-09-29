import type { Diagnostic, Span } from './ast.ts';

export interface Token {
  kind: string;
  value: string;
  span: Span;
  endLine: number;
}

export const reservedKeywords = [
  'import', 'from', 'export', 'folder', 'bind', 'implement', 'with', 'to', 'class', 'interface',
  'implements', 'extends', 'function', 'returns', 'throws', 'unless', 'return',
  'throw', 'if', 'else', 'while', 'try', 'catch', 'unsafe', 'extern', 'C',
  'resolve', 'own', 'borrow', 'true', 'false', 'null', 'interceptor',
  'and', 'everything', 'test', 'when', 'it', 'pass', 'in', 'out', 'changes', 'uses', 'mutable', 'capability',
  'record', 'for', 'match', 'some', 'shared', 'fresh', 'scoped', 'scope', 'composition', 'include', 'fixture',
  'pure',
  'optional', 'missing',
  'freeze', 'as',
  'endpoint', 'serve', 'streams', 'yield', 'handle',
  'start', 'wait',
  'always',
  'lock',
] as const;
const keywords = new Set<string>(reservedKeywords);

export function lex(file: string, source: string, comments = false): { tokens: Token[]; diagnostics: Diagnostic[] } {
  const tokens: Token[] = [];
  const diagnostics: Diagnostic[] = [];
  let index = 0;
  let line = 1;
  let column = 1;
  const peek = (offset = 0) => source[index + offset] ?? '';
  const advance = () => {
    const char = source[index++] ?? '';
    if (char === '\n') { line++; column = 1; } else { column++; }
    return char;
  };
  const spanAt = (start: number, startLine: number, startColumn: number): Span =>
    ({ file, start, end: index, line: startLine, column: startColumn });
  const emit = (kind: string, value: string, start: number, startLine: number, startColumn: number) =>
    tokens.push({ kind, value, span: spanAt(start, startLine, startColumn), endLine: line });
  const error = (message: string, startLine: number, startColumn: number) =>
    diagnostics.push({ file, line: startLine, column: startColumn, message, code: 'LEX' });
  const markup: {mode: 'tag' | 'text' | 'expression'; resume?: 'tag' | 'text'; braces: number; depth: number; closing: boolean}[] = [];

  while (index < source.length) {
    const char = peek();
    const mode = markup.at(-1);
    if (mode?.mode === 'text' && char !== '<' && char !== '{') {
      const start = index, startLine = line, startColumn = column;
      while (peek() && peek() !== '<' && peek() !== '{') advance();
      emit('jsx_text', source.slice(start, index), start, startLine, startColumn); continue;
    }
    if (/\s/.test(char)) { advance(); continue; }
    const start = index;
    const startLine = line;
    const startColumn = column;
    if (mode?.mode === 'text' && char === '<') {
      advance(); mode.closing = peek() === '/'; if (mode.closing) advance(); else mode.depth++;
      mode.mode = 'tag'; emit(mode.closing ? 'jsx_close' : 'jsx_open', mode.closing ? '</' : '<', start, startLine, startColumn); continue;
    }
    if (mode?.mode === 'tag') {
      if (char === '>' || char === '/' && peek(1) === '>') {
        const self = char === '/'; advance(); if (self) advance();
        if (self || mode.closing) mode.depth--;
        emit(self ? 'jsx_self' : mode.closing ? 'jsx_close_end' : 'jsx_end', self ? '/>' : '>', start, startLine, startColumn);
        mode.mode = 'text'; if (mode.depth === 0) markup.pop(); continue;
      }
      if (/[A-Za-z_]/.test(char)) {
        let value = ''; while (/[A-Za-z0-9_:-]/.test(peek())) value += advance(); emit('jsx_name', value, start, startLine, startColumn); continue;
      }
    }
    if (mode && mode.mode !== 'expression' && char === '{') {mode.resume = mode.mode; mode.mode = 'expression'; mode.braces = 0;}
    if (char === '<' && (/[A-Za-z_]/.test(peek(1)) || peek(1) === '>') &&
        (!tokens.length || ['return', '=', 'to', '(', ',', '[', '{', ':', 'yield'].includes(tokens.at(-1)!.kind))) {
      advance(); markup.push({mode:'tag', braces:0, depth:1, closing:false}); emit('jsx_open', '<', start, startLine, startColumn); continue;
    }
    if (mode?.mode === 'expression') {
      if (char === '{') mode.braces++;
      if (char === '}' && --mode.braces === 0) {mode.mode = mode.resume!; mode.resume = undefined;}
    }
    if (char === '#' || (char === '/' && peek(1) === '/')) {
      while (peek() && peek() !== '\n') advance();
      if (comments) emit('comment', source.slice(start, index), start, startLine, startColumn);
      continue;
    }
    if (char === '/' && peek(1) === '*') {
      advance(); advance();
      while (peek() && !(peek() === '*' && peek(1) === '/')) advance();
      if (!peek()) error('Unterminated block comment', startLine, startColumn);
      else { advance(); advance(); }
      if (comments) emit('comment', source.slice(start, index), start, startLine, startColumn);
      continue;
    }
    if (/[A-Za-z_]/.test(char)) {
      let value = '';
      while (/[A-Za-z0-9_]/.test(peek())) value += advance();
      emit(keywords.has(value) ? value : 'identifier', value, start, startLine, startColumn);
      continue;
    }
    if (/[0-9]/.test(char)) {
      let value = '';
      while (/[0-9]/.test(peek())) value += advance();
      if (peek() === '.' && /[0-9]/.test(peek(1))) {
        value += advance();
        while (/[0-9]/.test(peek())) value += advance();
      }
      emit('number', value, start, startLine, startColumn);
      continue;
    }
    if (char === '"' || char === "'") {
      const quote = advance();
      let value = '';
      let closed = false;
      while (peek()) {
        if (peek() === quote) { advance(); closed = true; break; }
        if (peek() === '\\') {
          advance();
          const escape = advance();
          value += ({ n: '\n', r: '\r', t: '\t', '0': '\0', '\\': '\\', '"': '"', "'": "'" } as Record<string, string>)[escape] ?? escape;
        } else value += advance();
      }
      if (!closed) error('Unterminated string literal', startLine, startColumn);
      emit('string', value, start, startLine, startColumn);
      continue;
    }
    const two = char + peek(1);
    if (['==', '!=', '<=', '>=', '&&', '||', '->', '=>'].includes(two)) {
      advance(); advance(); emit(two, two, start, startLine, startColumn); continue;
    }
    if ('{}();,.:<>?=+-*/![]'.includes(char)) {
      advance(); emit(char, char, start, startLine, startColumn); continue;
    }
    advance();
    error(`Unexpected character ${JSON.stringify(char)}`, startLine, startColumn);
  }
  tokens.push({ kind: 'eof', value: '', span: { file, start: index, end: index, line, column }, endLine: line });
  return { tokens, diagnostics };
}
