# August after 1.0 {#roadmap-to-1-0}

August 1.0 provides native LLVM compilation, public-repository packages, same-file tests, an editor, and compiled explanations and diagrams. It supports macOS 14+ ARM64 and GNU/Linux x86-64 and ARM64 with glibc 2.36+. See the [compatibility contract](compatibility.md) for the source, package and native ABI promises that apply to 1.x.

## The stable core

Write a module with narrow exports, labeled inputs and checked failures. Generate its spec to read what it does, then follow its diagrams from folder data flow to module interactions and API sequences. These views come from checked source; they explain the program that exists. Requirements and acceptance tests describe the behavior you want.

Applications compile through LLVM and download the selected compiler, runtime and native artifacts through ordinary imports. LibTorch, SQLite, zlib and Rust BLAKE3 packages have reviewed artifacts for all three supported targets. Isolated multicore worker tasks copy their inputs and results; they do not share an application heap. A separate Metal package supports GPU work on macOS ARM64.

The [1.0 release qualification](https://github.com/GreenPandaStudios/augscript/actions/runs/37800823512) checks language conformance, runtime cleanup and worker instrumentation, native imports, offline execution, relocation, CLI upgrades and installed editors. [Performance](performance.md) reports measured workloads and machines. A passing suite does not establish correctness or safety for every program, and a benchmark does not predict every application's speed.

## Further work

Channels, CUDA artifacts, broader GPU APIs, Windows, musl and cross compilation remain outside 1.0. They need their own language or platform contracts and qualification before becoming supported behavior.

Full editor variable inspection is incomplete. HTTP conformance and identity-provider hardening remain library work in the [gap ledger](web-library-gaps.md). Use the [production guide](production-readiness.md) to assess a workload rather than treating core stability as a guarantee for every library or deployment.

The [conformance rules](conformance-rules.md), [runtime reliability checks](runtime-reliability.md), [safety gyms](safety-gyms.md) and [release process](releasing.md) describe how changes are checked. Future releases retain failed evidence and qualify the exact source and archives they publish.
