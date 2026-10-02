# Changelog

## Unreleased

- Authenticate public package reads in native release producers with their scoped job token. Retry release preparation against an existing tag and reviewed commit without moving the tag, changing its source, or skipping qualification gates.

- Build and qualify LLVM on a physical DGX Spark: 266 parity cases, full safety gyms, frozen performance gates and four real public native-library imports. Publish the host, workload sources, raw results and remaining performance gaps in the wiki.

- Add reproducible safety gyms with generated integer/floating arithmetic, collection, bounds, control-flow, ownership and task cases; independent expected results; rejected contracts; valid behavioral mutants; replayable sources and structured reports. CI qualifies all three LLVM hosts and retains the evidence.
- Expand C comparisons to floating-point loops, labeled calls, lists, strings, map deletion, checked failures, records and tasks. Publish source/spec examples, raw samples and scoped charts. Use fresh measurement processes and more samples for the unchanged migration limits.
- Emit strict native floating arithmetic while preserving actual integer tags in widened float slots, wrapping integer operations, signed-zero errors and IEEE comparisons. Avoid retaining unrelated runtime services in core-only executables.
- Preserve ordered map deletion without rebuilding every surviving key's hash-table entry. Check wrapped collision chains, missing keys, reinsertion order and complete removal.

- Select LLVM for ordinary builds, runs and same-file tests on the qualified macOS ARM64 and GNU/Linux x86-64/ARM64 hosts. Obtain verified compiler/runtime artifacts automatically; keep C available as an explicit migration reference. Container deployments copy the executable with its neighboring libraries and notices.
- Use the C-compatible DWARF type reader for tagged August storage so supported LLDB versions can display locals. Source files, locations and producer remain August; native debugger expressions do not evaluate August syntax.
- Bind GNU runtime internal function calls directly while retaining shared data symbols and external allocator hooks. Recheck startup, collection and HTTP measurements against the frozen migration limits.
- Link core-only programs on all three hosts with the verified runtime archive; retain one shared core for crypto and HTTP components. Preserve task hooks without exporting August function symbols.
- Keep temporary HTTP header values alive across managed collection. Exercise compressed streaming under collection pressure before checking disconnect cleanup and request logging.
- Preserve a streaming HEAD response when LLVM stops its producer. Apply CORS headers once, await transport before logging, report an intervening deadline as 504, and keep real cleanup failures on the error path.
- Complete HEAD transport with its headers and retain the prepared response after session cleanup. Verify HTTP/1.1 connection reuse and HTTP/2 stream completion instead of scheduling an empty-body write.
- Run HTTP comparison rounds with a fresh load-client process and retain raw measurements from failed CI qualification. Keep the existing migration thresholds and verify every response.
- Update the locked VSCE publisher to 4.0.1-1 for its upstream Marketplace OIDC API-version and federated-token fixes. Publication still requires a verified release and the configured trusted policy.
- Add GNU/Linux x86-64 and ARM64 LLVM candidates with an explicit glibc 2.36 floor, ELF process entry, SDK-free linking, relocatable runtimes, and checked libc/C++ requirements. Musl and cross compilation remain unsupported.
- Handle native archive write failures through the CLI and discard rejected extraction state; verify large archives across bounded reader chunks.
- Build compiler packs for each target and merge their exact pins before npm/VSIX packaging. Require minimum-platform consumer checks before creating the release draft; local library qualification records its transport separately from public imports.

- HTTP action captures evaluate labeled arguments once in the order written, on both compiler backends.
- Constructor interception releases a fresh completed result when an outer layer fails or returns a different result, including its transferred native resources.
- Runtime pack builds verify every operation, schema and policy identifier against the compiled headers; consumers reject mismatched identifier contracts.

- Add checked execution IR, pinned compiler/runtime packs and SDK-free linking. Unsupported LLVM constructs produce a source diagnostic without fallback.
- Add format 2 native packages, opaque owned resources, descriptor-checked labels/types/errors/effects, bounded verified artifacts, target and compiler locks, and deployment notices. Consumers do not run package build scripts. Public GitHub source imports use verified HTTPS snapshots without requiring Git.
- Exercise real CPU LibTorch, SQLite, zlib, and Rust BLAKE3 adapters. Fix owned-field transfer/replacement cleanup, preserve native error methods, reject ambiguous native symbols and lock metadata changes, and reject direct scalar contract violations. Public release and clean-machine qualification are in progress.
- Allow a class constructor to declare checked failures with `unless ErrorType` before `implements`. Failed construction releases the partial object and transferred owned fields in both backends. Frozen execution rejects changed source dependencies before changing the accepted snapshot or lockfile. Native hover, context and specs describe the provider, targets, ownership and release contract and distinguish foreign-code promises from compiler checks.
- Add complete LibTorch, SQLite, zlib and BLAKE3 example projects with same-file tests and linked native contracts in the wiki. Track generated native descriptors so repeated spec generation, drift checks and dependency removal preserve user edits.
- Lower optional/record matches, scoped dependency resolution, `Shared` locks and `always` cleanup through LLVM. Check scope and lock restoration on returns and failures, and release only initialized owned fields after failed construction.
- Use the existing cooperative task scheduler from LLVM through a pointer-call entry. Capture written arguments and injected dependencies when scheduling; preserve grouped/collection wait order, sibling cancellation and cleanup before scope exit. Run the concurrency conformance fixtures with both backends in CI.
- Release transferred owned task inputs when a sibling cancels the task before its first instruction. Verify immediate cleanup through both backends and with real LibTorch handle counters.
- Reject inferred task results from functions that return `own`: the current `Task<T>` contract cannot transfer that ownership. Report the limitation before either backend can silently downgrade a native handle.
- Give the consuming `Shared` builtin explicit capture ownership, preserve cancellation before catch handling, and release try-local owned values before `always` on every exit. Suspend pending errors/cancellation while local drop methods finish, then restore them.
- Lower JSON schemas, clocks, crypto, HTTP handlers, policies, forms, streaming, HTML actions and interceptor chains through LLVM. Share concrete schemas and constructor callback dispatch between backends. Verify LLVM IR before object generation, and run the existing runtime fixtures against the LLVM backend.
- Package macOS 14 crypto and HTTP runtime components with relocatable dynamic dependencies, redistribution notices and corresponding sources. Link and deploy only the components a checked program requires. Reject dependency binaries that require a newer macOS version.

