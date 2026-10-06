---
title: "main.aug diagrams"
generated: true
source: "benchmarks/calls/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Function-call benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as operations
    participant p2 as August runtime
    Note over p0: Set iterations to 200000
    Note over p0: Set state to 123
    Note over p0: Set index to 0
    loop While index ‹ iterations
    p0->>p1: step(value=state)
    p1-->>p0: state: int
    Note over p0: Set index to index + 1
    end
    p0->>p2: print(value=state)
```

## Called contracts

- [step](operations-diagrams.md#sequence-step) — operations.aug
