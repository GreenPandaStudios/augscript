# Approved language changes — 0.15

The September 28 audit recommendations and optional indentation blocks are approved. This map records the delivered implementation, accepted spelling, evidence, and practical limits.

## Syntax

- [x] Colon-led blocks with tabs or spaces, interchangeable with braces; ambiguous indentation rejected and literal braces retained.
- [x] Canonical formatter, named-import expansion, declaration diagnostics, and [compact grammar](grammar.md).
- [x] Immutable records and public constructor labels distinct from private storage.
- [x] Snapshot iteration, tuple destructuring, and checked matching.

Accepted forms: `if ready:`, `record Point(int x, int y)`, `Counter(mutable int initial to _count) implements Count`, `for (key, value) in map`, and `match value: when null: ... when some item: ...`. Class constructor bodies use `=>` before implements. The formatter verifies parsed structure and preserves declaration documentation.

## Compiler contracts

- [x] Generic invariance, conflict-aware concrete inference, constraints, and checked interface variance.
- [x] Null narrowing and ownership flow across aliases, nested references, injected call results, branches, and loop re-entry.
- [x] Pure defaults, changes/uses contracts, interface/interceptor checks, and read-only public/reference access.
- [x] Header dependencies, pure construction, complete DI graphs, explicit lifetimes/scopes, and shared mutation choices.
- [x] Recoverable index/arithmetic/conversion failures, specific error contracts, and recovery/propagation fixes.

Accepted forms: `read<T implements Named>(T value)`, `interface Producer<out T>`, `increment() changes self`, `save(resolve FileWriter files) uses files.write unless FileError`, `implement Counter with CounterImpl scoped mutable`, and `scope:`.

Stateful DI defaults to fresh; stateless adapters default to shared. Shared state needs shared mutable. Scope requirements propagate through factories; scoped references cannot escape and shared objects cannot retain them. Local cleanup cannot add effects/errors through layers. Calls forward declared dependencies rather than looking up global services.

## Modules and context

- [x] Import cycles, allowed folder edges, strict sibling surfaces, and optional module/public/wildcard/error lints.
- [x] Immutable semantic documents and shared built-in/type/inference contracts.
- [x] Deep seams for dependency ordering, ownership flow, effects, continuation analysis, and interceptor lowering.
- [x] Explain/context output with provenance, effects, layers, tests, lifetimes, bounded source context, and architecture deltas.
- [x] Documentation-tag validation, optional public docs warnings, and compiler-checked executable guides.
- [x] Persistent incremental LSP and local checking while main composition is unfinished.

`main.yaml` configures module_dependencies, strict_modules, lint, and formatter preferences. Explain/context accepts --file, --name, --budget, and --baseline. The VS Code commands display current-file contracts/context beside the source.

### Compiler navigation

| Module | Owned decision |
| --- | --- |
| [types.ts](../src/types.ts), [inference.ts](../src/inference.ts) | Type identities and consistent generic unification. |
| [builtins.ts](../src/builtins.ts) | Built-in labels, types, mutability, errors, docs, and native operation names. |
| [ownership.ts](../src/ownership.ts), [freshness.ts](../src/freshness.ts) | Object origins, loans, escape, joins, and conservative freshness. |
| [effects.ts](../src/effects.ts) | Declared mutation/capability contract resolution. |
| [di.ts](../src/di.ts), [policies.ts](../src/policies.ts) | Graph ordering/cycle paths and module/documentation policy. |
| [continuation.ts](../src/continuation.ts), [interceptors.ts](../src/interceptors.ts) | At-most-once next analysis, written layer order, input/dependency mapping, and ownership-transfer layout. |
| [semantic.ts](../src/semantic.ts), [documentation.ts](../src/documentation.ts) | Checked scopes/contracts/provenance and inherited callable documentation. |
| [lsp.ts](../src/lsp.ts) | Versioned document transport and cached import-closure checks. |
| [formatter.ts](../src/formatter.ts) | Canonical syntax, comment ownership, and parsed-program equivalence. |
| [native.ts](../src/native.ts), [config.ts](../src/config.ts) | Native compiler invocation, mapped diagnostics, coverage, timing, and config validation. |

The checker coordinates these modules and still owns core type/body checking. Editor locals come from checked scopes rather than a second syntax-based inference implementation.

## Testing and native runtime

- [x] Same-file function/class suites, independently executed parameter rows, explicit fixtures/compositions, and native coverage.
- [x] Numeric widths/wrapping, Unicode/NUL behavior, FFI widths, and checked conversion.
- [x] Check-time config validation, source-mapped native diagnostics, pinned package manifests/lockfiles.
- [x] Native benchmark workload/report, source metadata, and LLDB adapter/terminal integration.

Accepted forms: `test add:`, `it adds for (left, right, expected) in [(1, 2, 3)]:`, `fixture seven() returns int:`, and `include TestServices` in setup. Coverage is statement-line coverage of the compiled test closure.

The C boundary uses int64_t for int and checked 32-bit C int for c_int. Text is UTF-8 without NUL. [Benchmark measurements](benchmarks.json) include startup and identify the environment.

## Audit coverage

| Findings | Delivered solution |
| --- | --- |
| 1, 5, 6, 7, 9 | Pure defaults; declared mutation/capabilities; explicit adapters; pure construction; effective layer contracts. |
| 2, 3, 4 | Stateful fresh defaults; explicit shared/scoped choices; header DI; complete construction graph and dependency fixes. |
| 8, 16, 17, 20 | Read-only storage; immutable records; iteration/destructuring/match; public labels/private storage. |
| 10, 11, 12, 13, 14, 15 | Ownership/null flow; invariance/variance/constraints/inference; checked runtime failures and specific recovery/propagation. |
| 18, 19, 21, 22, 23 | Named-import expansion; public/module policy; architecture deltas; canonical syntax and precise grammar diagnostics. |
| 24, 26 | Function/row suites, imported fixtures/compositions, coverage, checked docs, and executable guides. |
| 25, 27, 28, 29 | Resolved semantics and provenance; shared registries; deep compiler seams; bounded context and cached persistent LSP. |
| 30 | Defined numeric/text/ABI behavior; config/native diagnostics; benchmark evidence; source maps/debug launch; pinned dependencies. |

## Verification

- [x] All 16 bundled projects migrated, checked, formatted idempotently, and run natively; their six built-in cases pass.
- [x] Eleven complete guide projects compile/run, with six documented test cases and unchanged native behavior after formatting.
- [x] Regressions cover successful and rejected contracts, versioned LSP caching, concrete quick-fix edits, zero-count coverage, source diagnostics, and cleanup paths.
- [x] Final TypeScript/compiler gate: type checking and all 156 regression tests pass.

The VS Code release is 0.15.0. Its package includes the compiler, runtime, source examples, and these guides; build artifacts are excluded. Use the repository packaging/install commands in README.md.

### Current limits

Ownership and short-circuit descriptions are conservative analyses rather than formal proofs. The LSP caches parsed modules and checked import closures, not individual expressions. Coverage counts statement lines, not branches; startup is excluded from tests.

LLDB resolves AugScript source breakpoints. Its launch smoke test stalled on this host and was stopped; interactive stepping/call stacks remain unverified here. The VS Code DAP path requires lldb-dap, which is not installed on this machine. Native tagged-value variable views need further debugger work.

Benchmarks establish only the measured workload on this host; no universal speed or Python/Rust comparison is claimed. Threads, binary/pointer-heavy FFI, and a package resolver remain deferred as agreed. Clock/random/network capabilities can follow the same explicit-capability contract when those APIs are added.
