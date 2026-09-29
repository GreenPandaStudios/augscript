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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- [`Arithmetic`](calculator.md#symbol-Arithmetic) is an interface.
- [`Calculator`](calculator.md#symbol-Calculator) is a class implementing `Arithmetic`.
- [`load`](calculator.md#symbol-load) is a function returning `string`.
- [`_SilentLogger`](calculator.md#symbol-_SilentLogger) is a class implementing `Logger`.
- [`test Calculator calculator`](calculator.md#symbol-test-20-Calculator-20-calculator) is a same-file test suite.

### `Arithmetic` {#symbol-Arithmetic}

[source](calculator.md#code)

Interface.

**Author documentation**

Adds two integers.

#### `Arithmetic.add` {#symbol-Arithmetic.add}

[source](calculator.md#code)

**Inputs**

- `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.
- `left` (`int`) — required labeled input.
- `right` (`int`) — required labeled input.

Returns: `int`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Interface contract. A selected implementation supplies the behavior.

### `Calculator` {#symbol-Calculator}

[source](calculator.md#code)

Behavioral class.

Satisfies [`Arithmetic`](calculator.md#symbol-Arithmetic).

**Author documentation**

Uses the selected logger to describe each addition.

**Inputs**

- `logger` ([`Logger`](logging/logger.md#symbol-Logger)) — injected; callers omit it — stored as `_logger` (private) and read-only after initialization.

#### `Calculator.add` {#symbol-Calculator.add}

[source](calculator.md#code)

**Inputs**

- `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.
- `left` (`int`) — required labeled input.
- `right` (`int`) — required labeled input.

Returns: `int`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**What it does**

- Call [`Logger.log`](logging/logger.md#symbol-Logger.log) on `_logger` with `message` = `"adding integers"`; inject `console` from `console`.
- Return `left` plus `right`.

**Author documentation**

Adds left and right, logging the operation.

**Returns** Sum of the two integers.

**Parameters**
- `left`: First integer.
- `right`: Second integer.

### `load` {#symbol-load}

[source](calculator.md#code)

**Inputs**

- `fail` (`bool`) — required labeled input.

Returns: `string`.

Can fail with `FileError`. Callers must catch or propagate these errors.

**What it does**

- If `fail` is true:
  - Fail with call `FileError`. Transfer control to a matching catch or propagate the failure.
- Return `"loaded"`.

**Author documentation**

Demonstrates a checked failure instead of a successful result.

**Parameters**
- `fail`: Whether to simulate a failed load.

**Throws**
- `FileError`: When fail is true.

### `_SilentLogger` {#symbol-_SilentLogger}

[source](calculator.md#code)

Behavioral class, private to this file.

Satisfies [`Logger`](logging/logger.md#symbol-Logger).

**Author documentation**

Test adapter: keeps calculator tests independent of console output.

#### `_SilentLogger.log` {#symbol-_SilentLogger.log}

[source](calculator.md#code)

**Inputs**

- `console` ([`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)) — injected; callers omit it.
- `message` (`string`) — required labeled input.

Returns: no value.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**What it does**

- Continue without another operation.

**Author documentation**

**Parameters**
- `message`: Text to write.

### `test Calculator calculator` {#symbol-test-20-Calculator-20-calculator}

[source](calculator.md#code)

Same-file class tests for [`Calculator`](calculator.md#symbol-Calculator). Each case gets isolated setup and dependency bindings.

#### Group `addition`

**Setup before each case**

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Use a fresh instance when this provider retains state; otherwise reuse one instance.
- Provide [`_SilentLogger`](calculator.md#symbol-_SilentLogger) when `Logger` is requested. Use a fresh instance when this provider retains state; otherwise reuse one instance.
- Set `calculator` to call [`Calculator`](calculator.md#symbol-Calculator); inject `_logger` from `Logger`.
- Set `values` of type `List<int>` to a list containing `1`, `2`.

##### `adds labeled inputs`

[source](calculator.md#code)

- Call `assert` with (call [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` with `right` = `2`; `left` = `1`; inject `console` from `Console` equals `3`).
- Grant exclusive mutable access to `values` for this block, then end the borrow:
  - Call `append` on `values` with `value` = `3`.
- Call `assert` with (call `length` on `values` equals `3`).

##### `starts with fresh setup`

[source](calculator.md#code)

- Call `assert` with (call `length` on `values` equals `2`).
- Call `assert` with (call [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` with `left` = call `get` on `values` with `index` = `0`; `right` = call `get` on `values` with `index` = `1`; inject `console` from `Console` equals `3`).

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Capability interface from `august.io`.

- [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)<`T`> (`value`: `T`) → `void`.

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Class from `august.io`.

Used as a type or provider.

#### [`Logger`](logging/logger.md#symbol-Logger)

Interface from `logging`.

- [`Logger.log`](logging/logger.md#symbol-Logger.log) (`message`: `string`) → `void`; inject `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console); uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Built-in operations used by this file

- `List<int>.append` (`value`: `int`) → `void`: Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here. Changes the receiver.
- `List<int>.get` (`index`: `int`) → `int`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. Can fail with `IndexError`.
- `List<int>.length` (no inputs) → `int`: Read the number of elements.
- `assert` (`condition`: `bool`) → `void`: Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.

::::

:::::
