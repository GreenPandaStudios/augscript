---
title: "JSON benchmark"
generated: true
source: "benchmarks/json"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# JSON benchmark

Parse, decode, and serialize a typed record 5,000 times.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`data.aug`](data.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check benchmarks/json
aug spec benchmarks/json
aug run benchmarks/json
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
