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

## Class interactions

No relationships at this level.

## API calls

No relationships at this level.

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L2)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as arguments
    participant p2 as args.length
    participant p3 as print
    participant p4 as args.get
    participant p5 as List
    participant p6 as numbers.append
    participant p7 as numbers.get
    opt Try body#59; stops on a checked failure
    p0->>p1: arguments()
    p0->>p2: args.length()
    p0->>p3: print(value)
    p0->>p2: args.length()
    alt args.length() #62; 0
    p0->>p4: args.get(index)
    p0->>p3: print(value)
    end
    p0->>p5: List(input 1, input 2)
    rect rgb(245, 240, 241)
    Note over p0: Enter borrow scope
    p0->>p6: numbers.append(value)
    Note over p0: Leave borrow scope
    end
    p0->>p7: numbers.get(index)
    p0->>p3: print(value)
    end
    opt Catch IndexError
    p0->>p3: print(value)
    end
```

