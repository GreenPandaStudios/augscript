---
title: "main.aug diagrams"
generated: true
source: "examples/drop/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Resource cleanup](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

```mermaid
flowchart TD
    n0["main.aug"]
    n1["Resource · resource.aug"]
    n0 -->|"calls"| n1
```

## API calls

```mermaid
flowchart TD
    n0["main.aug"]
    n1["Resource · resource.aug"]
    n0 -->|"calls"| n1
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as Resource
    participant p2 as print
    p0->>p1: Resource()
    Note over p0: Own resource#59; release on scope exits
    p0->>p2: print(value)
```

## Called contracts

- [Resource](resource-diagrams.md#sequence-Resource-20-constructor) — resource.aug
