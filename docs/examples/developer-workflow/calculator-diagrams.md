---
title: "Diagrams · A small tested application"
generated: true
source: "examples/developer-workflow/calculator.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# A small tested application diagrams

[A small tested application](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](calculator.md)

### Class interactions

```mermaid
flowchart TD
    n0["Console · august/io/contracts.aug"]
    n1["Arithmetic · calculator.aug"]
    n2["Calculator · calculator.aug"]
    n3["_SilentLogger · calculator.aug"]
    n4["Logger · logging/logger.aug"]
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

### API calls

```mermaid
flowchart TD
    n0["Arithmetic.add · calculator.aug"]
    n1["Calculator · calculator.aug"]
    n2["Calculator.add · calculator.aug"]
    n3["_SilentLogger.log · calculator.aug"]
    n4["load · calculator.aug"]
    n5["Logger.log · logging/logger.aug"]
    n6["calculator.aug"]
    n2 -->|"calls"| n5
    n6 -->|"calls"| n1
    n6 -->|"calls"| n2
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Arithmetic.add {#sequence-Arithmetic.add}

::: spec-paragraph specification-paragraph-1
[Source](calculator.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as Arithmetic.add

    Note over p0: Interface contract#59; implementation selected at runtime
```

#### Calculator constructor {#sequence-Calculator-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](calculator.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as Calculator constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### Calculator.add {#sequence-Calculator.add}

::: spec-paragraph specification-paragraph-3
[Source](calculator.md#source-L16)
:::

```mermaid
sequenceDiagram
    participant p0 as Calculator.add
    participant p1 as Logger.log
    p0->>p1: log(message) · interface dispatch
    Note over p0: Return left + right#59; required cleanup runs before exit
```

#### load {#sequence-load}

::: spec-paragraph specification-paragraph-4
[Source](calculator.md#source-L26)
:::

```mermaid
sequenceDiagram
    participant p0 as load
    participant p1 as FileError
    alt fail
    p0->>p1: FileError()
    Note over p0: Raise checked failure FileError()#59; required cleanup runs before exit
    end
    Note over p0: Return #34;loaded#34;#59; required cleanup runs before exit
    Note over p0: May leave with checked errors: FileError
```

#### \_SilentLogger constructor {#sequence-_SilentLogger-20-constructor}

::: spec-paragraph specification-paragraph-5
[Source](calculator.md#source-L33)
:::

```mermaid
sequenceDiagram
    participant p0 as _SilentLogger constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### \_SilentLogger.log {#sequence-_SilentLogger.log}

::: spec-paragraph specification-paragraph-6
[Source](calculator.md#source-L34)
:::

```mermaid
sequenceDiagram
    participant p0 as _SilentLogger.log

    Note over p0: No calls in this operation#59; see the source and specification
```

### Called contracts

- [Console](dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [Arithmetic](calculator-diagrams.md) — calculator.aug
- [Calculator](calculator-diagrams.md#sequence-Calculator-20-constructor) — calculator.aug
- [Calculator.add](calculator-diagrams.md#sequence-Calculator.add) — calculator.aug
- [Logger](logging/logger-diagrams.md) — logging/logger.aug
- [Logger.log](logging/logger-diagrams.md#sequence-Logger.log) — logging/logger.aug
