# CPU LibTorch package qualification

The [August PyTorch package](https://github.com/GreenPandaStudios/aug-pytorch/tree/v0.1.4) wraps real CPU LibTorch 2.14.1. Public August imports are qualified with the published 0.21.0 CLI on macOS 14+ ARM64 and GNU/Linux x86-64/ARM64 with glibc 2.36+. Consumers download prebuilt archives; binding authors build and review the adapter with their native toolchain.

## Native contract

The adapter creates float64 CPU tensors, clones input storage, adds tensors, sums elements, and copies values out. It retains no August input pointer after a call. Tensor and output-buffer releases pair with their own allocators. Owned August handles release at scope exit, including checked failures.

Fallible C exports contain C++ exceptions, clear outputs before work, and return a bounded status/error record. Native failures never unwind through August. The facade uses ATen privately and is rebuilt for the exact LibTorch distribution; it does not promise arbitrary C++ binary compatibility across upstream versions. [Official LibTorch installation](https://docs.pytorch.org/cppdocs/installing.html), [upstream stable ABI scope](https://docs.pytorch.org/docs/main/notes/libtorch_stable_abi.html).

Independent native cases check element results, copied input/output lifetime, empty tensors, invalid lengths, incompatible shapes, and allocation counters. August integration tests separately verify labels, checked errors, ownership lowering, real imports, locks, and relocated bundles. Instrumenting the adapter/client does not instrument the prebuilt LibTorch internals. Cleanup counters observe adapter-owned resources, not every upstream allocation.

The [tensor example](../examples/native-pytorch/index.md) checks `[1, 2, 3] + [4, 5, 6] = [5, 7, 9]` and sum 21. Its compiled explanation appears beside the source. GPU devices and broader tensor APIs remain outside this package.

## Platform requirements

The macOS upstream CPU archive requires macOS 14 for its main Torch images; its bundled OpenMP library can have a lower floor without lowering the whole package’s requirement. CPU API coverage does not imply that the upstream distribution contains no weak Metal/framework dependencies. System frameworks are OS requirements, not copied SDK libraries.

Linux archives declare their glibc floor and retain the qualified C++ runtime. Maintainer checks inspect actual symbol requirements and dependency closure. Source tags, native artifacts, descriptor hashes, and runtime/compiler selections are locked independently.

## Redistribution inventory

The upstream input is LibTorch 2.14.1 at commit `5c4886908584029761b579af026dcfb627c84070`. The official macOS ARM64 CPU archive has SHA-256 `6ab4e92bed813981cb26434db0ea12aaae7ce7c548d031a5b25032a286de1b58`; this is a content pin, not an independently verified publisher signature. [Official CPU archive index](https://download.pytorch.org/libtorch/cpu/), [pinned upstream source](https://github.com/pytorch/pytorch/tree/5c4886908584029761b579af026dcfb627c84070).

The package collects upstream component licenses and provenance, including its selected OpenMP notices. The [pinned macOS OpenMP recipe](https://github.com/pytorch/pytorch/blob/5c4886908584029761b579af026dcfb627c84070/.ci/macwheel/install_libomp.sh) selects LLVM OpenMP 21.1.8; its normalization changes the redistributed binary and must remain recorded. Redistribution must account for LibTorch’s component licenses as well as the wrapper license.

An exhaustive upstream native link map/SBOM remains unavailable in the collected input. Reconcile each final archive’s closure and modified-binary hashes with a versioned component manifest, preserve all notices, and review additional embedded attribution before redistribution. The current collection is not a legal-clearance or vulnerability certification. See [dependency responsibilities](../production-readiness.md#dependencies-and-licenses).
