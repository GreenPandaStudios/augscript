# Keeping documentation current

Documentation is part of a language change. Edit the canonical wiki in `docs` and review it with the compiler change. GitHub Pages renders those files.

For writing and navigation, use [the editorial guide](writing-docs.md). The repository's `.agents/skills/maintain-august-wiki/SKILL.md` routes agents through that guide and this workflow. `AGENTS.md` requires it for documentation and behavior changes. The [research note](research/wiki-editorial-design.md) explains the source material and the decisions applied here.

## Where to make a change

| Change | Update in the same commit |
| --- | --- |
| Syntax, type/effect/ownership/DI rules | `docs/reference.md`, relevant grammar/testing/web guide and `src/help.ts` |
| Public library signature or behavior | Javadoc beside its declaration in `src/stdlib`, the relevant guide and gap ledger |
| Diagnostic or editor behavior | `src/help.ts`, diagnostics/tooling guide and VS Code changelog |
| CLI, packages, configuration or supported platform | Tooling/packages/releasing guide, Docker and Dev Container recipes, and package metadata |
| Runtime lifecycle or qualification behavior | `docs/runtime-reliability.md`, readiness, roadmap, release workflow and changelog |
| Completed or deferred feature | Implementation map, gap ledger and changelog |
| Checked-change schema, forwarding, transactions or bounded evidence | `docs/checked-changes.md`, amendment status, tooling/diagnostics guide, help/editor contracts, installed-package and independent mutation/recovery regressions |

Public comments should explain observable behavior, named inputs, errors, side effects, and limits. Keep dependencies explicit in examples. Record incomplete capabilities in the gap ledger; do not imply that an unimplemented proposal is usable.

Container guides use the published `aug-build` and `aug-runtime` bases. The build base contains the released CLI and prepared pinned LLVM/runtime; application packages are installed during the build. Keep the CLI version, supported targets, writable cache paths and complete deployment bundle aligned with the release. Maintainer build images have a separate explicit toolchain. Verify the HTTP application image and run the starter's check/run/test/spec workflow as the Dev Container's non-root user. State any verification mount substitutions: a Docker engine that cannot share local folders can test execution in an isolated volume, but that does not verify the default VS Code bind mount or editor port forwarding.

For dependency-setup changes, run `npm run test:setup-cold` after preparing the pinned downloads. It builds crypto and HTTP through an aliased empty cache, runs a digest, and serves a real HTTP response. The fast first-run suite covers JSON/tasks, downloads, offline reuse, packages, and cache concurrency. Verify the installed package too; source execution alone does not prove that setup helpers ship in the npm archive.

The installed-package gate uses an isolated npm cache. Its first installation fetches production dependencies; its later global installation runs offline from that cache. This checks both first use and reuse without relying on packages cached by the contributor's machine.

The core and optional source module lists live in `src/library-modules.ts`. Checking, npm assembly, API generation and wiki navigation read that registry; core package module metadata must match it. Add a new core module to the registry, `src/stdlib/export.aug`, the canonical package manifest and its runnable guide, then regenerate.

## Generated reference

Before creating a release tag, describe implemented features directly in compiler and editor help. Give a required compiler version in generated API and catalog pages when it matters. Keep publication status in installation and release guides.

The gallery generator also creates deterministic project archives in `docs/public/downloads`. Each archive includes source, configuration, and generated specs, with neighboring source packages when required. It excludes build state, installed dependencies, locks with temporary host paths, and credentials. Gallery tests extract every archive and check it as an independent project. Public guides use these downloads and the npm CLI; source-workspace commands belong in contributor documentation.

```sh
npm run docs:generate
npm run docs:check
npm run docs:build
```

The API generator reads each `export.aug`, resolves the actual public declaration, and uses the same Javadoc/inherited documentation path as hover. It includes public methods and excludes private native helpers. The language constructs page comes from editor help and collection operation contracts. Commit generated Markdown so GitHub readers and package users can read it without building a site. CI rejects stale generated pages.

