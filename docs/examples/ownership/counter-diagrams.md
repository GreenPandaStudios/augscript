---
title: "counter.aug diagrams"
generated: true
source: "examples/ownership/counter.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# counter.aug diagrams

[Read access and mutable borrows](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](counter.md)

## Class interactions

```mermaid
flowchart TD
    n0["Counter"]
    n1["ICounter"]
    n0 -->|"implements"| n1
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Counter constructor {#sequence-Counter-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](counter.md#source-L2)
:::

Receive fields: value. [Explanation](counter.md).

### Counter.increment {#sequence-Counter.increment}

::: spec-paragraph specification-paragraph-2
[Source](counter.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as Counter.increment

    rect rgb(245, 240, 241)
    Note over p0: Enter borrow scope
    Note over p0: Set value to value + 1
    Note over p0: Leave borrow scope
    end
```

### Counter.read {#sequence-Counter.read}

::: spec-paragraph specification-paragraph-3
[Source](counter.md#source-L8)
:::

Return value; required cleanup runs before exit. [Explanation](counter.md).

### ICounter.increment {#sequence-ICounter.increment}

::: spec-paragraph specification-paragraph-4
[Source](counter.md#source-L13)
:::

Interface contract; implementation selected at runtime. [Explanation](counter.md).

### ICounter.read {#sequence-ICounter.read}

::: spec-paragraph specification-paragraph-5
[Source](counter.md#source-L14)
:::

Interface contract; implementation selected at runtime. [Explanation](counter.md).

## Called contracts

- [ICounter](counter-diagrams.md) — counter.aug
