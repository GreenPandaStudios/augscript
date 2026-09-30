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

Add two integers. It takes `left` as an integer (First value) and `right` as an integer (Second value). It returns `int` — Their sum. It returns `left` plus `right`.

<a id="symbol-test add"></a>
### `test add` · [source](arithmetic.md#code)

Tests [`add`](arithmetic.md#symbol-add). Each case gets fresh setup and dependencies.

#### `addition`

##### `adds_two_integers` · [source](arithmetic.md#code)

The test requires [`add`](arithmetic.md#symbol-add) with `left` `2` and `right` `3` equals `5`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
