---
title: "Diagrams · Create a package"
generated: true
source: "examples/packages/math/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Create a package diagrams

[Create a package](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

### Areas

```mermaid
flowchart TD
    n0["src"]

```

### Modules

```mermaid
flowchart TD
    n0["src/arithmetic.aug"]
    n1["src/export.aug"]

```

### Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| src/arithmetic.aug | [Interactions and sequences](../src/arithmetic-diagrams.md) | [Explanation](../src/arithmetic.md) |
| src/export.aug | [Interactions and sequences](../src/export-diagrams.md) | [Explanation](../src/export.md) |
