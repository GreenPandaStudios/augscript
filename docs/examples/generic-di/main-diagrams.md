---
title: "Diagrams · Generic dependency injection"
generated: true
source: "examples/generic-di/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Generic dependency injection diagrams

[Generic dependency injection](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

### Class interactions

```mermaid
flowchart TD
    n0["main.aug"]
    n1["Program · types.aug"]
    n0 -->|"calls"| n1
```

### API calls

```mermaid
flowchart TD
    n0["main.aug"]
    n1["Program.start · types.aug"]
    n0 -->|"calls"| n1
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as Program.start
    Note over p0: Resolve app from the declared composition
    p0->>p1: start()
```

### Called contracts

- [Program.start](types-diagrams.md#sequence-Program.start) — types.aug
