---
title: "domain/numbers.aug · Modules and composition"
generated: true
source: "examples/approved-design/domain/numbers.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `domain/numbers.aug`

[Modules and composition](../index.md) · Source and specification

::: details Files in this project

- [`main.aug`](../main.md)
- [`counters.aug`](../counters.md)
- [`domain/app.aug`](app.md)
- [`domain/export.aug`](export.md)
- [`domain/models.aug`](models.md)
- [`domain/numbers.aug`](numbers.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "numbers.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Raised when an input is outside the operation's domain. */
RangeError(int value) implements Error:
    pass
/** A pure validation layer, shared by any compatible callable. */
interceptor Positive<T>():
    around(int amount) returns T:
        if amount < 0:
            throw RangeError(value=amount)
        return next()
/**
* Double a nonnegative amount.
* @param amount Integer to double.
* @return Twice the amount, with defined integer wrapping.
* @throws RangeError A validation layer rejected a negative input.
*/
[Positive]
double(int amount):
    return amount * 2
test double:
    when "positive":
        it "doubles" for (input, expected) in [(0, 0), (3, 6), (7, 14)]:
            assert(double(amount=input) == expected)
        it "rejects_negative":
            bool rejected to false
            try:
                double(amount=-1)
            catch RangeError error:
                rejected to error.value == -1
            assert(rejected)
```

```aug [Braces]
// aug-spec: "numbers.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Raised when an input is outside the operation's domain. */
RangeError(int value) implements Error {
    pass
}
/** A pure validation layer, shared by any compatible callable. */
interceptor Positive<T>() {
    around(int amount) returns T {
        if amount < 0 {
            throw RangeError(value=amount)
        }
        return next()
    }
}
/**
* Double a nonnegative amount.
* @param amount Integer to double.
* @return Twice the amount, with defined integer wrapping.
* @throws RangeError A validation layer rejected a negative input.
*/
[Positive]
double(int amount) {
    return amount * 2
}
test double {
    when "positive" {
        it "doubles" for (input, expected) in [(0, 0), (3, 6), (7, 14)] {
            assert(double(amount=input) == expected)
        }
        it "rejects_negative" {
            bool rejected to false
            try {
                double(amount=-1)
            }
            catch RangeError error {
                rejected to error.value == -1
            }
            assert(rejected)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### `RangeError` · class · [source](numbers.md#code) {#symbol-RangeError}

Raised when an input is outside the operation's domain. It implements `Error`. It takes `value` as an integer, kept read-only.

### `Positive` · interceptor · [source](numbers.md#code) {#symbol-Positive}

A pure validation layer, shared by any compatible callable. The type parameters are `T`. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

#### `Positive.around` · [source](numbers.md#code) {#symbol-Positive.around}

It takes `amount` as an integer. If `amount` is negative, it raises a [`RangeError`](numbers.md#symbol-RangeError) with `value` from `amount`. It returns `next`. [source](numbers.md#code)

::: details Checked interface

```text
around(int amount) returns T unless RangeError
```

It takes `amount` as an integer. Failures can raise [`RangeError`](numbers.md#symbol-RangeError).

:::

### `double` · [source](numbers.md#code) {#symbol-double}

Double a nonnegative amount. It takes `amount` as an integer. Layers run in the declared order. Call [`Positive.around`](numbers.md#symbol-Positive.around).

It returns `amount` times `2`. [source](numbers.md#code)

::: details Checked interface

```text
double(int amount) returns int unless RangeError
```

It takes `amount` as an integer (Integer to double). It returns `int` — Twice the amount, with defined integer wrapping. Failures can raise [`RangeError`](numbers.md#symbol-RangeError) (A validation layer rejected a negative input).

:::

### `test double` · [source](numbers.md#code) {#symbol-test-20-double}

Tests [`double`](numbers.md#symbol-double). Each case gets fresh setup and dependencies.

#### `positive`

##### `doubles` · [source](numbers.md#code)

Run once for each row of a tuple containing `0`, `0`; a tuple containing `3`, `6`; a tuple containing `7`, `14`. Bind row positions to `input`, `expected`. The test requires [`double`](numbers.md#symbol-double) with `amount` from `input` equals `expected`. [source](numbers.md#code)

##### `rejects_negative` · [source](numbers.md#code)

It sets `rejected` to `false`. [source](numbers.md#code)

It tries to call [`double`](numbers.md#symbol-double) with `amount` `-1`. If this work raises [`RangeError`](numbers.md#symbol-RangeError) as `error`, it sets `rejected` to `error.value` equals `-1`. The test requires `rejected` is true. [source](numbers.md#code)

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
