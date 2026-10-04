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

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

## Project files

- [`main.aug`](main.md)

- [`main.yaml`](main-yaml.md)

## Try this project

[Download this project](/downloads/benchmark.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd benchmark
aug check .
aug spec .
aug run .
```

[Browse all examples](../index.md)
