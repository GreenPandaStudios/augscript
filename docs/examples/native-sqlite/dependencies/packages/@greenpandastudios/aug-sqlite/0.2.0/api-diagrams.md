---
title: "package/@greenpandastudios/aug-sqlite@0.2.0/api.aug diagrams"
generated: true
source: "examples/native-sqlite/.aug-spec/packages/@greenpandastudios/aug-sqlite/0.2.0/api.aug.diagrams.md"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# package/@greenpandastudios/aug-sqlite@0.2.0/api.aug diagrams

[A database with SQLite](../../../../../index.md)

[Project overview](../../../../../diagrams/index.md) · [Compiled explanation](api.md)

## Class interactions

```mermaid
flowchart TD
    n0["NativeDatabaseStorage"]
    n1["_open"]
    n2["open"]
    n3["DatabaseStorage"]
    n0 -->|"calls"| n1
    n0 -->|"implements"| n3
    n2 -->|"calls open； depends on"| n3
```

## Sequences

Call arrows identify checked targets; loop and branch frames determine when they run. Open that target’s module to follow its implementation. Branches describe alternatives; loops describe repeated work. Native calls and interface dispatch stop at their declared contracts. Exit notes end that path; enclosing recovery and cleanup remain visible.

### \_open {#sequence-_open}

