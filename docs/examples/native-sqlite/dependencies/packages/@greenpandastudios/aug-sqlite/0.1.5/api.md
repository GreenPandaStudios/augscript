---
title: "packages/@greenpandastudios/aug-sqlite/0.1.5/api.aug · A database with SQLite"
generated: true
source: "examples/native-sqlite/.aug-spec/packages/@greenpandastudios/aug-sqlite/0.1.5/api.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-sqlite/0.1.5/api.aug`

[A database with SQLite](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Database from bindings
import SqliteError and DatabaseStorage from contracts
extern C _open(string path) returns own Database unless SqliteError
extern C _execute(borrow Database database, string sql, List<string> parameters) returns int changes database unless SqliteError
extern C _queryScalar(Database database, string sql, List<string> parameters) returns string unless SqliteError
/** Open a serialized connection. Use :memory: for an in-memory database. */
NativeDatabaseStorage() implements DatabaseStorage:
    open(string path) returns own Database:
        unsafe:
            return _open(path)
open(resolve DatabaseStorage storage, string path) returns own Database:
    return storage.open(path)
/** Open an in-memory database without filesystem permission. */
openMemory() returns own Database:
    unsafe:
        return _open(path=":memory:")
/** Execute one parameterized statement. Return the number of changed rows. */
execute(borrow Database database, string sql, List<string> parameters) returns int:
    unsafe:
        return _execute(database, sql, parameters)
/** Query one non-null text value with SELECT. Reject PRAGMAs, transactions, savepoints and writes before execution. Copy the result before finalization. */
queryScalar(Database database, string sql, List<string> parameters) returns string:
    unsafe:
        return _queryScalar(database, sql, parameters)
test openMemory:
    when "databases":
        it "binds_and_queries":
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
                    parameters=["O'Reilly"]
                )
            assert(
                queryScalar(database, sql="SELECT name FROM users", parameters=[]) == "O'Reilly"
            )
        it "rejects_connection_and_transaction_control":
            own Database database = openMemory()
            for statement in [
                "PRAGMA query_only=ON",
                "BEGIN",
                "COMMIT",
                "ROLLBACK",
                "SAVEPOINT hidden"
            ]:
                rejected = false
                try:
                    queryScalar(database, sql=statement, parameters=[])
                catch SqliteError error:
                    rejected = error.code == 23
                assert(rejected)
            borrow database:
                execute(
                    database,
                    sql="CREATE TABLE rows (value TEXT)",
                    parameters=[]
                )
                execute(
                    database,
                    sql="INSERT INTO rows VALUES (?)",
                    parameters=["unchanged"]
                )
            assert(
                queryScalar(database, sql="SELECT value FROM rows", parameters=[]) == "unchanged"
            )
