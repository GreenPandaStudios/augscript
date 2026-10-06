# Language conformance

August checks its language contracts before native compilation. A [rule ledger](conformance-rules.md) connects every production in the documented grammar to named regression tests and independent acceptance programs. The compiler, runtime, formatter, native bindings, and deterministic specification generator have separate checks. The [conformance suite](../tests/language-conformance.test.mjs) exercises the rules below. The [compatibility policy](compatibility.md) becomes a commitment at 1.0.

## Compiler checks {#what-the-compiler-guarantees}

| Rule | Developer-visible behavior | Conformance case |
| --- | --- | --- |
| Owned moves | Passing an `own` value to an `own` input or `Shared(value=...)` consumes the old name. A second use is a compile error. A value borrowed by a child cannot move through a call, another `Shared<T>`, a local declaration, a return, or a throw until the child finishes. | `OWN-1`, `SHARED-1`, `TASK-8`, `TASK-11` through `TASK-13`, `TASK-17` |
| Mutable access | Reading through another alias during `borrow` is a compile error. The alias can be read again after the block. | `BORROW-1` |
| Child captures | A child can read a managed object without copying it. The parent must wait before mutating that object through any alias, borrowed call, or field write. This applies even when the parent opened `borrow` before starting the child. Every possible branch must wait before mutation resumes. Freezing also waits for active mutable access. | `TASK-1` through `TASK-4`, `TASK-10`, `TASK-14` |
| Repeated starts | A `start` inside a loop can create several children. Waiting for one result does not release captures from other iterations; the enclosing `scope` joins them all. Put a `scope` inside the loop when each iteration should release its capture before the next iteration. | `TASK-7`, `TASK-15`, `TASK-16` |
| Collection waits | Waiting for one dynamically selected `Task<T>` does not release captures from other tasks that might be selected. A task that holds a reference to another task also cannot release that task's capture when only the first is awaited. `wait for` a `List<Task<T>>` joins every child in the list and releases their captures. | `TASK-18`, `TASK-19` |
| Checked child errors | Starting a child checks errors in its argument expressions. An error from the scheduled operation is checked at `wait for` or at the implicit scope join. Within the same scope, the checker knows the child's declared errors. A helper given a public `Task<T>` parameter handles or declares `Error`, since that type does not carry a narrower error list. | `ERROR-1`, `ERROR-3` |

The compiler tracks object origins through aliases and fields. It can reject code when it cannot prove that two references are separate. [The language guide](reference.md#ownership-and-read-access) explains `own`, `borrow`, `freeze`, and `Shared<T>`.

## Runtime behavior {#what-native-execution-guarantees}

| Rule | Developer-visible behavior | Conformance case |
| --- | --- | --- |
| Owned cleanup | An owned local is dropped once after normal scope exit or a checked error. Moving it transfers that responsibility. An owned `Shared<T>` drops its transferred payload. | `OWN-1`, `OWN-2`, `SHARED-1` |
| Scope exit | Leaving a scope, including by `return`, joins its children before the caller resumes and before the scope releases owned dependencies. An inner scope's join releases its capture for later outer code. Captured resources remain live through collection pressure and drop once after the join. | `CLEANUP-2`, `TASK-5`, `TASK-6`; [resource join test](../tests/concurrency.test.mjs) |
| `always` | Cleanup runs before a returned result is observed and while a cancelled child unwinds. | `CLEANUP-1`, `CANCEL-1` |
| Child failure | An unhandled child failure cancels siblings. Their `always` cleanup finishes before the error leaves the scope. An error already in flight from the parent remains primary if child cleanup also fails. | `CANCEL-1`, `ERROR-2` |
| Syntax choice | Brace blocks and indented blocks run the same ownership and task behavior. | `SYNTAX-1` |

Cooperative tasks share their current heap. [Worker tasks](workers.md) run on OS threads with separate heaps and copied inputs/results. A runtime barrier test requires two distinct threads to overlap, then checks collection pressure, copied maps/lists, unchanged parent values, and release on the creating thread. It runs in both optimization modes under ThreadSanitizer and the address/undefined-behavior sanitizers.

Scheduling an owned input transfers its cleanup responsibility immediately. If
a sibling cancels the child before entry, the scheduler releases that input.
The independent `TASK-20` case checks that a cancelled consumer never enters its body and that its transferred wrapper and payload each drop once, before a marker owned by the later catch. This distinguishes cancellation cleanup from eventual collection at shutdown. The checker rejects owned task results, including inferred `Task<T>` results,
until the public task type has an owned-result transfer contract. Both backends
exercise these cases in the concurrency suite.

Run the focused suite with `node --test tests/language-conformance.test.mjs`. The full repository test command also runs existing [concurrency](../tests/concurrency.test.mjs), ownership, errors, formatter, and generated-spec tests. Additional adversarial cases and independent review are still needed before 1.0. See the [roadmap](roadmap.md).

## Independent acceptance and platform gates

The corpus in `conformance/cases.json` contains handwritten programs, expected output, and rejected-program diagnostic codes. Those expectations are independent of generated specifications and compiler output. The runner formats valid programs into both block styles and compiles them through LLVM in debug and release modes. Invalid fixtures are checked once in their written style and must fail before native execution. Two valid behavior changes must compile and produce a result that the independent oracle rejects. A missing rule, regression name, reference page, or grammar production makes ledger validation fail.

Every ownership and task lifecycle rule listed above now has an independent acceptance program in addition to its regression. These cases cover mutation through aliases and nested fields, incomplete branch joins, repeated starts, selected and collection waits, moves and freezes while captured, resource pressure, deferred failures and cancellation cleanup, including cancellation before child entry. Successful cases run in both LLVM modes and both block styles. Rejected cases check the prohibited operation before lowering. The ledger test prevents these rules from falling back to regression links alone. Other compiler, editor, HTTP and native-package contracts still require their separately named suites.

Contributor qualification runs `npm run test:conformance` with a prepared LLVM tool/runtime pack. macOS ARM64 and GNU/Linux x64/ARM64 CI run the same corpus, existing language regressions, and worker runtime sanitizer checks. The result records compiler/runtime identities, target, source digest, modes, concrete outputs, rejected diagnostics, and omissions. Its fingerprint includes runtime code, dependency pins, the independent corpus and the grammar; changed inputs invalidate a running qualification. The runner also fingerprints the selected LLVM executables, runtime manifest and runtime members before and after each native check. Contributor overrides can invoke undeclared external tools, so the report does not qualify their full tool closure; release producers separately seal the complete compiler archive. Cleanup cases require exact named destruction counts; the pre-entry cancellation case also records and checks destruction order, and at least two valid behavioral mutations must be detected. The coverage section separates rules exercised by independent programs from rules supported only by linked regressions. Those links are an inventory: this command does not execute them, so release qualification also requires the full regression suite. GPU execution has a separate real-hardware gate; a headless CI runner cannot establish GPU correctness.

The ledger is an inventory of tested contracts, not a proof that every possible program is safe. Runtime reliability, package upgrades, and the remaining release gates stay on the [1.0 roadmap](roadmap.md).
