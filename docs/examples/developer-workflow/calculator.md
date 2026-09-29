---
title: "calculator.aug · A small tested application"
generated: true
source: "examples/developer-workflow/calculator.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
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

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console)

Available from `august.io`.

Interface. Follow the linked specification for its full explanation.

**[`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write)**

Type parameters: `T`.

**Inputs and dependencies**

- `value`: `T`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Available from `august.io`.

Class. Follow the linked specification for its full explanation.

#### [`Logger`](logging/logger.md#symbol-Logger)

Available from `logging`.

Interface. Follow the linked specification for its full explanation.

**[`Logger.log`](logging/logger.md#symbol-Logger.log)**

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

### Built-in operations used by this file

#### `List<int>.append`

Append an element with exclusive mutable access. Read-only and owned aliases cannot be stored here.

Inputs: `value`: `int`.

Result: `void`.

Changes the receiver under exclusive mutable access.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `List<int>.get`

Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.

Inputs: `index`: `int`.

Result: `int`.

Possible failures: `IndexError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `List<int>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `assert`

Assert a bool in a test case or its setup. Catching an assertion failure cannot make the case pass; every case must execute an assertion.

Inputs: `condition`: `bool`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### `Arithmetic` {#symbol-Arithmetic}

[source](calculator.md#code)

Interface.

**Author documentation**

Adds two integers.

#### `Arithmetic.add` {#symbol-Arithmetic.add}

[source](calculator.md#code)

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `left`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `right`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `int`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

Interface contract. A selected implementation supplies the behavior.

### `Calculator` {#symbol-Calculator}

[source](calculator.md#code)

Behavioral class.

Satisfies [`Arithmetic`](calculator.md#symbol-Arithmetic).

**Author documentation**

Uses the selected logger to describe each addition.

**Inputs and dependencies**

- `logger`: [`Logger`](logging/logger.md#symbol-Logger). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them. Store it as `_logger`. This field is private. The field is read-only after initialization.

#### `Calculator.add` {#symbol-Calculator.add}

[source](calculator.md#code)

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `left`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `right`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `int`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**Author documentation**

Adds left and right, logging the operation.

**Returns** Sum of the two integers.

**Parameters**
- `left`: First integer.
- `right`: Second integer.

**Behavior when execution reaches this operation**

- Call [`Logger.log`](logging/logger.md#symbol-Logger.log) on `_logger` with `message` set to `"adding integers"`; supply dependencies `console` from `console`.
- Return (`left` plus `right`) and finish this operation.

### `load` {#symbol-load}

[source](calculator.md#code)

**Inputs and dependencies**

- `fail`: `bool`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Possible failures: `FileError`. The caller must catch or propagate them.

**Author documentation**

Demonstrates a checked failure instead of a successful result.

**Parameters**
- `fail`: Whether to simulate a failed load.

**Throws**
- `FileError`: When fail is true.

**Behavior when execution reaches this operation**

- If `fail` is true:
  - Fail with the result of call `FileError`. Transfer control to a matching catch or propagate the failure.
- Return `"loaded"` and finish this operation.

### `_SilentLogger` {#symbol-_SilentLogger}

[source](calculator.md#code)

Behavioral class, private to this file.

Satisfies [`Logger`](logging/logger.md#symbol-Logger).

**Author documentation**

Test adapter: keeps calculator tests independent of console output.

#### `_SilentLogger.log` {#symbol-_SilentLogger.log}

[source](calculator.md#code)

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `message`: `string`. The caller supplies this labeled input. Read reference values without copying them.

Result: finish without a result.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

**Author documentation**

**Parameters**
- `message`: Text to write.

**Behavior when execution reaches this operation**

- Continue without another operation.

### `test Calculator calculator` {#symbol-test-20-Calculator-20-calculator}

[source](calculator.md#code)

Same-file class tests for [`Calculator`](calculator.md#symbol-Calculator). Each case gets isolated setup and dependency bindings.

#### Group `addition`

**Setup before each case**

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Use a fresh instance when this provider retains state; otherwise reuse one instance.
- Provide [`_SilentLogger`](calculator.md#symbol-_SilentLogger) when `Logger` is requested. Use a fresh instance when this provider retains state; otherwise reuse one instance.
- Set `calculator` to the result of call [`Calculator`](calculator.md#symbol-Calculator); supply dependencies `_logger` from `Logger`.
- Set `values` of type `List<int>` to a list containing `1`, `2`.

##### `adds labeled inputs`

[source](calculator.md#code)

- Call `assert` with (the result of call [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` with `right` set to `2`; `left` set to `1`; supply dependencies `console` from `Console` equals `3`).
- Grant exclusive mutable access to `values` for this block, then end the borrow:
  - Call `append` on `values` with `value` set to `3`.
- Call `assert` with (the result of call `length` on `values` equals `3`).

##### `starts with fresh setup`

[source](calculator.md#code)

- Call `assert` with (the result of call `length` on `values` equals `2`).
- Call `assert` with (the result of call [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` with `left` set to the result of call `get` on `values` with `index` set to `0`; `right` set to the result of call `get` on `values` with `index` set to `1`; supply dependencies `console` from `Console` equals `3`).


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