```

```aug [Braces]
// aug-spec: "api.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Database from bindings
import SqliteError and DatabaseStorage from contracts
extern C _open(string path) returns own Database unless SqliteError
extern C _execute(borrow Database database, string sql, List<string> parameters) returns int changes database unless SqliteError
extern C _queryScalar(Database database, string sql, List<string> parameters) returns string unless SqliteError
/** Open a serialized connection. Use :memory: for an in-memory database. */
NativeDatabaseStorage() implements DatabaseStorage {
    open(string path) returns own Database {
        unsafe {
            return _open(path)
        }
    }
}
open(resolve DatabaseStorage storage, string path) returns own Database {
    return storage.open(path)
}
/** Open an in-memory database without filesystem permission. */
openMemory() returns own Database {
    unsafe {
        return _open(path=":memory:")
    }
}
/** Execute one parameterized statement. Return the number of changed rows. */
execute(borrow Database database, string sql, List<string> parameters) returns int {
    unsafe {
        return _execute(database, sql, parameters)
    }
}
/** Query one non-null text value with SELECT. Reject PRAGMAs, transactions, savepoints and writes before execution. Copy the result before finalization. */
queryScalar(Database database, string sql, List<string> parameters) returns string {
    unsafe {
        return _queryScalar(database, sql, parameters)
    }
}
test openMemory {
    when "databases" {
        it "binds_and_queries" {
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
                    parameters=["O'Reilly"]
                )
            }
            assert(
                queryScalar(database, sql="SELECT name FROM users", parameters=[]) == "O'Reilly"
            )
        }
        it "rejects_connection_and_transaction_control" {
            own Database database = openMemory()
            for statement in [
                "PRAGMA query_only=ON",
                "BEGIN",
                "COMMIT",
                "ROLLBACK",
                "SAVEPOINT hidden"
            ] {
                rejected = false
                try {
                    queryScalar(database, sql=statement, parameters=[])
                }
                catch SqliteError error {
                    rejected = error.code == 23
                }
                assert(rejected)
            }
            borrow database {
                execute(
                    database,
                    sql="CREATE TABLE rows (value TEXT)",
                    parameters=[]
                )
                execute(
                    database,
                    sql="INSERT INTO rows VALUES (?)",
                    parameters=["unchanged"]
                )
            }
            assert(
                queryScalar(database, sql="SELECT value FROM rows", parameters=[]) == "unchanged"
            )
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `NativeDatabaseStorage` · class · [source](api.md#code) {#symbol-NativeDatabaseStorage}

Open a serialized connection. Use :memory: for an in-memory database. It implements [`DatabaseStorage`](contracts.md#symbol-DatabaseStorage).

#### `NativeDatabaseStorage.open` · [source](api.md#code) {#symbol-NativeDatabaseStorage.open}

It takes `path` as a string. Within an unsafe block, it returns [`_open`](api.md#symbol-_open) with `path`. Native operations must satisfy their declared C contracts. [source](api.md#code)

::: details Checked interface

```text
open(string path) returns own Database unless SqliteError uses DatabaseStorage.open
```

It takes `path` as a string. It returns ownership of [`Database`](bindings.md#symbol-Database). Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

:::

### `open` · [source](api.md#code) {#symbol-open}

It takes `path` as a string. It gets `storage` ([`DatabaseStorage`](contracts.md#symbol-DatabaseStorage)) from dependency injection. It returns [`storage.open`](contracts.md#symbol-DatabaseStorage.open) with `path`. [source](api.md#code)

::: details Checked interface

```text
open(resolve DatabaseStorage storage, string path) returns own Database unless SqliteError uses DatabaseStorage.open
```

It takes `path` as a string. It gets `storage` ([`DatabaseStorage`](contracts.md#symbol-DatabaseStorage)) from dependency injection. It returns ownership of [`Database`](bindings.md#symbol-Database). Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

:::

### `openMemory` · [source](api.md#code) {#symbol-openMemory}

Open an in-memory database without filesystem permission. Within an unsafe block, it returns [`_open`](api.md#symbol-_open) with `path` `":memory:"`. Native operations must satisfy their declared C contracts. [source](api.md#code)

::: details Checked interface

```text
openMemory() returns own Database unless SqliteError
```

It returns ownership of [`Database`](bindings.md#symbol-Database). Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

:::

### `execute` · [source](api.md#code) {#symbol-execute}

Execute one parameterized statement. Return the number of changed rows. It takes `database` as [`Database`](bindings.md#symbol-Database) with permission to mutate it during the call, `sql` as a string, and `parameters` as `List<string>`.

Within an unsafe block, it returns [`_execute`](api.md#symbol-_execute) with `database`, `sql`, and `parameters`. Native operations must satisfy their declared C contracts. [source](api.md#code)

::: details Checked interface

```text
execute(borrow Database database, string sql, List<string> parameters) returns int unless SqliteError changes database
```

It takes `database` as [`Database`](bindings.md#symbol-Database) with permission to mutate it during the call, `sql` as a string, and `parameters` as `List<string>`. It may change `database`. Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

:::

### `queryScalar` · [source](api.md#code) {#symbol-queryScalar}

Query one non-null text value with SELECT. Reject PRAGMAs, transactions, savepoints and writes before execution. Copy the result before finalization. It takes `database` as [`Database`](bindings.md#symbol-Database), `sql` as a string, and `parameters` as `List<string>`.

Within an unsafe block, it returns [`_queryScalar`](api.md#symbol-_queryScalar) with `database`, `sql`, and `parameters`. Native operations must satisfy their declared C contracts. [source](api.md#code)

::: details Checked interface

```text
queryScalar(Database database, string sql, List<string> parameters) returns string unless SqliteError
```

It takes `database` as [`Database`](bindings.md#symbol-Database), `sql` as a string, and `parameters` as `List<string>`. Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

:::

### `_open` · [source](api.md#code) {#symbol-_open}

It is private to its defining scope. It takes `path` as a string. It returns ownership of [`Database`](bindings.md#symbol-Database). Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

Native implementation: `@greenpandastudios/aug-sqlite@0.1.5`, `3.53.4`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `3c75c2925c85f1b83db06ee00fa04f1d2d37c9fd6edca0d074ce89b4647ffffb`). It calls `aug_sqlite_open_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. The caller owns the returned handle. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_execute` · [source](api.md#code) {#symbol-_execute}

It is private to its defining scope. It takes `database` as [`Database`](bindings.md#symbol-Database) with permission to mutate it during the call, `sql` as a string, and `parameters` as `List<string>`.

It returns `int`. It may change `database`. Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

Native implementation: `@greenpandastudios/aug-sqlite@0.1.5`, `3.53.4`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `3c75c2925c85f1b83db06ee00fa04f1d2d37c9fd6edca0d074ce89b4647ffffb`). It calls `aug_sqlite_execute_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `database` lends mutable access for this call. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `_queryScalar` · [source](api.md#code) {#symbol-_queryScalar}

It is private to its defining scope. It takes `database` as [`Database`](bindings.md#symbol-Database), `sql` as a string, and `parameters` as `List<string>`. It returns `string`. Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

Native implementation: `@greenpandastudios/aug-sqlite@0.1.5`, `3.53.4`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `3c75c2925c85f1b83db06ee00fa04f1d2d37c9fd6edca0d074ce89b4647ffffb`). It calls `aug_sqlite_scalar_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `database` lends read access for this call. August copies the returned buffer, then calls `aug_sqlite_text_release_v1` to release it. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

### `test openMemory` · [source](api.md#code) {#symbol-test-20-openMemory}

Tests [`openMemory`](api.md#symbol-openMemory). Each case gets fresh setup and dependencies.

#### `databases`

##### `binds_and_queries` · [source](api.md#code)

It calls [`openMemory`](api.md#symbol-openMemory) and stores the result in owned `database` ([`Database`](bindings.md#symbol-Database)). With temporary permission to change `database`, it calls [`execute`](api.md#symbol-execute) with `database`, `sql` `"CREATE TABLE users (name TEXT NOT NULL)"`, and `parameters` from a list with no items; then it calls [`execute`](api.md#symbol-execute) with `database`, `sql` `"INSERT INTO users (name) VALUES (?)"`, and `parameters` from a list containing `"O'Reilly"`. The test requires [`queryScalar`](api.md#symbol-queryScalar) with `database`, `sql` `"SELECT name FROM users"`, and `parameters` from a list with no items equals `"O'Reilly"`. [source](api.md#code)

##### `rejects_connection_and_transaction_control` · [source](api.md#code)

It calls [`openMemory`](api.md#symbol-openMemory) and stores the result in owned `database` ([`Database`](bindings.md#symbol-Database)). For each `statement` in a snapshot of a list containing `"PRAGMA query_only=ON"`, `"BEGIN"`, `"COMMIT"`, `"ROLLBACK"`, `"SAVEPOINT hidden"`, it sets `rejected` to `false`. [source](api.md#code)

It tries to call [`queryScalar`](api.md#symbol-queryScalar) with `database`, `sql` from `statement`, and `parameters` from a list with no items. If this work raises [`SqliteError`](contracts.md#symbol-SqliteError) as `error`, it sets `rejected` to `error.code` equals `23`. The test requires `rejected` is true. After the loop, with temporary permission to change `database`, it calls [`execute`](api.md#symbol-execute) with `database`, `sql` `"CREATE TABLE rows (value TEXT)"`, and `parameters` from a list with no items; then it calls [`execute`](api.md#symbol-execute) with `database`, `sql` `"INSERT INTO rows VALUES (?)"`, and `parameters` from a list containing `"unchanged"`. [source](api.md#code)

The test requires [`queryScalar`](api.md#symbol-queryScalar) with `database`, `sql` `"SELECT value FROM rows"`, and `parameters` from a list with no items equals `"unchanged"`. [source](api.md#code)

### Dependencies

It uses [`Database`](bindings.md#symbol-Database) from `bindings`. It uses [`DatabaseStorage`](contracts.md#symbol-DatabaseStorage) ([`open`](contracts.md#symbol-DatabaseStorage.open)) and [`SqliteError`](contracts.md#symbol-SqliteError) from `contracts`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
