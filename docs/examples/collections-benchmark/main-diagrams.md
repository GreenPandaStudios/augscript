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
    participant p1 as values.set
    participant p2 as unique.add
    participant p3 as unique.contains
    participant p4 as print
    participant p5 as values.length
    participant p6 as unique.length
    Note over p0: Own values； release on scope exits
    Note over p0: Own unique； release on scope exits
    loop While index ‹ 20000
    p0->>p1: values.set(key=index, value=index * 3)
    p0->>p2: unique.add(value=index)
    end
    loop For each item in values
    p0->>p3: unique.contains(value=key)
    alt unique.contains(value=key)
    end
    end
    p0->>p4: print(value=checksum)
    p0->>p5: values.length()
    p0->>p6: unique.length()
    p0->>p4: print(value=values.length() == unique.length())
```

