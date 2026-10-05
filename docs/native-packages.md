# Native libraries as August packages

Import a native library like any other August package. The package supplies August bindings and prebuilt libraries for supported hosts. Your application uses typed functions and owned resources; the bindings handle native pointers.

August 0.23.0 supports macOS 14+ on Apple Silicon and GNU/Linux x86-64/ARM64 with glibc 2.36+. It downloads the LLVM tools and libraries it needs, so consumers need Node 24 but no separate native compiler or SDK. Native packages require the LLVM backend. Musl and cross-compilation are unsupported; incompatible hosts are rejected before compilation.

## Import a library

The [PyTorch](https://github.com/GreenPandaStudios/aug-pytorch),
[SQLite](https://github.com/GreenPandaStudios/aug-sqlite),
[zlib](https://github.com/GreenPandaStudios/aug-zlib), and
[BLAKE3](https://github.com/GreenPandaStudios/aug-blake3) repositories publish
source and native preview archives for all three platforms: PyTorch `v0.1.6` and
the other three packages `v0.1.5`. Use [August 0.23.0](https://github.com/GreenPandaStudios/augscript/releases/tag/v0.23.0) with these releases.

Use the normal package commands. This example adds CPU LibTorch under a short name:

```sh
aug add https://github.com/GreenPandaStudios/aug-pytorch#v0.1.6 --as pytorch
aug run
```

Save this program in `main.aug`:

```text
import Tensor and TensorError and tensor and add and sum from pytorch

try:
    own Tensor left = tensor(values=[1.0, 2.0, 3.0])
    own Tensor right = tensor(values=[4.0, 5.0, 6.0])
    own Tensor result = add(left, right)
    print(value=sum(tensor=result)) // 21
catch TensorError error:
    print(value=error.message)
```

`own` makes each tensor's lifetime explicit. Leaving its scope releases the
native tensor, including when a call fails. Reading a tensor lends it for the
duration of the call. Passing it to an owned input transfers responsibility to
the callee. Replacing an owned field releases its previous value immediately.

SQLite, zlib, and Rust BLAKE3 use the same package path. The
[package examples](native-package-examples.md) show their operations; the
[support summary](native-implementation.md) describes the qualified platforms and current limits.

Read the complete projects with their compiled explanations:
[PyTorch](examples/native-pytorch/index.md),
[SQLite](examples/native-sqlite/index.md),
[zlib](examples/native-zlib/index.md), and
[Rust BLAKE3](examples/native-blake3/index.md). Each includes a same-file test and
a downloadable project. Native dependency pages link to the exact binding
descriptor, so ownership and native boundaries stay visible beside the code.

The [ABI reference](native-abi.md) specifies scalar and buffer mappings, the error record, resource lifetimes and thread requirements. [Package compatibility](package-compatibility.md) records the versioned formats and unreleased upgrade/recovery behavior.

## Start a C package

**Unreleased:** the native starter builds a real signed-integer identity function
on macOS ARM64. It needs a maintainer's Clang, macOS SDK and `ar`; consumers do
not need these tools. Supply your package name, prospective repository and
artifact URLs, and a license you are entitled to use:

```sh
identity_repository=https://github.com/example/aug-identity
identity_artifact="$identity_repository/releases/download/v0.1.0/macos-arm64.tar.gz"
aug package init identity --native c \
  --name @example/identity \
  --repository "$identity_repository" --artifact-url "$identity_artifact" \
  --license ./LICENSE \
  --clang /usr/bin/clang --ar /usr/bin/ar
```

The URLs describe where you intend to publish; the command creates no repository
or upload. It builds in isolation and checks the real C header, August bindings
and same-file tests before creating the project. Build or check failures preserve
a new or empty destination. A populated or linked destination is rejected. A
writer-cleanup failure after creation reports `NATIVE_INIT_COMMITTED` and preserves
the completed project; inspect its remaining lock before retrying.

`src/export.aug` publishes `identity` from `src/api.aug`. That file holds the
private native declaration, safe wrapper and tests. The C header and implementation
live in `native/include/api.h` and `native/adapter.c`. Review `native.abi.json`
and the tool/input record in `native/build.json`; inputs are call-local and
worker permission is false. This scalar starter owns no native handles.

The measured archive is `.aug-build/native/macos-arm64.tar.gz`, with member
hashes, checked-header evidence, provenance and your supplied notices. Cache it
locally, then execute the tests and compile its explanation:

```sh
cd identity
aug package cache-native . --artifact macos-arm64 \
  --archive .aug-build/native/macos-arm64.tar.gz
aug check
aug test --backend llvm
aug spec
aug package check
```

The first test run downloads the pinned August compiler and runtime packs if
they are not cached. The native library comes from the local archive; its
prospective publication URL is not needed. Later tests can use
`aug test --offline --backend llvm`. These steps execute the actual C implementation
through LLVM. Initialization alone does not execute it. A neighboring application can declare
`identity: "../identity"` under `packages` in `main.yaml`, import
`identity` from that alias, and call `identity(value=7)`. Run the application
with `aug run --offline` after caching the archive. Publish that exact archive
at the declared URL before sharing a tagged repository import.

The starter honors the normal block, indentation and assignment preferences.
Its `AGENTS.md` starts at the library's export surface and directs tools to
adjacent compiled specs. Automatic rebuilds after edits, more native types,
additional author targets and hosted artifact-production jobs remain outside
this first profile. Use your reviewed maintainer build to extend it and refresh
all measured pins; installation never runs a package recipe. Existing C++ and
Rust libraries continue to use their reviewed C adapters.

## Check and generate bindings

Binding maintainers can use the preview's `aug bind header` command. Supply a
reviewed `native.abi.json` ownership contract and the adapter's C header. The
command uses your explicitly selected Clang; it does not install a toolchain or
run a package recipe.

```sh
aug bind header native/include/aug_zlib.h \
  --contract native.abi.json \
  --target aarch64-apple-darwin \
  --clang /path/to/pinned/clang \
  --output .aug-build/checked-bindings
```

For GNU/Linux, select `x86_64-unknown-linux-gnu` or
`aarch64-unknown-linux-gnu` in the corresponding maintainer environment. Extra
Clang include, macro and sysroot flags follow `--`. Pin the Clang version in the package's build recipe.

The command checks physical function types, fixed-width integers, byte booleans,
buffer lengths, output pointers, release signatures and the ABI error record's
size, alignment and field offsets. It rejects unsigned results declared as
August signed integers. Resource input pointers must match their release
function, and mutable loans cannot use const pointers. It writes generated
`src` declarations, the descriptor and `header-check.json` only after every
check passes. Existing output directories are preserved.

Review the generated imports and declarations, then copy them into the package
beside its handwritten error types and safe API. The command does not invent an
error class or public wrapper. Include the checked report in native build
provenance and repeat the check whenever headers, compiler flags or descriptors
change. The report records compiler, target, header digests and signatures.

The header check cannot verify ownership, allocator pairing, pointer retention, or thread behavior. Test those in the native adapter. C++ and Rust packages provide C
adapter headers for this command. Templates, callbacks, variadic calls and
aggregate values are outside the initial binding profile.

## Installation and deployment

The lockfile keeps a compiler and runtime selection for each host under `native.compilers`. Building on Linux preserves an existing macOS selection. Run `aug build --backend llvm` once on each new host before using `--frozen` there. A frozen build requires a recorded selection for that host.

`aug.lock.json` records the source revision, binding digest, selected native
archive, compiler pack, and runtime identity. Archive downloads are bounded and
SHA-256 checked. Extraction rejects links, traversal, duplicate paths, and
unexpected files. Cached files are checked again before use. Package installation
does not execute native recipes or npm lifecycle scripts.

**Unreleased:** cached native file manifests are authenticated against the
original archive's published checksum before their member hashes are used when the package has no separate manifest pin.
Changing a library and regenerating its cached manifest is rejected. The cache
retains the compressed archive outside the extracted library directory. An older
cache without that archive needs one online `aug install`; offline use rejects
it. Compiler packs with a compiler-owned manifest pin retain their existing
verification path.

**Unreleased:** a native artifact may also declare `fileManifestSha256`, the
lowercase SHA-256 digest of the exact bytes of its `fileManifest` file. Compute
it from the archive's final manifest, including its whitespace. The first
installation checks that pin against the original archive; subsequent cache
checks use the source-owned pin and verify every member without decompressing
the archive again. The pin is preserved in both source and native target locks.
It does not replace the outer archive checksum or download/unpacked bounds.

`maximumUnpackedBytes` limits the total extracted file bytes, including the member manifest. Tar extension metadata has a separate 1 MiB aggregate limit; every header counts toward the 20,000-entry limit. August also bounds the complete expanded transport, including padding. GNU long filenames and PAX metadata therefore work with exact file-size bounds without accepting unbounded metadata.

Older CLI releases reject this new field as unsupported metadata. Packages
without it continue to use the authenticated original archive.

A failed download or extraction leaves no accepted artifact cache. Disk-full
errors include the CLI's space-recovery guidance; they do not leave a partially
installed library selected by a lockfile.

**Unreleased:** `aug install`, `aug add` and automatic source preparation in `aug run` verify native artifacts before publishing a new source lock. A rejected artifact preserves the previously accepted graph; `aug add` also restores its dependency aliases.

A missing or incompatible artifact produces an error. Installation never falls back to a source build.
Use `aug run --offline --frozen` after an online installation to require the
recorded artifacts without downloading replacements.

Public GitHub source downloads use HTTPS and do not require Git. If GitHub's
shared API rate limit stops installation, retry later or set `AUG_GITHUB_TOKEN`
to authenticate API reads. August sends this token only to `api.github.com`,
rejects redirects, and never writes it to source caches or lockfiles.

Keep the executable together with its adjacent `lib` and `share` directories.
The libraries load relative to the executable. `share/august-native` preserves
the selected packages' notices, provenance, and file manifests.

**Unreleased:** [`aug bundle`](tooling.md#create-a-deployment-bundle-unreleased) assembles this deployment directory and records its complete file hashes and platform requirements. `aug bundle verify` checks it without running native code.

## Author a binding

Declare an opaque resource with `extern C resource Handle` and name its release function in `native.abi.json`. The declaration and descriptor must agree. Keep extern calls inside `unsafe`, and export safe August wrappers through `export.aug`.

The checker validates binding signatures and ownership at August call sites. Hover and compiled specs explain the provider, supported targets, loan duration, and cleanup. The native implementation must honor its declared retention, thread, and exception rules. `aug context` finds native dependencies through resolved standalone calls; member-dispatch coverage remains incomplete.

The initial ABI uses fixed-width scalars, pointer-and-length inputs, copied
buffers, opaque handles, and checked status errors. C++ wrappers catch exceptions
and Rust exports contain panics before returning through C. Sharing LLVM does
not make C++, Rust, and August layouts compatible.

Build and test each artifact with the toolchain recorded in its provenance. Callback registration, retained
loans, foreign threads, native struct layout, GPU tensors, and exporting August
libraries have not been qualified. See the
[native compilation design](native-interop-llvm-plan.md).

Linux maintainers build on Debian 12 so newer hosts do not raise the artifact's
glibc requirement. The compiler checks the declared minimum; maintainer builds
inspect each binary's actual symbol-version requirements and dependency closure.
C++ adapters keep their qualified C++ runtime with the artifact. Source builds
use Clang, platform headers and Linux relocation tools explicitly, while Rust
adapters also use their pinned Rust/Cargo toolchain. Consumer installation has
no automatic source-build fallback.

## Verify a local native build (unreleased)

Build the adapter with the maintainer toolchain recorded in its provenance.
Prepare a format-2 `aug-package.json` with the archive's real SHA-256 and size
bounds, the reviewed `native.abi.json`, and the HTTPS URL where you intend to
publish the archive. The URL does not need to be live for this local check.

From the package repository, run:

```sh
aug package cache-native . --artifact macos-arm64 \
  --archive .aug-build/native/macos-arm64.tar.gz --json
```

Use an artifact ID from your manifest. The command checks the local archive
against that entry, verifies every file hash and declared link/runtime,
provenance, notice and closure file, then installs it in the ordinary native
cache. It checks the supplied archive even when that cache already exists.
Links and special input files are rejected. A changed package manifest,
descriptor or configuration rejects the candidate before acceptance.

Point a separate application at the local package with `aug add ../my-library
--as my_library`. After caching the matching host artifact, `aug run --offline`
uses the normal package resolver and LLVM backend. That run tests the real
library; caching alone reports `execution: "not-run"`. A package's other target
archives can be cached but cannot run on an unsupported host.

The command does not compile source, fetch an archive, run package scripts or
publish a release. Publish the verified archive at its declared URL, then tag
and share the source repository through the [ordinary package
workflow](packages.md). Consumers continue to import that repository and obtain
its matching prebuilt artifact.

## Native calls in workers

August supports isolated workers. A descriptor function opts in with `workerSafe: true`; omission means it may run on the main/cooperative heap only. This declaration covers independent instances, call-duration inputs, release operations, and library bookkeeping. It does not allow a native handle or retained August memory to cross worker heaps. Construct resources inside the worker and return copied data.

Audit library global state, thread affinity, panic/exception boundaries, and cleanup before opting in. A GPU package can submit device work from the worker while keeping devices and buffers local. Its native operation must finish using each input before returning or releasing that input. The compiler validates the declaration and ownership contract, while native hardware and sanitizer tests validate the implementation.

## Native cancellation and owned results

During an original caller-thread native call, an adapter can read `uint8_t aug_native_cancelled_v1(void)`. It does not yield, allocate managed values or enter an August callback. It reports cancellation of the current task or worker. Poll it alongside an absolute native deadline; do not call it from a foreign thread or retain a callback into August. An adapter remains responsible for cancelling, draining or discarding its native operation safely.

A successful owned resource output creates a new August wrapper. Its adapter owns every native reference needed by that handle, including references to independent internal storage. It must not retain an August input wrapper or call-duration buffer. The checker preserves this distinction through verified source wrappers: returning a newly owned native result does not make it a managed alias of the loaned input. This does not permit native handles to cross worker heaps.
