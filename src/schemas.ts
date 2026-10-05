import type { TypeRef } from './ast.ts';
import type { Definition, Project } from './project.ts';
import type { Ty } from './types.ts';

export function schemaType(project: Project, ref: TypeRef, file: string, parameters = new Map<string, Ty>()): Ty {
  const param = parameters.get(ref.name);
  if (param) return {...param, nullable: param.nullable || ref.nullable, optional: ref.optional || param.optional};
  const def = project.scopes.get(file)?.get(ref.name);
  return {id: def?.id ?? 'builtin:' + ref.name, name: ref.name,
    kind: def?.node.kind === 'class' ? 'class' : def?.node.kind==='choice'?'choice':def ? 'interface' : 'builtin', def,
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

export interface DataSchema {
  name: string; kind: string; nullable: boolean; optional: boolean;
  fields: string[]; labels: string[]; maker?: string;
}

/** Backend-neutral, resolved schema graph shared by HTTP and JSON decoding. */
export class DataSchemas {
  private names = new Map<string, string>();
  readonly nodes: DataSchema[] = [];
  private project: Project;
  private constructorName: (definition: Definition) => string;
  constructor(project: Project, constructorName: (definition: Definition) => string) {
    this.project = project; this.constructorName = constructorName;
  }
  request(type: Ty): string {
    const key = JSON.stringify(this.identity(type));
    const previous = this.names.get(key); if (previous) return previous;
    const name = 'aug_schema_' + this.names.size;
    this.names.set(key, name);
    const schema: DataSchema = {name, kind: type.name.toUpperCase(), nullable: type.nullable,
      optional: !!type.optional, fields: [], labels: []};
    this.nodes.push(schema);
    if (type.def?.node.kind === 'class' && type.def.node.record) {
      schema.kind = 'RECORD';
      const node = type.def.node, params = new Map(node.typeParams.map((param, i) => [param, type.args[i]]));
      schema.fields = node.fields.map(field => this.request(schemaType(this.project, field.type, type.def!.file, params)));
      schema.labels = node.fields.map(field => field.name); schema.maker = this.constructorName(type.def);
    } else schema.fields = type.args.map(arg => this.request(arg));
    return name;
  }
  private identity(type: Ty): unknown { return [type.id, type.nullable, !!type.optional, type.args.map(arg => this.identity(arg))]; }
}

/** C representation of the same checked concrete schema graph. */
export class NativeSchemas extends DataSchemas {
  declarations(): string {
    return [...this.nodes.map(schema => `static const AugSchema ${schema.name};`), ...this.nodes.flatMap(schema => {
      const {name, fields, labels} = schema;
      return [
        ...(fields.length ? [`static const AugSchema *const ${name}_fields[] = {${fields.map(field => '&' + field).join(', ')}};`] : []),
        ...(labels.length ? [`static const char *const ${name}_names[] = {${labels.map(label => JSON.stringify(label)).join(', ')}};`] : []),
        `static const AugSchema ${name} = {AUG_SCHEMA_${schema.kind}, ${schema.nullable ? 'true' : 'false'}, ${schema.optional ? 'true' : 'false'}, ${fields.length}, ${fields.length ? name + '_fields' : 'NULL'}, ${labels.length ? name + '_names' : 'NULL'}, ${schema.maker ?? 'NULL'}, NULL};`
      ];
    })].join('\n');
  }
}
