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

Start with the [project overview](diagrams/index.md), then open an operation’s sequence or explanation. Source stays beside its spec when you need to inspect an expression. Choose **Indentation** or **Braces** for that code view; the choice carries across files.

[Explore the generated project diagrams](diagrams/index.md) to follow data between folders, then open module interactions and API sequences.

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
