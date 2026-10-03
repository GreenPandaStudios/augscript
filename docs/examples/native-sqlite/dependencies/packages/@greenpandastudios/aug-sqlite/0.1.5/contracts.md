---
title: "packages/@greenpandastudios/aug-sqlite/0.1.5/contracts.aug · A database with SQLite"
generated: true
source: "examples/native-sqlite/.aug-spec/packages/@greenpandastudios/aug-sqlite/0.1.5/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-sqlite/0.1.5/contracts.aug`

[A database with SQLite](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Database from bindings
SqliteError(int code, string message) implements Error:
    pass
/** Permission to open database files. Select the native adapter in main.aug. */
capability DatabaseStorage:
    open(string path) returns own Database uses DatabaseStorage.open unless SqliteError
```

```aug [Braces]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Database from bindings
SqliteError(int code, string message) implements Error {
    pass
}
/** Permission to open database files. Select the native adapter in main.aug. */
capability DatabaseStorage {
    open(string path) returns own Database uses DatabaseStorage.open unless SqliteError
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `SqliteError` · class · [source](contracts.md#code) {#symbol-SqliteError}

It implements `Error`. It takes `code` as an integer, kept read-only and `message` as a string, kept read-only.

### `DatabaseStorage` · capability interface · [source](contracts.md#code) {#symbol-DatabaseStorage}

Permission to open database files. Select the native adapter in main.aug.

#### `DatabaseStorage.open` · [source](contracts.md#code) {#symbol-DatabaseStorage.open}

It takes `path` as a string. It returns ownership of [`Database`](bindings.md#symbol-Database). It can call [`DatabaseStorage.open`](contracts.md#symbol-DatabaseStorage.open). Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

### Dependencies

It uses [`Database`](bindings.md#symbol-Database) from `bindings`.

::::

:::::
