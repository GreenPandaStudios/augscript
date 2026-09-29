import { resolve } from 'node:path';
import type { Diagnostic, MethodDecl, SourceFile, Stmt } from './ast.ts';
import type { CheckedProject } from './checker.ts';
import { importItems } from './editor.ts';
import { languageHelp } from './help.ts';
import { lex } from './lexer.ts';
import { tyName } from './types.ts';
import { migrateFile } from './formatter.ts';

export interface TextFixEdit {
  file: string;
  start: number;
  end: number;
  text: string;
}

export interface EditorFix {
  title: string;
  issue: Pick<Diagnostic, 'code' | 'line' | 'column' | 'message'>;
  edits: TextFixEdit[];
}

function offsetAt(source: string, line: number, column: number): number {
  let start = 0;
  for (let current = 1; current < line; current++) {
    const next = source.indexOf('\n', start);
    if (next < 0) return source.length;
    start = next + 1;
  }
  return Math.min(source.length, start + Math.max(0, column - 1));
}

function distance(left: string, right: string): number {
  const row = [...Array(right.length + 1)].map((_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const old = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1,
        previous + (left[i - 1] === right[j - 1] ? 0 : 1));
      previous = old;
    }
  }
  return row[right.length];
}

function containingStatement(file: SourceFile, offset: number): Stmt | undefined {
  const result: Stmt[] = [];
  function visit(body: Stmt[]): void {
    for (const stmt of body) {
      if (stmt.span.start > offset || offset >= stmt.span.end) continue;
      result.push(stmt);
      if (stmt.kind === 'if') { visit(stmt.then); visit(stmt.otherwise); }
      else if (stmt.kind === 'while' || stmt.kind === 'for' || stmt.kind === 'scope' || stmt.kind === 'unsafe' || stmt.kind === 'borrow')
        visit(stmt.body);
      else if(stmt.kind==='lock')visit(stmt.body);
      else if (stmt.kind === 'try') {
        visit(stmt.body);
        for (const clause of stmt.catches) visit(clause.body);
        visit(stmt.always??[]);
      }
      else if (stmt.kind === 'match') for (const clause of stmt.cases) visit(clause.body);
    }
  }
  for (const item of file.items) {
    if (item.kind === 'function') visit(item.body ?? []);
    else if (item.kind === 'class' || item.kind === 'interface' || item.kind === 'interceptor') {
      if (item.kind === 'class') visit(item.constructorBody ?? []);
      for (const method of item.methods) visit(method.body ?? []);
    } else if (item.kind === 'test') for (const group of item.groups) {
      visit(group.setup.filter((entry): entry is Stmt => entry.kind !== 'bind' && entry.kind !== 'include'));
      for (const test of group.cases) visit(test.body);
    }
    else if (['expr', 'assign', 'destructure', 'return', 'throw', 'if', 'while', 'for', 'scope', 'match', 'try', 'unsafe', 'borrow']
      .includes(item.kind)) visit([item as Stmt]);
  }
  return result.at(-1);
}

function wrappedStatement(file: SourceFile, issue: Diagnostic,
                          opener: string, closer = '}'): TextFixEdit | undefined {
  const stmt = containingStatement(file, offsetAt(file.source, issue.line, issue.column));
  // A declaration moved into a new block would become invisible afterward.
  if (!stmt || (stmt.kind !== 'expr' && !(stmt.kind === 'assign' && !stmt.declaredType)))
    return undefined;
  const lineStart = file.source.lastIndexOf('\n', stmt.span.start - 1) + 1;
  const before = file.source.slice(lineStart, stmt.span.start);
  const indent = /^[ \t]*$/.test(before) ? before : '';
  const body = file.source.slice(stmt.span.start, stmt.span.end)
    .replace(/\n/g, `\n${indent}    `);
  return { file: file.path, start: stmt.span.start, end: stmt.span.end,
    text: `${opener} {\n${indent}    ${body}\n${indent}${closer}` };
}

