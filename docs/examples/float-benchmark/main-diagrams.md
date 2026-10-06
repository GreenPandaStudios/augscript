---
title: "main.aug diagrams"
generated: true
source: "benchmarks/float/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Floating-point benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L2)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as print
    loop While index ‹ iterations
    end
    p0->>p1: print(value=sum == 937500.0)
    p0->>p1: print(value=iterations)
```

