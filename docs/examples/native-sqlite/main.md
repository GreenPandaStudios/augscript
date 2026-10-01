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

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import storedName from database
import SqliteError from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.2"
try:
    print(value=storedName())
catch SqliteError error:
    print(value=error.message)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import storedName from database
import SqliteError from "https://github.com/GreenPandaStudios/aug-sqlite#v0.1.2"
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

### Startup

It prints [`storedName`](database.md#symbol-storedName). If this work raises [`SqliteError`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/contracts.md#symbol-SqliteError) as `error`, it prints `error.message`.

### Dependencies

It uses [`SqliteError`](dependencies/packages/%40greenpandastudios/aug-sqlite/0.1.2/contracts.md#symbol-SqliteError) (`message`) from `https://github.com/GreenPandaStudios/aug-sqlite#v0.1.2`. It uses [`storedName`](database.md#symbol-storedName) from `database`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
