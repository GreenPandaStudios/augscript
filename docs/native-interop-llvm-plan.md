# Native packages and LLVM compilation

**Status: accepted architecture, with implementation tracked separately.** This document records the design and the assessment of August **0.20.1**, commit `d31ccca155e54618f162d595c84a707fa881bd60`, inspected on October 1, 2026. Its repository links identify that starting implementation. The four native package repositories and the LLVM backend now exist; the [implementation record](native-implementation.md) identifies the implemented profile, qualification results and remaining release gates. Future profiles and commands below remain proposals. [Package examples](native-package-examples.md) describe the repositories, interfaces, programs and publishing workflow. [Upstream research](research/native-interop-llvm.md) records external evidence and qualification limits.

## First milestone: four real repositories, four working LLVM programs

The first deliverable is an August preview that imports and runs **real LibTorch, SQLite, zlib, and Rust BLAKE3 implementations from four separate public package repositories**. A standalone LLVM arithmetic demonstration is an internal prerequisite, not this milestone's outcome.

Use **macOS ARM64, macOS 14 or newer**, as the first target. The inspected development machine is Darwin ARM64, the current native CI uses `macos-15`, and the compatibility guide records native execution on macOS ARM64. The minimum OS version remains a qualification target until every selected native binary's deployment requirement has been inspected and tested on macOS 14. Recent PyTorch releases raised their macOS deployment target to 14; an archive listing alone does not verify every binary in a newer release. [Current platform evidence](compatibility.md#platform-evidence), [CI](../.github/workflows/ci.yml), [PyTorch release notes](https://github.com/pytorch/pytorch/releases/tag/v2.12.0).

The selected repository names follow the existing organization and `aug-` package naming convention. All four repositories now publish real native library artifacts:

| Repository | Initial public surface | What its real implementation validates |
| --- | --- | --- |
| `GreenPandaStudios/aug-pytorch` | CPU float64 tensors, addition, sum, copying values | A substantial C++ dependency, opaque objects, C++ exception containment, transitive dylibs, deterministic destruction |
| `GreenPandaStudios/aug-sqlite` | Open a database, parameterized execution, query one text value | Direct C header bindings, native handles, statement lifetimes, state changes, checked native errors, filesystem access |
| `GreenPandaStudios/aug-zlib` | Bounded compression and decompression of `Bytes` | Binary buffers, length conversions, native allocation and release, corrupted-input errors |
| `GreenPandaStudios/aug-blake3` | Hash bytes to a hexadecimal digest through the Rust crate | Cargo-built Rust code, exported C ABI, panic containment, Rust-owned output memory and its matching deallocator |

BLAKE3 is useful and small enough to keep the Rust integration focused. Its binding must call the **Rust crate**, rather than substituting the repository's separate C implementation. Use the pinned crate's tested pure Rust configuration for the first artifact and state its feature limitations. SQLite and zlib also test direct C declarations; their consumer APIs may use small adapters for error and memory conventions. CPU LibTorch is the largest dependency and starts early enough to reveal packaging and linkage problems before the milestone closes. GPU, model training, autograd, arbitrary tensor types, and comprehensive PyTorch coverage are deferred.

### Prerequisites within milestone 1

Complete these in order, with native artifact preparation proceeding alongside compiler work after the contract is frozen:

1. Freeze the first native ABI profile, target identity, ownership rules, and package metadata. Write independent C/C++/Rust fixture probes for it.
2. Create the four public repositories, licenses, narrow August exports, native wrappers, release workflows, and independent native tests. Build provisional CPU artifacts using maintainer toolchains. Record source revisions, toolchain pins, dependency versions, licenses, and actual dylib dependencies.
3. Add a checked August intermediate representation and LLVM lowering for the features the four programs use: scalar values, strings/bytes/lists, interfaces and classes, labeled calls, native calls, checked errors, ownership cleanup, DI, assertions, and control flow. Emit real object files and linked executables.
4. Package the LLVM driver, linker, runtime objects, and macOS linkage inputs. Prove AOT linking and execution on a clean Mac without Xcode, Command Line Tools, Clang, LLVM, CMake, or Cargo. This is a hard prerequisite for the installation promise.
5. Extend the existing package resolver and lock with native metadata, target selection, verified artifacts, runtime deployment, and GitHub HTTPS source retrieval that does not depend on Apple's Git launcher.
6. Publish immutable package tags and verified native artifacts. Run the four public-import programs with the installed npm CLI and LLVM backend, including cleanup, failure, offline restoration, and unsupported-target checks.

The preview may require the **proposed** flag `aug run --backend llvm`. Unsupported August features must produce a source diagnostic; the compiler must not silently route those files through C. The normal `aug add`, URL import, alias import, and `aug run` workflow remains the user interface. LLVM becomes the default only after the broader migration gates below.

### Milestone 1 acceptance

| Gate | Required evidence |
| --- | --- |
| Real repositories | Each library has its own public repository and tagged source. An application outside the compiler checkout imports its URL directly; a second application uses `aug add URL --as NAME`. Both resolve the same public surface. |
| Real native work | LibTorch creates tensors and produces `[5, 7, 9]` with sum `21`; SQLite creates/inserts/queries and also passes a temporary-file persistence test; zlib round-trips binary data; the Rust crate matches upstream BLAKE3 vectors. No mock or replacement implementation is linked. |
| LLVM execution | Build evidence records LLVM version, target, IR/object hashes, runtime identity, native artifact closure, and link inputs. August source is lowered to LLVM IR, then to native objects. No generated application C or host C compiler participates. |
| Reproducibility | `aug.lock.json` records exact source commits, source/contract digests, native versions, target properties, artifact SHA-256 values, transitive dependencies, and toolchain/runtime identities. A frozen reinstall neither follows moved tags nor substitutes changed artifacts. |
| Correct installation | A clean macOS 14+ ARM64 VM installs Node/npm and the published CLI, then runs all four programs. It has no native compiler tools, no developer SDK, no Git supplied by Command Line Tools, and no previous August cache. Network is allowed for first installation. |
| Correct deployment | Move each built executable and its deployment directory to another clean compatible VM. It runs without compiler, package, or source caches and without LLVM. |
| Cleanup | Own handles are destroyed once on normal, early-return, checked-error, and failed-construction paths. Output buffers and SQLite statements are released. Independent allocation counters and instrumented adapter tests support the result. GC pressure does not invalidate call inputs. |
| Failure behavior | Wrong architecture/OS floor, absent artifacts, missing dependent dylibs, checksum mismatch, native API mismatch, and offline cache misses name the package, required target, rejected input, and actionable remedy. No automatic source build occurs. |
| Honest scope | Documentation and editor help label the LLVM preview profile. Existing source/backend regression gates pass. The four examples and their generated specs enter the executable documentation gallery when implementation lands. |

## What August implements today

### Compiler pipeline and representations

