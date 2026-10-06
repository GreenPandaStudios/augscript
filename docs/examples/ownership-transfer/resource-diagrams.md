---
title: "resource.aug diagrams"
generated: true
source: "examples/ownership-transfer/resource.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# resource.aug diagrams

[Move ownership](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](resource.md)

## Class interactions

```mermaid
flowchart TD
    n0["Console"]
    n1["IResource"]
    n2["Resource"]
    n3["consume"]
    n4["make"]
    n2 -->|"implements"| n1
    n3 -->|"calls write； depends on"| n0
    n4 -->|"calls"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Resource constructor {#sequence-Resource-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](resource.md#source-L3)
:::

[Explanation](resource.md).

### Resource.drop {#sequence-Resource.drop}

::: spec-paragraph specification-paragraph-2
[Source](resource.md#source-L4)
:::

[Explanation](resource.md).

### make {#sequence-make}

::: spec-paragraph specification-paragraph-3
[Source](resource.md#source-L11)
:::

```mermaid
sequenceDiagram
    participant p0 as make
    participant p1 as Resource
    p0->>p1: Resource()
    p1-->>p0: value: Resource
    Note over p0: Own value； release on scope exits
    Note over p0: Return value； required cleanup runs before exit
```

### consume {#sequence-consume}

::: spec-paragraph specification-paragraph-4
[Source](resource.md#source-L15)
:::

```mermaid
sequenceDiagram
    participant p0 as consume
    participant p1 as console: Console
    p0->>p1: write(value=”consumed”) · interface dispatch
```

## Called contracts

- [Console](dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [Console.write](dependencies/august/0.23.0/io/contracts-diagrams.md#sequence-Console.write) — august/io/contracts.aug
- [IResource](resource-diagrams.md) — resource.aug
- [Resource](resource-diagrams.md#sequence-Resource-20-constructor) — resource.aug
