import {relative} from 'node:path';
import type {Project} from './project.ts';
import {libraryRelative} from './libraries.ts';

/** Source-visible locations use module/package identities, never host cache paths. */
export function sourceFileIdentity(project:Project,file:string):string {
  const unit=project.files.get(file);
  const scope=unit?.package?project.packages.scopes.get(unit.package):undefined;
  const identity=unit?.builtin?'august/'+libraryRelative(project.libraries,file):
    scope?scope.name+'@'+scope.version+'/'+relative(scope.sourceRoot,file):
    project.library?project.library.name+'@'+project.library.version+'/'+relative(project.sourceRoot,file):relative(project.root,file);
  return identity.replaceAll('\\','/');
}
