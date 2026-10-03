# Runtime reliability

An application must release resources when work succeeds, fails, or is cancelled. The runtime qualification repeats those paths under allocation pressure, checks that nested tasks make progress, and measures memory after completed work. It complements [language conformance](language-conformance.md), which checks language rules, and [safety gyms](safety-gyms.md), which compare generated programs with independent expected results.

This gate is part of the August 0.23.0 release profile. Passing a short run does not complete the 1.0 requirement. Release preparation requires a sustained run on macOS ARM64 and GNU/Linux x86-64 and ARM64, together with the existing compiler, native-package, and installed-consumer checks.

## What the tests check

The native circuit repeats five lifecycles. Each cycle joins its children, removes its roots, collects unreachable objects, and checks that tracked allocations and native resources have been released.

| Lifecycle | Required result |
| --- | --- |
| Two workers receive aliased, cyclic collection data and allocate temporary text, maps, and sets. | Each worker has its own copied graph. Local aliases and cycles survive copying; the parent's data is unchanged. |
| A cooperative child fails before a sibling receiving an owned resource starts. | The sibling does not enter its function, and its transferred input is released. |
| A parent fails after a worker enters an allocation scope. | The worker observes cancellation, finishes cleanup, and joins. The parent's error remains the reported error. |
| A worker starts a cooperative child, which starts another worker. | All waits finish, including with a one-thread pool. |
| An owned object has an owned native child and a drop method that allocates and fails. | The drop method runs once, the child is released, and cleanup preserves an existing error. |

Native resource finalizers must run on the thread that created the resource. After every completed cycle, the instrumented core and harness must have zero outstanding allocation blocks and bytes, with matching allocation and release counts. The probe moves allocations on every successful reallocation to exercise pointer changes. This allocator is test instrumentation, so its timings are not performance measurements.

Worker admission regressions reject excess pending jobs and copied input budgets before returning a task, then check that joining releases the reservation. AddressSanitizer and UBSan also exercise these failures. HTTP service qualification separately checks header dispatch, reception deadlines and draining; native PostgreSQL tests check cancellation and rollback on a disposable server. See [service boundaries](native-service-boundaries.md) for the application contracts and remaining release gates.

Separate August programs run through LLVM in development and optimized modes. They check copied collection results, grouped wait order, checked worker failures, nested cooperative work, and owned cleanup. Expected output and exact drop counts are authored independently of generated specs and compiler output. One program deliberately returns a wrong value while still compiling and exiting successfully; qualification must detect that result. A second control deliberately retains an allocation and must be rejected.

A deterministic scheduler regression delivers a worker's completion between two scheduler polls. The wait must return its result when no coroutine remains ready. This tests a timing window that previously produced a false deadlock.

## Memory and sanitizer evidence

Native runs without sanitizers sample resident memory every 250 milliseconds. Allocation accounting remains enabled, so these measurements describe the probe allocator rather than the ordinary allocator. The report discards the first fifth of samples, then compares the median of the first and last quarters of the remainder. Growth above 64 MiB fails this fixed workload. That budget is a regression threshold for these fixtures, not a memory allowance or service objective for an application.

AddressSanitizer with UBSan and ThreadSanitizer run separate circuits with one and four pool threads. Their resident memory is recorded without the growth limit because sanitizer quarantine, shadow memory, and history can grow while application allocations remain balanced. LeakSanitizer is disabled; allocation accounting and resource checks supply separate evidence.

Allocation accounting covers explicit allocations in the instrumented core and harness, including minicoro's malloc hooks. It excludes libc and pthread internals, mmap stacks, and third-party libraries. Two collection passes allow garbage created by a drop method to receive the documented later cleanup opportunity; these fixtures do not create an unbounded chain of allocating drop methods. Process termination and allocation failure do not promise graceful cleanup. HTTP, crypto, and GPU packages need their own protocol and resource qualification.

## Reproduce the gate

These are contributor commands in an August source checkout. Prepare the native dependencies, LLVM tools, and runtime pack using the [release workflow](releasing.md#verify-and-create-artifacts), then run:

```sh
export AUG_LLVM_HOME="$PWD/.aug-build/llvm-tools"
node --test tests/runtime-reliability.test.mjs
npm run test:reliability -- --profile ci
npm run test:reliability -- --profile soak
```

The `ci` profile requires at least 30 seconds for the optimized four-thread native circuit, 200 native cycles, and 200 rounds per August workload. The `soak` profile requires at least 30 minutes, 1,000 cycles, and 1,000 August rounds. Other native and sanitizer variants run burst circuits for at least one second; the sustained duration applies to the optimized four-thread circuit. All five native cases must run equally often. A run continues until both its duration and count requirements are met.

Use `--seconds`, `--cycles`, and `--rounds` to choose bounded work, and `--output PATH` to keep independent runs. Zero-sized domains, invalid durations, duplicate flags, and unsupported options fail. The default report is `.aug-build/runtime-reliability/results.json`. Its neighboring directories retain source, expected output, compiler maps, programs, stdout/stderr, and raw observation records for replay. Failed circuits retain their measurements before acceptance checks run. Passing and faulty LLVM programs have separate directories.

The compiler fingerprint includes canonical source, configuration, dependency pins and fixtures. Generated dependency/spec caches and build output do not change it; symbolic links in canonical files, source directories and root manifests are rejected. The report identifies the compiler source revision, actual LLVM executable, native compiler, minicoro input, and runtime pack. A stale runtime pack or a source change during qualification rejects the result. Reports start as running and become passed only after every check completes. A rejected invocation replaces any previous result with a failed report.

## CI and release candidates

Pull requests run the `ci` profile on all three candidate targets. Manually running **CI** or **LLVM GNU/Linux qualification** offers the `soak` profile, which is the default for those manual runs. Release producers always run `soak` before their compiler packs can be accepted for packaging. Actions retains the report and replay files alongside the platform qualification evidence.

A report establishes results only for its recorded source, runtime, platform, cases, and duration. For a trial deployment, add application-specific tests for sustained load, repeated failures, cancellation, and native cleanup. Compare measured memory with the application's own budget rather than substituting this fixture's threshold. See [production readiness](production-readiness.md) for the remaining release requirements.
