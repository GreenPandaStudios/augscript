---
title: "logger.aug diagrams"
generated: true
source: "examples/new-syntax/logger.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# logger.aug diagrams

[Labeled calls and injection](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](logger.md)

## Class interactions

```mermaid
flowchart TD
    n0["Console"]
    n1["Logger"]
    n1 -->|"depends on"| n0
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Logger.log {#sequence-Logger.log}

::: spec-paragraph specification-paragraph-1
[Source](logger.md#source-L6)
:::

It takes `message` as a string (Text to display). It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection.

It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

Interface contract; implementation selected at runtime. [Explanation](logger.md).

## Called contracts

- [Console](dependencies/august/1.0.0/io/contracts-diagrams.md) — august/io/contracts.aug
