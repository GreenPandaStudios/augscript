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
/** Raised when an input is outside the operation's domain. */
RangeError(int value) implements Error:
    pass
/** A pure validation layer, shared by any compatible callable. */
interceptor Positive<T>():
    around(int amount) returns T unless RangeError:
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
double(int amount) returns int:
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
/** Raised when an input is outside the operation's domain. */
RangeError(int value) implements Error {
    pass
}
/** A pure validation layer, shared by any compatible callable. */
interceptor Positive<T>() {
    around(int amount) returns T unless RangeError {
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
double(int amount) returns int {
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

<a id="symbol-RangeError"></a>
### `RangeError` · class · [source](numbers.md#code)

Raised when an input is outside the operation's domain. Implements `Error`.

**Inputs:** Take `value` (`int`); store read-only.

<a id="symbol-Positive"></a>
### `Positive` · interceptor · [source](numbers.md#code)

A pure validation layer, shared by any compatible callable. Type parameters: `T`.

Creates one interceptor per invocation. Its around operation may delegate once or finish early.

<a id="symbol-Positive.around"></a>
#### `Positive.around` · [source](numbers.md#code)

**Inputs:** Take `amount` (`int`).

Returns `T`. Can fail with `RangeError`.

- If `amount` is less than `0`:
  - Fail with a new [`RangeError`](numbers.md#symbol-RangeError) with `value` as `amount`.
- Return the result of `next`.

<a id="symbol-double"></a>
### `double` · [source](numbers.md#code)

Double a nonnegative amount.

**Inputs:** Take `amount` (`int`) — Integer to double.

Returns `int` — Twice the amount, with defined integer wrapping. Can fail with `RangeError` (A validation layer rejected a negative input).

Layers run in this order:

1. Call [`Positive.around`](numbers.md#symbol-Positive.around).

- Return `amount` times `2`.

<a id="symbol-test double"></a>
### `test double` · [source](numbers.md#code)

Tests [`double`](numbers.md#symbol-double). Each case gets fresh setup and dependencies.

#### `positive`

##### `doubles` · [source](numbers.md#code)

Run once for each row of a tuple containing `0`, `0`; a tuple containing `3`, `6`; a tuple containing `7`, `14`. Bind row positions to `input`, `expected`.

- Call `assert` with the result of [`double`](numbers.md#symbol-double) with `amount` as `input` equals `expected`.

##### `rejects_negative` · [source](numbers.md#code)

- Set `rejected` of type `bool` to `false`.
- Try:
  - Call [`double`](numbers.md#symbol-double) with `amount` as `-1`.
- Catch [`RangeError`](numbers.md#symbol-RangeError) as `error`:
  - Set `rejected` to `value` of `error` equals `-1`.
- Call `assert` with `rejected`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `assert`: Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

::::

:::::
