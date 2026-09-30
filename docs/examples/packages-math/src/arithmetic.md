---
title: "src/arithmetic.aug · Create a package"
generated: true
source: "examples/packages/math/src/arithmetic.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `src/arithmetic.aug`

[Create a package](../index.md) · Source and specification

::: details Files in this project

- [`src/arithmetic.aug`](arithmetic.md)
- [`src/export.aug`](export.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "arithmetic.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Add two integers. @param left First value. @param right Second value. @return Their sum. */
add(int left, int right) returns int:
    return left + right
test add:
    when "addition":
        it "adds_two_integers":
            assert(add(left=2, right=3) == 5)
```

```aug [Braces]
// aug-spec: "arithmetic.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

<a id="symbol-add"></a>
### `add` · [source](arithmetic.md#code)

Add two integers. The caller supplies `left` as `int` (First value) and `right` as `int` (Second value). The result is `int` — Their sum. It returns `left` plus `right`.

<a id="symbol-test add"></a>
### `test add` · [source](arithmetic.md#code)

Tests [`add`](arithmetic.md#symbol-add). Each case gets fresh setup and dependencies.

#### `addition`

##### `adds_two_integers` · [source](arithmetic.md#code)

It calls `assert` (the value from [`add`](arithmetic.md#symbol-add) (`left` set to `2` and `right` set to `3`) equals `5`).

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`assert`: Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

::::

:::::
