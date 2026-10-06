---
title: "Diagrams · Modules and composition"
generated: true
source: "examples/approved-design/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Modules and composition diagrams

[Modules and composition](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

### Areas

```mermaid
flowchart TD
    n0["August library"]
    n1["Project root"]
    n2["domain"]
    n1 -->|"uses"| n2
    n2 -->|"uses"| n0
```

### Modules

```mermaid
flowchart TD
    n0["august/io/contracts.aug"]
    n1["counters.aug"]
    n2["domain/app.aug"]
    n3["domain/export.aug"]
    n4["domain/models.aug"]
    n5["domain/numbers.aug"]
    n6["main.aug"]
    n2 -->|"uses"| n0
    n2 -->|"uses"| n4
    n6 -->|"uses"| n1
    n6 -->|"uses"| n2
    n6 -->|"uses"| n4
    n6 -->|"uses"| n5
```

### Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| counters.aug | [Interactions and sequences](../counters-diagrams.md) | [Explanation](../counters.md) |
| domain/app.aug | [Interactions and sequences](../domain/app-diagrams.md) | [Explanation](../domain/app.md) |
| domain/export.aug | [Interactions and sequences](../domain/export-diagrams.md) | [Explanation](../domain/export.md) |
| domain/models.aug | [Interactions and sequences](../domain/models-diagrams.md) | [Explanation](../domain/models.md) |
| domain/numbers.aug | [Interactions and sequences](../domain/numbers-diagrams.md) | [Explanation](../domain/numbers.md) |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