export function suggestedFixes(checked: CheckedProject, fileName: string): EditorFix[] {
  const file = checked.project.files.get(resolve(fileName));
  if (!file) return [];
  const fixes: EditorFix[] = [];
  const syntaxIssue = checked.diagnostics.find(issue => issue.file === file.path && issue.code === 'SYNTAX');
  if (syntaxIssue) {
    try {
      const text = migrateFile(checked.project, file);
      if (text !== file.source) fixes.push({title:'Upgrade this file to the current August syntax', issue:syntaxIssue,
        edits:[{file:file.path, start:0, end:file.source.length, text}]});
    } catch { /* Offer a migration only when the whole file can be parsed safely. */ }
  }
  for (const item of file.items) if (item.kind === 'import' && item.everything) {
    const names = checked.project.imports.get(item)?.map(def => def.name) ?? [];
    if (names.length) fixes.push({ title: 'Expand to named imports', issue: { code: 'IMPORT', line: item.span.line, column: item.span.column,
      message: 'Make imported dependencies explicit' }, edits: [{ file: file.path, start: item.span.start, end: item.span.end,
        text: `import ${names.join(' and ')} from ${item.from.join('.')}` }] });
  }
  for (const issue of checked.diagnostics.filter(issue => issue.file === file.path)) {
    const add = (title: string, edit: TextFixEdit | undefined) => {
      if (edit) fixes.push({ title, issue, edits: [edit] });
    };
    const unknown = /^(?:Unknown name|Unknown type|Unknown interceptor) ([A-Za-z_][A-Za-z0-9_]*)$/.exec(issue.message);
    const mistyped = /^Expected ([A-Za-z_]+), found "([A-Za-z_]+)"$/.exec(issue.message);
    const redundant = /^Remove (class|function|fuction); declarations start with their name$/.exec(issue.message);
    if (issue.code === 'PARSE' && redundant) {
      const start = offsetAt(file.source, issue.line, issue.column);
      if (file.source.slice(start, start + redundant[1].length) === redundant[1])
        add(`Remove ${redundant[1]}`, { file: file.path, start,
          end: start + redundant[1].length + 1, text: '' });
    }
    if (issue.code === 'PARSE' && mistyped &&
        languageHelp[mistyped[1]]?.category === 'keyword' &&
        distance(mistyped[1], mistyped[2]) <= 2) {
      const start = offsetAt(file.source, issue.line, issue.column);
      if (file.source.slice(start, start + mistyped[2].length) === mistyped[2])
        add(`Replace ${mistyped[2]} with ${mistyped[1]}`,
          { file: file.path, start, end: start + mistyped[2].length, text: mistyped[1] });
    }
    if (unknown) {
      const seen = new Set<string>();
      for (const item of importItems(checked, file).filter(item => item.label === unknown[1])) {
        const declaration = `import ${item.insertText ?? ''}`;
        if (seen.has(declaration)) continue;
        seen.add(declaration);
        add(`Import ${unknown[1]} from ${item.detail.split(' from ')[1]}`,
          { file: file.path, start: 0, end: 0, text: `${declaration}\n` });
      }
    }
    if (issue.code === 'INTERCEPTOR' && /constructor parameter .* must be marked resolve/.test(issue.message)) {
      const start = offsetAt(file.source, issue.line, issue.column);
      add('Inject interceptor constructor parameter with resolve', { file: file.path, start, end: start, text: 'resolve ' });
    }
    if (issue.code === 'INTERCEPTOR' && /must define around/.test(issue.message)) {
      const start = offsetAt(file.source, issue.line, issue.column);
      const node = file.items.find(item => item.kind === 'interceptor' && item.span.start === start);
      if (node?.kind === 'interceptor') {
        const process = node.methods.find(method => method.name === 'process');
        if (process) add('Rename process to around', { file: file.path, start: process.span.start,
          end: process.span.start + process.name.length, text: 'around' });
        else {
          const end = file.source.lastIndexOf('}', node.span.end - 1);
          if (end >= start) {
            const type = node.typeParams[0];
            add('Add an around implementation', { file: file.path, start: end, end,
              text: `\n    around()${type ? ` returns ${type}` : ''} {\n        ${type ? 'return ' : ''}next();\n    }\n` });
          }
        }
      }
    }
    if (issue.code === 'FFI' && /requires unsafe \{ \.\.\. \}/.test(issue.message))
      add('Wrap statement in unsafe block', wrappedStatement(file, issue, 'unsafe'));
    if (issue.code === 'PARSE' && issue.message === 'Use unless instead of throws in error contracts') {
      const start = offsetAt(file.source, issue.line, issue.column);
      add('Replace throws with unless', { file: file.path, start, end: start + 'throws'.length, text: 'unless' });
    }
    const borrow = /requires borrow ([A-Za-z_][A-Za-z0-9_]*)/.exec(issue.message);
    if (issue.code === 'BORROW' && borrow) {
      const name = borrow[1];
      add(`Wrap statement in borrow ${name} block`, wrappedStatement(file, issue, `borrow ${name}`));
    }
    const thrown = /^Unhandled ([A-Za-z_][A-Za-z0-9_]*); catch it or declare unless/.exec(issue.message);
    const offset = offsetAt(file.source, issue.line, issue.column);
    const functions = file.items.flatMap(item => item.kind === 'function' ? [item] : 'methods' in item ? item.methods : []);
    const callable = functions.find(fn => fn.span.start <= offset && offset < fn.span.end || fn.annotations?.some(tag=>tag.span.start<=offset&&offset<tag.span.end));
    const headerClose = (fn: MethodDecl) => {
      const tokens = lex(file.path, file.source).tokens.filter(token => fn.span.start <= token.span.start && token.span.start < (fn.body?.[0]?.span.start ?? fn.span.end));
      return tokens.find(token => token.kind === '{' || token.kind === ':')?.span.start;
    };
    if (issue.code === 'THROWS' && thrown) {
      const end = callable && headerClose(callable);
      if (callable && end !== undefined) add(`Propagate ${thrown[1]} with unless`, { file: file.path, start: end, end,
        text: `${callable.throws.length ? 'and' : 'unless'} ${thrown[1]} ` });
      if (!callable) add(`Catch ${thrown[1]} and report the failure`, wrappedStatement(file, issue,
        'try', `} catch ${thrown[1]} error {\n    print(value=error)\n}`));
    }
    const policyEffect=/^Declare uses ([\w]+\.[\w]+) for /.exec(issue.message);
    if(issue.code==='HTTP'&&policyEffect&&callable) {
      const end=headerClose(callable);
      if(end!==undefined) {
        const header=file.source.slice(callable.span.start,end), trailing=/\bunless\b/.exec(header);
        const last=callable.uses?.at(-1);
        const insert=last?last.span.end:trailing?callable.span.start+trailing.index:end;
        add(`Declare uses ${policyEffect[1]}`,{file:file.path,start:insert,end:insert,text:last?` and ${policyEffect[1]}`:`uses ${policyEffect[1]} `});
      }
    }
    if (issue.code === 'DI' && callable && issue.message.startsWith('Declare resolve dependencies in')) {
      const stmt = containingStatement(file, offset);
      const expr = stmt?.kind === 'assign' ? stmt.value : stmt?.kind === 'expr' ? stmt.expr : undefined;
      if (expr?.kind === 'resolve') {
        const type = checked.expressionTypes.get(expr);
        const name = stmt?.kind === 'assign' && stmt.target.kind === 'name' ? stmt.target.name : expr.name[0].toLowerCase() + expr.name.slice(1);
        const open = file.source.indexOf('(', callable.span.start);
        if (type?.kind === 'interface' && type.name === expr.name && open >= 0) {
          const first = callable.params[0]?.span.start ?? open + 1;
          fixes.push({ title: `Lift ${expr.name} into the dependency header`, issue, edits: [
            { file: file.path, start: first, end: first, text: `resolve ${tyName(type)} ${name}${callable.params.length ? ', ' : ''}` },
            stmt!.kind === 'assign' ? { file: file.path, start: stmt!.span.start, end: stmt!.span.end, text: '' } :
              { file: file.path, start: expr.span.start, end: expr.span.end, text: name },
          ] });
        }
      }
    }
  }
  return fixes;
}
