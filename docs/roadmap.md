# Roadmap to 1.0.0

August's goal is a language that stays understandable as a codebase grows: local context, explicit public surfaces and dependencies, checked errors, and generated explanations that match the executable code. This roadmap covers the language, its native toolchain, and developer distribution. It uses evidence gates, not a speculative release date.

| Stage | Work | Exit evidence |
| --- | --- | --- |
| 0.19: public preview | Runnable CLI, editor, source packages, wiki, same-file tests, specs, measured benchmarks, and starter projects. | Current CI and [example projects](examples/index.md); experimental label remains. |
| 0.x: language and ownership | Complete mutable capture, shared object lifetime, cleanup, error, and task cancellation semantics; keep syntax and spec output in sync. | The [ownership and task conformance suite](language-conformance.md) now covers the core rules and exposed a parent-mutation bug. Wider adversarial control-flow cases and repeated native/package runs remain before this gate closes. |
| 0.x: portable native stack | Reproducible Linux and macOS web/crypto builds; build/run container images for full apps; platform-specific CI. | Versioned dependency manifests, license notices, native integration tests, and matching package builds on each target. |
| 0.x: developer distribution | Publish version-matched npm packages and VS Code extension; project bootstrap with `npx`; package compatibility and reproducible releases. | Clean installed-package tests, signed/versioned artifacts, release instructions, and supported upgrade path. |
| 1.0.0 | Freeze the supported language and package/native ABI; publish migration policy and production support matrix. | All preceding gates pass in CI, examples and specs regenerate deterministically, dependency audit and security review pass, and known gaps are classified explicitly. |

HTTP and OIDC hardening are library and application work. They are tracked in the [web and crypto gap ledger](web-library-gaps.md) and are not gates for the language's 1.0 release. The [compatibility policy](compatibility.md) identifies the proposed 1.x contract and platform evidence still required. The [production readiness page](production-readiness.md) explains current use and dependency obligations. Language performance is tracked with [reproducible benchmarks](performance.md), with regressions investigated before a stable release.
