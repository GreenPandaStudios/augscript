---
title: "main.aug diagrams"
generated: true
source: "examples/cli-args/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Command-line arguments](index.md)

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
    opt Try body； stops on a checked failure
    p0->>p1: arguments()
    p1-->>p0: args: List‹string›
    p0->>p0: args.length()
    p0-->>p0: length result: int
    p0->>p1: print(value=length result)
    p0->>p0: args.length()
    p0-->>p0: length result 2: int
    alt the number of elements in args is positive
    p0->>p0: args.get(index=0)
    p0-->>p0: get result: string
    p0->>p1: print(value=get result)
    end
    p0->>p0: List‹int›(input 1=1, input 2=2)
    p0-->>p0: numbers: List‹int›
    rect rgb(245, 240, 241)
    Note over p0: Enter borrow scope
    p0->>p0: numbers.append(value=3)
    Note over p0: Leave borrow scope
    end
    p0->>p0: numbers.get(index=2)
    p0-->>p0: get result 2: int
    p0->>p1: print(value=get result 2)
    end
    opt Catch IndexError
    p0->>p1: print(value=”unexpected index failure”)
    end
```
