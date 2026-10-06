---
title: "Diagrams · Generic dependency injection"
generated: true
source: "examples/generic-di/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Generic dependency injection diagrams

[Generic dependency injection](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

### Areas

```mermaid
flowchart TD
    n0["August library"]
    n1["Project root"]
    n1 -->|"uses"| n0
```

### Modules

```mermaid
flowchart TD
    n0["august/io/contracts.aug"]
    n1["main.aug"]
    n2["types.aug"]
    n1 -->|"uses"| n2
    n2 -->|"uses"| n0
```

### Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
| types.aug | [Interactions and sequences](../types-diagrams.md) | [Explanation](../types.md) |
