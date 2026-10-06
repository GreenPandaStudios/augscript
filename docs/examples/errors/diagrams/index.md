---
title: "Diagrams · Checked failures"
generated: true
source: "examples/errors/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Checked failures diagrams

[Checked failures](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

### Areas

```mermaid
flowchart TD
    n0["Project root"]

```

### Modules

```mermaid
flowchart TD
    n0["errors.aug"]
    n1["main.aug"]
    n1 -->|"uses"| n0
```

### Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| errors.aug | [Interactions and sequences](../errors-diagrams.md) | [Explanation](../errors.md) |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
