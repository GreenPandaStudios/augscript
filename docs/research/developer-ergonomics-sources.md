# Research: developer ergonomics before 1.0

Reviewed October 4, 2026. This contributor note collects patterns from primary sources for August design discussions. The August ideas below are proposals and evaluation questions, not release commitments or claims of implemented behavior. The [companion brainstorm](developer-ergonomics.md) applies this evidence to August. Changes to ownership, GC, workers, channels, or security policy retain their separate review requirements.

August already documents labeled calls, local and return inference, explicit imports and exports, checked failures, package workflows, and compiled specifications. Use those as the foundation when comparing alternatives; see [values and functions](../learn/values-and-functions.md), [data and failures](../learn/data-and-errors.md), [modules](../learn/modules-and-dependencies.md), [packages](../packages.md), and [specifications](../specifications.md).

## Patterns worth testing

### 1. Design calls in their reading context

Swift's API guidelines prioritize clarity where an API is used and recommend argument labels that distinguish roles. Kotlin documents named arguments as particularly helpful for boolean and null arguments, but cannot offer them for Java calls whose parameter names are unavailable. [Swift guidelines](https://www.swift.org/documentation/api-design-guidelines/#argument-labels), [Kotlin functions](https://kotlinlang.org/docs/functions.html#named-arguments).

**August idea:** review standard-library calls as sentences in complete programs. Keep the existing same-name shorthand; measure whether completion makes unfamiliar labels discoverable. Native bindings need stable reviewed labels. Labels become part of the public contract, so renaming a parameter needs compatibility consideration.

### 2. Infer details while exposing the effective contract

