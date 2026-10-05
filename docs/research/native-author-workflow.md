# Local native author verification

This unreleased checkpoint prepares E05 without introducing a separate native
package system. The existing format-2 manifest, ABI-1 descriptor, HTTPS artifact
pins, source imports and native locks remain authoritative. A maintainer can
verify a locally built archive before making its URL public, then exercise it
through a normal offline August application.

`aug package cache-native DIRECTORY --artifact ID --archive FILE` chooses one
validated manifest entry. It checks the reviewed descriptor and exact archive
identity, streams bounded extraction, verifies every member and every declared
deployment file, then rechecks package metadata before cache promotion. It
rejects linked/special source archives and checks local bytes on cache hits.
The report identifies package, descriptor, metadata and artifact; execution and
publication remain `not-run`. It does not qualify the native implementation's
ownership promises or another target's behavior.

## Integrity prerequisite

An independent regression reproduced acceptance of a replaced cached library
when its cached `files.json` was regenerated to match. That manifest was not
anchored to the source-owned archive checksum. Compiler packs already have
compiler-owned member-manifest pins; package manifests retain their existing
format and archive digest.

The cache now retains the original compressed archive beside its extracted
directory. For unpinned member manifests, a single regular-file descriptor
supplies both the archive checksum and streamed parser. Only the original
manifest is hashed; other contents are drained under path, type, count and size
bounds. The header walk uses the pinned tar library's public header/PAX decoders
and counts metadata headers and payloads too, including empty metadata. Cached
member hashing uses bounded regular-file descriptors; it neither opens a FIFO
nor allocates a whole native library. Gzip decompression uses the already
pinned MIT-licensed `minizlib` 3.1.0 as a direct CLI dependency. Its synchronous
write expands input before delivering output; the verifier supplies at most
4 KiB of compressed input per write before enforcing decoded-header bounds.
The manifest hash recovered from the authenticated archive must match the cached
manifest before member hashes are used. Cached files cannot supply their own trust anchor. Legacy
caches without the transport require an authenticated online restore; failed
restoration preserves their bytes. The explicit local command can supply that
same original archive without network access.

Retaining and parsing the transport costs cache space and decompression work.
The subsequent optional source-owned member-manifest pin avoids that work for
newly published artifacts, but cannot authenticate older caches by itself. This
checkpoint preserves public manifest and lock compatibility. It does not claim
protection from an attacker who can also modify trusted source pins or replace
the compiler.

## Source-owned member pins

The following checkpoint accepts an optional `fileManifestSha256` in a native
artifact entry. It reuses the compiler-pack verifier: first installation still
authenticates and checks the full original archive, and hot caches verify exact
member bytes against the source-owned manifest digest. Source and target locks
retain it; changing either lock selection cannot bypass source verification.
Malformed pins, mismatched original manifests and paired cache tampering reject.
Legacy packages keep the retained-archive path. The installed local C fixture
uses the new pin while the public zlib consumer retains the old package format.
This adds no native calling convention or ownership rule.

## Sources and verification

The implementation is [archive authentication](../../src/native-archive.ts),
[shared installation](../../src/native-artifacts.ts) and
[CLI parsing](../../src/cli.ts). Public regressions cover
[cache integrity](../../tests/native-artifacts.test.mjs),
[author input and metadata](../../tests/native-local-archives.test.mjs),
[doctor](../../tests/setup-report.test.mjs) and
[tagged release reports](../../tests/package-publishing.test.mjs).

The [installed author gate](../../scripts/test-local-native-author.mjs) builds an
actual fixed-width C identity function with explicit maintainer Clang/ar, checks
its header, caches the real static archive through packaged JavaScript and runs
signed integer boundary values through ordinary source imports and LLVM.
Artifacts and toolchains belong to isolated test output. This does not qualify
an automatic scaffold, source-build fallback, hosted artifact production or
clean default compiler download.

The final focused gates passed 24 direct cases and 95 neighboring checks. The
installed CLI also downloaded the real public zlib repository and native archive
into empty private caches and ran compression/decompression through LLVM, then
repeated offline. Native tools were absent from the consumer PATH; the test used
selected contributor LLVM/runtime packs, so it does not qualify their default
download. The frozen full suite passed 985 of 989, skipped three optional/cold
checks and retained the independently reproduced host LLDB launch timeout. Both
review axes, type checking, documentation/site, archive and installed-package
gates passed. See the [catalog evidence](developer-ergonomics-status.md).

The subsequent member-pin checkpoint passed 38 direct native cases and 91
neighboring checks. Both reviews verified cold rejection and offline pinned
reuse; the repaired installed fixture and public zlib consumer passed. Type,
documentation/site, release archives and version gates passed. The full-suite
result above belongs to the preceding archive checkpoint.
