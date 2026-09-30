---
title: "main.aug · Labeled calls and injection"
generated: true
source: "examples/new-syntax/main.aug"
editLink: false
prev: false
next: false
outline: [2, 3]
pageClass: aug-example-page
---

# `main.aug`

[Labeled calls and injection](index.md) · Source and specification

::: details Files in this project

- [`main.aug`](main.md)
- [`console.aug`](console.md)
- [`greeter.aug`](greeter.md)
- [`logger.aug`](logger.md)
- [`math.aug`](math.md)

:::

::::: example-compare

:::: example-code

## Code {#code}

::: code-group

```aug [Indentation]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logger
import ConsoleLogger from console
import Greeter from greeter
import increment from math
implement Logger with ConsoleLogger
greeter = Greeter(x=4)
greeter.greet(name="AugScript")
int count = 7
count = increment(value=count)
print(value=count)
```

```aug [Braces]
// aug-spec: "main.aug.md" explains this file. Read it before changes; refresh with aug spec.
import Console and SystemConsole from august.io
implement Console with SystemConsole
import Logger from logger
import ConsoleLogger from console
import Greeter from greeter
import increment from math
implement Logger with ConsoleLogger
greeter = Greeter(x=4)
greeter.greet(name="AugScript")
int count = 7
count = increment(value=count)
print(value=count)
```

:::

::::

:::: example-spec

## Compiled specification {#specification}

### Providers

Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance. Provide [`ConsoleLogger`](console.md#symbol-ConsoleLogger) for `Logger`. Share one instance.

### Startup

It sets `greeter` to a new [`Greeter`](greeter.md#symbol-Greeter) (`x` set to `4`) using `Logger` for `logger`. It calls [`Greeter.greet`](greeter.md#symbol-Greeter.greet) on `greeter` (`name` set to `"AugScript"`) using `Console` for `console`. It sets `count` of type `int` to `7`. It sets `count` to the value from [`increment`](math.md#symbol-increment) (`value` set to `count`). It calls `print` (`value` set to `count`).

### Dependencies

The file uses [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console) from `august.io`. [`write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write) takes `value` as `T`. It returns no value. The type parameters are `T`. It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). The file uses [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`. The file uses [`ConsoleLogger`](console.md#symbol-ConsoleLogger) from `console`. The file uses [`Greeter`](greeter.md#symbol-Greeter) from `greeter`. Construction takes `x` as `int`. [`greet`](greeter.md#symbol-Greeter.greet) takes `name` as `string`. It returns no value. Dependency injection supplies `console` as [`Console`](dependencies/august/0.19.0/io/contracts.md#symbol-Console). It can use [`Console.write`](dependencies/august/0.19.0/io/contracts.md#symbol-Console.write). [`increment`](math.md#symbol-increment) from `math` takes `value` as `int`. It returns `int`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

`print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
