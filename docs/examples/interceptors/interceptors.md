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

Raised when a numeric input fails validation. It implements `Error`. It takes `message` as a string, kept read-only.

<a id="symbol-Audit"></a>
### `Audit` · interceptor · [source](interceptors.md#code)

Logs before and after a successful call.
Generic T is inferred from the annotated function or constructor. The type parameters are `T`.

The `logger` dependency is injected as [`Logger`](logging.md#symbol-Logger) and stored read-only. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

<a id="symbol-Audit.around"></a>
#### `Audit.around` · [source](interceptors.md#code)

Wrap a call without changing its result. It gets `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) from dependency injection.

It passes `"before"` to [`logger.log`](logging.md#symbol-Logger.log), using injected `console`. It sets `result` of type `T` to `next`. It passes `"after"` to [`logger.log`](logging.md#symbol-Logger.log), using injected `console`. It returns `result`.

<a id="symbol-Positive"></a>
### `Positive` · interceptor · [source](interceptors.md#code)

Rejects negative numbers before the target executes. The type parameters are `T`. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

<a id="symbol-Positive.around"></a>
#### `Positive.around` · [source](interceptors.md#code)

It takes `y` as an integer (the target argument selected by a mapping such as y=x). Failures can raise [`ValidationError`](interceptors.md#symbol-ValidationError) (when the selected value is negative). If `y` is negative, it raises a [`ValidationError`](interceptors.md#symbol-ValidationError) with `message` `"value must be nonnegative"`. It returns `next`.

<a id="symbol-AddOne"></a>
### `AddOne` · interceptor · [source](interceptors.md#code)

Adds one to the selected input before forwarding the call. The type parameters are `T`. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

<a id="symbol-AddOne.around"></a>
#### `AddOne.around` · [source](interceptors.md#code)

It takes `y` as an integer (the input to increment). It returns `next` with `y` from `y` plus `1`.

### Dependencies

It uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](logging.md#symbol-Logger) ([`log`](logging.md#symbol-Logger.log)) from `logging`. These links explain the full dependency contracts.

::::

:::::
