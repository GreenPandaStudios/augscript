---
title: "Startup benchmark"
generated: true
source: "benchmarks/startup"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Startup benchmark

The small program used to measure process startup.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check benchmarks/startup
aug spec benchmarks/startup
aug run benchmarks/startup
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
