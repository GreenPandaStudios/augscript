---
title: "Diagrams · Modules and composition"
generated: true
source: "examples/approved-design/counters.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# Modules and composition diagrams

[Modules and composition](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](counters.md)

### Class interactions

```mermaid
flowchart TD
    n0["Counter · counters.aug"]
    n1["State · counters.aug"]
    n2["_Counter · counters.aug"]
    n3["_Initial · counters.aug"]
    n4["_Updated · counters.aug"]
    n2 -->|"implements"| n0
    n2 -->|"calls"| n1
    n2 -->|"depends on _state"| n1
    n2 -->|"calls"| n4
    n3 -->|"implements"| n1
    n4 -->|"implements"| n1
```

### API calls

```mermaid
flowchart TD
    n0["Counter.increment · counters.aug"]
    n1["Counter.value · counters.aug"]
    n2["State.read · counters.aug"]
    n3["_Counter.increment · counters.aug"]
    n4["_Counter.value · counters.aug"]
    n5["_Initial.read · counters.aug"]
    n6["_Updated · counters.aug"]
    n7["_Updated.read · counters.aug"]
    n3 -->|"calls"| n2
    n3 -->|"calls"| n6
    n4 -->|"calls"| n2
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### State.read {#sequence-State.read}

::: spec-paragraph specification-paragraph-1
[Source](counters.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as State.read

    Note over p0: Interface contract#59; implementation selected at runtime
```

#### \_Initial constructor {#sequence-_Initial-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](counters.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as _Initial constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### \_Initial.read {#sequence-_Initial.read}

::: spec-paragraph specification-paragraph-3
[Source](counters.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as _Initial.read

    Note over p0: Return 0#59; required cleanup runs before exit
```

#### \_Updated constructor {#sequence-_Updated-20-constructor}

::: spec-paragraph specification-paragraph-4
[Source](counters.md#source-L8)
:::

```mermaid
sequenceDiagram
    participant p0 as _Updated constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### \_Updated.read {#sequence-_Updated.read}

::: spec-paragraph specification-paragraph-5
[Source](counters.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as _Updated.read

    Note over p0: Return count#59; required cleanup runs before exit
```

#### Counter.increment {#sequence-Counter.increment}

::: spec-paragraph specification-paragraph-6
[Source](counters.md#source-L13)
:::

```mermaid
sequenceDiagram
    participant p0 as Counter.increment

    Note over p0: Interface contract#59; implementation selected at runtime
```

#### Counter.value {#sequence-Counter.value}

::: spec-paragraph specification-paragraph-7
[Source](counters.md#source-L14)
:::

```mermaid
sequenceDiagram
    participant p0 as Counter.value

    Note over p0: Interface contract#59; implementation selected at runtime
```

#### \_Counter constructor {#sequence-_Counter-20-constructor}

::: spec-paragraph specification-paragraph-8
[Source](counters.md#source-L15)
:::

```mermaid
sequenceDiagram
    participant p0 as _Counter constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### \_Counter.increment {#sequence-_Counter.increment}

::: spec-paragraph specification-paragraph-9
[Source](counters.md#source-L16)
:::

```mermaid
sequenceDiagram
    participant p0 as _Counter.increment
    participant p1 as State.read
    participant p2 as _Updated
    p0->>p1: read() · interface dispatch
    p0->>p2: _Updated(count)
```

#### \_Counter.value {#sequence-_Counter.value}

::: spec-paragraph specification-paragraph-10
[Source](counters.md#source-L18)
:::

```mermaid
sequenceDiagram
    participant p0 as _Counter.value
    participant p1 as State.read
    p0->>p1: read() · interface dispatch
    Note over p0: Return _state.read()#59; required cleanup runs before exit
```

### Called contracts

- [Counter](counters-diagrams.md) — counters.aug
- [State](counters-diagrams.md) — counters.aug
- [State.read](counters-diagrams.md#sequence-State.read) — counters.aug
- [\_Updated](counters-diagrams.md#sequence-_Updated-20-constructor) — counters.aug
