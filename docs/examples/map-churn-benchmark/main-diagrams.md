---
title: "main.aug diagrams"
generated: true
source: "benchmarks/map-churn/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Map deletion benchmark](index.md)

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
    participant p1 as August runtime
    Note over p0: Set iterations to 4000
    Note over p0: Set entries to ｛｝
    Note over p0: Own entries； release on scope exits
    Note over p0: Set index to 0
    loop While index ‹ iterations
    p0->>p0: entries.set(key=index, value=index * 3)
    Note over p0: Set index to index + 1
    end
    Note over p0: Set index to 0
    loop While index ‹ iterations
    p0->>p0: entries.take(key=index)
    p0-->>p0: take result: optional int
    Note over p0: Set index to index + 2
    end
    Note over p0: Set index to 0
    loop While index ‹ iterations
    p0->>p0: entries.set(key=index, value=index * 7)
    Note over p0: Set index to index + 1
    end
    Note over p0: Set checksum to 0
    Note over p0: Set position to 1
    loop For each item in entries
    Note over p0: Set checksum to checksum + key * position + value
    Note over p0: Set position to position + 1
    end
    p0->>p1: print(value=checksum)
    p0->>p0: entries.length()
    p0-->>p0: length result: int
    p0->>p1: print(value=length result)
```

