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
    n0["Console"]
    n1["Application"]
    n2["ApplicationImpl"]
    n2 -->|"calls write； depends on console"| n0
    n2 -->|"implements"| n1
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Application.start {#sequence-Application.start}

::: spec-paragraph specification-paragraph-1
[Source](app.md#source-L7)
:::

Writes the fruit names through the selected console.

It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

Interface contract; implementation selected at runtime. [Explanation](app.md).

### ApplicationImpl constructor {#sequence-ApplicationImpl-20-constructor}

::: spec-paragraph specification-paragraph-2
[Source](app.md#source-L9)
:::

Construction stores dependencies; start performs the visible external work. It implements [`Application`](app.md#symbol-Application).

The `console` dependency is injected as [`Console`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console) and stored read-only.

Receive fields: injected console. [Explanation](app.md).

### ApplicationImpl.start {#sequence-ApplicationImpl.start}

::: spec-paragraph specification-paragraph-3
[Source](app.md#source-L10)
:::

Writes the fruit names through the selected console.

It can call [`Console.write`](../dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

```mermaid
sequenceDiagram
    participant p0 as ApplicationImpl.start
    participant p1 as console: Console
    p0->>p0: Fruit(code=1, name=”apple”) · construct value
    p0-->>p0: Fruit result: Fruit
    p0->>p0: Fruit(name=”pear”, code=2) · construct value
    p0-->>p0: Fruit result 2: Fruit
    Note over p0: Set fruit to ［Fruit result, Fruit result 2］
    loop For each item in fruit
    p0->>p1: write(value=item.name) · interface dispatch
    end
```

## Called contracts

- [Console.write](../dependencies/august/1.0.0/io/contracts-diagrams.md#sequence-Console.write) — august/io/contracts.aug
- [Application](app-diagrams.md) — domain/app.aug
- [Fruit](models-diagrams.md#sequence-Fruit-20-constructor) — domain/models.aug
