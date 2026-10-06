---
title: "Generic types and functions diagrams"
generated: true
source: "examples/generics/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Generic types and functions diagrams

[Generic types and functions](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

## Areas

```mermaid
flowchart TD
    n0["Project root"]

```

## Modules

```mermaid
flowchart TD
    n0["main.aug"]
    n1["types.aug"]
    n0 -->|"uses"| n1
```

## Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
| types.aug | [Interactions and sequences](../types-diagrams.md) | [Explanation](../types.md) |
