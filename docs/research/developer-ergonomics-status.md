# Ergonomics implementation tracker

The [80-item design catalog](developer-ergonomics.md) is the accepted scope. This tracker records implementation and concrete verification; pending entries are not shipped behavior. Base revision: f3a622253b9c5ac2dd232b2921f9ba94400a5ca2.

Work proceeds through source/tool identities, everyday data and syntax, collection/function contracts, packages and native authorship, then execution/editor/spec workflows. Existing conformance, runtime, package, installed distribution, and documentation gates remain required. The C reference backend remains a comparison gate for supported constructs.

| ID | Recommendation | Status | Implementation and evidence |
| --- | --- | --- | --- |
| A01 | Start with a function | Implemented; installed editor gate pending | src/project-init.ts; function starter and same-file test; ecosystem/editor fixtures |
| A02 | Complete labeled calls using locals | Implemented; broader value ranking pending | src/editor.ts; compatible same-name shorthand and omitted defaults; editor-polish tests |
| A03 | Interpolate strings | Implemented scalar profile | Parser/checker, C and LLVM lowering, invariant scalar runtime conversion; both-backend and invalid-text tests; explicit formatting options pending |
| A04 | Read collections with indexing | Implemented | List checked reads, Map optional lookup, constant Tuple indexing; both-backend and formatting tests |
| A05 | Record copy with changed fields | Implemented | Immutable record copies evaluate replacements once and rerun the constructor validation; both-backend tests |
| A06 | Pure parameter defaults | Implemented literal-data profile | Typed literal/fresh collection defaults, explicit-null distinction, interface equality, hover/spec facts; both-backend tests |
| A07 | Ranges as an ordinary library | Implemented bounded allocation profile; qualification ongoing | august.collections.range uses ordinary checked source, exclusive list construction, half-open ascending/descending ranges, checked limits and overflow-safe stopping; both-backend edge tests |
| A08 | Basic loop control | Implemented; qualification ongoing | Cleanup-aware nearest-loop break/continue; task-join, borrow/lock exit, checked cleanup failure and ownership reentry tests on both backends |
| A09 | Remainder and checked arithmetic helpers | Partial | Signed remainder plus ordinary checked int64 helpers pass independent BigInt boundary grids on both backends. Exact Decimal records, parsing, formatting, scale changes and arithmetic reject hidden loss/overflow; explicit rounded and wider decimal profiles pending |
| A10 | Expression forms for decisions | Pending | — |
| A11 | One formatter preference per project | Implemented source/editor profile; installed editor gate pending | Explicit starter preferences and shared checked formatter; all completion templates adapt bindings/block style/tabs; declaration fixes format their candidate; source rename preserves surrounding layout. Eight-preference matrix checks starter tests, templates and fixes |
| A12 | Small reusable functions and closures | Pending | — |
| B01 | Immutable collection types in records | Implemented; broader qualification pending | Deep immutable collection qualifier and record contracts; alias/mutation rejection and both-backend tests |
| B02 | Collection comprehensions | Pending | — |
| B03 | Consistent collection operations | Pending | — |
| B04 | Record and tuple patterns | Pending | — |
| B05 | Finite named alternatives | Pending | — |
| B06 | A null fallback expression | Implemented | Lazy null-only otherwise; falsy-value and single-evaluation tests on C and LLVM |
| B07 | Short error declarations | Implemented | Contextual short Error declarations; checked error propagation and formatting tests |
| B08 | Error conversion and context | Pending | — |
| B09 | Text operations with clear units | Partial | endsWith, replace, List<string>.join, codePointLength and strict numeric parsing pass both backends. Grapheme operations pending |
| B10 | Domain value libraries | Partial | Exact bounded Decimal record and numerical comparison implemented in august.math; dates, durations, URLs, identifiers, paths and bounded text pending |
| C01 | Explain ownership through the actual value | Implemented editor explanation; qualification ongoing | Program-point alias/origin, borrow, task-capture and move snapshots with source links; editor-polish regressions |
| C02 | Infer mechanically required owned locals | Implemented; broader qualification pending | New locals inherit only checked own call results. Both backends verify one cleanup per result and reject owned alias copies; hints/spec retain provenance |
| C03 | Offer the smallest legal borrow | Implemented supported-statement profile | Borrow edit checked against whole candidate project, with alias/task/frozen restrictions and formatter preferences; editor-polish tests |
| C04 | Explain injected dependencies at the call | Implemented; qualification ongoing | Checked call-plan providers/lifetimes and header forwarding; missing/ambiguous dependencies remain explicit; hover regressions |
| C05 | Scaffold a capability at the right seam | Pending | — |
| C06 | Reuse explicit compositions | Pending | — |
| C07 | Structured scope and timeout libraries | Pending | — |
| C08 | Bounded worker collection processing | Pending | — |
| D01 | Derive a useful package alias | Implemented | Derived Git/npm/local aliases and collision rollback; offline actual consumer test |
| D02 | Turn a long URL import into an alias | Pending | — |
| D03 | Discover libraries by task | Pending | — |
| D04 | Show why a dependency exists | Implemented initial report; qualification ongoing | Read-only aug dependencies lists installed identities, imports, transitive aliases, source revisions and locked native selections |
| D05 | Preview dependency updates | Pending | — |
| D06 | Pin the project's compiler choice | Implemented explicit selection; qualification ongoing | main.yaml compiler exact version; CLI/editor mismatches diagnosed before installation; automatic compiler switching intentionally absent |
| D07 | Make authoring a checked local path | Implemented static readiness; qualification ongoing | aug package check checks production/tests, exports, Javadoc, compiler requirement, license and native metadata; clearly reports behavioral/artifact qualification as not run |
| D08 | Compare package public interfaces | Partial | Checked local aug package diff follows export boundaries and returns both contracts; resolved type identities and remote release selection still pending |
| D09 | Local multi-package workspaces | Pending | — |
| D10 | Deliberate vendoring and air-gapped export | Pending | — |
| D11 | Explain and manage caches | Pending | — |
| D12 | Maintain ordinary repository publishing | Pending | — |
| E01 | Give native packages a pleasant August interface | Pending | — |
| E02 | Standardize library naming | Pending | — |
| E03 | Typed SQLite/PostgreSQL rows | Pending | — |
| E04 | A SQL-checking package tool | Pending | — |
| E05 | Native package scaffolding | Pending | — |
| E06 | Expand binding checks without guessing contracts | Pending | — |
| E07 | Repeatable C++ adapters | Pending | — |
| E08 | Repeatable Rust adapters | Pending | — |
| E09 | Typed Python integration through a subprocess | Pending | — |
| E10 | Typed JavaScript/TypeScript integration | Pending | — |
| E11 | Generate HTTP clients from OpenAPI | Pending | — |
| E12 | Build distributable bundles | Implemented host deployment profile; qualification ongoing | aug bundle publishes verified LLVM executable/lib/share closure with target, source and native identities; read-only verify rejects corruption, extra files, links and traversal. Real JSON/GnuTLS relocation and failure-cleanup tests; runtime TLS paths explicitly unsupported |
| F01 | A read-only setup report with actionable fixes | Pending | — |
| F02 | Show run phases clearly | Implemented CLI/LLVM phases; qualification ongoing | Terminal or --progress events on stderr, elapsed phases and failed stage; both-backend output/error regressions |
| F03 | Watch and rerun | Pending | — |
| F04 | Incremental native builds | Pending | — |
| F05 | Fast selected test execution | Pending | — |
| F06 | Return useful errors near the source | Pending | — |
| F07 | Make fixes explain their behavior | Partial | Fix consequences in preview metadata, versioned LSP changes, conservative checked borrow. Recovery scaffolds retain the checked failure until the author chooses policy; broader fix qualification pending |
| F08 | References and semantic rename | Partial | Compiler-resolved references, imports/exports, public labels, reverse callers and candidate-checked managed-function rename; semantic-reference and LSP tests. Member/type profiles pending |
| F09 | Move declarations and update imports | Pending | — |
| F10 | Completion that teaches the correct operation | Partial | Compatible shorthand, optional/default omission, moved-value and readonly-method filtering; remaining expected-type/catch/borrow ranking pending |
| F11 | Hints with controllable detail | Implemented protocol/UI; installed gate pending | Compact/full hints, complete tooltips and per-file expansion command; semantic and LSP regressions |
| F12 | Quick experiments without a full project | Pending | — |
| G01 | Assertions that show both values | Implemented bounded value profile | assertEqual retains equality, input order and sticky failures; bounded UTF-8, record privacy, tuple and identity output; both-backend tests. Dedicated field-path diffs pending |
| G02 | More useful generated typed test rows | Pending | — |
| G03 | Bounded property checks and replay | Pending | — |
| G04 | Golden and HTTP contract tests | Pending | — |
| G05 | Better debugger values | Pending | — |
| G06 | Performance tests in ordinary projects | Pending | — |
| G07 | Native-resource lifecycle tests | Pending | — |
| H01 | A short prose default with expandable detail | Implemented; qualification ongoing | Implemented functions show behavior first and retain full checked signatures/defaults/errors/effects in expandable detail; interface promises remain visible |
| H02 | Navigate between prose and source | Implemented adjacent-source profile; qualification ongoing | Paragraph source ledgers generate exact line-range links, source digests include managed pointers, and wiki navigation reaches the code view. Statement-level anchors in formatted wiki views remain pending |
| H03 | Review the effective public change | Pending | — |
| H04 | Prioritize complete required context | Implemented initial packet; qualification ongoing | Schema 2 root implementation/contracts before optional imports, resolved identities, revision/digests, reverse callers, explicit boundaries and budget omissions; --require-complete gate and context/native regressions |
| H05 | Revision-checked mechanical edits | Partial | Read-only rename plan carries compiler/source/configuration revisions, edit scope and public deltas. Durable source transactions and additional operations pending |
| H06 | Small checked examples for unfamiliar agents | Implemented initial catalog; qualification ongoing | Independent source-unit idioms with compiler identity/digest and both-backend output regressions; focused binding/comparison diagnostics |
| H07 | Keep independent acceptance evidence | Pending | — |

