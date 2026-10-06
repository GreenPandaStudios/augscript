---
title: "Diagrams · Labeled calls and injection"
generated: true
source: "examples/new-syntax/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Labeled calls and injection diagrams

[Labeled calls and injection](../index.md)

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
    n1["console.aug"]
    n2["greeter.aug"]
    n3["logger.aug"]
    n4["main.aug"]
    n5["math.aug"]
    n1 -->|"uses"| n0
    n1 -->|"uses"| n3
    n2 -->|"uses"| n0
    n2 -->|"uses"| n3
    n3 -->|"uses"| n0
    n4 -->|"uses"| n2
    n4 -->|"uses"| n5
```

### Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| console.aug | [Interactions and sequences](../console-diagrams.md) | [Explanation](../console.md) |
| greeter.aug | [Interactions and sequences](../greeter-diagrams.md) | [Explanation](../greeter.md) |
| logger.aug | [Interactions and sequences](../logger-diagrams.md) | [Explanation](../logger.md) |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
| math.aug | [Interactions and sequences](../math-diagrams.md) | [Explanation](../math.md) |
