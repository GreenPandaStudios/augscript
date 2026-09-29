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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`RangeError`](numbers.md#symbol-RangeError) is a class implementing `Error`.
- [`Positive`](numbers.md#symbol-Positive) is an interceptor.
- [`double`](numbers.md#symbol-double) is a function returning `int`.
- [`test double`](numbers.md#symbol-test-20-double) is a same-file test suite.

### `RangeError` {#symbol-RangeError}

[source](numbers.md#code)

Behavioral class.

Satisfies `Error`.

**Author documentation**

Raised when an input is outside the operation's domain.

**Inputs**

- `value` (`int`) — required labeled input — stored as `value` and read-only after initialization.

### `Positive` {#symbol-Positive}

[source](numbers.md#code)

Function or constructor middleware.

Type parameters: `T`.

**Author documentation**

A pure validation layer, shared by any compatible callable.

Create a fresh interceptor for each invocation. Its around operation can delegate once, change selected inputs, or short-circuit with a compatible result or failure.

#### `Positive.around` {#symbol-Positive.around}

[source](numbers.md#code)

**Inputs**

- `amount` (`int`) — required labeled input.

Returns: `T`.

Can fail with `RangeError`. Callers must catch or propagate these errors.

**What it does**

- If `amount` is less than `0`:
  - Fail with call [`RangeError`](numbers.md#symbol-RangeError) with `value` = `amount`. Transfer control to a matching catch or propagate the failure.
- Return call `next`.

### `double` {#symbol-double}

[source](numbers.md#code)

**Inputs**

- `amount` (`int`) — required labeled input.

Returns: `int`.

Can fail with `RangeError`. Callers must catch or propagate these errors.

**Interceptors, in execution order**

1. Call [`Positive.around`](numbers.md#symbol-Positive.around). It can call the next layer or finish with its own result or failure. Unselected inputs pass through.

The first layer wraps the remaining layers. HTTP policies run before wire decoding; custom interceptors run after decoding. Follow linked behavior to see its conditions, input changes, and calls to the next layer.

**What it does**

- Return `amount` times `2`.

**Author documentation**

Double a nonnegative amount.

**Returns** Twice the amount, with defined integer wrapping.

**Parameters**
- `amount`: Integer to double.

**Throws**
- `RangeError`: A validation layer rejected a negative input.

### `test double` {#symbol-test-20-double}

[source](numbers.md#code)

Same-file function tests for [`double`](numbers.md#symbol-double). Each case gets isolated setup and dependency bindings.

#### Group `positive`

##### `doubles`

[source](numbers.md#code)

Run once for each row of a tuple containing `0`, `0`; a tuple containing `3`, `6`; a tuple containing `7`, `14`. Bind row positions to `input`, `expected`.

- Call `assert` with (call [`double`](numbers.md#symbol-double) with `amount` = `input` equals `expected`).

##### `rejects_negative`

[source](numbers.md#code)

- Set `rejected` of type `bool` to `false`.
- Try these operations:
  - Call [`double`](numbers.md#symbol-double) with `amount` = `-1`.
- If they fail with [`RangeError`](numbers.md#symbol-RangeError), name the failure `error` and recover:
  - Set `rejected` to `value` of `error` equals `-1`.
- Call `assert` with `rejected` = `rejected`.

### Built-in operations used by this file

- `assert` (`condition`: `bool`) → `void`: Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
