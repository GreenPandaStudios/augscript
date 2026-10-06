---
title: "Diagrams · Use a package"
generated: true
source: "examples/packages/app/.aug-spec/packages/@example/aug-math/0.1.0/arithmetic.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Use a package diagrams

[Use a package](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](arithmetic.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["add · package/@example/aug-math@0.1.0/arithmetic.aug"]

```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### add {#sequence-add}

::: spec-paragraph specification-paragraph-1
[Source](arithmetic.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as add

    Note over p0: Return left + right#59; required cleanup runs before exit
```

