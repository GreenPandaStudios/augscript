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
    n0["Console · august/io/contracts.aug"]
    n1["AddOne · interceptors.aug"]
    n2["Audit · interceptors.aug"]
    n3["Positive · interceptors.aug"]
    n4["ValidationError · interceptors.aug"]
    n5["Logger · logging.aug"]
    n2 -->|"depends on"| n0
    n2 -->|"calls"| n5
    n3 -->|"calls"| n4
```

## API calls

```mermaid
flowchart TD
    n0["AddOne.around · interceptors.aug"]
    n1["Audit.around · interceptors.aug"]
    n2["Positive.around · interceptors.aug"]
    n3["ValidationError · interceptors.aug"]
    n4["Logger.log · logging.aug"]
    n1 -->|"calls"| n4
    n2 -->|"calls"| n3
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### ValidationError constructor {#sequence-ValidationError-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](interceptors.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as ValidationError constructor

    Note over p0: Receive fields: message
```

### Audit.around {#sequence-Audit.around}

::: spec-paragraph specification-paragraph-2
[Source](interceptors.md#source-L15)
:::

```mermaid
sequenceDiagram
    participant p0 as Audit.around
    participant p1 as Logger.log
    participant p2 as next
    p0->>p1: log(message) · interface dispatch
    p0->>p2: next() · conditional interceptor delegation
    p0->>p1: log(message) · interface dispatch
    Note over p0: Return result#59; required cleanup runs before exit
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
    alt y #60; 0
    p0->>p1: ValidationError(message)
    Note over p0: Raise checked failure ValidationError(message=#34;value must be nonnegative#34;)#59; required cleanup runs before exit
    end
    p0->>p2: next() · conditional interceptor delegation
    Note over p0: Return next()#59; required cleanup runs before exit
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
    p0->>p1: next(y) · conditional interceptor delegation
    Note over p0: Return next(y=y + 1)#59; required cleanup runs before exit
```

## Called contracts

- [Console](dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [ValidationError](interceptors-diagrams.md#sequence-ValidationError-20-constructor) — interceptors.aug
- [Logger.log](logging-diagrams.md#sequence-Logger.log) — logging.aug
