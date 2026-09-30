# Changelog

## Unreleased

- Rewrite compiled specs as short developer explanations: group related checks and repeated assignments, describe responses and collection operations directly, show readable string templates, and link dependency contracts without repeating them.

- Write compiled specs as connected prose, with explicit branch, loop, match, recovery, and cleanup relations; preserve statement provenance through sentence aggregation. Describe used dependency contracts in prose and document the academic research behind the generator.
- Add an idempotent `// aug-spec:` source pointer during spec generation and native build preparation, directing readers and coding agents to the adjacent explanation. Read-only checks detect pointer drift; native emission uses reparsed source lines.
- Compile specifications through a structured explanation tree with shorter prose, grouped control flow, integrated Javadoc, and compact linked dependency surfaces. Regenerate the wiki examples and adjacent specs.
- Harden npm publication to use checksum-verified reviewed release archives, disable publishing lifecycle scripts, and safely resume identical partial releases.

- Refresh Marketplace listing metadata and installation docs; keep extension updates as manual uploads of the reviewed release VSIX.

- Reduce getting started to one `npx @greenpandastudios/aug-cli@next init hello-august` command. Publishing a reviewed GitHub release now triggers the verified npm publication workflow; npm ownership and all four trusted publishers are configured.

- Add an executable ownership and task conformance suite and wiki contract. Reject parent mutation of a child-captured object through collection methods, borrowed calls, and direct fields until the child is waited for, including inside an existing borrow block.
- Injected dependencies participate in call alias and task capture checks; dropping an owned `Shared<T>` also drops its transferred payload in local cleanup order.
- Pin owned `Shared<T>` and other reference values while a child borrows them. Ownership transfers now share one move check; repeated starts in a loop keep captured values pinned until their scope joins every child.
- Waiting for a dynamically selected task from a collection no longer releases captures held by possible siblings; waiting for the whole task list still joins all listed children.
- Add seeded parser/checker mutation tests, debug/release native arithmetic and collection differential tests, and macOS/Linux AddressSanitizer plus UBSan CI coverage for collections, task joining, and owned `Shared<T>` transfer. The Linux build image includes Clang's sanitizer runtime.
- The pinned full native bootstrap builds on Linux as well as macOS. Linux build/run Docker images include web and crypto dependencies, with core, crypto, and typed HTTP runtime smoke programs.
- The wiki separates web/OIDC library hardening from the language's 1.0 roadmap and documents the proposed compatibility and platform support policy.

## 0.19.0

- Deterministic `aug spec`, adjacent Markdown explanations, private behavior and same-file tests, used dependency surfaces, and precise-version offline dependency documents.
- Successful native builds refresh specs; `aug spec --check` detects drift without writes; source packages carry their generated specs.
- Optional Javadoc enforcement through `spec.require_comments: none | public | all`, with inherited interface documentation.
- Word-only `and`, `or`, and `not`, with comparisons evaluated before `not` and unchanged short-circuit behavior.
- One optional spelling, `optional Type`, and two states: a value or null. Omitted inputs and fields become null across calls, JSON, forms, cookies, headers, and queries. JSON serialization emits null optional fields.
- Class and record `initialize` blocks; canonical `implement … with …` and `resolve … to …` with verified migration fixes for legacy spellings.
- VS Code spec generation/preview and migration commands, updated syntax coloring, snippets, hover, and configuration help.
- The formatter preserves `import everything`; compiled specs describe the dependency surface actually used.
- Browse every repository example and measured August benchmark as a complete project in the wiki. Each file shows highlighted indentation and braces views, its compiled specification, and links to the exact dependency documentation. The code-style switch remembers the reader's choice and supports the keyboard. Documentation generation and CI check the displayed code and specs against repository sources.

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
