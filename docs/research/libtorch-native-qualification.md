# CPU LibTorch native qualification

This investigation tested the proposed August tensor adapter against the real official **LibTorch 2.14.1 macOS ARM64 distribution** on October 1, 2026. It establishes that the selected native library can implement the first package's bounded C interface. It does not establish August imports, LLVM lowering, automatic installation, macOS 14 execution, or clean-machine compatibility. Those remain integration gates in the [native/LLVM plan](../native-interop-llvm-plan.md).

The probe ran on macOS 26.6.2 ARM64 with Apple Clang 21.0.0 from Xcode. Only ignored files under `.aug-build/native-libtorch-probe` were created for the experiment; no package repository or artifact was published. The adapter's error structure and counter exports are probe interfaces, not a frozen shipping ABI.

## Verified upstream input

The [official CPU archive index](https://download.pytorch.org/libtorch/cpu/) links to [libtorch-macos-arm64-2.14.1.zip](https://download.pytorch.org/libtorch/cpu/libtorch-macos-arm64-2.14.1.zip). An ordinary HTTPS GET with curl succeeded. A previous metadata request returning 403 therefore did not prevent downloading this distribution.

| Input | Observed value |
| --- | --- |
| Archive length | 103,834,077 bytes |
| Archive SHA-256 | `6ab4e92bed813981cb26434db0ea12aaae7ce7c548d031a5b25032a286de1b58` |
| Embedded `build-version` | `2.14.1` |
| Embedded `build-hash` | `5c4886908584029761b579af026dcfb627c84070` |
| Header version | Major 2, minor 14, patch 1, ABI tag 0 |
| Unpacked regular files | 10,172 |
| Unpacked regular-file bytes | 427,709,993 |

The [official tag API](https://api.github.com/repos/pytorch/pytorch/git/ref/tags/v2.14.1) resolves `v2.14.1` to the same complete commit as the embedded build hash. The archive digest was computed locally from bytes obtained through the official HTTPS endpoint. This is an observed content pin, not an independently verified upstream signature or publisher-supplied checksum.

The installed Torch CMake configuration sets C++20. Its macOS configuration did not add a `_GLIBCXX_USE_CXX11_ABI` definition; that GNU libstdc++ choice does not describe this Apple libc++ build. Upstream recommends CMake but does not require it for consuming LibTorch. [Official installation guide](https://docs.pytorch.org/cppdocs/installing.html).

## Adapter and independent native client

The ignored `adapter.cpp` uses real `at::Tensor` objects. `from_f64` explicitly chooses CPU and float64, clones `at::from_blob` storage, and retains no caller memory. `add` calls `at::add`; `sum` calls `at::sum(...).item<double>()`. `values` makes contiguous storage and copies its doubles into an adapter-owned allocation. Tensor and array releases use their matching C++/C allocation families.

Every fallible C export is `noexcept` and contains C++ exceptions. The probe distinguishes invalid pointer/length arguments, `c10::Error`, standard exceptions, and unknown exceptions with status codes. It clears outputs before calling the library. The actual mismatched-shape test produced a `c10::Error` converted to status 2, a nonempty bounded error message, and a null output handle. Exception text never crosses the C ABI as a borrowed C++ string.

The initial adapter intentionally uses ATen inside its private implementation and is paired with the exact distribution above. The installed stable headers provide creation, clone, pointer access, and dispatcher support, but do not provide named `add` and `sum` helpers in `torch/csrc/stable/ops.h`. This experiment does not qualify a stable-dispatcher variant or claim C++ binary compatibility across Torch upgrades. August's exported C symbols can remain stable while maintainers rebuild the adapter for another qualified Torch version. [Pinned stable headers](https://github.com/pytorch/pytorch/blob/5c4886908584029761b579af026dcfb627c84070/torch/csrc/stable/ops.h), [upstream stable API scope](https://docs.pytorch.org/docs/main/notes/libtorch_stable_abi.html).

`probe.c` is an independent C11 client of the header. It checks results from fixed inputs and uses no Torch headers or replacement implementation. Each of 1,000 cycles checks `[1, 2, 3] + [4, 5, 6] = [5, 7, 9]` and sum 21; mutation of the original input after creation does not affect the tensor. The output remains readable after its source tensor is destroyed. Empty tensors copy to a null/zero-length output and sum to zero. Null inputs, overflowing lengths, and incompatible shapes return failures. Live adapter tensor and buffer counters return to zero after each cycle, including the failed addition.

The ordinary client and an AddressSanitizer/UndefinedBehaviorSanitizer build both exited successfully with this output:

```text
LibTorch 2.14.1: [5, 7, 9], sum 21; 1000 independent copy/empty/error/cleanup cycles passed
```

The sanitizer build instrumented the adapter and client; upstream LibTorch remained its prebuilt uninstrumented binary. Sanitizer stderr was empty. LeakSanitizer was disabled because this macOS experiment does not establish support for it. The counters measure adapter-owned objects and copies, not all upstream process allocations. They also do not establish that August's future ownership lowering invokes release correctly; that requires separate compiler integration tests on normal, return, and failure paths.

### Maintainer commands actually used

Run these from the August worktree after placing the prototype and official archive in the ignored probe directory. These are contributor experiment commands, not consumer installation instructions:

```sh
clang++ -std=c++20 -arch arm64 -mmacosx-version-min=14.0 \
  -O2 -g -fvisibility=hidden -fPIC -dynamiclib \
  -I .aug-build/native-libtorch-probe/libtorch/include \
  -I .aug-build/native-libtorch-probe/libtorch/include/torch/csrc/api/include \
  .aug-build/native-libtorch-probe/adapter.cpp \
  -L .aug-build/native-libtorch-probe/libtorch/lib -ltorch_cpu -lc10 \
  -Wl,-install_name,@rpath/libaug_torch.1.dylib \
  -Wl,-rpath,@loader_path \
  -o .aug-build/native-libtorch-probe/libaug_torch.1.dylib

clang -std=c11 -arch arm64 -mmacosx-version-min=14.0 -O2 -g \
  .aug-build/native-libtorch-probe/probe.c \
  -L .aug-build/native-libtorch-probe/bundle/lib -laug_torch.1 \
  -Wl,-rpath,@executable_path/lib \
  -o .aug-build/native-libtorch-probe/bundle/probe
```

The bundle's `lib` directory contains the adapter and the three upstream libraries listed below. The sanitizer variation replaces `-O2` with `-O1`, adds `-fsanitize=address,undefined -fno-omit-frame-pointer` to both commands, and runs with `ASAN_OPTIONS=detect_leaks=0:halt_on_error=1` and `UBSAN_OPTIONS=halt_on_error=1`. These builds use the installed Apple SDK and are maintainer-toolchain evidence only.

## Actual runtime closure and deployment floor

All six dylibs shipped in the archive are thin ARM64 Mach-O images. `libc10`, `libshm`, `libtorch`, `libtorch_cpu`, and `libtorch_global_deps` declare macOS 14.0 and SDK 26.5. `libomp` declares macOS 11.0 and SDK 11.0. The experimental adapter declares macOS 14.0 and SDK 27.0. SDK values identify build inputs, not the declared deployment minimum. Actual execution on macOS 14 remains required.

The ATen adapter links only `libtorch_cpu` and `libc10`. Loader inspection and execution with a copied deployment directory confirmed the following upstream closure:

| Required redistributed file | Bytes | Unmodified archive SHA-256 |
| --- | ---: | --- |
| `libtorch_cpu.dylib` | 386,016,816 | `886a21732227bea91a64dcc355bdea98808fab5014a84891de2fe3a081744079` |
| `libc10.dylib` | 1,121,632 | `332fdb431f20a9690f38be0768cab415584480c2ce31744153347778f85a04d8` |
| `libomp.dylib` | 856,096 | `6256bee09e93c28d71c65711cc69224d69994c6965648b628b70a22772fe98d4` |

For this narrow adapter, the tested loader does not load `libtorch`, `libshm`, or `libtorch_global_deps`. They need not be copied merely because they are in the upstream archive. Recompute the closure when expanding API coverage, switching implementation APIs, or upgrading Torch. The three required upstream files total 387,994,544 bytes before the adapter, notices, and archive compression; the source-package reader must not be used to install this binary payload.

`libtorch_cpu` loads sibling `libc10` and `libomp` with `@loader_path`. Their rpaths are loader-relative. The adapter uses `@rpath/libaug_torch.1.dylib` as its install name, links Torch libraries by `@rpath`, and provides `@loader_path` as its own rpath. The application provides `@executable_path/lib`. The archive's `libomp` install-name identity is `/opt/llvm-openmp/lib/libomp.dylib`; the Torch dependency that actually loads it is `@loader_path/libomp.dylib`. The copied closure ran without `/opt/llvm-openmp`. If a shipping recipe normalizes this identity, it must record changed file hashes and restore valid ARM64 signing.

System dependencies are supplied by macOS, rather than copied from an SDK. Strong load commands include Accelerate, CoreFoundation, libSystem, and libc++; Foundation, MetalPerformanceShaders, MetalPerformanceShadersGraph, Metal, IOKit, and libobjc appear as weak load commands in the inspected Torch images. Thus a CPU August API does not mean the upstream distribution contains no Metal dependencies. This adapter never requests a GPU device.

The experiment copied the executable and closure to `relocated bundle`, started it from `/`, and cleared its environment except `PATH` and loader tracing. It passed all 1,000 cycles. `DYLD_PRINT_LIBRARIES` showed every non-system Torch/adapter library loading from the relocated directory, with no original LibTorch path, Xcode path, or `/opt` dependency. This tests relocation on the same machine, not another OS version or a clean VM.

## Licenses and publication work still required

The inspected ZIP did **not** include a license or notice file. August's release cannot treat the upstream archive as a complete redistributable notice bundle. The pinned [PyTorch LICENSE](https://github.com/pytorch/pytorch/blob/5c4886908584029761b579af026dcfb627c84070/LICENSE) permits binary redistribution with its stated conditions, including reproducing its notices. The pinned [NOTICE](https://github.com/pytorch/pytorch/blob/5c4886908584029761b579af026dcfb627c84070/NOTICE) and [package license inventory](https://github.com/pytorch/pytorch/blob/5c4886908584029761b579af026dcfb627c84070/pyproject.toml) show that the distribution contains multiple licensed components; the top-level BSD license is insufficient as a complete component inventory.

The ignored probe retains the exact main LICENSE and NOTICE, with SHA-256 `bd018feef8825e88181c84eb7e3aa4eafb8f08a20d9fd6ef948569610c4a3e43` and `c2cc7bf0caec7652c2b460a8a470bea1677f241e4ab8e431df34cf17f5a9fec0`. The follow-up investigation below collected the pinned component/submodule texts and resolved OpenMP provenance. The upstream wheel metadata uses a broad third-party license glob; it cannot alone establish the complete compiled component graph.

Publication and acceptance still require the shipping native error ABI, descriptor checks, August resource ownership tests, an independently checked archive manifest, release source/toolchain provenance, generated notices/SBOM, real repository imports, LLVM execution, and macOS 14 clean-machine/deployment tests. This native client is one prerequisite for those checks.

### Follow-up: component notice collection

The package workspace `aug-native-packages/aug-pytorch/native/licenses` now contains **43 primary license/notice files**, their hashes and source provenance in `provenance.json`, and a maintainer README. This collection is source material for the upcoming release archive; no binary assets were published during this investigation.

The official [CPU wheel index](https://download.pytorch.org/whl/cpu/torch/) publishes SHA-256 `9cf3082d25560efb1eef921871595227c0cf305abb7761ca45b6b988ef6cdd45` for `torch-2.14.1-cp312-cp312-macosx_14_0_arm64.whl`. The downloaded wheel matched that digest. Its three required dylibs match the LibTorch archive **byte for byte**, and 22 collected notice files match its supplied texts. The pinned [LibTorch extraction program](https://github.com/pytorch/pytorch/blob/5c4886908584029761b579af026dcfb627c84070/.ci/libtorch/extract_libtorch_from_wheel.py) copies the wheel's libraries, headers, and CMake configuration, explaining the shared inputs and omission of distribution-level notices. The wheel's license glob itself misses filenames such as `LICENSE.md`, `LICENSE.MIT`, and SPDX license directories; those additional texts were retrieved from exact component revisions.

Actual build configuration and symbol inspection confirmed SLEEF, NNPACK/QNNPACK, pthreadpool, KleidiAI, protobuf, ONNX, fmt, Kineto, Gloo, TensorPipe, FlatBuffers, PocketFFT, miniz, libuv, and libnop in `libtorch_cpu`, with CPUinfo and fmt in `libc10`. The collection also preserves their relevant kernel/header dependencies: FP16, FXdiv, PSIMD, gemmlowp, clog, uvw, JSON/Hedley, dynolog headers, protobuf UTF-8 validation, moodycamel, and conservative Perfetto/nested-fmt notices. Main component revisions come from PyTorch's exact gitlinks; TensorPipe's pinned gitlinks identify libuv 1.51.0 and libnop. Raw root/component notice bytes were checked against their Git blob identities where supplied, and all 43 saved file lengths/SHA-256 values were validated.

OpenMP is **LLVM 21.1.8**, conda-forge package build `h4a912ad_0`. The pinned [macOS selection recipe](https://github.com/pytorch/pytorch/blob/5c4886908584029761b579af026dcfb627c84070/.ci/macwheel/install_libomp.sh) downloads that exact package and changes its install name before ad-hoc signing. The downloaded [conda package](https://conda.anaconda.org/conda-forge/osx-arm64/llvm-openmp-21.1.8-h4a912ad_0.conda) has SHA-256 `56bcd20a0a44ddd143b6ce605700fdf876bcf5c509adc50bf27e76673407a070`. Repeating those two documented normalization commands on an ignored copy reproduced the shipped `libomp` digest exactly. Its package metadata supplies the full LLVM Apache 2.0 license with LLVM exceptions, source archive digest `7ba3f2a8d8fda88be18a31d011e8195d3b7f87f9fa92b20c94cba2d7f65b0e3f`, and [feedstock revision](https://github.com/conda-forge/openmp-feedstock/tree/9a0e9859495a5a8c247cae11d866a0aac58d22f9). The `5.0.20140926` binary string is not its LLVM release version.

The OpenMP recipe includes an ARM64 compiler-rt builtins linkage patch. Its pinned metadata declares compiler-rt 19.1.7 among build inputs; that [compiler-rt license](https://github.com/llvm/llvm-project/blob/llvmorg-19.1.7/compiler-rt/LICENSE.TXT), the actual OpenMP package license, and recipe attribution are retained. The metadata and matched OpenMP binary establish the selected package and transformation; they do not identify every extracted builtins object without an upstream build link map.

The nested libuv notices include its MIT text and complete FreeBSD tree BSD and ISC inet notices. This matters because the wheel's aggregate license expression omits ISC. JSON's actual Hedley header has MIT SPDX statements for Niels Lohmann and Evan Nemerson; those copyrights are retained separately. The repository's old `.reuse/dep5` mentions a different Hedley path and unrelated GPL test data, so it was not treated as the compiled header's license. GPU-only libraries, test frameworks, documentation assets, amalgamation tooling, and GPL-only JSON test notices were excluded from the runtime collection. The selected build defines `AT_USE_EIGEN_SPARSE()` as zero and uses system Accelerate BLAS/LAPACK; no Eigen template implementation symbols were observed.

The remaining redistribution work is concrete: reconcile the **final** adapter and binary closure with a versioned SBOM/component manifest, resolve any extra embedded-header or compiler-runtime attribution revealed by that review, and verify that release and deployment archives preserve the collected texts and final modified-binary hashes. The supplied upstream archives lack an exhaustive native link map/SBOM. The collection therefore remains marked `redistribution-review-incomplete` and does not establish legal clearance. System frameworks and libc++/libSystem are declared OS requirements, rather than redistributed SDK or OS binaries.

## Local evidence locations

The experiment directory contains `aug_torch_probe.h`, `adapter.cpp`, `probe.c`, `inspect.mjs`, the original ZIP, extracted headers/libraries, the adapter, `bundle/probe`, `relocated bundle/probe`, `sanitized/probe`, upstream tag/license metadata, `runtime-inspection.json`, loader tracing in `relocation.dyld.txt`, and sanitizer output files. These files remain ignored and are not release artifacts.

The adapter source SHA-256 is `ae4d6d18a3936d0ddbcaa99e6f0233552b4a6783a5a3d892e9e50cf81bbce7a3`; the C client is `8a76f252795dd57ae87d349b01bfc7a43d37527a74c6ce264ea7f98c8771fd55`. The local optimized adapter binary is `4dabf83b8bd7d2f52f15ef44dbe9c9ed7d0917ec777bb68b837fd64101a78650`; it includes local build/debug provenance and is not an immutable public release artifact.
