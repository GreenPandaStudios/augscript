# Maintain the comparison suite

This contributor workflow updates the recorded measurements and charts. Work in the August source workspace with Node 24+, Python and a C11 compiler. Application developers can [download the measured programs](examples/index.md#measured-programs) and use [the project benchmark commands](performance.md#benchmark-your-own-project).

```sh
npm ci
export MACOSX_DEPLOYMENT_TARGET=14.0
node scripts/bootstrap-native.mjs
node scripts/prepare-llvm-tools.mjs
node scripts/build-runtime-pack.mjs
AUG_LLVM_HOME="$PWD/.aug-build/llvm-tools" npm run bench:compare -- --http-rounds 5
```

The suite defaults to LLVM. `--backend c` selects the migration reference, and `--backend llvm --compare-c-backend` measures both backends on the same August programs. Set `AUG_BENCH_PYTHON=/path/to/python3` or `CC=/path/to/clang` to select the reference interpreter/compiler. `AUG_NATIVE_HOME` selects the native dependency cache. The raw result file records versions, LLVM tool/runtime identities and a source fingerprint. Compilation timings are included separately from executable run time. On macOS, prepare native dependencies for the advertised macOS 14 deployment floor before building the runtime pack.

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

Focused runs write `.aug-build/benchmarks/results-focused.json`. Use `--output PATH` to keep separate reports. Render graphs, tables and the exact source examples from the full result file using Python 3.12+:

```sh
python3 -m venv .aug-build/benchmark-plotting
.aug-build/benchmark-plotting/bin/python -m pip install -r benchmarks/plot-requirements.txt
.aug-build/benchmark-plotting/bin/python scripts/render-benchmarks.py
.aug-build/benchmark-plotting/bin/python scripts/render-benchmarks.py --check
npm run docs:build
```

The plot environment is isolated and ignored; published documentation includes the rendered graphs and needs no Python installation. Review this page's environment, interpretations and limitations when replacing measurements. Short exploratory runs can use `--iterations 3 --warmup 1 --http-rounds 1 --http-requests 1000`; they have less statistical coverage.
