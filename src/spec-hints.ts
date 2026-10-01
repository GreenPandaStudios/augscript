import { existsSync, lstatSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, relative } from 'node:path';
import type { SourceFile } from './ast.ts';
import { checkProject, type CheckedProject } from './checker.ts';
import { loadProject } from './project.ts';
import { checkUnitTests, discoverTests, mergeTestAnalysis } from './testing.ts';
import {withSourceWriter,type SourcePermit} from './source-transaction.ts';

const marker = '// aug-spec: ';
export interface SpecHint { file: SourceFile; text: string; lineOffset: number }

/** One compiler-managed pointer. It gives readers an action and a precise neighboring filename. */
export function specHint(file: SourceFile): SpecHint {
  const newline = file.source.includes('\r\n') ? '\r\n' : '\n';
  const pointer = marker + JSON.stringify(basename(file.path) + '.md') + ' explains this file. Read it before changes; refresh with aug spec.' + newline;
  const old = file.source.startsWith(marker) ? (file.source.includes('\n') ? file.source.indexOf('\n') + 1 : file.source.length) : 0;
  const body = old ? file.source.slice(old) : file.source;
  return {file, text:pointer+body, lineOffset:old?0:1};
}

/** Prepare hints before native emission so debugger/source-map lines use the updated sources. */
export function updateSpecHints(checked: CheckedProject,permit?:SourcePermit): CheckedProject {
  const hints = [...checked.project.files.values()].filter(file=>!file.builtin&&!file.package).map(specHint)
    .filter(hint=>hint.text!==hint.file.source);
  if (!hints.length) return checked;
  if(!permit)return withSourceWriter(checked.project.root,held=>updateSpecHints(checked,held));
  if (checked.diagnostics.some(issue=>issue.severity!=='warning')) throw new Error('Fix compiler errors before adding specification pointers');
  for (const {file} of hints) {
    const root=checked.project.root;
    if(relative(root,file.path).startsWith('..'))throw new Error('Specification pointer escapes the project');
    let parent=dirname(file.path);
    while(parent!==root&&parent!==dirname(parent)) {
      if(lstatSync(parent).isSymbolicLink())throw new Error('Specification source directory is a symbolic link');
      parent=dirname(parent);
    }
    if(lstatSync(file.path).isSymbolicLink())throw new Error('Specification source is a symbolic link');
    if(readFileSync(file.path,'utf8')!==file.source)throw new Error('Source changed during compilation; retry before generating specifications');
  }
  for(const {file,text} of hints) {
    const temporary=file.path+'.aug-spec-tmp';
    let created=false;
    try {writeFileSync(temporary,text,{flag:'wx',mode:lstatSync(file.path).mode});created=true;renameSync(temporary,file.path);}
    finally {if(created&&existsSync(temporary))rmSync(temporary);}
  }
  const project=loadProject(checked.project.root,new Map(),undefined,permit), fresh=checkProject(project), discovery=discoverTests(project);
  const tests=checkUnitTests(project,discovery.tests);
  fresh.diagnostics.push(...discovery.diagnostics,...tests.flatMap(test=>test.checked.diagnostics));
  mergeTestAnalysis(fresh,tests);
  return fresh;
}
