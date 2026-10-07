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

Start with the [project overview](diagrams/index.md), then open an operation’s sequence or explanation. Source stays beside its spec when you need to inspect an expression. Choose **Indentation** or **Braces** for that code view; the choice carries across files.

## Follow the program

Read the explanation of [`main.aug`](main.md#specification). Follow the domain imports, provider choices, explicit scope, and checked failure before opening the implementation files.

Read the explanation of [`domain/export.aug`](domain/export.md#specification). The export file chooses the declarations callers can import.

Read the explanation of [`domain/numbers.aug`](domain/numbers.md#specification). The validation interceptor rejects a negative input. Tests cover successful doubling and recovery from that failure.

[Explore the generated project diagrams](diagrams/index.md) to follow data between folders, then open module interactions and API sequences.

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
