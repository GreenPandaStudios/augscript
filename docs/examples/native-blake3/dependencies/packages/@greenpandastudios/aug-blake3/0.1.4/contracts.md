---
title: "packages/@greenpandastudios/aug-blake3/0.1.4/contracts.aug · Hashing with Rust BLAKE3"
generated: true
source: "examples/native-blake3/.aug-spec/packages/@greenpandastudios/aug-blake3/0.1.4/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-blake3/0.1.4/contracts.aug`

[Hashing with Rust BLAKE3](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
HashError(int code, string message) implements Error:
    pass
```

```aug [Braces]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
HashError(int code, string message) implements Error {
    pass
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `HashError` · class · [source](contracts.md#code) {#symbol-HashError}

It implements `Error`. It takes `code` as an integer, kept read-only and `message` as a string, kept read-only.

::::

:::::
