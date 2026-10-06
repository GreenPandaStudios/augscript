---
title: "Diagrams · Function-call benchmark"
generated: true
source: "benchmarks/calls/operations.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Function-call benchmark diagrams

[Function-call benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](operations.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["step · operations.aug"]

```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### step {#sequence-step}

::: spec-paragraph specification-paragraph-1
[Source](operations.md#source-L2)
:::

```mermaid
sequenceDiagram
    participant p0 as step

    Note over p0: Return product - (product / 2147483647) * 2147483647#59; required cleanup runs before exit
```

