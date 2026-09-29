---
title: "interceptors.aug · Function and constructor middleware"
generated: true
source: "examples/interceptors/interceptors.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `interceptors.aug`

[Function and constructor middleware](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`app.aug`](app.md)
- [`interceptors.aug`](interceptors.md)
- [`logging.aug`](logging.md)

:::

## Code {#code}

::: code-group

```aug [Indentation]
import Console from august.io
import Logger from logging
/** Raised when a numeric input fails validation. */
ValidationError(string message) implements Error:
    pass
/**
* Logs before and after a successful call.
* Generic T is inferred from the annotated function or constructor.
* @param logger Shared application logger, injected for each fresh instance.
*/
interceptor Audit<T>(resolve Logger logger):
    /** Wrap a call without changing its result. */
    around(resolve Console console) returns T uses Console.write:
        logger.log(message="before")
        T result = next()
        logger.log(message="after")
        return result
/** Rejects negative numbers before the target executes. */
interceptor Positive<T>():
    /**
    * @param y The target argument selected by a mapping such as y=x.
    * @throws ValidationError When the selected value is negative.
    */
    around(int y) returns T unless ValidationError:
        if y < 0:
            throw ValidationError(message="value must be nonnegative")
        return next()
/** Adds one to the selected input before forwarding the call. */
interceptor AddOne<T>():
    /** @param y The input to increment. */
    around(int y) returns T:
        return next(y=y + 1)
```

```aug [Braces]
import Console from august.io
import Logger from logging
/** Raised when a numeric input fails validation. */
ValidationError(string message) implements Error {
    pass
}
/**
* Logs before and after a successful call.
* Generic T is inferred from the annotated function or constructor.
* @param logger Shared application logger, injected for each fresh instance.
*/
interceptor Audit<T>(resolve Logger logger) {
    /** Wrap a call without changing its result. */
    around(resolve Console console) returns T uses Console.write {
        logger.log(message="before")
        T result = next()
        logger.log(message="after")
        return result
    }
}
/** Rejects negative numbers before the target executes. */
interceptor Positive<T>() {
    /**
    * @param y The target argument selected by a mapping such as y=x.
    * @throws ValidationError When the selected value is negative.
    */
    around(int y) returns T unless ValidationError {
        if y < 0 {
            throw ValidationError(message="value must be nonnegative")
        }
        return next()
    }
}
/** Adds one to the selected input before forwarding the call. */
interceptor AddOne<T>() {
    /** @param y The input to increment. */
    around(int y) returns T {
        return next(y=y + 1)
    }
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Available from `august.io`.

Interface. Follow the linked specification for its full explanation.

**[`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)**

Type parameters: `T`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`Logger`](logging.md#symbol-Logger)

Available from `logging`.

Interface. Follow the linked specification for its full explanation.

**[`Logger.log`](logging.md#symbol-Logger.log)**

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### `ValidationError` {#symbol-ValidationError}

[source](interceptors.md#code)

Behavioral class.

Satisfies `Error`.

**Author documentation**

Raised when a numeric input fails validation.

**Inputs and dependencies**

- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them. Store it as `message`. The field is read-only after initialization.

### `Audit` {#symbol-Audit}

[source](interceptors.md#code)

Function or constructor middleware.

Type parameters: `T`.

**Author documentation**

Logs before and after a successful call.
Generic T is inferred from the annotated function or constructor.

**Parameters**
- `logger`: Shared application logger, injected for each fresh instance.

**Inputs and dependencies**

- `logger`: [`Logger`](logging.md#symbol-Logger). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them. Store it as `logger`. The field is read-only after initialization.

Create a fresh interceptor for each invocation. Its around operation can delegate once, change selected inputs, or short-circuit with a compatible result or failure.

#### `Audit.around` {#symbol-Audit.around}

[source](interceptors.md#code)

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: `T`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**Author documentation**

Wrap a call without changing its result.

**Behavior when execution reaches this operation**

- Call [`Logger.log`](logging.md#symbol-Logger.log) on `logger` with `message` set to `"before"`; supply dependencies `console` from `console`.
- Set `result` of type `T` to the result of call `next`.
- Call [`Logger.log`](logging.md#symbol-Logger.log) on `logger` with `message` set to `"after"`; supply dependencies `console` from `console`.
- Return `result` and finish this operation.

### `Positive` {#symbol-Positive}

[source](interceptors.md#code)

Function or constructor middleware.

Type parameters: `T`.

**Author documentation**

Rejects negative numbers before the target executes.

Create a fresh interceptor for each invocation. Its around operation can delegate once, change selected inputs, or short-circuit with a compatible result or failure.

#### `Positive.around` {#symbol-Positive.around}

[source](interceptors.md#code)

**Inputs and dependencies**

- `y`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `T`.

Possible failures: `ValidationError`. The caller must catch or propagate them.

**Author documentation**

**Parameters**
- `y`: The target argument selected by a mapping such as y=x.

**Throws**
- `ValidationError`: When the selected value is negative.

**Behavior when execution reaches this operation**

- If (`y` is less than `0`) is true:
  - Fail with the result of call [`ValidationError`](interceptors.md#symbol-ValidationError) with `message` set to `"value must be nonnegative"`. Transfer control to a matching catch or propagate the failure.
- Return the result of call `next` and finish this operation.

### `AddOne` {#symbol-AddOne}

[source](interceptors.md#code)

Function or constructor middleware.

Type parameters: `T`.

**Author documentation**

Adds one to the selected input before forwarding the call.

Create a fresh interceptor for each invocation. Its around operation can delegate once, change selected inputs, or short-circuit with a compatible result or failure.

#### `AddOne.around` {#symbol-AddOne.around}

[source](interceptors.md#code)

**Inputs and dependencies**

- `y`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `T`.

**Author documentation**

**Parameters**
- `y`: The input to increment.

**Behavior when execution reaches this operation**

- Return the result of call `next` with `y` set to (`y` plus `1`) and finish this operation.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
