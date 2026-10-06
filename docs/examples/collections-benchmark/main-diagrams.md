---
title: "main.aug diagrams"
generated: true
source: "benchmarks/collections/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Map and Set benchmark](index.md)

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
    Note over p0: Set values to ｛｝
    Note over p0: Own values； release on scope exits
    Note over p0: Set unique to ｛｝
    Note over p0: Own unique； release on scope exits
    Note over p0: Set index to 0
    loop While index ‹ 20000
    p0->>p0: values.set(key=index, value=index * 3)
    p0->>p0: unique.add(value=index)
    Note over p0: Set index to index + 1
    end
    Note over p0: Set checksum to 0
    loop For each item in values
    p0->>p0: unique.contains(value=key)
    p0-->>p0: contains result: bool
    alt unique.contains(value=key)
    Note over p0: Set checksum to checksum + value
    end
    end
    p0->>p1: print(value=checksum)
    p0->>p0: values.length()
    p0-->>p0: length result: int
    p0->>p0: unique.length()
    p0-->>p0: length result 2: int
    p0->>p1: print(value=length result == length result 2)
```

