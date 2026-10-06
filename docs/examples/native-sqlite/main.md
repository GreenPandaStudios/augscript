---
title: "main.aug · A database with SQLite"
generated: true
source: "examples/native-sqlite/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[A database with SQLite](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`database.aug`](database.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiYjZjZjAyOTYxMjliNTBhNmNmM2Q3MWFjZTBkMjJmOTgwNWJlZGZlN2E3NTczZTA0N2MwMGFmMTAyMTYzM2E4OSIsImZvcm1hdHRlZFNoYTI1NiI6IjhhODMxZTY3YmQwYjZjNDJjOWI4YzgzMjg4YjQwYTFjZGJlNzc2ZjFiZTkyNWE3MjJjYWRiMTM5ZjUwMTdhNzUiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6NywiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1LUw4IiwiZmlyc3QiOjQsImxhc3QiOjcsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import storedName from database
import SqliteError from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.5"
try:
    print(value=storedName())
catch SqliteError error:
    print(value=error.message)
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiYjZjZjAyOTYxMjliNTBhNmNmM2Q3MWFjZTBkMjJmOTgwNWJlZGZlN2E3NTczZTA0N2MwMGFmMTAyMTYzM2E4OSIsImZvcm1hdHRlZFNoYTI1NiI6ImVlOGI1MWRkZWNkYzRlOTIzNTk3OTgwYjAzNWJlOGQxNDU3YmUwMWUyZTIxNjg0ZTg0YmU4YzA5NzJlN2JkZWIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NCwibGFzdCI6OSwiYmFja2xpbmtzIjpbIm1haW4tZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUw1LUw4IiwiZmlyc3QiOjQsImxhc3QiOjksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfV19
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import storedName from database
import SqliteError from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.5"
try {
    print(value=storedName())
}
catch SqliteError error {
    print(value=error.message)
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](main-diagrams.md)

### Startup

::: spec-paragraph specification-paragraph-1
It prints [`storedName`](database.md#symbol-storedName). If this work raises [`SqliteError`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/contracts.md#symbol-SqliteError) as `error`, it prints `error.message`. [source](main.md#source-L5-L8)
:::

### Dependencies

It uses [`SqliteError`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.5/contracts.md#symbol-SqliteError) (`message`) from `https://github.com/GreenPandaStudios/aug-sqlite#v0.1.5`. It uses [`storedName`](database.md#symbol-storedName) from `database`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
