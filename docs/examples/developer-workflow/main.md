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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
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

Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance. Provide [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) for `Logger`. Share one instance.

### Startup

It tries the following steps. It sets `numbers` of type `List<int>` to a list containing `1`, `2`. It sets `pair` of type `Tuple<int,string>` to a tuple containing `1`, `"apple"`. It sets `unique` of type `Set<int>` to a set containing `1`, `2`, `1`. It sets `fruit` of type `Map<int,string>` to a map with `1` mapped to `"apples"`; `2` mapped to `"pears"`. It sets `calculator` to a new [`Calculator`](calculator.md#symbol-Calculator) using `Logger` for `_logger`.

It calls `print` (`value` set to the value from [`Calculator.add`](calculator.md#symbol-Calculator.add) on `calculator` (`right` set to the value from `get` on `numbers` (`index` set to `1`) and `left` set to the value from `get` on `numbers` (`index` set to `0`)) using `Console` for `console`). It calls `print` (`value` set to the value from `get` on `pair` (`index` set to `1`)). It calls `print` (`value` set to the number of elements in `unique`).

It calls `print` (`value` set to the value from `get` on `fruit` (`key` set to `2`)).

It tries to call `print` (`value` set to the value from [`load`](calculator.md#symbol-load) (`fail` set to `true`)). If this attempt raises `FileError`, it catches it as `error` and calls `print` (`value` set to `"load failed as expected"`). If this attempt raises `IndexError`, it catches it as `error` and calls `print` (`value` set to `"unexpected index failure"`).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`. The file uses [`Calculator`](calculator.md#symbol-Calculator) from `calculator`. Construction takes no caller inputs. [`add`](calculator.md#symbol-Calculator.add) takes `left` and `right` as `int`. It returns `int`. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). [`load`](calculator.md#symbol-load) from `calculator` takes `fail` as `bool`. It returns `string`. It can fail with `FileError`. The file uses [`ConsoleLogger`](logging/console.md#symbol-ConsoleLogger) from `logging`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`List<int>.get`: Read a zero-based position. An invalid index raises checked IndexError. Reference results grant reading. `Map<int, string>.get`: Read a value by key; an absent key returns null. contains distinguishes an absent key from a stored null. `Set<int>.length`: Read the number of elements. `Tuple<int, string>.get`: Read a statically checked constant position. Prefer tuple destructuring when reading several positions. `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
