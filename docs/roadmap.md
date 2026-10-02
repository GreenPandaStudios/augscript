# Roadmap to 1.0

August 0.21.0 provides a published CLI, LLVM native compilation, repository packages, editor support, same-file tests, and deterministic compiled specifications. The supported preview targets are macOS 14+ ARM64 and GNU/Linux x86-64/ARM64 with glibc 2.36+. Real LibTorch, SQLite, zlib, and Rust BLAKE3 packages work on all three targets.

A 1.0 release will make the documented language and package contracts stable. The table lists the remaining work in implementation order.

| Order | Remaining gate | Completion evidence |
| --- | --- | --- |
| 1 | Language conformance | Independent coverage of every documented construct, ownership transition, alias, checked failure, and task lifecycle. Adversarial cases and regressions pass in both optimization modes on every supported target. |
| 2 | Runtime reliability | Repeated cleanup, cancellation, allocation-pressure, and long-running heap tests. Sanitizer results and generated safety cases are reproducible, with omissions reported. |
| 3 | Native and package compatibility | Freeze the supported native ABI and manifest/lock formats. Exercise upgrades, dependency conflicts, offline installation, missing artifacts, relocation, and recovery from interrupted installs. |
| 4 | Developer distribution | Repeat clean-machine npm and editor installation checks for every release. Provide a tested upgrade path, matched package versions, verified archives, and usable source diagnostics and debugging. |
| 5 | Stable release policy | Publish the final support matrix, compatibility rules, and known limits. All release gates, documentation checks, dependency reviews, and independent reviews pass for the release candidate. |

The [conformance suite](language-conformance.md), [safety gyms](safety-gyms.md), [performance reports](performance.md), and [release process](releasing.md) provide current evidence. Passing a finite suite does not establish that every program is correct or safe.

Multicore workers, channels, GPU tensors, Windows, musl, and cross compilation are deferred features. Existing tasks and native packages do not provide them. Broader HTTP conformance and identity-provider hardening are library work, tracked in the [gap ledger](web-library-gaps.md), rather than requirements for the core language's 1.0 release.
