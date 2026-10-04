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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiZjY3ZGI0NjdhYTZmZjdjMzhlYzc2YTIyOThjYmMzNTZmYTcyZjMyYTVjNjJmN2E1ZGJjOTZkM2VhMWVlY2Y0ZSIsImZvcm1hdHRlZFNoYTI1NiI6ImYxNmFlZDBiZTgwZjUzODMzNzljZmI4N2JlNzFlODQzZWM5ZjhkMjE5NjE2ODM5MDBlNzEwNzA2ZDNmYzEwYTAiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXN0b3JlZE5hbWUiXX0seyJpZCI6InNvdXJjZS1MNi1MMTAiLCJmaXJzdCI6NSwibGFzdCI6MTcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxMiIsImZpcnN0IjoxOCwibGFzdCI6MjEsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXRlc3QtMjAtc3RvcmVkTmFtZSJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoyMCwibGFzdCI6MjEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoyMSwibGFzdCI6MjEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "database.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Database and SqliteError and openMemory and execute and queryScalar from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.5"
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiZjY3ZGI0NjdhYTZmZjdjMzhlYzc2YTIyOThjYmMzNTZmYTcyZjMyYTVjNjJmN2E1ZGJjOTZkM2VhMWVlY2Y0ZSIsImZvcm1hdHRlZFNoYTI1NiI6IjU0ZDhhOTYzYWRlMjkxODhmZDA3MDgzZGFmYTdiNjIwODM4OTY1OGVjMTQ5MjlmNWNlOTJkN2ExZjBlNDdjYzEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6MTksImJhY2tsaW5rcyI6WyIjc3ltYm9sLXN0b3JlZE5hbWUiXX0seyJpZCI6InNvdXJjZS1MNi1MMTAiLCJmaXJzdCI6NSwibGFzdCI6MTgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxMiIsImZpcnN0IjoyMCwibGFzdCI6MjYsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXRlc3QtMjAtc3RvcmVkTmFtZSJdfSx7ImlkIjoic291cmNlLUwxNCIsImZpcnN0IjoyMiwibGFzdCI6MjQsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoyMywibGFzdCI6MjMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyJdfV19
// aug-spec: "database.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Database and SqliteError and openMemory and execute and queryScalar from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.5"
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

### `storedName` · [source](database.md#source-L5) {#symbol-storedName}

::: spec-paragraph specification-paragraph-1
Store a bound value in an in-memory SQLite database and read it back. It calls [`openMemory`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api.md#symbol-openMemory) and stores the result in owned `database` ([`Database`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/bindings.md#symbol-Database)). With temporary permission to change `database`, it calls [`execute`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api.md#symbol-execute) with `database`, `sql` `"CREATE TABLE users (name TEXT NOT NULL)"`, and `parameters` from a list with no items; then it calls [`execute`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api.md#symbol-execute) with `database`, `sql` `"INSERT INTO users (name) VALUES (?)"`, and `parameters` from a list containing `"August"`. It returns [`queryScalar`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api.md#symbol-queryScalar) with `database`, `sql` `"SELECT name FROM users"`, and `parameters` from a list with no items. [source](database.md#source-L6-L10)
:::

::: details Checked interface

```text
storedName() returns string unless SqliteError
```

Failures can raise [`SqliteError`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/contracts.md#symbol-SqliteError).

:::

### `test storedName` · [source](database.md#source-L12) {#symbol-test-20-storedName}

Tests [`storedName`](database.md#symbol-storedName). Each case gets fresh setup and dependencies.

#### `database`

::: spec-paragraph specification-paragraph-2
##### `inserts_and_queries_bound_data` · [source](database.md#source-L14)
:::

::: spec-paragraph specification-paragraph-3
The test requires [`storedName`](database.md#symbol-storedName) equals `"August"`. [source](database.md#source-L15)
:::

### Dependencies

It uses [`execute`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api.md#symbol-execute), [`openMemory`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api.md#symbol-openMemory), [`queryScalar`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/api.md#symbol-queryScalar), [`Database`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/bindings.md#symbol-Database), and [`SqliteError`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/contracts.md#symbol-SqliteError) from `https://github.com/GreenPandaStudios/aug-sqlite#v0.1.5`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
