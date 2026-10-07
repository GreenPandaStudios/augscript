---
generatedBy: scripts/render-qualification.mjs
---
# Extended performance and safety results

These results cover August 1.0.0 on **Apple M5**, darwin 25.6.0 arm64, recorded 2026-10-07. August uses LLVM 23.1.2. Every measured program produced its expected result. These measurements apply to this host and workload.

## Eight more C comparisons

::: benchmark-chart kernels
:::

Each value is the median of 30 fresh executable processes after 3 warmups. Order rotates within a separate measurement process. Timings include startup and exclude compilation. Both implementations use O2 without LTO or fast-math. [Raw samples, build times and code sizes](kernel-results.json) also include the same August programs compiled through the C migration backend.

| Program and code/spec | Work per run | August | C | August / C |
| --- | ---: | ---: | ---: | ---: |
| [Floating-point loop](examples/float-benchmark/main.md) | 1,000,000 | 2.16 ms | 1.62 ms | 1.33 |
| [Labeled function calls](examples/calls-benchmark/main.md) | 200,000 | 3.60 ms | 1.77 ms | 2.04 |
| [List traversal](examples/list-benchmark/main.md) | 100,000 | 1.97 ms | 1.18 ms | 1.68 |
| [String processing](examples/strings-benchmark/main.md) | 20,000 | 9.46 ms | 2.74 ms | 3.45 |
| [Map deletion and refill](examples/map-churn-benchmark/main.md) | 4,000 | 4.71 ms | 4.17 ms | 1.13 |
| [Checked failures](examples/errors-benchmark/main.md) | 20,000 | 1.57 ms | 1.12 ms | 1.40 |
| [Record allocation](examples/records-benchmark/main.md) | 50,000 | 10.89 ms | 2.06 ms | 5.28 |
| [Task scheduling](examples/tasks-benchmark/main.md) | 2,000 | 4.05 ms | 1.12 ms | 3.61 |

Ratios above 1 mean August took longer. The C references use concrete values and explicit cleanup. Their ordered map uses linear searches and their task case makes sequential calls; it does not pay for a scheduler. The string reference copies each part, while August also creates managed strings and a list. Records retain individually allocated values in both programs, with different layouts and lifetime tracking. The timings include these differences in the work performed. [Read the C references](https://github.com/GreenPandaStudios/augscript/blob/main/benchmarks/kernels.c) before drawing conclusions.

The float program checks its exact accumulated binary-fraction result. The call loop carries each result into the next call. Lists and records retain data and read it afterward. Map deletion checks reinsertion order as well as values. Error cases verify both the sum and number of failures; task cases verify the joined sum. Their [downloadable projects](examples/index.md#measured-programs) show code beside compiled specs in either indentation or braces style.

## Safety qualification

Seed **877966**, generator version **1**, 256 generated vectors per exercise plus fixed edge cases. Both development and optimized LLVM builds ran the corpus.

| Exercise | Vectors executed across both builds | Result |
| --- | ---: | --- |
| arithmetic | 516 | Passed; both behavioral mutations detected |
| floating-point | 520 | Passed; both behavioral mutations detected |
| collections | 516 | Passed; both behavioral mutations detected |
| control-flow | 516 | Passed; both behavioral mutations detected |
| checked-bounds | 520 | Passed; both behavioral mutations detected |
| cleanup | 512 | Passed; both behavioral mutations detected |
| tasks | 512 | Passed; both behavioral mutations detected |

The suite executed **3612 generated/edge-case checks**, rejected **8 forbidden contracts**, and detected **14 valid behavioral mutants**. Each deliberately faulty program compiled and finished, but produced a wrong result or cleanup count compared with the independent oracle.

| Additional circuit | Executed tests | Skipped tests | Result |
| --- | ---: | ---: | --- |
| source-mutations | 3 | 0 | passed |
| ownership-concurrency | 53 | 0 | passed |
| native-boundaries | 2 | 0 | passed |
| package-integrity | 37 | 0 | passed |
| http-boundaries | 6 | 0 | passed |
| sanitizers | LLVM instrumentation + overflow negative control | 0 | passed |

[The full report](gym-results.json) includes original and faulty source units, inputs, expected and actual results, cleanup counts, compiler source identity and commands. Source mutation includes 5,000 parser cases and 1,000 checker cases. Core sanitizers instrument August LLVM accesses and the C runtime; they do not instrument the interiors of prebuilt foreign libraries or establish a whole-process leak proof.

The [safety gym guide](safety-gyms.md) explains each gate and its limits. [Contributor commands](contributing-benchmarks.md) reproduce these reports or explore another seed. New-platform CI reports remain separate until that target completes qualification.

## Source identity

Both reports use source SHA-256 `b0908546922a5b6d88fe4bc0436629dc67331d96049d935989a9b85bef0a1b44`. This fingerprints compiler, runtime, native platform inputs, package contracts, configuration, dependencies, test fixtures, generators and measured programs. These results describe that snapshot. Rerun the suite to measure changed code.
