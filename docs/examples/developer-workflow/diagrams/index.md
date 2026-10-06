---
title: "A small tested application diagrams"
generated: true
source: "examples/developer-workflow/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# A small tested application diagrams

[A small tested application](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

## Areas

```mermaid
flowchart TD
    n0["August library"]
    n1["Project root"]
    n2["logging"]
    n1 -->|"uses"| n0
    n1 -->|"uses"| n2
    n2 -->|"uses"| n0
```

## Modules

```mermaid
flowchart TD
    n0["august/io/contracts.aug"]
    n1["calculator.aug"]
    n2["logging/console.aug"]
    n3["logging/export.aug"]
    n4["logging/logger.aug"]
    n5["main.aug"]
    n1 -->|"uses"| n0
    n1 -->|"uses"| n4
    n2 -->|"uses"| n0
    n2 -->|"uses"| n4
    n3 -->|"uses"| n2
    n3 -->|"uses"| n4
    n4 -->|"uses"| n0
    n5 -->|"uses"| n0
    n5 -->|"uses"| n1
    n5 -->|"uses"| n2
    n5 -->|"uses"| n4
```

## Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| calculator.aug | [Interactions and sequences](../calculator-diagrams.md) | [Explanation](../calculator.md) |
| logging/console.aug | [Interactions and sequences](../logging/console-diagrams.md) | [Explanation](../logging/console.md) |
| logging/export.aug | [Interactions and sequences](../logging/export-diagrams.md) | [Explanation](../logging/export.md) |
| logging/logger.aug | [Interactions and sequences](../logging/logger-diagrams.md) | [Explanation](../logging/logger.md) |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
