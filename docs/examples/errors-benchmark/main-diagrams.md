---
title: "main.aug diagrams"
generated: true
source: "benchmarks/errors/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Checked-error benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)


::: details Call relationships

```mermaid
flowchart TD
    n0["main.aug"]
    n1["validate"]
    n0 -->|"calls"| n1
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
    participant p1 as validate
    participant p2 as print
    loop While index ‹ iterations
    opt Try body； stops on a checked failure
    p0->>p1: validate(value=index)
    p1-->>p0: int
    end
    opt Catch FileError
    end
    end
    p0->>p2: print(value=checksum)
    p0->>p2: print(value=failures)
```

## Called contracts

- [validate](operations-diagrams.md#sequence-validate) — operations.aug
