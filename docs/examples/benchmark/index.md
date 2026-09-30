---
title: "A finite benchmark"
generated: true
source: "examples/benchmark"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# A finite benchmark

Measure a deterministic arithmetic workload with aug bench.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)

- [`main.yaml`](main-yaml.md)

## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check examples/benchmark
aug spec examples/benchmark
aug run examples/benchmark
```

[Browse all examples](../index.md)
