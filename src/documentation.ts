import type { MethodDecl, TypeRef } from './ast.ts';
import type { Definition, Project } from './project.ts';
import { javadocBefore, type Javadoc } from './javadoc.ts';

/** One documentation resolution path for checking, editor help, and context. */
export function callableDocumentation(project: Project, method: MethodDecl, owner?: Definition): Javadoc | undefined {
  const read = (method: MethodDecl) => javadocBefore(project.files.get(method.span.file)?.source ?? '',
    method.annotations?.[0]?.span.start ?? method.span.start);
  const direct = read(method);
  if (direct && !direct.markdown.includes('{@inheritDoc}')) return direct;
  if(method.forward?.implementationId){const definition=project.definitions.get(method.forward.implementationId);
    const inherited=definition?.node.kind==='function'?read(definition.node):undefined;
    if(!direct)return inherited;
    return inherited?{...direct,markdown:direct.markdown.replaceAll('{@inheritDoc}',inherited.markdown),parameters:new Map([...inherited.parameters,...direct.parameters])}:direct;
  }
  const seen = new Set<string>();
  const inherited = (file: string, refs: TypeRef[]): Javadoc | undefined => {
    for (const ref of refs) {
      const def = project.scopes.get(file)?.get(ref.name);
      if (!def || def.node.kind !== 'interface' || seen.has(def.id)) continue;
      seen.add(def.id);
      const target = def.node.methods.find(target => target.name === method.name);
      const doc = target && read(target) || inherited(def.file, def.node.extends);
      if (doc) return doc;
    }
  };
  const doc = owner && inherited(owner.file, owner.node.kind === 'class' ? owner.node.implements :
    owner.node.kind === 'interface' ? owner.node.extends : []);
  if (!direct) return doc || undefined;
  return doc ? { ...direct, markdown: direct.markdown.replaceAll('{@inheritDoc}', doc.markdown),
    parameters: new Map([...doc.parameters, ...direct.parameters]) } : direct;
}
