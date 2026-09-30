---
title: "Startup benchmark"
generated: true
source: "benchmarks/startup"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Startup benchmark

The small program used to measure process startup.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)


## Try this project

[Download this project](/downloads/startup-benchmark.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. Prepare the [native dependencies](../../packages.md#npm-registry) once, then use the published CLI:

```sh
cd startup-benchmark
npx @greenpandastudios/aug-cli@next check .
npx @greenpandastudios/aug-cli@next spec .
npx @greenpandastudios/aug-cli@next run .
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
