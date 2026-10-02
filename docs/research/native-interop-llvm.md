# Native interoperability design basis

This contributor note explains the upstream contracts used by August’s current LLVM and native-package implementation. For supported behavior and installation, use [native packages](../native-packages.md); for the pipeline, use [native compilation design](../native-interop-llvm-plan.md).

## LLVM does not define a shared language ABI

LLVM IR describes calling conventions, data layout, alignment, memory operations, and exceptional control flow. A C calling convention alone cannot establish that an August declaration matches a C header, C++ class, or Rust type. August therefore uses a narrow C ABI with fixed-width values, copied buffers, and opaque resources, and checks the physical signatures against reviewed headers. [LLVM language reference](https://llvm.org/docs/LangRef.html).

Rust distinguishes stable C-compatible representations from its default layout. An exported function must choose the C ABI and a compatible representation deliberately. An unwinding panic must be contained before crossing a boundary that does not permit unwinding; aborting panics remain process failures. August’s Rust packages wrap crates behind this contract rather than linking Rust layouts directly. [Rust type layout](https://doc.rust-lang.org/reference/type-layout.html), [Rust ABI and unwinding](https://doc.rust-lang.org/nomicon/ffi.html#ffi-and-unwinding).

C++ packages keep templates and classes private to a rebuilt facade. LibTorch’s documented installation and stable-ABI scope do not make every ATen type or named operation a stable cross-version C++ interface. The August tensor package uses its own C exports and an exact qualified LibTorch distribution. [LibTorch installation](https://docs.pytorch.org/cppdocs/installing.html), [LibTorch stable ABI](https://docs.pytorch.org/docs/main/notes/libtorch_stable_abi.html).

## Explicit lowering before optimization

August’s execution IR preserves source evaluation order, integer wrapping, checked failures, root cells, and ownership cleanup. LLVM attributes such as overflow flags, inbounds, alignment, and alias promises must follow established language contracts. An optimization is valid only when it preserves observable August behavior; compiler acceptance of the IR is not a language-equivalence proof. [LLVM language reference](https://llvm.org/docs/LangRef.html).

LLVM tools are distributed as pinned host packs rather than a Node binding to LLVM’s C++ implementation. Consumers receive the tools and runtime components needed for compilation and linking; maintainers use a larger build environment. LLVM documents component selection and notice obligations for its distribution. [Building an LLVM distribution](https://llvm.org/docs/BuildingADistribution.html), [LLVM developer policy](https://llvm.org/docs/DeveloperPolicy.html).

## Host linkage and debugging

The macOS compiler pack uses LLVM’s independent Mach-O linker and reviewed platform link inputs. It does not redistribute an Apple SDK or require consumer Xcode. Maintainer SDK use, downloaded tool licensing, publisher signing, and generated executable signing are separate obligations. The qualified oldest host is macOS 14 ARM64. [Mach-O LLD](https://lld.llvm.org/MachO/index.html), [Apple developer agreements](https://www.apple.com/legal/sla/).

Linux packs target GNU libc 2.36 and preserve their qualified C++ runtime and library closure. A newer build host can silently introduce newer symbol requirements, so maintainer qualification inspects actual dependencies as well as descriptor metadata. Cross compilation and musl are unsupported.

Debug metadata uses the C-compatible type reader for the runtime’s tagged storage while retaining August filenames, symbols, and compiler identity. This supports source breakpoints and ordinary variable inspection; it does not supply August expression evaluation or rich collection views. A distinct language code requires debugger support, not just compiler metadata. [LLVM compile-unit metadata](https://llvm.org/docs/LangRef.html#dicompileunit), [LLDB language support](https://lldb.llvm.org/resources/addinglanguagesupport.html).

## Evidence boundary

Published 0.21.0 consumers and real public library imports are qualified on macOS ARM64 and GNU/Linux x86-64/ARM64. Their tests cover locks, offline execution, relocation, results, failures, and finite resource cleanup. The [release process](../releasing.md) requires these gates again for later releases. Upstream documentation supports design decisions; it does not substitute for those executable checks or establish universal native safety.
