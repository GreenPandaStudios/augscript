---
title: "CPU tensors with PyTorch diagrams"
generated: true
source: "examples/native-pytorch/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# CPU tensors with PyTorch diagrams

[CPU tensors with PyTorch](../index.md)

Read the areas first, then open a module for its class interactions, API calls and sequences. Follow an operation to its specification and source.

These are checked static views. Arrows describe possible calls, not an execution trace. Interface implementations, callbacks and foreign internals are not guessed. Tests are described in the adjacent specifications.

## Areas

```mermaid
flowchart TD
    n0["Project root"]
    n1["package/@greenpandastudios/aug-pytorch@0.1.6"]
    n0 -->|"uses"| n1
```

## Modules

```mermaid
flowchart TD
    n0["main.aug"]
    n1["package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n2["package/@greenpandastudios/aug-pytorch@0.1.6/bindings.aug"]
    n3["package/@greenpandastudios/aug-pytorch@0.1.6/contracts.aug"]
    n4["tensors.aug"]
    n0 -->|"uses"| n3
    n0 -->|"uses"| n4
    n4 -->|"uses"| n1
    n4 -->|"uses"| n2
    n4 -->|"uses"| n3
```

## Open a module

| Module | Diagrams | Specification |
| --- | --- | --- |
| main.aug | [Interactions and sequences](../main-diagrams.md) | [Explanation](../main.md) |
| tensors.aug | [Interactions and sequences](../tensors-diagrams.md) | [Explanation](../tensors.md) |
