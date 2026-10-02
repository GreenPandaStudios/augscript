# Ownership and task conformance

August 0.21 checks ownership before compiling and joins every child before its `scope` ends. This page records the behavior exercised by the [language conformance suite](../tests/language-conformance.test.mjs). It is a candidate 1.0 contract; the [compatibility policy](compatibility.md) takes effect only with a 1.0 release.

## What the compiler guarantees

| Rule | Developer-visible behavior | Conformance case |
| --- | --- | --- |
| Owned moves | Passing an `own` value to an `own` input or `Shared(value=...)` consumes the old name. A second use is a compile error. A value borrowed by a child cannot move through a call, another `Shared<T>`, a local declaration, a return, or a throw until the child finishes. | `OWN-1`, `SHARED-1`, `TASK-8`, `TASK-11` through `TASK-13`, `TASK-17` |
| Mutable access | Reading through another alias during `borrow` is a compile error. The alias can be read again after the block. | `BORROW-1` |
| Child captures | A child can read a managed object without copying it. The parent must wait before mutating that object through any alias, borrowed call, or field write. This applies even when the parent opened `borrow` before starting the child. Every possible branch must wait before mutation resumes. Freezing also waits for active mutable access. | `TASK-1` through `TASK-4`, `TASK-10`, `TASK-14` |
| Repeated starts | A `start` inside a loop can create several children. Waiting for one result does not release captures from other iterations; the enclosing `scope` joins them all. Put a `scope` inside the loop when each iteration should release its capture before the next iteration. | `TASK-7`, `TASK-15`, `TASK-16` |
| Collection waits | Waiting for one dynamically selected `Task<T>` does not release captures from other tasks that might be selected. A task that holds a reference to another task also cannot release that task's capture when only the first is awaited. `wait for` a `List<Task<T>>` joins every child in the list and releases their captures. | `TASK-18`, `TASK-19` |
| Checked child errors | Starting a child checks errors in its argument expressions. An error from the scheduled operation is checked at `wait for` or at the implicit scope join. Within the same scope, the checker knows the child's declared errors. A helper given a public `Task<T>` parameter handles or declares `Error`, since that type does not carry a narrower error list. | `ERROR-1`, `ERROR-3` |

The compiler tracks object origins through aliases and fields. It can reject code when it cannot prove that two references are separate. [The language guide](reference.md#ownership-and-read-access) explains `own`, `borrow`, `freeze`, and `Shared<T>`.

## What native execution guarantees

| Rule | Developer-visible behavior | Conformance case |
| --- | --- | --- |
| Owned cleanup | An owned local is dropped once after normal scope exit or a checked error. Moving it transfers that responsibility. An owned `Shared<T>` drops its transferred payload. | `OWN-1`, `OWN-2`, `SHARED-1` |
| Scope exit | Leaving a scope, including by `return`, joins its children before the caller resumes and before the scope releases owned dependencies. An inner scope's join releases its capture for later outer code. Captured resources remain live through collection pressure and drop once after the join. | `CLEANUP-2`, `TASK-5`, `TASK-6`; [resource join test](../tests/concurrency.test.mjs) |
| `always` | Cleanup runs before a returned result is observed and while a cancelled child unwinds. | `CLEANUP-1`, `CANCEL-1` |
| Child failure | An unhandled child failure cancels siblings. Their `always` cleanup finishes before the error leaves the scope. An error already in flight from the parent remains primary if child cleanup also fails. | `CANCEL-1`, `ERROR-2` |
| Syntax choice | Brace blocks and indented blocks run the same ownership and task behavior. | `SYNTAX-1` |

Tasks currently run cooperatively on one OS thread. A long loop reaches cancellation at compiler-inserted checkpoints. `Shared<T>` is the explicit path for synchronized mutable state. The runtime does not yet promise parallel CPU execution.

Scheduling an owned input transfers its cleanup responsibility immediately. If
a sibling cancels the child before entry, the scheduler releases that input.
The checker rejects owned task results, including inferred `Task<T>` results,
until the public task type has an owned-result transfer contract. Both backends
exercise these cases in the concurrency suite.

Run the focused suite with `node --test tests/language-conformance.test.mjs`. The full repository test command also runs existing [concurrency](../tests/concurrency.test.mjs), ownership, errors, formatter, and generated-spec tests. This suite is growing through adversarial review; a green run does not establish complete ownership safety. The [roadmap](roadmap.md) keeps the language semantics gate open until independent review and the full conformance evidence justify closure.
