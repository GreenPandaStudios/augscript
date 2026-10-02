# Native libraries as August packages

Native locks keep a compiler selection for each host under `native.compilers`.
A project can record macOS ARM64 and both GNU/Linux hosts without one build
replacing another host's compiler or runtime pin. A frozen build requires the
entry for its current host. Run `aug build --backend llvm` once on each new host
before using `--frozen` there; cross-compilation is not supported.

The LLVM preview lets an August package wrap a C ABI without exposing native
pointers to application code. A package supplies August declarations, a checked
binding descriptor, and prebuilt libraries. The compiler checks their labels,
types, errors, and ownership before generating LLVM IR and a native executable.

This profile ships in August `0.21.0`. It supports macOS 14 or later on Apple
Silicon and GNU/Linux x86-64/ARM64 with glibc 2.36 or later. LLVM is the default for ordinary projects
and native packages. The C migration reference requires `--backend c` or
`backend: c` in `main.yaml`; native ABI packages require LLVM.

Both Linux architectures passed LLVM regression and clean installed-CLI checks
on Debian 12; physical ARM64 qualification also passed on DGX Spark. Compiler,
runtime and library artifacts are public.
Musl and cross compilation are unsupported. A package declares its libc floor
and C++ ABI in addition to its OS and architecture; August rejects an incompatible
host before compiling the application.

## Import a library

The [PyTorch](https://github.com/GreenPandaStudios/aug-pytorch),
[SQLite](https://github.com/GreenPandaStudios/aug-sqlite),
[zlib](https://github.com/GreenPandaStudios/aug-zlib), and
[BLAKE3](https://github.com/GreenPandaStudios/aug-blake3) repositories publish
source and native preview archives for all three platforms: PyTorch `v0.1.4` and
the other three packages `v0.1.3`. Their imports have passed using the packaged CLI,
public downloads, and fresh caches on macOS ARM64 and both GNU/Linux architectures.
The matching compiler is [August 0.21.0](https://github.com/GreenPandaStudios/augscript/releases/tag/v0.21.0).
Subsequent compiler revisions must pass those consumer gates again before publication.

Use the normal package commands. This example adds CPU LibTorch under a short name:

```sh
aug add https://github.com/GreenPandaStudios/aug-pytorch#v0.1.4 --as pytorch
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
[implementation record](native-implementation.md) separates verified behavior
from release and platform work still in progress.

Read the complete projects with their compiled explanations:
[PyTorch](examples/native-pytorch/index.md),
[SQLite](examples/native-sqlite/index.md),
[zlib](examples/native-zlib/index.md), and
[Rust BLAKE3](examples/native-blake3/index.md). Each includes a same-file test and
a downloadable project. Native dependency pages link to the exact binding
descriptor, so ownership and native boundaries stay visible beside the code.

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
Clang include, macro and sysroot flags follow `--`. Consumers still need no
Clang. Keep the maintainer compiler version pinned in your build recipe.

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

Ownership, allocator pairing, retention and thread behavior remain promises
made by the binding author. A matching header cannot establish those promises;
independent adapter tests must check them. C++ and Rust packages provide C
adapter headers for this command. Templates, callbacks, variadic calls and
aggregate values are outside the initial binding profile.

## Installation and deployment

`aug.lock.json` records the source revision, binding digest, selected native
archive, compiler pack, and runtime identity. Archive downloads are bounded and
SHA-256 checked. Extraction rejects links, traversal, duplicate paths, and
unexpected files. Cached files are checked again before use. Package installation
does not execute native recipes or npm lifecycle scripts.

A failed download or extraction leaves no accepted artifact cache. Disk-full
errors include the CLI's space-recovery guidance; they do not leave a partially
installed library selected by a lockfile.

Consumers need Node 24 and a supported OS, but do not install LLVM or Clang for
this profile. August downloads its own pinned LLVM tools and runtime. A missing
or incompatible artifact produces a diagnostic; it never starts a source build.
Use `aug run --offline --frozen` after an online installation to require the
recorded artifacts without downloading replacements.

Public GitHub source downloads use HTTPS and do not require Git. If GitHub's
shared API rate limit stops installation, retry later or set `AUG_GITHUB_TOKEN`
to authenticate API reads. August sends this token only to `api.github.com`,
rejects redirects, and never writes it to source caches or lockfiles.

Keep the executable together with its adjacent `lib` and `share` directories.
The libraries load relative to the executable. `share/august-native` preserves
the selected packages' notices, provenance, and file manifests.

## Author a binding

Declare an opaque resource with `extern C resource Handle` in an ordinary module.
Hover, `aug context` and the compiled specification show the native provider,
supported targets, loan duration and release operation. The compiler checks the
binding signature and ownership at August call sites. Input retention, thread
behavior and exception containment are promises made by the native author; these
tools do not prove the foreign implementation follows them. Context identifies
native dependencies reached through resolved standalone calls and does not claim
complete member-dispatch coverage.
Its `native.abi.json` entry names a leaf release function. Extern declarations
and descriptor entries must agree; application code imports safe August wrappers
through `export.aug`. Calls to extern functions remain inside `unsafe`.

The initial ABI uses fixed-width scalars, pointer-and-length inputs, copied
buffers, opaque handles, and checked status errors. C++ wrappers catch exceptions
and Rust exports contain panics before returning through C. Sharing LLVM does
not make C++, Rust, and August layouts compatible.

Binding maintainers build and test native artifacts with the recorded toolchain.
Consumers receive those verified artifacts. Callback registration, retained
loans, foreign threads, native struct layout, GPU tensors, and exporting August
libraries have not been qualified. See the
[architecture and backlog](native-interop-llvm-plan.md).

Linux maintainers build on Debian 12 so newer hosts do not raise the artifact's
glibc requirement. The compiler checks the declared minimum; maintainer builds
inspect each binary's actual symbol-version requirements and dependency closure.
C++ adapters keep their qualified C++ runtime with the artifact. Source builds
use Clang, platform headers and Linux relocation tools explicitly, while Rust
adapters also use their pinned Rust/Cargo toolchain. Consumer installation has
no automatic source-build fallback.
