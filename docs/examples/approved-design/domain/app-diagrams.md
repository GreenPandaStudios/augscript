---
title: "domain/app.aug diagrams"
generated: true
source: "examples/approved-design/domain/app.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# domain/app.aug diagrams

[Modules and composition](../index.md)

[Project overview](../diagrams/index.md) · [Compiled explanation](app.md)

## Class interactions

```mermaid
flowchart TD
    n0["Console · august/io/contracts.aug"]
    n1["Application · domain/app.aug"]
    n2["ApplicationImpl · domain/app.aug"]
    n3["Fruit · domain/models.aug"]
    n2 -->|"calls"| n0
    n2 -->|"depends on console"| n0
    n2 -->|"implements"| n1
    n2 -->|"calls"| n3
```

## API calls

```mermaid
flowchart TD
    n0["Console.write · august/io/contracts.aug"]
    n1["Application.start · domain/app.aug"]
    n2["ApplicationImpl.start · domain/app.aug"]
    n3["Fruit · domain/models.aug"]
    n2 -->|"calls"| n0
    n2 -->|"calls"| n3
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Application.start {#sequence-Application.start}

::: spec-paragraph specification-paragraph-1
[Source](app.md#source-L7)
:::

```mermaid
sequenceDiagram
    participant p0 as Application.start

    Note over p0: Interface contract#59; implementation selected at runtime
```

### ApplicationImpl constructor {#sequence-ApplicationImpl-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](app.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as ApplicationImpl constructor

    Note over p0: Receive fields: injected console
```

### ApplicationImpl.start {#sequence-ApplicationImpl.start}

::: spec-paragraph specification-paragraph-3
[Source](app.md#source-L10)
:::

```mermaid
sequenceDiagram
    participant p0 as ApplicationImpl.start
    participant p1 as Fruit
    participant p2 as Console.write
    p0->>p1: Fruit(code, name)
    p0->>p1: Fruit(name, code)
    loop For each item in fruit
    p0->>p2: write(value) · interface dispatch
    end
```

## Called contracts

- [Console.write](../dependencies/august/0.23.0/io/contracts-diagrams.md#sequence-Console.write) — august/io/contracts.aug
- [Application](app-diagrams.md) — domain/app.aug
- [Fruit](models-diagrams.md#sequence-Fruit-20-constructor) — domain/models.aug
