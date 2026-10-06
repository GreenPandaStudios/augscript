---
title: "main.aug diagrams"
generated: true
source: "examples/collections/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Lists, tuples, sets, and maps](index.md)

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
    participant p1 as List
    participant p2 as numbers.append
    participant p3 as numbers.length
    participant p4 as print
    participant p5 as numbers.get
    participant p6 as Map
    participant p7 as scores.set
    participant p8 as scores.contains
    participant p9 as scores.get
    participant p10 as scores.length
    opt Try body； stops on a checked failure
    p0->>p1: List(input 1=2, input 2=4)
    rect rgb(245, 240, 241)
    Note over p0: Enter borrow scope
    p0->>p2: numbers.append(value=6)
    Note over p0: Leave borrow scope
    end
    p0->>p3: numbers.length()
    p0->>p4: print(value=numbers.length())
    p0->>p5: numbers.get(index=1)
    p0->>p4: print(value=numbers.get(index=1))
    p0->>p6: Map()
    rect rgb(245, 240, 241)
    Note over p0: Enter borrow scope
    p0->>p7: scores.set(value=42, key=”ada”)
    Note over p0: Leave borrow scope
    end
    p0->>p8: scores.contains(key=”ada”)
    p0->>p4: print(value=scores.contains(key=”ada”))
    p0->>p9: scores.get(key=”ada”)
    p0->>p4: print(value=scores.get(key=”ada”))
    p0->>p10: scores.length()
    p0->>p4: print(value=scores.length())
    end
    opt Catch IndexError
    p0->>p4: print(value=”unexpected index failure”)
    end
```

