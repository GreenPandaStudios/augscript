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

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOTNmN2M4YWJjOTJkYjc5ZDgxNzBhMGFhMTk5MTNmMGM5ZDExM2NiMzNkZDZiOTNmMDBkZDBjYWM4ZDQ1YTk2YiIsImZvcm1hdHRlZFNoYTI1NiI6IjU4ZDgxNTFhYWNmZTUwNWZkNzVlMGQ2ZGVkZjQ0NjkxMmRkM2VlZTI4YWZmYjZlYTFlMjA4OTgwZGVjNTBlZGEiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NCwiYmFja2xpbmtzIjpbIm51bWJlcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtUmFuZ2VFcnJvciJdfSx7ImlkIjoic291cmNlLUw3IiwiZmlyc3QiOjcsImxhc3QiOjEwLCJiYWNrbGlua3MiOlsibnVtYmVycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1Qb3NpdGl2ZS5hcm91bmQiXX0seyJpZCI6InNvdXJjZS1MMTgiLCJmaXJzdCI6MTgsImxhc3QiOjE5LCJiYWNrbGlua3MiOlsibnVtYmVycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1kb3VibGUiXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo2LCJsYXN0IjoxMCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtUG9zaXRpdmUiXX0seyJpZCI6InNvdXJjZS1MOC1MMTAiLCJmaXJzdCI6OCwibGFzdCI6MTAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxOSIsImZpcnN0IjoxOSwibGFzdCI6MTksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwyMCIsImZpcnN0IjoyMCwibGFzdCI6MzAsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXRlc3QtMjAtZG91YmxlIl19LHsiaWQiOiJzb3VyY2UtTDIyIiwiZmlyc3QiOjIyLCJsYXN0IjoyMywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDIzIiwiZmlyc3QiOjIzLCJsYXN0IjoyMywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDI0IiwiZmlyc3QiOjI0LCJsYXN0IjozMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01Il19LHsiaWQiOiJzb3VyY2UtTDI1IiwiZmlyc3QiOjI1LCJsYXN0IjoyNSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC02Il19LHsiaWQiOiJzb3VyY2UtTDI2LUwzMCIsImZpcnN0IjoyNiwibGFzdCI6MzAsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNyJdfV19
// aug-spec: "numbers.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Raised when an input is outside the operation's domain. */
RangeError(int value) implements Error:
    pass
