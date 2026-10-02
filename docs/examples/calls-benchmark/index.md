---
title: "Function-call benchmark"
generated: true
source: "benchmarks/calls"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Function-call benchmark

Call a labeled function repeatedly with a dependent integer result.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`operations.aug`](operations.md)


## Try this project

[Download this project](/downloads/calls-benchmark.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd calls-benchmark
aug check .
aug spec .
aug run .
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
