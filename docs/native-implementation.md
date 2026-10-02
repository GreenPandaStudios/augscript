# LLVM and native package support

August 0.21.0 uses LLVM 23.1.2 by default. It compiles checked execution IR directly to a host executable and downloads a pinned compiler/runtime pack. Consumers need Node.js 24 and a supported OS; they do not install a native compiler or SDK.

## Supported hosts

| Host | Minimum environment | Distribution |
| --- | --- | --- |
| Apple Silicon | macOS 14 | Verified compiler/runtime pack, source debug information and dSYM. |
| Linux x86-64 | glibc 2.36 | Verified LLVM/runtime pack and relocatable ELF application bundle. |
| Linux ARM64 | glibc 2.36 | The same native profile, qualified in CI and on physical DGX Spark. |

Compiler and native libraries are published through release archives. Installed-CLI tests use public downloads in clean consumer environments without Clang, LLVM, Git, or development headers. Frozen/offline runs, relocated bundles, checked failures, task joins, and resource release are exercised. [Release validation](release-review.md) describes the gates that must repeat for later versions.

## Real library packages

| Package | Native implementation | Verified operation |
| --- | --- | --- |
| [PyTorch](https://github.com/GreenPandaStudios/aug-pytorch) | CPU LibTorch | Allocate tensors, add them, sum the result, and release handles. |
| [SQLite](https://github.com/GreenPandaStudios/aug-sqlite) | SQLite | Open a database, create a table, insert and query data, close it. |
| [zlib](https://github.com/GreenPandaStudios/aug-zlib) | zlib | Compress and decompress a binary buffer, verify a round trip. |
| [BLAKE3](https://github.com/GreenPandaStudios/aug-blake3) | Rust BLAKE3 crate | Hash a buffer and compare a known digest. |

Install these repository packages with `aug add`, then import their exported August declarations. Read [the examples](native-package-examples.md) or [the package guide](native-packages.md) to use them. The PyTorch package covers a small set of CPU tensor operations; GPU and broader PyTorch APIs are not supported.

## Validation and limits

LLVM parity tests cover checked language behavior in both optimization modes. Debugger tests check source breakpoints and runtime representation. [Safety gyms](safety-gyms.md), sanitizer tests, installed-package tests, and [performance reports](performance.md) record results separately. A successful library call does not prove arbitrary foreign code safe.

Native ABI version 1 supports fixed-width values, copied buffers, and opaque owned resources. Callbacks, retained foreign memory, native aggregates, exported August libraries, and foreign-thread entry are not supported by this ABI. Tasks are cooperative on one OS thread. Windows, musl, and cross compilation are outside the support matrix.

Native packages retain their upstream license obligations. In particular, the LibTorch facade is qualified but a complete upstream dependency SBOM remains open; review the redistributed archive rather than treating a wrapper license as the whole inventory. See [production readiness](production-readiness.md#dependencies-and-licenses) and [native compilation design](native-interop-llvm-plan.md).
