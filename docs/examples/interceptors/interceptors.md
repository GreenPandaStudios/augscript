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
// aug-spec: "interceptors.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "interceptors.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

Raised when a numeric input fails validation. Implements `Error`. The caller supplies `message` as `string`, stored read-only.

<a id="symbol-Audit"></a>
### `Audit` · interceptor · [source](interceptors.md#code)

Logs before and after a successful call.
Generic T is inferred from the annotated function or constructor. The type parameters are `T`.

Dependency injection supplies `logger` as [`Logger`](logging.md#symbol-Logger), stored read-only. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

<a id="symbol-Audit.around"></a>
#### `Audit.around` · [source](interceptors.md#code)

Wrap a call without changing its result. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). The result is `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It calls [`Logger.log`](logging.md#symbol-Logger.log) on `logger` (`message` set to `"before"`) using `console`. It sets `result` of type `T` to the value from `next`. It calls [`Logger.log`](logging.md#symbol-Logger.log) on `logger` (`message` set to `"after"`) using `console`. It returns `result`.

<a id="symbol-Positive"></a>
### `Positive` · interceptor · [source](interceptors.md#code)

Rejects negative numbers before the target executes. The type parameters are `T`. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

<a id="symbol-Positive.around"></a>
#### `Positive.around` · [source](interceptors.md#code)

The caller supplies `y` as `int` (the target argument selected by a mapping such as y=x). The result is `T`. It can fail with `ValidationError` (when the selected value is negative). If `y` is less than `0`, it fails with a new [`ValidationError`](interceptors.md#symbol-ValidationError) (`message` set to `"value must be nonnegative"`). Otherwise, it returns the value from `next`.

<a id="symbol-AddOne"></a>
### `AddOne` · interceptor · [source](interceptors.md#code)

Adds one to the selected input before forwarding the call. The type parameters are `T`. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

<a id="symbol-AddOne.around"></a>
#### `AddOne.around` · [source](interceptors.md#code)

The caller supplies `y` as `int` (the input to increment). The result is `T`. It returns the value from `next` (`y` set to `y` plus `1`).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`Logger`](logging.md#symbol-Logger) from `logging`. [`log`](logging.md#symbol-Logger.log) takes `message` as `string`. It returns no value. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

::::

:::::
