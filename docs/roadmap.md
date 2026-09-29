# Roadmap to 1.0.0

August's goal is a language that stays understandable as a codebase grows: local context, explicit public surfaces and dependencies, checked errors, and generated explanations that match the executable code. Native output and first-party web features must serve that goal. The roadmap uses evidence gates, not a speculative release date.

| Stage | Work | Exit evidence |
| --- | --- | --- |
| 0.19: public preview | Runnable CLI, editor, source packages, wiki, same-file tests, specs, measured benchmarks, and starter projects. | Current CI and [example projects](examples/index.md); experimental label remains. |
| 0.x: language and ownership | Complete mutable capture, shared object lifetime, cleanup, error, and task cancellation semantics; keep syntax and spec output in sync. | Compiler tests, adversarial native tests, and documented stable behavior on all supported syntax forms. |
| 0.x: portable native stack | Reproducible Linux and macOS web/crypto builds; build/run container images for full apps; platform-specific CI. | Versioned dependency manifests, license notices, native integration tests, and matching package builds on each target. |
| 0.x: web and security | HTTP conformance, OIDC integration, durable keys and credentials, rotation, limits, timeouts, logging, and soak tests. | Published test matrix, failure results, load profiles, and reviewed defaults. |
| 0.x: developer distribution | Publish version-matched npm packages and VS Code extension; project bootstrap with `npx`; package compatibility and reproducible releases. | Clean installed-package tests, signed/versioned artifacts, release instructions, and supported upgrade path. |
| 1.0.0 | Freeze the supported language and package/native ABI; publish migration policy and production support matrix. | All preceding gates pass in CI, examples and specs regenerate deterministically, dependency audit and security review pass, and known gaps are classified explicitly. |

The [production readiness page](production-readiness.md) explains current use and dependency obligations. The [gap ledger](web-library-gaps.md) is the detailed record of missing behavior. Performance is tracked with [reproducible benchmarks](performance.md), with regressions investigated before a stable release.
