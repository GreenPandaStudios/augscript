---
title: "Native binding contract · A database with SQLite"
generated: true
source: "examples/native-sqlite/.aug-spec/packages/@greenpandastudios/aug-sqlite/0.1.3/native.abi.json"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
---

# Native binding contract

[A database with SQLite](../../../../../index.md)

This is the exact descriptor checked for this dependency. It records native symbols, ownership, errors, and ABI boundaries. The compiler checks August declarations against it; foreign implementations remain the native author’s responsibility.

```json
{
  "format": 1,
  "profile": "aug-native-abi-1",
  "resources": [
    {
      "module": "bindings",
      "name": "Database",
      "release": "aug_sqlite_release_v1"
    }
  ],
  "functions": [
    {
      "module": "api",
      "name": "_open",
      "symbol": "aug_sqlite_open_v1",
      "params": [
        {
          "name": "path",
          "kind": "utf8"
        }
      ],
      "result": {
        "kind": "resource",
        "resource": "bindings.Database"
      },
      "error": "contracts.SqliteError",
      "callingConvention": "C",
      "status": "i32",
      "uses": [],
      "changes": [],
      "thread": "caller",
      "retainsInputs": false
    },
    {
      "module": "api",
      "name": "_execute",
      "symbol": "aug_sqlite_execute_v1",
      "params": [
        {
          "name": "database",
          "kind": "resource",
          "resource": "bindings.Database",
          "ownership": "borrow"
        },
        {
          "name": "sql",
          "kind": "utf8"
        },
        {
          "name": "parameters",
          "kind": "utf8-list"
        }
      ],
      "result": {
        "kind": "i64"
      },
      "error": "contracts.SqliteError",
      "callingConvention": "C",
      "status": "i32",
      "uses": [],
      "changes": [
        "database"
      ],
      "thread": "caller",
      "retainsInputs": false
    },
    {
      "module": "api",
      "name": "_queryScalar",
      "symbol": "aug_sqlite_scalar_v1",
      "params": [
        {
          "name": "database",
          "kind": "resource",
          "resource": "bindings.Database",
          "ownership": "read"
        },
        {
          "name": "sql",
          "kind": "utf8"
        },
        {
          "name": "parameters",
          "kind": "utf8-list"
        }
      ],
      "result": {
        "kind": "utf8",
        "release": "aug_sqlite_text_release_v1"
      },
      "error": "contracts.SqliteError",
      "callingConvention": "C",
      "status": "i32",
      "uses": [],
      "changes": [],
      "thread": "caller",
      "retainsInputs": false
    }
  ]
}
```
