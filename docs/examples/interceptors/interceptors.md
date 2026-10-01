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
    around(resolve Console console):
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
    around(int y) returns T:
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
    around(resolve Console console) {
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
    around(int y) returns T {
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

### `ValidationError` · class · [source](interceptors.md#code) {#symbol-ValidationError}

Raised when a numeric input fails validation. It implements `Error`. It takes `message` as a string, kept read-only.

### `Audit` · interceptor · [source](interceptors.md#code) {#symbol-Audit}

Logs before and after a successful call.
Generic T is inferred from the annotated function or constructor. The type parameters are `T`.

The `logger` dependency is injected as [`Logger`](logging.md#symbol-Logger) and stored read-only. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

#### `Audit.around` · [source](interceptors.md#code) {#symbol-Audit.around}

Wrap a call without changing its result. It gets `console` ([`Console`](dependencies/august/0.20.1/io/contracts.md#symbol-Console)) from dependency injection.

It passes `"before"` to [`logger.log`](logging.md#symbol-Logger.log), using injected `console`. It sets `result` of type `T` to `next`. It passes `"after"` to [`logger.log`](logging.md#symbol-Logger.log), using injected `console`. It returns `result`.

### `Positive` · interceptor · [source](interceptors.md#code) {#symbol-Positive}

Rejects negative numbers before the target executes. The type parameters are `T`. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

#### `Positive.around` · [source](interceptors.md#code) {#symbol-Positive.around}

It takes `y` as an integer (the target argument selected by a mapping such as y=x). Failures can raise [`ValidationError`](interceptors.md#symbol-ValidationError) (when the selected value is negative). If `y` is negative, it raises a [`ValidationError`](interceptors.md#symbol-ValidationError) with `message` `"value must be nonnegative"`. It returns `next`.

### `AddOne` · interceptor · [source](interceptors.md#code) {#symbol-AddOne}

Adds one to the selected input before forwarding the call. The type parameters are `T`. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

#### `AddOne.around` · [source](interceptors.md#code) {#symbol-AddOne.around}

It takes `y` as an integer (the input to increment). It returns `next` with `y` from `y` plus `1`.

### Dependencies

It uses [`Console`](dependencies/august/0.20.1/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.20.1/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](logging.md#symbol-Logger) ([`log`](logging.md#symbol-Logger.log)) from `logging`.

::::

:::::
