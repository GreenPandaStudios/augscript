---
title: "Diagrams · Create a package"
generated: true
source: "examples/packages/math/src/arithmetic.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Create a package diagrams

[Create a package](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](arithmetic.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["src/arithmetic.aug"]
    n1["add · src/arithmetic.aug"]
    n0 -->|"calls"| n1
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### add {#sequence-add}

::: spec-paragraph specification-paragraph-1
[Source](arithmetic.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as add

    Note over p0: Return left + right#59; required cleanup runs before exit
```

### Called contracts

- [add](arithmetic-diagrams.md#sequence-add) — src/arithmetic.aug
