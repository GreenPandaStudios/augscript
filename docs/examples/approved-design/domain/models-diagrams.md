---
title: "Diagrams · Modules and composition"
generated: true
source: "examples/approved-design/domain/models.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Modules and composition diagrams

[Modules and composition](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](models.md)

### Class interactions

```mermaid
flowchart TD
    n0["Fruit · domain/models.aug"]

```

### API calls

No relationships at this level.

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Fruit constructor {#sequence-Fruit-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](models.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as Fruit constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

