import type { TypeRef } from './ast.ts';
import type { Definition, Project } from './project.ts';
import type { Ty } from './types.ts';

export function schemaType(project: Project, ref: TypeRef, file: string, parameters = new Map<string, Ty>()): Ty {
  const param = parameters.get(ref.name);
  if (param) return {...param, nullable: param.nullable || ref.nullable, optional: ref.optional || param.optional};
  const def = project.scopes.get(file)?.get(ref.name);
  return {id: def?.id ?? 'builtin:' + ref.name, name: ref.name,
    kind: def?.node.kind === 'class' ? 'class' : def ? 'interface' : 'builtin', def,
    nullable: ref.nullable, optional: ref.optional, args: ref.args.map(arg => schemaType(project, arg, file, parameters))};
}
export function jsonDataType(project: Project, type: Ty, seen = new Set<string>()): boolean {
  if (['int', 'c_int', 'float', 'bool', 'string', 'Json'].includes(type.name) && type.kind === 'builtin') return true;
  if (type.kind === 'builtin' && ['List', 'Set', 'Tuple', 'Map'].includes(type.name))
    return (type.name !== 'Map' || type.args[0]?.name === 'string') && type.args.every(arg => jsonDataType(project, arg, seen));
  const node = type.def?.node;
  if (node?.kind !== 'class' || !node.record || node.fields.some(field => field.name.startsWith('_'))) return false;
  if (seen.has(type.id)) return true;
  seen.add(type.id);
  const params = new Map(node.typeParams.map((name, i) => [name, type.args[i]]));
  return node.fields.every(field => jsonDataType(project, schemaType(project, field.type, type.def!.file, params), seen));
}

/** One shared native schema per concrete type, used by HTTP and explicit JSON decoding. */
export class NativeSchemas {
  private names = new Map<string, string>();
  private output: string[] = [];
  private forwards: string[] = [];
  private project: Project;
  private constructorName: (definition: Definition) => string;
  constructor(project: Project, constructorName: (definition: Definition) => string) {
    this.project = project; this.constructorName = constructorName;
  }
  request(type: Ty): string {
    const key = JSON.stringify(this.identity(type));
    const previous = this.names.get(key); if (previous) return previous;
    const name = 'aug_schema_' + this.names.size;
    this.names.set(key, name); this.forwards.push(`static const AugSchema ${name};`);
    let kind = 'AUG_SCHEMA_' + type.name.toUpperCase(), fields: string[] = [], labels: string[] = [], maker = 'NULL';
    if (type.def?.node.kind === 'class' && type.def.node.record) {
      kind = 'AUG_SCHEMA_RECORD';
      const node = type.def.node, params = new Map(node.typeParams.map((param, i) => [param, type.args[i]]));
      fields = node.fields.map(field => '&' + this.request(schemaType(this.project, field.type, type.def!.file, params)));
      labels = node.fields.map(field => JSON.stringify(field.name)); maker = this.constructorName(type.def);
    } else fields = type.args.map(arg => '&' + this.request(arg));
    if (fields.length) this.output.push(`static const AugSchema *const ${name}_fields[] = {${fields.join(', ')}};`);
    if (labels.length) this.output.push(`static const char *const ${name}_names[] = {${labels.join(', ')}};`);
    this.output.push(`static const AugSchema ${name} = {${kind}, ${type.nullable ? 'true' : 'false'}, ${type.optional ? 'true' : 'false'}, ${fields.length}, ${fields.length ? name + '_fields' : 'NULL'}, ${labels.length ? name + '_names' : 'NULL'}, ${maker}};`);
    return name;
  }
  private identity(type: Ty): unknown { return [type.id, type.nullable, !!type.optional, type.args.map(arg => this.identity(arg))]; }
  declarations(): string { return [...this.forwards, ...this.output].join('\n'); }
}
