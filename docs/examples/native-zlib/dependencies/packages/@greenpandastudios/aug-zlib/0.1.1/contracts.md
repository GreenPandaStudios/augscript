---
title: "packages/@greenpandastudios/aug-zlib/0.1.1/contracts.aug · Compression with zlib"
generated: true
source: "examples/native-zlib/.aug-spec/packages/@greenpandastudios/aug-zlib/0.1.1/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-zlib/0.1.1/contracts.aug`

[Compression with zlib](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
CompressionError(int code, string message) implements Error:
    pass
```

```aug [Braces]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
CompressionError(int code, string message) implements Error {
    pass
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `CompressionError` · class · [source](contracts.md#code) {#symbol-CompressionError}

It implements `Error`. It takes `code` as an integer, kept read-only and `message` as a string, kept read-only.

::::

:::::
