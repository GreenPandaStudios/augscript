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
    n3 -->|"calls"| n0
    n3 -->|"calls"| n1
    n3 -->|"calls"| n2
```

::: details Call relationships

```mermaid
flowchart TD
    n0["Counter.increment"]
    n1["Counter.value"]
    n2["Application.start"]
    n3["Fruit"]
    n4["double"]
    n5["main.aug"]
    n5 -->|"calls"| n0
    n5 -->|"calls"| n1
    n5 -->|"calls"| n2
    n5 -->|"calls"| n3
    n5 -->|"calls"| n4
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L8)
:::

#### Sequence 1 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as Application
    participant p2 as names.get
    participant p3 as print
    participant p4 as Fruit
    participant p5 as ｛Fruit(code=code, name=label), Fruit(name=label, code=code)｝.length
    participant p6 as Counter
    participant p7 as double
    Note over p0: Resolve Application from the declared composition
    p0->>p1: start() · interface dispatch
    p0->>p2: names.get(key=2)
    alt Match when null:
    p0->>p3: print(value=”missing fruit”)
    else Match when some name:
    p0->>p3: print(value=name)
    end
    p0->>p4: Fruit(code=code, name=label)
    p4-->>p0: Fruit
    p0->>p4: Fruit(name=label, code=code)
    p4-->>p0: Fruit
    p0->>p5: ｛Fruit(code=code, name=label), Fruit(name=label, code=code)｝.length()
    p0->>p3: print(value=｛Fruit(code=code, name=label), Fruit(name=label, code=code)｝.length())
    rect rgb(245, 240, 241)
    Note over p0: Enter task scope
    Note over p0: Resolve Counter from the declared composition
    rect rgb(245, 240, 241)
    Note over p0: Enter borrow scope
    p0->>p6: increment() · interface dispatch
    Note over p0: Leave borrow scope
    end
    p0->>p6: value() · interface dispatch
    p6-->>p0: int
    p0->>p3: print(value=counter.value())
    Note over p0: Join tasks and release scoped resources
    end
    opt Try body； stops on a checked failure
    p0->>p7: double(amount=7)
    p7-->>p0: int
    p0->>p3: print(value=double(amount=7))
    p0->>p7: double(amount=-1)
    end
```

#### Sequence 2 of 2 (continued)

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as double
    participant p2 as print
    opt Try body； stops on a checked failure
    Note over p0: Sequence continued from the previous view
    p1-->>p0: int
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