Performance charts use native HTML and CSS. `docs:generate` derives their small `benchmark-data.json` summary from the recorded reports, and `docs:check` rejects stale values. Keep the reports unchanged when editing presentation. `::: benchmark-chart NAME` inserts a registered chart without enabling arbitrary Markdown HTML; unknown names fail the site build. Verify implementation filters, observed-range controls, keyboard operation, light/dark themes and narrow layouts when changing `BenchmarkChart.vue`.

The generator also runs the deterministic spec compiler for every standard-library source file. Commit these adjacent `src/stdlib/**/*.aug.md` files and their managed `// aug-spec:` source pointers. Unlike public API pages, full source specs include private helpers and all local behavior. The generator builds explicit behavioral relations, plans sentences within their scopes, checks statement provenance, and lays out connected paragraphs. Keep author comments and dependency links concise instead of repeating signatures or Javadoc sections. `src/spec-diagrams.ts` generates linked folder data flows, checked input/result boundaries, class interactions and bounded operation sequences from checked identities and AST control flow. `tests/spec-diagrams.test.mjs` checks determinism, preserved calls, Mermaid parsing and spec-write protection. Review the full generated set when changing diagram presentation. Check that lifelines name logical units rather than expressions or package-cache identities, local value operations remain local, call/reply pairs stay together and continuing views show the active branch. Diagram sidecars, `.aug-spec/diagrams/index.md`, and folder overviews under `.aug-spec/diagrams/folders/` use the normal manifest. Gallery pages render Mermaid through `CodeDiagram.vue`; preserve strict sanitization, lazy rendering, keyboard controls, source fallback, and relative source/spec links. Keep selected headings stable during lazy diagram rendering, and release that adjustment when a reader scrolls or uses a control. Never hand-edit generated diagrams. For application or third-party package source changes, run `aug spec PROJECT` and verify `aug spec PROJECT --check`. See [the user workflow](specifications.md) and [the research rationale](research/code-to-natural-language.md).

## Installed developer workflows

For CLI, editor, package layout, setup, or release workflow changes, run installed-package tests and the public replacement gate after packing the candidate: `npm run package:packages`, `npm run test:packages`, and `npm run test:upgrade`. Before publication, add `-- --local-compiler` to the upgrade command when it needs an unpublished compiler pack. Keep reports honest about public versus local transport and reinstall versus version upgrade.

Package the VSIX and run `npm run test:editor`. Repeat `-- --editor 1.90.0` for the declared minimum editor. The automated matrix covers every compiler host and both pinned editor versions; local macOS evidence does not establish Linux results. For editor-only patches retaining the public compiler, add `-- --retained-compiler`. Update the baseline checksums only from reviewed published artifacts. Keep `scripts/distribution-inputs.json` and the editor matrix aligned. Reports and disposable profiles belong in generated directories, not Git.

Linux editor qualification runs under a virtual display with GPU acceleration disabled. The report records software rendering; macOS keeps its normal rendering path. Failed clean/upgrade profiles retain bounded text logs in `.aug-build/editor-host-logs-*` for the workflow artifact. These test settings do not change the installed extension or a developer’s VS Code preferences.

Linux LLVM parity installs the OIDC example's locked GitHub source packages. Pass the runner's `AUG_GITHUB_TOKEN` into that Docker process with `docker exec -e AUG_GITHUB_TOKEN`; a job environment variable alone does not reach the container. The source transport uses the token only for GitHub API reads, so qualification can use authenticated API limits without adding credentials to source snapshots or raw downloads.

## Repository example gallery

