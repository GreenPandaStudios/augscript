---
title: "main.aug diagrams"
generated: true
source: "examples/ownership-transfer/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Move ownership](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

No relationships at this level.

## API calls

```mermaid
flowchart TD
    n0["main.aug"]
    n1["consume · resource.aug"]
    n2["make · resource.aug"]
    n0 -->|"calls"| n1
    n0 -->|"calls"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as make
    participant p2 as consume
    participant p3 as print
    p0->>p1: make()
    Note over p0: Own first#59; release on scope exits
    p0->>p2: consume(value)
    p0->>p1: make()
    Note over p0: Own second#59; release on scope exits
    p0->>p3: print(value)
```

## Called contracts

- [consume](resource-diagrams.md#sequence-consume) — resource.aug
- [make](resource-diagrams.md#sequence-make) — resource.aug
