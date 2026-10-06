---
title: "domain/numbers.aug diagrams"
generated: true
source: "examples/approved-design/domain/numbers.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# domain/numbers.aug diagrams

[Modules and composition](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](numbers.md)

## Class interactions

```mermaid
flowchart TD
    n0["Positive"]
    n1["RangeError"]
    n2["double"]
    n2 -->|"intercepted by"| n0
```

::: details Call relationships

```mermaid
flowchart TD
    n0["Positive"]
    n1["Positive.around"]
    n2["RangeError"]
    n3["double"]
    n4["domain/numbers.aug"]
    n1 -->|"calls"| n2
    n3 -->|"intercepted by"| n0
    n4 -->|"calls"| n3
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### RangeError constructor {#sequence-RangeError-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](numbers.md#source-L3)
:::

Receive fields: value. [Explanation](numbers.md).

### Positive.around {#sequence-Positive.around}

::: spec-paragraph specification-paragraph-2
[Source](numbers.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as Positive.around
    participant p1 as RangeError
    participant p2 as next
    alt amount ‹ 0
    p0->>p1: RangeError(value=amount)
    p1-->>p0: RangeError
    Note over p0: Raise checked failure RangeError(value=amount)； required<br/>cleanup runs before exit
    end
    p0->>p2: next() · conditional interceptor delegation
    Note over p0: Return next()； required cleanup runs before exit
    Note over p0: May leave with checked errors: RangeError
```

### double {#sequence-double}

::: spec-paragraph specification-paragraph-3
[Source](numbers.md#source-L18)
:::

Applied layers: Positive; may stop or change delegation; see specification. Return amount \* 2; required cleanup runs before exit. May leave with checked errors: RangeError. [Explanation](numbers.md).

## Called contracts

- [Positive](numbers-diagrams.md) — domain/numbers.aug
- [RangeError](numbers-diagrams.md#sequence-RangeError-20-constructor) — domain/numbers.aug
- [double](numbers-diagrams.md#sequence-double) — domain/numbers.aug