Rust requires parameter types in function signatures; its book explains that this bounds inference and helps diagnostics. Kotlin infers single-expression results but requires explicit non-Unit results for block bodies. Zig 0.15.2 supports inferred error sets, with documented limitations involving recursion, function pointers, and consistency across targets. These are different tradeoffs, not evidence that every annotation should be inferred. [Rust functions](https://doc.rust-lang.org/book/ch03-03-how-functions-work.html#parameters), [Kotlin return types](https://kotlinlang.org/docs/functions.html#return-types), [Zig inferred errors](https://ziglang.org/documentation/0.15.2/#Inferred-Error-Sets).

**August idea:** extend the existing presentation of inferred contracts with origins for results, checked errors, and effects, plus an optional action to write a checked annotation. Compare exported contracts when a body changes. Inference that silently widens a public API makes local edits harder to review.

### 3. Keep narrowing dependent on stable local facts

Kotlin's smart casts require proof that a value cannot change between a check and use. Mutable properties never qualify; local mutable values qualify only under stated conditions, and custom getters limit property narrowing. Early returns can also establish a narrower type. [Kotlin smart casts](https://kotlinlang.org/docs/typecasts.html#smart-cast-prerequisites).

**August idea:** evaluate existing null narrowing with aliases, calls, mutation, and escape from a scope. Explain why a narrowing was invalidated beside the failing use. A readable guard should establish a bounded fact; it must not imply safety after another actor or getter can change the value.

### 4. Start with an ordinary function and a small command vocabulary

Go's introductory workflow starts with a function and a module, then adds a reusable package and tests. Cargo provides a distinct check command that omits final code generation, and explicitly notes that some errors only occur during code generation. [Go workflow](https://go.dev/doc/code), [Cargo check](https://doc.rust-lang.org/cargo/commands/cargo-check.html).

**August idea:** make the smallest starter teach a pure function, a labeled call, one test, and a compiled spec. Introduce interfaces and dependency injection when a second implementation is useful. Keep a consistent project root for check, run, test, and spec; tell developers which validation actually executes or links code.

### 5. Make mechanical edits produce predictable source

Go's official formatting guidance describes canonical formatting and shows mechanical source rewrites with gofmt. These are tooling capabilities and design rationale, not controlled evidence of a universal productivity improvement. [Go formatting and rewrites](https://go.dev/blog/gofmt).

**August idea:** preserve semantic and comment structure when formatting, expanding shorthand, inserting annotations, or updating imports. Test repeated application and localized diffs. August's two supported presentation styles need an explicit project choice so an automated edit does not repeatedly change style.

### 6. Separate a dependency request from its exact identity

Cargo distinguishes a handwritten dependency request from an exact generated lock. Its locked and offline options enforce different constraints. Go's module reference separately describes cryptographic hashes and a checksum database for repeatable downloads. An exact revision, an integrity digest, and publisher authentication answer different questions. [Cargo lockfiles](https://doc.rust-lang.org/cargo/guide/cargo-toml-vs-cargo-lock.html), [Cargo resolution options](https://doc.rust-lang.org/cargo/commands/cargo-check.html#manifest-options), [Go authentication](https://go.dev/ref/mod#authenticating).

**August idea:** improve explanations of existing source imports, aliases, export files, and locks: show what a dependency exposes, why it is needed, and the exact selected source/artifact. Keep updates deliberate and failures actionable. This research does not propose copying Go's trust service or changing August's installation policy.

### 7. Put the lifetime of contextual work in the call contract

Go's Context carries deadlines, cancellation, and request values across API boundaries. Its documentation recommends passing it explicitly, restricts values to request data, and requires callers to release derived cancellation resources. [Go context contract](https://pkg.go.dev/context#pkg-overview).

**August idea:** make an operation's needed capabilities and cancellation context visible through its existing headers and compiled spec. Keep the root of a request easy to locate. This pattern makes context explicit; a cancellation signal does not itself force work to stop or establish an authorization boundary. Scheduler and worker changes need their own design and review.

### 8. Distinguish a diagnosis from a guessed repair

Rust's diagnostic JSON carries source spans, suggested replacements, and applicability levels that distinguish automatic edits, uncertain suggestions, and edits containing placeholders. [Rust diagnostic schema](https://doc.rust-lang.org/rustc/json.html#diagnostics).

**August idea:** provide one diagnostic model for CLI, editor, and agent tools. Report the violated rule, the conflicting declaration, and any bounded repair. Recheck an applied fix. A possible missing import may support a suggestion; choosing a provider, changing an error contract, or widening an export can require intent that checking alone cannot establish.

### 9. Generate native glue from a reviewable boundary

Zig 0.15.2 imports C headers through `@cImport` or translates them into inspectable source. Translation must use matching targets and compiler flags; some constructs cannot be translated. CXX instead takes declared bridge signatures and checks them against C++ headers with generated static assertions. [Zig C integration](https://ziglang.org/documentation/0.15.2/#Import-from-C-Header-File), [Zig translation limits](https://ziglang.org/documentation/0.15.2/#Translation-failures), [CXX signature checks](https://cxx.rs/extern-c%2B%2B.html#functions-and-member-functions).

**August idea:** investigate a native package authoring path that generates repetitive ABI adapters and a contract preview from one reviewed schema. Preserve the existing C ABI and verified artifact path. Imported types and matching signatures do not establish the safety of a native implementation.

### 10. Keep ownership distinctions through native wrappers

CXX uses UniquePtr for owned opaque C++ objects and Box for owned opaque Rust objects; its extern C++ bindings do not assume thread safety. UniFFI uses Arc-managed interface objects and requires Send + Sync for interface implementations. Its foreign API hides Arc while its Rust contract retains it. [CXX ownership](https://cxx.rs/binding/uniqueptr.html), [CXX thread safety](https://cxx.rs/extern-c%2B%2B.html#opaque-c-types), [UniFFI object references](https://mozilla.github.io/uniffi-rs/latest/types/interfaces.html).

**August idea:** make adapter contracts describe copying, borrowing, retaining, consuming, and release behavior in ordinary language. Generate glue only from established ownership metadata. Reference counting, borrow checking, and garbage collection have different contracts; a wrapper cannot infer them from a pointer or silently substitute one model for another.

### 11. Generate readable explanations from established facts

SimpleNLG separates mechanical realization from the mapping controlled by the developer of semantic input into language. It provides an architectural precedent for controlled prose generation; it does not establish completeness of program explanations. August already has a [more detailed source-to-prose research note](code-to-natural-language.md). [Gatt and Reiter, 2009](https://aclanthology.org/W09-0613.pdf).

**August idea:** keep the checked program as the source of claims and retain source identities through paragraph planning. Show local state changes, failure paths, and the used dependency contract with links. Measure coverage and reader comprehension separately. Deterministic wording is an engineering property to test, and cannot turn inferred naming intent into verified behavior.

### 12. Evaluate readability with tasks and representative readers

Stefik and Siebert's 2013 paper separates surveys of perceived syntax intuitiveness from novice programming accuracy experiments. Lappi, Tirronen, and Itkonen's 2023 replication reproduces much of an earlier keyword study with Finnish students, while its English-proficiency distribution limits conclusions about less proficient readers. These studies concern their populations and tasks, not August or maintenance with LLMs. [Original paper DOI](https://doi.org/10.1145/2534973), [inspected full text](https://www.vidarholen.net/~vidar/An_Empirical_Investigation_into_Programming_Language_Syntax.pdf), [replication](https://link.springer.com/article/10.1007/s11219-023-09631-7).

**August idea:** compare concrete alternatives on reading a branch, predicting an error, modifying a function, installing a package, and using a native wrapper. Record correctness, time, diagnostic recovery, files inspected, and contract mistakes. Include experienced developers, newcomers, and varied English proficiency. Preference ratings and token counts are useful observations, but do not demonstrate correctness or developer scalability.

## Suggested first experiments

Start with a starter with a pure function, clearer provenance for inferred contracts, a dependency/contract inspection flow, and native adapter authoring previews. Each can be evaluated against a complete small task before extending syntax or semantics. Preserve the current approval boundaries and record rejected or deferred choices explicitly. No source implementation changed as part of this note.
