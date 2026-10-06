---
title: "calculator.aug diagrams"
generated: true
source: "examples/developer-workflow/calculator.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# calculator.aug diagrams

[A small tested application](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](calculator.md)

## Class interactions

```mermaid
flowchart TD
    n0["Console"]
    n1["Arithmetic"]
    n2["Calculator"]
    n3["_SilentLogger"]
    n4["Logger"]
    n5["calculator.aug"]
    n1 -->|"depends on"| n0
    n2 -->|"depends on"| n0
    n2 -->|"implements"| n1
    n2 -->|"calls"| n4
    n2 -->|"depends on _logger"| n4
    n3 -->|"depends on"| n0
    n3 -->|"implements"| n4
    n5 -->|"calls"| n2
```

::: details Call relationships

```mermaid
flowchart TD
    n0["Calculator"]
    n1["Calculator.add"]
    n2["Logger.log"]
    n3["calculator.aug"]
    n1 -->|"calls"| n2
    n3 -->|"calls"| n0
    n3 -->|"calls"| n1
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Arithmetic.add {#sequence-Arithmetic.add}

::: spec-paragraph specification-paragraph-1
[Source](calculator.md#source-L6)
:::

Interface contract; implementation selected at runtime. [Explanation](calculator.md).

### Calculator constructor {#sequence-Calculator-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](calculator.md#source-L9)
:::

Receive fields: injected \_logger. [Explanation](calculator.md).

### Calculator.add {#sequence-Calculator.add}

::: spec-paragraph specification-paragraph-3
[Source](calculator.md#source-L16)
:::

```mermaid
sequenceDiagram
    participant p0 as Calculator.add
    participant p1 as _logger: Logger
    p0->>p1: log(message=”adding integers”) · interface dispatch
    Note over p0: Return left + right； required cleanup runs before exit
```

### load {#sequence-load}

::: spec-paragraph specification-paragraph-4
[Source](calculator.md#source-L26)
:::

```mermaid
sequenceDiagram
    participant p0 as load
    participant p1 as FileError
    alt fail
    p0->>p1: FileError()
    Note over p0: Raise checked failure FileError()； required cleanup runs<br/>before exit
    end
    Note over p0: Return ”loaded”； required cleanup runs before exit
    Note over p0: May leave with checked errors: FileError
```

### \_SilentLogger constructor {#sequence-_SilentLogger-20-constructor}

::: spec-paragraph specification-paragraph-5
[Source](calculator.md#source-L33)
:::

[Explanation](calculator.md).

### \_SilentLogger.log {#sequence-_SilentLogger.log}

::: spec-paragraph specification-paragraph-6
[Source](calculator.md#source-L34)
:::

[Explanation](calculator.md).

## Called contracts

- [Console](dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [Arithmetic](calculator-diagrams.md) — calculator.aug
- [Calculator](calculator-diagrams.md#sequence-Calculator-20-constructor) — calculator.aug
- [Calculator.add](calculator-diagrams.md#sequence-Calculator.add) — calculator.aug
- [Logger](logging/logger-diagrams.md) — logging/logger.aug
- [Logger.log](logging/logger-diagrams.md#sequence-Logger.log) — logging/logger.aug
