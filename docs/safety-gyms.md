# Safety gyms

A gym is a repeatable exercise for the compiler and runtime. It generates programs, checks their results against an independently written oracle, and saves enough information to replay a failure. The [performance suite](performance.md) measures how quickly a correct program runs. These gyms check whether the program behaves correctly in the first place.

The current suite exercises LLVM output in development and optimized builds. It also checks operations the compiler must reject, stresses allocation and cleanup, and runs native memory instrumentation. The [recorded qualification](qualification-results.md) lists the actual host, source fingerprint, cases, mutations and skipped checks. Passing these exercises is finite evidence for the paths tested; it is not a proof that every August program or native library is safe.

## What gets exercised

Each generated exercise uses a fixed seed and a bounded input domain. The default is 256 generated vectors per exercise, plus fixed edge cases. Changing the seed explores another reproducible set of inputs.

| Exercise | What the program does | How its result is checked |
| --- | --- | --- |
| Integer arithmetic | Combine signed 64-bit values, including extremes, large exact integers, division and short circuiting. | A JavaScript BigInt oracle applies August's wrapping rules after each operation. |
| Floating-point arithmetic | Call operations with integer and float values, including widened integers, signed zero, infinities and NaN comparisons. | Separately calculated integer or IEEE results become checked equality cases; zero division must raise the checked error. |
| Collections | Insert, read, replace and remove map entries; add duplicate set values and check membership. | Independent JavaScript Map and Set states supply every expected result. |
| Control flow | Call a function with varied values and branch boundaries. | A separate conditional calculation supplies the expected return. |
| Checked bounds | Read valid, negative and out-of-range list indices. | Valid reads return the expected element; invalid reads must reach the IndexError catch. |
| Cleanup | Create an owned resource, throw inside its scope and catch the failure. | Every iteration must report exactly one Resource drop before the program finishes. |
| Tasks | Start a child operation, join it and accumulate its return value. | An independently calculated sum checks that each result was delivered. |

The larger qualification also runs the existing ownership and cancellation cases, source mutations, native ABI boundary tests, package-integrity tests, HTTP policies and transport cleanup, and sanitizer stress programs. Public native-library qualification separately exercises real LibTorch, SQLite, zlib and BLAKE3 resources. The [native implementation report](native-implementation.md) describes those release checks and their remaining limits.

## Why the suite breaks its own programs

A test that accepts every program is useless. Each generated exercise therefore has a deliberately faulty version that remains valid August and runs to completion. The suite reverses a comparison, substitutes lookup for removal, changes an arithmetic operation, alters an index, removes resource construction, or changes a task result. Each fault must change the independently expected behavior.

A surviving fault fails qualification. A mutant that cannot compile, crashes or times out also fails this bounded exercise: it cannot stand in for a successfully detected wrong result. Reports retain the original and faulty source units, expected output, actual output and cleanup counts. These mutations cover selected faults; they do not measure detection of every possible compiler or application defect.

The compiler rejection cases are a separate gate. They attempt a second ownership move, an alias read during a mutable borrow, an unhandled error, an unlabeled input, a native call without unsafe, a task outside its required scope, a record write and a private export. Each must fail for the relevant contract, rather than an unrelated parse error.

## Memory checks and their limits

The sanitizer circuit instruments the actual August LLVM IR with AddressSanitizer and compiles the core C runtime with AddressSanitizer and UBSan. It runs retained text under collection pressure, Map/Set growth and deletion, task joining, and owned Shared transfer. An intentionally out-of-bounds LLVM store must be detected as a negative control.

AddressSanitizer checks instrumented memory accesses; UBSan checks selected undefined operations in the runtime C. Neither replaces ownership checking or a behavior oracle. Prebuilt third-party library internals are not covered by these core sanitizer runs. Leak detection is disabled in this shared gate; explicit native allocation counters and owned-drop cases provide separate cleanup evidence. This is not a coverage-guided fuzzer or a universal race, leak or protocol proof. The [research note](research/qualification-methods.md) explains the choice of checks.

## Use the evidence for your project

Choose a [downloadable measured program](examples/index.md#measured-programs) that resembles your workload. Read its code and compiled spec, then run it with the published CLI. Add your application's expected results and failure cases as [same-file tests](testing.md). Use [project benchmarks](performance.md#benchmark-your-own-project) to measure that tested behavior under your own deployment conditions.

Language contributors can reproduce the full reports, change seeds, replay saved cases and add exercises using the [qualification workflow](contributing-benchmarks.md#run-the-safety-gyms). That workflow requires maintainer tools for the C references and instrumented runtime; ordinary package consumers do not need them.
