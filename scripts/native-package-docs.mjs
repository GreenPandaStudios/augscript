import {readFileSync} from 'node:fs';
import {join} from 'node:path';

/** Reader examples share the canonical projects used by real native consumers. */
export function nativePackageExamples(root) {
  const compiler=JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version;
  const packages=JSON.parse(readFileSync(join(root,'native/library-qualification.json'),'utf8')).targets['darwin-arm64'];
  const entries=[
    ['pytorch','CPU tensors','tensors.aug','LibTorch creates two float64 tensors, adds them, and sums the result to 21. The test also checks each result element. Each owned handle releases its native tensor at scope exit, including failures. GPU support and wider PyTorch APIs are deferred.'],
    ['sqlite','A SQLite database','database.aug','SQLite opens an in-memory database, creates a table, inserts a bound parameter, and queries it. The query returns August. Updates happen inside a borrow, and the owned database closes when the operation ends.'],
    ['zlib','A compression round trip','compression.aug','zlib compresses a UTF-8 buffer and decompresses it with a 4,096-byte output limit. The test checks the restored text and byte length. The adapter releases the native buffers after copying them.'],
    ['blake3','A Rust hash function','hashing.aug','The Rust BLAKE3 crate hashes abc. Its result must match the published 64-character digest checked by the test. The Rust adapter copies the output and catches unwinding panics before returning through the C ABI.']
  ];
  const lines=['---','generated: true','source: examples/native-*','editLink: false','---','','# Use native library packages','',
    `Use LibTorch, SQLite, zlib, and Rust BLAKE3 through ordinary repository imports. Install the [August ${compiler} CLI](getting-started.md) on a [supported host](compatibility.md). It downloads the required native libraries; no separate compiler or SDK is needed.`,'',
    'Save each program’s two files in one folder. Run `aug run` to install its dependencies, compile it, and execute it. Run `aug test` to check the same-file test, or download the complete project from its link below.'];
  for(const [name,title,helper,description] of entries) {
    const version='v'+packages[name].version;
    const directory='examples/native-'+name;
    lines.push('',`## ${title}`,'',description,'',
      `[Package repository](https://github.com/GreenPandaStudios/aug-${name}/tree/${version}) · [Code, specs, and download](${directory}/index.md)`,'');
    for(const file of ['main.aug',helper])lines.push(`**${file}**`,'','```text',readFileSync(join(root,directory,file),'utf8').replace(/^\/\/ aug-spec:.*\n/,'').trim(),'```','');
    lines.push('```sh','aug run','aug test','aug spec','```');
  }
  lines.push('','## Reuse a short import name','',
    'The URL in each import selects a release tag; installation resolves it to a source commit and native artifact hashes in `aug.lock.json`. An alias is useful when several files use the package:','',
    '```sh',`aug add https://github.com/GreenPandaStudios/aug-zlib#v${packages.zlib.version} --as zlib`,'```','',
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
    'Before deployment, review the package’s tests, supported platforms, build provenance, and license notices. The descriptor cannot establish that the native code honors its ownership rules.');
  return lines.join('\n')+'\n';
}
