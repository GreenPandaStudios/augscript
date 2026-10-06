---
title: "main.aug diagrams"
generated: true
source: "benchmarks/records/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Record allocation benchmark](index.md)

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
    participant p1 as August runtime
    Note over p0: Set iterations to 50000
    Note over p0: Set values to ［］
    Note over p0: Own values； release on scope exits
    Note over p0: Set index to 0
    loop While index ‹ iterations
    p0->>p0: Item(id=index, name=”August”) · construct value
    p0-->>p0: Item result: Item
    p0->>p0: values.append(value=Item result)
    Note over p0: Set index to index + 1
    end
    Note over p0: Set checksum to 0
    loop For each item in values
    Note over p0: Set checksum to checksum + item.id
    end
    p0->>p1: print(value=checksum)
```

## Called contracts

- [Item](data-diagrams.md#sequence-Item-20-constructor) — data.aug
