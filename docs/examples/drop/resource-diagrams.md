---
title: "Diagrams · Resource cleanup"
generated: true
source: "examples/drop/resource.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Resource cleanup diagrams

[Resource cleanup](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](resource.md)

### Class interactions

```mermaid
flowchart TD
    n0["IResource · resource.aug"]
    n1["Resource · resource.aug"]
    n1 -->|"implements"| n0
```

### API calls

```mermaid
flowchart TD
    n0["Resource.drop · resource.aug"]

```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Resource constructor {#sequence-Resource-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](resource.md#source-L2)
:::

```mermaid
sequenceDiagram
    participant p0 as Resource constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### Resource.drop {#sequence-Resource.drop}

::: spec-paragraph specification-paragraph-2
[Source](resource.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as Resource.drop

    Note over p0: No calls in this operation#59; see the source and specification
```

### Called contracts

- [IResource](resource-diagrams.md) — resource.aug
