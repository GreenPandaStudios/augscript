---
title: "Diagrams · Generic types and functions"
generated: true
source: "examples/generics/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Generic types and functions diagrams

[Generic types and functions](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

### Class interactions

```mermaid
flowchart TD
    n0["main.aug"]
    n1["Box · types.aug"]
    n2["Formatter · types.aug"]
    n0 -->|"calls"| n1
    n0 -->|"calls"| n2
```

### API calls

```mermaid
flowchart TD
    n0["main.aug"]
    n1["Box · types.aug"]
    n2["Box.get · types.aug"]
    n3["Formatter.format · types.aug"]
    n4["Formatter.title · types.aug"]
    n0 -->|"calls"| n1
    n0 -->|"calls"| n2
    n0 -->|"calls"| n3
    n0 -->|"calls"| n4
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as Formatter.title
    participant p2 as print
    participant p3 as Formatter.format
    participant p4 as Box
    participant p5 as Box.get
    Note over p0: Resolve Formatter from the declared composition
    p0->>p1: title() · interface dispatch
    p0->>p2: print(value)
    p0->>p3: format(value) · interface dispatch
    p0->>p2: print(value)
    p0->>p4: Box(value)
    p0->>p5: get()
    p0->>p2: print(value)
```

### Called contracts

- [Box](types-diagrams.md#sequence-Box-20-constructor) — types.aug
- [Box.get](types-diagrams.md#sequence-Box.get) — types.aug
- [Formatter.format](types-diagrams.md#sequence-Formatter.format) — types.aug
- [Formatter.title](types-diagrams.md#sequence-Formatter.title) — types.aug
