---
title: "main.aug diagrams"
generated: true
source: "examples/approved-design/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Modules and composition](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

```mermaid
flowchart TD
    n0["Counter"]
    n1["Application"]
    n2["double"]
    n3["main.aug"]
    n3 -->|"calls increment； calls value"| n0
    n3 -->|"calls start"| n1
    n3 -->|"calls"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L8)
:::

#### Sequence 1 of 2

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as app: Application
    participant p2 as August runtime
    participant p3 as counter: Counter
    Note over p0: Resolve Application from the declared composition
    p0->>p1: start() · interface dispatch
    Note over p0: Set names to ｛1: ”apple”, 2: ”pear”｝
    p0->>p0: names.get(key=2)
    p0-->>p0: get result: optional string
    alt Match when null:
    p0->>p2: print(value=”missing fruit”)
    else Match when some name:
    p0->>p2: print(value=name)
    end
    p0->>p0: Fruit(code=code, name=label) · construct value
    p0-->>p0: Fruit result: Fruit
    p0->>p0: Fruit(name=label, code=code) · construct value
    p0-->>p0: Fruit result 2: Fruit
    p0->>p0: ｛Fruit result, Fruit result 2｝.length()
    p0-->>p0: length result: int
    p0->>p2: print(value=length result)
    rect rgb(245, 240, 241)
    Note over p0: Enter task scope
    Note over p0: Resolve Counter from the declared composition
    rect rgb(245, 240, 241)
    Note over p0: Enter borrow scope
    p0->>p3: increment() · interface dispatch
    Note over p0: Leave borrow scope
    end
    p0->>p3: value() · interface dispatch
    p3-->>p0: value result: int
    p0->>p2: print(value=value result)
    Note over p0: Join tasks and release scoped resources
    end
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as domain/numbers
    participant p2 as August runtime
    opt Try body； stops on a checked failure
    Note over p0: Sequence continued from the previous view
    p0->>p1: double(amount=7)
    p1-->>p0: double result: int
    p0->>p2: print(value=double result)
    p0->>p1: double(amount=-1)
    p1-->>p0: double result 2: int
    end
    opt Catch RangeError
    p0->>p2: print(value=”negative amount rejected”)
    end
```

## Called contracts

- [Counter.increment](counters-diagrams.md#sequence-Counter.increment) — counters.aug
- [Counter.value](counters-diagrams.md#sequence-Counter.value) — counters.aug
- [Application.start](domain/app-diagrams.md#sequence-Application.start) — domain/app.aug
- [Fruit](domain/models-diagrams.md#sequence-Fruit-20-constructor) — domain/models.aug
- [double](domain/numbers-diagrams.md#sequence-double) — domain/numbers.aug
