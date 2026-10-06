---
title: "database.aug diagrams"
generated: true
source: "examples/native-sqlite/database.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# database.aug diagrams

[A database with SQLite](index.md)

[Project overview](diagrams/index.md) · [Compiled explanation](database.md)


::: details Call relationships

```mermaid
flowchart TD
    n0["storedName"]
    n1["database.aug"]
    n2["execute"]
    n3["openMemory"]
    n4["queryScalar"]
    n0 -->|"calls"| n2
    n0 -->|"calls"| n3
    n0 -->|"calls"| n4
    n1 -->|"calls"| n0
```

:::

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### storedName {#sequence-storedName}

::: spec-paragraph specification-paragraph-1
[Source](database.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as storedName
    participant p1 as openMemory
    participant p2 as execute
    participant p3 as queryScalar
    p0->>p1: openMemory()
    p1-->>p0: database: Database
    Note over p0: Own database； release on scope exits
    rect rgb(245, 240, 241)
    Note over p0: Enter borrow scope
    p0->>p2: execute(database=database, sql=”CREATE TABLE users (name TEXT NOT NULL)”, parameters=［］)
    p2-->>p0: int
    p0->>p2: execute(database=database, sql=”INSERT INTO users (name) VALUES (?)”, parameters=［”August”］)
    p2-->>p0: int
    Note over p0: Leave borrow scope
    end
    p0->>p3: queryScalar(database=database, sql=”SELECT name FROM users”, parameters=［］)
    p3-->>p0: string
    Note over p0: Return queryScalar(database, sql=”SELECT name FROM users”, parameters=［］)； required cleanup runs before exit
    Note over p0: May leave with checked errors: SqliteError
```

## Called contracts

- [storedName](database-diagrams.md#sequence-storedName) — database.aug
- [execute](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api-diagrams.md#sequence-execute) — package/@greenpandastudios/aug-sqlite@0.1.5/api.aug
- [openMemory](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api-diagrams.md#sequence-openMemory) — package/@greenpandastudios/aug-sqlite@0.1.5/api.aug
- [queryScalar](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api-diagrams.md#sequence-queryScalar) — package/@greenpandastudios/aug-sqlite@0.1.5/api.aug