`docs/example-projects.json` lists the complete projects shown in [the example gallery](examples/index.md), including the measured benchmark programs. `docs:generate` checks each application and its same-file tests, formats each file in indentation and braces styles, and runs the spec compiler. It publishes code and specs side by side under `docs/examples`, with dependency links that stay in the wiki. Long code lines wrap visually without changing copied source. It also refreshes adjacent example specs, managed source pointers, and offline dependency copies. Generation uses temporary project copies. It installs dependencies declared by imports and configuration, preserving committed revision locks. Git sources must be cached or reachable during preparation; spec generation itself stays offline. It preserves the source program and handwritten comments, and does not create package locks in the source workspace.

Keep titles and descriptions in the catalog current when adding or changing an example. `docs:check` rejects source/spec drift. Gallery tests require every repository example and benchmark source to be represented, check both displayed syntax styles, and follow the wiki's generated links and declaration anchors. Readers can switch code style with a mouse or keyboard; their choice is kept between pages on the same browser.

## Executable examples

A neighboring configuration fence can use `yaml project=NAME file=main.yaml`. Each runnable `aug` fence declares `project=NAME file=PATH`. A guide may spread one project across several fences. Add expected output/test counts to `docs/examples.json`. The documentation test assembles, checks, runs or builds, tests, formats, and checks those projects again. API signatures use `text` fences because a declaration header is not a complete application.

The test discovers handwritten Markdown recursively, including the book and task guides. Generated API/gallery pages and hidden build folders have separate generation checks. Complete examples need expected output; identify fragments and intended failures in the prose. Maintain the chapter links and the public navigation when adding a lesson.

```sh
node --test tests/documentation.test.mjs
```

CI checks documentation on every push and pull request. Pull requests changing language/runtime/library/tooling behavior must update a handwritten guide or changelog; the policy check enforces that requirement. The Pages deployment publishes only the documented branch version, with search and source links. Use tags and GitHub history to read earlier releases.

## Homepage and current-state audit

`scripts/homepage-docs.mjs` generates the welcome code, spec and diagrams from the checked `examples/hello` project. Its separate performance section uses `benchmarks/greetings` and verifies the matching report’s source and full sample count. `scripts/native-package-docs.mjs` generates the library example guide from the real native consumer projects. Update canonical programs and rerun their checks before changing their generated presentation.

When auditing the whole wiki, review handwritten pages, generator inputs, library comments, and generated outputs. Replace completed proposals with descriptions of implemented behavior. Remove obsolete benchmark comparisons and local delivery history from reader pages. Verify published CLI/extension versions separately; a GitHub VSIX does not imply the same version is available in the Marketplace. Keep remaining platform, protocol, ownership, and redistribution limits explicit.

A compiler version update also requires refreshing committed example and benchmark source locks with `aug install`. First-party packages retain an exact compiler version; third-party packages may declare a checked bounded compiler requirement. Qualify every supported compiler before widening that requirement, and publish compatible source tags before changing imports. Reusing an unchanged native archive is explicit in the package manifest and release notes. Run the complete example gallery after updating those locks.


For package compatibility changes, run `npm run test:compatibility` and installed-package checks. Preserve source-lock format 1 and native profile `aug-native-abi-1` unless the change explicitly introduces a new format/profile with diagnostics and migration. Check compiler upgrades without refreshing repository commits, concurrent reader/writer behavior, process interruption before and after publication, and native failure rollback. The public adapter header is `native/aug-native-abi-1.h`; packaged CLI tests require it to ship. Linux maintainer qualification requires physical header checks to execute rather than skip. Power-loss behavior and automatic source-generation garbage collection are not qualified.

## Curated library catalog

`src/library-catalog.ts` owns task descriptions, safe import examples, ownership summaries, license notes and test links. `native/library-catalog-inputs.json` selects public tags or exact reviewed commits. `native/library-catalog.json` retains their native manifests, exports, source commits and notice digests. The CLI and generated `docs/library-catalog.md` use those inputs.

