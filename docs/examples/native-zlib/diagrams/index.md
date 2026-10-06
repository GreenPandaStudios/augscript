---
title: "Compression with zlib diagrams"
generated: true
source: "examples/native-zlib/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Compression with zlib diagrams

[Compression with zlib](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

## Areas

```mermaid
flowchart TD
    n0["Project root"]
    n1["package/@greenpandastudios/aug-zlib@0.1.5"]
    n0 -->|"uses"| n1
```

## Modules

```mermaid
flowchart TD
    n0["compression.aug"]
    n1["main.aug"]
    n2["package/@greenpandastudios/aug-zlib@0.1.5/api.aug"]
    n3["package/@greenpandastudios/aug-zlib@0.1.5/contracts.aug"]
    n0 -->|"uses"| n2
    n0 -->|"uses"| n3
    n1 -->|"uses"| n0
    n1 -->|"uses"| n3
```

## Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| compression.aug | [Interactions and sequences](../compression-diagrams.md) | [Explanation](../compression.md) |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
