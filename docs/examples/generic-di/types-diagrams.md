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
    n0["Console"]
    n1["IProgram"]
    n2["NumberRepository"]
    n3["Program"]
    n4["Repository"]
    n1 -->|"depends on"| n0
    n2 -->|"implements"| n4
    n3 -->|"calls write； depends on"| n0
    n3 -->|"implements"| n1
    n3 -->|"calls get； depends on repository"| n4
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Repository.get {#sequence-Repository.get}

::: spec-paragraph specification-paragraph-1
[Source](types.md#source-L4)
:::

It returns `T`.

Interface contract; implementation selected at runtime. [Explanation](types.md).

### NumberRepository constructor {#sequence-NumberRepository-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](types.md#source-L6)
:::

It implements [`Repository<int>`](types.md#symbol-Repository).

[Explanation](types.md).

### NumberRepository.get {#sequence-NumberRepository.get}

::: spec-paragraph specification-paragraph-3
[Source](types.md#source-L7)
:::

Return 7; required cleanup runs before exit. [Explanation](types.md).

### Program constructor {#sequence-Program-20-constructor}

::: spec-paragraph specification-paragraph-4
[Source](types.md#source-L11)
:::

It implements [`IProgram`](types.md#symbol-IProgram).

The `repository` dependency is injected as [`Repository<int>`](types.md#symbol-Repository) and stored read-only.

Receive fields: injected repository. [Explanation](types.md).

### Program.start {#sequence-Program.start}

::: spec-paragraph specification-paragraph-5
[Source](types.md#source-L12)
:::

It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection.

It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

```mermaid
sequenceDiagram
    participant p0 as Program.start
    participant p1 as repository: Repository
    participant p2 as console: Console
    p0->>p1: get() · interface dispatch
    p1-->>p0: get result: int
    p0->>p2: write(value=get result) · interface dispatch
```

### IProgram.start {#sequence-IProgram.start}

::: spec-paragraph specification-paragraph-6
[Source](types.md#source-L17)
:::

It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection.

It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

Interface contract; implementation selected at runtime. [Explanation](types.md).

## Called contracts

- [Console](dependencies/august/1.0.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [Console.write](dependencies/august/1.0.0/io/contracts-diagrams.md#sequence-Console.write) — august/io/contracts.aug
- [IProgram](types-diagrams.md) — types.aug
- [Repository](types-diagrams.md) — types.aug
- [Repository.get](types-diagrams.md#sequence-Repository.get) — types.aug
