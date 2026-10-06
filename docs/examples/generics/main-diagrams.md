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
    n0 -->|"calls"| n1
    n0 -->|"calls"| n2
```

::: details Call relationships

```mermaid
flowchart TD
    n0["main.aug"]
    n1["Box"]
    n2["Box.get"]
    n3["Formatter.format"]
    n4["Formatter.title"]
    n0 -->|"calls"| n1
    n0 -->|"calls"| n2
    n0 -->|"calls"| n3
    n0 -->|"calls"| n4
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Startup {#sequence-Startup}

::: spec-paragraph specification-paragraph-1
[Source](main.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as Startup
    participant p1 as Formatter
    participant p2 as print
    participant p3 as Box
    Note over p0: Resolve Formatter from the declared composition
    p0->>p1: title() · interface dispatch
    p1-->>p0: string
    p0->>p2: print(value=formatter.title())
    p0->>p1: format(value=42) · interface dispatch
    p1-->>p0: string
    p0->>p2: print(value=formatter.format‹int›(value=42))
    p0->>p3: Box(value=”inside a generic box”)
    p3-->>p0: box: Box‹string›
    p0->>p3: get()
    p3-->>p0: string
    p0->>p2: print(value=box.get())
```

## Called contracts

- [Box](types-diagrams.md#sequence-Box-20-constructor) — types.aug
- [Box.get](types-diagrams.md#sequence-Box.get) — types.aug
- [Formatter.format](types-diagrams.md#sequence-Formatter.format) — types.aug
- [Formatter.title](types-diagrams.md#sequence-Formatter.title) — types.aug
