---
title: "main.aug diagrams"
generated: true
source: "examples/hello/main.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# main.aug diagrams

[Hello world with dependencies](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](main.md)

## Class interactions

```mermaid
flowchart TD
    n0["Greeter"]
    n1["main.aug"]
    n1 -->|"calls"| n0
```

::: details Call relationships

```mermaid
flowchart TD
    n0["Greeter.greet"]
    n1["main.aug"]
    n1 -->|"calls"| n0
```

:::

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
    Note over p0: Resolve app from the declared composition
    p0->>p1: greet(name=”AugScript”)
```

## Called contracts

- [Greeter.greet](app/greeter-diagrams.md#sequence-Greeter.greet) — app/greeter.aug
