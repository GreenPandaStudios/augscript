import { writeFileSync } from 'node:fs';
import { snippetCatalog, snippetBody } from '../src/snippets.ts';
const output = Object.fromEntries(snippetCatalog.map(snippet => [snippet.description, {
  prefix: snippet.prefix, body: snippetBody(snippet.body, 'indent').split('\n'), description: snippet.description
}]));
writeFileSync(new URL('../vscode/augscript.code-snippets', import.meta.url), JSON.stringify(output, null, 2) + '\n');
