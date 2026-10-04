# Developer ergonomics before August 1.0

Design discussion, 4 October 2026. These are recommendations and experiments, not the shipping language reference. All new syntax and commands below are proposals. The companion [research note](developer-ergonomics-sources.md) cites the language manuals and usability studies behind the comparisons.

August should let a developer read an unfamiliar file, change its behavior, and verify the change with few facts held in memory. The same property should help a coding agent with a limited context window. Pseudocode-like source, a human-readable compiled spec, and native execution work together toward that goal. They need a usable package system, useful libraries, responsive tools, and diagnostics that explain the next step.

“Best language for developers” is a design ambition. It needs comparisons on real tasks before it becomes a claim. This proposal measures understanding, correct changes, setup, recovery, and maintenance as well as typing and execution speed.

## What the current implementation already provides

The review uses the `codex/developer-distribution` candidate based on `f3a622253b9c5ac2dd232b2921f9ba94400a5ca2`. The published compiler is 0.23.0; some distribution and compatibility changes in this candidate remain unreleased.

| Area | Verified behavior and source |
| --- | --- |
| Readable source | Bare function headers, `and`/`or`/`not`, optional semicolons, braces or indentation, `=` or `to`, and labeled calls with same-name shorthand. [Reference](../reference.md), [parser](../../src/parser.ts). |
| Inference | Executable bodies infer results, errors, effects, and observable changes. Permission choices still appear in source. Bodyless interfaces declare contracts. [Checker](../../src/checker.ts), [effects](../../src/effects.ts), [editor hints](../../src/semantic.ts). |
| Data | Immutable records, tuples, collections, nullable values, narrowing, and `match`. Records currently cannot contain mutable collections. [Reference](../reference.md#classes-records-and-local-state), [built-ins](../../src/builtins.ts), [checker](../../src/checker.ts). |
| Composition and state | Explicit bindings, injected header inputs, scoped lifetimes, ownership, exclusive mutable borrows, and locks. [Ownership analysis](../../src/ownership.ts), [reference](../reference.md#dependency-injection-and-lifetimes). |
| Packages | Public repository URLs or aliases, source folders with `export.aug`, optional metadata, exact commit locks, npm archives, local dependencies, and automatic preparation by `aug run`. [Guide](../packages.md), [package manager](../../src/package-manager.ts). |
| Native libraries | Real LibTorch, SQLite, zlib, and Rust BLAKE3 packages use prebuilt native artifacts and a descriptor-checked C ABI. Consumers on qualified hosts need no native compiler or SDK. [Native guide](../native-packages.md), [binding checker](../../src/native-bindings.ts), [artifact installer](../../src/native-artifacts.ts). |
| Tasks | Cooperative tasks and isolated multicore workers, scopes, joins, cancellation, copied worker data, and worker-local native handles. [Workers](../workers.md), [AST](../../src/ast.ts). |
| Tests and editor | Same-file tests, typed rows, endpoint tests, coverage, auto-import completion, quick fixes, hover, definitions, formatting, and inferred hints. [Testing](../testing.md), [LSP](../../src/lsp.ts), [fixes](../../src/fixes.ts). |
| Specs and context | Deterministic adjacent specs, dependency links, effective contracts, semantic document revisions, and budgeted context. [Spec generator](../../src/spec.ts), [semantic queries](../../src/semantic.ts). |

The inspected AST has no anonymous functions, general function values, indexing expression, string interpolation, or enum declaration. The parameter parser has no general default-value expression. The LSP currently advertises definitions and quick fixes, but no rename or reference provider. The CLI command list has no watch or workspace command. These are candidate additions, rather than already available features.

The current context query follows imports and forward calls and reports truncation; it is not a complete reverse-caller graph or checked source-edit transaction. The AUG-0001 proposal in the earlier design discussion remains separate from these existing semantic queries. A shorter context report does not establish that a requested behavior is correct.

## The first improvement is a smaller first program

The hello starter currently creates a single-method interface, an implementation, a DI binding, and a resolve. That is useful for teaching substitution, but the greeting itself needs only a function. [Starter source](../../src/project-init.ts).

This smaller project uses current syntax. Save the entry in `main.aug`:

```text
import greet from greeting

print(value=greet(name="August"))
```

Keep the declaration and its test in `greeting.aug`:

```text
greet(string name):
    return "Hello, " + name + "!"

test greet:
    when greetings:
        it "greets a person":
            assert(greet(name="August") == "Hello, August!")
```

The developer can learn imports, labeled calls, inferred results, and a test in one small program. A later lesson can introduce a console capability and adapters when output needs substitution. A service starter can introduce composition when it has a real dependency graph. Classes still follow August's existing interface requirement; functions and records already avoid a marker interface for ordinary calculations and data.

## The idea catalog

**Now** means an improvement built around existing semantics, worth doing before stable. **Settle** means a useful language or library contract to prototype and either accept or explicitly defer before the freeze. **Explore** means a larger experiment that should earn its cost through task results. These labels are recommendations, not additional 1.0 gates.

### Everyday syntax — 12 ideas

| ID | Idea | Recommendation and limit |
| --- | --- | --- |
| A01 | Start with a function | **Now.** Replace the default greeting's interface/DI ceremony with the current-syntax project above; retain a separate composition lesson. |
| A02 | Complete labeled calls using locals | **Now.** Rank matching names and compatible types first; insert shorthand when the name actually matches. Never guess a business value. |
| A03 | Interpolate strings | **Settle.** Give text construction a checked interpolation form. Use invariant formatting and explicit formatting options; escape HTML and SQL through their own typed interfaces. |
| A04 | Read collections with indexing | **Settle.** Define `items[index]` as the same checked operation as List.get, and map indexing as optional lookup. Specify each type separately. |
| A05 | Record copy with changed fields | **Settle.** Copy a record with selected fields replaced. Preserve type identity, rerun validation, and evaluate inputs once. |
| A06 | Pure parameter defaults | **Settle.** Allow small typed defaults for omitted inputs. Keep explicit null distinct from choosing a default; expose defaults in effective contracts. |
| A07 | Ranges as an ordinary library | **Settle.** Supply explicit half-open ranges and steps through imports, with finite iteration and checked invalid steps; avoid implicit inclusive bounds. |
| A08 | Basic loop control | **Settle.** Add break and continue with precisely tested owned cleanup, borrow exits, and scope joins. Avoid labeled jumps initially. |
| A09 | Remainder and checked arithmetic helpers | **Settle.** Fill routine numeric gaps; define negative operands, zero divisors, overflow, and financial decimal operations explicitly. Preserve current wrapping arithmetic. |
| A10 | Expression forms for decisions | **Explore.** Let an exhaustive match produce a value; compare readability with today's early returns before adding general conditional expressions. |
| A11 | One formatter preference per project | **Now.** Honor existing block and assignment settings across fixes, snippets, generated starter files, and refactorings; preserve semantics and comments. |
| A12 | Small reusable functions and closures | **Explore.** Start with function references and pure closures. Define captured loans, escaping lifetimes, labels, effects, and task restrictions before mutable captures. |

### Data, text, and failures — 10 ideas

| ID | Idea | Recommendation and limit |
| --- | --- | --- |
| B01 | Immutable collection types in records | **Settle.** Give public contracts an expressible immutable collection type. Permit those types in records after proving deep immutability and alias handling. |
| B02 | Collection comprehensions | **Explore.** Test a readable select/filter expression against ordinary loops. Give it existing snapshot iteration rules and visible result allocation. |
| B03 | Consistent collection operations | **Settle.** Add sort, filter, transform, aggregate, remove, and search through a small coherent vocabulary. State order, mutation, allocation, and empty-input behavior. |
| B04 | Record and tuple patterns | **Explore.** Destructure named record fields and nested data with checked completeness; keep bindings and existing-name conflicts explicit. |
| B05 | Finite named alternatives | **Settle.** Provide enums or tagged immutable variants with exhaustive match. Select one design, with checked payloads and stable serialization rules. |
| B06 | A null fallback expression | **Settle.** Prototype a readable lazy fallback such as `name otherwise "Guest"`. It applies only to null and never handles errors or falsy values. |
| B07 | Short error declarations | **Settle.** Consider `error InvalidQuantity(int value)` as shorthand for an Error implementation; preserve ordinary error identity and fields. |
| B08 | Error conversion and context | **Settle.** Support deliberate error wrapping with a cause and useful location. Require callers to choose the mapping; avoid automatic broad Error widening. |
| B09 | Text operations with clear units | **Settle.** Add endsWith, replace, join, parsing, and explicit byte/code-point/grapheme measurements. Avoid treating Unicode character count as byte count. |
| B10 | Domain value libraries | **Settle.** Supply dates, durations, URLs, identifiers, decimals, paths, and bounded text as validated values, with stable formatting and checked parsing. |

### Ownership, effects, and composition — 8 ideas

| ID | Idea | Recommendation and limit |
| --- | --- | --- |
| C01 | Explain ownership through the actual value | **Now.** Show the owner, aliases, active task capture, and operation causing a rejected borrow or move, with source links. |
| C02 | Infer mechanically required owned locals | **Explore.** Infer own only when a checked result contract requires exclusive ownership. Display the lifetime and preserve move checking; do not guess transfer intent. |
| C03 | Offer the smallest legal borrow | **Now.** Propose a bounded borrow around required statements only when alias and task analysis establishes validity. Show the edit before applying it. |
| C04 | Explain injected dependencies at the call | **Now.** Hover lists which provider supplies each resolve input and its lifetime; show ambiguity as an error rather than picking a provider. |
| C05 | Scaffold a capability at the right seam | **Now.** A reviewed fix can add a header dependency and required callers. Complete caller coverage and public-delta checks must precede project edits. |
| C06 | Reuse explicit compositions | **Now.** Improve completion, dependency diagrams, and test substitution for existing composition/include; add no automatic scanning or registration. |
| C07 | Structured scope and timeout libraries | **Settle.** Build bounded retries, deadlines, and resource sessions from scopes and capabilities. Make retry policy, idempotency, and cleanup observable. |
| C08 | Bounded worker collection processing | **Settle.** Supply an ordinary package operation that schedules chunks with explicit concurrency limits. Preserve copied data, isolated heaps, cancellation, and ordered results. |

### Packages and publishing — 12 ideas

| ID | Idea | Recommendation and limit |
| --- | --- | --- |
| D01 | Derive a useful package alias | **Now.** Let add suggest the manifest's name or repository name; require disambiguation on conflicts and preserve full source identity in the lock. |
| D02 | Turn a long URL import into an alias | **Now.** Offer one checked editor action to update imports and main.yaml while preserving the selected revision. Direct URL imports remain ordinary source. |
| D03 | Discover libraries by task | **Now.** Publish a searchable curated catalog with import examples, supported hosts, licenses, ownership, and tests. Installation still resolves to the actual repository. |
| D04 | Show why a dependency exists | **Now.** Add a source/native dependency tree with the importing declaration, locked revision, artifact selection, and transitive requirement. |
| D05 | Preview dependency updates | **Now.** Report proposed commits, effective public-interface changes, native target changes, and download sizes before updating an accepted lock. |
| D06 | Pin the project's compiler choice | **Settle.** Define one explicit project toolchain selection and show CLI/editor mismatches. Automatic selection must honor offline and integrity rules. |
| D07 | Make authoring a checked local path | **Now.** Offer package readiness checking for exports, docs, tests, compiler requirements, license, and artifacts; produce a concrete publishing checklist. |
| D08 | Compare package public interfaces | **Now.** Report added required labels, changed errors/effects, defaults, ownership, exports, and native requirements against the previous release. |
| D09 | Local multi-package workspaces | **Settle.** Define application/library members and local replacements in existing metadata; keep each member's export and alias scope. |
| D10 | Deliberate vendoring and air-gapped export | **Explore.** Export a verified source/artifact closure with notices and recorded target packs. Do not make an arbitrary copied cache a trusted package. |
| D11 | Explain and manage caches | **Now.** Show cache size, selected identities, offline readiness, and safe pruning; active accepted revisions remain protected. |
| D12 | Maintain ordinary repository publishing | **Now.** Generate release metadata and CI templates that validate a tag and artifacts. Keep publishing authorization and credentials explicit. |

### Libraries and other languages — 12 ideas

| ID | Idea | Recommendation and limit |
| --- | --- | --- |
| E01 | Give native packages a pleasant August interface | **Now.** Export task-focused safe functions instead of requiring consumers to understand pointers or ABI descriptors. Link to contracts for maintainers. |
| E02 | Standardize library naming | **Now.** Define consistent labels, optional lookup versus required lookup, input units, collection behavior, and checked error categories. |
| E03 | Typed SQLite/PostgreSQL rows | **Settle.** Decode parameterized query results into records, with explicit nullability and checked shape failures. Keep transactions and writes visible. |
| E04 | A SQL-checking package tool | **Explore.** Validate queries against a supplied schema snapshot and generate typed inputs/results. Database access remains a capability; migration and schema staleness are explicit. |
| E05 | Native package scaffolding | **Now.** Generate repository layouts, descriptor/header templates, ownership-review prompts, tests, release jobs, and supported-target metadata. |
| E06 | Expand binding checks without guessing contracts | **Settle.** Extract declarations and ABI facts mechanically; make authors select ownership, allocator pairing, retention, effects, and worker safety. |
| E07 | Repeatable C++ adapters | **Settle.** Generate wrappers for a bounded profile of selected functions/classes. Catch exceptions and keep templates and C++ runtime requirements in maintainer artifacts. |
| E08 | Repeatable Rust adapters | **Settle.** Generate or scaffold C-compatible exports, owned handles, panic containment, and tests. Ordinary Rust layout is not a public ABI contract. |
| E09 | Typed Python integration through a subprocess | **Explore.** Own the process in an August scope; validate schema messages, errors, cancellation, and limits. Measure serialization costs and require a Python runtime. |
| E10 | Typed JavaScript/TypeScript integration | **Explore.** Use a similar process protocol with explicit runtime/version requirements. Exchange data, not managed August references. |
| E11 | Generate HTTP clients from OpenAPI | **Settle.** Produce ordinary August packages with typed records, explicit transport capabilities, authentication inputs, and checked errors. |
| E12 | Build distributable bundles | **Now.** Provide a command that assembles the existing executable/lib/share layout, runtime dependencies, notices, target identity, and deployment checks. |

### CLI and editor — 12 ideas

| ID | Idea | Recommendation and limit |
| --- | --- | --- |
| F01 | A read-only setup report with actionable fixes | **Now.** Build on candidate aug doctor; identify the failing requirement and exact safe next step. Never execute downloaded repair scripts. |
| F02 | Show run phases clearly | **Now.** Report source resolution, artifacts, checking, linking, and execution with meaningful progress and the original failure. |
| F03 | Watch and rerun | **Now.** Add a development watch workflow that restarts after a checked build; cancel the old scope and wait for cleanup before replacing it. |
| F04 | Incremental native builds | **Explore.** Cache typed modules/objects by source and effective interface identities; validate invalidation through ownership, generic, interceptor, and native dependencies. |
| F05 | Fast selected test execution | **Now.** Reuse unchanged test compilation where valid; keep current fresh-process isolation and complete dependency fingerprints. |
| F06 | Return useful errors near the source | **Now.** Show expected and actual types/labels, related declarations, a small excerpt, and one reliable repair rather than cascaded guesses. |
| F07 | Make fixes explain their behavior | **Now.** Describe what a catch, borrow, dependency, or export edit changes. Recovery templates remain incomplete until the author supplies a policy. |
| F08 | References and semantic rename | **Now.** Add resolved occurrences for symbols and labels, shadowing tests, collision checks, revision checks, and atomic workspace edits. |
| F09 | Move declarations and update imports | **Explore.** Keep export boundaries, tests, comments, source/spec links, and checked interfaces correct after a reviewed move. |
| F10 | Completion that teaches the correct operation | **Now.** Rank compatible methods, label shorthand, named error catches, legal borrows, and exported imports; hide private or unusable declarations. |
| F11 | Hints with controllable detail | **Now.** Default to compact effective-contract hints; expand on hover or a focus command. Make inferred facts and written promises distinguishable. |
| F12 | Quick experiments without a full project | **Explore.** Add a playground or scratch-file frontend that synthesizes a normal main module. Keep ordinary module rules and isolate downloaded code from execution. |

### Tests and debugging — 7 ideas

| ID | Idea | Recommendation and limit |
| --- | --- | --- |
| G01 | Assertions that show both values | **Now.** Report expected/actual values and structured differences; preserve one-time expression evaluation and record privacy. |
| G02 | More useful generated typed test rows | **Now.** Complete representative boundary rows from types and author-selected cases; never derive expected business answers from the implementation. |
| G03 | Bounded property checks and replay | **Explore.** Record a generator, finite domain/seed, limits, discarded inputs, and ordinary regression rows. Invalid or empty domains fail explicitly. |
| G04 | Golden and HTTP contract tests | **Settle.** Compare stable text/JSON responses with reviewed snapshots. Require an explicit snapshot update and redact secrets. |
| G05 | Better debugger values | **Now.** Render August records, collections, errors, ownership state, and workers from supported runtime metadata; expose optimized-value limits. |
| G06 | Performance tests in ordinary projects | **Settle.** Extend existing aug bench with same-file cases, allocation measurements, and recorded baselines. Report variance; avoid noisy automatic pass/fail thresholds. |
| G07 | Native-resource lifecycle tests | **Now.** Give maintainers a reusable harness for cleanup, failing construction, cancellation, relocation, worker restrictions, and sanitizer runs. |

### Compiled specs and coding agents — 7 ideas

| ID | Idea | Recommendation and limit |
| --- | --- | --- |
| H01 | A short prose default with expandable detail | **Now.** Keep adjacent specs readable as sentences about behavior. Put comprehensive signatures and dependency contracts behind links or explicit detail views. |
| H02 | Navigate between prose and source | **Now.** Link each behavioral paragraph to its actual declaration/statements and back, with source revision freshness. |
| H03 | Review the effective public change | **Now.** Show changed labels, errors, effects, ownership, native requirements, and spec paragraphs in the same review. |
| H04 | Prioritize complete required context | **Now.** Deliver the edited declaration and effective interface before optional prose. Enumerate omissions and unresolved dispatch separately from project checking. |
| H05 | Revision-checked mechanical edits | **Explore.** Implement the scoped change protocol independently of code generation. Reject stale sources, incomplete callers, collisions, or unexpected public widening before writing. |
| H06 | Small checked examples for unfamiliar agents | **Now.** Select versioned idioms for the requested construct and explain rejected candidate code with matching diagnostics; keep examples distinct from project declarations. |
| H07 | Keep independent acceptance evidence | **Now.** Present author requirements, selected tests, and concrete results with the source/spec review. A generated spec describes the implementation and supplies no independent oracle. |

## Candidate syntax worth testing

These fragments contain **proposed** syntax. Their spelling is provisional. Each experiment should compare a complete program with an idiomatic current-August implementation and measure whether readers can predict its behavior.

String construction and pure defaults could make a small function read directly:

```text
greet(string name = "August"):
    return $"Hello, {name}!"
```

Interpolation must define conversion, escaping, and invariant formatting. Plain strings containing braces must retain an unambiguous literal form. HTML markup already has typed escaping; interpolation should not become an unescaped markup or SQL mechanism.

A record update could state precisely which field changes:

```text
paidInvoice = invoice with (paid=true)
```

The result is a new value. Validation runs for the completed value and may raise checked errors. A shared immutable field may remain shared; mutable aliases must not enter an immutable record.

An immutable collection contract could make realistic data models possible:

```text
record Invoice(string number, immutable List<LineItem> items)
```

August already has freeze and read-only views. This experiment needs a public type contract that distinguishes a deeply immutable value from a temporary read-only loan. It must not silently copy a caller's whole collection or claim immutability while another alias can mutate it.

A null fallback should handle one familiar case:

```text
displayName = name otherwise "Guest"
```

Only a null left operand evaluates the fallback. False, zero, empty text, and checked failures retain their meaning. The result type must be determined by both operands.

A comprehension could keep selection and projection together:

```text
names = [user.name for user in users if user.active]
```

Compare that with a straightforward loop and with pure collection functions before choosing the feature. Initial semantics should preserve snapshot iteration and read-only access. Explicitly show that producing the result allocates a collection.

Anonymous functions could instead support a reusable collection interface:

```text
names = users.filter(where=(user) => user.active)
             .transform(value=(user) => user.name)
```

The fragment also proposes multiline chaining rules; the existing parser does not accept this as a continuation. Closures require a deeper implementation than comprehensions: function types, captured loans, escaping lifetimes, effects, checked errors, and worker eligibility. Build the smallest useful profile before general mutable captures. Select one everyday transformation style first to keep the language coherent.

## A cohesive first pass

Start with the improvements that remove friction in existing programs. Keep stable release gates intact; the whole catalog should not become a prerequisite for shipping 1.0.

1. Simplify the hello starter and teaching sequence. Check the small program, its same-file test, and its generated spec with the published compiler.
2. Make a read-only ergonomics audit from real applications: weather, SQLite/PostgreSQL ingestion, LibTorch, a worker calculation, and a multi-package library. Record every avoidable annotation, manual edit, failed call, and confusing error.
3. Improve labeled completion, recovery diagnostics, ownership explanations, setup reports, and visibility of inferred contracts. Validate unsaved source in the actual editor host.
4. Add resolved references/rename before project-wide dependency fixes. Build on semantic identities and revisions; explicitly block unresolved dispatch and unsupported edges.
5. Streamline package aliases, dependency explanations, author readiness, interface diffs, and deployment bundles around the existing repository/lock/artifact model.
6. Add watch and safe compilation reuse. Preserve native process isolation, cancellation cleanup, and dependency invalidation.
7. Prototype a small data-language batch: deeply immutable collections in records, record updates, string interpolation, pure defaults, and finite variants. Treat these as five separately testable contracts; accept the ones that improve complete tasks.
8. Add baseline collection/text operations and native-author scaffolding. Keep ownership decisions reviewed and foreign implementations behind typed safe interfaces.
9. Improve source/spec review, complete mandatory context, value-diff assertions, and task-based qualification. Update the book, reference, help, executable examples, and native packages together for every accepted contract change.
10. Freeze the accepted interfaces and repeat the existing conformance, runtime, package, distribution, and documentation release gates on all supported targets. Publish deferred experiments explicitly.

Do not change public labels, error recovery, dependency providers, worker isolation, or native pointer retention through formatting or a completion guess. Those are meaningful program decisions. Retain the user's existing word boolean operators, body inference, ordinary repository imports, narrow exports, explicit unsafe adapters, and separate GPU package model.

## How to decide whether an idea helped

Use paired tasks with fixed requirements and independent acceptance cases. Ask both experienced developers and developers new to August to read, implement, and debug them. Evaluate coding agents separately with equal budgets, feedback, and checked syntax examples. Use ordinary idiomatic TypeScript, Go, or Rust comparisons where the task fits; do not force competing languages into August's architecture.

| Task | Evidence to collect |
| --- | --- |
| Install and greet | Time to first correct run on an empty machine/profile; prerequisites; unexpected files; concepts needed. |
| Weather endpoint | Correct response, bad-input handling, editor repair steps, test isolation, and clarity of the generated spec. |
| SQLite transaction | Typed parameter/result work, null handling, rollback, native cleanup, and dependency setup. |
| Immutable domain model | Record/collection boilerplate, alias mistakes, validation behavior, and reader predictions of updates. |
| LibTorch computation | Correct tensor values, owned cleanup, supported-artifact selection, and the amount of native knowledge required. |
| Rust-backed hashing | Public repository import, no native maintainer tools for consumers, correct result, and offline reuse. |
| Multicore batch | Copied inputs/results, admission limits, checked errors, sibling cancellation, and bounded scheduling. |
| Change a required input | All affected calls and exports, label correctness, revision rejection, and independent behavior acceptance. |
| Debug an injected fault | Time to locate and repair the root cause, misleading diagnostics, number of files inspected, and incorrect accepted fixes. |
| Publish a package update | Author steps, tested compiler/target declarations, reviewable public change, locked consumer upgrade, and relocation. |

Record successful completion, wrong accepted changes, review/repair time, new concepts, files opened, manual mechanical edits, cold and warm tool latency, and task-specific allocations/runtime. Include failed attempts and onboarding time. Never score ergonomics only by shorter source or fewer keystrokes.

Provisional tool targets can include sub-100 ms cached completion/hover and sub-500 ms local diagnosis on stated small/medium fixtures. They are engineering targets, not measured current performance. Report median and p95 on supported hosts, realistic dependency graphs, incomplete source, and cold versus warm caches. Correct source identity and complete required context remain necessary even when a faster response is possible.

The original [syntax study](https://www.vidarholen.net/~vidar/An_Empirical_Investigation_into_Programming_Language_Syntax.pdf) and [keyword replication](https://link.springer.com/article/10.1007/s11219-023-09631-7) concern novice readers and specific tasks. They justify testing our intuitions, not claiming that English-looking syntax automatically improves experienced engineering or agent outcomes. The companion research note gives the full caveats and other primary sources.

## Decisions to make after the prototypes

No additional input is needed to prepare these experiments. The meaningful design decisions are the public immutable-collection contract, finite variant design, defaults and interpolation spelling, and whether comprehensions or first-class functions better serve actual code. Native callbacks, in-process Python/JavaScript embeddings, automatic package source builds, shared worker memory, generic GPU kernels, and implicit error recovery remain outside this first pass.

The result should be a small set of rules that work together: readable calls, useful immutable data, explicit decisions, ordinary dependencies, dependable tools, and a concise explanation beside the code.

## Checks on this design note

The smaller greeting project passed check, LLVM run, its one same-file test, and spec generation with the inspected candidate compiler. Type checking, documentation generation/drift checking (563 generated files), the wiki build, and all four executable documentation tests passed. The catalog has 80 unique entries and its local research/source links resolve. Proposed fragments are intentionally non-executable; this work changes two research notes only.
