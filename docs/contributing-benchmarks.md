# Maintain the comparison suite

This contributor workflow updates the recorded measurements and charts. Work in the August source workspace with Node 24+, Python and a C11 compiler. Application developers can [download the measured programs](examples/index.md#measured-programs) and use [the project benchmark commands](performance.md#benchmark-your-own-project).

```sh
npm ci
export MACOSX_DEPLOYMENT_TARGET=14.0
node scripts/bootstrap-native.mjs
node scripts/prepare-llvm-tools.mjs
node scripts/prepare-llvm-maintainer.mjs
node scripts/build-runtime-pack.mjs
AUG_LLVM_HOME="$PWD/.aug-build/llvm-tools" npm run bench:compare -- --http-rounds 5
```

The suite defaults to LLVM. `--backend c` selects the migration reference, and `--backend llvm --compare-c-backend` measures both backends on the same August programs. Set `AUG_BENCH_PYTHON=/path/to/python3` or `CC=/path/to/clang` to select the reference interpreter/compiler. `AUG_NATIVE_HOME` selects the native dependency cache. The raw result file records versions, LLVM tool/runtime identities and a source fingerprint. Compilation timings are included separately from executable run time. On macOS, prepare native dependencies for the advertised macOS 14 deployment floor before building the runtime pack.

Batch and HTTP clients each run in fresh processes. Their heaps do not retain compiler allocations or earlier workloads. Batch order rotates each round; every executable result is checked. Each HTTP round starts a fresh server, warms its client with 1,000 requests, then validates every measured response. CI records 60 batch samples and five HTTP rounds; the frozen migration thresholds remain unchanged. Failed qualification retains its raw report.

For a smaller core/JSON-only C reference run, extract its source dependencies and omit HTTP. This does not require an LLVM runtime pack:

```sh
node scripts/bootstrap-native.mjs --extract-only --only minicoro,yyjson
npm run bench:compare -- --backend c --skip-http
```

The full suite writes `docs/benchmark-results.json`; a core-only run writes `.aug-build/benchmarks/results-core.json` and preserves the complete wiki measurements. Focus on selected workloads while trying your own changes:

```sh
AUG_LLVM_HOME="$PWD/.aug-build/llvm-tools" npm run bench:compare -- --only cpu,collections-200k
AUG_LLVM_HOME="$PWD/.aug-build/llvm-tools" npm run bench:compare -- --only http --http-requests 10000
```

Focused runs write `.aug-build/benchmarks/results-focused.json`. Use `--output PATH` to keep separate reports. Refresh the tables and exact source examples with Python 3, then generate the compact data used by the HTML charts:

```sh
python3 scripts/render-benchmarks.py
python3 scripts/render-benchmarks.py --check
npm run docs:generate
npm run docs:check
npm run docs:build
```

The site renders charts as HTML and CSS, using a small generated summary rather than loading the raw reports into each page. Readers can choose implementations, show observed ranges and open the data table. No plotting library or image export is needed. Review this page's environment, interpretations and limitations when replacing measurements. Short exploratory runs can use `--iterations 3 --warmup 1 --http-rounds 1 --http-requests 1000`; they have less statistical coverage.

## Run the extended C comparisons

The eight additional projects cover floating arithmetic, labeled calls, list traversal, strings, ordered map deletion, checked failures, record allocation and task scheduling. Their August sources live beside adjacent specs in `benchmarks`; independently written C references are in `benchmarks/kernels.c`, and expected results are in `benchmarks/kernels.mjs`.

```sh
AUG_LLVM_HOME="$PWD/.aug-build/llvm-tools" npm run bench:kernels -- --iterations 30 --output docs/kernel-results.json
npm run qualification:render
```

Use `--only float,calls` to focus on selected programs, or `--output PATH` to retain another report. Each program is compiled through LLVM and the C migration backend, then measured against the standalone C reference. Every sample must match the oracle. Reports retain raw timings, build time and executable size. C task calls are sequential and the ordered C map uses linear search; do not describe those as equivalent schedulers or identical table implementations.

## Run the safety gyms

Prepare the maintainer pack as above, then run the full qualification:

```sh
AUG_LLVM_HOME="$PWD/.aug-build/llvm-tools" AUG_SANITIZER_CC="$PWD/.aug-build/llvm-maintainer/bin/clang" npm run test:gyms:full -- --seed 877966 --vectors 256 --output docs/gym-results.json
npm run qualification:render
```

`npm run test:gyms` runs generated cases, rejected contracts and behavioral mutants. The full profile adds source-mutation, ownership/concurrency, native/package, HTTP and sanitizer circuits. Seeds are unsigned 32-bit integers; vector counts must be 1 through 4,096. Empty or invalid domains fail. A full report includes circuit totals and skips instead of silently treating a skipped test as executed.

The ignored replay folder contains each complete original and faulty project with its expected output. Use the CLI version matching the report to replay a selected project with `aug run PATH --backend llvm`. Reports embed the same source units, so a CI artifact remains reviewable after its temporary folder disappears. Preserve the seed, generator version, compiler source fingerprint and failure report when adding a regression. Do not change the oracle to agree with an incorrect implementation.

After both complete reports pass, render the wiki table and HTML charts, inspect the programs and limits, and run `npm run docs:check` and `npm run docs:build`. The renderer's `--check` mode rejects stale published evidence. Do not replace a failed report with a partial or smaller passing run.

## Investigate a failed performance gate

Keep the failing report, source identity and binary/tool identities before repeating a measurement. Compare the actual samples, reference results and host information. A slower result is still a result; a passing repeat does not establish a compiler fix. Keep the same workload, sample count and acceptance limits. If an independent full repeat also fails, investigate the implementation or measurement setup before another qualification attempt.

An ARM64 CI run on October 2 exceeded the collection migration limit: LLVM took 116.80 ms and the C backend 95.43 ms, a ratio of 1.224 against the 1.20 limit. The earlier qualification measured 65.60 ms and 56.61 ms. The runtime and LLVM tools had identical hashes, and no compiler, runtime or workload source changed between them. Both backends were slower in the rejected run. The recorded CPU model is unknown, so these observations do not identify the cause or establish equal hardware conditions. The complete [passing report](ci-linux-arm64-qualified.json.gz) and [rejected report](ci-linux-arm64-rejected.json.gz) preserve the sources, samples, versions and identities as compressed JSON. The [failed job](https://github.com/GreenPandaStudios/augscript/actions/runs/37001179941) remains part of the qualification history.

One [independent full repeat](https://github.com/GreenPandaStudios/augscript/actions/runs/37003411477) on the same source head passed every gate on both Linux architectures. ARM64 measured 70.63 ms through LLVM and 61.47 ms through C, a ratio of 1.149. It used the same sample counts, runtime/tool hashes and acceptance limits. Its [complete report](ci-linux-arm64-repeat.json.gz) remains separate from the earlier measurements. The reports' overall fingerprints differ because they also include freshly prepared compiler-archive metadata; the Git revision and individual runtime/tool hashes identify the unchanged implementation. This qualifies that run; the discrepancy still limits any claim about consistent performance across shared CI hosts.
