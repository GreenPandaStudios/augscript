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

- Provide [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) for `Console`. Share one instance.
- Provide [`ConsoleLogger`](console.md#symbol-ConsoleLogger) for `Logger`. Share one instance.

### Startup

- Set `greeter` to a new [`Greeter`](greeter.md#symbol-Greeter) with `x` as `4` using `Logger` for `logger`.
- Call [`Greeter.greet`](greeter.md#symbol-Greeter.greet) on `greeter` with `name` as `"AugScript"` using `Console` for `console`.
- Set `count` of type `int` to `7`.
- Set `count` to the result of [`increment`](math.md#symbol-increment) with `value` as `count`.
- Call `print` with `value` as `count`.

### Dependencies

- [`SystemConsole`](dependencies/august/0.19.0/io/contracts.md#symbol-SystemConsole) from `august.io`.
- [`ConsoleLogger`](console.md#symbol-ConsoleLogger) from `console`.
- [`Greeter`](greeter.md#symbol-Greeter) from `greeter`: construct with `x`: `int`; [`greet`](greeter.md#symbol-Greeter.greet) (`name`: `string`) → `void`.
- [`increment`](math.md#symbol-increment) (`value`: `int`) → `int` from `math`.

### Built-ins · [reference](https://greenpandastudios.github.io/augscript/language-constructs)

- `print`: Composition and test output. Other callables receive Console and declare uses console.write.

::::

:::::
