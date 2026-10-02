---
title: "packages/@greenpandastudios/aug-sqlite/0.1.4/bindings.aug · A database with SQLite"
generated: true
source: "examples/native-sqlite/.aug-spec/packages/@greenpandastudios/aug-sqlite/0.1.4/bindings.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-sqlite/0.1.4/bindings.aug`

[A database with SQLite](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "bindings.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C resource Database
```

```aug [Braces]
// aug-spec: "bindings.aug.md" explains this file. Read it before changes; refresh with aug spec.
extern C resource Database
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `Database` · native resource · [source](bindings.md#code) {#symbol-Database}

Native implementation: `@greenpandastudios/aug-sqlite@0.1.4`, `3.53.4`. Supported targets: linux arm64 glibc 2.36+, linux x64 glibc 2.36+, macos arm64 14.0+. Binding contract: [`native.abi.json`](native.abi-json.md) (SHA-256 `3c75c2925c85f1b83db06ee00fa04f1d2d37c9fd6edca0d074ce89b4647ffffb`). An owned value releases its opaque handle through `aug_sqlite_release_v1` when its scope ends, including error and return paths.

::::

:::::
