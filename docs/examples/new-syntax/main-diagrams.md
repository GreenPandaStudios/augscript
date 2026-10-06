---
title: "main.aug diagrams"
generated: true
source: "examples/new-syntax/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Labeled calls and injection](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

```mermaid
flowchart TD
    n0["Greeter"]
    n1["increment"]
    n2["main.aug"]
    n2 -->|"calls； calls greet"| n0
    n2 -->|"calls"| n1
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as Greeter
    participant p2 as greeter: Greeter
    participant p3 as math
    participant p4 as August runtime
    p0->>p1: Greeter(x=4)
    p1-->>p0: greeter: Greeter
    p0->>p2: greet(name=”AugScript”)
    Note over p0: Set count to 7
    p0->>p3: increment(value=count)
    p3-->>p0: count: int
    p0->>p4: print(value=count)
```

## Called contracts

- [Greeter](greeter-diagrams.md#sequence-Greeter-20-constructor) — greeter.aug
- [Greeter.greet](greeter-diagrams.md#sequence-Greeter.greet) — greeter.aug
- [increment](math-diagrams.md#sequence-increment) — math.aug
