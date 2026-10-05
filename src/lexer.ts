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
  'throw', 'if', 'else', 'while', 'break', 'continue', 'try', 'catch', 'unsafe', 'extern', 'C',
  'resolve', 'own', 'borrow', 'true', 'false', 'null', 'interceptor',
  'and', 'or', 'not', 'initialize', 'everything', 'test', 'when', 'it', 'pass', 'in', 'out', 'changes', 'uses', 'mutable', 'capability',
  'record', 'for', 'match', 'some', 'shared', 'fresh', 'scoped', 'scope', 'composition', 'include', 'fixture',
  'pure',
  'optional', 'immutable', 'missing', 'otherwise',
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
  const markup: {mode: 'tag' | 'text' | 'expression' | 'interpolation' | 'interpolationExpression'; quote?: string; resume?: 'tag' | 'text'; braces: number; depth: number; closing: boolean}[] = [];

  while (index < source.length) {
    const char = peek();
    const mode = markup.at(-1);
    if (mode?.mode === 'interpolation') {
      const start = index, startLine = line, startColumn = column;
      if (char === mode.quote) {advance(); emit('interpolation_end', char, start, startLine, startColumn); markup.pop(); continue;}
      if (char === '{' && peek(1) !== '{') {
        advance(); emit('{', '{', start, startLine, startColumn); mode.mode = 'interpolationExpression'; mode.braces = 1; continue;
      }
      let value = '';
      while (peek() && peek() !== mode.quote) {
        if (peek() === '{' && peek(1) !== '{') break;
        if (peek() === '{' && peek(1) === '{' || peek() === '}' && peek(1) === '}') {value += advance(); advance();}
        else if (peek() === '}') {error('Escape a literal closing brace as }} in interpolation', line, column); value += advance();}
        else if (peek() === '\\') {
          advance(); const escape = advance();
          value += ({ n: '\n', r: '\r', t: '\t', '0': '\0', '\\': '\\', '"': '"', "'": "'" } as Record<string, string>)[escape] ?? escape;
        } else value += advance();
      }
      emit('interpolation_text', value, start, startLine, startColumn); continue;
    }
    if (char === '$' && (peek(1) === '"' || peek(1) === "'")) {
      const start = index, startLine = line, startColumn = column; advance(); const quote = advance();
      markup.push({mode:'interpolation', quote, braces:0, depth:0, closing:false});
      emit('interpolation_start', '$' + quote, start, startLine, startColumn); continue;
    }
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
    if (mode && (mode.mode === 'tag' || mode.mode === 'text') && char === '{') {mode.resume = mode.mode; mode.mode = 'expression'; mode.braces = 0;}
    if (char === '<' && (/[A-Za-z_]/.test(peek(1)) || peek(1) === '>') &&
        (!tokens.length || ['return', '=', 'to', '(', ',', '[', '{', ':', 'yield'].includes(tokens.at(-1)!.kind))) {
      advance(); markup.push({mode:'tag', braces:0, depth:1, closing:false}); emit('jsx_open', '<', start, startLine, startColumn); continue;
    }
    if (mode?.mode === 'interpolationExpression') {
      if (char === '{') mode.braces++;
      if (char === '}' && --mode.braces === 0) mode.mode = 'interpolation';
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
      if(value==='missing')diagnostics.push({file,line:startLine,column:startColumn,code:'SYNTAX',message:'Use null instead of missing; optional values have only a value or null'});
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
      if (['&&', '||'].includes(two)) diagnostics.push({file, line: startLine, column: startColumn, code: 'SYNTAX',
        message: `Use ${two === '&&' ? 'and' : 'or'} instead of ${two}; boolean operators use words`});
      advance(); advance(); emit(two, two, start, startLine, startColumn); continue;
    }
    if ('{}();,.:<>?=+-*/%![]'.includes(char)) {
      if (char === '!') diagnostics.push({file, line: startLine, column: startColumn, code: 'SYNTAX',
        message: 'Use not instead of !; boolean operators use words'});
      advance(); emit(char, char, start, startLine, startColumn); continue;
    }
    advance();
    error(`Unexpected character ${JSON.stringify(char)}`, startLine, startColumn);
  }
  if (markup.some(mode => mode.mode === 'interpolation' || mode.mode === 'interpolationExpression')) error('Unterminated interpolated string or expression', line, column);
  tokens.push({ kind: 'eof', value: '', span: { file, start: index, end: index, line, column }, endLine: line });
  return { tokens, diagnostics };
}
