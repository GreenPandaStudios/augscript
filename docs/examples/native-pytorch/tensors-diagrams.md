---
title: "Diagrams · CPU tensors with PyTorch"
generated: true
source: "examples/native-pytorch/tensors.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# CPU tensors with PyTorch diagrams

[CPU tensors with PyTorch](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](tensors.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["tensors.aug"]
    n1["add · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n2["sum · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n3["tensor · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n4["values · package/@greenpandastudios/aug-pytorch@0.1.6/api.aug"]
    n5["calculate · tensors.aug"]
    n0 -->|"calls"| n1
    n0 -->|"calls"| n2
    n0 -->|"calls"| n3
    n0 -->|"calls"| n4
    n0 -->|"calls"| n5
    n5 -->|"calls"| n1
    n5 -->|"calls"| n2
    n5 -->|"calls"| n3
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### calculate {#sequence-calculate}

::: spec-paragraph specification-paragraph-1
[Source](tensors.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as calculate
    participant p1 as tensor
    participant p2 as add
    participant p3 as sum
    p0->>p1: tensor(values)
    Note over p0: Own left#59; release on scope exits
    p0->>p1: tensor(values)
    Note over p0: Own right#59; release on scope exits
    p0->>p2: add(left, right)
    Note over p0: Own result#59; release on scope exits
    p0->>p3: sum(tensor)
    Note over p0: Return sum(tensor=result)#59; required cleanup runs before exit
    Note over p0: May leave with checked errors: TensorError
```

### Called contracts

- [add](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.6/api-diagrams.md#sequence-add) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [sum](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.6/api-diagrams.md#sequence-sum) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [tensor](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.6/api-diagrams.md#sequence-tensor) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [values](dependencies/packages/%40greenpandastudios/aug-pytorch/0.1.6/api-diagrams.md#sequence-values) — package/@greenpandastudios/aug-pytorch@0.1.6/api.aug
- [calculate](tensors-diagrams.md#sequence-calculate) — tensors.aug
