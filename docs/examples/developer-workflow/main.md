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

August 0.19.0. This document is compiled from checked code with deterministic wording guided by Simplified Technical English.

### In this file

- Register 2 dependency providers before startup.
- Run startup operations with checked error recovery.

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
  - Set `calculator` to call [`Calculator`](calculator.md#symbol-Calculator); inject `_logger` from `Logger`.
  - Call `print` with `value` = call [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` with `right` = call `get` on `numbers` with `index` = `1`; `left` = call `get` on `numbers` with `index` = `0`; inject `console` from `Console`.
  - Call `print` with `value` = call `get` on `pair` with `index` = `1`.
  - Call `print` with `value` = call `length` on `unique`.
  - Call `print` with `value` = call `get` on `fruit` with `key` = `2`.
  - Try these operations:
    - Call `print` with `value` = call [`load`](calculator.md#symbol-load) with `fail` = `true`.
  - If they fail with `FileError`, name the failure `error` and recover:
    - Call `print` with `value` = `"load failed as expected"`.
- If they fail with `IndexError`, name the failure `error` and recover:
  - Call `print` with `value` = `"unexpected index failure"`.

### Dependencies used by this file

Only referenced types and operations appear here. Each name links to its complete specification.

#### [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole)

Class from `august.io`.

Used as a type or provider.

#### [`Calculator`](calculator.md#symbol-Calculator)

Class from `calculator`.

- Construct with no caller inputs → [`Calculator`](calculator.md#symbol-Calculator).
- [`Calculator.add`](calculator.md#symbol-Calculator.add) (`left`: `int`, `right`: `int`) → `int`; inject `console`: [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console); uses [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write).

#### [`load`](calculator.md#symbol-load)

Function from `calculator`.

- [`load`](calculator.md#symbol-load) (`fail`: `bool`) → `string`; can fail with `FileError`.

#### [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger)

Class from `logging`.

Used as a type or provider.

### Built-in operations used by this file

- `List<int>.get` (`index`: `int`) → `int`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. Can fail with `IndexError`.
- `Map<int, string>.get` (`key`: `int`) → `optional string`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.
- `Set<int>.length` (no inputs) → `int`: Read the number of elements.
- `Tuple<int, string>.get` (`index`: `int`) → `string`: Read a statically checked constant position. Prefer tuple destructuring when reading several positions.
- `print` (`value`: `any`) → `void`: Composition and test output. Other callables receive Console and declare uses console.write.

[Full built-in reference](https://greenpandastudios.github.io/augscript/language-constructs).

### Shared language rules

See the [language reference](https://greenpandastudios.github.io/augscript/reference) for numeric, equality, ownership, and task rules.
