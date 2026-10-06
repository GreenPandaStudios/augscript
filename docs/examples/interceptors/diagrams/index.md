---
title: "Function and constructor middleware diagrams"
generated: true
source: "examples/interceptors/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Function and constructor middleware diagrams

[Function and constructor middleware](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

## Areas

```mermaid
flowchart TD
    n0["August library"]
    n1["Project root"]
    n1 -->|"uses"| n0
```

## Modules

```mermaid
flowchart TD
    n0["app.aug"]
    n1["august/io/contracts.aug"]
    n2["interceptors.aug"]
    n3["logging.aug"]
    n4["main.aug"]
    n0 -->|"uses"| n1
    n0 -->|"uses"| n2
    n0 -->|"uses"| n3
    n2 -->|"uses"| n1
    n2 -->|"uses"| n3
    n3 -->|"uses"| n1
    n4 -->|"uses"| n0
    n4 -->|"uses"| n1
    n4 -->|"uses"| n2
    n4 -->|"uses"| n3
```

## Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| app.aug | [Interactions and sequences](../app-diagrams.md) | [Explanation](../app.md) |
| interceptors.aug | [Interactions and sequences](../interceptors-diagrams.md) | [Explanation](../interceptors.md) |
| logging.aug | [Interactions and sequences](../logging-diagrams.md) | [Explanation](../logging.md) |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
