---
title: "package/@greenpandastudios/aug-sqlite@0.1.5/api.aug diagrams"
generated: true
source: "examples/native-sqlite/.aug-spec/packages/@greenpandastudios/aug-sqlite/0.1.5/api.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@greenpandastudios/aug-sqlite@0.1.5/api.aug diagrams

[A database with SQLite](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](api.md)

## Class interactions

```mermaid
flowchart TD
    n0["NativeDatabaseStorage"]
    n1["_open"]
    n2["open"]
    n3["DatabaseStorage"]
    n0 -->|"calls"| n1
    n0 -->|"implements"| n3
    n2 -->|"calls"| n3
    n2 -->|"depends on"| n3
```

::: details Call relationships

```mermaid
flowchart TD
    n0["NativeDatabaseStorage.open"]
    n1["_execute"]
    n2["_open"]
    n3["_queryScalar"]
    n4["execute"]
    n5["open"]
    n6["openMemory"]
    n7["queryScalar"]
    n8["DatabaseStorage.open"]
    n0 -->|"calls"| n2
    n4 -->|"calls"| n1
    n5 -->|"calls"| n8
    n6 -->|"calls"| n2
    n7 -->|"calls"| n3
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_open {#sequence-_open}

::: spec-paragraph specification-paragraph-1
[Source](api.md#source-L5)
:::

May leave with checked errors: SqliteError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_execute {#sequence-_execute}

::: spec-paragraph specification-paragraph-2
[Source](api.md#source-L6)
:::

May leave with checked errors: SqliteError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_queryScalar {#sequence-_queryScalar}

::: spec-paragraph specification-paragraph-3
[Source](api.md#source-L7)
:::

May leave with checked errors: SqliteError. Native implementation; only the declared contract is known. [Explanation](api.md).

### NativeDatabaseStorage constructor {#sequence-NativeDatabaseStorage-20-constructor}

::: spec-paragraph specification-paragraph-4
[Source](api.md#source-L9)
:::

[Explanation](api.md).

### NativeDatabaseStorage.open {#sequence-NativeDatabaseStorage.open}

::: spec-paragraph specification-paragraph-5
[Source](api.md#source-L10)
:::

```mermaid
sequenceDiagram
    participant p0 as NativeDatabaseStorage.open
    participant p1 as _open
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _open(path=path) · native boundary
    p1-->>p0: Database
    Note over p0: Return _open(path)； required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: SqliteError
```

### open {#sequence-open}

::: spec-paragraph specification-paragraph-6
[Source](api.md#source-L13)
:::

```mermaid
sequenceDiagram
    participant p0 as open
    participant p1 as storage: DatabaseStorage
    p0->>p1: open(path=path) · interface dispatch
    p1-->>p0: Database
    Note over p0: Return storage.open(path)； required cleanup runs before exit
    Note over p0: May leave with checked errors: SqliteError
```

### openMemory {#sequence-openMemory}

::: spec-paragraph specification-paragraph-7
[Source](api.md#source-L16)
:::

```mermaid
sequenceDiagram
    participant p0 as openMemory
    participant p1 as _open
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _open(path=”:memory:”) · native boundary
    p1-->>p0: Database
    Note over p0: Return _open(path=”:memory:”)； required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: SqliteError
```

### execute {#sequence-execute}

::: spec-paragraph specification-paragraph-8
[Source](api.md#source-L20)
:::

```mermaid
sequenceDiagram
    participant p0 as execute
    participant p1 as _execute
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _execute(database=database, sql=sql, parameters=parameters) · native boundary
    p1-->>p0: int
    Note over p0: Return _execute(database, sql, parameters)； required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: SqliteError
```

### queryScalar {#sequence-queryScalar}

::: spec-paragraph specification-paragraph-9
[Source](api.md#source-L24)
:::

```mermaid
sequenceDiagram
    participant p0 as queryScalar
    participant p1 as _queryScalar
    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p1: _queryScalar(database=database, sql=sql, parameters=parameters) · native boundary
    p1-->>p0: string
    Note over p0: Return _queryScalar(database, sql, parameters)； required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: SqliteError
```

## Called contracts

- [\_execute](api-diagrams.md#sequence-_execute) — package/@greenpandastudios/aug-sqlite@0.1.5/api.aug
- [\_open](api-diagrams.md#sequence-_open) — package/@greenpandastudios/aug-sqlite@0.1.5/api.aug
- [\_queryScalar](api-diagrams.md#sequence-_queryScalar) — package/@greenpandastudios/aug-sqlite@0.1.5/api.aug
- [DatabaseStorage](contracts-diagrams.md) — package/@greenpandastudios/aug-sqlite@0.1.5/contracts.aug
- [DatabaseStorage.open](contracts-diagrams.md#sequence-DatabaseStorage.open) — package/@greenpandastudios/aug-sqlite@0.1.5/contracts.aug
