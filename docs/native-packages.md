# Native libraries as August packages

The LLVM preview lets an August package wrap a C ABI without exposing native
pointers to application code. A package supplies August declarations, a checked
binding descriptor, and prebuilt libraries. The compiler checks their labels,
types, errors, and ownership before generating LLVM IR and a native executable.

This is development work for `0.21.0`, not a capability of the published
`0.20.1` CLI. Public release installation is being qualified. The first target is
macOS 14 or later on Apple Silicon. Native packages select LLVM automatically;
ordinary projects retain the C backend during migration.

## Import a library

The [PyTorch](https://github.com/GreenPandaStudios/aug-pytorch),
[SQLite](https://github.com/GreenPandaStudios/aug-sqlite),
[zlib](https://github.com/GreenPandaStudios/aug-zlib), and
[BLAKE3](https://github.com/GreenPandaStudios/aug-blake3) repositories publish
`v0.1.1` source and native preview archives (SQLite uses `v0.1.2`). Their imports have passed using the
packaged CLI, public downloads, and fresh caches on macOS ARM64. The matching
compiler release is still pending. The macOS 14 ARM64 consumer gate passed in CI;
subsequent compiler revisions must pass it again before publication.

After the matching compiler preview is published, use the normal
package commands. This example adds CPU LibTorch under a short name:

```sh
aug add https://github.com/GreenPandaStudios/aug-pytorch#v0.1.1 --as pytorch
aug run
```

The following program is an example for that preview:

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

## Installation and deployment

`aug.lock.json` records the source revision, binding digest, selected native
archive, compiler pack, and runtime identity. Archive downloads are bounded and
SHA-256 checked. Extraction rejects links, traversal, duplicate paths, and
unexpected files. Cached files are checked again before use. Package installation
does not execute native recipes or npm lifecycle scripts.

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
