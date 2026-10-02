# August on DGX Spark

August's LLVM compiler built and ran on a physical DGX Spark on October 2, 2026. It passed the language regression suite, safety gyms, and installed-CLI checks for all four public native libraries. These are CPU results. They do not qualify GPU execution or the rest of PyTorch's API.

## Machine and measurement

The host ran Ubuntu 24.04.4 LTS, Linux 6.17.0-1021-nvidia, on a 20-core ARM64 CPU with Cortex-X925 and Cortex-A725 cores. Builds used August's Debian 12 maintainer container: glibc 2.36, Node 24.21.0, LLVM 23.1.2, and Debian Clang 14.0.6 for the independent C references. The container ran directly on the Spark's ARM64 CPU.

Timed runs were restricted to four performance cores, CPUs 5–8. Frequency and other host activity were not fixed. Each sample started a fresh executable; timings include process startup and exclude compilation. Implementation order rotated in a separate measurement process, and every output was checked. Both August and C used O2 without LTO or fast-math. Compare implementations within a row; do not treat these numbers as a comparison of Spark and the [Mac results](qualification-results.md).

The raw reports say `unknown` for the CPU model because Node did not expose its name in the container. The hardware description above comes from the host's `lscpu` inventory. The reports are preserved as recorded.

## Core workloads

::: benchmark-chart dgx-execution
:::

These medians use 60 samples after three warmups. [The full report](dgx-performance.json) includes all samples, peak memory, build times, Node and Python comparisons, and the C migration backend. The [performance guide](performance.md) explains the programs and their comparison limits.

| Program | Work per run | August LLVM | C | August / C |
| --- | ---: | ---: | ---: | ---: |
| Startup | Print one integer | 1.33 ms | 0.92 ms | 1.44 |
| Integer loop | 2,000,000 steps | 7.77 ms | 7.51 ms | 1.04 |
| Map and Set | 20,000 entries | 4.24 ms | 3.70 ms | 1.15 |
| Map and Set | 200,000 entries | 63.48 ms | 22.47 ms | 2.83 |
| JSON | 5,000 records | 7.19 ms | 1.60 ms | 4.49 |

The larger collection case and JSON still have substantial overhead. The JSON C reference parses and writes data without constructing August records. The migration check compares LLVM with the same August program compiled through C. The standalone C references perform different work, as described below.

## Eight application kernels

::: benchmark-chart dgx-kernels
:::

These medians use 30 samples after three warmups. Each linked project shows the complete August code beside its compiled explanation, with an indentation/braces switch. [Raw samples and expected results](dgx-kernels.json) retain the C migration comparison too.

| Program and code/spec | Work per run | August LLVM | C | August / C |
| --- | ---: | ---: | ---: | ---: |
| [Floating-point loop](examples/float-benchmark/main.md) | 1,000,000 | 2.15 ms | 1.57 ms | 1.37 |
| [Labeled calls](examples/calls-benchmark/main.md) | 200,000 | 2.50 ms | 1.58 ms | 1.59 |
| [List traversal](examples/list-benchmark/main.md) | 100,000 | 3.62 ms | 1.96 ms | 1.84 |
| [String processing](examples/strings-benchmark/main.md) | 20,000 | 8.29 ms | 2.07 ms | 4.00 |
| [Map deletion and refill](examples/map-churn-benchmark/main.md) | 4,000 | 5.31 ms | 4.47 ms | 1.19 |
| [Checked failures](examples/errors-benchmark/main.md) | 20,000 | 1.04 ms | 0.72 ms | 1.43 |
| [Record allocation](examples/records-benchmark/main.md) | 50,000 | 22.60 ms | 3.09 ms | 7.32 |
| [Task scheduling](examples/tasks-benchmark/main.md) | 2,000 | 8.23 ms | 1.30 ms | 6.32 |

The [C references](https://github.com/GreenPandaStudios/augscript/blob/e3c072be276e9801d348690435c08c4b146fd352/benchmarks/kernels.c) use concrete representations and explicit cleanup. The ordered map uses linear search. The task reference calls functions sequentially; it does not implement August's scheduler or cancellation rules. August also performs managed allocation and task scheduling. Those costs are included in the measurements.

## HTTP throughput

::: benchmark-chart dgx-http
:::

Each median covers five fresh server runs with 5,000 validated requests per run, after warmup. The load is HTTP/1.1 loopback with keep-alive, fixed concurrency and no TLS, authentication or logging. It measures this endpoint and client together, not a server's maximum capacity. There is no standalone C HTTP implementation in this comparison.

| Concurrent clients | August LLVM | August C backend | Node |
| --- | ---: | ---: | ---: |
| 1 | 18,441 requests/s | 16,157 requests/s | 17,271 requests/s |
| 16 | 37,864 requests/s | 38,866 requests/s | 34,749 requests/s |
| 64 | 35,395 requests/s | 36,414 requests/s | 31,815 requests/s |

## Safety and real imports

All **266 LLVM parity tests** passed with no skips, including source breakpoints and debugger variable inspection. The full [safety gym report](dgx-gyms.json) passed 3,612 generated and edge-case checks in development and optimized builds, rejected eight forbidden contracts, and detected all 14 valid behavioral mutations. All six additional circuits passed with no skipped tests: source mutations, ownership/concurrency, native boundaries, package integrity, HTTP boundaries and sanitizers.

The [installed-CLI report](dgx-consumers.json) records public URL imports and named aliases for CPU LibTorch `v0.1.4`, SQLite `v0.1.3`, zlib `v0.1.3`, and Rust BLAKE3 `v0.1.3`. The real libraries produced the expected tensor sum, database query, compression round trip and hash. Frozen/offline restores, relocated deployments, same-file tests, resource cleanup counters, tasks, JSON, clocks, crypto and HTTP forms passed too. This check used a locally supplied compiler archive before publication.

After 0.21.0 was published, a [fresh installed-CLI check](release-dgx-public-consumers.json) repeated all those operations with the public compiler and library downloads. Its source and artifact caches started empty, and no native developer tools were on the test processes' search path. The report omits only its temporary directory path. The separate clean-container CI checks remove compilers, Git and development headers from the consumer filesystem.

These finite tests do not prove arbitrary foreign code safe. Core sanitizers do not instrument the interiors of prebuilt libraries, and the coroutine gate does not establish whole-process leak freedom. Read the [gym limits](safety-gyms.md) before interpreting a pass.

## Revision

This run used commit [`e3c072b`](https://github.com/GreenPandaStudios/augscript/commit/e3c072be276e9801d348690435c08c4b146fd352). All three benchmark/gym reports carry source SHA-256 `d6afc98df62d8a40990cf4032cf01595e8c353bf7419d44ddfefa7c479681a79`, which includes the platform's prepared compiler-pack metadata. The results apply to that recorded snapshot. [Contributor instructions](contributing-benchmarks.md) explain how to produce new evidence after a change.
