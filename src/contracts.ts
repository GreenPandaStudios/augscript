import type { ClassDecl, MethodDecl } from './ast.ts';
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

/** Effective constructor failures include validation and interception, using resolved identities. */
export function constructorErrors(checked: CheckedProject, node: ClassDecl) {
  return [...new Set([...(checked.constructorContracts.get(node)?.errors.map(tyName) ?? (node.validationErrors ?? []).map(ref =>
    tyName(schemaType(checked.project, ref, node.span.file)))),
    ...(checked.interceptorPlans.get(node) ?? []).flatMap(layer => layer.errors.map(tyName))])].sort();
}
