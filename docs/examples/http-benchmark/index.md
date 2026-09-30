---
title: "HTTP benchmark"
generated: true
source: "benchmarks/http"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# HTTP benchmark

Serve the typed JSON endpoint used in the throughput measurements.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`routes.aug`](routes.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check benchmarks/http
aug spec benchmarks/http
aug run benchmarks/http
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
