---
title: "main.aug diagrams"
generated: true
source: "examples/ownership/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Read access and mutable borrows](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

```mermaid
flowchart TD
    n0["Counter"]
    n1["main.aug"]
    n1 -->|"calls； calls increment； calls read"| n0
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
    participant p1 as Counter
    participant p2 as counter: Counter
    participant p3 as August runtime
    p0->>p1: Counter(value=1)
    p1-->>p0: counter: Counter
    Note over p0: Own counter； release on scope exits
    p0->>p2: increment()
    p0->>p2: read()
    p2-->>p0: read result: int
    p0->>p3: print(value=read result)
```

## Called contracts

- [Counter](counter-diagrams.md#sequence-Counter-20-constructor) — counter.aug
- [Counter.increment](counter-diagrams.md#sequence-Counter.increment) — counter.aug
- [Counter.read](counter-diagrams.md#sequence-Counter.read) — counter.aug
