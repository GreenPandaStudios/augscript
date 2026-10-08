---
title: "counters.aug diagrams"
generated: true
source: "examples/approved-design/counters.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# counters.aug diagrams

[Modules and composition](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](counters.md)

## Class interactions

```mermaid
flowchart TD
    n0["Counter"]
    n1["State"]
    n2["_Counter"]
    n3["_Initial"]
    n4["_Updated"]
    n2 -->|"implements"| n0
    n2 -->|"calls read； depends on _state"| n1
    n2 -->|"calls"| n4
    n3 -->|"implements"| n1
    n4 -->|"implements"| n1
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### State.read {#sequence-State.read}

::: spec-paragraph specification-paragraph-1
[Source](counters.md#source-L4)
:::

It returns `int`.

Interface contract; implementation selected at runtime. [Explanation](counters.md).

### \_Initial constructor {#sequence-_Initial-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](counters.md#source-L5)
:::

It implements [`State`](counters.md#symbol-State). It is private to this file.

[Explanation](counters.md).

### \_Initial.read {#sequence-_Initial.read}

::: spec-paragraph specification-paragraph-3
[Source](counters.md#source-L6)
:::

Return 0; required cleanup runs before exit. [Explanation](counters.md).

### \_Updated constructor {#sequence-_Updated-20-constructor}

::: spec-paragraph specification-paragraph-4
[Source](counters.md#source-L8)
:::

It implements [`State`](counters.md#symbol-State). It is private to this file.

It takes `count` as an integer, kept read-only.

Receive fields: count. [Explanation](counters.md).

### \_Updated.read {#sequence-_Updated.read}

::: spec-paragraph specification-paragraph-5
[Source](counters.md#source-L9)
:::

Return count; required cleanup runs before exit. [Explanation](counters.md).

### Counter.increment {#sequence-Counter.increment}

::: spec-paragraph specification-paragraph-6
[Source](counters.md#source-L13)
:::

It may change `self`.

Interface contract; implementation selected at runtime. [Explanation](counters.md).

### Counter.value {#sequence-Counter.value}

::: spec-paragraph specification-paragraph-7
[Source](counters.md#source-L14)
:::

It returns `int`.

Interface contract; implementation selected at runtime. [Explanation](counters.md).

### \_Counter constructor {#sequence-_Counter-20-constructor}

::: spec-paragraph specification-paragraph-8
[Source](counters.md#source-L15)
:::

It implements [`Counter`](counters.md#symbol-Counter). It is private to this file.

The `_state` dependency is injected as [`State`](counters.md#symbol-State) and stored mutably and privately.

Receive fields: injected \_state. [Explanation](counters.md).

### \_Counter.increment {#sequence-_Counter.increment}

::: spec-paragraph specification-paragraph-9
[Source](counters.md#source-L16)
:::

It may change `self`.

```mermaid
sequenceDiagram
    participant p0 as _Counter.increment
    participant p1 as _state: State
    participant p2 as _Updated
    p0->>p1: read() · interface dispatch
    p1-->>p0: read result: int
    p0->>p2: _Updated(count=read result + 1)
    p2-->>p0: _state: _Updated
```

### \_Counter.value {#sequence-_Counter.value}

::: spec-paragraph specification-paragraph-10
[Source](counters.md#source-L18)
:::

```mermaid
sequenceDiagram
    participant p0 as _Counter.value
    participant p1 as _state: State
    p0->>p1: read() · interface dispatch
    p1-->>p0: read result: int
    Note over p0: Return _state.read()； required cleanup runs before exit
```

## Called contracts

- [Counter](counters-diagrams.md) — counters.aug
- [State](counters-diagrams.md) — counters.aug
- [State.read](counters-diagrams.md#sequence-State.read) — counters.aug
- [\_Updated](counters-diagrams.md#sequence-_Updated-20-constructor) — counters.aug
