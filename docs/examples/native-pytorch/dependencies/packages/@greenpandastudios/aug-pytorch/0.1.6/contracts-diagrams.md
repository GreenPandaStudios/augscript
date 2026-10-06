---
title: "Diagrams · CPU tensors with PyTorch"
generated: true
source: "examples/native-pytorch/.aug-spec/packages/@greenpandastudios/aug-pytorch/0.1.6/contracts.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# CPU tensors with PyTorch diagrams

[CPU tensors with PyTorch](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](contracts.md)

### Class interactions

```mermaid
flowchart TD
    n0["TensorError · package/@greenpandastudios/aug-pytorch@0.1.6/contracts.aug"]

```

### API calls

```mermaid
flowchart TD
    n0["TensorError.explain · package/@greenpandastudios/aug-pytorch@0.1.6/contracts.aug"]

```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### TensorError constructor {#sequence-TensorError-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as TensorError constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### TensorError.explain {#sequence-TensorError.explain}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as TensorError.explain

    Note over p0: Return message#59; required cleanup runs before exit
```

