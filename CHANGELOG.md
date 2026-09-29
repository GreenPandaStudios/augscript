# Changelog

## 0.19.0

- Deterministic `aug spec`, adjacent Markdown explanations, private behavior and same-file tests, used dependency surfaces, and precise-version offline dependency documents.
- Successful native builds refresh specs; `aug spec --check` detects drift without writes; source packages carry their generated specs.
- Optional Javadoc enforcement through `spec.require_comments: none | public | all`, with inherited interface documentation.
- Word-only `and`, `or`, and `not`, with comparisons evaluated before `not` and unchanged short-circuit behavior.
- One optional spelling, `optional Type`, and two states: a value or null. Omitted inputs and fields become null across calls, JSON, forms, cookies, headers, and queries. JSON serialization emits null optional fields.
- Class and record `initialize` blocks; canonical `implement … with …` and `resolve … to …` with verified migration fixes for legacy spellings.
- VS Code spec generation/preview and migration commands, updated syntax coloring, snippets, hover, and configuration help.
- The formatter preserves `import everything`; compiled specs describe the dependency surface actually used.

## 0.18.0

- User-authored August source packages: CLI scaffolding/packing, local archives/folders, exact npm aliases, transitive resolution, verified snapshots and frozen `aug.lock.json` installs.
- Package public exports, private boundaries, compatible compiler checks, editor navigation/Javadoc and standalone library checking/testing.
- Inferred capabilities on class implementations and private helpers; explicit interface/public function contracts, mutation and errors remain checked. Hover, explain and generated API docs show inferred effects.
- Shorter standard-library implementation headers and matching editor/compiler version reporting.
- Reproducible C/Node/Python comparisons, peak-memory and native HTTP measurements, with graphs and production limits in the wiki.
- Faster CPU and Map/Set workloads and higher HTTP throughput at higher concurrency, with updated measurements and runnable benchmark examples.

## 0.17.0

- August extension artwork, default language icons, and workspace file icon activation.
- Canonical language wiki with a searchable, mobile-friendly documentation site.
- Generated public library API and language construct reference shared with editor documentation.
- Versioned CLI, standard library, web, crypto and VS Code distribution manifests.
- Compiled JavaScript CLI packages with actual separate library resolution, matching versions, `aug --version` and `aug-native`.
- Writable, versioned native dependency cache for installed CLI packages.
- Documentation drift checks, executable guide tests, package installation tests, CI and release workflows.

## 0.16.0

- First-party HTTP endpoints and policies, OpenAPI, cooperative tasks, streaming, components and deferred actions.
- Explicit web, crypto, JSON, time and expiring-store capabilities.
- Same-app OpenID Connect provider/client login proof with a separate session JWT.
- See the [release review](docs/release-review.md) and [gap ledger](docs/web-library-gaps.md) for verification and limits.
