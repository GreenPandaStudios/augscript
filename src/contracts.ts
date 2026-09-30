import type { MethodDecl } from './ast.ts';
import type { CheckedProject } from './checker.ts';
import { schemaType } from './schemas.ts';
import { tyName } from './types.ts';

/** Checked contracts shared by the editor, documentation and wire schemas. */
export function callableResult(checked: CheckedProject, method: MethodDecl) {
  return checked.callableContracts.get(method)?.result ?? schemaType(checked.project, method.returns, method.span.file);
}

export function callableErrors(checked: CheckedProject, method: MethodDecl) {
  return [...new Set([...(checked.callableContracts.get(method)?.errors.map(tyName) ?? method.throws.map(type =>
    tyName(schemaType(checked.project, type, method.span.file)))),
    ...(checked.interceptorPlans.get(method) ?? []).flatMap(layer => layer.errors.map(tyName))])].sort();
}
