---
title: "packages/@greenpandastudios/aug-gpu/0.1.1/contracts.aug · GPU workers"
generated: true
source: "examples/native-gpu/.aug-spec/packages/@greenpandastudios/aug-gpu/0.1.1/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-gpu/0.1.1/contracts.aug`

[GPU workers](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
GpuError(int code, string message) implements Error:
    explain() returns string:
        return message
```

```aug [Braces]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
GpuError(int code, string message) implements Error {
    explain() returns string {
        return message
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `GpuError` · class · [source](contracts.md#code) {#symbol-GpuError}

It implements `Error`. It takes `code` as an integer, kept read-only and `message` as a string, kept read-only.

#### `GpuError.explain` · [source](contracts.md#code) {#symbol-GpuError.explain}

It returns `message`.

::::

:::::
