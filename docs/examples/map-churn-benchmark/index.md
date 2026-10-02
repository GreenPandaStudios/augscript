---
title: "Map deletion benchmark"
generated: true
source: "benchmarks/map-churn"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Map deletion benchmark

Delete, replace and reinsert entries, then check values and insertion order.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)


## Try this project

[Download this project](/downloads/map-churn-benchmark.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd map-churn-benchmark
aug check .
aug spec .
aug run .
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
