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
    n1 -->|"calls"| n0
```

::: details Call relationships

```mermaid
flowchart TD
    n0["Counter"]
    n1["Counter.increment"]
    n2["Counter.read"]
    n3["main.aug"]
    n3 -->|"calls"| n0
    n3 -->|"calls"| n1
    n3 -->|"calls"| n2
```

:::

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
    participant p3 as print
    p0->>p1: Counter(value=1)
    p1-->>p0: counter: Counter
    Note over p0: Own counter； release on scope exits
    p0->>p2: increment()
    p0->>p2: read()
    p2-->>p0: int
    p0->>p3: print(value=counter.read())
```

## Called contracts

- [Counter](counter-diagrams.md#sequence-Counter-20-constructor) — counter.aug
- [Counter.increment](counter-diagrams.md#sequence-Counter.increment) — counter.aug
- [Counter.read](counter-diagrams.md#sequence-Counter.read) — counter.aug
