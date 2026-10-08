---
title: "calculator.aug · A small tested application"
generated: true
source: "examples/developer-workflow/calculator.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `calculator.aug`

[A small tested application](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`calculator.aug`](calculator.md)
- [`logging/console.aug`](logging/console.md)
- [`logging/export.aug`](logging/export.md)
- [`logging/logger.aug`](logging/logger.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiaW5kZW50Iiwic291cmNlU2hhMjU2IjoiOGQxZjk2M2M5Yjc1ZjkzNDIwMjdkN2QyZWRlNTllMzY2NDM1NWEzZDBhMWIzZDYyNjE3ZDNjYTE3YjUyNmI5YSIsImZvcm1hdHRlZFNoYTI1NiI6ImI5YTVlNWVlY2Q0NzFhM2IzZGQ2Nzc2YTk1NTAyMzA5ZjQxOGM1YTgzZmI1NWU2Mzk4MWUwNWJiZTVlNjA2YWMiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE2LCJsYXN0IjoxNiwiYmFja2xpbmtzIjpbImRpYWdyYW1zL2ZvbGRlcnMvbG9nZ2luZy9pbmRleC5tZCNib3VuZGFyeS02MjFiNjc5NGY4YzkiLCJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS02OTFkZDQ3ZjU0YTciXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo2LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiY2FsY3VsYXRvci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1Bcml0aG1ldGljLmFkZCJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjgsImxhc3QiOjE3LCJiYWNrbGlua3MiOlsiY2FsY3VsYXRvci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1DYWxjdWxhdG9yIl19LHsiaWQiOiJzb3VyY2UtTDE2IiwiZmlyc3QiOjE1LCJsYXN0IjoxNywiYmFja2xpbmtzIjpbImNhbGN1bGF0b3ItZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtQ2FsY3VsYXRvci5hZGQiXX0seyJpZCI6InNvdXJjZS1MMjYiLCJmaXJzdCI6MjMsImxhc3QiOjI2LCJiYWNrbGlua3MiOlsiY2FsY3VsYXRvci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1sb2FkIl19LHsiaWQiOiJzb3VyY2UtTDMzIiwiZmlyc3QiOjI4LCJsYXN0IjozMCwiYmFja2xpbmtzIjpbImNhbGN1bGF0b3ItZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSIsIiNzeW1ib2wtX1NpbGVudExvZ2dlciJdfSx7ImlkIjoic291cmNlLUwzNCIsImZpcnN0IjoyOSwibGFzdCI6MzAsImJhY2tsaW5rcyI6WyJjYWxjdWxhdG9yLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiLCIjc3ltYm9sLV9TaWxlbnRMb2dnZXIubG9nIl19LHsiaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6NiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtQXJpdGhtZXRpYyJdfSx7ImlkIjoic291cmNlLUwxNy1MMTgiLCJmaXJzdCI6MTYsImxhc3QiOjE3LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMjctTDMwIiwiZmlyc3QiOjI0LCJsYXN0IjoyNiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDM1IiwiZmlyc3QiOjMwLCJsYXN0IjozMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDM4IiwiZmlyc3QiOjMxLCJsYXN0Ijo0NiwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC1DYWxjdWxhdG9yLTIwLWNhbGN1bGF0b3IiXX0seyJpZCI6InNvdXJjZS1MNDItTDQzIiwiZmlyc3QiOjM1LCJsYXN0IjozNiwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDQ0IiwiZmlyc3QiOjM3LCJsYXN0Ijo0MSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01Il19LHsiaWQiOiJzb3VyY2UtTDQ1LUw0OSIsImZpcnN0IjozOCwibGFzdCI6NDEsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNiJdfSx7ImlkIjoic291cmNlLUw1MSIsImZpcnN0Ijo0MiwibGFzdCI6NDYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNyJdfSx7ImlkIjoic291cmNlLUw1Mi1MNTMiLCJmaXJzdCI6NDMsImxhc3QiOjQ2LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTgiXX1dfQ
// aug-spec: "calculator.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
import Logger from logging
/** Adds two integers. */
interface Arithmetic:
    add(resolve Console console, int left, int right) returns int uses Console.write
/** Uses the selected logger to describe each addition. */
Calculator(resolve Logger logger to _logger) implements Arithmetic:
    /**
    * Adds left and right, logging the operation.
    * @param left First integer.
    * @param right Second integer.
    * @return Sum of the two integers.
    */
    add(resolve Console console, int left, int right):
        _logger.log(message="adding integers")
        return left + right
/**
* Demonstrates a checked failure instead of a successful result.
* @param fail Whether to simulate a failed load.
* @throws FileError When fail is true.
*/
load(bool fail):
    if fail:
        throw FileError()
    return "loaded"
/** Test adapter: keeps calculator tests independent of console output. */
_SilentLogger() implements Logger:
    log(resolve Console console, string message) uses Console.write:
        pass
test Calculator calculator:
    when "addition":
        implement Console with SystemConsole
        implement Logger with _SilentLogger
        calculator = Calculator()
        List<int> values = [1, 2]
        it "adds labeled inputs":
            assert(calculator.add(right=2, left=1) == 3)
            borrow values:
                values.append(value=3)
            assert(values.length() == 3)
        it "starts with fresh setup":
            assert(values.length() == 2)
            assert(
                calculator.add(left=values.get(index=0), right=values.get(index=1)) == 3
            )
```

```aug [Braces] aug-source=eyJmb3JtYXQiOjEsInN0eWxlIjoiYnJhY2VzIiwic291cmNlU2hhMjU2IjoiOGQxZjk2M2M5Yjc1ZjkzNDIwMjdkN2QyZWRlNTllMzY2NDM1NWEzZDBhMWIzZDYyNjE3ZDNjYTE3YjUyNmI5YSIsImZvcm1hdHRlZFNoYTI1NiI6IjQ5NmUzOTFiZmFhODNmNjNiMjQ3NmE0NmUyYTAwZDk4NDZmYzBmNzE1YjZlZjU4YjA1Mjg2YzY0YTIyMDg0OTkiLCJsaW5rcyI6W3siaWQiOiJzb3VyY2UtTDE3IiwiZmlyc3QiOjE3LCJsYXN0IjoxNywiYmFja2xpbmtzIjpbImRpYWdyYW1zL2ZvbGRlcnMvbG9nZ2luZy9pbmRleC5tZCNib3VuZGFyeS02MjFiNjc5NGY4YzkiLCJkaWFncmFtcy9pbmRleC5tZCNib3VuZGFyeS02OTFkZDQ3ZjU0YTciXX0seyJpZCI6InNvdXJjZS1MNiIsImZpcnN0Ijo2LCJsYXN0Ijo2LCJiYWNrbGlua3MiOlsiY2FsY3VsYXRvci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0xIiwiI3N5bWJvbC1Bcml0aG1ldGljLmFkZCJdfSx7ImlkIjoic291cmNlLUw5IiwiZmlyc3QiOjksImxhc3QiOjIwLCJiYWNrbGlua3MiOlsiY2FsY3VsYXRvci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIiwiI3N5bWJvbC1DYWxjdWxhdG9yIl19LHsiaWQiOiJzb3VyY2UtTDE2IiwiZmlyc3QiOjE2LCJsYXN0IjoxOSwiYmFja2xpbmtzIjpbImNhbGN1bGF0b3ItZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtMyIsIiNzeW1ib2wtQ2FsY3VsYXRvci5hZGQiXX0seyJpZCI6InNvdXJjZS1MMjYiLCJmaXJzdCI6MjYsImxhc3QiOjMxLCJiYWNrbGlua3MiOlsiY2FsY3VsYXRvci1kaWFncmFtcy5tZCNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00IiwiI3N5bWJvbC1sb2FkIl19LHsiaWQiOiJzb3VyY2UtTDMzIiwiZmlyc3QiOjMzLCJsYXN0IjozNywiYmFja2xpbmtzIjpbImNhbGN1bGF0b3ItZGlhZ3JhbXMubWQjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNSIsIiNzeW1ib2wtX1NpbGVudExvZ2dlciJdfSx7ImlkIjoic291cmNlLUwzNCIsImZpcnN0IjozNCwibGFzdCI6MzYsImJhY2tsaW5rcyI6WyJjYWxjdWxhdG9yLWRpYWdyYW1zLm1kI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTYiLCIjc3ltYm9sLV9TaWxlbnRMb2dnZXIubG9nIl19LHsiaWQiOiJzb3VyY2UtTDUiLCJmaXJzdCI6NSwibGFzdCI6NywiYmFja2xpbmtzIjpbIiNzeW1ib2wtQXJpdGhtZXRpYyJdfSx7ImlkIjoic291cmNlLUwxNy1MMTgiLCJmaXJzdCI6MTcsImxhc3QiOjE4LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTEiXX0seyJpZCI6InNvdXJjZS1MMjctTDMwIiwiZmlyc3QiOjI3LCJsYXN0IjozMCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0yIl19LHsiaWQiOiJzb3VyY2UtTDM1IiwiZmlyc3QiOjM1LCJsYXN0IjozNSwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC0zIl19LHsiaWQiOiJzb3VyY2UtTDM4IiwiZmlyc3QiOjM4LCJsYXN0Ijo1OCwiYmFja2xpbmtzIjpbIiNzeW1ib2wtdGVzdC0yMC1DYWxjdWxhdG9yLTIwLWNhbGN1bGF0b3IiXX0seyJpZCI6InNvdXJjZS1MNDItTDQzIiwiZmlyc3QiOjQyLCJsYXN0Ijo0MywiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC00Il19LHsiaWQiOiJzb3VyY2UtTDQ0IiwiZmlyc3QiOjQ0LCJsYXN0Ijo1MCwiYmFja2xpbmtzIjpbIiNzcGVjaWZpY2F0aW9uLXBhcmFncmFwaC01Il19LHsiaWQiOiJzb3VyY2UtTDQ1LUw0OSIsImZpcnN0Ijo0NSwibGFzdCI6NDksImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNiJdfSx7ImlkIjoic291cmNlLUw1MSIsImZpcnN0Ijo1MSwibGFzdCI6NTYsImJhY2tsaW5rcyI6WyIjc3BlY2lmaWNhdGlvbi1wYXJhZ3JhcGgtNyJdfSx7ImlkIjoic291cmNlLUw1Mi1MNTMiLCJmaXJzdCI6NTIsImxhc3QiOjU1LCJiYWNrbGlua3MiOlsiI3NwZWNpZmljYXRpb24tcGFyYWdyYXBoLTgiXX1dfQ
// aug-spec: "calculator.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
import Logger from logging
/** Adds two integers. */
interface Arithmetic {
    add(resolve Console console, int left, int right) returns int uses Console.write
}
/** Uses the selected logger to describe each addition. */
Calculator(resolve Logger logger to _logger) implements Arithmetic {
    /**
    * Adds left and right, logging the operation.
    * @param left First integer.
    * @param right Second integer.
    * @return Sum of the two integers.
    */
    add(resolve Console console, int left, int right) {
        _logger.log(message="adding integers")
        return left + right
    }
}
/**
* Demonstrates a checked failure instead of a successful result.
* @param fail Whether to simulate a failed load.
* @throws FileError When fail is true.
*/
load(bool fail) {
    if fail {
        throw FileError()
    }
    return "loaded"
}
/** Test adapter: keeps calculator tests independent of console output. */
_SilentLogger() implements Logger {
    log(resolve Console console, string message) uses Console.write {
        pass
    }
}
test Calculator calculator {
    when "addition" {
        implement Console with SystemConsole
        implement Logger with _SilentLogger
        calculator = Calculator()
        List<int> values = [1, 2]
        it "adds labeled inputs" {
            assert(calculator.add(right=2, left=1) == 3)
            borrow values {
                values.append(value=3)
            }
            assert(values.length() == 3)
        }
        it "starts with fresh setup" {
            assert(values.length() == 2)
            assert(
                calculator.add(left=values.get(index=0), right=values.get(index=1)) == 3
            )
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

[Interactions and sequences](calculator-diagrams.md)

### `Arithmetic` · interface · [source](calculator.md#source-L5) {#symbol-Arithmetic}

Adds two integers.

#### `Arithmetic.add` · [source](calculator.md#source-L6) {#symbol-Arithmetic.add}

It takes `left` and `right` as integers. It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It returns `int`. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

### `Calculator` · class · [source](calculator.md#source-L9) {#symbol-Calculator}

Uses the selected logger to describe each addition. It implements [`Arithmetic`](calculator.md#symbol-Arithmetic). The `_logger` dependency is injected as [`Logger`](logging/logger.md#symbol-Logger) and stored read-only and privately.

#### `Calculator.add` · [source](calculator.md#source-L16) {#symbol-Calculator.add}

Adds left and right, logging the operation. It takes `left` and `right` as integers. It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection.

::: spec-paragraph specification-paragraph-1
It returns `int` — Sum of the two integers. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). It passes `"adding integers"` to [`_logger.log`](logging/logger.md#symbol-Logger.log), using injected `console`. It returns `left` plus `right`. [source](calculator.md#source-L17-L18)
:::

::: details Checked interface

```text
add(resolve Console console, int left, int right) returns int uses Console.write
```

It takes `left` as an integer (First integer) and `right` as an integer (Second integer). It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It returns `int` — Sum of the two integers. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

:::

### `load` · [source](calculator.md#source-L26) {#symbol-load}

Demonstrates a checked failure instead of a successful result. It takes `fail` as a boolean. Failures can raise `FileError` (when fail is true).

::: spec-paragraph specification-paragraph-2
It checks that `fail` is false. It raises a `FileError` at the first failed check. It returns `"loaded"`. [source](calculator.md#source-L27-L30)
:::

::: details Checked interface

```text
load(bool fail) returns string unless FileError
```

It takes `fail` as a boolean (Whether to simulate a failed load). Failures can raise `FileError` (when fail is true).

:::

### `_SilentLogger` · class · [source](calculator.md#source-L33) {#symbol-_SilentLogger}

Test adapter: keeps calculator tests independent of console output. It implements [`Logger`](logging/logger.md#symbol-Logger). It is private to this file.

#### `_SilentLogger.log` · [source](calculator.md#source-L34) {#symbol-_SilentLogger.log}

::: spec-paragraph specification-paragraph-3
It takes `message` as a string. It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write). It continues without an operation. [source](calculator.md#source-L35)
:::

::: details Checked interface

```text
log(resolve Console console, string message) returns void uses Console.write
```

It takes `message` as a string (Text to write). It gets `console` ([`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console)) from dependency injection. It can call [`Console.write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write).

:::

### `test Calculator calculator` · [source](calculator.md#source-L38) {#symbol-test-20-Calculator-20-calculator}

Tests [`Calculator`](calculator.md#symbol-Calculator). Each case gets fresh setup and dependencies.

#### `addition`

Setup for each case: `Console` is provided by [`SystemConsole`](dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole). Stateless instances are reused; stateful instances are created for each resolve. `Logger` is provided by [`_SilentLogger`](calculator.md#symbol-_SilentLogger). Stateless instances are reused; stateful instances are created for each resolve.

::: spec-paragraph specification-paragraph-4
It sets `calculator` to a [`Calculator`](calculator.md#symbol-Calculator) using injected `Logger` for `_logger`. It sets `values` of type `List<int>` to a list containing `1`, `2`. [source](calculator.md#source-L42-L43)
:::

::: spec-paragraph specification-paragraph-5
##### `adds labeled inputs` · [source](calculator.md#source-L44)
:::

::: spec-paragraph specification-paragraph-6
The test requires [`calculator.add`](calculator.md#symbol-Calculator.add) with `right` `2` and `left` `1` using injected `Console` for `console` equals `3`. With temporary permission to change `values`, it appends `3` to `values`. The test requires the number of elements in `values` equals `3`. [source](calculator.md#source-L45-L49)
:::

::: spec-paragraph specification-paragraph-7
##### `starts with fresh setup` · [source](calculator.md#source-L51)
:::

::: spec-paragraph specification-paragraph-8
The test requires the number of elements in `values` equals `2`. The test requires [`calculator.add`](calculator.md#symbol-Calculator.add) with `left` from the item at index `0` in `values` and `right` from the item at index `1` in `values` using injected `Console` for `console` equals `3`. [source](calculator.md#source-L52-L53)
:::

### Dependencies

It uses [`Console`](dependencies/august/1.0.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/1.0.0/io/contracts.md#symbol-Console.write)) and [`SystemConsole`](dependencies/august/1.0.0/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`Logger`](logging/logger.md#symbol-Logger) ([`log`](logging/logger.md#symbol-Logger.log)) from `logging`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