- Wait for npm's public registry to expose an accepted upload before publishing the next package. Visibility checks remain bounded; authorization, service, and integrity errors stop the deployment immediately.

## 0.20.1

- Publish the four npm packages and the VS Code extension when a reviewed GitHub release is published. Deploy the checked release archives with OIDC, verify their checksums and manifests, and resume partial runs only when existing published contents match. Extension publishing uses the locked VSCE 4.0.0 tool in a separate deployment job.

## 0.20.0

- Import libraries from public Git URLs, with optional aliases from `aug add`, exact commit locks, frozen and offline restores, and transitive Git/local/npm graphs. Package installation reads source without running hooks or lifecycle scripts.
- Move JSON, web, crypto, clocks, and stores out of the compiler's builtin namespace. Existing repository code uses ordinary source imports. Core `august.io` remains supplied with the compiler. This is a breaking preview change.
- Include `AGENTS.md` in application and library starters. Add `aug init NAME --template weather` with a typed forecast endpoint, same-file tests, OpenAPI, and an HTTP request file.
- Fill labeled call arguments in completion, add public imports, supply declaration/test/HTTP templates, and offer name, label, missing-method, and package-install fixes. Show the same edits through VS Code and LSP.
- Rewrite package onboarding, add weather and editor guides, and generate API signatures from checked contracts. Wrap long calls and collections in formatted examples; describe literal record data without repeating each field name. Remove repetitive prose and update dependency notices. The CLI and extension use tar 7.5.22 for bounded registry extraction.
- Prepare JSON and task sources needed by crypto packages before building their native libraries. Verify first use with empty source/native caches; report missing dependency names and preserve completed setup work for retries.


- Infer omitted result, mutation, capability, and checked-error contracts for executable bodies, including public functions, interface defaults, forwarding interceptors, HTTP policy dependencies, and record validation. Keep explicit clauses as checked assertions and preserve ownership, purity, and interface limits.
- Show inferred contracts as non-editable VS Code/LSP hints; share them with hover, signature help, OpenAPI, semantic descriptions, and compiled specs. Keep source formatting concise and preserve explicit void assertions.

- Make `aug run` prepare declared source packages and the native dependencies its checked program uses before compiling and starting it. Reuse verified caches, support offline runs, isolate concurrent native setup, and resume interrupted preparation. Build/test/bench prepare their required native libraries too.
- Explain missing tools, failed downloads/builds, cache problems, invalid options, and process signals. Terminal diagnostics include source excerpts, location pointers, and help. Simplify onboarding to install August once and use `aug init` and `aug run`.
- Detect native runtime references as C identifiers so strings and comments cannot accidentally request extra libraries. Package the setup helpers with the CLI and VS Code compiler.
- Fix fresh GnuTLS configuration through aliased cache paths; add a cold crypto/HTTP preparation gate that executes a digest and serves a real response.

- Document Docker application builds, HTTP deployment, registry transfer, and a VS Code Dev Container with the published CLI, native libraries, August extension, and forwarded ports. Check the deployment example and its endpoint test in the executable documentation gate.
- Reorganize the public wiki into a sequential August book, task guides, language/library reference, design and readiness pages, and contributor documentation. Add checked lessons, a guided module review, primary-source editorial research, and a repository maintenance skill.
- Check nested handwritten lessons in the executable documentation gate and keep benchmark and readiness claims scoped to their evidence.
- Correct stale registry availability guidance after verifying the published 0.19.0 CLI and its matching libraries; the book starts with the npm bootstrap.
- Render compact spec declaration anchors as wiki heading anchors, removing visible HTML metadata from the source/spec gallery.
- Use the published npx starter throughout onboarding and provide deterministic downloads for every gallery project, including neighboring package sources. Remove repository setup from reader workflows and verify extracted downloads with the compiler.

- Rewrite compiled specs as short developer explanations: group related checks and repeated assignments, describe responses and collection operations directly, show readable string templates, and link dependency contracts without repeating them.

- Write compiled specs as connected prose, with explicit branch, loop, match, recovery, and cleanup relations; preserve statement provenance through sentence aggregation. Describe used dependency contracts in prose and document the academic research behind the generator.
- Add an idempotent `// aug-spec:` source pointer during spec generation and native build preparation, directing readers and coding agents to the adjacent explanation. Read-only checks detect pointer drift; native emission uses reparsed source lines.
- Compile specifications through a structured explanation tree with shorter prose, grouped control flow, integrated Javadoc, and compact linked dependency surfaces. Regenerate the wiki examples and adjacent specs.
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
