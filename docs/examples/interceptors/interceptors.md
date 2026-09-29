---
title: "interceptors.aug · Function and constructor middleware"
generated: true
source: "examples/interceptors/interceptors.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `interceptors.aug`

[Function and constructor middleware](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`app.aug`](app.md)
- [`interceptors.aug`](interceptors.md)
- [`logging.aug`](logging.md)

:::

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-ValidationError"></a>
### `ValidationError` · class · [source](interceptors.md#code)

Raised when a numeric input fails validation. Implements `Error`.

**Inputs:** Take `message` (`string`); store read-only.

<a id="symbol-Audit"></a>
### `Audit` · interceptor · [source](interceptors.md#code)

Logs before and after a successful call.
Generic T is inferred from the annotated function or constructor. Type parameters: `T`.

**Inputs:** Resolve [`Logger`](logging.md#symbol-Logger) as `logger`; store read-only.

Creates one interceptor per invocation. Its around operation may delegate once or finish early.

<a id="symbol-Audit.around"></a>
#### `Audit.around` · [source](interceptors.md#code)

Wrap a call without changing its result.

**Inputs:** Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`.

Returns `T`. Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

- Call [`Logger.log`](logging.md#symbol-Logger.log) on `logger` with `message` as `"before"` using `console`.
- Set `result` of type `T` to the result of `next`.
- Call [`Logger.log`](logging.md#symbol-Logger.log) on `logger` with `message` as `"after"` using `console`.
- Return `result`.

<a id="symbol-Positive"></a>
### `Positive` · interceptor · [source](interceptors.md#code)

Rejects negative numbers before the target executes. Type parameters: `T`.

Creates one interceptor per invocation. Its around operation may delegate once or finish early.

<a id="symbol-Positive.around"></a>
#### `Positive.around` · [source](interceptors.md#code)

**Inputs:** Take `y` (`int`) — The target argument selected by a mapping such as y=x.

Returns `T`. Can fail with `ValidationError` (when the selected value is negative).

- If `y` is less than `0`:
  - Fail with a new [`ValidationError`](interceptors.md#symbol-ValidationError) with `message` as `"value must be nonnegative"`.
- Return the result of `next`.

<a id="symbol-AddOne"></a>
### `AddOne` · interceptor · [source](interceptors.md#code)

Adds one to the selected input before forwarding the call. Type parameters: `T`.

Creates one interceptor per invocation. Its around operation may delegate once or finish early.

<a id="symbol-AddOne.around"></a>
#### `AddOne.around` · [source](interceptors.md#code)

**Inputs:** Take `y` (`int`) — The input to increment.

Returns `T`.

- Return the result of `next` with `y` as `y` plus `1`.

### Dependencies

- [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`: [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.
- [`Logger`](logging.md#symbol-Logger) from `logging`: [`log`](logging.md#symbol-Logger.log) (`message`: `string`) → `void`.

::::

:::::
