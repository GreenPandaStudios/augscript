import type { Definition } from './project.ts';

export interface Ty {
  id: string;
  name: string;
  kind: 'builtin' | 'class' | 'interface' | 'interceptor' | 'resource' | 'param' | 'null' | 'error';
  args: Ty[];
  nullable: boolean;
  optional?: boolean;
  frozen?: boolean;
  immutable?: boolean;
  def?: Definition;
  bounds?: Ty[];
  readonly?: boolean;
}

export function tyName(type: Ty): string {
  return (type.optional || type.nullable ? 'optional ' : '') + (type.immutable ? 'immutable ' : '') + type.name + (type.args.length ? `<${type.args.map(tyName).join(', ')}>` : '');
}

export function sameType(left: Ty, right: Ty): boolean {
  return left.id === right.id && !!left.immutable === !!right.immutable && (left.nullable || !!left.optional) === (right.nullable || !!right.optional) &&
    left.args.length === right.args.length && left.args.every((arg, i) => sameType(arg, right.args[i]));
}

export function containsUnknown(type: Ty): boolean {
  return type.kind === 'error' || type.kind === 'param' || type.args.some(containsUnknown);
}

/** Deep freezing changes permission, not representation or the data's identity. */
export function immutableType(type: Ty): Ty {
  const collection = ['List', 'Map', 'Set', 'Tuple'].includes(type.name);
  return {...type, immutable: collection || type.immutable, readonly: true, frozen: true,
    args: type.args.map(immutableType)};
}
