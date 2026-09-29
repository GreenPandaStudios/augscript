---
title: "src/arithmetic.aug · Create a package"
generated: true
source: "examples/packages/math/src/arithmetic.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `src/arithmetic.aug`

[Create a package](../index.md) · Source and specification

::: details Files in this project

- [`src/arithmetic.aug`](arithmetic.md)
- [`src/export.aug`](export.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
/** Add two integers. @param left First value. @param right Second value. @return Their sum. */
add(int left, int right) returns int:
    return left + right
test add:
    when "addition":
        it "adds_two_integers":
            assert(add(left=2, right=3) == 5)
```

```aug [Braces]
/** Add two integers. @param left First value. @param right Second value. @return Their sum. */
add(int left, int right) returns int {
    return left + right
}
test add {
    when "addition" {
        it "adds_two_integers" {
            assert(add(left=2, right=3) == 5)
        }
    }
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Built-in operations used by this file

#### `assert`

Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

Inputs: `condition`: `bool`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `add` {#symbol-add}

[source](arithmetic.md#code)

**Inputs and dependencies**

- `left`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `right`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `int`.

**Author documentation**

Add two integers.

**Returns** Their sum.

**Parameters**
- `left`: First value.
- `right`: Second value.

**Behavior when execution reaches this operation**

- Return (`left` plus `right`) and finish this operation.

### `test add add` {#symbol-test-20-add-20-add}

[source](arithmetic.md#code)

Same-file function tests for [`add`](arithmetic.md#symbol-add). Each case gets isolated setup and dependency bindings.

#### Group `addition`

##### `adds_two_integers`

[source](arithmetic.md#code)

- Call `assert` with (the result of call [`add`](arithmetic.md#symbol-add) with `left` set to `2`; `right` set to `3` equals `5`).


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
