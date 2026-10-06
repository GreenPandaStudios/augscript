---
title: "main.aug diagrams"
generated: true
source: "examples/visibility/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Private state and helpers](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

```mermaid
flowchart TD
    n0["Counter"]
    n1["main.aug"]
    n1 -->|"calls； calls label"| n0
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
    p0->>p2: label()
    p2-->>p0: label result: string
    p0->>p3: print(value=label result)
    rect rgb(245, 240, 241)
    Note over p0: Enter borrow scope
    Note over p0: Set counter.value to 2
    Note over p0: Leave borrow scope
    end
    p0->>p3: print(value=counter.value)
```

## Called contracts

- [Counter](counter-diagrams.md#sequence-Counter-20-constructor) — counter.aug
- [Counter.label](counter-diagrams.md#sequence-Counter.label) — counter.aug
