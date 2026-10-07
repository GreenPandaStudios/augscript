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

Start with how the application begins, then follow data between its folders. Open an operation to see its decisions, calls, failures and cleanup. Its explanation supplies the exact contract and linked dependencies.

This view includes 2 application source files. Package and interface boundaries show checked contracts; their runtime implementations are not expanded. The views describe the checked program, not desired requirements or a recorded execution.

## Where execution begins

### Startup {#startup}

::: spec-paragraph specification-paragraph-1
It prints [`storedName`](../database.md#symbol-storedName). If this work raises [`SqliteError`](../dependencies/packages/%40greenpandastudios/aug-sqlite/0.2.0/contracts.md#symbol-SqliteError) as `error`, it prints `error.message`. [source](../main.md#source-L5-L8)
:::

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
    n1["@greenpandastudios/aug-sqlite"]
    n0 -->|"execute(database, sql, …) / openMemory + 1 more → int / own Database + 1 more"| n1
```

:::

### Follow the data

Each row opens the complete operations and call sites behind one pair of logical units. A grouped arrow records calls between those units; connected arrows need not belong to the same execution path.

| From | To | Operations | Read |
| --- | --- | --- | --- |
| database | @greenpandastudios/aug-sqlite | 3 | [Inputs, results and call sites](index.md#boundary-c8873ccb5f91) |
| Startup | database | 1 | [Inputs, results and call sites](index.md#boundary-d4cf01580fdb) |

#### Data crossing these boundaries (4 contracts)

#### database → @greenpandastudios/aug-sqlite {#boundary-c8873ccb5f91}

::: details 3 operations, 4 sites

**[execute](../dependencies/packages/%40greenpandastudios/aug-sqlite/0.2.0/api.md#symbol-execute)**

Inputs: database: borrow Database, sql: string, parameters: List\<string\>. Result: int.

| Caller or entry | Evidence |
| --- | --- |
| storedName | [Call site](../database.md#source-L8) · [Caller explanation](../database.md#symbol-storedName) |
| storedName | [Call site](../database.md#source-L9) · [Caller explanation](../database.md#symbol-storedName) |

**[openMemory](../dependencies/packages/%40greenpandastudios/aug-sqlite/0.2.0/api.md#symbol-openMemory)**

No caller-supplied inputs. Result: own Database.

| Caller or entry | Evidence |
| --- | --- |
| storedName | [Call site](../database.md#source-L6) · [Caller explanation](../database.md#symbol-storedName) |

**[queryScalar](../dependencies/packages/%40greenpandastudios/aug-sqlite/0.2.0/api.md#symbol-queryScalar)**

Inputs: database: Database, sql: string, parameters: List\<string\>. Result: string.

| Caller or entry | Evidence |
| --- | --- |
| storedName | [Call site](../database.md#source-L10) · [Caller explanation](../database.md#symbol-storedName) |

:::

#### Startup → database {#boundary-d4cf01580fdb}

::: details 1 operation, 1 site

**[storedName](../database.md#symbol-storedName)**

No caller-supplied inputs. Result: string.

| Caller or entry | Evidence |
| --- | --- |
| Startup | [Call site](../main.md#source-L6) · [Caller explanation](../main.md#startup) |

:::


## Open a module

| Module | Read |
| --- | --- |
| database.aug | [Flow and sequences](../database-diagrams.md) · [Explanation](../database.md) |
| main.aug | [Flow and sequences](../main-diagrams.md) · [Explanation](../main.md) |

These are static call boundaries, not a request trace. Interface implementations and foreign internals stop at their checked contracts. Dotted arrows defer a callback or browser action. Imports alone do not imply a call.
