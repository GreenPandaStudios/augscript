import {readFileSync} from 'node:fs';
import {join} from 'node:path';

/** Reader examples share the canonical projects used by real native consumers. */
export function nativePackageExamples(root) {
  const entries=[
    ['pytorch','v0.1.4','CPU tensors','tensors.aug','LibTorch creates two float64 tensors, adds them, and sums the result to 21. The test also checks each result element. Each owned handle releases its native tensor at scope exit, including failures. GPU support and wider PyTorch APIs are deferred.'],
    ['sqlite','v0.1.3','A SQLite database','database.aug','SQLite opens an in-memory database, creates a table, inserts a bound parameter, and queries it. The result is August. Mutation occurs within borrow; the owned database closes when the operation ends.'],
    ['zlib','v0.1.3','A compression round trip','compression.aug','zlib compresses a UTF-8 buffer and decompresses it with a 4,096-byte output limit. The test checks the restored text and byte length. Copied buffers use the adapter’s paired release operation.'],
    ['blake3','v0.1.3','A Rust hash function','hashing.aug','The Rust BLAKE3 crate hashes abc. Its result must match the published 64-character digest checked by the test. The Rust facade copies its output and contains unwinding panics before returning through the C ABI.']
  ];
  const lines=['---','generated: true','source: examples/native-*','editLink: false','---','','# Use native library packages','',
    'These complete programs call real LibTorch, SQLite, zlib, and Rust BLAKE3 implementations. They use ordinary repository imports and the published August 0.21.0 toolchain. Install the [CLI](getting-started.md) on a [supported host](compatibility.md); no native compiler or SDK is required.','',
    'For each program, save its two files in one folder. `aug run` installs and locks the source/native dependencies, compiles through LLVM, and runs it. `aug test` checks the nearby case. The source below is generated from the same canonical projects as the downloadable gallery.'];
  for(const [name,version,title,helper,description] of entries) {
    const directory='examples/native-'+name;
    lines.push('',`## ${title}`,'',description,'',
      `[Package repository](https://github.com/GreenPandaStudios/aug-${name}/tree/${version}) · [Code, specs, and download](${directory}/index.md)`,'');
    for(const file of ['main.aug',helper])lines.push(`**${file}**`,'','```text',readFileSync(join(root,directory,file),'utf8').replace(/^\/\/ aug-spec:.*\n/,'').trim(),'```','');
    lines.push('```sh','aug run','aug test','aug spec','```');
  }
  lines.push('','## Reuse a short import name','',
    'The URL in each import selects a release tag; installation resolves it to a source commit and native artifact hashes in `aug.lock.json`. An alias is useful when several files use the package:','',
    '```sh','aug add https://github.com/GreenPandaStudios/aug-zlib#v0.1.3 --as zlib','```','',
    'Then import `compress` and `decompress` from `zlib`. Keep the lock in source control. After an online build on the current host, `aug run --offline --frozen` requires the recorded compiler and library artifacts.','',
    '## Author and publish a binding','',
    'A native package uses the same `aug-package.json` and `export.aug` boundary as a source package. It adds `native.abi.json`, a reviewed C adapter header, native implementation/build files, and release archives for its declared targets. The descriptor identifies ownership, errors, release functions, OS/libc requirements, dependencies, and archive hashes. Follow [native packages](native-packages.md#author-a-binding) for header checking, artifact integrity, and deployment requirements.','',
    'C++ classes and Rust crate layouts stay behind C-compatible exports. Build and test those adapters in the maintainer’s pinned toolchain; consumers download the resulting archives. Installation runs no executable package recipes. Publish immutable source tags and matching artifacts, then verify an ordinary August import from a clean consumer environment.','',
    '## Diagnose installation failures','',
    '| Failure | Action |','| --- | --- |',
    '| Unsupported OS, architecture, or libc | Use a supported host or a package release with a qualified matching target. |',
    '| Missing archive or network failure | Check the named release artifact and network access; there is no automatic source build. |',
    '| Checksum or descriptor mismatch | Restore the published artifact/descriptor pair. Do not suppress verification. |',
    '| Missing frozen compiler selection | Build once online on this host, review the new lock entry, then use frozen mode. |',
    '| Moved executable cannot load a library | Move its adjacent lib and share directories with it. |','',
    'A native descriptor describes a contract; it does not prove the foreign implementation obeys it. Review the package’s tests, provenance, platform qualification, and license notices before deployment.');
  return lines.join('\n')+'\n';
}