A catalog update is a metadata review, separate from artifact or behavior qualification. Run `node scripts/update-library-catalog.mjs` to refresh those exact public native references; it reads metadata without building or installing packages. Review upstream notices, source identities, public exports, host constraints and existing qualification records, then run `npm run docs:generate`, catalog tests and installed-package gates. Preserve reusable native artifact pins when a source-only tag refers to an older artifact release. Adding a link to a catalog does not qualify its downloaded bytes.

## Dependency preview checks

`aug update --preview` uses the ordinary source resolver in isolated staging and the same public-contract projection as `aug package diff`. Keep the accepted source generations and lock unchanged, and retain checks for concurrent source/configuration/installed-byte changes. Package contracts are checked independently when an application caller fails. Native selection and cache hashes do not qualify execution; report declared size bounds accurately. Test moving Git refs, explicit changed declarations, transitive contracts, unsupported targets, rejected candidates, and pending add recovery. Qualify a real public repository through the installed CLI before release.

## Library maintainer templates

`src/package-publishing.ts` owns repository-root consumer CI and read-only tagged release reports. Keep templates pinned to a compiler release containing every invoked command; templates generated by development builds reporting 0.23.0 were staged because the published release lacked those commands. Templates generated by 1.0 pin that containing compiler release. Reuse reviewed action pins, test exclusive creation and nested-directory rejection, and retain exact tag/source/configuration/lock/spec evidence. A native report must agree with frozen host selection and verify cached bytes without downloading. Run package-publishing regressions and installed CLI checks; qualify the generated test-copy steps through LLVM. Hosted consumer CI and native artifact-production qualification remain separate.

## Scratch entry fragments

`src/scratch.ts` owns temporary project creation, original-source check diagnostics and cleanup. Execution stays in the ordinary CLI path and requires `--run`; preparation requires `--prepare` or `--run`. `tests/scratch.test.mjs` extracts the guide fragments, verifies C/LLVM execution and real tagged source imports, and exercises the public native zlib guide when `AUG_TEST_PUBLIC_SCRATCH=1`. Keep availability claims tied to the published compiler containing the command. Verify the packaged command through `npm run test:packages`, and inspect guide navigation at desktop and phone widths.

Call diagnostic contracts are maintained in `src/ast.ts`, `src/checker.ts`, CLI rendering and LSP publication. Keep the tooling and editor guides aligned with structured expected/actual and related-location fields; verify imported and unsaved declaration locations through `tests/diagnostic-context.test.mjs`. Interface mismatch fragments use the same checker comparison as acceptance; keep shortest capability call witnesses distinct from execution evidence, and retain checks against all inherited contracts including defaults.

Composition inspection lives in `src/composition.ts` and consumes existing checker bindings. Keep `docs/guides/reuse-services.md`, its executable source expectations and editor/tooling/test guides aligned; test imported include completion, rejected graphs and actual application/test providers on both backends.

`src/test-inputs.ts` owns finite scalar domains, author-literal validation and input-case templates. Keep generated suggestions separate from expected results and never silently truncate a domain. Check one-column patterns, signed boundaries, optional nulls, name collisions, all source preferences and independently selected mutations through both backends.

## Acceptance review reports

`src/verification.ts` owns the bounded author-requirement mapping and combined review report. Reuse ordinary semantic contracts, context packets, specification generation and native tests. The test runner's `sourceRevision` identifies its loaded source/configuration; verification pairs that identity with checked source and checks current identities after execution. Keep author requirements and source-derived descriptions distinguishable. Unknown/empty cases, compiler rejection, missing mandatory context and stale or incomplete evidence must not pass. Preserve exact selected/rejected source and concrete case results without rewriting source/specs. Test independent mutations, concurrent source/requirement edits, bounded interface dispatch, canonical library ids, both native backends and installed JavaScript. This is finite behavioral evidence, not an atomic source transaction or proof of business correctness.

