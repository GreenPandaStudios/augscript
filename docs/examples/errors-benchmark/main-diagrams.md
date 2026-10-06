---
title: "Diagrams · Checked-error benchmark"
generated: true
source: "benchmarks/errors/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Checked-error benchmark diagrams

[Checked-error benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["main.aug"]
    n1["validate · operations.aug"]
    n0 -->|"calls"| n1
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as validate
    participant p2 as print
    loop While index #60; iterations
    opt Try body#59; stops on a checked failure
    p0->>p1: validate(value)
    end
    opt Catch FileError
    end
    end
    p0->>p2: print(value)
    p0->>p2: print(value)
```

### Called contracts

- [validate](operations-diagrams.md#sequence-validate) — operations.aug
