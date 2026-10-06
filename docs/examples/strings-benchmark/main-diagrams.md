---
title: "Diagrams · String processing benchmark"
generated: true
source: "benchmarks/strings/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# String processing benchmark diagrams

[String processing benchmark](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

### Class interactions

No relationships at this level.

### API calls

No relationships at this level.

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L2)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as #34;August,clear,local,checked#34;.split
    participant p2 as part.length
    participant p3 as print
    loop While index #60; iterations
    p0->>p1: #34;August,clear,local,checked#34;.split(separator)
    loop For each item in parts
    p0->>p2: part.length()
    end
    end
    p0->>p3: print(value)
```

