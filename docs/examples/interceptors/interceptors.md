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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`ValidationError`](interceptors.md#symbol-ValidationError) is a class implementing `Error`.
- [`Audit`](interceptors.md#symbol-Audit) is an interceptor.
- [`Positive`](interceptors.md#symbol-Positive) is an interceptor.
- [`AddOne`](interceptors.md#symbol-AddOne) is an interceptor.

### `ValidationError` {#symbol-ValidationError}

[source](interceptors.md#code)

Behavioral class.

Satisfies `Error`.

**Author documentation**

Raised when a numeric input fails validation.

**Inputs**

- `message` (`string`) — required labeled input — stored as `message` and read-only after initialization.

### `Audit` {#symbol-Audit}

[source](interceptors.md#code)

Function or constructor middleware.

Type parameters: `T`.

**Author documentation**

Logs before and after a successful call.
Generic T is inferred from the annotated function or constructor.

**Parameters**
- `logger`: Shared application logger, injected for each fresh instance.

**Inputs**

- `logger` ([`Logger`](logging.md#symbol-Logger)) — injected; callers omit it — stored as `logger` and read-only after initialization.

Create a fresh interceptor for each invocation. Its around operation can delegate once, change selected inputs, or short-circuit with a compatible result or failure.

#### `Audit.around` {#symbol-Audit.around}

[source](interceptors.md#code)

**Inputs**

- `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.

Returns: `T`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**What it does**

- Call [`Logger.log`](logging.md#symbol-Logger.log) on `logger` with `message` = `"before"`; inject `console` from `console`.
- Set `result` of type `T` to call `next`.
- Call [`Logger.log`](logging.md#symbol-Logger.log) on `logger` with `message` = `"after"`; inject `console` from `console`.
- Return `result`.

**Author documentation**

Wrap a call without changing its result.

### `Positive` {#symbol-Positive}

[source](interceptors.md#code)

Function or constructor middleware.

Type parameters: `T`.

**Author documentation**

Rejects negative numbers before the target executes.

Create a fresh interceptor for each invocation. Its around operation can delegate once, change selected inputs, or short-circuit with a compatible result or failure.

#### `Positive.around` {#symbol-Positive.around}

[source](interceptors.md#code)

**Inputs**

- `y` (`int`) — required labeled input.

Returns: `T`.

Can fail with `ValidationError`. Callers must catch or propagate these errors.

**What it does**

- If `y` is less than `0`:
  - Fail with call [`ValidationError`](interceptors.md#symbol-ValidationError) with `message` = `"value must be nonnegative"`. Transfer control to a matching catch or propagate the failure.
- Return call `next`.

**Author documentation**

**Parameters**
- `y`: The target argument selected by a mapping such as y=x.

**Throws**
- `ValidationError`: When the selected value is negative.

### `AddOne` {#symbol-AddOne}

[source](interceptors.md#code)

Function or constructor middleware.

Type parameters: `T`.

**Author documentation**

Adds one to the selected input before forwarding the call.

Create a fresh interceptor for each invocation. Its around operation can delegate once, change selected inputs, or short-circuit with a compatible result or failure.

#### `AddOne.around` {#symbol-AddOne.around}

[source](interceptors.md#code)

**Inputs**

- `y` (`int`) — required labeled input.

Returns: `T`.

**What it does**

- Return call `next` with `y` = (`y` plus `1`).

**Author documentation**

**Parameters**
- `y`: The input to increment.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Capability interface from `august.io`.

- [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

#### [`Logger`](logging.md#symbol-Logger)

Interface from `logging`.

- [`Logger.log`](logging.md#symbol-Logger.log) (`message`: `string`) → `void`; inject `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console); uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
