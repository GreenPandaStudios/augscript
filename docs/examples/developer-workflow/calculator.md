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

**Inputs:** Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `left` (`int`). Take `right` (`int`).

Returns `int`. Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

<a id="symbol-Calculator"></a>
### `Calculator` · class · [source](calculator.md#code)

Uses the selected logger to describe each addition. Implements [`Arithmetic`](calculator.md#symbol-Arithmetic).

**Inputs:** Resolve [`Logger`](logging/logger.md#symbol-Logger) as `logger`; store read-only and privately as `_logger`.

<a id="symbol-Calculator.add"></a>
#### `Calculator.add` · [source](calculator.md#code)

Adds left and right, logging the operation.

**Inputs:** Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `left` (`int`) — First integer. Take `right` (`int`) — Second integer.

Returns `int` — Sum of the two integers. Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

- Call [`Logger.log`](logging/logger.md#symbol-Logger.log) on `_logger` with `message` as `"adding integers"` using `console`.
- Return `left` plus `right`.

<a id="symbol-load"></a>
### `load` · [source](calculator.md#code)

Demonstrates a checked failure instead of a successful result.

**Inputs:** Take `fail` (`bool`) — Whether to simulate a failed load.

Returns `string`. Can fail with `FileError` (when fail is true).

- If `fail` is true:
  - Fail with a new `FileError`.
- Return `"loaded"`.

<a id="symbol-_SilentLogger"></a>
### `_SilentLogger` · class · [source](calculator.md#code)

Test adapter: keeps calculator tests independent of console output. Implements [`Logger`](logging/logger.md#symbol-Logger). Private to this file.

<a id="symbol-_SilentLogger.log"></a>
#### `_SilentLogger.log` · [source](calculator.md#code)

**Inputs:** Resolve [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) as `console`. Take `message` (`string`) — Text to write.

Uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

- Continue.

<a id="symbol-test Calculator calculator"></a>
### `test Calculator calculator` · [source](calculator.md#code)

Tests [`Calculator`](calculator.md#symbol-Calculator). Each case gets fresh setup and dependencies.

#### `addition`

Setup for each case:

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Reuse stateless instances; create stateful instances per resolve.
- Provide [`_SilentLogger`](calculator.md#symbol-_SilentLogger) for `Logger`. Reuse stateless instances; create stateful instances per resolve.
- Set `calculator` to a new [`Calculator`](calculator.md#symbol-Calculator) using `Logger` for `_logger`.
- Set `values` of type `List<int>` to a list containing `1`, `2`.

##### `adds labeled inputs` · [source](calculator.md#code)

- Call `assert` with the result of [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` with `right` as `2`, `left` as `1` using `Console` for `console` equals `3`.
- Mutably borrow `values` for this block:
  - Call `append` on `values` with `value` as `3`.
- Call `assert` with the result of `length` on `values` equals `3`.

##### `starts with fresh setup` · [source](calculator.md#code)

- Call `assert` with the result of `length` on `values` equals `2`.
- Call `assert` with the result of [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` with `left` as the result of `get` on `values` with `index` as `0`, `right` as the result of `get` on `values` with `index` as `1` using `Console` for `console` equals `3`.

### Dependencies

- [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`: [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.
- [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`.
- [`Logger`](logging/logger.md#symbol-Logger) from `logging`: [`log`](logging/logger.md#symbol-Logger.log) (`message`: `string`) → `void`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `List<int>.append`: Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here.
- `List<int>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.
- `List<int>.length`: Read the number of elements.
- `assert`: Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

::::

:::::
