# AugScript: simplicity and developer scalability

Audit of the 0.14 compiler, runtime, module system, guide, and VS Code extension on September 28, 2026. The user approved all recommended solutions and optional indentation blocks. Version 0.15 implements that scope; see [the delivery map](implementation-map.md) for accepted spelling, modules, verification, and limits.

The findings below describe the historical 0.14 baseline. Source links now point to the evolved implementation; the current guide and delivery map are authoritative for accepted behavior.

## Why this language exists

AugScript should let a developer, including one working with an LLM, understand a module from the code in front of them. Its interface should communicate inputs, results, dependencies, failures, mutation, and execution order. A change should stay local to the module that owns the behavior.

The two tenets are **simplicity** and **developer scalability**. Concrete design rules follow:

1. Prefer a familiar, canonical spelling for each operation.
2. Put dependencies and observable effects in the interface.
3. Make ordinary data easy to create and read.
4. Make sharing, mutation, and lifetime decisions visible.
5. Keep a module’s public interface smaller than its implementation.
6. Enforce module rules in the compiler, rather than relying on everyone remembering conventions.
7. Keep contracts, documentation, and tests beside the code they explain.
8. Give developers tools to gather the exact context needed for a change.

These are design goals. Some require changes to earlier decisions, especially shared process bindings, public fields, and mutation through methods. A short natural-language spelling does not, by itself, make its behavior explicit.

## Changes implemented in 0.14

| Previous gap | Change |
| --- | --- |
| Creating common data required constructor calls and explicit generic arguments. | List, tuple, set, and map literals infer types; typed declarations and concrete call/return contracts supply empty-literal types. |
| Lists and maps existed, but sets and tuples did not. | Added hash sets and immutable tuple positions, with typed read operations. |
| Map lookup scanned every entry. | Map and Set now use hash tables; tuple keys have value equality and hashing. |
| Statement punctuation was mandatory. | Newlines terminate statements; semicolons remain optional separators. Continuation rules avoid silently joining separate calls. |
| Error contracts used `throws`. | Contracts read `returns T unless Error`; `throw` remains the failure statement. The editor migrates old contracts. |
| Several imports required repeated statements. | `import A and B from module` and `import everything from module` are supported. |
| Sibling imports could accidentally expose a sibling’s imports depending on processing order. | Import resolution uses that file’s own declarations. Neither named nor wildcard imports expose transitive imports. |
| Wildcard imports hide their actual imported names. | Hover now lists resolved names and source files. Explicit named imports remain the clearest choice. |
| Behavior examples and regression tests lived outside the language. | Same-file `test / when / it / assert`, CLI discovery/filtering, and an editor test provider. |
| Test fixtures could otherwise share the production composition root. | Each case gets fresh setup and bindings in a separate native process. Production startup is omitted. |
| A caught assertion or an empty test could appear successful. | Assertion failure remains a failed case; executing no assertions fails a case. Tests have bounded native execution. |
| Mutable collections could widen their element types through an alias. | List, Set, and Map type arguments are invariant. |
| An interface implementation could change parameter ownership silently. | Parameter ownership is checked as part of the interface signature. |
| A non-void body could fall through and return runtime null. | The compiler requires a value or failure on every path. |

The runnable example is [developer-workflow](../examples/developer-workflow/main.aug); tests are beside [Calculator](../examples/developer-workflow/calculator.aug). See [the language guide](reference.md) and [testing guide](testing.md).

## Baseline findings: dependencies and side effects

