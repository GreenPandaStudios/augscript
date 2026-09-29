---
title: "domain/numbers.aug · Modules and composition"
generated: true
source: "examples/approved-design/domain/numbers.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Built-in operations used by this file

#### `assert`

Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

Inputs: `condition`: `bool`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `RangeError` {#symbol-RangeError}

[source](numbers.md#code)

Behavioral class.

Satisfies `Error`.

**Author documentation**

Raised when an input is outside the operation's domain.

**Inputs and dependencies**

- `value`: `int`. The caller supplies this labeled input. Read reference values without copying them. Store it as `value`. The field is read-only after initialization.

### `Positive` {#symbol-Positive}

[source](numbers.md#code)

Function or constructor middleware.

Type parameters: `T`.

**Author documentation**

A pure validation layer, shared by any compatible callable.

Create a fresh interceptor for each invocation. Its around operation can delegate once, change selected inputs, or short-circuit with a compatible result or failure.

#### `Positive.around` {#symbol-Positive.around}

[source](numbers.md#code)

**Inputs and dependencies**

- `amount`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `T`.

Possible failures: `RangeError`. The caller must catch or propagate them.

**Behavior when execution reaches this operation**

- If (`amount` is less than `0`) is true:
  - Fail with the result of call [`RangeError`](numbers.md#symbol-RangeError) with `value` set to `amount`. Transfer control to a matching catch or propagate the failure.
- Return the result of call `next` and finish this operation.

### `double` {#symbol-double}

[source](numbers.md#code)

**Inputs and dependencies**

- `amount`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `int`.

Possible failures: `RangeError`. The caller must catch or propagate them.

**Author documentation**

Double a nonnegative amount.

**Returns** Twice the amount, with defined integer wrapping.

**Parameters**
- `amount`: Integer to double.

**Throws**
- `RangeError`: A validation layer rejected a negative input.

**Interceptors, in execution order**

1. Call [`Positive.around`](numbers.md#symbol-Positive.around). It can call the next layer or finish with its own result or failure. Unselected inputs pass through.

The first layer wraps the remaining layers. HTTP policies run before wire decoding; custom interceptors run after decoding. Follow linked behavior to see its conditions, input changes, and calls to the next layer.

**Behavior when execution reaches this operation**

- Return (`amount` times `2`) and finish this operation.

### `test double double` {#symbol-test-20-double-20-double}

[source](numbers.md#code)

Same-file function tests for [`double`](numbers.md#symbol-double). Each case gets isolated setup and dependency bindings.

#### Group `positive`

##### `doubles`

[source](numbers.md#code)

Run once for each row of a tuple containing `0`, `0`; a tuple containing `3`, `6`; a tuple containing `7`, `14`. Bind row positions to `input`, `expected`.

- Call `assert` with (the result of call [`double`](numbers.md#symbol-double) with `amount` set to `input` equals `expected`).

##### `rejects_negative`

[source](numbers.md#code)

- Set `rejected` of type `bool` to `false`.
- Try these operations:
  - Call [`double`](numbers.md#symbol-double) with `amount` set to `-1`.
- If they fail with [`RangeError`](numbers.md#symbol-RangeError), name the failure `error` and recover:
  - Set `rejected` to (`value` of `error` equals `-1`).
- Call `assert` with `rejected` set to `rejected`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
