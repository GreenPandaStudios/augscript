---
title: "Diagrams · A native C boundary"
generated: true
source: "examples/ffi/native.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# A native C boundary diagrams

[A native C boundary](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](native.md)

### Class interactions

No relationships at this level.

### API calls

```mermaid
flowchart TD
    n0["announce · native.aug"]
    n1["puts · native.aug"]
    n0 -->|"calls"| n1
```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### puts {#sequence-puts}

::: spec-paragraph specification-paragraph-1
[Source](native.md#source-L2)
:::

```mermaid
sequenceDiagram
    participant p0 as puts

    Note over p0: Native implementation#59; only the declared contract is known
```

#### announce {#sequence-announce}

::: spec-paragraph specification-paragraph-2
[Source](native.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as announce
    participant p1 as puts
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: puts(message) · native boundary
    Note over p0: Leave unsafe scope
    end
```

### Called contracts

- [puts](native-diagrams.md#sequence-puts) — native.aug
