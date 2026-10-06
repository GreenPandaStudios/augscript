---
title: "greeter.aug diagrams"
generated: true
source: "examples/new-syntax/greeter.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# greeter.aug diagrams

[Labeled calls and injection](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](greeter.md)

## Class interactions

```mermaid
flowchart TD
    n0["Console · august/io/contracts.aug"]
    n1["Greeter · greeter.aug"]
    n2["IGreeter · greeter.aug"]
    n3["Logger · logger.aug"]
    n1 -->|"depends on"| n0
    n1 -->|"implements"| n2
    n1 -->|"calls"| n3
    n1 -->|"depends on logger"| n3
    n2 -->|"depends on"| n0
```

## API calls

```mermaid
flowchart TD
    n0["Greeter.greet · greeter.aug"]
    n1["IGreeter.greet · greeter.aug"]
    n2["Logger.log · logger.aug"]
    n0 -->|"calls"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Greeter constructor {#sequence-Greeter-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](greeter.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as Greeter constructor

    Note over p0: Receive fields: injected logger, x
```

### Greeter.greet {#sequence-Greeter.greet}

::: spec-paragraph specification-paragraph-2
[Source](greeter.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as Greeter.greet
    participant p1 as Logger.log
    p0->>p1: log(message) · interface dispatch
```

### IGreeter.greet {#sequence-IGreeter.greet}

::: spec-paragraph specification-paragraph-3
[Source](greeter.md#source-L10)
:::

```mermaid
sequenceDiagram
    participant p0 as IGreeter.greet

    Note over p0: Interface contract#59; implementation selected at runtime
```

## Called contracts

- [Console](dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [IGreeter](greeter-diagrams.md) — greeter.aug
- [Logger.log](logger-diagrams.md#sequence-Logger.log) — logger.aug
