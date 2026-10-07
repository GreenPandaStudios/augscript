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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOTBiN2RkZDFiZDg4NTljNTI4MGY2ZjdiNzRjMjA1MTA0MzJjNTM5YjI2MmE1OTE0NjdmY2Q2YjM4MmVjMzczOSIsImZvcm1hdHRlZFNoYTI1NiI6ImM0YTJjOGZkNTYwYzQzOTczYjI1OWFiZmUxMmUyOTg3YWRmZTlhOTA5NmVjYTY2YzljOTg0YmUzYzRiNDExMjgiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDE2IiwiZmlyc3QiOjE1LCJsYXN0IjoxNSwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTc4MTk4MmI1ZWE2YyJdfSx7ImlkIjoic291cmNlLUwxOCIsImZpcnN0IjoxNywibGFzdCI6MTcsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS03ODE5ODJiNWVhNmMiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo1LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiaW50ZXJjZXB0b3JzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLVZhbGlkYXRpb25FcnJvciJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNCwibGFzdCI6MTgsImJhY2tsaW5rcyI6WyJpbnRlcmNlcHRvcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzeW1ib2wtQXVkaXQuYXJvdW5kIl19LHsiaWQiOiJzb3VyY2UtTDI4IiwiZmlyc3QiOjI1LCJsYXN0IjoyOCwiYmFja2xpbmtzIjpbImludGVyY2VwdG9ycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1Qb3NpdGl2ZS5hcm91bmQiXX0seyJpZCI6InNvdXJjZS1MMzgiLCJmaXJzdCI6MzIsImxhc3QiOjMzLCJiYWNrbGlua3MiOlsiaW50ZXJjZXB0b3JzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiLCIjc3ltYm9sLUFkZE9uZS5hcm91bmQiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6MTIsImxhc3QiOjE4LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1BdWRpdCJdfSx7ImlkIjoic291cmNlLUwxNi1MMTkiLCJmaXJzdCI6MTUsImxhc3QiOjE4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMjMiLCJmaXJzdCI6MjAsImxhc3QiOjI4LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Qb3NpdGl2ZSJdfSx7ImlkIjoic291cmNlLUwyOS1MMzIiLCJmaXJzdCI6MjYsImxhc3QiOjI4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMzYiLCJmaXJzdCI6MzAsImxhc3QiOjMzLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1BZGRPbmUiXX0seyJpZCI6InNvdXJjZS1MMzkiLCJmaXJzdCI6MzMsImxhc3QiOjMzLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX1dfQ
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOTBiN2RkZDFiZDg4NTljNTI4MGY2ZjdiNzRjMjA1MTA0MzJjNTM5YjI2MmE1OTE0NjdmY2Q2YjM4MmVjMzczOSIsImZvcm1hdHRlZFNoYTI1NiI6ImU0ODM0YTgwOTA2ODM4ZTI5NzU2YjRkN2E2NDg5OWUwYjk2MjgyOWU4NTA2OGFjNGZhYWRiNDVhNTFiNzcyOTQiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDE2IiwiZmlyc3QiOjE2LCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2luZGV4Lm1kI2JvdW5kYXJ5LTc4MTk4MmI1ZWE2YyJdfSx7ImlkIjoic291cmNlLUwxOCIsImZpcnN0IjoxOCwibGFzdCI6MTgsImJhY2tsaW5rcyI6WyJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS03ODE5ODJiNWVhNmMiXX0seyJpZCI6InNvdXJjZS1MNSIsImZpcnN0Ijo1LCJsYXN0Ijo3LCJiYWNrbGlua3MiOlsiaW50ZXJjZXB0b3JzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiLCIjc3ltYm9sLVZhbGlkYXRpb25FcnJvciJdfSx7ImlkIjoic291cmNlLUwxNSIsImZpcnN0IjoxNSwibGFzdCI6MjAsImJhY2tsaW5rcyI6WyJpbnRlcmNlcHRvcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiIsIiNzeW1ib2wtQXVkaXQuYXJvdW5kIl19LHsiaWQiOiJzb3VyY2UtTDI4IiwiZmlyc3QiOjI4LCJsYXN0IjozMywiYmFja2xpbmtzIjpbImludGVyY2VwdG9ycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1Qb3NpdGl2ZS5hcm91bmQiXX0seyJpZCI6InNvdXJjZS1MMzgiLCJmaXJzdCI6MzgsImxhc3QiOjQwLCJiYWNrbGlua3MiOlsiaW50ZXJjZXB0b3JzLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTQiLCIjc3ltYm9sLUFkZE9uZS5hcm91bmQiXX0seyJpZCI6InNvdXJjZS1MMTMiLCJmaXJzdCI6MTMsImxhc3QiOjIxLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1BdWRpdCJdfSx7ImlkIjoic291cmNlLUwxNi1MMTkiLCJmaXJzdCI6MTYsImxhc3QiOjE5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMjMiLCJmaXJzdCI6MjMsImxhc3QiOjM0LCJiYWNrbGlua3MiOlsiI3N5bWJvbC1Qb3NpdGl2ZSJdfSx7ImlkIjoic291cmNlLUwyOS1MMzIiLCJmaXJzdCI6MjksImxhc3QiOjMyLCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTIiXX0seyJpZCI6InNvdXJjZS1MMzYiLCJmaXJzdCI6MzYsImxhc3QiOjQxLCJiYWNrbGlua3MiOlsiI3N5bWJvbC1BZGRPbmUiXX0seyJpZCI6InNvdXJjZS1MMzkiLCJmaXJzdCI6MzksImxhc3QiOjM5LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTMiXX1dfQ
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

Wrap a call without changing its result. It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

::: spec-paragraph specification-paragraph-1
It passes `"before"` to [`logger.log`](logging.md#symbol-Logger.log), using injected `console`. It sets `result` of type `T` to `next`. It passes `"after"` to [`logger.log`](logging.md#symbol-Logger.log), using injected `console`. It returns `result`. [source](interceptors.md#source-L16-L19)
:::

::: details Checked interface

```text
around(resolve Console console) returns T uses Console.write
```

It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

:::

### `Positive` · interceptor · [source](interceptors.md#source-L23) {#symbol-Positive}

Rejects negative numbers before the target executes. The type parameters are `T`. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

#### `Positive.around` · [source](interceptors.md#source-L28) {#symbol-Positive.around}

::: spec-paragraph specification-paragraph-2
It takes `y` as an integer. Failures can raise [`ValidationError`](interceptors.md#symbol-ValidationError) (when the selected value is negative). If `y` is negative, it raises a [`ValidationError`](interceptors.md#symbol-ValidationError) with `message` `"value must be nonnegative"`. It returns `next`. [source](interceptors.md#source-L29-L32)
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

It uses [`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)) from `august.io`. It uses [`Logger`](logging.md#symbol-Logger) ([`log`](logging.md#symbol-Logger.log)) from `logging`.

::::

:::::
