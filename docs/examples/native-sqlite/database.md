---
title: "database.aug · A database with SQLite"
generated: true
source: "examples/native-sqlite/database.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `database.aug`

[A database with SQLite](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`database.aug`](database.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "database.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Database and SqliteError and openMemory and execute and queryScalar from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.2"
/** Store a bound value in an in-memory SQLite database and read it back. */
storedName() returns string unless SqliteError:
    own Database database = openMemory()
    borrow database:
        execute(
            database,
            sql="CREATE TABLE users (name TEXT NOT NULL)",
            parameters=[]
        )
        execute(
            database,
            sql="INSERT INTO users (name) VALUES (?)",
            parameters=["August"]
        )
    return queryScalar(database, sql="SELECT name FROM users", parameters=[])
test storedName:
    when "database":
        it "inserts_and_queries_bound_data":
            assert(storedName() == "August")
```

```aug [Braces]
// aug-spec: "database.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Database and SqliteError and openMemory and execute and queryScalar from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.2"
/** Store a bound value in an in-memory SQLite database and read it back. */
storedName() returns string unless SqliteError {
    own Database database = openMemory()
    borrow database {
        execute(
            database,
            sql="CREATE TABLE users (name TEXT NOT NULL)",
            parameters=[]
        )
        execute(
            database,
            sql="INSERT INTO users (name) VALUES (?)",
            parameters=["August"]
        )
    }
    return queryScalar(database, sql="SELECT name FROM users", parameters=[])
}
test storedName {
    when "database" {
        it "inserts_and_queries_bound_data" {
            assert(storedName() == "August")
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `storedName` · [source](database.md#code) {#symbol-storedName}

Store a bound value in an in-memory SQLite database and read it back. Failures can raise [`SqliteError`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/contracts.md#symbol-SqliteError).

It gets `database` of type [`Database`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/bindings.md#symbol-Database) from [`openMemory`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/api.md#symbol-openMemory). `database` of type [`Database`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/bindings.md#symbol-Database) owns this value. With temporary permission to change `database`, it calls [`execute`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/api.md#symbol-execute) with `database`, `sql` `"CREATE TABLE users (name TEXT NOT NULL)"`, and `parameters` from a list with no items; then it calls [`execute`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/api.md#symbol-execute) with `database`, `sql` `"INSERT INTO users (name) VALUES (?)"`, and `parameters` from a list containing `"August"`. It returns [`queryScalar`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/api.md#symbol-queryScalar) with `database`, `sql` `"SELECT name FROM users"`, and `parameters` from a list with no items.

### `test storedName` · [source](database.md#code) {#symbol-test-20-storedName}

Tests [`storedName`](database.md#symbol-storedName). Each case gets fresh setup and dependencies.

#### `database`

##### `inserts_and_queries_bound_data` · [source](database.md#code)

The test requires [`storedName`](database.md#symbol-storedName) equals `"August"`.

### Dependencies

It uses [`execute`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/api.md#symbol-execute), [`openMemory`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/api.md#symbol-openMemory), [`queryScalar`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/api.md#symbol-queryScalar), [`Database`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/bindings.md#symbol-Database), and [`SqliteError`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/contracts.md#symbol-SqliteError) from `https://github.com/GreenPandaStudios/aug-sqlite#v0.1.2`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