The frontend is TypeScript. `loadProject` loads source/configuration, installed package snapshots, folder exports, and scopes. The lexer/parser produce an AST with source spans. `checkProject` adds resolved types, call argument plans, ownership origins, effective errors/effects, DI bindings, interceptor plans, HTTP schemas/policies, and editor scope facts. The compiler currently walks this checked AST directly to generate C; there is **no language-specific executable IR or LLVM backend** in the inspected main revision. `semantic.ts` describes checked contracts for tooling and specs; it is not an execution IR. [Project loading](../src/project.ts#L62), [AST](../src/ast.ts#L18), [checked project](../src/checker.ts#L43), [C generator](../src/codegen.ts#L19), [CLI integration](../src/cli.ts#L324), [semantic model](../src/semantic.ts).

Types have resolved identities, generic arguments, optional/null information, bounds, and readonly information. Source checking is richer than the machine representation. At runtime, `AugValue` is a tag and union containing an int64, double, bool, or object pointer. Objects carry fields, method tables, collection storage, text lengths, and private native/finalizer slots. Classes dispatch through runtime method tables; immutable records share that object infrastructure. Scalar C temporaries already avoid some roots and expose arithmetic to the C optimizer. Generics are checked through substitution and erased/tagged runtime execution, rather than a current general monomorphization pass. [Types](../src/types.ts#L3), [runtime layout](../runtime/aug_runtime.h#L13), [callable generation](../src/codegen.ts#L73), [scalar/root layout](../src/codegen.ts#L1036).

`compileNative` writes `.aug-build/program.c`, copies selected runtime C files, invokes a discovered C11 compiler with `-O0` or `-O2`, `-g`, pthreads, and library arguments, then writes source/build metadata. Native requirements are currently discovered by scanning generated C identifiers. That mechanism must be replaced by explicit IR/build requirements when C generation is removed. [Native build](../src/native.ts#L14), [dependency scanning](../scripts/native-setup.mjs#L7).

### Memory, resources, errors, and execution

Managed objects use a nonmoving mark-and-sweep collector. Explicit root frames, retained native roots, globals, scopes, locks, pending errors, and suspended executions keep values alive. `own` values receive checked move semantics and generated cleanup; ordinary inputs grant reading and `borrow` grants exclusive mutation. Owned cleanup and GC finalization are related but different: `aug_drop` invokes language cleanup and drops owned fields, while the current native `finalize` pointer runs when the collector frees an object. Reusing that pointer alone would **not** provide immediate native destruction at an owned scope exit. [Ownership analysis](../src/ownership.ts), [root tracing/collection](../runtime/aug_runtime.c#L693), [drop](../runtime/aug_runtime.c#L747), [generated cleanup](../src/codegen.ts#L1046), [ownership rules](reference.md#ownership-and-read-access).

Checked failures do not currently unwind the native stack. Each `AugExecution` has an error value and flags; generated code checks those flags and branches to handlers/cleanup. `try`, typed `catch`, and `always` preserve pending failures and cleanup order. Allocation failure and runtime invariant corruption remain fatal. Preserve these meanings during backend migration. [Execution state](../runtime/aug_runtime.h#L61), [error operations](../runtime/aug_runtime.c#L764), [cleanup lowering](../src/codegen.ts#L947), [failure rules](reference.md#null-matching-and-checked-failures).

Tasks use minicoro stackful coroutines and a cooperative scheduler on one OS thread. Scope exit joins children before owned resources are dropped; unobserved child failures cancel siblings. HTTP integrates nonblocking native I/O with that execution model. The earlier concurrency work note describes multicore goals, but it explicitly does not establish their delivery. Native libraries may themselves create threads; that does not make August's collector or scheduler thread-safe. [Task runtime](../runtime/aug_tasks.c#L62), [join behavior](../runtime/aug_tasks.c#L97), [current conformance](language-conformance.md), [historical concurrency plan](concurrency-implementation.md).

### Imports, packages, native builds, and distribution

`export.aug` governs crossing folder/package surfaces, `_` names are private, labels are required, imports are explicit, and libraries need no `main.aug`. Quoted public repository imports already work. `aug add URL --as NAME` stores an alias in `main.yaml`; source manifests are optional for pure folders and require exact compiler compatibility when explicit. GitHub URLs can select a subfolder and tag. Git, local, and npm transports feed the same source-package graph. `aug run` prepares imports automatically; checking/spec generation read verified installed snapshots. [Import checking](../src/project.ts#L108), [package conventions](packages.md), [manifest/lock types](../src/package-manager.ts#L13), [run preparation](../src/package-manager.ts#L206).

`aug.lock.json` format 1 records source packages, graph aliases, compiler version, Git commits, source digests, and npm archive integrity. `.aug-packages` is a project snapshot; bare Git objects have a shared user cache. Install writers coordinate through a lock and staged snapshots. Git sources are read as blobs without checkout/hooks; npm packaging uses `--ignore-scripts`, verifies integrity, and restricts extraction. The Git source reader currently copies `.aug` and a short metadata allowlist, **not native headers, ABI descriptors, or binaries**; the source digest likewise does not yet cover a native contract. [Git transport and allowlist](../src/git-packages.ts#L43), [snapshot validation](../src/package-manager.ts#L145), [source digest](../src/package-manager.ts#L136), [archive extraction](../src/package-manager.ts#L276), [registry transport](../src/package-manager.ts#L320), [writer coordination](../src/package-locking.ts).

Native libraries are currently a compiler-controlled source bootstrap, not a general package artifact resolver. A pinned manifest downloads minicoro, yyjson, GMP, Nettle, GnuTLS, libwebsockets, and build utilities; runtime C files and selected dependencies are compiled on the host. Application `libraries`/`library_paths` are low-level linker configuration. Users still need a C11 compiler; a first HTTP/crypto build also needs native build tools. [Pins](../scripts/native-dependencies.lock.json), [preparation](../scripts/native-setup.mjs#L35), [tool discovery](../scripts/native-toolchain.mjs#L4), [configuration](../src/config.ts#L5).

The published CLI contains compiled JavaScript, runtime sources, setup scripts, documentation, and examples. Its package requires Node 24+ and the matching core stdlib, rather than a user-installed TypeScript runtime. npm and VSIX release pipelines already exist; they must gain verified host/target artifacts. macOS ARM64 and Linux ARM64 have documented native evidence; Linux x86-64 has Docker CI; Windows lacks full runtime verification. The current LLDB integration uses C source mapping and tagged variable views and has documented limitations. [CLI manifest](../packages/cli/package.json), [package assembly](../scripts/build-packages.mjs#L29), [release workflow](releasing.md), [platform evidence](compatibility.md#platform-evidence), [debugger state](tooling.md#source-locations-and-debugging).

### Existing interoperability and earlier decisions

Public `extern C` currently maps `int` to `int64_t`, `c_int` to C `int`, `float` to double, bool to C bool, and string to a C string. Calls require `unsafe`. Public declarations reject generic types, ownership transfer, nullable types, injection, and checked native errors. Internal `extern C value` adapters pass compiler-private `AugValue` and support richer builtins. There is no header importer, general pointer/buffer/struct/callback surface, C++ binding support, or Rust package workflow. [Checker restrictions](../src/checker.ts#L557), [C prototypes](../src/codegen.ts#L168), [working FFI example](../examples/ffi/native.aug), [private crypto adapter](../src/stdlib/crypto/contracts.aug#L27), [documented limits](tooling.md#c-boundary).

The design audit and delivered implementation map favor explicit dependencies, pure construction, bounded sharing, checked failures, narrow exports, and compiler-derived documentation. The existing ecosystem research chose Git URL imports and exact commit locks over mandatory registry ceremony. The compatibility plan explicitly identifies the private runtime ABI as a stability gap. This proposal follows those decisions. The separate, unmerged AUG-0001 development work deliberately excludes native linkage from its initial forwarding profile; native support must not silently enlarge that profile. It is not a prerequisite for milestone 1. [Design audit](language-design-audit.md), [implementation map](implementation-map.md), [package research](research/ecosystem-workflow.md), [ABI compatibility decision](compatibility.md#what-a-10-release-will-keep-stable).

## Recommended architecture

Keep the existing frontend and semantic tools. Introduce a checked August IR between `CheckedProject` and LLVM, use a small distributed native driver for LLVM object generation/linking, and keep the existing C runtime as a **prebuilt implementation of runtime services**. Native packages expose a versioned, narrow **C ABI**, with safe August source APIs above it. The package manager resolves their source and target artifacts together.

```text
August source + exports + installed contracts
    -> existing parse, resolution, type/effect/ownership checking
    -> checked August IR with explicit cleanup, roots, calls and requirements
    -> LLVM IR
    -> bundled August LLVM driver -> target object files
    -> bundled linker + target runtime + locked native artifacts
    -> executable and its deployment libraries

C/C++/Rust package sources
    -> maintainer CI toolchains -> verified C ABI artifacts + binding metadata
    -> ordinary tagged August repository -> ordinary consumer imports
```

The deep seams are `CheckedProject -> AugustIR`, `AugustIR -> TargetObject`, and `PackageGraph -> NativeLinkPlan`. Each interface owns diagnostics, versioning, target selection, and invariants that its callers need. Avoid adding a second package resolver or duplicating checker rules in the backend.

This separates two changes that are often confused. **Replacing application C generation** means August expressions/control flow go directly to LLVM. **Retaining C interfaces and C runtime/library source** remains useful and is allowed: those sources are compiled by release maintainers, then consumed as object/static/dynamic artifacts. Library builders may use Clang, CMake, Cargo, and SDKs. Application consumers do not.

LLVM will not automatically make August faster: the current C compiler can already use LLVM, and tagged runtime representations remain a cost. Measure the existing benchmark programs after correctness, using equivalent optimization and target settings. Do not publish a speed claim based solely on changing the backend.

## LLVM backend design

### Checked August IR

Add `src/ir/` with immutable modules, typed values, basic blocks, source spans, resolved symbol IDs, call signatures, and terminators. Represent allocation, managed root lifetime, ownership transfer, borrow regions, checked-call success/failure edges, scopes/joins, locks, and native conversion/release as explicit operations. Resolve labeled arguments using existing `CallPlan`, while retaining the **written evaluation order**: argument evaluation must not be reordered into parameter order. Express DI and interceptor plans without repeating their analysis.

Start with typed slots and block arguments; make scalar SSA construction a backend transform. Do not combine an LLVM migration with a new GC, optimizer, generic specialization scheme, or async state-machine design. An IR verifier checks defined values, legal types, complete cleanup edges, roots at allocation/reentry points, and supported native contracts before LLVM verification.

Preserve the existing AST as the source for navigation, formatting, specs, and contextual documentation. The new IR is executable compiler data, not a replacement prose/spec system. Add runtime/native requirements to IR modules and build plans; delete identifier-regex dependency discovery from the LLVM path.

### Lowering the language

| Feature | Initial lowering and semantic obligation |
| --- | --- |
| int/c_int/float/bool/null | int64, checked C-int conversions, double, bool, and tagged null where needed. Integer addition/subtraction/multiplication wrap: do not attach LLVM `nsw`/`nuw`. Guard zero divisors and `INT64_MIN / -1` before LLVM signed division. Preserve checked conversion failures. |
| Strings/Bytes | Reuse length-tracked UTF-8/byte objects. Pin roots across native calls. C strings are a separate checked conversion; embedded NUL must not silently truncate. Literal NUL restrictions and length-tracked byte-to-text behavior currently differ, so tests, rather than a blanket “all strings are NUL-free” assumption, govern migration. |
| Lists/Map/Set/tuples/records | Call existing runtime operations initially; retain collection ordering, snapshot iteration, record equality/hash, bounds errors, optional/null behavior, and frozen values. Lists are not contiguous arrays of unboxed native scalars. |
| Functions/classes/interfaces | Preserve resolved identities, labeled calls, constructor purity, fields, method/default dispatch, and erased generic behavior. Generate internal typed fast paths only after differential tests; public native code never receives a method table or AugValue. |
| Branches/loops/match | Basic blocks and phi/block arguments; short-circuit `and`/`or`; existing exhaustiveness and flow checking remains frontend work. Add safepoints/checkpoints where the existing scheduler requires them. |
| Errors/always/own | Explicit status/error edges and cleanup blocks. Preserve error precedence, reverse resource-release order, ownership moves, return cleanup, and initialization failure cleanup. |
| DI/interceptors | Use checked fresh/shared/scoped graphs and written layer order; preserve input mapping, injected capture, and at-most-once `next`. No runtime service-locator replacement. |
| Tasks/scopes/Shared | Initially call the same stackful coroutine scheduler, retain all suspended roots, and join borrowers before destruction. No assumption that LLVM coroutine intrinsics implement August cancellation. Full coverage lands in milestone 2. |
| HTTP/HTML/OpenAPI/tests | Lower existing checked route/schema/policy and test plans to runtime tables/thunks. Keep policy order, request scopes, streaming cleanup, and assertion/coverage source attribution. Full coverage lands in milestone 2. |

LLVM's flags, pointer attributes, alignment, and poison rules are correctness constraints. Add `noalias`, `nonnull`, `readonly`, or `nounwind` only where the complete lowered call contract justifies them; an August borrow alone does not prove that arbitrary native code obeys those properties. [LLVM IR rules](https://llvm.org/docs/LangRef.html).

### Runtime integration and cleanup

Continue the nonmoving collector and explicit root frames. Generate target-private runtime layout information from the actual runtime headers during release builds, including sizes, offsets, alignment, tags, and signatures. Verify it against compiled C probes. Do not hand-copy the Darwin layout into a supposedly portable LLVM emitter.

For the first LLVM profile, compile a small **private runtime thunk layer** with the runtime in CI. Its machine calls use scalar/pointer arguments and out-pointers for `AugValue`, avoiding ad hoc platform classification of a C struct passed or returned by value. Existing runtime internals may still use `AugValue`; the thunk layer and generated code are pinned to the same compiler/target runtime version. This private interface is distinct from the public native package ABI.

Normalize the reverse direction too: today's `AugMethod` and `AugFunction` callbacks pass/return aggregate values. Runtime method tables, constructors/schema makers, task entries, and endpoint handlers must invoke a versioned private pointer-call signature when calling LLVM-generated code. Update their registration/invocation helpers together. The temporary C backend can emit C bridge functions from that pointer signature to its existing generated functions; its host compiler handles those internal C aggregates. No per-application C bridge compilation is needed on the LLVM path. Test interface dispatch in the SQLite sample so outbound thunks alone cannot disguise a missing callback ABI implementation.

Add an opaque native resource object that carries a checked type identity, owner state, native pointer, and descriptor-selected release function. Owned cleanup releases it immediately; GC is a fallback for an unreachable wrapper, not the owner of its promised lifetime. Clear the native pointer/release obligation on destruction so later collector finalization cannot double-free it. Acquisition failure releases partially created native objects before reporting an August error.

Permit only declared **infallible native resource release** in this cleanup operation. This is deallocation of an acquired resource, not permission to run arbitrary effectful functions inside `drop()`. Database commit, network shutdown protocols, flush operations with reportable errors, and other external work require explicit checked methods. SQLite's adapter must finalize statements and use its declared close policy without an implicit commit. This adds native resource support while preserving existing ownership and cleanup semantics.

### Checked errors, exceptions, and unwinding

Keep August errors as execution-local values with explicit branching. LLVM code returns normally through generated cleanup paths; it does not use C++ exceptions for `unless`. Preserve cancellation cleanup and parent-error precedence. Add unwind/debug frame information as required by target tooling, but this does not establish a cross-language exception ABI.

C adapters translate return codes/errno only where declared. C++ adapters catch `c10::Error`, standard exceptions, and unexpected exceptions **inside C++** and return status plus an error payload. Rust adapters prevent panic unwinding across `extern "C"`, converting unwind panics to status when built with `panic=unwind`. Abort panics, OOM aborts, signals, and arbitrary undefined behavior are not recoverable checked exceptions. Require panic strategy in artifact metadata; reject a promised recoverable panic adapter built with `panic=abort`. [Rust FFI rules](https://doc.rust-lang.org/nomicon/ffi.html#ffi-and-unwinding), [catch_unwind limits](https://doc.rust-lang.org/std/panic/fn.catch_unwind.html).

### Driver, objects, linking, modes, and diagnostics

Keep orchestration in TypeScript. Add `native/compiler-driver/`, a small C++ executable built against a pinned LLVM/LLD release. The TS backend emits `.ll`; the driver parses/verifies it, applies a selected optimization pipeline, invokes `TargetMachine`, and emits an object. It receives a versioned JSON request and returns structured diagnostics, rather than depending on a Node LLVM addon or a user's `clang` executable.

Pin the complete upstream source revision, patches, build recipe, artifact hashes, LLVM license notices, and enabled targets. The researched LLVM release is a starting pin, not a promise to follow latest automatically. Driver and emitter upgrades are atomic compiler changes; LLVM IR is an internal artifact, not the August package compatibility format. Publish ordinary machine-code native artifacts, not cross-version LLVM bitcode dependencies. [LLVM tutorial/backend integration](https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/LangImpl08.html), [LLVM license](https://llvm.org/docs/DeveloperPolicy.html#license).

Development mode uses verification, `-O0`, useful variable locations, and full source spans. Release mode starts at `-O2` with source line information. Fast-math, unchecked arithmetic, implicit CPU-native instructions, and whole-program LTO are not default choices. Sanitized builds are a verification profile with matching instrumented runtime/adapters; they are not consumer installation requirements.

Use LLVM DWARF metadata for `.aug` files, functions, scopes, and statement positions. Extend `.augmap.json` with IR/object hashes, driver/runtime versions, target, locked native inputs, optimization settings, and source identities. Map backend diagnostics to August spans; linker diagnostics name a package component, missing symbol, and artifact rather than exposing an unexplained C compiler command. Retain `aug emit-c` for comparison temporarily and add proposed `aug emit-llvm` and `aug emit-ir` for contributors. Rich August debugger views and an automatically installed LLDB are separate follow-up work.

The default output is an executable plus a relocatable deployment directory. A later proposed `aug build --library` produces a shared library, generated C header, exported symbol manifest, and embedding contract. Static August library output requires explicit initialization/runtime-link rules and follows the shared-library profile. Native-to-August entry is not needed for the four milestone 1 consumers.

### Distribution without a user toolchain

The npm CLI remains the installation entry point. Embed a compiler-owned host-tool manifest in it. First LLVM build fetches a matching **prebuilt August driver/linker bundle**, verifies its hash, and places it in an immutable user cache. Fetch the target runtime pack similarly. No npm lifecycle script compiles LLVM, the runtime, or a dependency. The extension uses the same versioned installation/cache service and never edits generated `vscode/compiler` files by hand. GitHub release CI must publish and verify these bundles before a CLI pointing at them is published.

For macOS, LLVM/LLD alone is insufficient. Apple SDK redistribution cannot be assumed: the Xcode agreement restricts distribution and extraction of Apple Software. The recommendation is to ship **independently authored, minimal platform import declarations/stubs**, a prebuilt runtime/entry shim, and LLD's Mach-O linker. New August programs link only the pinned runtime/native libraries and that defined platform surface. Do not copy an Apple SDK, Apple `ld`, or SDK `.tbd` files into the release. Treat provenance/license review, actual loader symbols, OS floors, ad hoc ARM64 signing, constructors, rpaths, and clean-machine execution as an early proof gate. [Apple agreement](https://www.apple.com/legal/sla/docs/xcode.pdf), [LLD Mach-O](https://lld.llvm.org/MachO/index.html).

This is a **proposed linkage design requiring implementation evidence**, not a verified SDK replacement. Restrict direct system-native bindings to published platform surfaces until additional stubs are qualified. If the design fails, milestone 1 is blocked on its Mac installation requirement; an LLVM JIT or requiring `xcode-select --install` does not satisfy that acceptance gate. Linux can still progress independently. Mach-O LLD supports executable entry/load commands and ARM64 ad hoc signing, but those facts do not by themselves verify August's full native closure. [LLD implementation](https://github.com/llvm/llvm-project/blob/main/lld/MachO/Writer.cpp), [signing test](https://github.com/llvm/llvm-project/blob/main/lld/test/MachO/adhoc-codesign.s).

Keep **host** identity separate from **target** identity. A macOS ARM64 driver is the program that runs the compiler; an aarch64 Linux object requires a Linux target runtime, libc link surface, dependency artifacts, and deployment assumptions. The package/Rust key `aarch64-apple-darwin` maps to an LLVM target such as `arm64-apple-macosx14.0.0`, with explicit target-machine data layout and linker deployment minimum. A triple is necessary but insufficient. Milestone 1 supports native host=target builds only and rejects unsupported cross-build requests before downloading large packages. Later cross-compilation requires a qualified host/target pair and runnable integration tests on the actual target. [Cross-compilation requirements](https://clang.llvm.org/docs/CrossCompilation.html).

## First-party native interoperability

### The supported contract

Adopt **`aug-native-abi-1`**, a versioned binding profile using each target's **C calling convention**. It describes ABI declarations, marshalling, ownership, errors, and runtime-entry restrictions. A library need not know August's runtime layout. LLVM is an implementation technology; it does not make Rust types, C++ classes, or August objects ABI-compatible.

Start with fixed-width scalars, typed opaque pointers, pointer-plus-length inputs, caller/out parameters, and companion release functions. Status-return/out-pointer adapters avoid platform-specific aggregate returns. Preserve ordinary existing scalar `extern C`; add the resource and marshalled declarations described in the examples. Those additions are proposals and require frontend checking, formatting, navigation, and docs support.

| Surface | Contract |
| --- | --- |
| Scalars | Fixed signed/unsigned widths and float widths in ABI metadata; explicit checked narrowing to C `int`/`long`/`size_t`. August int/float remain int64/double. C bool, char, enum underlying types, sign/zero extension, and calling convention are verified per target. |
| Structs | Only C-layout structs with compiler-produced size/alignment/field offsets, normally passed by pointer. August records are not C structs. Packed structs, unions, bitfields, aggregate-by-value classification, varargs, and vector ABI are rejected initially. |
| Strings | Distinguish UTF-8 pointer/length from NUL-terminated C strings. State validity, termination, embedded-NUL behavior, and whether input is retained. Copy returned text before its declared owner releases it. |
| Arrays/buffers | State element width, stride, alignment, length units, mutability, maximum allocation, and allocator. Copy lists into contiguous native arrays; borrow immutable Bytes only for the current call with a retained root. Never pass a tagged List's storage as a double array. |
| Handles | Opaque typed resources identify their provider and release symbol. Owning handles cannot be forged, copied, or used after move/drop. Ordinary read inputs can inspect an owned handle; mutation needs borrow/own. Native internal reference counts do not imply August ownership sharing. |
| Ownership transfer | A consuming native call consumes on every result path; conditional transfer is unsupported initially. Return ownership and matching deallocator are mandatory. Free native memory with the allocating library, never a guessed runtime allocator. |
| Borrowed memory | Milestone 1 supports call-duration loans only. Retained pointers, borrowed results, and views escaping an owner require an explicit later lifetime profile; copy them now. No pointer survives task suspension or moving its owner without a validated pin/lifetime contract. |
| Callbacks | Milestone 1 rejects callbacks. Later support uses typed trampolines, userdata, retained roots, explicit registration/unregistration lifetime, and declared same-thread/foreign-thread behavior. A native callback cannot throw an August error across the C stack. |
| Threads | Initial calls run on August's runtime thread. Foreign library threads may perform their own work but must not touch managed values or call August. Declare blocking/thread-affine/internal-thread behavior. Background execution and queued callbacks need a later audited runtime-entry API. |
| Errors | Native status mapping identifies an August error factory and copies bounded error data. C++ exceptions and Rust panics stop in their native adapter. Raw native faults are outside the checked guarantee. |

Initial public APIs return copied lists/text/bytes and owned handles. August's signed int64 cannot represent all native uint64 values: conversions reject values outside the source range rather than wrapping or silently losing bits. A wider unsigned source API is a separate addition if a package needs it. A nonmoving collector helps call-duration loans but does not prove the foreign library respects them. Header generation cannot infer lifetimes, thread behavior, exception policies, or allocator pairing. Binding authors must supply those facts.

Blocking native work does not gain cooperative preemption by being called from `start`. The initial runtime cannot cancel an active LibTorch/SQLite call until it returns; report that in hover/specs. Resource cleanup occurs afterward. Nonblocking/native-worker adapters need a separately qualified cancellation, retained-root, and completion profile.

### Native code calling August

Define an optional embedding profile with an opaque runtime context, generated C header, explicit initialize/shutdown, and status/out-pointer exports. The caller must enter the runtime through that context on its permitted thread. Reentrant same-thread calls need nested root/error frames; foreign-thread callbacks enqueue work instead of entering the current collector directly. Shutdown waits for registered work and invalidates callback registrations before unloading a library.

Export only concrete scalar/buffer/resource APIs at first. No `AugValue`, class layout, generic Rust type, C++ standard-library value, or August closure appears in the public header. This profile is milestone 3 work, with its own tests; it must not be advertised as available merely because LLVM can export a symbol.

### C headers and direct bindings

Add a maintainer command, proposed `aug bind header HEADER --target TARGET --output native.abi.json`. It uses pinned Clang tooling in the maintainer build environment to resolve typedefs, calling conventions, preprocessor configuration, declarations, and layout. Compile independent C probes and compare symbol exports against the produced artifact. Store header digests, parse flags, target, and layout facts in the descriptor. Consumer builds read this verified descriptor; they do not parse headers with a local Clang.

Handwritten declarations remain possible but must match a checked descriptor for packaged native APIs. Straightforward C functions lower directly to their symbols. Small adapters are appropriate for `sqlite3_open_v2` out-pointers/error extraction, prepared statements, zlib allocation conventions, and checked-width conversions. Generator output reduces transcription; author-supplied ownership and effect declarations remain visible beside the public binding API. System symbols outside a qualified platform contract remain unsafe and unsupported by the no-toolchain profile.

### C++ and LibTorch

Build a C++ adapter **against the exact LibTorch release used in the artifact**. Export only unmangled versioned C symbols. Use opaque tensor handles whose C++ implementation owns `at::Tensor`/`torch::Tensor`; instantiate the selected template operations in the adapter, rather than teaching August the C++ object or template ABI. Catch exceptions before returning. Copy the input values into owned CPU float64 storage; do not return a tensor referencing a temporary August list. Addition creates another owned handle and values are copied out before release.

Pin LibTorch, C++ language standard, platform C++ runtime, deployment floor, and Linux `_GLIBCXX_USE_CXX11_ABI` where relevant. Match debug/release requirements for targets that distinguish them. C ABI stability of the adapter does not make an arbitrary LibTorch dylib swap compatible. Ship the tested dynamic closure and its notices, audit Mach-O/ELF import lists and rpaths, and prohibit GPU/device selection in this initial API. Current researched PyTorch releases require C++20; do not copy older C++17 instructions into the maintainer guide. [LibTorch installation](https://pytorch.org/cppdocs/installing.html), [upstream release requirements](https://github.com/pytorch/pytorch/releases/tag/v2.12.0).

Allow binding generation to generate C thunks for an approved finite signature set. An all-header C++ importer would conceal overload, template, ownership, and exception choices and is outside this plan.

### Rust

For an existing crate without a C ABI, publish a small **Rust adapter crate** with an exact Cargo dependency, committed `Cargo.lock`, a pinned Rust toolchain, and `cdylib`/`staticlib` output. Exports use `extern "C"` and C-compatible pointers/scalars or `repr(C)` pointer-accessed records. Rust `String`, `Vec`, references, trait objects, and default Rust layout never cross directly. Copy or explicitly transfer native allocations and provide the same adapter's release function. Opaque `Box`-owned resources use matching destroy exports when a library needs them.

Catch unwind panics inside each fallible export; a stateful handle partially changed by a panic must be poisoned or consumed according to its declared contract. An already C-compatible Rust library can be consumed like C after checking its error/panic/lifetime guarantees; it does not need to be rebuilt merely to obtain LLVM compatibility. BLAKE3's first adapter hashes input with the real Rust crate, returns Rust-owned digest text, and frees it through Rust after August copies it. Exact features and panic strategy are locked. [Rust library artifact types](https://doc.rust-lang.org/reference/linkage.html), [layout and FFI](https://doc.rust-lang.org/nomicon/other-reprs.html), [BLAKE3 crate source](https://github.com/BLAKE3-team/BLAKE3/blob/master/Cargo.toml).

### Checked facts and remaining unsafe work

The compiler validates resolved native symbol/type identity, supported layout, parameter labels and width conversions, declared ownership/borrow compatibility, releases on all lowered exits, error mapping, target compatibility, artifact integrity, and unsupported profiles. It cannot prove that arbitrary native instructions respect a pointer, that a destructor is infallible, that a pure declaration is truthful, or that a library is free of memory bugs. Keep raw native calls in `unsafe` inside the binding package. Ordinary application imports use its checked August API without `unsafe`.

Specs, hover, `aug context`, and `aug explain` must show the **used** binding surface, source/native provider, ownership, checked errors, target constraints, blocking behavior, and links to the adapter contract. They must distinguish author assertions from compiler-checked facts. Do not make users type inferable `uses`/error/result boilerplate in implementations; foreign declarations still state facts the compiler cannot infer.

## Extend the current package system

### Manifest and lock

Add manifest **format 2** for packages declaring `native`; retain format 1 pure-source support. The new format makes old compilers reject unsupported native metadata instead of ignoring it. Keep `name`, `version`, exact preview `compiler`, `source`, and ordinary `dependencies`. Native packages require a manifest even though pure Git folders may omit one.

`native` declares the binding descriptor and digest, ABI/profile version, supported target records, artifact URLs/hashes, link objects/libraries, runtime files, dependency component inventory, license notices, and optional source-build recipe inputs. Target records include OS, architecture, minimum OS, CPU baseline, libc implementation/minimum where applicable, C++ runtime/ABI, panic strategy, and any required system facilities. Do not equate `linux/arm64` with a complete ABI target.

There are two forms of native dependencies. An ordinary August dependency may have its own native section, resolved through the existing source graph. A package may also bundle upstream native components in one artifact, such as LibTorch and its required dylibs; those are an explicit versioned closure in the manifest/SBOM, not hidden installations or a separate registry. The native link planner merges that closure with the runtime pack. Reject conflicting versions/install names/symbol providers for a process unless an explicitly tested isolation strategy permits them. Initially reject incompatible multiple LibTorch versions; do not pretend symbol visibility creates independent C++ runtimes.

Lock format 2 records source identity plus target-specific artifact selections and transitive native edges, descriptor hashes, wrapper/upstream versions, runtime/toolchain pins, link mode, and deployment paths. Support multiple locked targets. Proposed `aug install --target TARGET` adds an explicit target selection without updating source revisions; `--frozen` rejects an unrecorded target. Target expansion and dependency updates are different operations. Native adapter ABI compatibility can span compiler versions later; keep exact compiler matching during the preview rather than widening it during backend migration.

Extend `git-packages.ts`'s allowlist and `packageDigest` to include the conventional native descriptor and notices. Consumer installation still does not fetch arbitrary native source/build scripts into executable paths. Optional source builds obtain the locked full source inputs separately. Test local, Git, and npm transports through the same schema and digest functions.

### Installation, caches, and loading

Use the existing source resolver and writer locks. For GitHub URLs, add a bounded HTTPS transport that resolves the selected ref to a commit and reads source through tree/blob requests, checking blob identities and the existing source filters/digests. A bounded commit archive is an alternative for small repositories; subfolder imports must not require downloading an entire large upstream repository. It avoids relying on `/usr/bin/git`, which may demand Command Line Tools on a fresh Mac. Preserve generic public Git transport where Git is available; GitHub imports in milestone 1 require neither Git nor a developer SDK. Handle API rate limits with cache reuse and an actionable diagnostic; credentials/private packages remain outside this initial workflow.

Source installation produces a deterministic native artifact plan. First build/run downloads only the selected host-tool/target/native artifacts, checks SHA-256 before extraction, verifies file hashes and expected symbols/target properties, and stages them atomically into a content-addressed native cache. `aug install --frozen` can prewarm that closure; `aug check` validates source/contract metadata without executing native code or downloading binaries. Missing artifact metadata prevents a supported build but need not prevent editing a source file offline.

Reject path traversal, archive device entries, unexpected executable files, duplicate paths, unbounded extraction, and escaping symlinks. Native archives may require ordinary dylib symlinks: normalize them into declared regular deployment files where possible; otherwise permit only manifest-declared, internal, validated links. Source packages retain their existing stricter rules. Set download/unpacked-size limits per declared artifact and an aggregate limit; LibTorch needs a larger explicit allowance than small source packages.

Artifact hashes establish that downloaded bytes match the locked metadata; they do not establish author trust. First-party workflows should publish provenance, SBOMs, source/build identities, and notices, verify attestations against the repository/workflow identity, and scan native dependencies on a scheduled release process. Third-party packages remain reviewable executable dependencies. Never run a downloaded library or dependency script as an installation validation step without entering an explicit test/run command.

Build a `NativeLinkPlan` with no shell interpolation or arbitrary linker flags from a package. Whitelist typed link options and exact declared paths. Milestone 1 uses a dynamic prebuilt runtime and dynamic adapters; SQLite/zlib can be embedded statically inside their adapters and Rust uses a cdylib. This keeps OS imports inside maintainer-built binaries for the initial Mac linker proof. Later qualify static app linking for the small libraries where license obligations and duplicate-symbol checks allow it; LibTorch remains dynamic. Shared deployment uses relative loader paths (`@loader_path`/`@rpath` on macOS and `$ORIGIN` on ELF), not paths into a developer cache. Produce a deployment manifest and proposed `aug build --bundle DIR` directory containing executable, private dylibs, notices, and checksums. The deployment smoke test must run after moving that directory and removing cache access.

### Source builds and executable scripts

**No automatic package build scripts, npm install hooks, Cargo builds, or missing-artifact source fallback.** Unsupported/missing prebuilt targets fail with a list of supported targets and the maintainer's source-build instructions.

Maintainers use a proposed `aug package native build --target TARGET` against their checked-out repository. Consumers may explicitly request a proposed `aug install --build-from-source ALIAS --target TARGET`. That command states the selected package/recipe, native toolchain and SDK requirements, output target, and additional transitive build inputs before execution. It uses locked inputs in a separate build directory with network access disabled after declared downloads. Containers can isolate filesystem/toolchain access on supported hosts; do not advertise a container or a directory as a complete sandbox. No persistent implicit permission applies to later unrelated packages.

Do not use `check`, `spec`, hover, installation, or artifact verification to execute a recipe. Cache source-built output under its complete source/toolchain/target/feature identity and keep its local provenance distinct from a published prebuilt artifact.

### Publishing and roles

Source lives in the public repository; large artifacts live in its GitHub Releases or immutable equivalent storage. Git tags remain the source-sharing unit. npm packaging is optional for native library authors. Release workflows first build and test native outputs, compute hashes, commit the final artifact metadata, then publish an immutable tag with those artifacts and their provenance.

Avoid a commit/hash cycle: build native files from commit S, add only the computed distribution metadata in release commit P, and tag P. Record S in provenance plus the digest of the native source/header/descriptor/recipe inputs, and verify those inputs are unchanged in P. Binding/API changes require a rebuild. Uploading the final package source does not magically prove binaries were built from it. Publish test evidence for the installed consumer package against P before announcing the release.

August compiler developers own the IR, backend, runtime ABI, platform tool/runtime packs, descriptor checker/generator, package resolution, diagnostics, and regression gates. Native package maintainers own wrapper behavior, upstream pins, ownership/effect assertions, artifact targets, licensing, source-build recipes, release CI, and native conformance tests. Application developers import the checked APIs, commit locks, choose supported deployment targets, handle checked failures, and review/update dependencies deliberately.

An upstream maintainer can add `aug-package.json`, August exports, adapter source, and release assets directly to its repository or a selected subfolder. For example, a proposed `august/` source package in an upstream repository can be imported using the existing URL shape `https://github.com/OWNER/LIBRARY/august#vX.Y.Z`; its manifest refers to native artifacts published by that same upstream release. A third party can keep the same files in a separate binding repository and pin the upstream dependency in its native build manifest. Neither requires registration in an August-only registry. Record upstream origin and binding maintainer separately; do not imply that a third-party PyTorch binding is endorsed by PyTorch.

## Ordered implementation backlog

Each item has a mergeable outcome, but **milestone 1 closes only after item 9**. Items 2 and 3 can proceed independently after item 1; the dependency column controls integration. Names below are proposed components unless linked to existing source.

| Item | Depends on | Work and locations | Acceptance |
| --- | --- | --- | --- |
| 1. Contract and fixtures | — | Document `aug-native-abi-1`, resource rules, target identity, schema versions; add `src/native-contracts.ts`, `native/abi/`, independent fixtures. Read current `ast.ts`, `checker.ts`, ownership and runtime layouts. | Scalar/layout/header probes agree; supported/unsupported declarations have deterministic diagnostics; resource/error/call-duration rules are explicit. |
| 2. Four package repositories | 1 | Create the four named repos with the example layouts, exports, wrappers, real upstream pins, licenses, native tests, and GitHub artifact workflows. Start CPU LibTorch first because of its closure. | C/C++/Rust probes perform the documented real operations; native source/input identity is recorded; provisional artifacts pass target and cleanup checks. |
| 3. IR and LLVM vertical lowering | 1 | `src/ir/`, `src/lowering.ts`, `src/backends/llvm.ts`, `native/compiler-driver/`; reuse checked call/effect/ownership plans. | Four example feature sets lower to verified LLVM; differential core cases preserve values, error/cleanup order, DI, labels, and roots. No unsupported feature silently falls back. |
| 4. Runtime and target packs | 1, 3 | `runtime/aug_native_resources.c`, private pointer-call services and reverse callbacks, method/schema/task/endpoint invocation helpers, C reference bridges, target ABI probes; `scripts/build-native-runtime.mjs`, compiler-owned host/target manifests. | Real resource cleanup is immediate and once-only; runtime/private-layout versions match; interface dispatch, debug/release outputs, and GC-pressure/error tests pass. |
| 5. SDK-free AOT distribution proof | 3, 4 | Pinned LLVM/LLD driver bundles, independently authored macOS import surface/entry shim, artifact signing/provenance; extend release/package builders. | Installed CLI emits and links native executable on truly clean macOS ARM64 without native tools/SDK; moved output runs; platform surface provenance and redistribution reviewed. |
| 6. Native package resolution | 1, 2 | Extend `package-manager.ts`, `git-packages.ts`, `package-locking.ts`, `config.ts`; add `src/native-packages.ts`, `src/native-link-plan.ts`, bounded artifact downloader/extractor. | Git/local/npm source conventions retained; descriptors covered by digest; target/native graph conflicts diagnosed; frozen/offline/concurrent/failed installs preserve correct snapshots; GitHub works without host Git. |
| 7. Checked bindings and generation | 1–4, 6 | Extend `ast.ts`, `project.ts` definition/export indexing, parser/checker/types/ownership and backend native conversions; add header/descriptor commands. Update formatter/help/semantic/spec/editor/LSP and bounded native error reporting. | Header drift, incompatible ownership, invalid widths/layouts, unsupported callbacks, missing/signature-incompatible releases, and unchecked failures are caught; package APIs have useful hover/context/specs. Actual allocator pairing remains an audited native contract with integration tests. |
| 8. Linked package execution | 2–7 | LLVM CLI backend selection, explicit requirements, native link plan, bundle output. Replace C identifier scanning on this path. Publish candidate artifacts and tagged sources. | Installed CLI compiles and runs all four examples using public URLs; build report proves LLVM and exact native closure; deployment does not use cache paths. |
| 9. Milestone 1 qualification/release | 8 | Native package end-to-end tests, clean VM matrix, independent cleanup/failure probes, executable wiki examples; publish compiler preview only after artifact availability. | Every milestone 1 gate above passes; demonstrate direct and alias imports, frozen restore, offline use, unsupported target and absent-artifact diagnostics. |
| 10. Full-language LLVM parity | 9 | Tasks/scopes/locks, interfaces/defaults/generics, interceptors, HTTP/HTML/OpenAPI/streams, tests/coverage/debug info. Parameterize existing native regressions and sanitizer harnesses by backend. | Existing regression/doc/gallery/package/runtime suites run through LLVM; independent oracles agree; C/LLVM differential outcomes reviewed; no new GC/thread/security semantics. |
| 11. Linux target qualification | 9; default needs 10 | Add glibc x86-64 then glibc ARM64 target packs, ELF loader/bundle rules, C++ ABI pins and real package artifacts, Docker build/run/devcontainer updates. | Clean minimal hosts/containers with Node/npm and no compiler build all four samples; deploy with locked libc/C++ floors; CI executes on each architecture. |
| 12. Default backend and stability | 10, 11 | Make LLVM default for qualified targets, publish runtime/native compatibility and upgrade policy, remove application C emission from normal build path. | All default-backend gates below pass across release artifacts; diagnostics/migration guides ready; installed CLI/extension agree. |
| 13. Additional native profiles | 12 | Native-to-August library output, synchronous callbacks then foreign-thread queue API, borrowed views/zero-copy, selected aggregate ABIs. | Each profile has compiler/runtime/native probes and lifetime/reentry/cancellation tests before being declared supported. |
| 14. Broader targets/API coverage | 11–13 as applicable | macOS x86-64 feasibility; Windows runtime port/MSVC ABI; separately qualified musl; richer LibTorch API and eventual GPU packages. | Qualified toolchain/ABI/dependency closures and actual clean deployment tests; no target or GPU promise based on code generation alone. |

The backend interface should support the current `generateC` path temporarily. Keep C available explicitly as a reference backend through milestones 1 and 2; a C build still needs its documented host tools. Both backends consume the same frontend checks. Begin differential migration with current C generation, then route it through shared IR where that reduces duplicated execution semantics. The new native resource/marshalling profile can be LLVM-only in the preview: compare it with independent native clients rather than porting the entire new interface to C solely for comparison. A C request for that profile gets a clear unsupported-backend diagnostic. Do not maintain two ownership checkers or two effect systems.

## Validation and platform rollout

### Tests that establish the milestone

Extend existing `tests/ecosystem.test.mjs` and `tests/user-packages.test.mjs` for public repository imports, transitive native components, locks, safe extraction, compiler/ABI conflicts, moved refs, corruption, interrupted downloads, concurrent cache users, offline restoration, and target selection. Use fixture servers for deterministic transport failures; use the **real public repositories and release artifacts** for the acceptance run. A local fixture repository alone does not prove publishing/install works.

Add `tests/llvm-backend.test.mjs`, `tests/native-contracts.test.mjs`, and `tests/native-packages.test.mjs`. Probe all scalar widths, bool extension, null/empty buffers, alignment, size overflow, UTF-8/NUL conversion, returned-memory release, wrong type handles, moved/drop use, and exceptional acquisition. Compare against independently written native clients, not expectations generated from the same binding descriptor. Allocation counters are supplemental evidence; sanitizer tests exercise the actual wrappers/runtime and repeated calls, rather than only counting a mocked destructor.

Library evidence includes tensor shape/type/value checks and forced native failures; SQLite statement finalization, SQL errors, parameter binding, no-result behavior, file persistence, and cleanup after failed queries; zlib empty/binary/large/truncated input and maximum output limits; BLAKE3 upstream vectors, empty input, UTF-8 input, output deallocation, and an injected panic contained by the actual Rust export. For LibTorch binaries that cannot be instrumented, clearly scope sanitizer evidence to instrumented adapters and separately run real artifact stress/leak checks.

Run current `compiler`, `language-evolution`, `language-conformance`, `concurrency`, `effects`, `effect-inference`, `interceptors`, `runtime-optimization`, `robustness`, web/crypto/OIDC, tooling, documentation, gallery, and package tests on LLVM as their features land. Existing `scripts/sanitize-core.mjs` currently reuses C compiler arguments; update it to instrument the LLVM object/runtime pipeline and keep a C comparison path. [Current conformance](../tests/language-conformance.test.mjs), [task cleanup regressions](../tests/concurrency.test.mjs), [core sanitizer harness](../scripts/sanitize-core.mjs), [first-run tests](../tests/run-setup.test.mjs).

Build debug and release versions, introduce GC pressure around every native call, and test cleanup on failed conversions as well as failed native operations. Never free a returned native buffer before copying it or forget to release it when converting it fails. Test partial linking, missing runtime dylibs, relocation of bundles, and replacing an artifact without changing its version.

### Platform order

| Order | Target | Qualification and constraints |
| --- | --- | --- |
| 1 | `aarch64-apple-darwin`, macOS 14+ | Current development/CI locality; CPU LibTorch; system libc/libc++ baseline; SDK-free linker proof; ARM64 signing and actual minimum-OS run. |
| 2 | `x86_64-unknown-linux-gnu` | Existing Ubuntu/Docker CI locality. Current LibTorch C++ installation documentation names glibc 2.29 for its GNU/Linux cxx11 distribution; begin there, inspect the selected binaries' actual symbol versions, and publish the exact libstdc++/CXX11 ABI requirement. Raise the declared floor if any selected component requires it. This is not an already qualified support claim. [Upstream requirements](https://docs.pytorch.org/cppdocs/installing.html). |
| 3 | `aarch64-unknown-linux-gnu` | Existing Linux ARM64 runtime evidence, but all four native closures must be rebuilt/qualified; do not assume a Linux x86 LibTorch archive covers ARM64. |
| 4 | macOS x86-64, then Windows x86-64 | Intel LibTorch availability may require a different compatible upstream version or source build. Windows needs POSIX runtime replacement, loader rules, MSVC ABI/import libraries, CRT policy, and dedicated CI. Neither is presently supported by the initial profile. |
| Separate | Linux musl, cross-compilation, GPUs | glibc artifacts are not musl artifacts. Cross-builds need target runtime/link inputs and execution tests. GPUs require driver/device/version/distribution decisions beyond CPU LibTorch. |

Use target OS/ABI floors in both artifact selection and executable metadata. Do not specialize consumer artifacts to the maintainer's CPU. Keep release builders distinct from clean consumer VMs: hiding `clang` on a CI host that still has its SDK is not proof of SDK-free installation.

### When LLVM becomes the default

Make LLVM default only after complete supported-language/runtime parity, clean installed npm/extension tests, deterministic specs/docs, source-level diagnostic and breakpoint checks, independent memory/error/ownership probes, all four real public native packages, moved deployment bundles, and repeated CI qualification on the committed support targets. Run the existing reproducible benchmarks to detect regressions, with startup/build time and native download size reported separately. Set workload-specific regression thresholds before qualification; LLVM is not adopted on a promised generic speedup.

Ship a preview period with explicit backend selection and bug reports that include target/build evidence. Stop maintaining C as a shipping backend when the LLVM default has survived that period and the declared release gates. Preserve historical C outputs/fixtures for migration evidence if useful; a permanent dual-backend ecosystem is not the recommendation.

## Risks, deferred work, and input decisions

The largest early risks are SDK-free Mac AOT linkage, the size and transitive ABI of LibTorch, preserving root/cleanup/error order when leaving structured C, unsafe metadata assertions, and correctly distributing target runtime libraries. Exact public import ergonomics can be reused, but the current Git requirement and metadata filters are real changes, not documentation fixes. The C++ wrapper isolates August from C++ source ABI details; it cannot make mismatched LibTorch artifacts safe. LLVM upgrades and host/target artifacts add release maintenance and CI cost.

Deferred features are GPU support, training/autograd/full PyTorch APIs, arbitrary C++ classes/templates, Rust ABI imports, compiler-inferred foreign lifetimes/effects, escaping borrowed memory, callbacks in milestone 1, native threads entering the existing collector, general varargs/unions/bitfields/packed/aggregate-by-value ABI, all-platform cross-compilation, automatic source builds, a new GC, and formal proof of arbitrary native safety. Existing ownership, cooperative concurrency, HTTP security policies, and module/export meaning stay authoritative.

**Routine recommendations already made:** four `GreenPandaStudios/aug-*` repositories; Rust BLAKE3; C ABI adapters; macOS ARM64 first; prebuilt consumers; source Git imports and release assets; private prebuilt C runtime; checked August IR; temporary C reference backend; copied outputs/call-duration loans first. They do not need a design interview before implementation can begin.

Two product decisions merit your input before scheduling the work:

1. **Release scope:** should LLVM as the default and the native package contract be requirements for 1.0, or ship as a later preview? Recommendation: qualify them before freezing a 1.0 native/package ABI. This changes the existing roadmap and the amount of work before 1.0.
2. **Minimum Mac version:** accept macOS 14+ for the complete initial four-package experience? Recommendation: yes. Supporting older Macs with LibTorch would require a separately qualified upstream version/source build and is outside milestone 1.

Actual dylib requirements, SDK-free linking feasibility, exact artifact digests, license/provenance review, and platform CI success are **engineering qualification tasks**, not questions to settle through preference. Repository creation, native implementation, release publication, and changing the default backend occur in the ordered backlog after this plan is selected.
