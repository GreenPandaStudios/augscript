---
title: "main.aug · A small tested application"
generated: true
source: "examples/developer-workflow/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
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

::::: example-compare

:::: example-code

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

::::

:::: example-spec

## Compiled specification {#specification}

### Providers

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance.
- Provide [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) for `Logger`. Share one instance.

### Startup

- Try:
  - Set `numbers` of type `List<int>` to a list containing `1`, `2`.
  - Set `pair` of type `Tuple<int,string>` to a tuple containing `1`, `"apple"`.
  - Set `unique` of type `Set<int>` to a set containing `1`, `2`, `1`.
  - Set `fruit` of type `Map<int,string>` to a map with `1` mapped to `"apples"`; `2` mapped to `"pears"`.
  - Set `calculator` to a new [`Calculator`](calculator.md#symbol-Calculator) using `Logger` for `_logger`.
  - Call `print` with `value` as the result of [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` with `right` as the result of `get` on `numbers` with `index` as `1`, `left` as the result of `get` on `numbers` with `index` as `0` using `Console` for `console`.
  - Call `print` with `value` as the result of `get` on `pair` with `index` as `1`.
  - Call `print` with `value` as the result of `length` on `unique`.
  - Call `print` with `value` as the result of `get` on `fruit` with `key` as `2`.
  - Try:
    - Call `print` with `value` as the result of [`load`](calculator.md#symbol-load) with `fail` as `true`.
  - Catch `FileError` as `error`:
    - Call `print` with `value` as `"load failed as expected"`.
- Catch `IndexError` as `error`:
  - Call `print` with `value` as `"unexpected index failure"`.

### Dependencies

- [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`.
- [`Calculator`](calculator.md#symbol-Calculator) from `calculator`: construct with no caller inputs; [`add`](calculator.md#symbol-Calculator.add) (`left`: `int`, `right`: `int`) → `int`.
- [`load`](calculator.md#symbol-load) (`fail`: `bool`) → `string`; can fail with `FileError` from `calculator`.
- [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) from `logging`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `List<int>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading.
- `Map<int, string>.get`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null.
- `Set<int>.length`: Read the number of elements.
- `Tuple<int, string>.get`: Read a statically checked constant position. Prefer tuple destructuring when reading several positions.
- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
