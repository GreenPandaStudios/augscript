---
title: "packages/@greenpandastudios/aug-pytorch/0.1.6/contracts.aug · CPU tensors with PyTorch"
generated: true
source: "examples/native-pytorch/.aug-spec/packages/@greenpandastudios/aug-pytorch/0.1.6/contracts.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@greenpandastudios/aug-pytorch/0.1.6/contracts.aug`

[CPU tensors with PyTorch](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
TensorError(int code, string message) implements Error:
    /** Explain the native failure without losing its original message. */
    explain() returns string:
        return message
```

```aug [Braces]
// aug-spec: "contracts.aug.md" explains this file. Read it before changes; refresh with aug spec.
TensorError(int code, string message) implements Error {
    /** Explain the native failure without losing its original message. */
    explain() returns string {
        return message
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `TensorError` · class · [source](contracts.md#code) {#symbol-TensorError}

It implements `Error`. It takes `code` as an integer, kept read-only and `message` as a string, kept read-only.

#### `TensorError.explain` · [source](contracts.md#code) {#symbol-TensorError.explain}

Explain the native failure without losing its original message. It returns `message`. [source](contracts.md#code)

::: details Checked interface

```text
explain() returns string
```

:::

::::

:::::
