---
title: "Diagrams · JSON benchmark"
generated: true
source: "benchmarks/json/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# JSON benchmark diagrams

[JSON benchmark](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

### Areas

```mermaid
flowchart TD
    n0["Project root"]
    n1["package/@git/url_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301"]
    n0 -->|"uses"| n1
```

### Modules

```mermaid
flowchart TD
    n0["data.aug"]
    n1["main.aug"]
    n2["package/@git/url_2d3c37c690c0fa115be1@0.0.0-git.a39fc582565d4fca40be4f75fa304d71adc69301/contracts.aug"]
    n1 -->|"uses"| n2
```

### Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| data.aug | [Interactions and sequences](../data-diagrams.md) | [Explanation](../data.md) |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
