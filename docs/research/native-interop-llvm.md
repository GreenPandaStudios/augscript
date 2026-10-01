# Native interoperability and an LLVM backend

Research checked October 1, 2026. This note supports August implementation work. It does not describe shipping native package support or an implemented LLVM backend. Upstream evidence, recommendations, and the limited local AOT experiment below are distinct. Selected LLVM binaries and SDK-input-free linkage were measured; a fresh macOS 14 consumer machine and the full August/native dependency closure remain unqualified.

The recommended first target is Apple Silicon, macOS 14 or later. Ordinary August consumers receive prebuilt compiler tools, runtime, and native adapters. Maintainers build those artifacts with C, C++, Rust, CMake, and an appropriately licensed Apple SDK. Consumer compilation must produce a native executable without invoking a system compiler or requiring Xcode, Command Line Tools, or a separately installed LLVM.

## Verified release candidates

These exact versions are available in first party release sources. They are qualification candidates, rather than a claim that August has built, tested, or approved their artifacts. Record immutable source revisions, dependency locks, build configuration, and hashes of the actual output before publishing an August package.

| Component | Candidate pin | Primary evidence and qualification boundary |
| --- | --- | --- |
| LLVM and LLD | `llvmorg-23.1.2` | The [release page](https://github.com/llvm/llvm-project/releases/tag/llvmorg-23.1.2) lists an Apple Silicon archive and verification instructions. The local experiment below verifies archive bytes, selected tool deployment metadata, and narrow linkage mechanics; the clean machine/full runtime gate remains open. |
| CPU LibTorch | `2.14.1` | The [release](https://github.com/pytorch/pytorch/releases/tag/v2.14.1) and [official CPU archive index](https://download.pytorch.org/libtorch/cpu/) list `libtorch-macos-arm64-2.14.1.zip`. The archive bytes, dependency closure, and checksum still require inspection. |
| SQLite | `3.53.4` | The [download page](https://www.sqlite.org/download.html) supplies `sqlite-amalgamation-3530400.zip` and its SHA3-256 digest. Its macOS downloads are command line tools, rather than the reusable August adapter library. |
| zlib | `1.3.2` | The [upstream release page](https://zlib.net/) supplies source archives, digests, and signatures. Build the adapter and library in maintainer CI. |
| Rust BLAKE3 crate | `blake3 = "=1.8.7"` | The [release](https://github.com/BLAKE3-team/BLAKE3/releases/tag/1.8.7) and [tagged Cargo manifest](https://github.com/BLAKE3-team/BLAKE3/blob/1.8.7/Cargo.toml) identify this version. Release 1.8.7 removes the `arrayref` dependency after the reported owner compromise. Preserve `Cargo.lock` and verify the dependency graph. |

PyTorch 2.12 release notes document raising `MACOSX_DEPLOYMENT_TARGET` to 14.0, validating dylib minimum versions, and requiring C++20 in its build configuration. These released changes support a macOS 14 baseline for the newer LibTorch candidate. The final supported floor must be the highest requirement found in the compiler, runtime, adapter, and every dependency, then demonstrated on that OS. This research did not inspect the 2.14.1 Mach-O files: an archive metadata request returned HTTP 403. [PyTorch 2.12 release notes](https://github.com/pytorch/pytorch/releases/tag/v2.12.0)

## LLVM integration and the platform ABI

LLVM's object emission tutorial uses a target machine, target triple, and target data layout before emitting an object file. `llc` also supports direct object output. Emitting an object is distinct from linking an executable. [LLVM object emission tutorial](https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/LangImpl08.html), [llc reference](https://llvm.org/docs/CommandGuide/llc.html)

LLVM does not supply a common C++ or Rust ABI. LLVM's own FAQ states that frontends must emit platform specific IR to satisfy C ABIs. Apple's ARM64 ABI has differences from the generic AArch64 ABI, including caller extension of arguments smaller than 32 bits. [LLVM ABI FAQ](https://www.llvm.org/docs/FAQ.html#can-i-compile-c-or-c-code-to-platform-independent-llvm-bitcode), [Apple ARM64 ABI](https://developer.apple.com/documentation/xcode/writing-arm64-code-for-apple-platforms)

**Recommendation:** begin with a small target specific C ABI: `int32_t` status values, fixed width integers, `float`/`double` where needed, pointer parameters, explicit lengths, caller supplied output buffers, and opaque owning handles. Exclude varargs, C++ classes, Rust layouts, aggregate arguments or returns by value, callbacks, and borrowed views that survive a call from the first supported surface. Compile ABI probe functions with the maintainer C/C++ toolchain and compare August calls against them; spelling an LLVM calling convention `ccc` is insufficient validation.

For this target, distinguish the consumer package key `macos-arm64` from the LLVM target `arm64-apple-macosx14.0.0` and Rust target `aarch64-apple-darwin`. Rust documents Mach-O for this target and a default ARM64 minimum of macOS 11, with `MACOSX_DEPLOYMENT_TARGET` able to raise it. Set the maintainer Rust deployment target to the August baseline. Rust's lower default cannot lower a LibTorch dependency's requirement. [Rust Apple Darwin target](https://doc.rust-lang.org/rustc/platform-support/apple-darwin.html)

Keep native objects and libraries as the distribution boundary. Do not require Rust's LLVM version to match August's LLVM merely to link ordinary native objects through the tested C ABI. Cross language LLVM bitcode or LTO introduces another compatibility contract and should be a later, independently tested feature.

**Recommendation:** retain the TypeScript parser and checker, introduce one explicit typed lowering representation, and initially emit textual LLVM IR. Package `llvm-as`/verification, optimization, object generation, and Mach-O LLD behind one versioned toolchain interface. A small prebuilt LLVM helper can later consolidate those operations; avoid coupling Node.js to LLVM's C++ layout through an unmaintained binding. LLVM's C API stability is best effort, and its release policy preserves patch branch stability within stated limits. [LLVM API policy](https://llvm.org/docs/DeveloperPolicy.html#c-api-changes)

Derive data layout from the selected target machine. Preserve August's existing evaluation order, integer behavior, checked error branches, ownership cleanup, and runtime semantics in explicit lowering. The LLVM language reference defines poison and undefined behavior, so overflow flags, `inbounds`, alignment, and alias attributes must follow proven August contracts. Start with conservative attributes and add optimizations only after semantic regression evidence. [LLVM language reference](https://llvm.org/docs/LangRef.html)

LLVM documents selecting distribution components and target backends through CMake. Use that workflow to ship the tools or helper actually needed, their runtime dependencies, and notices, rather than the complete maintainer installation. [Building an LLVM distribution](https://llvm.org/docs/BuildingADistribution.html)

## SDK independent AOT on a clean Mac

Apple's Command Line Tools package includes the macOS SDK and compiler tools. Installing it is a workable maintainer path, but fails the consumer requirement in this plan. The current Xcode and Apple SDKs agreement restricts redistribution of Apple Software without express permission (§2.7), restricts permitted copies and separated SDK use (§2.5), and treats open source components according to their governing licenses. Do not assume that distributing LLVM authorizes copying Apple SDK `.tbd` files, SDK headers, or Apple's proprietary tools. These are license terms and a provenance constraint, not a legal opinion about independently authored metadata. [Apple command line tools FAQ](https://developer.apple.com/library/archive/technotes/tn2339/_index.html), [Xcode and SDK agreement](https://www.apple.com/legal/sla/docs/xcode.pdf)

LLVM's Mach-O linker is an available independent linker implementation. Upstream LLD source selects `_main` as the default executable entry and emits `LC_MAIN`, `LC_LOAD_DYLINKER` for `/usr/lib/dyld`, and platform/version load commands. Its driver describes `crt1.o` as a support file for macOS 10.7 and older. This supports a modern entry path without copying legacy CRT objects; it does not prove the full August link recipe. The source inspected here is upstream `main`; repeat these checks against the pinned release. [Mach-O LLD](https://lld.llvm.org/MachO/index.html), [LLD driver](https://raw.githubusercontent.com/llvm/llvm-project/main/lld/MachO/Driver.cpp), [LLD writer](https://raw.githubusercontent.com/llvm/llvm-project/main/lld/MachO/Writer.cpp)

LLD's ARM64 tests check `LC_CODE_SIGNATURE` both with default settings and with `-adhoc_codesign`. The linker can write the signature itself, without executing a consumer `/usr/bin/codesign`. Treat local generated executable signing separately from publisher signing/notarization of downloaded toolchain artifacts. [LLD ad hoc signing tests](https://raw.githubusercontent.com/llvm/llvm-project/main/lld/test/MachO/adhoc-codesign.s)

Ordinary lazy bindings need `dyld_stub_binder`, as shown in LLD's stub helper implementation. Chained fixups follow another path; pin and test one initial recipe rather than relying on changing linker defaults. LLVM's minimal test SDK illustrates a TAPI stub format and binder spelling, but is a synthetic fixture with test install names and UUIDs. It establishes linker mechanics, not production runtime compatibility or the provenance of a distributable August platform file. [LLD binding implementation](https://raw.githubusercontent.com/llvm/llvm-project/main/lld/MachO/SyntheticSections.cpp), [LLVM test stub](https://raw.githubusercontent.com/llvm/llvm-project/main/lld/test/MachO/Inputs/MacOSX.sdk/usr/lib/libSystem.tbd)

**Recommended AOT feasibility experiment:** build an August runtime dylib and each adapter on maintainer machines. Keep OS calls inside those prebuilt libraries. Generate August object code that references their small exported C surfaces. Supply a separately authored, provenance documented platform import description for the real system install name, with only the binder and any audited system symbols introduced by LLVM lowering. Apple documents `/usr/lib/libSystem.B.dylib` in real Mach-O import load commands. Verify the exact install name and exports on the oldest supported OS. Do not copy the synthetic LLVM fixture's `/usr/lib/libSystem.dylib` install name into a release assumption. [Apple dynamic library identification](https://developer.apple.com/forums/thread/736719)

The experiment must inventory undefined object symbols after optimization and object generation. LLVM may introduce `memcpy`, `memmove`, `memset`, stack probes, or compiler builtins even when August source only calls its runtime. Resolve them through a measured platform import surface or prebuilt August implementations. A missing symbol must fail the build. Broad `-undefined dynamic_lookup`, an ambient SDK search, or extracting files from the user's dyld cache is not the proposed production recipe.

Link with the bundled Mach-O linker, explicit architecture and platform minimum, explicit runtime/adapter paths, and controlled library search paths. The linker SDK version metadata must be defined by the tested artifact recipe; it must not imply that a consumer has an SDK installed. Retain two level namespace binding. Use relocatable install names and rpaths for bundled dependencies; Apple documents `@rpath`, `@loader_path`, and `@executable_path` relationships. [Apple run path libraries](https://developer.apple.com/library/archive/documentation/DeveloperTools/Conceptual/DynamicLibraries/100-Articles/RunpathDependentLibraries.html)

This is a realistic bounded approach because all source requiring Apple headers is compiled by maintainers and consumers link only generated August objects against published artifacts. It remains a required feasibility gate: the research does not establish rights to every possible import description or prove that the proposed runtime dependency graph will link without SDK inputs. Require provenance review of the actual platform files and a fresh macOS 14 ARM64 VM before claiming a self sufficient AOT toolchain.

Alternative approaches have different outcomes. User installed Apple Command Line Tools provide an SDK but violate the clean machine prerequisite. ORC can resolve symbols from prebuilt dynamic libraries for JIT execution, but a JIT run is not the requested native executable output. Remote compilation requires transmitting source and a service contract. Neither alternative should silently become the fallback for a failed local AOT gate. [LLVM ORC dynamic library resolution](https://llvm.org/docs/ORCv2.html#process-and-library-symbols)

## CPU LibTorch adapter

LibTorch distributions contain headers, libraries, and CMake configuration. The documented build uses `find_package(Torch)`, upstream compile flags, and upstream link libraries. For the selected modern release, use a C++20 maintainer build and the macOS libc++ environment used to qualify the archive. The documented GNU/Linux cxx11 configuration currently requires glibc 2.29 and GCC 9 or newer; those GNU requirements do not describe macOS. Do not relabel that distribution as musl or infer a Linux ARM64 artifact from an Apple Silicon archive. [LibTorch installation](https://docs.pytorch.org/cppdocs/installing.html)

PyTorch now documents a limited stable ABI with low level C shims and `torch::stable` wrappers. Its stable C shim guarantee has a bounded compatibility window; C++ API policy and operator behavior are separate. `TORCH_TARGET_VERSION` limits which shim versions an extension can use. The stable API's tensor wrapper manages an opaque tensor handle, and its constructor from an existing handle takes ownership. Prefer this supported surface where it covers the initial operations; verify each operation in the pinned headers instead of treating all ATen or neural network APIs as stable. [LibTorch stable ABI](https://docs.pytorch.org/docs/main/notes/libtorch_stable_abi.html), [stable tensor and operators](https://docs.pytorch.org/cppdocs/api/stable/operators.html)

**Recommendation:** publish a C++ adapter exporting August's own small C ABI. The accompanying implementation plan selects owned CPU float64 creation from copied arrays, addition, sum, copied result extraction, and release. Keep tensor classes, reference counting, and C++ allocators inside the adapter. Pair the adapter with its exact qualified LibTorch archive even if it internally uses the limited stable ABI. Shape inspection, matrix multiplication, and additional types can follow with their own error and ownership tests.

Every export that calls C++ must catch library exceptions, `std::exception`, and unknown exceptions before returning to August. Mark the exported boundary `noexcept`, initialize output handles to null, return status plus operation local error text, and make the catch path avoid further allocation. No C++ exception may cross August frames. A fixed caller supplied error buffer and an explicit required/truncated length are preferable to a global last error string.

Copy input data into library owned storage and copy output bytes into August owned storage initially. PyTorch exposes creation from a blob and APIs returning new tensor references; those are lifecycle obligations, not permission to retain an August buffer without a lifetime agreement. Defer zero copy views and custom deleter callbacks. CPU scope means the adapter explicitly selects a CPU device; the actual macOS archive may still depend on system frameworks or additional libraries, so inspect and package its complete dependency closure. [PyTorch C shim declarations](https://github.com/pytorch/pytorch/blob/main/torch/csrc/inductor/aoti_torch/c/shim.h)

## SQLite and zlib adapters

SQLite provides opaque connections and prepared statements through a mature C interface. Opening can produce a connection even on failure, which still needs closing. Binding with `SQLITE_TRANSIENT` copies bytes before the bind returns; `SQLITE_STATIC` imposes a longer caller lifetime. Returned column pointers can be invalidated by conversions, stepping, resetting, or finalizing. Copy text/blob column values before advancing. [SQLite open](https://www.sqlite.org/c3ref/open.html), [binding lifetime](https://www.sqlite.org/c3ref/bind_blob.html), [column lifetime](https://www.sqlite.org/c3ref/column_blob.html)

`sqlite3_finalize` destroys a statement and can report the last execution error. `sqlite3_close` can return `SQLITE_BUSY` while objects remain open; `sqlite3_close_v2` instead defers actual disposal through its zombie connection behavior. **Recommendation:** model a connection owner and child statement scopes explicitly, finalize children before closing the connection, and report checked close/finalize errors. Choose a named close contract and test it; do not call the deferred disposal API and imply immediate closure. Start with parameter binding, iteration, copied values, transactions, and explicit error results. [SQLite finalize](https://www.sqlite.org/c3ref/finalize.html), [connection close](https://www.sqlite.org/c3ref/close.html)

Build SQLite from its pinned amalgamation into the prebuilt adapter so the selected release and compile options do not depend on the host macOS SQLite. Record the thread mode and enabled features. Do not expose extension loading or permit connection/statement transfer between workers in the first package scope.

zlib's pinned header specifies caller buffers for compression/decompression and the `deflateInit`/`deflateEnd`, `inflateInit`/`inflateEnd` lifecycle for streaming. `compressBound` gives an output bound for compression; decompression needs a caller limit. **Recommendation:** start with copied byte input and bounded one shot output, translate status codes, and reject length overflow. If streaming is later needed, wrap its state in an opaque owning handle and guarantee End on every cleanup path. Keep `z_stream` layout inside the C adapter. Reject malformed/truncated data and output exceeding the caller's cap. [zlib 1.3.2 header](https://github.com/madler/zlib/blob/v1.3.2/zlib.h)

## Rust crate adapter

Use the Rust `blake3` crate through a new Rust adapter crate, built with Cargo; using upstream BLAKE3's separate C implementation would not exercise Rust interoperability. `Hasher` supplies incremental update and finalization. Its tagged build script enables C NEON on ordinary little endian AArch64 unless disabled, so a default crate build is not a purely Rust implementation. The `pure` feature prevents that C path, but the tagged manifest labels it among unstable testing features. Pin 1.8.7 exactly, keep `std` plus `pure`, avoid explicitly enabling `neon`, and inspect the build log and object provenance. [BLAKE3 Hasher](https://docs.rs/blake3/1.8.7/blake3/struct.Hasher.html), [tagged build script](https://raw.githubusercontent.com/BLAKE3-team/BLAKE3/1.8.7/build.rs), [feature contract](https://github.com/BLAKE3-team/BLAKE3/blob/1.8.7/Cargo.toml)

Rust's `cdylib` is intended for dynamic libraries loaded from other languages; `staticlib` is another foreign linking output. Export named `extern "C"` functions and use an opaque handle. `repr(C)` controls layout of deliberately shared data; ordinary Rust structs, references, `Vec`, `String`, and trait objects must stay behind the boundary. [Rust linkage](https://doc.rust-lang.org/reference/linkage.html), [Rust FFI](https://doc.rust-lang.org/nomicon/ffi.html), [Rust type layout](https://doc.rust-lang.org/reference/type-layout.html)

**Recommendation:** begin with the one-shot digest API chosen by the accompanying implementation plan, including copied Rust-owned output and Rust's matching deallocator. Later expose create, update with borrowed bytes valid only during the call, finalize, and release if an incremental API is needed. Allocate a hasher in Rust and destroy it in Rust exactly once; define whether finalize preserves or consumes it. Reject null/nonzero length inputs, invalid output capacity, and lengths outside the target's representable slice range before constructing a Rust slice. Handle zero length input without constructing a slice from null. Keep any handles confined to their owning August scope and initial runtime thread.

Prevent Rust unwinding across the boundary. Build the adapter with an explicit unwind panic policy and catch panics inside exported operations, translating caught panics to a checked adapter failure with a defined unusable-handle policy. `catch_unwind` only catches unwinding panics; aborting panics and process allocation failure are not recoverable guarantees. Do not catch foreign C++ exceptions through Rust. Test a deliberate adapter panic and continued August error handling in a subprocess. [Rust unwind contract](https://doc.rust-lang.org/nomicon/ffi.html#ffi-and-unwinding), [catch_unwind limits](https://doc.rust-lang.org/std/panic/fn.catch_unwind.html)

## Artifact and license obligations

LLVM's license is Apache 2.0 with LLVM exceptions; inspect included components and preserve required notices. PyTorch's license permits source and binary redistribution subject to its stated conditions, including binary notices. Its top level license alone does not enumerate every dependency in an archive. SQLite states that its core code is dedicated to the public domain, with separate practical considerations on its copyright page. zlib's license permits use and redistribution subject to origin, alteration, and notice conditions. BLAKE3's tagged Cargo manifest lists a choice among CC0, Apache 2.0, and Apache 2.0 with LLVM exception; choose and retain the actual applicable license text. [LLVM license](https://llvm.org/LICENSE.txt), [PyTorch license](https://github.com/pytorch/pytorch/blob/v2.14.1/LICENSE), [SQLite copyright](https://www.sqlite.org/copyright.html), [zlib license](https://zlib.net/zlib_license.html), [BLAKE3 manifest](https://github.com/BLAKE3-team/BLAKE3/blob/1.8.7/Cargo.toml)

**Recommendation:** each independently released August native package supplies its August sources, public C header, ABI revision, per target artifacts, build recipe, upstream source identities, dependency license inventory, notices, and checksums. The toolchain artifact supplies the native compiler tools/runtime and its independently authored platform metadata. Consumers download only qualified artifacts, verify before extraction, and restore exact selections from their lock. Source builds are an explicit maintainer/developer workflow. Preserve the repository's existing security and package source boundaries; native code is a real additional execution capability and cannot acquire new implicit trust through a Git import.

Begin with macOS ARM64 only. Later GNU/Linux packages require separate `x86_64-unknown-linux-gnu` and `aarch64-unknown-linux-gnu` qualification, glibc floors, C++ runtime ABI/dependency checks, and a distributable sysroot/startup recipe. Musl and Windows need separate artifacts and ABI decisions. A target triple by itself does not encode all these requirements.

## Required implementation evidence

The feasibility work must first produce and execute a small Mach-O binary using only packaged LLVM/LLD, the prebuilt runtime, and reviewed platform metadata on a fresh macOS 14 ARM64 machine. Check entry behavior, argv/env access, process exit, runtime initialization/finalization, symbol bindings, relocation paths, and signatures. Inspect the actual pinned linker output with bundled `llvm-otool` or `llvm-objdump`; maintainers may additionally use Apple tools for qualification. [LLVM Mach-O inspection](https://llvm.org/docs/CommandGuide/llvm-otool.html)

Then qualify each adapter with ABI probes and adversarial resource tests: large lengths, embedded null bytes, failure after partial construction, use after close rejection, double close rejection, output limits, native errors, C++ throws, Rust panic, and scope cleanup. Inspect every distributed dylib's minimum OS and dependency load commands. Run the installed CLI's check/run/build/test/spec workflow and all four library examples with compiler and SDK tools absent, then repeat from the verified offline cache. Build output must remain executable after copying its supported deployment bundle to another clean machine.

Only after those gates and the existing August semantic suite agree should LLVM become the default backend. Remove the C generation path after parity, diagnostic/debug information, package tests, and clean machine AOT are complete. The required public guides must then explain the actual consumer and maintainer prerequisites and tested platform floor. Until implementation and qualification succeed, these capabilities remain proposed scope.

## Measured SDK-input-free AOT experiment

On October 1, 2026, an ignored prototype under `.aug-build/native-llvm-probe` generated and ran narrow Mach-O programs on this development host: **macOS 26.6.2 ARM64**, with Xcode installed. The compiler/linker subprocess environment set `PATH`, `DEVELOPER_DIR`, and `SDKROOT` to `/nonexistent`. Programs were handwritten LLVM IR; every linker input was an explicit object, a prototype dylib, or the independently authored stub below. No Clang, Apple `ld`, `xcrun`, `codesign`, SDK headers, SDK `.tbd` files, or startup objects participated. This demonstrates SDK-input-free linkage mechanics on the present host; it does **not** satisfy the fresh macOS 14 VM, complete August runtime, package distribution, or four-library acceptance gate.

### Verified official tools

The downloaded [official ARM64 zstd archive](https://github.com/llvm/llvm-project/releases/download/llvmorg-23.1.2/LLVM-23.1.2-macOS-ARM64.tar.zst) was **873,761,429 bytes** with SHA-256 **`3da0e91b5dfe3a5ec795ad2be79b3f5e6f28c8b23edcd3847fad7742b25e0507`**, matching the [official release API](https://api.github.com/repos/llvm/llvm-project/releases/tags/llvmorg-23.1.2) and [expanded asset list](https://github.com/llvm/llvm-project/releases/expanded_assets/llvmorg-23.1.2). The alternative [xz archive](https://github.com/llvm/llvm-project/releases/download/llvmorg-23.1.2/LLVM-23.1.2-macOS-ARM64.tar.xz) is 1,569,989,604 bytes, SHA-256 `d7c26fc6177e42842e2d1ffaad31aec057c56a924392b1a23d830abe2c5d53b1`. The release lists no smaller official macOS tool archive. Hash verification was performed before selective extraction and execution; GPG/attestation signature verification was not performed in this experiment.

The release also supplies `.sig` and `.jsonl` sidecars. Metadata inspection of the small attestation identified source commit `85ac560262434c9ccfc0c183ec22d4138ed647fb` and the release workflow. The upstream workflow uses a 1 GiB zstd compression window; extraction needs a compatible decompressor. The probe used Node 24.18.0's zstd stream with maximum window log 30 and a bounded selected-file tar reader. [Release verification instructions](https://github.com/llvm/llvm-project/releases/tag/llvmorg-23.1.2), [release builder](https://github.com/llvm/llvm-project/blob/llvmorg-23.1.2/.github/workflows/release-binaries.yml)

Usable local tools are at `/Users/august/.codex/worktrees/release-publishing/augscript/.aug-build/native-llvm-probe/llvm23/bin/`. `ld64.lld` is a symlink to `lld`. The binaries report LLVM/LLD 23.1.2, and LLD reports the source revision above. Actual Mach-O inspection found:

| Selected tool | File bytes | SHA-256 | Imported OS libraries |
| --- | ---: | --- | --- |
| `llc` | 135,003,744 | `7a9ff3ffea3ed5f3e4c2e6603b5792446702cfcb46d978e80bc6cd1678f192eb` | `/usr/lib/libSystem.B.dylib`, `/usr/lib/libz.1.dylib`, `/usr/lib/libc++.1.dylib` |
| `lld` | 146,098,192 | `87de299f2482f07991579207d3673694f5e152cfcd41e9c8c7c864fc91d1398e` | Same, plus `/usr/lib/libxml2.2.dylib` |
| `llvm-objdump` | 40,147,456 | `2ecce60ac491cb4840abe75f64cff3a56c80daf81f4aca2b2dcab859471b453f` | Same as `llc` |

All three have `LC_BUILD_VERSION` **minos 14.0, sdk 14.5** and `LC_RPATH @loader_path/../lib`. Their import load commands name only OS libraries; none names a bundled LLVM dylib. Therefore the smallest measured stock compile/link selection is `llc` plus `lld`/`ld64.lld`: **281,101,936 regular-file bytes**, before compression and notices. `llvm-objdump` is useful for inspection but is not required by the compile/link recipe. This does not establish a compressed August artifact size or prove the imported OS symbol versions on macOS 14.

For a smaller owned distribution, LLVM documents `LLVM_TARGETS_TO_BUILD=AArch64`, project `lld`, selected distribution components, and optional compression dependencies. Stock LLD includes multiple linker flavors. A custom driver can instead link the necessary LLVM code-generation components with `lldMachO`/`lldCommon`; the public driver API permits selecting only the Mach-O driver. Set an explicit maintainer deployment target of 14.0 and qualify the resulting host binary. Its size is not measured here. [LLVM distribution guide](https://llvm.org/docs/BuildingADistribution.html), [CMake options](https://llvm.org/docs/CMake.html), [pinned LLD tool build](https://github.com/llvm/llvm-project/blob/llvmorg-23.1.2/lld/tools/lld/CMakeLists.txt), [pinned driver API](https://github.com/llvm/llvm-project/blob/llvmorg-23.1.2/lld/include/lld/Common/Driver.h)

### Inputs and exact successful linkage

The independently typed prototype `libSystem.tbd` was:

```yaml
--- !tapi-tbd-v3
archs: [ arm64 ]
platform: macosx
install-name: /usr/lib/libSystem.B.dylib
current-version: 1.0.0
compatibility-version: 1.0.0
exports:
  - archs: [ arm64 ]
    symbols: [ _puts, dyld_stub_binder ]
...
```

The 1.0.0 fields are prototype link requirements, not a measurement of the actual OS library's current version. This file was not copied from an Apple SDK. It is neither a general SDK nor the final August platform surface. Its provenance, symbol availability, and version requirements still need review for a distributable artifact. The binder's spelling deliberately has no leading underscore.

The direct program's entire IR was:

```llvm
target triple = "arm64-apple-macosx14.0.0"
@message = private unnamed_addr constant [27 x i8] c"August LLVM SDK-free probe\00"
declare i32 @puts(ptr)
define i32 @main(i32 %argc, ptr %argv, ptr %envp) {
entry:
  %written = call i32 @puts(ptr @message)
  %ok = icmp sge i32 %written, 0
  %status = select i1 %ok, i32 0, i32 1
  ret i32 %status
}
```

The following are the successful commands, with paths shortened to the probe directory and tool directory. `-Z` removes standard library/framework search directories; `-t` recorded only the explicit inputs. `-fixup_chains` selects the tested binding form, while `-adhoc_codesign` makes signing explicit. The SDK metadata argument is an explicit recipe value; no SDK is read.

```sh
llc -mtriple=arm64-apple-macosx14.0.0 -filetype=obj -O0 \
  -relocation-model=pic direct.ll -o direct.o
ld64.lld -arch arm64 -platform_version macos 14.0 14.0 \
  -Z -fixup_chains -adhoc_codesign -t -e _main \
  direct.o libSystem.tbd -o direct
```

The program printed `August LLVM SDK-free probe` and exited 0. A second IR module implemented a stand-in runtime function `aug_probe_runtime_v1(i32, ptr, ptr)`, a `puts` call, and an `llvm.global_ctors` initializer. The initializer stored 42; the runtime function checked that state, `argc >= 1`, and nonnull `argv`/`envp` before printing. A main module only called that runtime function and returned its status. Both objects used the same `llc` options. The successful dynamic link commands were:

```sh
ld64.lld -arch arm64 -platform_version macos 14.0 14.0 \
  -Z -fixup_chains -adhoc_codesign -t -dylib \
  -install_name @rpath/libaug_probe.1.dylib \
  -exported_symbol _aug_probe_runtime_v1 \
  runtime.o libSystem.tbd -o bundle/lib/libaug_probe.1.dylib
ld64.lld -arch arm64 -platform_version macos 14.0 14.0 \
  -Z -fixup_chains -adhoc_codesign -t -e _main \
  -rpath @executable_path/lib main.o \
  bundle/lib/libaug_probe.1.dylib libSystem.tbd -o bundle/program
```

Both `bundle/program entry-argument` and a copied `relocated/program moved-entry-argument` printed `August LLVM prebuilt runtime probe` and exited 0. Inspection with the bundled `llvm-objdump --macho --private-headers` found `LC_MAIN`, `/usr/lib/dyld`, the intended relative runtime import/rpath, `/usr/lib/libSystem.B.dylib`, chained fixups, `LC_CODE_SIGNATURE`, two-level namespace flags, and minos 14.0 in generated binaries. The dylib's initializer appeared in `__init_offsets`. No `crt1.o` or application C bridge was used. The same narrow experiment initially passed with installed Rust LLVM/LLD 22.1.8; the results above supersede that preliminary tool choice.

### What the result enables and what remains

The result supports proceeding with the approved maintainer-built dynamic runtime design: compile the real C runtime/private thunks and C/C++/Rust adapters with licensed maintainer tools, give distributed libraries relative install names, and link consumer-generated LLVM objects with the bundled driver/LLD and the reviewed import surface. The consumer-facing `_main` must call explicit runtime initialize/run/shutdown services; the probe verifies loader constructors, not August runtime initialization or finalization. Preserve matching C callback/private pointer ABI work from the approved plan.

Remaining release blockers are a **fresh macOS 14 ARM64 VM with developer tools absent**, actual August runtime and all four native dependency closures, introduced symbol/builtin inventory under release optimization, moved full deployment bundles, publisher signing/notarization, platform file provenance/rights review, and the complete frontend/IR/error/ownership/regression gates. A metadata minimum of 14.0 and execution on macOS 26 do not close the oldest-OS runtime gate. The ignored prototype is a reproducible local experiment, not an artifact published by August.
