---
title: "main.aug diagrams"
generated: true
source: "benchmarks/strings/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[String processing benchmark](index.md)

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
    participant p1 as ”August,clear,local,checked”.split
    participant p2 as part.length
    participant p3 as print
    loop While index ‹ iterations
    p0->>p1: ”August,clear,local,checked”.split(separator=”,”)
    loop For each item in parts
    p0->>p2: part.length()
    end
    end
    p0->>p3: print(value=checksum)
```

