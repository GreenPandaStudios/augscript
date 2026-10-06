---
title: "main.aug diagrams"
generated: true
source: "examples/generics/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Generic types and functions](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

```mermaid
flowchart TD
    n0["main.aug"]
    n1["Box"]
    n2["Formatter"]
    n0 -->|"calls； calls get"| n1
    n0 -->|"calls format； calls title"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as formatter: Formatter
    participant p2 as August runtime
    participant p3 as Box
    participant p4 as box: Box
    Note over p0: Resolve Formatter from the declared composition
    p0->>p1: title() · interface dispatch
    p1-->>p0: title result: string
    p0->>p2: print(value=title result)
    p0->>p1: format‹int›(value=42) · interface dispatch
    p1-->>p0: format result: string
    p0->>p2: print(value=format result)
    p0->>p3: Box‹string›(value=”inside a generic box”)
    p3-->>p0: box: Box‹string›
    p0->>p4: get()
    p4-->>p0: get result: string
    p0->>p2: print(value=get result)
```

## Called contracts

- [Box](types-diagrams.md#sequence-Box-20-constructor) — types.aug
- [Box.get](types-diagrams.md#sequence-Box.get) — types.aug
- [Formatter.format](types-diagrams.md#sequence-Formatter.format) — types.aug
- [Formatter.title](types-diagrams.md#sequence-Formatter.title) — types.aug
