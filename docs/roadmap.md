# Roadmap to 1.0

August 0.23.0 provides a published CLI, LLVM native compilation, repository packages, editor support, same-file tests, and deterministic compiled specifications. The supported preview targets are macOS 14+ ARM64 and GNU/Linux x86-64/ARM64 with glibc 2.36+. Real LibTorch, SQLite, zlib, and Rust BLAKE3 packages work on all three targets.

The unreleased compiler now generates linked folder data flows, class interactions and API sequences alongside the compiled spec. The complete generated set has been visually reviewed; release qualification must regenerate and check these artifacts for the final candidate. See [compiled specifications](specifications.md#move-from-the-overview-to-the-code-unreleased).

A 1.0 release will make the documented language and package contracts stable. The table lists the remaining work in implementation order.

| Order | Remaining gate | Completion evidence |
| --- | --- | --- |
| 1 | Language conformance | Independent coverage of every documented construct, ownership transition, alias, checked failure, and task lifecycle. Adversarial cases and regressions pass in both optimization modes on every supported target. |
| 2 | Runtime reliability | Repeated cleanup, cancellation, allocation-pressure, and long-running heap tests. Sanitizer results and generated safety cases are reproducible, with omissions reported. |
| 3 | Native and package compatibility | The [candidate contracts](package-compatibility.md), ABI header, bounded compiler requirements and upgrade/interruption tests are implemented in the unreleased compiler. Repeat compatibility, public import, offline, artifact and relocation gates on all candidate targets before the 1.0 freeze. |
| 4 | Developer distribution | The unreleased [installed CLI and editor gates](releasing.md#installed-cli-and-editor-gates) check clean profiles, preview replacement, source diagnostics and setup recovery. Repeat the three-host matrix and actual version upgrade for the release candidate. Existing LLVM debugger qualification remains required; full editor variable inspection remains incomplete. |
| 5 | Stable release policy | Publish the final support matrix, compatibility rules, and known limits. All release gates, documentation checks, dependency reviews, and independent reviews pass for the release candidate. |

The [conformance suite](language-conformance.md), [runtime reliability gate](runtime-reliability.md), [safety gyms](safety-gyms.md), [performance reports](performance.md), and [release process](releasing.md) provide current evidence. Passing a finite suite does not establish that every program is correct or safe.

The preview includes isolated multicore worker tasks and a separate Metal GPU package. Channels, CUDA artifacts, broader GPU APIs, Windows, musl, and cross compilation remain deferred. Each release repeats worker and GPU qualification on their supported targets. Broader HTTP conformance and identity-provider hardening are library work, tracked in the [gap ledger](web-library-gaps.md), rather than requirements for the core language's 1.0 release.
