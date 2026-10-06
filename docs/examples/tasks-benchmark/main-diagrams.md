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
    Note over p0: Set iterations to 2000
    Note over p0: Set index to 0
    Note over p0: Set checksum to 0
    loop While index ‹ iterations
    rect rgb(245, 240, 241)
    Note over p0: Enter task scope
    p0-)p1: compute(value=index) · start asynchronously
    Note over p0: Task starts in the current scope
    p0-)p1: compute(value=index + 1) · start asynchronously
    Note over p0: Task starts in the current scope
    Note over p0: Wait for first and second； failure cancels siblings and<br/>cleanup joins
    Note over p0: Set checksum to checksum + left + right
    Note over p0: Join tasks and release scoped resources
    end
    Note over p0: Set index to index + 1
    end
    p0->>p2: print(value=checksum)
```

## Called contracts

- [compute](operations-diagrams.md#sequence-compute) — operations.aug