::: spec-paragraph specification-paragraph-1
[Source](api.md#source-L5)
:::

It is private to its defining scope.

It takes `path` as a string.

It returns ownership of [`Database`](bindings.md#symbol-Database). Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

Native implementation: `@greenpandastudios/aug-sqlite@0.2.0`, `3.53.4`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `3c75c2925c85f1b83db06ee00fa04f1d2d37c9fd6edca0d074ce89b4647ffffb`). It calls `aug_sqlite_open_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. The caller owns the returned handle. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

May leave with checked errors: SqliteError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_execute {#sequence-_execute}

::: spec-paragraph specification-paragraph-2
[Source](api.md#source-L6)
:::

It is private to its defining scope.

It takes `database` as [`Database`](bindings.md#symbol-Database) with permission to mutate it during the call, `sql` as a string, and `parameters` as `List<string>`.

It returns `int`. It may change `database`. Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

Native implementation: `@greenpandastudios/aug-sqlite@0.2.0`, `3.53.4`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `3c75c2925c85f1b83db06ee00fa04f1d2d37c9fd6edca0d074ce89b4647ffffb`). It calls `aug_sqlite_execute_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `database` lends mutable access for this call. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

May leave with checked errors: SqliteError. Native implementation; only the declared contract is known. [Explanation](api.md).

### \_queryScalar {#sequence-_queryScalar}

::: spec-paragraph specification-paragraph-3
[Source](api.md#source-L7)
:::

It is private to its defining scope.

It takes `database` as [`Database`](bindings.md#symbol-Database), `sql` as a string, and `parameters` as `List<string>`.

It returns `string`. Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

Native implementation: `@greenpandastudios/aug-sqlite@0.2.0`, `3.53.4`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `3c75c2925c85f1b83db06ee00fa04f1d2d37c9fd6edca0d074ce89b4647ffffb`). It calls `aug_sqlite_scalar_v1` through the C ABI on the caller thread; a blocking native call blocks that thread. `database` lends read access for this call. August copies the returned buffer, then calls `aug_sqlite_text_release_v1` to release it. Its contract does not permit worker entry. The compiler checks the provider, descriptor digest, signature and ownership at August call sites. The native author promises not to retain inputs, enter August from foreign threads, or unwind across the C boundary; internal native workers may run. The compiler does not prove those promises.

May leave with checked errors: SqliteError. Native implementation; only the declared contract is known. [Explanation](api.md).

### NativeDatabaseStorage constructor {#sequence-NativeDatabaseStorage-20-constructor}

::: spec-paragraph specification-paragraph-4
[Source](api.md#source-L9)
:::

Open a serialized connection. Use :memory: for an in-memory database. It implements [`DatabaseStorage`](contracts.md#symbol-DatabaseStorage).

[Explanation](api.md).

### NativeDatabaseStorage.open {#sequence-NativeDatabaseStorage.open}

::: spec-paragraph specification-paragraph-5
[Source](api.md#source-L10)
:::

It takes `path` as a string.

It returns ownership of [`Database`](bindings.md#symbol-Database). It can call [`DatabaseStorage.open`](contracts.md#symbol-DatabaseStorage.open). Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

```mermaid
sequenceDiagram
    participant p0 as NativeDatabaseStorage.open

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _open(path=path) · native boundary
    p0-->>p0: _open result: Database
    Note over p0: Return _open(path)； required cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: SqliteError
```

### open {#sequence-open}

::: spec-paragraph specification-paragraph-6
[Source](api.md#source-L13)
:::

It takes `path` as a string. It gets `storage` ([`DatabaseStorage`](contracts.md#symbol-DatabaseStorage)) from dependency injection.

It returns ownership of [`Database`](bindings.md#symbol-Database). It can call [`DatabaseStorage.open`](contracts.md#symbol-DatabaseStorage.open). Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

```mermaid
sequenceDiagram
    participant p0 as open
    participant p1 as storage: DatabaseStorage
    p0->>p1: open(path=path) · interface dispatch
    p1-->>p0: open result: Database
    Note over p0: Return storage.open(path)； required cleanup runs before<br/>exit
    Note over p0: May leave with checked errors: SqliteError
```

### openMemory {#sequence-openMemory}

::: spec-paragraph specification-paragraph-7
[Source](api.md#source-L16)
:::

Open an in-memory database without filesystem permission.

It returns ownership of [`Database`](bindings.md#symbol-Database). Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

```mermaid
sequenceDiagram
    participant p0 as openMemory

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _open(path=”:memory:”) · native boundary
    p0-->>p0: _open result: Database
    Note over p0: Return _open(path=”:memory:”)； required cleanup runs<br/>before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: SqliteError
```

### execute {#sequence-execute}

::: spec-paragraph specification-paragraph-8
[Source](api.md#source-L20)
:::

Execute one parameterized statement. Return the number of changed rows.

It takes `database` as [`Database`](bindings.md#symbol-Database) with permission to mutate it during the call, `sql` as a string, and `parameters` as `List<string>`.

It may change `database`. Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

```mermaid
sequenceDiagram
    participant p0 as execute

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _execute(database=database, sql=sql,<br/>parameters=parameters) · native boundary
    p0-->>p0: _execute result: int
    Note over p0: Return _execute(database, sql, parameters)； required<br/>cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: SqliteError
```

### queryScalar {#sequence-queryScalar}

::: spec-paragraph specification-paragraph-9
[Source](api.md#source-L24)
:::

Query one non-null text value with SELECT. Reject PRAGMAs, transactions, savepoints and writes before execution. Copy the result before finalization.

It takes `database` as [`Database`](bindings.md#symbol-Database), `sql` as a string, and `parameters` as `List<string>`.

Failures can raise [`SqliteError`](contracts.md#symbol-SqliteError).

```mermaid
sequenceDiagram
    participant p0 as queryScalar

    rect rgb(245, 240, 241)
    Note over p0: Enter unsafe scope
    p0->>p0: _queryScalar(database=database, sql=sql,<br/>parameters=parameters) · native boundary
    p0-->>p0: _queryScalar result: string
    Note over p0: Return _queryScalar(database, sql, parameters)； required<br/>cleanup runs before exit
    Note over p0: Leave unsafe scope
    end
    Note over p0: May leave with checked errors: SqliteError
```

## Called contracts

- [\_execute](api-diagrams.md#sequence-_execute) — package/@greenpandastudios/aug-sqlite@0.2.0/api.aug
- [\_open](api-diagrams.md#sequence-_open) — package/@greenpandastudios/aug-sqlite@0.2.0/api.aug
- [\_queryScalar](api-diagrams.md#sequence-_queryScalar) — package/@greenpandastudios/aug-sqlite@0.2.0/api.aug
- [DatabaseStorage](contracts-diagrams.md) — package/@greenpandastudios/aug-sqlite@0.2.0/contracts.aug
- [DatabaseStorage.open](contracts-diagrams.md#sequence-DatabaseStorage.open) — package/@greenpandastudios/aug-sqlite@0.2.0/contracts.aug
