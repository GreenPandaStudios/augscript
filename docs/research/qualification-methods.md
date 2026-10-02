# Performance and safety qualification methods

Reviewed October 2, 2026. These sources inform the suite's design; August's programs and oracles are original.

LLVM's test suite checks reference outputs and collects execution, compilation and code-size measurements. It distinguishes correctness tests from programs useful for benchmarking. August adopts that separation: every timed sample must produce the required result, while the safety gyms also exercise rejection, cleanup and deliberate faults. This is an architectural choice based on the [LLVM test-suite guide](https://llvm.org/docs/TestSuiteGuide.html#structure), not a claim that August runs LLVM's external benchmark corpus.

The [AddressSanitizer documentation](https://clang.llvm.org/docs/AddressSanitizer.html#introduction) describes memory instrumentation and its supported checks. August instruments its emitted LLVM program as well as the core runtime and requires a failing out-of-bounds-store control. An uninstrumented foreign library is outside that check's internal coverage. The current common gate disables leak detection; native resource counters and drop traces are separate observations, not an equivalent whole-process leak proof.

[UBSan's documentation](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html#available-checks) lists checks and exclusions. August applies address/undefined instrumentation to the C runtime. This does not constitute UBSan coverage of every LLVM operation, third-party binary or intentional wrapping integer operation. Floating-point infinity and NaN behavior is checked by result oracles without fast-math.

Measurements use rotated implementation order, fresh executable processes, warmups, raw samples and independent output checks. Batch clients run outside the compiler process, so the measurement client does not retain compiler allocations. More samples improve the basis for the median but cannot remove host scheduling, thermal or deployment differences. The frozen LLVM migration thresholds remain unchanged.

The extended C references expose their differences: concrete C values, explicit cleanup, a dense ordered map with linear searches, and sequential calls for the task case. These are baselines for the measured operations; their runtime work differs from August's. August's C backend is measured separately on the same August source to isolate migration regressions. No aggregate “as fast as C” or production-safety score follows from these workloads.

The generated gyms save seeds, input bounds, source units, expected results and deliberate behavioral mutants. Invalid domains and infrastructure failures cannot count as passing tests or detected mutations. Independent behavioral requirements remain necessary for application correctness; neither the generated spec nor compiler acceptance is an acceptance oracle.
