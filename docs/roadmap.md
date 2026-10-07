# Roadmap to 1.0

August 0.23.0 provides a published CLI, LLVM native compilation, repository packages, editor support, same-file tests, and deterministic compiled specifications. The supported preview targets are macOS 14+ ARM64 and GNU/Linux x86-64/ARM64 with glibc 2.36+. Real LibTorch, SQLite, zlib, and Rust BLAKE3 packages work on all three targets.

The unreleased compiler now generates linked folder data flows, class interactions and API sequences alongside the compiled spec. The complete generated set has been visually reviewed; release qualification must regenerate and check these artifacts for the final candidate. See [compiled specifications](specifications.md#move-from-the-overview-to-the-code-unreleased).

The 1.0.0 candidate has completed the implementation gates below. Its [compatibility contract](compatibility.md) takes effect when the qualified stable release is published. August 0.23.0 remains the published preview. Final source and artifact qualification, review, and publication are still required.

| Order | Gate | Candidate evidence and remaining release check |
| --- | --- | --- |
| 1 | Language conformance | The grammar ledger, independent acceptance programs, and adversarial regressions passed on all three targets in debug/release and braces/indentation forms. The final source and tagged builds must repeat them. |
| 2 | Runtime reliability | Each target passed the 30-minute lifecycle circuit with balanced core allocations and resources, plus worker race/memory instrumentation and full safety gyms. Tagged builds repeat the same requirements. |
| 3 | Native and package compatibility | The ABI header, bounded compiler requirements, checked artifact members, and install recovery are implemented. Real public imports, offline reuse, relocation, and 0.23.0-to-1.0.0 CLI upgrades passed on all three hosts. Final assembled install archives remain a separate gate. |
| 4 | Developer distribution | Installed-editor qualification passed on all three hosts with VS Code 1.90.0 and 1.139.1. macOS 14 consumers passed with Xcode and Command Line Tools removed; Linux consumers passed on glibc 2.36 without native tools. The exact release VSIX, npm archives and published containers must still be qualified. Existing LLVM source-debugger qualification remains required; full editor variable inspection remains incomplete. |
| 5 | Stable release policy | The support matrix, source/package compatibility rules, ABI and known limits define the 1.0 contract. Dependency and archive reviews retain exact evidence and attribution limits. Final independent source review, main/tag qualification, reviewed draft publication and public-install checks complete this gate. |

Candidate evidence comes from [CI 37548152234](https://github.com/GreenPandaStudios/augscript/actions/runs/37548152234), [Linux qualification 37548152499](https://github.com/GreenPandaStudios/augscript/actions/runs/37548152499), and [installed-editor qualification 37548152269](https://github.com/GreenPandaStudios/augscript/actions/runs/37548152269). These runs identify source `bcdd157927f489645301ced4f9c4d8ac4c003d59`; they do not qualify later source edits. Exact selected compiler archives and clean-consumer evidence are linked from [the dependency review](research/v1-dependency-review.md).

The [conformance suite](language-conformance.md), [runtime reliability gate](runtime-reliability.md), [safety gyms](safety-gyms.md), [performance reports](performance.md), and [release process](releasing.md) provide current evidence. Passing a finite suite does not establish that every program is correct or safe.

The preview includes isolated multicore worker tasks and a separate Metal GPU package. Channels, CUDA artifacts, broader GPU APIs, Windows, musl, and cross compilation remain deferred. Each release repeats worker and GPU qualification on their supported targets. Broader HTTP conformance and identity-provider hardening are library work, tracked in the [gap ledger](web-library-gaps.md), rather than requirements for the core language's 1.0 release.
