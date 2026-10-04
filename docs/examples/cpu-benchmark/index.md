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

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

## Project files

- [`main.aug`](main.md)


## Try this project

[Download this project](/downloads/cpu-benchmark.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd cpu-benchmark
aug check .
aug spec .
aug run .
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
