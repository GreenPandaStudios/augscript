---
title: "errors.aug · Checked failures"
generated: true
source: "examples/errors/errors.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `errors.aug`

[Checked failures](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`errors.aug`](errors.md)

:::

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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`load`](errors.md#symbol-load) is a function returning `string`.

### `load` {#symbol-load}

[source](errors.md#code)

**Inputs**

- `fail` (`bool`) — required labeled input.

Returns: `string`.

Can fail with `FileError`. Callers must catch or propagate these errors.

**What it does**

- If `fail` is true:
  - Fail with call `FileError`. Transfer control to a matching catch or propagate the failure.
- Return `"loaded"`.

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