| Finding | Evidence at the time of the audit | Recommended solution |
| --- | --- | --- |
| **1. A plain method call can mutate shared state.** A caller reading `worker.work()` cannot tell whether it changes the worker, its injected objects, or external state. | Methods carry parameters, results, ownership, and checked errors, but no effect contract in [the AST](../src/ast.ts). Field writes need a local borrow; ordinary calls do not require the caller to know the method’s mutation. | Make functions and methods pure by default. A mutating method declares `changes self`; external effects come from named capabilities and appear in its checked contract. Require the corresponding mutable access at the call site. |
| **2. Process-wide DI makes sharing the easiest lifetime.** Every resolve of a key receives the same object, even when a developer expects independent state. | [Binding checking](../src/checker.ts) creates one instance per key; [generated C](../src/codegen.ts) stores all bindings in global roots. | Distinguish stateless shared adapters from stateful instances. Add explicit lifetimes or composition scopes. Require an explicit shared-state choice for mutable bindings. Keep one root in main, with module-level composition helpers for large apps. |
| **3. Explicit resolve expressions are service-locator access.** A dependency can appear deep in a body, absent from the header. | `checkExpression` permits `resolve` wherever expressions are allowed. Function parameters already support the clearer `resolve Type name` form. | Require dependency parameters outside composition/setup code. Offer a fix that lifts a body resolve into a header dependency. Explicit retrieval remains appropriate in main and test setup. |
| **4. The startup dependency graph misses body lookups and helper calls.** An order-independent binding can read a not-yet-built dependency through its constructor body. | `checkBindings` follows injected fields and constructor interceptor dependencies, rather than every transitive call or resolve in startup code. | First prohibit body-level resolve during construction. Then derive a checked dependency/effect graph from headers and calls, with a diagnostic showing the full cycle or missing edge. |
| **5. I/O is ambient.** Any file can call print or file I/O without importing or receiving that dependency. File errors are checked, but the ability to touch the filesystem is not visible in the interface. | Built-ins in [the checker](../src/checker.ts), [editor help](../src/help.ts), and [runtime](../runtime/aug_runtime.c). | Model Console, FileReader, and FileWriter as capabilities passed explicitly or injected. Keep convenient output in main and test tooling. Inject clock, randomness, and network capabilities when those features arrive. |
| **6. Constructor work can perform arbitrary effects.** Resolving a graph can trigger logging, file writes, or other work before the explicit application statements. | Constructor `=>` blocks and constructor interceptors run during eager binding creation. | Keep construction limited to establishing valid local state. Put startup effects in a named, effect-declared method called visibly from main. Check constructor purity. |
| **7. Interceptors change behavior beyond the visible body.** They can skip execution, replace inputs/results, and add dependencies/errors. A tag shows that there is a wrapper, but its full contract requires another file. | [Interceptor planning](../src/checker.ts), [layer code generation](../src/codegen.ts), and existing chain/error hover. | Preserve explicit tags and written ordering. Add complete layer dependencies, effects, and short-circuit behavior to callable hover and context output. Make each layer satisfy the same effect and mutation rules as its target. Avoid global or implicit interceptor registration. |

## Baseline findings: data, contracts, and ownership

| Finding | Evidence | Recommended solution |
| --- | --- | --- |
| **8. Unprefixed constructor fields are public and writable.** A module can expose all of its storage accidentally and let callers bypass invariants. | Header parameters become fields automatically; `_` controls visibility in [project and member checking](../src/checker.ts). | Preserve the public naming rule, but make public fields read-only by default. Require explicit mutable storage. Expose a method for transitions that maintain invariants. Prefer immutable data at module seams. |
| **9. Plain managed inputs are not a deep read-only guarantee.** A method can mutate referenced objects or invoke another mutating method through a seemingly ordinary input. | Ownership checks focus on direct variables, fields, and known collection operations. Method contracts do not classify mutation. | Track read versus mutable access through calls and nested storage. A managed parameter grants reading; mutation requires a checked borrow or an explicitly declared capability. |
| **10. Alias and move checking is incomplete.** Two resolves of the same binding, references retrieved from fields/collections, and aliases created by calls may refer to the same object without a common tracked root. Loops are checked once rather than to a fixed point. | `aliasRoot`, `rootName`, `mergeMoved`, and block checking in [checker.ts](../src/checker.ts). | Build a control-flow analysis that tracks origins, loans, moves, escape, and loop re-entry. Include binding identity and nested references. Until then, treat the ownership implementation as a prototype rather than a proof of exclusive access. |
| **11. General generic variance is too permissive.** Mutable built-ins are now invariant, but user-defined generic types can still widen arguments through assignability. | `assignable` recursively checks other same-ID generic arguments; classes may have mutable fields and interfaces may consume their type parameter. | Make user-defined generic types invariant by default. Add explicit checked variance only when a type is proven to expose its parameter solely for reading or writing. Add constrained generics with clear diagnostics. |
| **12. Generic inference and constraints are uneven.** Collection inputs now infer nested generic arguments, but unresolved parameters, multiple competing candidates, and generic DI specialization need stronger checks. | `inferCallType`, `resolveType`, and type-keyed DI in [checker.ts](../src/checker.ts). | Require a concrete inference result at each call; report conflicts at argument labels and show the expected constraint. Use one substitution/unification implementation for functions, classes, interfaces, interceptors, and DI. |
| **13. Missing values are difficult to use safely.** Map.get returns a nullable result, but a non-null check does not narrow a class reference for a later method call. | Nullable assignment/receiver checks exist; flow narrowing is absent. | Add flow-sensitive narrowing after `if value != null` and early-return guards. Consider an explicit result/option type when absence carries domain meaning. Avoid a unchecked “trust me” conversion. |
| **14. Some safe-looking operations abort the entire process.** Invalid list positions and division by zero bypass the `unless` model. | `fail()` in [the runtime](../runtime/aug_runtime.c) exits immediately. Tuple constant bounds are checked, but list indexes are dynamic. | Define which failures are recoverable. Use checked IndexError/ArithmeticError or a safe nullable/result operation for dynamic access. Reserve process aborts for invariant corruption and unrecoverable allocation failures. |
| **15. Broad `unless Error` and print-only catch fixes can hide intent.** An unfamiliar reader loses the failure cases or sees errors silently consumed. | Root Error contracts and the catch-and-print fix in [fixes.ts](../src/fixes.ts). | Prefer specific public error contracts. Offer propagate-with-unless and deliberate recovery fixes before a generic print handler; flag unused caught errors or catch blocks that merely discard failures. Explain which layers add errors. |
| **16. Mandatory interfaces can add ceremony for simple data.** An empty marker interface exists only to let a data holder be declared. | Every class requires implements; there is no record/value declaration. | Keep explicit interfaces for substitutable behavior. Add a first-class immutable record/value feature for data, with labeled construction, structural equality, and validation where needed. This is a new design decision, not implemented syntax. |
| **17. Some operations still lack readable data syntax.** Collection creation is concise now, but reading tuples requires `.get(index=...)`, and there are no iteration, destructuring, named records, or pattern matching features. | [Parser](../src/parser.ts) and built-in collection methods. | Add a small, consistent set: labeled record fields, tuple destructuring, `for item in items`, and checked matching. Choose readable constructs that expose types and missing cases. Keep shortcuts out if they obscure data shape. |

