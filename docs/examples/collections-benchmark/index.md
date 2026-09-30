---
title: "Map and Set benchmark"
generated: true
source: "benchmarks/collections"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Map and Set benchmark

Insert, find, and iterate over 20,000 collection entries.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)


## Try this project

Run these commands from the repository root with [the native toolchain ready](../../getting-started.md). Use an installed `aug`, or replace it with `node bin/aug.mjs` to use the checkout compiler.

```sh
aug check benchmarks/collections
aug spec benchmarks/collections
aug run benchmarks/collections
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
