import {libraryCatalog} from '../src/library-catalog.ts';
export function libraryCatalogPage() {
  const {entries} = libraryCatalog();
  const lines = ['[//]: # (Generated from src/library-catalog.ts and native/library-catalog.json.)',
    '# Find a library', '',
    'Search by the task you need to perform: SQL, compression, JSON, hashing or tensors. The curated catalog includes bundled modules and ordinary repository packages. Native entries identify reviewed public tags or exact repository commits and their declared artifact pins.', '',
    '**Unreleased CLI command:**', '', '```sh', 'aug libraries sql', 'aug libraries compression', 'aug libraries tensors --json', '```', '',
    'Search works offline and writes nothing. The results explain imports, ownership, requirements, license notes and tests. JSON also includes source commits and native artifact checksums. A catalog entry does not install a package or verify downloaded bytes; `aug add` performs normal dependency resolution and integrity checks.', '',
    '| Library | Task | Access |', '| --- | --- | --- |',
    ...entries.map(entry=>`| [${entry.title}](#${entry.id}) | ${entry.summary} | ${entry.source.kind==='bundled'?'Bundled with this compiler':'Repository package'} |`), '',
    'Native host constraints below come from each selected manifest. They describe available selections, while the linked tests and qualification guides describe behavior evidence. Keep each artifact’s notices when redistributing an application. The import blocks below are fragments. Follow the linked examples for complete programs and read the package’s public API for each call contract.', ''];
  for(const entry of entries) {
    lines.push(`## ${entry.title} {#${entry.id}}`, '', entry.summary, '', entry.requirements, '');
    if(entry.source.kind==='bundled')lines.push(`Import \`${entry.source.module}\` from the compiler’s core library. ${entry.id==='io'?'':'These additions are unreleased.'}`, '');
    else lines.push(`Source: [${entry.version}](${entry.source.request.replace(/#([^#]+)$/,'/tree/$1')}).`, '', '```sh', entry.install, '```', '');
    lines.push('```text',entry.example,'```','',entry.ownership,'');
    if(entry.compilerRequirement)lines.push(`Declared compiler requirement: \`${entry.compilerRequirement}\`.`, '');
    else lines.push(`This source folder has no declared compiler constraint. Its catalog reference targets August ${entry.testedCompiler}; check it with the compiler used by your project.`, '');
    if(entry.artifacts.length) {
      lines.push('| Host | Runtime requirement |', '| --- | --- |');
      for(const artifact of entry.artifacts) {
        const target=artifact.target,parts=[target.minimumOS ? `macOS ${target.minimumOS}+` : `${target.libc} ${target.minimumLibc}+`,target.cpuBaseline];
        if(target.cxxRuntime)parts.push(target.cxxRuntime);
        lines.push(`| \`${target.triple}\` | ${parts.join('; ')} |`);
      }
      lines.push('');
    }
    lines.push(`${entry.license.summary} [License details](${entry.license.url}).`, '',
      `${entry.tests.summary} [Read the tests and example](${entry.tests.url}).`, '');
  }
  lines.push('## Use another repository', '',
    'The catalog is not a package registry. Your own library needs a narrow `export.aug` and may supply an August manifest for native artifacts and compatibility requirements. Share its repository URL or tag, then use the same `aug add` and import workflow. See [packages](packages.md) and [native bindings](native-packages.md).', '');
  return lines.join('\n');
}
