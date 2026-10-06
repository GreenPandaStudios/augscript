---
title: "types.aug diagrams"
generated: true
source: "examples/generics/types.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# types.aug diagrams

[Generic types and functions](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](types.md)

## Class interactions

```mermaid
flowchart TD
    n0["Box · types.aug"]
    n1["Formatter · types.aug"]
    n2["IBox · types.aug"]
    n3["TextFormatter · types.aug"]
    n0 -->|"implements"| n2
    n3 -->|"implements"| n1
```

## API calls

```mermaid
flowchart TD
    n0["Box.get · types.aug"]
    n1["Formatter.format · types.aug"]
    n2["Formatter.title · types.aug"]
    n3["IBox.get · types.aug"]
    n4["TextFormatter.format · types.aug"]

```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### Formatter.format {#sequence-Formatter.format}

::: spec-paragraph specification-paragraph-1
[Source](types.md#source-L3)
:::

```mermaid
sequenceDiagram
    participant p0 as Formatter.format

    Note over p0: Interface contract#59; implementation selected at runtime
```

### Formatter.title {#sequence-Formatter.title}

::: spec-paragraph specification-paragraph-2
[Source](types.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as Formatter.title

    Note over p0: Return #34;formatted#34;#59; required cleanup runs before exit
```

### TextFormatter constructor {#sequence-TextFormatter-20-constructor}

::: spec-paragraph specification-paragraph-3
[Source](types.md#source-L8)
:::

```mermaid
sequenceDiagram
    participant p0 as TextFormatter constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

### TextFormatter.format {#sequence-TextFormatter.format}

::: spec-paragraph specification-paragraph-4
[Source](types.md#source-L9)
:::

```mermaid
sequenceDiagram
    participant p0 as TextFormatter.format

    Note over p0: Return #34;generic method called#34;#59; required cleanup runs before exit
```

### Box constructor {#sequence-Box-20-constructor}

::: spec-paragraph specification-paragraph-5
[Source](types.md#source-L13)
:::

```mermaid
sequenceDiagram
    participant p0 as Box constructor

    Note over p0: Receive fields: value
```

### Box.get {#sequence-Box.get}

::: spec-paragraph specification-paragraph-6
[Source](types.md#source-L14)
:::

```mermaid
sequenceDiagram
    participant p0 as Box.get

    Note over p0: Return value#59; required cleanup runs before exit
```

### IBox.get {#sequence-IBox.get}

::: spec-paragraph specification-paragraph-7
[Source](types.md#source-L19)
:::

```mermaid
sequenceDiagram
    participant p0 as IBox.get

    Note over p0: Interface contract#59; implementation selected at runtime
```

## Called contracts

- [Formatter](types-diagrams.md) — types.aug
- [IBox](types-diagrams.md) — types.aug
