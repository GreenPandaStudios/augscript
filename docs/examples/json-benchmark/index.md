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

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

[Explore the generated project diagrams](diagrams/index.md) to move from areas and modules to class interactions and API sequences.

## Project files

- [`main.aug`](main.md)
- [`data.aug`](data.md)

- [`main.yaml`](main-yaml.md)

## Try this project

[Download this project](/downloads/json-benchmark.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd json-benchmark
aug check .
aug spec .
aug run .
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
