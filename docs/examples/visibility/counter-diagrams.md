---
title: "counter.aug diagrams"
generated: true
source: "examples/visibility/counter.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# counter.aug diagrams

[Private state and helpers](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](counter.md)

## Class interactions

```mermaid
flowchart TD
    n0["Counter"]
    n1["ICounter"]
    n2["_prefix"]
    n0 -->|"calls _label"| n0
    n0 -->|"implements"| n1
    n0 -->|"calls"| n2
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### ICounter.label {#sequence-ICounter.label}

::: spec-paragraph specification-paragraph-1
[Source](counter.md#source-L3)
:::

It returns `string`.

Interface contract; implementation selected at runtime. [Explanation](counter.md).

### Counter constructor {#sequence-Counter-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](counter.md#source-L5)
:::

It implements [`ICounter`](counter.md#symbol-ICounter).

It takes `value` as an integer, kept mutable.

Receive fields: value. [Explanation](counter.md).

### Counter.\_label {#sequence-Counter._label}

::: spec-paragraph specification-paragraph-3
[Source](counter.md#source-L6)
:::

It is private to its defining scope.

```mermaid
sequenceDiagram
    participant p0 as Counter._label

    p0->>p0: _prefix()
    p0-->>p0: _prefix result: string
    Note over p0: Return _prefix()； required cleanup runs before exit
```

### Counter.label {#sequence-Counter.label}

::: spec-paragraph specification-paragraph-4
[Source](counter.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as Counter.label
    participant p1 as self: Counter
    p0->>p1: _label()
    p1-->>p0: _label result: string
    Note over p0: Return self._label()； required cleanup runs before exit
```

### \_prefix {#sequence-_prefix}

::: spec-paragraph specification-paragraph-5
[Source](counter.md#source-L13)
:::

It is private to its defining scope.

Return "count"; required cleanup runs before exit. [Explanation](counter.md).

## Called contracts

- [Counter.\_label](counter-diagrams.md#sequence-Counter._label) — counter.aug
- [ICounter](counter-diagrams.md) — counter.aug
- [\_prefix](counter-diagrams.md#sequence-_prefix) — counter.aug