## Verification boundary

The language cases run through the public CLI against both LLVM and the C reference. The candidate runtime is rebuilt from canonical sources because its private operation identifiers differ from the published 0.23.0 pack. These changes remain unreleased. No public native artifact, npm package, or Marketplace update has been published by this work.

The 48-test language/package/inference/design run passed before the subsequent record-copy and semantic-query additions. Those additions have passed targeted tests and type checking. The expanded 204-test regression run passed 202 cases; its two failures were repaired and passed targeted reruns (HTTP contract metadata and optional-input prose). C/runtime ASan and UBSan passed five pressure cases, including interpolation, replacement, joining, parsing and remainder. LLVM ASan remains unqualified on this Mac because the installed Apple runtimes do not export LLVM 23’s version-check symbol. Generated documentation drift and site checks passed, as did installed CLI/source-library package checks using the C backend. Installed default-LLVM/VSIX and broader qualification remain outstanding. A passing mechanical rename check is compiler evidence; its plan explicitly reports that independent behavioral checks have not run.


## Checkpoint review

Commit 157f3b2 passed 508 of 509 full-suite cases (one cold-download qualification skipped), 25 independent conformance examples in 55 checks, and six C/runtime sanitizer pressure cases. The Standards review identified four contract/UI issues; the Spec review identified two P1 correctness issues. Repairs add binding-preserving rename collision checks, reachable loop-exit freshness, lexical grant unwinding, ordinary-module restrictions, same-file candidate checking for borrow fixes, and precise editor-plan wording. Targeted repairs passed before the subsequent ownership/package additions. Qualification must be rerun for the final candidate.