/** A pure validation layer, shared by any compatible callable. */
interceptor Positive<T>():
    around(int amount) returns T:
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
double(int amount):
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

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOTNmN2M4YWJjOTJkYjc5ZDgxNzBhMGFhMTk5MTNmMGM5ZDExM2NiMzNkZDZiOTNmMDBkZDBjYWM4ZDQ1YTk2YiIsImZvcm1hdHRlZFNoYTI1NiI6IjNhNjhmNWNiMmU4YWRlMmVmZjEwMzk2OTNkODdjNjM4YTNkMWM1ZjVmNjQwODkxZjhlNTk4NjM5YzRiOTgyNWIiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDMiLCJmaXJzdCI6MywibGFzdCI6NSwiYmFja2xpbmtzIjpbIm51bWJlcnMtZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSIsIiNzeW1ib2wtUmFuZ2VFcnJvciJdfSx7ImlkIjoic291cmNlLUw3IiwiZmlyc3QiOjgsImxhc3QiOjEzLCJiYWNrbGlua3MiOlsibnVtYmVycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1Qb3NpdGl2ZS5hcm91bmQiXX0seyJpZCI6InNvdXJjZS1MMTgiLCJmaXJzdCI6MjIsImxhc3QiOjI0LCJiYWNrbGlua3MiOlsibnVtYmVycy1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIiwiI3N5bWJvbC1kb3VibGUiXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo3LCJsYXN0IjoxNCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtUG9zaXRpdmUiXX0seyJpZCI6InNvdXJjZS1MOC1MMTAiLCJmaXJzdCI6OSwibGFzdCI6MTIsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMSJdfSx7ImlkIjoic291cmNlLUwxOSIsImZpcnN0IjoyMywibGFzdCI6MjMsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMiJdfSx7ImlkIjoic291cmNlLUwyMCIsImZpcnN0IjoyNSwibGFzdCI6NDEsImJhY2tsaW5rcyI6WyIjc3ltYm9sLXRlc3QtMjAtZG91YmxlIl19LHsiaWQiOiJzb3VyY2UtTDIyIiwiZmlyc3QiOjI3LCJsYXN0IjoyOSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDIzIiwiZmlyc3QiOjI4LCJsYXN0IjoyOCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDI0IiwiZmlyc3QiOjMwLCJsYXN0IjozOSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01Il19LHsiaWQiOiJzb3VyY2UtTDI1IiwiZmlyc3QiOjMxLCJsYXN0IjozMSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC02Il19LHsiaWQiOiJzb3VyY2UtTDI2LUwzMCIsImZpcnN0IjozMiwibGFzdCI6MzgsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNyJdfV19
// aug-spec: "numbers.aug.md" explains this file. Read it before changes; refresh with aug spec.
/** Raised when an input is outside the operation's domain. */
RangeError(int value) implements Error {
    pass
}
/** A pure validation layer, shared by any compatible callable. */
interceptor Positive<T>() {
    around(int amount) returns T {
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
double(int amount) {
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

[Interactions and sequences](numbers-diagrams.md)

### `RangeError` · class · [source](numbers.md#source-L3) {#symbol-RangeError}

Raised when an input is outside the operation's domain. It implements `Error`. It takes `value` as an integer, kept read-only.

### `Positive` · interceptor · [source](numbers.md#source-L6) {#symbol-Positive}

A pure validation layer, shared by any compatible callable. The type parameters are `T`. Creates one interceptor per invocation. Its around operation may delegate once or finish early.

#### `Positive.around` · [source](numbers.md#source-L7) {#symbol-Positive.around}

::: spec-paragraph specification-paragraph-1
It takes `amount` as an integer. Failures can raise [`RangeError`](numbers.md#symbol-RangeError). If `amount` is negative, it raises a [`RangeError`](numbers.md#symbol-RangeError) with `value` from `amount`. It returns `next`. [source](numbers.md#source-L8-L10)
:::

::: details Checked interface

```text
around(int amount) returns T unless RangeError
```

It takes `amount` as an integer. Failures can raise [`RangeError`](numbers.md#symbol-RangeError).

:::

### `double` · [source](numbers.md#source-L18) {#symbol-double}

Double a nonnegative amount. It takes `amount` as an integer. It returns `int` — Twice the amount, with defined integer wrapping. Failures can raise [`RangeError`](numbers.md#symbol-RangeError) (A validation layer rejected a negative input).

::: spec-paragraph specification-paragraph-2
Layers run in the declared order. Call [`Positive.around`](numbers.md#symbol-Positive.around). It returns `amount` times `2`. [source](numbers.md#source-L19)
:::

::: details Checked interface

```text
double(int amount) returns int unless RangeError
```

It takes `amount` as an integer (Integer to double). It returns `int` — Twice the amount, with defined integer wrapping. Failures can raise [`RangeError`](numbers.md#symbol-RangeError) (A validation layer rejected a negative input).

:::

### `test double` · [source](numbers.md#source-L20) {#symbol-test-20-double}

Tests [`double`](numbers.md#symbol-double). Each case gets fresh setup and dependencies.

#### `positive`

::: spec-paragraph specification-paragraph-3
##### `doubles` · [source](numbers.md#source-L22)
:::

::: spec-paragraph specification-paragraph-4
Run once for each row of a tuple containing `0`, `0`; a tuple containing `3`, `6`; a tuple containing `7`, `14`. Bind row positions to `input`, `expected`. The test requires [`double`](numbers.md#symbol-double) with `amount` from `input` equals `expected`. [source](numbers.md#source-L23)
:::

::: spec-paragraph specification-paragraph-5
##### `rejects_negative` · [source](numbers.md#source-L24)
:::

::: spec-paragraph specification-paragraph-6
It sets `rejected` to `false`. [source](numbers.md#source-L25)
:::

::: spec-paragraph specification-paragraph-7
It tries to call [`double`](numbers.md#symbol-double) with `amount` `-1`. If this work raises [`RangeError`](numbers.md#symbol-RangeError) as `error`, it sets `rejected` to `error.value` equals `-1`. The test requires `rejected` is true. [source](numbers.md#source-L26-L30)
:::

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
