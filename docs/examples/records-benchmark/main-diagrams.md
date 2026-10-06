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

## Class interactions

```mermaid
flowchart TD
    n0["Item · data.aug"]
    n1["main.aug"]
    n1 -->|"calls"| n0
```

## API calls

```mermaid
flowchart TD
    n0["Item · data.aug"]
    n1["main.aug"]
    n1 -->|"calls"| n0
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
    participant p1 as Item
    participant p2 as values.append
    participant p3 as print
    Note over p0: Own values#59; release on scope exits
    loop While index #60; iterations
    p0->>p1: Item(id, name)
    p0->>p2: values.append(value)
    end
    loop For each item in values
    end
    p0->>p3: print(value)
```

## Called contracts

- [Item](data-diagrams.md#sequence-Item-20-constructor) — data.aug
