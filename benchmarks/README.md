# Reproducible comparisons

`npm run bench:compare` compiles the August projects and an optimized C reference, then compares C, Node and Python on identical valid inputs and checked outputs. Each CPU/batch sample is a fresh process; memory measurements are separate. Native HTTP uses the same JSON response as Node.

| Project | Work |
| --- | --- |
| `startup` | Print one integer. |
| `cpu` | Two million dependent integer arithmetic iterations. |
| `collections` | Insert 20,000 Map/Set values and sum matching entries; the runner also generates a 200,000-entry variant. |
| `json` | 5,000 parse / record decode / encode cycles. |
| `http` | Construct a typed JSON response for GET /bench, served on an automatically chosen loopback port. |

The reference C tables specialize integers and use preallocated capacity; August, Node and Python use their normal generic containers. C JSON uses yyjson with type probes rather than August's full record-binding path. Read the methodology before interpreting differences.

See [performance graphs, actual August examples, and commands](../docs/performance.md). Generated binaries, reference builds and plot environments live in ignored `.aug-build`; raw measured results and vector graphs live in the wiki. The runner accepts `--iterations`, `--warmup`, `--http-rounds`, `--http-requests`, and `--skip-http`. It terminates only its own temporary HTTP servers.

Use `--only cpu,collections-200k` or `--only http` for focused measurements. These write `.aug-build/benchmarks/results-focused.json` and preserve the full wiki report. `--output PATH` selects another output. The source SHA-256 in new reports identifies the compiler, runtime, benchmark, and script inputs.

`node scripts/http-load.mjs --url http://127.0.0.1:PORT/bench --concurrency 64` runs the same response-validating HTTP load generator against a running server. It measures HTTP/1.1 without TLS; `--expected` accepts a JSON result for your own endpoint. CLI rounds reuse the running server; the comparison suite starts fresh servers for each round.
