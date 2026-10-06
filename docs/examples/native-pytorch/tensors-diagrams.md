---
title: "tensors.aug diagrams"
generated: true
source: "examples/native-pytorch/tensors.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# tensors.aug diagrams

[CPU tensors with PyTorch](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](tensors.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### calculate {#sequence-calculate}

::: spec-paragraph specification-paragraph-1
[Source](tensors.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as calculate
    participant p1 as aug-pytorch/api
    p0->>p1: tensor(values=［1.0, 2.0, 3.0］)
    p1-->>p0: left: Tensor
    Note over p0: Own left； release on scope exits
    p0->>p1: tensor(values=［4.0, 5.0, 6.0］)
    p1-->>p0: right: Tensor
    Note over p0: Own right； release on scope exits
    p0->>p1: add(left=left, right=right)
    p1-->>p0: result: Tensor
    Note over p0: Own result； release on scope exits
    p0->>p1: sum(tensor=result)
    p1-->>p0: sum result: float
    Note over p0: Return sum(tensor=result)； required cleanup runs before<br/>exit
    Note over p0: May leave with checked errors: TensorError
```

## Called contracts

- [add](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api-diagrams.md#sequence-add) — package/@greenpandastudios/aug-pytorch@0.2.0/api.aug
- [sum](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api-diagrams.md#sequence-sum) — package/@greenpandastudios/aug-pytorch@0.2.0/api.aug
- [tensor](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api-diagrams.md#sequence-tensor) — package/@greenpandastudios/aug-pytorch@0.2.0/api.aug
- [values](dependencies/packages/%40greenpandastudios/aug-pytorch/0.2.0/api-diagrams.md#sequence-values) — package/@greenpandastudios/aug-pytorch@0.2.0/api.aug
- [calculate](tensors-diagrams.md#sequence-calculate) — tensors.aug
