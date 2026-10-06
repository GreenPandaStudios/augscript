---
title: "A database with SQLite diagrams"
generated: true
source: "examples/native-sqlite/.aug-spec/diagrams/index.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# A database with SQLite diagrams

[A database with SQLite](../index.md)

Start here to see what moves between the application’s folders. Each arrow names an operation’s inputs and the result it returns to its caller. Open a folder for the next level of detail. Expand the contract list for complete types and dependency links.

## Data flow

```mermaid
flowchart TD
    n0["database"]
    n1["Startup"]
    n1 -->|"storedName → string"| n0
```

### Package boundaries

::: details database package calls

```mermaid
flowchart LR
    n0["database"]
    n1["url_b634d36dc17498f595c5"]
    n0 -->|"execute(database, sql, …) / openMemory + 1 more → Database / int + 1 more"| n1
```

:::

::: details Data crossing these boundaries (4 contracts)

| From | To | Operation and inputs | Result |
| --- | --- | --- | --- |
| database | url\_b634d36dc17498f595c5 | [execute](../dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api.md) · database: Database, sql: string, parameters: List\<string\> | int |
| database | url\_b634d36dc17498f595c5 | [openMemory](../dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api.md) | Database |
| database | url\_b634d36dc17498f595c5 | [queryScalar](../dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api.md) · database: Database, sql: string, parameters: List\<string\> | string |
| Startup | database | [storedName](../database.md) | string |

:::

## Open a module

| Module | Read |
| --- | --- |
| database.aug | [Flow and sequences](../database-diagrams.md) · [Explanation](../database.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
