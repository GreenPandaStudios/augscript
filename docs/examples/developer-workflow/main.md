---
title: "main.aug · A small tested application"
generated: true
source: "examples/developer-workflow/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
---

# `main.aug`

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
implement Console with SystemConsole
import Logger and ConsoleLogger from logging
import Arithmetic and Calculator and load from calculator
implement Logger with ConsoleLogger
try:
    List<int> numbers = [1, 2]
    Tuple<int,string> pair = (1, "apple")
    Set<int> unique = {1, 2, 1}
    Map<int,string> fruit = {1: "apples", 2: "pears"}
    calculator = Calculator()
    print(value=calculator.add(right=numbers.get(index=1), left=numbers.get(index=0)))
    print(value=pair.get(index=1))
    print(value=unique.length())
    print(value=fruit.get(key=2))
    try:
        print(value=load(fail=true))
    catch FileError error:
        print(value="load failed as expected")
catch IndexError error:
    print(value="unexpected index failure")
```

```aug [Braces]
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger and ConsoleLogger from logging
import Arithmetic and Calculator and load from calculator
implement Logger with ConsoleLogger
try {
    List<int> numbers = [1, 2]
    Tuple<int,string> pair = (1, "apple")
    Set<int> unique = {1, 2, 1}
    Map<int,string> fruit = {1: "apples", 2: "pears"}
    calculator = Calculator()
    print(value=calculator.add(right=numbers.get(index=1), left=numbers.get(index=0)))
    print(value=pair.get(index=1))
    print(value=unique.length())
    print(value=fruit.get(key=2))
    try {
        print(value=load(fail=true))
    }
    catch FileError error {
        print(value="load failed as expected")
    }
}
catch IndexError error {
    print(value="unexpected index failure")
}
```

:::

## Compiled specification {#specification}

August 0.19.0. This document is compiled from checked code. Author documentation is labeled separately. It follows Simplified Technical English as guidance, with best-effort wording.

### Dependencies used by this file

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Available from `august.io`.

Class. Follow the linked specification for its full explanation.

#### [`Calculator`](calculator.md#symbol-Calculator)

Available from `calculator`.

Class. Follow the linked specification for its full explanation.

**Construction**

**Inputs and dependencies**

- `logger`: [`Logger`](logging/logger.md#symbol-Logger). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.

Result: [`Calculator`](calculator.md#symbol-Calculator).

**[`Calculator.add`](calculator.md#symbol-Calculator.add)**

**Inputs and dependencies**

- `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). Get this dependency from the composition; the caller does not supply it. Read reference values without copying them.
- `left`: `int`. The caller supplies this labeled input. Read reference values without copying them.
- `right`: `int`. The caller supplies this labeled input. Read reference values without copying them.

Result: `int`.

Capabilities: [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`load`](calculator.md#symbol-load)

Available from `calculator`.

**Inputs and dependencies**

- `fail`: `bool`. The caller supplies this labeled input. Read reference values without copying them.

Result: `string`.

Possible failures: `FileError`. The caller must catch or propagate them.

#### [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger)

Available from `logging`.

Class. Follow the linked specification for its full explanation.

### Built-in operations used by this file

#### `List<int>.get`

Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.

Inputs: `index`: `int`.

Result: `int`.

Possible failures: `IndexError`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Map<int, string>.get`

Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.

Inputs: `key`: `int`.

Result: `optional string`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Set<int>.length`

Read the number of elements.

Result: `int`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `Tuple<int, string>.get`

Read a statically checked constant position. Prefer tuple destructuring when reading several positions.

Inputs: `index`: `int`.

Result: `string`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

#### `print`

Composition and test output. Other callables receive Console and declare uses console.write.

Inputs: `value`: `any`.

Result: `void`.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Dependency providers

Register these providers before startup. Their declaration order does not set initialization order; shared instances initialize in dependency order.

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) when `Console` is requested. Reuse one instance.
- Provide [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) when `Logger` is requested. Reuse one instance.

### Startup, in source order

- Try these operations:
  - Set `numbers` of type `List<int>` to a list containing `1`, `2`.
  - Set `pair` of type `Tuple<int,string>` to a tuple containing `1`, `"apple"`.
  - Set `unique` of type `Set<int>` to a set containing `1`, `2`, `1`.
  - Set `fruit` of type `Map<int,string>` to a map with `1` mapped to `"apples"`; `2` mapped to `"pears"`.
  - Set `calculator` to the result of call [`Calculator`](calculator.md#symbol-Calculator); supply dependencies `_logger` from `Logger`.
  - Call `print` with `value` set to the result of call [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` with `right` set to the result of call `get` on `numbers` with `index` set to `1`; `left` set to the result of call `get` on `numbers` with `index` set to `0`; supply dependencies `console` from `Console`.
  - Call `print` with `value` set to the result of call `get` on `pair` with `index` set to `1`.
  - Call `print` with `value` set to the result of call `length` on `unique`.
  - Call `print` with `value` set to the result of call `get` on `fruit` with `key` set to `2`.
  - Try these operations:
    - Call `print` with `value` set to the result of call [`load`](calculator.md#symbol-load) with `fail` set to `true`.
  - If they fail with `FileError`, name the failure `error` and recover:
    - Call `print` with `value` set to `"load failed as expected"`.
- If they fail with `IndexError`, name the failure `error` and recover:
  - Call `print` with `value` set to `"unexpected index failure"`.


### Language rules

Boolean operations short-circuit from left to right. int uses signed 64-bit values; addition, subtraction, multiplication, and negation wrap. Division by zero raises ArithmeticError. float uses double precision. Tuples and records compare by value; mutable collections and behavioral classes compare by identity. Optional values contain a value or null; omission becomes null. Managed references grant read access; ownership moves and mutable borrows remain checked. A scope joins its child tasks; an unhandled child failure cancels siblings. See the [language reference](https://greenpandastudios.github.io/augscript/reference) for shared rules.
