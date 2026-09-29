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

<a id="symbol-add"></a>
### `add` · [source](arithmetic.md#code)

Add two integers.

**Inputs:** Take `left` (`int`) — First value. Take `right` (`int`) — Second value.

Returns `int` — Their sum.

- Return `left` plus `right`.

<a id="symbol-test add"></a>
### `test add` · [source](arithmetic.md#code)

Tests [`add`](arithmetic.md#symbol-add). Each case gets fresh setup and dependencies.

#### `addition`

##### `adds_two_integers` · [source](arithmetic.md#code)

- Call `assert` with the result of [`add`](arithmetic.md#symbol-add) with `left` as `2`, `right` as `3` equals `5`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `assert`: Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

::::

:::::
