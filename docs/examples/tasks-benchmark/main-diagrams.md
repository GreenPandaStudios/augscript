---
title: "main.aug diagrams"
generated: true
source: "benchmarks/tasks/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Task scheduling benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)


::: details Call relationships

```mermaid
flowchart TD
    n0["main.aug"]
    n1["compute"]
    n0 -->|"calls"| n1
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as compute
    participant p2 as print
    loop While index ‹ iterations
    rect rgb(245, 240, 241)
    Note over p0: Enter task scope
    p0-)p1: compute(value=index) · start asynchronously
    Note over p0: Task starts in the current scope
    p0-)p1: compute(value=index + 1) · start asynchronously
    Note over p0: Task starts in the current scope
    Note over p0: Wait for first and second； failure cancels siblings and cleanup joins
    Note over p0: Join tasks and release scoped resources
    end
    end
    p0->>p2: print(value=checksum)
```

## Called contracts

- [compute](operations-diagrams.md#sequence-compute) — operations.aug
