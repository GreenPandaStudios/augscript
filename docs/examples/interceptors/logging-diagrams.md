---
title: "Diagrams · Function and constructor middleware"
generated: true
source: "examples/interceptors/logging.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Function and constructor middleware diagrams

[Function and constructor middleware](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](logging.md)

### Class interactions

```mermaid
flowchart TD
    n0["Console · august/io/contracts.aug"]
    n1["ConsoleLogger · logging.aug"]
    n2["Logger · logging.aug"]
    n1 -->|"calls"| n0
    n1 -->|"depends on"| n0
    n1 -->|"implements"| n2
    n2 -->|"depends on"| n0
```

### API calls

```mermaid
flowchart TD
    n0["Console.write · august/io/contracts.aug"]
    n1["ConsoleLogger.log · logging.aug"]
    n2["Logger.log · logging.aug"]
    n1 -->|"calls"| n0
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Logger.log {#sequence-Logger.log}

::: spec-paragraph specification-paragraph-1
[Source](logging.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as Logger.log

    Note over p0: Interface contract#59; implementation selected at runtime
```

#### ConsoleLogger constructor {#sequence-ConsoleLogger-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](logging.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as ConsoleLogger constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### ConsoleLogger.log {#sequence-ConsoleLogger.log}

::: spec-paragraph specification-paragraph-3
[Source](logging.md#source-L10)
:::

```mermaid
sequenceDiagram
    participant p0 as ConsoleLogger.log
    participant p1 as Console.write
    p0->>p1: write(value) · interface dispatch
```

### Called contracts

- [Console](dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [Console.write](dependencies/august/0.23.0/io/contracts-diagrams.md#sequence-Console.write) — august/io/contracts.aug
- [Logger](logging-diagrams.md) — logging.aug
