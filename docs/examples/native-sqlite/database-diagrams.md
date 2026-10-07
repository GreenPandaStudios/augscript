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


## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### storedName {#sequence-storedName}

::: spec-paragraph specification-paragraph-1
[Source](database.md#source-L5)
:::

```mermaid
sequenceDiagram
    participant p0 as storedName
    participant p1 as aug-sqlite/api
    p0->>p1: openMemory()
    p1-->>p0: database: Database
    Note over p0: Own database； release on scope exits
    rect rgb(245, 240, 241)
    Note over p0: Enter borrow scope
    p0->>p1: execute(database=database, sql=”CREATE TABLE users (name<br/>TEXT NOT NULL)”, parameters=［］)
    p1-->>p0: execute result: int
    p0->>p1: execute(database=database, sql=”INSERT INTO users (name)<br/>VALUES (?)”, parameters=［”August”］)
    p1-->>p0: execute result 2: int
    Note over p0: Leave borrow scope
    end
    p0->>p1: queryScalar(database=database, sql=”SELECT name FROM<br/>users”, parameters=［］)
    p1-->>p0: queryScalar result: string
    Note over p0: Return queryScalar(database, sql=”SELECT name FROM<br/>users”, parameters=［］)； required cleanup runs before<br/>exit
    Note over p0: May leave with checked errors: SqliteError
```

## Called contracts

- [storedName](database-diagrams.md#sequence-storedName) — database.aug
- [execute](dependencies/packages/%40greenpandastudios/aug-sqlite/0.2.0/api-diagrams.md#sequence-execute) — package/@greenpandastudios/aug-sqlite@0.2.0/api.aug
- [openMemory](dependencies/packages/%40greenpandastudios/aug-sqlite/0.2.0/api-diagrams.md#sequence-openMemory) — package/@greenpandastudios/aug-sqlite@0.2.0/api.aug
- [queryScalar](dependencies/packages/%40greenpandastudios/aug-sqlite/0.2.0/api-diagrams.md#sequence-queryScalar) — package/@greenpandastudios/aug-sqlite@0.2.0/api.aug
