---
title: "CPU benchmark"
generated: true
source: "benchmarks/cpu"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# CPU benchmark

Two million dependent integer steps with a checked result.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check benchmarks/cpu
aug spec benchmarks/cpu
aug run benchmarks/cpu
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
