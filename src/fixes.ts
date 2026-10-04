import {checkedProjectWithTests} from './refactoring.ts';
import type {Config} from './config.ts';
import { resolve } from 'node:path';
import { typeName, type Diagnostic, type Expr, type MethodDecl, type SourceFile, type Stmt, type TypeRef } from './ast.ts';
import {type CheckedProject} from './checker.ts';
import { completions, hoverInfo, importItems } from './editor.ts';
import { importSource } from './git-packages.ts';
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
  preferred?: boolean;
  /** Observable consequence shown with the proposed edit. */
  description?: string;
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

function callsIn(file: SourceFile): Extract<Expr,{kind:'call'}>[] {
  const result: Extract<Expr,{kind:'call'}>[] = [];
  const visit = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if ('kind' in value && value.kind === 'call') result.push(value as Extract<Expr,{kind:'call'}>);
    for (const [key, child] of Object.entries(value)) if (key !== 'span') visit(child);
  };
  visit(file.items); return result;
}

function wrappedStatement(file: SourceFile, issue: Diagnostic,
                          opener: string, closer = '}', config?: Config): TextFixEdit | undefined {
  const stmt = containingStatement(file, offsetAt(file.source, issue.line, issue.column));
  // A declaration moved into a new block would become invisible afterward.
  if (!stmt || (stmt.kind !== 'expr' && !(stmt.kind === 'assign' && !stmt.declaredType)))
    return undefined;
  const lineStart = file.source.lastIndexOf('\n', stmt.span.start - 1) + 1;
  const before = file.source.slice(lineStart, stmt.span.start);
  const indent = /^[ \t]*$/.test(before) ? before : '';
  const step = config?.indentation === 'tabs' ? '\t' : '    ';
  const body = file.source.slice(stmt.span.start, stmt.span.end)
    .replace(/\n/g, `\n${indent}${step}`);
  const indented = config?.block_style === 'indent';
  const ending = indented ? closer.replace(/^} catch (.+?) \{/, 'catch $1:').replace(/\n}$/, '') : closer;
  return { file: file.path, start: stmt.span.start, end: stmt.span.end,
    text: `${opener}${indented ? ':' : ' {'}\n${indent}${step}${body}` +
      (indented && ending === '}' ? '' : `\n${indent}${ending.replace(/    /g, step)}`) };
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
        text: `import ${names.join(' and ')} from ${importSource(item.from)}` }] });
  }
  for (const issue of checked.diagnostics.filter(issue => issue.file === file.path)) {
    const add = (title: string, edit: TextFixEdit | undefined) => {
      if (edit) fixes.push({ title, issue, edits: [edit] });
    };
    const unknown = /^(?:Unknown name|Unknown type|Unknown interceptor) ([A-Za-z_][A-Za-z0-9_]*)$/.exec(issue.message);
    const mistyped = /^Expected ([A-Za-z_]+), found "([A-Za-z_]+)"$/.exec(issue.message);
    const redundant = /^Remove (class|function|fuction); declarations start with their name$/.exec(issue.message);
    const missing = /^([A-Za-z_][A-Za-z0-9_]*) must implement ([A-Za-z_][A-Za-z0-9_]*)$/.exec(issue.message);
    if (issue.code === 'INTERFACE' && missing) {
      const owner = file.items.find(item => item.kind === 'class' && item.name === missing[1]);
      if (owner?.kind === 'class') {
        const seen = new Set<string>();
        const substitute = (ref: TypeRef, types: Map<string, TypeRef>): TypeRef => types.get(ref.name) ?? { ...ref, args: ref.args.map(arg => substitute(arg, types)) };
        const find = (ref: TypeRef, source: string): { method: MethodDecl; types: Map<string, TypeRef> } | undefined => {
          const def = checked.project.scopes.get(source)?.get(ref.name);
          if (!def || def.node.kind !== 'interface' || seen.has(def.id)) return;
          seen.add(def.id);
          const types = new Map(def.node.typeParams.map((name, index) => [name, ref.args[index]]).filter((entry): entry is [string, TypeRef] => !!entry[1]));
          const method = def.node.methods.find(method => method.name === missing[2]);
          if (method) return { method, types };
          for (const parent of def.node.extends) { const found = find(substitute(parent, types), def.file); if (found) return found; }
        };
        const contract = owner.implements.map(ref => find(ref, file.path)).find(Boolean);
        if (contract) {
          const params = contract.method.params.map(param => `${param.injected ? 'resolve ' : ''}${param.ownership === 'managed' ? '' : param.ownership + ' '}${typeName(substitute(param.type, contract.types))} ${param.name}`);
          const generic = contract.method.typeParams.length ? '<' + contract.method.typeParams.join(', ') + '>' : '';
          const header = `${missing[2]}${generic}(${params.join(', ')}) returns ${contract.method.returnOwnership === 'own' ? 'own ' : ''}${typeName(substitute(contract.method.returns, contract.types))}` +
            (contract.method.throws.length ? ' unless ' + contract.method.throws.map(ref => typeName(substitute(ref, contract.types))).join(', ') : '');
          const unit = checked.project.config.indentation === 'tabs' ? '\t' : '    ';
          const start = owner.headerEnd ?? owner.span.start;
          const braces = file.source[start] === '{' || file.source.slice(owner.span.start, start + 1).trimEnd().endsWith('{');
          const insertion = braces ? file.source.lastIndexOf('}', owner.span.end - 1) : owner.span.end;
          if (insertion >= owner.span.start) add(`Implement ${missing[2]} in ${owner.name}`, { file: file.path, start: insertion, end: insertion,
            text: braces ? `\n${unit}${header} {\n${unit}${unit}// TODO: implement ${missing[2]}\n${unit}}\n` : `\n${unit}${header}:\n${unit}${unit}// TODO: implement ${missing[2]}\n${unit}${unit}pass\n` });
        }
      }
    }
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
      const start = offsetAt(file.source, issue.line, issue.column);
      const candidates = completions(checked, file.path, start + unknown[1].length).filter(item =>
        !item.additionalEdits && ['variable', 'parameter', 'property', 'function', 'class', 'interface', 'type'].includes(item.kind) &&
        item.label !== unknown[1] && distance(item.label, unknown[1]) <= Math.min(2, Math.floor(unknown[1].length / 3)));
      for (const candidate of candidates.slice(0, 3)) fixes.push({title:`Replace ${unknown[1]} with ${candidate.label}`, issue,
        preferred:candidates.length === 1, edits:[{file:file.path,start,end:start + unknown[1].length,text:candidate.label}]});
    }
    const badMember = / has no (?:member|method) ([A-Za-z_][A-Za-z0-9_]*)$/.exec(issue.message);
    if (badMember) {
      const start = offsetAt(file.source, issue.line, issue.column), tokens = lex(file.path, file.source).tokens;
      const member = tokens.find(token => token.value === badMember[1] && token.span.start >= start && token.span.line === issue.line);
      if (member) {
        const candidates = completions(checked,file.path,member.span.end).filter(item => item.label !== member.value && distance(item.label,member.value) <= 2);
        for (const candidate of candidates.slice(0,3)) fixes.push({title:`Replace ${member.value} with ${candidate.label}`,issue,
          preferred:candidates.length===1,edits:[{file:file.path,start:member.span.start,end:member.span.end,text:candidate.label}]});
      }
    }
    const badLabel = / has no parameter ([A-Za-z_][A-Za-z0-9_]*)$/.exec(issue.message);
    if (issue.code === 'CALL' && badLabel) {
      const start = offsetAt(file.source, issue.line, issue.column);
      const calls = callsIn(file).filter(call => call.span.start <= start && start < call.span.end)
        .sort((a,b) => a.span.end-a.span.start-(b.span.end-b.span.start));
      const call = calls[0], entry = call && hoverInfo(checked,file.path,call.callee.span.end-1);
      const tokens = call && lex(file.path,file.source).tokens.filter(token => call.span.start < token.span.start && token.span.end <= start);
      const label = tokens?.findLast(token => token.value === badLabel[1]);
      const candidates = entry?.parameters?.map(parameter => parameter.split('=')[0]).filter(name => !call.argLabels.includes(name) && distance(name,badLabel[1]) <= 2) ?? [];
      if (label) for (const name of candidates) fixes.push({title:`Use argument label ${name}`,issue,preferred:candidates.length===1,
        edits:[{file:file.path,start:label.span.start,end:label.span.end,text:name}]});
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
      add('Wrap statement in unsafe block', wrappedStatement(file, issue, 'unsafe', '}', checked.project.config));
    if (issue.code === 'PARSE' && issue.message === 'Use unless instead of throws in error contracts') {
      const start = offsetAt(file.source, issue.line, issue.column);
      add('Replace throws with unless', { file: file.path, start, end: start + 'throws'.length, text: 'unless' });
    }
    const borrow = /requires borrow ([A-Za-z_][A-Za-z0-9_]*)/.exec(issue.message);
    if (issue.code === 'BORROW' && borrow) {
      const name = borrow[1];
      const edit = wrappedStatement(file, issue, `borrow ${name}`, '}', checked.project.config);
      if (edit) {
        const overrides = new Map([...checked.project.files].filter(([,source]) => !source.builtin && !source.package).map(([path,source]) => [path,source.source]));
        overrides.set(file.path, file.source.slice(0,edit.start) + edit.text + file.source.slice(edit.end));
        const candidate = checkedProjectWithTests(checked.project.root, overrides);
        if (!candidate.diagnostics.some(diagnostic => diagnostic.severity !== 'warning')) fixes.push({
          title:`Wrap statement in borrow ${name} block`, issue, edits:[edit],
          description:`Grant exclusive mutable access to ${name} for this statement, then release the borrow. The compiler checked aliases, task captures, and the resulting project.`});
      }
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
      if (!callable) {
        const edit = wrappedStatement(file, issue, 'try',
          `} catch ${thrown[1]} error {\n    // Choose recovery here. Until then, preserve the failure.\n    throw error\n}`, checked.project.config);
        if (edit) fixes.push({title:`Scaffold recovery for ${thrown[1]}`,issue,edits:[edit],
          description:'This template rethrows the error. It remains incomplete until you choose a recovery policy; it does not log, discard the failure, or continue startup.'});
      }
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
  return fixes.map(fix => ({...fix, description:fix.description ??
    (fix.title.startsWith('Catch ') ? 'Report this startup failure and continue. Review the application’s recovery policy before accepting the handler.' :
      fix.title.startsWith('Propagate ') ? 'Keep this failure checked and make it visible to callers; their catch or propagation obligations may change.' :
      fix.title.includes('unsafe') ? 'Permit this native call inside an explicit unsafe boundary. The package’s native ownership and error contracts still apply.' :
      fix.title.startsWith('Import ') ? 'Add an explicit module dependency; existing export and privacy rules still apply.' :
      'Apply the shown source edit, then check the resulting program.')}));
}
