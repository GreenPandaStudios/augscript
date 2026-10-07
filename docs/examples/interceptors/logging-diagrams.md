---
title: "logging.aug diagrams"
generated: true
source: "examples/interceptors/logging.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# logging.aug diagrams

[Function and constructor middleware](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](logging.md)

## Class interactions

```mermaid
flowchart TD
    n0["Console"]
    n1["ConsoleLogger"]
    n2["Logger"]
    n1 -->|"calls write； depends on"| n0
    n1 -->|"implements"| n2
    n2 -->|"depends on"| n0
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Logger.log {#sequence-Logger.log}

::: spec-paragraph specification-paragraph-1
[Source](logging.md#source-L6)
:::

Interface contract; implementation selected at runtime. [Explanation](logging.md).

### ConsoleLogger constructor {#sequence-ConsoleLogger-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](logging.md#source-L9)
:::

[Explanation](logging.md).

### ConsoleLogger.log {#sequence-ConsoleLogger.log}

::: spec-paragraph specification-paragraph-3
[Source](logging.md#source-L10)
:::

```mermaid
sequenceDiagram
    participant p0 as ConsoleLogger.log
    participant p1 as console: Console
    p0->>p1: write(value=message) · interface dispatch
```

## Called contracts

- [Console](dependencies/august/1.0.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [Console.write](dependencies/august/1.0.0/io/contracts-diagrams.md#sequence-Console.write) — august/io/contracts.aug
- [Logger](logging-diagrams.md) — logging.aug
