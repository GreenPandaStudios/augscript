---
title: "Diagrams · Hello world with dependencies"
generated: true
source: "examples/hello/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Hello world with dependencies diagrams

[Hello world with dependencies](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

### Areas

```mermaid
flowchart TD
    n0["August library"]
    n1["Project root"]
    n2["app"]
    n3["logging"]
    n1 -->|"uses"| n2
    n2 -->|"uses"| n0
    n2 -->|"uses"| n3
    n3 -->|"uses"| n0
```

### Modules

```mermaid
flowchart TD
    n0["app/export.aug"]
    n1["app/greeter.aug"]
    n2["august/io/contracts.aug"]
    n3["logging/console.aug"]
    n4["logging/export.aug"]
    n5["logging/logger.aug"]
    n6["main.aug"]
    n1 -->|"uses"| n2
    n1 -->|"uses"| n5
    n3 -->|"uses"| n2
    n3 -->|"uses"| n5
    n5 -->|"uses"| n2
    n6 -->|"uses"| n1
```

### Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| app/export.aug | [Interactions and sequences](../app/export-diagrams.md) | [Explanation](../app/export.md) |
| app/greeter.aug | [Interactions and sequences](../app/greeter-diagrams.md) | [Explanation](../app/greeter.md) |
| logging/console.aug | [Interactions and sequences](../logging/console-diagrams.md) | [Explanation](../logging/console.md) |
| logging/export.aug | [Interactions and sequences](../logging/export-diagrams.md) | [Explanation](../logging/export.md) |
| logging/logger.aug | [Interactions and sequences](../logging/logger-diagrams.md) | [Explanation](../logging/logger.md) |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