`src/test-compilation-cache.ts` owns bounded personal-cache output for the initial core-runtime LLVM test profile. `src/llvm-native.ts` supplies complete source/configuration/compiler/runtime/platform/tool/link identities and always refreshes deployment metadata. Retain source-owned complete compiler member-manifest pins, verify them before accepting tool identities, and check actual archive member pins during release assembly. Existing archives without the optional pin compile without reuse. Keep runtime integrity verification before lookup; project-local output cannot supply trusted cache entries. Test corrupt manifests/bytes, linked artifacts, unavailable or shared-writable directories, dependency/generic/interceptor/ownership changes, test selection, coverage, unsealed contributor helpers, verified tool-pack closures, fixed compiler versus native-process environments and both backend behavior. Every test invocation must start a fresh native process, including hits. Component/native-package reuse and module incremental builds remain unqualified. Measure compilation speed separately from runtime performance, and run installed package gates for CLI changes.


The example gallery retains canonical source ranges through `formatFileWithSourceMap` and `scripts/example-source-links.mjs`. Shiki navigation validates closed, content-matched metadata before rendering native anchors; it adds no text to copied code. Keep the annotation transformers compatible, source ids unique across code styles, and dependency-copy offsets correct. Run formatted-source-links and example-gallery regressions, generate the gallery and build the wiki. Inspect paragraph links, backlinks, style changes and copying at desktop and phone widths.

`src/refactoring.ts` validates binding correspondence before returning rename identity maps; `tests/rename-identities.test.mjs` checks selected and changed derived IDs, detached responses and tampering; `tests/rename-selection.test.mjs` moves declarations during capture to check that named selection and edits use one snapshot. `src/checked-changes.ts` regenerates revision-bearing rename/body plans and retains that map in committed recovery-required reports; `src/body-edits.ts` bounds author-supplied units, preserves parsed headers and enclosing syntax, and retains stage-specific rejected source. `src/change-revisions.ts` shares the checked revision hash domain. `tests/checked-body-changes.test.mjs` exercises private neighbors, both block styles, inferred contracts, exact rejected evidence and independent behavior; `src/source-transactions.ts` owns writer locks, durable before/after journals and read guards. Extend the operation set only with exact source/config/dependency preconditions, checked candidates, public deltas and recoverable publication. Keep `docs/tooling.md` current. Exercise real process death before and after the commit point, competing writers, reader exclusion, conflicting external edits, links/modes/limits, both native backends and installed JavaScript. Do not describe finite native equivalence or process-kill recovery as proof of arbitrary behavior or power-loss durability.

## Unicode text contracts

Unicode segmentation uses committed 18.0.0 inputs under `native/unicode/18.0.0`, UAX #29 revision 49, and `scripts/generate-graphemes.mjs`. Run `npm run unicode:check` for drift; `npm run unicode:generate` rebuilds the runtime table, version module and full notice. A version update requires a reviewed algorithm change, official input URLs/checksums, exact boundary corpus, public help/reference and deployment notices together. Ordinary application compilation and execution use the bundled table.

## Semantic protocol changes

`src/symbols.ts`, `src/context.ts` and `src/semantic.ts` own graph, context and embedding responses. Keep protocol schemas, CLI/LSP transport, relative locations, budget framing, omissions and coverage documented in `docs/tooling.md`. Physical dependency digests come from `src/semantic-metadata.ts`; checked edits and execution evidence reuse that input model. Verify mutation isolation, unsaved CLI/LSP-equivalent snapshots, inheritance/type consumers, exact minimum budgets, stale metadata, source transaction regressions and installed JavaScript commands. Authored test source is available context; execution and independence must remain separate facts.

`src/module-surfaces.ts` owns internal/outward projections and opted-in public type checks. Keep grammar, reference, editor help, package comparisons and generated API filtering aligned; internal entries must never appear in outward import suggestions. Verify resolved contracts, constructor DI, explicit hidden providers, nested/package boundaries and both backends.

Project comparison changes in `src/project-comparison.ts`, semantic relationships and public projections map to `tooling.md` and `guides/change-a-module.md`. Check `tests/project-comparison.test.mjs`, public review, checked edits, contexts and installed-package coverage. Read-only reports distinguish source changes, contracts, unknown boundaries and unexecuted authored tests.

