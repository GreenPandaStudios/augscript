---
title: "app/greeter.aug diagrams"
generated: true
source: "examples/hello/app/greeter.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# app/greeter.aug diagrams

[Hello world with dependencies](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](greeter.md)

## Class interactions

```mermaid
flowchart TD
    n0["Greeter · app/greeter.aug"]
    n1["IGreeter · app/greeter.aug"]
    n2["Console · august/io/contracts.aug"]
    n3["Logger · logging/logger.aug"]
    n0 -->|"implements"| n1
    n0 -->|"depends on"| n2
    n0 -->|"calls"| n3
    n0 -->|"depends on logger"| n3
    n1 -->|"depends on"| n2
```

## API calls

```mermaid
flowchart TD
    n0["Greeter.greet · app/greeter.aug"]
    n1["IGreeter.greet · app/greeter.aug"]
    n2["Logger.log · logging/logger.aug"]
    n0 -->|"calls"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Greeter constructor {#sequence-Greeter-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](greeter.md#source-L8)
:::

```mermaid
sequenceDiagram
    participant p0 as Greeter constructor

    Note over p0: Receive fields: injected logger
```

### Greeter.greet {#sequence-Greeter.greet}

::: spec-paragraph specification-paragraph-2
[Source](greeter.md#source-L13)
:::

```mermaid
sequenceDiagram
    participant p0 as Greeter.greet
    participant p1 as Logger.log
    p0->>p1: log(message) · interface dispatch
```

### IGreeter.greet {#sequence-IGreeter.greet}

::: spec-paragraph specification-paragraph-3
[Source](greeter.md#source-L22)
:::

```mermaid
sequenceDiagram
    participant p0 as IGreeter.greet

    Note over p0: Interface contract#59; implementation selected at runtime
```

## Called contracts

- [IGreeter](greeter-diagrams.md) — app/greeter.aug
- [Console](../dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [Logger.log](../logging/logger-diagrams.md#sequence-Logger.log) — logging/logger.aug