## Baseline findings: modules and natural-language consistency

| Finding | Evidence | Recommended solution |
| --- | --- | --- |
| **18. Everything imports weaken local dependency lists.** Adding an export elsewhere changes the importing scope, even if the consumer’s text does not change. | The newly supported wildcard import in [project.ts](../src/project.ts). Visibility and collisions are enforced, and hover shows its expansion. | Keep the requested feature. Provide an “expand to named imports” action and an optional production lint. Prefer it in composition roots or small curated modules; use named imports in implementation modules. |
| **19. Public-by-name still exports a broad sibling surface.** A declaration need not be listed in export.aug to be imported by a sibling file. | The direct sibling path takes public local declarations; export.aug controls only folder crossings. | Preserve the chosen visibility rule, but lint accidental public helpers and broad module surfaces. Encourage `_` for implementation helpers. Offer an optional stronger module policy for large projects. |
| **20. Private constructor labels expose private spelling.** An external caller must know `_value` to construct a class with that private field. | The documented/tested `Box(_value=2)` behavior in [the guide](reference.md). | Separate the public constructor label from private storage, or make a public parameter initialize a named private field. Keep the distinction explicit in the header and document it in signature help. |
| **21. Module edges are visible but architecture is not enforced.** Cycles, imports across domain layers, and dependency fan-out can grow into a shared monolith. | Folder exports enforce access, but [project.ts](../src/project.ts) has no import-cycle or allowed-dependency policy. | Check import cycles and let modules declare allowed dependencies. Report changed module edges and interface growth. Use fan-out and mutable sharing as warning signals; avoid arbitrary file-length bans that punish deep, cohesive modules. |
| **22. Syntax has multiple historical spellings.** Bind/implement, assignment/resolve forms, comma/and errors, and explicit/implicit void increase the amount of grammar an unfamiliar reader must know. | Parser and help contain accepted alternatives; class/function/throws are explicitly rejected. | Establish a formatter’s canonical output: implement/with, resolve/to, optional semicolons omitted, and explicit named imports. Preserve `=` and `to` as requested, but format consistently within a project. Remove legacy bind after a migration period if desired. |
| **23. Implements decides whether a header is a class.** Removing the keyword simplified declarations, but a missing implements can turn a header into a function and produce a distant error. Brackets also serve lists and annotations. | Speculative declaration lookahead and annotation disambiguation in [parser.ts](../src/parser.ts). | Retain the agreed bare syntax. Improve diagnostics for class-shaped headers, retain precise declaration symbols in navigation, and publish a small grammar with unambiguous line-boundary rules. Avoid adding more context-dependent header roles. |
| **24. Tests are close to behavior, but can make files large and cover only classes.** Function modules and large suites need a similarly local workflow without requiring a class wrapper. | The new test grammar and [test runner](../src/testing.ts) support same-file class suites and flat groups. | Add function suites, parameterized cases, reusable explicitly imported fixtures, and coverage. Keep the primary tests beside their declaration. Put large integration tests in a separate module with explicit capabilities. In-memory isolation already exists; external effects need adapters or isolated resources. |

## Baseline findings: developer tools and compiler modules

