---
title: "Diagrams · Private state and helpers"
generated: true
source: "examples/visibility/counter.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Private state and helpers diagrams

[Private state and helpers](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](counter.md)

### Class interactions

```mermaid
flowchart TD
    n0["Counter · counter.aug"]
    n1["ICounter · counter.aug"]
    n2["_prefix · counter.aug"]
    n0 -->|"calls"| n0
    n0 -->|"implements"| n1
    n0 -->|"calls"| n2
```

### API calls

```mermaid
flowchart TD
    n0["Counter._label · counter.aug"]
    n1["Counter.label · counter.aug"]
    n2["ICounter.label · counter.aug"]
    n3["_prefix · counter.aug"]
    n0 -->|"calls"| n3
    n1 -->|"calls"| n0
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### ICounter.label {#sequence-ICounter.label}

::: spec-paragraph specification-paragraph-1
[Source](counter.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as ICounter.label

    Note over p0: Interface contract#59; implementation selected at runtime
```

#### Counter constructor {#sequence-Counter-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](counter.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as Counter constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### Counter.\_label {#sequence-Counter._label}

::: spec-paragraph specification-paragraph-3
[Source](counter.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as Counter._label
    participant p1 as _prefix
    p0->>p1: _prefix()
    Note over p0: Return _prefix()#59; required cleanup runs before exit
```

#### Counter.label {#sequence-Counter.label}

::: spec-paragraph specification-paragraph-4
[Source](counter.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as Counter.label
    participant p1 as Counter._label
    p0->>p1: _label()
    Note over p0: Return self._label()#59; required cleanup runs before exit
```

#### \_prefix {#sequence-_prefix}

::: spec-paragraph specification-paragraph-5
[Source](counter.md#source-L13)
:::

```mermaid
sequenceDiagram
    participant p0 as _prefix

    Note over p0: Return #34;count#34;#59; required cleanup runs before exit
```

### Called contracts

- [Counter.\_label](counter-diagrams.md#sequence-Counter._label) — counter.aug
- [ICounter](counter-diagrams.md) — counter.aug
- [\_prefix](counter-diagrams.md#sequence-_prefix) — counter.aug
