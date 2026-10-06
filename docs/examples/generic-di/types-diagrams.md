---
title: "types.aug diagrams"
generated: true
source: "examples/generic-di/types.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# types.aug diagrams

[Generic dependency injection](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](types.md)

## Class interactions

```mermaid
flowchart TD
    n0["Console · august/io/contracts.aug"]
    n1["IProgram · types.aug"]
    n2["NumberRepository · types.aug"]
    n3["Program · types.aug"]
    n4["Repository · types.aug"]
    n1 -->|"depends on"| n0
    n2 -->|"implements"| n4
    n3 -->|"calls"| n0
    n3 -->|"depends on"| n0
    n3 -->|"implements"| n1
    n3 -->|"calls"| n4
    n3 -->|"depends on repository"| n4
```

## API calls

```mermaid
flowchart TD
    n0["Console.write · august/io/contracts.aug"]
    n1["IProgram.start · types.aug"]
    n2["NumberRepository.get · types.aug"]
    n3["Program.start · types.aug"]
    n4["Repository.get · types.aug"]
    n3 -->|"calls"| n0
    n3 -->|"calls"| n4
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Repository.get {#sequence-Repository.get}

::: spec-paragraph specification-paragraph-1
[Source](types.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as Repository.get

    Note over p0: Interface contract#59; implementation selected at runtime
```

### NumberRepository constructor {#sequence-NumberRepository-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](types.md#source-L6)
:::

```mermaid
sequenceDiagram
    participant p0 as NumberRepository constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

### NumberRepository.get {#sequence-NumberRepository.get}

::: spec-paragraph specification-paragraph-3
[Source](types.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as NumberRepository.get

    Note over p0: Return 7#59; required cleanup runs before exit
```

### Program constructor {#sequence-Program-20-constructor}

::: spec-paragraph specification-paragraph-4
[Source](types.md#source-L11)
:::

```mermaid
sequenceDiagram
    participant p0 as Program constructor

    Note over p0: Receive fields: injected repository
```

### Program.start {#sequence-Program.start}

::: spec-paragraph specification-paragraph-5
[Source](types.md#source-L12)
:::

```mermaid
sequenceDiagram
    participant p0 as Program.start
    participant p1 as Repository.get
    participant p2 as Console.write
    p0->>p1: get() · interface dispatch
    p0->>p2: write(value) · interface dispatch
```

### IProgram.start {#sequence-IProgram.start}

::: spec-paragraph specification-paragraph-6
[Source](types.md#source-L17)
:::

```mermaid
sequenceDiagram
    participant p0 as IProgram.start

    Note over p0: Interface contract#59; implementation selected at runtime
```

## Called contracts

- [Console](dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [Console.write](dependencies/august/0.23.0/io/contracts-diagrams.md#sequence-Console.write) — august/io/contracts.aug
- [IProgram](types-diagrams.md) — types.aug
- [Repository](types-diagrams.md) — types.aug
- [Repository.get](types-diagrams.md#sequence-Repository.get) — types.aug
