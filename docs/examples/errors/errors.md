---
title: "errors.aug · Checked failures"
generated: true
source: "examples/errors/errors.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `errors.aug`

[Checked failures](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`errors.aug`](errors.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
load(bool fail) returns string unless FileError:
    if fail:
        throw FileError()
    return "loaded"
```

```aug [Braces]
load(bool fail) returns string unless FileError {
    if fail {
        throw FileError()
    }
    return "loaded"
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-load"></a>
### `load` · [source](errors.md#code)

**Inputs:** Take `fail` (`bool`).

Returns `string`. Can fail with `FileError`.

- If `fail` is true:
  - Fail with a new `FileError`.
- Return `"loaded"`.

::::

:::::
