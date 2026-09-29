---
title: "packages/@example/aug-math/0.1.0/arithmetic.aug · Use a package"
generated: true
source: "examples/packages/app/.aug-spec/packages/@example/aug-math/0.1.0/arithmetic.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
search: false
pageClass: aug-example-page
---

# `packages/@example/aug-math/0.1.0/arithmetic.aug`

[Use a package](../../../../../index.md) · Dependency source and specification

This is the exact dependency version used by this example.

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`add`](arithmetic.md#symbol-add) is a function returning `int`.
- [`test add`](arithmetic.md#symbol-test-20-add) is a same-file test suite.

### `add` {#symbol-add}

[source](arithmetic.md#code)

**Inputs**

- `left` (`int`) — required labeled input.
- `right` (`int`) — required labeled input.

Returns: `int`.

**What it does**

- Return `left` plus `right`.

**Author documentation**

Add two integers.

**Returns** Their sum.

**Parameters**
- `left`: First value.
- `right`: Second value.

### `test add` {#symbol-test-20-add}

[source](arithmetic.md#code)

Same-file function tests for [`add`](arithmetic.md#symbol-add). Each case gets isolated setup and dependency bindings.

#### Group `addition`

##### `adds_two_integers`

[source](arithmetic.md#code)

- Call `assert` with (call [`add`](arithmetic.md#symbol-add) with `left` = `2`; `right` = `3` equals `5`).

### Built-in operations used by this file

- `assert` (`condition`: `bool`) → `void`: Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
