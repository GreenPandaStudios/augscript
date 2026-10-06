---
title: "GPU workers"
generated: true
source: "examples/native-gpu"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# GPU workers

Create Metal buffers inside isolated workers, add vectors on the GPU, and return copied results. Requires the August 0.23.0 preview, Apple Silicon, and macOS 14 or later with an available Metal GPU.

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

[Explore the generated project diagrams](diagrams/index.md) to move from areas and modules to class interactions and API sequences.

## Project files

- [`main.aug`](main.md)
- [`compute.aug`](compute.md)

- [`main.yaml`](main-yaml.md)

## Try this project

[Download this project](/downloads/native-gpu.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd native-gpu
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)
