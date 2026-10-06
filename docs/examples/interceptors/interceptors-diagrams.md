---
title: "interceptors.aug diagrams"
generated: true
source: "examples/interceptors/interceptors.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# interceptors.aug diagrams

[Function and constructor middleware](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](interceptors.md)

## Class interactions

```mermaid
flowchart TD
    n0["Console"]
    n1["AddOne"]
    n2["Audit"]
    n3["Positive"]
    n4["ValidationError"]
    n5["Logger"]
    n2 -->|"depends on"| n0
    n2 -->|"calls"| n5
```

::: details Call relationships

```mermaid
flowchart TD
    n0["Audit.around"]
    n1["Positive.around"]
    n2["ValidationError"]
    n3["Logger.log"]
    n0 -->|"calls"| n3
    n1 -->|"calls"| n2
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### ValidationError constructor {#sequence-ValidationError-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](interceptors.md#source-L5)
:::

Receive fields: message. [Explanation](interceptors.md).

### Audit.around {#sequence-Audit.around}

::: spec-paragraph specification-paragraph-2
[Source](interceptors.md#source-L15)
:::

```mermaid
sequenceDiagram
    participant p0 as Audit.around
    participant p1 as Logger
    participant p2 as next
    p0->>p1: log(message=”before”) · interface dispatch
    p0->>p2: next() · conditional interceptor delegation
    p0->>p1: log(message=”after”) · interface dispatch
    Note over p0: Return result； required cleanup runs before exit
```

### Positive.around {#sequence-Positive.around}

::: spec-paragraph specification-paragraph-3
[Source](interceptors.md#source-L28)
:::

```mermaid
sequenceDiagram
    participant p0 as Positive.around
    participant p1 as ValidationError
    participant p2 as next
    alt y ‹ 0
    p0->>p1: ValidationError(message=”value must be nonnegative”)
    p1-->>p0: ValidationError
    Note over p0: Raise checked failure ValidationError(message=”value must be nonnegative”)； required cleanup runs before exit
    end
    p0->>p2: next() · conditional interceptor delegation
    Note over p0: Return next()； required cleanup runs before exit
    Note over p0: May leave with checked errors: ValidationError
```

### AddOne.around {#sequence-AddOne.around}

::: spec-paragraph specification-paragraph-4
[Source](interceptors.md#source-L38)
:::

```mermaid
sequenceDiagram
    participant p0 as AddOne.around
    participant p1 as next
    p0->>p1: next(y=y + 1) · conditional interceptor delegation
    Note over p0: Return next(y=y + 1)； required cleanup runs before exit
```

## Called contracts

- [Console](dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [ValidationError](interceptors-diagrams.md#sequence-ValidationError-20-constructor) — interceptors.aug
- [Logger.log](logging-diagrams.md#sequence-Logger.log) — logging.aug
