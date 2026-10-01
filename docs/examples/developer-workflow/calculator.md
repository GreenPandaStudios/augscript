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

```aug [Indentation]
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

```aug [Braces]
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

### `Arithmetic` · interface · [source](calculator.md#code) {#symbol-Arithmetic}

Adds two integers.

#### `Arithmetic.add` · [source](calculator.md#code) {#symbol-Arithmetic.add}

It takes `left` and `right` as integers. It gets `console` ([`Console`](dependencies/august/0.21.0/io/contracts.md#symbol-Console)) from dependency injection. It returns `int`. It can call [`Console.write`](dependencies/august/0.21.0/io/contracts.md#symbol-Console.write).

### `Calculator` · class · [source](calculator.md#code) {#symbol-Calculator}

Uses the selected logger to describe each addition. It implements [`Arithmetic`](calculator.md#symbol-Arithmetic). The `_logger` dependency is injected as [`Logger`](logging/logger.md#symbol-Logger) and stored read-only and privately.

#### `Calculator.add` · [source](calculator.md#code) {#symbol-Calculator.add}

Adds left and right, logging the operation. It takes `left` as an integer (First integer) and `right` as an integer (Second integer). It gets `console` ([`Console`](dependencies/august/0.21.0/io/contracts.md#symbol-Console)) from dependency injection. It returns `int` — Sum of the two integers.

It passes `"adding integers"` to [`_logger.log`](logging/logger.md#symbol-Logger.log), using injected `console`. It returns `left` plus `right`.

### `load` · [source](calculator.md#code) {#symbol-load}

Demonstrates a checked failure instead of a successful result. It takes `fail` as a boolean (Whether to simulate a failed load). Failures can raise `FileError` (when fail is true).

It checks that `fail` is false. It raises a `FileError` at the first failed check. It returns `"loaded"`.

### `_SilentLogger` · class · [source](calculator.md#code) {#symbol-_SilentLogger}

Test adapter: keeps calculator tests independent of console output. It implements [`Logger`](logging/logger.md#symbol-Logger). It is private to this file.

#### `_SilentLogger.log` · [source](calculator.md#code) {#symbol-_SilentLogger.log}

It takes `message` as a string (Text to write). It gets `console` ([`Console`](dependencies/august/0.21.0/io/contracts.md#symbol-Console)) from dependency injection. It continues without an operation.

### `test Calculator calculator` · [source](calculator.md#code) {#symbol-test-20-Calculator-20-calculator}

Tests [`Calculator`](calculator.md#symbol-Calculator). Each case gets fresh setup and dependencies.

#### `addition`

Setup for each case: `Console` is provided by [`SystemConsole`](dependencies/august/0.21.0/io/contracts.md#symbol-SystemConsole). Stateless instances are reused; stateful instances are created for each resolve. `Logger` is provided by [`_SilentLogger`](calculator.md#symbol-_SilentLogger). Stateless instances are reused; stateful instances are created for each resolve.

It sets `calculator` to a [`Calculator`](calculator.md#symbol-Calculator) using injected `Logger` for `_logger`. It sets `values` of type `List<int>` to a list containing `1`, `2`.

##### `adds labeled inputs` · [source](calculator.md#code)

The test requires [`calculator.add`](calculator.md#symbol-Calculator.add) with `right` `2` and `left` `1` using injected `Console` for `console` equals `3`. With temporary permission to change `values`, it appends `3` to `values`. The test requires the number of elements in `values` equals `3`.

##### `starts with fresh setup` · [source](calculator.md#code)

The test requires the number of elements in `values` equals `2`. The test requires [`calculator.add`](calculator.md#symbol-Calculator.add) with `left` from the item at index `0` in `values` and `right` from the item at index `1` in `values` using injected `Console` for `console` equals `3`.

### Dependencies

It uses [`Console`](dependencies/august/0.21.0/io/contracts.md#symbol-Console) ([`write`](dependencies/august/0.21.0/io/contracts.md#symbol-Console.write)) and [`SystemConsole`](dependencies/august/0.21.0/io/contracts.md#symbol-SystemConsole) from `august.io`. It uses [`Logger`](logging/logger.md#symbol-Logger) ([`log`](logging/logger.md#symbol-Logger.log)) from `logging`.

Built-in operations follow the [language reference](https://greenpandastudios.github.io/augscript/language-constructs).

::::

:::::