Pure retry-policy declarations in `src/stdlib/values/retries.aug` map to `guides/use-domain-values.md` and generated `api/values.md`. Check attempt/delay bounds, immutable aliases, record updates, JSON shape/domain errors, worker copies, semantic contracts and installed C/LLVM imports in `tests/retry-policy.test.mjs`. Keep data lookup separate from scheduling, error classification and retry execution; C07 remains partial until those independent contracts are implemented and qualified.


`src/native-archive.ts` authenticates the bounded original archive stream before cached member hashes are trusted. `src/native-artifacts.ts` shares cache writer coordination, extraction and promotion between HTTPS installation and the explicit `aug package cache-native` author command. Compiler-owned manifest pins retain their direct path. Exercise paired library/manifest replacement through installation, doctor, update and release reports; legacy online restoration, missing/changed transports, unsafe paths, size bounds, exact extracted-file bounds, separate aggregate PAX/GNU metadata bounds, header floods, excess padding, special cached manifests and concurrent author metadata. Set `AUG_TEST_PUBLIC_NATIVE_AUTHOR=1` for the installed public zlib repository/archive gate. `scripts/test-local-native-author.mjs` qualifies the installed JavaScript CLI with an explicitly built and header-checked C archive, normal offline source imports and LLVM execution. It requires maintainer Clang/ar and the selected contributor compiler/runtime; it does not qualify a clean consumer toolchain download, broader native starters or hosted artifact production.

The native-author installed gate also exercises the scalar C starter on macOS ARM64. It builds with explicitly selected maintainer Clang/ar, caches its measured archive, runs same-file tests and imports from a neighboring application through installed JavaScript and LLVM with native tools absent from the consumer PATH. Other author targets, hosted producer jobs and default compiler downloads remain separate qualification.


Ownership diagnostic evidence comes from the existing `OwnershipFlow` loans,
capture sites and checked move sites. Keep access predicates, joins and runtime
semantics separate from reporting. `ownershipEvidence` emits deterministic,
bounded related sites; CLI, immutable semantic revisions and LSP share those
facts. Map changes to `diagnostics.md`, `src/help.ts` and the editor changelog.
Exercise conditional aliases, call-input conflicts, outstanding captures and
owned cleanup, moved values, joined loans, isolated worker copies, omitted counts
and unsaved source relocation in `tests/ownership-diagnostics.test.mjs` and
`tests/diagnostic-context.test.mjs`. A bare diagnostic is not independently
revision-bearing; context and checked-edit envelopes provide that identity.

The PostgreSQL maintainer qualification caches each rebuilt candidate with `aug package cache-native` before running its native and LLVM consumer tests. Keep the authenticated archive next to the extracted members in the package harness’s consumer cache. A manually unpacked directory does not authenticate the manifest, and the rebuilt candidate must not fall back to a different published archive. The public artifact gates remain separate.

Compilation-cache tests require a complete source-pinned compiler pack. `scripts/prepare-qualified-test-tools.mjs --local-compiler` verifies the current host’s sealed candidate archive and creates `.aug-build/qualified-test-tools`; build that archive before preparation. CI and the compiler-test container use this explicit local transport with the newly built contributor runtime. Release assembly selects all qualified producer archives before preparing the same path. Without the flag, preparation obtains the source-pinned public archive. Keep the unsealed `.aug-build/llvm-tools` inputs for producing candidate packs. Unsealed contributor tools must continue to compile without reusable output.

The full compiler-test container gate has a 60-minute job limit to cover preparation, the complete regression suite, sanitizers and generated-C analysis. A job time limit is incomplete qualification, even when all completed cases pass; rerun the complete container gate before accepting its evidence.

The published container bases must generate their own specification artifacts. The SQLite deployment fixture copies its August source files, then installs, tests and builds with the image's released CLI. Generated specifications from a newer checkout may use a schema that the released compiler cannot read.

