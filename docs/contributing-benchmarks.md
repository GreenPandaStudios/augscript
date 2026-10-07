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

Batch and HTTP clients each run in fresh processes. Their heaps do not retain compiler allocations or earlier workloads. Batch order rotates each round; every executable result is checked. Each HTTP round starts a fresh server, warms its client with 1,000 requests, then validates every measured response. CI records 60 batch samples and five HTTP rounds; the migration thresholds stay fixed. Failed qualification retains its raw report.

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

Shared CI hosts can produce inconsistent timings even with identical binaries. Preserve [qualified](ci-linux-arm64-qualified.json.gz), [rejected](ci-linux-arm64-rejected.json.gz), and [independent repeat](ci-linux-arm64-repeat.json.gz) reports separately. Keep their samples and binary identities attached to the pass or failure they recorded.

## Measure the homepage program

`npm run bench:greetings` compiles the canonical million-greeting project through LLVM and the independent C reference. It runs three warmups and thirty measured samples per implementation in alternating order. Both flush every line and write to a regular temporary file. Every sample verifies the full 20 MB output against an independently constructed SHA-256 outside timing. Compilation and verification are excluded; process startup and file I/O are included.

The command writes `docs/greeting-results.json`. Keep the compiler version, measured source identity, host, sample count and output digest with the results. `npm run docs:generate` checks source equality and generates the homepage source, actual compiled spec, median text, and HTML chart from that report. Publish a full run, not a short exploratory sample. This workload measures printing throughput; it does not measure repeated string concatenation or general CPU speed.

## Refresh a release’s measurements

Run the full batch/HTTP, extended-kernel, greeting and safety suites against the candidate compiler. Keep failed reports separate; replace wiki evidence only after every required case passes. Extended kernels and safety gyms must use the same measured source fingerprint. Pin the maintainer Clang to the LLVM version being instrumented: another Clang’s sanitizer runtime can fail to link the generated LLVM objects.

Retain the raw gym report and logs in the ignored build directory. When publishing its JSON, replace only the checkout’s absolute path prefix with a project-relative path. Preserve diagnostics, witnesses, results, counts and source identity. Render the tables, generate the chart summary and inspect the homepage and performance pages before publication. Reports describe their recorded snapshot; do not change their source hash to match a later documentation edit.
