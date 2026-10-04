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
add(int left, int right):
    return left + right
test add:
    when "addition":
        it "adds_two_integers":
            assert(add(left=2, right=3) == 5)
```

```aug [Braces]
// aug-spec: "arithmetic.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Add two integers. @param left First value. @param right Second value. @return Their sum. */
add(int left, int right) {
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

### `add` · [source](arithmetic.md#code) {#symbol-add}

Add two integers. It takes `left` and `right` as integers. It returns `left` plus `right`. [source](arithmetic.md#code)

::: details Checked interface

```text
add(int left, int right) returns int
```

It takes `left` as an integer (First value) and `right` as an integer (Second value). It returns `int` — Their sum.

:::

### `test add` · [source](arithmetic.md#code) {#symbol-test-20-add}

Tests [`add`](arithmetic.md#symbol-add). Each case gets fresh setup and dependencies.

#### `addition`

##### `adds_two_integers` · [source](arithmetic.md#code)

The test requires [`add`](arithmetic.md#symbol-add) with `left` `2` and `right` `3` equals `5`. [source](arithmetic.md#code)

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
