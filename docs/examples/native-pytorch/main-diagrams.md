---
title: "main.aug diagrams"
generated: true
source: "examples/native-pytorch/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[CPU tensors with PyTorch](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)


::: details Call relationships

```mermaid
flowchart TD
    n0["main.aug"]
    n1["calculate"]
    n0 -->|"calls"| n1
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as tensors
    participant p2 as print
    opt Try body； stops on a checked failure
    p0->>p1: calculate()
    p1-->>p0: float
    p0->>p2: print(value=calculate())
    end
    opt Catch TensorError
    p0->>p2: print(value=error.message)
    end
```

## Called contracts

- [calculate](tensors-diagrams.md#sequence-calculate) — tensors.aug