| Finding | Evidence | Recommended solution |
| --- | --- | --- |
| **25. Correct understanding still requires context assembly by hand.** Import and tag navigation helps, but there is no command that returns a module’s complete contract and provenance. | CLI has check, symbols, definition, completion, hover, fixes, and tests; no explain/context command. | Add `aug explain` and `aug context`: exact public contracts, imported names and origins, transitive DI, effects, checked errors, interceptor order, and relevant tests. Include source locations and bounded context selection. Make the output useful both to humans and LLM tooling. |
| **26. Documentation can drift from code.** Javadoc is displayed, but described parameters/errors, public exports, and guide snippets are not checked against the compiler. | [Javadoc parsing](../src/javadoc.ts) formats comments independently of type checking; snippets are maintained manually. | Validate documentation tags against signatures. Diagnose missing public API docs when a project enables that policy. Compile executable documentation examples and show inferred contracts beside prose. Tests should illustrate behavior and limitations, rather than repeat implementation details. |
| **27. Built-in contracts are duplicated across modules.** Adding Set required edits in the checker, runtime emitter, help, completion, and grammar. This increases the context required for a small change. | Built-in dispatch in [checker.ts](../src/checker.ts), [codegen.ts](../src/codegen.ts), [editor.ts](../src/editor.ts), [help.ts](../src/help.ts), and the grammar. | Create a deep built-in module: one declarative contract registry for labels, types, mutability, errors, and documentation; checker and editor consume it. Keep C runtime adapters behind a narrow seam and verify behavior through native programs. |
| **28. The checker owns many unrelated policies.** Type resolution, interface merging, DI ordering, ownership, errors, and interception share one large implementation. The editor also reconstructs scope from syntax. | [checker.ts](../src/checker.ts) and [editor.ts](../src/editor.ts). | Expose a resolved semantic model with symbols, scopes, callable contracts, and provenance. Move DI, ownership/effects, and interceptor lowering into modules with small interfaces and shared type operations. Test through their interfaces. A file split without reducing caller knowledge would not improve depth. |
| **29. Every editor request reloads and checks a whole project.** Main requires all production composition to be valid even when a developer is editing an isolated module. | CLI reloads the project; the extension starts a compiler process for each request. Test analysis is also repeated per case. | Add an incremental language server and cached module checking. Separate type-contract validation from composition completeness; keep whole-application DI validation as a build gate. Let developers get meaningful local diagnostics while the composition root is unfinished. |
| **30. The build/runtime contract is narrower than its surface suggests.** Native C output still uses tagged values and dynamic member lookup. int is wider in the runtime than the C FFI mapping; strings/file I/O have NUL and encoding limitations; configuration is a small YAML subset checked during build. | [Code generation](../src/codegen.ts), [runtime](../runtime/aug_runtime.c), and [CLI configuration](../src/cli.ts). | Specify numeric range/overflow, text encoding, FFI widths, and ABI conversions. Validate configuration during check and surface native diagnostics at AugScript locations. Benchmark real workloads before promising speed. Add source maps/debugger support and reproducible package/module versions as the project grows. |

## Approved implementation sequence

### First: make the contracts trustworthy

Complete generic invariance/inference and control-flow ownership checks. Define runtime failure behavior. These are compiler correctness tasks; their spelling should not become a user configuration option.

### Second: make effects and sharing visible

Adopt pure defaults, read-only public data, declared mutation, explicit capabilities, and header-only DI outside composition code. Extend the same rules through interfaces and interceptors. This directly addresses the biggest current conflict with the tenets: shared state can change behind an innocent-looking call.

Historical proposal — **now accepted and implemented in 0.15**, with the canonical clause order documented in the reference:

```text
calculate(int price, int quantity) returns int

Counter() implements ICounter {
    increment() changes self
}

save(resolve FileWriter files, string path, string content)
    uses files.write unless FileError
```

The cost is additional contract text for effectful operations and more compiler analysis. The benefit is that the caller can see and check the behavior without reading every helper body. Effects should name the actual dependency or state being changed; a generic `impure` escape hatch would reveal too little.

### Third: make context and modules easy to navigate

The semantic model, explain/context commands, canonical formatting, wildcard expansion, module dependency checks, validated docs, incremental editor, immutable records, and function suites are delivered. Record and function-test semantics are defined in the current guide.

## What should stay

Keep explicit imports, export.aug folder boundaries, labeled arguments, same-file tests, checked failure contracts, explicit interceptor tags, and main as the composition root. Keep ordinary reads easy. Keep classes free from class inheritance and interfaces as explicit behavior contracts.

The goal is a module with a small interface that states everything its caller needs to know, substantial behavior behind it, and changes with good locality. Enforce effects, sharing, and dependencies to make that possible; formatting alone cannot prevent a monolith.
