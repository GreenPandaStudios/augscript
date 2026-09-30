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
    add(resolve Console console, int left, int right) returns int uses Console.write:
        _logger.log(message="adding integers")
        return left + right
/**
* Demonstrates a checked failure instead of a successful result.
* @param fail Whether to simulate a failed load.
* @throws FileError When fail is true.
*/
load(bool fail) returns string unless FileError:
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
            assert(calculator.add(left=values.get(index=0), right=values.get(index=1)) == 3)
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
    add(resolve Console console, int left, int right) returns int uses Console.write {
        _logger.log(message="adding integers")
        return left + right
    }
}
/**
* Demonstrates a checked failure instead of a successful result.
* @param fail Whether to simulate a failed load.
* @throws FileError When fail is true.
*/
load(bool fail) returns string unless FileError {
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
            assert(calculator.add(left=values.get(index=0), right=values.get(index=1)) == 3)
        }
    }
}
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

<a id="symbol-Arithmetic"></a>
### `Arithmetic` · interface · [source](calculator.md#code)

Adds two integers.

<a id="symbol-Arithmetic.add"></a>
#### `Arithmetic.add` · [source](calculator.md#code)

The caller supplies `left` and `right` as `int`. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). The result is `int`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

<a id="symbol-Calculator"></a>
### `Calculator` · class · [source](calculator.md#code)

Uses the selected logger to describe each addition. Implements [`Arithmetic`](calculator.md#symbol-Arithmetic). Dependency injection supplies `logger` as [`Logger`](logging/logger.md#symbol-Logger), stored read-only and privately as `_logger`.

<a id="symbol-Calculator.add"></a>
#### `Calculator.add` · [source](calculator.md#code)

Adds left and right, logging the operation. The caller supplies `left` as `int` (First integer) and `right` as `int` (Second integer). Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). The result is `int` — Sum of the two integers. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It calls [`Logger.log`](logging/logger.md#symbol-Logger.log) on `_logger` (`message` set to `"adding integers"`) using `console`. It returns `left` plus `right`.

<a id="symbol-load"></a>
### `load` · [source](calculator.md#code)

Demonstrates a checked failure instead of a successful result. The caller supplies `fail` as `bool` (Whether to simulate a failed load). The result is `string`. It can fail with `FileError` (when fail is true). If `fail` is true, it fails with a new `FileError`. Otherwise, it returns `"loaded"`.

<a id="symbol-_SilentLogger"></a>
### `_SilentLogger` · class · [source](calculator.md#code)

Test adapter: keeps calculator tests independent of console output. Implements [`Logger`](logging/logger.md#symbol-Logger). Private to this file.

<a id="symbol-_SilentLogger.log"></a>
#### `_SilentLogger.log` · [source](calculator.md#code)

The caller supplies `message` as `string` (Text to write). Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). It continues without an operation.

<a id="symbol-test Calculator calculator"></a>
### `test Calculator calculator` · [source](calculator.md#code)

Tests [`Calculator`](calculator.md#symbol-Calculator). Each case gets fresh setup and dependencies.

#### `addition`

Setup for each case: Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Reuse stateless instances; create stateful instances per resolve. Provide [`_SilentLogger`](calculator.md#symbol-_SilentLogger) for `Logger`. Reuse stateless instances; create stateful instances per resolve. It sets `calculator` to a new [`Calculator`](calculator.md#symbol-Calculator) using `Logger` for `_logger`. It sets `values` of type `List<int>` to a list containing `1`, `2`.

##### `adds labeled inputs` · [source](calculator.md#code)

It calls `assert` (the value from [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` (`right` set to `2` and `left` set to `1`) using `Console` for `console` equals `3`). While mutably borrowing `values`, it calls `append` on `values` (`value` set to `3`).

The mutable borrow ends when this block exits. It calls `assert` (the number of elements in `values` equals `3`).

##### `starts with fresh setup` · [source](calculator.md#code)

It calls `assert` (the number of elements in `values` equals `2`). It calls `assert` (the value from [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` (`left` set to the value from `get` on `values` (`index` set to `0`) and `right` set to the value from `get` on `values` (`index` set to `1`)) using `Console` for `console` equals `3`).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`. The file uses [`Logger`](logging/logger.md#symbol-Logger) from `logging`. [`log`](logging/logger.md#symbol-Logger.log) takes `message` as `string`. It returns no value. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`List<int>.append`: Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here. `List<int>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. `List<int>.length`: Read the number of elements. `assert`: Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

::::

:::::
