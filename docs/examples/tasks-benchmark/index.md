---
title: "Task scheduling benchmark"
generated: true
source: "benchmarks/tasks"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Task scheduling benchmark

Start and join two tasks in each bounded scope.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`operations.aug`](operations.md)


## Try this project

[Download this project](/downloads/tasks-benchmark.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd tasks-benchmark
aug check .
aug spec .
aug run .
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
