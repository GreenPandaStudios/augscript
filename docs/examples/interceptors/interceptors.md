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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOTBiN2RkZDFiZDg4NTljNTI4MGY2ZjdiNzRjMjA1MTA0MzJjNTM5YjI2MmE1OTE0NjdmY2Q2YjM4MmVjMzczOSIsImZvcm1hdHRlZFNoYTI1NiI6ImM0YTJjOGZkNTYwYzQzOTczYjI1OWFiZmUxMmUyOTg3YWRmZTlhOTA5NmVjYTY2YzljOTg0YmUzYzRiNDExMjgiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6NiwiYmFja2xpbmtzIjpbImludGVyY2VwdG9ycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1WYWxpZGF0aW9uRXJyb3IiXX0seyJpZCI6InNvdXJjZS1MMTUiLCJmaXJzdCI6MTQsImxhc3QiOjE4LCJiYWNrbGlua3MiOlsiaW50ZXJjZXB0b3JzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLUF1ZGl0LmFyb3VuZCJdfSx7ImlkIjoic291cmNlLUwyOCIsImZpcnN0IjoyNSwibGFzdCI6MjgsImJhY2tsaW5rcyI6WyJpbnRlcmNlcHRvcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtUG9zaXRpdmUuYXJvdW5kIl19LHsiaWQiOiJzb3VyY2UtTDM4IiwiZmlyc3QiOjMyLCJsYXN0IjozMywiYmFja2xpbmtzIjpbImludGVyY2VwdG9ycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1BZGRPbmUuYXJvdW5kIl19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEyLCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQXVkaXQiXX0seyJpZCI6InNvdXJjZS1MMTYtTDE5IiwiZmlyc3QiOjE1LCJsYXN0IjoxOCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDIzIiwiZmlyc3QiOjIwLCJsYXN0IjoyOCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtUG9zaXRpdmUiXX0seyJpZCI6InNvdXJjZS1MMjktTDMyIiwiZmlyc3QiOjI2LCJsYXN0IjoyOCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDM2IiwiZmlyc3QiOjMwLCJsYXN0IjozMywiYmFja2xpbmtzIjpbIiNzeW1ib2wtQWRkT25lIl19LHsiaWQiOiJzb3VyY2UtTDM5IiwiZmlyc3QiOjMzLCJsYXN0IjozMywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19XX0
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOTBiN2RkZDFiZDg4NTljNTI4MGY2ZjdiNzRjMjA1MTA0MzJjNTM5YjI2MmE1OTE0NjdmY2Q2YjM4MmVjMzczOSIsImZvcm1hdHRlZFNoYTI1NiI6ImU0ODM0YTgwOTA2ODM4ZTI5NzU2YjRkN2E2NDg5OWUwYjk2MjgyOWU4NTA2OGFjNGZhYWRiNDVhNTFiNzcyOTQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6NywiYmFja2xpbmtzIjpbImludGVyY2VwdG9ycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1WYWxpZGF0aW9uRXJyb3IiXX0seyJpZCI6InNvdXJjZS1MMTUiLCJmaXJzdCI6MTUsImxhc3QiOjIwLCJiYWNrbGlua3MiOlsiaW50ZXJjZXB0b3JzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiLCIjc3ltYm9sLUF1ZGl0LmFyb3VuZCJdfSx7ImlkIjoic291cmNlLUwyOCIsImZpcnN0IjoyOCwibGFzdCI6MzMsImJhY2tsaW5rcyI6WyJpbnRlcmNlcHRvcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtUG9zaXRpdmUuYXJvdW5kIl19LHsiaWQiOiJzb3VyY2UtTDM4IiwiZmlyc3QiOjM4LCJsYXN0Ijo0MCwiYmFja2xpbmtzIjpbImludGVyY2VwdG9ycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1BZGRPbmUuYXJvdW5kIl19LHsiaWQiOiJzb3VyY2UtTDEzIiwiZmlyc3QiOjEzLCJsYXN0IjoyMSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQXVkaXQiXX0seyJpZCI6InNvdXJjZS1MMTYtTDE5IiwiZmlyc3QiOjE2LCJsYXN0IjoxOSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIl19LHsiaWQiOiJzb3VyY2UtTDIzIiwiZmlyc3QiOjIzLCJsYXN0IjozNCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtUG9zaXRpdmUiXX0seyJpZCI6InNvdXJjZS1MMjktTDMyIiwiZmlyc3QiOjI5LCJsYXN0IjozMiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDM2IiwiZmlyc3QiOjM2LCJsYXN0Ijo0MSwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQWRkT25lIl19LHsiaWQiOiJzb3VyY2UtTDM5IiwiZmlyc3QiOjM5LCJsYXN0IjozOSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19XX0
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

[Interactions and sequences](interceptors-diagrams.md)

### `ValidationError` · class · [source](interceptors.md#source-L5) {#symbol-ValidationError}

Raised when a numeric input fails validation. It implements `Error`. It takes `message` as a string, kept read-only.

### `Audit` · interceptor · [source](interceptors.md#source-L13) {#symbol-Audit}

Logs before and after a successful call.
Generic T is inferred from the annotated function or constructor. The type parameters are `T`.

The `logger` dependency is injected as [`Logger`](logging.md#symbol-Logger) and stored read-only. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

#### `Audit.around` · [source](interceptors.md#source-L15) {#symbol-Audit.around}

Wrap a call without changing its result. It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection.

::: spec-paragraph specification-paragraph-1
It passes `"before"` to [`logger.log`](logging.md#symbol-Logger.log), using injected `console`. It sets `result` of type `T` to `next`. It passes `"after"` to [`logger.log`](logging.md#symbol-Logger.log), using injected `console`. It returns `result`. [source](interceptors.md#source-L16-L19)
:::

::: details Checked interface

```text
around(resolve Console console) returns T uses Console.write
```

It gets `console` ([`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console)) from dependency injection.

:::

### `Positive` · interceptor · [source](interceptors.md#source-L23) {#symbol-Positive}

Rejects negative numbers before the target executes. The type parameters are `T`. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

#### `Positive.around` · [source](interceptors.md#source-L28) {#symbol-Positive.around}

::: spec-paragraph specification-paragraph-2
It takes `y` as an integer. If `y` is negative, it raises a [`ValidationError`](interceptors.md#symbol-ValidationError) with `message` `"value must be nonnegative"`. It returns `next`. [source](interceptors.md#source-L29-L32)
:::

::: details Checked interface

```text
around(int y) returns T unless ValidationError
```

It takes `y` as an integer (the target argument selected by a mapping such as y=x). Failures can raise [`ValidationError`](interceptors.md#symbol-ValidationError) (when the selected value is negative).

:::

### `AddOne` · interceptor · [source](interceptors.md#source-L36) {#symbol-AddOne}

Adds one to the selected input before forwarding the call. The type parameters are `T`. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

#### `AddOne.around` · [source](interceptors.md#source-L38) {#symbol-AddOne.around}

::: spec-paragraph specification-paragraph-3
It takes `y` as an integer. It returns `next` with `y` from `y` plus `1`. [source](interceptors.md#source-L39)
:::

::: details Checked interface

```text
around(int y) returns T
```

It takes `y` as an integer (the input to increment).

:::

### Dependencies

It uses [`Console`](dependencies/august/0.23.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.23.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](logging.md#symbol-Logger) ([`log`](logging.md#symbol-Logger.log)) from `logging`.

::::

:::::
