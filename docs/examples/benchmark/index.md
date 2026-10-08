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

Start with the [project overview](diagrams/index.md), then open an operation’s sequence or explanation. Source stays beside its spec when you need to inspect an expression. Choose **Indentation** or **Braces** for that code view; the choice carries across files.

[Explore the generated project diagrams](diagrams/index.md) to follow data between folders, then open module interactions and API sequences.

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
