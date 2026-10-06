---
title: "main.aug diagrams"
generated: true
source: "benchmarks/calls/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Function-call benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

No relationships at this level.

## API calls

```mermaid
flowchart TD
    n0["main.aug"]
    n1["step · operations.aug"]
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
    participant p1 as step
    participant p2 as print
    loop While index #60; iterations
    p0->>p1: step(value)
    end
    p0->>p2: print(value)
```

## Called contracts

- [step](operations-diagrams.md#sequence-step) — operations.aug
