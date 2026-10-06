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


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as operations
    participant p2 as August runtime
    Note over p0: Set iterations to 20000
    Note over p0: Set index to 0
    Note over p0: Set checksum to 0
    Note over p0: Set failures to 0
    loop While index ‹ iterations
    opt Try body； stops on a checked failure
    p0->>p1: validate(value=index)
    p1-->>p0: validate result: int
    Note over p0: Set checksum to checksum + validate result
    end
    opt Catch FileError
    Note over p0: Set failures to failures + 1
    end
    Note over p0: Set index to index + 1
    end
    p0->>p2: print(value=checksum)
    p0->>p2: print(value=failures)
```

## Called contracts

- [validate](operations-diagrams.md#sequence-validate) — operations.aug
