---
title: "Diagrams · Floating-point benchmark"
generated: true
source: "benchmarks/float/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Floating-point benchmark diagrams

[Floating-point benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

### Class interactions

No relationships at this level.

### API calls

No relationships at this level.

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L2)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as print
    loop While index #60; iterations
    end
    p0->>p1: print(value)
    p0->>p1: print(value)
```

