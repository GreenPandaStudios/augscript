---
title: "Diagrams · Labeled calls and injection"
generated: true
source: "examples/new-syntax/logger.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Labeled calls and injection diagrams

[Labeled calls and injection](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](logger.md)

### Class interactions

```mermaid
flowchart TD
    n0["Console · august/io/contracts.aug"]
    n1["Logger · logger.aug"]
    n1 -->|"depends on"| n0
```

### API calls

```mermaid
flowchart TD
    n0["Logger.log · logger.aug"]

```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### Logger.log {#sequence-Logger.log}

::: spec-paragraph specification-paragraph-1
[Source](logger.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as Logger.log

    Note over p0: Interface contract#59; implementation selected at runtime
```

### Called contracts

- [Console](dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
