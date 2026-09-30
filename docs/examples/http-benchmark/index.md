---
title: "HTTP benchmark"
generated: true
source: "benchmarks/http"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# HTTP benchmark

Serve the typed JSON endpoint used in the throughput measurements.

Open a file to read its source beside the explanation produced by `aug spec`. **Indentation** and **Braces** display the same checked program; your choice carries across file pages.

## Project files

- [`main.aug`](main.md)
- [`routes.aug`](routes.md)


## Try this project

[Download this project](/downloads/http-benchmark.zip), then extract the archive in an empty working folder. It contains the checked source, configuration, and generated specs. Prepare the [native dependencies](../../packages.md#npm-registry) once, then use the published CLI:

```sh
cd http-benchmark
npx @greenpandastudios/aug-cli@next check .
npx @greenpandastudios/aug-cli@next spec .
npx @greenpandastudios/aug-cli@next run .
```

See [the performance page](../../performance.md) for measurements, input sizes, and reproduction steps.

[Browse all examples](../index.md)
