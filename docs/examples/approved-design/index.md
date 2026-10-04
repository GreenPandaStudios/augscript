---
title: "Modules and composition"
generated: true
source: "examples/approved-design"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Modules and composition

Supply a scoped counter and call a doubling function that rejects negative inputs.

Open a file to read the code beside its compiled explanation. Choose **Indentation** or **Braces** to change the code view. The choice carries across files.

## Follow the program

Read [`main.aug`](main.md). Follow the domain imports, provider choices, explicit scope, and checked failure before opening the implementation files.

Read [`domain/export.aug`](domain/export.md). The export file chooses the declarations callers can import.

Read [`domain/numbers.aug`](domain/numbers.md). The validation interceptor rejects a negative input. Tests cover successful doubling and recovery from that failure.

## Project files

- [`main.aug`](main.md)
- [`counters.aug`](counters.md)
- [`domain/app.aug`](domain/app.md)
- [`domain/export.aug`](domain/export.md)
- [`domain/models.aug`](domain/models.md)
- [`domain/numbers.aug`](domain/numbers.md)

- [`main.yaml`](main-yaml.md)

## Try this project

[Download this project](/downloads/approved-design.zip), then extract the archive in an empty working folder. It contains source, configuration, and compiled specs. [Install August](../../getting-started.md) once, then run these commands. Native libraries are prepared automatically when needed:

```sh
cd approved-design
aug check .
aug spec .
aug test .
aug run .
```

[Browse all examples](../index.md)
