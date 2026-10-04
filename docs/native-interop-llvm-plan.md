# Native compilation design

August lowers a checked program through language-specific execution IR into LLVM IR, then produces a native executable for the host. Ordinary repository packages can add native C, C++, or Rust implementations through a reviewed C ABI. This architecture ships in the 0.21.0 preview; [native packages](native-packages.md) is the consumer and maintainer guide.

## Pipeline and runtime

The frontend owns source syntax, type checking, interfaces, dependency injection, checked errors, ownership, and effects. August execution IR makes evaluation order, control flow, managed root cells, cleanup, and source locations explicit. LLVM lowering preserves those operations directly.

LLVM verifies and optimizes the IR, emits host objects, and links them with selected prebuilt runtime components and native package artifacts. Debug and release modes use `-O0` and `-O2`; both retain source debug information. macOS bundles include a dSYM, and Linux executables contain DWARF. See [tooling](tooling.md#source-locations-and-debugging) for current debugger limits.

The managed runtime remains responsible for tagged values, allocation, collections, scoped tasks, ownership cleanup, and failure transport. Checked errors use explicit runtime control flow; foreign exceptions must not unwind through August frames. Keeping the runtime shared between backends allows parity testing while the explicit C reference remains available.

## Public native boundary

The current package ABI is `aug-native-abi-1` over the target C ABI. LLVM use does not make August, Rust, or C++ object layouts compatible. Descriptors name fixed-width scalars, pointer-and-length inputs, copied buffers, checked status errors, and opaque resources with leaf release functions. Public application code imports safe August wrappers. Extern calls stay inside `unsafe`.

The compiler checks labels, types, declared ownership, available artifacts, and descriptor consistency. Header checking additionally validates physical widths, pointer directions, buffer lengths, release signatures, and error-record layout. Allocator pairing, input retention, thread behavior, and exception containment must be honored by native code and checked with independent adapter tests.

C packages can provide a narrow adapter around an existing library. C++ packages expose an `extern "C"` facade, hide classes and templates behind opaque handles, and catch exceptions inside that facade. Rust packages export C-compatible functions, release owned resources explicitly, and contain unwinding panics; aborting panics cannot become checked errors. LibTorch uses CPU tensor handles and a packaged C++ runtime; it does not expose the upstream C++ ABI to August source.

Callbacks, retained loans, foreign-thread entry, general native struct values, GPU tensors, and exported August libraries are unsupported by the current ABI. Adding them requires defined lifetimes and rules for entering the August runtime.

## Packages, artifacts, and deployment

Native bindings use the existing public-repository package graph, aliases, and lockfile. A package declares supported targets, OS/libc floors, its native dependency closure, archive locations, checksums, and deployment files. The lock records source revision, descriptor digest, native artifact selection, compiler archive, and runtime identity.

Consumers obtain verified prebuilt artifacts. Downloads are bounded; extraction rejects traversal, links, duplicate paths, and unexpected files. Installation executes no package build scripts and never substitutes a source build when an artifact is unavailable. Binding authors use pinned Clang, CMake, Rust/Cargo, and platform tools in their own release workflows.

Executables retain neighboring `lib` and `share` directories. Libraries load relative to the executable, and `share/august-native` contains notices and provenance. The supported hosts are macOS 14+ ARM64 and GNU/Linux x86-64/ARM64 with glibc 2.36+. Compilation targets the current host; Windows, musl, and cross compilation are unsupported.

## Remaining work

The [1.0 roadmap](roadmap.md) covers stable ABI/lock formats, upgrades, interruption recovery, and repeated platform qualification. Extend the native profile only after defining the new ownership/layout/thread contract, testing it in a real separately published library, and exercising clean consumer installation. Keep backend comparisons and runtime tests independent of generated explanations.
