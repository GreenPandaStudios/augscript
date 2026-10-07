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
    n0["Greeter"]
    n1["IGreeter"]
    n2["Console"]
    n3["Logger"]
    n0 -->|"implements"| n1
    n0 -->|"depends on"| n2
    n0 -->|"calls log； depends on logger"| n3
    n1 -->|"depends on"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Greeter constructor {#sequence-Greeter-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](greeter.md#source-L8)
:::

Receive fields: injected logger. [Explanation](greeter.md).

### Greeter.greet {#sequence-Greeter.greet}

::: spec-paragraph specification-paragraph-2
[Source](greeter.md#source-L13)
:::

```mermaid
sequenceDiagram
    participant p0 as Greeter.greet
    participant p1 as logger: Logger
    p0->>p1: log(message=”Hello, ” + name + ”!”) · interface dispatch
```

### IGreeter.greet {#sequence-IGreeter.greet}

::: spec-paragraph specification-paragraph-3
[Source](greeter.md#source-L22)
:::

Interface contract; implementation selected at runtime. [Explanation](greeter.md).

## Called contracts

- [IGreeter](greeter-diagrams.md) — app/greeter.aug
- [Console](../dependencies/august/1.0.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [Logger.log](../logging/logger-diagrams.md#sequence-Logger.log) — logging/logger.aug