## Pinned maintainer source downloads

`scripts/native-dependencies.lock.json` records exact archives and SHA-256 digests used to build the runtime. GMP and Nettle use the kernel.org GNU mirror. Their versions match the [GMP](https://gmplib.org/) and [Nettle](https://www.lysator.liu.se/~nisse/nettle/) releases; these endpoints supply the same pinned bytes. A mirror change must retain the version and checksum, verify the downloaded archive, and pass cold hosted builds. Consumer LLVM/native artifacts keep their separate release pins.

## Capability dependency plans

Capability scaffolding is implemented in `src/dependency-edits.ts`. The checker retains resolved missing injection types; import suggestions carry definition identities. Map changes to `tooling.md`, DI help and the editor changelog. Check full reverse callers, generic substitutions, class constructor dependencies, same-file test bindings, unsaved source, name conflicts, stale/tampered plans and process recovery through the existing source writer. A valid candidate is required before exposing a preview. Editor actions must not apply these project edits; acceptance uses a fresh saved CLI plan and its revision-checked transaction; never select providers, widen an interface bound or alter business values to make it check.

## Website notices

`buildEnd` calls `scripts/wiki-notices.mjs` before the hosted site or offline archive is published. It preserves original license texts for installed packages in the locked documentation build, records exact source archives and integrity values, and verifies the separately reviewed Inter font subsets. The inventory includes build-only inputs; it is not an embedded-code SBOM. Changed or partially removed notices, mismatched source integrity, changed package versions, and incomplete or changed font inputs fail the build. `notices.json` pins complete original notice filename/hash sets, including the supported Linux build inputs. When an npm package omits its notice, retain a reviewed upstream text and exact source/version correspondence in `docs/third-party-licenses/inputs.json`. Keep original copyright and permission text intact. The reviewed optional LZMA helper is a build-only input without an available standalone notice; the inventory records that gap and the Vite plugin rejects its appearance in emitted JavaScript. An upstream dependency update still requires review of embedded components and applicable source obligations.

## Validate understanding across resolutions

Treat the project, folder, operation and prose views as connected reading interfaces. Use [the resolution guide](guides/understand-a-project.md) for the reader workflow and [the research](research/understanding-at-every-resolution.md) for its evidence and limits. The welcome code, explanation and diagrams must come from the same checked example; performance evidence remains a separate measured program.

`src/spec-reading.ts` shares source-linked prose facts with diagrams and independently checks authored statement coverage. `src/spec-dataflow.ts` retains contributing callers and source sites beneath grouped contracts. When changing these modules, run the spec, diagram, homepage, gallery and navigation regressions. Include repeated events, disconnected methods grouped into one folder, nested input calls, early exits, cleanup, deferred work and native/interface boundaries. A passing planner ledger cannot establish extraction completeness by itself.

Review the rendered greeting and login examples at desktop and phone widths. Confirm that startup, exports, inputs, results, failures and state changes can be found without opening source. Check every contributing caller link and the next resolution. Detailed sequence text must wrap without silently removing an argument or condition. Large views must keep complete facts accessible beneath their summaries.

For human or coding-agent evaluation, give readers an unfamiliar program and ask them to predict outputs, validation order, failure and cleanup paths, and the site of a requested change. Score answers against independently authored expectations and executed cases. Record source openings, elapsed time and wrong answers. Compare the generated views with a source-only baseline using the same tasks and budgets. Syntax validity, attractive diagrams and reduced word counts are separate checks; they do not establish comprehension or productivity.

Each documentation deployment compares its built source revision with current main immediately before publishing and skips publication if they differ. Manual deployments use the same revision check.

Highlighted code backlinks use HTML page routes with their original paragraph fragments. Compiler navigation metadata retains Markdown paths for non-wiki readers. Check cross-page navigation in the built site as well as same-page anchors.
