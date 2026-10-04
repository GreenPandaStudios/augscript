# Changelog

## Unreleased

Complete `matchvalue` with project formatting preferences. Narrow optional/type case names in match-expression hover and completion, color those names as variables, and describe result, completeness and ownership rules in keyword help.

Complete `itboundaries` inside a same-file function test group to insert representative scalar input rows and an assertion placeholder. Templates honor project formatting; expected answers remain an author decision.

Complete explicit compositions through ordinary exports and imports. Inspect application or selected same-file test wiring with `aug graph --composition`, including lifetimes, constructor dependencies, source revisions and Mermaid diagrams. Duplicate binding diagnostics link the conflicting selections; inspection does not execute or replace providers.

Link call-input failures to their checked declarations in Problems, with substituted expected/actual types and accepted caller labels. Preserve related locations across unsaved dependency edits; diagnose malformed labels before omitted inputs.

Show each generic interceptor application’s resolved dependencies and effects in hover, independently of other uses.

Completion templates follow the project's block style, indentation and assignment preference. Fixed snippet contributions have been replaced by the completion provider's templates. Missing-method and missing-interceptor actions format their candidate file with those preferences and retain comments; default input values remain in generated method scaffolds.


Complete labeled calls with compatible local values, omit defaulted inputs, and hide unavailable mutations. Show fix consequences in previews. Add resolved references and compiler-checked rename for the managed standalone-function profile, preserving label shorthand and rejecting unsupported contracts.

Add **AugScript: Check Setup** and the **August** output channel. Explain missing Node/compiler paths, offer settings and output actions, and recover after configuration changes. Test installed VSIX features and preview upgrades in real VS Code hosts. A retained 0.23.0 compiler reports that doctor is unavailable.

## 0.23.1 — burgundy artwork

Bundle the unchanged public August 0.23.0 compiler. Editor-only patches now use a separate checked release path.

Replace the framed A logo with an open-circle mark. Explorer icons use simple strokes, burgundy accents, muted neutrals and light/dark variants, with distinct startup, export and configuration symbols. Refresh the banner, bundled welcome page and icon legend. Correct the README’s LLVM, installation and worker descriptions.

## 0.23.0 — native ingestion preview

Hover and completion include lazy checked HTTP body reads, JSON field presence, checked byte slices, hexadecimal conversion, protocol text helpers, and float32 conversion. Worker help explains checked admission failures and copied-input limits.

## LLVM native preview

- Use the compiler-owned LLVM pack for ordinary run/build/test commands on qualified hosts. Native compilers and SDKs remain maintainer tools. Preserve source diagnostics and the same default as the CLI.
- Highlight and complete opaque native resource declarations. Hover and navigation retain resource and package identities; descriptor mismatches include repair guidance.
- Bundle native package and LLVM compiler metadata with the compiler. The matching CLI prepares verified native artifacts and compiler packs; unsupported LLVM constructs remain explicit diagnostics.

## 0.20.1

- Publish the reviewed release VSIX from GitHub Actions using Marketplace trusted publishing. Verify the bundled compiler, artwork, manifest and checksum before uploading; retries check the existing extension contents.

## 0.20.0

Completion inserts labeled arguments and public imports. New templates cover declarations, tests, HTTP methods, streams, tasks, and locks. Fixes correct nearby names and input labels, scaffold interface methods, and install missing source packages. The bundled compiler uses regular Git/local/npm packages for optional libraries. Updated guides cover the editor and weather starter.

- Show inferred return, mutation, capability, and checked-error contracts as inline hints, enabled by default. Toggle augscript.inferredContractHints; formatting never inserts inferred clauses. Hover and signature help use the inferred contracts too.

- Bundled native commands prepare only required pinned dependencies and reuse their cache. Missing tools and setup failures include recovery steps; terminal source diagnostics show the code and help.

## 0.19.0

