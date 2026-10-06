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

## Class interactions

No relationships at this level.

## API calls

```mermaid
flowchart TD
    n0["storedName · database.aug"]
    n1["database.aug"]
    n2["execute · package/@greenpandastudios/aug-sqlite@0.1.5/api.aug"]
    n3["openMemory · package/@greenpandastudios/aug-sqlite@0.1.5/api.aug"]
    n4["queryScalar · package/@greenpandastudios/aug-sqlite@0.1.5/api.aug"]
    n0 -->|"calls"| n2
    n0 -->|"calls"| n3
    n0 -->|"calls"| n4
    n1 -->|"calls"| n0
```

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
    Note over p0: Own database#59; release on scope exits
    rect rgb(245, 240, 241)
    Note over p0: Enter borrow scope
    p0->>p2: execute(database, sql, parameters)
    p0->>p2: execute(database, sql, parameters)
    Note over p0: Leave borrow scope
    end
    p0->>p3: queryScalar(database, sql, parameters)
    Note over p0: Return queryScalar(database, sql=#34;SELECT name FROM users#34;, parameters=#91;#93;)#59; required cleanup runs before exit
    Note over p0: May leave with checked errors: SqliteError
```

## Called contracts

- [storedName](database-diagrams.md#sequence-storedName) — database.aug
- [execute](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api-diagrams.md#sequence-execute) — package/@greenpandastudios/aug-sqlite@0.1.5/api.aug
- [openMemory](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api-diagrams.md#sequence-openMemory) — package/@greenpandastudios/aug-sqlite@0.1.5/api.aug
- [queryScalar](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api-diagrams.md#sequence-queryScalar) — package/@greenpandastudios/aug-sqlite@0.1.5/api.aug
