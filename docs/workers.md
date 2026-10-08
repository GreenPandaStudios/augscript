# Multicore workers

A worker runs a task on an OS thread with its own heap. Use it for CPU work or for a native operation that should run away from the request or main task. It uses the same `Task<T>`, `scope`, and `wait for` operations as other August tasks.

These examples use August 1.0. Cooperative tasks use their current heap; `start worker` uses an isolated heap on an OS thread.

## Start work and read the results

This program totals two lists. The two workers can run at the same time, and the wait returns their results in the written order.

```aug project=worker-guide file=totals.aug
/** Total a list without changing it. */
total(List<int> values) returns int:
    int result = 0
    for value in values:
        result = result + value
    return result
```

```aug project=worker-guide file=main.aug
import total from totals

try:
    scope:
        first = start worker total(values=[4, 6])
        second = start worker total(values=[2, 3])
        wait for first and second as firstTotal and secondTotal
        print(value=firstTotal)
        print(value=secondTotal)
catch ConcurrencyError error:
    print(value="Worker capacity is exhausted")
```

The output is `10` and `5`, each on its own line. A list of worker tasks can also be passed to `wait for`; the result is a list in the same order. Every worker belongs to its starting scope. Leaving that scope joins its workers before releasing local resources, including when the function returns or raises an error.

Ordinary `start` continues to schedule cooperative work on its current heap. `start worker` copies the function's inputs before returning to the caller. The caller can then change its own collection while the worker uses its copy. The worker's result is copied back after it finishes. No August object is shared between worker heaps.

## Map a list in bounded waves

Use `mapWorkers` to transform copied values on isolated workers. Import it from `august.collections` and supply a named pure function. This example doubles five integers with two values per chunk and at most two chunk jobs in each wave.

```aug project=worker-map-guide file=calculations.aug
/** Double one integer without changing any state. */
double(int value) returns int:
    return value * 2
```

```aug project=worker-map-guide file=main.aug
import mapWorkers from august.collections
import double from calculations

try:
    doubled = mapWorkers(
        values=[1, 2, 3, 4, 5],
        concurrency=2,
        chunkSize=2,
        transformation=double
    )
    for value in doubled:
        print(value)
catch ConversionError error:
    print(value="Invalid mapping bounds")
catch ConcurrencyError error:
    print(value="Worker capacity is exhausted")
catch IndexError error:
    print(value="Invalid snapshot index")
```

The output is `2`, `4`, `6`, `8`, and `10`, each on its own line. The first wave runs two chunks, joins them, then starts the final one-value chunk. Results keep input order even when a later chunk finishes first. The input list is unchanged. `concurrency=1` still runs actual workers; it does not turn the operation into a local loop.

Choose a concurrency from 1 through 64 and a chunk size from 1 through 65536. The input may contain at most 1048576 values. Invalid bounds raise `ConversionError` before any job starts, including with an empty list. A valid empty input returns an empty list. Pool admission and copied-input limits can raise `ConcurrencyError`; jobs already admitted in that wave are cancelled and joined before the error returns. The checked snapshot reads retain `IndexError`, although their indices stay within the snapshot.

Both input and output types must be copied worker data. The transformation has one managed input labeled `value`, with no generic parameters, injection, ownership transfer, checked failures, effects, or reachable task starts. A closure, stored function value, or behavior object cannot be used here. Native calls still need their package's `workerSafe` contract. The compiler resolves the named function and builds a chunk entry that calls it directly, so no callback object crosses the heap boundary. The compiled explanation and diagrams name this function and show the wave boundary.

Concurrency limits this call's chunk jobs; it neither reserves pool threads nor changes process limits. Each wave waits for its slowest chunk. Cancellation prevents later waves and joins the current one. Choose substantial chunks to spread copying and scheduling costs across useful work. These bounds do not limit result bytes, retained output, or worker heap size.

## Keep dependencies and resources local

Worker boundaries accept scalars, strings, immutable records, bytes, JSON, and lists, sets, maps, or tuples containing copied data. Optional data keeps its value or null. Repeated references within the inputs remain repeated references within the copied graph.

Start a standalone function. Its entry parameters are ordinary copied inputs: they cannot be `resolve`, `own`, or `borrow`. Behavior objects, `Shared<T>`, tasks, and native handles cannot cross this boundary. Construct services and acquire resources inside the worker, use them there, then return their data. Concrete errors also need copied fields. Open generic inputs that cannot be checked as copied data are rejected.

A native package must declare `workerSafe: true` for the functions a worker reaches. This is the author's promise that independent instances, their release functions, and any library bookkeeping support calls on worker threads. The compiler checks that the declaration exists; native code still needs review and tests. The default is false. Unqualified native calls and HTTP transport stay on their creating heap.

## Errors and cancellation

Workers retain checked errors. Handle them at `wait for` or propagate them from the enclosing function. An unhandled child error cancels its siblings, and the scope waits for their cleanup. An error already leaving the parent remains primary.

August loops and calls reach cancellation checkpoints. A synchronous native operation keeps its resources until it returns. Adapters can inspect the read-only `aug_native_cancelled_v1` probe on the caller thread and implement a bounded cancellation protocol; August cannot interrupt arbitrary foreign code. A worker can start cooperative children or nested workers. Nested waits make progress even with a one-thread pool.

The pool defaults to the machine's reported CPU count, up to 64 threads. Set `AUG_WORKERS` to an integer from 1 through 64 to choose a limit for a process. Admission is also bounded: `AUG_WORKER_PENDING` defaults to 1024 unfinished or uncollected jobs, `AUG_WORKER_INPUT_BYTES` defaults to 16 MiB per copied input graph, and `AUG_WORKER_TOTAL_INPUT_BYTES` defaults to 64 MiB across pending input graphs. Copy accounting includes transfer metadata and transient indexing; it is not just the payload size. Inputs are checked during capture before allocating beyond the bound. `start worker` raises checked `ConcurrencyError` immediately when a limit is reached, without creating a task or changing the inputs. Catch it to reject or defer work; the runtime does not choose a retry policy. Pending reservations are released when completions are collected. These limits do not bound the worker's own heap or output. Divide a workload into substantial pieces so copying and scheduling do not dominate its work.

## GPU operations

GPU operations belong to a native package. An August worker creates a device and its buffers, submits an operation, and returns downloaded data. The native handles remain on that worker. The initial [GPU package](https://github.com/GreenPandaStudios/aug-gpu) provides Metal float32 vector addition on Apple Silicon; the [complete example](examples/native-gpu/index.md) uses ordinary repository imports and the task syntax above. It has no CPU fallback.

NVIDIA support needs a CUDA artifact and qualification on an available GPU host. It is not provided by the Metal artifact. Worker execution does not make an arbitrary August function a GPU kernel.

[Language conformance](language-conformance.md) describes the worker and task checks. [Native packages](native-packages.md) explains ownership declarations, supported targets, artifact installation, and package author responsibilities.

Same-file tests can start and join workers with the same copied-data rules. Each case checks its own setup, body and reachable declarations. It does not execute or check inactive calls from the application composition root.
