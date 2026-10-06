---
title: "Diagrams · GPU workers"
generated: true
source: "examples/native-gpu/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# GPU workers diagrams

[GPU workers](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

### Areas

```mermaid
flowchart TD
    n0["Project root"]
    n1["package/@greenpandastudios/aug-gpu@0.1.1"]
    n0 -->|"uses"| n1
```

### Modules

```mermaid
flowchart TD
    n0["compute.aug"]
    n1["main.aug"]
    n2["package/@greenpandastudios/aug-gpu@0.1.1/api.aug"]
    n3["package/@greenpandastudios/aug-gpu@0.1.1/contracts.aug"]
    n0 -->|"uses"| n2
    n1 -->|"uses"| n0
    n1 -->|"uses"| n3
```

### Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| compute.aug | [Interactions and sequences](../compute-diagrams.md) | [Explanation](../compute.md) |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
