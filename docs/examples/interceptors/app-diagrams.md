---
title: "app.aug diagrams"
generated: true
source: "examples/interceptors/app.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# app.aug diagrams

[Function and constructor middleware](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](app.md)

## Class interactions

```mermaid
flowchart TD
    n0["Greeter · app.aug"]
    n1["IGreeter · app.aug"]
    n2["describe · app.aug"]
    n3["Console · august/io/contracts.aug"]
    n4["AddOne · interceptors.aug"]
    n5["Audit · interceptors.aug"]
    n6["Positive · interceptors.aug"]
    n7["Logger · logging.aug"]
    n0 -->|"implements"| n1
    n0 -->|"depends on"| n3
    n0 -->|"intercepted by"| n5
    n0 -->|"depends on"| n7
    n0 -->|"depends on _logger"| n7
    n1 -->|"depends on"| n3
    n1 -->|"depends on"| n7
    n2 -->|"calls"| n3
    n2 -->|"depends on"| n3
    n2 -->|"intercepted by"| n4
    n2 -->|"intercepted by"| n5
    n2 -->|"intercepted by"| n6
    n2 -->|"depends on"| n7
```

## API calls

```mermaid
flowchart TD
    n0["Greeter.greet · app.aug"]
    n1["IGreeter.greet · app.aug"]
    n2["describe · app.aug"]
    n3["Console.write · august/io/contracts.aug"]
    n4["AddOne · interceptors.aug"]
    n5["Audit · interceptors.aug"]
    n6["Positive · interceptors.aug"]
    n0 -->|"intercepted by"| n5
    n2 -->|"calls"| n3
    n2 -->|"intercepted by"| n4
    n2 -->|"intercepted by"| n5
    n2 -->|"intercepted by"| n6
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### describe {#sequence-describe}

::: spec-paragraph specification-paragraph-1
[Source](app.md#source-L15)
:::

```mermaid
sequenceDiagram
    participant p0 as describe
    participant p1 as Console.write
    Note over p0: Applied layers: Audit, Positive, AddOne#59; may stop or change delegation#59; see specification
    p0->>p1: write(value) · interface dispatch
    Note over p0: Return label#59; required cleanup runs before exit
    Note over p0: May leave with checked errors: ValidationError
```

### IGreeter.greet {#sequence-IGreeter.greet}

::: spec-paragraph specification-paragraph-2
[Source](app.md#source-L20)
:::

```mermaid
sequenceDiagram
    participant p0 as IGreeter.greet

    Note over p0: Interface contract#59; implementation selected at runtime
```

### Greeter constructor {#sequence-Greeter-20-constructor}

::: spec-paragraph specification-paragraph-3
[Source](app.md#source-L23)
:::

```mermaid
sequenceDiagram
    participant p0 as Greeter constructor

    Note over p0: Receive fields: injected _logger, name
```

### Greeter.greet {#sequence-Greeter.greet}

::: spec-paragraph specification-paragraph-4
[Source](app.md#source-L26)
:::

```mermaid
sequenceDiagram
    participant p0 as Greeter.greet

    Note over p0: Applied layers: Audit#59; may stop or change delegation#59; see specification
    Note over p0: Return #34;Hello, #34; + name + #34;!#34;#59; required cleanup runs before exit
```

## Called contracts

- [IGreeter](app-diagrams.md) — app.aug
- [Console](dependencies/august/0.23.0/io/contracts-diagrams.md) — august/io/contracts.aug
- [Console.write](dependencies/august/0.23.0/io/contracts-diagrams.md#sequence-Console.write) — august/io/contracts.aug
- [AddOne](interceptors-diagrams.md) — interceptors.aug
- [Audit](interceptors-diagrams.md) — interceptors.aug
- [Positive](interceptors-diagrams.md) — interceptors.aug
- [Logger](logging-diagrams.md) — logging.aug