- Deterministic compiled specifications, project generation, and current-file Markdown preview.
- Word-only boolean operators and initialize blocks in coloring, snippets, hover, and migration fixes.
- Value-or-null optional types; updated signatures, migration fixes and hover explain that omission becomes null.
- Project syntax migration command and spec comment-policy help for main.yaml.
- Matching compiler, libraries, API guides, and offline source specs.

## 0.18.0

- Inferred implementation/helper capabilities in hover and checked explain output.
- User-authored package public imports with real-source navigation and Javadoc help.
- Standalone library project roots; package manifest and lockfile change notifications.
- Matching 0.18 compiler and standard declarations, file artwork and welcome guide.
- Updated native runtime performance and benchmark examples in the language wiki.

## 0.17.0

- August extension logo, illustrated README, and default light/dark language icons.
- Illustrated offline welcome page with bundled images and guide links.
- Enable File Icons command, with distinct source, startup, export, and configuration marks.
- Shared repository, versioned language wiki and generated library API documentation.
- Compiler parity with separately distributed CLI/stdlib/web/crypto packages.
- Installed CLI version reporting and native cache support.

## 0.16.0

- First-party typed endpoints, literal HTTP policies, OpenAPI 3.2.1 and same-file endpoint pipeline tests.
- Bounded outbound streaming, scoped cooperative tasks, immutable sharing, lock blocks and always cleanup.
- Checked server components and deferred POST/PUT/PATCH/DELETE form actions.
- Injectable web, crypto, JSON, time and bounded expiring-store adapters, plus a same-app OpenID Connect login proof.
- Endpoint/policy/action colors, option completion and hover, wire-source context, guide examples and native dependency settings.
- Pinned private native bootstrap bundled with the extension. Multicore workers, channels/broadcasts and inbound streams remain documented gaps.
- Review fixes preserve int64 action/form data, keep invalid wire inputs request scoped, and verify child cancellation, owned cleanup, checked task errors, empty streams and post-yield failures.

## 0.15.0

- Optional colon blocks with tabs/spaces and a checked canonical formatter.
- Pure defaults, explicit changes/uses contracts, standard I/O capabilities, and header-only helper DI.
- Immutable records, private storage/public labels, snapshot iteration, destructuring, and exhaustive null/bool matching.
- Concrete generic inference, constraints, checked interface variance, flow narrowing, and deeper alias/loan/move analysis.
- Stateful fresh defaults, explicit shared mutation, scoped lifetimes/escape checks, and imported compositions.
- Recoverable index/arithmetic/conversion errors, defined integer/Unicode/FFI contracts, and checked documentation.
- Persistent cached LSP, richer semantic hover/completion/navigation, context/provenance reports, and module policy.
- Function suites, parameterized rows, explicit fixtures, and native statement-line coverage.
- Native diagnostics/source maps, benchmark CLI/workload, LLDB launch/terminal support, and pinned build dependencies.
- Migrated examples and compiler-checked executable guides.

## 0.14.0

- List, tuple, set, and hash-map literals with inference and typed empty collections.
- Optional semicolons and checked failure contracts spelled unless.
- Grouped imports with and; public wildcard imports with everything and resolved-name hover.
- Same-file unit tests, per-case native process isolation, test DI, assertions, filtering, JSON results, and timeouts.
- Test Explorer provider, test commands, test snippets, and typed collection/test hover and completion.
- Mutable collection invariance, interface ownership checks, and non-void return-path checks.
- Language tenets and a feature-by-feature audit with proposed next steps.

## 0.13.0

- First-class `interceptor` declarations with typed `around` and `next`.
- Ordered annotations on functions, methods, constructors, and native functions.
- Selected inputs, labeled mappings and overrides, and inferred generic types.
- Per-invocation instances with DI, checked errors, and ownership preservation.
- Compile-time checks for repeated continuations and missing return paths.
- Interceptor coloring, mapping completion, contextual hover, signature help, and navigation.
- Quick fixes and expanded bundled language and diagnostics guides.

## 0.12.0

- Underscore visibility for declarations, members, modules, folders, and bindings.
- Public field completion and scope-aware private member completion.
