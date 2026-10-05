import {createHash} from 'node:crypto';
import type {SemanticGraph} from './symbols.ts';

/** Checked-edit revision domain includes the semantic revision and the captured
 * physical dependency identities. Rejected candidates use this same domain. */
export function checkedChangeRevision(graph:Pick<SemanticGraph,'revision'|'dependencies'>,dependencies=graph.dependencies):string {
  return createHash('sha256').update(JSON.stringify({semanticRevision:graph.revision,dependencies})).digest('hex');
}
