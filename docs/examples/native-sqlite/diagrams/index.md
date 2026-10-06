---
title: "Diagrams · A database with SQLite"
generated: true
source: "examples/native-sqlite/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# A database with SQLite diagrams

[A database with SQLite](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

### Areas

```mermaid
flowchart TD
    n0["Project root"]
    n1["package/@greenpandastudios/aug-sqlite@0.1.5"]
    n0 -->|"uses"| n1
```

### Modules

```mermaid
flowchart TD
    n0["database.aug"]
    n1["main.aug"]
    n2["package/@greenpandastudios/aug-sqlite@0.1.5/api.aug"]
    n0 -->|"uses"| n2
    n1 -->|"uses"| n0
```

### Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| database.aug | [Interactions and sequences](../database-diagrams.md) | [Explanation](../database.md) |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
