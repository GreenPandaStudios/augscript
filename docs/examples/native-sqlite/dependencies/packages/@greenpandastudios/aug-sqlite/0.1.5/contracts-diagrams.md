---
title: "Diagrams · A database with SQLite"
generated: true
source: "examples/native-sqlite/.aug-spec/packages/@greenpandastudios/aug-sqlite/0.1.5/contracts.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# A database with SQLite diagrams

[A database with SQLite](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](contracts.md)

### Class interactions

```mermaid
flowchart TD
    n0["DatabaseStorage · package/@greenpandastudios/aug-sqlite@0.1.5/contracts.aug"]
    n1["SqliteError · package/@greenpandastudios/aug-sqlite@0.1.5/contracts.aug"]

```

### API calls

```mermaid
flowchart TD
    n0["DatabaseStorage.open · package/@greenpandastudios/aug-sqlite@0.1.5/contracts.aug"]

```

### Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

#### SqliteError constructor {#sequence-SqliteError-20-constructor}

::: spec-paragraph specification-paragraph-1
[Source](contracts.md#source-L4)
:::

```mermaid
sequenceDiagram
    participant p0 as SqliteError constructor

    Note over p0: No calls in this operation#59; see the source and specification
```

#### DatabaseStorage.open {#sequence-DatabaseStorage.open}

::: spec-paragraph specification-paragraph-2
[Source](contracts.md#source-L8)
:::

```mermaid
sequenceDiagram
    participant p0 as DatabaseStorage.open

    Note over p0: May leave with checked errors: SqliteError
    Note over p0: Interface contract#59; implementation selected at runtime
```

