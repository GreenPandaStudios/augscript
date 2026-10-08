# Structured execution architecture

Cooperative tasks run on their current heap and OS thread. A worker task runs on a pool thread with its own heap. `start` creates a child in the current scope, and `wait for` observes results in the written order. A scope joins its children before releasing dependencies. August 1.0 supports `start worker`; channels and broadcasts are not provided.

The checker tracks captured references, ownership, mutation permissions, delayed checked errors, and possible siblings. The parent cannot mutate or move an object while a child may still use it. Waiting for one dynamically selected task does not release unrelated captures. See [ownership and task conformance](language-conformance.md) for executable cases.

The native runtime owns scheduling, task state, deadlines, cancellation, and joins. A child failure escaping its scope cancels siblings; `always` cleanup still runs. Native calls are synchronous until they return, so cancellation cannot interrupt arbitrary foreign work. Shared-state locks permit a short exclusive operation and forbid waits, starts, nested locks, and I/O inside the block.

HTTP requests each receive a dependency/task scope. Disconnects and deadlines cancel that scope, join children, and release owned values. [HTTP architecture](web-implementation-plan.md) explains transport boundaries; the [web guide](web.md) describes application use. Worker tasks use the same scope ownership, delayed errors, cancellation, and join rules. Inputs and results pass through copied value graphs; their collectors never trace another worker’s heap. Native handles stay local and require a checked package worker-safety declaration. A bounded pool helps nested jobs while waiting, so a one-thread limit can still complete nested task scopes.
