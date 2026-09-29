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

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### `load` {#symbol-load}

[source](errors.md#code)

**Inputs and dependencies**

- `fail`: `bool`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Possible failures: `FileError`. The caller must catch or propagate them.

**Behavior when execution reaches this operation**

- If `fail` is true:
  - Fail with the result of call `FileError`. Transfer control to a matching catch or propagate the failure.
- Return `"loaded"` and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