Checkpoint 2583495 passed the installed C package gates and documentation checks. The full suite passed 522 cases with one obsolete hover-wording assertion, repaired in the 81-case targeted rerun, and one cold-download skip. Review repairs include effective capability context, inferred ownership idiom selection, and inherited public package contracts. Equality assertions and those repairs passed both native backends; final qualification remains outstanding.


The next checkpoint ran 554 full-suite cases: 552 passed, one cold-download case skipped, and the new documentation range example failed because it omitted its error import. That example was repaired; the 13-case documentation/bundle/package rerun passed, followed by 572 generated-file drift checks, the site build and installed C package gates. Independent Standards review found three documentation omissions, all repaired; Spec review found cold native failures attributed to source resolution, repaired with an installer phase callback and rollback regression. The range API was visually checked at desktop and 390-pixel widths. These results do not qualify cold default-LLVM installation or the installed editor for this unreleased compiler.

The math checkpoint passed eight independent native tests on C and LLVM: 196 integer boundary pairs per operation, 900 decimal comparison pairs, fixed-scale formatting, invalid parsing, exact division/rescaling and intermediate limits. The 18-case documentation/package-compatibility run passed, followed by generated-document drift, the site build and installed C package consumers. Spec review found no concrete defect; Standards review found missing math navigation and a stale root stdlib export spec. Both were repaired in the generator/navigation sources. The API was inspected at desktop and phone widths. These checks do not qualify a clean default-LLVM installation for this unreleased runtime.

The spec checkpoint passed 41 focused tests after repairing a homepage assertion for the wiki code link. The full suite ran 569 cases: 567 passed, that assertion failed and was repaired, and one cold-download case skipped. Generated-document drift (581 files), the site build and installed C package gates passed. Independent Standards and Spec reviews found and verified repairs for optional defaults, wiki disclosure rendering and source boundaries. The desktop interface disclosure and phone layout were inspected. Clean default-LLVM and installed editor qualification remain outstanding.

The source-preference checkpoint passed 28 focused editor/ecosystem/package tests and four executable documentation tests with the matching candidate runtime. Review found a class-state initializer that ignored assignment preferences; its repair passed the final 27-case preference/tooling/editor run. Type checking, 581 generated-file drift checks, the site build and installed C package tests passed. Standards review repaired the editor changelog and clarified formatter verification; Spec review independently verified all eight style combinations. Installed VS Code and clean default-LLVM qualification remain pending.
