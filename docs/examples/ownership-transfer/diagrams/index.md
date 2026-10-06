---
title: "Move ownership diagrams"
generated: true
source: "examples/ownership-transfer/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Move ownership diagrams

[Move ownership](../index.md)

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
    n0["august/io/contracts.aug"]
    n1["main.aug"]
    n2["resource.aug"]
    n1 -->|"uses"| n0
    n1 -->|"uses"| n2
    n2 -->|"uses"| n0
```

## Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
| resource.aug | [Interactions and sequences](../resource-diagrams.md) | [Explanation](../resource.md) |
