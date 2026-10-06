---
title: "Diagrams · Hello world with dependencies"
generated: true
source: "examples/hello/logging/console.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Hello world with dependencies diagrams

[Hello world with dependencies](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](console.md)

### Class interactions

```mermaid
flowchart TD
    n0["Console · august/io/contracts.aug"]
    n1["ConsoleLogger · logging/console.aug"]
    n2["Logger · logging/logger.aug"]
    n1 -->|"calls"| n0
    n1 -->|"depends on"| n0
    n1 -->|"implements"| n2
```

### API calls

```mermaid
flowchart TD
    n0["Console.write · august/io/contracts.aug"]
    n1["ConsoleLogger.log · logging/console.aug"]
    n1 -->|"calls"| n0
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### ConsoleLogger constructor {#sequence-ConsoleLogger-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](console.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as ConsoleLogger constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### ConsoleLogger.log {#sequence-ConsoleLogger.log}

::: spec-paragraph specification-paragraph-2
[Source](console.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as ConsoleLogger.log
    participant p1 as Console.write
    p0->>p1: write(value) · interface dispatch
```

### Called contracts

- [Console](../dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [Console.write](../dependencies/august/0.23.0/io/contracts-diagrams.md#sequence-Console.write) — august/io/contracts.aug
- [Logger](logger-diagrams.md) — logging/logger.aug
